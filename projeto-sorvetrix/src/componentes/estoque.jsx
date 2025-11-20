import { useEffect, useState } from "react";

export default function Stocks({ screen, switchTo }) {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Buscar produtos no backend
  const fetchProdutos = async () => {
    try {
      const response = await fetch("http://localhost:8000/produtos");
      const data = await response.json();
      setProdutos(data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  const addItem = () => {
    alert("Função de adicionar produto ainda não implementada!");
  };

  // Formatar validade para DD/MM/AAAA
  const formatDate = (isoString) => {
    if (!isoString) return "—";
    const d = new Date(isoString);
    return d.toLocaleDateString("pt-BR");
  };

  return (
    <section id="stock" className={`screen ${screen === "stock" ? "show" : ""}`}>
      <div className="drip"></div>

      <div className="card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>

        {/* Header */}
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

        {/* Lista */}
        <div style={{ marginTop: "18px", flex: 1, overflow: "auto" }}>
          <div className="table">
            
            {loading && (
              <div style={{ padding: "20px", color: "gray" }}>Carregando produtos...</div>
            )}

            {!loading && produtos.length === 0 && (
              <div style={{ padding: "20px", color: "gray" }}>Nenhum produto encontrado.</div>
            )}

            {!loading && produtos.map((p) => (
              <div className="item" key={p.id}>
                <div>
                  <strong>{p.marca}</strong>
                  <div style={{ fontSize: "13px", color: "rgba(107,63,63,0.6)" }}>
                    {p.sabor} — Lote {p.lote}<br />
                    Validade: {formatDate(p.validade)}
                  </div>
                </div>

                {/* Aqui você poderia colocar quantidade ou nível */}
                <div className="qty green">ok</div>
              </div>
            ))}

          </div>
        </div>
      </div>
    </section>
  );
}
