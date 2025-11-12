import { NavLink } from "react-router-dom";
import "../style.css";

export default function Header() {
  return (
    <header>
      <div className="brand">
        <div className="logo">
          <img src="logo.png" alt="imagem" />
        </div>

        <div>
          <div
            style={{
              fontWeight: 800,
              fontSize: "18px",
              color: "var(--brown)",
            }}
          >
            Sorvetrix
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "rgba(107,63,63,0.7)",
            }}
          >
            Sistema de Gerenciamento — mockups
          </div>
        </div>
      </div>

      <nav id="nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/estoque"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Estoque
        </NavLink>
        <NavLink
          to="/sabores"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Sabores
        </NavLink>
        <NavLink
          to="/pedidos"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Pedidos
        </NavLink>
      </nav>
    </header>
  );
}
