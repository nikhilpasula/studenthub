"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BookOpen,
  FileText,
  Flame,
  Target,
  FolderGit2,
  Award,
  BadgeCheck,
  User,
  GraduationCap,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  userName?: string | null;
  username?: string | null;
  isPortfolioPublic?: boolean;
}

const academicItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Tasks", href: "/dashboard/tasks", icon: CheckSquare, exact: false },
  { label: "Calendar", href: "/dashboard/calendar", icon: Calendar, exact: false },
  { label: "Courses", href: "/dashboard/courses", icon: BookOpen, exact: false },
  { label: "Notes", href: "/dashboard/notes", icon: FileText, exact: false },
  { label: "Habits", href: "/dashboard/habits", icon: Flame, exact: false },
  { label: "Goals", href: "/dashboard/goals", icon: Target, exact: false },
];

const portfolioItems = [
  { label: "Projects", href: "/dashboard/projects", icon: FolderGit2, exact: false },
  { label: "Skills", href: "/dashboard/skills", icon: Award, exact: false },
  { label: "Certificates", href: "/dashboard/certificates", icon: BadgeCheck, exact: false },
  { label: "Profile", href: "/dashboard/profile", icon: User, exact: false },
];

export function MobileNav({ userName, username, isPortfolioPublic }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden size-9 text-muted-foreground hover:text-foreground"
        onClick={() => setIsOpen(true)}
        aria-label="Open Navigation Menu"
      >
        <Menu className="size-5" />
      </Button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 w-3/4 max-w-xs bg-card border-r border-border p-5 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  <GraduationCap className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-base text-foreground leading-tight">
                    Student<span className="text-primary">Hub</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Menu
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setIsOpen(false)}
                aria-label="Close Navigation Menu"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Nav list */}
            <div className="flex-1 overflow-y-auto py-4 space-y-5">
              {/* Academics */}
              <div className="space-y-1">
                <span className="px-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Academics
                </span>
                {academicItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleLinkClick}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Public Portfolio */}
              <div className="space-y-1 pt-2 border-t border-border/50">
                <span className="px-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Public Portfolio
                </span>
                {portfolioItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleLinkClick}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-border mt-auto space-y-2">
              {isPortfolioPublic && username ? (
                <Link
                  href={`/@${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleLinkClick}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-semibold"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="truncate">View Public Portfolio</span>
                  </div>
                  <ExternalLink className="size-3.5 shrink-0" />
                </Link>
              ) : (
                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40 text-[11px] text-muted-foreground truncate">
                  {userName ? `Logged in as ${userName}` : "StudentHub"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
