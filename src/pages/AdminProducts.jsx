�import React, { useEffect, useState } from "react";
import {
    Table,
    Input,
    Button,
    Space,
    Tag,
    Modal,
    Form,
    InputNumber,
    Select,
    Checkbox,
    message,
    Typography,
    Popconfirm,
    Upload,
    Divider,
} from "antd";
import {
    PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, SearchOutlined,
    FilterOutlined, InfoCircleOutlined,
} from "@ant-design/icons";
import { TOP_CATEGORIES, STANDARD_SIZES } from "../constants/products";


const { Title, Text } = Typography;
const { Option } = Select;

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const [galleryList, setGalleryList] = useState([]);
    const [vendors, setVendors] = useState([]); // �x�� Lista de vendors
    const [catalogs, setCatalogs] = useState([]);

    const [observationModalVisible, setObservationModalVisible] = useState(false);
    const [observationText, setObservationText] = useState("");
    const [observationProduct, setObservationProduct] = useState(null);

    const token = localStorage.getItem("adminToken");

    // Buscar produtos
    const fetchProducts = async () => {
        try {
            const res = await fetch(`/api/products`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Erro ao buscar produtos");
            const data = await res.json();
            setProducts(data);
            setFiltered(data);
        } catch (err) {
            console.error(err);
            message.error("Erro ao carregar produtos");
        } finally {
            setLoading(false);
        }
    };

    // Buscar vendedores disponíveis
    const fetchVendors = async () => {
        try {
            const res = await fetch(`/api/admin/vendors`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const vendorsList = await res.json();
                setVendors(vendorsList);
            }
        } catch (err) {
            console.error("Erro ao buscar vendors:", err);
        }
    };

    // Buscar catálogos (categorias)
    const fetchCatalogs = async () => {
        try {
            const res = await fetch("/api/products/categories");
            if (res.ok) {
                const data = await res.json();
                setCatalogs(data);
            }
        } catch (err) {
            console.error("Erro ao buscar catálogos:", err);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchVendors();
        fetchCatalogs();
    }, []);

    // Pesquisa
    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        const filteredData = products.filter(
            (p) =>
                p.name.toLowerCase().includes(value) ||
                (Array.isArray(p.category)
                    ? p.category.join(", ").toLowerCase()
                    : p.category?.toLowerCase()).includes(value)
        );
        setFiltered(filteredData);
    };

    // Editar produto
    const handleEdit = (record) => {
        // isPremium: vendor tem plano VIP ativo
        const vendor = record.shopId; // shopId agora vem populado
        const plan = vendor?.vendorInfo?.subscription?.plan;
        const expiry = vendor?.vendorInfo?.subscription?.expiryDate;
        const isPremium = plan === 'VIP' && expiry && new Date(expiry) > new Date();

        if (isPremium) {
            openObservation(record);
            return;
        }

        setEditingProduct(record);

        const categoryArray = Array.isArray(record.category)
            ? record.category
            : record.category
                ? [record.category]
                : [];

        // Inicializa os estados das listas de upload
        setFileList(record.image ? [{ uid: '-1', name: 'Imagem Principal', status: 'done', url: record.image }] : []);
        setGalleryList((record.gallery || []).map((url, i) => ({ uid: i, name: `Img ${i + 1}`, status: 'done', url })));

        // Define os valores do formulário
        form.setFieldsValue({
            ...record,
            shopId: record.shopId?._id || record.shopId || undefined,
            inStock: !!record.inStock,
            featured: !!record.featured,
            isNew: !!record.isNew,
            onSale: !!record.onSale,
            isLimited: !!record.isLimited,
            originalPrice: record.originalPrice > 0 ? record.originalPrice : undefined,
            gallery: undefined,
            category: categoryArray,
        });

        setIsModalVisible(true);
    };

    // Salvar produto
    const handleSave = async () => {
        try {
            let values = await form.validateFields();

            // 1. Tratamento das imagens
            if (fileList.length > 0 && fileList[0].url) {
                values.image = fileList[0].url;
            } else {
                values.image = null;
            }
            values.gallery = galleryList.map((g) => g.url);

            // 2. Mapear shopId para shopName
            if (values.shopId) {
                const selectedVendor = vendors.find(v => v._id === values.shopId || v._id?.toString() === values.shopId?.toString());
                if (selectedVendor) {
                    values.shopName = selectedVendor.vendorInfo?.storeName || selectedVendor.name;
                }
            } else {
                values.shopId = null;
                values.shopName = "Loja Principal";
            }

            // 3. Garantir que os campos booleanos estejam definidos (evitando que sejam undefined se desmarcados)
            values = {
                ...values,
                inStock: !!values.inStock,
                featured: !!values.featured,
                isNew: !!values.isNew,
                onSale: !!values.onSale,
                isLimited: !!values.isLimited, // �xa� NOVO CAMPO
                // Garantir que originalPrice seja null se for 0 ou vazio para o backend
                originalPrice: values.originalPrice > 0 ? values.originalPrice : null,
                // Manter salesCount ao editar
                salesCount: editingProduct?.salesCount || 0,
            };

            // 3. Preparar a requisição
            const method = editingProduct ? "PUT" : "POST";
            let url = editingProduct
                ? `/api/products/${editingProduct._id}`
                : `/api/products`;

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(values),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.details || "Erro ao salvar produto");

            message.success(editingProduct ? "Produto atualizado!" : "Produto criado!");
            setIsModalVisible(false);
            setEditingProduct(null);
            setFileList([]);
            setGalleryList([]);
            form.resetFields();
            fetchProducts();
        } catch (err) {
            console.error("Erro ao salvar produto:", err);
            message.error(`Erro ao salvar: ${err.message || "Verifique o console."}`);
        }
    };

    // Deletar produto
    const handleDelete = async (id) => {
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Erro ao deletar produto");
            message.success("Produto removido!");
            fetchProducts();
        } catch (err) {
            console.error(err);
            message.error("Erro ao remover produto");
        }
    };

    // Modal de Observação para Lojas Premium
    const openObservation = (record) => {
        setObservationProduct(record);
        setObservationText("");
        setObservationModalVisible(true);
    };

    const submitObservation = async () => {
        if (!observationText.trim()) return message.error("Digite a observação!");
        try {
            const res = await fetch(`/api/admin/products/${observationProduct._id}/observe`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ observation: observationText })
            });

            if (!res.ok) throw new Error("Falha ao enviar observação");

            message.success(`Observação enviada ao vendedor ${observationProduct.vendor?.vendorInfo?.storeName || 'Premium'}!`);
            setObservationModalVisible(false);
            setObservationProduct(null);
            fetchProducts();
        } catch (err) {
            message.error("Erro ao enviar observação");
        }
    };

    const handleClearObservation = async (id) => {
        try {
            const res = await fetch(`/api/admin/products/${id}/observe`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Erro ao limpar infração");

            message.success("Observação marcada como resolvida!");
            fetchProducts();
        } catch (err) {
            message.error("Erro ao limpar observação");
        }
    };

    // Upload imagem principal
    const uploadProps = {
        beforeUpload: async (file) => {
            const formData = new FormData();
            formData.append("image", file);

            try {
                const res = await fetch(`/api/upload`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Erro ao fazer upload");
                setFileList([{ uid: file.uid, name: file.name, status: 'done', url: data.imageUrl }]);
                message.success("Imagem enviada com sucesso!");
            } catch (err) {
                console.error(err);
                message.error("Erro ao enviar imagem");
            }
            return false;
        },
        fileList,
        onChange: ({ fileList: newFileList }) => setFileList(newFileList.filter(f => f.url || f.status === 'uploading')),
        onRemove: () => setFileList([]),
        maxCount: 1,
    };

    // Upload galeria
    const galleryUploadProps = {
        beforeUpload: async (file) => {
            const formData = new FormData();
            formData.append("image", file);

            try {
                const res = await fetch(`/api/upload`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Erro ao fazer upload");
                setGalleryList((prev) => [...prev, { uid: file.uid, name: file.name, status: 'done', url: data.imageUrl }]);
                message.success("Imagem da galeria enviada!");
            } catch (err) {
                console.error(err);
                message.error("Erro ao enviar imagem");
            }
            return false;
        },
        fileList: galleryList,
        onRemove: (file) => setGalleryList(galleryList.filter((g) => g.url !== file.url)),
    };

    const columns = [
        {
            title: "Imagem",
            dataIndex: "image",
            render: (text) => (
                <div style={{ width: 60, height: 60, overflow: "hidden", borderRadius: 6 }}>
                    <img
                        src={text || "https://via.placeholder.com/60"}
                        alt="Produto"
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                        }}
                    />
                </div>
            ),
        },
        {
            title: "Nome",
            dataIndex: "name",
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{text}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {record.description?.slice(0, 50)}...
                    </Text>
                </Space>
            ),
        },
        {
            title: "Categorias",
            dataIndex: "category",
            render: (cats) =>
                (Array.isArray(cats) ? cats : [cats]).map((c, i) => (
                    <Tag key={i} color="blue">
                        {c}
                    </Tag>
                )),
        },
        {
            title: "Colaborador",
            dataIndex: "shopId",
            render: (shopId) => {
                if (!shopId) return <Tag color="default">Admin</Tag>;
                const storeName = shopId.vendorInfo?.storeName || shopId.name || "Sem nome";
                const plan = shopId.vendorInfo?.subscription?.plan;
                const expiry = shopId.vendorInfo?.subscription?.expiryDate;
                const isVIP = plan === 'VIP' && expiry && new Date(expiry) > new Date();
                return (
                    <Tag color={isVIP ? 'gold' : 'purple'}>
                        {isVIP ? '�x} ' : ''}{storeName}
                    </Tag>
                );
            },
        },
        {
            title: "Preço",
            dataIndex: "price",
            render: (price, record) => (
                <div>
                    <Text strong>{Number(price).toLocaleString('fr-FR')} FCFA</Text>
                    {record.originalPrice && (
                        <Text delete type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                            {Number(record.originalPrice).toLocaleString('fr-FR')} FCFA
                        </Text>
                    )}
                </div>
            ),
        },
        {
            title: "Stock",
            dataIndex: "inStock",
            render: (inStock) => (
                <Tag color={inStock ? "green" : "red"}>
                    {inStock ? "Em Stock" : "Esgotado"}
                </Tag>
            ),
        },
        {
            title: "Ações",
            render: (_, record) => {
                const vendor = record.shopId; // shopId populado
                const plan = vendor?.vendorInfo?.subscription?.plan;
                const expiry = vendor?.vendorInfo?.subscription?.expiryDate;
                const isPremium = plan === 'VIP' && expiry && new Date(expiry) > new Date();
                return (
                    <Space>
                        {!isPremium ? (
                            <>
                                <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                                <Popconfirm
                                    title="Tem certeza que deseja excluir este produto?"
                                    onConfirm={() => handleDelete(record._id)}
                                    okText="Sim"
                                    cancelText="Não"
                                >
                                    <Button type="text" danger icon={<DeleteOutlined />} />
                                </Popconfirm>
                            </>
                        ) : (
                            <>
                                <Button type="dashed" danger size="small" onClick={() => openObservation(record)}>
                                    Observar
                                </Button>
                                {record.adminNotes && (
                                    <Popconfirm
                                        title="O problema foi resolvido?"
                                        description="Isto irá remover o aviso amarelo da loja do Vendedor."
                                        onConfirm={() => handleClearObservation(record._id)}
                                        okText="Sim"
                                        cancelText="Não"
                                    >
                                        <Button type="primary" style={{ backgroundColor: '#52c41a' }} size="small">
                                            Resolver
                                        </Button>
                                    </Popconfirm>
                                )}
                            </>
                        )}
                    </Space>
                );
            },
        },
    ];

    return (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 min-h-[80vh]">
            {/* Header Moderno */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 m-0 tracking-tight">Gestão de Produtos</h1>
                    <p className="text-gray-500 mt-2 text-base">Gerencie seu inventário, estoque e variações.</p>
                </div>
                <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    shape="round"
                    className="bg-black hover:bg-gray-800 border-none shadow-xl shadow-gray-200 h-12 px-8 font-semibold text-base"
                    onClick={() => {
                        form.resetFields();
                        setEditingProduct(null);
                        setFileList([]);
                        setGalleryList([]);
                        setIsModalVisible(true);
                    }}
                >
                    Novo Produto
                </Button>
            </div>

            {/* Barra de Ferramentas / Filtros */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                <Input
                    prefix={<SearchOutlined className="text-gray-400 text-lg mr-2" />}
                    placeholder="Pesquisar por nome, categoria ou tag..."
                    onChange={handleSearch}
                    className="w-full md:max-w-md border-none bg-transparent shadow-none text-base h-12 focus:shadow-none hover:bg-white rounded-xl transition-all pl-4"
                    allowClear
                />
            </div>

            {/* Tabela Estilizada */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                <Table
                    columns={columns}
                    dataSource={filtered}
                    loading={loading}
                    rowKey="_id"
                    pagination={{ pageSize: 7, showSizeChanger: false }}
                    rowClassName="hover:bg-gray-50 transition-colors cursor-pointer"
                    onRow={(record) => ({
                        onClick: () => handleEdit(record),
                    })}
                />
            </div>

            <Modal
                title={<span className="text-2xl font-bold tracking-tight">{editingProduct ? "Editar Produto" : "Criar Produto Premium"}</span>}
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    setEditingProduct(null);
                    setFileList([]);
                    setGalleryList([]);
                    form.resetFields();
                }}
                onOk={handleSave}
                okText="Salvar Alterações"
                cancelText="Cancelar"
                width={900}
                centered
                okButtonProps={{ size: "large", shape: "round", className: "bg-black hover:bg-gray-800 border-none" }}
                cancelButtonProps={{ size: "large", shape: "round", type: "text" }}
                maskClosable={false}
            >
                <div className="pt-6">
                    <Form form={form} layout="vertical" initialValues={{ inStock: true, featured: false, isNew: false, onSale: false, isLimited: false }} size="large">
                        {/* Selecionar Loja / Colaborador */}
                        <Form.Item label="Colaborador (Loja)" name="shopId" tooltip="Selecione a loja responsável por este produto">
                            <Select placeholder="Selecione um Colaborador (opcional)" className="rounded-xl" allowClear showSearch filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}>
                                {vendors.map(v => (
                                    <Option key={v._id} value={v._id}>
                                        {v.vendorInfo?.storeName || v.name} ({v.email})
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Form.Item label="Nome do Produto" name="name" rules={[{ required: true }]} className="font-semibold">
                                <Input className="rounded-xl" placeholder="Ex: T-Shirt Básica Branca" />
                            </Form.Item>
                            <Form.Item label="Catálogos do Produto" name="category" rules={[{ required: true, message: 'Selecione ou crie pelo menos um catálogo' }]}>
                                <Select mode="tags" placeholder="Crie um novo catálogo (Ex: Camisa, Tênis)..." className="rounded-xl" tokenSeparators={[',']}>
                                    {catalogs.map((c) => (
                                        <Option key={c} value={c}>{c}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </div>

                        <Form.Item label="Descrição" name="description">
                            <Input.TextArea rows={3} className="rounded-xl" placeholder="Descreva o produto com detalhes..." />
                        </Form.Item>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Form.Item label="Preço (FCFA)" name="price" rules={[{ required: true, message: "O preço é obrigatório" }]}>
                                <InputNumber min={0} step={500} style={{ width: "100%" }} className="rounded-xl" addonAfter="FCFA"
                                  formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                  parser={v => v.replace(/\./g, '')} />
                            </Form.Item>
                            <Form.Item label="Preço Original (Para Desconto)" name="originalPrice">
                                <InputNumber min={0} step={500} style={{ width: "100%" }} className="rounded-xl opacity-80" addonAfter="FCFA"
                                  formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                  parser={v => v.replace(/\./g, '')} />
                            </Form.Item>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-2xl mb-6 border border-gray-100">
                            <h4 className="text-gray-500 font-bold uppercase text-xs mb-4 tracking-wider">Mídia & Visual</h4>
                            <div className="flex gap-8">
                                <Form.Item label="Imagem Principal" valuePropName="fileList" className="mb-0">
                                    <Upload {...uploadProps} listType="picture-card" className="avatar-uploader">
                                        {fileList.length < 1 && <div><PlusOutlined /><div style={{ marginTop: 8 }}>Capa</div></div>}
                                    </Upload>
                                </Form.Item>

                                <Form.Item label="Galeria" className="mb-0 flex-1">
                                    <Upload {...galleryUploadProps} listType="picture-card">
                                        <div><PlusOutlined /><div style={{ marginTop: 8 }}>Galeria</div></div>
                                    </Upload>
                                </Form.Item>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <h4 className="text-gray-500 font-bold uppercase text-xs mb-4 tracking-wider">Opções & Flags</h4>
                            <Space direction="horizontal" wrap size="large">
                                <Form.Item name="inStock" valuePropName="checked" noStyle><Checkbox>Em Stock</Checkbox></Form.Item>
                                <Form.Item name="featured" valuePropName="checked" noStyle><Checkbox>Destaque</Checkbox></Form.Item>
                                <Form.Item name="isNew" valuePropName="checked" noStyle><Checkbox>Novo</Checkbox></Form.Item>
                                <Form.Item name="onSale" valuePropName="checked" noStyle><Checkbox>Em Promoção</Checkbox></Form.Item>
                                <Form.Item name="isLimited" valuePropName="checked" noStyle><Checkbox>Edição Limitada</Checkbox></Form.Item>
                            </Space>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <Form.Item label="Detalhes Técnicos" name="technicalDetails">
                                <Input.TextArea rows={2} className="rounded-xl" />
                            </Form.Item>
                            <div className="grid grid-cols-2 gap-4">
                                <Form.Item label="Entrega" name="deliveryTime">
                                    <Input className="rounded-xl" />
                                </Form.Item>
                                <Form.Item label="Devolução" name="returnTime">
                                    <Input className="rounded-xl" />
                                </Form.Item>
                            </div>
                        </div>

                        {/* �x}� ATRIBUTOS DIN�MICOS */}
                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mt-6">
                            <h4 className="text-blue-800 font-bold mb-2 flex items-center gap-2">
                                <InfoCircleOutlined /> Atributos Personalizados
                            </h4>
                            <p className="text-blue-600 text-sm mb-4">
                                Adicione características dinâmicas ao produto (Sabor, Cor, Material, etc.)
                            </p>

                            <Form.List name="attributes">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(({ key, name, ...restField }) => (
                                            <div key={key} className="flex gap-4 items-start mb-4 bg-white p-4 rounded-xl border border-gray-200">
                                                <div className="flex-1">
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'name']}
                                                        label="Nome do Atributo"
                                                        rules={[{ required: true, message: 'Ex: Sabor, Cor' }]}
                                                        className="mb-3"
                                                    >
                                                        <Input placeholder="Ex: Sabor" className="rounded-xl" />
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
                                                            placeholder="Digite e dê Enter (Ex: Menta, Uva)"
                                                            tokenSeparators={[',']}
                                                            className="rounded-xl"
                                                        />
                                                    </Form.Item>
                                                </div>
                                                <Button danger icon={<DeleteOutlined />} onClick={() => remove(name)} className="mt-8" />
                                            </div>
                                        ))}
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} size="large" className="rounded-xl">
                                            Adicionar Atributo Personalizado
                                        </Button>
                                    </>
                                )}
                            </Form.List>
                        </div>

                    </Form>
                </div>
            </Modal>

            {/* Modal de Observação para Produtos Premium */}
            <Modal
                title="Notificar Vendedor Premium"
                open={observationModalVisible}
                onCancel={() => setObservationModalVisible(false)}
                onOk={submitObservation}
                okText="Enviar Aviso"
                cancelText="Cancelar"
                okButtonProps={{ danger: true }}
            >
                <div className="p-4">
                    <p className="mb-4 text-gray-600">Este produto pertence a uma loja Premium. Por motivos contratuais, não pode apagá-lo nem editá-lo diretamente. Pode, no entanto, contactar o vendedor!</p>
                    <Input.TextArea
                        rows={4}
                        placeholder="Ex: Olá, a imagem do produto tem baixa qualidade..."
                        value={observationText}
                        onChange={(e) => setObservationText(e.target.value)}
                        className="rounded-xl"
                    />
                </div>
            </Modal>
        </div>
    );
};

export default AdminProducts;
