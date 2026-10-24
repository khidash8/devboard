import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, CreditCard } from 'lucide-react';

import { db } from '@/lib/db';
import { getSubscriptionUsage } from '@/lib/limits';
import { OpenTaskBadge } from './project-sidebar';
import { NewProjectDialog } from '@/components/new-project-dialog';
import { ThemeToggle } from '@/components/theme-toggle';
import { CommandTrigger } from '@/components/command-trigger';

export const instant = false;

export default async function DashboardPage() {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) redirect('/sign-in');

    const [projects, usage] = await Promise.all([
        db.project.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
        }),
        getSubscriptionUsage(session.user.id),
    ]);

    return (
        <main className="max-w-6xl mx-auto p-8 space-y-8">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-border pb-4">
                <span className="font-semibold text-sm tracking-wide uppercase">DevBoard</span>
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/billing"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border border-border bg-paper hover:bg-muted/50 transition-colors"
                        title="Manage subscription and billing"
                    >
                        {usage.isPro ? (
                            <>
                                <Sparkles className="size-3 text-accent" />
                                <span className="font-medium text-accent-foreground">Pro Plan</span>
                            </>
                        ) : (
                            <>
                                <CreditCard className="size-3 text-muted-foreground" />
                                <span className="font-mono text-muted-foreground">
                                    {usage.projectCount}/3 projects
                                </span>
                                {usage.canCreateMore ? (
                                    <span className="text-accent text-[11px] font-mono">
                                        ({usage.projectsRemaining} left)
                                    </span>
                                ) : (
                                    <span className="text-attention text-[11px]">
                                        (Limit reached)
                                    </span>
                                )}
                            </>
                        )}
                    </Link>
                    <CommandTrigger />
                    {/* <ThemeToggle /> */}
                </div>
            </div>

            {/* Greeting */}
            <div>
                <h1 className="text-xl font-semibold">Welcome, {session.user.name ?? session.user.email}</h1>
                <p className="text-sm text-muted">Here is an overview of your active projects.</p>
            </div>

            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-medium">Your Projects</h2>
                        <Link
                            href="/dashboard/projects"
                            className="text-xs text-muted hover:text-ink transition-colors font-mono"
                        >
                            View all ({projects.length})
                        </Link>
                    </div>
                    <NewProjectDialog
                        triggerText="New Project"
                        canCreateMore={usage.canCreateMore}
                        projectsRemaining={usage.projectsRemaining}
                        isPro={usage.isPro}
                    />
                </div>

                {projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center rounded border border-dashed border-border bg-paper space-y-4">
                        <p className="text-sm text-muted">No projects found. Create your first project to get started.</p>
                        <NewProjectDialog
                            triggerText="Create Project"
                            canCreateMore={usage.canCreateMore}
                            projectsRemaining={usage.projectsRemaining}
                            isPro={usage.isPro}
                        />
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/dashboard/projects/${project.slug}`}
                                className="block p-4 rounded border border-border bg-paper hover:border-ink transition-colors"
                            >
                                <div className="flex justify-between items-center">
                                    <p className="font-medium text-base">{project.name}</p>
                                    <OpenTaskBadge projectId={project.id} />
                                </div>
                                <p className="font-mono text-xs mt-1 text-muted">/{project.slug}</p>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}