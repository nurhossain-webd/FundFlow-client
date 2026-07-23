"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SVGProps } from "react";

import { Logo } from "./logo";
import { PageContainer } from "./page-container";

function GitHubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.24c-3.22.7-3.9-1.37-3.9-1.37-.52-1.34-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.57-.29-5.27-1.28-5.27-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.16 1.18a10.9 10.9 0 0 1 5.76 0c2.19-1.49 3.16-1.18 3.16-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.71 5.39-5.29 5.68.42.36.79 1.07.79 2.16v3.26c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .7Z" />
    </svg>
  );
}

function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M5.37 7.98H1.75V19.5h3.62V7.98ZM3.56 2.5a2.1 2.1 0 1 0 0 4.2 2.1 2.1 0 0 0 0-4.2ZM22.25 12.9c0-3.47-1.85-5.08-4.33-5.08a4.28 4.28 0 0 0-3.88 2.13V7.98h-3.62V19.5h3.62v-5.7c0-1.5.29-2.96 2.15-2.96 1.84 0 1.86 1.72 1.86 3.06v5.6h3.62l.58-6.6Z" />
    </svg>
  );
}

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.39L6.48 22H3.36l7.25-8.29L2.96 2h6.4l4.42 5.84L18.9 2Zm-1.1 17.84h1.72L8.42 4.05H6.58L17.8 19.84Z" />
    </svg>
  );
}

const socialLinks = [
  {
    label: "FundFlow on GitHub",
    href: process.env.NEXT_PUBLIC_GITHUB_URL,
    icon: GitHubIcon,
  },
  {
    label: "FundFlow on LinkedIn",
    href: process.env.NEXT_PUBLIC_LINKEDIN_URL,
    icon: LinkedInIcon,
  },
  {
    label: "FundFlow on X",
    href: process.env.NEXT_PUBLIC_X_URL,
    icon: XIcon,
  },
].filter((link): link is typeof link & { href: string } =>
  Boolean(link.href?.startsWith("https://")),
);

const linkGroups = [
  {
    title: "Discover",
    links: [
      { label: "Explore campaigns", href: "/campaigns" },
      { label: "How FundFlow works", href: "/how-it-works" },
      { label: "Start a campaign", href: "/register" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About FundFlow", href: "/about" },
      { label: "Community guidelines", href: "/community-guidelines" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of service", href: "/terms" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Cookie policy", href: "/cookies" },
    ],
  },
] as const;

export function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <footer className="mt-auto bg-flow-950 text-white">
      <PageContainer className="py-12 sm:py-16">
        <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-[1.25fr_2fr] lg:gap-16">
          <div>
            <Logo inverse />
            <p className="mt-5 max-w-sm text-sm leading-6 text-[#BBD1D0]">
              FundFlow connects credible ideas with people ready to move them
              forward through transparent community funding.
            </p>
            {socialLinks.length > 0 ? (
              <div className="mt-6 flex items-center gap-3">
                {socialLinks.map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex size-11 items-center justify-center rounded-[10px] border border-white/15 text-[#BBD1D0] transition hover:border-flow-300 hover:bg-white/10 hover:text-white"
                  >
                    <Icon aria-hidden="true" className="size-5" />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <nav
            aria-label="Footer navigation"
            className="grid grid-cols-2 gap-8 sm:grid-cols-3"
          >
            {linkGroups.map((group) => (
              <div key={group.title}>
                <h2 className="font-display text-sm font-bold text-white">
                  {group.title}
                </h2>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="rounded text-sm text-[#BBD1D0] transition hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-xs text-[#BBD1D0] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} FundFlow. All rights reserved.</p>
          <p>Fund ideas. Move impact forward.</p>
        </div>
      </PageContainer>
    </footer>
  );
}
