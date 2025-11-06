'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import UserAvatar from '@/components/UserAvatar'
import { formatDistanceToNow } from 'date-fns'
import { Clock, ThumbsUp, ThumbsDown, MessageCircle, MoreHorizontal, Edit, Trash2, ExternalLink } from 'lucide-react'
import MDEditor from '@uiw/react-md-editor'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { votePost, addComment, deleteComment, deletePost } from '@/actions/post'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
// Optional: bring in your drawer if you have it
import PostEditDrawer from './PostEditDrawer'

export default function PostComponent({ post, organisationId }) {
    const { user } = useUser()
    const clerkId = user?.id

    const initial = useMemo(() => {
        const up = post.votes.filter(v => v.value === 1).length
        const down = post.votes.filter(v => v.value === -1).length
        const mine = post.votes.find(v => v.user?.clerkUserId === clerkId)?.value ?? 0
        return { up, down, mine }
    }, [post.votes, clerkId])

    const [upvotes, setUpvotes] = useState(initial.up)
    const [downvotes, setDownvotes] = useState(initial.down)
    const [isUpvoted, setIsUpvoted] = useState(initial.mine === 1)
    const [isDownvoted, setIsDownvoted] = useState(initial.mine === -1)
    const [showComments, setShowComments] = useState(false)
    const [newComment, setNewComment] = useState('')
    const [commentItems, setCommentItems] = useState(post.comments ?? [])
    const [editingPost, setEditingPost] = useState(false)

    useEffect(() => {
        setUpvotes(initial.up)
        setDownvotes(initial.down)
        setIsUpvoted(initial.mine === 1)
        setIsDownvoted(initial.mine === -1)
    }, [initial.up, initial.down, initial.mine])

    async function onUpvote() {
        const togglingOff = isUpvoted
        if (togglingOff) { setIsUpvoted(false); setUpvotes(v => v - 1) }
        else { setIsUpvoted(true); setUpvotes(v => v + 1); if (isDownvoted) { setIsDownvoted(false); setDownvotes(v => v - 1) } }
        try { await votePost({ postId: post.id, value: 1 }) } catch (e) { toast.error(e?.message ?? 'Vote failed') }
    }

    async function onDownvote() {
        const togglingOff = isDownvoted
        if (togglingOff) { setIsDownvoted(false); setDownvotes(v => v - 1) }
        else { setIsDownvoted(true); setDownvotes(v => v + 1); if (isUpvoted) { setIsUpvoted(false); setUpvotes(v => v - 1) } }
        try { await votePost({ postId: post.id, value: -1 }) } catch (e) { toast.error(e?.message ?? 'Vote failed') }
    }

    async function onSubmitComment() {
        if (!newComment.trim()) return
        try {
            const created = await addComment({ postId: post.id, content: newComment })
            setCommentItems(prev => [created, ...prev])
            setNewComment('')
            toast.success('Comment added')
        } catch (e) {
            toast.error(e?.message ?? 'Could not add comment')
        }
    }

    async function onDeleteComment(id) {
        try {
            await deleteComment(id)
            setCommentItems(prev => prev.filter(c => c.id !== id))
            toast.success('Comment deleted')
        } catch (e) {
            toast.error(e?.message ?? 'Could not delete comment')
        }
    }

    async function handleDeletePost() {
        try {
            await deletePost(post.id)
            toast.success('Post deleted')
        } catch (e) {
            toast.error(e?.message ?? 'Could not delete post')
        }
    }

    const handleEdit = (e) => {
        e.stopPropagation()
        setEditingPost(post)
    }

    return (
        <div className="w-full max-w-screen-xl mx-auto space-y-6">
            <Card className="relative overflow-hidden border border-primary/10 bg-background/60 backdrop-blur-md">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

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

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-primary/10 rounded-full"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={handleEdit}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Post
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={handleDeletePost}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Post
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>

                <CardContent className="relative z-10 space-y-6">
                    <div className="prose prose-lg max-w-none">
                        <MDEditor.Markdown source={post.content} data-color-mode="light" className="bg-transparent" />
                    </div>

                    {post.image && (
                        <div className="rounded-xl overflow-hidden border border-primary/10 shadow-sm">
                            <img src={post.image || '/placeholder.svg'} alt="Post attachment" className="w-full max-h-96 object-cover" />
                        </div>
                    )}

                    {/* External Link */}
                    {post.link && (
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                            <div className="flex items-center gap-2 mb-2">
                                <ExternalLink className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium text-primary">External Link</span>
                            </div>
                            <a
                                href={post.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80 transition-colors break-all"
                            >
                                {post.link}
                            </a>
                        </div>
                    )}

                    <div className="flex items-center gap-4 pt-4 border-t border-primary/10">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onUpvote}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${isUpvoted ? 'text-green-600 bg-green-500/10 hover:bg-green-500/20' : 'text-muted-foreground hover:bg-green-500/10 hover:text-green-600'
                                }`}
                        >
                            <ThumbsUp className="h-4 w-4" />
                            <span className="font-medium">{upvotes}</span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onDownvote}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${isDownvoted ? 'text-red-600 bg-red-500/10 hover:bg-red-500/20' : 'text-muted-foreground hover:bg-red-500/10 hover:text-red-600'
                                }`}
                        >
                            <ThumbsDown className="h-4 w-4" />
                            <span className="font-medium">{downvotes}</span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowComments(v => !v)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full text-muted-foreground hover:bg-blue-500/10 hover:text-blue-600 transition-all duration-200"
                        >
                            <MessageCircle className="h-4 w-4" />
                            <span className="font-medium">{commentItems?.length ?? 0} Comments</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {showComments && (
                <Card className="relative overflow-hidden border border-primary/10 bg-background/60 backdrop-blur-md animate-in fade-in slide-in-from-top-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                    <CardHeader className="relative z-10 pb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <MessageCircle className="h-5 w-5 text-primary" />
                            Comments ({commentItems?.length ?? 0})
                        </h2>
                    </CardHeader>

                    <CardContent className="relative z-10 space-y-6">
                        {/* Comment Composer */}
                        <div className="p-4 rounded-xl border border-primary/10 bg-muted/10">
                            <div className="flex items-center gap-3 mb-3">
                                <UserAvatar user={{ name: user?.fullName ?? 'You', imageUrl: user?.imageUrl ?? '' }} />
                            </div>

                            <div className="space-y-3">
                                <Textarea
                                    placeholder="Share your thoughts..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="w-full h-32 resize-none bg-background border-border text-sm rounded-lg focus-visible:ring-1 focus-visible:ring-primary focus-visible:outline-none"
                                />

                                {/* Show buttons only when there is input */}
                                {newComment.trim() && (
                                    <div className="mt-3 flex justify-end gap-2">
                                        <Button
                                            onClick={() => setNewComment('')}
                                            variant="secondary"
                                            size="sm"
                                            className="px-4 cursor-pointer"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={onSubmitComment}
                                            disabled={!newComment.trim()}
                                            size="sm"
                                            className="bg-gradient-to-r cursor-pointer from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/20"
                                        >
                                            Post Comment
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Comments list */}
                        <div className="space-y-4">
                            {commentItems?.map((comment) => (
                                <div
                                    key={comment.id}
                                    className="w-full p-4 rounded-xl bg-background/60 border border-primary/10 hover:border-primary/20 transition-all duration-200"
                                >
                                    {/* Top Row: Avatar + Time + Delete */}
                                    <div className="flex items-center justify-between w-full">
                                        {/* Left side: Avatar + time inline */}
                                        <div className="flex items-center gap-2">
                                            <UserAvatar user={comment.author} />
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                •  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>

                                        {comment.author?.clerkUserId === clerkId && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-600 rounded-full hover:bg-red-500/10 cursor-pointer"
                                                onClick={() => onDeleteComment(comment.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>

                                    {/* Comment Text */}
                                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap break-words w-full">
                                        {comment.content}
                                    </p>
                                </div>
                            ))}
                        </div>


                    </CardContent>
                </Card>
            )}

            {/* Optional edit drawer if you use it elsewhere */}
            {editingPost && <PostEditDrawer post={post} onClose={() => setEditingPost(false)} />}
        </div>
    )
}
