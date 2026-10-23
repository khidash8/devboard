// components/command-palette.tsx
'use client';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
    CommandDialog,
    CommandInput,
    CommandList,
    CommandGroup,
    CommandItem,
    CommandEmpty,
} from '@/components/ui/command';
import { useCommandPalette } from '@/lib/use-command-palette';

type Project = { id: string; name: string; slug: string };

export function CommandPalette() {
    const isOpen = useCommandPalette((state) => state.isOpen);
    const close = useCommandPalette((state) => state.close);
    const setOpen = useCommandPalette((state) => state.setOpen);
    const recentProjects = useCommandPalette((state) => state.recentProjects);
    const addRecentProject = useCommandPalette((state) => state.addRecentProject);
    const router = useRouter();

    const { data: projects = [], isLoading } = useQuery<Project[]>({
        queryKey: ['projects'],
        queryFn: async () => {
            const res = await fetch('/api/projects');
            if (!res.ok) {
                if (res.status === 401) return [];
                throw new Error('Failed to fetch projects');
            }
            return res.json();
        },
        enabled: isOpen,
    });

    function navigateTo(project: Project) {
        addRecentProject(project);
        close();
        router.push(`/dashboard/projects/${project.slug}`);
    }

    const otherProjects = recentProjects.length > 0
        ? projects.filter((p) => !recentProjects.some((r) => r.id === p.id))
        : projects;

    return (
        <CommandDialog open={isOpen} onOpenChange={setOpen}>
            <CommandInput placeholder="Jump to a project…" />
            <CommandList>
                {isLoading && (
                    <div className="py-6 text-center text-sm text-muted">Loading projects…</div>
                )}
                <CommandEmpty>No projects found.</CommandEmpty>
                <CommandGroup heading="Navigation">
                    <CommandItem
                        value="Dashboard"
                        onSelect={() => {
                            close();
                            router.push('/dashboard');
                        }}
                    >
                        <span>Dashboard</span>
                        <span className="font-mono text-xs text-muted ml-auto">/dashboard</span>
                    </CommandItem>
                    <CommandItem
                        value="All Projects"
                        onSelect={() => {
                            close();
                            router.push('/dashboard/projects');
                        }}
                    >
                        <span>All Projects</span>
                        <span className="font-mono text-xs text-muted ml-auto">/dashboard/projects</span>
                    </CommandItem>
                </CommandGroup>
                {recentProjects.length > 0 && (
                    <CommandGroup heading="Recent">
                        {recentProjects.map((project) => (
                            <CommandItem
                                key={`recent-${project.id}`}
                                value={`${project.name} ${project.slug}`}
                                onSelect={() => navigateTo(project)}
                            >
                                <span>{project.name}</span>
                                <span className="font-mono text-xs text-muted ml-auto">
                                    {project.slug}
                                </span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
                {otherProjects.length > 0 && (
                    <CommandGroup heading="Projects">
                        {otherProjects.map((project) => (
                            <CommandItem
                                key={project.id}
                                value={`${project.name} ${project.slug}`}
                                onSelect={() => navigateTo(project)}
                            >
                                <span>{project.name}</span>
                                <span className="font-mono text-xs text-muted ml-auto">
                                    {project.slug}
                                </span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
            </CommandList>
        </CommandDialog>
    );
}