import React, { useState, useContext, useEffect } from 'react';
import { Tabs, Form, Input, Button, message, Divider, Table, Tag, Modal, Space } from 'antd';
import { LockOutlined, UserAddOutlined, KeyOutlined, SaveOutlined, TeamOutlined, DeleteOutlined } from '@ant-design/icons';
import { AuthContext } from '../context/Authcontext';
import { API_URL } from '../config';

const { TabPane } = Tabs;

const AdminProfile = () => {
    const { admin } = useContext(AuthContext);
    const token = localStorage.getItem("adminToken");
    
    const [loading, setLoading] = useState(false);
    const [passwordForm] = Form.useForm();
    const [adminForm] = Form.useForm();

    // Novos estados para a Lista de Admins
    const [adminsList, setAdminsList] = useState([]);
    const [loadingAdmins, setLoadingAdmins] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [adminToDelete, setAdminToDelete] = useState(null);
    const [masterSecretForDelete, setMasterSecretForDelete] = useState('');
    const [deletingAdmin, setDeletingAdmin] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const getTimeAgo = (dateStr) => {
        if (!dateStr) return "Nunca entrou";
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return "Agora mesmo";
        if (diff < 3600) return `Há ${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `Há ${Math.floor(diff / 3600)} horas`;
        if (diff < 2592000) return `Há ${Math.floor(diff / 86400)} dias`;
        return date.toLocaleDateString('pt-PT');
    };

    const fetchAdmins = async () => {
        setLoadingAdmins(true);
        try {
            const res = await fetch(`${API_URL}/admin/admins`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setAdminsList(data);
        } catch (e) {
            console.error(e);
        }
        setLoadingAdmins(false);
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleDeleteAdmin = async () => {
        if (!masterSecretForDelete) return message.error("Insira a Chave Mestra!");
        setDeletingAdmin(true);
        try {
            const res = await fetch(`${API_URL}/admin/admins/${adminToDelete._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ masterSecret: masterSecretForDelete })
            });
            const data = await res.json();
            if (res.ok) {
                message.success(data.message);
                setDeleteModalVisible(false);
                setMasterSecretForDelete('');
                setDeleteError('');
                fetchAdmins();
            } else {
                setDeleteError(data.message || 'Erro ao apagar administrador');
            }
        } catch (e) {
            setDeleteError("Erro de conexão ao servidor.");
        }
        setDeletingAdmin(false);
    };

    const immuneEmails = [
        "suleimaneembal23@gmail.com", 
        "suleimanembal23@gmail.com",
        "saadtairo@gmail.com", 
        "bissaulumo@gmail.com"
    ];

    const adminColumns = [
        { title: 'Nome', dataIndex: 'name', key: 'name', render: (text, record) => <div className="font-bold text-gray-800">{text}{record._id === admin._id && <Tag color="blue" className="ml-2 border-0 bg-blue-50 text-blue-600 font-bold">Você</Tag>}{immuneEmails.includes(record.email?.toLowerCase()) && <Tag color="gold" className="ml-2 border-0 font-bold">Fundador</Tag>}</div> },
        { title: 'Email', dataIndex: 'email', key: 'email', render: (text) => <span className="text-gray-500">{text}</span> },
        { title: 'Último Login', dataIndex: 'lastLogin', key: 'lastLogin', render: (date) => <Tag color={date ? "green" : "default"} className="border-0 font-medium">{getTimeAgo(date)}</Tag> },
        { title: 'Ação', key: 'action', align: 'right', render: (_, record) => (
            <Button 
                danger 
                type="text"
                icon={<DeleteOutlined />} 
                disabled={record._id === admin._id || immuneEmails.includes(record.email?.toLowerCase())}
                title={immuneEmails.includes(record.email?.toLowerCase()) ? "Super Admin imune a remoção" : ""}
                onClick={() => {
                    setAdminToDelete(record);
                    setDeleteModalVisible(true);
                }}
            >
                Remover
            </Button>
        ) }
    ];

    const handlePasswordChange = async (values) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    oldPassword: values.oldPassword,
                    newPassword: values.newPassword
                })
            });

            let data = {};
            try {
                data = await res.json();
            } catch (e) {
                console.error("Erro ao processar resposta JSON", e);
            }

            if (res.ok) {
                message.success('Senha atualizada com sucesso!');
                passwordForm.resetFields();
            } else {
                const errorMsg = data.message || 'A senha atual está incorreta ou ocorreu um erro.';
                message.error(errorMsg);
                
                // Mostrar erro diretamente no campo
                if (res.status === 401) {
                    passwordForm.setFields([
                        {
                            name: 'oldPassword',
                            errors: [errorMsg],
                        },
                    ]);
                }
            }
        } catch (error) {
            console.error(error);
            message.error('Erro de conexão ao servidor. Verifique a sua internet.');
        }
        setLoading(false);
    };

    const handleCreateAdmin = async (values) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/register-admin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: values.name,
                    email: values.email,
                    password: values.password,
                    masterSecret: values.masterSecret
                })
            });

            let data = {};
            try {
                data = await res.json();
            } catch (e) {
                console.error("Erro ao processar resposta JSON", e);
            }

            if (res.ok) {
                message.success('Novo Administrador criado com sucesso!');
                adminForm.resetFields();
            } else {
                const errorMsg = data.message || 'Erro ao criar administrador.';
                message.error(errorMsg);

                if (res.status === 403 || res.status === 429 || errorMsg.toLowerCase().includes('mestra')) {
                    adminForm.setFields([
                        {
                            name: 'masterSecret',
                            errors: [errorMsg],
                        },
                    ]);
                } else if (res.status === 400 || errorMsg.toLowerCase().includes('email')) {
                    adminForm.setFields([
                        {
                            name: 'email',
                            errors: [errorMsg],
                        },
                    ]);
                }
            }
        } catch (error) {
            console.error(error);
            message.error('Erro de conexão ao servidor.');
        }
        setLoading(false);
    };

    return (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 min-h-[80vh]">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 m-0 tracking-tight">Meu Perfil e Segurança</h1>
                <p className="text-gray-500 mt-2">Gerencie as suas credenciais e os acessos globais do sistema.</p>
            </div>

            <Tabs defaultActiveKey="1" className="admin-profile-tabs">
                {/* TAB 1: MEU PERFIL */}
                <TabPane tab={<span className="font-medium"><LockOutlined /> Alterar Senha</span>} key="1">
                    <div className="max-w-md mt-6">
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8">
                            <h3 className="font-bold text-gray-900 text-lg mb-1">{admin?.name}</h3>
                            <p className="text-gray-500 text-sm m-0">{admin?.email}</p>
                            <span className="inline-block mt-3 bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-xs">Administrador</span>
                        </div>

                        <Form
                            form={passwordForm}
                            layout="vertical"
                            onFinish={handlePasswordChange}
                            requiredMark={false}
                        >
                            <Form.Item
                                name="oldPassword"
                                label={<span className="font-medium text-gray-700">Senha Atual</span>}
                                rules={[{ required: true, message: 'Insira a sua senha atual' }]}
                            >
                                <Input.Password size="large" prefix={<KeyOutlined className="text-gray-400" />} className="rounded-xl px-4 py-2" placeholder="********" />
                            </Form.Item>

                            <Form.Item
                                name="newPassword"
                                label={<span className="font-medium text-gray-700">Nova Senha</span>}
                                rules={[
                                    { required: true, message: 'Insira a nova senha' },
                                    { min: 6, message: 'A senha deve ter no mínimo 6 caracteres' }
                                ]}
                            >
                                <Input.Password size="large" prefix={<LockOutlined className="text-gray-400" />} className="rounded-xl px-4 py-2" placeholder="Nova senha" />
                            </Form.Item>

                            <Form.Item
                                name="confirmPassword"
                                label={<span className="font-medium text-gray-700">Confirmar Nova Senha</span>}
                                rules={[
                                    { required: true, message: 'Confirme a nova senha' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('newPassword') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('As novas senhas não coincidem!'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password size="large" prefix={<LockOutlined className="text-gray-400" />} className="rounded-xl px-4 py-2" placeholder="Confirmar nova senha" />
                            </Form.Item>

                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                loading={loading}
                                icon={<SaveOutlined />}
                                className="w-full bg-blue-600 hover:bg-blue-500 border-none rounded-xl h-12 font-bold shadow-lg shadow-blue-500/30"
                            >
                                Atualizar Senha
                            </Button>
                        </Form>
                    </div>
                </TabPane>

                {/* TAB 2: NOVO ADMIN */}
                <TabPane tab={<span className="font-medium"><UserAddOutlined /> Novo Administrador</span>} key="2">
                    <div className="max-w-md mt-6">
                        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 mb-8">
                            <h3 className="font-bold text-red-700 text-lg mb-2">Zona de Segurança Máxima</h3>
                            <p className="text-red-600 text-sm m-0">Apenas utilizadores com a <strong>Chave Mestra</strong> do sistema podem gerar novos administradores. Esta ação tem impacto total na plataforma.</p>
                        </div>

                        <Form
                            form={adminForm}
                            layout="vertical"
                            onFinish={handleCreateAdmin}
                            requiredMark={false}
                        >
                            <Form.Item
                                name="name"
                                label={<span className="font-medium text-gray-700">Nome do Novo Admin</span>}
                                rules={[{ required: true, message: 'Insira o nome' }]}
                            >
                                <Input size="large" className="rounded-xl px-4 py-2" placeholder="Ex: Sócio Lumo" />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                label={<span className="font-medium text-gray-700">Email</span>}
                                rules={[
                                    { required: true, message: 'Insira o email' },
                                    { type: 'email', message: 'Email inválido' }
                                ]}
                            >
                                <Input size="large" className="rounded-xl px-4 py-2" placeholder="admin@lumo.com" />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label={<span className="font-medium text-gray-700">Senha Temporária</span>}
                                rules={[{ required: true, message: 'Insira uma senha' }]}
                            >
                                <Input.Password size="large" className="rounded-xl px-4 py-2" placeholder="********" />
                            </Form.Item>

                            <Divider />

                            <Form.Item
                                name="masterSecret"
                                label={<span className="font-bold text-red-600">Chave Mestra de Segurança</span>}
                                rules={[{ required: true, message: 'A chave mestra é obrigatória' }]}
                            >
                                <Input.Password size="large" prefix={<KeyOutlined className="text-red-400" />} className="rounded-xl px-4 py-2 border-red-300 focus:border-red-500 focus:shadow-[0_0_0_2px_rgba(239,68,68,0.2)]" placeholder="Inserir Chave Mestra" />
                            </Form.Item>

                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                loading={loading}
                                icon={<UserAddOutlined />}
                                className="w-full bg-red-600 hover:bg-red-500 border-none rounded-xl h-12 font-bold shadow-lg shadow-red-500/30"
                            >
                                Autorizar e Criar Administrador
                            </Button>
                        </Form>
                    </div>
                </TabPane>
                {/* TAB 3: LISTA DE ADMINS */}
                <TabPane tab={<span className="font-medium"><TeamOutlined /> Equipa de Administração</span>} key="3">
                    <div className="mt-6">
                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-8 max-w-4xl">
                            <h3 className="font-bold text-blue-800 text-lg mb-2">Visão Geral da Equipa</h3>
                            <p className="text-blue-700 text-sm m-0">Consulte o histórico de acessos dos administradores da plataforma e remova contas inativas se possuir a Chave Mestra.</p>
                        </div>
                        
                        <div className="max-w-4xl bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                            <Table 
                                dataSource={adminsList} 
                                columns={adminColumns} 
                                rowKey="_id"
                                pagination={false}
                                loading={loadingAdmins}
                                className="admin-team-table"
                            />
                        </div>
                    </div>
                </TabPane>
            </Tabs>

            <Modal
                title={<span className="text-red-600 font-bold text-lg"><DeleteOutlined className="mr-2" /> Remover Administrador</span>}
                visible={deleteModalVisible}
                onCancel={() => {
                    setDeleteModalVisible(false);
                    setMasterSecretForDelete('');
                    setDeleteError('');
                }}
                footer={null}
                centered
                destroyOnClose
            >
                <div className="py-4">
                    <p className="text-gray-600 mb-6">
                        Tem a certeza que deseja remover o administrador <strong className="text-gray-900">{adminToDelete?.name}</strong>? 
                        Esta ação requer autorização máxima.
                    </p>
                    <Form layout="vertical" onFinish={handleDeleteAdmin} requiredMark={false}>
                        <Form.Item
                            label={<span className="font-bold text-red-600">Chave Mestra de Segurança</span>}
                            validateStatus={deleteError ? 'error' : ''}
                            help={deleteError ? <span className="text-red-500 font-bold">{deleteError}</span> : ''}
                            rules={[{ required: true, message: 'A chave mestra é obrigatória' }]}
                        >
                            <Input.Password 
                                size="large" 
                                prefix={<KeyOutlined className="text-red-400" />} 
                                className={`rounded-xl px-4 py-2 focus:border-red-500 ${deleteError ? 'border-red-500' : 'border-red-300'}`} 
                                placeholder="Inserir Chave Mestra"
                                value={masterSecretForDelete}
                                onChange={(e) => {
                                    setMasterSecretForDelete(e.target.value);
                                    if (deleteError) setDeleteError(''); // Limpa o erro ao digitar
                                }}
                            />
                        </Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={deletingAdmin}
                            className="w-full bg-red-600 hover:bg-red-500 border-none rounded-xl h-12 font-bold shadow-lg shadow-red-500/30 mt-2"
                        >
                            Confirmar e Remover
                        </Button>
                    </Form>
                </div>
            </Modal>
        </div>
    );
};

export default AdminProfile;
