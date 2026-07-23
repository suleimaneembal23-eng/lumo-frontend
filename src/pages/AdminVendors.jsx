import React, { useState, useEffect, useContext } from "react";
import { Table, Button, Modal, Form, Input, message, Card, Typography } from "antd";
import { PlusOutlined, UserOutlined, ShopOutlined, LockOutlined, GlobalOutlined } from "@ant-design/icons";
import { AuthContext } from "../context/Authcontext";
// import { Copy } from "lucide-react";

const { Title, Text } = Typography;

const AdminVendors = () => {
    const { admin } = useContext(AuthContext);
    const user = admin; // Alias for easier refactoring below
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [createdVendor, setCreatedVendor] = useState(null); // To show credentials after creation

    const fetchVendors = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/vendors", {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            const data = await res.json();
            if (res.ok) {
                setVendors(data);
            } else {
                message.error("Erro ao carregar vendedores.");
            }
        } catch (error) {
            console.error(error);
            message.error("Erro de conexão.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    const handleCreateVendor = async (values) => {
        console.log("�xa� [FRONTEND] Sending Create Vendor Request:", values);
        message.loading({ content: "Enviando dados...", key: "createVendor" });

        try {
            const res = await fetch("/api/admin/vendors", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify(values),
            });

            const data = await res.json();

            if (res.ok) {
                message.success({ content: "Vendedor criado com sucesso!", key: "createVendor" });
                setVendors([...vendors, data.vendor]);
                setCreatedVendor({ ...values });
                setIsModalVisible(false);
                form.resetFields();
            } else {
                message.error({ content: data.message || "Erro ao criar vendedor.", key: "createVendor" });
            }
        } catch (error) {
            console.error("�R [FRONTEND] Error:", error);
            message.error({ content: "Erro de conexão com o servidor.", key: "createVendor" });
        }
    };

    const columns = [
        {
            title: "Nome do Responsável",
            dataIndex: "name",
            key: "name",
            render: (text) => <span className="font-bold">{text}</span>
        },
        {
            title: "Nome da Loja",
            dataIndex: ["vendorInfo", "storeName"],
            key: "storeName",
        },
        {
            title: "URL da Loja",
            dataIndex: ["vendorInfo", "slug"],
            key: "slug",
            render: (slug) => (
                <a href={`/store/${slug}`} target="_blank" rel="noreferrer" className="text-blue-600 flex items-center gap-1">
                    <GlobalOutlined /> /store/{slug}
                </a>
            )
        },
        {
            title: "Email de Acesso",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Data de Criação",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => new Date(date).toLocaleDateString(),
        },
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Title level={2} style={{ marginBottom: 0 }}>Gestão de Colaboradores</Title>
                    <Text type="secondary">Crie e gerencie as contas dos vendedores parceiros.</Text>
                </div>
                <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                    Novo Colaborador
                </Button>
            </div>

            {createdVendor && (
                <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg animate-pulse">
                    <h3 className="text-green-800 font-bold text-lg mb-2">�S& Conta Criada com Sucesso!</h3>
                    <p className="text-sm text-green-700 mb-4">Envie estas credenciais para o seu colaborador. Ele poderá alterar a senha depois.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded border border-green-100 shadow-sm">
                        <div>
                            <span className="text-xs font-bold text-gray-500 uppercase">Login (Email)</span>
                            <div className="font-mono text-lg">{createdVendor.email}</div>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-gray-500 uppercase">Senha Provisória</span>
                            <div className="font-mono text-lg font-bold text-blue-600 flex items-center gap-2">
                                {createdVendor.password}
                                <span className="cursor-pointer text-gray-400 hover:text-blue-600 border px-1 rounded text-xs" onClick={() => { navigator.clipboard.writeText(createdVendor.password); message.success("Senha copiada!") }}>
                                    COPIAR
                                </span>
                            </div>
                        </div>
                        <div className="col-span-2">
                            <span className="text-xs font-bold text-gray-500 uppercase">Link da Loja</span>
                            <div className="font-mono text-sm text-gray-600">
                                {window.location.origin}/store/{createdVendor.slug}
                            </div>
                        </div>
                    </div>

                    <Button type="text" size="small" danger className="mt-2" onClick={() => setCreatedVendor(null)}>
                        Fechar Recibo
                    </Button>
                </div>
            )}

            <Card bordered={false} className="shadow-sm rounded-xl">
                <Table 
                    columns={columns}
                    dataSource={vendors}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title="Novo Colaborador (Vendedor)"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form layout="vertical" onFinish={handleCreateVendor} form={form}>
                    <Form.Item
                        name="name"
                        label="Nome do Responsável"
                        rules={[{ required: true, message: "Insira o nome do responsável" }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Ex: João da Silva" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email de Acesso"
                        rules={[{ required: true, type: "email", message: "Insira um email válido" }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="colaborador@exemplo.com" />
                    </Form.Item>

                    <Form.Item
                        name="storeName"
                        label="Nome da Loja (Público)"
                        rules={[{ required: true, message: "Insira o nome da loja" }]}
                    >
                        <Input prefix={<ShopOutlined />} placeholder="Ex: Farmácia Central" />
                    </Form.Item>

                    <Form.Item
                        name="slug"
                        label="URL da Loja (Slug)"
                        initialValue=""
                        rules={[
                            { required: true, message: "Insira a URL amigável" },
                            { pattern: /^[a-z0-9-]+$/, message: "Apenas letras minúsculas, números e hifens." }
                        ]}
                        tooltip={`O endereço da loja será: ${window.location.host}/store/seu-slug`}
                    >
                        <Input addonBefore={`${window.location.host}/store/`} placeholder="minha-loja" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Senha Provisória"
                        initialValue={`Mudar123!${Math.floor(Math.random() * 1000)}`}
                        rules={[{ required: true, message: "Insira uma senha" }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Senha inicial" />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block size="large" className="bg-blue-600 mt-4">
                        Criar Conta de Vendedor
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminVendors;
