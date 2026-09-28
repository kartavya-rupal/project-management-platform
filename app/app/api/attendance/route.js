import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const DEVICE_HEADER = "x-device-secret";

export async function POST(req) {
    try {
        // Security: simple shared-secret header
        const secret = req.headers.get(DEVICE_HEADER);
        if (!secret || secret !== process.env.ESP32_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        // expecting { rfid: "abcd1234", organisationId: "ORG_ID", type?: "check-in"|"check-out" }
        const { rfid, organisationId, type } = body ?? {};
        if (!rfid || !organisationId) {
            return NextResponse.json({ error: "Missing rfid or organisationId" }, { status: 400 });
        }

        // Find user with this rfidTag
        const user = await prisma.user.findUnique({
            where: { rfidTag: rfid },
        });

        if (!user) {
            return NextResponse.json({ error: "RFID not linked to any user" }, { status: 404 });
        }

        // Create attendance record
        const attendance = await prisma.attendance.create({
            data: {
                userId: user.id,
                organisationId,
                rfidTag: rfid,
                status: type === "check-out" ? "CHECK_OUT" : "CHECK_IN",
            },
        });

        // Optionally create an ActivityLog
        await prisma.activityLog.create({
            data: {
                message: `${user.name ?? user.email} ${attendance.status === "CHECK_IN" ? "checked in" : "checked out"}`,
                type: "UPDATED",
                userId: user.id,
                projectId: null,
                issueId: null,
                sprintId: null,
            },
        });

        return NextResponse.json({ success: true, attendance });
    } catch (err) {
        console.error("attendance API error", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
