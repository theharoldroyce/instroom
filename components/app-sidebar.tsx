"use client"

import * as React from "react"
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

const data = {
  user: {
    name: "Instroom.io",
    email: "instroom@example.com",
    avatar: "/avatars/instroom.jpg",
  },

  navMain: [
    { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
    { title: "Inbox", url: "/dashboard/inbox", icon: IconMail },
    { title: "Influencers List", url: "/dashboard/manage-influencers", icon: IconUsers },
    { title: "Pipeline", url: "/dashboard/pipeline", icon: IconGitBranch },
    { title: "Closed", url: "/dashboard/closed", icon: IconCircleCheck },
    { title: "Analytics", url: "/dashboard/analytics", icon: IconChartBar },
  ],

  navSecondary: [
    { title: "Settings", url: "#", icon: IconSettings },
    { title: "Get Help", url: "#", icon: IconHelp },
    { title: "Search", url: "#", icon: IconSearch },
  ],
}

export function AppSidebar({
  setView,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  setView?: (view: string) => void
}) {
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
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      {/* USER */}
      <SidebarFooter className="border-t border-white/10 bg-[#0F6B3E]">
        <NavUser user={data.user} />
      </SidebarFooter>

    </Sidebar>
  )
}