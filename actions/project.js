'use server'

import prisma from '@/lib/prisma';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function createProject(data) {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) throw new Error("Unauthorized");

    const client = await clerkClient();
    const { data: membership } = await client.organizations.getOrganizationMembershipList({ organizationId: orgId });
    const userMembership = membership.find((m) => m.publicUserData.userId === userId);
    if (!userMembership || userMembership.role !== "org:admin") {
        throw new Error("Only organization admins can create projects");
    }

    const user = await prisma.user.findUnique({
        where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const project = await prisma.project.create({
        data: {
            name: data.name,
            description: data.description,
            key: data.key,
            organizationId: orgId,
        },
    });

    await prisma.activityLog.create({
        data: {
            message: `Created project "${project.name}"`,
            type: "CREATED",
            user: { connect: { id: user.id } },
            project: { connect: { id: project.id } },
        },
    });

    return project;
}

export async function getProjects(orgId) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const projects = await prisma.project.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: "desc" },
    });

    return projects;
}

export async function deleteProject(projectId) {
    const { userId, orgId, orgRole } = await auth();
    if (!userId || !orgId) throw new Error("Unauthorized");
    if (orgRole !== "org:admin") throw new Error("Only organization admins can delete projects");

    const project = await prisma.project.findUnique({
        where: { id: projectId },
    });
    if (!project) throw new Error("Project not found");
    if (project.organizationId !== orgId) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    await prisma.activityLog.create({
        data: {
            message: `Deleted project "${project.name}"`,
            type: "DELETED",
            user: { connect: { id: user.id } },
            project: { connect: { id: project.id } },
        },
    });
    
    await prisma.project.delete({
        where: { id: projectId },
    });

    

    return { success: true };
}

export async function getProject(projectId) {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            sprints: { orderBy: { createdAt: "desc" } },
        },
    });

    if (!project) return null;
    if (project.organizationId !== orgId) throw new Error("Unauthorized");

    return project;
}

export async function updateProject(projectId, data) {
    const { userId, orgId, orgRole } = await auth();
    if (!userId || !orgId) throw new Error("Unauthorized");
    if (orgRole !== "org:admin") throw new Error("Only organization admins can update projects");

    const user = await prisma.user.findUnique({
        where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const project = await prisma.project.findUnique({
        where: { id: projectId },
    });
    if (!project) throw new Error("Project not found");
    if (project.organizationId !== orgId) throw new Error("Unauthorized");

    const updatedProject = await prisma.project.update({
        where: { id: projectId },
        data: {
            name: data.name,
            description: data.description,
        },
    });

    await prisma.activityLog.create({
        data: {
            message: `Updated project "${updatedProject.name}"`,
            type: "UPDATED",
            user: { connect: { id: user.id } },
            project: { connect: { id: updatedProject.id } },
        },
    });

    return updatedProject;
}
