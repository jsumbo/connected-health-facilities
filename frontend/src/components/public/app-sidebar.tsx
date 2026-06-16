"use client"

import Link from "next/link"
import { useEffect } from "react"
import { usePathname } from "next/navigation"
import {
  Building2,
  ClipboardCheck,
  GitCompare,
  GraduationCap,
  LayoutDashboard,
  Map,
  MessageSquareHeart,
  Network,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/map", label: "Map", icon: Map },
  { href: "/facilities", label: "Facilities", icon: Building2 },
  { href: "/clusters", label: "Clusters", icon: Network },
  { href: "/compare", label: "Compare", icon: GitCompare },
  { href: "/sentiment", label: "Staff sentiment", icon: MessageSquareHeart },
  { href: "/dla", label: "Digital literacy", icon: GraduationCap },
  { href: "/data-quality", label: "Data quality", icon: ClipboardCheck },
] as const

export function AppSidebar() {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()

  useEffect(() => {
    setOpenMobile(false)
  }, [pathname, setOpenMobile])

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        <Link
          href="/"
          onClick={handleNavClick}
          className="group-data-[collapsible=icon]:hidden"
        >
          <span className="font-serif text-base font-semibold leading-tight text-sidebar-foreground">
            Readiness dashboard
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} onClick={handleNavClick} />}
                      isActive={active}
                      tooltip={item.label}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <p className="text-[10px] leading-relaxed text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden">
          Ministry of Health · NHIC
          <br />
          Sand Technologies
        </p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
