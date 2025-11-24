import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Dashboard from "./componentes/index";
import Orders from "./componentes/pedidos";
import Stocks from "./componentes/estoque";
import Produtos from "./componentes/produtos";
import Login from "./componentes/login";
import Register from "./componentes/register";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Verifica token ao iniciar o app
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <Router>
      <Routes>

        {/* Login deve redirecionar se já estiver logado */}
        <Route
          path="/login"
          element={<Login setIsLoggedIn={setIsLoggedIn} />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Rotas privadas */}
        <Route
          path="/dashboard"
          element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />}
        />

        <Route
          path="/estoque"
          element={isLoggedIn ? <Stocks /> : <Navigate to="/login" />}
        />

        <Route
          path="/produtos"
          element={isLoggedIn ? <Produtos /> : <Navigate to="/login" />}
        />

        <Route
          path="/pedidos"
          element={isLoggedIn ? <Orders /> : <Navigate to="/login" />}
        />

        {/* Rota padrão */}
        <Route
          path="/"
          element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />}
        />

      </Routes>
    </Router>
  );
}
