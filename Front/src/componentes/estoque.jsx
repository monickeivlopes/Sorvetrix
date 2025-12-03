import { useEffect, useState } from "react";
import Header from "./header";
import "../estoque.css";
import { NavLink } from "react-router-dom";
import Footer from "./footer";

export default function Stocks({ screen }) {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});

  const fetchProdutos = async () => {
    try {
      const response = await fetch("http://localhost:8080/produtos");
      const data = await response.json();
      setProdutos(data);

      
      const map = {};
      data.forEach((p) => {
        map[p.id] = {
          marca: p.marca,
          sabor: p.sabor,
          lote: p.lote,
          validade: p.validade,
          valor: p.valor,
          quantidade: p.quantidade ?? 1, 
        };
      });
      setEditData(map);

    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  const handleEditChange = (id, field, value) => {
    setEditData((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const saveChanges = async () => {
    try {
      const updates = Object.entries(editData);

      for (const [id, fields] of updates) {
        await fetch(`http://localhost:8000/produtos/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fields),
        });
      }

      alert("Estoque atualizado com sucesso!");
      setEditMode(false);
      fetchProdutos();

    } catch (error) {
      console.error("Erro ao salvar estoque:", error);
      alert("Erro ao salvar estoque!");
    }
  };

   
  const produtosPorLote = produtos.reduce((grp, p) => {
    const key = `${p.lote}::${p.marca}::${p.sabor}`;
    if (!grp[key])
      grp[key] = { items: [], lote: p.lote, marca: p.marca, sabor: p.sabor, validade: p.validade };
    grp[key].items.push(p);
    return grp;
  }, {});

  const formatDate = (isoString) => {
    if (!isoString) return "—";
    return new Date(isoString).toLocaleDateString("pt-BR");
  };

  return (
    <>
      <Header />

      <section id="stock" className={`screen ${screen === "stock" ? "show" : ""}`}>
        <div className="drip"></div>

        <div className="card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>

          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ margin: 0, color: "var(--brown)" }}>Gerenciamento de Estoque</h2>
              <div style={{ color: "rgba(107,63,63,0.6)" }}>Agrupado por lote</div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button className="btn" onClick={() => setEditMode(!editMode)}>
                {editMode ? "Cancelar" : "✎ Editar Estoque"}
              </button>

              {editMode && (
                <button className="btn" onClick={saveChanges}>
                  💾 Salvar Alterações
                </button>
              )}

              <NavLink to="/" className="link">
                <button className="ghost">Voltar</button>
              </NavLink>
            </div>
          </div>

          
          <div style={{ marginTop: "18px", flex: 1, overflow: "auto" }}>
            {loading && (
              <div style={{ padding: "20px", color: "gray" }}>Carregando produtos...</div>
            )}

            {!loading &&
              Object.keys(produtosPorLote).map((key) => {
                const grp = produtosPorLote[key];
                const itens = grp.items;

                 
                const quantidade = itens.reduce(
                  (sum, i) => sum + (i.quantidade ?? 1),
                  0
                );

                const validade = grp.validade;
                const isLow = quantidade < 15;

                return (
                  <div key={key} className="card" style={{ marginBottom: "14px", padding: "18px" }}>

                    
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <h3 style={{ margin: 0 }}>Lote {grp.lote}</h3>
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
                          fontWeight: "bold",
                        }}
                      >
                        {quantidade} {isLow ? "⚠ Baixo" : "em estoque"}
                      </div>
                    </div>

                    
                    <div style={{ marginTop: "12px" }}>
                      {itens.map((p) => (
                        <div key={p.id} className="item" style={{ marginBottom: "14px" }}>
                          {editMode ? (
                            <>
                              <input
                                className="input"
                                value={editData[p.id].sabor}
                                onChange={(e) => handleEditChange(p.id, "sabor", e.target.value)}
                              />
                              <input
                                className="input"
                                value={editData[p.id].marca}
                                onChange={(e) => handleEditChange(p.id, "marca", e.target.value)}
                              />
                              <input
                                className="input"
                                value={editData[p.id].lote}
                                onChange={(e) => handleEditChange(p.id, "lote", e.target.value)}
                              />
                              <input
                                className="input"
                                type="date"
                                value={editData[p.id].validade}
                                onChange={(e) => handleEditChange(p.id, "validade", e.target.value)}
                              />
                              <input
                                className="input"
                                type="number"
                                value={editData[p.id].valor}
                                onChange={(e) => handleEditChange(p.id, "valor", e.target.value)}
                              />

                              
                              <input
                                className="input"
                                type="number"
                                min="0"
                                value={editData[p.id].quantidade}
                                onChange={(e) => handleEditChange(p.id, "quantidade", Number(e.target.value))}
                              />
                            </>
                          ) : (
                            <>
                              <strong>{p.sabor}</strong> — {p.marca}  
                              <span style={{ marginLeft: "8px", opacity: 0.7 }}>
                                ({p.quantidade ?? 1} unid.)
                              </span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>

                  </div>
                );
              })}
          </div>
        </div>
      </section>
      <Footer/>
    </>
  );
}
