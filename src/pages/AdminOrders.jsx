
import React, { useEffect, useState } from "react";
import { Table, Tag, Select, message, Button, Space, Modal, Descriptions, Avatar, Typography, Steps, Divider, Card, Popconfirm } from "antd";
import {
  EyeOutlined, UserOutlined, ShoppingOutlined, ClockCircleOutlined, CheckCircleOutlined, CarOutlined, HomeOutlined, SearchOutlined,
  FilterOutlined, StopOutlined, DeleteOutlined
} from "@ant-design/icons";

import { useCurrency } from "../context/CurrencyContext";

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
      const res = await fetch(`/api/orders?status=${currentFilter}`, {
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
      const res = await fetch(`/api/orders/${orderId}`, {
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

  const handleStatusChange = async (orderId, shopId, newStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shopId, status: newStatus }),
      });
      if (res.ok) {
        message.success(`Status atualizado para ${newStatus.toUpperCase()}!`);
        fetchOrders(filter);
        if (selectedOrder && selectedOrder._id === orderId) {
          const updatedOrder = await res.json();
          setSelectedOrder(updatedOrder);
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
      render: text => <Text type="secondary">#{text ? text.slice(-6).toUpperCase() : 'N/A'}</Text>
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
      title: "Status Global",
      key: "status",
      render: (_, record) => {
        if (!record.shopOrders || record.shopOrders.length === 0) return <Tag>N/A</Tag>;
        const statuses = record.shopOrders.map(s => s.status);
        let globalStatus = "pending";
        if (statuses.every(s => s === "delivered")) globalStatus = "delivered";
        else if (statuses.every(s => s === "shipped" || s === "delivered")) globalStatus = "shipped";
        else if (statuses.every(s => s === "paid")) globalStatus = "paid";
        else if (statuses.some(s => s === "shipped")) globalStatus = "shipped";
        else if (statuses.some(s => s === "paid")) globalStatus = "paid";
        
        const info = getStatusInfo(globalStatus);
        return <Tag color={info.color} icon={info.icon}>{(info.label || '').toUpperCase()}</Tag>;
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
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 min-h-[80vh]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 m-0 tracking-tight">Gestão de Pedidos</h1>
          <p className="text-gray-500 mt-2 text-base">Acompanhe e atualize o status dos pedidos em tempo real.</p>
        </div>
        <div className="bg-gray-50 p-1 rounded-xl border border-gray-100">
          <Select
            defaultValue="all"
            style={{ width: 220 }}
            onChange={setFilter}
            size="large"
            bordered={false}
            className="font-medium"
            dropdownStyle={{ borderRadius: 12, padding: 8 }}
          >
            <Option value="all">Todos os Pedidos</Option>
            <Option value="pending">�xx� Pendentes</Option>
            <Option value="paid">�xx� Pagos</Option>
            <Option value="confirmed">�x� Confirmados</Option>
            <Option value="shipped">�xaa Enviados</Option>
            <Option value="delivered">�x�� Entregues</Option>
            <Option value="cancelled">�x� Cancelados</Option>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total: ${total} pedidos` }}
          className="shadow-sm rounded-2xl overflow-hidden border border-gray-100"
          locale={{
            emptyText: (
              <div className="py-16">
                <div className="text-6xl mb-4">�x�</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  {filter === 'all' ? 'Nenhum pedido encontrado' : `Nenhum pedido ${getStatusInfo(filter).label.toLowerCase()}`}
                </h3>
                <p className="text-gray-500">
                  {filter === 'all'
                    ? 'Ainda não há pedidos no sistema.'
                    : `Não há pedidos com status "${getStatusInfo(filter).label}" no momento.`}
                </p>
              </div>
            )
          }}
          rowClassName="hover:bg-gray-50 transition-colors"
        />
      </div>

      <Modal
        visible={modalVisible}
        title={null}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={900}
        centered
        maskClosable={false}
        bodyStyle={{ padding: 0 }}
        closeIcon={<span className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors">�S"</span>}
      >
        {selectedOrder && (
          <div className="overflow-hidden rounded-2xl">
            {/* Modal Header */}
            <div className="bg-gray-50 p-8 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 m-0">Pedido #{selectedOrder._id.slice(-6).toUpperCase()}</h2>
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                  <ClockCircleOutlined /> {new Date(selectedOrder.createdAt).toLocaleDateString("pt-PT", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Total do Pedido</p>
                  <p className="text-2xl font-extrabold text-blue-600 m-0">{formatPrice(selectedOrder.totalPrice)}</p>
                </div>
              </div>
            </div>

            {/* Status Control e Itens */}
            <div className="p-8 bg-white overflow-y-auto max-h-[60vh]">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><UserOutlined /> Cliente</h3>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-4">
                    <Avatar size={48} icon={<UserOutlined />} className="bg-white text-gray-400 border border-gray-200" />
                    <div>
                      <p className="font-bold text-gray-900 m-0">{selectedOrder.userId?.name || "Convidado"}</p>
                      <p className="text-gray-500 text-sm m-0">{selectedOrder.userId?.email || "Sem email"}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><HomeOutlined /> Endereço Global</h3>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-600">
                    <p className="font-bold text-gray-900 mb-1">{selectedOrder.shippingAddress?.line1}</p>
                    <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.country}</p>
                    <p className="mt-2 text-xs uppercase tracking-wide font-bold text-gray-400">Telefone: {selectedOrder.shippingAddress?.phone}</p>
                  </div>
                </div>
              </div>

              <Divider />
              <h3 className="text-xl font-bold text-gray-900 mb-6">Sub-Pedidos por Loja</h3>
              
              <div className="space-y-8">
                {selectedOrder.shopOrders?.map((shopOrder) => (
                  <div key={shopOrder.shopId || shopOrder._id} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    {/* Header do Sub-Pedido */}
                    <div className="bg-gray-50 p-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                          <ShoppingOutlined className="text-blue-600 text-lg" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 m-0 text-lg">{shopOrder.shopName}</h4>
                          <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded-md">
                            Tracking: {shopOrder.trackingCode || "N/A"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-sm font-bold text-gray-600">
                          Entrega: <span className="text-blue-600">{shopOrder.deliveryMethod?.toUpperCase()}</span>
                        </div>
                        <Select
                          value={shopOrder.status}
                          style={{ width: 160 }}
                          onChange={(val) => handleStatusChange(selectedOrder._id, shopOrder.shopId, val)}
                          loading={updatingStatus}
                          size="middle"
                          className="font-bold"
                        >
                          <Option value="pending">Pendente</Option>
                          <Option value="paid">Pago</Option>
                          <Option value="confirmed">Confirmado</Option>
                          <Option value="shipped">Enviado</Option>
                          <Option value="delivered">Entregue</Option>
                          <Option value="cancelled">Cancelado</Option>
                        </Select>
                      </div>
                    </div>
                    
                    {/* Itens deste Sub-Pedido */}
                    <div className="bg-white p-4">
                      {shopOrder.items.map((item) => (
                        <div key={item._id} className="flex items-center py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors rounded-lg px-2">
                          <div className="h-14 w-14 bg-white rounded-md border border-gray-100 overflow-hidden flex-shrink-0 p-1">
                            <img src={item.image || (item.productId && item.productId.image)} alt={item.name} className="h-full w-full object-contain mix-blend-multiply" />
                          </div>
                          <div className="ml-4 flex-1">
                            <p className="font-bold text-gray-900 m-0 text-sm">{item.name}</p>
                            <p className="text-xs text-gray-500 m-0">
                              Tamanho: <span className="font-medium text-gray-700">{item.size || item.selectedSize || "N/A"}</span> | Qtd: <span className="font-medium text-gray-700">{item.quantity}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 m-0 text-sm">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-100 text-right">
              <Button size="large" onClick={() => setModalVisible(false)} style={{ borderRadius: 8 }}>Fechar Detalhes</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminOrders;
