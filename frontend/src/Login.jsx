import React, { useMemo, useState } from "react";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formWrapStyle = {
  maxWidth: 420,
  margin: "0 auto",
  padding: 18,
  borderRadius: 12,
  background: "#f8fafc",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 14px 30px rgba(2, 6, 23, 0.28)"
};

const fieldWrapStyle = {
  marginBottom: 12,
  textAlign: "left"
};

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontSize: 13,
  color: "#334155",
  fontWeight: 600
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #c7d2fe",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: 14,
  boxSizing: "border-box"
};

const passwordRowStyle = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: 8,
  alignItems: "center"
};

const buttonStyle = {
  border: "none",
  borderRadius: 10,
  padding: "10px 14px",
  cursor: "pointer",
  color: "#fff",
  fontWeight: 600,
  fontSize: 14,
  boxShadow: "0 8px 18px rgba(2, 6, 23, 0.24)"
};

const primaryButtonStyle = {
  ...buttonStyle,
  background: "#15803d",
  width: "100%"
};

const ghostButtonStyle = {
  ...buttonStyle,
  background: "#1e293b",
  width: 44,
  minWidth: 44,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px"
};

const errorStyle = {
  marginTop: 10,
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 13,
  background: "#fef2f2",
  color: "#991b1b",
  border: "1px solid #fecaca",
  textAlign: "left"
};

function EyeOpenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M1.5 12S5.5 4.5 12 4.5 22.5 12 22.5 12 18.5 19.5 12 19.5 1.5 12 1.5 12Z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 3L21 21" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10.6 6.2C11.06 6.08 11.53 6 12 6c6.5 0 10.5 6 10.5 6a17.9 17.9 0 0 1-3.02 3.72" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7.08 8.08A17.44 17.44 0 0 0 1.5 12S5.5 18 12 18c1.6 0 3-.36 4.22-.93" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit = useMemo(() => email.trim() !== "" && password !== "" && !loading, [email, password, loading]);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    const normalizedEmail = email.trim();
    if (!emailRegex.test(normalizedEmail)) {
      setErr("Ingresa un email valido.");
      return;
    }

    if (!password) {
      setErr("Ingresa tu password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login fallo");
      onLogin(data.token);
    } catch (error) {
      setErr(error.message || "No se pudo iniciar sesion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={formWrapStyle} noValidate>
      <div style={fieldWrapStyle}>
        <label htmlFor="login-email" style={labelStyle}>
          Email
        </label>
        <input
          id="login-email"
          className="ui-input"
          style={inputStyle}
          type="email"
          autoComplete="email"
          autoFocus
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
      </div>

      <div style={fieldWrapStyle}>
        <label htmlFor="login-password" style={labelStyle}>
          Password
        </label>
        <div style={passwordRowStyle}>
          <input
            id="login-password"
            className="ui-input"
            style={inputStyle}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Ingresa tu password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <button
            className="ui-button"
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            style={ghostButtonStyle}
            disabled={loading}
            aria-label={showPassword ? "Ocultar password" : "Mostrar password"}
            title={showPassword ? "Ocultar password" : "Mostrar password"}
          >
            {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
          </button>
        </div>
      </div>

      <button className="ui-button" type="submit" style={primaryButtonStyle} disabled={!canSubmit}>
        {loading ? "Ingresando..." : "Iniciar sesion"}
      </button>

      {err && (
        <div role="alert" aria-live="polite" style={errorStyle}>
          {err}
        </div>
      )}
    </form>
  );
}
