'use client';
import { useOptimistic, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleTaskStatus } from './actions';
import { Task } from '@/generated/prisma/client';

export function TaskRow({ task }: { task: Task }) {
    const queryClient = useQueryClient();
    const router = useRouter();

    const [optimisticStatus, setOptimisticStatus] = useOptimistic(
        task.status,
        (_current, next: string) => next
    );

    const { mutate, isPending } = useMutation({
        mutationFn: (newStatus: string) => toggleTaskStatus(task.id, newStatus),

        onMutate: async (newStatus) => {
            // 1. Cancel any in-flight refetch for this query, so it can't overwrite our optimistic update
            await queryClient.cancelQueries({ queryKey: ['open-task-count', task.projectId] });

            // 2. Snapshot the current cached value, so we have something to roll back to on failure
            const previousCount = queryClient.getQueryData(['open-task-count', task.projectId]);

            // 3. Optimistically update the cache RIGHT NOW, before the server has responded at all
            queryClient.setQueryData(['open-task-count', task.projectId], (old: number = 0) =>
                newStatus === 'done' ? old - 1 : old + 1
            );

            return { previousCount }; // passed to onError below as `context`
        },

        onError: (_err, _newStatus, context) => {
            // 4. Roll back to the snapshot if the mutation actually failed
            if (context?.previousCount !== undefined) {
                queryClient.setQueryData(['open-task-count', task.projectId], context.previousCount);
            }
        },

        onSettled: () => {
            // 5. Always resync with the real server value afterward, success or failure
            queryClient.invalidateQueries({ queryKey: ['open-task-count', task.projectId] });
            router.refresh();
        },
    });

    const isDone = optimisticStatus === 'done';

    return (
        <div className="flex items-center gap-3 p-4">
            <input
                type="checkbox"
                checked={isDone}
                disabled={isPending}
                onChange={() => {
                    const nextStatus = isDone ? 'todo' : 'done';
                    startTransition(() => {
                        setOptimisticStatus(nextStatus);
                        mutate(nextStatus);
                    });
                }}
                className="h-4 w-4 accent-accent"
            />
            <p className={isDone ? 'text-muted line-through' : 'text-base'}>{task.title}</p>
        </div>
    );
}