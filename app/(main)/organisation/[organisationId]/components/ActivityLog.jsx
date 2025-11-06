"use client"

import { getActivityLogs } from "@/actions/organization"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import useFetch from "@/hooks/use-fetch"
import { useOrganization } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import {
    Activity,
    Loader2,
    Plus,
    Edit,
    Trash2,
    ArrowRight,
    MessageCircle,
    AlertCircle,
    Flag,
    FolderOpen,
    GitBranch,
    Clock,
    X,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import UserAvatar from "@/components/UserAvatar"

const getActivityIcon = (type) => {
    const iconMap = {
        CREATED: Plus,
        UPDATED: Edit,
        DELETED: Trash2,
        MOVED: ArrowRight,
        COMMENTED: MessageCircle,
        STATUS_CHANGED: AlertCircle,
        PRIORITY_CHANGED: Flag,
    }
    return iconMap[type] || Activity
}

const getActivityColor = (type) => {
    const colorMap = {
        CREATED: { icon: "text-green-600", bg: "bg-green-500/10", border: "border-green-200" },
        UPDATED: { icon: "text-blue-600", bg: "bg-blue-500/10", border: "border-blue-200" },
        DELETED: { icon: "text-red-600", bg: "bg-red-500/10", border: "border-red-200" },
        MOVED: { icon: "text-purple-600", bg: "bg-purple-500/10", border: "border-purple-200" },
        COMMENTED: { icon: "text-orange-600", bg: "bg-orange-500/10", border: "border-orange-200" },
        STATUS_CHANGED: { icon: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-200" },
        PRIORITY_CHANGED: { icon: "text-pink-600", bg: "bg-pink-500/10", border: "border-pink-200" },
    }
    return colorMap[type] || { icon: "text-primary", bg: "bg-primary/10", border: "border-primary/20" }
}

const getActivityTypeLabel = (type) => {
    const labelMap = {
        CREATED: "Created",
        UPDATED: "Updated",
        DELETED: "Deleted",
        MOVED: "Moved",
        COMMENTED: "Commented",
        STATUS_CHANGED: "Status Changed",
        PRIORITY_CHANGED: "Priority Changed",
    }
    return labelMap[type] || type
}

const getContextIcon = (log) => {
    if (log.issue) return AlertCircle
    if (log.project) return FolderOpen
    if (log.sprint) return GitBranch
    return Activity
}

const ActivityLog = () => {
    const { organization } = useOrganization()
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const { loading, error, data: logs, fn: fetchLogs } = useFetch(getActivityLogs)

    useEffect(() => {
        if (isDialogOpen && organization?.id) {
            fetchLogs(organization.id)
        }
    }, [isDialogOpen, organization?.id])

    return (
        <>
            <Button
                onClick={() => setIsDialogOpen(true)}
                variant="ghost"
                size="sm"
                className="relative cursor-pointer rounded-full h-8 w-8 p-0 hover:bg-primary/10 transition-all duration-200"
            >
                <Activity className="h-4 w-4 text-primary" />
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl  w-full max-h-[80vh] p-0 flex flex-col border border-primary/10 bg-background/95 backdrop-blur-md">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none rounded-lg"></div>

                    <DialogHeader className="relative z-10 border-b border-primary/10 p-6 pb-4">
                        <div className="flex items-start justify-between">
                            <div className="p-2 rounded-full bg-primary/10">
                                <Activity className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-semibold">Activity Logs for {organization?.name}</DialogTitle>
                                <p className="text-sm text-muted-foreground mt-1">Recent organization activity and changes</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsDialogOpen(false)}
                                className="rounded-full h-8 w-8 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                <span className="ml-3 text-sm text-muted-foreground">Loading activity logs...</span>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-12 px-6">
                                <div className="p-3 rounded-full bg-red-500/10 mb-4">
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-medium text-red-600 mb-2">Failed to load activity logs</h3>
                                <p className="text-sm text-muted-foreground text-center mb-4">{error.message}</p>
                                <Button onClick={() => fetchLogs(organization?.id)} size="sm">Try Again</Button>
                            </div>
                        ) : !logs || logs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-6">
                                <div className="p-3 rounded-full bg-primary/10 mb-4">
                                    <Activity className="h-6 w-6 text-primary/70" />
                                </div>
                                <h3 className="text-lg font-medium text-muted-foreground mb-2">No activity yet</h3>
                                <p className="text-sm text-muted-foreground text-center">Activity logs will appear here as your team works on projects</p>
                            </div>
                        ) : (
                            <ScrollArea className="h-full">
                                <div className="p-6 space-y-4">
                                    {logs.map((log) => {
                                        const ActivityIcon = getActivityIcon(log.type)
                                        const colors = getActivityColor(log.type)

                                        return (
                                            <div
                                                key={log.id}
                                                className="flex items-start gap-4 p-4 rounded-lg border border-primary/10 bg-background/50 hover:bg-primary/5 transition-all duration-200"
                                            >
                                                <div className={`p-2 rounded-full ${colors.bg} flex-shrink-0`}>
                                                    <ActivityIcon className={`h-4 w-4 ${colors.icon}`} />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4 mb-2">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Badge
                                                                    variant="outline"
                                                                    className={`text-xs ${colors.border} ${colors.bg} ${colors.icon}`}
                                                                >
                                                                    {getActivityTypeLabel(log.type)}
                                                                </Badge>
                                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                    <Clock className="h-3 w-3" />
                                                                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                                                </div>
                                                            </div>

                                                            <p className="text-sm text-foreground leading-relaxed mb-2">{log.message}</p>

                                                            <div className="flex gap-4 text-xs text-muted-foreground">
                                                                {(log.issue || log.project || log.sprint) && (
                                                                    <div className="gap-1">
                                                                        {log.issue && `Issue: ${log.issue.title}`}
                                                                        <br />
                                                                        {log.project && `Project: ${log.project.name}`}
                                                                        <br />
                                                                        {log.sprint && `Sprint: ${log.sprint.name}`}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {log.user && (
                                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                                <UserAvatar user={log.user} size="sm" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ActivityLog
