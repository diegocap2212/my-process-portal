import React, { useState } from "react";
import { fontSerif, fontMono, inputStyle } from "@/styles/constants";

interface LoginScreenProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSignIn, onSignUp }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!email || !password) return;
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await onSignIn(email, password);
      } else {
        await onSignUp(email, password);
      }
    } catch (e: any) {
      setError(e.message || "Erro ao autenticar");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0f1729",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#fff", width: 340, padding: "32px 28px",
        border: "1px solid #e0dcd7",
      }}>
        <div style={{ ...fontSerif, fontSize: 22, color: "#0f1729", marginBottom: 4 }}>
          Torre <span style={{ color: "#c9a84c", fontWeight: 600 }}>LM</span>
        </div>
        <div style={{ ...fontMono, fontSize: 8, color: "#8a8580", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 24 }}>
          {mode === "login" ? "Entrar" : "Criar conta"}
        </div>

        <div style={{ marginBottom: 10 }}>
          <div style={{ ...fontMono, fontSize: 8, color: "#8a8580", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 3 }}>Email</div>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            style={inputStyle}
            onKeyDown={(e) => e.key === "Enter" && handle()}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ ...fontMono, fontSize: 8, color: "#8a8580", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 3 }}>Senha</div>
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            style={inputStyle}
            onKeyDown={(e) => e.key === "Enter" && handle()}
          />
        </div>

        {error && (
          <div style={{ fontSize: 11, color: "#9E3D2B", marginBottom: 10, padding: "6px 8px", background: "#9E3D2B10", border: "1px solid #9E3D2B20" }}>
            {error}
          </div>
        )}

        <button onClick={handle} disabled={loading || !email || !password} style={{
          width: "100%", padding: "10px",
          background: !email || !password ? "#ddd" : "#0f1729",
          color: !email || !password ? "#aaa" : "#fff",
          border: "none", fontSize: 12, fontWeight: 600,
          cursor: !email || !password ? "not-allowed" : "pointer",
          marginBottom: 12,
        }}>
          {loading ? "..." : mode === "login" ? "Entrar" : "Criar conta"}
        </button>

        <div
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          style={{ fontSize: 11, color: "#1A3A8F", cursor: "pointer", textAlign: "center" }}
        >
          {mode === "login" ? "Criar conta" : "Já tenho conta"}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
