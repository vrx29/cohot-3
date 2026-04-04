import { useEffect, useRef } from "react";

// Create a component with a text input field and a button. When the component mounts or the button is clicked, automatically focus the text input field using useRef.

export function Assignment1() {
  const inpRef = useRef();
  useEffect(() => {
    inpRef.current.focus();
  }, [inpRef]);

  const handleButtonClick = () => {
    inpRef.current.focus();
  };

  return (
    <div>
      <input ref={inpRef} type="text" placeholder="Enter text here" />
      <button onClick={handleButtonClick}>Focus Input</button>
    </div>
  );
}
