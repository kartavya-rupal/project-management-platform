"use server"

import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

// ✅ Create Post (now projectId removed)
export async function createPost(data) {
    const { userId, orgId } = await auth()

    if (!userId || !orgId) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({
        where: { clerkUserId: userId },
    })

    if (!user) throw new Error("User not found")

    if (!data.title || !data.content) {
        throw new Error("Missing required fields")
    }

    try {
        const post = await prisma.orgPost.create({
            data: {
                title: data.title,
                content: data.content,
                image: data.image || null,
                link: data.link || null,
                authorId: user.id,
                orgId: orgId, // ✅ store org context
            },
        })

        return post
    } catch (error) {
        throw new Error("Error creating post: " + error.message)
    }
}

// ✅ Get Posts for current org
export async function getPosts(orgId) {
    const { userId} = await auth()

    if (!userId) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({
        where: { clerkUserId: userId },
    })

    if (!user) throw new Error("User not found")

    try {
        const posts = await prisma.orgPost.findMany({
            where: { orgId: orgId },
            orderBy: { createdAt: "desc" },
            include: {
                author: true,
                comments: true,
                votes: true,
            },
        })

        return posts
    } catch (error) {
        throw new Error("Error getting posts: " + error.message)
    }
}

// ✅ Edit Post
export async function editPost(postId, updatedData) {
    const { userId, orgId } = await auth()
    if (!userId || !orgId) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({
        where: { clerkUserId: userId },
    })

    if (!user) throw new Error("User not found")

    const existingPost = await prisma.orgPost.findUnique({
        where: { id: postId },
    })

    if (!existingPost) throw new Error("Post not found")

    if (existingPost.authorId !== user.id) {
        throw new Error("Only the author can edit this post")
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
        })

        return updatedPost
    } catch (error) {
        throw new Error("Failed to update post: " + error.message)
    }
}

// ✅ Delete Post
export async function deletePost(postId) {
    const { userId, orgId, orgRole } = await auth()
    if (!userId || !orgId) throw new Error("Unauthorized")

    const existingPost = await prisma.orgPost.findUnique({
        where: { id: postId },
    })

    if (!existingPost) throw new Error("Post not found")

    const isAuthor = existingPost.authorId === userId
    const isOrgAdmin = orgRole === "org:admin"

    if (!isAuthor && !isOrgAdmin) {
        throw new Error("Only the post author or org admin can delete this post")
    }

    try {
        await prisma.orgPost.delete({
            where: { id: postId },
        })

        return { success: true }
    } catch (error) {
        throw new Error("Failed to delete post: " + error.message)
    }
}

// ✅ Upvote / Downvote Post
export async function votePost({ postId, value }) {
    const { userId } = await auth()

    if (!userId) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({
        where: { clerkUserId: userId },
    })

    if (!user) throw new Error("User not found")

    if (![1, -1].includes(value)) {
        throw new Error("Invalid vote value. Must be 1 or -1")
    }

    try {
        const existingVote = await prisma.postVote.findUnique({
            where: {
                postId_userId: {
                    postId,
                    userId: user.id,
                },
            },
        })

        if (!existingVote) {
            // 🔼 No vote yet → create one
            await prisma.postVote.create({
                data: {
                    postId,
                    userId: user.id,
                    value,
                },
            })
        } else if (existingVote.value === value) {
            // ⚠️ Same vote exists → toggle it (remove)
            await prisma.postVote.delete({
                where: {
                    postId_userId: {
                        postId,
                        userId: user.id,
                    },
                },
            })
        } else {
            // 🔁 Opposite vote exists → update it
            await prisma.postVote.update({
                where: {
                    postId_userId: {
                        postId,
                        userId: user.id,
                    },
                },
                data: {
                    value,
                },
            })
        }

        return { success: true }
    } catch (error) {
        throw new Error("Failed to vote on post: " + error.message)
    }
}

