// prisma/seed.ts
import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashPassword } from 'better-auth/crypto';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
    const user = await db.user.upsert({
        where: { email: 'you@example.com' },
        create: { email: 'you@example.com', name: 'Demo User', emailVerified: true },
        update: { emailVerified: true },
    });

    const passwordHash = await hashPassword('demoUser@123');

    await db.account.upsert({
        where: {
            providerId_accountId: {
                providerId: 'credential',
                accountId: user.id,
            },
        },
        create: {
            userId: user.id,
            providerId: 'credential',
            accountId: user.id,
            password: passwordHash,
        },
        update: {
            password: passwordHash,
        },
    });

    const project = await db.project.upsert({
        where: { userId_slug: { userId: user.id, slug: 'devboard-itself' } },
        create: { userId: user.id, name: 'DevBoard Itself', slug: 'devboard-itself' },
        update: {},
    });

    const existingTasks = await db.task.count({ where: { projectId: project.id } });
    if (existingTasks === 0) {
        await db.task.createMany({
            data: [
                { projectId: project.id, title: 'Set up Prisma schema', status: 'done', priority: 'high' },
                { projectId: project.id, title: 'Wire up GitHub OAuth', status: 'in_progress', priority: 'high' },
                { projectId: project.id, title: 'Build the task list UI', status: 'todo', priority: 'medium' },
            ],
        });
    }

    console.log('Seeded 1 user with credentials, 1 project, 3 tasks');
}

main()
    .then(() => db.$disconnect())
    .catch(async (error) => {
        console.error(error);
        await db.$disconnect();
        process.exit(1);
    });