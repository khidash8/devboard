import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FolderKanban, ArrowLeft, ArrowUpRight } from 'lucide-react';

import { db } from '@/lib/db';
import { OpenTaskBadge } from '../project-sidebar';
import { NewProjectDialog } from '@/components/new-project-dialog';
import { ThemeToggle } from '@/components/theme-toggle';
import { CommandTrigger } from '@/components/command-trigger';
import { UpgradeButton } from '../billing/upgrade-button';

export const instant = false;

export default async function ProjectsIndexPage() {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) redirect('/sign-in');

    const projects = await db.project.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <main className="max-w-6xl mx-auto p-8 space-y-8">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between border-b border-border pb-4">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors"
                >
                    <ArrowLeft className="size-3.5" />
                    <span>Dashboard</span>
                </Link>
                <div className="flex items-center gap-3">
                    <CommandTrigger />
                    {/* <ThemeToggle /> */}
                </div>

                <UpgradeButton />
            </div>

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold">Projects</h1>
                    <p className="text-sm text-muted">
                        Manage your projects, workspaces, and task boards.
                    </p>
                </div>
                <NewProjectDialog triggerText="New Project" />
            </div>

            {/* Projects Grid / Empty State */}
            {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center rounded border border-dashed border-border bg-paper space-y-4">
                    <div className="p-3 rounded-full bg-accent-muted text-accent-foreground">
                        <FolderKanban className="size-6" />
                    </div>
                    <div className="space-y-1 max-w-sm">
                        <h2 className="text-base font-medium">No projects yet</h2>
                        <p className="text-xs text-muted">
                            Projects help you organize tasks, track status, and manage deliverables.
                        </p>
                    </div>
                    <NewProjectDialog triggerText="Create your first project" size="default" />
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <Link
                            key={project.id}
                            href={`/dashboard/projects/${project.slug}`}
                            className="group relative block p-5 rounded border border-border bg-paper hover:border-ink transition-all hover:shadow-xs space-y-3"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <h2 className="font-medium text-base group-hover:text-primary transition-colors truncate">
                                    {project.name}
                                </h2>
                                <OpenTaskBadge projectId={project.id} />
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                                <span className="font-mono text-muted group-hover:text-ink transition-colors">
                                    /{project.slug}
                                </span>
                                <span className="inline-flex items-center gap-0.5 text-muted group-hover:text-ink transition-colors">
                                    <span>View tasks</span>
                                    <ArrowUpRight className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </span>
                            </div>
                        </Link>
                    ))}

                    {/* Quick Add Card */}
                    <div className="flex items-center justify-center p-6 rounded border border-dashed border-border bg-paper/50 hover:bg-paper hover:border-ink transition-colors">
                        <NewProjectDialog
                            triggerText="Add another project"
                            variant="ghost"
                            size="sm"
                            className="w-full h-full"
                        />
                    </div>
                </div>
            )}
        </main>
    );
}
