import { cookies } from "next/headers";
import HomeComponent from "./components/home/home";
import LandingPage from "./components/LandingPage/LandingPage";
import HeroBanner from "./new-landing/fillequitymarket.module.css/HeroBanner";
import FillEquityMarket from "./new-landing/fillequitymarket.module.css/FillEquityMarket";
import DealFlow from "./new-landing/fillequitymarket.module.css/DealFlow";
import DealsMatter from "./new-landing/fillequitymarket.module.css/dealsMatter";
import Pillar from "./new-landing/fillequitymarket.module.css/Pillar";
import ScrollShowcase from "./new-landing/ScrollShowcase";
import Investors from "./new-landing/fillequitymarket.module.css/Investors";
import BenefitSection from "./new-landing/fillequitymarket.module.css/BenefitSection";
import NetworkGlobal from "./new-landing/fillequitymarket.module.css/NetworkGlobal";

const FALLBACK_DESCRIPTION =
  "PrEqt – Access exclusive private equity deals, pre-IPO investments, and premium investor networks through verified opportunities, live analytics, and smart tracking for confident capital raising.";
const FALLBACK_TITLE = "PrEqt - Private Equity & Pre-IPO Investment Platform";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.preqt.club").replace(
  /\/$/,
  ""
);
const PUBLISHER_NAME = "PrEqt";
const PUBLISHER_URL = `${SITE_URL}/`;
const PUBLISHER_LOGO = `${SITE_URL}/logo.svg`;

const MIN_DESCRIPTION_LENGTH = 75;
const MAX_DESCRIPTION_LENGTH = 155;

const formatDescription = (text) => {
  const source = (text || FALLBACK_DESCRIPTION)
    .replace(/\s+/g, " ")
    .trim();

  const ensureMin = (value, min, pad) => {
    if (value.length >= min) return value;
    const needed = min - value.length;
    const padding = (pad.repeat(Math.ceil(needed / pad.length))).slice(0, needed);
    return `${value} ${padding}`.trim();
  };

  const ensured = ensureMin(source, MIN_DESCRIPTION_LENGTH, FALLBACK_DESCRIPTION);
  if (ensured.length <= MAX_DESCRIPTION_LENGTH) return ensured;
  return `${ensured.slice(0, MAX_DESCRIPTION_LENGTH - 3).trim()}...`;
};

const ensureTitleLength = (text) => {
  const base = text || FALLBACK_TITLE;
  if (base.length >= 25) return base;
  const suffix = " | PrEqt Platform";
  const padded = `${base}${suffix}`;
  return padded.length >= 25 ? padded : `${padded} - Private Equity`;
};    

export const revalidate = 300;

export async function generateMetadata() {
  const title = ensureTitleLength(FALLBACK_TITLE);
  const description = formatDescription(FALLBACK_DESCRIPTION);
  const defaultImage = `${SITE_URL}/logo.png`;

  return {
    title,
    description,
    keywords: [
      "private equity platform",
      "pre-IPO investing",
      "private equity deals",
      "investor network",
      "venture capital platform",
      "startup investing",
      "exclusive investment opportunities",
      "private markets access",
      "capital raising platform",
      "deal sourcing",
      "investment analytics",
      "smart investment tracking",
      "verified deals",
      "pre-IPO access",
      "IPO opportunities",
      "private equity investments",
      "alternative investments",
      "investment platform",
      "equity crowdfunding",
      "angel investing",
      "seed funding",
      "series A funding",
      "private company investments",
      "investment opportunities",
      "wealth management",
      "high net worth investing",
      "accredited investor platform",
      "deal flow management",
      "investment portfolio tracking",
      "real-time investment analytics"
    ],
    authors: [{ name: PUBLISHER_NAME }],
    publisher: PUBLISHER_NAME,
    creator: PUBLISHER_NAME,
    openGraph: {
      title,
      description,
      url: SITE_URL,
      siteName: PUBLISHER_NAME,
      type: "website",
      locale: "en_IN",
      images: [
        {
          url: defaultImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [defaultImage],
      creator: "@preqt",
      site: "@preqt",
    },
    alternates: {
      canonical: SITE_URL,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
      yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
    },
    other: {
      "x-robots-tag": "index, follow",
    },
  };
}

export default async function Page() {
  // 🧩 Access cookies (server-side)
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken");

  const pageDescription = formatDescription(FALLBACK_DESCRIPTION);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: PUBLISHER_NAME,
    url: SITE_URL,
    description: pageDescription,
    publisher: {
      "@type": "Organization",
      name: PUBLISHER_NAME,
      url: PUBLISHER_URL,
      logo: {
        "@type": "ImageObject",
        url: PUBLISHER_LOGO,
      },
      sameAs: [
        process.env.NEXT_PUBLIC_FACEBOOK_URL,
        process.env.NEXT_PUBLIC_TWITTER_URL,
        process.env.NEXT_PUBLIC_LINKEDIN_URL,
      ].filter(Boolean),
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    mainEntity: {
      "@type": "FinancialService",
      name: `${PUBLISHER_NAME} - Private Equity Platform`,
      description: pageDescription,
      serviceType: "Private Equity Investment Platform",
      areaServed: "Worldwide",
      offers: {
        "@type": "Offer",
        category: "Private Equity Investments",
        description: "Access to exclusive private equity deals and pre-IPO investment opportunities",
      },
    },
  };

  // ✅ If logged in (token present), show HomeComponent
  if (accessToken) {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <HomeComponent />
      </>
    );
  }

  // ❌ If not logged in, show LandingPage
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* <LandingPage /> */}
      <HeroBanner />
      <FillEquityMarket />
      <DealFlow />
      <DealsMatter />
      <Pillar />
      <ScrollShowcase />
      <Investors />
      <BenefitSection />
      <NetworkGlobal />
    </>
  );
}
