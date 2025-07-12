"use client"
import { FileText, Plus } from "lucide-react"
import PostCard from "./PostCard"

const PostList = ({ posts }) => {
    if (!posts || posts.length === 0) {
        return (
            <div className="w-full px-4">
                <div className="relative rounded-2xl backdrop-blur-sm border border-primary/10 overflow-hidden p-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>

                    <div className="relative z-10 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                            <FileText className="h-8 w-8 text-primary/70" />
                        </div>
                        <h3 className="text-xl font-medium text-muted-foreground mb-3">No posts yet</h3>
                        <p className="text-muted-foreground mb-6">
                            Be the first to share something with your team! Start a conversation, share an idea, or ask a question.
                        </p>
                        <div className="inline-flex items-center gap-2 text-sm text-primary/70">
                            <Plus className="h-4 w-4" />
                            <span>Click the "New Post" button to get started</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full px-4 py-6 space-y-6">
            {posts.map((post) => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
    )
}

export default PostList
