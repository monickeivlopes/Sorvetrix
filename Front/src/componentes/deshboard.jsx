import { useState, useEffect } from "react";
import "../dashboard.css";
import Header from "./header";
import Orders from "./pedidos";
import Stocks from "./estoque";
import Produtos from "./produtos";

export default function Dashboard() {
  const API_BASE = "http://localhost:8000";

  const [screen, setScreen] = useState("dashboard");

  // --- ESTADOS COM OS DADOS REAIS ---
  const [vendasHojeCount, setVendasHojeCount] = useState(0);
  const [vendasHojeTotal, setVendasHojeTotal] = useState(0.0);
  const [vendasUltimos7diasTotal, setVendasUltimos7diasTotal] = useState(0.0);
  const [pedidosEmAndamento, setPedidosEmAndamento] = useState(0);
  const [estoqueBaixo, setEstoqueBaixo] = useState(0);
  const [vendas, setVendas] = useState([]); // lista completa de vendas (para relatórios)

  // ---------------------------
  // CARREGAR DADOS DO BACKEND
  // ---------------------------
  useEffect(() => {
    fetchVendas();
    fetchProdutos();
  }, []);

  // ---- BUSCAR VENDAS ----
  async function fetchVendas() {
    try {
      const res = await fetch(`${API_BASE}/vendas`);
      const data = await res.json();

      setVendas(data || []);

      const hojeStr = new Date().toISOString().slice(0, 10);
      let countHoje = 0;
      let andamento = 0;
      let totalHoje = 0;
      let total7dias = 0;

      const hoje = new Date();
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(hoje.getDate() - 6); // inclui hoje, total de 7 dias

      data.forEach(v => {
        // created_at vem do backend como ISO string; garantir compatibilidade
        const created = new Date(v.created_at);
        const createdStr = created.toISOString().slice(0, 10);

        // contagem de hoje
        if (createdStr === hojeStr) {
          countHoje++;
          totalHoje += Number(v.valor_total || 0);
        }

        // total últimos 7 dias
        if (created >= new Date(seteDiasAtras.toISOString().slice(0, 10))) {
          total7dias += Number(v.valor_total || 0);
        }

        // pedidos em andamento (filtra por status diferente de Concluído/Cancelado)
        if (v.status !== "Concluído" && v.status !== "Cancelado") andamento++;
      });

      setVendasHojeCount(countHoje);
      setVendasHojeTotal(totalHoje);
      setVendasUltimos7diasTotal(total7dias);
      setPedidosEmAndamento(andamento);
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
    }
  }

  // ---- BUSCAR PRODUTOS ----
  async function fetchProdutos() {
    try {
      const res = await fetch(`${API_BASE}/produtos`);
      const produtos = await res.json();

      // aqui você pode definir o que é "estoque baixo"
      // como você AINDA não tem estoque no backend,
      // vamos usar "validade próxima"
      const hoje = new Date();
      const diasLimite = 5;

      let baixo = 0;

      produtos.forEach(p => {
        const validade = p.validade ? new Date(p.validade) : null;
        if (!validade) return;
        const diff = (validade - hoje) / (1000 * 60 * 60 * 24);

        if (diff < diasLimite) baixo++;
      });

      setEstoqueBaixo(baixo);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  }

  // ---- EXPORTAR CSV (Relatórios rápidos) ----
  function exportCSV() {
    if (!vendas || vendas.length === 0) {
      alert("Sem vendas para exportar");
      return;
    }

    // Cabeçalho
    const header = [
      "id",
      "cliente",
      "endereco",
      "status",
      "valor_total",
      "created_at",
      "items_count",
      "items_descricao"
    ];

    const rows = vendas.map(v => {
      const itemsCount = v.items ? v.items.length : 0;
      // items_descricao: "produto_id:x|nome:y|qtd:z;..."
      const itemsDesc = (v.items || [])
        .map(it => `(${it.produto_id} - ${it.nome} x${it.quantidade} R$${Number(it.valor_unit).toFixed(2)})`)
        .join(" ; ");
      return [
        v.id,
        escapeCSV(v.cliente || ""),
        escapeCSV(v.endereco || ""),
        v.status || "",
        Number(v.valor_total || 0).toFixed(2),
        v.created_at,
        itemsCount,
        escapeCSV(itemsDesc)
      ].join(",");
    });

    const csvContent = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio_vendas_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function escapeCSV(value) {
    if (typeof value !== "string") return value;
    // encapsula em aspas se necessário e escapa aspas internas
    if (value.includes(",") || value.includes("\n") || value.includes('"')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  // ---- IMPRIMIR RELATÓRIO / GERAR "PDF" via print ----
  function printRelatorio() {
    if (!vendas || vendas.length === 0) {
      alert("Sem vendas para imprimir");
      return;
    }

    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) {
      alert("Não foi possível abrir a janela de impressão — permita popups.");
      return;
    }

    const style = `
      <style>
        body{font-family: Arial, Helvetica, sans-serif; padding:20px; color:#333}
        h1{font-size:18px;margin-bottom:6px}
        table{width:100%;border-collapse:collapse;margin-top:12px}
        th,td{border:1px solid #ddd;padding:6px;font-size:12px;text-align:left}
        th{background:#f4f4f4}
        .right{text-align:right}
      </style>
    `;

    const rowsHtml = vendas.map(v => {
      const itemsDesc = (v.items || [])
        .map(it => `${it.nome} x${it.quantidade} R$${Number(it.valor_unit).toFixed(2)}`)
        .join("; ");
      return `<tr>
        <td>${v.id}</td>
        <td>${escapeHtml(v.cliente || "")}</td>
        <td>${escapeHtml(v.status || "")}</td>
        <td class="right">R$ ${Number(v.valor_total || 0).toFixed(2)}</td>
        <td>${escapeHtml(new Date(v.created_at).toLocaleString())}</td>
        <td>${escapeHtml(itemsDesc)}</td>
      </tr>`;
    }).join("");

    const html = `
      <html>
        <head><title>Relatório de Vendas</title>${style}</head>
        <body>
          <h1>Relatório de Vendas — ${new Date().toLocaleDateString()}</h1>
          <div>Total hoje: <strong>R$ ${vendasHojeTotal.toFixed(2)}</strong></div>
          <div>Total últimos 7 dias: <strong>R$ ${vendasUltimos7diasTotal.toFixed(2)}</strong></div>
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Cliente</th><th>Status</th><th>Valor</th><th>Data</th><th>Itens</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `;

    win.document.open();
    win.document.write(html);
    win.document.close();

    // esperar pequeno delay para garantir carregamento antes de print
    setTimeout(() => {
      win.print();
    }, 500);
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // troca de telas
  const switchTo = (target) => {
    setScreen(target);
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <main>
      <Header />

      {screen === "dashboard" && (
        <section id="dashboard" className="screen show">
          <div className="drip"></div>
          <div className="grid">

            {/* MENU LATERAL */}
            <aside className="card sidemenu">
              <div style={{ fontWeight: 800, fontSize: "18px", color: "var(--brown)" }}>
                Painel
                <div style={{ fontSize: "12px", color: "rgba(107,63,63,0.6)" }}>
                  Conta: {localStorage.getItem("user") || "Administrador"}
                </div>
              </div>

              <div className="painel" style={{ marginTop: "auto" }}>
                <div className="metric card">
                  <div style={{ fontSize: "12px", color: "rgba(107,63,63,0.6)" }}>
                    Vendas Hoje
                  </div>
                  <div className="big" style={{ color: "var(--pink-strong)" }}>
                    {vendasHojeCount}
                  </div>
                </div>

                <div className="metric card">
                  <div style={{ fontSize: "12px", color: "rgba(107,63,63,0.6)" }}>
                    Produtos com validade próxima
                  </div>
                  <div className="big" style={{ color: "#c47f00" }}>
                    {estoqueBaixo}
                  </div>
                </div>

                <div className="metric card">
                  <div style={{ fontSize: "12px", color: "rgba(107,63,63,0.6)" }}>
                    Pedidos em andamento
                  </div>
                  <div className="big" style={{ color: "#2d7a66" }}>
                    {pedidosEmAndamento}
                  </div>
                </div>
              </div>
            </aside>

            {/* CONTEÚDO PRINCIPAL */}
            <div className="card" style={{ padding: "18px" }}>
              <h2>Visão Geral</h2>
              <div className="subtitle">Resumo em tempo real</div>

              <div style={{ display: "flex", gap: "22px", marginTop: "22px", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "12px",
                    }}
                  >
                    <div className="card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          Relatórios rápidos <br />
                          <small style={{ color: "rgba(0,0,0,0.6)" }}>Exportar / imprimir</small>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={exportCSV} className="btn-small">Exportar CSV</button>
                          <button onClick={printRelatorio} className="btn-small">Imprimir</button>
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      Fluxo de caixa
                      <br />
                      <strong>
                        R$ {vendasHojeTotal.toFixed(2)}
                      </strong>
                      <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.6)", marginTop: 6 }}>
                        Últimos 7 dias: R$ {vendasUltimos7diasTotal.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* OUTRAS TELAS */}
      {screen === "orders" && <Orders screen={screen} switchTo={switchTo} />}
      {screen === "stocks" && <Stocks screen={screen} switchTo={switchTo} />}
      {screen === "produtos" && <Produtos screen={screen} switchTo={switchTo} />}
    </main>
  );
}
