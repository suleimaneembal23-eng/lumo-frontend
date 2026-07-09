�import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Upload, message, Switch, Card, Tag, Tabs, Row, Col, Divider, Popconfirm } from 'antd';
import { PlusOutlined, UploadOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined, SkinOutlined } from '@ant-design/icons';
import { AuthContext } from '../../context/Authcontext';
import { TOP_CATEGORIES, STANDARD_SIZES } from '../../constants/products';
import VendorSubscriptionModal from '../../components/VendorSubscriptionModal';


const { Option } = Select;
const { TextArea } = Input;

const VendorProducts = () => {
    const { user, setUser } = useContext(AuthContext); // Precisará do setUser para atualizar state
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    
    // �x� Estados do Modal de Assinatura
    const [isSubModalVisible, setIsSubModalVisible] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('monthly');

    const [editingProduct, setEditingProduct] = useState(null);
    const [imgUrl, setImgUrl] = useState("");
    const [galleryList, setGalleryList] = useState([]); // Future implementation
    const [uploading, setUploading] = useState(false);
    const [form] = Form.useForm();
    const [catalogs, setCatalogs] = useState([]);

    // �x} Lógica de Assinatura
    const isPremium = user?.vendorInfo?.subscription?.isActive; // True se for pagante

    const fetchProducts = async () => {

        setLoading(true);
        try {
            const res = await fetch("/api/products/vendor", {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setProducts(data);
            } else {
                message.error("Erro ao carregar produtos :(");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCatalogs = async () => {
        try {
            const res = await fetch("/api/products/categories");
            const data = await res.json();
            if (res.ok) setCatalogs(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCatalogs();
    }, []);

    const handleUpload = async (file) => {
        const formData = new FormData();
        formData.append("image", file);
        setUploading(true);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                setImgUrl(data.imageUrl);
                message.success("Imagem enviada com sucesso!");
            } else {
                message.error("Falha no upload.");
            }
        } catch (error) {
            console.error(error);
            message.error("Erro de conexão.");
        } finally {
            setUploading(false);
        }
        return false;
    };

    const handleSave = async (values) => {
        const payload = {
            ...values,
            image: imgUrl,
            // Size is handled by dynamic attributes now
            size: [],
            // Garantir fallbacks
            attributes: values.attributes || [],
            inStock: !!values.inStock,
            stockQuantity: values.stockQuantity || 0,
            lowStockThreshold: values.lowStockThreshold || 5,
        };

        const url = editingProduct
            ? `/api/products/${editingProduct._id}`
            : "/api/products/vendor";

        const method = editingProduct ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                message.success(editingProduct ? "Produto atualizado com sucesso!" : "Produto criado com sucesso!");
                setIsModalVisible(false);
                form.resetFields();
                setImgUrl("");
                setEditingProduct(null);
                fetchProducts();
            } else {
                const err = await res.json();
                message.error(err.message || "Erro ao salvar.");
            }
        } catch (error) {
            console.error(error);
            message.error("Erro de conexão.");
        }
    };

    const handleDelete = async (id) => {
        console.log("�x️ [Frontend] Clicou para apagar. ID:", id);

        Modal.confirm({
            title: 'Tem certeza que deseja apagar?',
            content: 'Esta ação não pode ser desfeita.',
            okText: 'Sim, Apagar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                console.log("�x️ [Frontend] Confirmou apagar. Enviando request...");
                try {
                    const res = await fetch(`/api/products/${id}`, {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${user.token}` }
                    });

                    if (res.ok) {
                        console.log("�S& [Frontend] Produto removido com sucesso.");
                        message.success("Produto removido.");
                        fetchProducts();
                    } else {
                        const err = await res.json();
                        console.error("�R [Frontend] Erro ao remover:", err);
                        message.error(err.message || "Erro ao remover.");
                    }
                } catch (error) {
                    console.error("�R [Frontend] Erro de rede:", error);
                    message.error("Erro de conexão.");
                }
            }
        });
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setImgUrl(product.image);
        form.setFieldsValue({
            ...product,
            onSale: product.originalPrice > product.price
        });
        setIsModalVisible(true);
    };

    const columns = [
        {
            title: 'Produto',
            dataIndex: 'name',
            width: 300,
            render: (text, record) => (
                <div className="flex items-center gap-3">
                    <img src={record.image || "https://via.placeholder.com/40"} alt="prod" className="w-16 h-16 object-cover rounded-xl border-2 border-gray-100 shadow-sm" />
                    <div>
                        <div className="font-bold text-gray-900 text-base">{text}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            {Array.isArray(record.category) ? record.category.slice(0, 2).join(", ") : record.category}
                        </div>
                        {record.isBlocked && <Tag color="error" className="mt-1" size="small">BLOQUEADO</Tag>}
                    </div>
                </div>
            )
        },
        {
            title: 'Preço & Receita',
            dataIndex: 'price',
            align: 'center',
            width: 150,
            render: (price, record) => {
                const salesCount = record.salesCount || 0;
                const revenue = Math.round(salesCount * price);

                return (
                    <div className="text-center">
                        <div className="font-bold text-blue-600 text-lg">{price.toLocaleString('fr-FR')} FCFA</div>
                        {record.originalPrice > price && (
                            <div className="text-xs text-gray-400 line-through">{record.originalPrice.toLocaleString('fr-FR')} FCFA</div>
                        )}
                        {!isPremium && (
                            <div className="text-xs text-red-500 mt-1" title="Comissão 10% + 500 FCFA">
                                Taxa: {Math.round((price * 0.10) + 500).toLocaleString('fr-FR')} FCFA
                            </div>
                        )}
                        <div className="text-xs text-green-600 font-semibold mt-1">
                            �x� Receita: {revenue.toLocaleString('fr-FR')} FCFA
                        </div>
                    </div>
                );
            }
        },
        {
            title: 'Vendas',
            dataIndex: 'salesCount',
            align: 'center',
            width: 100,
            sorter: (a, b) => (a.salesCount || 0) - (b.salesCount || 0),
            render: (count) => (
                <div className="text-center">
                    <div className="inline-flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full w-14 h-14 text-lg shadow-lg">
                        {count || 0}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">unidades</div>
                </div>
            )
        },
        {
            title: 'Stock',
            dataIndex: 'inStock',
            align: 'center',
            width: 140,
            filters: [
                { text: 'Em Stock', value: true },
                { text: 'Esgotado', value: false }
            ],
            onFilter: (value, record) => record.inStock === value,
            render: (stock, record) => {
                const stockQty = record.stockQuantity || 0;
                const isLowStock = stockQty > 0 && stockQty <= (record.lowStockThreshold || 10);

                return (
                    <div className="text-center">
                        {stock ? (
                            <>
                                <Tag color={isLowStock ? "warning" : "success"} className="mb-1">
                                    {isLowStock ? '�a�️ Stock Baixo' : 'Em Stock'}
                                </Tag>
                                <div className={`text-sm font-semibold ${isLowStock ? 'text-red-600' : 'text-gray-700'}`}>
                                    {stockQty} un.
                                </div>
                                {isLowStock && (
                                    <div className="text-xs text-red-500 font-bold mt-1">
                                        �x� Repor!
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <Tag color="error">Esgotado</Tag>
                                <div className="text-xs text-gray-400 mt-1">0 un.</div>
                            </>
                        )}
                    </div>
                );
            }
        },
        {
            title: 'Observações do Admin',
            dataIndex: 'adminNotes',
            render: note => note ? (
                <div className="bg-yellow-50 p-2 rounded border border-yellow-100 text-xs text-yellow-700 max-w-xs">
                    <InfoCircleOutlined className="mr-1" /> {note}
                </div>
            ) : <span className="text-gray-300">-</span>
        },
        {
            title: 'Ações',
            key: 'actions',
            align: 'right',
            render: (_, record) => (
                isPremium ? (
                    <div className="flex justify-end gap-2">
                        <Button icon={<EditOutlined />} onClick={() => openEditModal(record)} disabled={record.isBlocked} />
                        <Popconfirm
                            title="Tem certeza que deseja apagar?"
                            description="Esta ação não pode ser desfeita."
                            onConfirm={() => handleDelete(record._id)}
                            okText="Sim"
                            cancelText="Não"
                        >
                            <Button danger icon={<DeleteOutlined />} disabled={record.isBlocked} />
                        </Popconfirm>
                    </div>
                ) : (
                    <Tag color="cyan">Gerenciado pelo Admin</Tag>
                )
            )
        }
    ];

    // �x� Ao assinar com sucesso, atualizar estado local para esconder banner na hora
    const handleSubscriptionSuccess = (newSubscriptionData) => {
        setIsSubModalVisible(false);
        const updatedUser = {
            ...user,
            vendorInfo: {
                ...user.vendorInfo,
                subscription: newSubscriptionData
            }
        };
        setUser(updatedUser);
        message.success("O seu dashboard Premium foi desbloqueado!");
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* �x} Banner para Usuários Grátis */}
            {!isPremium && (
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white mb-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 animate-fadeIn">
                    <div>
                        <h2 className="text-2xl font-bold text-white m-0 mb-2">�x} Desbloqueie o Poder Total!</h2>
                        <p className="text-indigo-100 m-0 max-w-xl">
                            Você está no plano Grátis. Upgrade para Premium para ter controle total, 0% de taxas e editar seus produtos livremente.
                        </p>
                        <div className="flex gap-4 mt-4">
                            <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20">
                                <span className="block text-xs text-indigo-200 uppercase">Vagas Restantes</span>
                                <span className="text-xl font-bold">�x� {Math.max(0, 5 - products.length)}/5</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 min-w-[200px]">
                        <Button 
                            size="large" 
                            className="bg-white text-indigo-600 font-bold border-none h-12 hover:bg-indigo-50 shadow-lg"
                            onClick={() => { setSelectedPlan('monthly'); setIsSubModalVisible(true); }}
                        >
                            Assinar Mensal (26.250 FCFA)
                        </Button>
                        <Button 
                            size="large" 
                            ghost 
                            className="text-white border-white/40 hover:border-white hover:text-white"
                            onClick={() => { setSelectedPlan('semiannual'); setIsSubModalVisible(true); }}
                        >
                            Semestral (6 meses) (98.400 FCFA)
                        </Button>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold m-0">Meus Produtos</h1>
                    <p className="text-gray-500 m-0">
                        {isPremium ? "Gerencie seu catálogo de ofertas." : "Seus produtos são gerenciados pela nossa equipe."}
                    </p>
                </div>
                {isPremium && (
                    <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => {
                        setEditingProduct(null);
                        form.resetFields();
                        setImgUrl("");
                        setIsModalVisible(true);
                    }} className="bg-blue-600 h-10 px-6 rounded-lg">
                        Adicionar Produto
                    </Button>
                )}
            </div>

            <Card bordered={false} className="shadow-sm rounded-2xl overflow-hidden">
                <Table
                    columns={columns}
                    dataSource={products}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 6 }}
                />
            </Card>

            <Modal
                title={
                    <div className="py-2">
                        <h3 className="text-xl font-bold m-0">{editingProduct ? "Editar Produto" : "Novo Produto"}</h3>
                        <p className="text-gray-500 text-sm font-normal m-0">{editingProduct ? "Atualize as informações abaixo" : "Preencha os detalhes do seu novo item"}</p>
                    </div>
                }
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
                centered
                destroyOnClose
            >
                <Form layout="vertical" form={form} onFinish={handleSave} size="large">
                    <Tabs defaultActiveKey="1" items={[
                        {
                            key: '1',
                            label: 'Informações Básicas',
                            children: (
                                <div className="pt-4">
                                    <Form.Item label="Nome do Produto" name="name" rules={[{ required: true, message: 'O nome é obrigatório' }]}>
                                        <Input placeholder="Ex: Moletom Básico Preto" className="font-medium" />
                                    </Form.Item>

                                    <Row gutter={16}>
                                        <Col span={24}>
                                            <Form.Item label="Catálogos do Produto" name="category" rules={[{ required: true, message: 'Selecione ou crie pelo menos um catálogo' }]}>
                                                <Select
                                                    mode="tags"
                                                    style={{ width: '100%' }}
                                                    placeholder="Selecione ou digite para criar novo catálogo (Ex: Camisa, Tênis, Acessório)..."
                                                    tokenSeparators={[',']}
                                                >
                                                    {catalogs.map(cat => <Option key={cat} value={cat}>{cat}</Option>)}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Form.Item label="Descrição Detalhada" name="description" rules={[{ required: true, message: 'A descrição é obrigatória' }]}>
                                        <TextArea rows={4} placeholder="Descreva o material, detalhes do design, etc." />
                                    </Form.Item>
                                </div>
                            )
                        },
                        {
                            key: '2',
                            label: 'Preço & Estoque',
                            children: (
                                <div className="pt-4">
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <div className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100">
                                                <Form.Item label="Preço Final (FCFA)" name="price" rules={[{ required: true, message: 'Defina o preço' }]} className="mb-0">
                                                    <InputNumber
                                                      min={0} step={500}
                                                      style={{ width: '100%' }}
                                                      addonAfter="FCFA" size="large"
                                                      className="font-bold text-blue-600"
                                                      formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                                      parser={v => v.replace(/\./g, '')}
                                                    />
                                                </Form.Item>
                                                <p className="text-xs text-gray-500 mt-2">Valor que o cliente pagará. Mínimo: 25 FCFA.</p>
                                            </div>
                                        </Col>
                                        <Col span={12}>
                                            <div className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100">
                                                <Form.Item label="Preço Original (FCFA)" name="originalPrice" className="mb-0">
                                                    <InputNumber
                                                      min={0} step={500}
                                                      style={{ width: '100%' }}
                                                      addonAfter="FCFA" size="large"
                                                      className="text-gray-500"
                                                      formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                                      parser={v => v.replace(/\./g, '')}
                                                    />
                                                </Form.Item>
                                                <p className="text-xs text-gray-500 mt-2">Preencha para mostrar "De 8.000 por 5.000 FCFA".</p>
                                            </div>
                                        </Col>
                                    </Row>

                                    <Divider />

                                    <h4 className="font-bold mb-4">Gestão de Estoque</h4>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item label="Quantidade Total" name="stockQuantity" rules={[{ required: true, message: 'Informe a quantidade' }]}>
                                                <InputNumber min={0} style={{ width: '100%' }} className="rounded-xl" placeholder="Ex: 50" size="large" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item label="Alerta de Estoque Baixo" name="lowStockThreshold" tooltip="O sistema enviará um email e mostrará etiqueta de '�altimas Unidades' quando o estoque chegar a este número.">
                                                <InputNumber min={0} style={{ width: '100%' }} className="rounded-xl" placeholder="Ex: 5" size="large" />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <div className="flex items-center justify-between bg-white p-4 border border-gray-200 rounded-xl mt-2">
                                        <div>
                                            <span className="font-bold block">Visível na Loja</span>
                                            <span className="text-sm text-gray-500">Pausar a venda deste produto manualmente?</span>
                                        </div>
                                        <Form.Item name="inStock" valuePropName="checked" initialValue={true} className="mb-0">
                                            <Switch checkedChildren="Online" unCheckedChildren="Oculto" />
                                        </Form.Item>
                                    </div>
                                </div>
                            )
                        },
                        {
                            key: '3',
                            label: 'Personalização',
                            children: (
                                <div className="pt-4">
                                    <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
                                        <h4 className="flex items-center gap-2 text-blue-800 font-bold m-0"><InfoCircleOutlined /> Atributos Dinâmicos</h4>
                                        <p className="text-blue-600 text-sm m-0 mt-1">
                                            Adicione opções personalizadas para seu produto. <br />
                                            Ex: <strong>Sabor</strong>: [Menta, Uva] ou <strong>Material</strong>: [Algodão, Poliéster].
                                        </p>
                                    </div>

                                    <Form.List name="attributes">
                                        {(fields, { add, remove }) => (
                                            <>
                                                {fields.map(({ key, name, ...restField }) => (
                                                    <div key={key} className="flex gap-4 items-start mb-4 bg-gray-50 p-4 rounded-xl border border-gray-200 animate-fadeIn">
                                                        <div className="flex-1">
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'name']}
                                                                label="Nome do Atributo"
                                                                rules={[{ required: true, message: 'Ex: Cor, Sabor' }]}
                                                                className="mb-3"
                                                            >
                                                                <Input placeholder="Ex: Sabor" />
                                                            </Form.Item>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'options']}
                                                                label="Opções Disponíveis"
                                                                rules={[{ required: true, message: 'Adicione pelo menos uma opção' }]}
                                                                className="mb-0"
                                                            >
                                                                <Select
                                                                    mode="tags"
                                                                    style={{ width: '100%' }}
                                                                    placeholder="Digite e dê Enter (Ex: Morango)"
                                                                    tokenSeparators={[',']}
                                                                    open={false}
                                                                />
                                                            </Form.Item>
                                                        </div>
                                                        <Button danger icon={<DeleteOutlined />} onClick={() => remove(name)} className="mt-8" />
                                                    </div>
                                                ))}
                                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} size="large" className="border-blue-300 text-blue-600 font-medium hover:border-blue-500 hover:text-blue-700">
                                                    Adicionar Atributo Personalizado
                                                </Button>
                                            </>
                                        )}
                                    </Form.List>
                                </div>
                            )
                        },
                        {
                            key: '4',
                            label: 'Mídia',
                            children: (
                                <div className="pt-4 text-center">
                                    <Form.Item label="Foto Principal" required>
                                        <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-white transition-colors">
                                            {imgUrl ? (
                                                <img src={imgUrl} alt="Preview" className="h-48 w-48 object-contain rounded-lg shadow-sm bg-white" />
                                            ) : (
                                                <div className="h-48 w-48 flex items-center justify-center text-gray-300">
                                                    <SkinOutlined style={{ fontSize: 48 }} />
                                                </div>
                                            )}

                                            <Upload showUploadList={false} beforeUpload={handleUpload}>
                                                <Button type="primary" icon={<UploadOutlined />} loading={uploading} size="large">
                                                    {imgUrl ? "Alterar Imagem" : "Carregar Imagem"}
                                                </Button>
                                            </Upload>
                                            <p className="text-xs text-gray-400 m-0">Recomendado: 800x800px, fundo transparente ou branco.</p>
                                        </div>
                                    </Form.Item>
                                </div>
                            )
                        }
                    ]} />

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-4">
                        <Button size="large" onClick={() => setIsModalVisible(false)}>Cancelar</Button>
                        <Button type="primary" htmlType="submit" size="large" className="bg-blue-600 px-8 font-bold">
                            {editingProduct ? "Salvar Alterações" : "Publicar Produto"}
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* �x� Modal de Pagamento Stripe para Assinatura */}
            <VendorSubscriptionModal
                isVisible={isSubModalVisible}
                onClose={() => setIsSubModalVisible(false)}
                planType={selectedPlan}
                token={user?.token}
                onSuccess={handleSubscriptionSuccess}
            />
        </div>
    );
};


export default VendorProducts;
