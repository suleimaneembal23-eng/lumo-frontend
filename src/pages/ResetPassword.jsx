import React, { useState } from "react";
import { Form, Input, Button, Card, message, Typography } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";

const { Title } = Typography;

const ResetPassword = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { token } = useParams();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/auth/reset-password/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: values.password })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Erro ao redefinir senha.");

            message.success(data.message);
            navigate("/login");
        } catch (err) {
            message.error(err.message);
        }
        setLoading(false);
    };

    return (
        <div style={{ display: "flex", height: "100vh", justifyContent: "center", alignItems: "center", background: "#f0f2f5" }}>
            <Card style={{ width: 400, textAlign: "center" }}>
                <Title level={3}>Nova Senha �x</Title>

                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: "Digite a nova senha!" }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Nova Senha" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="confirm"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Confirme a senha!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('As senhas não coincidem!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Confirmar Nova Senha" size="large" />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                        Salvar Senha
                    </Button>
                </Form>
            </Card>
        </div>
    );
};

export default ResetPassword;
