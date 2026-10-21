'use client';

import * as React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const emptySubscribe = () => () => {};

export function ThemeToggle({ className }: { className?: string }) {
  const isClient = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);

    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  if (!isClient) {
    return (
      <Button
        variant="outline"
        size="xs"
        className={`opacity-0 ${className ?? ''}`}
        aria-hidden="true"
      >
        <span>Theme</span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="xs"
      onClick={toggleTheme}
      className={`flex items-center gap-1.5 font-mono text-xs ${className ?? ''}`}
      aria-label="Toggle light and dark mode"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <>
          <Sun className="h-3.5 w-3.5 text-attention" />
          <span>Light</span>
        </>
      ) : (
        <>
          <Moon className="h-3.5 w-3.5 text-primary" />
          <span>Dark</span>
        </>
      )}
    </Button>
  );
}
