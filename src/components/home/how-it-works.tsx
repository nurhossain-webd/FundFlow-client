import { CheckCircle2, HandCoins, Lightbulb, Rocket } from "lucide-react";

import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

const steps = [
  {
    number: "01",
    title: "Share a clear idea",
    description:
      "Creators explain the need, set a transparent credit goal, and submit the campaign for review.",
    icon: Lightbulb,
  },
  {
    number: "02",
    title: "Build trusted support",
    description:
      "Supporters discover approved campaigns and commit credits to the work they believe should happen.",
    icon: HandCoins,
  },
  {
    number: "03",
    title: "Turn backing into progress",
    description:
      "Approved contributions move the campaign forward while FundFlow keeps every credit movement traceable.",
    icon: Rocket,
  },
] as const;

export function HowItWorks() {
  return (
    <section className="bg-flow-950 py-16 text-white sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Simple and accountable"
            title="How FundFlow works"
            description="A focused path from a promising idea to community-backed progress."
            className="[&_h2]:text-white [&_p:last-child]:text-flow-100"
          />
        </Reveal>

        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <Reveal key={step.number} delay={index * 0.08}>
                <article className="relative h-full overflow-hidden rounded-2xl border border-white/12 bg-white/[0.06] p-6 backdrop-blur-sm sm:p-7">
                  <span
                    aria-hidden="true"
                    className="absolute top-2 right-5 font-display text-7xl font-bold text-white/[0.045]"
                  >
                    {step.number}
                  </span>
                  <span className="flex size-12 items-center justify-center rounded-xl bg-flow-300 text-flow-950">
                    <Icon aria-hidden="true" className="size-6" />
                  </span>
                  <h3 className="mt-6 font-display text-xl font-bold">
                    {step.title}
                  </h3>
                  <p className="mt-3 leading-7 text-flow-100">
                    {step.description}
                  </p>
                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-flow-300">
                    <CheckCircle2 aria-hidden="true" className="size-4" />
                    Built for transparency
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
