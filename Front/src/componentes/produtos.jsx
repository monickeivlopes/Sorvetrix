import { useEffect, useState } from "react";
import "../style.css";

export default function Produtos({ screen }) {
  const API_BASE = "http://127.0.0.1:8000";

  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    marca: "",
    sabor: "",
    lote: "",
    validade: "",
  });

  // Carregar produtos
  useEffect(() => {
    async function fetchProdutos() {
      try {
        const response = await fetch(`${API_BASE}/produtos`);
        const data = await response.json();
        setProdutos(data);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProdutos();
  }, []);

  // Atualizar campos
  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  // Criar ou editar produto
  async function handleSubmit(e) {
    e.preventDefault();

    if (isEditing) {
      // EDITAR produto
      try {
        const response = await fetch(`${API_BASE}/produtos/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            marca: formData.marca,
            sabor: formData.sabor,
            lote: Number(formData.lote),
            validade: formData.validade,
          }),
        });

        const updated = await response.json();

        setProdutos(
          produtos.map((p) => (p.id === editId ? updated : p))
        );

      } catch (error) {
        console.error("Erro ao editar produto:", error);
      }

      setIsEditing(false);
      setEditId(null);
      setShowForm(false);
      return;
    }

    // CRIAR produto
    try {
      const response = await fetch(`${API_BASE}/produtos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marca: formData.marca,
          sabor: formData.sabor,
          lote: Number(formData.lote),
          validade: formData.validade,
        }),
      });

      const newProduct = await response.json();

      setProdutos([...produtos, newProduct]);
      setShowForm(false);

    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
    }
  }

  // Editar
  function handleEdit(produto) {
    setFormData({
      marca: produto.marca,
      sabor: produto.sabor,
      lote: produto.lote,
      validade: produto.validade,
    });

    setIsEditing(true);
    setEditId(produto.id);
    setShowForm(true);
  }

  // Excluir
  async function handleDelete(id) {
    try {
      await fetch(`${API_BASE}/produtos/${id}`, {
        method: "DELETE",
      });

      setProdutos(produtos.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
    }
  }

  // Formatar validade
  const formatDate = (isoString) => {
    if (!isoString) return "—";
    return new Date(isoString).toLocaleDateString("pt-BR");
  };

  return (
    <section
      id="products"
      className={`screen ${screen === "products" ? "show" : ""}`}
    >
      <div className="drip"></div>

      <div
        className="card"
        style={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, color: "var(--brown)" }}>Cadastro de Produtos</h2>
            <div style={{ color: "rgba(107,63,63,0.6)" }}>
              Gerencie insumos e novos lotes
            </div>
          </div>

          <button
            className="btn"
            onClick={() => {
              setShowForm(true);
              setIsEditing(false);
              setFormData({ marca: "", sabor: "", lote: "", validade: "" });
            }}
          >
            + Novo Produto
          </button>
        </div>

        {/* FORM */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="card"
            style={{
              marginTop: "16px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <label>Marca</label>
            <input name="marca" onChange={handleChange} value={formData.marca} required />

            <label>Sabor</label>
            <input name="sabor" onChange={handleChange} value={formData.sabor} required />

            <label>Lote</label>
            <input name="lote" type="number" onChange={handleChange} value={formData.lote} required />

            <label>Validade</label>
            <input name="validade" type="date" onChange={handleChange} value={formData.validade} required />

            <button className="btn" type="submit">
              {isEditing ? "Salvar Alterações" : "Salvar"}
            </button>
          </form>
        )}

        {/* LISTAGEM */}
        <div style={{ marginTop: "18px", flex: 1, overflow: "auto" }}>
          <div className="table">
            {loading && (
              <div style={{ padding: "20px", color: "gray" }}>
                Carregando produtos...
              </div>
            )}

            {!loading && produtos.length === 0 && (
              <div style={{ padding: "20px", color: "gray" }}>
                Nenhum produto cadastrado.
              </div>
            )}

            {!loading &&
              produtos.map((p) => (
                <div className="item" key={p.id}>
                  <div>
                    <strong>{p.marca}</strong>
                    <div style={{ fontSize: "13px", color: "rgba(107,63,63,0.6)" }}>
                      {p.sabor} — Lote {p.lote}
                      <br />
                      Validade: {formatDate(p.validade)}
                    </div>
                  </div>

                  {/* BOTÕES */}
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button className="btn small" onClick={() => handleEdit(p)}>Editar</button>
                    <button className="btn small danger" onClick={() => handleDelete(p.id)}>Excluir</button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
