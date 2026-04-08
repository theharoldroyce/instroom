"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import {
  IconChartBar,
  IconDashboard,
  IconHelp,
  IconSearch,
  IconSettings,
  IconUsers,
  IconGitBranch,
  IconCircleCheck,
  IconMail,
  IconPalette,
  IconBuildingStore,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"

import Image from "next/image"
import { title } from "process"

const navData = {
  navMain: [
    { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
    { title: "Influencer Discovery", url: "/dashboard/influencer-discovery", icon: IconSearch },
    { title: "Inbox", url: "/dashboard/inbox", icon: IconMail },
    { title: "Influencers List", url: "/dashboard/manage-influencers", icon: IconUsers },
    { title: "Pipeline", url: "/dashboard/pipeline", icon: IconGitBranch },
    { title: "Brand Partners", url: "/dashboard/brand-partners", icon: IconBuildingStore },
    // { title: "Closed", url: "/dashboard/closed", icon: IconCircleCheck },
    { title: "Analytics", url: "/dashboard/analytics", icon: IconChartBar },
  ],

  navSecondary: [
    { title: "Team & Collaborators", url: "/dashboard/settings/collaborators", icon: IconSettings },
    { title: "Branding", url: "/dashboard/settings/branding", icon: IconPalette },
    { title: "Get Help", url: "#", icon: IconHelp },
    
  ],
}

export function AppSidebar({
  setView,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  setView?: (view: string) => void
}) {
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)
  const [brandId, setBrandId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    // Read brandId from URL search params
    const params = new URLSearchParams(window.location.search)
    setBrandId(params.get("brandId"))
  }, [])

  // Prevent hydration mismatch
  if (!mounted) return null

  const userData = {
    name: session?.user?.name || "User",
    email: session?.user?.email || "",
    avatar: session?.user?.image || "/avatars/default.jpg",
  }

  return (
    <Sidebar
      collapsible="offcanvas"
      className="bg-[#0F6B3E] text-[#F7F9F8]"
      {...props}
    >

      {/* HEADER */}
      <SidebarHeader className="h-24 flex items-center px--4 border-b border-white/10 bg-[#0F6B3E]">
        <button
          onClick={() => setView?.("dashboard")}
          className="flex items-center w-full"
        >
          <Image
            src="/INSTROOM WHITE.png"
            alt="Instroom Logo"
            width={150}
            height={32}
            className="object-contain"
            priority
          />
        </button>
      </SidebarHeader>

      {/* MENU */}
      <SidebarContent className="bg-[#0F6B3E] text-[#F7F9F8] px-2">
        <NavMain items={navData.navMain} brandId={brandId} />
        <NavSecondary items={navData.navSecondary} brandId={brandId} className="mt-auto" />
      </SidebarContent>

      {/* USER */}
      <SidebarFooter className="border-t border-white/10 bg-[#0F6B3E]">
        <NavUser user={userData} />
      </SidebarFooter>

    </Sidebar>
  )
}