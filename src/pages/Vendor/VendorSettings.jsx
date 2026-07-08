import React, { useState, useContext, useEffect } from 'react';
import { Form, Input, Button, Card, InputNumber, Switch, message, Upload, Alert } from 'antd';
import { UploadOutlined, ShopOutlined, TruckOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { AuthContext } from '../../context/Authcontext';

const VendorSettings = () => {
    const { user, setUser } = useContext(AuthContext);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [logoUrl, setLogoUrl] = useState('');
    const [bannerUrl, setBannerUrl] = useState('');
    const [allowsDelivery, setAllowsDelivery] = useState(true);
    const [allowsPickup, setAllowsPickup] = useState(false);

    useEffect(() => {
        if (user && user.vendorInfo) {
            form.setFieldsValue({
                storeName:             user.vendorInfo.storeName || '',
                description:           user.vendorInfo.description || '',
                shippingFlatRate:      user.vendorInfo.shippingSettings?.flatRate || 0,
                freeShippingThreshold: user.vendorInfo.shippingSettings?.freeShippingThreshold || 0,
                deliveryTime:          user.vendorInfo.shippingSettings?.deliveryTime || '5 a 10 dias Ãºteis',
                returnPolicy:          user.vendorInfo.shippingSettings?.returnPolicy || '14 dias para devoluÃ§Ã£o',
                phone:                 user.phone || '',
                pickupLine1:           user.vendorInfo.pickupAddress?.line1 || '',
                pickupCity:            user.vendorInfo.pickupAddress?.city || '',
                pickupPostalCode:      user.vendorInfo.pickupAddress?.postalCode || '',
                pickupCountry:         user.vendorInfo.pickupAddress?.country || 'GuinÃ©-Bissau',
            });
            setLogoUrl(user.vendorInfo.logo || '');
            setBannerUrl(user.vendorInfo.banner || '');
            setAllowsDelivery(user.vendorInfo.allowsDelivery !== false);
            setAllowsPickup(!!user.vendorInfo.allowsPickup);
        }
    }, [user, form]);

    const handleUpload = async (file, type) => {
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (res.ok) {
                if (type === 'logo') setLogoUrl(data.imageUrl);
                else setBannerUrl(data.imageUrl);
                message.success('Imagem atualizada! Clique em Salvar para persistir.');
            }
        } catch {
            message.error('Erro no upload.');
        }
        return false;
    };

    const handleSave = async (values) => {
        if (!allowsDelivery && !allowsPickup) {
            message.error('A loja deve ter pelo menos um mÃ©todo de entrega ativo!');
            return;
        }
        setLoading(true);
        try {
            const payload = {
                vendorInfo: {
                    storeName:      values.storeName,
                    description:    values.description,
                    logo:           logoUrl,
                    banner:         bannerUrl,
                    slug:           user.vendorInfo.slug,
                    allowsDelivery,
                    allowsPickup,
                    shippingSettings: {
                        flatRate:              values.shippingFlatRate,
                        freeShippingThreshold: values.freeShippingThreshold,
                        deliveryTime:          values.deliveryTime,
                        returnPolicy:          values.returnPolicy,
                    },
                    pickupAddress: {
                        line1:      values.pickupLine1,
                        city:       values.pickupCity,
                        postalCode: values.pickupPostalCode,
                        country:    values.pickupCountry,
                    },
                },
                phone: values.phone,
            };

            const res = await fetch('/api/vendors/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const updatedUser = await res.json();
                setUser({ ...user, ...updatedUser, token: user.token });
                message.success('ConfiguraÃ§Ãµes da loja atualizadas!');
            } else {
                message.error('Erro ao salvar configuraÃ§Ãµes.');
            }
        } catch {
            message.error('Erro de conexÃ£o.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">ConfiguraÃ§Ãµes da Loja</h1>

            <Form layout="vertical" form={form} onFinish={handleSave}>

                {/* Perfil PÃºblico */}
                <Card title={<><ShopOutlined /> Perfil PÃºblico</>} bordered={false} className="shadow-sm rounded-xl mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <Form.Item label="Nome da Loja" name="storeName" rules={[{ required: true }]}>
                                <Input prefix={<ShopOutlined />} />
                            </Form.Item>
                            <Form.Item label="DescriÃ§Ã£o da Loja" name="description">
                                <Input.TextArea rows={4} placeholder="Conte um pouco sobre sua loja..." />
                            </Form.Item>
                            <Form.Item label="Telefone de Contato" name="phone">
                                <Input placeholder="+XXX XXXXXXXX" />
                            </Form.Item>
                        </div>
                        <div className="flex flex-col gap-6">
                            <Form.Item label="Logotipo">
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-full bg-gray-100 border flex items-center justify-center overflow-hidden">
                                        {logoUrl
                                            ? <img src={logoUrl} className="w-full h-full object-cover" alt="logo" />
                                            : <ShopOutlined className="text-2xl text-gray-400" />
                                        }
                                    </div>
                                    <Upload showUploadList={false} beforeUpload={(f) => handleUpload(f, 'logo')}>
                                        <Button icon={<UploadOutlined />}>Alterar Logo</Button>
                                    </Upload>
                                </div>
                            </Form.Item>
                            <Form.Item label="Banner da Loja">
                                <div className="w-full h-32 bg-gray-100 rounded-lg border overflow-hidden relative mb-2">
                                    {bannerUrl && <img src={bannerUrl} className="w-full h-full object-cover" alt="banner" />}
                                </div>
                                <Upload showUploadList={false} beforeUpload={(f) => handleUpload(f, 'banner')}>
                                    <Button icon={<UploadOutlined />}>Alterar Banner</Button>
                                </Upload>
                            </Form.Item>
                        </div>
                    </div>
                </Card>

                {/* â”€â”€â”€â”€ MÃ‰TODOS DE ENTREGA â”€â”€â”€â”€ */}
                <Card
                    title={<><TruckOutlined /> MÃ©todos de Entrega DisponÃ­veis</>}
                    bordered={false}
                    className="shadow-sm rounded-xl mb-6 border-l-4 border-indigo-500"
                >
                    <p className="text-gray-500 mb-6">
                        Ative os mÃ©todos que a sua loja suporta. No checkout, o cliente sÃ³ verÃ¡ as opÃ§Ãµes ativas.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Envio para casa */}
                        <div className={`p-5 rounded-xl border-2 transition-all ${allowsDelivery ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <TruckOutlined className={`text-xl ${allowsDelivery ? 'text-blue-500' : 'text-gray-400'}`} />
                                    <span className="font-bold text-gray-800">ðŸšš Envio para Casa</span>
                                </div>
                                <Switch
                                    checked={allowsDelivery}
                                    onChange={setAllowsDelivery}
                                    checkedChildren="Ativo"
                                    unCheckedChildren="Inativo"
                                />
                            </div>
                            <p className="text-sm text-gray-500 m-0">O cliente recebe os produtos em casa. Configure o custo na secÃ§Ã£o abaixo.</p>
                        </div>

                        {/* Levantamento fÃ­sico */}
                        <div className={`p-5 rounded-xl border-2 transition-all ${allowsPickup ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <EnvironmentOutlined className={`text-xl ${allowsPickup ? 'text-green-500' : 'text-gray-400'}`} />
                                    <span className="font-bold text-gray-800">ðŸª Levantamento na Loja</span>
                                </div>
                                <Switch
                                    checked={allowsPickup}
                                    onChange={setAllowsPickup}
                                    checkedChildren="Ativo"
                                    unCheckedChildren="Inativo"
                                />
                            </div>
                            <p className="text-sm text-gray-500 m-0">O cliente desloca-se Ã  sua loja fÃ­sica para levantar a encomenda (gratuito).</p>
                        </div>
                    </div>

                    {!allowsDelivery && !allowsPickup && (
                        <Alert type="error" message="âš ï¸ Deve ter pelo menos um mÃ©todo de entrega ativo!" showIcon className="mb-2" />
                    )}
                    {allowsPickup && !allowsDelivery && (
                        <Alert type="info" message="â„¹ï¸ Apenas levantamento â€” preencha a morada da loja fÃ­sica abaixo." showIcon />
                    )}
                    {allowsDelivery && allowsPickup && (
                        <Alert type="success" message="âœ… Ambos os mÃ©todos estÃ£o ativos â€” o cliente escolhe no checkout." showIcon />
                    )}
                </Card>

                {/* Custo de envio â€” sÃ³ aparece se tiver envio ativo */}
                {allowsDelivery && (
                    <Card title={<><TruckOutlined /> ConfiguraÃ§Ãµes de Envio</>} bordered={false} className="shadow-sm rounded-xl mb-6 border-l-4 border-blue-500">
                        <p className="text-gray-500 mb-4">Se deixar 0, o envio serÃ¡ GRÃTIS para o cliente.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Form.Item label="Taxa de Entrega Fixa (FCFA)" name="shippingFlatRate" help="Valor cobrado por pedido contendo os seus produtos.">
                                <InputNumber min={0} step={500} style={{ width: '100%' }} addonAfter="FCFA"
                                    formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                    parser={v => v.replace(/\./g, '')} />
                            </Form.Item>
                            <Form.Item label="Envio GrÃ¡tis acima de (FCFA)" name="freeShippingThreshold" help="0 = nÃ£o aplicar limite de envio grÃ¡tis.">
                                <InputNumber min={0} step={500} style={{ width: '100%' }} addonAfter="FCFA"
                                    formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                    parser={v => v.replace(/\./g, '')} />
                            </Form.Item>
                            <Form.Item label="Prazo de Entrega" name="deliveryTime" help="Texto exibido na pÃ¡gina do produto">
                                <Input placeholder="Ex: 2 a 5 dias Ãºteis" />
                            </Form.Item>
                            <Form.Item label="PolÃ­tica de DevoluÃ§Ãµes" name="returnPolicy">
                                <Input placeholder="Ex: AtÃ© 14 dias apÃ³s receÃ§Ã£o" />
                            </Form.Item>
                        </div>
                    </Card>
                )}

                {/* Morada fÃ­sica â€” sÃ³ aparece se tiver pickup ativo */}
                {allowsPickup && (
                    <Card title={<><EnvironmentOutlined /> Morada da Loja FÃ­sica</>} bordered={false} className="shadow-sm rounded-xl mb-6 border-l-4 border-green-500">
                        <p className="text-gray-500 mb-4">EndereÃ§o onde os clientes podem levantar as encomendas.</p>
                        <Form.Item
                            label="Morada Exata (Rua e NÃºmero)"
                            name="pickupLine1"
                            rules={[{ required: allowsPickup, message: 'Preencha a morada fÃ­sica da loja' }]}
                        >
                            <Input placeholder="Ex: Rua Direita, NÂº 14" size="large" />
                        </Form.Item>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Form.Item label="Cidade" name="pickupCity">
                                <Input size="large" />
                            </Form.Item>
                            <Form.Item label="CÃ³digo Postal" name="pickupPostalCode">
                                <Input size="large" />
                            </Form.Item>
                            <Form.Item label="PaÃ­s" name="pickupCountry">
                                <Input size="large" />
                            </Form.Item>
                        </div>
                    </Card>
                )}

                <div className="flex justify-end">
                    <Button type="primary" htmlType="submit" size="large" loading={loading} className="bg-blue-600 px-8">
                        Salvar AlteraÃ§Ãµes
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default VendorSettings;
