import React, { useEffect, useState, useContext } from "react";
import {
  Row, Col, Card, Button, Typography, Form, Input, Select, message, Divider, Spin, Steps, Tooltip,
  Modal,
  Tag,
  Radio,
  Space
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  CreditCardOutlined,
  BankOutlined,
  LeftOutlined,
  CheckCircleOutlined,
  ShoppingOutlined,
  CarOutlined,
  EnvironmentOutlined,
  LockOutlined
} from "@ant-design/icons";
import { AuthContext } from "../context/Authcontext";
import { SettingsContext } from "../context/SettingsContext";
import { cartService } from "../services/cartService";
import { useCurrency } from "../hooks/useCurrency";
import { countries } from "../utils/countries";

const { Title, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { formatPrice } = useCurrency();
  const { settings } = useContext(SettingsContext);
  const primaryColor = settings?.primaryColor || "#1890ff";
  const currency = settings?.currency || "EUR";

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  // Costs
  const [shippingPrice, setShippingPrice] = useState(5);
  const [taxPrice, setTaxPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [itemsSubtotal, setItemsSubtotal] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("Portugal");

  // Load Cart
  useEffect(() => {
    const loadCart = async () => {
      if (!user) {
        message.info("Faça login para continuar.");
        navigate("/login");
        return;
      }
      try {
        setLoading(true);
        const data = await cartService.getCart();
        if (!data || !data.items || data.items.length === 0) {
          message.warning("Seu carrinho está vazio.");
          navigate("/cart");
          return;
        }
        setCart(data);
      } catch (err) {
        console.error(err);
        message.error("Erro ao carregar carrinho");
      } finally {
        setLoading(false);
      }
    };
    loadCart();
  }, [user, navigate]);

  // Load User Profile Address
  useEffect(() => {
    if (user) {
      fetch(`http://localhost:5000/api/clients/${user.id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.address) {
            form.setFieldsValue({
              line1: data.address.line1,
              city: data.address.city,
              country: data.address.country || "Portugal",
            });
            if (data.address.country) setSelectedCountry(data.address.country);
          }
        })
        .catch(err => console.error("Error fetching profile:", err));
    }
  }, [user, form]);

  // Recalculate Totals whenever dependencies change
  useEffect(() => {
    if (cart) {
      // 1. Calculate Shipping
      let ship = 15; // Fallback default

      if (settings?.shippingRates && settings.shippingRates.length > 0) {
        // Normalize user input
        const userCountry = selectedCountry.trim().toLowerCase();

        // Find exact match
        const match = settings.shippingRates.find(r => r.country.toLowerCase() === userCountry);

        if (match) {
          ship = match.cost;
        } else {
          // Try to find a generic "default" or "international" rate in the settings
          const defaultRate = settings.shippingRates.find(r =>
            r.country.toLowerCase() === "default" ||
            r.country.toLowerCase() === "padrão" ||
            r.country.toLowerCase() === "resto do mundo"
          );
          if (defaultRate) ship = defaultRate.cost;
        }
      } else {
        // Legacy fallback if no rates configured
        const countryValues = ["portugal", "pt", "lusa", "português"];
        if (countryValues.includes(selectedCountry.toLowerCase())) {
          ship = 5;
        }
      }

      setShippingPrice(ship);

      // 2. Calculate Subtotal
      const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      setItemsSubtotal(subtotal);

      // 3. Calculate Tax (Dynamic Rate) & Total
      const taxRate = settings?.taxRate || 0;
      const tax = +(subtotal * (taxRate / 100)).toFixed(2);
      setTaxPrice(tax);

      const total = +(subtotal + ship + tax).toFixed(2);
      setTotalPrice(total);
    }
  }, [cart, selectedCountry, settings]);

  const handleCountryChange = (value) => {
    setSelectedCountry(value);

    // Auto-select or Deselect Orange Money based on country
    const isGuinea = ["guiné-bissau", "guiné bissau", "guinea-bissau"].includes(value.toLowerCase());

    if (isGuinea) {
      form.setFieldsValue({ paymentMethod: "orange_money" });
    } else {
      const currentMethod = form.getFieldValue("paymentMethod");
      if (currentMethod === "orange_money") {
        form.setFieldsValue({ paymentMethod: "bank_transfer" });
      }
    }
  };

  const nextStep = async () => {
    try {
      await form.validateFields(); // Validate form before moving
      setCurrentStep(currentStep + 1);
    } catch (error) {
      message.error("Por favor, preencha todos os campos obrigatórios.");
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleFinish = async (values) => {
    if (!user || !cart) return;

    setSubmitting(true);
    const orderData = {
      items: cart.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.selectedSize,
      })),
      shippingAddress: {
        line1: values.line1,
        line2: values.line2,
        city: values.city,
        state: values.state,
        postalCode: values.postalCode,
        country: values.country
      },
      paymentMethod: values.paymentMethod || "bank_transfer",
      itemsPrice: itemsSubtotal,
      shippingPrice,
      taxPrice,
      totalPrice,
      status: "pending"
    };

    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        message.success("Pedido realizado com sucesso!");
        await cartService.clearCart();
        navigate("/client/dashboard/orders"); // Redirect to orders page
      } else {
        const err = await res.json();
        message.error(err.message || "Erro ao processar pedido");
      }
    } catch (err) {
      console.error(err);
      message.error("Erro de conexão ao enviar pedido");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: 50, textAlign: "center" }}><Spin size="large" /></div>;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
      <Button icon={<LeftOutlined />} onClick={() => navigate("/cart")} style={{ marginBottom: 20 }}>Voltar ao Carrinho</Button>

      <Title level={2} style={{ marginBottom: 40, textAlign: "center" }}>Finalizar Compra</Title>

      <Steps current={currentStep} style={{ marginBottom: 50, maxWidth: 800, margin: "0 auto 50px" }}>
        <Step title="Envio" icon={<EnvironmentOutlined />} />
        <Step title="Pagamento" icon={<CreditCardOutlined />} />
        <Step title="Confirmação" icon={<CheckCircleOutlined />} />
      </Steps>

      <Row gutter={40}>
        {/* LEFT COLUMN: FORM */}
        <Col xs={24} lg={14}>
          <Card bordered={false} style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)", borderRadius: 12 }}>
            <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ paymentMethod: "bank_transfer" }}>

              {/* STEP 0: SHIPPING ADDRESS */}
              <div style={{ display: currentStep === 0 ? "block" : "none" }}>
                <Title level={4}><EnvironmentOutlined /> Endereço de Entrega</Title>
                <Divider />

                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item name="country" label="País" rules={[{ required: true, message: "Insira o país" }]}>
                      <Select
                        showSearch
                        placeholder="Selecione o país"
                        optionFilterProp="children"
                        onChange={handleCountryChange}
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {countries.map((c) => (
                          <Option key={c} value={c}>{c}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="line1" label="Endereço Completo" rules={[{ required: true, message: "Insira a sua morada" }]}>
                      <Input placeholder="Rua, Número, Andar" size="large" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="city" label="Cidade" rules={[{ required: true, message: "Insira a cidade" }]}>
                      <Input placeholder="Cidade" size="large" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="postalCode" label="Código Postal" rules={[{ required: true, message: "Insira o código postal" }]}>
                      <Input placeholder="0000-000" size="large" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="line2" label="Complemento (Opcional)">
                      <Input placeholder="Apartamento, Ponto de referência" />
                    </Form.Item>
                  </Col>
                </Row>

                <Button type="primary" size="large" onClick={nextStep} block style={{ marginTop: 20, height: 50, fontSize: 16 }}>
                  Ir para Pagamento
                </Button>
              </div>

              {/* STEP 1: PAYMENT METHOD */}
              <div style={{ display: currentStep === 1 ? "block" : "none" }}>
                <Title level={4} style={{ display: 'flex', alignItems: 'center' }}>
                  <CreditCardOutlined style={{ marginRight: 10, color: primaryColor }} /> Pagamento
                </Title>
                <Divider />
                <Form.Item name="paymentMethod">
                  <Radio.Group style={{ width: "100%" }} onChange={(e) => {
                    // Force re-render to show details
                    form.setFieldsValue({ paymentMethod: e.target.value });
                  }}>
                    <Space direction="vertical" style={{ width: "100%" }}>

                      {/* 🍊 ORANGE MONEY (Exclusivo Guiné-Bissau) */}
                      {["guiné-bissau", "guiné bissau", "guinea-bissau"].includes(selectedCountry?.toLowerCase()) && (
                        <>
                          <Radio value="orange_money" style={{ padding: 10, border: "1px solid #f0f0f0", borderRadius: 8, width: "100%" }}>
                            <Space>
                              <Text strong>Orange Money</Text>
                              <Tag color="orange">Recomendado</Tag>
                            </Space>
                          </Radio>
                          {form.getFieldValue("paymentMethod") === "orange_money" && (
                            <div style={{ marginLeft: 30, padding: 12, background: "#fff7e6", borderRadius: 6, border: "1px solid #ffd591" }}>
                              <Text>Envie o valor total ({currency === 'BRL' ? 'R$' : '€'} {totalPrice}) para o número:</Text>
                              <br />
                              <Text strong style={{ fontSize: 16 }}>{settings?.paymentConfig?.orangeMoneyNumber || "Consulte o suporte"}</Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: 12 }}>Seu pedido será processado assim que confirmarmos a transferência.</Text>
                            </div>
                          )}
                        </>
                      )}

                      <Radio value="bank_transfer" style={{ padding: 10, border: "1px solid #f0f0f0", borderRadius: 8, width: "100%" }}>
                        <Text strong>Transferência Bancária</Text>
                      </Radio>
                      {form.getFieldValue("paymentMethod") === "bank_transfer" && (
                        <div style={{ marginLeft: 30, padding: 12, background: "#f0f5ff", borderRadius: 6, border: "1px solid #d6e4ff" }}>
                          <Text>Dados para transferência:</Text>
                          <br />
                          <Text style={{ whiteSpace: "pre-wrap" }}>{settings?.paymentConfig?.bankTransferInfo || "Consulte o suporte"}</Text>
                        </div>
                      )}

                      {settings?.paymentConfig?.creditCardEnabled !== false && (
                        <>
                          <Radio value="card" style={{ padding: 10, border: "1px solid #f0f0f0", borderRadius: 8, width: "100%" }}>
                            <Text strong>Cartão de Crédito / Débito</Text>
                          </Radio>
                          {form.getFieldValue("paymentMethod") === "card" && (
                            <div style={{ marginLeft: 30, marginTop: 10, padding: 20, background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0" }}>
                              <Row gutter={16}>
                                <Col span={24}>
                                  <Form.Item name="card_number" label="Número do Cartão" rules={[{ required: true, message: "Insira o número" }]}>
                                    <Input prefix={<CreditCardOutlined style={{ color: '#bfbfbf' }} />} placeholder="0000 0000 0000 0000" size="large" maxLength={19} />
                                  </Form.Item>
                                </Col>
                                <Col span={24}>
                                  <Form.Item name="card_name" label="Nome Impresso no Cartão" rules={[{ required: true, message: "Insira o nome" }]}>
                                    <Input placeholder="COMO NO CARTÃO" size="large" />
                                  </Form.Item>
                                </Col>
                                <Col span={12}>
                                  <Form.Item name="card_expiry" label="Validade" rules={[{ required: true, message: "MM/AA" }]}>
                                    <Input placeholder="MM/AA" size="large" maxLength={5} />
                                  </Form.Item>
                                </Col>
                                <Col span={12}>
                                  <Form.Item name="card_cvc" label="CVC" rules={[{ required: true, message: "CVC" }]}>
                                    <Input placeholder="123" size="large" maxLength={3} />
                                  </Form.Item>
                                </Col>
                              </Row>
                              <div style={{ marginTop: 10, textAlign: 'center' }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  <LockOutlined /> Pagamento seguro criptografado.
                                </Text>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </Space>
                  </Radio.Group>
                </Form.Item>

                <div style={{ display: "flex", gap: 10, marginTop: 30 }}>
                  <Button size="large" onClick={prevStep} style={{ width: "50%" }}>Voltar</Button>
                  <Button type="primary" size="large" onClick={nextStep} style={{ width: "50%" }}>Revisar Pedido</Button>
                </div>
              </div>

              {/* STEP 2: REVIEW */}
              <div style={{ display: currentStep === 2 ? "block" : "none" }}>
                <Title level={4}><CheckCircleOutlined /> Revisão Final</Title>
                <Divider />
                <Text type="secondary">Verifique os seus dados antes de confirmar.</Text>

                <div style={{ marginTop: 20, background: "#f9f9f9", padding: 20, borderRadius: 8 }}>
                  <Text strong>Entrega em:</Text>
                  <p style={{ marginTop: 5 }}>
                    {form.getFieldValue("line1")}, {form.getFieldValue("city")}, {form.getFieldValue("country")}
                  </p>
                  <Text strong>Método de Pagamento:</Text>
                  <p style={{ marginTop: 5 }}>
                    {form.getFieldValue("paymentMethod") === "credit_card" ? "Cartão de Crédito" : "Transferência Bancária"}
                  </p>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 30 }}>
                  <Button size="large" onClick={prevStep} style={{ width: "50%" }}>Voltar</Button>
                  <Button type="primary" size="large" htmlType="submit" loading={submitting} style={{ width: "50%", background: "#52c41a", borderColor: "#52c41a" }}>
                    Confirmar Compra
                  </Button>
                </div>
              </div>

            </Form>
          </Card>
        </Col>

        {/* RIGHT COLUMN: ORDER SUMMARY (Sticky) */}
        <Col xs={24} lg={10}>
          <Card title="Resumo do Pedido" bordered={false} style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)", borderRadius: 12, position: "sticky", top: 20 }}>
            <div style={{ maxHeight: 300, overflowY: "auto", paddingRight: 5 }}>
              {cart?.items?.map(item => (
                <div key={item._id} style={{ display: "flex", marginBottom: 15, alignItems: "center" }}>
                  <div style={{ width: 60, height: 60, background: "#f0f0f0", borderRadius: 8, overflow: "hidden", marginRight: 15 }}>
                    <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ display: "block" }}>{item.name}</Text>
                    <Text type="secondary" style={{ fontSize: 13 }}>Tam: {item.selectedSize} | Qtd: {item.quantity}</Text>
                  </div>
                  <Text strong>{formatPrice(item.price * item.quantity)}</Text>
                </div>
              ))}
            </div>
            <Divider />
            <Row justify="space-between" style={{ marginBottom: 10 }}>
              <Col><Text type="secondary">Subtotal</Text></Col>
              <Col><Text>{formatPrice(itemsSubtotal)}</Text></Col>
            </Row>
            <Row justify="space-between" style={{ marginBottom: 10 }}>
              <Col>
                <Text type="secondary">Frete ({selectedCountry})</Text> {selectedCountry.toLowerCase() === "portugal" && <CarOutlined style={{ color: "#52c41a" }} />}
              </Col>
              <Col><Text>{formatPrice(shippingPrice)}</Text></Col>
            </Row>
            <Row justify="space-between" style={{ marginBottom: 10 }}>
              <Col><Text type="secondary">Impostos ({settings?.taxRate || 0}%)</Text></Col>
              <Col><Text>{formatPrice(taxPrice)}</Text></Col>
            </Row>
            <Divider />
            <Row justify="space-between" align="middle">
              <Col><Title level={3} style={{ margin: 0 }}>Total</Title></Col>
              <Col><Title level={3} style={{ margin: 0, color: "#1890ff" }}>{formatPrice(totalPrice)}</Title></Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Checkout;