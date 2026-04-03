const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.preqt.club';
const API_BASE_URL = (process.env.NEXT_PUBLIC_USER_BASE || 'https://api.preqt.com/').replace(/\/$/, "");

// Endpoints
const DEALS_ENDPOINT = '/admin/api/deals/all-deals/';
const POSTS_ENDPOINT = '/admin/api/community/posts';

// Priority and Frequency constants
const SEO_CONFIG = {
  home: { priority: 1.0, changeFrequency: 'daily' },
  dealsList: { priority: 0.9, changeFrequency: 'daily' },
  dealDetail: { priority: 0.9, changeFrequency: 'daily' },
  staticPage: { priority: 0.8, changeFrequency: 'weekly' },
  communityList: { priority: 0.7, changeFrequency: 'daily' },
  communityDetail: { priority: 0.7, changeFrequency: 'daily' },
};

export async function GET() {
  const now = new Date(); // Reused date for consistency

  // 1. Define static routes
  const staticRoutes = [
    { path: '', config: SEO_CONFIG.home },
    { path: '/deals', config: SEO_CONFIG.dealsList },
    { path: '/community', config: SEO_CONFIG.communityList }, 
    { path: '/privacy-policy', config: SEO_CONFIG.staticPage },
    { path: '/terms-and-condition', config: SEO_CONFIG.staticPage },
    { path: '/become-a-partner', config: SEO_CONFIG.staticPage },
    { path: '/deal-sourcing', config: SEO_CONFIG.staticPage },
    { path: '/support', config: SEO_CONFIG.staticPage },
    { path: '/data-deletion-policy', config: SEO_CONFIG.staticPage },
    { path: '/events', config: SEO_CONFIG.staticPage },
  ].map(({ path, config }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: config.changeFrequency,
    priority: config.priority,
  }));

  // Fetch with pagination and timeout
  async function fetchAllPages(endpoint, extraParams = {}, type = "item") {
    let allData = [];
    let page = 1;
    let hasMore = true;
    const limit = 500;
    const MAX_PAGES = 50; // Safety limit to prevent infinite loops

    while (hasMore && page <= MAX_PAGES) {
      const params = new URLSearchParams({ ...extraParams, limit: String(limit), page: String(page) });
      const apiUrl = `${API_BASE_URL}${endpoint}?${params.toString()}`;

      try {
        const fetchPromise = fetch(apiUrl, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          next: { revalidate: 3600 }
        });

        // Next.js Edge safe timeout
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request Timeout')), 15000)
        );

        const res = await Promise.race([fetchPromise, timeoutPromise]);

        if (!res.ok) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[Sitemap] Failed to fetch ${type}, URL: ${apiUrl}, Status: ${res.status}`);
          }
          break; // Stop fetching on error
        }

        const data = await res.json();
        const items = data?.data || [];

        if (Array.isArray(items) && items.length > 0) {
          allData = [...allData, ...items];
          // Check if we got less than limit, meaning we're on the last page
          if (items.length < limit) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[Sitemap] Error fetching ${type} from ${apiUrl}:`, error.message);
        }
        break; // Stop on error
      }
    }

    if (page > MAX_PAGES && process.env.NODE_ENV === 'development') {
      console.warn(`[Sitemap] Safety limit reached: fetched ${MAX_PAGES} pages for ${type}`);
    }

    return allData;
  }

  // 2. Parallel fetching
  let dealsResult = [];
  let postsResult = [];

  try {
    [dealsResult, postsResult] = await Promise.all([
      fetchAllPages(DEALS_ENDPOINT, {}, 'deals'),
      fetchAllPages(POSTS_ENDPOINT, { type: 'post' }, 'community posts')
    ]);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn("[Sitemap] Parallel API fetch error:", err);
    }
  }

  // Helper to validate and map dynamic routes
  const mapDynamicRoutes = (items, basePath, config) => {
    return items
      .filter(item => item && item.slug && typeof item.slug === 'string' && item.slug.trim() !== "") // Slug validation
      .map(item => ({
        url: `${BASE_URL}${basePath}/${item.slug.trim()}`,
        lastModified: item.updatedAt ? new Date(item.updatedAt) : now,
        changeFrequency: config.changeFrequency,
        priority: config.priority,
      }));
  };

  const dealUrls = mapDynamicRoutes(dealsResult, '/deals', SEO_CONFIG.dealDetail);
  const communityUrls = mapDynamicRoutes(postsResult, '/community', SEO_CONFIG.communityDetail);

  // 3. Combine and Deduplicate
  const allUrls = [...staticRoutes, ...dealUrls, ...communityUrls];

  const uniqueUrlsMap = new Map();
  for (const item of allUrls) {
    if (!uniqueUrlsMap.has(item.url)) {
      uniqueUrlsMap.set(item.url, item);
    }
  }

  const finalUrls = Array.from(uniqueUrlsMap.values());

  // 4. Generate XML format
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${finalUrls.map(urlObj => `  <url>
    <loc>${urlObj.url}</loc>
    <lastmod>${urlObj.lastModified.toISOString()}</lastmod>
    <changefreq>${urlObj.changeFrequency}</changefreq>
    <priority>${urlObj.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
