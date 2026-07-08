// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, adminOnly = false }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const admin = JSON.parse(localStorage.getItem("admin"));

  // Se for rota de admin
  if (adminOnly) {
    if (admin && admin.token) return children;
    return <Navigate to="/login" />;
  }

  // Se for rota de cliente
  if (!adminOnly) {
    if (user && user.token) return children;
    return <Navigate to="/login" />;
  }

  return <Navigate to="/login" />; // fallback geral
};

export default PrivateRoute;
