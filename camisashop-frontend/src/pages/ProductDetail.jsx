import React, { useEffect, useState, useContext, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Row, Col, Card, Image, Typography, Button, Select, InputNumber, message, Divider, Badge, Tabs, Descriptions, Breadcrumb, Spin, Tag, List, Rate, Input, Popconfirm, Space, Avatar,
} from "antd";
import {
  ShoppingCartOutlined, HeartOutlined, HeartFilled, ArrowLeftOutlined, EditOutlined, DeleteOutlined, UserOutlined, TagsOutlined, GiftOutlined,
  CarOutlined, LockOutlined, SwapOutlined, CheckCircleOutlined
} from "@ant-design/icons";
import { AuthContext } from "../context/Authcontext";
import { SettingsContext } from "../context/SettingsContext";
import { CartContext } from "../context/CartContext";
import { useCurrency } from "../hooks/useCurrency";
import { usePromotions } from "../hooks/usePromotions";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { settings } = useContext(SettingsContext);
  const { addToCart } = useContext(CartContext);
  const loggedUserId = user?.id;

  const { formatPrice } = useCurrency();
  const { calculateDiscountedPrice } = usePromotions();

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("S");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const [feedbacks, setFeedbacks] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);

  const [isFavorite, setIsFavorite] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [manualCoupon, setManualCoupon] = useState(null); // { finalPrice, discountPercent, code, title }

  // --- Derived State for Price and Product Display ---
  const effectiveProduct = useMemo(() => {
    if (!product) return null;

    // 1. Calculate Automatic Promotion Price
    const autoPromoProduct = calculateDiscountedPrice(product);

    // 2. If Manual Coupon is applied and better, use it
    if (manualCoupon) {
      // Compare per unit prices
      if (manualCoupon.finalPrice < autoPromoProduct.finalPrice) {
        return {
          ...autoPromoProduct,
          finalPrice: manualCoupon.finalPrice,
          discountPercent: manualCoupon.discountPercent,
          onSale: true,
          isCouponApplied: true,
          // Ensure originalPrice is set for strikethrough
          originalPrice: autoPromoProduct.originalPrice || autoPromoProduct.price,
          promoTitle: manualCoupon.title // Nome do cupom manual
        };
      }
    }

    return autoPromoProduct;
  }, [product, manualCoupon, calculateDiscountedPrice]);

  const finalPrice = effectiveProduct ? effectiveProduct.finalPrice : 0;
  const couponDiscount = effectiveProduct?.isCouponApplied ? effectiveProduct.discountPercent : 0;


  // --- Funções e Lógica de Negócio ---

  const applyCoupon = async () => {
    if (!couponCode) return message.warning("Digite o código do cupom");
    try {
      // Agora chamamos a rota de validação completa para ter todos os detalhes (incluindo isNewUserCoupon)
      const validateRes = await fetch("http://localhost:5000/api/marketing/promotions/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          productId: product._id,
          userId: user?.id
        })
      });

      if (!validateRes.ok) {
        const err = await validateRes.json();
        setManualCoupon(null);
        return message.error(err.message || "Cupom inválido");
      }

      const couponData = await validateRes.json(); // { code, discount, isNewUserCoupon, ... }

      // Calcula o preço com o cupom manual
      const manualDiscountAmount = (product.price * couponData.discount) / 100;
      const manualFinalPrice = product.price - manualDiscountAmount;

      // Preço da promoção automática (se houver)
      const autoPromo = calculateDiscountedPrice(product);
      const autoPrice = autoPromo.finalPrice;

      // COMPARAÇÃO: Qual é melhor?
      if (manualFinalPrice < autoPrice) {
        // Cupom Manual é melhor
        setManualCoupon({
          finalPrice: manualFinalPrice,
          discountPercent: couponData.discount,
          code: couponData.code,
          title: couponData.isNewUserCoupon ? "Cupom de Boas-Vindas" : `Cupom ${couponData.code}`,
          isNewUserCoupon: couponData.isNewUserCoupon
        });
        message.success(`🎉 Cupom "${couponData.code}" aplicado! (${couponData.discount}% OFF)`);
      } else if (manualFinalPrice === autoPrice && autoPromo.appliedPromo) {
        // Empate (prefere o automático para não "gastar" o cupom se for de uso único, ou avisa)
        message.info(`O desconto é o mesmo da oferta atual "${autoPromo.appliedPromo.title}".`);
        setManualCoupon(null);
      } else {
        // Automático é melhor
        setManualCoupon(null);
        const autoName = autoPromo.appliedPromo ? autoPromo.appliedPromo.title : "Oferta Automática";
        message.warning(`A oferta "${autoName}" (${autoPromo.discountPercent}% OFF) é melhor que este cupom (${couponData.discount}% OFF).`);
      }

    } catch (err) {
      console.error(err);
      message.error("Erro ao validar cupom");
    }
  };

  const fetchProductData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data);
        setSelectedSize((data.size && data.size[0]) || "S");
      } else {
        message.error("Produto não encontrado");
      }
    } catch (err) {
      console.error(err);
      message.error("Erro ao carregar produto");
    }
    setLoading(false);
  }, [id]);

  const fetchFeedbacks = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/feedback/product/${id}`);
      if (res.ok) setFeedbacks(await res.json());
    } catch (err) { console.error(err); }
  }, [id]);

  const checkFavorite = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("http://localhost:5000/api/favorites", { headers: { Authorization: `Bearer ${user.token}` } });
      if (res.ok) setIsFavorite((await res.json()).some((p) => p._id === id));
    } catch (err) { console.error(err); }
  }, [id, user]);

  useEffect(() => {
    fetchProductData();
    fetchFeedbacks();
    checkFavorite();
  }, [fetchProductData, fetchFeedbacks, checkFavorite]);

  const handleAddToCart = async () => {
    if (!user) return message.warning("Faça login para adicionar ao carrinho!");
    if (!product.inStock) return message.warning("Produto esgotado!");
    await addToCart({ id: product._id, name: product.name, price: finalPrice, image: product.image, selectedSize, quantity });
  };

  const buyNow = async () => {
    if (!user) return message.warning("Faça login para comprar");
    if (!product.inStock) return message.warning("Produto esgotado!");
    const success = await addToCart({ id: product._id, name: product.name, price: finalPrice, image: product.image, selectedSize, quantity });
    if (success) navigate("/checkout");
  };

  const toggleFavorite = async () => {
    if (!user) return message.warning("Faça login para favoritar");
    try {
      setIsFavorite((prev) => !prev);
      const method = isFavorite ? "DELETE" : "POST";
      const res = await fetch(`http://localhost:5000/api/favorites/${id}`, { method, headers: { Authorization: `Bearer ${user.token}` } });
      if (!res.ok) {
        setIsFavorite((prev) => !prev);
        return message.error((await res.json()).message);
      }
      message.success(isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos");
    } catch (err) { console.error(err); message.error("Erro ao atualizar favoritos"); }
  };

  const submitFeedback = async () => {
    if (!user) return message.warning("Faça login para enviar avaliação");
    try {
      let url = `http://localhost:5000/api/feedback${editingFeedbackId ? `/${editingFeedbackId}` : ""}`;
      const method = editingFeedbackId ? "PUT" : "POST";

      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ product: id, rating: newRating, comment: newComment }),
      });

      if (!res.ok) return message.error((await res.json()).message);

      const fb = await res.json();
      const feedbackWithClient = { ...fb, client: fb.client || { _id: user.id, name: user.name, email: user.email } };

      if (editingFeedbackId) {
        setFeedbacks(feedbacks.map((f) => (f._id === feedbackWithClient._id ? feedbackWithClient : f)));
        setEditingFeedbackId(null);
        message.success("Feedback atualizado!");
      } else {
        setFeedbacks([feedbackWithClient, ...feedbacks]);
        message.success("Feedback enviado!");
      }

      setNewComment(""); setNewRating(5);
    } catch (err) { console.error(err); message.error("Erro ao enviar feedback"); }
  };

  const editFeedback = (fb) => { setNewComment(fb.comment); setNewRating(fb.rating); setEditingFeedbackId(fb._id); };

  const deleteFeedback = async (idToDelete) => {
    if (!user) return message.warning("Faça login");
    try {
      const res = await fetch(`http://localhost:5000/api/feedback/${idToDelete}`, { method: "DELETE", headers: { Authorization: `Bearer ${user.token}` } });
      if (!res.ok) return message.error((await res.json()).message);
      setFeedbacks(feedbacks.filter((f) => f._id !== idToDelete));
      message.success("Feedback removido!");
    } catch (err) { console.error(err); message.error("Erro ao remover feedback"); }
  };

  // --- Variáveis Calculadas ---
  const categoriesArray = Array.isArray(product?.category) ? product.category : product?.category ? [product.category] : [];
  const avgRating = feedbacks.length ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) : 0;

  // --- Estilos Consolidado ---
  const cardStyle = useMemo(() => ({ borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", background: "#fff", }), []);
  const mainButtonStyle = useMemo(() => ({ height: 50, fontSize: 16 }), []);

  if (loading)
    return (
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: settings?.backgroundColor || "#f8f9fa" }}>
        <Spin size="large" tip="Carregando produto..." />
      </div>
    );

  if (!product)
    return (
      <div style={{ textAlign: "center", padding: "80px", background: settings?.backgroundColor || "#f8f9fa" }}>
        <Title level={2}>Produto não encontrado</Title>
        <Button icon={<ArrowLeftOutlined />} size="large" type="primary" onClick={() => navigate("/")}>Voltar à Loja</Button>
      </div>
    );


  return (
    <div style={{ minHeight: "100vh", padding: "20px", background: settings?.backgroundColor || "#f8f9fa" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>

        {/* Breadcrumb */}
        <Breadcrumb style={{ marginBottom: 24, padding: "0 20px" }}>
          <Breadcrumb.Item onClick={() => navigate("/")} style={{ cursor: "pointer", color: settings?.primaryColor || "#1890ff" }}>Home</Breadcrumb.Item>
          {categoriesArray.map((cat, i) => (
            <Breadcrumb.Item key={i} style={{ cursor: "pointer", color: settings?.primaryColor || "#1890ff" }} onClick={() => navigate(`/?category=${cat.toLowerCase()}`)}>
              {cat}
            </Breadcrumb.Item>
          ))}
          <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
        </Breadcrumb>

        <Row gutter={[32, 32]}>
          {/* Imagem do Produto */}
          <Col xs={24} lg={12}>
            <Card bordered={false} style={{ ...cardStyle, overflow: "hidden" }}>
              <Image src={product.image} alt={product.name} style={{ width: "100%", maxHeight: 600, objectFit: "contain" }} preview />
            </Card>
          </Col>

          {/* Informações do Produto */}
          <Col xs={24} lg={12}>
            <Card bordered={false} style={{ ...cardStyle, padding: "24px" }}>
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <div>
                  <Title level={2} style={{ margin: 0, color: settings?.textColor || "#000" }}>{product.name}</Title>
                  <Space style={{ marginTop: 12 }} wrap>
                    {product.isNew && <Badge count="Novo" style={{ backgroundColor: settings?.primaryColor || "#1890ff" }} />}
                    {effectiveProduct.onSale && <Badge count="Promoção" style={{ backgroundColor: "#ff4d4f" }} />}
                    {product.isLimited && <Badge count="Edição Limitada" style={{ backgroundColor: "#fa8c16" }} />}
                    {product.featured && <Badge count="Destaque" style={{ backgroundColor: "#52c41a" }} />}
                  </Space>
                </div>

                {feedbacks.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Rate disabled value={Number(avgRating)} allowHalf />
                    <Text type="secondary">{avgRating} ({feedbacks.length} {feedbacks.length === 1 ? "avaliação" : "avaliações"})</Text>
                  </div>
                )}

                <Space wrap>
                  <TagsOutlined style={{ color: settings?.primaryColor || "#1890ff" }} />
                  {categoriesArray.map((cat, i) => (<Tag key={i} color="blue">{cat}</Tag>))}
                </Space>

                <Tag color={product.inStock ? "success" : "error"} style={{ width: "fit-content", padding: "4px 12px", fontSize: 14 }}>
                  {product.inStock ? "✓ Em Stock" : "✗ Esgotado"}
                </Tag>

                <Divider style={{ margin: "16px 0" }} />

                {/* Preço */}
                <div>
                  {effectiveProduct.onSale && (
                    <div style={{ marginBottom: 8 }}>
                      <Text delete style={{ color: "#999", fontSize: 20, marginRight: 12 }}>
                        {formatPrice(effectiveProduct.originalPrice * quantity)}
                      </Text>
                      <Tag color="red" style={{ fontSize: 14, padding: "4px 12px" }}>
                        -{effectiveProduct.discountPercent.toFixed(0)}% {effectiveProduct.promoTitle || (effectiveProduct.appliedPromo ? effectiveProduct.appliedPromo.title : "OFF")}
                      </Tag>
                    </div>
                  )}
                  <Title level={2} style={{ margin: 0, color: effectiveProduct.onSale ? settings?.discountColor || "#ff4d4f" : settings?.primaryColor || "#1890ff" }}>
                    {formatPrice(finalPrice * quantity)}
                  </Title>
                  {effectiveProduct.onSale && (
                    <div style={{ marginTop: 8 }}>
                      <Text type="success" style={{ fontSize: 16, fontWeight: 500 }}>
                        💰 Você economizou: {formatPrice((effectiveProduct.originalPrice - finalPrice) * quantity)}
                      </Text>
                    </div>
                  )}
                </div>

                <Divider style={{ margin: "16px 0" }} />

                {/* Tamanho e Quantidade */}
                <div>
                  <Text strong style={{ display: "block", marginBottom: 8 }}>Tamanho:</Text>
                  <Select value={selectedSize} onChange={setSelectedSize} size="large" style={{ width: "100%" }}>
                    {(product.size || ["S", "M", "L", "XL", "XXL"]).map((s) => (<Option key={s} value={s}>{s}</Option>))}
                  </Select>
                </div>
                <div>
                  <Text strong style={{ display: "block", marginBottom: 8 }}>Quantidade:</Text>
                  <InputNumber min={1} max={10} value={quantity} onChange={setQuantity} size="large" style={{ width: "100%" }} />
                </div>

                {/* Cupom */}
                <Card style={{ background: "#f5f5f5", border: "none" }}>
                  <Space.Compact style={{ width: "100%" }} size="large">
                    <Input prefix={<GiftOutlined />} placeholder="Código do cupom" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
                    <Button type="primary" onClick={applyCoupon}>Aplicar</Button>
                  </Space.Compact>
                </Card>

                <Divider style={{ margin: "16px 0" }} />

                {/* Botões de Ação */}
                <Space direction="vertical" style={{ width: "100%" }} size="middle">
                  <Button
                    type="primary" icon={<ShoppingCartOutlined />} size="large" block onClick={handleAddToCart} disabled={!product.inStock}
                    style={{ ...mainButtonStyle, background: settings?.primaryColor || "#1890ff", borderColor: settings?.primaryColor || "#1890ff" }}
                  >
                    Adicionar ao Carrinho
                  </Button>

                  <Button
                    size="large" block onClick={buyNow} disabled={!product.inStock}
                    style={{ ...mainButtonStyle, borderColor: settings?.primaryColor || "#1890ff", color: settings?.primaryColor || "#1890ff" }}
                  >
                    Comprar Agora
                  </Button>

                  <Button
                    type={isFavorite ? "primary" : "default"} icon={isFavorite ? <HeartFilled /> : <HeartOutlined />} size="large" block onClick={toggleFavorite}
                    style={mainButtonStyle} danger={isFavorite}
                  >
                    {isFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
                  </Button>
                </Space>

                {/* TRUST BADGES */}
                <div style={{ marginTop: 30, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <LockOutlined style={{ fontSize: 18, color: settings?.primaryColor || "#1890ff" }} />
                    <Text style={{ fontSize: 13 }}>Pagamento Seguro</Text>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <CarOutlined style={{ fontSize: 18, color: settings?.primaryColor || "#1890ff" }} />
                    <Text style={{ fontSize: 13 }}>Envio Rastreado</Text>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <SwapOutlined style={{ fontSize: 18, color: settings?.primaryColor || "#1890ff" }} />
                    <Text style={{ fontSize: 13 }}>Troca Grátis</Text>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <CheckCircleOutlined style={{ fontSize: 18, color: settings?.primaryColor || "#1890ff" }} />
                    <Text style={{ fontSize: 13 }}>Produto Oficial</Text>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Tabs de Informações */}
        <Card bordered={false} style={{ ...cardStyle, marginTop: 32 }}>
          <Tabs defaultActiveKey="1" size="large">
            <Tabs.TabPane tab="Descrição" key="1">
              <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>{product.description || "Sem descrição disponível."}</Paragraph>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Detalhes Técnicos" key="2">
              <Descriptions bordered column={1} size="middle">
                {product.material && <Descriptions.Item label="Material">{product.material}</Descriptions.Item>}
                {product.weight && <Descriptions.Item label="Peso">{product.weight}</Descriptions.Item>}
                <Descriptions.Item label="Tamanhos Disponíveis">{(product.size || []).join(", ")}</Descriptions.Item>
              </Descriptions>
            </Tabs.TabPane>

            <Tabs.TabPane tab={`Avaliações (${feedbacks.length})`} key="3">
              {/* Formulário de Avaliação */}
              {user ? (
                <Card style={{ marginBottom: 24, background: "#f5f5f5", border: "none" }}>
                  <Title level={5}>Deixe sua avaliação</Title>
                  <Space direction="vertical" style={{ width: "100%" }} size="middle">
                    <div>
                      <Text>Nota:</Text>
                      <Rate value={newRating} onChange={setNewRating} style={{ marginLeft: 12 }} />
                    </div>
                    <TextArea
                      rows={4} value={newComment} onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Compartilhe sua experiência com este produto..." maxLength={500} showCount
                    />
                    <Space>
                      <Button type="primary" onClick={submitFeedback}>{editingFeedbackId ? "Atualizar Avaliação" : "Enviar Avaliação"}</Button>
                      {editingFeedbackId && (<Button onClick={() => { setEditingFeedbackId(null); setNewComment(""); setNewRating(5); }}>Cancelar</Button>)}
                    </Space>
                  </Space>
                </Card>
              ) : (
                <Card style={{ marginBottom: 24, textAlign: "center" }}><Text>Faça login para deixar uma avaliação</Text></Card>
              )}

              {/* Lista de Avaliações */}
              <List
                dataSource={feedbacks} locale={{ emptyText: "Nenhuma avaliação ainda. Seja o primeiro!" }}
                renderItem={(fb) => (
                  <List.Item
                    style={{ padding: "16px 0" }}
                    actions={
                      fb.client?._id === loggedUserId
                        ? [
                          <Button icon={<EditOutlined />} onClick={() => editFeedback(fb)} key="edit" />,
                          <Popconfirm title="Remover esta avaliação?" onConfirm={() => deleteFeedback(fb._id)} key="delete">
                            <Button icon={<DeleteOutlined />} danger />
                          </Popconfirm>,
                        ]
                        : []
                    }
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} size={48} style={{ background: settings?.primaryColor || "#1890ff" }} />}
                      title={<Space><Text strong style={{ fontSize: 16 }}>{fb.client?.name || "Utilizador"}</Text><Rate disabled value={fb.rating} style={{ fontSize: 14 }} /></Space>}
                      description={<Text style={{ fontSize: 15, lineHeight: 1.6 }}>{fb.comment}</Text>}
                    />
                  </List.Item>
                )}
              />
            </Tabs.TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default ProductDetail;