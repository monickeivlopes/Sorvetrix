import { useEffect, useState } from "react";

export default function Flavors({ screen, switchTo }) {
  const API_BASE = "http://localhost:8000";

  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    marca: "",
    sabor: "",
    lote: "",
    validade: "",
  });

  const fetchProdutos = async () => {
    try {
      const res = await fetch(`${API_BASE}/produtos`);
      const data = await res.json();
      setProdutos(data);
    } catch (err) {
      console.error("Erro ao carregar produtos", err);
    } finally {
      setLoading(false);
    }
  };

  const addProduto = async () => {
    try {
      const res = await fetch(`${API_BASE}/produtos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchProdutos();
        setShowForm(false);
        setFormData({ marca: "", sabor: "", lote: "", validade: "" });
      }
    } catch (err) {
      console.error("Erro ao adicionar produto", err);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, [screen]);

  return (
    <section id="flavors" className={`screen ${screen === "flavors" ? "show" : ""}`}>
      <div className="drip"></div>

      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div
          className="card"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "28px"
          }}
        >
          <div>
            <h2 style={{ margin: 0, color: "var(--brown)" }}>Cadastro de Produtos</h2>
            <div style={{ color: "rgba(107,63,63,0.6)" }}>
              Gerencie marca, sabor e validade dos produtos.
            </div>
          </div>
          <button className="btn" onClick={() => setShowForm(true)}>
            + Novo Produto
          </button>
        </div>

        {showForm && (
          <div
            className="card"
            style={{
              marginTop: "14px",
              padding: "28px",
              width: "100%"
            }}
          >
            <h3>Novo Produto</h3>

            <div className="input-group">
              <label>Marca</label>
              <input
                type="text"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label>Sabor</label>
              <input
                type="text"
                value={formData.sabor}
                onChange={(e) => setFormData({ ...formData, sabor: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label>Lote</label>
              <input
                type="number"
                value={formData.lote}
                onChange={(e) => setFormData({ ...formData, lote: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label>Validade</label>
              <input
                type="date"
                value={formData.validade}
                onChange={(e) => setFormData({ ...formData, validade: e.target.value })}
              />
            </div>

            <button className="btn" style={{ marginTop: "10px" }} onClick={addProduto}>
              Salvar
            </button>
            <button className="ghost" style={{ marginTop: "10px" }} onClick={() => setShowForm(false)}>
              Cancelar
            </button>
          </div>
        )}

        <div style={{ marginTop: "14px", flex: 1, overflow: "auto" }}>
          <div className="flavor-list">
            {loading ? (
              <div>Carregando...</div>
            ) : produtos.length === 0 ? (
              <div>Nenhum produto cadastrado.</div>
            ) : (
              produtos.map((p) => (
                <div key={p.id} className="flavor-card card" style={{ padding: "30px" }}>
                  <div className="flavor-img">🍦</div>
                  <div style={{ marginTop: "20px", fontWeight: "bold" }}>{p.sabor}</div>
                  <div style={{ fontSize: "13px", marginTop: "8px", color: "rgba(107,63,63,0.7)" }}>
                    Marca: {p.marca}
                  </div>
                  <div style={{ fontSize: "13px", color: "rgba(107,63,63,0.7)" }}>
                    Lote: {p.lote}
                  </div>
                  <div style={{ fontSize: "13px", color: "rgba(107,63,63,0.7)" }}>
                    Validade: {p.validade}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
