"use server"

import prisma from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function getOrganization(slug) {
    const {userId} = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
        where: {
            clerkUserId: userId,
        }
    });
    if (!user) {
        throw new Error("User not found");
    }

    const client = await clerkClient()

    const organisation = await client.organizations.getOrganization({
        slug,
    });
    if (!organisation) {
        return null;
    }

    const { data: membership } = await client.organizations.getOrganizationMembershipList({
        organizationId: organisation.id,
    });

    const userMembership = membership.find((m) => m.publicUserData.userId === userId);
    if (!userMembership) {
        return null;
    }

    return organisation;
}

export async function getOrganisationMembers(orgId) {

    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
        where: {
            clerkUserId: userId,
        }
    });
    if (!user) {
        throw new Error("User not found");
    }

    const client = await clerkClient()

    const { data: membership } = await client.organizations.getOrganizationMembershipList({
        organizationId: orgId,
    });

    const userIds = membership.map((m) => m.publicUserData.userId);
    if (!userIds.includes(userId)) {
        return null;
    }

    const users = await prisma.user.findMany({
        where: {
            clerkUserId: { in: userIds },
        },
    });

    return membership.map((member) => {
        const localUser = users.find((u) => u.clerkUserId === member.publicUserData.userId);

        return {
            id: localUser?.id || null,
            clerkUserId: member.publicUserData.userId,
            name: localUser?.name || member.publicUserData.firstName,
            email: localUser?.email || member.publicUserData.identifier,
            imageUrl: localUser?.imageUrl || member.publicUserData.imageUrl,
            role: member.role, // <-- THIS is now included
        };
    });
      
}