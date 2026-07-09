�import React, { useState, useContext } from "react";
import { Layout, Menu, Dropdown, Button, message, Avatar } from "antd";
import {
    HomeOutlined,
    ShoppingOutlined,
    OrderedListOutlined,
    LogoutOutlined,
    UserOutlined,
    DownOutlined,
    SettingOutlined,
    PercentageOutlined
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/Authcontext";

const { Header, Sider, Content } = Layout;

const VendorLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useContext(AuthContext);

    const handleLogout = () => {
        logout();
        message.success("Logout realizado com sucesso");
        navigate("/login");
    };

    const profileMenu = (
        <Menu>
            <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => navigate("/vendor/dashboard/profile")}>
                Meu Perfil
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
                Sair
            </Menu.Item>
        </Menu>
    );

    const getSelectedKey = () => {
        const path = location.pathname;
        if (path.includes("/vendor/dashboard/products")) return "products";
        if (path.includes("/vendor/dashboard/promotions")) return "promotions";
        if (path.includes("/vendor/dashboard/orders")) return "orders";
        if (path.includes("/vendor/dashboard/profile")) return "profile";
        return "dashboard";
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="light" className="shadow-md z-10">
                <div className="h-16 flex items-center justify-center m-4 bg-blue-600 rounded-xl shadow-blue-200 shadow-lg cursor-pointer transition-all hover:bg-blue-700" onClick={() => navigate("/vendor/dashboard")}>
                    {!collapsed ? (
                        <span className="text-white font-bold text-lg tracking-wide">PARCEIROS</span>
                    ) : (
                        <span className="text-white font-bold text-xl">P</span>
                    )}
                </div>

                <Menu
                    theme="light"
                    mode="inline"
                    selectedKeys={[getSelectedKey()]}
                    className="border-r-0"
                >
                    <Menu.Item key="dashboard" icon={<HomeOutlined />} onClick={() => navigate("/vendor/dashboard")}>
                        Resumo
                    </Menu.Item>
                    <Menu.Item key="products" icon={<ShoppingOutlined />} onClick={() => navigate("/vendor/dashboard/products")}>
                        Meus Produtos
                    </Menu.Item>
                    <Menu.Item key="promotions" icon={<PercentageOutlined />} onClick={() => navigate("/vendor/dashboard/promotions")}>
                        Promoções Vip
                    </Menu.Item>
                    <Menu.Item key="orders" icon={<OrderedListOutlined />} onClick={() => navigate("/vendor/dashboard/orders")}>
                        Meus Pedidos
                    </Menu.Item>
                    <Menu.Item key="profile" icon={<SettingOutlined />} onClick={() => navigate("/vendor/dashboard/profile")}>
                        Configurações da Loja
                    </Menu.Item>
                </Menu>
            </Sider>

            <Layout className="site-layout">
                <Header className="bg-white px-6 flex justify-between items-center shadow-sm z-1 bg-opacity-80 backdrop-blur-md sticky top-0">
                    <h2 className="text-lg font-bold text-gray-700 m-0">
                        {getSelectedKey() === 'dashboard' && 'Visão Geral'}
                        {getSelectedKey() === 'products' && 'Gerenciar Produtos'}
                        {getSelectedKey() === 'promotions' && 'Motor de Promoções'}
                        {getSelectedKey() === 'orders' && 'Pedidos Recebidos'}
                        {getSelectedKey() === 'profile' && 'Minha Loja'}
                    </h2>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end mr-2 hidden md:flex">
                            <span className="font-bold text-gray-800 leading-tight">{user?.name}</span>
                            <span className="text-xs text-gray-500">{user?.vendorInfo?.storeName || 'Loja Parceira'}</span>
                        </div>
                        <Dropdown overlay={profileMenu} placement="bottomRight" arrow>
                            <Avatar size="large" icon={<UserOutlined />} src={user?.vendorInfo?.logo} className="cursor-pointer bg-blue-100 text-blue-600" />
                        </Dropdown>
                    </div>
                </Header>

                <Content style={{ margin: "24px 16px", padding: 24, minHeight: 280 }}>
                    {children}
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default VendorLayout;
