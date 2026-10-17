// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
    DATABASE_URL: z.url(),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    GITHUB_CLIENT_ID: z.string().min(1),
    GITHUB_CLIENT_SECRET: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
});

export const env = envSchema.parse(process.env);