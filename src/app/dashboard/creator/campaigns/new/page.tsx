"use client";

import {
  CalendarDays,
  Coins,
  ImagePlus,
  Info,
  LoaderCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import Swal from "sweetalert2";

import { Button } from "@/components/ui/button";
import {
  campaignCategories,
  campaignFormSchema,
  type CampaignFormInput,
} from "@/features/campaigns/schemas/campaign-form.schema";
import {
  submitCampaign,
  uploadCampaignImage,
} from "@/features/campaigns/services/campaign.service";

const fieldClasses =
  "mt-2 w-full rounded-[10px] border border-border bg-white px-4 text-ink-strong outline-none transition placeholder:text-ink-subtle focus:border-flow-600 focus:ring-4 focus:ring-flow-200/70 disabled:cursor-not-allowed disabled:bg-canvas-muted";

const getMinimumDeadline = (): string => {
  const minimum = new Date(Date.now() + 5 * 60_000);
  const localTime = new Date(
    minimum.getTime() - minimum.getTimezoneOffset() * 60_000,
  );

  return localTime.toISOString().slice(0, 16);
};

interface FieldErrorProps {
  message?: string;
}

function FieldError({ message }: FieldErrorProps) {
  return message ? (
    <p className="mt-1.5 text-sm text-error" role="alert">
      {message}
    </p>
  ) : null;
}

export default function CreateCampaignPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string>();
  const [imagePreview, setImagePreview] = useState<string>();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submissionStage, setSubmissionStage] = useState<
    "idle" | "uploading" | "submitting"
  >("idle");
  const [uploadedImage, setUploadedImage] = useState<{
    file: File;
    url: string;
  }>();
  const {
    clearErrors,
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<CampaignFormInput>({
    defaultValues: {
      title: "",
      story: "",
      category: undefined,
      fundingGoal: "",
      minimumContribution: "",
      deadline: "",
      rewardInfo: "",
      image: undefined,
    },
  });
  const story = useWatch({ control, name: "story" });
  const storyLength = story?.length ?? 0;

  useEffect(
    () => () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    },
    [imagePreview],
  );

  const submitForm = handleSubmit(async (values) => {
    setFormError(undefined);
    clearErrors();
    const validation = campaignFormSchema.safeParse(values);

    if (!validation.success) {
      for (const issue of validation.error.issues) {
        const field = issue.path[0];

        if (
          field === "title" ||
          field === "story" ||
          field === "category" ||
          field === "fundingGoal" ||
          field === "minimumContribution" ||
          field === "deadline" ||
          field === "rewardInfo" ||
          field === "image"
        ) {
          setError(field, { message: issue.message });
        }
      }

      return;
    }

    try {
      let imageURL: string;

      if (uploadedImage && uploadedImage.file === validation.data.image) {
        imageURL = uploadedImage.url;
      } else {
        setSubmissionStage("uploading");
        setUploadProgress(0);
        imageURL = await uploadCampaignImage(
          validation.data.image,
          setUploadProgress,
        );
        setUploadedImage({
          file: validation.data.image,
          url: imageURL,
        });
      }

      setSubmissionStage("submitting");
      await submitCampaign(validation.data, imageURL);

      await Swal.fire({
        icon: "success",
        title: "Campaign submitted",
        text: "Your campaign is pending administrator review. We’ll notify you when a decision is made.",
        confirmButtonText: "View my campaigns",
        confirmButtonColor: "#08717A",
      });

      router.push("/dashboard/creator/campaigns");
      router.refresh();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to submit your campaign",
      );
    } finally {
      setSubmissionStage("idle");
    }
  });

  return (
    <div className="min-w-0">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 max-w-3xl">
          <p className="text-xs font-bold tracking-[0.14em] text-flow-700 uppercase">
            Creator workspace
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.035em] text-ink-strong sm:text-4xl">
            Add a new campaign
          </h1>
          <p className="mt-3 leading-7 text-ink-muted">
            Explain the need clearly, choose a realistic credit goal, and give
            supporters the details they need to make an informed decision.
          </p>
        </div>

        <form
          onSubmit={submitForm}
          noValidate
          className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"
        >
          <fieldset
            disabled={isSubmitting}
            className="space-y-6 rounded-2xl border border-border-subtle bg-surface p-5 shadow-[0_12px_40px_rgba(6,47,53,0.05)] sm:p-7"
          >
            <legend className="sr-only">Campaign information</legend>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block text-sm font-semibold text-ink-strong">
                Campaign title
                <input
                  type="text"
                  placeholder="Solar learning kits for rural classrooms"
                  className={`${fieldClasses} h-12`}
                  aria-invalid={Boolean(errors.title)}
                  {...register("title")}
                />
                <FieldError message={errors.title?.message} />
              </label>

              <label className="block text-sm font-semibold text-ink-strong">
                Category
                <select
                  className={`${fieldClasses} h-12`}
                  aria-invalid={Boolean(errors.category)}
                  {...register("category")}
                >
                  <option value="">Choose a category</option>
                  {campaignCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.category?.message} />
              </label>
            </div>

            <label className="block text-sm font-semibold text-ink-strong">
              Campaign story
              <textarea
                rows={10}
                placeholder="Describe the problem, who it affects, your plan, and how the funding will be used. Use short paragraphs to keep the story easy to read."
                className={`${fieldClasses} min-h-64 resize-y py-3 leading-7`}
                aria-invalid={Boolean(errors.story)}
                aria-describedby="campaign-story-help"
                {...register("story")}
              />
              <span
                id="campaign-story-help"
                className="mt-1.5 flex justify-between gap-4 text-xs font-normal text-ink-muted"
              >
                <span>
                  Plain multiline text only. FundFlow safely renders it without
                  executable HTML.
                </span>
                <span className="shrink-0 tabular-nums">
                  {storyLength.toLocaleString()}/20,000
                </span>
              </span>
              <FieldError message={errors.story?.message} />
            </label>

            <div className="grid gap-5 md:grid-cols-3">
              <label className="block text-sm font-semibold text-ink-strong">
                Funding goal
                <span className="relative block">
                  <Coins
                    aria-hidden="true"
                    className="absolute bottom-3.5 left-3.5 size-5 text-ink-muted"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="12000"
                    className={`${fieldClasses} h-12 pl-11`}
                    aria-invalid={Boolean(errors.fundingGoal)}
                    {...register("fundingGoal")}
                  />
                </span>
                <FieldError message={errors.fundingGoal?.message} />
              </label>

              <label className="block text-sm font-semibold text-ink-strong">
                Minimum contribution
                <span className="relative block">
                  <Coins
                    aria-hidden="true"
                    className="absolute bottom-3.5 left-3.5 size-5 text-ink-muted"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="10"
                    className={`${fieldClasses} h-12 pl-11`}
                    aria-invalid={Boolean(errors.minimumContribution)}
                    {...register("minimumContribution")}
                  />
                </span>
                <FieldError message={errors.minimumContribution?.message} />
              </label>

              <label className="block text-sm font-semibold text-ink-strong">
                Deadline
                <span className="relative block">
                  <CalendarDays
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-3.5 left-3.5 size-5 text-ink-muted"
                  />
                  <input
                    type="datetime-local"
                    min={getMinimumDeadline()}
                    className={`${fieldClasses} h-12 pl-11`}
                    aria-invalid={Boolean(errors.deadline)}
                    {...register("deadline")}
                  />
                </span>
                <FieldError message={errors.deadline?.message} />
              </label>
            </div>

            <label className="block text-sm font-semibold text-ink-strong">
              Reward information
              <textarea
                rows={5}
                placeholder="Explain any supporter updates, acknowledgements, or campaign rewards. Be specific about what supporters can expect."
                className={`${fieldClasses} resize-y py-3 leading-7`}
                aria-invalid={Boolean(errors.rewardInfo)}
                {...register("rewardInfo")}
              />
              <FieldError message={errors.rewardInfo?.message} />
            </label>

            <div>
              <p className="text-sm font-semibold text-ink-strong">
                Campaign image
              </p>
              <Controller
                name="image"
                control={control}
                render={({ field }) => (
                  <div className="mt-2">
                    {imagePreview ? (
                      <div className="relative overflow-hidden rounded-2xl border border-border bg-flow-50">
                        <div className="relative aspect-[16/9]">
                          <Image
                            src={imagePreview}
                            alt="Campaign image preview"
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            URL.revokeObjectURL(imagePreview);
                            setImagePreview(undefined);
                            setUploadedImage(undefined);
                            setUploadProgress(0);
                            field.onChange(undefined);
                          }}
                          className="absolute top-3 right-3 flex size-10 items-center justify-center rounded-full bg-flow-950/80 text-white backdrop-blur-sm transition hover:bg-flow-950"
                          aria-label="Remove campaign image"
                        >
                          <X aria-hidden="true" className="size-5" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-canvas px-5 py-8 text-center transition hover:border-flow-500 hover:bg-flow-50">
                        <span className="flex size-12 items-center justify-center rounded-xl bg-flow-100 text-flow-700">
                          <ImagePlus aria-hidden="true" className="size-6" />
                        </span>
                        <span className="mt-4 font-semibold text-ink-strong">
                          Choose a campaign image
                        </span>
                        <span className="mt-1 text-sm text-ink-muted">
                          JPG, PNG or WebP, up to 8 MB
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          name={field.name}
                          ref={field.ref}
                          onBlur={field.onBlur}
                          className="sr-only"
                          onChange={(event) => {
                            const file = event.target.files?.[0];

                            if (imagePreview) {
                              URL.revokeObjectURL(imagePreview);
                            }

                            setImagePreview(
                              file ? URL.createObjectURL(file) : undefined,
                            );
                            setUploadedImage(undefined);
                            setUploadProgress(0);
                            field.onChange(file);
                          }}
                        />
                      </label>
                    )}
                  </div>
                )}
              />
              <FieldError
                message={errors.image?.message as string | undefined}
              />

              {submissionStage === "uploading" ? (
                <div className="mt-4" aria-live="polite">
                  <div className="flex justify-between text-sm font-medium text-ink">
                    <span>Uploading campaign image…</span>
                    <span className="tabular-nums">{uploadProgress}%</span>
                  </div>
                  <div
                    className="mt-2 h-2 overflow-hidden rounded-full bg-canvas-muted"
                    role="progressbar"
                    aria-label="Campaign image upload progress"
                    aria-valuenow={uploadProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full rounded-full bg-flow-500 transition-[width]"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            {formError ? (
              <p
                className="rounded-xl bg-[#FFF0F2] p-4 text-sm text-error"
                role="alert"
              >
                {formError}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-3 border-t border-border-subtle pt-6 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/dashboard/creator/campaigns")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="lg"
                isLoading={isSubmitting}
                loadingText={
                  submissionStage === "uploading"
                    ? `Uploading ${uploadProgress}%`
                    : "Submitting campaign…"
                }
                leftIcon={<Send aria-hidden="true" className="size-4" />}
              >
                Submit for review
              </Button>
            </div>
          </fieldset>

          <aside className="space-y-4 xl:sticky xl:top-28">
            <section className="rounded-2xl border border-flow-200 bg-flow-50 p-5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-flow-700 text-white">
                <Sparkles aria-hidden="true" className="size-5" />
              </span>
              <h2 className="mt-4 font-display text-lg font-bold text-ink-strong">
                Submitted as pending
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                FundFlow always sets new campaigns to pending with zero raised
                credits. An administrator must approve the campaign before
                supporters can find it.
              </p>
            </section>

            <section className="rounded-2xl border border-border-subtle bg-surface p-5">
              <h2 className="flex items-center gap-2 font-display font-bold text-ink-strong">
                <Info aria-hidden="true" className="size-5 text-flow-600" />
                Before submitting
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-ink-muted">
                <li>
                  Use a specific title that explains the intended outcome.
                </li>
                <li>Show how the credit goal connects to the project plan.</li>
                <li>
                  Choose a deadline that allows enough time to build trust.
                </li>
                <li>Only promise rewards you can deliver responsibly.</li>
              </ul>
            </section>

            {isSubmitting ? (
              <div
                className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4 text-sm text-ink"
                aria-live="polite"
              >
                <LoaderCircle
                  aria-hidden="true"
                  className="size-5 animate-spin text-flow-600"
                />
                {submissionStage === "uploading"
                  ? "Securely uploading your image…"
                  : "Sending your campaign for review…"}
              </div>
            ) : null}
          </aside>
        </form>
      </div>
    </div>
  );
}
