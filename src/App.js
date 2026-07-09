�import React, { useContext } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// �xR� Páginas principais
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/RegisterClient";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import ShippingPolicy from "./pages/ShippingPolicy";
import ReturnsPolicy from "./pages/ReturnsPolicy";
import FAQ from "./pages/FAQ";
import ProductsList from "./pages/ProductsList";
import OrderTracking from "./pages/OrderTracking";
import VendorStore from "./pages/VendorStore"; // �x�� Public Store Page

// �a"️ Admin
import AdminDashboard from "./pages/AdminDashboard";
import AdminClients from "./pages/AdminClients";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import Settings from "./pages/Settings";
import PromotionProducts from "./pages/PromotionProducts";

import AdminMarketing from "./pages/AdminMarketing";
import AdminVendors from "./pages/AdminVendors"; // �x��

// �x:�️ Segurança e Layouts
import RequireAuth from "./components/RequireAuth";
import AdminLayout from "./layouts/AdminLayout"; // AdminLayout pode ainda usar Antd, mantido por enquanto

// �x� Cliente
import ClientDashboard from "./pages/Client/ClientDashboard";
import MyOrders from "./pages/Client/MyOrders";
import MyFavorites from "./pages/Client/MyFavorites";
import MyProfile from "./pages/Client/MyProfile";
import OrderDetails from "./pages/Client/OrderDetails";

// �xR� Componentes
import ModernHeader from "./components/ModernHeader";
import Footer from "./components/Footer";
import CookieBanner from "./components/CookieBanner";

// �x�� Vendor Dashboard
import VendorLayout from "./layouts/VendorLayout";
import VendorDashboard from "./pages/Vendor/VendorDashboard";
import VendorProducts from "./pages/Vendor/VendorProducts";
import VendorSettings from "./pages/Vendor/VendorSettings";
import VendorOrders from "./pages/Vendor/VendorOrders";
import VendorPromotions from "./pages/Vendor/VendorPromotions";

// �xR� Contextos
import { AuthProvider } from "./context/Authcontext";
import { SettingsContext, SettingsProvider } from "./context/SettingsContext";
import { CartProvider } from "./context/CartContext";
import { HelmetProvider } from 'react-helmet-async';
import { CurrencyProvider } from './context/CurrencyContext';

// Layout Público (Tailwind)
const PublicLayout = ({ children }) => {
  const { settings } = useContext(SettingsContext);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-900 overflow-x-hidden w-full max-w-[100vw]">
      <ModernHeader />
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-6 md:py-8 w-full max-w-[100vw] overflow-x-hidden">
        {children}
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
};

const SettingsLoader = ({ children }) => {
  const { loading } = useContext(SettingsContext);
  if (loading) return <div className="h-screen w-screen bg-white flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  return children;
};



