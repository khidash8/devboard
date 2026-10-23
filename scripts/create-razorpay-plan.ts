// scripts/create-razorpay-plan.ts — run once, by hand, never as part of normal app logic
import { config } from 'dotenv';

// Load environment variables before loading lib/razorpay and lib/env
config({ path: '.env.local' });
config({ path: '.env' });

async function main() {
    const { razorpay } = await import('../lib/razorpay');

    try {
        const plan = await razorpay.plans.create({
            period: 'monthly',
            interval: 1,
            item: {
                name: 'DevBoard Pro',
                amount: 49900, // ₹499.00 — Razorpay amounts are in the smallest currency unit (paise), exactly like Stripe's cents
                currency: 'INR',
            },
        });
        console.log('Plan created. Add this to .env.local:');
        console.log(`RAZORPAY_PRO_PLAN_ID="${plan.id}"`);
    } catch (error) {
        console.error('Error creating Razorpay plan:', error);
    }
}

main();