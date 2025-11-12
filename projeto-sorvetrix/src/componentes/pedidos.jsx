export default function Stocks({ screen, switchTo }) {
  // Função para adicionar novo item (placeholder, pode integrar depois com formulário)
  const addItem = () => {
    alert("Função de adicionar produto ainda não implementada!");
  };

  return (
    <section id="stock" className={`screen ${screen === "stock" ? "show" : ""}`}>
      <div className="drip"></div>

      <div className="card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header da tela */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, color: "var(--brown)" }}>Gerenciamento de Estoque</h2>
            <div style={{ color: "rgba(107,63,63,0.6)" }}>Controle de insumos e níveis</div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn" onClick={addItem}>+ Adicionar Produto</button>
            <button className="ghost" onClick={() => switchTo("dashboard")}>Voltar</button>
          </div>
        </div>

        {/* Lista de itens do estoque */}
        <div style={{ marginTop: "18px", flex: 1, overflow: "auto" }}>
          <div className="table">
            <div className="item">
              <div>
                <strong>Morango</strong>
                <div style={{ fontSize: "13px", color: "rgba(107,63,63,0.6)" }}>Fruta - kg</div>
              </div>
              <div className="qty green">120 kg</div>
            </div>

            <div className="item">
              <div>
                <strong>Leite</strong>
                <div style={{ fontSize: "13px", color: "rgba(107,63,63,0.6)" }}>Líquido - L</div>
              </div>
              <div className="qty green">45 L</div>
            </div>

            <div className="item">
              <div>
                <strong>Embalagens</strong>
                <div style={{ fontSize: "13px", color: "rgba(107,63,63,0.6)" }}>Copos/colheres</div>
              </div>
              <div className="qty green">210 un</div>
            </div>

            <div className="item">
              <div>
                <strong>Banana</strong>
                <div style={{ fontSize: "13px", color: "rgba(107,63,63,0.6)" }}>Fruta - kg</div>
              </div>
              <div className="qty warn">8 kg</div>
            </div>

            <div className="item">
              <div>
                <strong>Chocolate em pó</strong>
                <div style={{ fontSize: "13px", color: "rgba(107,63,63,0.6)" }}>Ingrediente</div>
              </div>
              <div className="qty low">2 kg</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
