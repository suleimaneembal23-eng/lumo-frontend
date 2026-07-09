
import React, { useEffect, useState, useContext } from "react";
import { Table, Tag, Button, Modal, Descriptions, Typography, Space, Avatar, Steps, Card, Divider } from "antd";
import { EyeOutlined, ShoppingOutlined, ClockCircleOutlined, CheckCircleOutlined, CarOutlined, HomeOutlined, StopOutlined, WhatsAppOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useCurrency } from "../../context/CurrencyContext";
import { SettingsContext } from "../../context/SettingsContext";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { formatPrice } = useCurrency();
  const { settings } = useContext(SettingsContext);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("userToken");
        const res = await fetch(`/api/orders/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        // Ordenar por data (mais recente primeiro)
        setOrders(Array.isArray(data) ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusInfo = (status) => {
    switch (status) {
      case "pending": return { color: "orange", label: "Pendente", icon: <ClockCircleOutlined />, step: 0 };
      case "confirmed": return { color: "cyan", label: "Confirmado", icon: <CheckCircleOutlined />, step: 1 };
      case "paid": return { color: "blue", label: "Pago / Em Processamento", icon: <CheckCircleOutlined />, step: 2 };
      case "shipped": return { color: "purple", label: "Enviado", icon: <CarOutlined />, step: 3 };
      case "delivered": return { color: "green", label: "Entregue", icon: <HomeOutlined />, step: 4 };
      case "cancelled": return { color: "red", label: "Cancelado", icon: <StopOutlined />, step: -1 };
      default: return { color: "default", label: status, icon: <ClockCircleOutlined />, step: 0 };
    }
  };

  const showDetails = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const columns = [
    {
      title: "Pedido",
      dataIndex: "_id",
      key: "_id",
      render: (text) => <Text strong>#{text ? text.slice(-6).toUpperCase() : 'N/A'}</Text>,
    },
    {
      title: "Data",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("pt-PT"),
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
        const info = getStatusInfo(status);
        return (
          <Tag color={info.color} icon={info.icon}>
            {(info.label || '').toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Ações",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          ghost
          icon={<EyeOutlined />}
          onClick={() => showDetails(record)}
        >
          Detalhes
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
          <ShoppingOutlined style={{ fontSize: 28, color: "#1890ff", marginRight: 10 }} />
          <Title level={2} style={{ margin: 0 }}>Meus Pedidos</Title>
        </div>

        <Table
          columns={columns}
          dataSource={orders}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <Modal
        title={
          <Space>
            <ShoppingOutlined />
            <Text strong>Detalhes do Pedido #{selectedOrder?._id.slice(-6).toUpperCase()}</Text>
          </Space>
        }
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Fechar
          </Button>
        ]}
        width={700}
      >
        {selectedOrder && (
          <>
            {/* Status Timeline */}
            <div style={{ marginBottom: 30, marginTop: 10 }}>
              <Steps current={getStatusInfo(selectedOrder.status).step} size="small">
                <Step title="Pendente" icon={<ClockCircleOutlined />} />
                <Step title="Confirmado" icon={<CheckCircleOutlined />} />
                <Step title="Pago" icon={<CheckCircleOutlined />} />
                <Step title="Enviado" icon={<CarOutlined />} />
                <Step title="Entregue" icon={<HomeOutlined />} />
              </Steps>
            </div>

            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
              <Descriptions.Item label="Data do Pedido">
                {new Date(selectedOrder.createdAt).toLocaleString("pt-PT")}
              </Descriptions.Item>
              <Descriptions.Item label="Total">
                <Text strong style={{ color: "#1890ff", fontSize: 16 }}>
                  {formatPrice(selectedOrder.totalPrice)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Endereço de Entrega" span={2}>
                {selectedOrder.shippingAddress.line1}
                {selectedOrder.shippingAddress.line2 && `, ${selectedOrder.shippingAddress.line2}`}
                <br />
                {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.country}
                <br />
                {selectedOrder.shippingAddress.postalCode && `CP: ${selectedOrder.shippingAddress.postalCode}`}
              </Descriptions.Item>
              <Descriptions.Item label="Envio">
                <Text strong>{selectedOrder.shippingMethod?.toUpperCase() || "STANDARD"}</Text>
                <br />
                <Text type="secondary">{formatPrice(selectedOrder.shippingPrice || 0)}</Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Itens do Pedido</Divider>

            <div style={{ maxHeight: 300, overflowY: "auto", marginBottom: 20 }}>
              {selectedOrder.items && selectedOrder.items.map((item) => (
                <div
                  key={item._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 15,
                    padding: 10,
                    border: "1px solid #f0f0f0",
                    borderRadius: 8
                  }}
                >
                  <Avatar
                    shape="square"
                    size={64}
                    src={item.image || (item.productId && item.productId.image)}
                    icon={<ShoppingOutlined />}
                    style={{ marginRight: 15, backgroundColor: "#f5f5f5" }}
                  />
                  <div style={{ flex: 1 }}>
                    <Text strong>{item.name}</Text>
                    <br />
                    <Text type="secondary">Tamanho: {item.size || item.selectedSize || "N/A"}</Text>
                    <br />
                    <Text type="secondary">Qtd: {item.quantity}</Text>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <Text strong>{formatPrice(item.price)}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Total: {formatPrice(item.price * item.quantity)}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
            {/* �x� INSTRU�!�"ES DE PAGAMENTO (Se pendente) */}
            {selectedOrder.status === 'pending' && (
              <div style={{ marginTop: 20, padding: 15, backgroundColor: "#fffbe6", border: "1px solid #ffe58f", borderRadius: 8 }}>
                <Title level={5} style={{ color: "#faad14", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <InfoCircleOutlined /> Aguardando Pagamento
                </Title>
                <Paragraph style={{ marginTop: 10, marginBottom: 15 }}>
                  O seu pedido está reservado, mas precisa de efetuar o pagamento via <strong>{selectedOrder.paymentMethod === 'orange_money' ? 'Orange Money' : selectedOrder.paymentMethod === 'transfer' ? 'Transferência Bancária' : 'pagamento manual'}</strong> para darmos seguimento.
                </Paragraph>
                
                {selectedOrder.paymentMethod === 'orange_money' && (
                  <div style={{ background: "#fff", padding: 10, borderRadius: 6, border: "1px solid #d9d9d9", marginBottom: 15 }}>
                    <Text strong>Instruções Orange Money:</Text>
                    <br />
                    Envie {formatPrice(selectedOrder.totalPrice)} para o número: <Text strong copyable style={{ color: "#fa8c16", fontSize: 16 }}>{settings?.paymentConfig?.orangeMoneyNumber || "N/D"}</Text>
                  </div>
                )}

                {selectedOrder.paymentMethod === 'transfer' && (
                  <div style={{ background: "#fff", padding: 10, borderRadius: 6, border: "1px solid #d9d9d9", marginBottom: 15 }}>
                    <Text strong>Transferência Bancária:</Text>
                    <br />
                    IBAN: <Text strong copyable style={{ color: "#1890ff" }}>{settings?.paymentConfig?.iban || "N/D"}</Text>
                  </div>
                )}

                <Button 
                  type="primary" 
                  size="large"
                  block 
                  icon={<WhatsAppOutlined />} 
                  style={{ backgroundColor: "#25D366", borderColor: "#25D366", fontWeight: "bold" }}
                  onClick={() => {
                    const msg = `Olá! Quero enviar o comprovativo do meu pedido #${selectedOrder._id.slice(-6).toUpperCase()}. O valor é ${formatPrice(selectedOrder.totalPrice)}.`;
                    const whatsappNumber = settings?.contactPhone?.replace(/\D/g, '') || "245XXXXXXX";
                    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                >
                  Enviar Comprovativo pelo WhatsApp
                </Button>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default MyOrders;
