"use client"

import { deleteProject } from "@/actions/project"
import { Button } from "@/components/ui/button"
import useFetch from "@/hooks/use-fetch"
import { useOrganization } from "@clerk/nextjs"
import { Trash2, Loader2, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const DeleteProject = ({ projectId }) => {
    const router = useRouter()
    const { membership } = useOrganization()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)

    const {
        loading: isDeleting,
        error,
        data: deletedProject,
        fn: deleteProjectFn,
    } = useFetch(deleteProject)

    useEffect(() => {
        setIsAdmin(membership?.role === "org:admin")
    }, [membership])

    useEffect(() => {
        if (deletedProject) {
            toast.success("Project deleted", {
                description: "The project has been successfully deleted.",
            })
            router.refresh()
        }
    }, [deletedProject, router])

    useEffect(() => {
        if (error) {
            toast.error("Error", {
                description: error.message || "Failed to delete project.",
            })
        }
    }, [error])

    if (!isAdmin) return null

    const handleDelete = async () => {
        setIsDialogOpen(false)

        toast("Deleting project...", {
            description: "Your project is being deleted.",
            duration: 3000,
        })

        try {
            await deleteProjectFn(projectId)
        } catch (err) {
            toast.error("Error", {
                description: "Failed to delete project. Please try again.",
            })
        }
    }

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDialogOpen(true)}
                disabled={isDeleting}
                className="relative group cursor-pointer rounded-full h-8 w-8 p-0 hover:bg-red-500/10"
            >
                {isDeleting ? (
                    <Loader2 className="h-4 w-4 text-red-500 animate-spin" />
                ) : (
                    <>
                        <span className="absolute inset-0 rounded-full bg-red-500/0 transition-colors duration-300 group-hover:bg-red-500/10"></span>
                        <Trash2 className="h-4 w-4 transition-colors duration-300 group-hover:text-red-500" />
                    </>
                )}
            </Button>

            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent className="border border-primary/10 bg-background/95 backdrop-blur-sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-500">
                            <AlertTriangle className="h-5 w-5" />
                            Delete Project
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-primary/80">
                            This action cannot be undone. This will permanently delete the project and all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-full border-primary/30 bg-background/50 text-primary cursor-pointer">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="relative overflow-hidden rounded-full bg-red-500 text-white hover:bg-red-200 transition-colors duration-300 cursor-pointer"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r hover:shadow-red-400/50 bg-[#DC143C] hover:bg-[#DC143C] text-white opacity-90"></span>
                            <span className="relative">Delete Project</span>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export default DeleteProject
