import { NavLink, useNavigate } from "react-router-dom";
import "../style.css";

export default function Header() {
  const navigate = useNavigate();
  const isLogged = localStorage.getItem("token"); // <-- verifica login

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("cargo");
    localStorage.removeItem("user");
    navigate("/login");
  }

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
            Sistema de Gerenciamento
          </div>
        </div>
      </div>

      {/* Só aparece se o usuário estiver logado */}
      {isLogged && (
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
            to="/produtos"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Produtos
          </NavLink>
          <NavLink
            to="/pedidos"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Pedidos
          </NavLink>

          <button
            onClick={handleLogout}
            className="logout-btn"
            style={{
              marginLeft: "20px",
              padding: "3px 12px",
              borderRadius: "6px",
              background: "var(--brown)",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Sair
          </button>
        </nav>
      )}
    </header>
  );
}
