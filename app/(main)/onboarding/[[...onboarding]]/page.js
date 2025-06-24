"use client"

import { OrganizationList ,useOrganization } from "@clerk/nextjs"
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Onboarding = () => {

    const {organisation} = useOrganization()
    const router = useRouter();

    useEffect(() => {
        if (organisation) {
            router.push(`/organisation/${organisation.slug}`);
        }
    }, [organisation]);

    return (
        <div className="min-h-screen bg-transparent from-background to-background/95 py-12 px-4 sm:px-6 relative">
            {/* Background effects */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(var(--primary-rgb),0.15),transparent_70%)]"></div>

            <div className="max-w-4xl mx-auto">
                {/* Header section */}
                <div className="text-center mb-10 relative">

                    <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Welcome to Workly
                    </h1>
                    <p className="text-xl text-primary/80 max-w-2xl mx-auto">
                        Create or join an organization to get started with your projects
                    </p>
                </div>

                {/* Clerk component wrapper */}
                <div className="relative backdrop-blur-sm rounded-2xl border border-primary/10 overflow-hidden flex justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>

                    {/* Subtle glow effect */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>

                    {/* Clerk component */}
                    <div className="relative z-10 p-6">
                        <OrganizationList 
                            hidePersonal
                            afterSelectOrganizationUrl="/organisation/:slug"
                            afterCreateOrganizationUrl="/organisation/:slug"
                        />
                    </div>
                </div>

                {/* Footer note */}
                <div className="mt-8 text-center text-sm text-primary/60">
                    <p>Your organization helps you collaborate with your team on projects</p>
                </div>
            </div>
        </div>
    )
}

export default Onboarding

