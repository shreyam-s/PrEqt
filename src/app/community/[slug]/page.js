import Link from "next/link";
import PostDetails from "../components/PostDetails";
import Styles from './page.module.css'
import sharp from "sharp";
export const runtime = "nodejs";
const FALLBACK_TITLE = "Preqt Community Post";
const FALLBACK_DESCRIPTION =
  "Dive into detailed insights, polls, and conversations from the Preqt community.";
const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || "https://apistaging.preqt.club/admin/"
const SITE_URL = ("https://preqt.vercel.app").replace(
  /\/$/,
  ""
);
const PUBLISHER_NAME = "Preqt";

const MIN_DESCRIPTION_LENGTH = 75;
const MAX_DESCRIPTION_LENGTH = 155;

const normalizeSlug = (input) => {
  if (Array.isArray(input)) return input[0] ?? "";
  return typeof input === "string" ? input : "";
};

const stripHtml = (value) => {
  if (!value || typeof value !== "string") return "";
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
};

const formatDescription = (text) => {
  const source = stripHtml(text || FALLBACK_DESCRIPTION);
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
  const base = stripHtml(text || FALLBACK_TITLE);
  if (base.length >= 25) return base;
  const suffix = " | Preqt Community";
  const padded = `${base}${suffix}`;
  return padded.length >= 25 ? padded : `${padded} Insights`;
};

async function fetchPostBySlug(slug) {
  const normalized = normalizeSlug(slug);
  if (!normalized) return null;
  const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || "").replace(/\/$/, "");
  if (!baseUrl) return null;

  try {
    const res = await fetch(
      `${baseUrl}/admin/api/community/posts/slug/${encodeURIComponent(normalized)}`,
      {
        next: { revalidate: 300 },
        headers: { Accept: "application/json" },
      }
    );
    if (!res.ok) return null;
    const payload = await res.json();
    return payload?.data?.data?.[0] ?? null;
  } catch (error) {
    console.error("Failed to fetch post by slug:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug: rawSlug } = await params;
  const slug = normalizeSlug(rawSlug);
  const post = await fetchPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found | Preqt Community",
      description: FALLBACK_DESCRIPTION,
      alternates: {
        canonical: `${SITE_URL}/community/${slug}`,
      },
    };
  }

  const rawTitle = post.title
    ? `${stripHtml(post.title)} | Preqt Community`
    : FALLBACK_TITLE;

  const title = ensureTitleLength(rawTitle);
  const description = formatDescription(
    post.excerpt || post.content || FALLBACK_DESCRIPTION
  );

  const rawImage = Array.isArray(post.mediaUrl)
    ? post.mediaUrl[0]
    : post.mediaUrl;

  const image =
    typeof rawImage === "string"
      ? rawImage
      : rawImage?.url;

  const absoluteImage =
    rawImage?.type == "image"
      ? (`${IMAGE_URL}/${image}`).replaceAll("public/", "")
      : `${SITE_URL}/default_meta_image.png`;

  // 🔥 Dynamic width & height detection
  let width = 1200;
  let height = 630;

  try {
    if (absoluteImage) {
      const response = await fetch(absoluteImage);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const metadata = await sharp(Buffer.from(arrayBuffer)).metadata();

        width = metadata.width ?? 1200;
        height = metadata.height ?? 630;
      }
    }
  } catch (error) {
    console.error("OG image dimension detection failed:", error);
  }

  return {
    title,
    description,
    keywords: [
      "Preqt community",
      "pre-ipo investing",
      "private market insights",
      post.title ?? "",
    ].filter(Boolean),

    openGraph: {
      title,
      description,
      url: `${SITE_URL}/community/${post.slug}`,
      type: "article",
      locale: "en_IN",
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt ?? post.createdAt,
      authors: [post.authorName ?? PUBLISHER_NAME],
      images: [
        {
          url: absoluteImage,
          width,
          height,
          alt: post.title ?? "Preqt Community Post",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteImage],
    },

    authors: [{ name: post.authorName ?? PUBLISHER_NAME }],
    publisher: PUBLISHER_NAME,
    alternates: {
      canonical: `${SITE_URL}/community/${post.slug}`,
    },
  };
}

export const revalidate = 300;

export default async function CommunityPostPage({ params }) {
  const { slug: rawSlug } = await params;
  const slug = normalizeSlug(rawSlug);
  const metadata = await fetchPostBySlug(slug);
  return (
    <>
      {metadata?.title && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "DiscussionForumPosting",
              headline: metadata.title,
              datePublished: metadata.createdAt,
              dateModified: metadata.updatedAt ?? metadata.createdAt,
              author: {
                "@type": "Person",
                name: metadata.authorName ?? PUBLISHER_NAME,
              },
              publisher: {
                "@type": "Organization",
                name: PUBLISHER_NAME,
                url: SITE_URL,
              },
              mainEntityOfPage: `${SITE_URL}/community/${metadata.slug}`,
              articleBody: metadata.content ?? FALLBACK_DESCRIPTION,
            }),
          }}
        />
      )}
      <Link href="/community" className={Styles.backbuttonContainer}>
        <img src="/assets/pictures/backArrow.svg" alt="back arrow" title="Go back" />
        Back
      </Link>
      <div className={Styles.postDealMainContainer}>

        <PostDetails slug={slug} />
      </div>
    </>
  );
}
