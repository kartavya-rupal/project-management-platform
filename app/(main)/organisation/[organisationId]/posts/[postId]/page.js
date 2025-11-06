import { getPost } from "@/actions/post"
import { getOrganization } from "@/actions/organization"
import { notFound } from "next/navigation"
import Link from "next/link" // Import ArrowLeft component
import PostComponent from "../components/PostComponent"
import { ArrowLeft } from "lucide-react"

const PostPage = async ({ params }) => {
  const { organisationId, postId } = await params

  const [organization, post] = await Promise.all([getOrganization(organisationId), getPost(postId)])

  if (!post || !organization) {
    notFound()
  }

  return (
    <div className="min-h-screen dotted-background">
      <div className="mx-auto w-full max-w-screen-xl px-6 py-8">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link href={`/organisation/${organisationId}/posts`}>
            <button className="group relative cursor-pointer overflow-hidden rounded-lg px-4 py-2 text-primary transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/10">
              {/* Background gradient overlay */}
              <span className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>

              {/* Border effect on hover */}
              <span className="absolute inset-0 rounded-lg border border-primary/0 group-hover:border-primary/30 transition-colors duration-300"></span>

              {/* Content */}
              <span className="relative flex items-center gap-2 font-medium">
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                Back to Community
              </span>
            </button>
          </Link>
        </div>

        {/* Single Post Component */}
        <PostComponent post={post} organisationId={organisationId} />
      </div>
    </div>
  )
}

export default PostPage
