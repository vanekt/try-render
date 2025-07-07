import { useState, FormEvent, ChangeEvent } from "react";
import { useAuth } from "./hooks/useAuth";

export default function AuthForm() {
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [agree, setAgree] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string | null>(null);

  const { error, signInWithOtp, verifyOtp } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResult(null);

    if (!agree) {
      return;
    }

    setLoading(true);

    try {
      if (code) {
        const { success, error: verifyError } = await verifyOtp(email, code);

        if (success) {
          setResult("Вход выполнен успешно!");
          setEmail("");
          setCode("");
        } else {
          setResult(`Ошибка: ${verifyError}`);
        }
      } else {
        const { success, error: otpError } = await signInWithOtp(email);

        if (success) {
          setResult("Код подтверждения отправлен на ваш email");
        } else {
          setResult(`Ошибка: ${otpError}`);
        }
      }
    } catch (e) {
      setResult("Ошибка сети");
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
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setEmail(e.target.value)
        }
        required
      />
      <input
        placeholder="Confirmation code"
        value={code}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
      />
      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="checkbox"
          checked={agree}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setAgree(e.target.checked)
          }
        />
        Я согласен с{" "}
        <a href="#" target="_blank" rel="noopener noreferrer">
          условиями
        </a>
      </label>
      <button type="submit" disabled={loading || !agree}>
        {loading ? "Отправка..." : code ? "Подтвердить код" : "Отправить код"}
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {result && (
        <div style={{ color: result.includes("Ошибка") ? "red" : "green" }}>
          {result}
        </div>
      )}
    </form>
  );
}
