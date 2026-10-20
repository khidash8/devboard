// app/dashboard/project-sidebar.tsx
'use client';
import { useQuery } from '@tanstack/react-query';
import { getOpenTaskCount } from './projects/[slug]/actions';

export function OpenTaskBadge({ projectId }: { projectId: string }) {
    const { data: count } = useQuery({
        queryKey: ['open-task-count', projectId],
        queryFn: () => getOpenTaskCount(projectId),
        refetchInterval: 15_000, // poll every 15 seconds for changes made elsewhere (another tab, a teammate)
    });

    return <span className="font-mono text-xs text-muted">{count ?? '–'} open</span>;
}