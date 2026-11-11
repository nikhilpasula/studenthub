"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  FileText,
  BookOpen,
  Target,
  Flame,
  FolderGit2,
  Award,
  BadgeCheck,
  User,
  GraduationCap,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userName?: string | null;
  username?: string | null;
  isPortfolioPublic?: boolean;
}

const workspaceNavItems = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Tasks",
    href: "/dashboard/tasks",
    icon: CheckSquare,
    exact: false,
  },
  {
    label: "Calendar",
    href: "/dashboard/calendar",
    icon: Calendar,
    exact: false,
  },
  {
    label: "Courses",
    href: "/dashboard/courses",
    icon: BookOpen,
    exact: false,
  },
  {
    label: "Notes",
    href: "/dashboard/notes",
    icon: FileText,
    exact: false,
  },
  {
    label: "Habits",
    href: "/dashboard/habits",
    icon: Flame,
    exact: false,
  },
  {
    label: "Goals",
    href: "/dashboard/goals",
    icon: Target,
    exact: false,
  },
];

const portfolioNavItems = [
  {
    label: "Projects",
    href: "/dashboard/projects",
    icon: FolderGit2,
    exact: false,
  },
  {
    label: "Skills",
    href: "/dashboard/skills",
    icon: Award,
    exact: false,
  },
  {
    label: "Certificates",
    href: "/dashboard/certificates",
    icon: BadgeCheck,
    exact: false,
  },
  {
    label: "Profile Settings",
    href: "/dashboard/profile",
    icon: User,
    exact: false,
  },
];

export function Sidebar({ userName, username, isPortfolioPublic }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 border-b border-border px-6 flex items-center gap-2">
        <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
          <GraduationCap className="size-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-tight tracking-tight text-foreground">
            Student<span className="text-primary">Hub</span>
          </span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            Workspace
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3.5 space-y-4 overflow-y-auto">
        {/* Academic Workspace Section */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Academics
          </div>
          {workspaceNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("size-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Public Portfolio Section */}
        <div className="space-y-1 pt-2 border-t border-border/50">
          <div className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Public Portfolio
          </div>
          {portfolioNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("size-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Public Portfolio Quick Link if Enabled */}
      <div className="p-3.5 border-t border-border mt-auto space-y-2">
        {isPortfolioPublic && username ? (
          <Link
            href={`/@${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2.5 rounded-lg bg-primary/10 hover:bg-primary/15 text-primary border border-primary/20 transition-all text-xs font-semibold group"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="truncate">View Public Portfolio</span>
            </div>
            <ExternalLink className="size-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        ) : (
          <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40 text-[11px] text-muted-foreground">
            {userName ? `Logged in as ${userName}` : "StudentHub Workspace"}
          </div>
        )}
      </div>
    </aside>
  );
}
