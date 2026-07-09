�import React, { useState, useContext } from 'react';
import { Search, Package, CheckCircle, Clock, Truck, MapPin, AlertCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { SettingsContext } from '../context/SettingsContext';

const OrderTracking = () => {
    const [orderId, setOrderId] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [trackingData, setTrackingData] = useState(null);
    const { settings } = useContext(SettingsContext);

    const handleTrack = async (e) => {
        e.preventDefault();
        setError(null);
        setTrackingData(null);
        setLoading(true);

        try {
            const res = await fetch('/api/orders/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, email })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Erro ao buscar pedido');
            }

            setTrackingData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock className="text-yellow-500" />;
            case 'confirmed': return <CheckCircle className="text-blue-500" />;
            case 'paid': return <CheckCircle className="text-green-500" />;
            case 'shipped': return <Truck className="text-purple-500" />;
            case 'delivered': return <MapPin className="text-green-600" />;
            case 'cancelled': return <AlertCircle className="text-red-500" />;
            default: return <Package />;
        }
    };

    const getStepColor = (step, currentStatus) => {
        // Lógica simples de progresso visual
        const statusOrder = ['pending', 'confirmed', 'paid', 'shipped', 'delivered'];
        const currentIndex = statusOrder.indexOf(currentStatus === 'paid' ? 'confirmed' : currentStatus); // Paid trata como confirmed visualmente
        const stepIndex = statusOrder.indexOf(step);

        if (currentStatus === 'cancelled') return 'bg-red-100 text-red-500';
        if (stepIndex <= currentIndex) return 'bg-blue-600 text-white border-blue-600';
        return 'bg-white text-gray-400 border-gray-200';
    };

    const siteName = settings?.siteName || 'nossa loja';

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
            <Helmet>
                <title>Rastrear Pedido | {siteName}</title>
                <meta name="description" content={`Acompanhe o status da sua entrega na ${siteName} em tempo real.`} />
            </Helmet>

            <div className="max-w-xl w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Rastrear Pedido</h1>
                    <p className="text-gray-500">Digite o código do pedido e o email utilizado na compra.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <form onSubmit={handleTrack} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">ID do Pedido</label>
                            <input
                                type="text"
                                placeholder="Ex: 65a8f..."
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value.trim())}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Email da Compra</label>
                            <input
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Buscando...' : <><Search size={20} /> Rastrear</>}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm font-medium animate-pulse">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}
                </div>

                {trackingData && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
                        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Pedido #{trackingData._id.slice(-6).toUpperCase()}</h2>
                                <p className="text-sm text-gray-500">{new Date(trackingData.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="font-bold text-lg text-blue-600">{Math.round(trackingData.totalPrice).toLocaleString('de-DE')} FCFA</span>
                                <span className="capitalize px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600">
                                    {trackingData.status === 'paid' ? 'Pago' : trackingData.status}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {trackingData.shopOrders.map((shopOrder, idx) => (
                                <div key={idx} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                            <Package className="text-blue-600" />
                                            {shopOrder.shopName}
                                        </h3>
                                        <span className="px-3 py-1 bg-white rounded-full text-xs font-bold text-gray-600 border border-gray-200">
                                            {shopOrder.trackingCode || 'TRK-PENDING'}
                                        </span>
                                    </div>

                                    {/* TIMELINE POR LOJA */}
                                    <div className="relative flex justify-between items-center mb-8">
                                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-0"></div>
                                        {[
                                            { id: 'pending', label: 'Pendente', icon: Clock },
                                            { id: 'confirmed', label: 'Processando', icon: CheckCircle },
                                            { id: 'shipped', label: 'Enviado', icon: Truck },
                                            { id: 'delivered', label: 'Entregue', icon: MapPin }
                                        ].map((step, sIdx) => {
                                            const activeClass = getStepColor(step.id, shopOrder.status);
                                            const Icon = step.icon;
                                            return (
                                                <div key={sIdx} className="relative z-10 flex flex-col items-center">
                                                    <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center transition-all ${activeClass}`}>
                                                        <Icon size={12} />
                                                    </div>
                                                    <span className="text-[10px] font-bold mt-1 text-gray-500 uppercase">{step.label}</span>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* ITENS DA LOJA */}
                                    <div className="space-y-2 mt-4">
                                        {shopOrder.items.map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 p-2 bg-white rounded-xl border border-gray-100">
                                                <img src={item.image} alt={item.name} className="w-10 h-10 object-contain bg-gray-50 rounded border border-gray-100" />
                                                <div>
                                                    <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                                                    <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 font-medium flex justify-between items-center">
                                        <span>Método de Entrega: <strong className="text-gray-700">{shopOrder.deliveryMethod === 'pickup' ? 'Levantamento na Loja' : 'Entrega Domiciliar'}</strong></span>
                                        <span className="capitalize text-blue-600 bg-blue-50 px-2 py-1 rounded">{shopOrder.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-4 border-t border-gray-100 text-center">
                            <p className="text-sm text-gray-500">
                                Endereço Base: <span className="font-bold text-gray-700">{trackingData.shippingAddress.line1}, {trackingData.shippingAddress.city}, {trackingData.shippingAddress.country}</span>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderTracking;
