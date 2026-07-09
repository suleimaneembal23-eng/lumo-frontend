import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const StripeForm = ({ amount, onSuccess, onCancel, customerName }) => {
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
            const response = await fetch('/api/payment/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // ou via AuthContext, mas isso deve funcionar
                },
                body: JSON.stringify({ amount, currency: 'XOF' }),
            });

            const { clientSecret, message: backendError } = await response.json();

            if (backendError) {
                throw new Error(backendError);
            }

            // 2. Confirmar pagamento com Stripe
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: customerName || 'Customer',
                    },
                },
            });

            if (result.error) {
                setErrorMessage(result.error.message);
                setIsProcessing(false);
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    onSuccess(result.paymentIntent);
                }
            }
        } catch (err) {
            console.error(err);
            setErrorMessage(err.message || 'Erro inesperado.');
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-xl bg-white">
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
            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
            <div className="flex gap-4">
                <button type="button" onClick={onCancel} className="flex-1 py-3 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-50" disabled={isProcessing}>
                    Cancelar
                </button>
                <button type="submit" disabled={!stripe || isProcessing} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">
                    {isProcessing ? 'Processando...' : 'Pagar Agora'}
                </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
                Segurança garantida por Stripe. Utilize cartões de teste (ex: 4242 4242...). Não armazenamos dados reais.
            </p>
        </form>
    );
};

export default StripeForm;
