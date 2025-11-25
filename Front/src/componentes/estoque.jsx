import { useEffect, useState } from "react";
import Header from "./header";
import "../estoque.css"
import { NavLink, useNavigate } from "react-router-dom";

export default function Stocks({ screen, switchTo }) {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Agrupar itens por lote
  const produtosPorLote = produtos.reduce((grp, p) => {
    if (!grp[p.lote]) grp[p.lote] = [];
    grp[p.lote].push(p);
    return grp;
  }, {});

  const formatDate = (isoString) => {
    if (!isoString) return "—";
    const d = new Date(isoString);
    return d.toLocaleDateString("pt-BR");
  };

  return (
    <>
    <Header/>
    <section id="stock" className={`screen ${screen === "stock" ? "show" : ""}`}>
      <div className="drip"></div>

      <div className="card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>

        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, color: "var(--brown)" }}>Gerenciamento de Estoque</h2>
            <div style={{ color: "rgba(107,63,63,0.6)" }}>Agrupado por lote</div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn" onClick={() => alert("Função de editar estoque ainda não implementada!")}>
              ✎ Editar Estoque
            </button>

            <NavLink to="/" className="link">
            <button className="ghost" >Voltar</button>
          </NavLink>
          </div>
        </div>

        <div style={{ marginTop: "18px", flex: 1, overflow: "auto" }}>
          {loading && (
            <div style={{ padding: "20px", color: "gray" }}>Carregando produtos...</div>
          )}

          {!loading && produtos.length === 0 && (
            <div style={{ padding: "20px", color: "gray" }}>Nenhum produto encontrado.</div>
          )}

          {!loading && Object.keys(produtosPorLote).map((lote) => {
            const itens = produtosPorLote[lote];
            const quantidade = itens.length;
            const validade = itens[0]?.validade;
            const primeiro = itens[0];

            const isLow = quantidade < 15;

            return (
              <div key={lote} className="card" style={{ marginBottom: "14px", padding: "18px" }}>

                {/* Cabeçalho do lote */}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ margin: 0 }}>Lote {lote}</h3>
                    <div style={{ fontSize: "13px", color: "rgba(107,63,63,0.6)" }}>
                      Validade: {formatDate(validade)}
                    </div>
                  </div>

                  <div
                    className="qty"
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      background: isLow ? "#ffcccc" : "#d6f5d6",
                      color: isLow ? "#a10000" : "green",
                      fontWeight: "bold"
                    }}
                  >
                    {quantidade} {isLow ? "⚠ Baixo" : "em estoque"}
                  </div>
                </div>

                {/* Lista de sabores e marcas do lote */}
                <div style={{ marginTop: "12px" }}>
                  {itens.map((p) => (
                    <div key={p.id} className="item" style={{ marginBottom: "8px" }}>
                      <strong>{p.sabor}</strong> — {p.marca}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
    </>
  );
}
