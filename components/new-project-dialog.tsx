// components/new-project-dialog.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Loader2 } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { projectSchema, generateSlug, type ProjectFormValues } from '@/lib/schemas/project';
import { createProject } from '@/app/dashboard/projects/actions';

interface NewProjectDialogProps {
    triggerText?: string;
    variant?: 'default' | 'outline' | 'secondary' | 'ghost';
    size?: 'default' | 'xs' | 'sm' | 'lg';
    className?: string;
    showIcon?: boolean;
}

export function NewProjectDialog({
    triggerText = 'New Project',
    variant = 'default',
    size = 'sm',
    className,
    showIcon = true,
}: NewProjectDialogProps) {
    const [open, setOpen] = React.useState(false);
    const [serverError, setServerError] = React.useState<string | null>(null);
    const [isCustomSlug, setIsCustomSlug] = React.useState(false);
    const router = useRouter();
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ProjectFormValues>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            name: '',
            slug: '',
        },
    });

    const watchedName = watch('name');
    const watchedSlug = watch('slug');

    // Auto-generate slug when name changes, unless user manually edited slug
    React.useEffect(() => {
        if (!isCustomSlug && watchedName !== undefined) {
            setValue('slug', generateSlug(watchedName), { shouldValidate: !!watchedName });
        }
    }, [watchedName, isCustomSlug, setValue]);

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            reset();
            setServerError(null);
            setIsCustomSlug(false);
        }
    };

    const onSubmit = async (data: ProjectFormValues) => {
        setServerError(null);
        try {
            const res = await createProject(data);
            if (!res.success) {
                setServerError(res.error);
                return;
            }

            // Invalidate React Query projects cache so Command Palette updates immediately
            await queryClient.invalidateQueries({ queryKey: ['projects'] });

            setOpen(false);
            reset();
            setIsCustomSlug(false);

            // Navigate user directly to their new project's board
            router.push(`/dashboard/projects/${res.project.slug}`);
            router.refresh();
        } catch {
            setServerError('An unexpected error occurred while creating the project.');
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger
                render={
                    <Button variant={variant} size={size} className={className}>
                        {showIcon && <Plus className="size-3.5" />}
                        <span>{triggerText}</span>
                    </Button>
                }
            />
            <DialogContent className="sm:max-w-md bg-paper border border-border">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold tracking-normal normal-case">
                        Create New Project
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted">
                        Set up a workspace to organize your tasks and milestones.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
                    {serverError && (
                        <div
                            className="p-3 text-xs rounded border border-attention/30 bg-attention/10 text-attention"
                            role="alert"
                        >
                            {serverError}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="project-name" className="text-xs font-medium">
                            Project Name
                        </Label>
                        <Input
                            id="project-name"
                            placeholder="e.g. Website Redesign"
                            className="h-9 text-sm"
                            {...register('name')}
                            aria-invalid={!!errors.name}
                            autoFocus
                        />
                        {errors.name && (
                            <p className="text-xs text-attention" role="alert">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="project-slug" className="text-xs font-medium">
                                Project Slug
                            </Label>
                            {isCustomSlug && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCustomSlug(false);
                                        setValue('slug', generateSlug(watchedName || ''), { shouldValidate: true });
                                    }}
                                    className="text-[11px] text-muted hover:text-ink underline"
                                >
                                    Auto-generate
                                </button>
                            )}
                        </div>
                        <Input
                            id="project-slug"
                            placeholder="e.g. website-redesign"
                            className="h-9 font-mono text-xs"
                            {...register('slug', {
                                onChange: () => setIsCustomSlug(true),
                            })}
                            aria-invalid={!!errors.slug}
                        />
                        {errors.slug ? (
                            <p className="text-xs text-attention" role="alert">
                                {errors.slug.message}
                            </p>
                        ) : (
                            <p className="text-[11px] font-mono text-muted">
                                /dashboard/projects/{watchedSlug || 'your-slug'}
                            </p>
                        )}
                    </div>

                    <DialogFooter className="pt-2 gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="size-3.5 animate-spin" />
                                    <span>Creating…</span>
                                </>
                            ) : (
                                <span>Create Project</span>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
