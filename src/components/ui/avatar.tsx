"use client";

import { UserRound } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}

const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

export function Avatar({
  name,
  src,
  size = 40,
  className,
}: AvatarProps) {
  const [failedSource, setFailedSource] = useState<string>();
  const showImage = Boolean(src) && failedSource !== src;
  const initials = getInitials(name);

  return (
    <span
      role="img"
      aria-label={`${name}'s profile image`}
      style={{ width: size, height: size }}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-flow-100 font-bold text-flow-800",
        className,
      )}
    >
      {showImage && src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={`${size}px`}
          onError={() => setFailedSource(src)}
          className="object-cover"
        />
      ) : initials ? (
        <span aria-hidden="true">{initials}</span>
      ) : (
        <UserRound aria-hidden="true" className="size-1/2" />
      )}
    </span>
  );
}
