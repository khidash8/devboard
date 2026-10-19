// app/dashboard/projects/[slug]/task-row.tsx

import { Task } from "@/generated/prisma/client";

const STATUS_STYLES: Record<string, string> = {
    todo: 'border-l-border',
    in_progress: 'border-l-accent',
    done: 'border-l-accent bg-accent-muted',
};

export function TaskRow({ task }: { task: Task }) {
    return (
        <div className={`flex items-center justify-between p-4 border-l-4 ${STATUS_STYLES[task.status]}`}>
            <div>
                <p className="text-base">{task.title}</p>
                {task.dueDate && (
                    <p className="font-mono text-xs text-muted">
                        Due {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(task.dueDate)}
                    </p>
                )}
            </div>
            <span className="font-mono text-xs text-muted uppercase">{task.priority}</span>
        </div>
    );
}