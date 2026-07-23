"use client";

import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { RoleSelector } from "@/features/auth/components/role-selector";
import {
  onboardingSchema,
  type OnboardingInput,
} from "@/features/auth/schemas/onboarding.schema";
import {
  completePlatformOnboarding,
  getOnboardingErrorMessage,
  getPlatformProfile,
  isMissingPlatformProfile,
} from "@/features/auth/services/onboarding.service";
import {
  getCurrentPrivateDestination,
  getRoleDashboard,
} from "@/features/auth/utils/auth-routing";
import { useSession } from "@/lib/auth-client";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [formError, setFormError] = useState<string>();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<OnboardingInput>({
    defaultValues: { role: "supporter" },
  });

  useEffect(() => {
    if (isSessionPending) {
      return;
    }

    if (!session) {
      return;
    }

    void getPlatformProfile()
      .then((profile) => {
        router.replace(
          getCurrentPrivateDestination() ?? getRoleDashboard(profile.role),
        );
      })
      .catch((error: unknown) => {
        if (!isMissingPlatformProfile(error)) {
          setFormError(getOnboardingErrorMessage(error));
        }
        setIsCheckingProfile(false);
      });
  }, [isSessionPending, router, session]);

  const submitOnboarding = handleSubmit(async (values) => {
    setFormError(undefined);
    const validation = onboardingSchema.safeParse(values);

    if (!validation.success) {
      setError("role", {
        message: validation.error.issues[0]?.message ?? "Select a role",
      });
      return;
    }

    try {
      const result = await completePlatformOnboarding(validation.data.role);
      router.replace(
        getCurrentPrivateDestination() ?? getRoleDashboard(result.profile.role),
      );
      router.refresh();
    } catch (error) {
      setFormError(getOnboardingErrorMessage(error));
    }
  });

  if (isSessionPending || (session && isCheckingProfile)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F8F8]">
        <div className="text-center text-[#60767A]">
          <LoaderCircle className="mx-auto mb-3 size-7 animate-spin text-[#098A91]" />
          Restoring your FundFlow session…
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F8F8] px-4">
        <section className="max-w-md rounded-3xl border border-[#E2EAE9] bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-[#102A2D]">
            Sign in to continue
          </h1>
          <p className="mt-2 text-[#60767A]">
            Your authentication session is required before choosing a FundFlow
            role.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex h-12 items-center rounded-xl bg-[#098A91] px-5 font-semibold text-white"
          >
            Return to registration
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F8F8] px-4 py-12 sm:px-6">
      <section className="mx-auto max-w-xl rounded-3xl border border-[#E2EAE9] bg-white p-6 shadow-[0_18px_55px_rgba(6,47,53,0.08)] sm:p-8">
        <p className="text-sm font-semibold text-[#098A91]">One final step</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#102A2D]">
          Choose your FundFlow role
        </h1>
        <p className="mt-2 text-[#60767A]">
          Welcome, {session.user.name}. This choice sets up your platform
          profile and one-time starting credits.
        </p>

        <form onSubmit={submitOnboarding} className="mt-7 space-y-5">
          <RoleSelector
            registration={register("role")}
            error={errors.role?.message}
          />

          {formError ? (
            <p
              className="rounded-xl bg-[#FFF0F2] p-3 text-sm text-[#B83C4A]"
              role="alert"
            >
              {formError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-[#098A91] px-5 font-semibold text-white transition hover:bg-[#08717A] focus:ring-4 focus:ring-[#B3E7E1] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <LoaderCircle className="mr-2 size-4 animate-spin" />
            ) : null}
            {isSubmitting ? "Setting up profile…" : "Complete setup"}
          </button>
        </form>
      </section>
    </main>
  );
}
