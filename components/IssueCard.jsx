"use client"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "@/components/ui/badge"
import UserAvatar from "./UserAvatar"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"
import IssueDialog from "./IssueDialog"

const priorityColor = {
    LOW: "border-l-green-500",
    MEDIUM: "border-l-yellow-500",
    HIGH: "border-l-orange-500",
    URGENT: "border-l-red-500",
}

const priorityBadgeColor = {
    LOW: "bg-green-100 text-green-700 border-green-200",
    MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
    HIGH: "bg-orange-100 text-orange-700 border-orange-200",
    URGENT: "bg-red-100 text-red-700 border-red-200",
}

export default function IssueCard({ issue, showStatus = false, onDelete = () => { }, onUpdate = () => { } }) {

    const [isDialogOpen, setIsDialogOpen] = useState(false)

    return (
        <>
            <Card
                className={`border-l-4 ${priorityColor[issue.priority]} bg-background hover:shadow-md transition-all duration-200 cursor-pointer`}
                onClick={() => setIsDialogOpen(true)}
            >
                <CardHeader className="pb-1">
                    <CardTitle className="text-sm font-medium leading-snug line-clamp-2">
                        {issue.title}
                    </CardTitle>
                </CardHeader>

                <CardContent className="py-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        {showStatus && (
                            <Badge variant="outline" className="text-xs capitalize">
                                {issue.status.replace("_", " ")}
                            </Badge>
                        )}
                        <Badge variant="outline" className={`text-xs ${priorityBadgeColor[issue.priority]}`}>
                            {issue.priority}
                        </Badge>
                    </div>
                </CardContent>

                <CardFooter className="pt-2 flex flex-col items-start space-y-1">
                    <UserAvatar user={issue.assignee} />
                    <div className="text-xs text-muted-foreground mt-3">
                        {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                    </div>
                </CardFooter>
            </Card>

            {isDialogOpen && (
                <IssueDialog
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    issue={issue}
                    onDelete={onDeleteHandler}
                    onUpdate={onUpdateHandler}
                />
            )}
        </>
    )
}
