import "../style.css";
import Header from "./header";
import { useState } from "react";

export default function Register() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cargo, setCargo] = useState("Atendente");
  const [status, setStatus] = useState(""); // mensagem de feedback

  const handleRegister = async () => {
    setStatus("Cadastrando... 🍦");

    const userData = { nome, email, senha, cargo };

    try {
      const response = await fetch("http://127.0.0.1:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("✅ Usuário cadastrado com sucesso!");
        // Limpa o formulário
        setNome("");
        setEmail("");
        setSenha("");
        setCargo("Atendente");
        // Redireciona para login depois de 1.5s
        setTimeout(() => (window.location.href = "/login"), 1500);
      } else {
        setStatus("❌ Erro: " + (data.detail || "Não foi possível cadastrar"));
      }
    } catch (error) {
      setStatus("❌ Erro de conexão com o servidor.");
      console.error(error);
    }
  };

  return (
    <>
      <Header />
      <section id="register" className="screen">
        <div className="drip"></div>
        <div className="grid">
          <div className="card" style={{ padding: "26px" }}>
            <h2 style={{ margin: "0 0 10px 0", color: "var(--brown)" }}>
              Cadastrar Usuário
            </h2>
            <p style={{ color: "rgba(107,63,63,0.7)" }}>
              Adicione funcionários e defina permissões.
            </p>

            <div style={{ marginTop: "12px" }}>
              <label>Nome</label>
              <input
                placeholder="Maria da Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />

              <label style={{ marginTop: "8px" }}>E-mail</label>
              <input
                placeholder="maria@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <label style={{ marginTop: "8px" }}>Senha</label>
              <input
                type="password"
                placeholder="••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />

              <label style={{ marginTop: "8px" }}>Cargo</label>
              <select
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
              >
                <option>Atendente</option>
                <option>Administrador</option>
                <option>Gerente</option>
              </select>

              <div style={{ marginTop: "14px", display: "flex", gap: "10px" }}>
                <button className="btn" onClick={handleRegister}>
                  Cadastrar com carinho 🍦
                </button>
                <button className="ghost">
                  <a href="/login">Voltar</a>
                </button>
              </div>

              {/* Mensagem de feedback */}
              {status && (
                <p
                  style={{
                    marginTop: "10px",
                    fontWeight: "600",
                    color: "var(--brown)",
                  }}
                >
                  {status}
                </p>
              )}
            </div>
          </div>

          {/* Preview da marca */}
          <div className="preview card">
            <div
              style={{
                fontSize: "18px",
                fontWeight: 800,
                color: "var(--pink-strong)",
              }}
            >
              Preview da Marca
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                marginTop: "10px",
              }}
            >
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(180deg,var(--pink),var(--pink-strong))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 900,
                }}
              >
                S
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>
                  Sorvetrix - Filial: Central
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "rgba(107,63,63,0.6)",
                  }}
                >
                  Rua das Flores, 123 — Tel (84) 9xxxx-xxxx
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
