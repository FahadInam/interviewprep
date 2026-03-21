export const dataFetching = {
  id: "data-fetching",
  title: "Data Fetching & Caching",
  icon: "📡",
  tag: "Next.js",
  tagColor: "var(--tag-next)",
  subtitle: "fetch() caching, revalidation strategies, and request deduplication in the App Router",
  concepts: [
    {
      title: "fetch() in Server Components — Extended Fetch API",
      explanations: {
        layman: "When you fetch data in Next.js, it works like a smart assistant with a notebook. The first time you ask 'What are today's products?', the assistant calls the warehouse and writes down the answer. The next time you (or anyone) asks the same question, the assistant just reads from the notebook instead of calling again. This is caching. You can tell the assistant: 'Always call the warehouse' (no-store), 'Check every 60 seconds' (revalidate), or 'Use the notebook forever until I say otherwise' (force-cache, the default).",
        mid: "Next.js extends the native Web fetch() API in Server Components to add automatic request deduplication and caching. By default, fetch requests in Server Components use force-cache behavior, meaning the result is stored in the Data Cache and reused across requests. You control caching per-request using the cache and next.revalidate options. Unlike client-side fetch, these calls run on the server during rendering, so there is no waterfall visible to the user — all data is resolved before HTML is sent.",
        senior: "Under the hood, Next.js patches the global fetch to intercept calls during server rendering. Each fetch call generates a cache key based on the URL and options. The Data Cache is a persistent HTTP cache layer that survives across deployments on platforms like Vercel (backed by a shared CDN cache). Critically, the Data Cache is separate from the Full Route Cache (which caches rendered RSC payloads) and the Router Cache (client-side). When you set { cache: 'no-store' }, you're opting that specific request out of the Data Cache, but the Full Route Cache behavior depends on whether the route is static or dynamic. A single no-store fetch makes the entire route dynamic. In production, understanding these layered caches is essential: you might have a cached route serving stale data because the Data Cache entry hasn't been invalidated even though the database changed."
      },
      realWorld: "Every Next.js page that loads data from an API or database uses the extended fetch. An e-commerce product page might fetch product details with force-cache (they rarely change) but fetch inventory counts with no-store (always fresh).",
      whenToUse: "Use the extended fetch in every Server Component that needs external data. Use force-cache for data that changes rarely (product descriptions, blog posts). Use revalidate for data that changes periodically (prices, trending lists).",
      whenNotToUse: "Don't use server-side fetch for user-specific data that must be fetched on the client after authentication (like a user's cart in a purely client-side auth model). Don't use it for real-time data — use WebSockets or client-side polling instead.",
      pitfalls: "Forgetting that fetch in Server Components defaults to caching can lead to serving stale data. Mixing cache: 'no-store' with ISR expectations leads to confusion — a single uncached fetch makes the entire route dynamic. The extended fetch only works in Server Components; in Client Components it behaves like standard browser fetch. Environment variables for API keys must be server-only (no NEXT_PUBLIC_ prefix) or they leak to the client.",
      codeExamples: [
        {
          title: "Basic Server Component Fetch with Caching",
          code: `// app/products/page.js — Server Component by default
export default async function ProductsPage() {
  // Cached indefinitely (default behavior)
  const res = await fetch("https://api.example.com/products", {
    cache: "force-cache",
  });
  const products = await res.json();

  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>{p.name} — \${p.price}</li>
      ))}
    </ul>
  );
}`
        },
        {
          title: "Time-Based Revalidation",
          code: `// Revalidate every 60 seconds (ISR-style)
const res = await fetch("https://api.example.com/products", {
  next: { revalidate: 60 },
});

// After 60 seconds, the next request triggers a
// background regeneration. The stale response is
// served immediately while fresh data is fetched.`
        }
      ]
    },
    {
      title: "Cache Behavior: force-cache, no-store, revalidate",
      explanations: {
        layman: "Three simple rules for how Next.js remembers data. force-cache: 'Save this answer forever until I tell you to forget it.' Like writing something in permanent marker. no-store: 'Never save anything. Ask fresh every single time.' Like using a whiteboard you wipe after each use. revalidate: 60: 'Save this answer, but check if it is stale after 60 seconds. If someone asks after 60 seconds, give them the old answer immediately while fetching a fresh one in the background.' Like a newspaper that auto-refreshes.",
        mid: "force-cache (the default) stores the fetch response in the Data Cache permanently until manually invalidated. no-store bypasses the Data Cache entirely, making a fresh network request every time and making the route dynamic. next.revalidate sets a time-based revalidation window in seconds — stale-while-revalidate semantics apply, meaning the cached version is served while a background refresh happens. You can also combine these with next.tags for tag-based invalidation.",
        senior: "The caching strategy cascades: a route-level export const dynamic = 'force-dynamic' overrides individual fetch cache settings, making everything uncached. Conversely, export const revalidate = 3600 sets a default revalidation interval for all fetches in that route segment. Individual fetch options override the route-level default. In production, the Data Cache is durable — on Vercel it persists in the CDN edge cache across deployments unless explicitly purged. This means a revalidateTag() call propagates to all edge nodes, which can take seconds. Be careful with no-store on high-traffic routes: every request hits the origin, which can overwhelm your database. The common production pattern is to use revalidate with a reasonable TTL and revalidateTag for event-driven freshness."
      },
      realWorld: "A news site uses revalidate: 300 (5 minutes) for article listings, no-store for a live sports score ticker, and force-cache for the site's navigation menu which changes during deployments only.",
      whenToUse: "force-cache: static content, CMS data that you invalidate on publish. no-store: user-specific dynamic data, real-time prices. revalidate: data that changes periodically but doesn't need to be real-time (trending posts, weather).",
      whenNotToUse: "Don't use force-cache for frequently changing data — users will see stale content. Don't use no-store for data shared across all users — you'll hammer your API needlessly. Don't set revalidate too low (e.g., 1 second) — it effectively becomes no-store with extra overhead.",
      pitfalls: "Stale data bugs: developers forget that force-cache persists across deployments. Race conditions during revalidation: two simultaneous requests might both trigger a background revalidation. Setting revalidate: 0 is equivalent to no-store, not 'revalidate immediately'. The fetch cache only applies to GET requests — POST requests are never cached.",
      codeExamples: [
        {
          title: "Comparing All Three Cache Strategies",
          code: `// 1. Cached forever (default) — static data
const staticData = await fetch("https://api.example.com/config", {
  cache: "force-cache",
});

// 2. Never cached — always fresh
const liveData = await fetch("https://api.example.com/stock-price", {
  cache: "no-store",
});

// 3. Revalidate every 5 minutes
const periodicData = await fetch("https://api.example.com/trending", {
  next: { revalidate: 300 },
});

// 4. Tag-based caching for on-demand invalidation
const taggedData = await fetch("https://api.example.com/posts", {
  next: { tags: ["posts"] },
});`
        }
      ]
    },
    {
      title: "Request Deduplication with React cache()",
      explanations: {
        layman: "Imagine 5 coworkers all need the same report from a filing cabinet. Instead of all 5 walking to the cabinet, the first person goes, grabs it, and shares copies with everyone. React's cache() does the same thing: if multiple components need the same data during one page render, the actual fetch only happens once.",
        mid: "React cache() is a built-in memoization function that deduplicates identical function calls during a single server render pass. When you wrap a data-fetching function with cache(), React ensures that if the same function is called with the same arguments from multiple components in the same render tree, the actual fetch executes only once. The memoized result is shared. This is separate from Next.js fetch caching — deduplication happens per-render, while the Data Cache persists across requests. Next.js also automatically deduplicates identical fetch() calls (same URL + options) during rendering without needing cache().",
        senior: "React cache() uses a per-request memo map stored in the React server rendering context (AsyncLocalStorage under the hood). It keys on the function reference and arguments using Object.is comparison. This means it only deduplicates within a single render pass — not across different user requests. Crucially, cache() works for any function, not just fetch. This is useful for deduplicating database queries (e.g., Prisma calls) that don't go through fetch and thus don't benefit from Next.js automatic fetch deduplication. The pattern of exporting a cached data-fetching function from a shared module (e.g., lib/data.js) that multiple Server Components import is the recommended approach for avoiding redundant database hits without prop drilling."
      },
      realWorld: "A dashboard page has a Header, Sidebar, and MainContent component that all need the current user's profile. Instead of passing it as props from a parent, each component calls getUser() independently, and cache() ensures only one database query runs.",
      whenToUse: "Use cache() for database queries or API calls that multiple Server Components need in the same render. Use it whenever you want to avoid prop drilling data through deeply nested component trees.",
      whenNotToUse: "Don't use cache() for client-side data fetching — it only works on the server during rendering. Don't rely on it for cross-request caching — use the Data Cache (fetch with revalidate) for that. Don't use it for functions with side effects — memoization means the side effect only runs once.",
      pitfalls: "cache() memo only lasts for one render — it's not a persistent cache. Arguments are compared with Object.is, so passing a new object each time (e.g., { id: 1 }) will NOT deduplicate because object references differ. Forgetting to use cache() for non-fetch data sources (ORM queries) means those queries run multiple times per render.",
      codeExamples: [
        {
          title: "Deduplicating Database Queries with cache()",
          code: `// lib/data.js
import { cache } from "react";
import { db } from "./db";

// Wrapped with cache() — called from multiple components
// but executes only ONCE per render
export const getUser = cache(async (userId) => {
  const user = await db.user.findUnique({
    where: { id: userId },
  });
  return user;
});

// app/dashboard/layout.js
import { getUser } from "@/lib/data";

export default async function DashboardLayout({ children }) {
  const user = await getUser("user-123"); // First call — executes query
  return (
    <div>
      <Sidebar user={user} />
      {children}
    </div>
  );
}

// app/dashboard/page.js
import { getUser } from "@/lib/data";

export default async function DashboardPage() {
  const user = await getUser("user-123"); // Deduped — returns cached result
  return <h1>Welcome, {user.name}</h1>;
}`
        }
      ]
    },
    {
      title: "On-Demand Revalidation: revalidatePath & revalidateTag",
      explanations: {
        layman: "Imagine you have a newspaper that gets printed once a day. Normally you read yesterday's version until tomorrow's arrives. But what if breaking news happens? revalidateTag is like calling the printer and saying 'Reprint the sports section NOW.' revalidatePath is like saying 'Reprint page 3 NOW.' You can force specific parts of your cached content to refresh immediately instead of waiting for the timer.",
        mid: "revalidatePath(path) purges the cached data and rendered output for a specific route path. revalidateTag(tag) invalidates all fetch responses tagged with a specific cache tag. Both are imported from next/cache and are typically called inside Server Actions or Route Handlers after a mutation. When called, the next request to the affected route will regenerate fresh data. revalidateTag is more granular — you can tag multiple fetches across different routes with the same tag and invalidate them all at once.",
        senior: "Under the hood, revalidatePath invalidates both the Data Cache entries associated with that path AND the Full Route Cache (the pre-rendered RSC payload + HTML). revalidateTag only invalidates Data Cache entries with matching tags — but this can cascade to invalidate the Full Route Cache if the route depends on that data. In distributed deployments (e.g., Vercel edge network), invalidation is eventually consistent — there's a propagation delay across edge nodes. For critical consistency (e.g., after a payment), consider using no-store for the confirmation page rather than relying on instant tag propagation. A common production pattern is to use webhook-triggered revalidation: your CMS sends a webhook to a Route Handler that calls revalidateTag('blog-posts') when content is published."
      },
      realWorld: "An admin publishes a new blog post in the CMS. The CMS webhook hits your /api/revalidate route handler, which calls revalidateTag('posts'). All pages that fetched posts with next: { tags: ['posts'] } are regenerated on the next visit.",
      whenToUse: "Use revalidateTag after mutations when multiple routes share the same data (e.g., a product update should refresh both the product page and the product listing). Use revalidatePath when you need to refresh a specific page after a localized change.",
      whenNotToUse: "Don't use on-demand revalidation as a replacement for no-store on highly dynamic data — it adds complexity without benefit if data changes every second. Don't call revalidatePath('/') thinking it invalidates the entire site — it only invalidates the root page.",
      pitfalls: "revalidatePath('/blog') does NOT revalidate /blog/post-1 — you need revalidatePath('/blog/post-1') or use revalidateTag. Calling revalidation too frequently can overwhelm your origin server with regeneration requests. In development mode, caching behaves differently (everything is uncached), so revalidation bugs only surface in production.",
      codeExamples: [
        {
          title: "On-Demand Revalidation in a Server Action",
          code: `"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function publishPost(formData) {
  const title = formData.get("title");
  const content = formData.get("content");

  // Save to database
  await db.post.create({ data: { title, content } });

  // Option 1: Revalidate a specific path
  revalidatePath("/blog");

  // Option 2: Revalidate all fetches tagged with "posts"
  revalidateTag("posts");
}

// The fetch that uses tags:
// const posts = await fetch("https://api.example.com/posts", {
//   next: { tags: ["posts"] },
// });`
        },
        {
          title: "Webhook-Driven Revalidation Route Handler",
          code: `// app/api/revalidate/route.js
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { tag, secret } = await request.json();

  // Verify webhook secret
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidateTag(tag);
  return NextResponse.json({ revalidated: true, tag });
}`
        }
      ]
    },
    {
      title: "Parallel vs Sequential Data Fetching",
      explanations: {
        layman: "Imagine you need to buy groceries, pick up dry cleaning, and get gas. Sequential fetching is like doing them one by one — you finish groceries, then drive to dry cleaning, then to the gas station. Parallel fetching is like sending three friends to do all three errands at the same time. The total time drops from the sum of all three to just the slowest one.",
        mid: "In Server Components, if you await fetches one after another, each waits for the previous to complete — this is sequential fetching and creates a waterfall. To fetch in parallel, use Promise.all() to initiate all requests simultaneously. Another pattern is to start fetches at a higher level and pass promises down as props, allowing child components to await them independently. React also supports Suspense boundaries to stream in data as it resolves, showing loading states for slower fetches while faster ones render immediately.",
        senior: "Sequential fetching is the accidental default in async Server Components because developers naturally write await one after another. The performance cost compounds: if three APIs each take 200ms, sequential takes 600ms vs 200ms parallel. Beyond Promise.all, the preload pattern is powerful: call fetch functions without awaiting them at the top of a layout, and the actual awaits happen in child components — Next.js deduplication ensures the same request isn't sent twice. For dependent fetches (where fetch B needs data from fetch A), you're forced into sequential, but you can often restructure APIs to reduce dependencies. In production, combine parallel fetching with Suspense streaming: wrap slower data sources in their own Suspense boundary so the shell renders instantly with the fast data, and the slow data streams in."
      },
      realWorld: "A user profile page needs user data, their posts, and their followers. These are independent queries — fetching them in parallel cuts load time by 2/3. But the user's notification preferences depend on the user ID, so that fetch must be sequential after the user data loads.",
      whenToUse: "Use parallel fetching whenever data sources are independent of each other. Use Promise.all for co-located fetches. Use Suspense boundaries to progressively stream parallel data.",
      whenNotToUse: "Don't force parallel fetching when data is genuinely dependent (e.g., you need a user ID before fetching their posts). Don't wrap everything in Promise.all if one failing request should prevent the whole page from rendering.",
      pitfalls: "Promise.all rejects if ANY promise rejects — use Promise.allSettled if you want partial results. Accidentally making fetches sequential by awaiting inside a loop (for...of with await). Forgetting that parallel fetches still share the same server resources — 50 parallel fetches can saturate your connection pool.",
      codeExamples: [
        {
          title: "Parallel vs Sequential Fetching Patterns",
          code: `// BAD: Sequential — total time = sum of all requests
async function SequentialPage() {
  const user = await getUser();       // 200ms
  const posts = await getPosts();     // 300ms
  const comments = await getComments(); // 150ms
  // Total: ~650ms

  return <div>{/* render data */}</div>;
}

// GOOD: Parallel — total time = slowest request
async function ParallelPage() {
  const [user, posts, comments] = await Promise.all([
    getUser(),       // 200ms
    getPosts(),      // 300ms  ← all start simultaneously
    getComments(),   // 150ms
  ]);
  // Total: ~300ms (the slowest one)

  return <div>{/* render data */}</div>;
}

// BEST: Parallel with Suspense streaming
async function StreamingPage() {
  // Start fetches without awaiting
  const userPromise = getUser();
  const postsPromise = getPosts();

  return (
    <div>
      <Suspense fallback={<UserSkeleton />}>
        <UserProfile dataPromise={userPromise} />
      </Suspense>
      <Suspense fallback={<PostsSkeleton />}>
        <PostsList dataPromise={postsPromise} />
      </Suspense>
    </div>
  );
}`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "How does Next.js extend the native fetch() API, and what are the default caching semantics in Server Components?",
      answer: "Next.js extends the native fetch() in Server Components with two superpowers: caching and deduplication. Caching: by default, every fetch uses force-cache, meaning the response is stored in the Data Cache and reused across all requests until you manually invalidate it. You override this per-fetch with cache: 'no-store' (always fresh, never cached) or next: { revalidate: N } (cache for N seconds, then refresh in the background). Deduplication: if multiple components in the same render call fetch() with the same URL and options, the actual network request only happens once, and the result is shared. This means you can call the same fetch in a layout and a page without worrying about duplicate requests. The critical gotcha: a single fetch with no-store makes the entire route dynamic -- no static generation possible.",
      difficulty: "mid",
      followUps: [
        "How does the Data Cache differ from the Full Route Cache?",
        "What happens to caching when you deploy a new version of your app?"
      ]
    },
    {
      question: "Explain the difference between revalidatePath and revalidateTag. When would you choose one over the other?",
      answer: "revalidatePath(path) purges both the Data Cache and Full Route Cache for a specific URL path, forcing the next request to regenerate everything. revalidateTag(tag) invalidates all Data Cache entries associated with a specific cache tag, which can affect multiple routes. Choose revalidateTag when a single data source (e.g., 'products') is used across many pages — one call refreshes all of them. Choose revalidatePath for surgical invalidation of a single page after a localized change. revalidateTag is generally preferred in production because it's more composable and data-centric rather than URL-centric.",
      difficulty: "mid",
      followUps: [
        "What happens if you call revalidatePath('/') — does it revalidate the entire site?",
        "How does revalidation propagate in a distributed edge deployment?"
      ]
    },
    {
      question: "What is request deduplication in Next.js, and how does React cache() differ from automatic fetch deduplication?",
      answer: "Next.js automatically deduplicates identical fetch() calls (same URL + options) during a single server render. This is built into the patched fetch. React cache() is a separate memoization utility that works with ANY async function, not just fetch. You wrap a function with cache() and it memoizes results based on arguments within a single render pass. The key difference: automatic deduplication only works with fetch, while cache() works with database queries (Prisma, Drizzle), file reads, or any computation. Both only last for a single render — they're not persistent caches.",
      difficulty: "hard",
      followUps: [
        "How does cache() compare arguments — can you pass objects?",
        "What happens if you use cache() in a Client Component?"
      ]
    },
    {
      question: "A page is showing stale data even after you update the database. Walk through how you would debug this in Next.js.",
      answer: "First, check the fetch configuration — is it using force-cache (the default) without revalidation? If so, the Data Cache still holds the old response. Check if the Server Action or API route that performs the mutation calls revalidatePath or revalidateTag afterward. Verify the tags match between the fetch and the revalidation call. In development, caching is disabled by default, so this bug might only appear in production — test with next build && next start. Check if the route has export const dynamic = 'force-static' overriding fetch behavior. On Vercel, check if edge cache propagation hasn't completed yet. Finally, check if the stale data is from the Router Cache (client-side) — the user might need a hard refresh or you need to call router.refresh().",
      difficulty: "hard",
      followUps: [
        "How would you handle this differently for a high-traffic page?",
        "What role does the Router Cache play in stale data issues?"
      ]
    },
    {
      question: "What is the waterfall problem in data fetching, and how do you solve it in the App Router?",
      answer: "A waterfall occurs when data fetches are sequential — each waits for the previous one to complete before starting. In Server Components, this happens when you write multiple await statements one after another. Solutions: (1) Use Promise.all() to fetch independent data in parallel. (2) Move data fetching to parent components and pass promises as props. (3) Use Suspense boundaries so components can stream in independently as their data resolves. (4) Use the preload pattern — start fetches at the layout level without awaiting, and let the rendering tree resolve them.",
      difficulty: "easy",
      followUps: [
        "Can Suspense solve dependent data fetching waterfalls?",
        "How does streaming SSR relate to parallel fetching?"
      ]
    },
    {
      question: "How would you implement ISR (Incremental Static Regeneration) behavior in the App Router?",
      answer: "In the App Router, ISR is achieved by using fetch with next: { revalidate: N } where N is the number of seconds. The page is statically generated at build time, and after N seconds, the next request triggers a background regeneration while serving the stale version. You can also use the route segment config export const revalidate = N to set a default for all fetches in that route. For on-demand ISR, call revalidatePath or revalidateTag from a Server Action or Route Handler instead of relying on time-based revalidation. The key mental model shift from Pages Router ISR: in the App Router, caching is per-fetch rather than per-page, giving you more granular control.",
      difficulty: "mid",
      followUps: [
        "How does App Router ISR differ from Pages Router getStaticProps with revalidate?",
        "What happens during the revalidation window — can two requests both trigger a rebuild?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Build a Cached Data Layer with Tag-Based Revalidation",
      difficulty: "mid",
      description: "Create a Server Component that fetches a list of products with tag-based caching, and a Server Action that adds a new product and revalidates the cache.",
      solution: `// lib/data.js
import { cache } from "react";

export const getProducts = cache(async () => {
  const res = await fetch("https://api.example.com/products", {
    next: { tags: ["products"], revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
});

// app/products/actions.js
"use server";
import { revalidateTag } from "next/cache";

export async function addProduct(formData) {
  const name = formData.get("name");
  const price = parseFloat(formData.get("price"));

  await fetch("https://api.example.com/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, price }),
  });

  revalidateTag("products");
}

// app/products/page.js
import { getProducts } from "@/lib/data";
import { addProduct } from "./actions";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <h1>Products</h1>
      <ul>
        {products.map((p) => (
          <li key={p.id}>{p.name} — \${p.price}</li>
        ))}
      </ul>

      <form action={addProduct}>
        <input name="name" placeholder="Product name" required />
        <input name="price" type="number" step="0.01" required />
        <button type="submit">Add Product</button>
      </form>
    </div>
  );
}`,
      explanation: "getProducts uses both tag-based caching and time-based revalidation as a safety net. The Server Action calls revalidateTag('products') after mutation, invalidating all fetches tagged with 'products'. React cache() deduplicates if multiple components call getProducts in the same render."
    },
    {
      title: "Parallel Data Fetching with Suspense Streaming",
      difficulty: "mid",
      description: "Build a dashboard page that fetches user data, analytics, and notifications in parallel, streaming each section independently with Suspense.",
      solution: `// lib/data.js
import { cache } from "react";

export const getUser = cache(async () => {
  const res = await fetch("https://api.example.com/user", {
    cache: "no-store",
  });
  return res.json();
});

export const getAnalytics = cache(async () => {
  const res = await fetch("https://api.example.com/analytics", {
    next: { revalidate: 300 },
  });
  return res.json();
});

export const getNotifications = cache(async () => {
  const res = await fetch("https://api.example.com/notifications", {
    cache: "no-store",
  });
  return res.json();
});

// app/dashboard/page.js
import { Suspense } from "react";
import { getUser, getAnalytics, getNotifications } from "@/lib/data";

async function UserCard() {
  const user = await getUser();
  return <div className="card"><h2>{user.name}</h2><p>{user.email}</p></div>;
}

async function AnalyticsPanel() {
  const data = await getAnalytics();
  return (
    <div className="card">
      <h2>Analytics</h2>
      <p>Visitors: {data.visitors}</p>
      <p>Revenue: \${data.revenue}</p>
    </div>
  );
}

async function NotificationsList() {
  const notifications = await getNotifications();
  return (
    <div className="card">
      <h2>Notifications ({notifications.length})</h2>
      <ul>
        {notifications.map((n) => (
          <li key={n.id}>{n.message}</li>
        ))}
      </ul>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="dashboard-grid">
      <Suspense fallback={<div className="skeleton">Loading user...</div>}>
        <UserCard />
      </Suspense>
      <Suspense fallback={<div className="skeleton">Loading analytics...</div>}>
        <AnalyticsPanel />
      </Suspense>
      <Suspense fallback={<div className="skeleton">Loading notifications...</div>}>
        <NotificationsList />
      </Suspense>
    </div>
  );
}`,
      explanation: "Each data-fetching component is wrapped in its own Suspense boundary. They all start fetching simultaneously during the render. As each resolves, its HTML streams to the client independently. The fastest section appears first — no waterfall. The dashboard shell renders instantly."
    },
    {
      title: "Error-Resilient Parallel Fetching with Fallbacks",
      difficulty: "hard",
      description: "Build a page that fetches from three APIs in parallel but gracefully handles individual failures using Promise.allSettled and error boundaries.",
      solution: `// lib/fetch-utils.js
export async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    return { data: await res.json(), error: null };
  } catch (error) {
    console.error(\`Fetch failed for \${url}:\`, error.message);
    return { data: null, error: error.message };
  }
}

// app/overview/page.js
import { safeFetch } from "@/lib/fetch-utils";

export default async function OverviewPage() {
  const results = await Promise.allSettled([
    safeFetch("https://api.example.com/sales", {
      next: { tags: ["sales"], revalidate: 60 },
    }),
    safeFetch("https://api.example.com/inventory", {
      next: { tags: ["inventory"], revalidate: 120 },
    }),
    safeFetch("https://api.example.com/alerts", {
      cache: "no-store",
    }),
  ]);

  const [salesResult, inventoryResult, alertsResult] = results.map((r) =>
    r.status === "fulfilled" ? r.value : { data: null, error: "Request failed" }
  );

  return (
    <div>
      <section>
        <h2>Sales</h2>
        {salesResult.data ? (
          <p>Total: \${salesResult.data.total}</p>
        ) : (
          <p className="error">Failed to load sales data</p>
        )}
      </section>

      <section>
        <h2>Inventory</h2>
        {inventoryResult.data ? (
          <ul>
            {inventoryResult.data.items.map((item) => (
              <li key={item.id}>{item.name}: {item.qty} units</li>
            ))}
          </ul>
        ) : (
          <p className="error">Failed to load inventory</p>
        )}
      </section>

      <section>
        <h2>Alerts</h2>
        {alertsResult.data ? (
          <ul>
            {alertsResult.data.map((alert) => (
              <li key={alert.id} className={alert.severity}>{alert.message}</li>
            ))}
          </ul>
        ) : (
          <p className="error">Failed to load alerts</p>
        )}
      </section>
    </div>
  );
}`,
      explanation: "Promise.allSettled never rejects — it waits for all promises and reports each as 'fulfilled' or 'rejected'. The safeFetch wrapper catches individual HTTP errors. The page renders successfully even if one or two APIs are down, showing error messages only for the failed sections instead of crashing the whole page."
    }
  ],
  quiz: [
    {
      question: "What is the default caching behavior of fetch() in a Next.js Server Component?",
      options: [
        "force-cache — responses are cached indefinitely until invalidated",
        "no-store — every request fetches fresh data",
        "no-cache — checks with the server before using cached data",
        "revalidate: 60 — caches for 60 seconds by default"
      ],
      correct: 0,
      explanation: "By default, fetch() in Server Components uses force-cache semantics. The response is stored in the Data Cache and reused across requests until you explicitly invalidate it with revalidatePath, revalidateTag, or redeploy."
    },
    {
      question: "What does React cache() deduplicate across?",
      options: [
        "All requests globally across all users",
        "A single server render pass only",
        "All requests within a 5-minute window",
        "All requests within the same deployment"
      ],
      correct: 1,
      explanation: "React cache() memoizes within a single server render pass. When multiple components call the same cached function during one render, the function executes only once. The memo is discarded after the render completes — it does not persist across requests."
    },
    {
      question: "A single fetch() with cache: 'no-store' in a Server Component causes what effect on the route?",
      options: [
        "Only that specific fetch is uncached; the route remains static",
        "The entire route becomes dynamic — no static rendering",
        "It throws an error if the route is configured as static",
        "It falls back to time-based revalidation"
      ],
      correct: 1,
      explanation: "A single no-store fetch opts the entire route into dynamic rendering. Next.js cannot statically pre-render a page that needs fresh data on every request. This is a common gotcha: one uncached fetch in a deeply nested component makes the whole page dynamic."
    },
    {
      question: "Which revalidation function invalidates cached data across multiple routes at once?",
      options: [
        "revalidatePath('/') — revalidates all paths",
        "revalidateTag('tagName') — invalidates all fetches with that tag",
        "revalidateAll() — purges the entire cache",
        "cache.clear() — clears the Data Cache"
      ],
      correct: 1,
      explanation: "revalidateTag invalidates all Data Cache entries tagged with the specified tag, regardless of which route they belong to. This makes it ideal for invalidating shared data across multiple pages. revalidatePath only affects a single path, and revalidateAll/cache.clear don't exist."
    },
    {
      question: "What is the main risk of using Promise.all() for parallel data fetching?",
      options: [
        "It causes duplicate network requests",
        "It bypasses the Data Cache for all requests",
        "If any single promise rejects, all results are lost",
        "It forces sequential execution in Node.js"
      ],
      correct: 2,
      explanation: "Promise.all rejects immediately when any promise rejects, discarding all other results — even those that succeeded. For fault-tolerant parallel fetching, use Promise.allSettled which reports each promise's outcome independently."
    }
  ]
};
