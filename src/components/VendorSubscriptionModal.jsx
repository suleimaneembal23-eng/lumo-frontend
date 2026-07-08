import React, { useState } from 'react';
import { Modal, Button, message, Spin } from 'antd';
import { Shield, Sparkles } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Load Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || "pk_test_51SrVzUCe9WduHbClZfjOXjePXFBKBSRKDDUWETQcySYgzD8pOkWjw1DmP2TejWwHFyit18dl1dXFApDZR6r1Yj7y000Z2NAz59");

const SubscriptionForm = ({ planType, amount, onSuccess, onCancel, token }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);
        setErrorMessage(null);

        try {
            // 1. Criar PaymentIntent no Backend
            const response = await fetch('/api/payment/vendor-subscription-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ planType }), 
            });

            const { clientSecret, message: backendError } = await response.json();

            if (backendError) {
                throw new Error(backendError);
            }

            // 2. Confirmar pagamento
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: 'Vendor Subscription',
                    },
                },
            });

            if (result.error) {
                setErrorMessage(result.error.message);
                message.error(result.error.message);
                setIsProcessing(false);
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    // 3. Ativar assinatura
                    const activationResponse = await fetch('/api/clients/vendor/activate-subscription', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ 
                            paymentIntentId: result.paymentIntent.id,
                            planType 
                        }),
                    });

                    const activationData = await activationResponse.json();

                    if (activationResponse.ok) {
                        message.success('ParabÃ©ns! Assinatura Premium Ativada! ðŸŽ‰');
                        onSuccess(activationData.subscription);
                    } else {
                        throw new Error(activationData.message || "Erro ao ativar assinatura no servidor.");
                    }
                }
            }
        } catch (err) {
            console.error(err);
            setErrorMessage(err.message || 'Erro inesperado.');
            message.error(err.message || 'Erro ao processar assinatura.');
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-lg text-indigo-900 m-0">
                        {planType === 'monthly' ? 'Plano Mensal' : 'Plano Semestral'}
                    </h3>
                    <p className="text-indigo-600/80 m-0 text-sm">
                        Desbloqueie todas as funcionalidades Premium
                    </p>
                </div>
                <div className="text-2xl font-black text-indigo-600">
                    {Math.round(amount).toLocaleString('de-DE')} FCFA
                </div>
            </div>

            <div className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <Shield size={16} className="text-blue-600" /> Insira os dados do cartÃ£o
                </label>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#424770',
                                    '::placeholder': { color: '#aab7c4' },
                                },
                                invalid: { color: '#9e2146' },
                            },
                        }}
                    />
                </div>
                {errorMessage && <p className="mt-2 text-xs text-red-500 font-medium">{errorMessage}</p>}
                
                <p className="text-xs text-gray-400 mt-4 text-center">
                    Pagamento seguro processado pela Stripe.
                </p>
            </div>

            <div className="flex gap-4 pt-2">
                <Button
                    onClick={onCancel}
                    disabled={isProcessing}
                    className="flex-1 h-12 rounded-xl font-bold border-gray-300"
                >
                    Cancelar
                </Button>
                <Button
                    type="primary"
                    onClick={handleSubmit}
                    loading={isProcessing}
                    disabled={!stripe || isProcessing}
                    className="flex-2 h-12 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 shadow-md text-white border-0 flex items-center justify-center gap-2 px-8"
                >
                    <Sparkles size={18} />
                    Confirmar Assinatura
                </Button>
            </div>
        </div>
    );
};

const VendorSubscriptionModal = ({ isVisible, onClose, planType, token, onSuccess }) => {
    const amount = planType === 'monthly' ? 40 : 150;

    return (
        <Modal
            title={<span className="text-xl font-bold text-gray-800">Ativar Assinatura Premium ðŸ’Ž</span>}
            open={isVisible}
            onCancel={onClose}
            footer={null}
            width={500}
            destroyOnClose
            centered
        >
            <div className="mt-6">
                <Elements stripe={stripePromise}>
                    <SubscriptionForm 
                        planType={planType} 
                        amount={amount} 
                        token={token}
                        onSuccess={onSuccess} 
                        onCancel={onClose} 
                    />
                </Elements>
            </div>
        </Modal>
    );
};

export default VendorSubscriptionModal;
