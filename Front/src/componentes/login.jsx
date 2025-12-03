import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../login.css";
import Header from "./header";
import Footer from "./footer";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8080/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        alert(`Bem-vindo(a), ${data.user}!`);
        navigate("/dashboard");
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
          <div
            className="right card"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "380px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <h2>Entrar</h2>

              <label>E-mail</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <label>Senha</label>

              {/* Campo de senha com ícone */}
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />

                <FontAwesomeIcon
                  icon={showPassword ? faEyeSlash : faEye}
                  className="password-icon"
                  onClick={() => setShowPassword(!showPassword)}
                />
              </div>

              <button className="btn" onClick={handleLogin} disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </button>

              <p
                style={{
                  marginTop: "10px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/forgot")}
              >
                Esqueceu a senha?
              </p>

              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "15px",
                }}
              >
                <a onClick={() => navigate("/register")}>Criar uma conta</a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
