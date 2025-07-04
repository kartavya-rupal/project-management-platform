"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function createSprint(projectId, data) {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { sprints: true },
    });

    if (!project) throw new Error("Project not found");
    if (project.organizationId !== orgId) throw new Error("Unauthorized");

    const maxNumber = project.sprints
        .map((sprint) => {
            const match = sprint.name.match(/-(\d+)$/);
            return match ? parseInt(match[1], 10) : 0;
        })
        .reduce((max, curr) => Math.max(max, curr), 0);

    const newSprintName = `${project.key}-${maxNumber + 1}`;

    const sprint = await prisma.sprint.create({
        data: {
            name: newSprintName,
            startDate: data.startDate,
            endDate: data.endDate,
            status: "PLANNED",
            projectId: projectId,
        },
    });

    await prisma.activityLog.create({
        data: {
            message: `Created sprint "${sprint.name}"`,
            type: "CREATED",
            user: { connect: { id: user.id } },
            sprint: { connect: { id: sprint.id } },
            project: { connect: { id: project.id } },
        },
    });

    return sprint;
}

export async function updateSprintStatus(sprintId, status) {
    const { userId, orgId, orgRole } = await auth();
    if (!userId || !orgId) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const sprint = await prisma.sprint.findUnique({
        where: { id: sprintId },
        include: { project: true },
    });

    if (!sprint) throw new Error("Sprint not found");

    if (orgRole !== "org:admin" && sprint.project.organizationId !== orgId) {
        throw new Error("Unauthorized");
    }

    const now = new Date();
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);

    if (status === "ACTIVE" && (now < startDate || now > endDate)) {
        throw new Error("Cannot start sprint outside of its date range");
    }

    if (status === "COMPLETED" && sprint.status !== "ACTIVE") {
        throw new Error("Can only complete an active sprint");
    }

    const updatedSprint = await prisma.sprint.update({
        where: { id: sprintId },
        data: { status: status },
    });

    await prisma.activityLog.create({
        data: {
            message: `Sprint "${sprint.name}" marked as ${status}`,
            type: "STATUS_CHANGED",
            user: { connect: { id: user.id } },
            sprint: { connect: { id: sprint.id } },
            project: { connect: { id: sprint.project.id } },
        },
    });

    return { success: true, sprint: updatedSprint };
}

export async function deleteSprint(sprintId) {
    const { userId, orgId, orgRole } = await auth();
    if (!userId || !orgId) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const sprint = await prisma.sprint.findUnique({
        where: { id: sprintId },
        include: { project: true },
    });

    if (!sprint) throw new Error("Sprint not found");

    if (orgRole !== "org:admin" && sprint.project.organizationId !== orgId) {
        throw new Error("Unauthorized");
    }

    if (sprint.status !== "PLANNED") {
        throw new Error("Only planned sprints can be deleted");
    }

    await prisma.activityLog.create({
        data: {
            message: `Deleted sprint "${sprint.name}"`,
            type: "DELETED",
            user: { connect: { id: user.id } },
            sprint: { connect: { id: sprint.id } },
            project: { connect: { id: sprint.project.id } },
        },
    });

    await prisma.sprint.delete({
        where: { id: sprintId },
    });

    

    return { success: true };
}
