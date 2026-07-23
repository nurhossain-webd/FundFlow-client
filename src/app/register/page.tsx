"use client";

import {
  Eye,
  EyeOff,
  ImagePlus,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { PublicOnlyRouteGuard } from "@/features/auth/components/public-only-route-guard";
import {
  registrationSchema,
  type RegistrationInput,
} from "@/features/auth/schemas/onboarding.schema";
import {
  completePlatformOnboarding,
  getOnboardingErrorMessage,
} from "@/features/auth/services/onboarding.service";
import { uploadProfileImage } from "@/features/auth/services/profile-image.service";
import { getRoleDashboard } from "@/features/auth/utils/auth-routing";
import { authClient, signIn, signUp, useSession } from "@/lib/auth-client";

const inputClasses =
  "mt-2 h-12 w-full rounded-xl border border-border bg-white px-4 text-ink-strong outline-none transition placeholder:text-ink-subtle focus:border-flow-600 focus:ring-3 focus:ring-flow-100";

const isExistingAccountError = (message: string) =>
  /already|exists|registered|unique/i.test(message);

export default function RegisterPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [formError, setFormError] = useState<string>();
  const [isGooglePending, setIsGooglePending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>();
  const {
    control,
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

  useEffect(
    () => () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    },
    [imagePreview],
  );

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
          field === "profileImage" ||
          field === "role"
        ) {
          setError(field, { message: issue.message });
        }
      }

      return;
    }

    const normalizedEmail = validation.data.email.toLowerCase();

    if (session && session.user.email.toLowerCase() !== normalizedEmail) {
      setFormError(
        `You are currently signed in as ${session.user.email}. Sign out before creating another account.`,
      );
      return;
    }

    if (!session) {
      const result = await signUp.email({
        name: validation.data.displayName,
        email: normalizedEmail,
        password: validation.data.password,
      });

      if (result.error) {
        const message = result.error.message ?? "Unable to create your account";

        if (isExistingAccountError(message)) {
          setError("email", {
            message: "An account already exists with this email",
          });
        } else {
          setFormError(message);
        }

        return;
      }
    }

    try {
      const imageURL = await uploadProfileImage(validation.data.profileImage);
      const updateResult = await authClient.updateUser({ image: imageURL });

      if (updateResult.error) {
        throw new Error(
          updateResult.error.message ?? "Unable to save your profile image",
        );
      }

      const onboardingResult = await completePlatformOnboarding(
        validation.data.role,
      );
      router.replace(getRoleDashboard(onboardingResult.profile.role));
      router.refresh();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : getOnboardingErrorMessage(error),
      );
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
    <PublicOnlyRouteGuard bypassDuringSubmission={isSubmitting}>
      <main className="flex-1 bg-canvas px-4 py-10 sm:px-6 sm:py-14 lg:py-18">
        <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border-subtle bg-surface shadow-[0_24px_70px_rgba(6,47,53,0.1)] lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="relative hidden overflow-hidden bg-flow-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div
              aria-hidden="true"
              className="absolute -top-20 -right-24 size-72 rounded-full bg-flow-400/15 blur-3xl"
            />
            <div className="relative">
              <p className="text-sm font-bold tracking-[0.14em] text-flow-300 uppercase">
                Join FundFlow
              </p>
              <h1 className="mt-5 font-display text-4xl leading-tight font-bold tracking-[-0.04em]">
                Give meaningful ideas room to move.
              </h1>
              <p className="mt-5 leading-7 text-flow-100">
                Support credible work or launch a campaign with transparent
                credit tracking from the beginning.
              </p>
            </div>
            <div className="relative space-y-4 text-sm text-flow-100">
              <p className="flex gap-3">
                <ShieldCheck
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-flow-300"
                />
                Your role and starting credits are assigned securely by the
                FundFlow server.
              </p>
              <p className="rounded-2xl border border-white/12 bg-white/[0.06] p-4">
                Supporters begin with <strong>50 credits</strong>. Creators
                begin with <strong>20 credits</strong>.
              </p>
            </div>
          </aside>

          <section className="p-6 sm:p-9 lg:p-11">
            <p className="text-sm font-semibold text-flow-700">
              Create your account
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.035em] text-ink-strong">
              Start your FundFlow journey
            </h2>
            <p className="mt-2 text-ink-muted">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-flow-700 hover:text-flow-900"
              >
                Log in
              </Link>
            </p>

            <button
              type="button"
              onClick={registerWithGoogle}
              disabled={isGooglePending || isSubmitting}
              className="mt-7 flex h-12 w-full items-center justify-center rounded-xl border border-border bg-white px-4 font-semibold text-ink transition hover:bg-flow-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGooglePending ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="mr-2 size-4 animate-spin"
                />
              ) : null}
              Continue with Google
            </button>

            <div className="my-6 flex items-center gap-3 text-xs text-ink-subtle">
              <span className="h-px flex-1 bg-border-subtle" />
              or register with email
              <span className="h-px flex-1 bg-border-subtle" />
            </div>

            <form
              onSubmit={submitRegistration}
              className="space-y-5"
              noValidate
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-ink-strong">
                  Name
                  <input
                    autoComplete="name"
                    placeholder="Your full name"
                    aria-invalid={Boolean(errors.displayName)}
                    className={inputClasses}
                    {...register("displayName")}
                  />
                  {errors.displayName?.message ? (
                    <span className="mt-1.5 block font-normal text-error">
                      {errors.displayName.message}
                    </span>
                  ) : null}
                </label>

                <label className="block text-sm font-semibold text-ink-strong">
                  Role
                  <select
                    className={inputClasses}
                    aria-invalid={Boolean(errors.role)}
                    {...register("role")}
                  >
                    <option value="supporter">Supporter — 50 credits</option>
                    <option value="creator">Creator — 20 credits</option>
                  </select>
                  {errors.role?.message ? (
                    <span className="mt-1.5 block font-normal text-error">
                      {errors.role.message}
                    </span>
                  ) : null}
                </label>
              </div>

              <label className="block text-sm font-semibold text-ink-strong">
                Email
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-invalid={Boolean(errors.email)}
                  className={inputClasses}
                  {...register("email")}
                />
                {errors.email?.message ? (
                  <span className="mt-1.5 block font-normal text-error">
                    {errors.email.message}
                  </span>
                ) : null}
              </label>

              <div>
                <span className="text-sm font-semibold text-ink-strong">
                  Profile image
                </span>
                <label className="mt-2 flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-border bg-canvas px-4 py-3 transition hover:border-flow-500 hover:bg-flow-50">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Selected profile preview"
                      width={52}
                      height={52}
                      unoptimized
                      className="size-13 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex size-13 shrink-0 items-center justify-center rounded-full bg-flow-100 text-flow-700">
                      <ImagePlus aria-hidden="true" className="size-6" />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block font-semibold text-ink-strong">
                      Choose an image
                    </span>
                    <span className="block text-xs font-normal text-ink-muted">
                      JPG, PNG or WebP, up to 5 MB
                    </span>
                  </span>
                  <Controller
                    name="profileImage"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        onChange={(event) => {
                          const file = event.target.files?.[0];

                          if (imagePreview) {
                            URL.revokeObjectURL(imagePreview);
                          }

                          setImagePreview(
                            file ? URL.createObjectURL(file) : undefined,
                          );
                          field.onChange(file);
                        }}
                      />
                    )}
                  />
                </label>
                {errors.profileImage?.message ? (
                  <span className="mt-1.5 block text-sm text-error">
                    {errors.profileImage.message}
                  </span>
                ) : null}
              </div>

              <label className="block text-sm font-semibold text-ink-strong">
                Password
                <span className="relative block">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    aria-invalid={Boolean(errors.password)}
                    className={`${inputClasses} pr-12`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-1 bottom-0 flex size-11 items-center justify-center rounded-lg text-ink-muted transition hover:bg-flow-50 hover:text-flow-700"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <EyeOff aria-hidden="true" className="size-5" />
                    ) : (
                      <Eye aria-hidden="true" className="size-5" />
                    )}
                  </button>
                </span>
                <span className="mt-1.5 block text-xs font-normal text-ink-muted">
                  Use 8+ characters with uppercase, lowercase, number and
                  symbol.
                </span>
                {errors.password?.message ? (
                  <span className="mt-1 block font-normal text-error">
                    {errors.password.message}
                  </span>
                ) : null}
              </label>

              {formError ? (
                <p
                  className="rounded-xl bg-[#FFF0F2] p-3 text-sm text-error"
                  role="alert"
                >
                  {formError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting || isGooglePending}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-flow-600 px-5 font-semibold text-white transition hover:bg-flow-700 focus:ring-4 focus:ring-flow-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="mr-2 size-4 animate-spin"
                  />
                ) : null}
                {isSubmitting ? "Creating your account…" : "Create account"}
              </button>
            </form>
          </section>
        </div>
      </main>
    </PublicOnlyRouteGuard>
  );
}
