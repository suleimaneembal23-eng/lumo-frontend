import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle, CreditCard, Truck, MapPin,
  ChevronRight, Shield, ArrowLeft, Building2
} from 'lucide-react';

import { AuthContext } from "../context/Authcontext";
import { SettingsContext } from "../context/SettingsContext";
import { cartService } from "../services/cartService";
import { useCurrency } from "../context/CurrencyContext";
import { countries } from "../utils/countries";
import StripePaymentWrapper from "../components/StripePaymentWrapper";
import StripeForm from "../components/StripeForm";

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { settings } = useContext(SettingsContext);

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [deliveryPreferences, setDeliveryPreferences] = useState({}); // { shopId: 'home' | 'pickup' }
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [successOrderId, setSuccessOrderId] = useState(null);

  const [formData, setFormData] = useState({
    line1: "",
    city: "", 
    postalCode: "",
    country: "Guiné-Bissau",
    phone: ""
  });

  const steps = [
    { id: 1, title: "Endereço", icon: <MapPin size={20} /> },
    { id: 2, title: "Frete", icon: <Truck size={20} /> },
    { id: 3, title: "Pagamento", icon: <CreditCard size={20} /> }
  ];

  // Carregar Carrinho
  useEffect(() => {
    const loadCart = async () => {
      if (!user) return navigate("/login");
      try {
        setLoading(true);
        const data = await cartService.getCart();
        if (!data || !data.items || data.items.length === 0) {
          navigate("/cart");
          return;
        }
        setCart(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadCart();
  }, [user, navigate]);

  // Carregar Endereço do Perfil
  useEffect(() => {
    if (user) {
      fetch(`/api/clients/${user.id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.address) {
            setFormData(prev => ({
              ...prev,
              line1: data.address.line1 || "",
              city: data.address.city || "",
              country: data.address.country || "Guiné-Bissau",
              postalCode: data.address.postalCode || "",
            }));
          }
          if (data.phone) setFormData(prev => ({ ...prev, phone: data.phone }));
        })
        .catch(err => console.error("Error fetching profile:", err));
    }
  }, [user]);

  // Cálculos
  const itemsSubtotal = cart?.items?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;

  const getShopGroups = () => {
    if (!cart?.items) return [];
    return Object.values(
      cart.items.reduce((acc, item) => {
        const vendorObj = typeof item.shopId === 'object' ? item.shopId : null;
        const sId = vendorObj ? vendorObj._id?.toString() : (item.shopId?.toString() || 'default');
        if (!acc[sId]) {
          acc[sId] = {
            shopId: sId,
            shopName: item.shopName || 'Loja Principal',
            items: [],
            allowsDelivery: vendorObj?.vendorInfo?.allowsDelivery !== false, // default true
            allowsPickup:   !!vendorObj?.vendorInfo?.allowsPickup,
            pickupAddress:  vendorObj?.vendorInfo?.pickupAddress || null,
          };
        }
        acc[sId].items.push(item);
        return acc;
      }, {})
    );
  };

  // Cálculos dinâmicos de Frete
  const resolveShippingCost = () => {
    let cost = 0;
    const shopGroups = getShopGroups();
    const hasAnyHomeDelivery = shopGroups.some(g => deliveryPreferences[g.shopId] !== 'pickup');
    if (hasAnyHomeDelivery) {
        const rate = settings?.shippingRates?.find(r => r.country === formData.country);
        cost = rate ? rate.cost : (settings?.shippingStandardPrice || 5);
    }
    return cost;
  };

  const shippingCost = resolveShippingCost();
  const total = itemsSubtotal + shippingCost;

  const shopGroups = getShopGroups();

  useEffect(() => {
    // Inicializar preferência de entrega com base no que a loja suporta
    if (cart?.items) {
      const initialPrefs = {};
      getShopGroups().forEach(g => {
        if (g.allowsDelivery && !g.allowsPickup) initialPrefs[g.shopId] = 'home';    // só entrega
        else if (!g.allowsDelivery && g.allowsPickup) initialPrefs[g.shopId] = 'pickup'; // só levantamento
        else initialPrefs[g.shopId] = 'home'; // ambos �  default entrega
      });
      setDeliveryPreferences(initialPrefs);
    }
  }, [cart]);

  // Usa o formato nativo FCFA diretamente
  const getDisplayPrice = (val) => formatPrice(val);

  useEffect(() => {
    setShippingMethod("standard");
  }, []);

  // Lógica de Levantamento Físico Dinâmico (Múltiplos Parceiros)
  const getPickupLocations = () => {
    if (!cart?.items) return [];
    const locations = [];
    let hasPlatformItems = false;

    cart.items.forEach(item => {
      const vendor = item.productId?.vendor;
      if (vendor) {
        if (!locations.find(l => l._id === vendor._id)) {
          const vAddr = vendor.vendorInfo?.pickupAddress;
          locations.push({
            _id: vendor._id,
            name: vendor.vendorInfo?.storeName || 'Loja Parceira',
            address: vAddr?.line1 ? 
              `${vAddr.line1}${vAddr.city ? `, ${vAddr.city}` : ''}${vAddr.country ? `, ${vAddr.country}` : ''}` 
              : 'Morada a Combinar (Contacte a Loja)',
            phone: vendor.phone || 'Telefone Indisponível',
            email: vendor.email || 'Email Indisponível'
          });
        }
      } else {
        hasPlatformItems = true;
      }
    });

    if (hasPlatformItems || locations.length === 0) {
      if (!locations.find(l => l._id === 'Platform')) {
        locations.push({
          _id: 'Platform',
          name: settings?.siteName || 'Lumo',
          address: settings?.address || 'Bairro de Belém, Bissau, Guiné-Bissau',
          phone: settings?.contactPhone || '+245 95XXXXXXX',
          email: settings?.contactEmail || 'lumobissau@gmail.com'
        });
      }
    }
    return locations;
  };
  const pickupLocations = getPickupLocations();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      const hasHomeDelivery = shopGroups.some(g => deliveryPreferences[g.shopId] === 'home');
      const hasPickup = shopGroups.some(g => deliveryPreferences[g.shopId] === 'pickup');

      if (hasHomeDelivery) {
        if (!formData.line1 || !formData.city || !formData.phone) {
          return alert("Por favor, preencha todos os campos obrigatórios para a entrega ao domicílio.");
        }
      } 
      if (hasPickup && !formData.phone) {
          return alert("Por favor, preencha o seu Telefone para podermos contactar quando a encomenda estiver pronta a levantar.");
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const handlePlaceOrder = async (additionalData = {}) => {
    try {
      const orderData = {
        items: cart.items.map(item => ({
          productId: item.productId?._id || item.productId || item.id, // O backend popula productId, por isso extrai-se o _id
          quantity: item.quantity,
          size: item.selectedSize,
          price: item.price
        })),
        shippingAddress: {
          line1: formData.line1 || "Levantamento na Loja",
          city: formData.city || "Loja Física",
          country: formData.country,
          postalCode: formData.postalCode || "0000-000",
          phone: formData.phone
        },
        paymentMethod,
        itemsPrice: itemsSubtotal,
        shippingPrice: shippingCost,
        totalPrice: total,
        deliveryPreferences, // Mapeamento das opções por loja
        paymentResult: additionalData.paymentResult || null,
        status: additionalData.paymentResult?.status === 'succeeded' ? 'paid' : 'pending'
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify(orderData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || errorData.error || "Falha ao criar pedido");
      }

      const order = await res.json();
      // Limpar carrinho
      await cartService.clearCart();
      setCart({ items: [], total: 0 }); // Atualiza a UI imediatamente para refletir carrinho limpo

      // Exibir sucesso e o ID da encomenda
      setSuccessOrderId(order._id);

    } catch (error) {
      console.error(error);
      alert(`Erro: ${error.message}`);
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          Checkout Seguro <Shield className="text-green-500" />
        </h1>

        {successOrderId ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-lg border border-green-100 max-w-2xl mx-auto animate-slideDown">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Pagamento Concluído!</h2>
            <p className="text-gray-600 mb-8 text-lg">A sua encomenda foi registada com sucesso.</p>
            
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
              <p className="text-sm font-bold text-gray-500 uppercase mb-2">O Seu Código de Rastreio (Order ID)</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl font-mono font-bold tracking-wider text-black bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
                  {successOrderId.toUpperCase()}
                </span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(successOrderId);
                    alert("Código copiado para a área de transferência!");
                  }}
                  className="bg-blue-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                  Copiar
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Guarde este código. Pode usá-lo na página "Rastrear Pedido" para saber o estado da sua compra.
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => navigate("/")}
                className="px-8 py-4 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Voltar à Loja
              </button>
              <button 
                onClick={() => navigate("/client/dashboard/orders")}
                className="px-8 py-4 bg-black text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Ver os Meus Pedidos
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN: STEPS */}
          <div className="lg:col-span-2 space-y-6">

            {/* STEPS INDICATOR */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center mb-6">
              {steps.map((step, index) => (
                <div key={step.id} className={`flex items-center gap-2 ${currentStep >= step.id ? "text-blue-600 font-bold" : "text-gray-400"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= step.id ? "border-blue-600 bg-blue-50" : "border-gray-200"}`}>
                    {currentStep > step.id ? <CheckCircle size={16} /> : step.id}
                  </div>
                  <span className="hidden sm:inline">{step.title}</span>
                  {index < steps.length - 1 && <ChevronRight size={16} className="text-gray-300 ml-2" />}
                </div>
              ))}
            </div>

            {/* STEP 1: ADDRESS */}
            {currentStep === 1 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-slideDown">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><MapPin className="text-blue-600" /> Endereço Principal (se aplicável)</h2>
                
                <p className="text-gray-500 mb-6">Preencha o seu endereço de entrega principal. No próximo passo, poderá escolher se deseja receber em casa ou levantar na loja, para cada item separadamente.</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Endereço (Rua, Bairro, Número)</label>
                    <input type="text" name="line1" value={formData.line1} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 outline-none" placeholder="Obrigatório para envios ao domicílio" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                      <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código Postal <span className="text-gray-400 text-xs">(opcional)</span>
                      </label>
                      <input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 outline-none" placeholder="Se existir" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                      <input type="text" name="country" value="Guiné-Bissau" readOnly className="w-full p-3 border border-gray-100 bg-gray-50 rounded-xl text-gray-500 outline-none cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefone <span className="text-red-500">*</span></label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 outline-none" required placeholder="+245 9XXXXXXX" />
                    </div>
                  </div>
                  <button onClick={handleNextStep} className="mt-4 w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                    Continuar para Envio
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: SHIPPING */}
            {currentStep === 2 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-slideDown">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Truck className="text-blue-600" />
                  Detalhes do Envio por Loja
                </h2>

                <div className="space-y-6">
                  {shopGroups.map(group => {
                    const onlyPickup   = !group.allowsDelivery && group.allowsPickup;
                    const onlyDelivery = group.allowsDelivery  && !group.allowsPickup;
                    const both         = group.allowsDelivery  && group.allowsPickup;
                    return (
                      <div key={group.shopId} className="border border-gray-200 rounded-xl p-4">
                        <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                          <Building2 size={18} className="text-gray-400" /> {group.shopName}
                        </h3>

                        {/* �x:�️ Mini resumo dos produtos desta loja */}
                        <div className="flex flex-wrap gap-2 my-3">
                          {group.items.map(item => (
                            <div key={item._id || item.productId} className="flex items-center gap-2 bg-gray-50 border border-gray-100 p-2 rounded-lg">
                              <img 
                                src={item.image?.startsWith('/uploads') ? `${item.image}` : item.image} 
                                alt={item.name} 
                                className="w-10 h-10 object-cover rounded-md border border-gray-200 bg-white" 
                              />
                              <div className="flex flex-col pr-2">
                                <span className="text-xs font-bold text-gray-800 leading-tight line-clamp-1 max-w-[140px]">{item.name}</span>
                                <span className="text-[10px] text-gray-500">Qtd: {item.quantity} {item.selectedSize && item.selectedSize !== '�anico' ? `| Tam: ${item.selectedSize}` : ''}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Aviso de método único */}
                        {onlyPickup && (
                          <div className="mb-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                            �x�� <span>Esta loja <strong>não faz envios</strong> � apenas levantamento na loja física.</span>
                          </div>
                        )}
                        {onlyDelivery && (
                          <div className="mb-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                            �xaa <span>Esta loja <strong>só faz envio para casa</strong> � levantamento físico indisponível.</span>
                          </div>
                        )}

                        <div className="flex gap-4">
                          {/* Botão Entrega em Casa */}
                          <button
                            disabled={!group.allowsDelivery}
                            onClick={() => group.allowsDelivery && setDeliveryPreferences(prev => ({ ...prev, [group.shopId]: 'home' }))}
                            className={`flex-1 p-3 rounded-lg border-2 flex flex-col items-center gap-2 font-bold transition-all
                              ${!group.allowsDelivery
                                ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                                : deliveryPreferences[group.shopId] === 'home'
                                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 text-gray-500 hover:border-blue-300'}`}
                          >
                            <Truck size={20} />
                            Receber em Casa
                            {!group.allowsDelivery && <span className="text-xs font-normal">Indisponível</span>}
                          </button>

                          {/* Botão Levantamento */}
                          <button
                            disabled={!group.allowsPickup}
                            onClick={() => group.allowsPickup && setDeliveryPreferences(prev => ({ ...prev, [group.shopId]: 'pickup' }))}
                            className={`flex-1 p-3 rounded-lg border-2 flex flex-col items-center gap-2 font-bold transition-all
                              ${!group.allowsPickup
                                ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                                : deliveryPreferences[group.shopId] === 'pickup'
                                  ? 'border-green-600 bg-green-50 text-green-700'
                                  : 'border-gray-200 text-gray-500 hover:border-green-300'}`}
                          >
                            <Building2 size={20} />
                            Levantar na Loja
                            {!group.allowsPickup && <span className="text-xs font-normal">Indisponível</span>}
                          </button>
                        </div>

                        {/* Morada de levantamento */}
                        {deliveryPreferences[group.shopId] === 'pickup' && group.pickupAddress?.line1 && (
                          <div className="mt-3 bg-green-50 rounded-lg p-3 text-sm text-green-700">
                            �x� <strong>Morada:</strong> {group.pickupAddress.line1}{group.pickupAddress.city ? `, ${group.pickupAddress.city}` : ''}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-4 mt-8">
                  <button onClick={() => setCurrentStep(1)} className="flex-1 py-3 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-50">Voltar</button>
                  <button onClick={handleNextStep} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">Continuar para Pagamento</button>
                </div>
              </div>
            )}

            {/* STEP 3: PAYMENT */}
            {currentStep === 3 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-slideDown">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><CreditCard className="text-blue-600" /> Pagamento</h2>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  <button
                    onClick={() => setPaymentMethod('transfer')}
                    className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'transfer' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Building2 size={32} />
                    <span className="font-bold text-sm text-center">Transferência Bancária</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'credit_card' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    <CreditCard size={32} />
                    <span className="font-bold text-sm">Cartão de Crédito</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('orange_money')}
                    className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'orange_money' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs">OM</div>
                    <span className="font-bold text-sm">Orange Money</span>
                  </button>



                  {/* �x�� Simulation Button */}
                  <button
                    onClick={() => setPaymentMethod('simulation')}
                    className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'simulation' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xs font-mono">SIM</div>
                    <span className="font-bold text-sm">Simulação</span>
                  </button>
                </div>

                {/* Conditional Payment UI */}
                {paymentMethod === 'credit_card' ? (
                  <StripePaymentWrapper>
                    <StripeForm
                      amount={total}
                      customerName={user?.name}
                      onSuccess={(paymentIntent) => {
                        handlePlaceOrder({
                          paymentResult: {
                            id: paymentIntent.id,
                            status: paymentIntent.status,
                            update_time: new Date().toISOString()
                          }
                        });
                      }}
                      onCancel={() => setCurrentStep(2)}
                    />
                  </StripePaymentWrapper>
                ) : (
                  <>
                    <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 mb-6 border border-gray-100 italic">
                      {paymentMethod === 'simulation' && (
                        <div className="text-purple-700 font-medium not-italic">
                          �x�� **MODO DE TESTE ATIVADO**
                          <p className="mt-2 text-sm text-gray-600 font-normal">Esta opção simula um pedido finalizado manualmente. �atil para testar o envio de e-mails sem usar cartões reais.</p>
                        </div>
                      )}

                      {/* Orange Money Info */}
                      {paymentMethod === 'orange_money' && (
                        <div>
                          <p className="font-bold text-gray-800 mb-2">Instruções Orange Money:</p>
                          <p className="mb-2">Envie o valor exato ({getDisplayPrice(total)}) para o número:</p>
                          <div className="bg-white p-3 rounded-lg border border-orange-200 font-mono text-xl font-bold text-center mb-2 text-orange-600 shadow-inner">
                            {settings?.paymentConfig?.orangeMoneyNumber || "Número não configurado"}
                          </div>
                          <p className="text-xs text-orange-600 mt-2">Indique a referência enviada para o seu email.</p>
                        </div>
                      )}

                      {/* Transferência Info */}
                      {paymentMethod === 'transfer' && (
                        <div>
                          <p className="font-bold text-gray-800 mb-2">Transferência Bancária:</p>
                          <p className="mb-2">Faça a transferência para o seguinte IBAN:</p>
                          <div className="bg-white p-3 rounded-lg border border-blue-200 font-mono text-xl font-bold text-center mb-2 text-blue-600 shadow-inner">
                            {settings?.paymentConfig?.iban || "IBAN não configurado"}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4 mt-8">
                      <button onClick={() => setCurrentStep(2)} className="flex-1 py-3 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all">Voltar</button>
                      <button onClick={() => handlePlaceOrder()} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">Confirmar Pedido</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Resumo</h3>
              <div className="space-y-4 max-h-60 overflow-y-auto mb-4 scrollbar-thin">
                {cart?.items?.map(item => (
                  <div key={item.productId} className="flex gap-3 text-sm">
                    <div className="w-12 h-12 bg-gray-50 rounded-lg flex-shrink-0">
                      <img src={item.image} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 truncate">{item.name}</p>
                      {/* Personalização */}
                      <div className="text-xs text-gray-500">
                        {item.customization?.name && <span>{item.customization.name} {item.customization.number}</span>}
                        {item.customization?.hasBadge && <span className="block text-blue-600 font-bold">+ Patch Champions</span>}
                      </div>
                      <p className="text-gray-500 mt-1">{item.quantity}x {getDisplayPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{getDisplayPrice(itemsSubtotal)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Frete</span><span>{shippingCost === 0 && (settings?.freeShippingThreshold > 0 && itemsSubtotal >= settings.freeShippingThreshold) ? "GRÁTIS" : getDisplayPrice(shippingCost)}</span></div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2"><span>Total</span><span>{getDisplayPrice(total)}</span></div>
              </div>
            </div>
          </div>
          </div>
        )}
      </div>
    </div >
  );
};

export default Checkout;
