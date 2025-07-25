import { Button } from "@/components/ui/button"
import { getOrganisationMembers, getOrganization } from "@/actions/organization.js"
import OrgSwitcher from "@/components/Org-switcher"
import ProjectList from "./components/ProjectList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, Crown, Building2, FolderOpen, CheckCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { auth } from "@clerk/nextjs/server"
import { getProjects } from "@/actions/project"
import UserIssues from "./components/UserIssues"
import { redirect } from "next/navigation"
import { MessageSquare, Lightbulb, Heart, ExternalLink } from "lucide-react"
import Link from "next/link"
import ActivityLog from "./components/ActivityLog"

export default async function Organisation({ params }) {
  const { organisationId } = await params
  const { userId } = await auth()

  if (!userId) redirect("/sign-in")

  if (!organisationId) return <div>Organization not found</div>

  const organisation = await getOrganization(organisationId)

  if (!organisation) {
    return <div> Organization not found</div>
  }

  const projects = await getProjects(organisation.id)

  const members = await getOrganisationMembers(organisation.id)

  const owner = members.find((member) => member.role === "org:admin")

  return (
    <div className="container mx-auto px-7">
      {/* Organization Info Card */}
      <div className="mb-6">
        <Card className="relative overflow-hidden border border-primary/10 bg-background/60 backdrop-blur-md">
          <CardHeader className="relative z-10 border-b border-primary/10">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Organization Overview
              </CardTitle>
              <ActivityLog />
            </div>
          </CardHeader>

          <CardContent className="relative z-10 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Organization Name */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Organization</span>
                </div>
                <p className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  {organisation.name}
                </p>
              </div>

              {/* Total Members */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Members</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{members?.length || 0}</span>
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                </div>
              </div>

              {/* Owner */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Owner</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{owner?.name || "Unknown"}</span>
                  <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700 border-yellow-200">
                    Admin
                  </Badge>
                </div>
              </div>

              {/* Created Date */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Created</span>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-semibold">
                    {formatDistanceToNow(new Date(organisation.createdAt), { addSuffix: true })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(organisation.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Stats Row */}
            <div className="mt-6 pt-4 border-t border-primary/10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                  <FolderOpen className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Projects</p>
                    <p className="text-xl font-bold text-primary">{projects?.length || 0}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Completed Projects</p>
                    <p className="text-xl font-bold text-green-600">{0}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Days Active</p>
                    <p className="text-xl font-bold text-blue-600">
                      {Math.floor((new Date() - new Date(organisation.createdAt)) / (1000 * 60 * 60 * 24))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative rounded-2xl backdrop-blur-sm border border-primary/10 overflow-hidden p-6 transition-all duration-300 md:m-8">
        <div className="relative z-10">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start">
            <h1 className="text-4xl font-bold gradient-title pb-2">{organisation.name}&rsquo;s Projects</h1>
            <OrgSwitcher />
          </div>

          <ProjectList orgId={organisation.id} />
        </div>
      </div>

      <div className="md:m-8 mt-6 mb-6">
        <UserIssues userId={userId} />
      </div>

      {/* Community Section */}
      <div className="relative rounded-2xl backdrop-blur-sm border border-primary/10 overflow-hidden p-6 transition-all duration-300 md:m-8 mt-6 mb-6">

        <div className="relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>

            <h2 className="text-3xl font-bold gradient-title mb-4">Join Our Community</h2>

            <p className="text-lg text-primary/80 mb-6 leading-relaxed">
              Connect with your team beyond work. Share ideas, celebrate wins, ask questions, and build stronger
              relationships in our dedicated community space.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex flex-col items-center p-4 rounded-lg bg-background/50 border border-primary/10">
                <div className="p-3 rounded-full bg-blue-500/10 mb-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-sm mb-2">Team Discussions</h3>
                <p className="text-xs text-muted-foreground text-center">
                  Start conversations, share updates, and collaborate with your teammates
                </p>
              </div>

              <div className="flex flex-col items-center p-4 rounded-lg bg-background/50 border border-primary/10">
                <div className="p-3 rounded-full bg-green-500/10 mb-3">
                  <Lightbulb className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-sm mb-2">Share Ideas</h3>
                <p className="text-xs text-muted-foreground text-center">
                  Post suggestions, feedback, and innovative solutions for everyone
                </p>
              </div>

              <div className="flex flex-col items-center p-4 rounded-lg bg-background/50 border border-primary/10">
                <div className="p-3 rounded-full bg-purple-500/10 mb-3">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-sm mb-2">Celebrate Together</h3>
                <p className="text-xs text-muted-foreground text-center">
                  Share achievements, milestones, and recognize great work
                </p>
              </div>
            </div>

            <Link href={`/organisation/${organisationId}/posts`}>
              <Button
                size="lg"
                className="relative cursor-pointer overflow-hidden rounded-full px-8 py-3 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-90"></span>
                <span className="relative flex items-center gap-2 text-primary-foreground">
                  Explore Community
                  <ExternalLink className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
