import { ThemeProvider } from "@/components/themeProvider.jsx";
import "./globals.css";
import { Inter } from "next/font/google";
import Header from "@/components/Header.jsx";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes"
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

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
            <footer className="bg-[#161D29] py-12">
              <div className="mx-auto container px-4 text-center text-gray-400">
                <p>Made with ❤️ by Kartavya Rupal</p>
              </div>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider >
  );
}
