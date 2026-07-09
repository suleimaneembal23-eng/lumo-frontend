import React, { useState, useEffect, useContext } from "react";
import {
  Layout,
  Tabs,
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Typography,
  message,
  Table,
  Tag,
  Space,
  Divider,
  Spin,
  Modal,
  Popconfirm
} from "antd";
import {
  UserOutlined,
  ShoppingOutlined,
  LockOutlined,
  LogoutOutlined,
  SaveOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  HomeOutlined,
  PhoneOutlined,
  MailOutlined,
  DeleteOutlined,
  StopOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/Authcontext";
import { SettingsContext } from "../../context/SettingsContext";
import { useCurrency } from "../../context/CurrencyContext";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const MyProfile = () => {
  const { user, logout } = useContext(AuthContext);
  const { settings } = useContext(SettingsContext);
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Carregar dados do perfil
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchProfile();
    fetchOrders();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/clients/${user.id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Flatten address object for the form
        form.setFieldsValue({
          ...data,
          addressLine1: data.address?.line1,
          city: data.address?.city,
          country: data.address?.country
        });
      } else {
        message.error("Erro ao carregar perfil");
      }
    } catch (err) {
      console.error(err);
      message.error("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/users/profile`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdateProfile = async (values) => {
    console.log("Submitting Profile Update:", values);
    setUpdating(true);
    try {
      const res = await fetch(`/api/clients/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        message.success("Perfil atualizado com sucesso!");
        // Opcional: Atualizar contexto se o nome mudar
      } else {
        const err = await res.json();
        console.error("Update Error:", err);
        message.error(err.message || "Erro ao atualizar");
      }
    } catch (err) {
      console.error(err);
      message.error("Erro ao atualizar perfil");
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (values) => {
    console.log("Submitting Password Change:", values);
    setUpdating(true);
    try {
      const res = await fetch(
        `/api/clients/${user.id}/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(values),
        }
      );

      if (res.ok) {
        message.success("Senha alterada com sucesso!");
        passwordForm.resetFields();
      } else {
        const err = await res.json();
        console.error("Password Change Error:", err);
        message.error(err.message || "Erro ao alterar senha");
      }
    } catch (err) {
      console.error(err);
      message.error("Erro de conexão");
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    {
      title: "ID Pedido",
      dataIndex: "_id",
      key: "_id",
      render: (id) => <Text copyable>{id.substring(0, 8)}...</Text>,
    },
    {
      title: "Data",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Total",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price) => <Text strong>{formatPrice(price)}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        let text = status;
        switch (status) {
          case "paid": color = "green"; text = "Pago"; break;
          case "pending": color = "orange"; text = "Pendente"; break;
          case "shipped": color = "blue"; text = "Enviado"; break;
          case "delivered": color = "purple"; text = "Entregue"; break;
          case "cancelled": color = "red"; text = "Cancelado"; break;
          default: break;
        }
        return <Tag color={color}>{(text || '').toUpperCase()}</Tag>;
      },
    },
    {
      title: "Ações",
      key: "actions",
      render: (_, record) => (
        <Button size="small" onClick={() => navigate(`/order/${record._id}`)}>
          Detalhes
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ height: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Spin size="large" tip="Carregando perfil..." />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: settings?.backgroundColor || "#f0f2f5", padding: "40px 20px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0, color: settings?.primaryColor }}>Meu Perfil</Title>
          <Button
            danger
            icon={<LogoutOutlined />}
            onClick={() => { logout(); navigate("/"); }}
          >
            Sair
          </Button>
        </div>

        <Card
          bordered={false}
          style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
        >
          <Tabs defaultActiveKey="1" size="large">

            {/* ABA 1: DADOS PESSOAIS */}
            <TabPane tab={<span><UserOutlined /> Dados Pessoais</span>} key="1">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleUpdateProfile}
                style={{ maxWidth: 600, margin: "20px auto 0" }}
              >
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item name="name" label="Nome Completo" rules={[{ required: true }]}>
                      <Input prefix={<UserOutlined />} size="large" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
                      <Input prefix={<MailOutlined />} size="large" disabled />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="phone" label="Telefone">
                      <Input prefix={<PhoneOutlined />} size="large" />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item name="addressLine1" label="Endereço (Rua, Número, Bairro)">
                      <Input prefix={<HomeOutlined />} size="large" placeholder="Ex: Rua das Flores, 123" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="city" label="Cidade">
                      <Input size="large" placeholder="Ex: Luanda" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="country" label="País">
                      <Input size="large" placeholder="Ex: Angola" />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={updating}
                    block
                    size="large"
                    style={{ background: settings?.primaryColor, borderColor: settings?.primaryColor }}
                  >
                    Salvar Alterações
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>

            {/* ABA 2: MEUS PEDIDOS */}
            <TabPane tab={<span><ShoppingOutlined /> Meus Pedidos</span>} key="2">
              <Table
                dataSource={orders}
                columns={columns}
                rowKey="_id"
                loading={loadingOrders}
                pagination={{ pageSize: 5 }}
                locale={{ emptyText: "Você ainda não fez nenhum pedido." }}
              />
            </TabPane>

            {/* ABA 3: SEGURAN�!A */}
            <TabPane tab={<span><LockOutlined /> Segurança</span>} key="3">
              <div style={{ maxWidth: 500, margin: "20px auto 0" }}>
                <Title level={4} style={{ textAlign: "center", marginBottom: 24 }}>Alterar Senha</Title>
                <Form
                  form={passwordForm}
                  layout="vertical"
                  onFinish={handleChangePassword}
                >
                  <Form.Item
                    name="currentPassword"
                    label="Senha Atual"
                    rules={[{ required: true, message: "Digite sua senha atual" }]}
                  >
                    <Input.Password iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} size="large" />
                  </Form.Item>

                  <Form.Item
                    name="newPassword"
                    label="Nova Senha"
                    rules={[
                      { required: true, message: "Digite a nova senha" },
                      { min: 6, message: "A senha deve ter pelo menos 6 caracteres" }
                    ]}
                  >
                    <Input.Password iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} size="large" />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    label="Confirmar Nova Senha"
                    dependencies={['newPassword']}
                    rules={[
                      { required: true, message: "Confirme a nova senha" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('As senhas não coincidem!'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} size="large" />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={updating}
                    block
                    size="large"
                    danger
                  >
                    Alterar Senha
                  </Button>
                </Form>

                <Divider />

                {/* ACCOUNT MANAGEMENT */}
                <div style={{ marginTop: 40 }}>
                  <Title level={4} style={{ textAlign: "center", marginBottom: 24, color: "#ef4444" }}>Gerenciar Conta</Title>

                  <Space direction="vertical" size="large" style={{ width: "100%" }}>
                    <Popconfirm
                      title="Suspender Conta"
                      description="Tem certeza? Você não poderá fazer login até reativar sua conta."
                      onConfirm={async () => {
                        try {
                          const res = await fetch(`/api/clients/${user.id}/suspend`, {
                            method: "PUT",
                            headers: { Authorization: `Bearer ${user.token}` }
                          });
                          if (res.ok) {
                            message.success("Conta suspensa. Você será desconectado.");
                            setTimeout(() => { logout(); navigate("/"); }, 2000);
                          } else {
                            message.error("Erro ao suspender conta");
                          }
                        } catch (err) {
                          message.error("Erro de conexão");
                        }
                      }}
                      okText="Sim, suspender"
                      cancelText="Cancelar"
                      okButtonProps={{ danger: true }}
                    >
                      <Button block size="large" icon={<StopOutlined />} style={{ borderColor: "#f59e0b", color: "#f59e0b" }}>
                        Suspender Minha Conta
                      </Button>
                    </Popconfirm>

                    <Popconfirm
                      title="Eliminar Conta Permanentemente"
                      description={
                        <div>
                          <p style={{ color: "#ef4444", fontWeight: "bold" }}>�a�️ ATEN�!ÒO: Esta ação é IRREVERSÍVEL!</p>
                          <p>Todos os seus dados, pedidos e histórico serão permanentemente deletados.</p>
                        </div>
                      }
                      onConfirm={async () => {
                        try {
                          const res = await fetch(`/api/clients/${user.id}`, {
                            method: "DELETE",
                            headers: { Authorization: `Bearer ${user.token}` }
                          });
                          if (res.ok) {
                            message.success("Conta eliminada com sucesso.");
                            setTimeout(() => { logout(); navigate("/"); }, 2000);
                          } else {
                            message.error("Erro ao eliminar conta");
                          }
                        } catch (err) {
                          message.error("Erro de conexão");
                        }
                      }}
                      okText="Sim, eliminar permanentemente"
                      cancelText="Cancelar"
                      okButtonProps={{ danger: true }}
                    >
                      <Button block size="large" danger icon={<DeleteOutlined />}>
                        Eliminar Minha Conta
                      </Button>
                    </Popconfirm>
                  </Space>
                </div>
              </div>
            </TabPane>

          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default MyProfile;
