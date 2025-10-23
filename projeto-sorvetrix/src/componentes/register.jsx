import "../style.css";
import Header from "./header";

export default function Register() {
  const switchTo = (screen) => {
    console.log(`Trocar para tela: ${screen}`);
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
              <input placeholder="Maria da Silva" />
              <label style={{ marginTop: "8px" }}>E-mail</label>
              <input placeholder="maria@exemplo.com" />
              <label style={{ marginTop: "8px" }}>Senha</label>
              <input type="password" placeholder="••••••" />
              <label style={{ marginTop: "8px" }}>Cargo</label>
              <select>
                <option>Atendente</option>
                <option>Administrador</option>
                <option>Gerente</option>
              </select>

              <div style={{ marginTop: "14px", display: "flex", gap: "10px" }}>
                <button className="btn">Cadastrar com carinho 🍦</button>
                <button className="ghost" onClick={() => switchTo("login")}>
                 <a href="/login">Voltar</a>
                </button>
              </div>
            </div>
          </div>

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

            <div style={{ marginTop: "18px", width: "100%" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <div className="flavor-card" style={{ flex: 1 }}>
                  <div className="flavor-img">🍓</div>
                  <div style={{ marginTop: "8px" }}>Morango</div>
                </div>
                <div className="flavor-card" style={{ flex: 1 }}>
                  <div className="flavor-img">🍫</div>
                  <div style={{ marginTop: "8px" }}>Chocolate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
