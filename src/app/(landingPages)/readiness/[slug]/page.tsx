import { AFCFTA_URL, getReadinessPage, readinessPages } from "@/lib/readinessPages";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const SITE_URL = "https://capalyse.com";
const SME_URL = `${SITE_URL}/SMEs`;
const INVESTORS_URL = `${SITE_URL}/investors`;

export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return readinessPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getReadinessPage(slug);
  if (!page) return {};
  const url = `${SITE_URL}/readiness/${page.slug}`;
  return {
    title: `${page.title} | Capalyse`,
    description: page.description,
    alternates: { canonical: url },
    openGraph: {
      title: page.title,
      description: page.description,
      url,
      siteName: "Capalyse",
      type: "article",
    },
  };
}

function faqFor(sector: string, country: string, context: string) {
  return [
    {
      q: `What do investors look for in a ${sector} SME in ${country}?`,
      a: `Typically five things: sound governance, reliable financial records, regulatory compliance, evidence of traction, and a credible path to scale. ${context}`,
    },
    {
      q: `Which registrations matter for a ${sector} business in ${country}?`,
      a: "At minimum, formal company registration and tax compliance. Depending on your activity, sector regulators may also apply. The official bodies listed on this page are the place to confirm current requirements.",
    },
    {
      q: "Do I need documents to start the Capalyse assessment?",
      a: "No. The assessment asks structured questions across governance, finance, compliance, traction and scalability, and no documents are needed to start.",
    },
    {
      q: "Can I use Capalyse if I'm not fundraising yet?",
      a: "Yes. Many SMEs use a readiness assessment to see gaps before they approach investors.",
    },
  ];
}

export default async function ReadinessPage({ params }: Props) {
  const { slug } = await params;
  const page = getReadinessPage(slug);
  if (!page) notFound();

  const { sector, country } = page;
  const faq = faqFor(sector, country, page.context);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  const areas = [
    {
      area: "Governance",
      look: "Clear ownership and cap table, a functioning board or advisors, documented decision-making.",
      ready:
        "Keep shareholder records and registration documents current; separate personal and business accounts.",
    },
    {
      area: "Finance",
      look: page.finance,
      ready:
        "Maintain monthly management accounts and, where possible, reviewed or audited annual statements.",
    },
    {
      area: "Compliance",
      look: page.compliance,
      ready:
        "Confirm current requirements with the official bodies listed below and keep certificates on file.",
    },
    {
      area: "Traction",
      look: "Verifiable revenue, customers, contracts or pilots: evidence, not projections.",
      ready:
        "Keep signed contracts, invoices and customer data that an investor can verify in due diligence.",
    },
    {
      area: "Scalability",
      look: "A model that grows without costs growing at the same rate; a clear use of funds.",
      ready: "Show what a specific amount of capital unlocks: capacity, markets, or headcount.",
    },
  ];

  const h2 = "text-2xl lg:text-3xl font-bold mb-4";
  const extLink = "text-green font-medium underline underline-offset-2 hover:text-primary-green-7";
  const cta =
    "inline-flex items-center justify-center gap-2 px-8 py-3 bg-green text-white font-bold rounded-md hover:bg-primary-green-7 transition-colors duration-200 text-sm";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <section className="py-20 lg:py-28 bg-gradient-to-b from-[#F4FFFC] to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-green font-medium text-sm uppercase tracking-wide">
            Investment readiness · {country}
          </span>
          <h1 className="text-4xl lg:text-[52px] font-bold leading-tight mt-4 mb-6">
            Is your <span className="text-green">{sector}</span> business in {country}{" "}
            investment-ready?
          </h1>
          <p className="text-gray-600 text-base lg:text-lg leading-relaxed mb-8">
            Before an investor funds a {sector} SME in {country}, they run through the same core
            questions: is the business well run, are the numbers reliable, is it compliant, is it
            growing, and can it scale? This guide maps those questions to what matters in your
            sector and country, so you can fix gaps before you pitch.
          </p>
          <Link href={SME_URL} className={cta}>
            Take the free investment readiness assessment <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-16 text-gray-700 leading-relaxed">
        <section>
          <h2 className={h2}>
            What investors check in {sector} in {country}
          </h2>
          <p className="mb-6">{page.context}</p>
          <div className="overflow-x-auto rounded-xl border border-black-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F4FFFC] text-black-500">
                <tr>
                  <th className="p-4 font-semibold">Area</th>
                  <th className="p-4 font-semibold">What investors look for</th>
                  <th className="p-4 font-semibold">How to get ready</th>
                </tr>
              </thead>
              <tbody>
                {areas.map((r) => (
                  <tr key={r.area} className="border-t border-black-100 align-top">
                    <td className="p-4 font-semibold text-black-500">{r.area}</td>
                    <td className="p-4">{r.look}</td>
                    <td className="p-4">{r.ready}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className={h2}>Official bodies to know in {country}</h2>
          <p className="mb-4">Requirements change. Always confirm with the official source:</p>
          <ul className="list-disc pl-6 space-y-2">
            {page.regulators.map((r) => (
              <li key={r.url}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className={extLink}
                >
                  {r.name}
                </a>
              </li>
            ))}
          </ul>
        </section>

        {page.programmes.length > 0 && (
          <section>
            <h2 className={h2}>Local funding and support programmes</h2>
            <p className="text-sm text-black-300 mb-6">
              Checked on official pages in October 2026. Check each programme&apos;s site for
              current terms and application windows.
            </p>
            <div className="grid gap-4">
              {page.programmes.map((p) => (
                <div key={p.name} className="rounded-xl border border-black-100 p-5 bg-[#FAFFFE]">
                  <a
                    href={p.url}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className={`${extLink} text-base`}
                  >
                    {p.name}
                  </a>
                  <p className="mt-2">{p.offer}</p>
                  <p className="mt-1 text-sm">
                    <span className="font-semibold">Who it&apos;s for:</span> {p.eligibility}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className={h2}>AfCFTA: selling beyond {country}</h2>
          <p>
            The African Continental Free Trade Area aims to create a single market across African
            Union member states. If you trade or plan to trade across borders, investors will ask
            whether your products qualify for preferential treatment under the AfCFTA rules of
            origin. Capalyse&apos;s assessment includes AfCFTA readiness checks for cross-border
            traders. Official information:{" "}
            <a
              href={AFCFTA_URL}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className={extLink}
            >
              AfCFTA Secretariat
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className={h2}>Frequently asked questions</h2>
          <div className="divide-y divide-black-100 rounded-xl border border-black-100">
            {faq.map(({ q, a }) => (
              <details key={q} className="group p-5">
                <summary className="cursor-pointer font-semibold text-black-500">{q}</summary>
                <p className="mt-3">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="bg-[#01281D] rounded-3xl p-10 lg:p-14 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">See where you stand</h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-8">
            The Capalyse assessment covers governance, finance, compliance, traction and
            scalability. No documents are needed to start, and you&apos;ll see your readiness gaps
            before you speak to investors.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href={SME_URL} className={cta}>
              Start your free assessment <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={INVESTORS_URL}
              className="text-primary-green-2 font-semibold underline underline-offset-2"
            >
              Investor? See Capalyse for investors
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
