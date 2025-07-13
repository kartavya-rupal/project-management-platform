"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import { MoreHorizontal, Edit, Trash2, ThumbsUp, ThumbsDown, MessageCircle, ExternalLink, Clock } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { deletePost } from "@/actions/post"
import useFetch from "@/hooks/use-fetch"

const PostCard = ({ post }) => {
    const [upvotes, setUpvotes] = useState(0)
    const [downvotes, setDownvotes] = useState(0)
    const [comments, setComments] = useState(0)
    const [isUpvoted, setIsUpvoted] = useState(false)
    const [isDownvoted, setIsDownvoted] = useState(false)

    const { fn: deletePostFn, deleteLoading, deleteError } = useFetch(deletePost)

    const handleUpvote = () => {}

    const handleDownvote = () => {}

    const handleEdit = () => {
        // TODO: Implement edit functionality
        console.log("Edit post:", post.id)
    }

    const handleDelete = () => {
        // TODO: Implement delete functionality
        console.log("Delete post:", post.id)
    }

    const handleComment = () => {
        // TODO: Implement comment functionality
        console.log(post.author)
    }



    return (
        <Card className="relative overflow-hidden border border-primary/10 bg-background/60 backdrop-blur-md transition-all duration-300 hover:shadow-md hover:shadow-primary/10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            <CardHeader className="relative z-10 pb-3 mb-[-15px]">
                <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={post.author?.imageUrl} alt={post.author?.name} />
                            <AvatarFallback>
                                {post.author?.name?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-xl text-gray-500">
                            {post?.author?.name}
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground whitespace-nowrap">
                                <Clock className="h-4 w-4" />
                                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                            </div>
                        </div>
                    </div>



                    {/* Right: Dropdown Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-primary/10 rounded-full"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Post
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleDelete}
                                className="cursor-pointer text-red-600 hover:text-red-700"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Post
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>


            <CardContent className="relative z-10 space-y-4">
                {/* Title */}
                <h2 className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    {post.title}
                </h2>

                {/* Content */}
                <div className="text-sm text-muted-foreground line-clamp-4">
                    {post.content}
                </div>


                {/* Image */}
                {post.image && (
                    <div className="rounded-lg overflow-hidden border border-primary/10">
                        <img
                            src={post.image || "/placeholder.svg"}
                            alt="Post attachment"
                            className="w-full max-h-80 object-cover"
                        />
                    </div>
                )}

                {/* External Link */}
                {post.link && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <a
                            href={post.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                            <ExternalLink className="h-4 w-4" />
                            <span className="truncate">{post.link}</span>
                        </a>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 pt-2 border-t border-primary/10">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleUpvote}
                        className={`flex items-center gap-2 hover:bg-green-500/10 ${isUpvoted ? "text-green-600 bg-green-500/10" : "text-muted-foreground"
                            }`}
                    >
                        <ThumbsUp className="h-4 w-4" />
                        <span className="text-sm">{upvotes}</span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDownvote}
                        className={`flex items-center gap-2 hover:bg-red-500/10 ${isDownvoted ? "text-red-600 bg-red-500/10" : "text-muted-foreground"
                            }`}
                    >
                        <ThumbsDown className="h-4 w-4" />
                        <span className="text-sm">{downvotes}</span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleComment}
                        className="flex items-center gap-2 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-600"
                    >
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-sm">{comments} Comments</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default PostCard
