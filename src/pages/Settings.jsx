import React, { useEffect, useState, useContext } from "react";
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  message,
  Spin,
  Typography,
  Divider,
  Space,
  Select,
  Tabs,
  Badge
} from "antd";
import {
  SaveOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
  GlobalOutlined,
  PhoneOutlined,
  BgColorsOutlined,
  DollarOutlined,
  CarOutlined,
  GiftOutlined,
  InfoCircleOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { SettingsContext } from "../context/SettingsContext";
import { countries } from "../utils/countries";


const { Title, Text } = Typography;
const { Option } = Select;

const Settings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [settingsData, setSettingsData] = useState(null);

  const { refreshSettings } = useContext(SettingsContext);

  const token = localStorage.getItem("adminToken");

  const fetchSettings = async () => {
    setInitialLoading(true);
    try {
      const res = await fetch(`/api/settings`);
      if (!res.ok) throw new Error("Erro ao carregar definiÃ§Ãµes.");
      const data = await res.json();
      setSettingsData(data);

      form.setFieldsValue({
        siteName: data.siteName || "",
        siteDescription: data.siteDescription || "",
        address: data.address || "",
        contactEmail: data.contactEmail || "",
        contactPhone: data.contactPhone || "",
        maxShippingDays: data.maxShippingDays || 1,
        returnPolicyDays: data.returnPolicyDays || 1,
        currency: data.currency || "EUR",
        footerNote: data.footerNote || "",
        logoUrl: data.logoUrl || "",
        bannerUrl: data.bannerUrl || "",
        primaryColor: data.primaryColor || "#FF0000",
        secondaryColor: data.secondaryColor || "#00FF00",
        backgroundColor: data.backgroundColor || "#ffffff",
        shippingInfo: data.shippingInfo || "",
        returnInfo: data.returnInfo || "",
        taxRate: data.taxRate || 0,
        supportHours: data.supportHours || "",
        aboutUs: data.aboutUs || "",
        contactInfo: data.contactInfo || "",
        exchangeRateFCFA: data.exchangeRateFCFA || 655.957,
        welcomeCouponCode: data.welcomeCouponCode || "BEMVINDO10",
        welcomeCouponDiscount: data.welcomeCouponDiscount || 10,
        shippingRates: data.shippingRates || [],
        paymentConfig: data.paymentConfig || { orangeMoneyNumber: "", bankTransferInfo: "", creditCardEnabled: true },
        customizationPrice: data.customizationPrice || 3,
        badgePrice: data.badgePrice || 5,
        freeShippingThreshold: data.freeShippingThreshold || 0,
        shippingMethods: data.shippingMethods || [],
      });

    } catch (err) {
      console.error(err);
      message.error("Erro ao carregar definiÃ§Ãµes do site.");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const onFinish = async (values) => {
    if (!token) {
      message.warning("Precisa estar logado como administrador.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao salvar as definiÃ§Ãµes.");
      }

      const updatedData = await res.json();
      setSettingsData(updatedData);
      form.setFieldsValue(updatedData);
      refreshSettings();
      message.success("DefiniÃ§Ãµes atualizadas com sucesso!");
      setEditing(false);
    } catch (err) {
      console.error(err);
      message.error(err.message || "Erro ao atualizar definiÃ§Ãµes.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!token) {
      message.warning("Precisa estar logado como administrador.");
      return;
    }

    try {
      const res = await fetch(`/api/settings`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erro ao eliminar definiÃ§Ãµes.");
      setSettingsData(null);
      form.resetFields();
      setEditing(true);
      refreshSettings();
      message.success("DefiniÃ§Ãµes eliminadas com sucesso!");
    } catch (err) {
      console.error(err);
      message.error(err.message || "Erro ao eliminar definiÃ§Ãµes.");
    }
  };

  if (initialLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" tip="Carregando configuraÃ§Ãµes..." />
      </div>
    );
  }

  const items = [
    {
      key: '1',
      label: <span className="flex items-center gap-2"><GlobalOutlined /> Geral</span>,
      children: (
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item name="siteName" label="Nome do Site" rules={[{ required: true }]} className="font-semibold">
              <Input size="large" className="rounded-xl" placeholder="Ex: Lumo" />
            </Form.Item>
            <Form.Item name="contactEmail" label="Email de Contacto" rules={[{ required: true, type: "email" }]}>
              <Input size="large" className="rounded-xl" placeholder="srstore.fc@gmail.com" />
            </Form.Item>
          </div>
          <Form.Item name="siteDescription" label="DescriÃ§Ã£o do Site" rules={[{ required: true }]}>
            <Input.TextArea rows={3} className="rounded-xl" placeholder="Breve descriÃ§Ã£o sobre a loja..." />
          </Form.Item>
          <Form.Item name="aboutUs" label="Sobre NÃ³s (PÃ¡gina)">
            <Input.TextArea rows={5} className="rounded-xl" placeholder="ConteÃºdo da secÃ§Ã£o Sobre NÃ³s..." />
          </Form.Item>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item name="footerNote" label="Nota de RodapÃ©">
              <Input className="rounded-xl" placeholder="Â© 2026 Lumo..." />
            </Form.Item>
            <Form.Item name="supportHours" label="HorÃ¡rio de Suporte">
              <Input className="rounded-xl" placeholder="Ex: Seg-Sex 9h-18h" />
            </Form.Item>
          </div>
        </div>
      ),
    },
    {
      key: '2',
      label: <span className="flex items-center gap-2"><PhoneOutlined /> Contato</span>,
      children: (
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item name="address" label="Morada FÃ­sica" rules={[{ required: true }]}>
              <Input size="large" className="rounded-xl" prefix={<InfoCircleOutlined className="text-gray-300" />} />
            </Form.Item>
            <Form.Item name="contactPhone" label="Telefone" rules={[{ required: true }]}>
              <Input size="large" className="rounded-xl" prefix={<PhoneOutlined className="text-gray-300" />} />
            </Form.Item>
          </div>
          <Form.Item name="contactInfo" label="InformaÃ§Ãµes Adicionais de Contato">
            <Input.TextArea rows={3} className="rounded-xl" placeholder="WhatsApp, Redes Sociais..." />
          </Form.Item>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item name="logoUrl" label="URL do Logo">
              <Input className="rounded-xl" prefix={<GlobalOutlined className="text-gray-300" />} />
            </Form.Item>
            <Form.Item name="bannerUrl" label="URL do Banner Principal">
              <Input className="rounded-xl" />
            </Form.Item>
          </div>
        </div>
      ),
    },
    {
      key: '3',
      label: <span className="flex items-center gap-2"><BgColorsOutlined /> Visual</span>,
      children: (
        <div className="flex gap-8 justify-around p-8 bg-gray-50 rounded-2xl border border-gray-100">
          <Form.Item name="primaryColor" label="Cor PrimÃ¡ria" className="text-center">
            <div className="flex flex-col items-center gap-2">
              <Input type="color" className="w-20 h-20 p-1 rounded-xl cursor-pointer shadow-sm" />
              <span className="text-xs text-gray-500">BotÃµes, Destaques</span>
            </div>
          </Form.Item>
          <Form.Item name="secondaryColor" label="Cor SecundÃ¡ria" className="text-center">
            <div className="flex flex-col items-center gap-2">
              <Input type="color" className="w-20 h-20 p-1 rounded-xl cursor-pointer shadow-sm" />
              <span className="text-xs text-gray-500">SecundÃ¡rios</span>
            </div>
          </Form.Item>
          <Form.Item name="backgroundColor" label="Cor de Fundo" className="text-center">
            <div className="flex flex-col items-center gap-2">
              <Input type="color" className="w-20 h-20 p-1 rounded-xl cursor-pointer shadow-sm" />
              <span className="text-xs text-gray-500">Background</span>
            </div>
          </Form.Item>
        </div>
      )
    },
    {
      key: '4',
      label: <span className="flex items-center gap-2"><CarOutlined /> LogÃ­stica</span>,
      children: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item name="maxShippingDays" label="Prazo Entrega (dias)" rules={[{ required: true }]}>
              <InputNumber min={1} max={30} className="w-full rounded-xl" size="large" />
            </Form.Item>
            <Form.Item name="returnPolicyDays" label="Prazo DevoluÃ§Ã£o (dias)" rules={[{ required: true }]}>
              <InputNumber min={1} max={60} className="w-full rounded-xl" size="large" />
            </Form.Item>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item name="shippingInfo" label="Info. Envio">
              <Input.TextArea rows={3} className="rounded-xl" />
            </Form.Item>
            <Form.Item name="returnInfo" label="Info. DevoluÃ§Ã£o">
              <Input.TextArea rows={3} className="rounded-xl" />
            </Form.Item>
          </div>

          <Divider orientation="left">ConfiguraÃ§Ã£o AvanÃ§ada de Envio</Divider>
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-6">
            <Form.Item
              name="freeShippingThreshold"
              label="Entrega GrÃ¡tis acima de (FCFA)"
              extra="Defina 0 para desativar. Se o subtotal atingir este valor, o envio serÃ¡ grÃ¡tis."
            >
              <InputNumber min={0} step={500} className="w-full rounded-xl" addonAfter="FCFA" size="large"
                formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                parser={v => v.replace(/\./g, '')} />
            </Form.Item>
          </div>

          <Divider orientation="left">MÃ©todos de Envio (OpÃ§Ãµes para o Cliente)</Divider>
          <Form.List name="shippingMethods">
            {(fields, { add, remove }) => (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col gap-4">
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      label="Nome (Ex: Standard)"
                      rules={[{ required: true, message: 'Nome obrigatÃ³rio' }]}
                      className="flex-1 mb-0 w-full"
                    >
                      <Input placeholder="Standard" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'deliveryTime']}
                      label="Prazo (Ex: 3-5 dias)"
                      rules={[{ required: true, message: 'Prazo obrigatÃ³rio' }]}
                      className="flex-1 mb-0 w-full"
                    >
                      <Input placeholder="3-5 dias" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'price']}
                      label="PreÃ§o (FCFA)"
                      rules={[{ required: true, message: 'PreÃ§o obrigatÃ³rio' }]}
                      className="w-40 mb-0"
                    >
                      <InputNumber min={0} step={500} placeholder="FCFA" addonAfter="FCFA"
                        formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                        parser={v => v.replace(/\./g, '')} />
                    </Form.Item>
                    <Button type="text" danger onClick={() => remove(name)} icon={<DeleteOutlined />} shape="circle" />
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<EditOutlined />} className="mt-2 rounded-xl h-12">Adicionar MÃ©todo de Envio</Button>
              </div>
            )}
          </Form.List>

          <Divider orientation="left">Taxas Internacionais (Opcional)</Divider>
          <Form.List name="shippingRates">
            {(fields, { add, remove }) => (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline" className="w-full">
                    <Form.Item
                      {...restField}
                      name={[name, 'country']}
                      rules={[{ required: true, message: 'PaÃ­s obrigatÃ³rio' }]}
                      className="flex-1"
                    >
                      <Select showSearch placeholder="PaÃ­s" className="rounded-lg w-full">
                        <Option value="default">PadrÃ£o (Resto do Mundo)</Option>
                        {countries.map((c) => (<Option key={c} value={c}>{c}</Option>))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'cost']}
                      rules={[{ required: true, message: 'Custo obrigatÃ³rio' }]}
                    >
                      <InputNumber placeholder="FCFA" min={0} step={500} addonAfter="FCFA" className="rounded-lg"
                        formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                        parser={v => v.replace(/\./g, '')} />
                    </Form.Item>
                    <Button type="text" danger onClick={() => remove(name)} icon={<DeleteOutlined />} shape="circle" />
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<EditOutlined />} className="mt-2 rounded-xl">Adicionar Taxa</Button>
              </div>
            )}
          </Form.List>
        </div>
      )
    },
    {
      key: '5',
      label: <span className="flex items-center gap-2"><DollarOutlined /> Financeiro</span>,
      children: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Form.Item name="currency" label="Moeda" rules={[{ required: true }]}>
              <Input className="rounded-xl" />
            </Form.Item>
            <Form.Item name="taxRate" label="Imposto (%)">
              <InputNumber min={0} max={100} className="w-full rounded-xl" />
            </Form.Item>
          </div>



          <Divider orientation="left">ConfiguraÃ§Ã£o de PersonalizaÃ§Ã£o</Divider>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-yellow-50 p-6 rounded-2xl border border-yellow-100">
            <Form.Item name="customizationPrice" label="PreÃ§o Nome/NÃºmero (FCFA)" rules={[{ required: true }]}>
              <InputNumber min={0} step={500} className="w-full rounded-xl" addonAfter="FCFA"
                formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                parser={v => v.replace(/\./g, '')} />
            </Form.Item>
            <Form.Item name="badgePrice" label="PreÃ§o Patch/Badge (FCFA)" rules={[{ required: true }]}>
              <InputNumber min={0} step={500} className="w-full rounded-xl" addonAfter="FCFA"
                formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                parser={v => v.replace(/\./g, '')} />
            </Form.Item>
          </div>

          <Divider orientation="left">ConfiguraÃ§Ã£o de Pagamento</Divider>
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <Form.Item label="NÃºmero MB WAY (TelemÃ³vel)" name={['paymentConfig', 'mbWayNumber']}>
              <Input prefix={<PhoneOutlined />} className="rounded-xl" placeholder="Ex: 912345678" />
            </Form.Item>
            <Form.Item label="NÃºmero Orange Money (Opcional)" name={['paymentConfig', 'orangeMoneyNumber']}>
              <Input prefix={<PhoneOutlined className="text-orange-500" />} className="rounded-xl" placeholder="Ex: +245 9XXXXXXX" />
            </Form.Item>
            <Form.Item label="Dados BancÃ¡rios (IBAN/NIB)" name={['paymentConfig', 'bankTransferInfo']}>
              <Input.TextArea rows={3} className="rounded-xl" prefix={<BankOutlined />} placeholder="IBAN: PT50..." />
            </Form.Item>
            <Form.Item name={['paymentConfig', 'creditCardEnabled']} valuePropName="checked" className="mb-0">
              <div className="bg-white p-3 rounded-xl inline-block border border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="font-medium">Habilitar SimulaÃ§Ã£o de CartÃ£o de CrÃ©dito</span>
                </label>
              </div>
            </Form.Item>
          </div>
        </div>
      )
    },
    {
      key: '6',
      label: <span className="flex items-center gap-2"><GiftOutlined /> Marketing</span>,
      children: (
        <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
          <Title level={5} className="text-purple-700 m-0 mb-4">Cupom de Boas-Vindas</Title>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item name="welcomeCouponCode" label="CÃ³digo">
              <Input className="rounded-xl" prefix={<GiftOutlined />} />
            </Form.Item>
            <Form.Item name="welcomeCouponDiscount" label="Desconto (%)">
              <InputNumber min={0} max={100} className="w-full rounded-xl" />
            </Form.Item>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-[85vh] bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 m-0 tracking-tight">DefiniÃ§Ãµes da Loja</h1>
          <p className="text-gray-500 mt-2">Configure a identidade, logÃ­stica e pagamentos.</p>
        </div>
        <Space>
          {!editing && (
            <Button type="primary" size="large" icon={<EditOutlined />} shape="round" className="bg-black hover:bg-gray-800 border-none px-6" onClick={() => setEditing(true)}>
              Editar ConfiguraÃ§Ãµes
            </Button>
          )}
          {editing && (
            <>
              <Button size="large" shape="round" icon={<CloseOutlined />} onClick={() => setEditing(false)}>Cancelar</Button>
              <Button type="primary" size="large" shape="round" icon={<SaveOutlined />} className="bg-green-600 hover:bg-green-700 border-none" onClick={form.submit} loading={loading}>Salvar</Button>
            </>
          )}
        </Space>
      </div>

      {!editing ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          {/* Card Principal - Identidade */}
          <div className="md:col-span-3 bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><GlobalOutlined style={{ fontSize: 150 }} /></div>
            <div className="relative z-10">
              <Badge status="processing" text={<span className="text-green-400 font-bold">Loja Ativa</span>} className="mb-4" />
              <h2 className="text-4xl font-extrabold m-0 text-white mb-2">{settingsData?.siteName || "Sua Loja"}</h2>
              <p className="text-gray-300 text-lg max-w-2xl">{settingsData?.siteDescription || "Sem descriÃ§Ã£o definida."}</p>
              <div className="mt-8 flex gap-4">
                <span className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10 flex items-center gap-2"><GlobalOutlined /> {settingsData?.currency || "EUR"}</span>
                <span className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10 flex items-center gap-2"><PhoneOutlined /> {settingsData?.contactPhone || "Sem telefone"}</span>
              </div>
            </div>
          </div>

          {/* Coluna 1: Contato e EndereÃ§o */}
          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><InfoCircleOutlined className="text-blue-500" /> Contato Comercial</h3>
            <div className="text-gray-600 space-y-3">
              <p><strong>Email:</strong> {settingsData?.contactEmail || "-"}</p>
              <p><strong>Tel:</strong> {settingsData?.contactPhone || "-"}</p>
              <p><strong>Morada:</strong> {settingsData?.address || "-"}</p>
              <div className="pt-4 border-t border-gray-200 mt-4">
                <p className="text-xs font-bold uppercase text-gray-400">Suporte</p>
                <p>{settingsData?.supportHours || "-"}</p>
              </div>
            </div>
          </div>

          {/* Coluna 2: LogÃ­stica e Taxas */}
          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><CarOutlined className="text-orange-500" /> LogÃ­stica</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <span className="block text-3xl font-bold text-slate-800">{settingsData?.maxShippingDays || 0}</span>
                <span className="text-xs text-gray-500 font-bold uppercase">Dias Entrega</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <span className="block text-3xl font-bold text-slate-800">{settingsData?.returnPolicyDays || 0}</span>
                <span className="text-xs text-gray-500 font-bold uppercase">Dias DevoluÃ§Ã£o</span>
              </div>
            </div>

          </div>

          {/* Coluna 3: MÃ©todos de Pagamento */}
          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><DollarOutlined className="text-green-500" /> Pagamentos</h3>
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border ${settingsData?.paymentConfig?.mbWayNumber ? 'bg-orange-50 border-orange-200' : 'bg-gray-100 border-gray-200 opacity-50'}`}>
                <div className="font-bold text-orange-700 mb-1">MB WAY</div>
                <div className="text-sm">{settingsData?.paymentConfig?.mbWayNumber || "NÃ£o configurado"}</div>
              </div>
              <div className={`p-4 rounded-xl border ${settingsData?.paymentConfig?.orangeMoneyNumber ? 'bg-orange-50 border-orange-200' : 'bg-gray-100 border-gray-200 opacity-50'}`}>
                <div className="font-bold text-orange-700 mb-1">Orange Money</div>
                <div className="text-sm">{settingsData?.paymentConfig?.orangeMoneyNumber || "NÃ£o configurado"}</div>
              </div>
              <div className={`p-4 rounded-xl border ${settingsData?.paymentConfig?.bankTransferInfo ? 'bg-slate-50 border-slate-200' : 'bg-gray-100 border-gray-200 opacity-50'}`}>
                <div className="font-bold text-slate-700 mb-1">Transf. BancÃ¡ria</div>
                <div className="text-xs whitespace-pre-wrap">{settingsData?.paymentConfig?.bankTransferInfo || "NÃ£o configurado"}</div>
              </div>
              <div className={`p-4 rounded-xl border ${settingsData?.paymentConfig?.creditCardEnabled ? 'bg-blue-50 border-blue-200' : 'bg-gray-100 border-gray-200 opacity-50'}`}>
                <div className="font-bold text-blue-700 mb-1">CartÃ£o de CrÃ©dito</div>
                <div className="text-sm">{settingsData?.paymentConfig?.creditCardEnabled ? 'Ativado (SimulaÃ§Ã£o)' : 'Desativado'}</div>
              </div>
            </div>
          </div>

          {/* Outros cards (Marketing, etc) se necessario */}
          <div className="md:col-span-3 bg-purple-50 p-6 rounded-3xl border border-purple-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-full shadow-sm text-purple-600"><GiftOutlined style={{ fontSize: 24 }} /></div>
              <div>
                <p className="font-bold text-purple-900 m-0">Cupom de Boas-vindas</p>
                <p className="text-purple-600 m-0 text-sm">OfereÃ§a desconto para novos clientes</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-purple-800">{settingsData?.welcomeCouponCode || "N/A"}</span>
              <span className="ml-2 bg-purple-200 text-purple-800 px-2 py-1 rounded text-xs font-bold">-{settingsData?.welcomeCouponDiscount}%</span>
            </div>
          </div>

        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="animate-fade-in"
        >
          <Tabs defaultActiveKey="1" items={items} type="card" size="large" className="custom-tabs" />
        </Form>
      )}
    </div>
  );
};

export default Settings;
