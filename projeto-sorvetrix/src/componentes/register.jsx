import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../style.css";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    cargo: "",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Usuário criado com sucesso!");
        navigate("/login");
      } else {
        alert(data.detail || "Erro ao registrar usuário.");
      }
    } catch (err) {
      alert("Erro de conexão com o servidor.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="register" className="screen show">
      <div className="layout" style={{ height: "90%" }}>
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
            <h2>Criar Conta</h2>

            <label>Nome completo</label>
            <input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              required
            />

            <label>E-mail</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <label>Senha</label>
            <input
              name="senha"
              type="password"
              value={form.senha}
              onChange={handleChange}
              required
            />

            <label>Cargo</label>
            <input
              name="cargo"
              value={form.cargo}
              onChange={handleChange}
              required
            />

            <button
              className="btn"
              onClick={handleSubmit}
              disabled={loading}
              style={{ marginTop: "10px" }}
            >
              {loading ? "Registrando..." : "Registrar"}
            </button>

            {/* Já tem conta */}
            <p
              style={{
                marginTop: "15px",
                fontSize: "14px",
                width: "100%",
                textAlign: "center",
              }}
            >
              Já tem conta? <Link to="/login">Entrar</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
