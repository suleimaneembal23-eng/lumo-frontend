import React, { useContext } from "react";
import { Typography, Card, Divider, Steps, Alert } from "antd";
import { RefreshCw, CheckCircle, XCircle, Store, Scale } from "lucide-react";
import { SettingsContext } from "../context/SettingsContext";

const { Title, Paragraph, Text } = Typography;

const ReturnsPolicy = () => {
    const { settings } = useContext(SettingsContext);
    const contactEmail = settings?.contactEmail || "lumobissau@gmail.com";

    return (
        <div style={{ padding: "40px 24px", maxWidth: 1200, margin: "0 auto" }}>
            <Card
                bordered={false}
                style={{
                    borderRadius: 16,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: 30 }}>
                    <RefreshCw size={64} color={settings?.primaryColor || "#1890ff"} style={{ marginBottom: 16 }} />
                    <Title level={1} style={{ marginBottom: 8 }}>
                        Trocas e DevoluÃ§Ãµes no Marketplace
                    </Title>
                    <Text type="secondary" style={{ fontSize: 16 }}>
                        Os seus direitos protegidos num ecossistema global de lojas!
                    </Text>
                </div>

                <Alert 
                    message="A Lumo garante a sua seguranÃ§a"
                    description="Trabalhamos com vendedores independentes que elaboram as polÃ­ticas de devoluÃ§Ã£o adequadas (desde que cumpram as diretivas locais). Se uma loja parceira falhar os deveres bÃ¡sicos de consumidor, nÃ³s intercedemos a seu favor."
                    type="info"
                    showIcon
                    style={{ marginBottom: 32 }}
                />

                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    <div className="text-center p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center">
                        <Scale className="mb-4 text-gray-800" size={40} />
                        <h3 className="font-bold text-gray-700 m-0">Direito Legal de 14 Dias</h3>
                        <p className="text-sm text-gray-500 mt-2">MÃ­nimo exigido a vendedores profissionais</p>
                    </div>
                    <div className="text-center p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center">
                        <Store className="mb-4 text-green-500" size={40} />
                        <h3 className="font-bold text-gray-700 m-0">VariaÃ§Ã£o de PolÃ­ticas</h3>
                        <p className="text-sm text-gray-500 mt-2">Leia sempre as regras especÃ­ficas na pÃ¡gina de cada loja antes da compra</p>
                    </div>
                    <div className="text-center p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center">
                        <CheckCircle className="mb-4 text-blue-500" size={40} />
                        <h3 className="font-bold text-gray-700 m-0">MediaÃ§Ã£o de Conflitos</h3>
                        <p className="text-sm text-gray-500 mt-2">Resolvemos impasses para proteger a sua experiÃªncia connosco</p>
                    </div>
                </div>

                <Title level={3} className="mt-8">Como solicitar uma devoluÃ§Ã£o?</Title>
                <div className="my-8">
                    <Steps
                        current={-1}
                        items={[
                            {
                                title: 'Contacto PrÃ©vio',
                                description: `Inicie o processo na sua aba de pedidos ou atravÃ©s do nosso apoio via ${contactEmail}.`,
                            },
                            {
                                title: 'InstruÃ§Ãµes',
                                description: 'O vendedor emite as instruÃ§Ãµes e informa a morada para o retorno do produto especÃ­fico.',
                            },
                            {
                                title: 'Envio FÃ­sico',
                                description: 'Utilize a transportadora e guarde sempre o seguimento (rastreio).',
                            },
                            {
                                title: 'Reembolso do Valor',
                                description: 'ApÃ³s a inspeÃ§Ã£o presencial do vendedor ao artigo devolvido, emitimos o reembolso!',
                            },
                        ]}
                    />
                </div>

                <Divider />

                <div className="grid md:grid-cols-2 gap-12">
                    <div>
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <CheckCircle size={20} className="text-green-500" /> CondiÃ§Ãµes Gerais Aceites
                        </h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                            <li>Produtos comprovadamente danificados de fÃ¡brica.</li>
                            <li>Tamanho diferente daquele selecionado na ordem de compra (Erro da loja).</li>
                            <li>Arrependimento dentro dos prazos da janela legal local.</li>
                            <li>Roupas intocadas e com as etiquetas postas devidamente no original.</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <XCircle size={20} className="text-red-500" /> Normalmente Recusadas
                        </h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                            <li>Artigos encomendados como Personalizados (Nome ou NÃºmeros nas costas).</li>
                            <li>Roupa lavada, com marcas de sujidade ou usada em atividade.</li>
                            <li>Tentativas de reenvio apÃ³s extinto o prazo das polÃ­ticas estipuladas.</li>
                            <li>Danos causados no interior da embalagem por facas durante a abertura do unboxing.</li>
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ReturnsPolicy;
