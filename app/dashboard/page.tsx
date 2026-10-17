import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const instant = false;

export default async function DashboardPage() {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) redirect('/sign-in');

    return (
        <main className="p-8">
            <h1 className="text-xl font-semibold">Welcome, {session.user.name ?? session.user.email}</h1>
            {/* DEBUG: add a visible way to check */}
            <pre style={{ background: 'var(--color-surface)', padding: '1rem', marginTop: '1rem' }}>
                {JSON.stringify(session, null, 2)}
            </pre>
        </main>
    );
}