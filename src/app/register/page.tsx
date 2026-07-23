"use client";

import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { RoleSelector } from "@/features/auth/components/role-selector";
import {
  registrationSchema,
  type RegistrationInput,
} from "@/features/auth/schemas/onboarding.schema";
import {
  completePlatformOnboarding,
  getOnboardingErrorMessage,
} from "@/features/auth/services/onboarding.service";
import { signIn, signUp } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string>();
  const [isGooglePending, setIsGooglePending] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<RegistrationInput>({
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      role: "supporter",
    },
  });

  const submitRegistration = handleSubmit(async (values) => {
    setFormError(undefined);
    const validation = registrationSchema.safeParse(values);

    if (!validation.success) {
      for (const issue of validation.error.issues) {
        const field = issue.path[0];

        if (
          field === "displayName" ||
          field === "email" ||
          field === "password" ||
          field === "role"
        ) {
          setError(field, { message: issue.message });
        }
      }

      return;
    }

    const result = await signUp.email({
      name: validation.data.displayName,
      email: validation.data.email,
      password: validation.data.password,
    });

    if (result.error) {
      setFormError(result.error.message ?? "Unable to create your account");
      return;
    }

    try {
      await completePlatformOnboarding(validation.data.role);
      router.replace("/");
      router.refresh();
    } catch (error) {
      setFormError(getOnboardingErrorMessage(error));
    }
  });

  const registerWithGoogle = async () => {
    setFormError(undefined);
    setIsGooglePending(true);

    const result = await signIn.social({
      provider: "google",
      callbackURL: "/onboarding",
    });

    if (result?.error) {
      setFormError(result.error.message ?? "Unable to continue with Google");
      setIsGooglePending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F8F8] px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-xl">
        <Link
          href="/"
          className="mb-8 inline-flex text-xl font-bold tracking-tight text-[#062F35]"
        >
          Fund<span className="text-[#098A91]">Flow</span>
        </Link>
        <section className="rounded-3xl border border-[#E2EAE9] bg-white p-6 shadow-[0_18px_55px_rgba(6,47,53,0.08)] sm:p-8">
          <p className="text-sm font-semibold text-[#098A91]">Join FundFlow</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#102A2D]">
            Create your account
          </h1>
          <p className="mt-2 text-[#60767A]">
            Choose how you want to participate. Your role cannot be changed
            during public registration.
          </p>

          <button
            type="button"
            onClick={registerWithGoogle}
            disabled={isGooglePending || isSubmitting}
            className="mt-6 flex h-12 w-full items-center justify-center rounded-xl border border-[#CBD8D7] bg-white px-4 font-semibold text-[#294348] transition hover:bg-[#F0FBF9] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGooglePending ? (
              <LoaderCircle className="mr-2 size-4 animate-spin" />
            ) : null}
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3 text-xs text-[#84979A]">
            <span className="h-px flex-1 bg-[#E2EAE9]" />
            or use email
            <span className="h-px flex-1 bg-[#E2EAE9]" />
          </div>

          <form onSubmit={submitRegistration} className="space-y-5" noValidate>
            <label className="block text-sm font-semibold text-[#102A2D]">
              Display name
              <input
                autoComplete="name"
                className="mt-2 h-12 w-full rounded-xl border border-[#CBD8D7] px-4 font-normal outline-none transition focus:border-[#098A91] focus:ring-2 focus:ring-[#B3E7E1]"
                {...register("displayName")}
              />
              {errors.displayName?.message ? (
                <span className="mt-1 block font-normal text-[#B83C4A]">
                  {errors.displayName.message}
                </span>
              ) : null}
            </label>

            <label className="block text-sm font-semibold text-[#102A2D]">
              Email
              <input
                type="email"
                autoComplete="email"
                className="mt-2 h-12 w-full rounded-xl border border-[#CBD8D7] px-4 font-normal outline-none transition focus:border-[#098A91] focus:ring-2 focus:ring-[#B3E7E1]"
                {...register("email")}
              />
              {errors.email?.message ? (
                <span className="mt-1 block font-normal text-[#B83C4A]">
                  {errors.email.message}
                </span>
              ) : null}
            </label>

            <label className="block text-sm font-semibold text-[#102A2D]">
              Password
              <input
                type="password"
                autoComplete="new-password"
                className="mt-2 h-12 w-full rounded-xl border border-[#CBD8D7] px-4 font-normal outline-none transition focus:border-[#098A91] focus:ring-2 focus:ring-[#B3E7E1]"
                {...register("password")}
              />
              {errors.password?.message ? (
                <span className="mt-1 block font-normal text-[#B83C4A]">
                  {errors.password.message}
                </span>
              ) : null}
            </label>

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
              disabled={isSubmitting || isGooglePending}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-[#098A91] px-5 font-semibold text-white transition hover:bg-[#08717A] focus:ring-4 focus:ring-[#B3E7E1] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              ) : null}
              {isSubmitting ? "Creating account…" : "Create account"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
