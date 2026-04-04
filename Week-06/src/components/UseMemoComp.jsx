import { useEffect, useState } from "react";

export default function useMemoComp() {
    const [num, setNum] = useState(0);
    const [counter, setCounter] = useState(0);
    const [sum, setSum] = useState(0);

    function increaseCounter(){
        setCounter((c)=>c+1);
    }

    useEffect(()=>{
        let s = 0;
        for(let i = 1; i <= num; i++){
            s+= i;
        }
        setSum(s);
    },[num])
  return <>
        <input  value={num} onChange={e=>setNum(e.target.value)} />
        <p>Sum is {sum}</p>
        <button onClick={increaseCounter}>Counter ({counter})</button>
  </>;
}
