import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import AuthForm from "./AuthForm";
import { useAuth } from "./hooks/useAuth";
import { api } from "./utils/api";

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const { user, signOut } = useAuth();

  const checkConnection = async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await api.get("/ping");
      const data = await response.json();
      setResult(data.result);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const checkProtected = async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await api.get("/protected");
      const data = await response.json();
      setResult(data.user_data);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setError(false);

    try {
      await signOut();
      setResult(null);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
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

      {user ? (
        <div style={{ marginBottom: "1rem", textAlign: "center" }}>
          <p>
            Вы вошли как: <strong>{user.email}</strong>
          </p>
        </div>
      ) : (
        <div style={{ marginBottom: "1rem", textAlign: "center" }}>
          <p>Вы не авторизованы</p>
        </div>
      )}

      <div className="card">
        <button onClick={checkConnection}>Check connection</button>
        <button onClick={checkProtected}>Check protected</button>
        <button onClick={handleLogout}>Logout</button>
        <p>
          {loading && "Waiting for response..."}
          {error && "Connection error"}
          {!loading && !error && result && (
            <div>
              <strong>Результат:</strong>
              <pre style={{ textAlign: "left", fontSize: "12px" }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      {!user && <AuthForm />}
    </>
  );
}

export default App;
