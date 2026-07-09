import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51SrVzUCe9WduHbClZfjOXjePXFBKBSRKDDUWETQcySYgzD8pOkWjw1DmP2TejWwHFyit18dl1dXFApDZR6r1Yj7y000Z2NAz59');

const StripePaymentWrapper = ({ children }) => {
    return (
        <Elements stripe={stripePromise}>
            {children}
        </Elements>
    );
};

export default StripePaymentWrapper;
