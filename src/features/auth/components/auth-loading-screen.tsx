import { LoaderCircle, ShieldCheck } from "lucide-react";

interface AuthLoadingScreenProps {
  message?: string;
}

export function AuthLoadingScreen({
  message = "Verifying your FundFlow access…",
}: AuthLoadingScreenProps) {
  return (
    <main
      className="flex min-h-[60vh] flex-1 items-center justify-center bg-canvas px-4 py-16"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-flow-100 text-flow-700">
          <ShieldCheck aria-hidden="true" className="size-7" />
        </span>
        <LoaderCircle
          aria-hidden="true"
          className="mx-auto mt-6 size-6 animate-spin text-flow-600"
        />
        <p className="mt-3 font-medium text-ink-muted">{message}</p>
      </div>
    </main>
  );
}
