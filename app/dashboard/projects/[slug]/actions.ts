// app/dashboard/projects/[slug]/actions.ts
'use server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { taskSchema, type TaskFormValues } from '@/lib/schemas/task';
import { revalidatePath } from 'next/cache';

export async function createTask(projectId: string, rawData: TaskFormValues) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false as const, error: 'Unauthorized' };

    // NEVER trust the client already validated this — re-validate the exact same schema, server-side
    const result = taskSchema.safeParse(rawData);
    if (!result.success) {
        return { success: false as const, error: result.error.issues[0]?.message };
    }

    // Ownership check — the same principle as Part 3's getOwnedProject, applied here
    const project = await db.project.findFirst({ where: { id: projectId, userId: session.user.id } });
    if (!project) return { success: false as const, error: 'Project not found' };

    await db.task.create({
        data: {
            projectId,
            title: result.data.title,
            description: result.data.description ?? null,
            priority: result.data.priority,
            dueDate: result.data.dueDate ? new Date(result.data.dueDate) : null,
        },
    });

    revalidatePath(`/dashboard/projects/${project.slug}`);
    return { success: true as const };
}

export async function toggleTaskStatus(taskId: string, newStatus: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error('Unauthorized');

    const task = await db.task.findFirst({
        where: { id: taskId, project: { userId: session.user.id } },
        include: { project: true },
    });
    if (!task) throw new Error('Task not found');

    const updated = await db.task.update({ where: { id: taskId }, data: { status: newStatus } });
    revalidatePath(`/dashboard/projects/${task.project.slug}`);
    return updated;
}

export async function getOpenTaskCount(projectId: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error('Unauthorized');

    return db.task.count({
        where: { projectId, project: { userId: session.user.id }, status: { not: 'done' } },
    });
}