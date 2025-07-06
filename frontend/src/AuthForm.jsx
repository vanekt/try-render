import { useState } from "react";

const apiUrl = import.meta.env.VITE_BACKEND_URL || "/api";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!agree) {
      setError("Вы должны согласиться с условиями");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/${code ? "confirm" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка авторизации/регистрации");
      } else {
        setResult(
          code && data.status === "login"
            ? "Вход выполнен"
            : "Регистрация успешна"
        );
      }
    } catch (e) {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 320,
        margin: "2rem auto",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <h2>Вход / Регистрация</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        placeholder="Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
        />
        Я согласен с{" "}
        <a href="#" target="_blank" rel="noopener noreferrer">
          условиями
        </a>
      </label>
      <button type="submit" disabled={loading}>
        {loading ? "Отправка..." : "Войти / Зарегистрироваться"}
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {result && <div style={{ color: "green" }}>{result}</div>}
    </form>
  );
}
