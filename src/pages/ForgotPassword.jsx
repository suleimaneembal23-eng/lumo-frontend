import React, { useState } from "react";
import { Form, Input, Button, Card, message, Typography } from "antd";
import { MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const ForgotPassword = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values)
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Erro ao enviar email.");

            message.success(data.message);
            // Opcional: navegar para login ou apenas mostrar mensagem
        } catch (err) {
            message.error(err.message);
        }
        setLoading(false);
    };

    return (
        <div style={{ display: "flex", height: "100vh", justifyContent: "center", alignItems: "center", background: "#f0f2f5" }}>
            <Card style={{ width: 400, textAlign: "center" }}>
                <Title level={3}>Recuperar Senha ðŸ”’</Title>
                <Text type="secondary" style={{ display: "block", marginBottom: 20 }}>
                    Digite seu email para receber um link de redefiniÃ§Ã£o.
                </Text>

                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        name="email"
                        rules={[{ required: true, type: "email", message: "Digite um email vÃ¡lido!" }]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Seu email cadastrado" size="large" />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block size="large" loading={loading} style={{ marginBottom: 10 }}>
                        Enviar Link
                    </Button>

                    <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate("/login")}>
                        Voltar para Login
                    </Button>
                </Form>
            </Card>
        </div>
    );
};

export default ForgotPassword;
