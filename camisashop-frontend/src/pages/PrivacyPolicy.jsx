import React, { useContext } from "react";
import { Typography, Card, Divider } from "antd";
import { SettingsContext } from "../context/SettingsContext";

const { Title, Paragraph, Text } = Typography;

const PrivacyPolicy = () => {
    const { settings } = useContext(SettingsContext);

    return (
        <div
            style={{
                minHeight: "100vh",
                padding: "40px 20px",
                background: settings?.background || "#f5f5f5",
            }}
        >
            <Card
                style={{
                    maxWidth: 1000,
                    margin: "0 auto",
                    borderRadius: 12,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
            >
                <Title level={1} style={{ textAlign: "center", marginBottom: 40 }}>
                    Política de Privacidade
                </Title>

                <Paragraph style={{ fontSize: 16, marginBottom: 30 }}>
                    <Text strong>Última atualização:</Text> {new Date().toLocaleDateString('pt-BR')}
                </Paragraph>

                <Divider />

                <Title level={2}>1. Informações que Coletamos</Title>
                <Paragraph style={{ fontSize: 15 }}>
                    A <Text strong>SR Store</Text> coleta informações pessoais quando você se registra em nosso site,
                    faz um pedido, assina nossa newsletter ou preenche um formulário. As informações coletadas incluem:
                </Paragraph>
                <ul style={{ fontSize: 15, marginBottom: 30 }}>
                    <li>Nome completo</li>
                    <li>Endereço de e-mail</li>
                    <li>Número de telefone</li>
                    <li>Endereço de entrega e cobrança</li>
                    <li>Informações de pagamento (processadas de forma segura)</li>
                    <li>Histórico de pedidos e preferências de compra</li>
                </ul>

                <Divider />

                <Title level={2}>2. Como Usamos Suas Informações</Title>
                <Paragraph style={{ fontSize: 15 }}>
                    As informações que coletamos são utilizadas para:
                </Paragraph>
                <ul style={{ fontSize: 15, marginBottom: 30 }}>
                    <li>Processar e gerenciar seus pedidos</li>
                    <li>Melhorar nosso atendimento ao cliente</li>
                    <li>Personalizar sua experiência de compra</li>
                    <li>Enviar e-mails periódicos sobre pedidos e promoções</li>
                    <li>Melhorar nosso site e produtos</li>
                    <li>Processar transações de forma segura</li>
                </ul>

                <Divider />

                <Title level={2}>3. Proteção de Informações</Title>
                <Paragraph style={{ fontSize: 15, marginBottom: 30 }}>
                    Implementamos medidas de segurança adequadas para proteger suas informações pessoais contra
                    acesso não autorizado, alteração, divulgação ou destruição. Utilizamos criptografia SSL para
                    proteger informações sensíveis transmitidas online e mantemos salvaguardas físicas, eletrônicas
                    e procedimentais em conexão com a coleta, armazenamento e divulgação de informações pessoais.
                </Paragraph>

                <Divider />

                <Title level={2}>4. Cookies</Title>
                <Paragraph style={{ fontSize: 15, marginBottom: 30 }}>
                    Utilizamos cookies para melhorar sua experiência em nosso site. Os cookies são pequenos arquivos
                    que um site ou seu provedor de serviços transfere para o disco rígido do seu computador através
                    do navegador (se você permitir). Esses cookies nos ajudam a reconhecer seu navegador, capturar
                    e lembrar certas informações, e entender suas preferências com base em atividades anteriores.
                </Paragraph>

                <Divider />

                <Title level={2}>5. Compartilhamento de Informações</Title>
                <Paragraph style={{ fontSize: 15, marginBottom: 30 }}>
                    Não vendemos, trocamos ou transferimos suas informações pessoais identificáveis para terceiros.
                    Isso não inclui parceiros confiáveis que nos auxiliam na operação do site, condução de nossos
                    negócios ou atendimento a você, desde que essas partes concordem em manter essas informações
                    confidenciais. Também podemos divulgar suas informações quando acreditamos que a divulgação é
                    apropriada para cumprir a lei, aplicar nossas políticas do site ou proteger nossos direitos,
                    propriedade ou segurança.
                </Paragraph>

                <Divider />

                <Title level={2}>6. Links de Terceiros</Title>
                <Paragraph style={{ fontSize: 15, marginBottom: 30 }}>
                    Ocasionalmente, a nosso critério, podemos incluir ou oferecer produtos ou serviços de terceiros
                    em nosso site. Esses sites de terceiros têm políticas de privacidade separadas e independentes.
                    Portanto, não temos responsabilidade ou obrigação pelo conteúdo e atividades desses sites vinculados.
                    No entanto, procuramos proteger a integridade do nosso site e agradecemos qualquer feedback sobre
                    esses sites.
                </Paragraph>

                <Divider />

                <Title level={2}>7. Seus Direitos</Title>
                <Paragraph style={{ fontSize: 15 }}>
                    De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:
                </Paragraph>
                <ul style={{ fontSize: 15, marginBottom: 30 }}>
                    <li>Confirmação da existência de tratamento de dados</li>
                    <li>Acesso aos seus dados pessoais</li>
                    <li>Correção de dados incompletos, inexatos ou desatualizados</li>
                    <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
                    <li>Portabilidade dos dados a outro fornecedor</li>
                    <li>Eliminação dos dados pessoais tratados com seu consentimento</li>
                    <li>Revogação do consentimento</li>
                </ul>

                <Divider />

                <Title level={2}>8. Consentimento</Title>
                <Paragraph style={{ fontSize: 15, marginBottom: 30 }}>
                    Ao usar nosso site, você consente com nossa política de privacidade. Se você não concordar com
                    esta política, por favor, não use nosso site.
                </Paragraph>

                <Divider />

                <Title level={2}>9. Alterações na Política de Privacidade</Title>
                <Paragraph style={{ fontSize: 15, marginBottom: 30 }}>
                    Reservamo-nos o direito de atualizar esta política de privacidade a qualquer momento. Quando o
                    fizermos, revisaremos a data de atualização na parte superior desta página. Recomendamos que você
                    verifique esta página periodicamente para quaisquer alterações e se mantenha informado sobre como
                    estamos ajudando a proteger as informações pessoais que coletamos.
                </Paragraph>

                <Divider />

                <Title level={2}>10. Contato</Title>
                <Paragraph style={{ fontSize: 15, marginBottom: 30 }}>
                    Se você tiver alguma dúvida sobre esta Política de Privacidade ou sobre as práticas deste site,
                    entre em contato conosco através do e-mail: <Text strong>srstore.fc@gmail.com</Text>
                </Paragraph>

                <Divider />

                <Paragraph style={{ textAlign: "center", marginTop: 40, fontSize: 14, color: "#888" }}>
                    © {new Date().getFullYear()} SR Store. Todos os direitos reservados.
                </Paragraph>
            </Card>
        </div>
    );
};

export default PrivacyPolicy;
