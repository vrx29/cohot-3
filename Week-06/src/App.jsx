import "./App.css";
import StrictModeTest from "./components/StrictModeTest";
import UseMemoComp from "./components/UseMemoComp";

/*
Why React.StrictMode renders twice
Component lifecycle
- https://react.dev/reference/react/Component

Wrapper component
useEffect

memo
useMemo
useCallback
- https://medium.com/@umaishassan/what-the-heck-is-memo-usememo-and-usecallback-in-react-3b1dc12665ad



useRef
useLayoutEffect
useContext
useReducer

Reconcilliation

*/
function App() {
  return (
    <>
      {/* <StrictModeTest /> */}
      <UseMemoComp/>
    </>
  );
}

export default App;
