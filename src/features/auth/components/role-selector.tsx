"use client";

import { HeartHandshake, Lightbulb } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";

import type { PublicRole } from "../schemas/onboarding.schema";

interface RoleSelectorProps {
  registration: UseFormRegisterReturn<"role">;
  error?: string;
}

const roles: ReadonlyArray<{
  value: PublicRole;
  title: string;
  description: string;
  grant: string;
  icon: typeof HeartHandshake;
}> = [
  {
    value: "supporter",
    title: "Supporter",
    description: "Discover promising ideas and help creators move forward.",
    grant: "Starts with 50 credits",
    icon: HeartHandshake,
  },
  {
    value: "creator",
    title: "Creator",
    description: "Launch credible campaigns and build support for your work.",
    grant: "Starts with 20 credits",
    icon: Lightbulb,
  },
];

export function RoleSelector({ registration, error }: RoleSelectorProps) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-[#102A2D]">
        How will you use FundFlow?
      </legend>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {roles.map((role) => {
          const Icon = role.icon;

          return (
            <label
              key={role.value}
              className="group relative cursor-pointer rounded-2xl border border-[#CBD8D7] bg-white p-4 transition hover:border-[#10A6A5] hover:bg-[#F0FBF9] has-[:checked]:border-[#098A91] has-[:checked]:bg-[#F0FBF9] has-[:checked]:ring-2 has-[:checked]:ring-[#B3E7E1]"
            >
              <input
                type="radio"
                value={role.value}
                className="sr-only"
                {...registration}
              />
              <Icon aria-hidden="true" className="mb-3 size-6 text-[#098A91]" />
              <span className="block font-semibold text-[#102A2D]">
                {role.title}
              </span>
              <span className="mt-1 block text-sm leading-5 text-[#60767A]">
                {role.description}
              </span>
              <span className="mt-3 block text-xs font-semibold text-[#08717A]">
                {role.grant}
              </span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p className="mt-2 text-sm text-[#B83C4A]" role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
