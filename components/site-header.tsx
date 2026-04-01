"use client"

import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SiteHeader() {
  const pathname = usePathname()

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/manage-influencers": "Manage Influencers",
  "/dashboard/inbox": "Inbox",
  "/dashboard/pipeline": "Pipeline",
  "/dashboard/closed": "Closed Collaborations",
  "/dashboard/analytics": "Analytics",
  "/dashboard/influencer-discovery": "Influencer Discovery",
  "/dashboard/influencer-discovery/search": "Discovery › Search Results",
}

  const title = titles[pathname] || "Dashboard"

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b">
      <div className="flex w-full items-center gap-1 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4" />

        <h1 className="text-base font-medium">{title}</h1>

        <div className="ml-auto flex items-center gap-2"></div>
      </div>
    </header>
  )
}