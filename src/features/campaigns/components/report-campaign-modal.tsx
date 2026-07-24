"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

import { useReportCampaign } from "../hooks/use-campaign-detail";
import {
  campaignReportSchema,
  type CampaignReportFormInput,
} from "../schemas/contribution-form.schema";

const fieldClasses =
  "mt-2 w-full rounded-[10px] border border-border bg-white px-4 text-ink-strong outline-none transition focus:border-flow-600 focus:ring-4 focus:ring-flow-200/70 disabled:cursor-not-allowed disabled:bg-canvas-muted";

interface ReportCampaignModalProps {
  campaignId: string;
  campaignTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ReportCampaignModal({
  campaignId,
  campaignTitle,
  isOpen,
  onClose,
}: ReportCampaignModalProps) {
  const formId = useId();
  const [formError, setFormError] = useState<string>();
  const reportMutation = useReportCampaign();
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<CampaignReportFormInput>({
    defaultValues: {
      reason: undefined,
      details: "",
    },
  });

  const closeModal = () => {
    if (reportMutation.isPending) {
      return;
    }

    setFormError(undefined);
    reset();
    onClose();
  };

  const submitReport = handleSubmit(async (values) => {
    setFormError(undefined);
    const validation = campaignReportSchema.safeParse(values);

    if (!validation.success) {
      for (const issue of validation.error.issues) {
        const field = issue.path[0];

        if (field === "reason" || field === "details") {
          setError(field, { message: issue.message });
        }
      }
      return;
    }

    try {
      await reportMutation.mutateAsync({
        campaignId,
        input: validation.data,
      });
      toast.success("Campaign report submitted");
      closeModal();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to submit campaign report",
      );
    }
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="Report campaign"
      description={`Tell the FundFlow moderation team why “${campaignTitle}” needs review.`}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={closeModal}
            disabled={reportMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="destructive"
            isLoading={reportMutation.isPending}
            loadingText="Submitting report…"
          >
            Submit report
          </Button>
        </>
      }
    >
      <form
        id={formId}
        onSubmit={submitReport}
        noValidate
        className="space-y-5"
      >
        <label className="block text-sm font-semibold text-ink-strong">
          Reason
          <select
            className={`${fieldClasses} h-12`}
            aria-invalid={Boolean(errors.reason)}
            disabled={reportMutation.isPending}
            {...register("reason")}
          >
            <option value="">Choose a reason</option>
            <option value="fraud">Suspected fraud</option>
            <option value="misleading_information">
              Misleading information
            </option>
            <option value="prohibited_content">Prohibited content</option>
            <option value="harassment">Harassment</option>
            <option value="spam">Spam</option>
            <option value="other">Other concern</option>
          </select>
          {errors.reason?.message ? (
            <span className="mt-1.5 block font-normal text-error" role="alert">
              {errors.reason.message}
            </span>
          ) : null}
        </label>

        <label className="block text-sm font-semibold text-ink-strong">
          Details
          <textarea
            rows={5}
            maxLength={2_000}
            placeholder="Describe the specific information or activity the moderation team should review."
            className={`${fieldClasses} resize-y py-3 leading-7`}
            aria-invalid={Boolean(errors.details)}
            disabled={reportMutation.isPending}
            {...register("details")}
          />
          {errors.details?.message ? (
            <span className="mt-1.5 block font-normal text-error" role="alert">
              {errors.details.message}
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
      </form>
    </Modal>
  );
}
