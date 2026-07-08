import React, { useEffect, useState } from "react";
import { Table, Tag, Select, message, Button, Space, Modal, Descriptions, Avatar, Typography, Steps, Divider, Card, Popconfirm } from "antd";
import { EyeOutlined, UserOutlined, ShoppingOutlined, ClockCircleOutlined, CheckCircleOutlined, CarOutlined, HomeOutlined, StopOutlined, DeleteOutlined } from "@ant-design/icons";
import { useCurrency } from "../hooks/useCurrency";

const { Option } = Select;
const { Title, Text } = Typography;
const { Step } = Steps;

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { formatPrice } = useCurrency();

  const token = localStorage.getItem("adminToken");

  const fetchOrders = async (currentFilter) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/orders?status=${currentFilter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Sort by newest
        setOrders(Array.isArray(data) ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []);
      } else {
        message.error("Erro ao buscar pedidos");
      }
    } catch (err) {
      console.error(err);
      message.error("Erro ao buscar pedidos");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders(filter);
  }, [filter]);

  const handleDelete = async (orderId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        message.success("Pedido removido com sucesso!");
        fetchOrders(filter);
        if (selectedOrder && selectedOrder._id === orderId) {
          setModalVisible(false);
          setSelectedOrder(null);
        }
      } else {
        message.error("Erro ao remover pedido.");
      }
    } catch (err) {
      console.error(err);
      message.error("Erro ao remover pedido.");
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        message.success(`Status atualizado para ${newStatus.toUpperCase()}!`);
        fetchOrders(filter);
        // Update selected order locally to reflect change in modal immediately
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        }
      } else {
        message.error("Erro ao atualizar status");
      }
    } catch (err) {
      console.error(err);
      message.error("Erro ao atualizar status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const showDetails = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "pending": return { color: "orange", label: "Pendente", icon: <ClockCircleOutlined />, step: 0 };
      case "paid": return { color: "blue", label: "Pago", icon: <CheckCircleOutlined />, step: 1 };
      case "confirmed": return { color: "cyan", label: "Confirmado", icon: <CheckCircleOutlined />, step: 2 };
      case "shipped": return { color: "purple", label: "Enviado", icon: <CarOutlined />, step: 3 };
      case "delivered": return { color: "green", label: "Entregue", icon: <HomeOutlined />, step: 4 };
      case "cancelled": return { color: "red", label: "Cancelado", icon: <StopOutlined />, step: -1 };
      default: return { color: "default", label: status, icon: <ClockCircleOutlined />, step: 0 };
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "_id",
      key: "_id",
      width: 100,
      render: text => <Text type="secondary">#{text.slice(-6).toUpperCase()}</Text>
    },
    {
      title: "Cliente",
      key: "user",
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#87d068' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong>{record.userId?.name || "Desconhecido"}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.userId?.email}</Text>
          </div>
        </Space>
      )
    },
    {
      title: "Total",
      dataIndex: "totalPrice",
      key: "total",
      render: val => <Text strong>{formatPrice(val)}</Text>
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: val => {
        const info = getStatusInfo(val);
        return <Tag color={info.color} icon={info.icon}>{info.label.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Data",
      dataIndex: "createdAt",
      key: "createdAt",
      render: val => new Date(val).toLocaleDateString("pt-PT")
    },
    {
      title: "Ações",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="primary" ghost size="small" onClick={() => showDetails(record)}>
            Gerenciar
          </Button>
          <Popconfirm
            title="Tem certeza que deseja excluir este pedido?"
            onConfirm={() => handleDelete(record._id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button type="primary" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Gestão de Pedidos</Title>
        <Select
          defaultValue="all"
          style={{ width: 200 }}
          onChange={setFilter}
          size="large"
        >
          <Option value="all">Todos os Pedidos</Option>
          <Option value="pending">Pendentes</Option>
          <Option value="paid">Pagos</Option>
          <Option value="confirmed">Confirmados</Option>
          <Option value="shipped">Enviados</Option>
          <Option value="delivered">Entregues</Option>
          <Option value="cancelled">Cancelados</Option>
        </Select>
      </div>

      <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <Table
          dataSource={orders}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        visible={modalVisible}
        title={<Title level={4} style={{ margin: 0 }}>Detalhes do Pedido #{selectedOrder?._id.slice(-6).toUpperCase()}</Title>}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>Fechar</Button>
        ]}
        width={800}
      >
        {selectedOrder && (
          <>
            {/* Status Control Section */}
            <Card style={{ marginBottom: 24, backgroundColor: '#f9f9f9', borderColor: '#e8e8e8' }} size="small">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text strong>Status Atual:</Text>
                <Select
                  value={selectedOrder.status}
                  style={{ width: 200 }}
                  onChange={(val) => handleStatusChange(selectedOrder._id, val)}
                  loading={updatingStatus}
                >
                  <Option value="pending">Pendente</Option>
                  <Option value="paid">Pago</Option>
                  <Option value="confirmed">Confirmado</Option>
                  <Option value="shipped">Enviado</Option>
                  <Option value="delivered">Entregue</Option>
                  <Option value="cancelled">Cancelado</Option>
                </Select>
              </div>
              <Steps current={getStatusInfo(selectedOrder.status).step} size="small">
                <Step title="Pendente" />
                <Step title="Pago" />
                <Step title="Confirmado" />
                <Step title="Enviado" />
                <Step title="Entregue" />
              </Steps>
            </Card>

            <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Cliente" span={2}>
                <Space>
                  <Avatar icon={<UserOutlined />} />
                  {selectedOrder.userId?.name} ({selectedOrder.userId?.email})
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Total">
                <Text strong style={{ color: '#1890ff', fontSize: 16 }}>{formatPrice(selectedOrder.totalPrice)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Método Pag.">{selectedOrder.paymentMethod}</Descriptions.Item>
              <Descriptions.Item label="Endereço de Entrega" span={2}>
                {selectedOrder.shippingAddress.line1}
                {selectedOrder.shippingAddress.line2 && `, ${selectedOrder.shippingAddress.line2}`}
                <br />
                {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.country}
                <br />
                {selectedOrder.shippingAddress.postalCode}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Itens do Pedido</Divider>

            <div style={{ maxHeight: 300, overflowY: "auto" }}>
              {selectedOrder.items.map((item) => (
                <div
                  key={item._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 12,
                    padding: 12,
                    border: "1px solid #f0f0f0",
                    borderRadius: 8,
                    backgroundColor: 'white'
                  }}
                >
                  <Avatar
                    shape="square"
                    size={64}
                    src={item.image || (item.productId && item.productId.image)}
                    icon={<ShoppingOutlined />}
                    style={{ marginRight: 16, backgroundColor: "#f5f5f5" }}
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
          </>
        )}
      </Modal>
    </div>
  );
};

export default AdminOrders;
