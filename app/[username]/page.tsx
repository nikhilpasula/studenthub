import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { format } from "date-fns";
import { Show, SignInButton } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Mail,
  ExternalLink,
  Code2,
  Calendar,
  Award,
  BadgeCheck,
  Star,
  CheckCircle2,
  Layers,
  FolderGit2,
  ArrowRight,
  Sparkles,
  Globe,
} from "lucide-react";

interface PortfolioPageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PortfolioPageProps) {
  const { username } = await params;
  const decoded = decodeURIComponent(username).replace(/^@/, "");

  const user = await prisma.user.findUnique({
    where: { username: decoded },
    select: { name: true, username: true, isPortfolioPublic: true, bio: true },
  });

  if (!user || !user.isPortfolioPublic) {
    return {
      title: "Portfolio Not Found | StudentHub",
    };
  }

  return {
    title: `${user.name || user.username}'s Portfolio | StudentHub`,
    description: user.bio || `Academic and developer portfolio of ${user.name || user.username}.`,
  };
}

export default async function PublicPortfolioPage({ params }: PortfolioPageProps) {
  const { username } = await params;
  // Strip leading '@' if user navigates to /@username
  const cleanUsername = decodeURIComponent(username).replace(/^@/, "");

  const user = await prisma.user.findUnique({
    where: {
      username: cleanUsername,
    },
  });

  // Strict Security Rule: 404 if user does not exist or portfolio is not public
  if (!user || !user.isPortfolioPublic) {
    notFound();
  }

  // Fetch only public data for this user
  const [projects, skills, certificates] = await Promise.all([
    prisma.project.findMany({
      where: {
        userId: user.id,
        isPublic: true,
      },
      orderBy: [
        { featured: "desc" },
        { createdAt: "desc" },
      ],
    }),
    prisma.skill.findMany({
      where: {
        userId: user.id,
        isPublic: true,
      },
      orderBy: [
        { category: "asc" },
        { level: "desc" },
      ],
    }),
    prisma.certificate.findMany({
      where: {
        userId: user.id,
        isPublic: true,
      },
      orderBy: {
        issueDate: "desc",
      },
    }),
  ]);

  // Group public skills by category
  const skillsByCategory = skills.reduce<Record<string, typeof skills>>((acc, skill) => {
    const cat = skill.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  // Parse social links safely
  const socialLinks = (user.socialLinks && typeof user.socialLinks === "object"
    ? (user.socialLinks as Record<string, string | null>)
    : {}) as {
    github?: string | null;
    linkedin?: string | null;
    twitter?: string | null;
  };

  const academicYearLabel = user.year
    ? user.year === 1
      ? "1st Year (Freshman)"
      : user.year === 2
      ? "2nd Year (Sophomore)"
      : user.year === 3
      ? "3rd Year (Junior)"
      : user.year === 4
      ? "4th Year (Senior)"
      : `${user.year}th Year`
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
            <GraduationCap className="size-4" />
          </div>
          <span className="font-bold text-base tracking-tight text-foreground">
            Student<span className="text-primary">Hub</span>
          </span>
        </Link>

        {/* Anchors on desktop */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
          <a href="#about" className="hover:text-foreground transition-colors">
            About
          </a>
          {projects.length > 0 && (
            <a href="#projects" className="hover:text-foreground transition-colors">
              Projects ({projects.length})
            </a>
          )}
          {skills.length > 0 && (
            <a href="#skills" className="hover:text-foreground transition-colors">
              Skills ({skills.length})
            </a>
          )}
          {certificates.length > 0 && (
            <a href="#certificates" className="hover:text-foreground transition-colors">
              Certifications ({certificates.length})
            </a>
          )}
        </nav>

        {/* Auth Navigation CTA */}
        <div className="flex items-center gap-2">
          <Suspense fallback={<div className="h-8 w-20 bg-muted/60 rounded-md animate-pulse" />}>
            <Show when="signed-in">
              <Link href="/dashboard">
                <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                  <span>Dashboard</span>
                  <ArrowRight className="size-3.5" />
                </Button>
              </Link>
            </Show>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button size="sm" variant="outline" className="text-xs">
                  Sign In
                </Button>
              </SignInButton>
            </Show>
          </Suspense>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-16 sm:space-y-24">
        {/* 1. Hero Section */}
        <section id="about" className="space-y-6 pt-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar or Initials Badge */}
            <div className="size-20 sm:size-24 rounded-2xl bg-gradient-to-tr from-primary to-primary/60 text-primary-foreground flex items-center justify-center font-extrabold text-2xl sm:text-3xl shadow-md border-2 border-primary/20 shrink-0">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.name || "Student"}
                  className="size-full rounded-2xl object-cover"
                />
              ) : (
                <span>{(user.name || user.username || "S")[0].toUpperCase()}</span>
              )}
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                  {user.name || user.username}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="size-3.5" /> Verified Student
                </span>
              </div>

              {/* College & Academic Details */}
              <div className="flex flex-wrap items-center gap-y-1 gap-x-2 text-sm text-muted-foreground">
                {user.college && (
                  <span className="font-medium text-foreground">
                    {user.college}
                  </span>
                )}
                {user.college && (user.branch || academicYearLabel) && <span>•</span>}
                {user.branch && <span>{user.branch}</span>}
                {user.branch && academicYearLabel && <span>•</span>}
                {academicYearLabel && (
                  <span className="px-2 py-0.2 rounded bg-muted text-xs font-medium">
                    {academicYearLabel}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-base text-muted-foreground max-w-3xl leading-relaxed whitespace-pre-wrap pt-1">
              {user.bio}
            </p>
          )}

          {/* Social Links & Contact Action Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a href={`mailto:${user.email}`}>
              <Button size="sm" className="gap-2 shadow-xs">
                <Mail className="size-4" />
                <span>Get in Touch</span>
              </Button>
            </a>

            {socialLinks.github && (
              <a
                href={
                  socialLinks.github.startsWith("http")
                    ? socialLinks.github
                    : `https://github.com/${socialLinks.github}`
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="outline" className="gap-2">
                  <Code2 className="size-4" />
                  <span>GitHub</span>
                </Button>
              </a>
            )}

            {socialLinks.linkedin && (
              <a
                href={
                  socialLinks.linkedin.startsWith("http")
                    ? socialLinks.linkedin
                    : `https://linkedin.com/in/${socialLinks.linkedin}`
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="outline" className="gap-2">
                  <Globe className="size-4" />
                  <span>LinkedIn</span>
                </Button>
              </a>
            )}

            {socialLinks.twitter && (
              <a
                href={
                  socialLinks.twitter.startsWith("http")
                    ? socialLinks.twitter
                    : `https://x.com/${socialLinks.twitter.replace(/^@/, "")}`
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="outline" className="gap-2">
                  <span>Twitter / X</span>
                </Button>
              </a>
            )}
          </div>
        </section>

        {/* 2. Featured Projects Section */}
        {projects.length > 0 && (
          <section id="projects" className="space-y-6 scroll-mt-20">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <FolderGit2 className="size-5 text-primary" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Featured Projects
              </h2>
              <span className="text-xs text-muted-foreground ml-auto">
                {projects.length} {projects.length === 1 ? "Project" : "Projects"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex flex-col justify-between p-5 rounded-2xl border border-border/80 bg-card hover:border-primary/40 hover:shadow-xs transition-all space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        {project.featured && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            <Star className="size-3 fill-amber-500" />
                            Featured
                          </span>
                        )}
                        <h3 className="text-lg font-bold text-foreground">
                          {project.title}
                        </h3>
                        {project.role && (
                          <p className="text-xs font-semibold text-primary">
                            {project.role}
                          </p>
                        )}
                      </div>

                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">
                        {project.status.replace("_", " ")}
                      </span>
                    </div>

                    {project.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
                        {project.description}
                      </p>
                    )}

                    {project.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {project.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-secondary text-secondary-foreground border border-border/40"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Links */}
                  <div className="flex items-center gap-3 pt-3 border-t border-border/50 text-xs">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-semibold text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Code2 className="size-3.5" />
                        <span>Source Code</span>
                      </a>
                    )}

                    {project.githubUrl && project.liveUrl && (
                      <span className="text-muted-foreground/30">•</span>
                    )}

                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline transition-colors"
                      >
                        <ExternalLink className="size-3.5" />
                        <span>Live Preview</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. Skills Section */}
        {skills.length > 0 && (
          <section id="skills" className="space-y-6 scroll-mt-20">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Layers className="size-5 text-primary" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Skills &amp; Technologies
              </h2>
              <span className="text-xs text-muted-foreground ml-auto">
                {skills.length} Skills
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(skillsByCategory).map(([category, catSkills]) => (
                <div
                  key={category}
                  className="p-5 rounded-2xl border border-border/80 bg-card space-y-3"
                >
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="size-3.5 text-primary" />
                    <span>{category}</span>
                  </h3>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {catSkills.map((skill) => (
                      <div
                        key={skill.id}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/60 bg-muted/40 hover:bg-muted/70 transition-colors"
                      >
                        <span className="text-xs font-semibold text-foreground">
                          {skill.name}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground/80 px-1.5 py-0.2 rounded bg-background border border-border/40">
                          {skill.level === "EXPERT"
                            ? "Expert"
                            : skill.level === "ADVANCED"
                            ? "Advanced"
                            : skill.level === "INTERMEDIATE"
                            ? "Intermediate"
                            : "Beginner"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Certifications Section */}
        {certificates.length > 0 && (
          <section id="certificates" className="space-y-6 scroll-mt-20">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Award className="size-5 text-primary" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Certifications &amp; Credentials
              </h2>
              <span className="text-xs text-muted-foreground ml-auto">
                {certificates.length} {certificates.length === 1 ? "Credential" : "Credentials"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-4 rounded-xl border border-border/80 bg-card hover:border-primary/40 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                        <BadgeCheck className="size-4" />
                        <span>{cert.issuer}</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase px-1.5 py-0.2 rounded bg-muted">
                        {cert.category}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-foreground leading-snug">
                      {cert.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Calendar className="size-3" />
                      <span>Issued {format(new Date(cert.issueDate), "MMM yyyy")}</span>
                    </div>

                    {cert.credentialId && (
                      <p className="text-[10px] font-mono text-muted-foreground bg-muted/40 p-1 rounded truncate">
                        ID: {cert.credentialId}
                      </p>
                    )}
                  </div>

                  {cert.verificationUrl && (
                    <div className="pt-2 border-t border-border/50">
                      <a
                        href={cert.verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        <ExternalLink className="size-3.5" />
                        <span>Verify Credential</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/80 py-8 px-6 text-center text-xs text-muted-foreground space-y-2">
        <p className="font-medium text-foreground">
          {user.name || user.username}&apos;s Academic &amp; Developer Portfolio
        </p>
        <p>
          Powered by{" "}
          <Link href="/" className="font-semibold text-primary hover:underline">
            StudentHub
          </Link>{" "}
          • The all-in-one student workspace.
        </p>
      </footer>
    </div>
  );
}
