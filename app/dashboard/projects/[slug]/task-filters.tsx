'use client';
import { useQueryState, parseAsStringEnum } from 'nuqs';
import { Input } from '@/components/ui/input';

export function TaskFilters() {
    const [status, setStatus] = useQueryState(
        'status',
        parseAsStringEnum(['all', 'todo', 'in_progress', 'done']).withDefault('all')
    );
    const [priority, setPriority] = useQueryState(
        'priority',
        parseAsStringEnum(['all', 'low', 'medium', 'high']).withDefault('all')
    );
    const [search, setSearch] = useQueryState('q', { defaultValue: '', throttleMs: 300 });

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
        </div>
    );
}