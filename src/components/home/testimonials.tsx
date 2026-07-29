"use client";

import { Quote } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import Image from "next/image";
import { A11y, Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

import "swiper/css";
import "swiper/css/a11y";
import "swiper/css/pagination";
import "./testimonials.css";

const testimonials = [
  {
    name: "Anika Rahman",
    role: "Community education creator",
    image: "/images/testimonials/anika-rahman.png",
    quote:
      "FundFlow gave our supporters a clear view of the goal and the progress behind every contribution. That trust helped our library project find its first real momentum.",
  },
  {
    name: "Marcus Okafor",
    role: "Clean-energy supporter",
    image: "/images/testimonials/marcus-okafor.png",
    quote:
      "I can discover practical projects, understand exactly what the credits support, and follow the campaign without digging through vague promises.",
  },
  {
    name: "Mei Tanaka",
    role: "Sustainable design creator",
    image: "/images/testimonials/mei-tanaka.png",
    quote:
      "The platform feels focused on responsible growth. Our campaign could tell a human story while keeping the funding goal concrete and transparent.",
  },
] as const;

export function Testimonials() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="bg-surface py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            centered
            eyebrow="Voices from FundFlow"
            title="Built around trust, not hype"
            description="Creators and supporters share what transparent community funding makes possible."
          />
        </Reveal>

        <Reveal>
          <Swiper
            modules={[A11y, Autoplay, Pagination]}
            slidesPerView={1}
            spaceBetween={20}
            speed={reduceMotion ? 0 : 650}
            rewind
            autoplay={
              reduceMotion
                ? false
                : {
                    delay: 5_500,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }
            }
            pagination={{ clickable: true }}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            a11y={{
              enabled: true,
              containerMessage: "FundFlow community testimonials",
              paginationBulletMessage: "Show testimonial {{index}}",
            }}
            className="testimonials-swiper pb-12!"
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.name} className="h-auto!">
                <article className="flex h-full flex-col rounded-2xl border border-border-subtle bg-canvas p-6 sm:p-7">
                  <Quote
                    aria-hidden="true"
                    className="size-8 fill-flow-100 text-flow-500"
                  />
                  <blockquote className="mt-5 flex-1 leading-7 text-ink">
                    “{testimonial.quote}”
                  </blockquote>
                  <div className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
                    <Image
                      src={testimonial.image}
                      alt={`Portrait of ${testimonial.name}`}
                      width={52}
                      height={52}
                      className="size-13 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-display font-bold text-ink-strong">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-ink-muted">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </Reveal>
      </div>
    </section>
  );
}
