import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { db } from '@/lib/db';
import Link from 'next/link';

export const instant = false;

export default async function DashboardPage() {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) redirect('/sign-in');

    const projects = await db.project.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <main className="p-8 space-y-6">
            <h1 className="text-xl font-semibold">Welcome, {session.user.name ?? session.user.email}</h1>

            <section className="space-y-4">
                <h2 className="text-lg font-medium">Your Projects</h2>
                {projects.length === 0 ? (
                    <p className="text-sm text-muted">No projects found.</p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/dashboard/projects/${project.slug}`}
                                className="block p-4 rounded border border-border bg-paper hover:border-ink transition-colors"
                            >
                                <p className="font-medium text-base">{project.name}</p>
                                <p className="font-mono text-xs mt-1">{project.slug}</p>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* DEBUG: add a visible way to check */}
            {/* <pre style={{ background: 'var(--color-surface)', padding: '1rem', marginTop: '1rem' }}>
                {JSON.stringify(session, null, 2)}
            </pre> */}
        </main>
    );
}