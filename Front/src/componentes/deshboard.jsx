import { useState, useEffect } from "react";
import "../dashboard.css";
import Header from "./header";
import Orders from "./pedidos";
import Stocks from "./estoque";
import Produtos from "./produtos";
import Footer from "./footer";


import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Dashboard() {
  const API_BASE = "http://localhost:8000";

  const [screen, setScreen] = useState("dashboard");


  const [vendasHojeCount, setVendasHojeCount] = useState(0);
  const [vendasHojeTotal, setVendasHojeTotal] = useState(0.0);
  const [vendasUltimos7diasTotal, setVendasUltimos7diasTotal] = useState(0.0);
  const [pedidosEmAndamento, setPedidosEmAndamento] = useState(0);
  const [estoqueBaixo, setEstoqueBaixo] = useState(0);
  const [vendas, setVendas] = useState([]);

  useEffect(() => {
    fetchVendas();
    fetchProdutos();
  }, []);

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
      seteDiasAtras.setDate(hoje.getDate() - 6);

      data.forEach(v => {
        const created = new Date(v.created_at);
        const createdStr = created.toISOString().slice(0, 10);

        if (createdStr === hojeStr) {
          countHoje++;
          totalHoje += Number(v.valor_total || 0);
        }

        if (created >= new Date(seteDiasAtras.toISOString().slice(0, 10))) {
          total7dias += Number(v.valor_total || 0);
        }

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


  async function fetchProdutos() {
    try {
      const res = await fetch(`${API_BASE}/produtos`);
      const produtos = await res.json();

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

  
  function exportCSV() {
    if (!vendas || vendas.length === 0) {
      alert("Sem vendas para exportar");
      return;
    }

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
    if (value.includes(",") || value.includes("\n") || value.includes('"')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  
  function exportPDF() {
    if (!vendas || vendas.length === 0) {
      alert("Sem vendas para exportar");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text("Relatório de Vendas", 14, 14);

    const tableColumn = [
      "ID",
      "Cliente",
      "Status",
      "Valor (R$)",
      "Data",
      "Itens"
    ];

    const tableRows = [];

    vendas.forEach(v => {
      const itemsDesc = (v.items || [])
        .map(it => `${it.nome} x${it.quantidade} (${Number(it.valor_unit).toFixed(2)})`)
        .join(" ; ");

      const row = [
        v.id,
        v.cliente || "",
        v.status || "",
        Number(v.valor_total).toFixed(2),
        new Date(v.created_at).toLocaleString(),
        itemsDesc
      ];

      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 22,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [200, 150, 90] }
    });


    doc.save(`relatorio_vendas_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  
  function printRelatorio() {
    if (!vendas || vendas.length === 0) {
      alert("Sem vendas para imprimir");
      return;
    }

    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) {
      alert("Não foi possível abrir a janela de impressão");
      return;
    }

    const style = `
      <style>
        body{font-family: Arial; padding:20px}
        h1{font-size:18px}
        table{width:100%;border-collapse:collapse;margin-top:12px}
        th,td{border:1px solid #ddd;padding:6px;font-size:12px}
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

    win.document.open();
    win.document.write(`
      <html>
        <head><title>Relatório de Vendas</title>${style}</head>
        <body>
          <h1>Relatório de Vendas — ${new Date().toLocaleDateString()}</h1>
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Cliente</th><th>Status</th><th>Valor</th><th>Data</th><th>Itens</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </body>
      </html>
    `);
    win.document.close();

    setTimeout(() => win.print(), 500);
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  
  const switchTo = (target) => {
    setScreen(target);
    window.scrollTo(0, 0);
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

            
            <div className="card sidemenu" style={{ padding: "20px" }}>
              <div style={{ fontWeight: 800, fontSize: "18px", color: "var(--brown)"}}>
                Visão Geral
              </div>
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
                      <div className="relatorios-content">
                        <div className="relatorios">
                          Relatórios rápidos <br />
                          <small style={{ color: "rgba(0,0,0,0.6)" }}>Exportar / imprimir</small>
                        </div>

                        
                        <div className="relatorios">
                          <button onClick={exportCSV} className="btn-small">Exportar CSV</button>
                          <button onClick={exportPDF} className="btn-small">Exportar PDF</button>
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

      {screen === "orders" && <Orders screen={screen} switchTo={switchTo} />}
      {screen === "stocks" && <Stocks screen={screen} switchTo={switchTo} />}
      {screen === "produtos" && <Produtos screen={screen} switchTo={switchTo} />}
      <Footer />
    </main>
  );
}
