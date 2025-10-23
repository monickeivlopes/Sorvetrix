import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./componentes/login";
import Register from "./componentes/register";
import Dashboard from "./componentes/";
import Orders from "./componentes/orders";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </Router>
  );
}

export default App;
