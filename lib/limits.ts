// lib/limits.ts
import { db } from './db';

export const FREE_PLAN_PROJECT_LIMIT = 3;

export interface SubscriptionUsage {
    isPro: boolean;
    plan: 'free' | 'pro';
    status: 'active' | 'past_due' | 'canceled' | string;
    projectCount: number;
    projectLimit: number | null; // null represents unlimited
    projectsRemaining: number | null; // null represents unlimited
    canCreateMore: boolean;
    currentPeriodEnd: Date | null;
    subscriptionId: string | null;
}

export async function canCreateProject(userId: string): Promise<boolean> {
    const subscription = await db.subscription.findUnique({ where: { userId } });
    if (subscription?.plan === 'pro' && subscription.status === 'active') return true;

    const projectCount = await db.project.count({ where: { userId } });
    return projectCount < FREE_PLAN_PROJECT_LIMIT;
}

export async function getSubscriptionUsage(userId: string): Promise<SubscriptionUsage> {
    const subscription = await db.subscription.findUnique({ where: { userId } });
    const isPro = subscription?.plan === 'pro' && subscription.status === 'active';
    const projectCount = await db.project.count({ where: { userId } });
    const limit = FREE_PLAN_PROJECT_LIMIT;
    const remaining = isPro ? null : Math.max(0, limit - projectCount);

    return {
        isPro,
        plan: (subscription?.plan as 'free' | 'pro') || 'free',
        status: subscription?.status || 'active',
        projectCount,
        projectLimit: isPro ? null : limit,
        projectsRemaining: remaining,
        canCreateMore: isPro || projectCount < limit,
        currentPeriodEnd: subscription?.currentPeriodEnd || null,
        subscriptionId: subscription?.razorpaySubId || null,
    };
}