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
export async function getPosts(orgId) {
    const { userId, orgId: currentOrgId } = await auth();

    if (!userId || !orgId) throw new Error("Unauthorized");

    if (orgId !== currentOrgId) {
        throw new Error("Invalid organization access");
    }

    const user = await prisma.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    try {
        const posts = await prisma.orgPost.findMany({
            where: {
                project: {
                    organizationId: orgId,
                },
            },
            orderBy: { createdAt: "desc" },
            include: {
                author: true,
                project: true,
                comments: true,
                votes: true,
            },
        });

        return posts;
    } catch (error) {
        throw new Error("Error getting posts: " + error.message);
    }
}

export async function editPost(postId, updatedData) {
    const { userId, orgId: currentOrgId } = await auth();
    if (!userId || !currentOrgId) throw new Error("Unauthorized");

    const existingPost = await prisma.orgPost.findUnique({
        where: { id: postId },
        include: { project: true },
    });

    if (!existingPost) throw new Error("Post not found");

    if (existingPost.project.organizationId !== currentOrgId) {
        throw new Error("Unauthorized organization access");
    }

    if (existingPost.authorId !== userId) {
        throw new Error("Only the author can edit this post");
    }

    try {
        const updatedPost = await prisma.orgPost.update({
            where: { id: postId },
            data: {
                title: updatedData.title,
                content: updatedData.content,
                image: updatedData.image || null,
                link: updatedData.link || null,
                updatedAt: new Date(),
            },
        });

        return updatedPost;
    } catch (error) {
        throw new Error("Failed to update post: " + error.message);
    }
}

export async function deletePost(postId) {
    const { userId, orgId: currentOrgId } = await auth();
    if (!userId || !currentOrgId) throw new Error("Unauthorized");

    const existingPost = await prisma.orgPost.findUnique({
        where: { id: postId },
        include: { project: true },
    });

    if (!existingPost) throw new Error("Post not found");

    if (existingPost.project.organizationId !== currentOrgId) {
        throw new Error("Unauthorized organization access");
    }

    if (existingPost.authorId !== userId) {
        throw new Error("Only the author can delete this post");
    }

    try {
        await prisma.orgPost.delete({
            where: { id: postId },
        });

        return { success: true };
    } catch (error) {
        throw new Error("Failed to delete post: " + error.message);
    }
}