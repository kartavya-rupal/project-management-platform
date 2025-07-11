"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Pencil } from "lucide-react"
import PostCreateDrawer from "./PostCreateDrawer"

const PostCreateButton = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    return (
        <>
            <Button
                onClick={() => setIsDrawerOpen(true)}
                size="lg"
                className="fixed bottom-6 right-6 z-50 h-14 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-r from-primary to-primary/80 hover:shadow-primary/20 group cursor-pointer"
            >
                <div className="flex items-center gap-2">
                    <div className="p-1 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors duration-200">
                        <Plus className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="font-medium text-primary-foreground">New Post</span>
                    <Pencil className="h-4 w-4 text-primary-foreground/80 group-hover:text-primary-foreground transition-colors duration-200" />
                </div>
            </Button>

            <PostCreateDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        </>
    )
}

export default PostCreateButton
