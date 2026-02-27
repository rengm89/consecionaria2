import React, { useState } from "react";
import Login from "./Login";
import VehicleManager from "./Vehicles.jsx";

const logoutButtonStyle = {
  border: "none",
  borderRadius: 10,
  padding: "10px 14px",
  cursor: "pointer",
  color: "#fff",
  fontWeight: 600,
  fontSize: 14,
  boxShadow: "0 8px 18px rgba(2, 6, 23, 0.24)",
  background: "#15803d",
  marginBottom: 12
};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const handleLogin = (tkn) => {
    localStorage.setItem("token", tkn);
    setToken(tkn);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  if (!token) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20
        }}
      >
        <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ marginBottom: 20 }}>Bienvenido/a</h1>
          <Login onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1></h1>
      <button className="ui-button" onClick={logout} style={logoutButtonStyle}>
        Cerrar sesión
      </button>
      <VehicleManager token={token} />
    </div>
  );
}
