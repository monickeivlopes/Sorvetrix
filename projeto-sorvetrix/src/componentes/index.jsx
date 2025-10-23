import { useState } from "react";
import "../style.css";
import Header from "./header";
import Orders from "./orders";

export default function Dashboard() {
  const [screen, setScreen] = useState("dashboard");

  const switchTo = (target) => {
    setScreen(target);
  };
  return (
    <main>
      <Header/>
      {/* DASHBOARD */}
      <section
        id="dashboard"
        className={`screen ${screen === "dashboard" ? "show" : ""}`}
      >
        <div className="drip"></div>
        <div className="grid">
          <aside className="card sidemenu">
            <div style={{ fontWeight: 800, fontSize: "18px", color: "var(--brown)" }}>
              Painel
            </div>
            <button onClick={() => switchTo("dashboard")}>Visão Geral</button>
            <button onClick={() => switchTo("stock")}>Estoque</button>
            <button onClick={() => switchTo("orders")}>Pedidos</button>
            <button onClick={() => switchTo("flavors")}>Sabores</button>

            <div style={{ marginTop: "auto" }}>
              <div style={{ fontSize: "12px", color: "rgba(107,63,63,0.6)" }}>
                Conta: admin@sorvetrix.com
              </div>
              <div style={{ fontWeight: 700, color: "var(--pink-strong)", marginTop: "8px" }}>
                Sair
              </div>
            </div>
          </aside>

          <div className="card" style={{ padding: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ margin: 0, color: "var(--brown)" }}>Visão Geral</h2>
                <div style={{ color: "rgba(107,63,63,0.6)" }}>Resumo em tempo real</div>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <div className="metric card" style={{ minWidth: "120px" }}>
                  <div style={{ fontSize: "12px", color: "rgba(107,63,63,0.6)" }}>Vendas Hoje</div>
                  <div className="big" style={{ color: "var(--pink-strong)" }}>152</div>
                </div>
                <div className="metric card" style={{ minWidth: "120px" }}>
                  <div style={{ fontSize: "12px", color: "rgba(107,63,63,0.6)" }}>Estoque baixo</div>
                  <div className="big" style={{ color: "#c47f00" }}>5</div>
                </div>
                <div className="metric card" style={{ minWidth: "120px" }}>
                  <div style={{ fontSize: "12px", color: "rgba(107,63,63,0.6)" }}>Pedidos em andamento</div>
                  <div className="big" style={{ color: "#2d7a66" }}>12</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "22px", marginTop: "22px", alignItems: "center" }}>
              <div style={{ flex: "0 0 260px" }}>
                <div style={{ fontWeight: 700, color: "var(--brown)", marginBottom: "8px" }}>Vendas por sabor</div>
                <div className="donut">Top</div>
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#ff9fb0" }}></div> Morango
                  </div>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#ffd27f" }}></div> Chocolate
                  </div>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#b8e7c8" }}></div> Pistache
                  </div>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "12px" }}>
                  <div className="card">Relatórios rápidos<br /><strong>Exportar CSV/PDF</strong></div>
                  <div className="card">Fluxo de caixa<br /><strong>R$ 4.320,00</strong></div>
                  <div className="card">Promoções ativas<br /><strong>2</strong></div>
                  <div className="card">Avaliações<br /><strong>4.8/5</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Orders screen={screen} />
    </main>
  );
}
