import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/Authcontext";
import { Spin } from "antd";

const RequireAuth = ({ children, role = "client" }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  const adminToken = localStorage.getItem("adminToken");

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }}><Spin size="large" /></div>;
  }

  // Verificação para Admin
  if (role === "admin") {
    if (!adminToken) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
  }

  // Verificação para Cliente
  if (!user && !localStorage.getItem("token")) {
     return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;
