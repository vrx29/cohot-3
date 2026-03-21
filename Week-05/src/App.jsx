import { useState } from "react";
import "./App.css";
import Card from "./component/Card";

function App() {
  return (
    <>
      <div className="card-cont">
        <Card
          title="Vineet"
          description="A lost web developer"
          interests={["Javascript", "React"]}
        />
      </div>
    </>
  );
}

export default App;
