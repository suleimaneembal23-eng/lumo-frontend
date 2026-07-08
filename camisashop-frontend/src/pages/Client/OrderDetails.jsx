// src/pages/Client/MyProfile.jsx
import React, { useState, useEffect } from "react";
import { Form, Input, Button, message } from "antd";

const MyProfile = () => {
  const [form] = Form.useForm();
  const [user, setUser] = useState({});

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUser(userData);
      form.setFieldsValue(userData);
    }
  }, [form]);

  const handleSubmit = () => {
    message.success("Perfil atualizado com sucesso!");
  };

  return (
    <div>
      <h2>👤 Meu Perfil</h2>
      <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ maxWidth: 500 }}>
        <Form.Item name="name" label="Nome">
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email">
          <Input disabled />
        </Form.Item>
        <Form.Item name="password" label="Nova senha">
          <Input.Password placeholder="Deixe em branco se não quiser mudar" />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          Salvar alterações
        </Button>
      </Form>
    </div>
  );
};

export default MyProfile;
