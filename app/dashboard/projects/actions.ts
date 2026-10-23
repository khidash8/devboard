// app/dashboard/projects/actions.ts
'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { projectSchema, type ProjectFormValues } from '@/lib/schemas/project';
import { revalidatePath } from 'next/cache';

export async function createProject(rawData: ProjectFormValues) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        return { success: false as const, error: 'Unauthorized. Please sign in.' };
    }

    const result = projectSchema.safeParse(rawData);
    if (!result.success) {
        return { success: false as const, error: result.error.issues[0]?.message ?? 'Invalid input' };
    }

    const existingProject = await db.project.findFirst({
        where: {
            userId: session.user.id,
            slug: result.data.slug,
        },
    });

    if (existingProject) {
        return {
            success: false as const,
            error: `A project with the slug "${result.data.slug}" already exists. Please choose a different slug.`,
        };
    }

    const project = await db.project.create({
        data: {
            name: result.data.name,
            slug: result.data.slug,
            userId: session.user.id,
        },
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/projects');
    return { success: true as const, project };
}

export async function deleteProject(projectId: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        return { success: false as const, error: 'Unauthorized' };
    }

    const project = await db.project.findFirst({
        where: { id: projectId, userId: session.user.id },
    });

    if (!project) {
        return { success: false as const, error: 'Project not found' };
    }

    await db.project.delete({ where: { id: projectId } });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/projects');
    return { success: true as const };
}
