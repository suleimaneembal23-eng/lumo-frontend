import React, { useEffect, useState } from "react";
import {
      Table,
      Button,
      Modal,
      Form,
      Input,
      InputNumber,
      DatePicker,
      message,
      Select,
      Switch,
      Tag,
} from "antd";
import { EditOutlined, DeleteOutlined, GiftOutlined, UserAddOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;

const categoryOptions = [
      "Todas as Categorias",
      "Camisas de Equipas",
      "Camisas de Seleções",
      "Camisas Retrô",
      "Destaques",
      "Top Vendidos",
];

const AdminMarketing = () => {
      const [promotions, setPromotions] = useState([]);
      const [products, setProducts] = useState([]);
      const [modalVisible, setModalVisible] = useState(false);
      const [editingPromo, setEditingPromo] = useState(null);
      const [form] = Form.useForm();
      const token = localStorage.getItem("adminToken");

      const fetchData = async () => {
            try {
                  // Promotions
                  const promoRes = await fetch(
                        "http://localhost:5000/api/marketing/promotions"
                  );
                  const promos = await promoRes.json();
                  setPromotions(Array.isArray(promos) ? promos : []);

                  // Products
                  const prodRes = await fetch("http://localhost:5000/api/products", {
                        headers: { Authorization: `Bearer ${token}` },
                  });
                  const prods = await prodRes.json();
                  setProducts(Array.isArray(prods) ? prods : []);
            } catch (err) {
                  console.error(err);
                  message.error("Erro ao carregar dados");
            }
      };

      useEffect(() => {
            fetchData();
      }, []);

      const handleAddPromotion = () => {
            setEditingPromo(null);
            setModalVisible(true);
      };

      const handleEditPromotion = (promo) => {
            setEditingPromo(promo);
            setModalVisible(true);
      };

      // Efeito para inicializar o formulário quando o modal abre
      useEffect(() => {
            if (modalVisible) {
                  if (editingPromo) {
                        form.setFieldsValue({
                              ...editingPromo,
                              validUntil: editingPromo.validUntil ? dayjs(editingPromo.validUntil) : null,
                              products: editingPromo.products ? editingPromo.products.map(p => p._id || p) : [],
                              categories: editingPromo.categories || [],
                              isDailyDeal: !!editingPromo.isDailyDeal,
                              isNewUserCoupon: !!editingPromo.isNewUserCoupon,
                              active: !!editingPromo.active,
                        });
                  } else {
                        form.resetFields();
                        form.setFieldsValue({ isDailyDeal: false, isNewUserCoupon: false, active: true });
                  }
            }
      }, [modalVisible, editingPromo, form]);

      const handleDeletePromotion = async (id) => {
            try {
                  const res = await fetch(
                        `http://localhost:5000/api/marketing/promotions/${id}`,
                        {
                              method: "DELETE",
                              headers: { Authorization: `Bearer ${token}` },
                        }
                  );
                  if (!res.ok) throw new Error("Erro ao remover promoção");
                  message.success("Promoção removida!");
                  fetchData();
            } catch (err) {
                  console.error(err);
                  message.error(err.message);
            }
      };

      const handleFinish = async (values) => {
            try {
                  const codeRegex = /^[A-Za-z0-9]+$/;
                  if (!codeRegex.test(values.code)) {
                        return message.error(
                              "Código inválido: use apenas letras e números (sem espaços)."
                        );
                  }

                  // 🚨 CORREÇÃO: Garante que os Switches (que usam valuePropName="checked") enviem false
                  const isDailyDealValue = !!values.isDailyDeal;
                  const isNewUserCouponValue = !!values.isNewUserCoupon;
                  const activeValue = !!values.active;


                  const body = {
                        ...values,
                        validUntil: values.validUntil
                              ? values.validUntil.toISOString()
                              : undefined,
                        products: values.products || [],
                        categories: values.categories || [],
                        // Envia os valores booleanos corrigidos
                        isDailyDeal: isDailyDealValue,
                        isNewUserCoupon: isNewUserCouponValue,
                        active: activeValue,
                  };

                  const url = editingPromo
                        ? `http://localhost:5000/api/marketing/promotions/${editingPromo._id}`
                        : "http://localhost:5000/api/marketing/promotions";
                  const method = editingPromo ? "PUT" : "POST";

                  const res = await fetch(url, {
                        method,
                        headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify(body),
                  });

                  if (!res.ok) throw new Error("Erro ao salvar promoção");

                  message.success(
                        editingPromo ? "Promoção atualizada!" : "Promoção criada!"
                  );
                  setModalVisible(false);
                  setEditingPromo(null);
                  fetchData();
            } catch (err) {
                  console.error(err);
                  message.error(err.message);
            }
      };

      // ------------------------------------
      // COLUNAS DA TABELA
      // ------------------------------------
      const columns = [
            {
                  title: "Título",
                  dataIndex: "title",
                  key: "title",
                  render: (title, record) => (
                        <>
                              {title}
                              {record.isDailyDeal && (
                                    <Tag color="red" icon={<GiftOutlined />} style={{ marginLeft: 8 }}>
                                          OFERTA DO DIA
                                    </Tag>
                              )}
                              {record.isNewUserCoupon && (
                                    <Tag color="purple" icon={<UserAddOutlined />} style={{ marginLeft: 8 }}>
                                          NOVO CLIENTE
                                    </Tag>
                              )}
                              <Tag color={record.active ? "green" : "volcano"} style={{ marginLeft: 8 }}>
                                    {record.active ? "Ativa" : "Inativa"}
                              </Tag>
                        </>
                  )
            },
            { title: "Código", dataIndex: "code", key: "code" },
            { title: "Desconto (%)", dataIndex: "discount", key: "discount" },
            {
                  title: "Descrição",
                  dataIndex: "description",
                  key: "description",
                  ellipsis: true
            },
            {
                  title: "Validade",
                  dataIndex: "validUntil",
                  key: "validUntil",
                  render: (val) => {
                        if (!val) return "-";
                        try {
                              return dayjs(val).isValid() ? dayjs(val).format("DD/MM/YYYY") : "-";
                        } catch {
                              return "-";
                        }
                  },
            },
            {
                  title: "Produtos",
                  dataIndex: "products",
                  key: "products",
                  render: (prods) =>
                        Array.isArray(prods)
                              ? prods
                                    .map((p) => (typeof p === "string" ? p : p?.name))
                                    .filter(Boolean)
                                    .slice(0, 2)
                                    .join(", ") + (prods.length > 2 ? '...' : '')
                              : "-",
            },
            {
                  title: "Categorias",
                  dataIndex: "categories",
                  key: "categories",
                  render: (cats) => (Array.isArray(cats) ? cats.join(", ") : "-"),
            },
            {
                  title: "Ações",
                  key: "actions",
                  render: (_, record) => (
                        <>
                              <Button
                                    icon={<EditOutlined />}
                                    style={{ marginRight: 8 }}
                                    onClick={() => handleEditPromotion(record)}
                              />
                              <Button
                                    icon={<DeleteOutlined />}
                                    danger
                                    onClick={() => handleDeletePromotion(record._id)}
                              />
                        </>
                  ),
            },
      ];

      const [emailSubject, setEmailSubject] = useState("");
      const [emailContent, setEmailContent] = useState("");
      const [emailActionText, setEmailActionText] = useState("Aproveitar Oferta");
      const [emailActionUrl, setEmailActionUrl] = useState("http://localhost:3000");
      const [sendingEmail, setSendingEmail] = useState(false);

      const handleSendEmail = async () => {
            if (!emailSubject || !emailContent) {
                  return message.error("Preencha o assunto e a mensagem.");
            }

            setSendingEmail(true);
            try {
                  const res = await fetch("http://localhost:5000/api/marketing/send-email", {
                        method: "POST",
                        headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                              subject: emailSubject,
                              content: emailContent,
                              actionText: emailActionText,
                              actionUrl: emailActionUrl,
                              segment: "all_users"
                        })
                  });

                  if (!res.ok) throw new Error("Falha ao enviar emails");

                  message.success("Disparo de emails iniciado com sucesso!");
                  setEmailSubject("");
                  setEmailContent("");
            } catch (err) {
                  console.error(err);
                  message.error("Erro ao enviar emails.");
            }
            setSendingEmail(false);
      };

      // ------------------------------------
      // RENDER
      // ------------------------------------

      const { Tabs } = require("antd"); // Importação dinâmica ou mover para topo se preferir, mas aqui funciona

      const items = [
            {
                  key: '1',
                  label: 'Gerir Promoções (Cupons)',
                  children: (
                        <>
                              <Button
                                    type="primary"
                                    onClick={handleAddPromotion}
                                    style={{ marginBottom: 16 }}
                              >
                                    Criar Nova Promoção
                              </Button>

                              <Table
                                    dataSource={promotions}
                                    rowKey="_id"
                                    pagination={{ pageSize: 5 }}
                                    columns={columns}
                              />
                        </>
                  ),
            },
            {
                  key: '2',
                  label: 'Disparo de Emails (Marketing)',
                  children: (
                        <div style={{ maxWidth: 800, background: "#fff", padding: 24, borderRadius: 8 }}>
                              <h3>Enviar Email em Massa</h3>
                              <p style={{ color: "#666", marginBottom: 20 }}>
                                    Envie emails personalizados para todos os seus usuários. Use <b>{"{{name}}"}</b> para inserir o nome do cliente automaticamente.
                              </p>

                              <Form layout="vertical">
                                    <Form.Item label="Assunto do Email" required>
                                          <Input
                                                placeholder="Ex: Oferta Imperdível de Fim de Ano! 🎁"
                                                value={emailSubject}
                                                onChange={e => setEmailSubject(e.target.value)}
                                          />
                                    </Form.Item>

                                    <Form.Item label="Mensagem (HTML Suportado)" required>
                                          <Input.TextArea
                                                rows={6}
                                                placeholder="<p>Olá {{name}}, confira nossas ofertas...</p>"
                                                value={emailContent}
                                                onChange={e => setEmailContent(e.target.value)}
                                          />
                                    </Form.Item>

                                    <div style={{ display: 'flex', gap: 16 }}>
                                          <Form.Item label="Texto do Botão" style={{ flex: 1 }}>
                                                <Input
                                                      placeholder="Ex: Ver Ofertas"
                                                      value={emailActionText}
                                                      onChange={e => setEmailActionText(e.target.value)}
                                                />
                                          </Form.Item>
                                          <Form.Item label="Link do Botão" style={{ flex: 1 }}>
                                                <Input
                                                      placeholder="http://..."
                                                      value={emailActionUrl}
                                                      onChange={e => setEmailActionUrl(e.target.value)}
                                                />
                                          </Form.Item>
                                    </div>

                                    <Button
                                          type="primary"
                                          size="large"
                                          icon={<GiftOutlined />}
                                          loading={sendingEmail}
                                          onClick={handleSendEmail}
                                          style={{ width: "100%", marginTop: 10, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", border: "none" }}
                                    >
                                          Enviar Campanha Agora
                                    </Button>
                              </Form>
                        </div>
                  ),
            },
      ];

      return (
            <div style={{ padding: 24 }}>
                  <h2 style={{ marginTop: 0 }}>Gestão de Marketing</h2>
                  <Tabs defaultActiveKey="1" items={items} />

                  <Modal
                        title={editingPromo ? "Editar Promoção" : "Criar Promoção"}
                        open={modalVisible}
                        onCancel={() => {
                              setModalVisible(false);
                              setEditingPromo(null);
                        }}
                        okText="Salvar"
                        onOk={() => form.submit()}
                  >
                        <Form
                              form={form}
                              layout="vertical"
                              onFinish={handleFinish}
                              onFinishFailed={() => message.error("Por favor, preencha todos os campos obrigatórios.")}
                        >
                              <Form.Item
                                    label="Título (Exibição)"
                                    name="title"
                                    rules={[{ required: true, message: "Título é obrigatório" }]}
                              >
                                    <Input placeholder="Ex: Black Friday" />
                              </Form.Item>

                              <Form.Item
                                    label="Código do Cupom"
                                    name="code"
                                    rules={[{ required: true, message: "Código é obrigatório" }]}
                              >
                                    <Input placeholder="Ex: CUPOM123" />
                              </Form.Item>

                              <Form.Item
                                    label="Desconto (%)"
                                    name="discount"
                                    rules={[{ required: true, message: "Desconto é obrigatório" }]}
                              >
                                    <InputNumber min={1} max={100} style={{ width: "100%" }} />
                              </Form.Item>

                              <Form.Item label="Descrição" name="description">
                                    <Input.TextArea />
                              </Form.Item>

                              <Form.Item label="Validade" name="validUntil">
                                    <DatePicker
                                          format="YYYY-MM-DD HH:mm:ss"
                                          showTime
                                          style={{ width: "100%" }}
                                    />
                              </Form.Item>

                              <Form.Item
                                    label="Ativa"
                                    name="active"
                                    valuePropName="checked"
                                    initialValue={true}
                              >
                                    <Switch />
                              </Form.Item>

                              <Form.Item
                                    label="Oferta do Dia (Destaque)"
                                    name="isDailyDeal"
                                    valuePropName="checked"
                                    tooltip="Se ativado, esta promoção terá um destaque especial no site."
                                    initialValue={false}
                              >
                                    <Switch />
                              </Form.Item>

                              <Form.Item
                                    label="Exclusivo para Novos Clientes"
                                    name="isNewUserCoupon"
                                    valuePropName="checked"
                                    tooltip="Se ativado, este cupom só poderá ser usado na primeira compra do cliente."
                                    initialValue={false}
                              >
                                    <Switch checkedChildren="Sim" unCheckedChildren="Não" />
                              </Form.Item>

                              <Form.Item label="Produtos" name="products">
                                    <Select
                                          mode="multiple"
                                          placeholder="Selecione produtos"
                                          optionFilterProp="children"
                                          filterOption={(input, option) =>
                                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                          }
                                    >
                                          {products.map((p) => (
                                                <Option key={p._id} value={p._id}>
                                                      {p.name}
                                                </Option>
                                          ))}
                                    </Select>
                              </Form.Item>

                              <Form.Item label="Categorias" name="categories">
                                    <Select mode="multiple" placeholder="Selecione categorias">
                                          {categoryOptions.map((cat) => (
                                                <Option key={cat} value={cat}>
                                                      {cat}
                                                </Option>
                                          ))}
                                    </Select>
                              </Form.Item>
                        </Form>
                  </Modal>
            </div>
      );
};

export default AdminMarketing;