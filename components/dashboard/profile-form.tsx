"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, ProfileInput } from "@/lib/validations/profile";
import { updateProfile } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  User,
  GraduationCap,
  Globe,
  Share2,
  CheckCircle2,
  Loader2,
  Save,
  AtSign,
} from "lucide-react";

export interface ProfileUserData {
  id: string;
  name: string | null;
  email: string;
  username: string | null;
  avatarUrl: string | null;
  bio: string | null;
  college: string | null;
  branch: string | null;
  year: number | null;
  isPortfolioPublic: boolean;
  socialLinks: {
    github?: string | null;
    linkedin?: string | null;
    twitter?: string | null;
  } | null;
}

interface ProfileFormProps {
  user: ProfileUserData;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isPublic, setIsPublic] = useState(user.isPortfolioPublic);
  const [currentUsername, setCurrentUsername] = useState(user.username || "");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      username: user.username || "",
      bio: user.bio || "",
      college: user.college || "",
      branch: user.branch || "",
      year: user.year ?? null,
      github: user.socialLinks?.github || "",
      linkedin: user.socialLinks?.linkedin || "",
      twitter: user.socialLinks?.twitter || "",
      isPortfolioPublic: user.isPortfolioPublic,
    },
  });

  const handleTogglePublic = (checked: boolean) => {
    setIsPublic(checked);
    setValue("isPortfolioPublic", checked);
  };

  const onSubmit = (data: ProfileInput) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        await updateProfile(data);
        setSuccessMessage("Your profile has been saved successfully!");
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to update profile"
        );
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Alert Messages */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 1. Basic Account Info */}
      <Card className="border border-border/80 shadow-xs">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <User className="size-4 text-primary" />
            <span>Personal Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Alex Johnson"
                {...register("name")}
                disabled={isPending}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-muted/50 cursor-not-allowed text-muted-foreground"
              />
              <p className="text-[11px] text-muted-foreground">
                Managed by your authentication account.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="username">Public Username</Label>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 h-8 rounded-l-lg border border-r-0 border-input bg-muted/60 text-muted-foreground text-xs select-none">
                <AtSign className="size-3.5 mr-1" />
              </span>
              <Input
                id="username"
                placeholder="alexj"
                className="rounded-l-none"
                {...register("username", {
                  onChange: (e) => setCurrentUsername(e.target.value),
                })}
                disabled={isPending}
              />
            </div>
            {errors.username && (
              <p className="text-xs text-destructive">{errors.username.message}</p>
            )}
            <p className="text-[11px] text-muted-foreground">
              Used for your public student portfolio handle. Letters, numbers, and hyphens only.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">About Me / Bio</Label>
            <Textarea
              id="bio"
              placeholder="Computer Science undergraduate passionate about distributed systems and machine learning..."
              rows={3}
              {...register("bio")}
              disabled={isPending}
            />
            {errors.bio && (
              <p className="text-xs text-destructive">{errors.bio.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 2. Academic Background */}
      <Card className="border border-border/80 shadow-xs">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <GraduationCap className="size-4 text-primary" />
            <span>Academic Background</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="college">College / University</Label>
              <Input
                id="college"
                placeholder="e.g., Stanford University"
                {...register("college")}
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="branch">Major / Branch</Label>
              <Input
                id="branch"
                placeholder="e.g., Computer Engineering"
                {...register("branch")}
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="year">Year of Study</Label>
              <select
                id="year"
                {...register("year", {
                  setValueAs: (v) =>
                    v === "" || v === null || isNaN(Number(v)) ? null : Number(v),
                })}
                disabled={isPending}
                className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-card"
              >
                <option value="">-- Select Year --</option>
                <option value="1">1st Year (Freshman)</option>
                <option value="2">2nd Year (Sophomore)</option>
                <option value="3">3rd Year (Junior)</option>
                <option value="4">4th Year (Senior)</option>
                <option value="5">5th Year</option>
                <option value="6">Graduate / Masters</option>
                <option value="7">PhD Candidate</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Social & Professional Profiles */}
      <Card className="border border-border/80 shadow-xs">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Globe className="size-4 text-primary" />
            <span>Social &amp; Professional Links</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="github">GitHub Profile</Label>
              <Input
                id="github"
                placeholder="https://github.com/username"
                {...register("github")}
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="linkedin">LinkedIn Profile</Label>
              <Input
                id="linkedin"
                placeholder="https://linkedin.com/in/username"
                {...register("linkedin")}
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="twitter">Twitter / X</Label>
              <Input
                id="twitter"
                placeholder="https://x.com/username"
                {...register("twitter")}
                disabled={isPending}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Portfolio Visibility Toggle */}
      <Card className="border border-border/80 shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Share2 className="size-4 text-primary" />
            <span>Public Portfolio Visibility</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/60 bg-muted/20">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground">
                  Make Portfolio Public
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isPublic
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isPublic ? "Public" : "Private"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                When enabled, your public projects, skills, certificates, and achievements will be viewable at your student profile URL.
              </p>
              {isPublic && currentUsername && (
                <div className="text-xs font-mono text-primary pt-1">
                  Shareable link: /@{currentUsername}
                </div>
              )}
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => handleTogglePublic(e.target.checked)}
                disabled={isPending}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="submit"
          size="default"
          disabled={isPending}
          className="gap-2 px-6 shadow-xs"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="size-4" />
              <span>Save Profile</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
