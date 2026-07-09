import React, { useState, useContext, useEffect } from "react";
import { Layout, Menu, Dropdown, Button, message } from "antd";
import {
    AppstoreOutlined,
    UserOutlined,
    LogoutOutlined,
    HomeOutlined,
    SettingOutlined,
    GiftOutlined,
    DownOutlined,
    BarChartOutlined,
    ShopOutlined, // �x��
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/Authcontext";


const { Header, Sider, Content } = Layout;

const AdminLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useContext(AuthContext);
    const adminName = "Admin";
    const [lastOrderWebId, setLastOrderWebId] = useState(null);

    // �x POLLING DE NOVOS PEDIDOS (A cada 30 segundos)
    useEffect(() => {
        const checkNewOrders = async () => {
            try {
                const token = localStorage.getItem("adminToken");
                if (!token) return;

                // Busca apenas 1 pedido mais recente para verificar ID
                const res = await fetch(`/api/orders?limit=1`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();

                if (data && data.length > 0) {
                    const latestOrder = data[0];
                    const latestOrderId = latestOrder._id;

                    // Se temos um ID anterior e o novo é diferente, é um novo pedido!
                    if (lastOrderWebId && latestOrderId !== lastOrderWebId) {
                        const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg"); // Som sutil
                        audio.play().catch(e => console.log("Audio play blocked"));

                        // Notificação Visual
                        const notification = require("antd").notification;
                        notification.open({
                            message: "�x Novo Pedido Recebido!",
                            description: `Cliente: ${latestOrder.shippingAddress?.fullName || 'Cliente'} - ${Math.round(latestOrder.totalPrice).toLocaleString('de-DE')} FCFA`,
                            icon: <GiftOutlined style={{ color: "#108ee9" }} />,
                            onClick: () => {
                                navigate("/admin/orders");
                            },
                        });
                    }

                    // Atualiza o ID de referência
                    setLastOrderWebId(latestOrderId);
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        };

        // Primeira verificação imediata para setar o ID inicial
        checkNewOrders();

        const interval = setInterval(checkNewOrders, 30000); // 30 segundos
        return () => clearInterval(interval);
    }, [lastOrderWebId, navigate]);

    const handleLogout = () => {
        logout();
        message.success("Logout realizado com sucesso");
        navigate("/login");
    };

    const profileMenu = (
        <Menu>
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
                Logout
            </Menu.Item>
        </Menu>
    );

    const getSelectedKey = () => {
        const path = location.pathname;
        if (path.includes("/admin/products")) return "products";
        if (path.includes("/admin/clients")) return "clients";
        if (path.includes("/admin/orders")) return "orders";
        if (path.includes("/admin/marketing")) return "marketing";
        if (path.includes("/admin/settings")) return "settings";
        if (path.includes("/admin/settings")) return "settings";
        if (path.includes("/admin/vendors")) return "vendors";
        return "dashboard";
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
                <div
                    style={{
                        padding: 16,
                        textAlign: "center",
                        cursor: "pointer",
                        height: 64,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(255,255,255,0.1)",
                        margin: 16,
                        borderRadius: 6
                    }}
                    onClick={() => navigate("/admin/dashboard")}
                >
                    {!collapsed ? <span style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>ADMINISTRADOR</span> : <span style={{ color: "white", fontWeight: "bold" }}>ADM</span>}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[getSelectedKey()]}
                >
                    <Menu.Item key="dashboard" icon={<HomeOutlined />} onClick={() => navigate("/admin/dashboard")}>
                        Dashboard
                    </Menu.Item>
                    <Menu.Item key="products" icon={<AppstoreOutlined />} onClick={() => navigate("/admin/products")}>
                        Produtos
                    </Menu.Item>
                    <Menu.Item key="orders" icon={<BarChartOutlined />} onClick={() => navigate("/admin/orders")}>
                        Pedidos
                    </Menu.Item>
                    <Menu.Item key="clients" icon={<UserOutlined />} onClick={() => navigate("/admin/clients")}>
                        Clientes
                    </Menu.Item>
                    <Menu.Item key="marketing" icon={<GiftOutlined />} onClick={() => navigate("/admin/marketing")}>
                        Marketing
                    </Menu.Item>
                    <Menu.Item key="settings" icon={<SettingOutlined />} onClick={() => navigate("/admin/settings")}>
                        Sistema
                    </Menu.Item>
                    <Menu.Item key="vendors" icon={<ShopOutlined />} onClick={() => navigate("/admin/vendors")}>
                        Colaboradores
                    </Menu.Item>
                </Menu>
            </Sider>

            <Layout>
                <Header
                    style={{
                        background: "#fff",
                        padding: "0 24px",
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        boxShadow: "0 1px 4px rgba(0,21,41,0.08)",
                        zIndex: 1
                    }}
                >
                    <Dropdown overlay={profileMenu} placement="bottomRight">
                        <Button
                            style={{ border: "none" }}
                        >
                            <UserOutlined style={{ marginRight: 8 }} /> {adminName} <DownOutlined />
                        </Button>
                    </Dropdown>
                </Header>

                <Content style={{ margin: "24px 16px", padding: 24, minHeight: 280 }}>
                    {children}
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
