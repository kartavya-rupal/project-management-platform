"use client"
import Image from "next/image"
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel"
import Autoplay from "embla-carousel-autoplay"

const companies = [
    { name: "Microsoft", logo: "/microsoft-5.svg" },
    { name: "Google", logo: "/google-1-1.svg" },
    { name: "Amazon", logo: "/logo-amazon.svg" },
    { name: "Apple", logo: "/apple-11.svg" },
    { name: "Meta", logo: "/meta-3.svg" },
    { name: "Netflix", logo: "/netflix-3.svg" },
    { name: "Tesla", logo: "/tesla-9.svg" },
    { name: "Spotify", logo: "/spotify-logo-with-text-2.svg" },
]

const CompanyCarousel = () => {
    return (
        <section className="py-16 px-5 relative overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(var(--primary-rgb),0.08),transparent_60%)]"></div>
            <div className="container mx-auto">
                <div className="text-center mb-20">
                    <h3 className="text-3xl font-bold mb-12 text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Trusted by industry leaders worldwide
                    </h3>
                </div>

                <Carousel
                    plugins={[
                        Autoplay({
                            delay: 1500,
                            stopOnInteraction: false,
                            stopOnMouseEnter: true,
                        }),
                    ]}
                    className="w-full"
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                >
                    <CarouselContent className="-ml-4">
                        {/* Duplicate companies array for seamless infinite scroll */}
                        {[...companies, ...companies].map(({ name, logo }, index) => (
                            <CarouselItem
                                key={`${name}-${index}`}
                                className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
                            >
                                <div className="flex justify-center items-center h-20">
                                    <div className="relative group cursor-pointer">
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                                        <div className="relative p-4 rounded-lg transition-all duration-300 group-hover:scale-105">
                                            <Image
                                                src={logo || "/placeholder.svg"}
                                                alt={`${name} logo`}
                                                width={120}
                                                height={48}
                                                className="h-8 sm:h-10 md:h-12 w-auto object-contain opacity-60 filter grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-300"
                                                priority={index < 8}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>

                {/* Gradient overlays for smooth edges */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-24 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-16 h-24 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none"></div>
            </div>
        </section>
    )
}

export default CompanyCarousel
