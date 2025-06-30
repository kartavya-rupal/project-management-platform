import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserIssues } from "@/actions/organization"
import IssueCard from "@/components/IssueCard"
import { Loader2, UserCheck, FileText } from "lucide-react"

export default async function UserIssues({ userId }) {
    const issues = await getUserIssues(userId)

    if (issues.length === 0) {
        return null
    }

    const assignedIssues = issues.filter((issue) => issue.assignee.clerkUserId === userId)

    const reportedIssues = issues.filter((issue) => issue.reporter.clerkUserId === userId)

    return (
        <div className="relative rounded-2xl backdrop-blur-sm border border-primary/10 overflow-hidden p-6 transition-all duration-300">

            <div className="relative z-10">
                <h1 className="text-4xl font-bold gradient-title mb-6">My Issues</h1>

                <Tabs defaultValue="assigned" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-background/50 backdrop-blur-sm border border-primary/10">
                        <TabsTrigger
                            value="assigned"
                            className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all duration-200"
                        >
                            <UserCheck className="h-4 w-4" />
                            {/* Show text only on sm and up */}
                            <span className="hidden sm:inline">Assigned to You</span>

                            {/* Show count always */}
                            {assignedIssues.length > 0 && (
                                <span className="ml-1 px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                                    {assignedIssues.length}
                                </span>
                            )}
                        </TabsTrigger>

                        <TabsTrigger
                            value="reported"
                            className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all duration-200"
                        >
                            <FileText className="h-4 w-4" />
                            {/* Text label only visible on sm and up */}
                            <span className="hidden sm:inline">Reported by You</span>

                            {/* Badge count always visible */}
                            {reportedIssues.length > 0 && (
                                <span className="ml-1 px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                                    {reportedIssues.length}
                                </span>
                            )}
                        </TabsTrigger>

                    </TabsList>

                    <TabsContent value="assigned" className="mt-6">
                        <Suspense
                            fallback={
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    <span className="ml-2 text-sm text-muted-foreground">Loading assigned issues...</span>
                                </div>
                            }
                        >
                            <IssueGrid issues={assignedIssues} emptyMessage="No issues assigned to you" />
                        </Suspense>
                    </TabsContent>

                    <TabsContent value="reported" className="mt-6">
                        <Suspense
                            fallback={
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    <span className="ml-2 text-sm text-muted-foreground">Loading reported issues...</span>
                                </div>
                            }
                        >
                            <IssueGrid issues={reportedIssues} emptyMessage="No issues reported by you" />
                        </Suspense>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

function IssueGrid({ issues, emptyMessage }) {
    if (issues.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-primary/70" />
                </div>
                <p className="text-muted-foreground">{emptyMessage}</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {issues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} showStatus />
            ))}
        </div>
    )
}
