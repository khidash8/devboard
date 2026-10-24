// app/dashboard/billing/page.tsx
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Sparkles, FolderKanban, ShieldCheck, AlertCircle } from 'lucide-react';
import { getSubscriptionUsage } from '@/lib/limits';
import { UpgradeButton } from './upgrade-button';
import { CancelSubscriptionButton } from './cancel-button';

export const instant = false;

export default async function BillingPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect('/sign-in');

    const usage = await getSubscriptionUsage(session.user.id);

    const percentUsed = usage.isPro
        ? 100
        : Math.min(100, Math.round((usage.projectCount / (usage.projectLimit || 3)) * 100));

    return (
        <main className="max-w-4xl mx-auto p-8 space-y-8">
            {/* Top Navigation */}
            <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/projects"
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-ink transition-colors"
                    >
                        <ArrowLeft className="size-3.5" />
                        <span>Projects</span>
                    </Link>
                    <span className="text-muted-foreground/30">•</span>
                    <Link
                        href="/dashboard"
                        className="text-xs text-muted-foreground hover:text-ink transition-colors"
                    >
                        Dashboard
                    </Link>
                </div>

                <div className="flex items-center gap-2">
                    {usage.isPro ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-accent-muted text-accent-foreground border border-accent/20">
                            <Sparkles className="size-3" />
                            Pro Plan
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-muted text-muted-foreground border border-border">
                            Free Tier
                        </span>
                    )}
                </div>
            </div>

            {/* Header */}
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">Subscription & Billing</h1>
                <p className="text-sm text-muted-foreground">
                    Manage your plan, monitor your workspace limits, and control recurring billing.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Plan Card */}
                <div className="p-6 rounded border border-border bg-paper space-y-6 flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                                    Current Plan
                                </span>
                                <h2 className="text-xl font-semibold mt-1">
                                    {usage.isPro ? 'DevBoard Pro' : 'Free Plan'}
                                </h2>
                            </div>
                            <span
                                className={`text-xs px-2.5 py-1 rounded font-medium ${
                                    usage.isPro
                                        ? 'bg-accent-muted text-accent-foreground'
                                        : 'bg-muted text-muted-foreground'
                                }`}
                            >
                                {usage.isPro ? 'Active' : usage.status === 'canceled' ? 'Canceled' : 'Active'}
                            </span>
                        </div>

                        <div className="pt-2 border-t border-border/50">
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-semibold">
                                    {usage.isPro ? '₹499' : '₹0'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {usage.isPro ? '/ month' : '/ forever'}
                                </span>
                            </div>
                            {usage.isPro && usage.currentPeriodEnd && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Next billing cycle:{' '}
                                    <span className="font-medium text-ink">
                                        {new Date(usage.currentPeriodEnd).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </p>
                            )}
                            {usage.subscriptionId && (
                                <p className="text-[11px] font-mono text-muted-foreground/80 mt-1 truncate">
                                    Sub ID: {usage.subscriptionId}
                                </p>
                            )}
                        </div>

                        <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                            <li className="flex items-center gap-2">
                                <Check className="size-3.5 text-accent" />
                                <span>{usage.isPro ? 'Unlimited projects' : 'Up to 3 projects'}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="size-3.5 text-accent" />
                                <span>Unlimited task boards and milestones</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="size-3.5 text-accent" />
                                <span>Full activity logging & keyboard command palette</span>
                            </li>
                            {usage.isPro && (
                                <li className="flex items-center gap-2 text-accent-foreground font-medium">
                                    <ShieldCheck className="size-3.5 text-accent" />
                                    <span>Priority support & early feature access</span>
                                </li>
                            )}
                        </ul>
                    </div>

                    <div className="pt-4 border-t border-border">
                        {usage.isPro ? (
                            <CancelSubscriptionButton
                                className="w-full"
                                variant="outline"
                            />
                        ) : (
                            <UpgradeButton
                                className="w-full"
                                label="Upgrade to Pro (₹499/mo)"
                            />
                        )}
                    </div>
                </div>

                {/* Quota & Usage Card */}
                <div className="p-6 rounded border border-border bg-paper space-y-6 flex flex-col justify-between">
                    <div className="space-y-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                                    Resource Usage
                                </span>
                                <h2 className="text-xl font-semibold mt-1">Projects Quota</h2>
                            </div>
                            <div className="p-2 rounded bg-muted/60 text-muted-foreground">
                                <FolderKanban className="size-5" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Projects Created</span>
                                <span className="font-semibold font-mono">
                                    {usage.projectCount} {usage.isPro ? 'projects' : `/ ${usage.projectLimit}`}
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${
                                        usage.isPro
                                            ? 'bg-accent w-full'
                                            : percentUsed >= 100
                                            ? 'bg-attention'
                                            : 'bg-accent'
                                    }`}
                                    style={{ width: `${percentUsed}%` }}
                                />
                            </div>
                        </div>

                        <div className="p-3.5 rounded border border-border/80 bg-paper/60 space-y-2 text-xs">
                            {usage.isPro ? (
                                <div className="flex items-start gap-2 text-ink">
                                    <Sparkles className="size-4 text-accent shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Unlimited Workspace</p>
                                        <p className="text-muted-foreground mt-0.5">
                                            You are on the Pro tier. Create as many projects and boards as you need without restrictions.
                                        </p>
                                    </div>
                                </div>
                            ) : usage.canCreateMore ? (
                                <div className="flex items-start gap-2 text-ink">
                                    <FolderKanban className="size-4 text-accent shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium">
                                            {usage.projectsRemaining}{' '}
                                            {usage.projectsRemaining === 1 ? 'project' : 'projects'} remaining
                                        </p>
                                        <p className="text-muted-foreground mt-0.5">
                                            You can create {usage.projectsRemaining} more {usage.projectsRemaining === 1 ? 'project' : 'projects'} under your Free plan.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-2 text-attention">
                                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Free plan limit reached (3/3)</p>
                                        <p className="text-muted-foreground mt-0.5">
                                            You have used all 3 available project slots on the Free plan. Upgrade to Pro for unlimited project creation.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                        <Link
                            href="/dashboard/projects"
                            className="inline-flex items-center justify-center w-full px-4 py-2 text-xs font-medium rounded border border-border bg-paper hover:bg-muted/50 transition-colors"
                        >
                            View All Projects
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
