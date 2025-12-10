import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../login.css";
import Header from "./header";
import Footer from "./footer";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

function Modal({ message, type, onClose }) {
  if (!message) return null;

  return (
    <div style={styles.overlay}>
      <div style={{ 
        ...styles.modal, 
        borderLeft: type === "success" ? "6px solid green" : "6px solid red" 
      }}>
        <p>{message}</p>
        <button style={styles.button} onClick={onClose}>OK</button>
      </div>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("success");

  function showModal(msg, t = "success") {
    setModalMessage(msg);
    setModalType(t);
    setTimeout(() => setModalMessage(""), 2500);
  }

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

        showModal(`Bem-vindo(a), ${data.user}!`, "success");

        setTimeout(() => navigate("/dashboard"), 1200);
      } else {
        showModal(data.detail || "Erro ao fazer login", "error");
      }
    } catch (err) {
      showModal("Erro de conexão com o servidor.", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <Modal 
        message={modalMessage} 
        type={modalType} 
        onClose={() => setModalMessage("")} 
      />

      <section id="login" className="screen show">
        <div className="layout" style={{ height: "100%" }}>
          <div className="right card" style={styles.centerCard}>
            <div style={styles.formBox}>
              <h2>Entrar</h2>

              <label>E-mail</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} />

              <label>Senha</label>
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


              <div style={styles.center}>
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


const styles = {
  overlay: {
    position: "fixed",
    top: 0, left: 0,
    width: "100vw", height: "100vh",
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "280px",
    textAlign: "center",
    fontSize: "16px",
    animation: "fadeIn .3s",
  },

  button: {
    marginTop: "12px",
    padding: "6px 15px",
    cursor: "pointer",
    background: "#1f75fe",
    border: "none",
    color: "#fff",
    borderRadius: "5px"
  },

  centerCard: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  formBox: {
    width: "100%",
    maxWidth: "380px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start"
  },

  link: {
    marginTop: "10px",
    fontSize: "14px",
    cursor: "pointer"
  },

  center: {
    width: "100%",
    textAlign: "center",
    marginTop: "15px"
  }

};
