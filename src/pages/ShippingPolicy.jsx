�import React, { useContext } from "react";
import { Typography, Card, Divider, Row, Col, Timeline, Alert } from "antd";
import { Truck, Clock, MapPin, Package, Store } from "lucide-react";
import { SettingsContext } from "../context/SettingsContext";
import { useCurrency } from "../context/CurrencyContext";

const { Title, Paragraph, Text } = Typography;

const ShippingPolicy = () => {
    const { settings } = useContext(SettingsContext);
    const { formatPrice } = useCurrency();
    const siteName = settings?.siteName || "Lumo";

    return (
        <div style={{ padding: "40px 24px", maxWidth: 1200, margin: "0 auto" }}>
            <Card
                bordered={false}
                style={{
                    borderRadius: 16,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                    <Truck size={64} color={settings?.primaryColor || "#1890ff"} style={{ marginBottom: 16 }} />
                    <Title level={1} style={{ marginBottom: 8 }}>
                        Envios e Entregas Multi-Loja
                    </Title>
                    <Text type="secondary" style={{ fontSize: 16 }}>
                        O marketplace que conecta dezenas de vendedores verificados diretamente a si.
                    </Text>
                </div>

                <Divider />

                <Alert 
                    message="Encomendas de Múltiplos Vendedores"
                    description="Como somos um marketplace, se o seu carrinho tiver artigos de diferentes lojas (vendedores), estes serão preparados e despachados em encomendas separadas, chegando em prazos diferentes! Cada loja tem os seus próprios custos e parceiros de envio."
                    type="info"
                    showIcon
                    style={{ marginBottom: 32 }}
                />

                <Row gutter={[48, 24]}>
                    <Col xs={24} md={12}>
                        <Title level={3}>Custos de Envio</Title>
                        <Paragraph>
                            Na {siteName}, os vendedores são responsáveis pelo empacotamento e expedição dos seus próprios produtos.
                            Isto significa que os métodos de envio e os respectivos preços dependem inteiramente do vendedor que está a comercializar o artigo.
                        </Paragraph>

                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-6">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-2 rounded-lg bg-blue-100">
                                    <Store className="text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 m-0">Consulte cada Produto</h4>
                                    <p className="text-gray-500 m-0">Na página do artigo encontrará estimativas de tempo e os seus custos de transportadora.</p>
                                </div>
                            </div>
                            <Divider style={{ margin: "12px 0" }} />
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-yellow-100">
                                    <Package className="text-yellow-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 m-0">Cálculo Automático</h4>
                                    <p className="text-gray-500 m-0">No Checkout, os portes serão agrupados (ou separados) por vendedor magicamente para si.</p>
                                </div>
                            </div>
                        </div>

                        <Paragraph>
                            * Os prazos de entrega começam a contar após a plataforma confirmar globalmente o pagamento e notificar os vendedores.
                        </Paragraph>
                    </Col>

                    <Col xs={24} md={12}>
                        <Title level={3}>Processo Padrão de Expedição</Title>
                        <Timeline
                            items={[
                                {
                                    color: 'green',
                                    children: 'Pagamento Confirmado (Plataforma Lumo)',
                                },
                                {
                                    color: 'blue',
                                    children: 'Vendedor(es) notificados',
                                },
                                {
                                    color: 'blue',
                                    children: 'Processamento e Embalamento na(s) Loja(s)',
                                },
                                {
                                    color: 'gray',
                                    children: 'Entrega Logística (Em Trânsito Separadamente)',
                                },
                                {
                                    color: 'green',
                                    children: 'Entregue no seu destino!',
                                },
                            ]}
                        />
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default ShippingPolicy;
