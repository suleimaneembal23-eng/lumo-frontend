import React, { useContext } from "react";
import { Typography, Card, Collapse, Divider } from "antd";
import { HelpCircle } from "lucide-react";
import { SettingsContext } from "../context/SettingsContext";

const { Title, Text } = Typography;

const FAQ = () => {
    const { settings } = useContext(SettingsContext);

    const items = [
        {
            key: '1',
            label: 'Os produtos sÃ£o de qualidade?',
            children: <p>A Lumo Ã© um marketplace de excelÃªncia. Trabalhamos exclusivamente com fornecedores e vendedores verificados para garantir a mÃ¡xima qualidade dos produtos.</p>,
        },
        {
            key: '2',
            label: 'Quais sÃ£o os mÃ©todos de pagamento?',
            children: <p>Aceitamos pagamentos atravÃ©s de canais seguros em toda a Europa, incluindo CartÃ£o de CrÃ©dito/DÃ©bito, MB WAY, e outras facilidades locais.</p>,
        },
        {
            key: '3',
            label: 'Quanto tempo demora a entrega?',
            children: <p>O prazo de entrega depende do vendedor do respetivo artigo e da sua localizaÃ§Ã£o. PoderÃ¡ consultar os prazos estimados de cada loja parceira na secÃ§Ã£o correspondente na pÃ¡gina de cada produto.</p>,
        },
        {
            key: '4',
            label: 'E se eu comprar produtos de vendedores diferentes?',
            children: <p>Se o seu pedido incluir produtos de diferentes lojas parceiras (vendedores), estes serÃ£o enviados separadamente. Cada vendedor prepararÃ¡ e enviarÃ¡ a sua encomenda de forma independente, podendo os custos de envio tambÃ©m ser separados no seu carrinho.</p>,
        },
        {
            key: '5',
            label: 'Posso personalizar a camisa?',
            children: <p>Muitos dos nossos vendedores permitem personalizaÃ§Ã£o (nome e nÃºmero). Basta verificar as opÃ§Ãµes disponÃ­veis no ato da compra se a referida loja tiver essa modalidade ativa.</p>,
        },
        {
            key: '6',
            label: 'Como acompanho as minhas encomendas?',
            children: <p>Ao aceder Ã  sua Ã¡rea de cliente em "Meus Pedidos", encontrarÃ¡ o detalhe de cada um e poderÃ¡ acompanhar os envios e rastreÃ¡-los pelas transportadoras dos vendedores correspondentes.</p>,
        },
        {
            key: '7',
            label: 'Como funcionam as devoluÃ§Ãµes neste marketplace?',
            children: <p>As polÃ­ticas de troca e devoluÃ§Ã£o sÃ£o da responsabilidade de cada vendedor, garantindo todas elas, no entanto, os seus direitos legais de 14 dias. A Lumo gere o contacto e intercede a seu favor caso sinta que a loja falhou as polÃ­ticas estipuladas!</p>,
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
                        Tire as suas dÃºvidas de forma rÃ¡pida.
                    </Text>
                </div>

                <Divider />

                <Collapse items={items} defaultActiveKey={['1']} ghost size="large" />

            </Card>
        </div>
    );
};

export default FAQ;
