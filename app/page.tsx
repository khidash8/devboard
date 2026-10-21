import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';

const PALETTE_TOKENS = [
  { name: 'paper', bgClass: 'bg-paper' },
  { name: 'ink', bgClass: 'bg-ink' },
  { name: 'accent', bgClass: 'bg-accent' },
  { name: 'accent-muted', bgClass: 'bg-accent-muted' },
  { name: 'muted', bgClass: 'bg-muted' },
  { name: 'attention', bgClass: 'bg-attention' },
  { name: 'attention-muted', bgClass: 'bg-attention-muted' },
  { name: 'border', bgClass: 'bg-border' },
];

export default function CheckpointPage() {
  return (
    <main className="min-h-screen p-8 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h1 className="text-xl font-semibold">DevBoard — Design System Checkpoint</h1>
        <ThemeToggle />
      </div>

      <section className="flex flex-wrap gap-4">
        {PALETTE_TOKENS.map(({ name, bgClass }) => (
          <div key={name} className="space-y-1">
            <div className={`h-12 w-12 rounded border border-border ${bgClass}`} />
            <p className="font-mono text-xs">{name}</p>
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <p className="text-base">Body text in IBM Plex Sans, at DevBoard&apos;s base size.</p>
        <p className="font-mono text-sm">TASK-1042 · font-mono, reserved for genuinely data-like content</p>
      </section>

      <div className="flex gap-3">
        <Link href={'/dashboard'}><Button>Dashboard</Button></Link>
        <Link href={'/dashboard/projects'}><Button variant="outline">Projetcs</Button></Link>
      </div>
    </main>
  );
}