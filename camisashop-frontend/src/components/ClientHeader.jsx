import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Button, Space, Avatar, Typography, Dropdown, Menu, message } from "antd";
import { HomeOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { AuthContext } from "../context/Authcontext";

const { Header } = Layout;
const { Text } = Typography;

const ClientHeader = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // limpa o contexto global
    message.success("Sessão encerrada com sucesso!");
    navigate("/"); // volta direto pra home
  };

  const menu = (
    <Menu
      onClick={({ key }) => {
        if (key === "home") navigate("/");
        if (key === "logout") handleLogout();
      }}
      items={[
        { key: "home", label: "🏠 Voltar à Home", icon: <HomeOutlined /> },
        { key: "logout", label: "Sair", icon: <LogoutOutlined /> },
      ]}
    />
  );

  return (
    <Header
      style={{
        backgroundColor: "#1f2937",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 25px",
        height: "64px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      <div
        style={{
          color: "#fff",
          fontWeight: "bold",
          fontSize: "20px",
          cursor: "pointer",
        }}
        onClick={() => navigate("/")}
      >
        CamisaShop
      </div>

      <Space>
        <Dropdown overlay={menu} placement="bottomRight">
          <Space style={{ cursor: "pointer" }}>
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: "#facc15" }} />
            <Text style={{ color: "#fff" }}>{user?.name}</Text>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default ClientHeader;
