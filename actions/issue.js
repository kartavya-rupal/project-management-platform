"use server"

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function createIssue(projectId, data) {

    const { userId, orgId } = await auth();
    if (!userId || !orgId) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: {
            clerkUserId: userId,
        }
    });
    if (!user) {
        throw new Error("User not found");
    }

    const lastIssue = await prisma.issue.findFirst({
        where: { projectId, status: data.status },
        orderBy: { order: "desc" },
    });

    const newOrder = lastIssue ? lastIssue.order + 1 : 0;

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
    });

    return issue;
}

export async function getIssuesForSprint(sprintId) {

    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const issues = await prisma.issue.findMany({
        where: { sprintId },
        orderBy: [{ status: "asc" }, { order: "asc" }],
        include: {
            assignee: true,
            reporter: true,
        },
    });

    return issues;
}

export async function updateIssueOrderStatus(updatedIssues) {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) throw new Error("Unauthorized");

    await prisma.$transaction(async (tx) => {
        for (const issue of updatedIssues) {
            await tx.issue.update({
                where: { id: issue.id },
                data: { status: issue.status, order: issue.order },
            });
        }
    });

    return { success: true };
}

export async function updateIssue(issueId, data) {

    const { userId, orgId } = await auth();
    if (!userId || !orgId) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: {
            clerkUserId: userId,
        }
    });
    if (!user) {
        throw new Error("User not found");
    }

    try {
        const issue = await prisma.issue.findUnique({
            where: { id: issueId },
            include: { project: true },
        })

        if (!issue) {
            throw new Error("Issue not found");
        }

        if (issue.project.organizationId !== orgId) {
            throw new Error("Unauthorized");
        }

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
        });

        return updatedIssue;
    } catch (error) {
        throw new Error("Error updating issue: " + error.message);
    }

}

export async function deleteIssue(issueId) {

    const { userId, orgId } = await auth();
    if (!userId || !orgId) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: {
            clerkUserId: userId,
        }
    });
    if (!user) {
        throw new Error("User not found");
    }

    try {
        const issue = await prisma.issue.findUnique({
            where: { id: issueId },
            include: { project: true },
        })

        if (!issue) {
            throw new Error("Issue not found");
        }

        if (
            issue.reporterId !== user.id &&
            (!issue.project || !issue.project.adminIds.includes(user.id))
        ) {
            throw new Error("You are not authorized to delete this issue");
        }

        await prisma.issue.delete({
            where: { id: issueId },
        });

        return { success: true };
    } catch (error) {
        throw new Error("Error deleting issue: " + error.message);
    }
}