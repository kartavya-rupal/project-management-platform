import { currentUser } from "@clerk/nextjs/server";
import prisma from "./prisma";

export async function saveUserToDB() {
    try {
        const user = await currentUser();
        if (!user) return null;

        const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
        const email = user.emailAddresses?.[0]?.emailAddress || "no-email@example.com";

        let dbUser = await prisma.user.findUnique({
            where: { clerkUserId: user.id },
        });

        if (!dbUser) {
            dbUser = await prisma.user.create({
                data: {
                    clerkUserId: user.id,
                    email,
                    name: fullName || "No Name",
                    imageUrl: user.imageUrl,
                },
            });
        }

        return dbUser;
    } catch (error) {
        console.error("Error saving user to DB:", error);
        return null;
    }
}
