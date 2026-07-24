"use client";

import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

import { useUpdateCreatorCampaign } from "../hooks/use-creator-campaigns";
import {
  updateCampaignSchema,
  type UpdateCampaignFormInput,
} from "../schemas/update-campaign.schema";
import type { CreatorCampaign } from "../services/campaign.service";

const fieldClasses =
  "mt-2 w-full rounded-[10px] border border-border bg-white px-4 text-ink-strong outline-none transition placeholder:text-ink-subtle focus:border-flow-600 focus:ring-4 focus:ring-flow-200/70 disabled:cursor-not-allowed disabled:bg-canvas-muted";

interface UpdateCampaignModalProps {
  campaign?: CreatorCampaign;
  onClose: () => void;
}

export function UpdateCampaignModal({
  campaign,
  onClose,
}: UpdateCampaignModalProps) {
  const formId = useId();
  const [formError, setFormError] = useState<string>();
  const updateCampaign = useUpdateCreatorCampaign();
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<UpdateCampaignFormInput>({
    defaultValues: {
      title: "",
      story: "",
      rewardInfo: "",
    },
  });

  useEffect(() => {
    if (campaign) {
      reset({
        title: campaign.title,
        story: campaign.story,
        rewardInfo: campaign.rewardInfo,
      });
    }
  }, [campaign, reset]);

  const closeModal = () => {
    setFormError(undefined);
    onClose();
  };

  const submitUpdate = handleSubmit(async (values) => {
    if (!campaign) {
      return;
    }

    setFormError(undefined);
    const validation = updateCampaignSchema.safeParse(values);

    if (!validation.success) {
      for (const issue of validation.error.issues) {
        const field = issue.path[0];

        if (field === "title" || field === "story" || field === "rewardInfo") {
          setError(field, { message: issue.message });
        }
      }

      return;
    }

    try {
      await updateCampaign.mutateAsync({
        campaignId: campaign._id,
        input: validation.data,
      });
      toast.success("Campaign changes saved");
      closeModal();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to update campaign",
      );
    }
  });

  return (
    <Modal
      isOpen={Boolean(campaign)}
      onClose={closeModal}
      title="Update campaign"
      description="You can revise the campaign title, story, and reward information."
      className="max-w-2xl"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={closeModal}
            disabled={updateCampaign.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            isLoading={updateCampaign.isPending}
            loadingText="Saving changes…"
          >
            Save changes
          </Button>
        </>
      }
    >
      <form
        id={formId}
        onSubmit={submitUpdate}
        noValidate
        className="space-y-5"
      >
        <label className="block text-sm font-semibold text-ink-strong">
          Campaign title
          <input
            type="text"
            className={`${fieldClasses} h-12`}
            aria-invalid={Boolean(errors.title)}
            disabled={updateCampaign.isPending}
            {...register("title")}
          />
          {errors.title?.message ? (
            <span className="mt-1.5 block font-normal text-error" role="alert">
              {errors.title.message}
            </span>
          ) : null}
        </label>

        <label className="block text-sm font-semibold text-ink-strong">
          Campaign story
          <textarea
            rows={7}
            className={`${fieldClasses} resize-y py-3 leading-7`}
            aria-invalid={Boolean(errors.story)}
            disabled={updateCampaign.isPending}
            {...register("story")}
          />
          {errors.story?.message ? (
            <span className="mt-1.5 block font-normal text-error" role="alert">
              {errors.story.message}
            </span>
          ) : null}
        </label>

        <label className="block text-sm font-semibold text-ink-strong">
          Reward information
          <textarea
            rows={4}
            className={`${fieldClasses} resize-y py-3 leading-7`}
            aria-invalid={Boolean(errors.rewardInfo)}
            disabled={updateCampaign.isPending}
            {...register("rewardInfo")}
          />
          {errors.rewardInfo?.message ? (
            <span className="mt-1.5 block font-normal text-error" role="alert">
              {errors.rewardInfo.message}
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
