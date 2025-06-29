"use client"

import { useEffect, useState } from "react"
import { Filter, Search, Users, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"]

const priorityColors = {
    LOW: "bg-green-100 text-green-700 border-green-200",
    MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
    HIGH: "bg-orange-100 text-orange-700 border-orange-200",
    URGENT: "bg-red-100 text-red-700 border-red-200",
}

const BoardFilters = ({ issues, onFilterChange }) => {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedAssignees, setSelectedAssignees] = useState([])
    const [selectedPriority, setSelectedPriority] = useState("")

    const assignees = issues
        .map((issue) => issue.assignee)
        .filter((item, index, self) => item && index === self.findIndex((t) => t?.id === item?.id))

    useEffect(() => {
        const filteredIssues = issues.filter(
            (issue) =>
                issue.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
                (selectedAssignees.length === 0 || selectedAssignees.includes(issue.assignee?.id)) &&
                (selectedPriority === "" || issue.priority === selectedPriority),
        )
        onFilterChange(filteredIssues)
    }, [searchTerm, selectedAssignees, selectedPriority, issues])

    const toggleAssignee = (assigneeId) => {
        setSelectedAssignees((prev) =>
            prev.includes(assigneeId) ? prev.filter((id) => id !== assigneeId) : [...prev, assigneeId],
        )
    }

    const clearFilters = () => {
        setSearchTerm("")
        setSelectedAssignees([])
        setSelectedPriority("")
    }

    const isFiltersApplied = searchTerm !== "" || selectedAssignees.length > 0 || selectedPriority !== ""

    return (
        <div className="relative rounded-xl backdrop-blur-sm border border-primary/10 bg-background/95 p-4 mb-6 mt-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none rounded-xl"></div>

            <div className="relative space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Filter Issues</h3>
                </div>


                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                    <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            className="pl-10 bg-background border-border"
                            placeholder="Search issues by title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium whitespace-nowrap">Assignees:</span>
                        </div>
                        <div className="flex gap-1">
                            {assignees.length > 0 ? (
                                assignees.map((assignee) => {
                                    const selected = selectedAssignees.includes(assignee.id)
                                    return (
                                        <button
                                            key={assignee.id}
                                            onClick={() => toggleAssignee(assignee.id)}
                                            className={`relative transition-all duration-200 rounded-full ${selected
                                                ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
                                                : "hover:scale-105 opacity-70 hover:opacity-100"
                                                }`}
                                            title={assignee.name}
                                        >
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={assignee.imageUrl || "/placeholder.svg"} />
                                                <AvatarFallback className="text-xs">{assignee.name?.[0]}</AvatarFallback>
                                            </Avatar>
                                        </button>
                                    )
                                })
                            ) : (
                                <span className="text-xs text-muted-foreground">No assignees</span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium whitespace-nowrap">Priority:</span>
                        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                            <SelectTrigger className="w-32 bg-background border-border">
                                <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priorities</SelectItem>
                                {priorities.map((priority) => (
                                    <SelectItem key={priority} value={priority}>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[priority]}`}>
                                            {priority}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {isFiltersApplied && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="flex items-center gap-2 whitespace-nowrap"
                        >
                            <X className="h-3 w-3" />
                            Clear
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default BoardFilters
