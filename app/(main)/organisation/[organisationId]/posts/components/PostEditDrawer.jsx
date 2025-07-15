"use client"

import { useEffect } from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, X, FileText, LinkIcon, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import useFetch from "@/hooks/use-fetch"
import { editPost } from "@/actions/post"
import MDEditor from "@uiw/react-md-editor"
import { postSchema } from "@/lib/validators"
import { useRouter } from "next/navigation"

const PostEditDrawer = ({ post, onClose }) => {
    const router = useRouter()

    const {
        fn: editPostFn,
        loading,
        error,
        data: editedPost
    } = useFetch(editPost)

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(postSchema),
        defaultValues: {
            title: post?.title || "",
            content: post?.content || "",
            image: post?.image || "",
            link: post?.link || "",
        },
    })

    // Reinitialize form when post changes
    useEffect(() => {
        if (post) {
            reset({
                title: post.title || "",
                content: post.content || "",
                image: post.image || "",
                link: post.link || "",
            })
        }
    }, [post, reset])

    const handleClose = () => {
        reset()
        onClose()
    }

    const onSubmit = async (data) => {
        try {
            await editPostFn(post.id, data)
            toast.success("Post updated successfully!")
        } catch (err) {
            toast.error("Failed to update post")
        }
    }

    useEffect(() => {
        if (editedPost) {
            handleClose()
            router.refresh()
        }
    }, [editedPost])

    return (
        <Drawer open={!!post} onClose={handleClose}>
            <DrawerContent className="max-h-[90vh] border border-primary/10 bg-background/95 backdrop-blur-md">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none rounded-t-lg"></div>

                <DrawerHeader className="relative z-10 border-b border-primary/10 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/10">
                                <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <DrawerTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                                    Edit Post
                                </DrawerTitle>
                                <p className="text-sm text-muted-foreground mt-1">Update your post information below</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClose}
                            className="rounded-full h-8 w-8 p-0 hover:bg-primary/10"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DrawerHeader>

                <div className="relative z-10 flex-1 overflow-y-auto">
                    {loading && (
                        <div className="flex items-center justify-center py-4 border-b border-primary/10 bg-primary/5">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span className="ml-2 text-sm text-primary">Updating post...</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <label htmlFor="title" className="block text-sm font-medium">
                                Post Title
                            </label>
                            <Input
                                id="title"
                                {...register("title")}
                                placeholder="Enter a compelling title for your post"
                                className={`bg-background border-border ${errors.title ? "border-red-300 focus:border-red-500" : "focus:border-primary"
                                    }`}
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                            <label htmlFor="content" className="block text-sm font-medium">
                                Content
                            </label>
                            <div className="border border-border rounded-lg overflow-hidden">
                                <Controller
                                    name="content"
                                    control={control}
                                    render={({ field }) => (
                                        <MDEditor
                                            value={field.value}
                                            onChange={field.onChange}
                                            data-color-mode="dark"
                                            height={250}
                                        />
                                    )}
                                />
                            </div>
                            {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
                        </div>

                        {/* Optional Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Image URL */}
                            <div className="space-y-2">
                                <label htmlFor="image" className="flex items-center gap-2 text-sm font-medium">
                                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                    Image URL (optional)
                                </label>
                                <Input
                                    id="image"
                                    {...register("image")}
                                    placeholder="https://example.com/image.png"
                                    className="bg-background border-border focus:border-primary"
                                />
                            </div>

                            {/* External Link */}
                            <div className="space-y-2">
                                <label htmlFor="link" className="flex items-center gap-2 text-sm font-medium">
                                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                    External Link (optional)
                                </label>
                                <Input
                                    id="link"
                                    {...register("link")}
                                    placeholder="https://example.com"
                                    className="bg-background border-border focus:border-primary"
                                />
                            </div>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 rounded-full bg-red-100">
                                        <X className="h-3 w-3 text-red-600" />
                                    </div>
                                    <p className="text-red-700 text-sm font-medium">Failed to update post</p>
                                </div>
                                <p className="text-red-600 text-sm mt-1">{error.message}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-primary/10">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={loading}
                                className="flex-1 bg-background border-primary/30 hover:bg-primary/5"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/20 transition-all duration-200"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    "Update Post"
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </DrawerContent>
        </Drawer>
    )
}

export default PostEditDrawer
