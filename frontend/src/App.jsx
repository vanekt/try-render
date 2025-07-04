import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const checkConnection = () => {
    setLoading(true);
    setError(false);

    fetch(`${backendUrl}/ping`)
      .then((res) => res.json())
      .then((data) => {
        setResult(data.result);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={checkConnection}>Check connection</button>
        <p>
          {loading && "Waiting for response..."}
          {error && "Connection error"}
          {!loading && !error && result === "pong" && "That's all folks!"}
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
