"use client"

import Link from "next/link"
import { ChevronRight, Layout, Calendar, BarChart, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import CompanyCarousel from "@/components/CompanyCarousel"

const faqs = [
  {
    question: "What is Workly?",
    answer:
      "Workly is a next-generation project management platform engineered to help teams collaborate seamlessly, stay organized, and maximize efficiency. With an intuitive interface and powerful features, Workly transforms the way you plan, track, and execute tasks.",
  },
  {
    question: "How does Workly compare to other project management tools?",
    answer:
      "Unlike conventional project management tools, Workly strikes the perfect balance between simplicity and power. It seamlessly adapts to both agile and traditional workflows, empowering teams with flexibility, advanced automation, and insightful analytics—ensuring you stay ahead of the curve.",
  },
  {
    question: "Is Workly suitable for small teams?",
    answer:
      "Workly is designed to be as effective for small teams as it is for large enterprises. Whether you're a startup or a growing business, Workly scales with you—offering an intuitive experience that minimizes the learning curve and maximizes productivity from day one.",
  },
  {
    question: "What key features does Workly offer?",
    answer:
      "Workly equips you with cutting-edge tools, including intuitive Kanban boards for seamless workflow visualization, dynamic sprint planning for agile execution, deep analytics for data-driven decisions, customizable workflows, real-time collaboration, and precise time tracking—empowering teams to operate at peak efficiency.",
  },
  {
    question: "Can Workly handle multiple projects simultaneously?",
    answer:
      "Yes! Workly is built for multi-tasking at scale. Effortlessly manage multiple projects, switch between them with ease, and gain a high-level overview of all ongoing tasks—giving you the control and clarity needed to drive results without compromise.",
  },
  {
    question: "Is there a learning curve for new users?",
    answer:
      "Not at all! Workly is designed for instant usability. With an intuitive interface, guided onboarding, and comprehensive documentation, new users can get started effortlessly—eliminating the complexity that often slows teams down.",
  },
]

const features = [
  {
    title: "Intuitive Kanban Boards",
    description:
      "Take control of your workflow with visually rich Kanban boards that simplify task management and boost team efficiency.",
    icon: Layout,
  },
  {
    title: "Powerful Sprint Planning",
    description:
      "Optimize agile execution with advanced sprint planning tools that keep your team aligned, focused, and ahead of deadlines.",
    icon: Calendar,
  },
  {
    title: "Comprehensive Reporting",
    description:
      "Turn data into actionable insights with detailed, real-time reporting that drives smarter decisions and better outcomes.",
    icon: BarChart,
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 dotted-background">
      {/* Hero Section */}
      <section className="container mx-auto py-40 text-center relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(var(--primary-rgb),0.15),transparent_50%)]"></div>
        <div className="relative">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold pb-6 flex flex-col">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary/90 to-primary/70 mb-4">
              Revolutionize Your Productivity
            </span>
            <span className="flex items-center justify-center gap-3 sm:gap-4">
              with
              <span className="relative group">
                <span className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500"></span>
                <span className="relative text-6xl sm:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Workly
                </span>
              </span>
            </span>
          </h1>
        </div>
        <div className="text-xl text-primary/80 mb-10 max-w-3xl mx-auto bg-transparent">
          <p>Supercharge your team with a powerful, seamless project management experience.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Link href="/onboarding">
            <Button
              size="lg"
              className="relative cursor-pointer overflow-hidden rounded-full px-6 py-3 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-90"></span>
              <span className="relative flex items-center gap-2 text-primary-foreground">
                Get Started Now
                <ChevronRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Button>
          </Link>
          <Link href="#features">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-primary/30 bg-background/50 px-6 py-3 text-primary shadow-sm backdrop-blur transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:text-primary hover:shadow-md"
            >
              Explore Features
            </Button>
          </Link>
        </div>
      </section>

      {/* Company Carousel Section */}
      <section className="py-20 mt-[-150px] mb-[-100px] md:mt-[-50px] md:mb-0">
        <div className="container mx-auto">
          <CompanyCarousel />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-5 relative ">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(var(--primary-rgb),0.1),transparent_70%)]"></div>
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold mb-12 text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Key Features
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden border border-primary/10 bg-background/60 backdrop-blur-md transition-all duration-300 hover:shadow-md hover:shadow-primary/10 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="pt-1 relative z-10 text-center flex flex-col items-center">
                  <div className="p-3 rounded-full bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="text-xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                    {feature.title}
                  </h4>
                  <p className="text-primary/80">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-5 relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,rgba(var(--primary-rgb),0.1),transparent_70%)]"></div>
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold mb-12 text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h3>
          <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto ">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-primary/20 py-2">
                <AccordionTrigger className="text-left font-medium hover:text-primary transition-colors  cursor-pointer">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-primary/80">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center px-5 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.15),transparent_60%)]"></div>
        <div className="container mx-auto relative">
          <Sparkles className="absolute top-0 left-1/4 text-primary/30 h-8 w-8 animate-pulse" />
          <Sparkles
            className="absolute bottom-0 right-1/4 text-primary/30 h-6 w-6 animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div className="relative backdrop-blur-sm py-10 px-6 rounded-2xl border border-primary/10 max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Ready to Transform Your Workflow?
            </h3>
            <p className="text-xl mb-12 text-primary/80">
              Join thousands of teams already using Workly to streamline their projects and boost productivity.
            </p>
            <Link href="/onboarding">
              <Button
                size="lg"
                className="relative overflow-hidden rounded-full px-6 py-3 shadow-md transition-all duration-500 hover:shadow-lg hover:shadow-primary/20 group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-90"></span>
                <span className="relative flex items-center gap-2 text-primary-foreground">
                  Start For Free
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </div>
  )
}
