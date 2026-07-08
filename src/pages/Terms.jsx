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
                        Termos e CondiÃ§Ãµes
                    </Title>
                    <Text type="secondary" style={{ fontSize: 16 }}>
                        Ãšltima atualizaÃ§Ã£o: {new Date().toLocaleDateString("pt-PT")}
                    </Text>
                </div>

                <Divider />

                <Row gutter={[24, 24]}>
                    <Col span={24}>
                        <Title level={3}>
                            <InfoCircleOutlined style={{ marginRight: 8, color: settings?.primaryColor || "#1890ff" }} />
                            1. IntroduÃ§Ã£o
                        </Title>
                        <Paragraph>
                            Bem-vindo Ã  {siteName}. Ao aceder e utilizar o nosso website, concorda em cumprir e ficar vinculado aos seguintes Termos e CondiÃ§Ãµes de Uso. Se nÃ£o concordar com qualquer parte destes termos, nÃ£o deverÃ¡ utilizar o nosso website.
                        </Paragraph>
                    </Col>

                    <Col span={24}>
                        <Title level={3}>
                            <CheckCircleOutlined style={{ marginRight: 8, color: settings?.primaryColor || "#1890ff" }} />
                            2. CondiÃ§Ãµes Gerais
                        </Title>
                        <Paragraph>
                            A {siteName} reserva-se o direito de recusar o serviÃ§o a qualquer pessoa, por qualquer motivo e a qualquer momento. VocÃª entende que o seu conteÃºdo (excluindo informaÃ§Ãµes de cartÃ£o de crÃ©dito) pode ser transferido sem criptografia e envolver transmissÃµes em vÃ¡rias redes.
                        </Paragraph>
                    </Col>

                    <Col span={24}>
                        <Title level={3}>3. Produtos e PreÃ§os</Title>
                        <Paragraph>
                            Todos os produtos apresentados estÃ£o sujeitos Ã  disponibilidade de stock. Reservamo-nos o direito de descontinuar produtos a qualquer momento ou alterar os preÃ§os sem aviso prÃ©vio. Fazemos os possÃ­veis para exibir com a maior precisÃ£o possÃ­vel as cores e imagens dos nossos produtos.
                        </Paragraph>
                    </Col>

                    <Col span={24}>
                        <Title level={3}>4. InformaÃ§Ãµes de FaturaÃ§Ã£o e Conta</Title>
                        <Paragraph>
                            Reservamo-nos o direito de recusar qualquer pedido que faÃ§a connosco. Podemos, a nosso critÃ©rio, limitar ou cancelar quantidades compradas por pessoa, por domicÃ­lio ou por pedido. O cliente concorda em fornecer informaÃ§Ãµes de compra e de conta atuais, completas e precisas para todas as compras.
                        </Paragraph>
                    </Col>

                    <Col span={24}>
                        <Title level={3}>5. Pagamentos e Fraudes</Title>
                        <Paragraph>
                            A {siteName} aceita os mÃ©todos de pagamento indicados na finalizaÃ§Ã£o da compra, que incluem serviÃ§os Mobile Money e TransferÃªncia. Tentativas de fraude com comprovativos falsos resultarÃ£o no banimento permanente da conta e comunicaÃ§Ã£o Ã s autoridades locais.
                        </Paragraph>
                    </Col>
                </Row>

                <Divider />

                <div style={{ textAlign: "center", marginTop: 40 }}>
                    <Text type="secondary">
                        Â© {new Date().getFullYear()} {siteName}. Todos os direitos reservados.
                    </Text>
                </div>
            </Card>
        </div>
    );
};

export default Terms;

