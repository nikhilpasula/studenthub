import Link from "next/link";
import { Suspense } from "react";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight, CheckCircle2, Calendar, Award } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation Header */}
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-2">
          <div className="size-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
            <GraduationCap className="size-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">
            Student<span className="text-primary">Hub</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Suspense>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm">
                  Get Started
                </Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Dashboard
                </Button>
              </Link>
              <UserButton />
            </Show>
          </Suspense>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-4xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          <CheckCircle2 className="size-3.5" />
          The all-in-one student workspace
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
          Supercharge your studies &amp; build your <span className="text-primary">portfolio</span>.
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Manage your tasks, track courses and deadlines, maintain good habits, and showcase your verified skills and achievements to the world.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
          <Link href="/dashboard">
            <Button size="lg" className="gap-2 px-6">
              Go to Dashboard <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link href="/dashboard/tasks">
            <Button variant="outline" size="lg" className="gap-2">
              Explore Tasks
            </Button>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 text-left w-full max-w-3xl">
          <div className="p-5 rounded-xl border border-border bg-card/60 space-y-2">
            <div className="size-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
            <h3 className="font-semibold text-foreground">Task &amp; Deadline Tracker</h3>
            <p className="text-xs text-muted-foreground">
              Prioritize homework, assignments, and projects with real-time status management.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card/60 space-y-2">
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Calendar className="size-4" />
            </div>
            <h3 className="font-semibold text-foreground">Courses &amp; Schedule</h3>
            <p className="text-xs text-muted-foreground">
              Organize classes, exam dates, instructor contacts, and notes seamlessly.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card/60 space-y-2">
            <div className="size-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Award className="size-4" />
            </div>
            <h3 className="font-semibold text-foreground">Public Portfolio</h3>
            <p className="text-xs text-muted-foreground">
              Publish your skills, projects, and verified certificates with a shareable URL.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} StudentHub. Built for student productivity.
      </footer>
    </div>
  );
}
