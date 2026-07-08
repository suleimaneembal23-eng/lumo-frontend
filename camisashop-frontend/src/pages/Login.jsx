import React, { useState, useContext } from "react";
import { Form, Input, Button, Card, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/Authcontext";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { loginUser, loginAdmin } = useContext(AuthContext);

  const onFinish = async (values) => {
    try {
      setLoading(true);

      const res = await axios.post("http://localhost:5000/api/auth/login", values);
      const { token, name, email, role, userId } = res.data;

      if (role === "admin") {
        // 🔹 Login de administrador - CORRIGIDO: Agora inclui o ID
        loginAdmin({ id: userId, name, email, token });
        localStorage.setItem("adminToken", token);
        localStorage.setItem("token", token); // Para as requisições do carrinho
        message.success("Login de admin realizado!");
        navigate("/admin/dashboard");
      } else {
        // 🔹 Login de cliente - CORRIGIDO: Agora inclui o ID
        loginUser({ id: userId, name, email, token });
        localStorage.setItem("userToken", token);
        localStorage.setItem("token", token); // Para as requisições do carrinho
        message.success("Login de cliente realizado!");
        navigate("/");
      }

      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
        background: "#f0f2f5",
      }}
    >
      <Card title="Login" style={{ width: 350 }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="login"
            label="Email ou Usuário"
            rules={[{ required: true, message: "Digite seu email ou nome de usuário" }]}
          >
            <Input placeholder="Digite seu email ou usuário" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Senha"
            rules={[{ required: true, message: "Digite sua senha" }]}
          >
            <Input.Password placeholder="Digite sua senha" />
          </Form.Item>

          <div style={{ textAlign: "right", marginBottom: 20 }}>
            <a href="/forgot-password" style={{ color: "#1890ff" }}>Esqueceu a palavra-passe?</a>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Entrar
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;