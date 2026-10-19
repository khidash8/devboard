import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { TaskFilters } from './task-filters';
import { TaskRow } from './task-row';

export default async function ProjectTasksPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ status?: string; priority?: string; q?: string }>;
}) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect('/sign-in');

    const { slug } = await params;
    const { status, priority, q } = await searchParams;

    const project = await db.project.findFirst({ where: { slug, userId: session.user.id } });
    if (!project) notFound();

    const tasks = await db.task.findMany({
        where: {
            projectId: project.id,
            ...(status && status !== 'all' ? { status } : {}),
            ...(priority && priority !== 'all' ? { priority } : {}),
            ...(q ? { title: { contains: q, mode: 'insensitive' } } : {}),
        },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <main className="p-8 space-y-6">
            <h1 className="text-xl font-semibold">{project.name}</h1>
            <TaskFilters />
            <div className="divide-y divide-border border border-border rounded">
                {tasks.length === 0 ? (
                    <p className="p-6 text-sm text-muted">No tasks match these filters.</p>
                ) : (
                    tasks.map((task) => <TaskRow key={task.id} task={task} />)
                )}
            </div>
        </main>
    );
}