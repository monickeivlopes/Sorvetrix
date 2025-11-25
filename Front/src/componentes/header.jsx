import { NavLink, useNavigate } from "react-router-dom";
import "../header.css"; // <-- CSS separado

export default function Header() {
  const navigate = useNavigate();
  const isLogged = localStorage.getItem("token"); 

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("cargo");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <header className="header">
      <div className="brand">
        <NavLink to="/dashboard" className="logo">
          <img src="logo.png" alt="imagem" />
        </NavLink>

        <div className="title-box">
          <div className="title-main">Sorvetrix</div>
          <div className="title-sub">Sistema de Gerenciamento</div>
        </div>
      </div>

      {isLogged && (
        <nav className="nav">
          <NavLink to="/dashboard" className="link">
            Dashboard
          </NavLink>
          <NavLink to="/estoque" className="link">
            Estoque
          </NavLink>
          <NavLink to="/produtos" className="link">
            Produtos
          </NavLink>
          <NavLink to="/pedidos" className="link">
            Pedidos
          </NavLink>

          <button onClick={handleLogout} className="logout-btn">
            Sair
          </button>
        </nav>
      )}
    </header>
  );
}
