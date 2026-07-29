import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";

interface InformationSection {
  heading: string;
  body: readonly string[];
}

interface InformationPage {
  eyebrow: string;
  title: string;
  introduction: string;
  sections: readonly InformationSection[];
}

const informationPages = {
  "how-it-works": {
    eyebrow: "How it works",
    title: "Community funding with a clear path forward",
    introduction:
      "FundFlow gives creators a structured way to present credible ideas and gives supporters the information they need to contribute confidently.",
    sections: [
      {
        heading: "For supporters",
        body: [
          "Explore approved campaigns, review their goals and progress, and contribute FundFlow credits to the projects you believe in.",
          "Your dashboard keeps your credit balance, contributions, payments, and campaign updates together.",
        ],
      },
      {
        heading: "For creators",
        body: [
          "Create a detailed campaign with a funding target, deadline, minimum contribution, story, and reward information.",
          "Submitted campaigns are reviewed before appearing publicly. Approved contributions become raised credits that can be withdrawn through the platform workflow.",
        ],
      },
      {
        heading: "Platform review",
        body: [
          "Administrators review campaigns, reports, withdrawals, and account activity to help keep the marketplace useful and trustworthy.",
        ],
      },
    ],
  },
  about: {
    eyebrow: "About FundFlow",
    title: "Helping credible ideas find committed supporters",
    introduction:
      "FundFlow is a community crowdfunding platform designed around transparent campaigns, clear progress, and accountable participation.",
    sections: [
      {
        heading: "Our purpose",
        body: [
          "We want people with practical ideas to have a straightforward place to explain their work, build support, and demonstrate progress.",
        ],
      },
      {
        heading: "What we value",
        body: [
          "Clarity, responsible participation, transparent funding activity, and respectful collaboration guide how FundFlow is built and moderated.",
        ],
      },
      {
        heading: "Built for participation",
        body: [
          "Supporters, creators, and administrators each have focused tools and responsibilities that help the platform move projects forward.",
        ],
      },
    ],
  },
  "community-guidelines": {
    eyebrow: "Community",
    title: "Community guidelines",
    introduction:
      "Everyone using FundFlow is expected to communicate honestly, participate respectfully, and protect the safety of the wider community.",
    sections: [
      {
        heading: "Be accurate and transparent",
        body: [
          "Campaign descriptions, funding needs, progress updates, identities, and supporting information must not be false or misleading.",
        ],
      },
      {
        heading: "Treat people with respect",
        body: [
          "Harassment, threats, hate speech, impersonation, exploitation, and attempts to manipulate other members are not permitted.",
        ],
      },
      {
        heading: "Use funding responsibly",
        body: [
          "Creators should use raised resources for the stated campaign purpose and communicate meaningful changes to supporters.",
        ],
      },
      {
        heading: "Report concerns",
        body: [
          "Use the campaign reporting tools when content appears unsafe, fraudulent, prohibited, or materially misleading. Administrators review reports before taking action.",
        ],
      },
    ],
  },
  contact: {
    eyebrow: "Contact",
    title: "We’re here to help",
    introduction:
      "For account, campaign, contribution, or safety questions, contact the FundFlow team with enough detail for us to understand the issue.",
    sections: [
      {
        heading: "General support",
        body: [
          "Email support@fundflow.local with your account email, the relevant campaign name or identifier, and a concise description of what happened.",
        ],
      },
      {
        heading: "Safety and campaign concerns",
        body: [
          "For a campaign-specific concern, use the report option on that campaign first. This links the report to the correct record for administrator review.",
        ],
      },
      {
        heading: "Protect your account",
        body: [
          "Never send passwords, session tokens, full payment credentials, or other secrets in a support message.",
        ],
      },
    ],
  },
  terms: {
    eyebrow: "Legal",
    title: "Terms of service",
    introduction:
      "These terms describe the basic rules for accessing and using FundFlow. By using the platform, you agree to follow these terms and applicable laws.",
    sections: [
      {
        heading: "Account responsibilities",
        body: [
          "Provide accurate account information, protect your login credentials, and remain responsible for activity performed through your account.",
        ],
      },
      {
        heading: "Campaigns and contributions",
        body: [
          "Campaign approval does not guarantee an outcome. Creators remain responsible for their representations and project delivery, while supporters decide independently whether to contribute.",
        ],
      },
      {
        heading: "Prohibited use",
        body: [
          "Do not misuse the service, evade access controls, interfere with platform operation, submit unlawful material, or use FundFlow to deceive or harm others.",
        ],
      },
      {
        heading: "Platform action",
        body: [
          "FundFlow may review, restrict, suspend, or remove accounts and content when needed to enforce these terms or protect the platform.",
        ],
      },
    ],
  },
  privacy: {
    eyebrow: "Legal",
    title: "Privacy policy",
    introduction:
      "FundFlow processes the information needed to provide accounts, campaigns, contributions, payments, moderation, and platform security.",
    sections: [
      {
        heading: "Information we process",
        body: [
          "This may include profile details, authentication identifiers, campaign activity, contribution records, payment references, reports, notifications, and technical request information.",
        ],
      },
      {
        heading: "How information is used",
        body: [
          "Information is used to operate FundFlow, authorize access, maintain balances and records, prevent abuse, resolve reports, and improve reliability.",
        ],
      },
      {
        heading: "Sharing and retention",
        body: [
          "Information is shared only with service providers or authorities when needed to operate the service, comply with law, or protect rights and safety. Records are retained only as long as reasonably necessary.",
        ],
      },
      {
        heading: "Your choices",
        body: [
          "You can update supported profile information and contact FundFlow with questions about your account or personal information.",
        ],
      },
    ],
  },
  cookies: {
    eyebrow: "Legal",
    title: "Cookie policy",
    introduction:
      "FundFlow uses cookies and similar browser storage primarily to keep accounts secure and preserve essential application state.",
    sections: [
      {
        heading: "Essential cookies",
        body: [
          "Authentication cookies keep you signed in, protect session access, and support secure server requests. The application cannot provide signed-in features without them.",
        ],
      },
      {
        heading: "Browser storage",
        body: [
          "FundFlow may use protected browser storage for short-lived access information and interface state needed by the application.",
        ],
      },
      {
        heading: "Managing cookies",
        body: [
          "You can clear or block cookies in your browser settings, but doing so will sign you out and may prevent account features from working.",
        ],
      },
    ],
  },
} as const satisfies Record<string, InformationPage>;

