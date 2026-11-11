import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm, ProfileUserData } from "@/components/dashboard/profile-form";
import { User } from "lucide-react";

export const metadata = {
  title: "Profile & Portfolio Settings | StudentHub",
  description: "Manage your student profile, academic information, social links, and public portfolio settings.",
};

export default async function ProfilePage() {
  const user = await requireUser();

  const dbUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
  });

  if (!dbUser) {
    throw new Error("User record not found");
  }

  // Parse social links JSON safely
  let socialLinks: {
    github?: string | null;
    linkedin?: string | null;
    twitter?: string | null;
  } = {};

  if (dbUser.socialLinks && typeof dbUser.socialLinks === "object") {
    const raw = dbUser.socialLinks as Record<string, unknown>;
    socialLinks = {
      github: typeof raw.github === "string" ? raw.github : null,
      linkedin: typeof raw.linkedin === "string" ? raw.linkedin : null,
      twitter: typeof raw.twitter === "string" ? raw.twitter : null,
    };
  }

  const profileData: ProfileUserData = {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    username: dbUser.username,
    avatarUrl: dbUser.avatarUrl,
    bio: dbUser.bio,
    college: dbUser.college,
    branch: dbUser.branch,
    year: dbUser.year,
    isPortfolioPublic: dbUser.isPortfolioPublic,
    socialLinks,
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <User className="size-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Profile Settings
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Update your student bio, academic details, social handles, and public portfolio availability.
        </p>
      </div>

      {/* Profile Form */}
      <ProfileForm user={profileData} />
    </div>
  );
}
