// app/api/webhooks/razorpay/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { db } from '@/lib/db';
import { env } from '@/lib/env';

export async function POST(request: NextRequest) {
    const body = await request.text(); // raw text, NOT parsed JSON — the signature is computed over the exact raw bytes
    const signature = request.headers.get('x-razorpay-signature');

    const expectedSignature = crypto
        .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
        .update(body)
        .digest('hex');

    if (signature !== expectedSignature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    const subscriptionEntity = event.payload.subscription?.entity;
    const userId = subscriptionEntity?.notes?.userId; // the exact link established back in Section 4

    if (!userId) return NextResponse.json({ received: true }); // nothing actionable, acknowledge anyway

    if (event.event === 'subscription.activated' || event.event === 'subscription.charged') {
        await db.subscription.upsert({
            where: { userId },
            create: {
                userId,
                plan: 'pro',
                status: 'active',
                razorpaySubId: subscriptionEntity.id,
                currentPeriodEnd: new Date(subscriptionEntity.current_end * 1000),
            },
            update: {
                status: 'active',
                currentPeriodEnd: new Date(subscriptionEntity.current_end * 1000),
            },
        });
    }

    if (event.event === 'subscription.cancelled') {
        await db.subscription.updateMany({ where: { userId }, data: { status: 'canceled', plan: 'free' } });
    }

    return NextResponse.json({ received: true });
}