/**
 * PerfMonitor v2.0
 * Drop-in performance overlay for any HTML page.
 * Usage: <script src="perf-monitor.js"></script>
 *
 * Options via data attributes on the script tag:
 *   data-position="top-right|top-left|bottom-right|bottom-left"  (default: top-right)
 *   data-collapsed="true"   — start minimised
 */
(function () {
  'use strict';

  /* ─── Safe init: works even when placed in <head> ───────────── */
  if (!document.body) {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {

    /* ─── config ─────────────────────────────────────────────── */
    const scriptTag = document.querySelector('script[src*="perf-monitor"]') || {};
    const CFG = {
      position:  scriptTag.dataset?.position  || 'top-right',
      collapsed: scriptTag.dataset?.collapsed === 'true',
      updateMs:  600,
      fpsWindow: 60,
      histLen:   50,
    };

    /* ─── state ──────────────────────────────────────────────── */
    const state = {
      fps: 0, fpsHistory: [],
      memHistory: [],
      cpuEst: 0, cpuHistory: [],
      ttfb: null, fcp: null, lcp: null, cls: null, fid: null, inp: null,
      allResources: [],
      longTasks: 0, longTaskMs: 0,
      domNodes: 0,
      gpuTier: 'unknown',
      networkType: '—',
      deviceMem: navigator.deviceMemory ? navigator.deviceMemory + ' GB' : '—',
      collapsed: CFG.collapsed,
      dragging: false, dx: 0, dy: 0,
    };

    /* ─── FPS ────────────────────────────────────────────────── */
    let frameTimes = [];
    let lastFrame = performance.now();
    function rafLoop(now) {
      const delta = now - lastFrame;
      lastFrame = now;
      frameTimes.push(delta);
      if (frameTimes.length > CFG.fpsWindow) frameTimes.shift();
      const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      state.fps = Math.round(1000 / avg);
      requestAnimationFrame(rafLoop);
    }
    requestAnimationFrame(rafLoop);

    /* ─── Long Tasks ─────────────────────────────────────────── */
    try {
      new PerformanceObserver(list => {
        list.getEntries().forEach(e => { state.longTasks++; state.longTaskMs += e.duration; });
      }).observe({ type: 'longtask', buffered: true });
    } catch (_) {}

    /* ─── Navigation / Paint / LCP ──────────────────────────── */
    try {
      const obs = new PerformanceObserver(list => {
        list.getEntries().forEach(e => {
          if (e.entryType === 'navigation') state.ttfb = Math.round(e.responseStart - e.requestStart);
          if (e.entryType === 'paint' && e.name === 'first-contentful-paint') state.fcp = Math.round(e.startTime);
          if (e.entryType === 'largest-contentful-paint') state.lcp = Math.round(e.startTime);
        });
      });
      obs.observe({ type: 'navigation', buffered: true });
      obs.observe({ type: 'paint', buffered: true });
      obs.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (_) {}

    /* ─── CLS ────────────────────────────────────────────────── */
    try {
      let clsVal = 0;
      new PerformanceObserver(list => {
        list.getEntries().forEach(e => { if (!e.hadRecentInput) clsVal += e.value; });
        state.cls = clsVal.toFixed(4);
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (_) {}

    /* ─── INP / FID ──────────────────────────────────────────── */
    try {
      new PerformanceObserver(list => {
        list.getEntries().forEach(e => {
          if (e.entryType === 'event') state.inp = Math.round(e.duration);
        });
      }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
    } catch (_) {}
    try {
      new PerformanceObserver(list => {
        list.getEntries().forEach(e => { state.fid = Math.round(e.processingStart - e.startTime); });
      }).observe({ type: 'first-input', buffered: true });
    } catch (_) {}

    /* ─── Resource scan ──────────────────────────────────────── */
    function scanResources() {
      try {
        const entries = performance.getEntriesByType('resource');
        const seen = new Set();
        state.allResources = entries
          .filter(e => e.initiatorType === 'script' || e.initiatorType === 'link' || e.initiatorType === 'css')
          .filter(e => { if (seen.has(e.name)) return false; seen.add(e.name); return true; })
          .map(e => {
            const isBlocking =
              e.renderBlockingStatus === 'blocking' ||
              (e.initiatorType === 'script' && e.duration > 40 && !e.name.includes('perf-monitor'));
            const raw = e.name.split('/').pop().split('?')[0];
            const name = raw.length > 0 ? raw : e.name.replace(/^https?:\/\/[^/]+\//, '').substring(0, 30);
            return {
              name:     name || 'unknown',
              type:     e.initiatorType,
              dur:      Math.round(e.duration),
              size:     e.transferSize > 0 ? Math.round(e.transferSize / 1024) : null,
              blocking: isBlocking,
            };
          })
          .sort((a, b) => b.dur - a.dur)
          .slice(0, 12);
      } catch (_) {}
    }

    /* ─── GPU ────────────────────────────────────────────────── */
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const dbg = gl.getExtension('WEBGL_debug_renderer_info');
        const raw = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
        state.gpuTier = raw.length > 40 ? raw.substring(0, 38) + '…' : raw;
      }
    } catch (_) { state.gpuTier = 'unavailable'; }

    /* ─── Network ────────────────────────────────────────────── */
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      state.networkType = [conn.effectiveType, conn.downlink ? conn.downlink + ' Mbps' : ''].filter(Boolean).join(' · ') || '—';
    }

    /* ─── Sparkline ──────────────────────────────────────────── */
    function sparkline(history, width, height, color, warnColor, warnThresh) {
      if (history.length < 2) return `<svg width="${width}" height="${height}"></svg>`;
      const max = Math.max(...history, 1);
      const pts = history.map((v, i) => {
        const x = (i / (CFG.histLen - 1)) * width;
        const y = height - (v / max) * (height - 2) - 1;
        return x.toFixed(1) + ',' + y.toFixed(1);
      }).join(' ');
      const last = history[history.length - 1];
      const stroke = (warnThresh != null && last >= warnThresh) ? warnColor : color;
      return '<svg width="' + width + '" height="' + height + '" style="display:block;overflow:visible;opacity:.85">' +
        '<polyline points="' + pts + '" fill="none" stroke="' + stroke + '" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>' +
        '</svg>';
    }

    /* ─── Helpers ────────────────────────────────────────────── */
    const col   = (v, g, n) => v == null ? '#555' : v <= g ? '#4ade80' : v <= n ? '#fbbf24' : '#f87171';
    const badge = (v, g, n) => v == null ? ''     : v <= g ? 'good'    : v <= n ? 'needs'   : 'poor';
    const MB    = b => (b / 1048576).toFixed(1);

    /* ─── Inject styles ──────────────────────────────────────── */
    const FONT = "'JetBrains Mono','Fira Code','Cascadia Code',ui-monospace,monospace";
    const styleEl = document.createElement('style');
    styleEl.textContent = [
      '#__pm__ { all:initial; }',
      '#__pm__ *, #__pm__ *::before, #__pm__ *::after { box-sizing:border-box; font-family:' + FONT + '; margin:0; padding:0; border:none; background:none; }',
      '#__pm__ { position:fixed; z-index:2147483647;' +
        (CFG.position.includes('right') ? 'right:14px;' : 'left:14px;') +
        (CFG.position.includes('top')   ? 'top:14px;'   : 'bottom:14px;') +
        'width:308px; background:rgba(8,8,12,0.96); border:1px solid rgba(255,255,255,0.1);' +
        'border-radius:10px; color:#e2e2e6; font-size:13px; line-height:1.5;' +
        'user-select:none; -webkit-user-select:none;' +
        'backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);' +
        'box-shadow:0 12px 40px rgba(0,0,0,0.65),inset 0 1px 0 rgba(255,255,255,0.06); overflow:hidden; }',
      '#__pm__.pm-mini { width:168px; }',
      '#__pm-hdr { display:flex; align-items:center; justify-content:space-between; padding:9px 12px 8px; border-bottom:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.035); cursor:grab; border-radius:10px 10px 0 0; }',
      '#__pm-hdr:active { cursor:grabbing; }',
      '.pm-title { font-size:10.5px; font-weight:700; letter-spacing:0.14em; color:#505058; text-transform:uppercase; }',
      '.pm-btns { display:flex; gap:5px; }',
      '.pm-btn { background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.13)!important; color:#909098; border-radius:4px; cursor:pointer; padding:2px 8px; font-size:10.5px; font-family:' + FONT + '; line-height:1.6; transition:background .12s,color .12s; }',
      '.pm-btn:hover { background:rgba(255,255,255,0.16); color:#fff; }',
      '#__pm-body { padding:11px 13px 14px; max-height:84vh; overflow-y:auto; scrollbar-width:thin; scrollbar-color:rgba(255,255,255,0.1) transparent; }',
      '#__pm-body::-webkit-scrollbar { width:4px; }',
      '#__pm-body::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.12); border-radius:2px; }',
      '.pm-sec { margin-bottom:13px; }',
      '.pm-sec-hd { font-size:10px; font-weight:700; letter-spacing:0.13em; text-transform:uppercase; color:#404048; margin-bottom:8px; padding-bottom:5px; border-bottom:1px solid rgba(255,255,255,0.06); }',
      '.pm-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:5px; gap:8px; min-height:20px; }',
      '.pm-lbl { color:#606068; font-size:12px; flex-shrink:0; }',
      '.pm-val { font-size:13px; font-weight:700; flex-shrink:0; letter-spacing:-0.01em; }',
      '.pm-spark { flex:1; display:flex; align-items:center; justify-content:flex-end; }',
      '.pm-tag { font-size:9.5px; padding:2px 7px; border-radius:3px; font-weight:700; letter-spacing:0.07em; text-transform:uppercase; flex-shrink:0; line-height:1.6; }',
      '.tag-good  { background:rgba(74,222,128,0.12); color:#4ade80; }',
      '.tag-needs { background:rgba(251,191,36,0.12);  color:#fbbf24; }',
      '.tag-poor  { background:rgba(248,113,113,0.12); color:#f87171; }',
      '.tag-block { background:rgba(248,113,113,0.14); color:#f87171; }',
      '.tag-ok    { background:rgba(74,222,128,0.1);  color:#4ade80; }',
      '.pm-fps-num { font-size:28px; font-weight:700; letter-spacing:-0.03em; line-height:1; }',
      '.pm-mem-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:5px; margin-bottom:6px; }',
      '.pm-mem-card { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07)!important; border-radius:6px; padding:7px 9px; }',
      '.pm-mem-card-lbl { font-size:9.5px; color:#484850; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:3px; }',
      '.pm-mem-card-val { font-size:14px; font-weight:700; }',
      '.pm-mem-card-unit { font-size:9px; color:#404048; margin-top:2px; }',
      '.pm-mem-bar-wrap { height:4px; background:rgba(255,255,255,0.07); border-radius:2px; overflow:hidden; margin-top:6px; }',
      '.pm-mem-bar { height:100%; border-radius:2px; transition:width .5s ease; }',
      '.pm-res-row { display:flex; align-items:center; padding:4px 8px; border-radius:5px; margin-bottom:3px; background:rgba(255,255,255,0.028); gap:7px; }',
      '.pm-res-name { font-size:11.5px; color:#909098; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1; }',
      '.pm-res-meta { display:flex; gap:5px; align-items:center; flex-shrink:0; }',
      '.pm-res-dur  { font-size:12px; font-weight:700; color:#b0b0b8; }',
      '.pm-gpu-val  { font-size:11.5px; color:#909098; text-align:right; max-width:200px; word-break:break-all; line-height:1.45; }',
      '.pm-mini-view { display:flex; flex-direction:column; gap:6px; padding:2px 0; }',
      '.pm-mini-row  { display:flex; justify-content:space-between; align-items:center; }',
    ].join('\n');
    document.head.appendChild(styleEl);

    /* ─── DOM skeleton ───────────────────────────────────────── */
    const root = document.createElement('div');
    root.id = '__pm__';
    root.setAttribute('role', 'complementary');
    if (state.collapsed) root.classList.add('pm-mini');
    root.innerHTML =
      '<div id="__pm-hdr">' +
        '<span class="pm-title">&#x2B21; PerfMonitor</span>' +
        '<div class="pm-btns">' +
          '<button class="pm-btn" id="__pm-tog">' + (state.collapsed ? '&#x25BC; expand' : '&#x25B2; collapse') + '</button>' +
          '<button class="pm-btn" id="__pm-cls">&#x2715;</button>' +
        '</div>' +
      '</div>' +
      '<div id="__pm-body"></div>';
    document.body.appendChild(root);

    const bodyEl = document.getElementById('__pm-body');
    const togBtn = document.getElementById('__pm-tog');
    const clsBtn = document.getElementById('__pm-cls');

    togBtn.addEventListener('click', function () {
      state.collapsed = !state.collapsed;
      root.classList.toggle('pm-mini', state.collapsed);
      togBtn.innerHTML = state.collapsed ? '&#x25BC; expand' : '&#x25B2; collapse';
      render();
    });
    clsBtn.addEventListener('click', function () {
      styleEl.remove();
      root.remove();
    });

    /* ─── Drag ───────────────────────────────────────────────── */
    const hdr = document.getElementById('__pm-hdr');
    hdr.addEventListener('mousedown', function (e) {
      if (e.target.classList.contains('pm-btn')) return;
      state.dragging = true;
      const r = root.getBoundingClientRect();
      state.dx = e.clientX - r.left;
      state.dy = e.clientY - r.top;
      root.style.right = 'auto'; root.style.bottom = 'auto';
      root.style.left = r.left + 'px'; root.style.top = r.top + 'px';
      e.preventDefault();
    });
    document.addEventListener('mousemove', function (e) {
      if (!state.dragging) return;
      root.style.left = (e.clientX - state.dx) + 'px';
      root.style.top  = (e.clientY - state.dy) + 'px';
    });
    document.addEventListener('mouseup', function () { state.dragging = false; });

    /* ─── vitalRow helper ────────────────────────────────────── */
    function vRow(label, val, unit, good, needs) {
      var c = col(val, good, needs);
      var b = badge(val, good, needs);
      return '<div class="pm-row">' +
        '<span class="pm-lbl">' + label + '</span>' +
        '<span class="pm-val" style="color:' + c + '">' + (val != null ? val + unit : '—') + '</span>' +
        (val != null ? '<span class="pm-tag tag-' + b + '">' + b + '</span>' : '') +
        '</div>';
    }

    /* ─── Main render ────────────────────────────────────────── */
    function render() {
      state.domNodes = Math.max(0, document.querySelectorAll('*').length - 12);
      var mem = performance.memory;

      /* ── mini / collapsed view ── */
      if (state.collapsed) {
        var fc = state.fps >= 55 ? '#4ade80' : state.fps >= 30 ? '#fbbf24' : '#f87171';
        bodyEl.innerHTML =
          '<div class="pm-mini-view">' +
          '<div class="pm-mini-row"><span class="pm-lbl">FPS</span><span class="pm-val" style="color:' + fc + '">' + state.fps + '</span></div>' +
          (mem ? '<div class="pm-mini-row"><span class="pm-lbl">Mem used</span><span class="pm-val" style="color:#818cf8">' + MB(mem.usedJSHeapSize) + ' MB</span></div>' : '') +
          (state.lcp != null ? '<div class="pm-mini-row"><span class="pm-lbl">LCP</span><span class="pm-val" style="color:' + col(state.lcp, 2500, 4000) + '">' + state.lcp + 'ms</span></div>' : '') +
          '</div>';
        return;
      }

      /* ── histories ── */
      state.fpsHistory.push(state.fps);
      if (state.fpsHistory.length > CFG.histLen) state.fpsHistory.shift();

      var cpuEst = Math.min(100, Math.round((state.longTaskMs / Math.max(performance.now(), 1)) * 100 * 3));
      state.cpuHistory.push(cpuEst);
      if (state.cpuHistory.length > CFG.histLen) state.cpuHistory.shift();

      /* ── memory section ── */
      var memHTML = '';
      if (mem) {
        var used      = mem.usedJSHeapSize;
        var allocated = mem.totalJSHeapSize;
        var limit     = mem.jsHeapSizeLimit;
        var avail     = limit - used;
        var usedPct   = (used / limit) * 100;
        var memColor  = usedPct < 50 ? '#818cf8' : usedPct < 75 ? '#fbbf24' : '#f87171';

        state.memHistory.push(used / 1048576);
        if (state.memHistory.length > CFG.histLen) state.memHistory.shift();

        memHTML =
          '<div class="pm-mem-grid">' +
            '<div class="pm-mem-card">' +
              '<div class="pm-mem-card-lbl">Used</div>' +
              '<div class="pm-mem-card-val" style="color:' + memColor + '">' + MB(used) + '</div>' +
              '<div class="pm-mem-card-unit">MB</div>' +
            '</div>' +
            '<div class="pm-mem-card">' +
              '<div class="pm-mem-card-lbl">Available</div>' +
              '<div class="pm-mem-card-val" style="color:#4ade80">' + MB(avail) + '</div>' +
              '<div class="pm-mem-card-unit">MB</div>' +
            '</div>' +
            '<div class="pm-mem-card">' +
              '<div class="pm-mem-card-lbl">Limit</div>' +
              '<div class="pm-mem-card-val" style="color:#606068">' + MB(limit) + '</div>' +
              '<div class="pm-mem-card-unit">MB</div>' +
            '</div>' +
          '</div>' +
          '<div class="pm-row" style="margin-bottom:4px">' +
            '<span class="pm-lbl">Allocated heap</span>' +
            '<span class="pm-val" style="color:#a78bfa">' + MB(allocated) + ' MB</span>' +
          '</div>' +
          '<div class="pm-mem-bar-wrap"><div class="pm-mem-bar" style="width:' + usedPct.toFixed(1) + '%;background:' + memColor + '"></div></div>' +
          '<div style="font-size:11px;color:#404048;text-align:right;margin-top:4px">' + usedPct.toFixed(1) + '% of heap limit used</div>' +
          '<div class="pm-row" style="margin-top:7px;margin-bottom:0">' +
            '<span class="pm-lbl" style="opacity:0;font-size:9px">.</span>' +
            '<span class="pm-spark">' + sparkline(state.memHistory, 170, 24, '#818cf8', '#f87171', null) + '</span>' +
          '</div>';
      } else {
        memHTML = '<div style="color:#404048;font-size:12px">performance.memory not available in this browser</div>';
      }

      /* ── resources ── */
      scanResources();
      var resHTML = '';
      if (state.allResources.length > 0) {
        resHTML = state.allResources.map(function (r) {
          return '<div class="pm-res-row">' +
            '<span class="pm-res-name" title="' + r.name + '">' + r.name + '</span>' +
            '<div class="pm-res-meta">' +
              (r.size != null ? '<span style="font-size:11px;color:#404048">' + r.size + 'KB</span>' : '') +
              '<span class="pm-res-dur">' + r.dur + 'ms</span>' +
              '<span class="pm-tag ' + (r.blocking ? 'tag-block' : 'tag-ok') + '">' + (r.blocking ? 'blocking' : 'ok') + '</span>' +
            '</div>' +
          '</div>';
        }).join('');
      } else {
        resHTML = '<div style="color:#404048;font-size:12px">No script / style resources detected yet</div>';
      }

      var fpsC = state.fps >= 55 ? '#4ade80' : state.fps >= 30 ? '#fbbf24' : '#f87171';

      bodyEl.innerHTML =
        /* REALTIME */
        '<div class="pm-sec">' +
          '<div class="pm-sec-hd">Realtime</div>' +
          '<div class="pm-row" style="align-items:flex-end;margin-bottom:7px">' +
            '<div><span class="pm-fps-num" style="color:' + fpsC + '">' + state.fps + '</span>' +
            '<span class="pm-lbl" style="font-size:12px;margin-left:4px">fps</span></div>' +
            '<span class="pm-spark">' + sparkline(state.fpsHistory, 120, 28, '#4ade80', '#f87171', 30) + '</span>' +
          '</div>' +
          '<div class="pm-row">' +
            '<span class="pm-lbl">CPU est.</span>' +
            '<span class="pm-val" style="color:' + (cpuEst < 30 ? '#4ade80' : cpuEst < 70 ? '#fbbf24' : '#f87171') + '">' + cpuEst + '%</span>' +
            '<span class="pm-spark">' + sparkline(state.cpuHistory, 110, 18, '#fbbf24', '#f87171', 70) + '</span>' +
          '</div>' +
          '<div class="pm-row">' +
            '<span class="pm-lbl">Long tasks</span>' +
            '<span class="pm-val" style="color:' + (state.longTasks === 0 ? '#4ade80' : state.longTasks < 5 ? '#fbbf24' : '#f87171') + '">' +
              state.longTasks + ' &nbsp;<span style="font-weight:400;color:#404048;font-size:11.5px">' + Math.round(state.longTaskMs) + 'ms total</span>' +
            '</span>' +
          '</div>' +
          '<div class="pm-row">' +
            '<span class="pm-lbl">DOM nodes</span>' +
            '<span class="pm-val" style="color:' + (state.domNodes < 1500 ? '#4ade80' : state.domNodes < 3000 ? '#fbbf24' : '#f87171') + '">' + state.domNodes.toLocaleString() + '</span>' +
          '</div>' +
        '</div>' +

        /* MEMORY */
        '<div class="pm-sec">' +
          '<div class="pm-sec-hd">Memory</div>' +
          memHTML +
        '</div>' +

        /* WEB VITALS */
        '<div class="pm-sec">' +
          '<div class="pm-sec-hd">Web Vitals</div>' +
          vRow('TTFB', state.ttfb, 'ms', 800, 1800) +
          vRow('FCP',  state.fcp,  'ms', 1800, 3000) +
          vRow('LCP',  state.lcp,  'ms', 2500, 4000) +
          '<div class="pm-row">' +
            '<span class="pm-lbl">CLS</span>' +
            '<span class="pm-val" style="color:' + col(parseFloat(state.cls || '9'), 0.1, 0.25) + '">' + (state.cls != null ? state.cls : '—') + '</span>' +
            (state.cls != null ? '<span class="pm-tag tag-' + badge(parseFloat(state.cls), 0.1, 0.25) + '">' + badge(parseFloat(state.cls), 0.1, 0.25) + '</span>' : '') +
          '</div>' +
          (state.fid != null ? vRow('FID', state.fid, 'ms', 100, 300) : '') +
          (state.inp != null ? vRow('INP', state.inp, 'ms', 200, 500) : '') +
        '</div>' +

        /* RESOURCES */
        '<div class="pm-sec">' +
          '<div class="pm-sec-hd">Scripts &amp; Styles — render impact</div>' +
          resHTML +
        '</div>' +

        /* ENVIRONMENT */
        '<div class="pm-sec">' +
          '<div class="pm-sec-hd">Environment</div>' +
          '<div class="pm-row"><span class="pm-lbl">Network</span><span class="pm-val" style="color:#67e8f9">' + state.networkType + '</span></div>' +
          '<div class="pm-row" style="align-items:flex-start">' +
            '<span class="pm-lbl" style="margin-top:2px;flex-shrink:0">GPU</span>' +
            '<span class="pm-gpu-val">' + state.gpuTier + '</span>' +
          '</div>' +
          '<div class="pm-row"><span class="pm-lbl">Device memory</span><span class="pm-val" style="color:#a78bfa">' + state.deviceMem + '</span></div>' +
        '</div>';
    }

    render();
    setInterval(render, CFG.updateMs);

  } // end init()
})();
