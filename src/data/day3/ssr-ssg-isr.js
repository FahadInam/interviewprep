export const ssrSsgIsr = {
  id: "ssr-ssg-isr",
  title: "SSR, SSG, ISR & Rendering Strategies",
  icon: "🔄",
  tag: "Next.js",
  tagColor: "var(--tag-next)",
  subtitle: "Server-Side Rendering, Static Generation, Incremental Regeneration, and Streaming",
  concepts: [
    {
      title: "Server-Side Rendering (SSR)",
      explanations: {
        layman: "Think of a restaurant where every dish is cooked to order. You walk in, the chef starts cooking your meal fresh right then. You wait a bit, but the food is hot and made exactly how you want it. SSR works like this: every time someone visits a page, the server builds it fresh with the latest data. It is slower than serving a pre-made plate, but you always get the freshest content. Compare this to SSG (pre-made meals sitting under a heat lamp), ISR (pre-made meals that the kitchen refreshes every so often), and CSR (you get the raw ingredients and cook at home in your browser).",
        mid: "SSR renders the page on the server for every request. In the App Router, a route becomes SSR'd when it uses dynamic APIs: cookies(), headers(), searchParams, or when fetch has no cache/revalidate options (or uses cache: 'no-store'). The server executes the React component tree, generates HTML, and sends it to the client along with the RSC payload for hydration. The HTML is not cached between requests — each request triggers a full server render. This is equivalent to the old getServerSideProps behavior but happens automatically based on dynamic API usage.",
        senior: "In the App Router, SSR is the fallback rendering mode triggered by dynamic data dependencies. The runtime detects dynamic usage at the segment level — if any component in a segment uses cookies(), headers(), or uncached fetch, that entire segment becomes dynamic. The server generates both HTML (for the initial paint) and RSC payload (for client-side reconciliation). With streaming SSR, the response uses chunked transfer encoding: the shell (layouts) streams immediately, while dynamic segments stream as they resolve. This is a fundamental improvement over Pages Router SSR where the entire page blocked until getServerSideProps completed. In production, SSR pages can run on Edge Runtime (export const runtime = 'edge') for lower latency by executing at CDN edge nodes, but Edge has limitations (no Node.js APIs like fs, limited memory). The Time To First Byte (TTFB) for SSR depends on your data source latency — always co-locate your server and database. Server-side rendering also enables personalization at the HTML level, which is critical for pages that vary by user but still need SEO."
      },
      realWorld: "A news site SSR's its homepage because the headlines change constantly and SEO is critical. A banking dashboard SSR's because it must show personalized, real-time account data on every load.",
      whenToUse: "Use SSR when you need fresh data on every request AND the page must be SEO-friendly or have fast First Contentful Paint. Ideal for personalized content, real-time dashboards, and pages that depend on request context (cookies, auth).",
      whenNotToUse: "Avoid SSR for pages where data doesn't change per request — use SSG or ISR instead. SSR increases server costs (every request hits the server) and has higher TTFB than cached static pages. Don't use SSR if you can achieve the same result with client-side fetching after an SSG shell.",
      pitfalls: "The biggest SSR pitfall is accidentally opting into it. In the App Router, a single cookies() call in a deep component can make the entire page dynamic. Use Suspense boundaries to isolate dynamic parts — only the suspended section becomes SSR while the rest can be static. Also, SSR on Edge Runtime lacks Node.js APIs, so database drivers that require Node.js won't work there. Monitor your TTFB — slow database queries directly impact SSR performance.",
      codeExamples: [
        {
          title: "SSR via Dynamic APIs (App Router)",
          code: `// app/dashboard/page.js
// This page is automatically SSR'd because it uses cookies()
import { cookies } from 'next/headers';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;

  // Fetch user-specific data with no caching
  const userData = await fetch(
    'https://api.example.com/user/dashboard',
    {
      headers: { Authorization: \`Bearer \${sessionToken}\` },
      cache: 'no-store' // Explicitly no caching
    }
  ).then(r => r.json());

  return (
    <div>
      <h1>Welcome, {userData.name}</h1>
      <p>Balance: \${userData.balance}</p>
      <p>Last login: {userData.lastLogin}</p>
    </div>
  );
}

// This is equivalent to Pages Router's getServerSideProps,
// but without the boilerplate — data fetching is inline.`
        }
      ]
    },
    {
      title: "Static Site Generation (SSG)",
      explanations: {
        layman: "SSG is like a restaurant that pre-makes all its meals before opening. Every plate is ready and waiting under a heat lamp. When a customer walks in, they get served instantly -- no cooking, no waiting. The downside? If the recipe changes, all those pre-made plates are outdated until you close the restaurant and cook a whole new batch. That 'closing and re-cooking' is a rebuild and redeploy.",
        mid: "SSG renders pages at build time. In the App Router, a route is statically generated when it has no dynamic API usage and all fetches are cached (the default). The HTML and RSC payload are generated once during 'next build' and served directly from the CDN on every request. For dynamic routes, generateStaticParams specifies which paths to pre-render. SSG pages load extremely fast because there's no server computation at request time — it's just file serving. The trade-off is that content only updates when you rebuild and redeploy.",
        senior: "In the App Router, static generation is the default behavior — the framework aggressively tries to make every route static. The build process detects whether a route uses any dynamic APIs (cookies, headers, searchParams, uncached fetch) and statically renders all routes that don't. The output is pre-rendered HTML plus RSC payloads stored as static files. In production, these are served from the CDN edge with cache-control headers for instant delivery. For large sites, the build time of static generation can be significant — generateStaticParams can generate thousands of pages, each requiring data fetching and rendering. Techniques to manage this: parallel generation (Next.js handles this internally), incremental builds (deploy only changed pages), and hybrid strategies (statically generate popular pages, use ISR for the long tail). The RSC payload for static pages is also pre-generated, meaning client-side navigations to static pages are instant without server round-trips — the router prefetches RSC payloads on link hover. Static pages can still have interactive Client Components that hydrate after load."
      },
      realWorld: "A company blog, marketing landing pages, documentation sites, and product catalogs with infrequent updates are perfect SSG candidates. These pages need to load fast, be SEO-friendly, and don't change per-user.",
      whenToUse: "Use SSG for any page where the content is the same for all users and doesn't change between deployments. Documentation, blogs, marketing pages, legal pages, and infrequently updated catalogs.",
      whenNotToUse: "Don't use pure SSG for content that changes frequently (breaking news, stock prices) or content that varies per user (dashboards, personalized feeds). The rebuild-to-update cycle is too slow for dynamic content.",
      pitfalls: "Build times grow linearly with the number of static pages. A site with 100k product pages takes a long time to build. Also, developers sometimes forget that static pages are frozen at build time — if your API changes, the page doesn't update until the next build. Using ISR solves this. Watch out for accidentally introducing dynamic APIs that break static generation — a single cookies() call opts the whole segment out.",
      codeExamples: [
        {
          title: "Static Generation in App Router",
          code: `// app/about/page.js
// This page is automatically statically generated
// because it has no dynamic APIs and fetch is cached by default

export const metadata = {
  title: 'About Us',
  description: 'Learn about our company'
};

export default async function AboutPage() {
  // This fetch is cached at build time by default
  const team = await fetch('https://api.example.com/team')
    .then(r => r.json());

  return (
    <section>
      <h1>About Our Company</h1>
      <p>We build great products.</p>
      <div className="team-grid">
        {team.map(member => (
          <div key={member.id} className="team-card">
            <h3>{member.name}</h3>
            <p>{member.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// To verify: run 'next build' and check the output.
// Static pages show a hollow circle (○) in the build log.
// Dynamic pages show a lambda (λ).`
        }
      ]
    },
    {
      title: "Incremental Static Regeneration (ISR)",
      explanations: {
        layman: "ISR is like a restaurant with pre-made meals that get refreshed on a schedule. The kitchen makes a batch of pasta at noon. For the next hour, every customer gets that same pre-made pasta instantly. After an hour, when the next customer orders, they still get the old pasta (so they are not waiting), but the kitchen starts cooking a fresh batch in the background. The customer after that gets the fresh one. You can also call the kitchen directly and say 'the recipe changed, remake it now' -- that is on-demand revalidation. You get the speed of pre-made food with the freshness of cooking to order.",
        mid: "ISR lets you use static generation with automatic or on-demand revalidation. Time-based ISR uses next: { revalidate: N } on fetch calls (or route segment config) to specify how many seconds a page stays fresh. After that period, the next request triggers a background regeneration — the stale page is served while the new one builds. On-demand ISR uses revalidatePath() or revalidateTag() to immediately invalidate specific pages or groups of pages, typically triggered by a CMS webhook or admin action. ISR gives you the speed of static with the freshness of dynamic.",
        senior: "ISR operates at the cache entry level, not the page level. Each fetch with a revalidate time creates an independent cache entry. When the revalidation period expires, the next request triggers a background re-render using the stale-while-revalidate pattern. The new RSC payload and HTML replace the old cache entry atomically — there's no partial update state. On-demand revalidation via revalidatePath('/path') purges the cache entry and the next request triggers a fresh render. revalidateTag('tag') purges all fetch cache entries tagged with that tag, triggering revalidation for any page that used those fetches. This tag-based system is powerful: tag all fetches from a CMS with the content ID, then purge by tag when content updates. In production, ISR cache entries are stored in the data cache on the deployment platform (Vercel stores them at the edge, self-hosted uses the file system). Be aware of cache key composition: the same page can have multiple cache entries based on dynamic segments. ISR regeneration runs in the Node.js runtime regardless of the page's runtime config. For high-traffic pages, the thundering herd problem is mitigated by serving stale content while one regeneration happens — subsequent requests during regeneration get the stale version, not a fresh render each."
      },
      realWorld: "An e-commerce site uses ISR with 60-second revalidation for product pages — prices update within a minute without rebuilding. A CMS-powered blog uses on-demand revalidation: when an editor publishes an article, a webhook calls revalidatePath to instantly update the page.",
      whenToUse: "Use ISR for content that changes periodically but doesn't need real-time freshness: product catalogs, blog posts, pricing pages, documentation. Use on-demand ISR when you have a clear trigger for content updates (CMS publish, admin action).",
      whenNotToUse: "Don't use ISR for personalized content (it serves the same page to all users during the cache period). Avoid ISR if data must be real-time — a 60-second stale window might be unacceptable for stock prices or live scores. Also inappropriate for pages that vary by cookies/auth.",
      pitfalls: "ISR serves stale content during revalidation — if this is unacceptable, use SSR instead. On-demand revalidation only works in route handlers or server actions (you need a server endpoint for webhooks to hit). Time-based ISR with very short revalidation periods (e.g., 1 second) is essentially SSR with extra caching overhead — just use SSR. Also, ISR cache is per-deployment on some platforms, meaning a new deployment starts with cold caches.",
      codeExamples: [
        {
          title: "Time-Based and On-Demand ISR",
          code: `// app/products/[id]/page.js — Time-based ISR
export default async function ProductPage({ params }) {
  const { id } = await params;

  const product = await fetch(
    \`https://api.example.com/products/\${id}\`,
    { next: { revalidate: 60 } } // Revalidate every 60 seconds
  ).then(r => r.json());

  return (
    <div>
      <h1>{product.name}</h1>
      <p>Price: \${product.price}</p>
      <p>Stock: {product.stock} available</p>
    </div>
  );
}

// app/api/revalidate/route.js — On-demand ISR via webhook
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json();
  const secret = request.headers.get('x-revalidation-secret');

  // Verify webhook authenticity
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Option 1: Revalidate a specific path
  if (body.path) {
    revalidatePath(body.path);
    return NextResponse.json({ revalidated: true, path: body.path });
  }

  // Option 2: Revalidate by tag (more flexible)
  if (body.tag) {
    revalidateTag(body.tag);
    return NextResponse.json({ revalidated: true, tag: body.tag });
  }

  return NextResponse.json({ error: 'Missing path or tag' }, { status: 400 });
}

// Using tags for granular revalidation
// app/products/[id]/page.js
export default async function ProductPage({ params }) {
  const { id } = await params;

  const product = await fetch(
    \`https://api.example.com/products/\${id}\`,
    {
      next: {
        revalidate: 3600, // Fallback: revalidate hourly
        tags: [\`product-\${id}\`, 'products'] // Tag-based invalidation
      }
    }
  ).then(r => r.json());

  return <div><h1>{product.name}</h1></div>;
}
// Now calling revalidateTag('product-123') only revalidates
// that specific product, while revalidateTag('products')
// revalidates ALL product pages.`
        }
      ]
    },
    {
      title: "Client-Side Rendering (CSR) and When It's Appropriate",
      explanations: {
        layman: "CSR is like a restaurant that gives you the raw ingredients and a recipe, and you cook the meal yourself at home. Your kitchen (the browser) does all the work. The restaurant barely lifts a finger -- it just hands you a bag. The upside: once you have finished cooking, you can customize the dish however you want (the page is fully interactive). The downside: you see an empty plate until you are done cooking, and search engines cannot taste a meal that has not been cooked yet (bad for SEO).",
        mid: "In the App Router, CSR means rendering content in the browser using Client Components. You mark a component with 'use client' and use hooks like useState, useEffect, and client-side data fetching libraries (SWR, TanStack Query). CSR is appropriate for interactive UI that doesn't need SEO (dashboards behind auth, admin panels) and for real-time features (chat, live updates). The key difference from pure CSR (like Create React App): Next.js still server-renders the initial HTML shell, so there's always a fast first paint. The CSR parts hydrate and become interactive after JavaScript loads.",
        senior: "In the App Router architecture, CSR is not a page-level strategy but a component-level decision. A page can be statically generated with a CSR component embedded inside it. The Server Component sends the HTML shell, and the Client Component hydrates on the browser. For data fetching in Client Components, there's no built-in solution like SWR — you use third-party libraries or useEffect. The critical consideration: Client Components still have their initial render server-rendered (their HTML is included in the SSR output). The 'use client' directive doesn't mean 'render only on client' — it means 'include the JavaScript bundle for this component and hydrate it on the client.' For purely client-rendered sections (no SSR), you must explicitly skip SSR using dynamic() with ssr: false or a useEffect guard. CSR is ideal for above-the-fold interactive widgets, real-time data (WebSocket feeds), and components that depend on browser APIs (window, localStorage, geolocation). In production, excessive CSR increases bundle size and Time to Interactive (TTI). The rule of thumb: render what you can on the server, hydrate only what needs interactivity."
      },
      realWorld: "A stock trading dashboard uses CSR with WebSocket connections for real-time price updates. A text editor uses CSR because it requires full browser API access. An analytics dashboard behind authentication uses CSR since SEO is irrelevant.",
      whenToUse: "Use CSR for highly interactive components (forms, editors, charts), real-time data (WebSocket, polling), browser-API-dependent features (geolocation, local storage), and content behind authentication where SEO doesn't matter.",
      whenNotToUse: "Don't default to CSR for everything — it increases bundle size and delays content visibility. Avoid CSR for SEO-critical content. Don't use CSR for data that could be fetched on the server — server-fetched data means smaller bundles and faster paints.",
      pitfalls: "The most common mistake is making everything a Client Component. Only add 'use client' to the smallest component that needs interactivity — not the whole page. Client-side data fetching creates loading waterfalls (page loads → JS loads → data fetches → render). Use server-side fetching as much as possible and pass data down. Also, Client Components are still SSR'd on first load — don't assume they only run in the browser without a typeof window check or useEffect.",
      codeExamples: [
        {
          title: "CSR Component Within a Server-Rendered Page",
          code: `// app/stocks/page.js — Server Component (SSG shell)
import { StockTicker } from './_components/StockTicker';

export default async function StocksPage() {
  // Server-fetched initial data (fast, no client JS needed)
  const initialStocks = await fetch(
    'https://api.example.com/stocks/watchlist',
    { next: { revalidate: 30 } }
  ).then(r => r.json());

  return (
    <div>
      <h1>Stock Watchlist</h1>
      {/* CSR component for real-time updates */}
      <StockTicker initialData={initialStocks} />
    </div>
  );
}

// app/stocks/_components/StockTicker.js
"use client";

import { useState, useEffect } from 'react';

export function StockTicker({ initialData }) {
  const [stocks, setStocks] = useState(initialData);

  useEffect(() => {
    // Real-time updates via WebSocket (client-only)
    const ws = new WebSocket('wss://stream.example.com/stocks');

    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setStocks(prev =>
        prev.map(stock =>
          stock.symbol === update.symbol
            ? { ...stock, price: update.price, change: update.change }
            : stock
        )
      );
    };

    return () => ws.close();
  }, []);

  return (
    <table>
      <thead>
        <tr><th>Symbol</th><th>Price</th><th>Change</th></tr>
      </thead>
      <tbody>
        {stocks.map(stock => (
          <tr key={stock.symbol}>
            <td>{stock.symbol}</td>
            <td>\${stock.price.toFixed(2)}</td>
            <td className={stock.change >= 0 ? 'green' : 'red'}>
              {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}`
        }
      ]
    },
    {
      title: "Streaming SSR with Suspense",
      explanations: {
        layman: "Traditional SSR is like waiting for an entire meal to be cooked before it is served. Streaming SSR is like a tapas restaurant — dishes arrive as they are ready. You start eating the appetizer while the main course is still cooking. The page layout appears instantly, and content fills in piece by piece as data arrives. You never stare at a blank table.",
        mid: "Streaming SSR uses React Suspense to progressively send HTML chunks as they become available. When a Server Component is wrapped in a Suspense boundary (or uses loading.js), Next.js streams the shell immediately and sends the Suspense fallback. Once the async component resolves, the server streams the actual content and a small script that swaps the fallback with the real content. This means TTFB is nearly instant (you get the layout immediately) and Time to First Meaningful Paint improves because content appears incrementally. Multiple Suspense boundaries can stream independently in parallel.",
        senior: "Streaming SSR fundamentally changes the performance profile of server-rendered pages. Instead of waiting for all data to resolve before sending any HTML (waterfall), the server uses chunked transfer encoding to progressively stream HTML. React's streaming renderer processes the component tree depth-first; when it hits a Suspense boundary wrapping an async component, it sends the fallback HTML and continues rendering other parts. When the suspended component resolves, a <script> tag is streamed that replaces the fallback DOM with the real content (out-of-order streaming). This means the critical rendering path only includes the shell — deep data dependencies don't block the initial paint. In production, streaming pairs beautifully with Edge Runtime for minimal TTFB. The RSC payload also streams alongside the HTML, so client-side React can reconcile progressively. The key architectural decision: where to place Suspense boundaries. Too many creates visual jank (many things popping in); too few defeats the purpose (large blocking sections). The optimal approach is to Suspend at data-dependency boundaries: each section that fetches from a different source gets its own Suspense boundary."
      },
      realWorld: "A product page streams the header and price instantly (from cache), then the reviews section streams in 200ms later (from a slower API), and the recommendations section arrives 500ms later (from an ML service). Users see content progressively instead of waiting for the slowest API.",
      whenToUse: "Use streaming SSR whenever a page has multiple independent data dependencies with different latencies. It's especially powerful for pages with a fast critical section and slow secondary sections (comments, recommendations, analytics).",
      whenNotToUse: "Streaming adds complexity. For simple pages with a single fast data source, regular SSR or SSG is simpler and just as fast. Also, some crawlers don't handle streaming well — test your SEO if that's critical.",
      pitfalls: "Suspense fallbacks flash briefly even for fast-resolving components — use CSS transitions to smooth the swap. Too many Suspense boundaries create a 'popcorn' effect where content pops in randomly. Errors in streamed sections need their own error boundaries — an error.js at the segment level wraps loading.js. Also, streaming responses cannot set headers after streaming begins, so any cookies or redirects must happen before the first byte.",
      codeExamples: [
        {
          title: "Streaming SSR with Multiple Suspense Boundaries",
          code: `// app/product/[id]/page.js
import { Suspense } from 'react';
import { ProductInfo } from './_components/ProductInfo';
import { ProductReviews } from './_components/ProductReviews';
import { Recommendations } from './_components/Recommendations';

export default async function ProductPage({ params }) {
  const { id } = await params;

  return (
    <div className="product-page">
      {/* This streams first — fast cached data */}
      <Suspense fallback={<ProductInfoSkeleton />}>
        <ProductInfo id={id} />
      </Suspense>

      {/* These stream independently as their data resolves */}
      <div className="product-secondary">
        <Suspense fallback={<ReviewsSkeleton />}>
          <ProductReviews productId={id} />
        </Suspense>

        <Suspense fallback={<RecommendationsSkeleton />}>
          <Recommendations productId={id} />
        </Suspense>
      </div>
    </div>
  );
}

// Each component fetches independently and streams when ready
// app/product/[id]/_components/ProductInfo.js
export async function ProductInfo({ id }) {
  const product = await fetch(
    \`https://api.example.com/products/\${id}\`,
    { next: { revalidate: 60 } }
  ).then(r => r.json());

  return (
    <section>
      <h1>{product.name}</h1>
      <p className="price">\${product.price}</p>
      <p>{product.description}</p>
    </section>
  );
}

// app/product/[id]/_components/ProductReviews.js
export async function ProductReviews({ productId }) {
  // Slower API — but doesn't block the product info!
  const reviews = await fetch(
    \`https://api.example.com/products/\${productId}/reviews\`
  ).then(r => r.json());

  return (
    <section>
      <h2>Reviews ({reviews.length})</h2>
      {reviews.map(review => (
        <div key={review.id}>
          <strong>{review.author}</strong>
          <p>{review.text}</p>
        </div>
      ))}
    </section>
  );
}

function ProductInfoSkeleton() {
  return <div className="skeleton pulse" style={{ height: '200px' }} />;
}

function ReviewsSkeleton() {
  return <div className="skeleton pulse" style={{ height: '300px' }} />;
}

function RecommendationsSkeleton() {
  return <div className="skeleton pulse" style={{ height: '250px' }} />;
}`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "What determines whether a route is statically generated or server-rendered in the App Router?",
      answer: "The App Router tries to make everything static by default. A route only becomes server-rendered (dynamic) when Next.js detects that it needs request-time information. Three things trigger this: (1) Using dynamic APIs like cookies(), headers(), or the searchParams prop. (2) Using fetch with cache: 'no-store'. (3) Explicitly setting export const dynamic = 'force-dynamic'. If none of these are present, the route is statically generated at build time. You can also force static with export const dynamic = 'force-static', which errors if dynamic APIs are used. The key detail: detection happens at the segment level, so a single cookies() call buried in a deeply nested component makes the entire route segment dynamic. Use Suspense boundaries to isolate dynamic parts and keep the rest static.",
      difficulty: "mid",
      followUps: [
        "Can a single page have both static and dynamic segments?",
        "What happens if you use cookies() inside a statically-forced route?",
        "How does the build output indicate which routes are static vs dynamic?"
      ]
    },
    {
      question: "Explain the stale-while-revalidate pattern in ISR.",
      answer: "When a page has a revalidation period (e.g., revalidate: 60), it works in three phases. Fresh phase: for the first 60 seconds, all requests serve the cached static page instantly. Stale phase: after 60 seconds, the next request still serves the cached page (stale) but triggers a background regeneration. The server re-renders the page with fresh data and updates the cache. Revalidated phase: subsequent requests now serve the fresh page. This means users never wait for regeneration — they always get an instant response. The trade-off is that one request per revalidation cycle sees stale data. This pattern is identical to the HTTP stale-while-revalidate cache directive.",
      difficulty: "mid",
      followUps: [
        "What happens if the background regeneration fails?",
        "How does ISR handle the thundering herd problem?",
        "Can you combine time-based and on-demand revalidation?"
      ]
    },
    {
      question: "Compare all four rendering strategies (SSG, SSR, ISR, CSR) with their trade-offs.",
      answer: "SSG: Build-time rendering. Fastest delivery (CDN-served), best for SEO, but content is stale until rebuild. Use for static content. SSR: Per-request rendering. Fresh data, good SEO, but higher TTFB and server cost. Every request hits the server. Use for personalized/real-time pages that need SEO. ISR: Hybrid — static delivery with background revalidation. Near-instant delivery with periodic freshness. Slight staleness during revalidation window. Use for content that changes periodically. CSR: Browser rendering. No server cost at runtime, full interactivity, but poor SEO (empty HTML initially) and slower First Contentful Paint. Use for interactive apps behind auth. In the App Router, these aren't mutually exclusive — a single page can combine static shells with SSR'd Suspense boundaries and CSR interactive components.",
      difficulty: "hard",
      followUps: [
        "Can you use ISR with personalized content?",
        "How does streaming SSR change the SSR trade-offs?",
        "What's the performance difference between ISR and SSR for a high-traffic page?"
      ]
    },
    {
      question: "How does streaming SSR work with React Suspense in Next.js?",
      answer: "Streaming SSR sends HTML in chunks as components resolve. When the server encounters a Suspense boundary wrapping an async component, it immediately sends the fallback HTML and continues rendering other parts of the tree. When the suspended component finishes, the server streams a script tag that injects the resolved HTML and replaces the fallback — this is called out-of-order streaming. Multiple Suspense boundaries stream independently. The browser progressively renders content as chunks arrive. In Next.js, loading.js files automatically create Suspense boundaries. The benefit: TTFB drops dramatically because the shell streams instantly. Users see content progressively instead of staring at a blank page. The RSC payload also streams alongside, enabling the client to reconcile incrementally.",
      difficulty: "hard",
      followUps: [
        "What limitations exist on headers when using streaming?",
        "How does streaming affect web crawlers and SEO?",
        "Can you control the order in which Suspense boundaries resolve?"
      ]
    },
    {
      question: "What is on-demand revalidation and how does it differ from time-based ISR?",
      answer: "Time-based ISR revalidates on a schedule — after N seconds, the next request triggers background regeneration. You have no control over exactly when it happens, and there's always a staleness window. On-demand revalidation uses revalidatePath() or revalidateTag() to instantly purge the cache for specific pages or groups of pages. It's event-driven: a CMS webhook calls your API route, which calls revalidatePath('/blog/my-post'), and the cache is immediately invalidated. The next request gets a fresh render. revalidateTag() is more powerful — tag your fetch calls and purge by tag to revalidate all pages that used that data. On-demand is more precise and eliminates the staleness window, but requires an explicit trigger mechanism.",
      difficulty: "mid",
      followUps: [
        "How do you secure revalidation endpoints?",
        "Can you combine on-demand and time-based revalidation?",
        "What happens if revalidatePath is called for a path that doesn't exist?"
      ]
    },
    {
      question: "What is the difference between cache: 'no-store' and revalidate: 0 in Next.js fetch?",
      answer: "Functionally, they both opt out of caching and result in SSR (dynamic rendering per request). cache: 'no-store' tells the data cache to never cache this fetch — every render executes the fetch. revalidate: 0 technically means the cache is immediately stale, so every request triggers revalidation. The distinction is semantic: cache: 'no-store' is a hard opt-out, while revalidate: 0 still goes through the cache mechanism (it just never serves from cache). In practice, both result in per-request data fetching. The Next.js team recommends cache: 'no-store' for clarity when you truly want no caching. Note that in Next.js 15, the default fetch behavior changed to no caching (previously it was force-cache), so you may need to explicitly opt INTO caching rather than opt out.",
      difficulty: "hard",
      followUps: [
        "How did the default fetch caching behavior change in Next.js 15?",
        "Can different fetch calls in the same page have different caching strategies?",
        "How does request deduplication interact with cache: 'no-store'?"
      ]
    },
    {
      question: "How do you handle a page that is mostly static but has one personalized section?",
      answer: "Use partial prerendering (PPR) or the Suspense boundary pattern. Wrap the personalized section in a Suspense boundary with a fallback. The static shell (everything outside Suspense) is pre-rendered at build time. At request time, the static shell is served instantly from cache, and the dynamic section streams in as it resolves. In code: the page is a Server Component that's statically generated, containing a Suspense boundary around an async component that reads cookies(). The outer page stays static; only the inner component becomes dynamic. This gives you the performance of SSG for most of the page with SSR-level freshness for the personalized part. It's the best of both worlds.",
      difficulty: "hard",
      followUps: [
        "What is Partial Prerendering (PPR) and how does it relate to this pattern?",
        "Can static and dynamic sections share data?",
        "How does this pattern affect caching at the CDN level?"
      ]
    },
    {
      question: "What is the role of the Next.js Data Cache and how does it differ from the Router Cache?",
      answer: "The Data Cache is a server-side persistent cache for fetch results. When a Server Component makes a fetch call with caching enabled, the response is stored in the Data Cache and persists across requests and deployments (on platforms that support it). It's keyed by the fetch URL and options. Revalidation (time-based or on-demand) operates on this cache. The Router Cache is a client-side in-memory cache that stores RSC payloads (rendered Server Component output) for visited routes. It enables instant back/forward navigation and prefetching. The Router Cache is per-session and cleared on refresh. Key distinction: Data Cache = server, persistent, controls data freshness. Router Cache = client, ephemeral, controls navigation speed. They're separate layers — a page can be fresh in the Data Cache but stale in the Router Cache (or vice versa).",
      difficulty: "hard",
      followUps: [
        "How long does the Router Cache persist?",
        "Can you invalidate the Router Cache from the server?",
        "How does the Full Route Cache relate to these two?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Implement ISR with On-Demand Revalidation for a CMS Blog",
      difficulty: "mid",
      description: "Build a blog system where posts are statically generated with ISR (1 hour revalidation). Create a webhook endpoint that a CMS can call to instantly revalidate specific posts when they're updated. Use tag-based revalidation for granular control.",
      solution: `// app/blog/[slug]/page.js
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const posts = await fetch('https://cms.example.com/api/posts')
    .then(r => r.json());

  return posts.map(post => ({ slug: post.slug }));
}

export default async function BlogPost({ params }) {
  const { slug } = await params;

  const post = await fetch(
    \`https://cms.example.com/api/posts/\${slug}\`,
    {
      next: {
        revalidate: 3600, // Fallback: hourly revalidation
        tags: [\`post-\${slug}\`, 'all-posts']
      }
    }
  ).then(r => {
    if (!r.ok) return null;
    return r.json();
  });

  if (!post) notFound();

  return (
    <article>
      <time>{new Date(post.publishedAt).toLocaleDateString()}</time>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}

// app/blog/page.js — Blog listing
export default async function BlogIndex() {
  const posts = await fetch('https://cms.example.com/api/posts', {
    next: {
      revalidate: 3600,
      tags: ['all-posts', 'blog-listing']
    }
  }).then(r => r.json());

  return (
    <div>
      <h1>Blog</h1>
      {posts.map(post => (
        <article key={post.slug}>
          <a href={\`/blog/\${post.slug}\`}>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
          </a>
        </article>
      ))}
    </div>
  );
}

// app/api/revalidate/route.js — Webhook endpoint
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request) {
  // Verify webhook signature
  const signature = request.headers.get('x-webhook-signature');
  const body = await request.json();

  if (!verifySignature(signature, JSON.stringify(body))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const { event, slug } = body;

  switch (event) {
    case 'post.updated':
    case 'post.published':
      // Revalidate the specific post AND the listing
      revalidateTag(\`post-\${slug}\`);
      revalidateTag('blog-listing');
      return NextResponse.json({
        revalidated: true,
        tags: [\`post-\${slug}\`, 'blog-listing']
      });

    case 'post.deleted':
      revalidateTag(\`post-\${slug}\`);
      revalidateTag('blog-listing');
      return NextResponse.json({ revalidated: true });

    case 'bulk.publish':
      // Revalidate everything
      revalidateTag('all-posts');
      return NextResponse.json({ revalidated: true, tag: 'all-posts' });

    default:
      return NextResponse.json({ error: 'Unknown event' }, { status: 400 });
  }
}

function verifySignature(signature, payload) {
  // In production, use HMAC-SHA256 to verify the webhook signature
  return signature === process.env.WEBHOOK_SECRET;
}`,
      explanation: "This solution uses tag-based ISR for granular cache control. Each post's fetch is tagged with its slug and a shared 'all-posts' tag. The listing page has its own 'blog-listing' tag. When a CMS publishes/updates a post, the webhook revalidates that specific post's tag AND the listing tag (so the listing shows the updated post). Bulk operations revalidate the 'all-posts' tag, which purges every post. Time-based revalidation (3600s) acts as a safety net in case the webhook fails. The webhook verifies signatures to prevent unauthorized cache purging."
    },
    {
      title: "Build a Page with Streaming SSR and Multiple Loading States",
      difficulty: "hard",
      description: "Create a product page that uses streaming SSR with three independent sections that load at different speeds: product info (fast, cached), reviews (medium, from database), and AI-generated recommendations (slow, from ML service). Each section should have its own loading skeleton and error boundary.",
      solution: `// app/product/[id]/page.js
import { Suspense } from 'react';
import { ProductInfo } from './_components/ProductInfo';
import { Reviews } from './_components/Reviews';
import { Recommendations } from './_components/Recommendations';
import {
  ProductSkeleton,
  ReviewsSkeleton,
  RecommendationsSkeleton
} from './_components/Skeletons';
import { ReviewsError, RecommendationsError } from './_components/Errors';

export default async function ProductPage({ params }) {
  const { id } = await params;

  return (
    <div className="product-page">
      {/* Section 1: Fast — cached product data streams first */}
      <Suspense fallback={<ProductSkeleton />}>
        <ProductInfo id={id} />
      </Suspense>

      {/* Section 2: Medium — database query for reviews */}
      <ReviewsError>
        <Suspense fallback={<ReviewsSkeleton />}>
          <Reviews productId={id} />
        </Suspense>
      </ReviewsError>

      {/* Section 3: Slow — ML service for recommendations */}
      <RecommendationsError>
        <Suspense fallback={<RecommendationsSkeleton />}>
          <Recommendations productId={id} />
        </Suspense>
      </RecommendationsError>
    </div>
  );
}

// app/product/[id]/_components/ProductInfo.js
export async function ProductInfo({ id }) {
  const product = await fetch(
    \`https://api.example.com/products/\${id}\`,
    { next: { revalidate: 60, tags: [\`product-\${id}\`] } }
  ).then(r => r.json());

  return (
    <section className="product-info">
      <h1>{product.name}</h1>
      <p className="price">\${product.price.toFixed(2)}</p>
      <p className="description">{product.description}</p>
      <div className="availability">
        {product.inStock ? 'In Stock' : 'Out of Stock'}
      </div>
    </section>
  );
}

// app/product/[id]/_components/Reviews.js
export async function Reviews({ productId }) {
  const reviews = await fetch(
    \`https://api.example.com/products/\${productId}/reviews\`,
    { cache: 'no-store' } // Always fresh reviews
  ).then(r => r.json());

  const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

  return (
    <section className="reviews">
      <h2>Customer Reviews</h2>
      <div className="rating-summary">
        <span>{avgRating.toFixed(1)} / 5</span>
        <span>({reviews.length} reviews)</span>
      </div>
      {reviews.slice(0, 5).map(review => (
        <div key={review.id} className="review">
          <div className="review-header">
            <strong>{review.author}</strong>
            <span>{'*'.repeat(review.rating)}</span>
          </div>
          <p>{review.text}</p>
        </div>
      ))}
    </section>
  );
}

// app/product/[id]/_components/Recommendations.js
export async function Recommendations({ productId }) {
  // Slow ML service — but doesn't block the rest of the page!
  const recs = await fetch(
    \`https://ml.example.com/recommendations?product=\${productId}\`,
    { next: { revalidate: 300 } }
  ).then(r => r.json());

  return (
    <section className="recommendations">
      <h2>You Might Also Like</h2>
      <div className="rec-grid">
        {recs.map(rec => (
          <a key={rec.id} href={\`/product/\${rec.id}\`} className="rec-card">
            <img src={rec.image} alt={rec.name} />
            <p>{rec.name}</p>
            <p>\${rec.price.toFixed(2)}</p>
          </a>
        ))}
      </div>
    </section>
  );
}

// app/product/[id]/_components/Errors.js
"use client";

import { Component } from 'react';

export class ReviewsError extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="reviews-error">
          <h2>Reviews</h2>
          <p>Unable to load reviews right now.</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </section>
      );
    }
    return this.props.children;
  }
}

export class RecommendationsError extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="recs-error">
          <p>Could not load recommendations.</p>
        </section>
      );
    }
    return this.props.children;
  }
}

// app/product/[id]/_components/Skeletons.js
export function ProductSkeleton() {
  return (
    <section className="skeleton">
      <div className="skeleton-line" style={{ width: '60%', height: '2rem' }} />
      <div className="skeleton-line" style={{ width: '20%', height: '1.5rem' }} />
      <div className="skeleton-block" style={{ height: '100px' }} />
    </section>
  );
}

export function ReviewsSkeleton() {
  return (
    <section className="skeleton">
      <div className="skeleton-line" style={{ width: '40%', height: '1.5rem' }} />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="skeleton-block" style={{ height: '80px', margin: '0.5rem 0' }} />
      ))}
    </section>
  );
}

export function RecommendationsSkeleton() {
  return (
    <section className="skeleton">
      <div className="skeleton-line" style={{ width: '50%', height: '1.5rem' }} />
      <div style={{ display: 'flex', gap: '1rem' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-block" style={{ width: '150px', height: '200px' }} />
        ))}
      </div>
    </section>
  );
}`,
      explanation: "This demonstrates streaming SSR with three independent Suspense boundaries. The product info streams first (cached ISR data). Reviews stream next (uncached, fresh per request). Recommendations stream last (slow ML service, cached 5 minutes). Each section has its own error boundary so a failure in one doesn't break others. The key insight: the page shell (layout, heading) is sent instantly. Each section streams independently as its data resolves. Users see content appear progressively. The error boundaries are Client Components (required for error boundaries) that wrap the Suspense boundaries."
    },
    {
      title: "Create a Rendering Strategy Comparison Dashboard",
      difficulty: "mid",
      description: "Build a page that demonstrates all four rendering strategies side by side. Include a static section (SSG), a dynamic section that shows the current time (SSR), a cached-with-revalidation section (ISR), and an interactive client-rendered section (CSR). Show timestamps to prove when each section was rendered.",
      solution: `// app/rendering-demo/page.js
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { ClientClock } from './_components/ClientClock';

// Force the page to be dynamic because we use cookies()
// But individual sections demonstrate different strategies

export default async function RenderingDemo() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '2rem' }}>
      <h1 style={{ gridColumn: '1 / -1' }}>Rendering Strategies Demo</h1>

      {/* SSG Section — Static at build time */}
      <Suspense fallback={<div>Loading static content...</div>}>
        <StaticSection />
      </Suspense>

      {/* SSR Section — Fresh every request */}
      <Suspense fallback={<div>Loading dynamic content...</div>}>
        <DynamicSection />
      </Suspense>

      {/* ISR Section — Cached with revalidation */}
      <Suspense fallback={<div>Loading ISR content...</div>}>
        <ISRSection />
      </Suspense>

      {/* CSR Section — Client-rendered */}
      <ClientClock />
    </div>
  );
}

// Static section — fetched data cached indefinitely
async function StaticSection() {
  const data = await fetch('https://api.example.com/static-content', {
    cache: 'force-cache'
  }).then(r => r.json());

  return (
    <div style={{ border: '2px solid blue', padding: '1rem', borderRadius: '8px' }}>
      <h2>SSG (Static)</h2>
      <p><strong>Strategy:</strong> Built at build time, served from CDN</p>
      <p><strong>Content:</strong> {data.message}</p>
      <p><strong>Generated at:</strong> {new Date().toISOString()}</p>
      <p><em>This timestamp only changes on rebuild</em></p>
    </div>
  );
}

// Dynamic section — uses cookies, always SSR
async function DynamicSection() {
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value || 'light';

  return (
    <div style={{ border: '2px solid red', padding: '1rem', borderRadius: '8px' }}>
      <h2>SSR (Dynamic)</h2>
      <p><strong>Strategy:</strong> Rendered fresh on every request</p>
      <p><strong>User theme:</strong> {theme}</p>
      <p><strong>Rendered at:</strong> {new Date().toISOString()}</p>
      <p><em>This timestamp changes on every refresh</em></p>
    </div>
  );
}

// ISR section — cached with 30-second revalidation
async function ISRSection() {
  const data = await fetch('https://api.example.com/isr-content', {
    next: { revalidate: 30 }
  }).then(r => r.json());

  return (
    <div style={{ border: '2px solid green', padding: '1rem', borderRadius: '8px' }}>
      <h2>ISR (Incremental)</h2>
      <p><strong>Strategy:</strong> Cached, revalidated every 30 seconds</p>
      <p><strong>Content:</strong> {data.message}</p>
      <p><strong>Cached at:</strong> {new Date().toISOString()}</p>
      <p><em>This timestamp changes at most every 30 seconds</em></p>
    </div>
  );
}

// app/rendering-demo/_components/ClientClock.js
"use client";

import { useState, useEffect } from 'react';

export function ClientClock() {
  const [time, setTime] = useState(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toISOString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ border: '2px solid purple', padding: '1rem', borderRadius: '8px' }}>
      <h2>CSR (Client-Side)</h2>
      <p><strong>Strategy:</strong> Rendered in the browser with JavaScript</p>
      <p><strong>Current time:</strong> {time || 'Loading...'}</p>
      <p><strong>Click count:</strong> {count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Increment
      </button>
      <p><em>This updates in real-time, no server involved</em></p>
    </div>
  );
}`,
      explanation: "This demo page showcases all four rendering strategies side by side with visual timestamps to prove when each was rendered. The static section uses force-cache — its timestamp only changes on rebuild. The dynamic section uses cookies() which forces SSR — its timestamp changes on every request. The ISR section uses revalidate: 30 — its timestamp changes at most every 30 seconds. The CSR section is a Client Component with useState and useEffect — it updates in real-time in the browser. The Suspense boundaries allow each section to stream independently."
    }
  ],
  quiz: [
    {
      question: "What triggers a Next.js App Router page to become dynamically rendered (SSR) instead of statically generated?",
      options: [
        "Importing a Client Component",
        "Using fetch() without any options",
        "Using cookies(), headers(), or searchParams",
        "Having more than 100 lines of code"
      ],
      correct: 2,
      explanation: "Using dynamic APIs like cookies(), headers(), or the searchParams prop signals that the page depends on request-time information and cannot be pre-rendered at build time. This automatically opts the route into dynamic (SSR) rendering. Importing a Client Component does NOT make the page dynamic — it just means that component's JS is shipped to the client."
    },
    {
      question: "In ISR, what does the user see when they request a page whose revalidation period has expired?",
      options: [
        "A loading spinner while the page regenerates",
        "The stale cached page while regeneration happens in the background",
        "An error message asking them to refresh",
        "A completely fresh page (server waits for regeneration)"
      ],
      correct: 1,
      explanation: "ISR uses the stale-while-revalidate pattern. When the revalidation period expires, the next request serves the stale cached page instantly while triggering a background regeneration. The user never waits — they always get an immediate response. The next user after regeneration completes gets the fresh page."
    },
    {
      question: "What is the difference between revalidatePath() and revalidateTag()?",
      options: [
        "revalidatePath purges a specific URL; revalidateTag purges all fetch entries with that tag",
        "revalidatePath works at build time; revalidateTag works at runtime",
        "revalidatePath is for pages; revalidateTag is for API routes",
        "There is no difference — they are aliases"
      ],
      correct: 0,
      explanation: "revalidatePath('/blog/my-post') purges the cache for a specific URL path. revalidateTag('product-123') purges all fetch cache entries that were tagged with 'product-123', which may affect multiple pages. Tags provide more granular control — you can tag fetches across different pages and invalidate them all at once when the underlying data changes."
    },
    {
      question: "How does streaming SSR improve Time To First Byte (TTFB)?",
      options: [
        "It compresses the HTML before sending",
        "It sends the layout shell immediately and streams content as it resolves",
        "It renders on the client instead of the server",
        "It caches the response at the CDN edge"
      ],
      correct: 1,
      explanation: "Streaming SSR uses chunked transfer encoding to send the page shell (layouts, Suspense fallbacks) immediately, without waiting for all data to resolve. This dramatically reduces TTFB because the first bytes are sent as soon as the shell renders. Dynamic content streams in progressively as each Suspense boundary resolves, appearing in the browser incrementally."
    },
    {
      question: "In the App Router, what is the default caching behavior of fetch() in Next.js 15?",
      options: [
        "force-cache (cached indefinitely by default)",
        "no-store (no caching by default)",
        "revalidate: 60 (cached for 1 minute)",
        "It depends on whether the component is a Server or Client Component"
      ],
      correct: 1,
      explanation: "In Next.js 15, the default fetch behavior changed to no caching (no-store). Previously in Next.js 14, fetch was cached by default (force-cache). This was a significant breaking change. In Next.js 15+, you must explicitly opt into caching with cache: 'force-cache' or next: { revalidate: N }. This change was made because the implicit caching confused many developers."
    },
    {
      question: "Can a single page combine static and dynamic rendering in the App Router?",
      options: [
        "No, a page is either fully static or fully dynamic",
        "Yes, by using Suspense boundaries to isolate dynamic sections",
        "Only with the experimental PPR flag enabled",
        "Yes, but only if you use the Pages Router alongside the App Router"
      ],
      correct: 1,
      explanation: "Yes, using Suspense boundaries, you can have a page where the static shell is pre-rendered and the dynamic sections (those using cookies, headers, or uncached fetches) stream in at request time. The static parts serve instantly from cache, while the dynamic parts resolve on the server. This is the foundation of Partial Prerendering (PPR), which formalizes this pattern."
    }
  ]
};
