import React, { useContext } from "react";
import { Typography, Card, Divider, Row, Col } from "antd";
import { BookOutlined, CheckCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { SettingsContext } from "../context/SettingsContext";

const { Title, Paragraph, Text } = Typography;

const Terms = () => {
    const { settings } = useContext(SettingsContext);
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
                    <BookOutlined style={{ fontSize: 64, color: settings?.primaryColor || "#1890ff", marginBottom: 16 }} />
                    <Title level={1} style={{ marginBottom: 8 }}>
                        Termos e Condições
                    </Title>
                    <Text type="secondary" style={{ fontSize: 16 }}>
                        �altima atualização: {new Date().toLocaleDateString("pt-PT")}
                    </Text>
                </div>

                <Divider />

                <Row gutter={[24, 24]}>
                    <Col span={24}>
                        <Title level={3}>
                            <InfoCircleOutlined style={{ marginRight: 8, color: settings?.primaryColor || "#1890ff" }} />
                            1. Introdução
                        </Title>
                        <Paragraph>
                            Bem-vindo à {siteName}. Ao aceder e utilizar o nosso website, concorda em cumprir e ficar vinculado aos seguintes Termos e Condições de Uso. Se não concordar com qualquer parte destes termos, não deverá utilizar o nosso website.
                        </Paragraph>
                    </Col>

                    <Col span={24}>
                        <Title level={3}>
                            <CheckCircleOutlined style={{ marginRight: 8, color: settings?.primaryColor || "#1890ff" }} />
                            2. Condições Gerais
                        </Title>
                        <Paragraph>
                            A {siteName} reserva-se o direito de recusar o serviço a qualquer pessoa, por qualquer motivo e a qualquer momento. Você entende que o seu conteúdo (excluindo informações de cartão de crédito) pode ser transferido sem criptografia e envolver transmissões em várias redes.
                        </Paragraph>
                    </Col>

                    <Col span={24}>
                        <Title level={3}>3. Produtos e Preços</Title>
                        <Paragraph>
                            Todos os produtos apresentados estão sujeitos à disponibilidade de stock. Reservamo-nos o direito de descontinuar produtos a qualquer momento ou alterar os preços sem aviso prévio. Fazemos os possíveis para exibir com a maior precisão possível as cores e imagens dos nossos produtos.
                        </Paragraph>
                    </Col>

                    <Col span={24}>
                        <Title level={3}>4. Informações de Faturação e Conta</Title>
                        <Paragraph>
                            Reservamo-nos o direito de recusar qualquer pedido que faça connosco. Podemos, a nosso critério, limitar ou cancelar quantidades compradas por pessoa, por domicílio ou por pedido. O cliente concorda em fornecer informações de compra e de conta atuais, completas e precisas para todas as compras.
                        </Paragraph>
                    </Col>

                    <Col span={24}>
                        <Title level={3}>5. Pagamentos e Fraudes</Title>
                        <Paragraph>
                            A {siteName} aceita os métodos de pagamento indicados na finalização da compra, que incluem serviços Mobile Money e Transferência. Tentativas de fraude com comprovativos falsos resultarão no banimento permanente da conta e comunicação às autoridades locais.
                        </Paragraph>
                    </Col>
                </Row>

                <Divider />

                <div style={{ textAlign: "center", marginTop: 40 }}>
                    <Text type="secondary">
                        © {new Date().getFullYear()} {siteName}. Todos os direitos reservados.
                    </Text>
                </div>
            </Card>
        </div>
    );
};

export default Terms;

