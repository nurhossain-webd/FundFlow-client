"use client";

import { format } from "date-fns";
import Image from "next/image";

import { Modal } from "@/components/ui/modal";

import type { AdminCampaign } from "../types/admin-campaign";

interface AdminCampaignDetailModalProps {
  campaign?: AdminCampaign;
  onClose: () => void;
}

export function AdminCampaignDetailModal({
  campaign,
  onClose,
}: AdminCampaignDetailModalProps) {
  return (
    <Modal
      isOpen={Boolean(campaign)}
      onClose={onClose}
      title={campaign?.title ?? "Campaign details"}
      description={
        campaign
          ? `Submitted by ${campaign.creatorName} for administrator review.`
          : undefined
      }
      className="max-w-3xl"
    >
      {campaign ? (
        <div className="max-h-[68vh] space-y-6 overflow-y-auto pr-1">
          <div className="relative aspect-[16/8] overflow-hidden rounded-2xl bg-canvas-muted">
            <Image
              src={campaign.imageURL}
              alt=""
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 720px"
            />
          </div>
          <dl className="grid gap-4 rounded-2xl bg-canvas-muted p-4 text-sm sm:grid-cols-2">
            <Detail label="Creator" value={campaign.creatorName} />
            <Detail label="Creator email" value={campaign.creatorEmail} />
            <Detail label="Category" value={campaign.category} />
            <Detail
              label="Funding goal"
              value={`${campaign.fundingGoal.toLocaleString()} credits`}
            />
            <Detail
              label="Minimum contribution"
              value={`${campaign.minimumContribution.toLocaleString()} credits`}
            />
            <Detail
              label="Deadline"
              value={format(new Date(campaign.deadline), "PPP 'at' p")}
            />
            <Detail
              label="Submitted"
              value={format(new Date(campaign.createdAt), "PPP 'at' p")}
            />
          </dl>
          <section>
            <h3 className="font-display text-lg font-bold text-ink-strong">
              Campaign story
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-ink">
              {campaign.story}
            </p>
          </section>
          <section>
            <h3 className="font-display text-lg font-bold text-ink-strong">
              Reward information
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-ink">
              {campaign.rewardInfo}
            </p>
          </section>
        </div>
      ) : null}
    </Modal>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-ink-muted">{label}</dt>
      <dd className="mt-1 font-semibold break-words text-ink-strong">
        {value}
      </dd>
    </div>
  );
}
