import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { TaskFilters } from './task-filters';
import { TaskRow } from './task-row';
import { NewTaskForm } from './new-task-form';
import { OpenTaskBadge } from '../../project-sidebar';

import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { CommandTrigger } from '@/components/command-trigger';

export const instant = false;

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

    const project = await db.project.findFirst({
        where: {
            userId: session.user.id,
            OR: [{ slug }, { id: slug }],
        },
    });
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
        <main className="max-w-4xl mx-auto p-8 space-y-6">
            {/* Navigation / Breadcrumb Bar */}
            <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2 text-xs text-muted">
                    <Link href="/dashboard" className="hover:text-ink transition-colors">
                        Dashboard
                    </Link>
                    <span>/</span>
                    <Link href="/dashboard/projects" className="hover:text-ink transition-colors">
                        Projects
                    </Link>
                    <span>/</span>
                    <span className="text-ink font-mono font-medium truncate max-w-50">
                        {project.slug}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <CommandTrigger />
                    {/* <ThemeToggle /> */}
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">{project.name}</h1>
                    <p className="font-mono text-xs text-muted mt-0.5">/dashboard/projects/{project.slug}</p>
                </div>
                <OpenTaskBadge projectId={project.id} />
            </div>
            <NewTaskForm projectId={project.id} />
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