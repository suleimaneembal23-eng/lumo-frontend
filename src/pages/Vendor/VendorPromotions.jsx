import React, { useEffect, useState, useContext } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, Switch, DatePicker, Select, Card, Tag, Typography, message, Space } from "antd";
import { PercentageOutlined, PlusOutlined, DeleteOutlined, EditOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { AuthContext } from "../../context/Authcontext";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

const VendorPromotions = () => {
    const { user } = useContext(AuthContext);
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form] = Form.useForm();
    const [catalogs, setCatalogs] = useState([]);

    const [isPremium, setIsPremium] = useState(user?.vendorInfo?.subscription?.isActive || false);

    useEffect(() => {
        fetchPromotions();
        fetchCatalogs();
    }, []);

    const fetchCatalogs = async () => {
        try {
            const res = await fetch("/api/products/categories");
            const data = await res.json();
            if (res.ok) {
                setCatalogs([{ key: "Todas as Categorias", label: "Todas as Categorias" }, ...data.filter(c => c !== "Todas as Categorias").map(c => ({ key: c, label: c }))]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/promotions/vendor", {
                headers: { "Authorization": `Bearer ${user.token}` }
            });
            const data = await res.json();
            if (res.ok) setPromotions(data);
            else message.error(data.message || "Erro ao carregar promoÃ§Ãµes");
        } catch (error) {
            message.error("Erro na comunicaÃ§Ã£o com o servidor.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (promo = null) => {
        setIsModalOpen(true);
        if (promo) {
            setEditingId(promo._id);
            form.setFieldsValue({
                ...promo,
                validUntil: promo.validUntil ? dayjs(promo.validUntil) : null
            });
        } else {
            setEditingId(null);
            form.resetFields();
            form.setFieldsValue({ active: true, isDailyDeal: false });
        }
    };

    const handleSave = async (values) => {
        try {
            const payload = {
                ...values,
                code: values.code.toUpperCase(),
                validUntil: values.validUntil ? values.validUntil.toISOString() : null,
            };

            const method = editingId ? "PUT" : "POST";
            const url = editingId
                ? `/api/promotions/vendor/${editingId}`
                : `/api/promotions/vendor`;

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                message.success(`PromoÃ§Ã£o ${editingId ? "atualizada" : "criada"} com sucesso!`);
                setIsModalOpen(false);
                fetchPromotions();
            } else {
                const errorData = await res.json();
                message.error(errorData.message || "Erro ao salvar.");
            }
        } catch (error) {
            message.error("Erro na comunicaÃ§Ã£o HTTP.");
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`/api/promotions/vendor/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${user.token}` }
            });

            if (res.ok) {
                message.success("PromoÃ§Ã£o eliminada!");
                fetchPromotions();
            } else {
                message.error("Erro ao eliminar.");
            }
        } catch (error) {
            message.error("Erro.");
        }
    };

    const handleToggleStatus = async (promo, field) => {
        try {
            const res = await fetch(`/api/promotions/vendor/${promo._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.token}`
                },
                body: JSON.stringify({ [field]: !promo[field] })
            });

            if (res.ok) {
                message.success("Status atualizado!");
                fetchPromotions();
            }
        } catch (error) {
            message.error("Erro ao atualizar status.");
        }
    };

    const columns = [
        {
            title: 'CÃ³digo / TÃ­tulo',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <div>
                    <div className="font-bold text-gray-800">{text}</div>
                    <Tag color="geekblue" className="mt-1 font-mono uppercase font-bold">{record.code}</Tag>
                </div>
            )
        },
        {
            title: 'Desconto',
            dataIndex: 'discount',
            key: 'discount',
            render: (val) => <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded">-{val}%</span>
        },
        {
            title: 'Alcance',
            dataIndex: 'categories',
            key: 'categories',
            render: (cats) => (
                <div className="flex flex-wrap gap-1">
                    {cats?.map(c => <Tag key={c}>{c}</Tag>)}
                </div>
            )
        },
        {
            title: 'Tipo Especial',
            dataIndex: 'isDailyDeal',
            key: 'isDailyDeal',
            render: (deal, record) => (
                <Switch
                    checked={deal}
                    onChange={() => handleToggleStatus(record, 'isDailyDeal')}
                    checkedChildren={<ThunderboltOutlined />}
                    unCheckedChildren="Regular"
                    className={deal ? "bg-yellow-500" : "bg-gray-300"}
                />
            )
        },
        {
            title: 'Status',
            dataIndex: 'active',
            key: 'active',
            render: (active, record) => (
                <Switch
                    checked={active}
                    onChange={() => handleToggleStatus(record, 'active')}
                    checkedChildren="ATIVO"
                    unCheckedChildren="INATIVO"
                    className={active ? "bg-green-500" : "bg-red-400"}
                />
            )
        },
        {
            title: 'AÃ§Ãµes',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button type="text" icon={<EditOutlined className="text-blue-500" />} onClick={() => handleOpenModal(record)} />
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record._id)} />
                </Space>
            )
        }
    ];

    if (!isPremium) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-6 text-center">
                <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 p-12 rounded-3xl shadow-2xl text-white">
                    <PercentageOutlined className="text-6xl text-yellow-400 mb-6 drop-shadow-lg" />
                    <h1 className="text-4xl font-extrabold mb-4">Motor de PromoÃ§Ãµes Exclusivo</h1>
                    <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
                        A funcionalidade de criaÃ§Ã£o livre de promoÃ§Ãµes, cupÃµes de desconto e campanhas "Flash Sale" Ã© reservada para <strong>Vendedores Premium</strong>.
                    </p>
                    <Button type="primary" size="large" className="bg-gradient-to-r from-yellow-400 to-yellow-500 border-none text-black font-bold h-12 px-8 rounded-full shadow-lg hover:scale-105 transition-transform">
                        Fazer Upgrade para Premium
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold m-0 flex items-center gap-3 text-gray-900">
                        <PercentageOutlined className="text-purple-600" /> GestÃ£o de PromoÃ§Ãµes Premium
                    </h1>
                    <p className="text-gray-500 m-0 mt-2 text-base">
                        Crie campanhas, cupÃµes e oferas "Flash" de forma autÃ³noma.
                    </p>
                </div>
                <Button type="primary" icon={<PlusOutlined />} size="large" className="bg-purple-600 rounded-full font-bold shadow-md hover:bg-purple-700" onClick={() => handleOpenModal()}>
                    Nova PromoÃ§Ã£o
                </Button>
            </div>

            <Card bordered={false} className="shadow-sm rounded-2xl overflow-hidden border border-gray-100 p-1 -mx-2 sm:mx-0">
                <Table
                    columns={columns}
                    dataSource={promotions}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 800 }}
                />
            </Card>

            <Modal
                title={editingId ? "Editar PromoÃ§Ã£o" : "Criar Nova PromoÃ§Ã£o"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={700}
                centered
            >
                <Form form={form} layout="vertical" onFinish={handleSave} className="mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="title" label="TÃ­tulo PÃºblico (Ex: VerÃ£o Louco)" rules={[{ required: true }]}>
                            <Input size="large" />
                        </Form.Item>
                        <Form.Item name="code" label="CÃ³digo do CupÃ£o" rules={[{ required: true }]}>
                            <Input size="large" className="uppercase font-mono" />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="discount" label="Desconto (%)" rules={[{ required: true }]}>
                            <InputNumber min={1} max={100} size="large" className="w-full" addonAfter="%" />
                        </Form.Item>
                        <Form.Item name="validUntil" label="Validade (Opcional)">
                            <DatePicker size="large" className="w-full" showTime />
                        </Form.Item>
                    </div>

                    <Form.Item name="categories" label="Aplicar aos CatÃ¡logos (Seus Produtos)" rules={[{ required: true, message: "Insira pelo menos 1 categoria." }]}>
                        <Select mode="tags" size="large" placeholder="Selecione ou crie tags">
                            {catalogs.map(c => <Option key={c.key} value={c.key}>{c.label}</Option>)}
                        </Select>
                    </Form.Item>

                    <Form.Item name="description" label="DescriÃ§Ã£o Interna / Notas">
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 flex items-center justify-between">
                        <div>
                            <div className="font-bold flex items-center gap-2"><ThunderboltOutlined className="text-yellow-500" /> Destaque de Home Page (Oferta do Dia)</div>
                            <div className="text-xs text-gray-500 mt-1 max-w-sm">Ativa o banner automÃ¡tico e risca os preÃ§os visivelmente na pÃ¡gina inicial sob "Oferta do Dia" para os seus produtos elegÃ­veis. SÃ“ UMA PODE ESTAR ATIVA.</div>
                        </div>
                        <Form.Item name="isDailyDeal" valuePropName="checked" className="m-0">
                            <Switch />
                        </Form.Item>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
                        <Button onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button type="primary" htmlType="submit" className="bg-purple-600 text-white font-bold">
                            Salvar PromoÃ§Ã£o
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default VendorPromotions;
