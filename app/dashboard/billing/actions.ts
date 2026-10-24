// app/dashboard/billing/actions.ts
'use server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { razorpay } from '@/lib/razorpay';
import { env } from '@/lib/env';
import crypto from 'node:crypto';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createProSubscription() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error('Unauthorized');

    const subscription = await razorpay.subscriptions.create({
        plan_id: env.RAZORPAY_PRO_PLAN_ID,
        customer_notify: 1,
        total_count: 120, // 10 years of monthly cycles — Razorpay requires a finite count, not literal "forever"
        notes: { userId: session.user.id }, // retrievable later from the webhook payload
    });

    return { subscriptionId: subscription.id, keyId: env.NEXT_PUBLIC_RAZORPAY_KEY_ID };
}


export async function verifyPayment(data: { paymentId: string; subscriptionId: string; signature: string }) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error('Unauthorized');

    // Razorpay subscription signatures are computed as HMAC-SHA256 of "paymentId|subscriptionId" —
    // NOTE the order: this differs from one-off ORDER payments, which sign "orderId|paymentId" instead
    const expectedSignature = crypto
        .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
        .update(`${data.paymentId}|${data.subscriptionId}`)
        .digest('hex');

    if (expectedSignature !== data.signature) {
        throw new Error('Invalid payment signature — this request did not genuinely come from Razorpay');
    }

    // Signature is valid — this confirms the CHECKOUT succeeded, but the webhook (Section 7) remains
    // the authoritative source of truth for actually updating subscription status; see Section 8
    return { verified: true };
}

export async function cancelSubscription() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error('Unauthorized');

    const subscription = await db.subscription.findUnique({
        where: { userId: session.user.id },
    });

    if (!subscription || subscription.plan !== 'pro' || subscription.status !== 'active') {
        throw new Error('No active Pro subscription found to cancel');
    }

    if (subscription.razorpaySubId) {
        try {
            await razorpay.subscriptions.cancel(subscription.razorpaySubId);
        } catch (error) {
            console.error('Razorpay subscription cancellation failed:', error);
            // Continue updating local status even if external API call fails
        }
    }

    await db.subscription.update({
        where: { userId: session.user.id },
        data: {
            status: 'canceled',
            plan: 'free',
        },
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/projects');
    revalidatePath('/dashboard/billing');

    return { success: true };
}