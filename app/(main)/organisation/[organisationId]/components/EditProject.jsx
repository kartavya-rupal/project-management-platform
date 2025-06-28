"use client"

import { updateProject } from "@/actions/project"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import useFetch from "@/hooks/use-fetch"
import { useOrganization } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Pencil, Loader2 } from "lucide-react"

const EditProject = ({ projectId, initialName, initialDescription }) => {
  const { membership } = useOrganization()

  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const router = useRouter()

  const { loading: isUpdating, error, data: updatedProject, fn: updateProjectFn } = useFetch(updateProject)

  useEffect(() => {
    if (updatedProject) {
      router.refresh()
    }
  }, [updatedProject, router])

  const handleUpdate = async () => {
    try {
      await updateProjectFn(projectId, { name, description })
      setIsDialogOpen(false)
      toast.success("Project updated successfully")
    } catch (error) {
      toast.error("Error", {
        description: error.message || "Failed to update project.",
      })
    }
  }

  const handleCancel = () => {
    setName(initialName)
    setDescription(initialDescription)
    setIsDialogOpen(false)
  }

  const handleOpenDialog = () => {
    setName(initialName)
    setDescription(initialDescription)
    setIsDialogOpen(true)
  }

  if (membership?.role !== "org:admin") {
    return null
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleOpenDialog}
        disabled={isUpdating}
        className="relative group cursor-pointer rounded-full h-8 w-8 p-0 hover:bg-blue-500/10"
      >
        {isUpdating ? (
          <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
        ) : (
          <>
            <span className="absolute inset-0 rounded-full bg-blue-500/0 transition-colors duration-300 group-hover:bg-blue-500/10"></span>
            <Pencil className="h-4 w-4 transition-colors duration-300 group-hover:text-blue-500" />
          </>
        )}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-lg font-semibold">Edit Project</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">Update your project details</p>
          </DialogHeader>

          {isUpdating && (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="ml-2 text-xs text-muted-foreground">Updating project...</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="project-name" className="text-sm font-medium">
                Project Name
              </label>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="project-description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter project description"
                rows={4}
                disabled={isUpdating}
              />
            </div>

            {error && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-xs">{error.message}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex-1 bg-transparent cursor-pointer"
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={isUpdating || !name.trim()} className="flex-1 cursor-pointer">
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Project"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default EditProject
