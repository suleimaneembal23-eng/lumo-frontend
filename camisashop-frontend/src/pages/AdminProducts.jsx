import React, { useEffect, useState } from "react";
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
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

const categoryOptions = [
    "Camisas de Equipas",
    "Camisas de Seleções",
    "Camisas Retrô",
    "Destaques",
    "Top Vendidos",
];

const sizeOptions = ["S", "M", "L", "XL", "XXL"];

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const [galleryList, setGalleryList] = useState([]);

    const token = localStorage.getItem("adminToken");

    // Buscar produtos
    const fetchProducts = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/products", {
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

    useEffect(() => {
        fetchProducts();
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
        setEditingProduct(record);

        const categoryArray = Array.isArray(record.category)
            ? record.category
            : record.category
            ? [record.category]
            : [];

        // Inicializa os estados das listas de upload
        setFileList(record.image ? [{ uid: '-1', name: 'Imagem Principal', status: 'done', url: record.image }] : []);
        setGalleryList((record.gallery || []).map((url, i) => ({ uid: i, name: `Img ${i + 1}`, status: 'done', url })));

        // Define os valores do formulário, garantindo que os booleanos sejam tratados.
        form.setFieldsValue({
            ...record,
            // Tratamento de valores para garantir que checkboxes sejam inicializadas
            inStock: !!record.inStock,
            featured: !!record.featured,
            isNew: !!record.isNew,
            onSale: !!record.onSale,
            isLimited: !!record.isLimited, // 🚀 NOVO CAMPO
            // OriginalPrice precisa ser null/undefined para o InputNumber funcionar corretamente se for 0 ou null
            originalPrice: record.originalPrice > 0 ? record.originalPrice : undefined,
            gallery: undefined, 
            size: record.size || [],
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

            // 2. Garantir que os campos booleanos estejam definidos (evitando que sejam undefined se desmarcados)
            values = {
                ...values,
                inStock: !!values.inStock,
                featured: !!values.featured,
                isNew: !!values.isNew,
                onSale: !!values.onSale,
                isLimited: !!values.isLimited, // 🚀 NOVO CAMPO
                // Garantir que originalPrice seja null se for 0 ou vazio para o backend
                originalPrice: values.originalPrice > 0 ? values.originalPrice : null, 
                // Manter salesCount ao editar
                salesCount: editingProduct?.salesCount || 0,
            };

            // 3. Preparar a requisição
            const method = editingProduct ? "PUT" : "POST";
            const url = editingProduct
                ? `http://localhost:5000/api/products/${editingProduct._id}`
                : "http://localhost:5000/api/products";

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
            const res = await fetch(`http://localhost:5000/api/products/${id}`, {
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

    // Upload imagem principal
    const uploadProps = {
        beforeUpload: async (file) => {
            const formData = new FormData();
            formData.append("image", file);

            try {
                const res = await fetch("http://localhost:5000/api/upload", {
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
                const res = await fetch("http://localhost:5000/api/upload", {
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
            title: "Preço",
            dataIndex: "price",
            render: (price, record) => (
                <div>
                    <Text strong>€{Number(price).toFixed(2)}</Text>
                    {record.originalPrice && (
                        <Text delete type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                            €{Number(record.originalPrice).toFixed(2)}
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
            render: (_, record) => (
                <Space>
                    <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm
                        title="Tem certeza que deseja excluir este produto?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Sim"
                        cancelText="Não"
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ background: "#fff", padding: 24, borderRadius: 12 }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                }}
            >
                <div>
                    <Title level={3} style={{ margin: 0 }}>
                        Gestão de Produtos
                    </Title>
                    <Text type="secondary">Gerir o catálogo de produtos da loja</Text>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{ background: "#000", borderColor: "#000" }}
                    onClick={() => {
                        form.resetFields();
                        setEditingProduct(null);
                        setFileList([]);
                        setGalleryList([]);
                        setIsModalVisible(true);
                    }}
                >
                    + Novo Produto
                </Button>
            </div>

            <Input.Search
                placeholder="Pesquisar produtos..."
                onChange={handleSearch}
                style={{ width: 300, marginBottom: 16 }}
            />

            <Table
                columns={columns}
                dataSource={filtered}
                loading={loading}
                rowKey="_id"
                pagination={{ pageSize: 7 }}
            />

            <Modal
                title={editingProduct ? "Editar Produto" : "Novo Produto"}
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    setEditingProduct(null);
                    setFileList([]);
                    setGalleryList([]);
                    form.resetFields();
                }}
                onOk={handleSave}
                okText="Salvar"
                cancelText="Cancelar"
            >
                <Form form={form} layout="vertical" initialValues={{ inStock: true, featured: false, isNew: false, onSale: false, isLimited: false }}>
                    <Form.Item label="Nome" name="name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Descrição" name="description">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    <Form.Item label="Categorias" name="category">
                        <Select mode="multiple" placeholder="Selecione categorias">
                            {categoryOptions.map((c) => (
                                <Option key={c} value={c}>
                                    {c}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Tamanhos Disponíveis" name="size">
                        <Select mode="multiple" placeholder="Selecione tamanhos">
                            {sizeOptions.map((s) => (
                                <Option key={s} value={s}>
                                    {s}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Preço (€)" name="price" rules={[{ required: true, message: "O preço é obrigatório" }]}>
                        <InputNumber min={0} style={{ width: "100%" }} step="0.01" parser={value => value.replace(/\€\s?|(,*)/g, '')} formatter={value => `€ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                    </Form.Item>
                    <Form.Item label="Preço Antigo (€)" name="originalPrice">
                        <InputNumber min={0} style={{ width: "100%" }} step="0.01" placeholder="Deixe vazio se não houver desconto" parser={value => value.replace(/\€\s?|(,*)/g, '')} formatter={value => `€ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                    </Form.Item>

                    <Form.Item label="Imagem do Produto" valuePropName="fileList">
                        <Upload {...uploadProps} listType="picture">
                            {fileList.length < 1 && <Button icon={<UploadOutlined />}>Selecionar Imagem</Button>}
                        </Upload>
                    </Form.Item>

                    <Form.Item label="Galeria de Imagens">
                        <Upload {...galleryUploadProps} listType="picture">
                            <Button icon={<PlusOutlined />}>Adicionar à Galeria</Button>
                        </Upload>
                    </Form.Item>
                    <Space direction="horizontal" wrap>
                        <Form.Item label="Em Stock" name="inStock" valuePropName="checked">
                            <Checkbox />
                        </Form.Item>
                        <Form.Item label="Destaque" name="featured" valuePropName="checked">
                            <Checkbox />
                        </Form.Item>
                        <Form.Item label="Novo Produto" name="isNew" valuePropName="checked">
                            <Checkbox />
                        </Form.Item>
                        <Form.Item label="Em Promoção" name="onSale" valuePropName="checked">
                            <Checkbox />
                        </Form.Item>
                        <Form.Item label="Edição Limitada" name="isLimited" valuePropName="checked">
                            <Checkbox />
                        </Form.Item>
                    </Space>
                    
                    <Form.Item label="Detalhes Técnicos" name="technicalDetails">
                        <Input.TextArea rows={2} placeholder="Ex.: Tecido respirável, bordados oficiais" />
                    </Form.Item>
                    {/* Campos adicionais que podem estar no seu esquema (SalesCount, deliveryTime, returnTime) */}
                    <Form.Item label="Tempo de Entrega" name="deliveryTime">
                        <Input placeholder="Ex: 5-10 dias úteis" />
                    </Form.Item>
                    <Form.Item label="Tempo de Devolução" name="returnTime">
                        <Input placeholder="Ex: 30 dias" />
                    </Form.Item>
                    
                </Form>
            </Modal>
        </div>
    );
};

export default AdminProducts;