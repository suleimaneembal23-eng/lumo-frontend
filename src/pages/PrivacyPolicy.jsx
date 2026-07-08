import React, { useContext } from "react";
import { SettingsContext } from "../context/SettingsContext";
import { 
  ShieldCheck, 
  Lock, 
  Database, 
  Eye, 
  Cookie, 
  RefreshCw, 
  Mail, 
  FileText 
} from "lucide-react";

const PrivacyPolicy = () => {
    const { settings } = useContext(SettingsContext);
    const siteName = settings?.siteName || "Lumo";
    const contactEmail = settings?.contactEmail || "lumobissau@gmail.com";

    const sections = [
        {
            title: "1. InformaÃ§Ãµes que Recolhemos",
            icon: <Database className="w-6 h-6 text-blue-600" />,
            content: (
                <>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                        Na {siteName}, a transparÃªncia Ã© o nosso principal compromisso. Para garantir a melhor experiÃªncia de compra, recolhemos as seguintes categorias de informaÃ§Ãµes:
                    </p>
                    <ul className="space-y-3 text-gray-600 ml-2">
                        <li className="flex items-start gap-3">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></span>
                            <span><strong className="text-gray-900">Dados de IdentificaÃ§Ã£o:</strong> Nome completo, endereÃ§o de correio eletrÃ³nico, nÃºmero de telemÃ³vel e morada de faturaÃ§Ã£o/entrega.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></span>
                            <span><strong className="text-gray-900">Detalhes de TransaÃ§Ã£o:</strong> HistÃ³rico de encomendas, produtos favoritos, tamanhos habituais e mÃ©todo de pagamento escolhido. Os dados do cartÃ£o nÃ£o sÃ£o guardados nos nossos servidores; sÃ£o processados de forma segura por gateways certificados.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></span>
                            <span><strong className="text-gray-900">Dados TÃ©cnicos:</strong> EndereÃ§o IP, tipo de navegador, fuso horÃ¡rio e sistema operativo utilizado para aceder Ã  plataforma.</span>
                        </li>
                    </ul>
                </>
            )
        },
        {
            title: "2. UtilizaÃ§Ã£o dos Seus Dados",
            icon: <Eye className="w-6 h-6 text-blue-600" />,
            content: (
                <>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                        Os dados que partilha connosco tÃªm um propÃ³sito claro: tornar a sua experiÃªncia de compra incrivelmente fluida e segura. Utilizamos as suas informaÃ§Ãµes exclusivamente para:
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-600">
                        <li className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                            <span className="text-xl">ðŸ“¦</span> Processar e enviar encomendas
                        </li>
                        <li className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                            <span className="text-xl">ðŸ’³</span> Gerir pagamentos e reembolsos
                        </li>
                        <li className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                            <span className="text-xl">ðŸ””</span> Enviar atualizaÃ§Ãµes de rastreio
                        </li>
                        <li className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                            <span className="text-xl">ðŸ›¡ï¸</span> Prevenir atividades fraudulentas
                        </li>
                    </ul>
                </>
            )
        },
        {
            title: "3. SeguranÃ§a e EncriptaÃ§Ã£o",
            icon: <Lock className="w-6 h-6 text-blue-600" />,
            content: (
                <>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                        A seguranÃ§a dos seus dados Ã© a nossa prioridade nÃºmero um. Implementamos uma infraestrutura robusta para proteger as suas informaÃ§Ãµes contra acessos nÃ£o autorizados.
                    </p>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-blue-900">
                        <p className="font-bold mb-2">CertificaÃ§Ã£o SSL/TLS</p>
                        <p className="text-sm opacity-90">
                            Todas as comunicaÃ§Ãµes entre o seu dispositivo e os nossos servidores sÃ£o encriptadas de ponta-a-ponta utilizando protocolos de seguranÃ§a de nÃ­vel bancÃ¡rio. Nenhuma informaÃ§Ã£o pessoal viaja em texto limpo.
                        </p>
                    </div>
                </>
            )
        },
        {
            title: "4. PolÃ­tica de Cookies",
            icon: <Cookie className="w-6 h-6 text-blue-600" />,
            content: (
                <p className="text-gray-600 leading-relaxed">
                    A {siteName} utiliza "cookies" e tecnologias semelhantes para melhorar o desempenho do site, guardar os itens no seu carrinho de compras e analisar o trÃ¡fego da plataforma. Ao continuar a navegar, o utilizador concorda com o uso destas tecnologias. Pode gerir ou desativar os cookies a qualquer momento nas configuraÃ§Ãµes do seu navegador.
                </p>
            )
        },
        {
            title: "5. Os Seus Direitos (RGPD)",
            icon: <FileText className="w-6 h-6 text-blue-600" />,
            content: (
                <>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                        Em conformidade com a legislaÃ§Ã£o de proteÃ§Ã£o de dados, garantimos-lhe total controlo sobre as suas informaÃ§Ãµes:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {["Direito ao Acesso", "Direito Ã  RetificaÃ§Ã£o", "Direito ao Esquecimento", "Portabilidade de Dados", "OposiÃ§Ã£o ao Tratamento"].map((direito, idx) => (
                            <span key={idx} className="px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-full text-sm font-bold text-gray-700">
                                {direito}
                            </span>
                        ))}
                    </div>
                </>
            )
        },
        {
            title: "6. AlteraÃ§Ãµes Ã  PolÃ­tica",
            icon: <RefreshCw className="w-6 h-6 text-blue-600" />,
            content: (
                <p className="text-gray-600 leading-relaxed">
                    A evoluÃ§Ã£o contÃ­nua da nossa plataforma pode exigir atualizaÃ§Ãµes periÃ³dicas a este documento. Sempre que ocorrerem alteraÃ§Ãµes substanciais na forma como processamos os seus dados, enviaremos um aviso claro por e-mail ou atravÃ©s de um destaque no topo do nosso website.
                </p>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-16 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6 text-blue-600 shadow-inner">
                        <ShieldCheck size={40} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                        PolÃ­tica de Privacidade
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        O seu compromisso com a {siteName} merece a nossa total transparÃªncia. Saiba como protegemos os seus dados todos os dias.
                    </p>
                    <div className="mt-6 inline-block bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                        <span className="text-sm font-bold text-gray-400">Ãšltima atualizaÃ§Ã£o:</span>
                        <span className="text-sm font-bold text-gray-700 ml-2">{new Date().toLocaleDateString("pt-PT")}</span>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-8 md:p-12 space-y-12">
                        {sections.map((section, idx) => (
                            <section key={idx} className="group">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                        {React.cloneElement(section.icon, { className: "w-6 h-6" })}
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                                </div>
                                <div className="pl-[60px]">
                                    {section.content}
                                </div>
                                {idx !== sections.length - 1 && (
                                    <hr className="mt-12 border-gray-100" />
                                )}
                            </section>
                        ))}
                    </div>

                    {/* Contact Footer Area inside Card */}
                    <div className="bg-gray-900 text-white p-8 md:p-12">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Tem alguma dÃºvida?</h3>
                                <p className="text-gray-400">O nosso Encarregado de ProteÃ§Ã£o de Dados (DPO) estÃ¡ disponÃ­vel para o ajudar.</p>
                            </div>
                            <a 
                                href={`mailto:${contactEmail}`}
                                className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/30"
                            >
                                <Mail size={20} />
                                Falar com Suporte
                            </a>
                        </div>
                    </div>
                </div>

                {/* Footer simple text */}
                <div className="text-center mt-12 text-gray-400 text-sm font-medium">
                    Â© {new Date().getFullYear()} {siteName}. Protegemos aquilo que Ã© seu.
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;

