'use server'

import prisma from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

// ✅ Create Post + log
export async function createPost(data) {
    const { userId, orgId } = await auth()
    if (!userId || !orgId) throw new Error('Unauthorized')

    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } })
    if (!user) throw new Error('User not found')
    if (!data.title || !data.content) throw new Error('Missing required fields')

    try {
        const post = await prisma.orgPost.create({
            data: {
                title: data.title,
                content: data.content,
                image: data.image || null,
                link: data.link || null,
                authorId: user.id,
                orgId,
            },
        })

        await prisma.activityLog.create({
            data: {
                message: `Created post "${post.title}"`,
                type: 'CREATED',
                user: { connect: { id: user.id } },
            },
        })

        return post
    } catch (error) {
        throw new Error('Error creating post: ' + error.message)
    }
}

// ✅ Get Posts for current org
export async function getPosts(orgId) {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } })
    if (!user) throw new Error('User not found')

    try {
        const posts = await prisma.orgPost.findMany({
            where: { orgId },
            orderBy: { createdAt: 'desc' },
            include: {
                author: true,
                comments: true,
                votes: true,
            },
        })
        return posts
    } catch (error) {
        throw new Error('Error getting posts: ' + error.message)
    }
}

// ✅ Get Single Post by ID
export async function getPost(postId) {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const post = await prisma.orgPost.findUnique({
        where: { id: postId },
        include: {
            author: true,
            votes: {
                include: {
                    user: {
                        select: { id: true, clerkUserId: true, name: true, imageUrl: true },
                    },
                },
            },
            comments: {
                where: { parentId: null },
                orderBy: { createdAt: 'asc' },
                include: {
                    author: true,
                    votes: {
                        include: {
                            user: { select: { id: true, clerkUserId: true, name: true, imageUrl: true } },
                        },
                    },
                    children: {
                        orderBy: { createdAt: 'asc' },
                        include: {
                            author: true,
                            votes: {
                                include: {
                                    user: { select: { id: true, clerkUserId: true, name: true, imageUrl: true } },
                                },
                            },
                        },
                    },
                },
            },
        },
    })

    return post // null if not found
}

// ✅ Edit Post + log
export async function editPost(postId, updatedData) {
    const { userId, orgId } = await auth()
    if (!userId || !orgId) throw new Error('Unauthorized')

    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } })
    if (!user) throw new Error('User not found')

    const existingPost = await prisma.orgPost.findUnique({ where: { id: postId } })
    if (!existingPost) throw new Error('Post not found')
    if (existingPost.authorId !== user.id) throw new Error('Only the author can edit this post')

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

        await prisma.activityLog.create({
            data: {
                message: `Updated post "${updatedPost.title}"`,
                type: 'UPDATED',
                user: { connect: { id: user.id } },
            },
        })

        return updatedPost
    } catch (error) {
        throw new Error('Failed to update post: ' + error.message)
    }
}

// ✅ Delete Post + log (fix author check using app user id)
export async function deletePost(postId) {
    const { userId, orgId, orgRole } = await auth()
    if (!userId || !orgId) throw new Error('Unauthorized')

    const dbUser = await prisma.user.findUnique({ where: { clerkUserId: userId } })
    if (!dbUser) throw new Error('User not found')

    const existingPost = await prisma.orgPost.findUnique({ where: { id: postId } })
    if (!existingPost) throw new Error('Post not found')

    const isAuthor = existingPost.authorId === dbUser.id
    const isOrgAdmin = orgRole === 'org:admin'
    if (!isAuthor && !isOrgAdmin) throw new Error('Only the post author or org admin can delete this post')

    try {
        await prisma.activityLog.create({
            data: {
                message: `Deleted post "${existingPost.title}"`,
                type: 'DELETED',
                user: { connect: { id: dbUser.id } },
            },
        })

        await prisma.orgPost.delete({ where: { id: postId } })
        return { success: true }
    } catch (error) {
        throw new Error('Failed to delete post: ' + error.message)
    }
}

