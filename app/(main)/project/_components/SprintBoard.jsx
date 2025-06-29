"use client"

import { useEffect, useState } from "react"
import SprintManager from "./SprintManager"
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd"
import statuses from "@/public/status.json"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import IssueCreationDrawer from "./CreateIssue"
import useFetch from "@/hooks/use-fetch"
import { getIssuesForSprint, updateIssueOrderStatus } from "@/actions/issue"
import IssueCard from "@/components/IssueCard"
import { toast } from "sonner"
import { useMemo } from "react"
import BoardFilters from "./BoardFilters"

function reorder(list, startIndex, endIndex) {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
}

const SprintBoard = ({ sprints, projectId, orgId }) => {
    const [currentSprint, setCurrentSprint] = useState(sprints.find((spr) => spr.status === "ACTIVE") || sprints[0])

    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState(null)

    const {
        loading: issuesLoading,
        error: issuesError,
        fn: fetchIssues,
        data: issues,
        setData: setIssues,
    } = useFetch(getIssuesForSprint)

    useEffect(() => {
        if (currentSprint.id) {
            fetchIssues(currentSprint.id)
        }
    }, [currentSprint.id])

    const handleAddIssue = (status) => {
        setSelectedStatus(status)
        setIsDrawerOpen(true)
    }

    const [filteredIssues, setFilteredIssues] = useState(issues)
    const handleFilterChange = (newFilteredIssues) => {
        setFilteredIssues(newFilteredIssues)
    }

    const handleIssueCreated = () => {
        fetchIssues(currentSprint.id)
    }

    const statusCounts = useMemo(() => {
        const counts = {
            TODO: 0,
            IN_PROGRESS: 0,
            IN_REVIEW: 0,
            DONE: 0
        };

        if (issues) {
            for (const issue of issues) {
                if (counts[issue.status] !== undefined) {
                    counts[issue.status]++;
                }
            }
        }

        return counts;
    }, [issues]);

    const {
        loading: updateIssueOrderStatusLoading,
        fn: updateIssueOrderStatusFn,
    } = useFetch(updateIssueOrderStatus)

    const onDragEnd = async (result) => {
        if (currentSprint.status === "PLANNED") {
            toast.warning("Start the sprint to update the board")
            return
        }
        if (currentSprint.status === "COMPLETED") {
            toast.warning("Sprint is already completed")
            return
        }

        const { source, destination } = result;

        if (!destination) {
            return;
        }

        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return;
        }

        const newOrderedData = [...issues];

        const sourceList = newOrderedData.filter(
            (list) => list.status === source.droppableId
        );

        const destinationList = newOrderedData.filter(
            (list) => list.status === destination.droppableId
        );

        if (source.droppableId === destination.droppableId) {
            const reorderedCards = reorder(
                sourceList,
                source.index,
                destination.index
            );

            reorderedCards.forEach((card, i) => {
                card.order = i;
            });
        } else {
            const [movedCard] = sourceList.splice(source.index, 1);

            movedCard.status = destination.droppableId;

            destinationList.splice(destination.index, 0, movedCard);

            sourceList.forEach((card, i) => {
                card.order = i;
            });

            destinationList.forEach((card, i) => {
                card.order = i;
            });
        }

        const sortedIssues = newOrderedData.sort((a, b) => a.order - b.order);
        setIssues(newOrderedData, sortedIssues);

        try {
            await updateIssueOrderStatusFn(sortedIssues);
        } catch (err) {
            toast.error("Failed to update issue order. Please try again.");
            fetchIssues(currentSprint.id);
        }
    }

    const getStatusHeaderColor = (statusKey) => {
        const colors = {
            TODO: "text-slate-700 bg-slate-100/80",
            IN_PROGRESS: "text-blue-700 bg-blue-100/80",
            IN_REVIEW: "text-amber-700 bg-amber-100/80",
            DONE: "text-emerald-700 bg-emerald-100/80",
        }
        return colors[statusKey] || "text-slate-700 bg-slate-100/80"
    }

    return (
        <div className="relative rounded-2xl backdrop-blur-sm border border-primary/10 overflow-hidden p-6 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

            {updateIssueOrderStatusLoading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                    <div className="h-6 w-6 border-2 border-t-transparent border-primary rounded-full animate-spin" />
                </div>
            )}

            <div className={cn(
                "relative z-10 transition-opacity duration-300",
                updateIssueOrderStatusLoading && "opacity-50 pointer-events-none"
            )}>
                <SprintManager sprint={currentSprint} setSprint={setCurrentSprint} sprints={sprints} projectId={projectId} />

                {issues && !issuesLoading && !issuesError && (
                    <BoardFilters issues={issues} onFilterChange={handleFilterChange} />
                )}

                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                        {statuses.map((status) => (
                            <Droppable key={status.key} droppableId={status.key}>
                                {(provided, snapshot) => (
                                    <Card
                                        className={cn(
                                            "transition-all duration-200 min-h-[400px] bg-background border shadow-sm",
                                            snapshot.isDraggingOver && "ring-2 ring-primary/20 shadow-lg bg-primary/5"
                                        )}
                                    >
                                        <CardHeader className="pb-3">
                                            <CardTitle
                                                className={cn(
                                                    "text-sm font-medium px-3 py-1.5 rounded-full text-center transition-colors",
                                                    getStatusHeaderColor(status.key)
                                                )}
                                            >
                                                {status.name}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="min-h-[300px]" // removed space-y-3
                                        >
                                            {filteredIssues
                                                ?.filter((issue) => issue.status === status.key)
                                                .map((issue, index) => (
                                                    <Draggable
                                                        key={issue.id}
                                                        draggableId={issue.id}
                                                        index={index}
                                                        isDragDisabled={updateIssueOrderStatusLoading}
                                                    >
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className="mb-3 w-full"
                                                            >
                                                                <IssueCard issue={issue}
                                                                    onDelete={() => fetchIssues(currentSprint.id)}
                                                                    onUpdate={(updated) => {
                                                                        let found = false;
                                                                        setIssues((issues) =>
                                                                            issues.map((issue) => {
                                                                                if (issue.id === updated.id) {
                                                                                    return updated;
                                                                                }
                                                                                return issue;
                                                                            })
                                                                        );
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}

                                            {issues?.filter((issue) => issue.status === status.key).length === 0 && (
                                                <div className="space-y-2">
                                                    <div className="text-xs text-muted-foreground text-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/20">
                                                        {status.key === "TODO" && "No issues yet"}
                                                        {status.key === "IN_PROGRESS" && "No issues in progress"}
                                                        {status.key === "IN_REVIEW" && "No issues in review"}
                                                        {status.key === "DONE" && "No completed issues"}
                                                    </div>
                                                </div>
                                            )}

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
                            <div className="text-2xl font-bold text-slate-600">{statusCounts.TODO}</div>
                            <div className="text-xs text-muted-foreground">To Do</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-background/50 backdrop-blur-sm">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{statusCounts.IN_PROGRESS}</div>
                            <div className="text-xs text-muted-foreground">In Progress</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-background/50 backdrop-blur-sm">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-amber-600">{statusCounts.IN_REVIEW}</div>
                            <div className="text-xs text-muted-foreground">In Review</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-background/50 backdrop-blur-sm">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-emerald-600">{statusCounts.DONE}</div>
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
