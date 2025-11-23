import { useEffect, useState } from "react";

console.log("📌 PEDIDOS RENDERIZOU");

export default function Orders({ screen, switchTo }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // form state
  const [item, setItem] = useState("");
  const [cliente, setCliente] = useState("");
  const [endereco, setEndereco] = useState("");

  // produtos
  const [produtos, setProdutos] = useState([]);

  const API_BASE = "http://127.0.0.1:8000";

  useEffect(() => {
    console.log("SCREEN ATUAL:", screen);

    // AGORA funciona: Orders é realmente montado quando a tela abre
    if (screen === "orders") {
      loadOrders();
      loadProdutos();
    }
  }, [screen]);

  // ============================
  // Carregar pedidos
  // ============================
  async function loadOrders() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/vendas`);
      if (!res.ok) throw new Error("Falha ao carregar pedidos");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  }

  // ============================
  // Carregar produtos
  // ============================
  async function loadProdutos() {
    try {
      const res = await fetch(`${API_BASE}/produtos`);
      if (!res.ok) throw new Error("Falha ao carregar produtos");
      const data = await res.json();
      setProdutos(data);
      console.log("PRODUTOS CARREGADOS:", data); // <--- para confirmar
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar produtos");
    }
  }

  // ============================
  // Adicionar pedido
  // ============================
  async function addOrder() {
    if (!item || !cliente) return alert("Preencha produto e cliente");

    const payload = {
      item,
      cliente,
      endereco,
      status: "Em preparo",
      created_at: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${API_BASE}/vendas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Falha ao adicionar pedido");

      const created = await res.json();
      setOrders((s) => [created, ...s]);

      setItem("");
      setCliente("");
      setEndereco("");
    } catch (err) {
      console.error(err);
      alert("Erro ao adicionar pedido");
    }
  }

  // ============================
  // Atualizar status
  // ============================
  async function updateStatus(id, nextStatus) {
    try {
      const res = await fetch(`${API_BASE}/vendas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) throw new Error("Falha ao atualizar status");

      const updated = await res.json();
      setOrders((s) => s.map((o) => (o.id === updated.id ? updated : o)));
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar pedido");
    }
  }

  // ============================
  // Apagar pedido
  // ============================
  async function deleteOrder(id) {
    if (!confirm("Remover pedido?")) return;

    try {
      const res = await fetch(`${API_BASE}/vendas/${id}`, {
        method: "DELETE",
      });

      if (res.status !== 204) throw new Error("Falha ao deletar");

      setOrders((s) => s.filter((o) => o.id !== id));
    } catch (err) {
      console.error(err);
      alert("Erro ao remover pedido");
    }
  }

  return (
    <>
      <div className="drip"></div>

      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Header da tela */}
        <div
          className="card"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ margin: 0, color: "var(--brown)" }}>Pedidos & Delivery</h2>
            <div style={{ color: "rgba(107,63,63,0.6)" }}>
              Acompanhe status e endereços
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button className="ghost" onClick={() => loadOrders()}>
              Todos
            </button>

            <button
              className="ghost"
              onClick={() =>
                setOrders((s) => s.filter((o) => o.status === "Em preparo"))
              }
            >
              Em preparo
            </button>

            <button
              className="ghost"
              onClick={() =>
                setOrders((s) => s.filter((o) => o.status === "Saiu para entrega"))
              }
            >
              Saiu para entrega
            </button>
          </div>
        </div>

        {/* Adicionar pedido */}
        <div className="card" style={{ marginTop: "14px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <h3 style={{ margin: 0, color: "var(--brown)" }}>Adicionar Pedido</h3>

          <select className="input" value={item} onChange={(e) => setItem(e.target.value)}>
            <option value="">Selecione um produto...</option>

            {produtos.map((p) => (
              <option key={p.id} value={`${p.marca} - ${p.sabor}`}>
                {p.marca} — {p.sabor}
              </option>
            ))}
          </select>

          <input
            className="input"
            placeholder="Cliente"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
          />

          <input
            className="input"
            placeholder="Endereço / Retirada"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
          />

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" onClick={addOrder}>
              Adicionar
            </button>

            <button
              className="ghost"
              onClick={() => {
                setItem("");
                setCliente("");
                setEndereco("");
              }}
            >
              Limpar
            </button>

            <button className="ghost" onClick={loadOrders}>
              Atualizar
            </button>
          </div>
        </div>

        {/* Lista de pedidos */}
        <div style={{ marginTop: "14px", flex: 1, overflow: "auto" }}>
          <div className="orders-list">
            {loading && <div className="card">Carregando pedidos...</div>}

            {orders.map((order) => (
              <div key={order.id} className="order card">
                <div>
                  <div style={{ fontWeight: 700 }}>
                    #{order.id} — {order.item}
                  </div>
                  <div style={{ fontSize: "13px", color: "rgba(107,63,63,0.6)" }}>
                    Cliente: {order.cliente} — {order.endereco || "Retirada"}
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.45)" }}>
                    Criado: {new Date(order.created_at).toLocaleString()}
                  </div>
                </div>

                <div className="tags">
                  <div
                    style={{
                      fontWeight: 800,
                      color:
                        order.status === "Pronto"
                          ? "#2d7a66"
                          : order.status === "Saiu para entrega"
                          ? "#c47f00"
                          : "var(--pink-strong)",
                    }}
                  >
                    {order.status}
                  </div>

                  <div style={{ display: "flex", gap: 6 }}>
                    {order.status !== "Pronto" && (
                      <button
                        className="btn"
                        style={{ padding: "8px 10px", fontSize: "13px" }}
                        onClick={() => updateStatus(order.id, "Pronto")}
                      >
                        Marcar Pronto
                      </button>
                    )}

                    {order.status !== "Saiu para entrega" && (
                      <button
                        className="btn"
                        style={{ padding: "8px 10px", fontSize: "13px" }}
                        onClick={() => updateStatus(order.id, "Saiu para entrega")}
                      >
                        Saiu p/ entrega
                      </button>
                    )}

                    <button
                      className="btn"
                      style={{ padding: "8px 10px", fontSize: "13px" }}
                      onClick={() => deleteOrder(order.id)}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {!loading && orders.length === 0 && (
              <div className="card">Nenhum pedido encontrado.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
