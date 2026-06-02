import { CheckSquare, StickyNote, ChevronDown } from "lucide-react";

const menuItems = [
  {
    label: "Notes",
    icon: StickyNote,
    active: true,
  },
  {
    label: "Tasks",
    icon: CheckSquare,
  },
];

export default function Sidebar() {
  return (
    <>
      {/* Sidebar */}
      <aside
        className={`
          w-80 shrink-0 border-r
          bg-white border-r
          border-slate-300
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="p-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Todo</h1>
          </div>
        </div>

        <hr className="flex m-4 border-slate-300" />
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          {/* Main Menu */}
          <p className="mb-4 text-xs font-semibold tracking-wider text-gray-400 uppercase">
            Main Menu
          </p>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  className={`
                    flex w-full items-center justify-between
                    rounded-xl px-3 py-3 text-sm
                    transition-colors
                    ${
                      item.active
                        ? "bg-gray-100 text-black"
                        : "hover:bg-gray-50"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Footer */}
        <div className="border-t  border-slate-300 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://i.pravatar.cc/100"
                alt="user"
                className="h-10 w-10 rounded-full"
              />

              <div>
                <p className="text-sm font-semibold">Vineet</p>

                <p className="text-xs text-gray-500">fira@pickolab.com</p>
              </div>
            </div>

            <button className="rounded-lg border  border-slate-300 p-2">
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
