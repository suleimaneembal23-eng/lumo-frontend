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
import {
      EditOutlined, DeleteOutlined, GiftOutlined, UserAddOutlined, ClockCircleOutlined, RocketOutlined
} from "@ant-design/icons";

import dayjs from "dayjs";

const { Option } = Select;

const categoryOptions = [
      "Todas as Categorias",
      "Roupa Masculina",
      "Roupa Feminina",
      "Acessórios",
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
                  // Promotions (Cupons)
                  const promoRes = await fetch(`/api/marketing/promotions`, {
                        headers: { Authorization: `Bearer ${token}` },
                  });
                  const promos = await promoRes.json();
                  setPromotions(Array.isArray(promos) ? promos : []);

                  // Products (Para o Select)
                  const res = await fetch(`/api/products`);
                  const prods = await res.json();
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
                        `/api/marketing/promotions/${id}`,
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

                  // �xa� CORRE�!ÒO: Garante que os Switches (que usam valuePropName="checked") enviem false
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
                        ? `/api/marketing/promotions/${editingPromo._id}`
                        : "/api/marketing/promotions";
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
      // EMAIL STATE & HANDLERS
      // ------------------------------------
      const [emailSubject, setEmailSubject] = useState("");
      const [emailContent, setEmailContent] = useState("");
      const [emailActionText, setEmailActionText] = useState("Aproveitar Oferta");
      const [emailActionUrl, setEmailActionUrl] = useState("http://localhost:3000");
      const [sendingEmail, setSendingEmail] = useState(false);
      const [triggeringCart, setTriggeringCart] = useState(false);

      const handleTriggerAbandonedCart = async () => {
            setTriggeringCart(true);
            try {
                  const res = await fetch(`/api/marketing/abandoned-carts/trigger`, {
                        method: "POST",
                        headers: { Authorization: `Bearer ${token}` }
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.message);
                  message.success(data.message);
            } catch (err) {
                  message.error("Erro ao rodar recuperação: " + err.message);
            }
            setTriggeringCart(false);
      };

      const handleSendEmail = async () => {
            if (!emailSubject || !emailContent) {
                  return message.error("Preencha o assunto e a mensagem.");
            }

            setSendingEmail(true);
            try {
                  const res = await fetch(`/api/marketing/send-email`, {
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
      // COLUNAS DA TABELA (PREMIUM)
      // ------------------------------------
      const columns = [
            {
                  title: "Título da Promoção",
                  dataIndex: "title",
                  key: "title",
                  render: (title, record) => (
                        <div className="flex flex-col">
                              <span className="font-bold text-gray-900 text-base">{title}</span>
                              <div className="flex gap-2 mt-1 flex-wrap">
                                    {record.isDailyDeal && (
                                          <Tag color="#ff4d4f" style={{ margin: 0, borderRadius: 12, border: 'none', padding: '2px 8px' }} icon={<GiftOutlined />}>
                                                OFERTA DO DIA
                                          </Tag>
                                    )}
                                    {record.isNewUserCoupon && (
                                          <Tag color="#722ed1" style={{ margin: 0, borderRadius: 12, border: 'none', padding: '2px 8px' }} icon={<UserAddOutlined />}>
                                                NOVOS CLIENTES
                                          </Tag>
                                    )}
                                    <Tag color={record.active ? "success" : "default"} style={{ margin: 0, borderRadius: 12, border: 'none', padding: '2px 8px' }}>
                                          {record.active ? "�� Ativa" : "�9 Inativa"}
                                    </Tag>
                              </div>
                        </div>
                  )
            },
            {
                  title: "Código",
                  dataIndex: "code",
                  key: "code",
                  render: text => <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-600 font-bold border border-gray-200">{text}</span>
            },
            {
                  title: "Desconto",
                  dataIndex: "discount",
                  key: "discount",
                  render: val => <span className="text-green-600 font-bold text-lg">{val}% OFF</span>
            },
            {
                  title: "Validade",
                  dataIndex: "validUntil",
                  key: "validUntil",
                  render: (val) => {
                        if (!val) return <span className="text-gray-400">Permanente</span>;
                        const date = dayjs(val);
                        const isExpired = date.isBefore(dayjs());
                        return (
                              <div className={isExpired ? "text-red-500" : "text-gray-600"}>
                                    <span className="block font-medium"><ClockCircleOutlined /> {date.format("DD/MM/YYYY")}</span>
                                    <span className="text-xs">{date.format("HH:mm")}</span>
                              </div>
                        );
                  },
            },
            {
                  title: "Ações",
                  key: "actions",
                  align: "right",
                  render: (_, record) => (
                        <div className="flex justify-end gap-2">
                              <Button
                                    type="text"
                                    icon={<EditOutlined className="text-blue-600" />}
                                    className="bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100"
                                    onClick={() => handleEditPromotion(record)}
                              >
                                    Editar
                              </Button>
                              <Button
                                    type="text"
                                    icon={<DeleteOutlined className="text-red-600" />}
                                    className="bg-red-50 hover:bg-red-100 rounded-lg border border-red-100"
                                    onClick={() => handleDeletePromotion(record._id)}
                              >
                                    Remover
                              </Button>
                        </div>
                  ),
            },
      ];

      // Import Tabs manualmente aqui (embora já deva estar no escopo, para garantir layout)
      const { Tabs } = require("antd");

      const items = [
            {
                  key: '1',
                  label: <span className="font-medium text-base px-4">�x}x️ Gerir Promoções</span>,
                  children: (
                        <div className="mt-4">
                              <div className="flex justify-end mb-6">
                                    <Button
                                          type="primary"
                                          size="large"
                                          icon={<GiftOutlined />}
                                          onClick={handleAddPromotion}
                                          className="bg-black hover:bg-gray-800 rounded-xl px-6 h-12 shadow-md border-none"
                                    >
                                          Criar Nova Promoção
                                    </Button>
                              </div>

                              <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                                    <Table
                                          dataSource={promotions}
                                          rowKey="_id"
                                          pagination={{ pageSize: 6 }}
                                          columns={columns}
                                          rowClassName="hover:bg-gray-50 transition-colors"
                                    />
                              </div>
                        </div>
                  ),
            },
            {
                  key: '2',
                  label: <span className="font-medium text-base px-4">�x� Email Marketing</span>,
                  children: (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
                              <div className="lg:col-span-2">
                                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                          {/* Automation Section */}
                                          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-8 flex items-center justify-between">
                                                <div>
                                                      <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                                                            <RocketOutlined /> Recuperação de Carrinho
                                                      </h3>
                                                      <p className="text-blue-700 text-sm mt-1">
                                                            Identificar e notificar clientes que abandonaram o carrinho há 30+ minutos.
                                                      </p>
                                                </div>
                                                <Button
                                                      type="primary"
                                                      shape="round"
                                                      size="large"
                                                      loading={triggeringCart}
                                                      onClick={handleTriggerAbandonedCart}
                                                      className="bg-blue-600 hover:bg-blue-700 border-none shadow-md"
                                                >
                                                      Rodar Agora
                                                </Button>
                                          </div>

                                          <h3 className="text-xl font-bold text-gray-800 mb-2">Editor de Campanha</h3>
                                          <p className="text-gray-500 mb-6">Crie emails personalizados para engajar seus clientes.</p>

                                          <Form layout="vertical">
                                                <Form.Item label={<span className="font-bold">Assunto do Email</span>} required>
                                                      <Input
                                                            size="large"
                                                            placeholder="Ex: Oferta Imperdível de Fim de Ano! �x}�"
                                                            value={emailSubject}
                                                            onChange={e => setEmailSubject(e.target.value)}
                                                            className="rounded-xl"
                                                      />
                                                </Form.Item>

                                                <Form.Item label={<span className="font-bold">Mensagem (HTML Suportado)</span>} required>
                                                      <Input.TextArea
                                                            rows={8}
                                                            placeholder="<p>Olá {{name}}, confira nossas ofertas...</p>"
                                                            value={emailContent}
                                                            onChange={e => setEmailContent(e.target.value)}
                                                            className="rounded-xl"
                                                      />
                                                </Form.Item>

                                                <div className="grid grid-cols-2 gap-4">
                                                      <Form.Item label={<span className="font-bold">Texto do Botão</span>}>
                                                            <Input
                                                                  size="large"
                                                                  placeholder="Ex: Ver Ofertas"
                                                                  value={emailActionText}
                                                                  onChange={e => setEmailActionText(e.target.value)}
                                                                  className="rounded-xl"
                                                            />
                                                      </Form.Item>
                                                      <Form.Item label={<span className="font-bold">Link de Destino</span>}>
                                                            <Input
                                                                  size="large"
                                                                  placeholder="http://..."
                                                                  value={emailActionUrl}
                                                                  onChange={e => setEmailActionUrl(e.target.value)}
                                                                  className="rounded-xl"
                                                            />
                                                      </Form.Item>
                                                </div>

                                                <Button
                                                      type="primary"
                                                      size="large"
                                                      icon={<GiftOutlined />}
                                                      loading={sendingEmail}
                                                      onClick={handleSendEmail}
                                                      className="w-full h-14 rounded-xl text-lg font-bold shadow-lg"
                                                      style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", border: "none" }}
                                                >
                                                      Enviar Campanha Agora
                                                </Button>
                                          </Form>
                                    </div>
                              </div>

                              {/* Preview Card */}
                              <div className="hidden lg:block bg-gray-50 p-6 rounded-3xl border border-dashed border-gray-300 h-fit">
                                    <h4 className="text-gray-400 font-bold text-center uppercase tracking-wide mb-4">Preview Mobile</h4>
                                    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden max-w-xs mx-auto text-center pb-8">
                                          <div className="bg-gray-100 h-40 flex items-center justify-center text-gray-300 text-4xl mb-4">�x�️</div>
                                          <div className="px-6 text-left">
                                                <h3 className="font-bold text-lg mb-2 text-gray-900">{emailSubject || "Assunto..."}</h3>
                                                <div className="text-gray-600 text-sm mb-6" dangerouslySetInnerHTML={{ __html: emailContent || "Conteúdo..." }} />
                                                <div className="text-center">
                                                      <button className="bg-purple-600 text-white font-bold py-3 px-6 rounded-lg w-full">
                                                            {emailActionText}
                                                      </button>
                                                </div>
                                          </div>
                                    </div>
                              </div>
                        </div>
                  ),
            },
      ];

      return (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 min-h-[85vh]">
                  <div className="mb-8 border-b border-gray-100 pb-6">
                        <h1 className="text-3xl font-bold text-gray-900 m-0 tracking-tight">Marketing Center</h1>
                        <p className="text-gray-500 mt-2 text-base">Gerencie campanhas, promoções e automações.</p>
                  </div>

                  <Tabs defaultActiveKey="1" items={items} size="large" className="custom-tabs" />

                  <Modal
                        title={<span className="text-xl font-bold">{editingPromo ? "Editar Promoção" : "Nova Promoção"}</span>}
                        open={modalVisible}
                        onCancel={() => {
                              setModalVisible(false);
                              setEditingPromo(null);
                        }}
                        width={700}
                        footer={null}
                        centered
                        closeIcon={<span className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors">�S"</span>}
                  >
                        <div className="pt-4">
                              <Form
                                    form={form}
                                    layout="vertical"
                                    onFinish={handleFinish}
                                    onFinishFailed={() => message.error("Por favor, preencha todos os campos obrigatórios.")}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-x-6"
                              >
                                    <div className="md:col-span-2">
                                          <Form.Item
                                                label="Título da Campanha"
                                                name="title"
                                                rules={[{ required: true, message: "Título é obrigatório" }]}
                                          >
                                                <Input size="large" placeholder="Ex: Black Friday 2025" className="rounded-xl" />
                                          </Form.Item>
                                    </div>

                                    <Form.Item
                                          label="Código do Cupom"
                                          name="code"
                                          rules={[{ required: true, message: "Código é obrigatório" }]}
                                    >
                                          <Input size="large" prefix={<span className="text-gray-400 font-bold">#</span>} placeholder="CUPOM20" className="rounded-xl" />
                                    </Form.Item>

                                    <Form.Item
                                          label="Desconto (%)"
                                          name="discount"
                                          rules={[{ required: true, message: "Desconto é obrigatório" }]}
                                    >
                                          <InputNumber min={1} max={100} size="large" style={{ width: "100%" }} className="rounded-xl" />
                                    </Form.Item>

                                    <div className="md:col-span-2">
                                          <Form.Item label="Descrição" name="description">
                                                <Input.TextArea rows={2} className="rounded-xl" placeholder="Detalhes internos..." />
                                          </Form.Item>
                                    </div>

                                    <Form.Item label="Validade Limite" name="validUntil" className="md:col-span-2">
                                          <DatePicker
                                                format="YYYY-MM-DD HH:mm"
                                                showTime
                                                size="large"
                                                style={{ width: "100%" }}
                                                className="rounded-xl"
                                          />
                                    </Form.Item>

                                    <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                          {/* ATIVA */}
                                          <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                                                <span className="font-medium">Ativa</span>
                                                <Form.Item name="active" valuePropName="checked" initialValue={true} noStyle>
                                                      <Switch />
                                                </Form.Item>
                                          </div>

                                          {/* OFERTA DO DIA */}
                                          <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                                                <span className="font-medium text-red-600">Oferta do Dia</span>
                                                <Form.Item name="isDailyDeal" valuePropName="checked" initialValue={false} noStyle>
                                                      <Switch />
                                                </Form.Item>
                                          </div>

                                          {/* NOVOS CLIENTES */}
                                          <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                                                <span className="font-medium text-purple-600">Novos Clientes</span>
                                                <Form.Item name="isNewUserCoupon" valuePropName="checked" initialValue={false} noStyle>
                                                      <Switch />
                                                </Form.Item>
                                          </div>
                                    </div>

                                    <div className="md:col-span-2">
                                          <Form.Item label="Produtos Específicos (Opcional)" name="products">
                                                <Select
                                                      mode="multiple"
                                                      size="large"
                                                      placeholder="Aplicar a produtos específicos..."
                                                      className="rounded-xl"
                                                      maxTagCount="responsive"
                                                >
                                                      {products.map((p) => (
                                                            <Option key={p._id} value={p._id}>{p.name}</Option>
                                                      ))}
                                                </Select>
                                          </Form.Item>
                                          <Form.Item label="Categorias Específicas (Opcional)" name="categories">
                                                <Select mode="multiple" size="large" placeholder="Aplicar a categorias..." className="rounded-xl">
                                                      {categoryOptions.map((cat) => (
                                                            <Option key={cat} value={cat}>{cat}</Option>
                                                      ))}
                                                </Select>
                                          </Form.Item>
                                    </div>

                                    <div className="md:col-span-2 mt-4 flex justify-end gap-3">
                                          <Button size="large" onClick={() => setModalVisible(false)} className="rounded-xl">Cancelar</Button>
                                          <Button type="primary" size="large" onClick={() => form.submit()} className="bg-black text-white border-none rounded-xl px-8">Salvar Promoção</Button>
                                    </div>
                              </Form>
                        </div>
                  </Modal>
            </div>
      );
};

export default AdminMarketing;
