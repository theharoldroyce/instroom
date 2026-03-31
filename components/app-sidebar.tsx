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
import Link from "next/link"
import { useSession } from "next-auth/react"

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
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()

  // Fallback if session is not loaded yet
  const user = session?.user
    ? {
        name: session.user.name || "User",
        email: session.user.email || "",
        avatar: session.user.image || "/avatars/instroom.jpg",
      }
    : {
        name: "Instroom.io",
        email: "instroom@example.com",
        avatar: "/avatars/instroom.jpg",
      }

  return (
    <Sidebar
      collapsible="offcanvas"
      className="bg-[#0F6B3E] text-[#F7F9F8]"
      {...props}
    >

      {/* HEADER */}
      <SidebarHeader className="h-24 flex items-center px-4 border-b border-white/10 bg-[#0F6B3E]">
        <Link href="/dashboard" className="flex items-center w-full">
          <Image
            src="/INSTROOM WHITE.png"
            alt="Instroom Logo"
            width={150}
            height={32}
            className="object-contain"
            priority
          />
        </Link>
      </SidebarHeader>

      {/* MENU */}
      <SidebarContent className="bg-[#0F6B3E] text-[#F7F9F8] px-2">
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      {/* USER */}
      <SidebarFooter className="border-t border-white/10 bg-[#0F6B3E]">
        <NavUser user={user} />
      </SidebarFooter>

    </Sidebar>
  )
}