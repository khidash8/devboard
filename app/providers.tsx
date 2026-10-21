// app/providers.tsx
'use client';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/get-query-client';
import { useCommandPalette } from '@/lib/use-command-palette';
import { useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
    const queryClient = getQueryClient();
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export function CommandPaletteKeyboardListener() {
    const toggle = useCommandPalette((state) => state.toggle);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                toggle();
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggle]);

    return null;
}