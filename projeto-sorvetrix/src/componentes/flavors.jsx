export default function Flavors({ screen, switchTo }) {
  // Função placeholder pra adicionar novo sabor
  const newFlavor = () => {
    alert("Função de adicionar novo sabor ainda não implementada!");
  };

  return (
    <section id="flavors" className={`screen ${screen === "flavors" ? "show" : ""}`}>
      <div className="drip"></div>

      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Header da tela */}
        <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, color: "var(--brown)" }}>Cadastro de Sabores</h2>
            <div style={{ color: "rgba(107,63,63,0.6)" }}>Adicione, edite e gerencie seus sabores.</div>
          </div>
          <div>
            <button className="btn" onClick={newFlavor}>+ Novo Sabor</button>
          </div>
        </div>

        {/* Lista de sabores */}
        <div style={{ marginTop: "14px", flex: 1, overflow: "auto" }}>
          <div className="flavor-list">
            <div className="flavor-card card">
              <div className="flavor-img">🍓</div>
              <div style={{ marginTop: "8px" }}>Morango</div>
            </div>

            <div className="flavor-card card">
              <div className="flavor-img">🍫</div>
              <div style={{ marginTop: "8px" }}>Chocolate</div>
            </div>

            <div className="flavor-card card">
              <div className="flavor-img">🥥</div>
              <div style={{ marginTop: "8px" }}>Coco</div>
            </div>

            <div className="flavor-card card">
              <div className="flavor-img">🍋</div>
              <div style={{ marginTop: "8px" }}>Limão</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
