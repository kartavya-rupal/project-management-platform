import { Button } from "./ui/button"
import Link from "next/link"
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import { PenBox } from "lucide-react"
import UserMenu from "./User-Menu"
import { saveUserToDB } from "@/lib/user"

const Header = async () => {
    await saveUserToDB();
    return (
        <header className=" z-50 w-full dotted-background bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50">
            <div className="container px-4 sm:px-6 lg:px-8">
                <nav className="flex h-16 items-center justify-between pt-5">
                    <Link href="/" className="group relative flex items-center gap-2">
                        <div className="absolute -inset-1 -z-10 scale-95 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 blur transition-all duration-300 group-hover:scale-100 group-hover:opacity-100"></div>
                        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent transition-all duration-300 group-hover:from-primary/80 group-hover:to-primary">
                            WORKLY
                        </h1>
                    </Link>

                    <div className="flex items-center gap-4">
                        <Link href="/project/create">
                            <Button
                                variant="default"
                                className="relative overflow-hidden rounded-full px-5 py-2 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 hover:cursor-pointer"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-90"></span>
                                <span className="relative flex items-center gap-2 text-primary-foreground">
                                    <PenBox size={18} className="animate-pulse" />
                                    <span className="hidden md:inline font-medium">Create Project</span>
                                </span>
                            </Button>
                        </Link>

                        <SignedOut>
                            <SignInButton forceRedirectUrl="/onboarding">
                                <Button
                                    variant="outline"
                                    className="rounded-full border-primary/30 bg-background/50 px-5 py-2 text-primary shadow-sm backdrop-blur transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:text-primary hover:shadow-md"
                                >
                                    Login
                                </Button>
                            </SignInButton>
                        </SignedOut>

                        <SignedIn>
                            <div className="relative group">
                                <div className="absolute -inset-1.5 -z-10 rounded-full bg-gradient-to-r from-primary/20 to-primary/5 opacity-0 blur transition-all duration-300 group-hover:opacity-100"></div>
                                <UserMenu />
                            </div>
                        </SignedIn>
                    </div>
                </nav>
            </div>
        </header>
    )
}

export default Header

