import { NavLink, useNavigate } from "react-router-dom";
import "../header.css"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";



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
          <FontAwesomeIcon
              size="lg"
              icon={fas.faChartLine}
              style={{ marginBottom: "1px" }}
            />
            Dashboard
          </NavLink>
          <NavLink to="/estoque" className="link">
          <FontAwesomeIcon
              size="lg"
              icon={fas.faTags}
              style={{ marginBottom: "1px" }}
            />
            Estoque
          </NavLink>
          <NavLink to="/produtos" className="link">
          <FontAwesomeIcon
              size="lg"
              icon={fas.faBoxOpen}
              style={{ marginBottom: "1px" }}
            />
            Produtos
          </NavLink>
          <NavLink to="/pedidos" className="link">
          <FontAwesomeIcon
              size="lg"
              icon={fas.faCartShopping}
              style={{ marginBottom: "1px" }}
            />
            Pedidos
          </NavLink>

          <button onClick={handleLogout} className="logout-btn">
           <FontAwesomeIcon
              size="lg"
              icon={fas.faRightFromBracket}
              style={{ marginBottom: "1px" }}
            />
          </button>
        </nav>
      )}
    </header>
  );
}
