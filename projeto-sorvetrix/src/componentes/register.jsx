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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch("http://localhost:8000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert("Usuário criado com sucesso!");
      navigate("/login");
    } else {
      alert("Erro ao registrar usuário.");
    }
  } catch (err) {
    console.error(err);
    alert("Erro de conexão com o servidor.");
  }
};

  return (
    <main className="register-page">
      <div className="card" style={{ maxWidth: "400px", margin: "80px auto", padding: "20px" }}>
        <h2 style={{ color: "var(--brown)", textAlign: "center" }}>Criar Conta</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input name="nome" placeholder="Nome completo" value={form.nome} onChange={handleChange} required />
          <input name="email" type="email" placeholder="E-mail" value={form.email} onChange={handleChange} required />
          <input name="senha" type="password" placeholder="Senha" value={form.senha} onChange={handleChange} required />
          <input name="cargo" placeholder="Cargo" value={form.cargo} onChange={handleChange} required />
          <button type="submit" className="btn-primary">Registrar</button>
        </form>
        <p style={{ textAlign: "center", marginTop: "10px" }}>
  Já tem conta? <Link to="/login">Entrar</Link>
</p>
      </div>
    </main>
  );
}
