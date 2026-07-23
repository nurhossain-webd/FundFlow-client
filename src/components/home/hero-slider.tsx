"use client";

import { ArrowLeft, ArrowRight, Clock3, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { A11y, Autoplay, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper/types";

import { PageContainer } from "@/components/layout/page-container";
import { cn } from "@/lib/utils";

import "swiper/css";
import "swiper/css/a11y";
import "./hero-slider.css";

const slides = [
  {
    id: "solar-learning",
    eyebrow: "Featured education campaign",
    title: "Solar Learning Hub",
    description:
      "Help local engineers equip three rural classrooms with practical solar kits for dependable light and hands-on science.",
    raisedCredits: 8_450,
    fundingGoal: 12_000,
    supporters: 184,
    daysLeft: 9,
    image: "/images/hero/solar-learning-hub.png",
    imageAlt:
      "Engineers and educators assembling a small solar learning kit on a rooftop",
    accent: "coral",
    primaryAction: {
      label: "Support this campaign",
      href: "/campaigns",
    },
    secondaryAction: {
      label: "Explore all campaigns",
      href: "/campaigns",
    },
  },
  {
    id: "community-library",
    eyebrow: "Featured community campaign",
    title: "The Open Shelf Library",
    description:
      "Turn an unused neighborhood room into a welcoming library with books, creative tools, and free learning programs.",
    raisedCredits: 15_720,
    fundingGoal: 20_000,
    supporters: 326,
    daysLeft: 14,
    image: "/images/hero/community-library.png",
    imageAlt:
      "Volunteers building modular shelves inside a renewed community library",
    accent: "gold",
    primaryAction: {
      label: "Support this campaign",
      href: "/campaigns?category=community",
    },
    secondaryAction: {
      label: "Explore all campaigns",
      href: "/campaigns",
    },
  },
  {
    id: "coastal-makers",
    eyebrow: "Featured creative campaign",
    title: "TideTurn Recycled Gear",
    description:
      "Help a coastal maker collective transform recovered textiles into durable travel gear and create stable local work.",
    raisedCredits: 11_280,
    fundingGoal: 18_000,
    supporters: 241,
    daysLeft: 21,
    image: "/images/hero/coastal-makers.png",
    imageAlt:
      "Coastal workshop makers inspecting a travel bag made from recycled textiles",
    accent: "teal",
    primaryAction: {
      label: "Support this campaign",
      href: "/campaigns?category=creative",
    },
    secondaryAction: {
      label: "Explore all campaigns",
      href: "/campaigns",
    },
  },
] as const;

const eyebrowStyles = {
  coral: "border-[#F6A29A]/50 bg-[#963A39]/35 text-[#FFE5E1]",
  gold: "border-[#EDD48A]/50 bg-[#9A6508]/35 text-[#FFF3CF]",
  teal: "border-flow-300/50 bg-flow-800/45 text-flow-100",
} as const;

export function HeroSlider() {
  const swiperRef = useRef<SwiperInstance | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <section
      aria-label="Featured ways to create impact"
      className="fundflow-hero relative overflow-hidden bg-flow-950"
    >
      <Swiper
        modules={[A11y, Autoplay, Keyboard]}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => {
          setActiveSlide(swiper.realIndex);
        }}
        speed={800}
        loop
        keyboard={{ enabled: true }}
        autoplay={{
          delay: 6_500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        a11y={{
          enabled: true,
          containerMessage: "FundFlow featured campaigns",
          prevSlideMessage: "Show previous featured campaign",
          nextSlideMessage: "Show next featured campaign",
        }}
        className="h-[clamp(520px,68vw,600px)] sm:h-[clamp(500px,52vw,620px)]"
      >
        {slides.map((slide, index) => {
          const progress = Math.min(
            Math.round((slide.raisedCredits / slide.fundingGoal) * 100),
            100,
          );

          return (
            <SwiperSlide key={slide.id}>
              <article className="relative h-full overflow-hidden">
                <Image
                  src={slide.image}
                  alt={slide.imageAlt}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="object-cover object-[62%_center] sm:object-center"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,47,53,0.98)_0%,rgba(6,47,53,0.91)_34%,rgba(6,47,53,0.46)_64%,rgba(6,47,53,0.14)_100%)] max-sm:bg-[linear-gradient(90deg,rgba(6,47,53,0.96)_0%,rgba(6,47,53,0.84)_62%,rgba(6,47,53,0.48)_100%)]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(0deg,rgba(6,47,53,0.68)_0%,transparent_36%)]"
                />

                <PageContainer className="relative z-10 flex h-full items-center pt-8 pb-20 sm:pt-10 sm:pb-20">
                  <div className="hero-slide-content max-w-[650px]">
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-3 py-1 text-xs font-bold tracking-wide",
                        eyebrowStyles[slide.accent],
                      )}
                    >
                      {slide.eyebrow}
                    </span>
                    <h1 className="mt-4 max-w-[650px] font-display text-[clamp(2.25rem,5vw,4.25rem)] leading-[1.03] font-bold tracking-[-0.045em] text-white">
                      {slide.title}
                    </h1>
                    <p className="mt-4 max-w-xl text-base leading-7 text-[#D8E8E6] sm:text-lg sm:leading-8">
                      {slide.description}
                    </p>

                    <div
                      className="mt-5 max-w-xl"
                      aria-label={`${progress}% funded`}
                    >
                      <div className="mb-2 flex items-end justify-between gap-4">
                        <p className="text-sm text-flow-100">
                          <strong className="text-lg font-bold text-white">
                            {slide.raisedCredits.toLocaleString()}
                          </strong>{" "}
                          credits raised
                        </p>
                        <p className="text-sm font-semibold text-flow-200">
                          {progress}% funded
                        </p>
                      </div>
                      <div
                        className="h-2 overflow-hidden rounded-full bg-white/20"
                        role="progressbar"
                        aria-valuenow={slide.raisedCredits}
                        aria-valuemin={0}
                        aria-valuemax={slide.fundingGoal}
                        aria-label={`${slide.raisedCredits.toLocaleString()} of ${slide.fundingGoal.toLocaleString()} credits raised`}
                      >
                        <div
                          className="h-full rounded-full bg-flow-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#D8E8E6]">
                        <span>
                          Goal:{" "}
                          <strong className="font-semibold text-white">
                            {slide.fundingGoal.toLocaleString()} credits
                          </strong>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Users
                            aria-hidden="true"
                            className="size-4 text-flow-300"
                          />
                          {slide.supporters} supporters
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3
                            aria-hidden="true"
                            className="size-4 text-flow-300"
                          />
                          {slide.daysLeft} days left
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 min-[430px]:flex-row">
                      <Link
                        href={slide.primaryAction.href}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-flow-600 px-5 font-semibold text-white shadow-lg shadow-black/10 transition hover:-translate-y-px hover:bg-flow-500"
                      >
                        {slide.primaryAction.label}
                        <ArrowRight aria-hidden="true" className="size-4" />
                      </Link>
                      <Link
                        href={slide.secondaryAction.href}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] border border-white/35 bg-white/10 px-5 font-semibold text-white backdrop-blur-sm transition hover:-translate-y-px hover:border-white/60 hover:bg-white/15"
                      >
                        {slide.secondaryAction.label}
                      </Link>
                    </div>
                  </div>
                </PageContainer>
              </article>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <div
        className="hero-slider-controls"
        aria-label="Featured campaign controls"
      >
        <button
          type="button"
          className="hero-slider-arrow"
          aria-label="Show previous featured campaign"
          onClick={() => swiperRef.current?.slidePrev()}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
        </button>

        <div
          className="hero-slider-pagination"
          role="group"
          aria-label="Choose a slide"
        >
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={cn(
                "hero-slider-dot",
                activeSlide === index && "hero-slider-dot-active",
              )}
              aria-label={`Show slide ${index + 1}: ${slide.eyebrow}`}
              aria-current={activeSlide === index ? "true" : undefined}
              onClick={() => swiperRef.current?.slideToLoop(index)}
            />
          ))}
        </div>

        <button
          type="button"
          className="hero-slider-arrow"
          aria-label="Show next featured campaign"
          onClick={() => swiperRef.current?.slideNext()}
        >
          <ArrowRight aria-hidden="true" className="size-4" />
        </button>
      </div>
    </section>
  );
}
