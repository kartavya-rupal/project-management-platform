"use server"

import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function createPost(data, orgId) {
    const { userId, orgId: currentOrgId } = await auth()

    if (!userId || !orgId) throw new Error("Unauthorized")

    if (orgId !== currentOrgId) {
        throw new Error("Invalid organization access")
    }

    const user = await prisma.user.findUnique({
        where: { clerkUserId: userId },
    })

    if (!user) throw new Error("User not found")

    // Optional validation (but strongly recommended)
    if (!data.title || !data.content || !data.projectId) {
        throw new Error("Missing required fields")
    }

    try {
        const post = await prisma.orgPost.create({
            data: {
                title: data.title,
                content: data.content,
                image: data.image || null,
                link: data.link || null,
                projectId: data.projectId,
                authorId: user.id,
            },
        })

        return post
    } catch (error) {
        throw new Error("Error creating post: " + error.message)
    }
}
