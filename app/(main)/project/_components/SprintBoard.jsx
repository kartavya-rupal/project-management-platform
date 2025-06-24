"use client"

import { useState } from "react"
import SprintManager from "./SprintManager"
import { DragDropContext, Droppable } from "@hello-pangea/dnd"
import statuses from "@/public/status.json"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import IssueCreationDrawer from "./CreateIssue"

const SprintBoard = ({ sprints, projectId, orgId }) => {
    const [currentSprint, setCurrentSprint] = useState(sprints.find((spr) => spr.status === "ACTIVE") || sprints[0])

    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState(null)

    const handleAddIssue = (status) => {
        setSelectedStatus(status)
        setIsDrawerOpen(true)
        console.log(status)
    }

    const handleIssueCreated = () => {

    }
    const onDragEnd = () => { }

    const getStatusHeaderColor = (statusKey) => {
        const colors = {
            TODO: "text-slate-700 bg-slate-100/80",
            "IN_PROGRESS": "text-blue-700 bg-blue-100/80",
            "IN_REVIEW": "text-amber-700 bg-amber-100/80",
            DONE: "text-emerald-700 bg-emerald-100/80",
        }
        return colors[statusKey] || "text-slate-700 bg-slate-100/80"
    }

    return (
        <div className="relative rounded-2xl backdrop-blur-sm border border-primary/10 overflow-hidden p-6 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>

            <div className="relative z-10">
                <SprintManager sprint={currentSprint} setSprint={setCurrentSprint} sprints={sprints} projectId={projectId} />

                {/* Kanban Board */}

                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                        {statuses.map((status) => (
                            <Droppable key={status.key} droppableId={status.key}>
                                {(provided, snapshot) => (
                                    <Card
                                        className={cn(
                                            "transition-all duration-200 min-h-[400px] bg-background border shadow-sm",
                                            snapshot.isDraggingOver && "ring-2 ring-primary/20 shadow-lg scale-[1.02]",
                                        )}
                                    >
                                        <CardHeader className="pb-3">
                                            <CardTitle
                                                className={cn(
                                                    "text-sm font-medium px-3 py-1.5 rounded-full text-center transition-colors",
                                                    getStatusHeaderColor(status.key),
                                                )}
                                            >
                                                {status.name}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="space-y-3 min-h-[300px]"
                                        >
                                            {/* Issues will be rendered here */}
                                            <div className="space-y-2">
                                                {/* Placeholder for actual issues */}
                                                {status.key === "TODO" && (
                                                    <div className="text-xs text-muted-foreground text-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/20">
                                                        No issues yet
                                                    </div>
                                                )}
                                                {status.key === "IN_PROGRESS" && (
                                                    <div className="text-xs text-muted-foreground text-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/20">
                                                        No issues in progress
                                                    </div>
                                                )}
                                                {status.key === "IN_REVIEW" && (
                                                    <div className="text-xs text-muted-foreground text-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/20">
                                                        No issues in review
                                                    </div>
                                                )}
                                                {status.key === "DONE" && (
                                                    <div className="text-xs text-muted-foreground text-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/20">
                                                        No completed issues
                                                    </div>
                                                )}
                                            </div>

                                            {provided.placeholder}

                                            {status.key === "TODO" && currentSprint.status !== "COMPLETED" && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 mt-4 cursor-pointer"
                                                    onClick={() => handleAddIssue(status.key)}
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Create Issue
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </Droppable>
                        ))}
                    </div>
                </DragDropContext>

                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-background/50 backdrop-blur-sm">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-slate-600">0</div>
                            <div className="text-xs text-muted-foreground">To Do</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-background/50 backdrop-blur-sm">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">0</div>
                            <div className="text-xs text-muted-foreground">In Progress</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-background/50 backdrop-blur-sm">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-amber-600">0</div>
                            <div className="text-xs text-muted-foreground">In Review</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-background/50 backdrop-blur-sm">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-emerald-600">0</div>
                            <div className="text-xs text-muted-foreground">Done</div>
                        </CardContent>
                    </Card>
                </div>

                <IssueCreationDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    sprintId={currentSprint.id}
                    status={selectedStatus}
                    projectId={projectId}
                    onIssueCreated={handleIssueCreated}
                    orgId={orgId}
                />
            </div>
        </div>
    )
}

export default SprintBoard
