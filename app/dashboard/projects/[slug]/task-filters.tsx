'use client';
import { useTransition } from 'react';
import { useQueryState, parseAsStringEnum, parseAsString, debounce } from 'nuqs';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

export function TaskFilters() {
    const [isPending, startTransition] = useTransition();

    const [status, setStatus] = useQueryState(
        'status',
        parseAsStringEnum(['all', 'todo', 'in_progress', 'done'])
            .withDefault('all')
            .withOptions({ shallow: false, startTransition })
    );
    const [priority, setPriority] = useQueryState(
        'priority',
        parseAsStringEnum(['all', 'low', 'medium', 'high'])
            .withDefault('all')
            .withOptions({ shallow: false, startTransition })
    );
    const [search, setSearch] = useQueryState(
        'q',
        parseAsString
            .withDefault('')
            .withOptions({ shallow: false, startTransition, limitUrlUpdates: debounce(300) })
    );

    return (
        <div className="flex gap-3 items-center">
            <select
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="h-9 rounded border border-border bg-paper px-2 text-sm"
            >
                <option value="all">All statuses</option>
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
            </select>

            <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as typeof priority)}
                className="h-9 rounded border border-border bg-paper px-2 text-sm"
            >
                <option value="all">All priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
            </select>

            <Input
                placeholder="Search tasks…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs"
            />

            {isPending && (
                <Loader2 className="h-4 w-4 animate-spin" aria-label="Loading..." />
            )}
        </div>
    );
}