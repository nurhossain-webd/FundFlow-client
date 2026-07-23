"use client";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { PublicOnlyRouteGuard } from "@/features/auth/components/public-only-route-guard";
import {
  loginSchema,
  type LoginInput,
} from "@/features/auth/schemas/login.schema";
import { resolveAuthenticatedDestination } from "@/features/auth/services/login.service";
import { isMissingPlatformProfile } from "@/features/auth/services/onboarding.service";
import { getCurrentPrivateDestination } from "@/features/auth/utils/auth-routing";
import { signIn } from "@/lib/auth-client";

const inputClasses =
  "mt-2 h-12 w-full rounded-xl border border-border bg-white px-4 text-ink-strong outline-none transition placeholder:text-ink-subtle focus:border-flow-600 focus:ring-3 focus:ring-flow-100";

const getLoginErrorMessage = (message?: string): string => {
  if (message && /credential|password|email|user|invalid/i.test(message)) {
    return "Incorrect email or password";
  }

  return message ?? "Unable to sign in. Please try again.";
};

export default function LoginPage() {
  const router = useRouter();
  const googleSignInStarted = useRef(false);
  const [formError, setFormError] = useState<string>();
  const [isGooglePending, setIsGooglePending] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<LoginInput>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const submitLogin = handleSubmit(async (values) => {
    setFormError(undefined);
    const validation = loginSchema.safeParse(values);

    if (!validation.success) {
      for (const issue of validation.error.issues) {
        const field = issue.path[0];

        if (field === "email" || field === "password") {
          setError(field, { message: issue.message });
        }
      }

      return;
    }

    const result = await signIn.email({
      email: validation.data.email.toLowerCase(),
      password: validation.data.password,
    });

    if (result.error) {
      setFormError(getLoginErrorMessage(result.error.message));
      return;
    }

    try {
      setIsRedirecting(true);
      const intendedDestination = getCurrentPrivateDestination();
      const destination =
        await resolveAuthenticatedDestination(intendedDestination);
      router.replace(destination);
      router.refresh();
    } catch (error) {
      if (isMissingPlatformProfile(error)) {
        const intendedDestination = getCurrentPrivateDestination();
        const callbackParameter = intendedDestination
          ? `?callbackUrl=${encodeURIComponent(intendedDestination)}`
          : "";
        router.replace(`/onboarding${callbackParameter}`);
        return;
      }

      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to load your FundFlow profile",
      );
      setIsRedirecting(false);
    }
  });

  const loginWithGoogle = async () => {
    if (googleSignInStarted.current) {
      return;
    }

    googleSignInStarted.current = true;
    setFormError(undefined);
    setIsGooglePending(true);

    try {
      const result = await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });

      if (result?.error) {
        googleSignInStarted.current = false;
        setFormError(result.error.message ?? "Unable to continue with Google");
        setIsGooglePending(false);
      }
    } catch {
      googleSignInStarted.current = false;
      setFormError("Unable to continue with Google. Please try again.");
      setIsGooglePending(false);
    }
  };

  const isBusy = isSubmitting || isGooglePending || isRedirecting;

  return (
    <PublicOnlyRouteGuard>
      <main className="flex flex-1 items-center bg-canvas px-4 py-10 sm:px-6 sm:py-14 lg:py-18">
        <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border-subtle bg-surface shadow-[0_24px_70px_rgba(6,47,53,0.1)] lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="relative hidden overflow-hidden bg-flow-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div
              aria-hidden="true"
              className="absolute -top-20 -left-24 size-72 rounded-full bg-flow-400/15 blur-3xl"
            />
            <div className="relative">
              <span className="flex size-12 items-center justify-center rounded-xl bg-flow-300 text-flow-950">
                <LockKeyhole aria-hidden="true" className="size-6" />
              </span>
              <p className="mt-8 text-sm font-bold tracking-[0.14em] text-flow-300 uppercase">
                Welcome back
              </p>
              <h1 className="mt-4 font-display text-4xl leading-tight font-bold tracking-[-0.04em]">
                Return to the ideas you’re moving forward.
              </h1>
              <p className="mt-5 leading-7 text-flow-100">
                Review campaign progress, manage your credits, and continue
                building meaningful community momentum.
              </p>
            </div>
            <p className="relative flex gap-3 rounded-2xl border border-white/12 bg-white/[0.06] p-4 text-sm text-flow-100">
              <ShieldCheck
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-flow-300"
              />
              Your dashboard role is loaded from your verified FundFlow profile,
              never from browser-provided data.
            </p>
          </aside>

          <section className="p-6 sm:p-9 lg:p-12">
            <p className="text-sm font-semibold text-flow-700">
              Sign in to FundFlow
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.035em] text-ink-strong">
              Welcome back
            </h2>
            <p className="mt-2 text-ink-muted">
              New to FundFlow?{" "}
              <Link
                href="/register"
                className="font-semibold text-flow-700 hover:text-flow-900"
              >
                Create an account
              </Link>
            </p>

            <button
              type="button"
              onClick={loginWithGoogle}
              disabled={isBusy}
              className="mt-8 flex h-12 w-full items-center justify-center rounded-xl border border-border bg-white px-4 font-semibold text-ink transition hover:bg-flow-50 disabled:cursor-not-allowed disabled:opacity-60"
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
              or sign in with email
              <span className="h-px flex-1 bg-border-subtle" />
            </div>

            <form onSubmit={submitLogin} className="space-y-5" noValidate>
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

              <label className="block text-sm font-semibold text-ink-strong">
                Password
                <span className="relative block">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
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
                {errors.password?.message ? (
                  <span className="mt-1.5 block font-normal text-error">
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
                disabled={isBusy}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-flow-600 px-5 font-semibold text-white transition hover:bg-flow-700 focus:ring-4 focus:ring-flow-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting || isRedirecting ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-4 animate-spin"
                  />
                ) : (
                  <ArrowRight aria-hidden="true" className="size-4" />
                )}
                {isRedirecting
                  ? "Opening your dashboard…"
                  : isSubmitting
                    ? "Signing in…"
                    : "Sign in"}
              </button>
            </form>
          </section>
        </div>
      </main>
    </PublicOnlyRouteGuard>
  );
}
