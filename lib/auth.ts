// lib/auth.ts
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { db } from './db';
import { env } from './env';

export const auth = betterAuth({
    database: prismaAdapter(db, { provider: 'postgresql' }),

    emailAndPassword: {
        enabled: true,
    },

    socialProviders: {
        github: {
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
        },
    },

    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,

    plugins: [nextCookies()], // must be LAST in the plugins array
});