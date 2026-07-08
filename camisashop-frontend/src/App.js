import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "antd";

// 🌍 Páginas principais
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/RegisterClient";
import ForgotPassword from "./pages/ForgotPassword"; // Novo
import ResetPassword from "./pages/ResetPassword"; // Novo
import PrivacyPolicy from "./pages/PrivacyPolicy"; // Política de Privacidade

// ⚙️ Admin
import AdminDashboard from "./pages/AdminDashboard";
import AdminClients from "./pages/AdminClients";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import Settings from "./pages/Settings";
import PromotionProducts from "./pages/PromotionProducts";
import AdminMarketing from "./pages/AdminMarketing"; // Importado

// 🛡️ Segurança e Layouts
import RequireAuth from "./components/RequireAuth";
import AdminLayout from "./layouts/AdminLayout";

// 👤 Cliente
import ClientDashboard from "./pages/Client/ClientDashboard";
import MyOrders from "./pages/Client/MyOrders";
import MyFavorites from "./pages/Client/MyFavorites";
import MyProfile from "./pages/Client/MyProfile";
import OrderDetails from "./pages/Client/OrderDetails";

// 🌐 Componentes
import AppHeader from "./components/AppHeader";
import CookieBanner from "./components/CookieBanner";

// 🌍 Contextos
import { AuthProvider } from "./context/Authcontext";
import { SettingsContext, SettingsProvider } from "./context/SettingsContext";
import { CartProvider } from "./context/CartContext";   // <<--- AQUI
import { CookieConsentProvider } from "./context/CookieConsentContext";

const { Content } = Layout;

// Layout Público
const PublicLayout = ({ children }) => {
  const { settings } = useContext(SettingsContext);

  return (
    <Layout>
      <AppHeader />
      <Content
        style={{
          padding: "24px",
          minHeight: "100vh",
          background: settings?.background || "#fff",
        }}
      >
        {children}
      </Content>
    </Layout>
  );
};

const SettingsLoader = ({ children }) => {
  const { loading } = useContext(SettingsContext);
  if (loading) return <div style={{ height: "100vh", background: "#fff" }} />; // Tela branca enquanto carrega
  return children;
};

const App = () => {
  return (
    <SettingsProvider>
      <SettingsLoader>
        <CookieConsentProvider>
          <AuthProvider>
            <CartProvider>
              <BrowserRouter>
                <Routes>
                  {/* 🌍 Páginas públicas */}
                  <Route
                    path="/"
                    element={
                      <PublicLayout>
                        <Home />
                      </PublicLayout>
                    }
                  />

                  <Route
                    path="/cart"
                    element={
                      <PublicLayout>
                        <Cart />
                      </PublicLayout>
                    }
                  />

                  <Route
                    path="/checkout"
                    element={
                      <RequireAuth role="client">
                        <PublicLayout>
                          <Checkout />
                        </PublicLayout>
                      </RequireAuth>
                    }
                  />

                  <Route
                    path="/product/:id"
                    element={
                      <PublicLayout>
                        <ProductDetail />
                      </PublicLayout>
                    }
                  />

                  <Route
                    path="/login"
                    element={
                      <PublicLayout>
                        <Login />
                      </PublicLayout>
                    }
                  />

                  <Route
                    path="/register"
                    element={
                      <PublicLayout>
                        <Register />
                      </PublicLayout>
                    }
                  />

                  <Route
                    path="/forgot-password"
                    element={
                      <PublicLayout>
                        <ForgotPassword />
                      </PublicLayout>
                    }
                  />

                  <Route
                    path="/reset-password/:token"
                    element={
                      <PublicLayout>
                        <ResetPassword />
                      </PublicLayout>
                    }
                  />

                  <Route
                    path="/policy"
                    element={
                      <PublicLayout>
                        <PrivacyPolicy />
                      </PublicLayout>
                    }
                  />

                  <Route
                    path="/promotion/:id"
                    element={
                      <PublicLayout>
                        <PromotionProducts />
                      </PublicLayout>
                    }
                  />

                  {/* 👑 Admin Routes (Protected & Layout-wrapped) */}
                  <Route
                    path="/admin"
                    element={
                      <RequireAuth role="admin">
                        <AdminLayout />
                      </RequireAuth>
                    }
                  >
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="clients" element={<AdminClients />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="marketing" element={<AdminMarketing />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>


                  {/* 👕 Cliente Routes (Protected) */}
                  <Route
                    path="/client/dashboard"
                    element={
                      <RequireAuth role="client">
                        <ClientDashboard />
                      </RequireAuth>
                    }
                  >
                    <Route path="orders" element={<MyOrders />} />
                    <Route path="favorites" element={<MyFavorites />} />
                    <Route path="profile" element={<MyProfile />} />
                    <Route path="order/:id" element={<OrderDetails />} />
                  </Route>

                  {/* 🧭 Fallback */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
                <CookieBanner />
              </BrowserRouter>
            </CartProvider>
          </AuthProvider>
        </CookieConsentProvider>
      </SettingsLoader>
    </SettingsProvider>
  );
};

export default App;
