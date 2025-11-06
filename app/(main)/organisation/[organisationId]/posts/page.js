import { getOrganization } from "@/actions/organization"
import { MessageSquare, Users, TrendingUp, ArrowLeft } from "lucide-react"
import PostList from "./components/PostList"
import PostCreateButton from "./components/PostCreateButton"
import { getPosts } from "@/actions/post"
import Link from "next/link"

const Page = async ({ params }) => {
  const { organisationId } = await params
  const organisation = await getOrganization(organisationId)
  const posts = await getPosts(organisation?.id)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 dotted-background">
      <div className="max-w-10xl mx-auto px-4 py-8">
        <Link href={`/organisation/${organisationId}`}>
          <button className="group relative overflow-hidden cursor-pointer rounded-lg px-4 py-2 text-primary transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/10">
            <span className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="absolute inset-0 rounded-lg border border-primary/0 group-hover:border-primary/30 transition-colors duration-300"></span>
            <span className="relative flex items-center gap-2 font-medium">
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              Back to Overview
            </span>
          </button>
        </Link>
        {/* Header Section */}
        <div className="p-6 mb-8 text-center">
          <h1 className="text-4xl font-bold gradient-title mb-2">{organisation.name} Community</h1>
          <p className="text-lg text-primary/80 mb-6">
            Share ideas, discuss projects, and connect with your team
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">{posts?.length || 0} Posts</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Active Community</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Growing</span>
            </div>
          </div>
        </div>

        {/* Posts Content */}
        <PostList posts={posts} />
      </div>

      <PostCreateButton orgId={organisation.id} />
    </div>
  )
}

export default Page
