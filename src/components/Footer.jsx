�import React, { useContext } from 'react';
import { Facebook, Instagram, Twitter, MapPin, Mail, Phone, Heart } from 'lucide-react';
import { SettingsContext } from '../context/SettingsContext';

const Footer = () => {
    const { settings } = useContext(SettingsContext);

    return (
        <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">

                    {/* Brand Section */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-extrabold text-white tracking-tight">
                            {settings?.siteName || "Loja Online"}
                        </h2>
                        <p className="text-sm leading-relaxed text-gray-400">
                            A sua loja online de eleição. Qualidade premium, entrega rápida e dedicação à excelência.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <a href="#" className="hover:text-white transition-colors"><Facebook size={20} /></a>
                            <a href="#" className="hover:text-white transition-colors"><Instagram size={20} /></a>
                            <a href="#" className="hover:text-white transition-colors"><Twitter size={20} /></a>
                        </div>

                        {/* Newsletter Tiny Form */}
                        <div className="pt-4">
                            <h4 className="font-bold text-white text-xs uppercase mb-2">Novidades e Ofertas</h4>
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    const email = e.target.email.value;
                                    try {
                                        const res = await fetch('/api/marketing/subscribe', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ email })
                                        });
                                        const data = await res.json();
                                        alert(data.message);
                                        if (res.ok) e.target.reset();
                                    } catch (err) {
                                        alert("Erro ao inscrever.");
                                    }
                                }}
                                className="flex gap-2"
                            >
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Seu email..."
                                    className="bg-gray-800 text-white text-xs rounded-lg px-3 py-2 border border-gray-700 focus:border-blue-500 outline-none w-full"
                                    required
                                />
                                <button type="submit" className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors">
                                    <Mail size={16} />
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Links 1 */}
                    <div>
                        <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Navegação</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/" className="hover:text-white transition-colors">Início</a></li>
                            <li><a href="/products" className="hover:text-white transition-colors">Catálogo</a></li>
                            <li><a href="/cart" className="hover:text-white transition-colors">Carrinho</a></li>
                            <li><a href="/profile/orders" className="hover:text-white transition-colors">Meus Pedidos</a></li>
                        </ul>
                    </div>

                    {/* Links 2 */}
                    <div>
                        <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Ajuda</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/shipping" className="hover:text-white transition-colors">Envios: {settings?.maxShippingDays || "3-5"} dias</a></li>
                            <li><a href="/track-order" className="hover:text-white transition-colors">Rastrear Pedido</a></li>
                            <li><a href="/returns" className="hover:text-white transition-colors">Devoluções: {settings?.returnPolicyDays || "30"} dias</a></li>
                            <li><a href="/terms" className="hover:text-white transition-colors">Termos e Condições</a></li>
                            <li><a href="/privacy-policy" className="hover:text-white transition-colors">Política de Privacidade</a></li>
                            <li><a href="/faq" className="hover:text-white transition-colors">FAQ</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Contato</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="mt-0.5 text-blue-500" style={{ color: settings?.primaryColor }} />
                                <span>{settings?.address || "Endereço não configurado"}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={18} className="text-blue-500" style={{ color: settings?.primaryColor }} />
                                <span>{settings?.contactPhone || "Telefone não configurado"}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="text-blue-500" style={{ color: settings?.primaryColor }} />
                                <span>{settings?.contactEmail || "lumobissau@gmail.com"}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                    <p>&copy; {new Date().getFullYear()} {settings?.siteName || "Loja Online"}. Todos os direitos reservados.</p>
                    <p className="flex items-center gap-1">
                        Feito com <Heart size={14} className="text-red-500 fill-red-500" /> para os nossos clientes.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
