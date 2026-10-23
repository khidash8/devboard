// lib/limits.ts
import { db } from './db';

const FREE_PLAN_PROJECT_LIMIT = 3;

export async function canCreateProject(userId: string): Promise<boolean> {
    const subscription = await db.subscription.findUnique({ where: { userId } });
    if (subscription?.plan === 'pro' && subscription.status === 'active') return true;

    const projectCount = await db.project.count({ where: { userId } });
    return projectCount < FREE_PLAN_PROJECT_LIMIT;
}