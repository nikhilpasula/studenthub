import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";

type ClerkWebhookEvent = {
  data: {
    id: string;
    email_addresses?: Array<{ email_address: string }>;
    first_name?: string | null;
    last_name?: string | null;
    username?: string | null;
    image_url?: string | null;
  };
  type: string;
};

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET in environment variables");
    return NextResponse.json(
      { error: "Webhook secret not configured on server" },
      { status: 500 }
    );
  }

  // Get svix verification headers
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing required svix headers" },
      { status: 400 }
    );
  }

  // Read raw body for svix cryptographic verification
  const payload = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: ClerkWebhookEvent;

  try {
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as unknown as ClerkWebhookEvent;
  } catch (err) {
    console.error("Error verifying Clerk webhook signature:", err);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  const eventType = evt.type;
  const { id, email_addresses, first_name, last_name, username, image_url } = evt.data;

  const email = email_addresses?.[0]?.email_address || "";
  const fullName = `${first_name ?? ""} ${last_name ?? ""}`.trim() || null;
  const cleanUsername = username?.trim().toLowerCase() || null;

  try {
    if (eventType === "user.created" || eventType === "user.updated") {
      if (!id || !email) {
        return NextResponse.json(
          { error: "Missing essential user identifier or email" },
          { status: 400 }
        );
      }

      await prisma.user.upsert({
        where: { clerkId: id },
        create: {
          clerkId: id,
          email,
          name: fullName,
          username: cleanUsername,
          avatarUrl: image_url || null,
        },
        update: {
          email,
          name: fullName,
          username: cleanUsername,
          avatarUrl: image_url || null,
        },
      });
    } else if (eventType === "user.deleted") {
      if (id) {
        await prisma.user.deleteMany({
          where: { clerkId: id },
        });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (dbError) {
    console.error(`Database error handling Clerk webhook ${eventType}:`, dbError);
    return NextResponse.json(
      { error: "Failed to synchronize user in database" },
      { status: 500 }
    );
  }
}
