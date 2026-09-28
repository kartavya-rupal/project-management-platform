// app/api/users/assign-rfid/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req) {
    try {
        // require user to be logged in and an org-admin if you want (simple auth here)
        const user = await auth();
        if (!user.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { userId, rfidTag } = await req.json();
        if (!userId || !rfidTag) return NextResponse.json({ error: "Missing params" }, { status: 400 });

        // Make sure tag is unique
        const existing = await prisma.user.findUnique({ where: { rfidTag } });
        if (existing) return NextResponse.json({ error: "RFID tag already assigned" }, { status: 409 });

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { rfidTag },
        });

        return NextResponse.json({ success: true, user: updated });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
