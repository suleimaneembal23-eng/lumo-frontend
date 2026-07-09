�import React, { useContext } from "react";
import { Typography, Card, Collapse, Divider } from "antd";
import { HelpCircle } from "lucide-react";
import { SettingsContext } from "../context/SettingsContext";

const { Title, Text } = Typography;

const FAQ = () => {
    const { settings } = useContext(SettingsContext);

    const items = [
        {
            key: '1',
            label: 'Os produtos são de qualidade?',
            children: <p>A Lumo é um marketplace de excelência. Trabalhamos exclusivamente com fornecedores e vendedores verificados para garantir a máxima qualidade dos produtos.</p>,
        },
        {
            key: '2',
            label: 'Quais são os métodos de pagamento?',
            children: <p>Aceitamos pagamentos através de canais seguros em toda a Europa, incluindo Cartão de Crédito/Débito, MB WAY, e outras facilidades locais.</p>,
        },
        {
            key: '3',
            label: 'Quanto tempo demora a entrega?',
            children: <p>O prazo de entrega depende do vendedor do respetivo artigo e da sua localização. Poderá consultar os prazos estimados de cada loja parceira na secção correspondente na página de cada produto.</p>,
        },
        {
            key: '4',
            label: 'E se eu comprar produtos de vendedores diferentes?',
            children: <p>Se o seu pedido incluir produtos de diferentes lojas parceiras (vendedores), estes serão enviados separadamente. Cada vendedor preparará e enviará a sua encomenda de forma independente, podendo os custos de envio também ser separados no seu carrinho.</p>,
        },
        {
            key: '5',
            label: 'Posso personalizar a camisa?',
            children: <p>Muitos dos nossos vendedores permitem personalização (nome e número). Basta verificar as opções disponíveis no ato da compra se a referida loja tiver essa modalidade ativa.</p>,
        },
        {
            key: '6',
            label: 'Como acompanho as minhas encomendas?',
            children: <p>Ao aceder à sua área de cliente em "Meus Pedidos", encontrará o detalhe de cada um e poderá acompanhar os envios e rastreá-los pelas transportadoras dos vendedores correspondentes.</p>,
        },
        {
            key: '7',
            label: 'Como funcionam as devoluções neste marketplace?',
            children: <p>As políticas de troca e devolução são da responsabilidade de cada vendedor, garantindo todas elas, no entanto, os seus direitos legais de 14 dias. A Lumo gere o contacto e intercede a seu favor caso sinta que a loja falhou as políticas estipuladas!</p>,
        },
    ];

    return (
        <div style={{ padding: "40px 24px", maxWidth: 900, margin: "0 auto" }}>
            <Card
                bordered={false}
                style={{
                    borderRadius: 16,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                    <HelpCircle size={64} color={settings?.primaryColor || "#1890ff"} style={{ marginBottom: 16 }} />
                    <Title level={1} style={{ marginBottom: 8 }}>
                        Perguntas Frequentes
                    </Title>
                    <Text type="secondary" style={{ fontSize: 16 }}>
                        Tire as suas dúvidas de forma rápida.
                    </Text>
                </div>

                <Divider />

                <Collapse items={items} defaultActiveKey={['1']} ghost size="large" />

            </Card>
        </div>
    );
};

export default FAQ;