type InformationPageKey = keyof typeof informationPages;

const isInformationPage = (value: string): value is InformationPageKey =>
  Object.hasOwn(informationPages, value);

interface PageProps {
  params: Promise<{ informationPage: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { informationPage } = await params;

  if (!isInformationPage(informationPage)) {
    return {};
  }

  const page = informationPages[informationPage];

  return {
    title: `${page.title} | FundFlow`,
    description: page.introduction,
  };
}

export default async function InformationPageRoute({ params }: PageProps) {
  const { informationPage } = await params;

  if (!isInformationPage(informationPage)) {
    notFound();
  }

  const page = informationPages[informationPage];

  return (
    <main className="flex-1 bg-[linear-gradient(180deg,#F1F8F7_0%,#FFFFFF_24%)] py-14 sm:py-20">
      <PageContainer size="reading">
        <header className="border-b border-flow-100 pb-10">
          <p className="font-display text-sm font-bold tracking-[0.12em] text-flow-700 uppercase">
            {page.eyebrow}
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.04em] text-flow-950 sm:text-5xl">
            {page.title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            {page.introduction}
          </p>
        </header>

        <div className="space-y-10 py-10">
          {page.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-2xl font-bold text-flow-950">
                {section.heading}
              </h2>
              <div className="mt-3 space-y-3 text-base leading-7 text-slate-600">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </PageContainer>
    </main>
  );
}
