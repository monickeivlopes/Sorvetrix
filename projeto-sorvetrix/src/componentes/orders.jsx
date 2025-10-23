export default function Orders({ screen, switchTo }) {
  return (
    <section id="orders" className={`screen ${screen === "orders" ? "show" : ""}`}>
      <div className="drip"></div>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        
        {/* Header da tela */}
        <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, color: "var(--brown)" }}>Pedidos & Delivery</h2>
            <div style={{ color: "rgba(107,63,63,0.6)" }}>Acompanhe status e endereços</div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="ghost">Todos</button>
            <button className="ghost">Em preparo</button>
            <button className="ghost">Saiu para entrega</button>
          </div>
        </div>

        {/* Lista de pedidos */}
        <div style={{ marginTop: "14px", flex: 1, overflow: "auto" }}>
          <div className="orders-list">
            
            <div className="order card">
              <div>
                <div style={{ fontWeight: 700 }}>#1008 — Morango (casquinha)</div>
                <div style={{ fontSize: "13px", color: "rgba(107,63,63,0.6)" }}>
                  Cliente: João — Entrega: Rua A, 123
                </div>
              </div>
              <div className="tags">
                <div style={{ fontWeight: 800, color: "var(--pink-strong)" }}>Em preparo</div>
                <button
                  className="btn"
                  style={{ padding: "8px 10px", fontSize: "13px" }}
                  onClick={() => alert("Detalhes")}
                >
                  Ver
                </button>
              </div>
            </div>

            <div className="order card">
              <div>
                <div style={{ fontWeight: 700 }}>#1094 — Milkshake Chocolate</div>
                <div style={{ fontSize: "13px", color: "rgba(107,63,63,0.6)" }}>
                  Cliente: Ana — Retirada
                </div>
              </div>
              <div className="tags">
                <div style={{ fontWeight: 800, color: "#2d7a66" }}>Pronto</div>
                <button className="btn" style={{ padding: "8px 10px", fontSize: "13px" }}>
                  Ver
                </button>
              </div>
            </div>

            <div className="order card">
              <div>
                <div style={{ fontWeight: 700 }}>#1102 — Pote Pistache 1L</div>
                <div style={{ fontSize: "13px", color: "rgba(107,63,63,0.6)" }}>
                  Cliente: Delivery — Rua B, 45
                </div>
              </div>
              <div className="tags">
                <div style={{ fontWeight: 800, color: "#c47f00" }}>Saiu para entrega</div>
                <button className="btn" style={{ padding: "8px 10px", fontSize: "13px" }}>
                  Rastrear
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
