import { StrictMode } from "react";

export default function StrictModeTest() {
  return (
    <StrictMode>
      <h1>
        StrictMode lets you find common bugs in your components early during
        development.
      </h1>
      <p>
        Your components will re-render an extra time to find bugs caused by impure rendering.

      </p>
    </StrictMode>
  );
}
