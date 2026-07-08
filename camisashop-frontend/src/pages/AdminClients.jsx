import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, message, Space, Tag } from "antd";
import { EditOutlined, DeleteOutlined, StopOutlined } from "@ant-design/icons";

const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const token = localStorage.getItem("adminToken");

  // Buscar clientes
  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/clients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao carregar clientes");
      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error(err);
      message.error(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Abrir modal para editar
  const handleEdit = (client) => {
    setEditingClient(client);
    form.setFieldsValue({
      name: client.name,
      email: client.email,
    });
    setModalVisible(true);
  };

  // Bloquear/desbloquear cliente
  const handleBlock = async (clientId, currentStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/clients/${clientId}/block`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao atualizar status do cliente");
      message.success(`Cliente ${currentStatus ? "desbloqueado" : "bloqueado"} com sucesso!`);
      fetchClients();
    } catch (err) {
      console.error(err);
      message.error(err.message);
    }
  };

  // Deletar cliente
  const handleDelete = async (clientId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/clients/${clientId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao deletar cliente");
      message.success("Cliente deletado!");
      fetchClients();
    } catch (err) {
      console.error(err);
      message.error(err.message);
    }
  };

  // Salvar edição
  const handleFinish = async (values) => {
    try {
      const res = await fetch(`http://localhost:5000/api/clients/${editingClient._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Erro ao atualizar cliente");
      message.success("Cliente atualizado!");
      setModalVisible(false);
      fetchClients();
    } catch (err) {
      console.error(err);
      message.error(err.message);
    }
  };

  const columns = [
    { title: "Nome", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { 
      title: "Status", 
      dataIndex: "isBlocked", 
      key: "isBlocked", 
      render: (val) => val ? <Tag color="red">Bloqueado</Tag> : <Tag color="green">Ativo</Tag> 
    },
    { 
      title: "Registro", 
      dataIndex: "createdAt", 
      key: "createdAt", 
      render: (val) => new Date(val).toLocaleString("pt-PT", { 
        day: "2-digit", month: "2-digit", year: "numeric", 
        hour: "2-digit", minute: "2-digit" 
      }) 
    },
    {
      title: "Ações",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record._id)} />
          <Button 
            type="dashed" 
            icon={<StopOutlined />} 
            onClick={() => handleBlock(record._id, record.isBlocked)}
          >
            {record.isBlocked ? "Desbloquear" : "Bloquear"}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "#fff", borderRadius: 12 }}>
      <Table
        dataSource={clients}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title="Editar Cliente"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        okText="Salvar"
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="name" label="Nome" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminClients;
