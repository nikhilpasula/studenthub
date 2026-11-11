import { requireUser } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { UserNav } from "@/components/dashboard/user-nav";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import Link from "next/link";
import { GraduationCap, LayoutDashboard, CheckSquare, Calendar, BookOpen, FileText, User as UserIcon } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Desktop Sidebar (hidden on mobile) */}
      <Sidebar
        userName={user.name}
        username={user.username}
        isPortfolioPublic={user.isPortfolioPublic}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-card/60 backdrop-blur px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          {/* Mobile brand header with hamburger menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <MobileNav
              userName={user.name}
              username={user.username}
              isPortfolioPublic={user.isPortfolioPublic}
            />
            <div className="size-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold">
              <GraduationCap className="size-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-foreground">
              Student<span className="text-primary">Hub</span>
            </span>
          </div>

          {/* Desktop Greeting */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Welcome back, <span className="font-semibold text-foreground">{user.name || "Student"}</span>
            </span>
          </div>

          {/* Right Header: Profile UserButton */}
          <div className="flex items-center gap-4 ml-auto">
            <UserNav />
          </div>
        </header>

        {/* Mobile Navigation bar for easy mobile access */}
        <nav className="flex md:hidden items-center justify-around border-b border-border bg-card px-2 py-2 text-xs">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 p-1 text-muted-foreground hover:text-foreground">
            <LayoutDashboard className="size-4" />
            <span>Overview</span>
          </Link>
          <Link href="/dashboard/tasks" className="flex flex-col items-center gap-1 p-1 text-muted-foreground hover:text-foreground">
            <CheckSquare className="size-4" />
            <span>Tasks</span>
          </Link>
          <Link href="/dashboard/calendar" className="flex flex-col items-center gap-1 p-1 text-muted-foreground hover:text-foreground">
            <Calendar className="size-4" />
            <span>Calendar</span>
          </Link>
          <Link href="/dashboard/courses" className="flex flex-col items-center gap-1 p-1 text-muted-foreground hover:text-foreground">
            <BookOpen className="size-4" />
            <span>Courses</span>
          </Link>
          <Link href="/dashboard/notes" className="flex flex-col items-center gap-1 p-1 text-muted-foreground hover:text-foreground">
            <FileText className="size-4" />
            <span>Notes</span>
          </Link>
          <Link href="/dashboard/profile" className="flex flex-col items-center gap-1 p-1 text-muted-foreground hover:text-foreground">
            <UserIcon className="size-4" />
            <span>Profile</span>
          </Link>
        </nav>

        {/* Page Children Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
