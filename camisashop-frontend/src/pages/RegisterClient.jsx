import React, { useState, useContext } from "react";
import { Form, Input, Button, Card, message, Modal, Typography } from "antd";
import { GiftOutlined, CopyOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { SettingsContext } from "../context/SettingsContext";

const { Title, Text, Paragraph } = Typography;

const RegisterClient = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { settings } = useContext(SettingsContext);

  const welcomeCode = settings?.welcomeCouponCode || "BEMVINDO10";
  const welcomeDiscount = settings?.welcomeCouponDiscount || 10;

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/auth/register", values);
      // message.success("Registro concluído! Faça login agora."); // Substituído pelo Modal
      setModalVisible(true);
      form.resetFields();
    } catch (err) {
      message.error(err.response?.data?.message || "Erro ao registrar");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", height: "100vh", justifyContent: "center", alignItems: "center" }}>
      <Card title="Registro Cliente" style={{ width: 350 }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Nome Completo" rules={[{ required: true, message: "Por favor, insira seu nome." }]}>
            <Input placeholder="Seu nome" />
          </Form.Item>

          <Form.Item name="username" label="Nome de Usuário" rules={[{ required: true, message: "Crie um nome de usuário." }]}>
            <Input placeholder="Ex: joaosilva (usado para login)" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email", message: "Digite um email válido" }]}
          >
            <Input placeholder="seu@email.com" />
          </Form.Item>

          <Form.Item name="password" label="Senha" rules={[{ required: true, message: "Crie uma senha segura." }]}>
            <Input.Password placeholder="******" />
          </Form.Item>

          <Form.Item
            name="confirm"
            label="Confirmar Senha"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Confirme sua senha!' },
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
            <Input.Password placeholder="Repita a senha" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Registrar
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        visible={modalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="login" type="primary" onClick={handleModalClose} size="large" block>
            Ir para Login e Usar Cupom
          </Button>
        ]}
        centered
        closable={false}
        maskClosable={false}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <GiftOutlined style={{ fontSize: 60, color: '#faad14', marginBottom: 20 }} />
          <Title level={2} style={{ marginBottom: 10 }}>Bem-vindo!</Title>
          <Paragraph style={{ fontSize: 16 }}>
            Obrigado por se registrar. Como presente de boas-vindas, aqui está um cupom exclusivo para sua primeira compra:
          </Paragraph>

          <div style={{ background: '#fffbe6', padding: '20px', borderRadius: 8, border: '1px dashed #ffe58f', marginTop: 20, marginBottom: 20 }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 5 }}>SEU CÓDIGO DE CUPOM:</Text>
            <Title level={3} style={{ margin: 0, color: '#faad14', letterSpacing: 2 }}>
              {welcomeCode}
              <Button
                type="text"
                icon={<CopyOutlined />}
                onClick={() => { navigator.clipboard.writeText(welcomeCode); message.success("Código copiado!"); }}
                style={{ marginLeft: 10, color: '#faad14' }}
              />
            </Title>
          </div>

          <Text type="secondary">
            Use este código no checkout para ganhar {welcomeDiscount}% de desconto extra!
          </Text>
        </div>
      </Modal>
    </div>
  );
};

export default RegisterClient;
