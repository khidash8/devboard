// lib/use-command-palette.ts
import { create } from 'zustand';

type Project = { id: string; name: string; slug: string };

type CommandPaletteState = {
    isOpen: boolean;
    recentProjects: Project[];
    open: () => void;
    close: () => void;
    toggle: () => void;
    setOpen: (isOpen: boolean) => void;
    addRecentProject: (project: Project) => void;
};

export const useCommandPalette = create<CommandPaletteState>((set) => ({
    isOpen: false,
    recentProjects: [],

    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    setOpen: (isOpen: boolean) => set({ isOpen }),

    addRecentProject: (project) =>
        set((state) => ({
            recentProjects: [project, ...state.recentProjects.filter((p) => p.id !== project.id)].slice(0, 5),
        })),
}));