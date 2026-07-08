import React, { useEffect, useState, useContext } from "react";
import { Row, Col, Card, Button, Divider, Typography, InputNumber, message, Spin } from "antd";
import { DeleteOutlined, ArrowLeftOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/Authcontext";
import { CartContext } from "../context/CartContext";
import { cartService } from "../services/cartService";
import { useCurrency } from "../hooks/useCurrency";

const { Title, Text } = Typography;

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { updateQuantity: updateCartQuantity, removeItem: removeCartItem, clearCart: clearCartContext } = useContext(CartContext);
  const { formatPrice } = useCurrency();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carrega o carrinho do backend
  useEffect(() => {
    const loadCart = async () => {
      if (!user) {
        setCart(null);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await cartService.getCart();
        setCart(data);
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
        message.error('Erro ao carregar o carrinho');
      } finally {
        setLoading(false);
      }
    };
    loadCart();
  }, [user]);



  const updateQuantity = async (itemId, newQty) => {
    if (!newQty || newQty < 1) return message.warning('Quantidade inválida');
    if (newQty > 10) return message.warning('Quantidade máxima é 10 unidades');
    try {
      const updatedCart = await cartService.updateQuantity(itemId, newQty);
      setCart(updatedCart);
      await updateCartQuantity(itemId, newQty);
      message.success('Quantidade atualizada');
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      message.error('Erro ao atualizar quantidade');
    }
  };

  const removeItem = async (itemId) => {
    try {
      const updatedCart = await cartService.removeItem(itemId);
      setCart(updatedCart);
      await removeCartItem(itemId);
      message.success('Item removido do carrinho');
    } catch (error) {
      console.error('Erro ao remover item:', error);
      message.error('Erro ao remover item');
    }
  };

  const clearCart = async () => {
    try {
      const updatedCart = await cartService.clearCart();
      setCart(updatedCart);
      await clearCartContext();
      message.success('Carrinho limpo');
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
      message.error('Erro ao limpar carrinho');
    }
  };

  const total = cart?.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;



  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <Spin size="large" />
        <div style={{ marginTop: 20 }}>
          <Text>A carregar o seu carrinho...</Text>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <ShoppingCartOutlined style={{ fontSize: 80, color: '#ccc', marginBottom: 20 }} />
        <Title level={3}>Faça login para ver seu carrinho</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
          É necessário estar autenticado para aceder ao carrinho de compras
        </Text>
        <Button type="primary" size="large" onClick={() => navigate("/login")}>
          Fazer Login
        </Button>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <ShoppingCartOutlined style={{ fontSize: 80, color: '#ccc', marginBottom: 20 }} />
        <Title level={3}>O carrinho está vazio</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
          Adicione produtos à sua lista de compras
        </Text>
        <Button type="primary" size="large" onClick={() => navigate("/")}>
          Voltar à Loja
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 10%" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/")}>
          Continuar Comprando
        </Button>
        <Button danger onClick={clearCart}>
          Limpar Carrinho
        </Button>
      </div>

      <Title level={2}>Seu Carrinho</Title>
      <Text type="secondary">{cart.items.length} {cart.items.length === 1 ? 'item' : 'itens'}</Text>
      <Divider />

      {cart.items.map((item) => (
        <Card key={item._id} style={{ marginBottom: 20, borderRadius: 12 }}>
          <Row gutter={20} align="middle">
            <Col xs={24} md={4}>
              <img
                src={item.image}
                alt={`Imagem do produto ${item.name}, tamanho ${item.selectedSize}`}
                style={{ width: "100%", borderRadius: 10, objectFit: 'cover' }}
              />
            </Col>

            <Col xs={24} md={12}>
              <Title level={4} style={{ marginBottom: 8 }}>{item.name}</Title>
              <Text>Preço unitário: {formatPrice(item.price)}</Text>
              <br />
              <Text>Tamanho: <strong>{item.selectedSize}</strong></Text>
              <br />
              <Text strong style={{ marginTop: 10, display: "block", fontSize: 16, color: '#1890ff' }}>
                Subtotal: {formatPrice(item.price * item.quantity)}
              </Text>
            </Col>

            <Col xs={24} md={4}>
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary">Quantidade:</Text>
              </div>
              <InputNumber
                min={1}
                max={10}
                value={item.quantity}
                onChange={(v) => updateQuantity(item._id, v)}
                style={{ width: '100%' }}
                aria-label={`Quantidade de ${item.name}`}
              />
            </Col>

            <Col xs={24} md={4}>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeItem(item._id)}
                block
                aria-label={`Remover ${item.name} do carrinho`}
              >
                Remover
              </Button>
            </Col>
          </Row>
        </Card>
      ))}

      <Divider />

      <Card style={{ padding: 20, borderRadius: 12, backgroundColor: '#fafafa' }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
          <Col><Text type="secondary">Subtotal:</Text></Col>
          <Col><Text>{formatPrice(total)}</Text></Col>
        </Row>
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
          <Col><Text type="secondary">Envio:</Text></Col>
          <Col><Text>Calculado no checkout</Text></Col>
        </Row>
        <Divider style={{ margin: '12px 0' }} />
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
          <Col><Title level={3} style={{ margin: 0 }}>Total Estimado:</Title></Col>
          <Col><Title level={3} style={{ margin: 0, color: '#1890ff' }}>{formatPrice(total)}</Title></Col>
        </Row>

        <Button
          type="primary"
          size="large"
          block
          onClick={() => navigate("/checkout")}
        >
          Finalizar Compra
        </Button>
      </Card>
    </div>
  );
};

export default Cart;