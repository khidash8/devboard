// app/dashboard/projects/[slug]/new-task-form.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema, type TaskFormValues } from '@/lib/schemas/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createTask } from './actions';

export function NewTaskForm({ projectId }: { projectId: string }) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<TaskFormValues>({
        resolver: zodResolver(taskSchema),
        defaultValues: { priority: 'medium' },
    });

    async function onSubmit(data: TaskFormValues) {
        const result = await createTask(projectId, data);
        if (result.success) reset();
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 border border-border rounded p-4">
            <div className="space-y-1">
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...register('title')} aria-invalid={!!errors.title} />
                {errors.title && <p className="text-sm text-attention" role="alert">{errors.title.message}</p>}
            </div>

            <div className="space-y-1">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register('description')} />
            </div>

            <div className="space-y-1">
                <Label htmlFor="priority">Priority</Label>
                <select id="priority" {...register('priority')} className="h-9 rounded border border-border bg-paper px-2 text-sm w-full">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
            </div>

            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding…' : 'Add task'}
            </Button>
        </form>
    );
}