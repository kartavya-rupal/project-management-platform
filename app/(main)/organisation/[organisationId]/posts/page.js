import { getPosts } from "@/actions/post"
import { getOrganization } from "@/actions/organization"
import { MessageSquare, Users, TrendingUp } from "lucide-react"
import PostList from "./components/PostList"
import PostCreateButton from "./components/PostCreateButton"

const Page = async ({ params }) => {
  const { organisationId } = await params
  const organisation = await getOrganization(organisationId)
  const posts = await getPosts(organisation.id)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 dotted-background">
      <div className="max-w-10xl mx-auto px-4 py-8">
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
