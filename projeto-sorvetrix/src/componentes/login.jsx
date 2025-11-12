import { useState } from "react";
import { useNavigate } from "react-router-dom";  // ⬅️ importa o hook
import "../style.css";
import Header from "./header";

export default function Login() {
  const navigate = useNavigate();  // ⬅️ cria o hook de navegação
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        alert(`Bem-vindo(a), ${data.user}!`);
        navigate("/dashboard");  // ⬅️ redireciona com React Router
      } else {
        alert(data.detail || "Erro ao fazer login");
      }
    } catch (err) {
      alert("Erro de conexão com o servidor.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <section id="login" className="screen show">
        <div className="layout" style={{ height: "100%" }}>
          <div className="right card" style={{ display: "flex", justifyContent: "center", alignItems:"center"}}>
            <div style={{ width: "100%", maxWidth: "380px", display: "flex", flexDirection: "column", alignItems:"flex-start"}}>
              <h2>Entrar</h2>
              <label>E-mail</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} />
              <label>Senha</label>
              <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
              <button className="btn" onClick={handleLogin} disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
