import {
  BookOpen,
  Cpu,
  HeartPulse,
  Leaf,
  Palette,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

const categories = [
  {
    name: "Education",
    description: "Tools, learning spaces, and access to knowledge.",
    icon: BookOpen,
    tone: "bg-[#FFF4DF] text-[#9A6508]",
  },
  {
    name: "Health",
    description: "Care, accessibility, and healthier communities.",
    icon: HeartPulse,
    tone: "bg-[#FFE9E7] text-coral-700",
  },
  {
    name: "Technology",
    description: "Practical products solving meaningful problems.",
    icon: Cpu,
    tone: "bg-[#E8EEFF] text-[#425AB5]",
  },
  {
    name: "Environment",
    description: "Cleaner systems and resilient local ecosystems.",
    icon: Leaf,
    tone: "bg-[#E8F5E9] text-[#347A49]",
  },
  {
    name: "Community",
    description: "Shared spaces and neighborhood-led action.",
    icon: UsersRound,
    tone: "bg-flow-100 text-flow-800",
  },
  {
    name: "Creative",
    description: "Independent art, design, film, and craft.",
    icon: Palette,
    tone: "bg-[#F3EAFE] text-[#7651A8]",
  },
] as const;

export function ExploreCategories() {
  return (
    <section className="bg-canvas-muted py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            centered
            eyebrow="Find your cause"
            title="Explore by category"
            description="Start with the kind of change you want to see, then meet the people already building it."
          />
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => {
            const Icon = category.icon;

            return (
              <Reveal key={category.name} delay={index * 0.05}>
                <Link
                  href={`/campaigns?category=${category.name.toLowerCase()}`}
                  className="group flex h-full items-start gap-4 rounded-2xl border border-border-subtle bg-surface p-5 shadow-[0_8px_25px_rgba(6,47,53,0.04)] transition duration-300 hover:-translate-y-1 hover:border-flow-300 hover:shadow-[0_15px_35px_rgba(6,47,53,0.09)] sm:p-6"
                >
                  <span
                    className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${category.tone}`}
                  >
                    <Icon aria-hidden="true" className="size-6" />
                  </span>
                  <span>
                    <span className="font-display text-lg font-bold text-ink-strong transition group-hover:text-flow-700">
                      {category.name}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-ink-muted">
                      {category.description}
                    </span>
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
