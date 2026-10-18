// app/api/projects/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

async function getOwnedProject(projectId: string, userId: string) {
    return db.project.findFirst({ where: { id: projectId, userId } });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const project = await getOwnedProject(id, session.user.id);

    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(project);
}

const updateProjectSchema = z.object({
    name: z.string().min(1).max(100).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const existing = await getOwnedProject(id, session.user.id);
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = await request.json();
    const result = updateProjectSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });

    const updated = await db.project.update({
        where: { id },
        data: {
            ...(result.data.name !== undefined ? { name: result.data.name } : {}),
        },
    });
    return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const existing = await getOwnedProject(id, session.user.id);
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await db.project.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
}