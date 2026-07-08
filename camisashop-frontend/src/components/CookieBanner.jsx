import React, { useState } from "react";
import { Button, Modal, Checkbox, Typography } from "antd";
import { SafetyCertificateOutlined, CloseOutlined } from "@ant-design/icons";
import { useCookieConsent } from "../context/CookieConsentContext";
import { useNavigate } from "react-router-dom";

const { Text, Paragraph, Title } = Typography;

const CookieBanner = () => {
    const { showBanner, acceptAllCookies, acceptNecessaryOnly, acceptCookies } = useCookieConsent();
    const [showSettings, setShowSettings] = useState(false);
    const [preferences, setPreferences] = useState({
        necessary: true,
        analytics: false,
        marketing: false,
    });
    const navigate = useNavigate();

    if (!showBanner) return null;

    const handleCustomAccept = () => {
        acceptCookies(preferences);
        setShowSettings(false);
    };

    return (
        <>
            {/* Banner Principal */}
            <div
                style={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    padding: "20px",
                    boxShadow: "0 -4px 20px rgba(0,0,0,0.2)",
                    zIndex: 9999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "15px",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "15px", flex: 1, minWidth: 300 }}>
                    <SafetyCertificateOutlined style={{ fontSize: 32, color: "#fff" }} />
                    <div>
                        <Title level={5} style={{ color: "#fff", margin: 0, marginBottom: 5 }}>
                            🍪 Este site usa cookies
                        </Title>
                        <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 14 }}>
                            Usamos cookies para melhorar sua experiência, analisar o tráfego e personalizar conteúdo.{" "}
                            <a
                                onClick={() => navigate("/policy")}
                                style={{ color: "#fff", textDecoration: "underline", cursor: "pointer" }}
                            >
                                Saiba mais
                            </a>
                        </Text>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <Button
                        type="default"
                        onClick={() => setShowSettings(true)}
                        style={{
                            borderRadius: 8,
                            fontWeight: 500,
                            background: "rgba(255,255,255,0.2)",
                            color: "#fff",
                            border: "1px solid rgba(255,255,255,0.3)",
                        }}
                    >
                        Personalizar
                    </Button>
                    <Button
                        type="default"
                        onClick={acceptNecessaryOnly}
                        style={{
                            borderRadius: 8,
                            fontWeight: 500,
                            background: "rgba(255,255,255,0.2)",
                            color: "#fff",
                            border: "1px solid rgba(255,255,255,0.3)",
                        }}
                    >
                        Apenas Necessários
                    </Button>
                    <Button
                        type="primary"
                        onClick={acceptAllCookies}
                        style={{
                            borderRadius: 8,
                            fontWeight: 600,
                            background: "#fff",
                            color: "#667eea",
                            border: "none",
                        }}
                    >
                        Aceitar Todos
                    </Button>
                </div>
            </div>

            {/* Modal de Configurações */}
            <Modal
                title={
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <SafetyCertificateOutlined style={{ fontSize: 24, color: "#667eea" }} />
                        <span>Configurações de Cookies</span>
                    </div>
                }
                open={showSettings}
                onCancel={() => setShowSettings(false)}
                footer={[
                    <Button key="necessary" onClick={() => {
                        acceptNecessaryOnly();
                        setShowSettings(false);
                    }}>
                        Apenas Necessários
                    </Button>,
                    <Button key="custom" type="primary" onClick={handleCustomAccept}>
                        Salvar Preferências
                    </Button>,
                    <Button
                        key="all"
                        type="primary"
                        style={{ background: "#52c41a", borderColor: "#52c41a" }}
                        onClick={() => {
                            acceptAllCookies();
                            setShowSettings(false);
                        }}
                    >
                        Aceitar Todos
                    </Button>,
                ]}
                width={600}
            >
                <Paragraph style={{ marginBottom: 20 }}>
                    Usamos diferentes tipos de cookies para otimizar sua experiência em nosso site.
                    Escolha quais categorias você deseja permitir:
                </Paragraph>

                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* Cookies Necessários */}
                    <div
                        style={{
                            padding: 15,
                            background: "#f5f5f5",
                            borderRadius: 8,
                            border: "1px solid #d9d9d9",
                        }}
                    >
                        <Checkbox checked disabled style={{ marginBottom: 8 }}>
                            <Text strong>Cookies Necessários</Text>
                        </Checkbox>
                        <Paragraph style={{ marginLeft: 24, marginBottom: 0, fontSize: 13, color: "#666" }}>
                            Essenciais para o funcionamento do site. Incluem autenticação, carrinho de compras e
                            preferências básicas. Não podem ser desativados.
                        </Paragraph>
                    </div>

                    {/* Cookies de Análise */}
                    <div
                        style={{
                            padding: 15,
                            background: "#f5f5f5",
                            borderRadius: 8,
                            border: "1px solid #d9d9d9",
                        }}
                    >
                        <Checkbox
                            checked={preferences.analytics}
                            onChange={(e) =>
                                setPreferences({ ...preferences, analytics: e.target.checked })
                            }
                            style={{ marginBottom: 8 }}
                        >
                            <Text strong>Cookies de Análise</Text>
                        </Checkbox>
                        <Paragraph style={{ marginLeft: 24, marginBottom: 0, fontSize: 13, color: "#666" }}>
                            Nos ajudam a entender como os visitantes interagem com o site, coletando e
                            relatando informações anonimamente.
                        </Paragraph>
                    </div>

                    {/* Cookies de Marketing */}
                    <div
                        style={{
                            padding: 15,
                            background: "#f5f5f5",
                            borderRadius: 8,
                            border: "1px solid #d9d9d9",
                        }}
                    >
                        <Checkbox
                            checked={preferences.marketing}
                            onChange={(e) =>
                                setPreferences({ ...preferences, marketing: e.target.checked })
                            }
                            style={{ marginBottom: 8 }}
                        >
                            <Text strong>Cookies de Marketing</Text>
                        </Checkbox>
                        <Paragraph style={{ marginLeft: 24, marginBottom: 0, fontSize: 13, color: "#666" }}>
                            Usados para rastrear visitantes em sites. A intenção é exibir anúncios relevantes
                            e envolventes para o usuário individual.
                        </Paragraph>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default CookieBanner;
