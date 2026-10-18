import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db"
import z from "zod";

const createProjectSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
});

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const projects = await db.project.findMany({
        where: {
            userId: session.user.id
        },
        orderBy: { createdAt: "desc" }
    })


    return NextResponse.json(projects)
}


export async function POST(request: NextRequest) {
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await request.json()
    const result = createProjectSchema.safeParse(body)

    if (!result.success) {
        return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 })
    }

    const project = await db.project.create({
        data: {
            ...result.data,
            userId: session.user.id
        }
    })



    return NextResponse.json(project, { status: 201 })
}