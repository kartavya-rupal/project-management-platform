"use client"

import { usePathname } from "next/navigation"
import { OrganizationSwitcher, SignedIn, useOrganization, useUser } from "@clerk/nextjs"

const OrgSwitcher = () => {
  const { isLoaded } = useOrganization()
  const { isLoaded: isUserLoaded } = useUser()
  const pathname = usePathname()

  if (pathname === "/") {
    return null
  }

  if (!isLoaded || !isUserLoaded) {
    return <div className="h-10 w-40 rounded-full bg-primary/10 animate-pulse"></div>
  }

  return (
    <div className="flex justify-end">
      <SignedIn>
        <OrganizationSwitcher
          hidePersonal
          createOrganizationMode={pathname === "/onboarding" ? "navigation" : "modal"}
          afterCreateOrganizationUrl="/organisation/:slug"
          afterSelectOrganizationUrl="/organisation/:slug"
          createOrganizationUrl="/onboarding"
          appearance={{
            elements: {
              rootBox: "relative z-10",
              organizationSwitcherTrigger:
                "group relative overflow-hidden rounded-full border border-primary/30 bg-background/50 px-4 py-2 text-primary shadow-sm backdrop-blur transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:text-primary hover:shadow-md",
              organizationSwitcherTriggerIcon: "text-primary",
              organizationSwitcherPopoverCard:
                "backdrop-blur-md bg-background/90 border border-primary/20 rounded-xl shadow-lg",
              organizationPreviewTextContainer: "text-primary",
              organizationPreviewMainIdentifier: "font-medium",
              organizationPreviewSecondaryIdentifier: "text-primary/70",
              organizationSwitcherPopoverActionButton: "text-primary hover:text-primary/80",
              organizationSwitcherPopoverActionButtonIcon: "text-primary",
              organizationSwitcherPopoverFooter: "border-t border-primary/10",
              organizationPreviewAvatarBox: "bg-primary/10",
              organizationPreviewAvatarInitials: "text-primary",
              organizationSwitcherPopoverActionButtonText: "text-primary",
            },
          }}
        />
      </SignedIn>
    </div>
  )
}

export default OrgSwitcher

