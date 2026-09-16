import React, { useState, useContext } from 'react';
import { Tabs, Form, Input, Button, message, Divider } from 'antd';
import { LockOutlined, UserAddOutlined, KeyOutlined, SaveOutlined } from '@ant-design/icons';
import { AuthContext } from '../context/Authcontext';
import { API_URL } from '../config';

const { TabPane } = Tabs;

const AdminProfile = () => {
    const { admin } = useContext(AuthContext);
    const token = localStorage.getItem("adminToken");
    
    const [loading, setLoading] = useState(false);
    const [passwordForm] = Form.useForm();
    const [adminForm] = Form.useForm();

    const handlePasswordChange = async (values) => {
        if (values.newPassword !== values.confirmPassword) {
            return message.error('As senhas não coincidem!');
        }

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

                if (res.status === 403 || errorMsg.toLowerCase().includes('mestra')) {
                    adminForm.setFields([
                        {
                            name: 'masterSecret',
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
                                rules={[{ required: true, message: 'Confirme a nova senha' }]}
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
            </Tabs>
        </div>
    );
};

export default AdminProfile;
