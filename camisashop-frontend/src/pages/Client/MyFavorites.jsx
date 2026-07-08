// src/pages/Client/MyFavorites.jsx
import React, { useEffect, useState, useContext } from "react";
import { Card, Row, Col, Spin, Typography, Button, message, Empty, Tooltip } from "antd";
import { HeartTwoTone, EyeOutlined, DeleteOutlined, ShoppingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/Authcontext";
import { SettingsContext } from "../../context/SettingsContext"; // Contém a moeda e a cor primária

const { Title, Text } = Typography;

const MyFavorites = () => {
  const { user } = useContext(AuthContext);
  // Capturando 'currency' e 'locale' do settings para formatação dinâmica
  const { settings } = useContext(SettingsContext);
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define moeda e locale, com fallback profissional
  const currentCurrency = settings?.currency || "EUR"; 
  const currentLocale = settings?.locale || "pt-PT"; 
  const primaryColor = settings?.primaryColor || "#1890ff";

  // Função para formatação de preço dinâmica e profissional
  const formatPrice = (price) => {
    return new Intl.NumberFormat(currentLocale, {
      style: 'currency',
      currency: currentCurrency,
      minimumFractionDigits: 2,
    }).format(price);
  };

  const fetchFavorites = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/favorites", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) setFavorites(await res.json());
      else {
        const err = await res.json();
        message.error(err.message || "Erro ao carregar favoritos");
      }
    } catch (err) {
      console.error(err);
      message.error("Erro ao carregar favoritos");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId) => {
    if (!user) return message.warning("Faça login para remover favoritos");

    // Otimismo de UI: remove localmente antes de receber a resposta do servidor
    const originalFavorites = favorites;
    setFavorites(prev => prev.filter(p => p._id !== productId));
    
    try {
      const res = await fetch(`http://localhost:5000/api/favorites/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        message.success("Produto removido dos favoritos");
        window.localStorage.setItem("updateFavorites", Date.now()); // Para outros componentes
      } else {
        // Reverte a lista se houver erro
        setFavorites(originalFavorites); 
        const err = await res.json();
        message.error(err.message || "Erro ao remover favorito");
      }
    } catch (err) {
      console.error(err);
      setFavorites(originalFavorites); // Reverte a lista
      message.error("Erro de conexão ao remover favorito");
    }
  };


  useEffect(() => {
    fetchFavorites();
  }, [user]);

  // Atualiza quando favoritar/desfavoritar via Storage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "updateFavorites") fetchFavorites();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  if (loading)
    return (
      <div style={{ height: "70vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Spin size="large" tip="Carregando seus produtos favoritos..." />
      </div>
    );

  if (!user)
    return <p style={{ textAlign: "center", padding: "40px" }}>Faça login para ver seus favoritos</p>;

  return (
    <div
      style={{
        padding: "32px 24px",
        minHeight: "100vh",
        background: settings?.background || "#f0f2f5", 
      }}
    >
      <Title 
        level={2} 
        style={{ 
          marginBottom: 40, 
          color: primaryColor, 
          textAlign: "center" 
        }}
      >
        <HeartTwoTone twoToneColor={primaryColor} style={{ marginRight: 10 }} /> 
        Meus Favoritos
      </Title>

      {/* Tratamento elegante para lista vazia */}
      {favorites.length === 0 && (
        <Empty
          image={<ShoppingOutlined style={{ fontSize: 60, color: primaryColor }} />}
          description={
            <>
              <Text strong style={{ fontSize: 18, color: '#595959' }}>
                Sua lista de desejos está vazia!
              </Text>
              <Text style={{ display: 'block', marginTop: 8 }}>
                Explore nossos produtos e adicione aqueles que você mais gosta.
              </Text>
            </>
          }
        >
          <Button 
            type="primary" 
            size="large"
            onClick={() => navigate("/")}
            style={{ fontWeight: 'bold' }}
          >
            Começar a Comprar
          </Button>
        </Empty>
      )}

      <Row gutter={[24, 24]}>
        {favorites.map((product) => (
          <Col key={product._id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              // Estilo mais premium: borda suave, sombra elevada no hover
              style={{
                borderRadius: 12, 
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)", 
                border: "1px solid #e8e8e8",
                transition: "all 0.3s ease",
                height: "100%", 
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.15)")}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.08)")}
              bodyStyle={{ 
                padding: 16, 
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
              cover={
                <div style={{ position: 'relative' }}>
                    <img
                        alt={product.name}
                        src={product.image}
                        style={{ 
                            height: 220, 
                            objectFit: "cover", 
                            width: "100%", 
                            borderRadius: "12px 12px 0 0" 
                        }}
                    />
                    {/* Botão de remoção discreto, mas acessível, com Tooltip */}
                    <Tooltip title="Remover dos favoritos">
                        <Button
                            type="primary"
                            danger
                            icon={<DeleteOutlined />}
                            shape="circle"
                            size="small" // Ícone menor e mais discreto
                            onClick={(e) => {
                                e.stopPropagation(); 
                                handleRemoveFavorite(product._id);
                            }}
                            style={{ 
                                position: 'absolute', 
                                top: 12, 
                                right: 12,
                                zIndex: 10,
                                backgroundColor: primaryColor, // Usando a cor primária para destaque
                                border: 'none',
                                opacity: 0.8, // Mais sutil
                            }}
                        />
                    </Tooltip>
                </div>
              }
            >
              <div style={{ marginBottom: 16, minHeight: 60 }}>
                <Title level={4} ellipsis={{ rows: 2 }} style={{ marginBottom: 4, fontSize: '1.2em', color: '#262626' }}>
                  {product.name}
                </Title>
                <Text type="secondary" style={{ display: 'block', fontSize: '0.9em' }}>
                  {product.category || "Sem Categoria"}
                </Text>
              </div>

              <div style={{ marginTop: 'auto' }}>
                <Text 
                  style={{ 
                    fontSize: 22, // Preço em destaque
                    color: primaryColor, 
                    fontWeight: 800,
                    display: 'block',
                    marginBottom: 12
                  }}
                >
                  {formatPrice(product.price)}
                </Text>
                
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  block
                  size="large" // Botão maior para CTA
                  style={{ borderRadius: 8, fontWeight: "bold" }}
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  Ver Detalhes
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default MyFavorites;