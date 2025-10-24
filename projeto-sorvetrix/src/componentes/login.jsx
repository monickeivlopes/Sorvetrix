import { useState } from "react";
import "../style.css";
import Header from "./header";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function handleLogin() {
    const response = await fetch("http://127.0.0.1:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.access_token);
      alert(`Bem-vindo(a), ${data.user}!`);
      window.location.href = "/dashboard";
    } else {
      alert(data.detail || "Erro ao fazer login");
    }
  }

  return (
    <>
      <Header />
      <section id="login" className="screen show">
        <div className="layout" style={{ height: "100%" }}>
          <div className="right card" style={{ display: "flex", justifyContent: "center", alignItems:"center"}}>
            <div style={{ width: "100%", maxWidth: "380px", display: "flex", justifyContent: "center", alignItems:"left",flexDirection: "column",}}>
              <h2>Entrar</h2>
              <label>E-mail</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} />
              <label>Senha</label>
              <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
              <button className="btn" onClick={handleLogin}>Entrar</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
