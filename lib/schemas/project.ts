// lib/schemas/project.ts
import { z } from 'zod';

export const projectSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'Project name is required')
        .max(100, 'Project name cannot exceed 100 characters'),
    slug: z
        .string()
        .trim()
        .min(1, 'Slug is required')
        .max(50, 'Slug cannot exceed 50 characters')
        .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50);
}
