// components/command-palette.tsx
'use client';
import { useRouter } from 'next/navigation';
import { CommandDialog, CommandInput, CommandList, CommandGroup, CommandItem, CommandEmpty } from '@/components/ui/command';
import { useCommandPalette } from '@/lib/use-command-palette';

export function CommandPalette() {
    const isOpen = useCommandPalette((state) => state.isOpen);
    const close = useCommandPalette((state) => state.close);
    const setOpen = useCommandPalette((state) => state.setOpen);
    const recentProjects = useCommandPalette((state) => state.recentProjects);
    const router = useRouter();

    function navigateTo(slug: string) {
        close();
        router.push(`/dashboard/projects/${slug}`);
    }

    return (
        <CommandDialog open={isOpen} onOpenChange={setOpen}>
            <CommandInput placeholder="Jump to a project…" />
            <CommandList>
                <CommandEmpty>No projects found.</CommandEmpty>
                {recentProjects.length > 0 && (
                    <CommandGroup heading="Recent">
                        {recentProjects.map((project) => (
                            <CommandItem key={project.id} onSelect={() => navigateTo(project.slug)}>
                                {project.name}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
            </CommandList>
        </CommandDialog>
    );
}