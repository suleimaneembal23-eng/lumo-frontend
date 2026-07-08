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
  Select
} from "antd";
import {
  SaveOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
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
      const res = await fetch("http://localhost:5000/api/settings");
      if (!res.ok) throw new Error("Erro ao carregar definições.");
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
      });

    } catch (err) {
      console.error(err);
      message.error("Erro ao carregar definições do site.");
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
      const res = await fetch("http://localhost:5000/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao salvar as definições.");
      }

      const updatedData = await res.json();
      setSettingsData(updatedData);
      form.setFieldsValue(updatedData);
      refreshSettings();
      message.success("Definições atualizadas com sucesso!");
      setEditing(false);
    } catch (err) {
      console.error(err);
      message.error(err.message || "Erro ao atualizar definições.");
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
      const res = await fetch("http://localhost:5000/api/settings", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erro ao eliminar definições.");
      setSettingsData(null);
      form.resetFields();
      setEditing(true);
      refreshSettings();
      message.success("Definições eliminadas com sucesso!");
    } catch (err) {
      console.error(err);
      message.error(err.message || "Erro ao eliminar definições.");
    }
  };

  if (initialLoading) {
    return (
      <div style={{ textAlign: "center", marginTop: "20%" }}>
        <Spin size="large" tip="Carregando definições..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px" }}>
      <Card
        bordered
        style={{
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          padding: 24,
        }}
      >
        <Title level={3}>⚙️ Definições do Site</Title>
        <Divider />

        {!editing ? (
          <div>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Text strong>Nome do Site:</Text>
              <Text>{settingsData?.siteName || "-"}</Text>

              <Text strong>Descrição:</Text>
              <Text>{settingsData?.siteDescription || "-"}</Text>

              <Text strong>Sobre Nós:</Text>
              <Text>{settingsData?.aboutUs || "-"}</Text>

              <Text strong>Morada:</Text>
              <Text>{settingsData?.address || "-"}</Text>

              <Text strong>Email de Contacto:</Text>
              <Text>{settingsData?.contactEmail || "-"}</Text>

              <Text strong>Telefone de Contacto:</Text>
              <Text>{settingsData?.contactPhone || "-"}</Text>

              <Text strong>Contactos Detalhados:</Text>
              <Text>{settingsData?.contactInfo || "-"}</Text>

              <Text strong>URL do Logo:</Text>
              <Text>{settingsData?.logoUrl || "-"}</Text>

              <Text strong>URL do Banner:</Text>
              <Text>{settingsData?.bannerUrl || "-"}</Text>

              <Text strong>Cor Primária:</Text>
              <Text>{settingsData?.primaryColor || "-"}</Text>

              <Text strong>Cor Secundária:</Text>
              <Text>{settingsData?.secondaryColor || "-"}</Text>

              <Text strong>Cor de Fundo:</Text>
              <Text>{settingsData?.backgroundColor || "-"}</Text>

              <Text strong>Prazo Máximo de Entrega:</Text>
              <Text>{settingsData?.maxShippingDays || "-"} dias</Text>

              <Text strong>Prazo Máximo de Devolução:</Text>
              <Text>{settingsData?.returnPolicyDays || "-"} dias</Text>

              <Text strong>Informações de Envio:</Text>
              <Text>{settingsData?.shippingInfo || "-"}</Text>

              <Divider style={{ margin: "12px 0" }} />
              <Text strong>Taxas de Envio Configuradas:</Text>
              {settingsData?.shippingRates && settingsData.shippingRates.length > 0 ? (
                <ul style={{ paddingLeft: 20, margin: 0 }}>
                  {settingsData.shippingRates.map((rate, index) => (
                    <li key={index}>{rate.country}: {rate.cost} EUR</li>
                  ))}
                </ul>
              ) : <Text>Nenhuma taxa configurada (Padrão: Grátis ou Fixo)</Text>}
              <Divider style={{ margin: "12px 0" }} />

              <Text strong>Informações de Devolução:</Text>
              <Text>{settingsData?.returnInfo || "-"}</Text>

              <Text strong>Moeda Padrão:</Text>
              <Text>{settingsData?.currency || "-"}</Text>

              <Text strong>Taxa de Conversão (1 EUR → FCFA):</Text>
              <Text>{settingsData?.exchangeRateFCFA || 655.957}</Text>


              <Text strong>Taxa:</Text>
              <Text>{settingsData?.taxRate ?? 0} %</Text>

              <Text strong>Horário de Suporte:</Text>
              <Text>{settingsData?.supportHours || "-"}</Text>

              <Text strong>Nota de Rodapé:</Text>
              <Text>{settingsData?.footerNote || "-"}</Text>

              <Divider />
              <Title level={4}>🎁 Cupom de Boas-Vindas</Title>
              <Text strong>Código:</Text>
              <Text>{settingsData?.welcomeCouponCode || "BEMVINDO10"}</Text>
              <Text strong>Desconto:</Text>
              <Text>{settingsData?.welcomeCouponDiscount || 10}%</Text>

              <Space style={{ marginTop: 24 }}>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => setEditing(true)}
                >
                  Editar
                </Button>
                <Button type="danger" icon={<DeleteOutlined />} onClick={handleDelete}>
                  Eliminar
                </Button>
              </Space>
            </Space>
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            style={{ marginTop: 16 }}
          >
            <Form.Item
              name="siteName"
              label="Nome do Site"
              rules={[{ required: true }]}
            >
              <Input placeholder="Ex: CamisaShop" />
            </Form.Item>

            <Form.Item
              name="siteDescription"
              label="Descrição do Site"
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={3} placeholder="Breve descrição sobre a loja..." />
            </Form.Item>

            <Form.Item name="aboutUs" label="Sobre Nós">
              <Input.TextArea rows={5} placeholder="Conteúdo da secção Sobre Nós..." />
            </Form.Item>

            <Form.Item name="address" label="Morada" rules={[{ required: true }]}>
              <Input placeholder="Rua, número, cidade, país" />
            </Form.Item>

            <Form.Item
              name="contactEmail"
              label="Email de Contacto"
              rules={[{ required: true, type: "email" }]}
            >
              <Input placeholder="exemplo@camisashop.com" />
            </Form.Item>

            <Form.Item name="contactPhone" label="Telefone de Contacto" rules={[{ required: true }]}>
              <Input placeholder="+351 999 999 999" />
            </Form.Item>

            <Form.Item name="contactInfo" label="Contactos Detalhados">
              <Input.TextArea rows={3} placeholder="Ex: WhatsApp, horário de atendimento..." />
            </Form.Item>

            <Form.Item name="logoUrl" label="URL do Logo">
              <Input placeholder="https://..." />
            </Form.Item>

            <Form.Item name="bannerUrl" label="URL do Banner">
              <Input placeholder="https://..." />
            </Form.Item>

            <Form.Item name="primaryColor" label="Cor Primária">
              <Input type="color" style={{ width: 60, padding: 0 }} />
            </Form.Item>

            <Form.Item name="secondaryColor" label="Cor Secundária">
              <Input type="color" style={{ width: 60, padding: 0 }} />
            </Form.Item>

            <Form.Item name="backgroundColor" label="Cor de Fundo">
              <Input type="color" style={{ width: 60, padding: 0 }} />
            </Form.Item>

            <Form.Item
              name="maxShippingDays"
              label="Prazo Máximo de Entrega (dias)"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} max={30} style={{ width: "100%" }} />
            </Form.Item>

            <Divider />
            <Title level={4}>🚚 Taxas de Envio por País</Title>
            <Form.List name="shippingRates">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name, 'country']}
                        rules={[{ required: true, message: 'País obrigatório' }]}
                      >
                        <Select
                          showSearch
                          placeholder="País"
                          style={{ width: 180 }}
                          filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          <Option value="default">Padrão (Resto do Mundo)</Option>
                          {countries.map((c) => (
                            <Option key={c} value={c}>{c}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'cost']}
                        rules={[{ required: true, message: 'Custo obrigatório' }]}
                      >
                        <InputNumber placeholder="Custo (€)" min={0} />
                      </Form.Item>
                      <Button type="danger" onClick={() => remove(name)} icon={<DeleteOutlined />} shape="circle" />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<EditOutlined />}>
                      Adicionar Taxa de Envio
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
            <Divider />

            <Title level={4}>💳 Métodos de Pagamento</Title>
            <Form.Item label="Número Orange Money" name={['paymentConfig', 'orangeMoneyNumber']}>
              <Input placeholder="Ex: 999999999" />
            </Form.Item>
            <Form.Item label="Dados Bancários (IBAN/Conta)" name={['paymentConfig', 'bankTransferInfo']}>
              <Input.TextArea rows={3} placeholder="Ex: IBAN: PT50... / Banco X" />
            </Form.Item>
            <Form.Item name={['paymentConfig', 'creditCardEnabled']} valuePropName="checked">
              <label>
                <input type="checkbox" style={{ marginRight: 8 }} />
                Habilitar Pagamento com Cartão (Simulação)
              </label>
            </Form.Item>
            <Divider />

            <Form.Item
              name="returnPolicyDays"
              label="Prazo Máximo de Devolução (dias)"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} max={60} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="shippingInfo" label="Informações de Envio">
              <Input.TextArea rows={3} placeholder="Detalhes sobre envio..." />
            </Form.Item>

            <Form.Item name="returnInfo" label="Informações de Devolução">
              <Input.TextArea rows={3} placeholder="Detalhes sobre devolução..." />
            </Form.Item>

            <Form.Item name="currency" label="Moeda Padrão" rules={[{ required: true }]}>
              <Input placeholder="Ex: EUR" />
            </Form.Item>

            <Form.Item
              name="exchangeRateFCFA"
              label="Taxa de Conversão EUR → FCFA"
              rules={[{ required: true }]}
            >
              <InputNumber
                min={1}
                step={0.001}
                style={{ width: "100%" }}
                placeholder="655.957"
              />
            </Form.Item>


            <Form.Item name="taxRate" label="Taxa (%)">
              <InputNumber min={0} max={100} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="supportHours" label="Horário de Suporte">
              <Input placeholder="Ex: Seg-Sex 9h-18h" />
            </Form.Item>

            <Form.Item name="footerNote" label="Nota de Rodapé">
              <Input placeholder="© 2025 CamisaShop - Todos os direitos reservados" />
            </Form.Item>

            <Divider />
            <Title level={4}>🎁 Configuração do Cupom de Boas-Vindas</Title>
            <Form.Item name="welcomeCouponCode" label="Código do Cupom">
              <Input placeholder="Ex: BEMVINDO10" />
            </Form.Item>
            <Form.Item name="welcomeCouponDiscount" label="Desconto (%)">
              <InputNumber min={0} max={100} style={{ width: "100%" }} />
            </Form.Item>

            <Space style={{ display: "flex", justifyContent: "space-between" }}>
              <Button
                type="default"
                icon={<CloseOutlined />}
                onClick={() => setEditing(false)}
              >
                Cancelar
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
              >
                Guardar Definições
              </Button>
            </Space>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default Settings;
