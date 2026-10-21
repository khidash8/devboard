'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignInPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    async function handleCredentialSignIn(e: React.FormEvent) {
        e.preventDefault();
        const { error } = await authClient.signIn.email({ email, password });
        if (error) setError(error.message ?? 'Sign-in failed');
        else router.push('/dashboard');
    }

    return (
        <main className="min-h-screen flex items-center justify-center p-8">
            <div className="w-full max-w-sm space-y-6">
                <h1 className="text-xl font-semibold">Sign in to DevBoard</h1>

                <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => authClient.signIn.social({ provider: 'github', callbackURL: '/dashboard' })}
                >
                    Continue with GitHub
                </Button>

                <div className="flex items-center gap-3 text-sm text-muted">
                    <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
                </div>

                <form onSubmit={handleCredentialSignIn} className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    {error && <p className="text-sm text-attention" role="alert">{error}</p>}
                    <Button type="submit" className="w-full">Sign in</Button>
                </form>
            </div>
        </main>
    );
}