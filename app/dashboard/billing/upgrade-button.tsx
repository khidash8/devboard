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

interface UpgradeButtonProps {
    className?: string;
    variant?: 'default' | 'outline' | 'secondary' | 'ghost';
    size?: 'default' | 'xs' | 'sm' | 'lg';
    label?: string;
}

export function UpgradeButton({
    className,
    variant = 'default',
    size = 'default',
    label = 'Upgrade to Pro',
}: UpgradeButtonProps = {}) {
    const [isLoading, setIsLoading] = useState(false);

    async function handleUpgrade() {
        setIsLoading(true);
        try {
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
                    window.location.href = '/dashboard/projects';
                },
                theme: { color: '#2F6F5E' }, // DevBoard's own accent token, not Razorpay's default
            });

            razorpayCheckout.open();
        } catch (error) {
            console.error('Failed to initiate upgrade:', error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Button onClick={handleUpgrade} disabled={isLoading} variant={variant} size={size} className={className}>
            {isLoading ? 'Loading…' : label}
        </Button>
    );
}