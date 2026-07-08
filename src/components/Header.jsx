import React, { useState, useContext } from "react";
import { Input, Button, Row, Col, Badge, Avatar } from "antd";
import { ShoppingCartOutlined, MenuOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { SettingsContext } from "../context/SettingsContext";
import { AuthContext } from "../context/Authcontext";
import { CartContext } from "../context/CartContext";

const topBgDefault = "#131921";
const bottomBgDefault = "#232f3e";
const primaryColorDefault = "#ff9900";

const Header = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const { settings } = useContext(SettingsContext);
  const { user } = useContext(AuthContext);
  const { cart } = useContext(CartContext);

  const primaryColor = settings?.primaryColor || primaryColorDefault;
  const topBg = settings?.secondaryColor || topBgDefault;
  const bottomBg = settings?.secondaryColor || bottomBgDefault;

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/?search=${searchTerm}`);
    }
  };

  const handleNavClick = (path) => {
    navigate(path);
  };

  return (
    <header style={{ width: '100%', position: 'sticky', top: 0, zIndex: 1000 }}>
      <div style={{ backgroundColor: topBg, padding: "8px 16px" }}>
        <Row align="middle" justify="space-between" gutter={[16, 8]}>

          {/* LOGO */}
          <Col xs={24} sm={6} md={4} lg={3} style={{ display: 'flex', alignItems: 'center', minWidth: 140 }}>
            <div
              onClick={() => handleNavClick("/")}
              style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 8 }}
            >
              {settings?.logoUrl ? (
                <Avatar src={settings.logoUrl} size={48} shape="square" />
              ) : (
                <Avatar size={48} shape="square">ðŸ·ï¸</Avatar>
              )}
              <span style={{ fontWeight: "bold", fontSize: "22px", color: "#fff" }}>
                {settings?.siteName || "Lumo"}
              </span>
            </div>
          </Col>

          {/* PESQUISA */}
          <Col xs={24} sm={12} md={14} lg={14} order={3}>
            <div style={{ display: "flex", width: "100%" }}>
              <Input
                placeholder="Pesquisar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onPressEnter={handleSearch}
                style={{ borderRadius: "4px 0 0 4px", height: "40px", fontSize: "16px" }}
              />
              <Button
                type="primary"
                icon={<SearchOutlined style={{ fontSize: '18px' }} />}
                onClick={handleSearch}
                style={{
                  borderRadius: "0 4px 4px 0",
                  backgroundColor: primaryColor,
                  borderColor: primaryColor,
                  height: "40px",
                  width: "50px"
                }}
              />
            </div>
          </Col>

          {/* LOGIN E CARRINHO */}
          <Col xs={24} sm={6} md={6} lg={7} style={{ display: "flex", alignItems: "center", justifyContent: 'flex-end', gap: "10px" }}>

            {/* LOGIN */}
            <div style={{ padding: '8px 4px', cursor: "pointer" }} onClick={() => handleNavClick("/login")}>
              <div style={{ fontSize: '12px', color: "white" }}>
                {user ? `OlÃ¡, ${user.name}` : "OlÃ¡, visitante"}
              </div>
              <div style={{ fontWeight: 'bold', fontSize: '14px', color: "white" }}>
                Contas e Login
              </div>
            </div>

            {/* CARRINHO - SÃ“ PARA LOGADOS */}
            {user && (
              <Button type="text" onClick={() => handleNavClick("/cart")} style={{ color: 'white', padding: "0 8px" }}>
                <Badge
                  count={cart.length}
                  showZero
                  offset={[-5, 5]}
                  style={{ backgroundColor: primaryColor }}
                >
                  <ShoppingCartOutlined style={{ fontSize: "30px", color: 'white' }} />
                </Badge>
                <span style={{ fontWeight: "bold", marginLeft: "4px", fontSize: '14px' }}>Carrinho</span>
              </Button>
            )}
          </Col>
        </Row>
      </div>

      {/* NAV BAR */}
      <div style={{
        backgroundColor: bottomBg, color: "white", padding: "6px 16px",
        display: "flex", alignItems: "center", gap: "15px", overflowX: 'auto'
      }}>
        <Button type="text" icon={<MenuOutlined style={{ color: 'white' }} />} style={{ color: 'white', fontWeight: 'bold' }}>
          Tudo
        </Button>

        {['Ofertas do Dia', 'Novos LanÃ§amentos', 'ClÃ¡ssicas', 'SeleÃ§Ãµes Nacionais', 'Ligas Europeias'].map((item, i) => (
          <span
            key={i}
            onClick={() => handleNavClick(`/category/${item.toLowerCase().replace(/\s/g, '-')}`)}
            style={{ cursor: "pointer", whiteSpace: 'nowrap' }}
          >
            {item}
          </span>
        ))}
      </div>
    </header>
  );
};

export default Header;
