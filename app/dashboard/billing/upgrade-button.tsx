// app/dashboard/billing/upgrade-button.tsx
'use client';
import { useState } from 'react';
import { createProSubscription, verifyPayment } from './actions';
import { Button } from '@/components/ui/button';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export function UpgradeButton() {
    const [isLoading, setIsLoading] = useState(false);

    async function handleUpgrade() {
        setIsLoading(true);
        const { subscriptionId, keyId } = await createProSubscription();

        const razorpayCheckout = new window.Razorpay({
            key: keyId,
            subscription_id: subscriptionId,
            name: 'DevBoard',
            description: 'Pro plan — monthly',
            handler: async (response: any) => {
                await verifyPayment({
                    paymentId: response.razorpay_payment_id,
                    subscriptionId: response.razorpay_subscription_id,
                    signature: response.razorpay_signature,
                });
                window.location.href = '/dashboard/billing?upgraded=true';
            },
            theme: { color: '#2F6F5E' }, // DevBoard's own accent token, not Razorpay's default
        });

        razorpayCheckout.open();
        setIsLoading(false);
    }

    return (
        <Button onClick={handleUpgrade} disabled={isLoading}>
            {isLoading ? 'Loading…' : 'Upgrade to Pro'}
        </Button>
    );
}