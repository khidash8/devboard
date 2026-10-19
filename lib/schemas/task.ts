// lib/schemas/task.ts
import { z } from 'zod';

export const taskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(2000).optional(),
    priority: z.enum(['low', 'medium', 'high']),
    dueDate: z.string().optional(), // a date input submits as a plain string; parsed properly in Section 6
});

export type TaskFormValues = z.infer<typeof taskSchema>;