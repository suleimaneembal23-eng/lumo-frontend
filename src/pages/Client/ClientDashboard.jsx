import React, { useEffect, useState, useContext, useCallback, useMemo } from "react";
import {
  Layout, Menu, Avatar, Typography, Button, Table, Modal, Descriptions, Empty, Card, Row, Col, Form, Input, Dropdown, Space, message, Tooltip, Tag as AntdTag, Tabs, Steps, Statistic,
} from "antd";
import {
  HomeOutlined, ShoppingOutlined, HeartOutlined, UserOutlined, LogoutOutlined, MenuUnfoldOutlined, MenuFoldOutlined, EyeOutlined, ReloadOutlined, DeleteOutlined, ShoppingOutlined as ShoppingIcon, HeartTwoTone, CalendarOutlined, CreditCardOutlined, TrophyOutlined, DollarCircleOutlined, RocketOutlined, CheckCircleOutlined, CarOutlined, StopOutlined, ClockCircleOutlined, LockOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

import { AuthContext } from "../../context/Authcontext";
import { SettingsContext } from "../../context/SettingsContext";

const { Header, Sider, Content } = Layout;
const { Title, Text, Meta } = Typography;

const ClientDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout: contextLogout, user: authUser } = useContext(AuthContext || {});
  const { settings, currency } = useContext(SettingsContext);

  const pathParts = location.pathname.split("/");
  const lastPart = pathParts.pop() || "home";
  const selectedKey = (lastPart === "dashboard" || lastPart === "client") ? "home" : lastPart;

  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState("");
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingFavs, setLoadingFavs] = useState(false);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm(); // novo form para senha
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Promotion State
  const [promoBanner, setPromoBanner] = useState(null);

  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const token = localStorage.getItem("userToken") || localStorage.getItem("token") || "";

  // Estilos e FormataÃ§Ã£o de Moeda
  const rawCurrency = currency?.toUpperCase();
  const adjustedCurrency = rawCurrency === 'FCFA' ? 'XOF' : rawCurrency;
  const currentCurrency = adjustedCurrency || "EUR";
  const currentLocale = settings?.locale || "pt-PT";
  const primaryColor = settings?.primaryColor || "#1890ff";

  const formatPrice = useCallback((price) => {
    try {
      const rounded = Math.round(Number(price || 0));
      return `${rounded.toLocaleString('de-DE')} FCFA`;
    } catch (e) {
      return `${Math.round(Number(price || 0)).toLocaleString('de-DE')} FCFA`;
    }
  }, []);

  const OrderTag = ({ status }) => {
    const statusMap = {
      pending: { color: "gold", text: "PENDENTE" }, paid: { color: "green", text: "PAGO" },
      shipped: { color: "blue", text: "ENVIADO" }, cancelled: { color: "red", text: "CANCELADO" },
    };
    const { color, text } = statusMap[status] || { color: "default", text: status?.toUpperCase() };
    return <AntdTag color={color}>{text}</AntdTag>;
  };

  // --- FunÃ§Ãµes de Fetch ---
  const fetchProfile = useCallback(async (id) => {
    try {
      let res = await fetch(`/api/clients/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) res = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        profileForm.setFieldsValue({
          name: data.name, email: data.email, phone: data.phone || "",
          addressLine1: data.address?.line1 || "", city: data.address?.city || "", country: data.address?.country || "",
        });
      }
    } catch (err) { console.error("Erro ao buscar perfil:", err); }
  }, [token, profileForm]);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/orders/user`, { headers: { Authorization: `Bearer ${token}` } });
      let data = res.ok ? await res.json() : [];
      // Mapear shopOrders para order.items caso o backend jÃ¡ use o novo formato
      if (Array.isArray(data)) {
        data = data.map(o => {
          if (!o.items && o.shopOrders) {
            o.items = o.shopOrders.reduce((acc, shopOrder) => acc.concat(shopOrder.items || []), []);
          }
          o.items = o.items || [];
          return o;
        });
      }
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Erro ao buscar pedidos:", err); setOrders([]); }
    finally { setLoadingOrders(false); }
  }, [token]);

  const fetchFavorites = useCallback(async () => {
    setLoadingFavs(true);
    try {
      const res = await fetch(`/api/favorites`, { headers: { Authorization: `Bearer ${token}` } });
      setFavorites(res.ok ? await res.json() : []);
    } catch (err) { console.error("Erro ao buscar favoritos:", err); setFavorites([]); }
    finally { setLoadingFavs(false); }
  }, [token]);

  const fetchPromotions = useCallback(async () => {
    try {
      const res = await fetch("/api/marketing/promotions");
      if (res.ok) {
        const allPromos = await res.json();
        const activePromos = allPromos.filter(p => p.active && !p.isNewUserCoupon);
        // Prioriza Daily Deal, senÃ£o pega a primeira
        const bestPromo = activePromos.find(p => p.isDailyDeal) || activePromos[0];
        setPromoBanner(bestPromo);
      }
    } catch (err) {
      console.error("Erro ao buscar promoÃ§Ãµes:", err);
    }
  }, []);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user")) || authUser || null;
    if (u?.name) setUserName(u.name);
    if (u?.id || u?._id) fetchProfile(u.id || u._id);
    fetchOrders();
    fetchFavorites();
    fetchOrders();
    fetchFavorites();
    fetchPromotions();
  }, [authUser, fetchProfile, fetchOrders, fetchFavorites, fetchPromotions]);

  // --- FunÃ§Ãµes de AÃ§Ã£o ---
  const handleSaveProfile = async (values) => {
    setSavingProfile(true);
    try {
      const id = JSON.parse(localStorage.getItem("user"))?.id || JSON.parse(localStorage.getItem("user"))?._id || profile?._id || profile?.id;
      if (!id) throw new Error("ID do usuÃ¡rio nÃ£o encontrado");

      const body = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        addressLine1: values.addressLine1,
        city: values.city,
        country: values.country
      };
      const res = await fetch(`/api/clients/${id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body), });

      if (!res.ok) throw new Error("Erro ao atualizar perfil");

      const updated = await res.json();
      setProfile(updated);
      const stored = JSON.parse(localStorage.getItem("user")) || {};
      localStorage.setItem("user", JSON.stringify({ ...stored, name: updated.name || stored.name }));

      message.success("Perfil atualizado com sucesso!");
    } catch (err) {
      console.error(err);
      message.error(err.message || "Erro ao atualizar perfil");
    } finally { setSavingProfile(false); }
  };

  const handlePasswordChange = async (values) => {
    setLoadingPassword(true);
    try {
      const id = authUser?.id || authUser?._id || profile?._id;
      if (!id) throw new Error("UsuÃ¡rio nÃ£o identificado.");

      const res = await fetch(`/api/clients/${id}/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao alterar senha");

      message.success("Senha alterada com sucesso!");
      passwordForm.resetFields();
    } catch (err) {
      console.error(err);
      message.error(err.message);
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleReorder = (order) => {
    try {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      order.items.forEach((it) => cart.push({ ...it, quantity: it.quantity || 1, _id: it.productId || it._id }));
      localStorage.setItem("cart", JSON.stringify(cart));
      message.success("Itens adicionados ao carrinho! Redirecionando para checkout...");
      navigate("/checkout");
    } catch (err) { console.error(err); message.error("Erro ao adicionar ao carrinho"); }
  };

  const handleRemoveFavorite = async (productId) => {
    if (!token) return message.warning("FaÃ§a login para remover favoritos");
    const originalFavorites = favorites;
    setFavorites(prev => prev.filter(p => p._id !== productId));
    try {
      const res = await fetch(`/api/favorites/${productId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { setFavorites(originalFavorites); throw new Error("Erro ao remover favorito"); }
      message.success("Removido dos favoritos");
    } catch (err) { console.error(err); message.error(err.message || "Erro ao remover favorito"); setFavorites(originalFavorites); }
  };

  const handleAddToFavorite = async (productOrId) => {
    if (!token) return message.warning("FaÃ§a login para adicionar favoritos");
    const productId = productOrId._id || productOrId.productId?._id || productOrId;

    // Optimistic UI
    if (!favorites.find(f => f._id === productId)) {
      // Mock add for UI response
    }

    try {
      const res = await fetch(`/api/favorites/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Erro ao adicionar favorito");
      message.success("Adicionado aos favoritos!");
      fetchFavorites();
    } catch (err) {
      console.error(err);
      message.error("Erro ao adicionar favorio");
    }
  };

  const handleFavAddToCart = (product) => {
    if (!product || !product._id || !product.inStock) return message.warning(product.inStock ? "Detalhes do produto indisponÃ­veis." : "Produto esgotado.");

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const productId = product._id;
    const existingItemIndex = cart.findIndex(item => item._id === productId);

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + 1;
      message.success(`Quantidade de ${product.name} incrementada no carrinho!`);
    } else {
      cart.push({ ...product, quantity: 1, _id: productId });
      message.success(`${product.name} adicionado ao carrinho!`);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
  };

  const handleLogout = () => {
    if (typeof contextLogout === "function") contextLogout();
    else { localStorage.removeItem("userToken"); localStorage.removeItem("user"); }
    message.success("SessÃ£o encerrada com sucesso!");
    navigate("/");
  };

  // --- Colunas da Tabela e Elementos de UI ---
  const columns = useMemo(() => ([
    { title: "ID", dataIndex: "_id", key: "_id", render: (id) => (id ? id.slice(-6).toUpperCase() : "â€”") },
    { title: "Data", dataIndex: "createdAt", key: "createdAt", render: (d) => new Date(d).toLocaleString() },
    { title: "Total", dataIndex: "totalPrice", key: "totalPrice", render: (v) => formatPrice(v) },
    {
      title: "Status", dataIndex: "status", key: "status",
      filters: [{ text: "Pendente", value: "pending" }, { text: "Pago", value: "paid" }, { text: "Enviado", value: "shipped" }, { text: "Cancelado", value: "cancelled" }],
      onFilter: (value, record) => record.status === value,
      render: (s) => <OrderTag status={s} />,
    },
    {
      title: "AÃ§Ãµes", key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => { setSelectedOrder(record); setOrderModalVisible(true); }}>Ver detalhes</Button>
          <Button icon={<ReloadOutlined />} onClick={() => handleReorder(record)}>Recomprar</Button>
        </Space>
      ),
    },
  ]), [formatPrice]);

  const AvatarDropdown = ({ userName, handleLogout, navigate }) => (
    <Dropdown
      overlay={<Menu items={[{ key: "profile", icon: <UserOutlined />, label: "Perfil", onClick: () => navigate("/client/dashboard/profile") }, { key: "divider", type: "divider" }, { key: "logout", icon: <LogoutOutlined />, label: "Sair", onClick: handleLogout }]} />}
      placement="bottomRight" trigger={['click']}
    >
      <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
        <Avatar style={{ backgroundColor: primaryColor, marginRight: 8 }} icon={<UserOutlined />} />
        <span style={{ fontWeight: 'bold' }}>{userName || "Cliente"}</span>
      </div>
    </Dropdown>
  );

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const shippedOrdersCount = orders.filter(o => o.status === 'shipped').length;
  const latestOrders = orders.slice(0, 3);
  const latestFavorites = favorites.slice(0, 4);
  const handleViewOrder = (order) => { setSelectedOrder(order); setOrderModalVisible(true); };

  return (
    <Layout style={{ minHeight: "100vh", background: "#F8F9FB" }}>
      {/* SIDEBAR PREMIUM */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={260}
        trigger={null}
        style={{
          background: "#fff",
          position: "fixed",
          height: "100vh",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 20,
          borderRight: "1px solid #f0f0f0",
        }}
        className="shadow-xl shadow-gray-200/50"
      >
        <div className="flex items-center justify-center py-8">
          <div className="bg-black text-white p-2 rounded-xl mr-2">
            <RocketOutlined style={{ fontSize: 20 }} />
          </div>
          {!collapsed && <span className="text-xl font-bold tracking-tight text-gray-900">Lumo</span>}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          style={{ borderRight: 0, padding: "0 12px" }}
          onClick={({ key }) => (key === "logout" ? handleLogout() : navigate(`/client/dashboard${key === "home" ? "" : `/${key}`}`))}
          items={[
            {
              key: "home",
              icon: <HomeOutlined style={{ fontSize: 18 }} />,
              label: "VisÃ£o Geral",
              style: { marginBottom: 8, borderRadius: 12, fontWeight: 600 }
            },
            {
              key: "orders",
              icon: <ShoppingIcon style={{ fontSize: 18 }} />,
              label: "Meus Pedidos",
              style: { marginBottom: 8, borderRadius: 12, fontWeight: 600 }
            },
            {
              key: "favorites",
              icon: <HeartOutlined style={{ fontSize: 18 }} />,
              label: "Lista de Desejos",
              style: { marginBottom: 8, borderRadius: 12, fontWeight: 600 }
            },
            {
              key: "profile",
              icon: <UserOutlined style={{ fontSize: 18 }} />,
              label: "Minha Conta",
              style: { marginBottom: 8, borderRadius: 12, fontWeight: 600 }
            },
          ]}

        />

        <div className="absolute bottom-8 left-0 w-full px-6">
          <div className={`bg-gray-50 rounded-2xl p-4 border border-gray-100 ${collapsed ? 'hidden' : 'block'}`}>
            <div className="flex items-center gap-3 mb-3">
              <Avatar size="small" icon={<UserOutlined />} src={profile?.avatar} style={{ backgroundColor: "#000" }} />
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-sm text-gray-900 truncate">{userName || "Cliente"}</span>
                <span className="text-xs text-gray-500 truncate">{profile?.email}</span>
              </div>
            </div>
            <Button
              danger
              ghost
              block
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{ borderRadius: 10, border: "1px solid #ffccc7", color: "#ff4d4f" }}
            >
              Sair
            </Button>
          </div>
          {collapsed && (
            <Button
              danger
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className="mx-auto block"
            />
          )}
        </div>
      </Sider>

      {/* MAIN CONTENT WRAPPER */}
      <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: "margin-left 0.3s ease" }}>
        {/* HEADER MODERNO */}
        <Header
          className="bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8 py-4 border-b border-gray-100"
          style={{ height: 'auto', background: 'rgba(255,255,255,0.85)' }}
        >
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 18 }}
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900 m-0 leading-tight">Painel do Cliente</h2>
              <p className="text-gray-400 text-xs m-0">Gerencie suas compras e dados</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              type="primary"
              shape="round"
              icon={<ShoppingIcon />}
              onClick={() => navigate("/")}
              className="bg-black hover:bg-gray-800 border-none px-6 h-10 font-bold"
            >
              Ir para Loja
            </Button>
            <AvatarDropdown userName={userName || (profile && profile.name)} handleLogout={handleLogout} navigate={navigate} />
          </div>
        </Header>

        <Content className="p-8">
          <div className="max-w-7xl mx-auto min-h-[85vh]">

            {/* ðŸ  INÃCIO (DASHBOARD) */}
            {selectedKey === "home" && (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-extrabold text-gray-800 m-0">Bem-vindo de volta, {userName?.split(' ')[0]}! ðŸ‘‹</h1>
                  <p className="text-gray-500 mt-1">Aqui estÃ¡ o que estÃ¡ acontecendo com sua conta hoje.</p>
                </div>

                {/* BANNER DE PROMOÃ‡ÃƒO / BOAS VINDAS */}
                {promoBanner ? (
                  <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-violet-600 to-indigo-700 text-white shadow-xl shadow-indigo-200 mb-10 transform transition hover:scale-[1.01] duration-300">
                    <div className="absolute top-0 right-0 p-12 opacity-10 transform rotate-12 scale-150 pointer-events-none">
                      <RocketOutlined style={{ fontSize: 150 }} />
                    </div>
                    <div className="p-10 md:flex items-center justify-between relative z-10">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <AntdTag color="gold" className="border-none px-3 py-1 text-sm font-bold rounded-full">
                            {promoBanner.isDailyDeal ? "OFERTA DO DIA" : "CUPOM ESPECIAL"}
                          </AntdTag>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-2">{promoBanner.title || "Oferta Especial"}</h2>
                        <p className="text-indigo-100 text-lg max-w-xl">
                          {promoBanner.description || (promoBanner.isDailyDeal
                            ? `Desconto de ${Math.abs(promoBanner.discount).toFixed(0)}% ativado!`
                            : `Use o cÃ³digo e ganhe ${Math.abs(promoBanner.discount).toFixed(0)}% OFF!`)}
                        </p>
                        {!promoBanner.isDailyDeal && (
                          <div className="mt-6 flex items-center gap-3 bg-white/10 w-fit p-2 rounded-2xl backdrop-blur-sm border border-white/20">
                            <span className="font-mono text-xl font-bold tracking-wider px-4">{promoBanner.code}</span>
                            <Button type="primary" shape="round" onClick={() => { navigator.clipboard.writeText(promoBanner.code); message.success("Copiado!"); }}>
                              Copiar
                            </Button>
                          </div>
                        )}
                      </div>
                      <Button
                        size="large"
                        className="mt-6 md:mt-0 bg-white text-indigo-700 border-none font-bold h-14 px-8 rounded-2xl shadow-lg hover:bg-gray-50"
                        onClick={() => navigate("/")}
                      >
                        {promoBanner.isDailyDeal ? "Comprar Agora" : "Usar Cupom"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2rem] p-10 text-white mb-10 shadow-lg relative overflow-hidden">
                    <div className="relative z-10 flex justify-between items-center">
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Nova ColeÃ§Ã£o DisponÃ­vel</h2>
                        <p className="text-gray-300">Descubra os lanÃ§amentos exclusivos desta temporada.</p>
                      </div>
                      <Button type="primary" size="large" className="bg-white text-black border-none font-bold rounded-xl" onClick={() => navigate("/")}>
                        Explorar Loja
                      </Button>
                    </div>
                  </div>
                )}

                {/* KPI CARDS MODERNOS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <div className="bg-white p-6 rounded-[1.5rem] shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 hover:border-gray-200 transition-all group">
                    <div className="flex justify-between items-center mb-4">
                      <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                        <ShoppingIcon style={{ fontSize: 24 }} />
                      </div>
                      <span className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full">Total</span>
                    </div>
                    <div className="text-4xl font-black text-gray-900 mb-1">{orders.length}</div>
                    <div className="text-gray-500 font-medium">Pedidos Realizados</div>
                  </div>

                  <div className="bg-white p-6 rounded-[1.5rem] shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 hover:border-gray-200 transition-all group">
                    <div className="flex justify-between items-center mb-4">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                        <DollarCircleOutlined style={{ fontSize: 24 }} />
                      </div>
                    </div>
                    <div className="text-4xl font-black text-gray-900 mb-1">
                      {formatPrice(orders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0))}
                    </div>
                    <div className="text-gray-500 font-medium">Investimento em Produtos</div>
                  </div>

                  <div className="bg-white p-6 rounded-[1.5rem] shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 hover:border-gray-200 transition-all group cursor-pointer" onClick={() => navigate('/client/dashboard/favorites')}>
                    <div className="flex justify-between items-center mb-4">
                      <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                        <HeartOutlined style={{ fontSize: 24 }} />
                      </div>
                      <span className="bg-rose-100 text-rose-600 text-xs font-bold px-3 py-1 rounded-full">Ver todos</span>
                    </div>
                    <div className="text-4xl font-black text-gray-900 mb-1">{favorites.length}</div>
                    <div className="text-gray-500 font-medium">Itens na Lista de Desejos</div>
                  </div>
                </div>

                {/* TRACKING E HISTÃ“RICO RECENTE */}
                <Row gutter={24}>
                  <Col span={24}>
                    <div className="bg-white rounded-[2rem] p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 h-full">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 m-0">Pedidos Recentes</h3>
                        <Button type="link" onClick={() => navigate('/client/dashboard/orders')}>Ver Todos</Button>
                      </div>

                      {latestOrders.length > 0 ? (
                        <div className="flex flex-col gap-4">
                          {latestOrders.map(order => (
                            <div key={order._id} className="group flex flex-col md:flex-row items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all cursor-pointer" onClick={() => handleViewOrder(order)}>
                              <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="bg-gray-50 p-3 rounded-xl">
                                  <ShoppingIcon className="text-xl text-gray-400" />
                                </div>
                                <div>
                                  <span className="block font-bold text-gray-900">Pedido #{order._id.slice(-6).toUpperCase()}</span>
                                  <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()} â€¢ {order.items.length} itens</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between w-full md:w-auto mt-4 md:mt-0 gap-6">
                                <div className="font-bold text-gray-900">{formatPrice(order.totalPrice)}</div>
                                <OrderTag status={order.status} />
                                <div className="text-gray-300 md:block hidden"><EyeOutlined /></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Empty description="Nenhum pedido recente" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                      )}
                    </div>
                  </Col>
                </Row>
              </>
            )}

            {/* ðŸ“¦ MEUS PEDIDOS */}
            {selectedKey === "orders" && (
              <>
                <div className="mb-8 flex justify-between items-end">
                  <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 m-0">Meus Pedidos</h1>
                    <p className="text-gray-500 mt-2">Acompanhe e gerencie todas as suas compras.</p>
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-white rounded-[2rem] p-16 text-center border border-dashed border-gray-200">
                    <ShoppingIcon style={{ fontSize: 64, color: '#e5e7eb', marginBottom: 24 }} />
                    <h3 className="text-xl font-bold text-gray-900">VocÃª ainda nÃ£o fez compras</h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">Explore nossa coleÃ§Ã£o e encontre os produtos das suas marcas favoritas hoje mesmo.</p>
                    <Button type="primary" size="large" className="bg-black border-none rounded-xl h-12 px-8" onClick={() => navigate('/')}>
                      ComeÃ§ar a Comprar
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {orders.map((order) => (
                      <div key={order._id} className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row justify-between pb-6 border-b border-gray-100 mb-6 gap-4">
                          <div className="flex gap-4">
                            <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center font-bold text-gray-400">
                              #{order._id.slice(-4).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-lg text-gray-900">Pedido #{order._id.slice(-6).toUpperCase()}</span>
                                <OrderTag status={order.status} />
                              </div>
                              <span className="text-gray-500 text-sm">Realizado em {new Date(order.createdAt).toLocaleDateString()} Ã s {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="block text-sm text-gray-500">Total do Pedido</span>
                            <span className="block text-2xl font-black text-gray-900">{formatPrice(order.totalPrice)}</span>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                          <div className="flex-1">
                            <div className="flex -space-x-3 overflow-hidden py-2 mb-3">
                              {order.items.slice(0, 5).map((item, idx) => (
                                <Tooltip title={item.name} key={idx}>
                                  <Avatar
                                    size={56}
                                    src={item.image || item.productId?.image}
                                    className="border-4 border-white shadow-sm cursor-pointer hover:z-10 hover:scale-110 transition-transform bg-gray-100"
                                  />
                                </Tooltip>
                              ))}
                              {order.items.length > 5 && (
                                <div className="h-14 w-14 rounded-full bg-gray-100 border-4 border-white flex items-center justify-center text-gray-500 font-bold text-sm">
                                  +{order.items.length - 5}
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="font-semibold">{order.items.length} {order.items.length === 1 ? 'item' : 'itens'}:</span>{' '}
                              {order.items.slice(0, 2).map(item => item.name).join(', ')}
                              {order.items.length > 2 && ` e mais ${order.items.length - 2}`}
                            </div>
                          </div>

                          <div className="flex gap-3 w-full md:w-auto">
                            <Button className="flex-1 md:flex-none rounded-xl h-10 font-medium" onClick={() => handleViewOrder(order)}>
                              Ver Detalhes
                            </Button>
                            <Button
                              type="primary"
                              className="flex-1 md:flex-none bg-black border-none rounded-xl h-10 font-medium"
                              icon={<ReloadOutlined />}
                              onClick={() => handleReorder(order)}
                            >
                              Comprar Novamente
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* â¤ï¸ FAVORITOS */}
            {selectedKey === "favorites" && (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-extrabold text-gray-900 m-0">Lista de Desejos</h1>
                  <p className="text-gray-500 mt-2">Guarde para mais tarde os itens que vocÃª amou.</p>
                </div>

                {loadingFavs ? (
                  <div className="h-60 flex items-center justify-center"><Text>Carregando favoritos...</Text></div>
                ) : favorites.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100">
                    <HeartTwoTone twoToneColor="#eb2f96" style={{ fontSize: 60, marginBottom: 20 }} />
                    <h3 className="text-xl font-bold">Sua lista estÃ¡ vazia</h3>
                    <Button type="primary" className="mt-6 rounded-xl bg-black border-none h-12 px-8" onClick={() => navigate('/')}>Ir para a Loja</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {favorites.map((product) => (
                      <div key={product._id} className="group bg-white rounded-[1.5rem] border border-gray-100 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 relative">
                        <div className="absolute top-4 right-4 z-10">
                          <Button
                            shape="circle"
                            danger
                            icon={<DeleteOutlined />}
                            className="bg-white/90 backdrop-blur border-none shadow-sm hover:bg-red-50"
                            onClick={(e) => { e.stopPropagation(); handleRemoveFavorite(product._id); }}
                          />
                        </div>
                        <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${product._id}`)}>
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="p-5">
                          <div className="mb-3">
                            <h3 className="font-bold text-gray-900 truncate" title={product.name}>{product.name}</h3>
                            <p className="text-gray-500 text-sm">{product.category || "Produto"}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-black text-lg text-gray-900">{formatPrice(product.price)}</span>
                            <Button
                              type="primary"
                              shape="circle"
                              icon={<ShoppingIcon />}
                              className="bg-black hover:bg-gray-800 border-none shadow-lg"
                              onClick={(e) => { e.stopPropagation(); handleFavAddToCart(product); }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ðŸ‘¤ PERFIL */}
            {selectedKey === "profile" && (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-extrabold text-gray-900 m-0">Meu Perfil</h1>
                  <p className="text-gray-500 mt-2">Gerencie seus dados pessoais, endereÃ§os e seguranÃ§a.</p>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 min-h-[500px]">
                  <Tabs
                    defaultActiveKey="info"
                    tabPosition="left"
                    size="large"
                    className="profile-tabs"
                    items={[
                      {
                        label: <span className="flex items-center gap-2"><UserOutlined /> Dados Pessoais</span>,
                        key: 'info',
                        children: (
                          <div className="max-w-xl pl-8 py-2">
                            <h3 className="text-xl font-bold mb-6">InformaÃ§Ãµes BÃ¡sicas</h3>
                            <Form layout="vertical" form={profileForm} onFinish={handleSaveProfile} initialValues={profile} size="large">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Form.Item label="Nome Completo" name="name" rules={[{ required: true }]} className="md:col-span-2">
                                  <Input className="rounded-xl" />
                                </Form.Item>
                                <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}>
                                  <Input className="rounded-xl" />
                                </Form.Item>
                                <Form.Item label="Telefone" name="phone">
                                  <Input className="rounded-xl" />
                                </Form.Item>
                              </div>

                              <h3 className="text-xl font-bold mt-8 mb-6">EndereÃ§o de Entrega</h3>
                              <Form.Item label="EndereÃ§o (Rua, NÃºmero, Comp.)" name="addressLine1">
                                <Input className="rounded-xl" />
                              </Form.Item>
                              <div className="grid grid-cols-2 gap-4">
                                <Form.Item label="Cidade" name="city">
                                  <Input className="rounded-xl" />
                                </Form.Item>
                                <Form.Item label="PaÃ­s" name="country">
                                  <Input className="rounded-xl" />
                                </Form.Item>
                              </div>

                              <Form.Item className="mt-4">
                                <Button type="primary" htmlType="submit" loading={savingProfile} className="bg-black h-12 px-8 rounded-xl font-bold border-none">
                                  Salvar AlteraÃ§Ãµes
                                </Button>
                              </Form.Item>
                            </Form>
                          </div>
                        )
                      },
                      {
                        label: <span className="flex items-center gap-2"><LockOutlined /> SeguranÃ§a</span>,
                        key: 'security',
                        children: (
                          <div className="max-w-md pl-8 py-2">
                            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 mb-8">
                              <h4 className="font-bold text-orange-800 mb-2">Proteja sua conta</h4>
                              <p className="text-orange-700 text-sm">Use uma senha forte e nÃ£o a compartilhe com ninguÃ©m.</p>
                            </div>

                            <Form layout="vertical" form={passwordForm} onFinish={handlePasswordChange} size="large">
                              <Form.Item label="Senha Atual" name="currentPassword" rules={[{ required: true }]}>
                                <Input.Password className="rounded-xl" />
                              </Form.Item>
                              <Form.Item label="Nova Senha" name="newPassword" rules={[{ required: true, min: 6 }]}>
                                <Input.Password className="rounded-xl" />
                              </Form.Item>
                              <Form.Item
                                label="Confirmar Nova Senha" name="confirmNewPassword"
                                dependencies={['newPassword']}
                                rules={[{ required: true }, ({ getFieldValue }) => ({
                                  validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                                    return Promise.reject(new Error('As senhas nÃ£o coincidem!'));
                                  },
                                })]}
                              >
                                <Input.Password className="rounded-xl" />
                              </Form.Item>
                              <Form.Item className="mt-4">
                                <Button type="primary" danger htmlType="submit" loading={loadingPassword} className="h-12 px-8 rounded-xl font-bold">
                                  Atualizar Senha
                                </Button>
                              </Form.Item>
                            </Form>
                          </div>
                        )
                      }
                    ]}
                  />
                </div>
              </>
            )}

          </div>
        </Content>
      </Layout>

      {/* MODAL DE DETALHES DO PEDIDO PREMIUM */}
      <Modal
        visible={orderModalVisible}
        title={null}
        onCancel={() => setOrderModalVisible(false)}
        footer={null}
        width={800}
        centered
        closeIcon={<span className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors">âœ•</span>}
      >
        {selectedOrder && (
          <div className="p-4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900 m-0">Pedido #{selectedOrder._id.slice(-6).toUpperCase()}</h2>
                <p className="text-gray-500 m-0">Detalhes completos da transaÃ§Ã£o</p>
              </div>
              <OrderTag status={selectedOrder.status} />
            </div>

            {/* CARD DE PAGAMENTO (Novo) */}
            {(selectedOrder.status === 'pending' && (selectedOrder.paymentMethod === 'mbway' || selectedOrder.paymentMethod === 'transfer')) && (
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg mb-8 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <ClockCircleOutlined /> A aguardar pagamento
                  </h3>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <p className="text-blue-100 text-sm mb-1 uppercase tracking-wider font-bold">
                      {selectedOrder.paymentMethod === 'mbway' ? 'Enviar para MB WAY' : 'IBAN para TransferÃªncia'}
                    </p>
                    <p className="text-2xl font-mono font-black tracking-widest mb-4">
                      {selectedOrder.paymentMethod === 'mbway'
                        ? (settings?.paymentConfig?.mbWayNumber || "NÃ£o configurado")
                        : (settings?.paymentConfig?.bankTransferInfo || "NÃ£o configurado")}
                    </p>

                    <div className="flex justify-between items-end border-t border-white/10 pt-4">
                      <div>
                        <p className="text-blue-100 text-xs mb-0">Valor a Pagar</p>
                        <p className="text-xl font-bold">{formatPrice(selectedOrder.totalPrice)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-100 text-xs mb-0">ReferÃªncia / DescriÃ§Ã£o</p>
                        <p className="font-mono font-bold bg-white/20 px-2 py-1 rounded text-sm">Pedido #{selectedOrder._id.slice(-6).toUpperCase()}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-blue-200 text-xs mt-4 text-center">
                    ApÃ³s o pagamento, o status serÃ¡ atualizado em atÃ© 24h.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <span className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Data</span>
                <span className="font-bold text-gray-900">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                <span className="block text-gray-500 text-sm">{new Date(selectedOrder.createdAt).toLocaleTimeString()}</span>
              </div>
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <span className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Total Pago</span>
                <span className="font-bold text-gray-900 text-xl">{formatPrice(selectedOrder.totalPrice)}</span>
              </div>
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <span className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Destino</span>
                <span className="font-bold text-gray-900 line-clamp-1">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.country}</span>
                <span className="block text-gray-500 text-sm">{selectedOrder.shippingAddress?.line1}</span>
              </div>
            </div>

            <h3 className="font-bold text-gray-900 mb-4 ml-1">Itens do Pedido ({selectedOrder.items?.length})</h3>
            <div className="border border-gray-100 rounded-2xl overflow-hidden mb-8">
              {selectedOrder.items?.map((it, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 border-b border-gray-50 last:border-none hover:bg-gray-50 transition-colors">
                  <div className="h-16 w-16 rounded-xl bg-gray-100 p-1 flex-shrink-0">
                    <img src={it.image || it.productId?.image} className="w-full h-full object-cover rounded-lg" alt="" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 m-0">{it.name}</h4>
                    <p className="text-gray-500 text-xs m-0">Tamanho: {it.size || "U"} | Qtd: {it.quantity}</p>
                    {/* PersonalizaÃ§Ã£o */}
                    {(it.customization?.name || it.customization?.number || it.customization?.hasBadge) && (
                      <div className="text-xs text-gray-500 bg-gray-50 p-1 rounded mt-1 inline-block">
                        {(it.customization.name || it.customization.number) && (
                          <span className="font-bold mr-2">
                            {it.customization.name} {it.customization.number}
                          </span>
                        )}
                        {it.customization.hasBadge && (
                          <span className="text-blue-600 font-bold">+ Patch</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right font-bold text-gray-900">
                    {formatPrice((it.price || 0) * (it.quantity || 1))}
                    <div className="mt-1">
                      <Tooltip title="Adicionar aos Favoritos">
                        <Button
                          type="text"
                          icon={<HeartOutlined />}
                          className="text-gray-400 hover:text-rose-500"
                          onClick={() => handleAddToFavorite(it.productId)}
                        />
                      </Tooltip>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-right">
              <Button type="primary" size="large" icon={<ReloadOutlined />} onClick={() => { setOrderModalVisible(false); handleReorder(selectedOrder); }} className="bg-black border-none rounded-xl h-12 px-8 font-bold">
                Comprar Novamente
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default ClientDashboard;
