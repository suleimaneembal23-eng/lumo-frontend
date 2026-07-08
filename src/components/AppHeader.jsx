import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Space, Button, Avatar, Dropdown, Menu, Typography, Badge, message } from "antd";
import { HomeOutlined, LoginOutlined, UserAddOutlined, LogoutOutlined, ShoppingCartOutlined, UserOutlined, DashboardOutlined } from "@ant-design/icons";
import { AuthContext } from "../context/Authcontext";
import { SettingsContext } from "../context/SettingsContext";
import { CartContext } from "../context/CartContext"; // â† IMPORTADO

const { Header } = Layout;
const { Text } = Typography;

const AppHeader = () => {
  const { user, admin, logout } = useContext(AuthContext);
  const { settings, loading } = useContext(SettingsContext);
  const { cartCount } = useContext(CartContext); // â† USANDO CartContext em vez de localStorage
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    message.success("SessÃ£o encerrada com sucesso!");
    navigate("/");
  };

  const handleCartClick = () => {
    navigate("/cart");
  };

  const menuCliente = (
    <Menu
      onClick={({ key }) => {
        if (key === "home") navigate("/");
        if (key === "account") navigate("/client/dashboard");
        if (key === "logout") handleLogout();
      }}
      items={[
        { key: "home", label: "Home", icon: <HomeOutlined /> },
        { key: "account", label: "Minha Conta", icon: <DashboardOutlined /> },
        { key: "logout", label: "Sair", icon: <LogoutOutlined /> },
      ]}
    />
  );

  // cores do settings com fallback
  const primary = settings?.primaryColor || "#ffffff"; // header
  const secondary = settings?.secondaryColor || "#000000"; // textos e Ã­cones
  const background = settings?.backgroundColor || "#000000"; // fundo geral (nÃ£o header)

  return (
    <Header
      style={{
        background: primary,
        color: secondary,
        position: "sticky",
        top: 0,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 40px",
        height: "70px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        zIndex: 1000,
        transition: "all 0.3s ease",
      }}
    >
      {/* LOGO / NOME DO SITE */}
      <div
        onClick={() => navigate("/")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        {loading ? (
          <div style={{ width: 120, height: 32, background: "rgba(255,255,255,0.2)", borderRadius: 4 }} />
        ) : settings?.logoUrl ? (
          <img
            src={settings.logoUrl}
            alt="Logo"
            style={{ height: 48, objectFit: "contain" }}
          />
        ) : (
          <Text style={{ color: secondary, fontWeight: 700, fontSize: 24 }}>
            {settings?.siteName || "Lumo"}
          </Text>
        )}
      </div>

      {/* MENU DIREITO */}
      <Space size="middle" align="center">
        {!user && !admin ? (
          <>
            <Button
              type="text"
              icon={<HomeOutlined />}
              onClick={() => navigate("/")}
              style={{ ...buttonStyle, color: secondary }}
            >
              Home
            </Button>
            <Button
              type="text"
              icon={<LoginOutlined />}
              onClick={() => navigate("/login")}
              style={{ ...buttonStyle, color: secondary }}
            >
              Login
            </Button>
            <Button
              type="text"
              icon={<UserAddOutlined />}
              onClick={() => navigate("/register")}
              style={{ ...buttonStyle, color: secondary }}
            >
              Registo
            </Button>
            <Badge count={0} offset={[0, 0]}>
              <Button
                type="text"
                icon={<ShoppingCartOutlined />}
                onClick={handleCartClick}
                style={{ ...buttonStyle, color: secondary }}
              >
                Carrinho
              </Button>
            </Badge>
          </>
        ) : (
          <>
            <Button
              type="text"
              icon={<HomeOutlined />}
              onClick={() => navigate("/")}
              style={{ ...buttonStyle, color: secondary }}
            >
              Home
            </Button>

            {/* Se for Admin, mostra link para Dashboard Admin */}


            {/* Carrinho (sempre visÃ­vel, mas vazio para admin se nÃ£o usar) */}
            <Badge count={cartCount} offset={[0, 0]}>
              <Button
                type="text"
                icon={<ShoppingCartOutlined />}
                onClick={handleCartClick}
                style={{ ...buttonStyle, color: secondary }}
              >
                Carrinho
              </Button>
            </Badge>

            {/* Menu do UsuÃ¡rio (Cliente ou Admin) */}
            <Dropdown overlay={menuCliente} placement="bottomRight">
              <Space
                style={{
                  cursor: "pointer",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <Avatar
                  icon={<UserOutlined />}
                  style={{ backgroundColor: secondary }}
                />
                <Text style={{ color: secondary }}>{user ? user.name : admin?.name}</Text>
              </Space>
            </Dropdown>
          </>
        )}
      </Space>
    </Header>
  );
};

const buttonStyle = {
  fontWeight: 500,
};

export default AppHeader;
