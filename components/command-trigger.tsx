// components/command-trigger.tsx
'use client';
import { useCommandPalette } from '@/lib/use-command-palette';

export function CommandTrigger() {
    // Selects ONLY the open function — this component never re-renders when isOpen itself changes,
    // because it never reads that value at all
    const open = useCommandPalette((state) => state.open);

    return (
        <button onClick={open} className="text-sm text-muted font-mono">
            ⌘K
        </button>
    );
}