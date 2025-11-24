import { useEffect, useState } from "react";
import Header from "./header";

export default function Pedidos() {
  const API_BASE = "http://localhost:8000";

  const [produtos, setProdutos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [pedidosOriginais, setPedidosOriginais] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    cliente: "",
    endereco: "",
    items: [],
  });

  const [currentItem, setCurrentItem] = useState({
    produto_id: "",
    quantidade: 1,
  });

  useEffect(() => {
    async function carregar() {
      try {
        const resProdutos = await fetch(`${API_BASE}/produtos`);
        const produtosData = await resProdutos.json();
        setProdutos(produtosData);

        const resPedidos = await fetch(`${API_BASE}/vendas`);
        const vendasData = await resPedidos.json();
        setPedidos(vendasData);
        setPedidosOriginais(vendasData);
      } catch (e) {
        console.log("Erro ao carregar:", e);
      }
      setLoading(false);
    }
    carregar();
  }, []);

  // Adicionar item ao estado do pedido
  function adicionarItem() {
    if (!currentItem.produto_id) return;

    const produto = produtos.find(p => p.id == currentItem.produto_id);
    const quantidade = Number(currentItem.quantidade);
    const subtotal = produto.valor * quantidade;

    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          produto_id: produto.id,
          quantidade,
          nome: `${produto.marca} - ${produto.sabor}`,
          valor_unit: produto.valor,
          subtotal,
        }
      ]
    });

    setCurrentItem({ produto_id: "", quantidade: 1 });
  }

  // Enviar pedido
  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      cliente: formData.cliente,
      endereco: formData.endereco,
      items: formData.items.map(it => ({
        produto_id: it.produto_id,
        quantidade: it.quantidade,
      }))
    };

    await fetch(`${API_BASE}/vendas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await fetch(`${API_BASE}/vendas`);
    const vendasData = await res.json();

    setPedidos(vendasData);
    setPedidosOriginais(vendasData);

    setFormData({ cliente: "", endereco: "", items: [] });
    setCurrentItem({ produto_id: "", quantidade: 1 });
  }

  async function alterarStatus(id, novoStatus) {
    try {
      await fetch(`${API_BASE}/vendas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });

      const res = await fetch(`${API_BASE}/vendas`);
      const vendasData = await res.json();

      setPedidos(vendasData);
      setPedidosOriginais(vendasData);
    } catch (err) {
      console.log("Erro ao alterar status:", err);
    }
  }

  async function excluirPedido(id) {
    try {
      await fetch(`${API_BASE}/vendas/${id}`, { method: "DELETE" });

      setPedidos(prev => prev.filter(p => p.id !== id));
      setPedidosOriginais(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.log("Erro ao excluir pedido:", err);
    }
  }

  if (loading) return <p>Carregando...</p>;

  return (
    <>
    <Header/>
     <section id="orders"
      className={`screen ${screen === "orders" ? "show" : ""}`}>
       <div className="drip"></div>

      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        

        {/* Header */}
        <div className="card" style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: 0, color: "var(--brown)" }}>Pedidos & Delivery</h2>
            <div style={{ color: "rgba(107,63,63,0.6)" }}>
              Acompanhe status e endereços
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button className="ghost" onClick={() => setPedidos(pedidosOriginais)}>Todos</button>
            <button className="ghost" onClick={() => setPedidos(pedidosOriginais.filter(i => i.status === "Em preparo"))}>Em preparo</button>
            <button className="ghost" onClick={() => setPedidos(pedidosOriginais.filter(i => i.status === "Saiu para entrega"))}>Saiu para entrega</button>
            <button className="ghost" onClick={() => setPedidos(pedidosOriginais.filter(i => i.status === "Finalizado"))}>Finalizado</button>
          </div>
        </div>

        {/* Form */}
        <div className="card" style={{ marginTop: "14px", padding: "14px" }}>
          <h3 style={{ margin: 0, color: "var(--brown)" }}>Adicionar Pedido</h3>

          {/* Seleção de itens */}
          <div style={{ display: "flex", gap: 8 }}>
            <select
              className="input"
              value={currentItem.produto_id}
              onChange={(e) => setCurrentItem({ ...currentItem, produto_id: e.target.value })}
            >
              <option value="">Selecione um produto...</option>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.marca} — {p.sabor} (R$ {p.valor.toFixed(2)})
                </option>
              ))}
            </select>

            <input
              type="number"
              className="input"
              min="1"
              value={currentItem.quantidade}
              onChange={(e) => setCurrentItem({ ...currentItem, quantidade: e.target.value })}
              style={{ width: "80px" }}
            />

            <button className="btn" onClick={adicionarItem}>Adicionar item</button>
          </div>

          {/* Itens do pedido */}
          {formData.items.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <h4>Itens selecionados:</h4>
              {formData.items.map((it, idx) => (
                <div key={idx} className="card" style={{ padding: 8, marginBottom: 8 }}>
                  {it.nome} — {it.quantidade} un — R$ {it.subtotal.toFixed(2)}
                </div>
              ))}
            </div>
          )}

          {/* Cliente */}
          <input
            className="input"
            placeholder="Cliente"
            value={formData.cliente}
            onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
          />

          {/* Endereço */}
          <input
            className="input"
            placeholder="Endereço / Retirada"
            value={formData.endereco}
            onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
          />

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" onClick={handleSubmit}>Finalizar Pedido</button>
            <button className="ghost" onClick={() => setFormData({ cliente: "", endereco: "", items: [] })}>
              Limpar
            </button>
          </div>
        </div>

        {/* Lista de pedidos */}
        <div style={{ marginTop: "14px", flex: 1, overflow: "auto" }}>
          <div className="orders-list">
            
            {pedidos.map((order) => (
              <div key={order.id} className="order card" style={{ display: "flex", justifyContent: "space-between" }}>

                <div>
                  <div style={{ fontWeight: 700 }}>
                    #{order.id}
                  </div>

                  <div style={{ marginTop: 6 }}>
                    {order.items.map((it, idx) => (
                      <div key={idx}>
                        {it.nome} — {it.quantidade} un — R$ {it.subtotal.toFixed(2)}
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 6, fontWeight: 700 }}>
                    Total: R$ {order.valor_total.toFixed(2)}
                  </div>

                  <div style={{ fontSize: "13px", color: "rgba(107,63,63,0.6)" }}>
                    Cliente: {order.cliente} — {order.endereco || "Retirada"}
                  </div>

                  <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.45)" }}>
                    Criado: {new Date(order.created_at).toLocaleString()}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  
                  <div
                    style={{
                      fontWeight: 800,
                      color:
                        order.status === "Finalizado"
                          ? "#2d7a66"
                          : order.status === "Saiu para entrega"
                          ? "#c47f00"
                          : "var(--pink-strong)",
                    }}
                  >
                    {order.status}
                  </div>

                  <div className="orders-buttons">
                    <button className="small" onClick={() => alterarStatus(order.id, "Em preparo")}>Em preparo</button>
                    <button className="small" onClick={() => alterarStatus(order.id, "Saiu para entrega")}>Saiu para entrega</button>
                    <button className="small" onClick={() => alterarStatus(order.id, "Finalizado")}>Finalizado</button>

                    <button
                      style={{ backgroundColor: "#f90989", color: "white" }}
                      className="small danger"
                      onClick={() => excluirPedido(order.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {pedidos.length === 0 && (
              <div className="card">Nenhum pedido encontrado.</div>
            )}

          </div>
        </div>
      </div>
     </section>
    </>
  );
}
