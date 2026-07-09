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

  // Login de cliente - CORRIGIDO: Agora guarda o ID, ROLE e VENDORINFO também
  const loginUser = ({ id, name, email, token, role, vendorInfo }) => {
    const userData = { id, name, email, token, role, vendorInfo };
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Login de admin - CORRIGIDO: Agora guarda o ID e ROLE também
  const loginAdmin = ({ id, name, email, token, role }) => {
    const adminData = { id, name, email, token, role };
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

  // Wrapper para persistir atualizações manuais do user
  const updateUser = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("user");
    }
  };

  return (
    <AuthContext.Provider value={{ user, admin, loginUser, loginAdmin, logout, setUser: updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
