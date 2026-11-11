"use client";

import { useSyncExternalStore } from "react";
import { UserButton } from "@clerk/nextjs";

const emptySubscribe = () => () => {};

export function UserNav() {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!isClient) {
    return <div className="size-8 rounded-full bg-muted/60 animate-pulse shrink-0" />;
  }

  return <UserButton />;
}
