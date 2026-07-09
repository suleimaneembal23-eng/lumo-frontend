�import React, { useEffect, useState, useContext } from "react";
import { Table, Button, Modal, message, Tag, Avatar, Tooltip, Descriptions, Divider, Popconfirm } from "antd";
import { DeleteOutlined, StopOutlined, CheckCircleOutlined, UserOutlined, EyeOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { AuthContext } from "../context/Authcontext";

const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null); // Para visualização (ReadOnly)
  const [modalVisible, setModalVisible] = useState(false);
  const { admin } = useContext(AuthContext);
  const user = admin; // Alias for compatibility with existing code
  const token = localStorage.getItem("adminToken");

  // Buscar clientes
  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clients`, {
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

  // Visualizar Detalhes
  const handleViewDetails = (client) => {
    setSelectedClient(client);
    setModalVisible(true);
  };

  // Bloquear/desbloquear cliente
  const handleBlock = async (clientId, currentStatus) => {
    try {
      const res = await fetch(`/api/clients/${clientId}/block`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao atualizar status do cliente");
      message.success(`Cliente ${currentStatus ? "desbloqueado" : "bloqueado"} com sucesso!`);

      // Atualizar lista localmente para ser mais rápido ou refetch
      setClients(prev => prev.map(c => c._id === clientId ? { ...c, isBlocked: !currentStatus } : c));

      if (selectedClient && selectedClient._id === clientId) {
        setSelectedClient(prev => ({ ...prev, isBlocked: !currentStatus }));
      }
    } catch (err) {
      console.error(err);
      message.error(err.message);
    }
  };

  // Deletar cliente
  const handleDelete = async (clientId) => {
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao deletar cliente");
      message.success("Cliente deletado!");
      fetchClients();
      setModalVisible(false);
    } catch (err) {
      console.error(err);
      message.error(err.message);
    }
  };

  const columns = [
    {
      title: "Cliente",
      key: "client",
      render: (_, record) => (
        <div className="flex items-center gap-4">
          <Avatar size={48} icon={<UserOutlined />} src={record.avatar} className="bg-gray-200" />
          <div>
            <p className="font-bold text-gray-900 m-0 text-base">{record.name}</p>
            <p className="text-gray-500 m-0 text-sm">{record.email}</p>
          </div>
        </div>
      )
    },
    {
      title: "Status",
      dataIndex: "isBlocked",
      key: "isBlocked",
      render: (val) => val ?
        <Tag color="red" className="px-3 py-1 rounded-full border-none font-bold bg-red-100 text-red-600">Bloqueado</Tag> :
        <Tag color="green" className="px-3 py-1 rounded-full border-none font-bold bg-green-100 text-green-600">Ativo</Tag>
    },
    {
      title: "Data de Registro",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val) => <span className="text-gray-500">{dayjs(val).format("DD/MM/YYYY")}</span>
    },
    {
      title: "Ações",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <div className="flex justify-end gap-2">
          <Tooltip title="Ver Detalhes">
            <Button shape="circle" icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
          </Tooltip>
          <Tooltip title={record.isBlocked ? "Desbloquear" : "Bloquear"}>
            <Button
              type={record.isBlocked ? "primary" : "default"}
              danger={!record.isBlocked}
              className={record.isBlocked ? "bg-green-600 border-none" : "border-red-200 text-red-500 hover:border-red-500"}
              icon={record.isBlocked ? <CheckCircleOutlined /> : <StopOutlined />}
              onClick={() => handleBlock(record._id, record.isBlocked)}
              disabled={record.email === user?.email} // Impossível bloquear a si mesmo
            />
          </Tooltip>
          <Tooltip title="Excluir">
            <Popconfirm
              title="Tem certeza que deseja excluir?"
              onConfirm={() => handleDelete(record._id)}
              okText="Sim"
              cancelText="Não"
              disabled={record.email === user?.email}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={record.email === user?.email} // Impossível deletar a si mesmo
              />
            </Popconfirm>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 min-h-[85vh]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 m-0 tracking-tight">Gestão de Clientes</h1>
          <p className="text-gray-500 mt-2 text-base">Visualize e gerencie o acesso dos usuários.</p>
        </div>
        <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 text-gray-400 text-sm font-medium px-4">
          Total de Clientes: <span className="text-gray-900 font-bold ml-2">{clients.length}</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
        <Table
          dataSource={clients}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 8 }}
          rowClassName="hover:bg-gray-50 transition-colors"
        />
      </div>

      <Modal
        visible={modalVisible}
        title={null}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
        centered
        closeIcon={<span className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors">�S"</span>}
      >
        {selectedClient && (
          <div className="p-4">
            <div className="text-center mb-8">
              <Avatar size={100} icon={<UserOutlined />} src={selectedClient.avatar} className="bg-gray-100 mb-4 border-4 border-white shadow-lg" />
              <h2 className="text-2xl font-bold text-gray-900 m-0">{selectedClient.name}</h2>
              <p className="text-gray-500">{selectedClient.email}</p>
              <div className="mt-4">
                {selectedClient.isBlocked ?
                  <span className="bg-red-100 text-red-700 px-4 py-1 rounded-full font-bold text-sm">�: Acesso Bloqueado</span> :
                  <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full font-bold text-sm">�S& Conta Ativa</span>
                }
              </div>
            </div>

            <Divider />

            <Descriptions title="Informações da Conta" column={1} layout="vertical" labelStyle={{ fontWeight: 'bold' }}>
              <Descriptions.Item label="ID do Usuário">{selectedClient._id}</Descriptions.Item>
              <Descriptions.Item label="Data de Registro">{dayjs(selectedClient.createdAt).format("DD [de] MMMM [de] YYYY, às HH:mm")}</Descriptions.Item>
              <Descriptions.Item label="�altima Atualização">{dayjs(selectedClient.updatedAt).format("DD/MM/YYYY")}</Descriptions.Item>
            </Descriptions>

            <div className="mt-8 bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
              <p className="font-bold text-gray-800 mb-4">Ações Administrativas</p>
              <div className="flex justify-center gap-4">
                <Button
                  className="rounded-xl h-10 px-6"
                  danger={!selectedClient.isBlocked}
                  type={selectedClient.isBlocked ? "primary" : "default"}
                  onClick={() => handleBlock(selectedClient._id, selectedClient.isBlocked)}
                >
                  {selectedClient.isBlocked ? "Desbloquear Acesso" : "Bloquear Acesso"}
                </Button>
                <Button
                  danger
                  type="primary"
                  className="rounded-xl h-10 px-6"
                  onClick={() => handleDelete(selectedClient._id)}
                >
                  Excluir Dados
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminClients;
