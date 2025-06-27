"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { usePathname, useRouter } from "next/navigation"
import { useOrganization, useUser } from "@clerk/nextjs"
import useFetch from "@/hooks/use-fetch"
import { deleteIssue, updateIssue } from "@/actions/issue"
import statuses from "@/public/status.json"
import { ExternalLink, Loader2, Trash2, User, UserCheck, AlertTriangle, X } from "lucide-react"
import MDEditor from "@uiw/react-md-editor"
import UserAvatar from "./UserAvatar"
import { toast } from "sonner"

const priorityOptions = ["LOW", "MEDIUM", "HIGH", "URGENT"]

const priorityColors = {
    LOW: "text-green-700 bg-green-100 border-green-200",
    MEDIUM: "text-yellow-700 bg-yellow-100 border-yellow-200",
    HIGH: "text-orange-700 bg-orange-100 border-orange-200",
    URGENT: "text-red-700 bg-red-100 border-red-200",
}

const IssueDialog = ({ isOpen, onClose, issue, onDelete = () => { }, onUpdate = () => { } }) => {
    const [status, setStatus] = useState(issue.status)
    const [priority, setPriority] = useState(issue.priority)
    const [showDeleteWarning, setShowDeleteWarning] = useState(false)
    const { user } = useUser()
    const { membership } = useOrganization()
    const router = useRouter()
    const pathname = usePathname()

    const { loading: deleteLoading, error: deleteError, fn: deleteIssueFn, data: deleted } = useFetch(deleteIssue)

    const { loading: updateLoading, error: updateError, fn: updateIssueFn, data: updated } = useFetch(updateIssue)

    const handleDeleteClick = () => {
        setShowDeleteWarning(true)
    }

    const handleConfirmDelete = async () => {
        setShowDeleteWarning(false)
        deleteIssueFn(issue.id)
    }

    const handleCancelDelete = () => {
        setShowDeleteWarning(false)
    }

    const handleStatusChange = async (newStatus) => {
        setStatus(newStatus)
        updateIssueFn(issue.id, { status: newStatus, priority })
    }

    const handlePriorityChange = async (newPriority) => {
        setPriority(newPriority)
        updateIssueFn(issue.id, { status, priority: newPriority })
    }

    useEffect(() => {
        if (deleted) {
            onClose()
            onDelete()
            toast.success("Issue deleted successfully")
        }
        if (updated) {
            onUpdate(updated)
        }
    }, [deleted, updated, deleteLoading, updateLoading])

    const canChange = user.id === issue.reporter.clerkUserId || membership.role === "org:admin"

    const handleGoToProject = () => {
        router.push(`/project/${issue.projectId}?sprint=${issue.sprintId}`)
    }

    const isProjectPage = pathname.startsWith("/project")

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader className="border-b pb-3">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <DialogTitle className="text-lg font-semibold leading-tight pr-8">{issue.title}</DialogTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                                Issue #{issue.id?.slice(-6) || "000001"} • Created {new Date(issue.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        {!isProjectPage && (
                            <Button variant="ghost" size="sm" onClick={handleGoToProject} title="Go to Project">
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                {(updateLoading || deleteLoading) && (
                    <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="ml-2 text-xs text-muted-foreground">{deleteLoading ? "Deleting..." : "Updating..."}</span>
                    </div>
                )}

                {/* Delete Warning Card */}
                {showDeleteWarning && (
                    <div className="border border-red-200 bg-red-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h4 className="text-sm font-medium text-red-800">Delete Issue</h4>
                                <p className="text-sm text-red-700 mt-1">
                                    Are you sure you want to delete this issue? This action cannot be undone.
                                </p>
                            </div>
                            <Button size="sm" onClick={handleCancelDelete} className="bg-red-50 hover:bg-red-100">
                                <X className="h-4 w-4 text-red-600" />
                            </Button>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button className="bg-red-600 hover:bg-red-700 text-white" size="sm" onClick={handleCancelDelete}>
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleConfirmDelete}
                                disabled={deleteLoading}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete Issue
                            </Button>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Status</label>
                            <Select value={status} onValueChange={handleStatusChange} disabled={!canChange}>
                                <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.map((option) => (
                                        <SelectItem key={option.key} value={option.key}>
                                            {option.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium">Priority</label>
                            <Select value={priority} onValueChange={handlePriorityChange} disabled={!canChange}>
                                <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    {priorityOptions.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[option]}`}>
                                                {option}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-xs font-medium">Description</h4>
                        <div className="border rounded-md p-3 bg-muted/20 max-h-32 overflow-y-auto">
                            <MDEditor.Markdown
                                source={issue.description || "No description provided"}
                                data-color-mode="light"
                                className="bg-transparent text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <h4 className="text-xs font-medium">Assignee</h4>
                            </div>
                            <div className="flex justify-center">
                                <UserAvatar user={issue.assignee} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <UserCheck className="h-3 w-3 text-muted-foreground" />
                                <h4 className="text-xs font-medium">Reporter</h4>
                            </div>
                            <div className="flex justify-center">
                                <UserAvatar user={issue.reporter} />
                            </div>
                        </div>
                    </div>

                    {canChange && !showDeleteWarning && (
                        <div className="flex justify-end pt-2">
                            <Button
                                onClick={handleDeleteClick}
                                disabled={deleteLoading}
                                size="sm"
                                className="hover:shadow-red-400/50 bg-[#DC143C] hover:bg-[#DC143C] text-white cursor-pointer"
                            >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete Issue
                            </Button>
                        </div>
                    )}

                    {(deleteError || updateError) && (
                        <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-700 text-xs">{deleteError?.message || updateError?.message}</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default IssueDialog
