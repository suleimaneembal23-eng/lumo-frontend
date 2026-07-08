import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [admin, setAdmin] = useState(() => {
    const savedAdmin = localStorage.getItem("admin");
    return savedAdmin ? JSON.parse(savedAdmin) : null;
  });

  // Login de cliente - CORRIGIDO: Agora guarda o ID também
  const loginUser = ({ id, name, email, token }) => {
    const userData = { id, name, email, token };
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Login de admin - CORRIGIDO: Agora guarda o ID também
  const loginAdmin = ({ id, name, email, token }) => {
    const adminData = { id, name, email, token };
    setAdmin(adminData);
    localStorage.setItem("admin", JSON.stringify(adminData));
  };

  // Logout geral
  const logout = () => {
    setUser(null);
    setAdmin(null);
    localStorage.removeItem("user");
    localStorage.removeItem("admin");
    localStorage.removeItem("userToken");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
  };

  // Inicializa estado a partir do localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedAdmin = localStorage.getItem("admin");
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedAdmin) setAdmin(JSON.parse(savedAdmin));
  }, []);

  return (
    <AuthContext.Provider value={{ user, admin, loginUser, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};