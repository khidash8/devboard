import { Button } from '@/components/ui/button';

export default function CheckpointPage() {
  return (
    <main className="min-h-screen p-8 space-y-8">
      <h1 className="text-xl font-semibold">DevBoard — Design System Checkpoint</h1>

      <section className="flex gap-4">
        {['paper', 'ink', 'accent', 'accent-muted', 'muted', 'attention', 'attention-muted', 'border'].map((name) => (
          <div key={name} className="space-y-1">
            <div className={`h-12 w-12 rounded border border-border bg-${name}`} />
            <p className="font-mono text-xs text-muted">{name}</p>
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <p className="text-base">Body text in IBM Plex Sans, at DevBoard's base size.</p>
        <p className="font-mono text-sm text-muted">TASK-1042 · font-mono, reserved for genuinely data-like content</p>
      </section>

      <Button>A real, retheme'd shadcn button</Button>
    </main>
  );
}