const App = () => {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <SettingsProvider>
          <SettingsLoader>
            <AuthProvider>
              <CurrencyProvider>
                <CartProvider>
                  <Routes>
                    {/* �xR� Páginas públicas */}
                    <Route
                      path="/"
                      element={
                        <PublicLayout>
                          <Home />
                        </PublicLayout>
                      }
                    />

                    <Route
                      path="/products"
                      element={
                        <PublicLayout>
                          <ProductsList />
                        </PublicLayout>
                      }
                    />



                    <Route
                      path="/store/:slug"
                      element={
                        <PublicLayout>
                          <VendorStore />
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
                      path="/privacy-policy"
                      element={
                        <PublicLayout>
                          <PrivacyPolicy />
                        </PublicLayout>
                      }
                    />

                    <Route
                      path="/terms"
                      element={
                        <PublicLayout>
                          <Terms />
                        </PublicLayout>
                      }
                    />

                    <Route
                      path="/shipping"
                      element={
                        <PublicLayout>
                          <ShippingPolicy />
                        </PublicLayout>
                      }
                    />

                    <Route
                      path="/returns"
                      element={
                        <PublicLayout>
                          <ReturnsPolicy />
                        </PublicLayout>
                      }
                    />

                    <Route
                      path="/faq"
                      element={
                        <PublicLayout>
                          <FAQ />
                        </PublicLayout>
                      }
                    />

                    <Route
                      path="/track-order"
                      element={
                        <PublicLayout>
                          <OrderTracking />
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

                    {/* �x� Área do Cliente */}
                    <Route
                      path="/profile"
                      element={
                        <RequireAuth role="client">
                          <PublicLayout>
                            <ClientDashboard />
                          </PublicLayout>
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/profile/orders"
                      element={
                        <RequireAuth role="client">
                          <PublicLayout>
                            <MyOrders />
                          </PublicLayout>
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/profile/favorites"
                      element={
                        <RequireAuth role="client">
                          <PublicLayout>
                            <MyFavorites />
                          </PublicLayout>
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/profile/me"
                      element={
                        <RequireAuth role="client">
                          <PublicLayout>
                            <MyProfile />
                          </PublicLayout>
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/order/:id"
                      element={
                        <RequireAuth role="client">
                          <PublicLayout>
                            <OrderDetails />
                          </PublicLayout>
                        </RequireAuth>
                      }
                    />

                    {/* �x� Dashboard Cliente (Layout Próprio) */}
                    <Route
                      path="/client/dashboard/*"
                      element={
                        <RequireAuth role="client">
                          <ClientDashboard />
                        </RequireAuth>
                      }
                    />

                    {/* �a"️ Área Admin (Layout Separado - Mantido Antd por enquanto/complexidade) */}
                    <Route
                      path="/admin/dashboard"
                      element={
                        <RequireAuth role="admin">
                          <AdminLayout>
                            <AdminDashboard />
                          </AdminLayout>
                        </RequireAuth>
                      }
                    />

                    <Route
                      path="/admin/clients"
                      element={
                        <RequireAuth role="admin">
                          <AdminLayout>
                            <AdminClients />
                          </AdminLayout>
                        </RequireAuth>
                      }
                    />

                    <Route
                      path="/admin/products"
                      element={
                        <RequireAuth role="admin">
                          <AdminLayout>
                            <AdminProducts />
                          </AdminLayout>
                        </RequireAuth>
                      }
                    />

                    <Route
                      path="/admin/products/promotions"
                      element={
                        <RequireAuth role="admin">
                          <AdminLayout>
                            <PromotionProducts />
                          </AdminLayout>
                        </RequireAuth>
                      }
                    />

                    <Route
                      path="/admin/marketing"
                      element={
                        <RequireAuth role="admin">
                          <AdminLayout>
                            <AdminMarketing />
                          </AdminLayout>
                        </RequireAuth>
                      }
                    />

                    <Route
                      path="/admin/orders"
                      element={
                        <RequireAuth role="admin">
                          <AdminLayout>
                            <AdminOrders />
                          </AdminLayout>
                        </RequireAuth>
                      }
                    />

                    <Route
                      path="/admin/settings"
                      element={
                        <RequireAuth role="admin">
                          <AdminLayout>
                            <Settings />
                          </AdminLayout>
                        </RequireAuth>
                      }
                    />

                    <Route
                      path="/admin/vendors"
                      element={
                        <RequireAuth role="admin">
                          <AdminLayout>
                            <AdminVendors />
                          </AdminLayout>
                        </RequireAuth>
                      }
                    />

                    {/* �x�� Vendor Dashboard Routes */}
                    <Route
                      path="/vendor/dashboard"
                      element={
                        <RequireAuth role="vendor">
                          <VendorLayout>
                            <VendorDashboard />
                          </VendorLayout>
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/vendor/dashboard/products"
                      element={
                        <RequireAuth role="vendor">
                          <VendorLayout>
                            <VendorProducts />
                          </VendorLayout>
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/vendor/dashboard/orders"
                      element={
                        <RequireAuth role="vendor">
                          <VendorLayout>
                            <VendorOrders />
                          </VendorLayout>
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/vendor/dashboard/promotions"
                      element={
                        <RequireAuth role="vendor">
                          <VendorLayout>
                            <VendorPromotions />
                          </VendorLayout>
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/vendor/dashboard/profile"
                      element={
                        <RequireAuth role="vendor">
                          <VendorLayout>
                            <VendorSettings />
                          </VendorLayout>
                        </RequireAuth>
                      }
                    />
                  </Routes>
                </CartProvider>
              </CurrencyProvider>
            </AuthProvider>
          </SettingsLoader>
        </SettingsProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
};

export default App;
