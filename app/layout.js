import { ThemeProvider } from "@/components/ThemeProvider.jsx"
import "./globals.css"
import { Inter } from "next/font/google"
import Header from "@/components/Header.jsx"
import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import NextTopLoader from "nextjs-toploader"
import { Toaster } from "sonner"
import { Heart, Github, Linkedin } from "lucide-react"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} dotted-background`} suppressHydrationWarning>
          <NextTopLoader color="#CBD5E1" height={3} showSpinner={false} />
          <ThemeProvider attribute="class" defaultTheme="dark">
            <Header />
            <main className="min-h-screen">{children}</main>
            <Toaster />
            <footer className="relative border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
              <div className="relative mx-auto container px-4 py-12">
                <div className="text-center space-y-4">
                  <p className="text-lg font-medium text-foreground">The only place you&apos;ll enjoy being assigned something.</p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <span>Made with</span>
                    <Heart className="h-4 w-4 text-red-500 fill-current" />
                    <span>by Kartavya Rupal</span>
                  </div>
                  <div className="flex items-center justify-center gap-4 pt-2">
                    <a
                      href="https://github.com/kartavya-rupal"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                    <a
                      href="https://www.linkedin.com/in/kartavya-rupal-57765821b/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}