// ✅ Upvote / Downvote Post + log
export async function votePost({ postId, value }) {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } })
    if (!user) throw new Error('User not found')
    if (![1, -1].includes(value)) throw new Error('Invalid vote value. Must be 1 or -1')

    const post = await prisma.orgPost.findUnique({ where: { id: postId }, select: { title: true } })

    try {
        const existingVote = await prisma.postVote.findUnique({
            where: { postId_userId: { postId, userId: user.id } },
        })

        if (!existingVote) {
            await prisma.postVote.create({ data: { postId, userId: user.id, value } })
            await prisma.activityLog.create({
                data: {
                    message: `${value === 1 ? 'Upvoted' : 'Downvoted'} post "${post?.title ?? ''}"`,
                    type: 'UPDATED',
                    user: { connect: { id: user.id } },
                },
            })
        } else if (existingVote.value === value) {
            await prisma.postVote.delete({ where: { postId_userId: { postId, userId: user.id } } })
            await prisma.activityLog.create({
                data: {
                    message: `Removed ${value === 1 ? 'upvote' : 'downvote'} on post "${post?.title ?? ''}"`,
                    type: 'UPDATED',
                    user: { connect: { id: user.id } },
                },
            })
        } else {
            await prisma.postVote.update({
                where: { postId_userId: { postId, userId: user.id } },
                data: { value },
            })
            await prisma.activityLog.create({
                data: {
                    message: `Changed vote to ${value === 1 ? 'upvote' : 'downvote'} on post "${post?.title ?? ''}"`,
                    type: 'UPDATED',
                    user: { connect: { id: user.id } },
                },
            })
        }

        return { success: true }
    } catch (error) {
        throw new Error('Failed to vote on post: ' + error.message)
    }
}

// ✅ Add a comment + log
export async function addComment(input) {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } })
    if (!user) throw new Error('User not found')
    if (!input?.content?.trim()) throw new Error('Empty comment')

    const post = await prisma.orgPost.findUnique({ where: { id: input.postId }, select: { title: true } })

    const created = await prisma.postComment.create({
        data: {
            content: input.content,
            postId: input.postId,
            parentId: input.parentId ?? null,
            authorId: user.id,
        },
        include: {
            author: true,
            votes: {
                include: {
                    user: { select: { id: true, clerkUserId: true, name: true, imageUrl: true } },
                },
            },
            children: { include: { author: true } },
        },
    })

    await prisma.activityLog.create({
        data: {
            message: `Commented on post "${post?.title ?? ''}"`,
            type: 'COMMENTED',
            user: { connect: { id: user.id } },
        },
    })

    return created
}

// ✅ Recursively delete a comment and all descendants
async function cascadeDeleteComment(id) {
    const children = await prisma.postComment.findMany({ where: { parentId: id }, select: { id: true } })
    for (const c of children) {
        await cascadeDeleteComment(c.id)
    }
    await prisma.postComment.delete({ where: { id } })
}

// ✅ Delete a comment + log
export async function deleteComment(commentId) {
    const { userId, orgRole } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } })
    if (!user) throw new Error('User not found')

    const comment = await prisma.postComment.findUnique({
        where: { id: commentId },
        include: { post: { select: { id: true, title: true } } },
    })
    if (!comment) throw new Error('Comment not found')

    const isAuthor = comment.authorId === user.id
    const isOrgAdmin = orgRole === 'org:admin'
    if (!isAuthor && !isOrgAdmin) throw new Error('Forbidden')

    await cascadeDeleteComment(commentId)

    await prisma.activityLog.create({
        data: {
            message: `Deleted comment on post "${comment.post?.title ?? ''}"`,
            type: 'DELETED',
            user: { connect: { id: user.id } },
        },
    })

    return { success: true }
}
