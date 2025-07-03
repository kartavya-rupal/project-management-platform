import { getProjects } from "@/actions/project"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { PlusCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import DeleteProject from "./DeleteProject"
import EditProject from "./EditProject"

export default async function ProjectList({ orgId }) {
    const projects = await getProjects(orgId)

    if (projects.length === 0) {
        return (
            <div className="relative backdrop-blur-sm py-10 px-8 rounded-2xl border border-primary/10 text-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl"></div>
                <div className="relative z-10">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <PlusCircle className="h-8 w-8 text-primary/70" />
                    </div>
                    <h3 className="text-xl font-medium mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        No projects found
                    </h3>
                    <p className="text-primary/70 mb-6">Get started by creating your first project</p>
                    <Link href="/project/create">
                        <Button className="relative cursor-pointer overflow-hidden rounded-full px-6 py-2 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20">
                            <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-90"></span>
                            <span className="relative flex items-center gap-2 text-primary-foreground">
                                Create New Project
                                <PlusCircle className="h-4 w-4" />
                            </span>
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
                <Card
                    key={project.id}
                    className="group relative overflow-hidden border border-primary/10 bg-background/60 backdrop-blur-md transition-all duration-300 hover:shadow-md hover:shadow-primary/10 hover:-translate-y-1 flex flex-col justify-between"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <CardHeader className="relative z-10 border-b border-primary/10">
                        <CardTitle className="flex justify-between items-center">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80 group-hover:from-primary group-hover:to-primary/90 transition-all duration-300">
                                {project.name}
                            </span>
                            <div className="flex items-center gap-1">
                                <EditProject
                                    projectId={project.id}
                                    initialName={project.name}
                                    initialDescription={project.description}
                                />
                                <DeleteProject projectId={project.id} />
                            </div>
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="relative z-10 pt-4 flex flex-col justify-between flex-1">
                        <p className="text-sm text-primary/70 mb-10 line-clamp-3">{project.description}</p>

                        <Link href={`/project/${project.id}`}>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full cursor-pointer rounded-full border-primary/30 bg-background/50 text-primary shadow-sm backdrop-blur transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:text-primary group"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    View Project
                                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                                </span>
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
