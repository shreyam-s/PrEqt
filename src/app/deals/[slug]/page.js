import Namedetailsection from "../components/name-section/Namesection";
import { cookies } from "next/headers";
import { redirect } from "next/navigation"; // 👈 import redirect

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_USER_BASE}admin/api/deals/public/detailsbyslug/${slug}`,
      {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return {
        title: "Deal Not Found",
        description: "Unable to load deal information.",
      };
    }

    const deal = await res.json();

   
    const dealName = deal?.data?.deal_setpData?.company_name || "";

 
    const lotSize = deal?.data?.deal_setpData?.lot_size?.data || "";

   
    const tags = Array.isArray(deal?.data?.deal_setpData?.tags?.data)
      ? deal.data.deal_setpData.tags.data
      : [];

   
    const featureDescriptions = Array.isArray(deal?.data?.deal_setpData?.features?.data)
      ? deal.data.deal_setpData.features.data
          .map((item) => item?.description)
          .filter(Boolean)                     
      : [];

    
    const allDescriptions = featureDescriptions.join(" | ");

    
    const keywords =
      dealName && allDescriptions
        ? `${dealName} | ${allDescriptions} | `
        : "Deals, Investments, Opportunities";

    console.log("Generated Keywords:", keywords);

    return {
      title:
        `${dealName} - ${tags.join(", ")} | Lot Size: ${lotSize} | PrEqt` ||
        "Deal Details",

      description:
        `Discover ${dealName}, Lot Size: ${lotSize}, minimum Investment: ${deal?.data?.deal_setpData?.min_investment?.data?.amount_in_inr} and risk analysis on PrEqt` ||
        "Deal Details",

      keywords, 

     openGraph: {
  title:
    `${dealName} - ${tags.join(", ")} | Lot Size: ${lotSize} | PrEqt` ||
    "Deal Details",
  description:
    `Discover ${dealName}, Lot Size: ${lotSize}, minimum Investment: ${deal?.data?.deal_setpData?.min_investment?.data?.amount_in_inr} and risk analysis on PrEqt` ||
    "Deal Details",
  locale: "en_IN",

  images: [
    // ⭐ Static OG preview image (favicon or your logo/banner)
    {
    url: "/favicon.png",   // Use this instead of favicon.png
    width: 1200,
    height: 630,
    alt: `${dealName} - primary preview`,
  },

    // ⭐ Then append dynamic API images
    ...(
      deal?.data?.deal_overview?.company_intro_images?.data?.map(img => ({
        url: `${process.env.NEXT_PUBLIC_USER_BASE}admin/${img?.path?.replace("public/", "")}`,
        alt: `${dealName}- ${tags.join(", ")}`,
      })) || []
    )
  ],
}

    };
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return {
      title: "Deal Details",
      description: "Explore detailed deal information.",
      keywords: "Deals, Investments, Opportunities",
    };
  }
}


// export async function generateMetadata({ params }) {
//   const { slug } = params;
//   return {
//     title: `Deal | ${slug}`,
//     description: "Explore exclusive deals and investment opportunities",
//   };
// }


export default async function DealPage({ params }) {
  const { slug } = await params;

  return (
    <div>
      <Namedetailsection slug={slug} />
    </div>
  );
}
