import React, { useEffect, useState, useContext, useMemo, useCallback } from "react";
import {
    Row, Col, Card, Typography, Button, message, Skeleton, Tag, Select, Slider, Input, Badge, Modal, Collapse, Divider, Space,
} from "antd";
import {
    ShoppingCartOutlined, SearchOutlined, InfoCircleOutlined, PhoneOutlined, QuestionCircleOutlined, SwapOutlined, CloseCircleOutlined, FacebookOutlined, InstagramOutlined, TwitterOutlined, RightOutlined, FireOutlined, StarOutlined, LockOutlined
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { SettingsContext } from "../context/SettingsContext";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/Authcontext";
import { useCurrency } from "../hooks/useCurrency";
import { usePromotions } from "../hooks/usePromotions";
import CountdownTimer from './CountdownTimer';
import dayjs from "dayjs";
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const MAX_PRICE = 200;

// --- ESTILOS COMPACTADOS ---
const baseCardStyle = { borderRadius: 16, overflow: "hidden", border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" };
const cardCoverDivStyle = { position: "relative", height: 280, background: "#f5f5f5", cursor: "pointer" };
const cardImageStyle = { width: "100%", height: "100%", objectFit: "contain" };

// Componente para evitar repetição de código no Card do produto (PRINCIPAL)
const ProductCard = React.memo(({ product, formatPrice, settings, navigate, handleAddToCart, user }) => {
    if (!product || !product._id || !product.name) return null;

    const priceStyle = {
        color: product.onSale ? settings?.discountColor || "#ff4d4f" : settings?.textColor || "#000",
        fontSize: 20, fontWeight: 700,
    };

    const onAddToCart = (e) => {
        e.stopPropagation();
        if (!user) return message.warning("Faça login para adicionar ao carrinho!");
        handleAddToCart(product);
    };

    const cardButtonProps = {
        type: "primary", icon: <ShoppingCartOutlined />, onClick: onAddToCart, disabled: !product.inStock, block: true,
        style: {
            borderRadius: 8, height: 40, fontWeight: 600,
            backgroundColor: product.inStock ? (settings?.buttonBackground || settings?.primaryColor || "#667eea") : settings?.disabledButtonBackground || "#f5f5f5",
            color: product.inStock ? (settings?.buttonTextColor || "#fff") : settings?.disabledButtonTextColor || "rgba(0,0,0,0.25)",
            borderColor: product.inStock ? (settings?.buttonBackground || settings?.primaryColor || "#667eea") : settings?.disabledButtonBackground || "#d9d9d9",
        }
    };

    // --- Lógica das Tags de Status (Novo Produto, Limitado) no canto superior direito ---
    const statusTags = (
        <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, zIndex: 10 }}>
            {product.isLimited && (
                <Tag color="volcano" style={{ fontWeight: 700, fontSize: 13, padding: '4px 8px' }}>
                    Limitada
                </Tag>
            )}
            {product.isNew && (
                <Tag color="green" style={{ fontWeight: 700, fontSize: 13, padding: '4px 8px' }}>
                    NOVO
                </Tag>
            )}
        </div>
    );
    // --- Fim da Lógica das Tags ---

    // Lógica da Tag de Stock/Esgotado no canto superior esquerdo (onde a Ribbon não está)
    let stockTag = null;
    if (!product.inStock) {
        stockTag = (<Tag color="red" style={{ position: 'absolute', top: 12, left: 12, fontSize: 14, fontWeight: 700, zIndex: 10 }}>Esgotado</Tag>);
    } else if (!product.onSale) {
        stockTag = (<Tag color="green" style={{ position: 'absolute', top: 12, left: 12, fontSize: 14, fontWeight: 700, zIndex: 10 }}>Em Stock</Tag>);
    }

    return (
        <Badge.Ribbon
            text={product.onSale ? `-${Math.round(product.discountPercent)}%` : null}
            color={settings?.discountColor || "red"}
            placement="start"
        >
            <Card
                hoverable
                style={{ ...baseCardStyle, backgroundColor: settings?.cardBackground || "#fff" }}
                bodyStyle={{ padding: 16 }}
                cover={
                    <div onClick={() => navigate(`/product/${product._id}`)} style={cardCoverDivStyle}>
                        {stockTag}
                        {statusTags}
                        <img src={product.image} alt={product.name} style={cardImageStyle} loading="lazy" />
                    </div>
                }
            >
                <Title level={4} onClick={() => navigate(`/product/${product._id}`)}
                    style={{ color: settings?.textColor || "#000", marginTop: 0, marginBottom: 8, cursor: 'pointer', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                >
                    {product.name}
                </Title>

                <div style={{ marginBottom: 16 }}>
                    {product.onSale && (
                        <Text delete style={{ color: settings?.secondaryTextColor || "rgba(0,0,0,0.45)", marginRight: 8 }}>
                            {formatPrice(product.originalPrice)}
                        </Text>
                    )}
                    <Text style={priceStyle}>{formatPrice(product.price)}</Text>
                </div>

                <Button {...cardButtonProps}>
                    {product.inStock ? "Adicionar ao Carrinho" : "Esgotado"}
                </Button>
            </Card>
        </Badge.Ribbon>
    );
});


const Home = () => {
    const { settings } = useContext(SettingsContext);
    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);

    const { currency, toggleCurrency, formatPrice } = useCurrency();
    const { activePromotions, calculateDiscountedPrice } = usePromotions();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        selectedCategory: "Todas as Categorias", selectedSize: [], priceRange: [0, MAX_PRICE], searchQuery: "", promoFilterId: null,
    });

    const { selectedCategory, selectedSize, priceRange, searchQuery, promoFilterId } = filters;
    const isSearching = searchQuery.trim().length > 0;

    const updateFilters = useCallback((key, value) => setFilters(prev => ({ ...prev, [key]: value })), []);
    const navigate = useNavigate();
    const location = useLocation();

    const sizes = ["S", "M", "L", "XL", "XXL"];
    const categories = [
        { key: "Todas as Categorias", label: "Todas" },
        { key: "Camisas de Equipas", label: "Clubes" },
        { key: "Camisas de Seleções", label: "Seleções" },
        { key: "Camisas Retrô", label: "Retrô" },
        { key: "Edição Limitada", label: "Limitadas" }, // NOVA ABA
        { key: "Destaques", label: "Destaques" },
        { key: "Top Vendidos", label: "Top Vendidos" },
    ];

    useEffect(() => {
        const q = new URLSearchParams(location.search).get("promo");
        updateFilters("promoFilterId", q || null);
    }, [location.search, updateFilters]);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            let url = "http://localhost:5000/api/products";
            const res = await fetch(url);
            const data = await res.json();
            setProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            message.error("Erro ao carregar produtos.");
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleAddToCart = useCallback(async (product) => {
        if (!user || !product.inStock) return;
        await addToCart({
            id: product._id, name: product.name, price: product.price, image: product.image,
            selectedSize: Array.isArray(product.size) && product.size.length > 0 ? product.size[0] : "M",
            quantity: 1,
        });
    }, [addToCart, user]);

    const productsWithDiscount = useMemo(() => {
        return products.map((p) => {
            const discounted = calculateDiscountedPrice(p);
            return {
                ...discounted,
                price: discounted.finalPrice,
            };
        });
    }, [products, calculateDiscountedPrice]);

    const filteredProducts = useMemo(() => {
        let list = productsWithDiscount;

        // Se estiver pesquisando, ignora categoria, tamanho e promoFilter
        if (isSearching) {
            list = list.filter((p) => {
                const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
                return matchSearch;
            });
        } else {
            // Filtros normais (Categoria, Promo, Tamanho, Preço)
            if (selectedCategory !== "Todas as Categorias") {
                if (selectedCategory === "Edição Limitada") {
                    // Filtro Especial para Limitadas
                    list = list.filter(p => p.isLimited);
                } else if (selectedCategory === "Destaques") { // Caso precise manter lógica anterior
                    list = list.filter(p => p.featured);
                } else if (selectedCategory === "Top Vendidos") { // Caso precise manter lógica anterior
                    list = list.filter(p => p.salesCount > 0);
                } else {
                    // Filtro padrão por categoria string
                    list = list.filter((p) => Array.isArray(p.category) ? p.category.includes(selectedCategory) : p.category === selectedCategory);
                }
            }

            if (promoFilterId) list = list.filter((p) => String(p.appliedPromoId) === String(promoFilterId));

            list = list.filter((p) => {
                if (!p || !p.name || !p.price) return false;

                const matchSize = selectedSize.length === 0 || (Array.isArray(p.size) ? p.size.some((s) => selectedSize.includes(s)) : false);
                const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
                const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

                return matchSize && matchPrice && matchSearch;
            });
        }

        return list;
    }, [productsWithDiscount, promoFilterId, selectedCategory, selectedSize, priceRange, searchQuery, isSearching]);

    // O mainPromo agora é a melhor PROMOÇÃO ATIVA (seja global ou daily deal)
    const mainPromo = activePromotions.sort((a, b) => (b.discount || 0) - (a.discount || 0))[0];

    // Lógica para determinar a Promoção Global do Banner (maior desconto, aplica a Todas as Categorias, e NÃO é Oferta do Dia)
    const isGlobalPromotion = (promo) => {
        if (!promo) return false;
        const applies_to_all_categories = Array.isArray(promo.categories) && promo.categories.includes("Todas as Categorias");
        const is_not_daily_deal = !promo.isDailyDeal; // Devemos excluir Ofertas do Dia do Hero Banner Global
        const is_not_new_user_coupon = !promo.isNewUserCoupon; // 🚨 EXCLUSÃO: Não mostrar cupom de boas-vindas no banner global

        return applies_to_all_categories && is_not_daily_deal && is_not_new_user_coupon;
    }

    // Retorna a melhor Promoção Global para o Banner (Prioridade: Desconto > Global > Não Diária)
    const mainPromoForBanner = useMemo(() => {
        const globalCandidates = activePromotions
            .filter(isGlobalPromotion)
            .sort((a, b) => (b.discount || 0) - (a.discount || 0));

        return globalCandidates.length ? globalCandidates[0] : null;
    }, [activePromotions]);

    // LÓGICA: Oferta do Dia (é uma promoção marcada como isDailyDeal)
    const dailyDealPromotion = useMemo(() => {
        return activePromotions.find(promo => promo.isDailyDeal);
    }, [activePromotions]);

    // LÓGICA 1: Produtos EM PROMOÇÃO (Oferta do Dia)
    const promoProducts = useMemo(() => {
        if (!dailyDealPromotion) return [];

        let list = productsWithDiscount.filter(p => {
            // Filtra os produtos que têm o desconto aplicado *automaticamente* pela Oferta do Dia
            return p.appliedPromoId && String(p.appliedPromoId) === String(dailyDealPromotion._id);
        });

        // Caso a promoção do dia seja baseada em categoria ou global, randomizamos a exibição
        list = list.sort(() => 0.5 - Math.random()).slice(0, 8);

        return list;
    }, [productsWithDiscount, dailyDealPromotion]);

    // LÓGICA 2: Produtos em DESTAQUE (usando o campo BOOLEANO `featured`)
    const featuredProducts = useMemo(() => {
        return productsWithDiscount
            .filter(p => p.featured)
            .sort(() => 0.5 - Math.random())
            .slice(0, 8);
    }, [productsWithDiscount]);

    // LÓGICA 3: TOP VENDIDOS (usando o campo `salesCount`)
    const topSellingProducts = useMemo(() => {
        return productsWithDiscount
            .filter(p => p.salesCount > 0)
            .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
            .slice(0, 8);
    }, [productsWithDiscount]);


    // --- LÓGICA DO MODAL DE INFORMAÇÃO CONSOLIDADA (Não alterada) ---
    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState({ title: "", content: "" });

    const showModal = useCallback((title, content) => {
        setModalContent({ title, content }); setModalVisible(true);
    }, []);

    const infoModalContent = useMemo(() => ({
        "aboutUs": { title: "Sobre Nós", content: settings?.aboutUs || "Informação não disponível." },
        "support": {
            title: "Suporte",
            content: `<div><p><strong>Horário de Atendimento:</strong> ${settings?.supportHours || "Não definido"}</p><p><strong>Email:</strong> ${settings?.contactEmail || "Não definido"}</p><p><strong>Telefone:</strong> ${settings?.contactPhone || "Não definido"}</p>${settings?.contactInfo ? `<p><strong>Mais informações:</strong><br/>${settings.contactInfo}</p>` : ""}<p><strong>Informações de Envio:</strong><br/>${settings?.shippingInfo || "Não disponível"}</p><p><strong>Informações de Devolução:</strong><br/>${settings?.returnInfo || "Não disponível"}</p></div>`
        },
        "contact": {
            title: "Contacto",
            content: `<div><p><strong>Morada:</strong><br/>${settings?.address || "Não definida"}</p><p><strong>Email:</strong> ${settings?.contactEmail || "Não definido"}</p><p><strong>Telefone:</strong> ${settings?.contactPhone || "Não definido"}</p>${settings?.contactInfo ? `<p><strong>Detalhes:</strong><br/>${settings.contactInfo.replace(/\n/g, '<br/>')}</p>` : ""}<p><strong>Horário:</strong> ${settings?.supportHours || "Não definido"}</p></div>`
        }
    }), [settings]);

    const showInfoModal = useCallback((key) => {
        const config = infoModalContent[key];
        if (config) showModal(config.title, config.content);
    }, [showModal, infoModalContent]);

    // --- ESTILOS DO FOOTER COMPACTADOS ---
    const footerStyle = { backgroundColor: settings?.footerBackground || settings?.primaryColor || "#333", padding: "40px 20px 20px", color: settings?.footerTextColor || "#fff", marginTop: 40, };

    // --- HANDLERS PARA FILTRAGEM ---
    const handleFilterByFeatured = () => {
        updateFilters("selectedCategory", "Destaques");
    }

    const handleFilterByTopSelling = () => {
        updateFilters("selectedCategory", "Top Vendidos");
    }

    const handleFilterByPromotions = () => {
        if (mainPromo) updateFilters("promoFilterId", mainPromo._id);
    }

    // Funções de Rolagem e Filtragem para o Banner Global
    const filterAndScrollToProducts = () => {
        if (mainPromoForBanner) {
            updateFilters("promoFilterId", mainPromoForBanner._id);
            updateFilters("selectedCategory", "Todas as Categorias");
        }

        const productSection = document.getElementById("product-grid-section");
        if (productSection) productSection.scrollIntoView({ behavior: "smooth", block: "start" });
        else window.scrollTo({ top: 600, behavior: "smooth" });
    };

    // Funções de Rolagem e Filtragem para a Oferta do Dia
    const filterAndScrollToDailyDeal = () => {
        if (dailyDealPromotion) {
            updateFilters("promoFilterId", dailyDealPromotion._id);
            updateFilters("selectedCategory", "Todas as Categorias");
        }

        const productSection = document.getElementById("product-grid-section");
        if (productSection) productSection.scrollIntoView({ behavior: "smooth", block: "start" });
        else window.scrollTo({ top: 600, behavior: "smooth" });
    };


    // --- ESTILOS DO HERO BANNER ---
    const heroBannerStyle = { background: settings?.carouselBackground || "linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)", padding: "80px 20px", textAlign: "center", color: settings?.carouselTextColor || "#000", marginBottom: 40, };


    // Componente de Grelha de Destaque Reutilizável
    const FullWidthHighlightSection = ({ products, title, icon, onMoreClick, moreLabel, color }) => {
        // Se estiver pesquisando, esta seção não deve ser renderizada
        if (isSearching) return null;

        return (
            <div style={{ maxWidth: 1400, margin: "0 auto 60px", padding: "0 20px" }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <Title level={2} style={{ color: color || settings?.primaryColor || "#667eea", margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                        {icon} {title}
                    </Title>
                    {products.length > 0 && (
                        <Button type="link" onClick={onMoreClick} style={{ color: color || settings?.primaryColor || "#667eea", fontWeight: 600 }}>
                            {moreLabel} <RightOutlined />
                        </Button>
                    )}
                </div>

                {products.length > 0 ? (
                    <Row gutter={[20, 20]}>
                        {products.map((product) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={product._id}>
                                <ProductCard product={product} formatPrice={formatPrice} settings={settings} navigate={navigate} handleAddToCart={handleAddToCart} user={user} />
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <div style={{ textAlign: 'center', padding: '30px 0', border: `1px dashed ${settings?.secondaryTextColor || '#e8e8e8'}`, borderRadius: 8, backgroundColor: settings?.cardBackground || '#fff' }}>
                        <InfoCircleOutlined style={{ fontSize: 32, color: color || settings?.primaryColor || '#1890ff', marginBottom: 10 }} />
                        <Text style={{ color: settings?.textColor || '#000', display: 'block' }}>Sem produtos nesta seção disponíveis neste momento.</Text>
                    </div>
                )}
            </div>
        );
    };


    return (
        <div style={{ minHeight: "100vh", backgroundColor: settings?.backgroundColor || "#f8f9fa" }}>

            {/* 🔍 BARRA DE PESQUISA (SÓ O INPUT) - TOPO ABSOLUTO */}
            <div style={{ maxWidth: 1400, margin: "40px auto 40px", padding: "0 20px" }}>
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: 'center', marginBottom: 16 }}>
                    <Text style={{ marginRight: 16 }}>Mudar Moeda:</Text>
                    <Button type="default" icon={<SwapOutlined />} onClick={toggleCurrency} style={{ borderRadius: 8, height: 40, fontWeight: 600, backgroundColor: settings?.cardBackground || "#fff", borderColor: settings?.primaryColor || "#667eea", color: settings?.primaryColor || "#667eea", }}>
                        {currency === "EUR" ? "F CFA" : "EUR"}
                    </Button>
                </div>

                <Input
                    prefix={<SearchOutlined />} placeholder="Procurar camisas, clubes ou seleções..." value={searchQuery} onChange={(e) => updateFilters("searchQuery", e.target.value)} size="large"
                    style={{ borderRadius: 12, marginBottom: 24, backgroundColor: settings?.inputBackground || "#fff", color: settings?.inputTextColor || settings?.primaryColor || "#000", }}
                />
            </div>

            {/* 🌟 PREMIUM HERO BANNER 🌟 */}
            {mainPromoForBanner && !isSearching && (
                <div style={{
                    background: settings?.carouselBackground || "linear-gradient(135deg, #0d0d0d 0%, #1f1f1f 100%)",
                    borderRadius: 24,
                    margin: "20px auto 40px",
                    maxWidth: 1200,
                    padding: "60px 40px",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
                }}>
                    {/* Decorative Elements */}
                    <div style={{ position: "absolute", top: -50, left: -50, width: 200, height: 200, background: settings?.primaryColor || "#667eea", borderRadius: "50%", filter: "blur(80px)", opacity: 0.3 }}></div>
                    <div style={{ position: "absolute", bottom: -50, right: -50, width: 200, height: 200, background: settings?.secondaryColor || "#764ba2", borderRadius: "50%", filter: "blur(80px)", opacity: 0.3 }}></div>

                    <div style={{ position: "relative", zIndex: 1 }}>
                        <Tag color="gold" style={{
                            fontSize: 14, padding: "4px 12px", borderRadius: 20, marginBottom: 20, border: "none",
                            background: "rgba(255,215,0,0.2)", color: "#ffd700", textTransform: "uppercase", letterSpacing: 1
                        }}>
                            Destaque Global
                        </Tag>

                        <Title level={1} style={{
                            color: settings?.carouselTextColor || "#fff",
                            fontSize: 48,
                            marginBottom: 16,
                            fontWeight: 800,
                            textShadow: "0 2px 10px rgba(0,0,0,0.2)"
                        }}>
                            {mainPromoForBanner.title || "Super Promoção Global!"}
                        </Title>

                        {mainPromoForBanner.discount && (
                            <Text style={{
                                color: settings?.discountColor || "#ffd700",
                                fontSize: 64,
                                fontWeight: 900,
                                display: "block",
                                lineHeight: 1.1,
                                textShadow: "0 4px 15px rgba(255, 215, 0, 0.4)"
                            }}>
                                {Math.abs(mainPromoForBanner.discount).toFixed(0)}% OFF
                            </Text>
                        )}

                        <Paragraph style={{ color: "rgba(255,255,255,0.8)", fontSize: 18, maxWidth: 600, margin: "20px auto" }}>
                            Aproveite os melhores preços em camisas oficiais. Oferta por tempo limitado.
                        </Paragraph>

                        {mainPromoForBanner.code && (
                            <div style={{
                                background: "rgba(255,255,255,0.1)",
                                backdropFilter: "blur(10px)",
                                padding: "15px 30px",
                                borderRadius: 16,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 15,
                                border: "1px solid rgba(255,255,255,0.2)",
                                marginBottom: 20
                            }}>
                                <Text style={{ color: "rgba(255,255,255,0.7)", textTransform: "uppercase", fontSize: 12, letterSpacing: 1 }}>Código:</Text>
                                <Text strong style={{ color: "#fff", fontSize: 24, letterSpacing: 2 }}>{mainPromoForBanner.code}</Text>
                                <Button
                                    type="text"
                                    icon={<SwapOutlined style={{ color: "#ffd700" }} />}
                                    onClick={() => { navigator.clipboard.writeText(mainPromoForBanner.code); message.success("Código copiado!"); }}
                                    style={{ color: "#ffd700" }}
                                >
                                    Copiar
                                </Button>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 10 }}>
                            {mainPromoForBanner.validUntil && (
                                <div style={{ background: "rgba(0,0,0,0.3)", padding: "10px 20px", borderRadius: 12 }}>
                                    <CountdownTimer targetDate={mainPromoForBanner.validUntil} textColor="#fff" />
                                </div>
                            )}
                        </div>

                        <Button
                            type="primary" size="large" onClick={filterAndScrollToProducts}
                            style={{
                                marginTop: 40, height: 56, fontSize: 18, borderRadius: 28, padding: "0 48px",
                                background: settings?.buttonBackground || "#fff",
                                color: settings?.buttonTextColor || settings?.primaryColor || "#000",
                                fontWeight: 700, border: "none",
                                boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
                            }}
                        >
                            Ver Ofertas Agora
                        </Button>
                    </div>
                </div>
            )}

            {/* TRUST BAR (Benefits) */}
            {!isSearching && (
                <div style={{ maxWidth: 1200, margin: "0 auto 60px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20, padding: "0 20px" }}>
                    {[
                        { icon: <FireOutlined style={{ fontSize: 24, color: "#ff4d4f" }} />, title: "Qualidade Premium", desc: "Produtos oficiais garantidos" },
                        { icon: <SwapOutlined style={{ fontSize: 24, color: "#52c41a" }} />, title: "Devolução Fácil", desc: "30 dias para trocas" },
                        { icon: <PhoneOutlined style={{ fontSize: 24, color: "#1890ff" }} />, title: "Suporte Dedicado", desc: "Atendimento especializado" },
                        { icon: <LockOutlined style={{ fontSize: 24, color: "#faad14" }} />, title: "Pagamento Seguro", desc: "100% protegido" },
                    ].map((item, idx) => (
                        <div key={idx} style={{ background: "#fff", padding: 20, borderRadius: 12, display: "flex", alignItems: "center", gap: 15, boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
                            <div style={{ background: "rgba(0,0,0,0.04)", padding: 12, borderRadius: "50%" }}>{item.icon}</div>
                            <div>
                                <Text strong style={{ display: "block", fontSize: 16 }}>{item.title}</Text>
                                <Text type="secondary" style={{ fontSize: 13 }}>{item.desc}</Text>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {mainPromoForBanner && !isSearching && <Divider style={{ margin: '40px auto', maxWidth: 1400 }} />}

            {/* Renderizar as Seções de Destaque SOMENTE se não houver pesquisa ativa */}
            {!isSearching && (
                <>
                    {/* Oferta do Dia (Usando dailyDealPromotion) */}
                    {dailyDealPromotion && (
                        <div style={{ maxWidth: 1400, margin: "0 auto 60px", padding: "0 20px" }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <Title level={2} style={{ color: settings?.discountColor || "#ff4d4f", margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <FireOutlined style={{ color: settings?.discountColor || "#ff4d4f" }} /> Oferta do Dia
                                </Title>
                                <Button type="link" onClick={filterAndScrollToDailyDeal} style={{ color: settings?.discountColor || "#ff4d4f", fontWeight: 600 }}>
                                    Ver todas as ofertas do dia <RightOutlined />
                                </Button>
                            </div>

                            {promoProducts.length > 0 ? (
                                <Row gutter={[20, 20]}>
                                    {promoProducts.map((product) => (
                                        <Col xs={24} sm={12} md={8} lg={6} key={product._id}>
                                            <ProductCard product={product} formatPrice={formatPrice} settings={settings} navigate={navigate} handleAddToCart={handleAddToCart} user={user} />
                                        </Col>
                                    ))}
                                </Row>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '30px 0', border: `1px dashed ${settings?.secondaryTextColor || '#e8e8e8'}`, borderRadius: 8, backgroundColor: settings?.cardBackground || '#fff' }}>
                                    <InfoCircleOutlined style={{ fontSize: 32, color: settings?.discountColor || '#ff4d4f', marginBottom: 10 }} />
                                    <Text style={{ color: settings?.textColor || '#000', display: 'block' }}>A Oferta do Dia não tem produtos ativos neste momento.</Text>
                                </div>
                            )}
                        </div>
                    )}

                    <Divider style={{ margin: '40px auto', maxWidth: 1400 }} />

                    {/* Produtos em Destaque (`featured: true`) */}
                    <FullWidthHighlightSection
                        title="Produtos em Destaque"
                        products={featuredProducts}
                        icon={<StarOutlined style={{ color: settings?.primaryColor || "#667eea" }} />}
                        onMoreClick={handleFilterByFeatured}
                        moreLabel="Ver todos os destaques"
                        color={settings?.primaryColor || "#667eea"}
                    />

                    <Divider style={{ margin: '40px auto', maxWidth: 1400 }} />

                    {/* TOP VENDIDOS (`salesCount` > 0) */}
                    <FullWidthHighlightSection
                        title="Top Vendidos"
                        products={topSellingProducts}
                        icon={<ShoppingCartOutlined style={{ color: settings?.textColor || "#000" }} />}
                        onMoreClick={handleFilterByTopSelling}
                        moreLabel="Ver mais Top Vendidos"
                        color={settings?.textColor || "#000"}
                    />
                    <Divider style={{ margin: '40px auto', maxWidth: 1400 }} />
                </>
            )}


            {/* 🔍 OUTROS FILTROS E CATÁLOGO PRINCIPAL (Filtros só aparecem quando NÃO HÁ PESQUISA) */}
            <div id="product-grid-section" style={{ maxWidth: 1400, margin: "60px auto 40px", padding: "0 20px" }}>

                <Title level={2} style={{ color: settings?.textColor || "#000", marginBottom: 30 }}>
                    {isSearching ? `Resultados para "${searchQuery}"` : "Catálogo Completo"}
                </Title>

                {/* Outros Filtros (Categorias, Tamanho, Preço) são ocultados durante a pesquisa ativa */}
                {!isSearching && (
                    <>
                        {promoFilterId && mainPromo && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                                <Title level={4} style={{ margin: 0, color: settings?.textColor || settings?.primaryColor || "#000" }}>Filtro Ativo:</Title>
                                <Tag color="purple" closable onClose={() => updateFilters("promoFilterId", null)} style={{ fontSize: 16, padding: '4px 12px', color: "#000" }}>{mainPromo.title}</Tag>
                            </div>
                        )}

                        {/* CATEGORIAS ESTILO PILLS */}
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
                            {categories.map((cat) => (
                                <Button
                                    key={cat.key} type={selectedCategory === cat.key ? "primary" : "default"} onClick={() => updateFilters("selectedCategory", cat.key)}
                                    style={{ borderRadius: 20, height: 40, fontWeight: 500, backgroundColor: selectedCategory === cat.key ? settings?.primaryColor || "#667eea" : settings?.cardBackground || "#fff", borderColor: selectedCategory === cat.key ? settings?.primaryColor || "#667eea" : "#d9d9d9", color: selectedCategory === cat.key ? settings?.buttonTextColor || "#fff" : settings?.textColor || "#000", }}
                                >
                                    {cat.label}
                                </Button>
                            ))}
                        </div>

                        {/* FILTROS TAMANHO E PREÇO */}
                        <Collapse accordion ghost expandIconPosition="end" style={{ border: "none", marginBottom: 30 }}>
                            <Panel
                                header={<Title level={4} style={{ margin: 0, color: settings?.primaryColor || "#1890ff" }}>Filtrar por Tamanho e Preço</Title>}
                                key="1"
                                style={{ backgroundColor: settings?.cardBackground || "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: '1px solid #e8e8e8' }}
                            >
                                <Row gutter={16}>
                                    <Col xs={24} sm={12} md={8}>
                                        <Select mode="multiple" placeholder="Tamanhos" value={selectedSize} onChange={(val) => updateFilters("selectedSize", val)} style={{ width: "100%", marginBottom: 16 }} size="large" allowClear>
                                            {sizes.map((s) => (<Option key={s} value={s}>{s}</Option>))}
                                        </Select>
                                    </Col>
                                    <Col xs={24} sm={12} md={8}>
                                        <div>
                                            <Text strong style={{ color: settings?.textColor || settings?.primaryColor || "#000" }}>Preço: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}</Text>
                                            <Slider
                                                range min={0} max={MAX_PRICE} value={priceRange} onChange={(val) => updateFilters("priceRange", val)}
                                                tooltip={{ formatter: (val) => formatPrice(val) }}
                                                trackStyle={{ backgroundColor: settings?.primaryColor || '#1890ff' }} handleStyle={{ borderColor: settings?.primaryColor || '#1890ff' }}
                                            />
                                        </div>
                                    </Col>
                                </Row>
                            </Panel>
                        </Collapse>
                    </>
                )}


                {/* GRID DE PRODUTOS (CATÁLOGO PRINCIPAL) */}
                <Row gutter={[20, 20]}>
                    {loading
                        ? Array.from({ length: 8 }).map((_, idx) => (<Col xs={24} sm={12} md={8} lg={6} key={idx}><Skeleton active /></Col>))
                        : filteredProducts.length > 0
                            ? filteredProducts.map((product) => (
                                <Col xs={24} sm={12} md={8} lg={6} key={product._id}>
                                    <ProductCard product={product} formatPrice={formatPrice} settings={settings} navigate={navigate} handleAddToCart={handleAddToCart} user={user} />
                                </Col>
                            ))
                            : (
                                <Col span={24} style={{ textAlign: 'center', padding: '50px 0' }}>
                                    <CloseCircleOutlined style={{ fontSize: 48, color: '#f5222d', marginBottom: 16 }} />
                                    <Title level={3} style={{ color: settings?.textColor || "#000" }}>Nenhum produto encontrado.</Title>
                                    <Text style={{ color: settings?.secondaryTextColor || "rgba(0,0,0,0.65)" }}>Tente redefinir os filtros ou procure por termos diferentes.</Text>
                                    {!isSearching && <Text style={{ display: 'block', marginTop: 10 }}>Certifique-se de que o filtro de categoria/tamanho não está muito restritivo.</Text>}
                                </Col>
                            )}
                </Row>
            </div>

            {/* 🦶 FOOTER (RODAPÉ) 🦶 */}
            <footer style={footerStyle}>
                <div style={{ maxWidth: 1400, margin: "0 auto" }}>
                    <Row gutter={[32, 32]}>
                        <Col xs={24} md={8} style={{ textAlign: 'left' }}>
                            <Title level={3} style={{ color: settings?.footerTextColor || "#fff", borderBottom: `2px solid ${settings?.footerTextColor || '#fff'}`, paddingBottom: 8, marginBottom: 16 }}>
                                {settings?.siteName || "Store Name"}
                            </Title>
                            <Text style={{ color: settings?.footerTextColor || "#ccc" }}>{settings?.tagline || "O seu destino para as melhores camisas."}</Text>
                            <div style={{ marginTop: 20, display: 'flex', gap: 16 }}>
                                {settings?.facebookUrl && (<a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" style={{ color: settings?.footerTextColor || "#fff", fontSize: 24 }}><FacebookOutlined /></a>)}
                                {settings?.instagramUrl && (<a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" style={{ color: settings?.footerTextColor || "#fff", fontSize: 24 }}><InstagramOutlined /></a>)}
                                {settings?.twitterUrl && (<a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" style={{ color: settings?.footerTextColor || "#fff", fontSize: 24 }}><TwitterOutlined /></a>)}
                            </div>
                        </Col>

                        <Col xs={24} md={8} style={{ textAlign: 'left' }}>
                            <Title level={4} style={{ color: settings?.footerTextColor || "#fff", marginBottom: 16 }}>Informações</Title>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                <li style={{ marginBottom: 8 }}><Button type="link" onClick={() => showInfoModal("aboutUs")} icon={<InfoCircleOutlined />} style={{ padding: 0, color: settings?.footerTextColor || "#fff" }}>Sobre Nós</Button></li>
                                <li style={{ marginBottom: 8 }}><Button type="link" onClick={() => showInfoModal("support")} icon={<QuestionCircleOutlined />} style={{ padding: 0, color: settings?.footerTextColor || "#fff" }}>Suporte / FAQ</Button></li>
                                <li style={{ marginBottom: 8 }}><Button type="link" onClick={() => showInfoModal("contact")} icon={<PhoneOutlined />} style={{ padding: 0, color: settings?.footerTextColor || "#fff" }}>Contacto</Button></li>
                                <li style={{ marginBottom: 8 }}><Button type="link" onClick={() => navigate('/policy')} style={{ padding: 0, color: settings?.footerTextColor || "#fff" }}>Política de Privacidade</Button></li>
                            </ul>
                        </Col>

                        <Col xs={24} md={8} style={{ textAlign: 'left' }}>
                            <Title level={4} style={{ color: settings?.footerTextColor || "#fff", marginBottom: 16 }}>Fale Connosco</Title>
                            {settings?.contactEmail && (<Text style={{ display: 'block', marginBottom: 8, color: settings?.footerTextColor || "#ccc" }}>Email: <a href={`mailto:${settings.contactEmail}`} style={{ color: settings?.footerTextColor || "#fff", textDecoration: 'underline' }}>{settings.contactEmail}</a></Text>)}
                            {settings?.contactPhone && (<Text style={{ display: 'block', marginBottom: 8, color: settings?.footerTextColor || "#ccc" }}>Telefone: <a href={`tel:${settings.contactPhone}`} style={{ color: settings?.footerTextColor || "#fff", textDecoration: 'underline' }}>{settings.contactPhone}</a></Text>)}
                            {settings?.address && (<Text style={{ display: 'block', marginBottom: 8, color: settings?.footerTextColor || "#ccc" }}>Morada: {settings.address}</Text>)}
                        </Col>
                    </Row>

                    <Divider style={{ backgroundColor: settings?.footerTextColor || "#fff", margin: "20px 0" }} />

                    <div style={{ textAlign: 'center' }}>
                        <Text style={{ color: settings?.footerTextColor || "#ccc" }}>
                            © {new Date().getFullYear()} {settings?.siteName || "Store Name"}. Todos os direitos reservados.
                        </Text>
                    </div>
                </div>
            </footer>

            {/* Modal de Informação Dinâmica */}
            <Modal
                title={modalContent.title} visible={modalVisible} onCancel={() => setModalVisible(false)}
                footer={[
                    <Button
                        key="close" onClick={() => setModalVisible(false)}
                        style={{ borderRadius: 8, backgroundColor: settings?.primaryColor || "#667eea", color: settings?.buttonTextColor || "#fff", borderColor: settings?.primaryColor || "#667eea" }}
                    >
                        Fechar
                    </Button>,
                ]}
            >
                <div dangerouslySetInnerHTML={{ __html: modalContent.content }} />
            </Modal>
        </div>
    );
};

export default Home;