import { Suspense } from "react"

const ProjectLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-transparent py-8 px-4 relative">
            {/* Background gradient effect */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(var(--primary-rgb),0.15),transparent_70%)]"></div>

            <div className="container mx-auto max-w-7xl">
                <Suspense
                    fallback={
                        <div className="flex items-center justify-center min-h-[50vh]">
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative">
                                    <div className="h-12 w-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
                                    <div className="absolute inset-0 rounded-full bg-primary/5 blur-md -z-10"></div>
                                </div>
                                <p className="text-primary/80 text-lg animate-pulse">Loading project...</p>
                            </div>
                        </div>
                    }
                >
                    {children}
                </Suspense>
            </div>
        </div>
    )
}

export default ProjectLayout
