import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "./componentes/header";
import Dashboard from "./componentes/index";
import Orders from "./componentes/pedidos";
import Stocks from "./componentes/estoque";
import Produtos from "./componentes/produtos";
import Login from "./componentes/login";
import Register from "./componentes/register";


export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  // Atualiza automaticamente se o token mudar (ex: login ou logout)
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <Router>
      {isLoggedIn && <Header />}
      <Routes>
       
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rotas privadas */}
        {isLoggedIn ? (
          <>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/estoque" element={<Stocks />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/pedidos" element={<Orders />} />
          </>
        ) : (
          <Route path="/" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
}


