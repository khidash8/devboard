import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projectSchema } from "@/lib/schemas/project";

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    const projects = await db.project.findMany({
        where: {
            userId: session.user.id,
            ...(q ? {
                OR: [
                    { name: { contains: q, mode: 'insensitive' } },
                    { slug: { contains: q, mode: 'insensitive' } },
                ]
            } : {})
        },
        orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const result = projectSchema.safeParse(body);

    if (!result.success) {
        return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 });
    }

    const existingProject = await db.project.findFirst({
        where: {
            userId: session.user.id,
            slug: result.data.slug,
        },
    });

    if (existingProject) {
        return NextResponse.json(
            { error: `A project with the slug "${result.data.slug}" already exists` },
            { status: 409 }
        );
    }

    const project = await db.project.create({
        data: {
            ...result.data,
            userId: session.user.id
        }
    });

    return NextResponse.json(project, { status: 201 });
}