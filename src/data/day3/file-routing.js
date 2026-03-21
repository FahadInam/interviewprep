export const fileRouting = {
  id: "file-routing",
  title: "File-Based Routing & Dynamic Routes",
  icon: "📁",
  tag: "Next.js",
  tagColor: "var(--tag-next)",
  subtitle: "Dynamic segments, route handlers, colocation, and static params generation",
  concepts: [
    {
      title: "Dynamic Routes",
      explanations: {
        layman: "Instead of creating a separate page for every blog post, you create one template page with a blank space for the post name. That is what [slug] does -- the brackets mean 'fill in the blank.' For example, /blog/[slug] handles /blog/hello, /blog/my-post, or /blog/anything. Three patterns to know: [slug] matches exactly one blank (one URL piece). [...slug] matches one or more blanks (like /docs/a/b/c). [[...slug]] matches zero or more blanks (handles /docs by itself AND /docs/a/b/c).",
        mid: "Next.js dynamic routes use bracket notation in folder names: [slug] matches a single segment (/blog/hello), [...slug] is a catch-all matching one or more segments (/blog/2024/01/hello), and [[...slug]] is an optional catch-all matching zero or more segments (matches /blog as well as /blog/2024/01). The params are passed to the page component as a promise (in Next.js 15+) or a plain object. Dynamic segments can be combined with static segments and nested at any level. The params object for catch-all routes contains an array of segments.",
        senior: "Dynamic route resolution follows a specificity hierarchy: static routes > dynamic routes > catch-all routes. When multiple routes could match, Next.js picks the most specific. At build time, dynamic routes are rendered on-demand unless you provide generateStaticParams, which pre-renders known paths. In production, the interplay between dynamic routes and caching is critical: dynamic routes with no explicit caching strategy default to dynamic rendering (equivalent to SSR per request). Using generateStaticParams opts these routes into static generation. The route params are URL-decoded automatically, but be careful with special characters. For catch-all routes, the params array preserves segment boundaries, which matters for nested path resolution. In the Edge runtime, dynamic route matching happens at the CDN edge, making it suitable for multi-tenant apps where [tenant] is the first segment."
      },
      realWorld: "A blog uses /blog/[slug] for individual posts, a docs site uses /docs/[...slug] to support nested documentation paths like /docs/guides/getting-started/installation, and a CMS uses [[...slug]] to handle both the homepage and all nested pages.",
      whenToUse: "Use [slug] for single-segment dynamic content (product pages, user profiles). Use [...slug] for hierarchical content (docs, file browsers). Use [[...slug]] when the base path should also be handled (landing page + nested routes).",
      whenNotToUse: "Don't use catch-all routes when you need specific handling per segment depth — it's better to have explicit nested folders. Avoid [[...slug]] if you actually need to distinguish between the root and nested paths with different components.",
      pitfalls: "In Next.js 15+, params is a Promise and must be awaited. Forgetting to await params is a common source of bugs. Catch-all routes receive an array, not a string — destructure accordingly. Also, [slug] does NOT match paths with slashes; only [...slug] does.",
      codeExamples: [
        {
          title: "All Three Dynamic Route Types",
          code: `// 1. Single dynamic segment: app/blog/[slug]/page.js
// Matches: /blog/hello, /blog/my-post
// Does NOT match: /blog, /blog/a/b
export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = await fetch(
    \`https://api.example.com/posts/\${slug}\`
  ).then(r => r.json());

  return <article><h1>{post.title}</h1></article>;
}

// 2. Catch-all segment: app/docs/[...slug]/page.js
// Matches: /docs/a, /docs/a/b, /docs/a/b/c
// Does NOT match: /docs
export default async function DocsPage({ params }) {
  const { slug } = await params; // slug is an array
  // /docs/guides/setup -> slug = ['guides', 'setup']
  const path = slug.join('/');

  return <div>Docs path: {path}</div>;
}

// 3. Optional catch-all: app/shop/[[...slug]]/page.js
// Matches: /shop, /shop/shoes, /shop/shoes/nike
export default async function ShopPage({ params }) {
  const { slug } = await params; // slug is undefined or array
  if (!slug) {
    return <div>Shop Home — All Categories</div>;
  }
  return <div>Category: {slug.join(' > ')}</div>;
}`
        }
      ]
    },
    {
      title: "Route Handlers (API Routes)",
      explanations: {
        layman: "Route handlers are like the kitchen in a restaurant. Customers (the browser) never go to the kitchen — they send orders (requests) and receive food (responses). In Next.js, a route.js file creates an API endpoint. It is like having a waiter's station at any table in the restaurant: you can put API endpoints right next to the pages that use them.",
        mid: "Route handlers are the App Router's equivalent of API routes. You define them in route.js files using exported functions named after HTTP methods: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS. They receive a Request object (Web API standard) and return a Response object. Route handlers can be placed anywhere in the app directory alongside page.js, but a route.js and page.js cannot coexist in the same folder (they'd conflict on the same URL). Route handlers support streaming responses, cookies, headers, redirects, and dynamic segments just like pages.",
        senior: "Route handlers are built on the Web API standards (Request/Response), making them portable and Edge-compatible. By default, GET handlers with no dynamic usage are statically evaluated at build time and cached — they become static JSON endpoints. Using dynamic APIs (cookies(), headers(), or reading the request body) opts into dynamic rendering. You can explicitly control caching with route segment config: export const dynamic = 'force-static' or 'force-dynamic'. For streaming responses, return a ReadableStream in the Response body. Route handlers support the same runtime options as pages: export const runtime = 'edge' for Edge Runtime. In production, cached GET route handlers are served from the CDN like static assets. POST/PUT/DELETE are always dynamic. CORS must be handled manually using the OPTIONS method and appropriate headers. Route handlers don't go through the React rendering pipeline — they're raw HTTP handlers, making them ideal for webhooks, API proxies, and server-sent events."
      },
      realWorld: "A SaaS app uses route handlers for: POST /api/webhooks/stripe to handle Stripe payment events, GET /api/og to generate dynamic Open Graph images, and GET /api/search to proxy search queries to an internal service without exposing API keys.",
      whenToUse: "Use route handlers for API endpoints consumed by client components, webhooks from external services, proxy endpoints to hide API keys, streaming responses (SSE), and file generation (images, PDFs).",
      whenNotToUse: "Don't use route handlers for data that Server Components can fetch directly. If a page just needs to display API data, fetch it in the Server Component — no API route needed. Avoid using route handlers as a layer between your own server components and your database.",
      pitfalls: "route.js and page.js cannot exist at the same level — the route takes precedence and the page won't render. GET handlers are cached by default at build time, which surprises developers expecting dynamic behavior. Always set dynamic = 'force-dynamic' for endpoints that need fresh data per request. Also, route handlers receive the raw Request, not the extended NextRequest by default — import NextRequest from next/server if you need URL parsing helpers.",
      codeExamples: [
        {
          title: "Complete Route Handler with Multiple Methods",
          code: `// app/api/posts/route.js
import { NextResponse } from 'next/server';

// GET is cached by default at build time (static)
// Use dynamic = 'force-dynamic' to opt out
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '10';

  const posts = await db.post.findMany({
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({
    posts,
    page: Number(page),
    hasMore: posts.length === Number(limit)
  });
}

export async function POST(request) {
  // POST is always dynamic (never cached)
  const body = await request.json();
  const { title, content } = body;

  if (!title || !content) {
    return NextResponse.json(
      { error: 'Title and content are required' },
      { status: 400 }
    );
  }

  const post = await db.post.create({
    data: { title, content }
  });

  return NextResponse.json(post, { status: 201 });
}

// app/api/posts/[id]/route.js
export async function GET(request, { params }) {
  const { id } = await params;
  const post = await db.post.findUnique({ where: { id } });

  if (!post) {
    return NextResponse.json(
      { error: 'Post not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(post);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  await db.post.delete({ where: { id } });

  return new Response(null, { status: 204 });
}`
        },
        {
          title: "Streaming Route Handler (Server-Sent Events)",
          code: `// app/api/stream/route.js
export const runtime = 'edge'; // Edge for low-latency streaming

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < 10; i++) {
        const data = JSON.stringify({ count: i, time: Date.now() });
        controller.enqueue(
          encoder.encode(\`data: \${data}\\n\\n\`)
        );
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}`
        }
      ]
    },
    {
      title: "Colocation and Route Segment Organization",
      explanations: {
        layman: "Colocation is like keeping your cooking ingredients right next to your recipes instead of in a separate pantry across the house. In the App Router, you can put helper files, components, and utilities in the same folder as your route files. Only files named page.js, route.js, and other special conventions create actual web pages — everything else is just for your organization.",
        mid: "The App Router only makes routes publicly accessible when a folder contains a page.js or route.js. This means you can safely colocate components, utilities, tests, styles, and types alongside your routes without creating new URL endpoints. For example, app/dashboard/components/Chart.js lives next to app/dashboard/page.js but doesn't create a /dashboard/components/Chart route. You can also use private folders (prefixed with _) to explicitly exclude folders from routing: _components, _lib, _utils. Additionally, the src/ directory convention keeps route files alongside their related code, improving discoverability.",
        senior: "Colocation in the App Router is a deliberate architectural decision that improves code discoverability and reduces coupling. The key insight: a folder without page.js or route.js is invisible to the router, so your route segments double as feature boundaries. This enables domain-driven organization where each route segment encapsulates its components, hooks, types, and tests. For large teams, this eliminates the 'shared components' sprawl problem. However, be cautious with barrel files (index.js re-exports) in colocated folders — they can interfere with tree-shaking and may accidentally re-export server-only code to client components. Also, module resolution within colocated files follows standard import rules, but path aliases (like @/) should be preferred over relative imports that traverse segment boundaries, since segment boundaries are refactoring boundaries."
      },
      realWorld: "A large e-commerce app colocates product card components, price formatting utilities, and cart context directly within the app/products/ route folder. Each team owns their route segment and can make changes without touching shared directories.",
      whenToUse: "Always colocate route-specific code. If a component is only used by one route, put it in that route's folder. Use a shared components/ directory only for truly cross-cutting components used by many routes.",
      whenNotToUse: "Don't colocate genuinely shared utilities. If a formatting function is used across many routes, it belongs in a shared lib/ or utils/ folder. Over-colocation leads to code duplication.",
      pitfalls: "A file named page.js, route.js, loading.js, error.js, layout.js, template.js, not-found.js, or default.js at any folder level will be treated as a special route file. Don't name your colocated component files with these reserved names. Also, importing from one route segment to another creates tight coupling — prefer shared directories for cross-segment code.",
      codeExamples: [
        {
          title: "Colocated Route Structure",
          code: `// Recommended folder structure with colocation:
//
// app/
//   products/
//     _components/          <-- Private: NOT a route
//       ProductCard.js
//       ProductGrid.js
//       PriceDisplay.js
//     _lib/                 <-- Private: NOT a route
//       formatPrice.js
//       validateProduct.js
//     [id]/
//       _components/
//         ProductGallery.js
//         AddToCartButton.js
//       page.js             <-- Route: /products/[id]
//       loading.js
//       error.js
//     page.js               <-- Route: /products
//     layout.js
//     loading.js

// app/products/_components/ProductCard.js
// This is NOT a route — safe to colocate
export function ProductCard({ product }) {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <PriceDisplay price={product.price} />
    </div>
  );
}

// app/products/page.js
import { ProductCard } from './_components/ProductCard';
import { ProductGrid } from './_components/ProductGrid';

export default async function ProductsPage() {
  const products = await fetch('https://api.example.com/products')
    .then(r => r.json());

  return (
    <ProductGrid>
      {products.map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
    </ProductGrid>
  );
}`
        }
      ]
    },
    {
      title: "generateStaticParams",
      explanations: {
        layman: "Imagine you're printing a newspaper. Instead of printing each article when someone asks for it, you print all the articles in advance and stack them for delivery. generateStaticParams is your print list — it tells Next.js which pages to build ahead of time. Any article not on the list can either be printed on demand when someone asks, or result in a 'sold out' sign (404).",
        mid: "generateStaticParams is the App Router replacement for getStaticPaths. It exports a function from a dynamic route page that returns an array of params objects, telling Next.js which dynamic paths to pre-render at build time. Combined with fetch caching, this enables fully static generation of dynamic routes. You can control the behavior for paths NOT in the list with the dynamicParams route config: true (default) renders unknown paths on demand and caches them, false returns 404 for unknown paths. generateStaticParams can be defined at any level of nested dynamic routes, and child segments can use the parent's params.",
        senior: "generateStaticParams runs at build time and determines the static shell of your application. For nested dynamic routes, it supports a cascading pattern: a parent's generateStaticParams runs first, and its output is passed to child segments' generateStaticParams, enabling efficient database queries (fetch categories, then fetch products per category). The function is deduplicated — if multiple segments call the same fetch, React's cache ensures it runs once. When dynamicParams is true (default), on-demand paths are ISR'd: first request triggers server rendering, subsequent requests serve the cached result. Setting dynamicParams = false with a complete generateStaticParams list is optimal for SEO-critical pages where you want guaranteed build-time rendering and 404s for invalid paths. In production, pre-rendered pages are deployed to the CDN as static HTML with RSC payloads. The generateStaticParams function itself can be async and can call databases or APIs. For very large sites (100k+ pages), use pagination patterns in generateStaticParams or generate only the most popular paths and rely on dynamicParams: true for the long tail."
      },
      realWorld: "A blog platform pre-renders the 1000 most popular articles at build time using generateStaticParams, while less popular articles are rendered on demand (dynamicParams: true). An e-commerce site generates all product category pages statically but renders individual product pages on demand.",
      whenToUse: "Use for any dynamic route where you want pre-rendered, SEO-optimized pages. Critical for marketing pages, blog posts, product pages, and documentation. Combine with revalidate for ISR behavior.",
      whenNotToUse: "Skip it for highly dynamic content that changes per request (user dashboards, search results). Also unnecessary for routes behind authentication where SEO doesn't matter.",
      pitfalls: "Returning an empty array from generateStaticParams with dynamicParams: false means NOTHING is pre-rendered and all paths 404. Large param lists can slow builds significantly — be strategic about what you pre-render. Also, generateStaticParams does not support runtime request context (no access to cookies, headers, or searchParams).",
      codeExamples: [
        {
          title: "generateStaticParams with Nested Dynamic Routes",
          code: `// app/blog/[category]/[slug]/page.js

// Generate all category + slug combinations
export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts')
    .then(r => r.json());

  return posts.map(post => ({
    category: post.category,
    slug: post.slug
  }));
  // Returns: [
  //   { category: 'tech', slug: 'nextjs-guide' },
  //   { category: 'design', slug: 'ui-patterns' }
  // ]
}

// Unknown paths are rendered on demand (default)
// Set to false to return 404 for unknown paths
export const dynamicParams = true;

export default async function BlogPost({ params }) {
  const { category, slug } = await params;
  const post = await fetch(
    \`https://api.example.com/posts/\${category}/\${slug}\`,
    { next: { revalidate: 3600 } }
  ).then(r => r.json());

  return (
    <article>
      <span className="category">{category}</span>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </article>
  );
}

// Cascading pattern: parent generates categories,
// child uses them to generate slugs

// app/blog/[category]/page.js
export async function generateStaticParams() {
  const categories = await fetch('https://api.example.com/categories')
    .then(r => r.json());
  return categories.map(c => ({ category: c.slug }));
}

// app/blog/[category]/[slug]/page.js
export async function generateStaticParams({ params: { category } }) {
  // Receives parent's params — fetch only this category's posts
  const posts = await fetch(
    \`https://api.example.com/categories/\${category}/posts\`
  ).then(r => r.json());

  return posts.map(post => ({ slug: post.slug }));
}`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "What is the difference between [slug], [...slug], and [[...slug]] in Next.js dynamic routes?",
      answer: "The three bracket patterns handle different levels of URL flexibility. [slug] matches exactly one URL segment: /blog/hello matches, but /blog/a/b does not. [...slug] is a catch-all that matches one or more segments: /blog/a, /blog/a/b, and /blog/a/b/c all match, but /blog alone does not. [[...slug]] is an optional catch-all that matches zero or more: it handles everything [...slug] does PLUS the base path /blog with no segments. The params you receive also differ: [slug] gives you a string, [...slug] gives you an array of strings, and [[...slug]] gives you an array or undefined when the base path matches with zero segments. A common use case: [slug] for blog posts, [...slug] for nested docs, [[...slug]] for a CMS that needs to handle both the homepage and nested pages.",
      difficulty: "easy",
      followUps: [
        "How does Next.js resolve conflicts between static and dynamic routes?",
        "Can you nest dynamic segments inside catch-all routes?",
        "How do you type the params for each dynamic route type in TypeScript?"
      ]
    },
    {
      question: "How do route handlers differ from Pages Router API routes?",
      answer: "Route handlers use the Web API Request/Response standard instead of Node.js req/res. They support named exports for HTTP methods (GET, POST, etc.) instead of a single handler checking req.method. GET route handlers are statically cached by default at build time — Pages Router API routes were always dynamic. Route handlers support Edge Runtime natively. They can be colocated alongside pages in the app directory (but not in the same folder as page.js). They also support streaming responses via ReadableStream. The mental model shifts from imperative (set status, write headers, send body) to declarative (return a Response object).",
      difficulty: "mid",
      followUps: [
        "When is a GET route handler statically evaluated vs dynamically evaluated?",
        "How do you handle CORS in route handlers?",
        "Can route handlers access cookies and headers?"
      ]
    },
    {
      question: "What is the route resolution priority when multiple routes could match a URL?",
      answer: "Next.js resolves routes from most specific to least specific: static routes (exact match) take highest priority, then dynamic segments [slug], then catch-all segments [...slug], and finally optional catch-all [[...slug]]. For example, if both /blog/about (static) and /blog/[slug] (dynamic) exist, /blog/about always renders the static route. This is determined at build time through the route manifest. Additionally, route.js takes precedence over page.js at the same level — you cannot have both for the same URL.",
      difficulty: "mid",
      followUps: [
        "What happens if two dynamic routes at the same level could match?",
        "How does middleware interact with route resolution?",
        "Can you have [slug] and [...slug] as siblings?"
      ]
    },
    {
      question: "Explain generateStaticParams and how it relates to getStaticPaths.",
      answer: "generateStaticParams is the App Router replacement for getStaticPaths. Both tell Next.js which dynamic paths to pre-render at build time. Key differences: generateStaticParams returns a simpler array of params objects (no paths wrapper or fallback property). The fallback behavior is controlled separately via the dynamicParams route config (true = render unknown on demand, false = 404). generateStaticParams supports cascading — a parent segment's output is passed to child segments. It can be async and runs at build time. Unlike getStaticPaths which was page-level, generateStaticParams works per-segment and can be defined at any level of nested dynamic routes.",
      difficulty: "mid",
      followUps: [
        "How do you handle 100k+ pages with generateStaticParams?",
        "What's the difference between dynamicParams true and false?",
        "Can generateStaticParams access request-time data like cookies?"
      ]
    },
    {
      question: "Why can't page.js and route.js coexist in the same folder?",
      answer: "They would both handle the same URL path, creating an ambiguous conflict. page.js renders a React component (HTML) and route.js handles raw HTTP requests (JSON, streams, etc.). If both existed at /api/users, Next.js wouldn't know whether to render a page or execute the API handler. To resolve this, Next.js prohibits the combination. If you need both an API endpoint and a page at similar paths, use different folder structures: app/users/page.js for the page and app/api/users/route.js for the API, or colocate the route.js in a different segment.",
      difficulty: "easy",
      followUps: [
        "What happens during build if you accidentally have both?",
        "Can route.js and layout.js coexist?",
        "Where should you put route handlers relative to pages?"
      ]
    },
    {
      question: "How does colocation work in the App Router, and what are private folders?",
      answer: "The App Router only creates routes for folders containing page.js or route.js. All other files in the app directory are safely colocated — they don't become routes. This means you can put components, utilities, tests, and styles right next to your route files. Private folders (prefixed with underscore: _components, _lib) explicitly signal that a folder is not a route segment. While regular folders without page.js are already invisible to the router, the underscore convention adds clarity and prevents accidental route creation if someone adds a page.js later. This enables domain-driven organization where each route segment encapsulates all its related code.",
      difficulty: "easy",
      followUps: [
        "What reserved file names should you avoid for colocated files?",
        "How do private folders affect imports and module resolution?",
        "When should you use shared directories vs colocation?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Build a REST API with Route Handlers",
      difficulty: "mid",
      description: "Create a complete CRUD REST API for a 'tasks' resource using route handlers. Include GET (list with pagination), POST (create), GET by ID, PUT (update), and DELETE. Handle errors gracefully and return appropriate status codes.",
      solution: `// app/api/tasks/route.js
import { NextResponse } from 'next/server';

// In-memory store for demo (use a real DB in production)
let tasks = [
  { id: '1', title: 'Learn Next.js', completed: false, createdAt: new Date().toISOString() },
  { id: '2', title: 'Build an app', completed: false, createdAt: new Date().toISOString() }
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const status = searchParams.get('status'); // 'completed' | 'pending'

  let filtered = tasks;
  if (status === 'completed') filtered = tasks.filter(t => t.completed);
  if (status === 'pending') filtered = tasks.filter(t => !t.completed);

  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return NextResponse.json({
    tasks: paginated,
    total: filtered.length,
    page,
    totalPages: Math.ceil(filtered.length / limit)
  });
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json(
        { error: 'Title is required and must be a string' },
        { status: 400 }
      );
    }

    const newTask = {
      id: crypto.randomUUID(),
      title: body.title.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    return NextResponse.json(newTask, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }
}

// app/api/tasks/[id]/route.js
export async function GET(request, { params }) {
  const { id } = await params;
  const task = tasks.find(t => t.id === id);

  if (!task) {
    return NextResponse.json(
      { error: 'Task not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(task);
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const taskIndex = tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return NextResponse.json(
      { error: 'Task not found' },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...(body.title && { title: body.title.trim() }),
      ...(typeof body.completed === 'boolean' && {
        completed: body.completed
      })
    };

    return NextResponse.json(tasks[taskIndex]);
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const taskIndex = tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return NextResponse.json(
      { error: 'Task not found' },
      { status: 404 }
    );
  }

  tasks.splice(taskIndex, 1);
  return new Response(null, { status: 204 });
}`,
      explanation: "This implements a full REST API using App Router route handlers. GET /api/tasks supports pagination and filtering via search params. POST creates tasks with validation. Individual task routes use [id] dynamic segments. Each handler returns appropriate HTTP status codes (200, 201, 204, 400, 404). Note the use of NextResponse.json() for convenience and the Web standard new Response() for the 204 no-content response."
    },
    {
      title: "Implement generateStaticParams with ISR for a Blog",
      difficulty: "mid",
      description: "Create a blog with dynamic routes where the 50 most recent posts are pre-rendered at build time, and older posts are rendered on demand. Include ISR with 1-hour revalidation and proper metadata generation.",
      solution: `// app/blog/[slug]/page.js
import { notFound } from 'next/navigation';

// Pre-render the 50 most recent posts at build time
export async function generateStaticParams() {
  const posts = await fetch(
    'https://api.example.com/posts?limit=50&sort=recent'
  ).then(r => r.json());

  return posts.map(post => ({
    slug: post.slug
  }));
}

// Allow on-demand rendering for posts not in the top 50
export const dynamicParams = true;

// Generate metadata for each post
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await fetch(
    \`https://api.example.com/posts/\${slug}\`
  ).then(r => r.json());

  if (!post) {
    return { title: 'Post Not Found' };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name]
    }
  };
}

export default async function BlogPost({ params }) {
  const { slug } = await params;

  const post = await fetch(
    \`https://api.example.com/posts/\${slug}\`,
    { next: { revalidate: 3600 } } // ISR: revalidate every hour
  ).then(r => {
    if (!r.ok) return null;
    return r.json();
  });

  if (!post) {
    notFound(); // Triggers not-found.js
  }

  return (
    <article>
      <header>
        <time dateTime={post.publishedAt}>
          {new Date(post.publishedAt).toLocaleDateString()}
        </time>
        <h1>{post.title}</h1>
        <p className="author">By {post.author.name}</p>
      </header>
      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
    </article>
  );
}

// app/blog/[slug]/not-found.js
import Link from 'next/link';

export default function PostNotFound() {
  return (
    <div className="not-found">
      <h2>Post Not Found</h2>
      <p>The blog post you are looking for does not exist.</p>
      <Link href="/blog">Back to Blog</Link>
    </div>
  );
}

// app/blog/[slug]/loading.js
export default function PostLoading() {
  return (
    <article className="skeleton">
      <div className="skeleton-line skeleton-date" />
      <div className="skeleton-line skeleton-title" />
      <div className="skeleton-line skeleton-author" />
      <div className="skeleton-block skeleton-content" />
    </article>
  );
}`,
      explanation: "generateStaticParams pre-renders the 50 most recent posts at build time for instant loading and SEO. dynamicParams: true allows older posts to be rendered on demand (first request triggers SSR, subsequent requests serve cache). The fetch uses next: { revalidate: 3600 } for ISR — cached pages are revalidated every hour. generateMetadata creates dynamic SEO metadata per post. The notFound() function triggers the segment-level not-found.js for invalid slugs. loading.js provides skeleton UI while on-demand posts render."
    },
    {
      title: "Build a Nested Catch-All Documentation Router",
      difficulty: "hard",
      description: "Create a documentation system using [[...slug]] that handles /docs (main page), /docs/getting-started, and deeply nested paths like /docs/api/reference/components/button. Include breadcrumb generation, sidebar navigation, and 404 handling for invalid paths.",
      solution: `// app/docs/[[...slug]]/page.js
import { notFound } from 'next/navigation';
import Link from 'next/link';

// Simulated docs structure
const docsTree = {
  '': { title: 'Documentation Home', content: 'Welcome to the docs.' },
  'getting-started': { title: 'Getting Started', content: 'Quick start guide...' },
  'getting-started/installation': { title: 'Installation', content: 'npm install...' },
  'getting-started/configuration': { title: 'Configuration', content: 'Config options...' },
  'api/reference': { title: 'API Reference', content: 'Full API docs...' },
  'api/reference/components': { title: 'Components', content: 'Component catalog...' },
  'api/reference/components/button': { title: 'Button', content: 'Button API...' },
  'api/reference/hooks': { title: 'Hooks', content: 'Available hooks...' }
};

export async function generateStaticParams() {
  return Object.keys(docsTree).map(path => ({
    slug: path === '' ? [] : path.split('/')
  }));
}

export const dynamicParams = false; // 404 for unknown docs paths

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const path = slug ? slug.join('/') : '';
  const doc = docsTree[path];

  return {
    title: doc ? \`\${doc.title} | Docs\` : 'Not Found'
  };
}

// Generate breadcrumbs from the slug array
function getBreadcrumbs(slugArray) {
  if (!slugArray || slugArray.length === 0) {
    return [{ label: 'Docs', href: '/docs' }];
  }

  const crumbs = [{ label: 'Docs', href: '/docs' }];

  slugArray.forEach((segment, index) => {
    const href = '/docs/' + slugArray.slice(0, index + 1).join('/');
    const label = segment
      .replace(/-/g, ' ')
      .replace(/\\b\\w/g, c => c.toUpperCase());
    crumbs.push({ label, href });
  });

  return crumbs;
}

// Build sidebar from docs tree
function getSidebar() {
  const entries = Object.entries(docsTree).filter(([k]) => k !== '');
  const grouped = {};

  entries.forEach(([path, doc]) => {
    const topLevel = path.split('/')[0];
    if (!grouped[topLevel]) grouped[topLevel] = [];
    grouped[topLevel].push({ path, ...doc });
  });

  return grouped;
}

export default async function DocsPage({ params }) {
  const { slug } = await params;
  const path = slug ? slug.join('/') : '';
  const doc = docsTree[path];

  if (!doc) {
    notFound();
  }

  const breadcrumbs = getBreadcrumbs(slug);
  const sidebar = getSidebar();

  return (
    <div className="docs-layout">
      <aside className="docs-sidebar">
        <nav>
          <Link href="/docs">Home</Link>
          {Object.entries(sidebar).map(([section, items]) => (
            <div key={section}>
              <h4>{section.replace(/-/g, ' ')}</h4>
              <ul>
                {items.map(item => (
                  <li key={item.path}>
                    <Link
                      href={\`/docs/\${item.path}\`}
                      className={path === item.path ? 'active' : ''}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <main className="docs-content">
        <nav className="breadcrumbs">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.href}>
              {i > 0 && <span className="separator"> / </span>}
              <Link href={crumb.href}>{crumb.label}</Link>
            </span>
          ))}
        </nav>

        <h1>{doc.title}</h1>
        <div className="content">{doc.content}</div>
      </main>
    </div>
  );
}

// app/docs/[[...slug]]/not-found.js
import Link from 'next/link';

export default function DocsNotFound() {
  return (
    <div>
      <h2>Page Not Found</h2>
      <p>This documentation page does not exist.</p>
      <Link href="/docs">Go to Documentation Home</Link>
    </div>
  );
}`,
      explanation: "The [[...slug]] optional catch-all handles both /docs (slug is undefined) and any nested path. generateStaticParams pre-renders all known docs pages. dynamicParams: false ensures unknown paths get a 404 instead of triggering on-demand rendering. The breadcrumb component builds navigation from the slug array. The sidebar is generated from the docs tree structure. This pattern scales to any depth of nesting while maintaining a single page component."
    }
  ],
  quiz: [
    {
      question: "What does the [...slug] catch-all route match that [[...slug]] also matches?",
      options: [
        "The base path without any segments",
        "One or more URL segments",
        "Only a single URL segment",
        "Query parameters"
      ],
      correct: 1,
      explanation: "Both [...slug] and [[...slug]] match one or more URL segments. The difference is that [[...slug]] (optional catch-all) ALSO matches the base path with zero segments, while [...slug] requires at least one segment."
    },
    {
      question: "When is a GET route handler statically evaluated (cached at build time)?",
      options: [
        "Always, unless you add export const dynamic = 'force-dynamic'",
        "When it doesn't use dynamic APIs like cookies(), headers(), or request body",
        "Only when you explicitly add export const dynamic = 'force-static'",
        "Never — route handlers are always dynamic"
      ],
      correct: 1,
      explanation: "GET route handlers are statically evaluated at build time by default when they don't use dynamic APIs (cookies(), headers(), reading the request body, URL search params from the request). Using any of these opts the handler into dynamic rendering. Non-GET methods (POST, PUT, DELETE) are always dynamic."
    },
    {
      question: "What happens when dynamicParams is set to false and a user visits an ungenerated dynamic path?",
      options: [
        "The page is rendered on demand and cached",
        "Next.js returns a 404 response",
        "The page is rendered but not cached",
        "Next.js redirects to the nearest static page"
      ],
      correct: 1,
      explanation: "When dynamicParams is false, any dynamic path not returned by generateStaticParams will result in a 404 response. This is useful when you want to strictly control which pages exist and prevent on-demand rendering of arbitrary paths."
    },
    {
      question: "In Next.js 15+, how are route params accessed in page components?",
      options: [
        "Directly as a plain object: const { slug } = params",
        "Through a hook: const params = useParams()",
        "As a Promise that must be awaited: const { slug } = await params",
        "Through context: const params = useContext(RouteContext)"
      ],
      correct: 2,
      explanation: "In Next.js 15+, params is a Promise in Server Components and must be awaited: const { slug } = await params. This change supports async rendering patterns. In Client Components, you use the useParams() hook instead, which returns the params synchronously."
    },
    {
      question: "Can route.js and page.js coexist in the same app directory folder?",
      options: [
        "Yes, route.js handles API requests and page.js handles page requests",
        "Yes, but only if route.js only exports POST/PUT/DELETE (not GET)",
        "No, they conflict and Next.js will throw a build error",
        "Yes, but page.js takes priority for GET requests"
      ],
      correct: 2,
      explanation: "route.js and page.js cannot coexist in the same folder because they would both handle the same URL path. Next.js throws a build error to prevent this ambiguity. If you need both a page and an API endpoint at similar paths, use different folder structures (e.g., /users/page.js and /api/users/route.js)."
    }
  ]
};
