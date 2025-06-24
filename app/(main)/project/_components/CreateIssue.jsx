"use client"

import { createIssue } from "@/actions/issue"
import { getOrganisationMembers } from "@/actions/organization"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import useFetch from "@/hooks/use-fetch"
import { issueSchema } from "@/lib/validators"
import { zodResolver } from "@hookform/resolvers/zod"
import MDEditor from "@uiw/react-md-editor"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { Loader2, X } from "lucide-react"
import { toast } from "sonner"

export default function IssueCreationDrawer({ isOpen, onClose, sprintId, status, projectId, onIssueCreated, orgId }) {
    const { loading: createIssueLoading, error, fn: createIssueFn, data: newIssue } = useFetch(createIssue)

    const { loading: usersLoading, fn: fetchUsersFn, data: users } = useFetch(getOrganisationMembers)

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(issueSchema),
        defaultValues: {
            priority: "MEDIUM",
            description: "",
            assigneeId: "",
        },
    })

    const handleClose = () => {
        document.body.style.overflow = "auto";
        onClose();
    };

    useEffect(() => {
        if (isOpen && orgId) {
            fetchUsersFn(orgId)
        }
    }, [isOpen, orgId])

    const onSubmit = async (data) => {
        await createIssueFn(projectId, {
            ...data,
            status,
            sprintId,
        })
        toast.success("Issue created successfully")
    }

    useEffect(() => {
        if (newIssue) {
            reset()
            handleClose()
            onIssueCreated()
        }
    }, [newIssue, createIssueLoading])

    return (
        <Drawer open={isOpen} onClose={onClose}>
            <DrawerContent className="max-h-[90vh]">
                <DrawerHeader className="border-b bg-muted/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <DrawerTitle className="text-xl font-semibold">Create New Issue</DrawerTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                Add a new issue to {status?.toLowerCase().replace("_", " ")} column
                            </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto">
                    {usersLoading ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <span className="ml-2 text-sm text-muted-foreground">Just wait a sec... </span>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="title" className="block text-sm font-medium">
                                    Issue Title
                                </label>
                                <Input
                                    id="title"
                                    {...register("title")}
                                    placeholder="Enter a descriptive title for the issue"
                                    className={errors.title ? "border-red-300 focus:border-red-500" : ""}
                                />
                                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="assigneeId" className="block text-sm font-medium">
                                    Assignee
                                </label>
                                <Controller
                                    name="assigneeId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger className={errors.assigneeId ? "border-red-300 focus:border-red-500" : ""}>
                                                <SelectValue placeholder="Select team member" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {users?.map((user) => (
                                                    <SelectItem key={user.id} value={user.id}>
                                                        {user?.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.assigneeId && <p className="text-red-500 text-sm mt-1">{errors.assigneeId.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="priority" className="block text-sm font-medium">
                                    Priority
                                </label>
                                <Controller
                                    name="priority"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="LOW">Low</SelectItem>
                                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                                <SelectItem value="HIGH">High</SelectItem>
                                                <SelectItem value="URGENT">Urgent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="description" className="block text-sm font-medium">
                                    Description
                                </label>
                                <div className="border rounded-lg overflow-hidden">
                                    <Controller
                                        name="description"
                                        control={control}
                                        render={({ field }) => (
                                            <MDEditor value={field.value} onChange={field.onChange} data-color-mode="dark" height={200} />
                                        )}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-700 text-sm">{error.message}</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4  cursor-pointer">
                                <Button
                                    type="button"
                                    variant="outline"
                                        onClick={handleClose}
                                    className="flex-1"
                                    disabled={createIssueLoading}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createIssueLoading} className="flex-1 cursor-pointer">
                                    {createIssueLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Issue"
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    )
}
