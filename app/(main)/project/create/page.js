"use client"

import OrgSwitcher from "@/components/Org-switcher"
import { useOrganization, useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { projectSchema } from "@/lib/validators"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, AlertCircle, Sparkles } from "lucide-react"
import { createProject } from "@/actions/project"
import useFetch from "@/hooks/use-fetch"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const CreateProjectPage = () => {
    const router = useRouter()
    const { organization, isLoaded: isOrgLoaded, membership } = useOrganization()
    const { isLoaded: isUserLoaded } = useUser()
    const [isAdmin, setIsAdmin] = useState(false)
    
    // const loading = false
    // const onSubmit = (data) => console.log(data)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm({
        resolver: zodResolver(projectSchema),
    })

    useEffect(() => {
        if (isOrgLoaded && isUserLoaded && membership) {
            setIsAdmin(membership.role === "org:admin")
        }
    }, [isOrgLoaded, isUserLoaded, membership])

    const {
        loading,
        error,
        data: project,
        fn: createProjectFn,
    } = useFetch(createProject);

    const onSubmit = async (data) => {
        try {
            await createProjectFn(data);
            reset();
            toast.success("Project created successfully");
        } catch (err) {
            console.error("Project creation failed", err);
        }
    }

    useEffect(() => {
        if (project) {
            router.push(`/project/${project.id}`);
        }
    }, [project]);

    if (!isOrgLoaded || !isUserLoaded) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <p className="text-primary/80 text-lg">Loading...</p>
                </div>
            </div>
        )
    }


    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
                <div className="relative backdrop-blur-sm py-10 px-8 rounded-2xl border border-primary/10 max-w-md mx-auto text-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl"></div>
                    <div className="relative z-10">
                        <AlertCircle className="h-12 w-12 text-primary/70 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            Not Authorized
                        </h2>
                        <p className="text-primary/80 mb-6">
                            You need admin permissions to create a project. Please switch to an organization where you have admin
                            rights.
                        </p>
                        <OrgSwitcher />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen py-10 px-4 bg-transparent">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(var(--primary-rgb),0.15),transparent_70%)]"></div>

            <div className="container mx-auto max-w-2xl space-y-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Create Project
                    </h1>
                    <OrgSwitcher />
                </div>

                <div className="relative backdrop-blur-sm rounded-2xl border border-primary/10 overflow-hidden mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>

                    {/* Organization info */}
                    <div className="relative z-10 p-6 border-b border-primary/10">
                        <div className="flex items-center gap-3">
                            {/* <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center p-9">
                                <span className="text-lg font-bold text-primary">{organization?.name?.charAt(0) || "O"}</span>
                            </div> */}
                            <div>
                                <p className="text-sm text-primary/70">Creating project in</p>
                                <p className="font-medium text-primary">{organization?.name || "Your Organization"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="relative z-10 p-6 space-y-6 mb-3">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium text-primary/80 mb-3">
                                Project Name
                            </label>
                            <Input
                                id="name"
                                {...register("name")}
                                className="bg-background/50 border-primary/20 focus:border-primary/50 backdrop-blur-sm"
                                placeholder="Enter project name"
                            />
                            {errors.name && (
                                <p className="text-red-400 text-sm flex items-center gap-1 mt-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="key" className="text-sm font-medium text-primary/80">
                                Project Key
                            </label>
                            <Input
                                id="key"
                                {...register("key")}
                                className="bg-background/50 border-primary/20 focus:border-primary/50 backdrop-blur-sm"
                                placeholder="Enter project key (e.g., PROJ)"
                            />
                            {errors.key && (
                                <p className="text-red-400 text-sm flex items-center gap-1 mt-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors.key.message}
                                </p>
                            )}
                            <p className="text-xs text-primary/60">
                                The project key is used to generate IDs for tasks (e.g., PROJ-123)
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium text-primary/80">
                                Description
                            </label>
                            <Textarea
                                id="description"
                                {...register("description")}
                                className="bg-background/50 border-primary/20 focus:border-primary/50 backdrop-blur-sm min-h-28"
                                placeholder="Describe your project"
                            />
                            {errors.description && (
                                <p className="text-red-400 text-sm flex items-center gap-1 mt-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors.description.message}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="relative overflow-hidden rounded-full px-6 py-3 cursor-pointer shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 w-full"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-90"></span>
                            <span className="relative flex items-center justify-center gap-2 text-primary-foreground">
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4" />
                                        Create Project
                                    </>
                                )}
                            </span>
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CreateProjectPage
