import { useState, useEffect } from "react";
import "../dashboard.css";
import Header from "./header";
import Orders from "./pedidos";
import Stocks from "./estoque";
import Produtos from "./produtos";

export default function Dashboard() {
  const API_BASE = "http://localhost:8000";

  const [screen, setScreen] = useState("dashboard");

  // --- ESTADOS COM OS DADOS REAIS ---
  const [vendasHoje, setVendasHoje] = useState(0);
  const [pedidosEmAndamento, setPedidosEmAndamento] = useState(0);
  const [estoqueBaixo, setEstoqueBaixo] = useState(0);

  // ---------------------------
  // CARREGAR DADOS DO BACKEND
  // ---------------------------
  useEffect(() => {
    fetchVendas();
    fetchProdutos();
  }, []);

  // ---- BUSCAR VENDAS ----
  async function fetchVendas() {
    try {
      const res = await fetch(`${API_BASE}/vendas`);
      const data = await res.json();

      const hoje = new Date().toISOString().slice(0, 10);

      let countHoje = 0;
      let andamento = 0;

      data.forEach(v => {
        const dataVenda = v.created_at.slice(0, 10);
        if (dataVenda === hoje) countHoje++;
        if (v.status !== "Concluído" && v.status !== "Cancelado") andamento++;
      });

      setVendasHoje(countHoje);
      setPedidosEmAndamento(andamento);
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
    }
  }

  // ---- BUSCAR PRODUTOS ----
  async function fetchProdutos() {
    try {
      const res = await fetch(`${API_BASE}/produtos`);
      const produtos = await res.json();

      // aqui você pode definir o que é "estoque baixo"
      // como você AINDA não tem estoque no backend,
      // vamos usar "validade próxima"
      const hoje = new Date();
      const diasLimite = 5;

      let baixo = 0;

      produtos.forEach(p => {
        const validade = new Date(p.validade);
        const diff = (validade - hoje) / (1000 * 60 * 60 * 24);

        if (diff < diasLimite) baixo++;
      });

      setEstoqueBaixo(baixo);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  }

  // troca de telas
  const switchTo = (target) => {
    setScreen(target);
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <main>
      <Header />

      {screen === "dashboard" && (
        <section id="dashboard" className="screen show">
          <div className="drip"></div>
          <div className="grid">

            {/* MENU LATERAL */}
            <aside className="card sidemenu">
              <div style={{ fontWeight: 800, fontSize: "18px", color: "var(--brown)" }}>
                Painel
              </div>

              

              <div style={{ marginTop: "auto" }}>
                <div style={{ fontSize: "12px", color: "rgba(107,63,63,0.6)" }}>
                  Conta: {localStorage.getItem("user") || "Administrador"}
                </div>

                <div className="metric card">
                  <div style={{ fontSize: "12px", color: "rgba(107,63,63,0.6)" }}>
                    Vendas Hoje
                  </div>
                  <div className="big" style={{ color: "var(--pink-strong)" }}>
                    {vendasHoje}
                  </div>
                </div>

                <div className="metric card">
                  <div style={{ fontSize: "12px", color: "rgba(107,63,63,0.6)" }}>
                    Produtos com validade próxima
                  </div>
                  <div className="big" style={{ color: "#c47f00" }}>
                    {estoqueBaixo}
                  </div>
                </div>

                <div className="metric card">
                  <div style={{ fontSize: "12px", color: "rgba(107,63,63,0.6)" }}>
                    Pedidos em andamento
                  </div>
                  <div className="big" style={{ color: "#2d7a66" }}>
                    {pedidosEmAndamento}
                  </div>
                </div>
              </div>
            </aside>

            {/* CONTEÚDO PRINCIPAL */}
            <div className="card" style={{ padding: "18px" }}>
              <h2>Visão Geral</h2>
              <div className="subtitle">Resumo em tempo real</div>

              <div style={{ display: "flex", gap: "22px", marginTop: "22px", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "12px",
                    }}
                  >
                    <div className="card">
                      Relatórios rápidos <br />
                      <strong>Exportar CSV/PDF</strong>
                    </div>

                    <div className="card">
                      Fluxo de caixa
                      <br />
                      <strong>
                        R$ {(vendasHoje * 20).toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* OUTRAS TELAS */}
      {screen === "orders" && <Orders screen={screen} switchTo={switchTo} />}
      {screen === "stocks" && <Stocks screen={screen} switchTo={switchTo} />}
      {screen === "produtos" && <Produtos screen={screen} switchTo={switchTo} />}
    </main>
  );
}
