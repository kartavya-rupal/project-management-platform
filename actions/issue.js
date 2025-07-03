"use server"

import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function createIssue(projectId, data) {
    const { userId, orgId } = await auth()
    if (!userId || !orgId) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({
        where: { clerkUserId: userId },
    })
    if (!user) throw new Error("User not found")

    const lastIssue = await prisma.issue.findFirst({
        where: { projectId, status: data.status },
        orderBy: { order: "desc" },
    })

    const newOrder = lastIssue ? lastIssue.order + 1 : 0

    const issue = await prisma.issue.create({
        data: {
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            projectId,
            sprintId: data.sprintId,
            reporterId: user.id,
            assigneeId: data.assigneeId || null,
            order: newOrder,
        },
        include: {
            assignee: true,
            reporter: true,
        },
    })

    await prisma.activityLog.create({
        data: {
            message: `Created issue "${issue.title}"`,
            type: "CREATED",
            user: { connect: { id: user.id } },
            issue: { connect: { id: issue.id } },
            project: { connect: { id: projectId } },
            ...(issue.sprintId && { sprint: { connect: { id: issue.sprintId } } }),
        },
    })

    return issue
}

export async function getIssuesForSprint(sprintId) {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    const issues = await prisma.issue.findMany({
        where: { sprintId },
        orderBy: [{ status: "asc" }, { order: "asc" }],
        include: {
            assignee: true,
            reporter: true,
        },
    })

    return issues
}

export async function updateIssueOrderStatus(updatedIssues) {
    const { userId, orgId } = await auth()
    if (!userId || !orgId) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({
        where: { clerkUserId: userId },
    })
    if (!user) throw new Error("User not found")

    // First update all issues inside a transaction
    await prisma.$transaction(async (tx) => {
        for (const issue of updatedIssues) {
            await tx.issue.update({
                where: { id: issue.id },
                data: {
                    status: issue.status,
                    order: issue.order,
                },
            })
        }
    })

    // Then log the activity outside the transaction
    const activityLogData = updatedIssues.map((issue) => ({
        message: `Moved issue "${issue.title}" to ${issue.status}`,
        type: "MOVED",
        user: { connect: { id: user.id } },
        issue: { connect: { id: issue.id } },
        project: { connect: { id: issue.projectId } },
        ...(issue.sprintId && { sprint: { connect: { id: issue.sprintId } } }),
    }))

    // Create all logs in parallel
    await Promise.all(
        activityLogData.map((logData) => prisma.activityLog.create({ data: logData }))
    )

    return { success: true }
}
  

export async function updateIssue(issueId, data) {
    const { userId, orgId } = await auth()
    if (!userId || !orgId) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({
        where: { clerkUserId: userId },
    })
    if (!user) throw new Error("User not found")

    try {
        const issue = await prisma.issue.findUnique({
            where: { id: issueId },
            include: { project: true },
        })

        if (!issue) throw new Error("Issue not found")
        if (issue.project.organizationId !== orgId) throw new Error("Unauthorized")

        const updatedIssue = await prisma.issue.update({
            where: { id: issueId },
            data: {
                status: data.status,
                priority: data.priority,
            },
            include: {
                assignee: true,
                reporter: true,
            },
        })

        await prisma.activityLog.create({
            data: {
                message: `Updated issue "${updatedIssue.title}"`,
                type: "UPDATED",
                user: { connect: { id: user.id } },
                issue: { connect: { id: updatedIssue.id } },
                project: { connect: { id: updatedIssue.projectId } },
                ...(updatedIssue.sprintId && { sprint: { connect: { id: updatedIssue.sprintId } } }),
            },
        })

        return updatedIssue
    } catch (error) {
        throw new Error("Error updating issue: " + error.message)
    }
}

export async function deleteIssue(issueId) {
    const { userId, orgId } = await auth()
    if (!userId || !orgId) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({
        where: { clerkUserId: userId },
    })
    if (!user) throw new Error("User not found")

    try {
        const issue = await prisma.issue.findUnique({
            where: { id: issueId },
            include: { project: true },
        })

        if (!issue) throw new Error("Issue not found")
        if (
            issue.reporterId !== user.id &&
            (!issue.project || !issue.project.adminIds?.includes(user.id))
        ) {
            throw new Error("You are not authorized to delete this issue")
        }

        await prisma.activityLog.create({
            data: {
                message: `Deleted issue "${issue.title}"`,
                type: "DELETED",
                user: { connect: { id: user.id } },
                issue: { connect: { id: issue.id } },
                project: { connect: { id: issue.projectId } },
                ...(issue.sprintId && { sprint: { connect: { id: issue.sprintId } } }),
            },
        })
        
        await prisma.issue.delete({
            where: { id: issueId },
        })

        

        return { success: true }
    } catch (error) {
        throw new Error("Error deleting issue: " + error.message)
    }
}
