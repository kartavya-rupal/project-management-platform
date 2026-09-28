import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, User, Tag, BarChart3 } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export default async function AttendancePage({ params }) {
    const { organisationId } = await params
    const { userId } = await auth()

    if (!userId) redirect("/sign-in")

    const logs = await prisma.attendance.findMany({
        where: { organisationId },
        include: { user: true },
        orderBy: { timestamp: "desc" },
        take: 200,
    })

    const totalAttendance = logs.length
    const uniqueUsers = new Set(logs.map((log) => log.userId)).size
    const todayAttendance = logs.filter(
        (log) => new Date(log.timestamp).toDateString() === new Date().toDateString(),
    ).length

    return (
        <div className="container mx-auto px-7 py-6">
            {/* Back Button */}
            <div className="mb-6">
                <Link href={`/organisation/${organisationId}`}>
                    <Button
                        variant="ghost"
                        className="flex items-center gap-2 hover:bg-primary/10 text-primary cursor-pointer transition-all duration-300 group"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Overview
                    </Button>
                </Link>
            </div>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold gradient-title pb-2">Attendance Logs</h1>
                <p className="text-primary/70">Track team attendance and RFID check-ins</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="relative overflow-hidden border border-primary/10 bg-background/60 backdrop-blur-md ">
                    <CardContent className="pt-6 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Clock className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Check-ins</p>
                                <p className="text-2xl font-bold text-primary">{totalAttendance}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border border-primary/10 bg-background/60 backdrop-blur-md">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                                <User className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Unique Users</p>
                                <p className="text-2xl font-bold text-green-600">{uniqueUsers}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border border-primary/10 bg-background/60 backdrop-blur-md">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <BarChart3 className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Today's Check-ins</p>
                                <p className="text-2xl font-bold text-blue-600">{todayAttendance}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Attendance Records */}
            <Card className="relative overflow-hidden border border-primary/10 bg-background/60 backdrop-blur-md">
                <CardHeader className="border-b border-primary/10">
                    <CardTitle className="flex items-center gap-2">
                        <Tag className="h-5 w-5 text-primary" />
                        Recent Check-ins
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                    {logs.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground mb-2">No attendance records yet.</p>
                            <p className="text-sm text-muted-foreground/70">
                                Check-ins will appear here as team members scan their RFID tags.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[600px] overflow-y-auto">
                            {logs.map((log) => (
                                <div
                                    key={log.id}
                                    className="p-4 border border-primary/10 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors duration-300 group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-foreground">
                                                    {log.user?.name ?? log.user?.email ?? "Unknown"}
                                                </p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                    <Tag className="h-3 w-3" />
                                                    {log.rfidTag}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge
                                                variant={log.status === "check-in" ? "default" : "secondary"}
                                                className={`${log.status === "check-in"
                                                        ? "bg-green-500/20 text-green-700 border-green-500/30"
                                                        : "bg-orange-500/20 text-orange-700 border-orange-500/30"
                                                    }`}
                                            >
                                                {log.status}
                                            </Badge>
                                            <p className="text-sm text-muted-foreground mt-2">{new Date(log.timestamp).toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground/70 mt-1">
                                                {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
