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