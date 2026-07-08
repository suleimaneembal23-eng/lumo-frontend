import React, { useEffect, useState, useContext, useCallback, useMemo } from "react";
import {
  Layout, Menu, Avatar, Typography, Button, Table, Modal, Descriptions, Empty, Card, Row, Col, Form, Input, Dropdown, Space, message, Tooltip, Tag as AntdTag, Tabs, Steps, Statistic,
} from "antd";
import {
  HomeOutlined, ShoppingOutlined, HeartOutlined, UserOutlined, LogoutOutlined, MenuUnfoldOutlined, MenuFoldOutlined, EyeOutlined, ReloadOutlined, DeleteOutlined, ShoppingOutlined as ShoppingIcon, HeartTwoTone, CalendarOutlined, CreditCardOutlined, TrophyOutlined, DollarCircleOutlined, RocketOutlined, CheckCircleOutlined, CarOutlined, StopOutlined, ClockCircleOutlined,
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

  // Estilos e Formatação de Moeda
  const rawCurrency = currency?.toUpperCase();
  const adjustedCurrency = rawCurrency === 'FCFA' ? 'XOF' : rawCurrency;
  const currentCurrency = adjustedCurrency || "EUR";
  const currentLocale = settings?.locale || "pt-PT";
  const primaryColor = settings?.primaryColor || "#1890ff";

  const formatPrice = useCallback((price) => {
    try {
      return new Intl.NumberFormat(currentLocale, { style: 'currency', currency: currentCurrency, minimumFractionDigits: 2, }).format(price || 0);
    } catch (e) {
      console.error("Erro de formatação de moeda:", e);
      return `€ ${Number(price || 0).toFixed(2)}`;
    }
  }, [currentLocale, currentCurrency]);

  const OrderTag = ({ status }) => {
    const statusMap = {
      pending: { color: "gold", text: "PENDENTE" }, paid: { color: "green", text: "PAGO" },
      shipped: { color: "blue", text: "ENVIADO" }, cancelled: { color: "red", text: "CANCELADO" },
    };
    const { color, text } = statusMap[status] || { color: "default", text: status?.toUpperCase() };
    return <AntdTag color={color}>{text}</AntdTag>;
  };

  // --- Funções de Fetch ---
  const fetchProfile = useCallback(async (id) => {
    try {
      let res = await fetch(`http://localhost:5000/api/clients/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) res = await fetch("http://localhost:5000/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });

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
      const res = await fetch("http://localhost:5000/api/orders/user", { headers: { Authorization: `Bearer ${token}` } });
      setOrders(res.ok ? await res.json() : []);
    } catch (err) { console.error("Erro ao buscar pedidos:", err); setOrders([]); }
    finally { setLoadingOrders(false); }
  }, [token]);

  const fetchFavorites = useCallback(async () => {
    setLoadingFavs(true);
    try {
      const res = await fetch("http://localhost:5000/api/favorites", { headers: { Authorization: `Bearer ${token}` } });
      setFavorites(res.ok ? await res.json() : []);
    } catch (err) { console.error("Erro ao buscar favoritos:", err); setFavorites([]); }
    finally { setLoadingFavs(false); }
  }, [token]);

  const fetchPromotions = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/marketing/promotions");
      if (res.ok) {
        const allPromos = await res.json();
        const activePromos = allPromos.filter(p => p.active && !p.isNewUserCoupon);
        // Prioriza Daily Deal, senão pega a primeira
        const bestPromo = activePromos.find(p => p.isDailyDeal) || activePromos[0];
        setPromoBanner(bestPromo);
      }
    } catch (err) {
      console.error("Erro ao buscar promoções:", err);
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

  // --- Funções de Ação ---
  const handleSaveProfile = async (values) => {
    setSavingProfile(true);
    try {
      const id = JSON.parse(localStorage.getItem("user"))?.id || JSON.parse(localStorage.getItem("user"))?._id || profile?._id || profile?.id;
      if (!id) throw new Error("ID do usuário não encontrado");

      const body = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        addressLine1: values.addressLine1,
        city: values.city,
        country: values.country
      };
      const res = await fetch(`http://localhost:5000/api/clients/${id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body), });

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
      if (!id) throw new Error("Usuário não identificado.");

      const res = await fetch(`http://localhost:5000/api/clients/${id}/change-password`, {
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
    if (!token) return message.warning("Faça login para remover favoritos");
    const originalFavorites = favorites;
    setFavorites(prev => prev.filter(p => p._id !== productId));
    try {
      const res = await fetch(`http://localhost:5000/api/favorites/${productId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { setFavorites(originalFavorites); throw new Error("Erro ao remover favorito"); }
      message.success("Removido dos favoritos");
    } catch (err) { console.error(err); message.error(err.message || "Erro ao remover favorito"); setFavorites(originalFavorites); }
  };

  const handleFavAddToCart = (product) => {
    if (!product || !product._id || !product.inStock) return message.warning(product.inStock ? "Detalhes do produto indisponíveis." : "Produto esgotado.");

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
    message.success("Sessão encerrada com sucesso!");
    navigate("/");
  };

  // --- Colunas da Tabela e Elementos de UI ---
  const columns = useMemo(() => ([
    { title: "ID", dataIndex: "_id", key: "_id", render: (id) => (id ? id.slice(-6).toUpperCase() : "—") },
    { title: "Data", dataIndex: "createdAt", key: "createdAt", render: (d) => new Date(d).toLocaleString() },
    { title: "Total", dataIndex: "totalPrice", key: "totalPrice", render: (v) => formatPrice(v) },
    {
      title: "Status", dataIndex: "status", key: "status",
      filters: [{ text: "Pendente", value: "pending" }, { text: "Pago", value: "paid" }, { text: "Enviado", value: "shipped" }, { text: "Cancelado", value: "cancelled" }],
      onFilter: (value, record) => record.status === value,
      render: (s) => <OrderTag status={s} />,
    },
    {
      title: "Ações", key: "actions",
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
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      {/* SIDEBAR */}
      <Sider
        collapsible collapsed={collapsed} onCollapse={setCollapsed} width={220}
        style={{ background: "linear-gradient(180deg, #001529 0%, #003a7d 100%)", position: "fixed", height: "100vh", left: 0, top: 0, bottom: 0, boxShadow: "2px 0 6px rgba(0,0,0,0.08)", zIndex: 10, }}
      >
        <div style={{ color: "white", textAlign: "center", padding: 20, fontWeight: 700 }}>{collapsed ? "🏷️" : "Minha Conta"}</div>
        <Menu
          theme="dark" mode="inline" selectedKeys={[selectedKey]}
          onClick={({ key }) => (key === "logout" ? handleLogout() : navigate(`/client/dashboard${key === "home" ? "" : `/${key}`}`))}
          items={[
            { key: "home", icon: <HomeOutlined />, label: "Início" },
            { key: "orders", icon: <ShoppingOutlined />, label: "Meus Pedidos" },
            { key: "favorites", icon: <HeartOutlined />, label: "Favoritos" },
            { key: "profile", icon: <UserOutlined />, label: "Perfil" },
            { key: "logout", icon: <LogoutOutlined />, label: "Sair" },
          ]}
          style={{ marginTop: 8 }}
        />
      </Sider>

      {/* MAIN */}
      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: "margin-left 0.25s" }}>
        <Header
          style={{ background: "#fff", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.04)", position: "sticky", top: 0, zIndex: 5, }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} style={{ fontSize: 18 }} />
            <Title level={4} style={{ margin: 0 }}>Painel do Cliente</Title>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Button type="default" icon={<HomeOutlined />} onClick={() => navigate("/")}>Voltar à Loja</Button>
            <AvatarDropdown userName={userName || (profile && profile.name)} handleLogout={handleLogout} navigate={navigate} />
          </div>
        </Header>

        <Content style={{ padding: 24 }}>
          <div style={{ background: "#fff", padding: 24, borderRadius: 12, boxShadow: "0 4px 18px rgba(0,0,0,0.03)" }}>

            {/* INÍCIO (HOME) */}
            {selectedKey === "home" && (
              <>
                {/* HEADER DA HOME */}
                <div style={{ marginBottom: 32 }}>
                  <Title level={2} style={{ color: '#001529', marginBottom: 0 }}>Olá, {userName || profile?.name || "Cliente"}!</Title>
                  <Text type="secondary" style={{ fontSize: 16 }}>Aqui está o resumo da sua experiência conosco.</Text>
                </div>

                {/* ACTIVE ORDER TRACKER */}
                {(() => {
                  // Encontra o último pedido ativo (não entregue e não cancelado)
                  const activeOrder = orders.find(o => ['pending', 'paid', 'confirmed', 'shipped'].includes(o.status));

                  if (activeOrder) {
                    const stepMap = { 'pending': 0, 'paid': 1, 'confirmed': 1, 'shipped': 2, 'delivered': 3 };
                    const currentStep = stepMap[activeOrder.status] || 0;

                    return (
                      <Card title={<Space><RocketOutlined style={{ color: primaryColor }} /> <Text strong>Rastreio do Pedido #{activeOrder._id.slice(-6).toUpperCase()}</Text></Space>}
                        style={{ borderRadius: 12, marginBottom: 32, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                        extra={<Button type="link" onClick={() => handleViewOrder(activeOrder)}>Ver Detalhes</Button>}
                      >
                        <Steps current={currentStep} size="small" labelPlacement="vertical">
                          <Steps.Step title="Pendente" icon={<ClockCircleOutlined />} />
                          <Steps.Step title="Confirmado/Pago" icon={<CheckCircleOutlined />} />
                          <Steps.Step title="Enviado" icon={<CarOutlined />} />
                          <Steps.Step title="Entregue" icon={<HomeOutlined />} />
                        </Steps>
                        {activeOrder.status === 'pending' && (
                          <div style={{ marginTop: 16, padding: 12, background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 6 }}>
                            <Text type="warning" strong>⚠️ Pagamento Pendente:</Text> <Text>Seu pedido aguarda confirmação de pagamento.</Text>
                          </div>
                        )}
                      </Card>
                    );
                  }
                  return null;
                })()}

                {/* STATS ROW */}
                <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                  <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ background: '#e6f7ff', borderRadius: 12, textAlign: 'center' }}>
                      <Statistic title="Total de Pedidos" value={orders.length} prefix={<ShoppingIcon />} valueStyle={{ color: '#1890ff', fontWeight: 'bold' }} />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ background: '#f6ffed', borderRadius: 12, textAlign: 'center' }}>
                      <Statistic title="Total Gasto" value={orders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0)} precision={2} prefix={currency === 'BRL' ? 'R$' : '€'} valueStyle={{ color: '#52c41a', fontWeight: 'bold' }} />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ background: '#fff0f6', borderRadius: 12, textAlign: 'center' }}>
                      <Statistic title="Favoritos" value={favorites.length} prefix={<HeartOutlined />} valueStyle={{ color: '#eb2f96', fontWeight: 'bold' }} />
                    </Card>
                  </Col>
                </Row>

                {/* BANNER PROMOCIONAL (REAL OU GENÉRICO) */}
                {/* BANNER PROMOCIONAL (REAL OU GENÉRICO) */}
                {promoBanner ? (
                  <Card
                    style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #003a7d 100%)`, borderRadius: 16, marginBottom: 24, border: 'none' }}
                    bodyStyle={{ padding: '20px 24px', color: 'white' }}
                  >
                    <Row align="middle" justify="space-between" gutter={[16, 16]}>
                      <Col xs={24} md={16}>
                        <div style={{ textAlign: 'left' }}>
                          <Title level={4} style={{ color: 'white', marginBottom: 4, marginTop: 0 }}>🔥 {promoBanner.title || "Oferta Especial!"}</Title>
                          <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 14 }}>
                            {promoBanner.description || (promoBanner.isDailyDeal
                              ? `Desconto de ${Math.abs(promoBanner.discount).toFixed(0)}% já aplicado!`
                              : `Use o cupom ${promoBanner.code} e ganhe ${Math.abs(promoBanner.discount).toFixed(0)}% de desconto!`)}
                          </Text>
                        </div>
                      </Col>
                      <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                        <Space>
                          {!promoBanner.isDailyDeal && (
                            <Button size="middle" style={{ borderRadius: 20, fontWeight: 'bold', color: primaryColor }} onClick={() => {
                              navigator.clipboard.writeText(promoBanner.code);
                              message.success("Cupom copiado!");
                            }}>
                              Copiar
                            </Button>
                          )}
                          <Button type="primary" size="middle" ghost style={{ borderRadius: 20, fontWeight: 'bold' }} onClick={() => navigate("/")}>
                            {promoBanner.isDailyDeal ? "Aproveitar" : "Comprar"}
                          </Button>
                        </Space>
                      </Col>
                    </Row>
                  </Card>
                ) : (
                  <Card
                    style={{ background: `linear-gradient(135deg, #52c41a 0%, #135200 100%)`, borderRadius: 16, marginBottom: 24, border: 'none' }}
                    bodyStyle={{ padding: '20px 24px', color: 'white' }}
                  >
                    <Row align="middle" justify="space-between" gutter={[16, 16]}>
                      <Col xs={24} md={16}>
                        <div style={{ textAlign: 'left' }}>
                          <Title level={4} style={{ color: 'white', marginBottom: 4, marginTop: 0 }}>
                            Bem-vindo{settings?.siteName ? ` à ${settings.siteName}` : ''}!
                          </Title>
                          <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 14 }}>
                            Confira as últimas novidades em camisas de futebol.
                          </Text>
                        </div>
                      </Col>
                      <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                        <Button size="middle" style={{ borderRadius: 20, fontWeight: 'bold', color: '#52c41a' }} onClick={() => navigate("/")}>
                          Ver Coleção
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                )}

                {/* RECENT ORDERS (MINI LIST) */}
                <Title level={4}>Últimas Atualizações</Title>
                <Row gutter={[16, 16]}>
                  {latestOrders.length > 0 ? latestOrders.map((o) => (
                    <Col xs={24} sm={12} md={8} key={o._id}>
                      <Card hoverable size="small" style={{ borderRadius: 8, borderColor: '#eee' }} onClick={() => handleViewOrder(o)}>
                        <Space direction="vertical" style={{ width: '100%' }} size={0}>
                          <Row justify="space-between">
                            <Text strong>#{o._id.slice(-6).toUpperCase()}</Text>
                            <OrderTag status={o.status} />
                          </Row>
                          <Text type="secondary" style={{ fontSize: 12 }}>{new Date(o.createdAt).toLocaleDateString()}</Text>
                        </Space>
                      </Card>
                    </Col>
                  )) : <Col span={24}><Text type="secondary">Nenhum pedido recente.</Text></Col>}
                </Row>
              </>
            )}

            {/* MEUS PEDIDOS */}
            {selectedKey === "orders" && (
              <>
                <Title level={4}>Meus Pedidos</Title>
                {orders.length === 0 ? (
                  <Empty description="Ainda não tens pedidos." style={{ marginTop: 40 }} />
                ) : (
                  <Row gutter={[16, 16]}>
                    {orders.map((order) => (
                      <Col xs={24} key={order._id}>
                        <Card
                          hoverable
                          style={{ borderRadius: 12, border: "1px solid #f0f0f0" }}
                          bodyStyle={{ padding: 24 }}
                        >
                          <Row align="middle" gutter={[16, 16]}>
                            <Col xs={24} md={6}>
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <Text strong style={{ fontSize: 16 }}>#{order._id.slice(-6).toUpperCase()}</Text>
                                <Text type="secondary"><CalendarOutlined /> {new Date(order.createdAt).toLocaleDateString()}</Text>
                              </div>
                            </Col>
                            <Col xs={24} md={6}>
                              <Text strong style={{ fontSize: 18, color: primaryColor }}>{formatPrice(order.totalPrice)}</Text>
                              <div style={{ marginTop: 4 }}><OrderTag status={order.status} /></div>
                            </Col>
                            <Col xs={24} md={6}>
                              <div style={{ display: "flex", gap: 8 }}>
                                {order.items.slice(0, 3).map((item, idx) => (
                                  <Avatar
                                    key={idx}
                                    shape="square"
                                    size={48}
                                    src={item.image || item.productId?.image} // Fallback seguro
                                    icon={<ShoppingIcon />}
                                    style={{ backgroundColor: "#f5f5f5" }}
                                  />
                                ))}
                                {order.items.length > 3 && (
                                  <Avatar shape="square" size={48} style={{ backgroundColor: "#fafafa", color: "#999" }}>+{order.items.length - 3}</Avatar>
                                )}
                              </div>
                            </Col>
                            <Col xs={24} md={6} style={{ textAlign: "right" }}>
                              <Space>
                                <Button onClick={() => handleViewOrder(order)}>Detalhes</Button>
                                <Button type="primary" ghost icon={<ReloadOutlined />} onClick={() => handleReorder(order)}>Recomprar</Button>
                              </Space>
                            </Col>
                          </Row>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </>
            )}

            {/* FAVORITOS */}
            {selectedKey === "favorites" && (
              <>
                <Title level={4} style={{ marginBottom: 40, color: primaryColor }}><HeartTwoTone twoToneColor={primaryColor} style={{ marginRight: 10 }} /> Meus Favoritos</Title>
                {loadingFavs ? (
                  <div style={{ height: "50vh", display: "flex", justifyContent: "center", alignItems: "center" }}><Text>Carregando favoritos...</Text></div>
                ) : favorites.length === 0 ? (
                  <Empty
                    image={<ShoppingIcon style={{ fontSize: 60, color: primaryColor }} />}
                    description={<><Text strong style={{ fontSize: 18, color: '#595959' }}>Sua lista de desejos está vazia!</Text><Text style={{ display: 'block', marginTop: 8 }}>Explore nossos produtos e adicione aqueles que você mais gosta.</Text></>}
                  >
                    <Button type="primary" size="large" onClick={() => navigate("/")} style={{ fontWeight: 'bold' }}>Começar a Comprar</Button>
                  </Empty>
                ) : (
                  <Row gutter={[24, 24]}>
                    {favorites.map((product) => (
                      <Col key={product._id} xs={24} sm={12} md={8} lg={6}>
                        <Card
                          hoverable onClick={() => navigate(`/product/${product._id}`)}
                          style={{ borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)", border: "1px solid #e8e8e8", transition: "all 0.3s ease", height: "100%", }}
                          cover={
                            <div style={{ position: 'relative' }}>
                              <img alt={product.name} src={product.image} style={{ height: 200, objectFit: "cover", width: "100%", borderRadius: "12px 12px 0 0" }} />
                              <Tooltip title="Remover dos favoritos">
                                <Button
                                  type="primary" danger icon={<DeleteOutlined />} shape="circle" size="small"
                                  onClick={(e) => { e.stopPropagation(); handleRemoveFavorite(product._id); }}
                                  style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, backgroundColor: primaryColor, border: 'none', opacity: 0.8, }}
                                />
                              </Tooltip>
                            </div>
                          }
                          bodyStyle={{ padding: 16, flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                        >
                          <div style={{ marginBottom: 16, minHeight: 60 }}>
                            <Title level={5} ellipsis={{ rows: 2 }} style={{ marginBottom: 4, color: '#262626' }}>{product.name}</Title>
                            <Text type="secondary" style={{ display: 'block', fontSize: '0.9em' }}>{product.category || "Sem Categoria"}</Text>
                          </div>
                          <div style={{ marginTop: 'auto' }}>
                            <Text style={{ fontSize: 22, color: primaryColor, fontWeight: 800, display: 'block', marginBottom: 12 }}>{formatPrice(product.price)}</Text>
                            <Row gutter={8}>
                              <Col span={14}><Button type="primary" icon={<EyeOutlined />} block style={{ borderRadius: 8, fontWeight: "bold" }} onClick={() => navigate(`/product/${product._id}`)}>Ver</Button></Col>
                              <Col span={10}><Button type="default" icon={<ShoppingIcon />} block style={{ borderRadius: 8 }} onClick={(e) => { e.stopPropagation(); handleFavAddToCart(product); }}>Comprar</Button></Col>
                            </Row>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </>
            )}

            {/* PERFIL (COM ABAS) */}
            {selectedKey === "profile" && (
              <>
                <Title level={4}>Gestão do Perfil</Title>
                <Tabs defaultActiveKey="info" style={{ marginTop: 20 }}>
                  <Tabs.TabPane tab="Informações e Endereço" key="info">
                    <Form layout="vertical" form={profileForm} onFinish={handleSaveProfile} initialValues={profile} style={{ maxWidth: 600 }}>
                      <Form.Item label="Nome" name="name" rules={[{ required: true, message: "Insira o nome" }]}><Input /></Form.Item>
                      <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}><Input /></Form.Item>
                      <Form.Item label="Telefone" name="phone"><Input /></Form.Item>
                      <Form.Item label="Endereço" name="addressLine1"><Input placeholder="Rua, nº..." /></Form.Item>
                      <Form.Item label="Cidade" name="city"><Input /></Form.Item>
                      <Form.Item label="País" name="country"><Input /></Form.Item>
                      <Form.Item><Button type="primary" htmlType="submit" loading={savingProfile}>Salvar Informações</Button></Form.Item>
                    </Form>
                  </Tabs.TabPane>

                  <Tabs.TabPane tab="Segurança" key="security">
                    <Form layout="vertical" form={passwordForm} onFinish={handlePasswordChange} style={{ maxWidth: 400 }}>
                      <Title level={5}>Alterar Senha</Title>
                      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>Mantenha sua conta segura alterando sua senha periodicamente.</Text>
                      <Form.Item label="Senha Atual" name="currentPassword" rules={[{ required: true, message: "Insira a senha atual" }]}><Input.Password /></Form.Item>
                      <Form.Item label="Nova Senha" name="newPassword" rules={[{ required: true, min: 6, message: "A senha deve ter pelo menos 6 caracteres" }]}><Input.Password /></Form.Item>
                      <Form.Item
                        label="Confirmar Nova Senha" name="confirmNewPassword" dependencies={['newPassword']}
                        rules={[{ required: true, message: "Confirme a nova senha" }, ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                            return Promise.reject(new Error('As senhas não coincidem!'));
                          },
                        }),
                        ]}
                      >
                        <Input.Password />
                      </Form.Item>
                      <Form.Item><Button type="primary" danger htmlType="submit" loading={loadingPassword}>Atualizar Senha</Button></Form.Item>
                    </Form>
                  </Tabs.TabPane>

                  <Tabs.TabPane tab="Pagamento" key="payment">
                    <Title level={5}>Métodos de Pagamento</Title>
                    <Card style={{ marginTop: 16, background: '#f9f9f9', borderRadius: 8 }}>
                      <Row align="middle" justify="space-between">
                        <Col>
                          <Space>
                            <CreditCardOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                            <Text strong>Visa terminando em 4242</Text>
                            <AntdTag color="green">Principal</AntdTag>
                          </Space>
                        </Col>
                        <Col><Button type="link" danger>Remover</Button></Col>
                      </Row>
                    </Card>
                    <Button type="dashed" icon={<CreditCardOutlined />} style={{ marginTop: 20 }} block>Adicionar Novo Cartão</Button>
                  </Tabs.TabPane>

                  <Tabs.TabPane tab="Notificações" key="notifications">
                    <Title level={5}>Preferências de Comunicação</Title>
                    <Form layout="vertical" style={{ maxWidth: 400 }}>
                      <Form.Item name="newsletter" valuePropName="checked" initialValue={true}>
                        <label><input type="checkbox" style={{ marginRight: 8 }} /><Text>Receber a Newsletter semanal por e-mail.</Text></label>
                      </Form.Item>
                      <Form.Item name="stockAlerts" valuePropName="checked" initialValue={false}>
                        <label><input type="checkbox" style={{ marginRight: 8 }} /><Text>Receber alertas de volta ao estoque (Back in Stock).</Text></label>
                      </Form.Item>
                      <Form.Item name="orderUpdates" valuePropName="checked" initialValue={true}>
                        <label><input type="checkbox" style={{ marginRight: 8 }} /><Text>Receber atualizações de status de pedidos (Obrigatório).</Text></label>
                      </Form.Item>
                      <Form.Item><Button type="primary">Salvar Preferências</Button></Form.Item>
                    </Form>
                  </Tabs.TabPane>
                </Tabs>
              </>
            )}
          </div>
        </Content>
      </Layout>

      {/* MODAL DE PEDIDO */}
      <Modal
        visible={orderModalVisible}
        title={`Pedido ${selectedOrder?._id?.slice(-6).toUpperCase()}`}
        onCancel={() => setOrderModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedOrder && (
          <Descriptions column={1} layout="vertical" bordered>
            <Descriptions.Item label="ID">{selectedOrder._id}</Descriptions.Item>
            <Descriptions.Item label="Data">{new Date(selectedOrder.createdAt).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Total">{formatPrice(selectedOrder.totalPrice)}</Descriptions.Item>
            <Descriptions.Item label="Status"><OrderTag status={selectedOrder.status} /></Descriptions.Item>
            <Descriptions.Item label="Itens">
              {selectedOrder.items?.map((it) => (
                <div key={it._id} style={{ display: 'flex', alignItems: 'center', marginBottom: 12, padding: 8, border: '1px solid #eee', borderRadius: 8 }}>
                  <Avatar shape="square" size={50} src={it.image || it.productId?.image} icon={<ShoppingIcon />} style={{ backgroundColor: '#f5f5f5' }} />
                  <div style={{ marginLeft: 12, flex: 1 }}>
                    <Text strong style={{ display: 'block' }}>{it.name}</Text>
                    <Text type="secondary">Qtd: {it.quantity || 1} | Tam: {it.size || "Único"}</Text>
                  </div>
                  <Text strong>{formatPrice((it.price || 0) * (it.quantity || 1))}</Text>
                </div>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="Endereço de Entrega">
              {selectedOrder.shippingAddress?.line1 || "N/A"}, {selectedOrder.shippingAddress?.city || ""} - {selectedOrder.shippingAddress?.country || ""}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Layout>
  );
};

export default ClientDashboard;