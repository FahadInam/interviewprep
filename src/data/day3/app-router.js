export const appRouter = {
  id: "app-router",
  title: "Next.js App Router",
  icon: "🧭",
  tag: "Next.js",
  tagColor: "var(--tag-next)",
  subtitle: "The new paradigm for routing, layouts, and rendering in Next.js 13+",
  concepts: [
    {
      title: "App Router vs Pages Router",
      explanations: {
        layman: "Think of two ways to build a house. The Pages Router is like separate sheds -- each shed is one page, and they share nothing. Need a hallway? Build it in every shed. The App Router is like a real building with shared hallways (layouts), built-in waiting rooms (loading states), and fire extinguishers (error handling). Rooms on the same floor share the hallway automatically.",
        mid: "The App Router (Next.js 13+) replaces Pages Router with a new model. Instead of getServerSideProps/getStaticProps, you fetch data directly in async Server Components. Layouts are nested and stay mounted across navigations. Components are Server Components by default (zero JS shipped to client unless you add 'use client'). Special files like page.js, layout.js, loading.js, and error.js replace the old _app.js and _document.js patterns.",
        senior: "The App Router shifts from page-level to segment-level architecture. Each route segment manages its own data, loading, and error states independently. It uses React concurrent features: Suspense for streaming, transitions for navigations, and RSC payload (flight protocol) instead of full HTML. Only changed segments re-render on navigation; shared layouts stay in memory. The client-side router cache stores RSC payloads per segment for instant back/forward. This means fewer waterfalls, smaller JS bundles, and granular per-segment caching. Edge runtime is first-class -- layouts and pages can independently choose edge or Node.js runtime."
      },
      realWorld: "Moving a dashboard from Pages Router to App Router keeps the sidebar mounted while navigating between sections. No layout flicker, scroll position is preserved.",
      whenToUse: "All new Next.js projects. It is the default since Next.js 13.4 and is production-ready.",
      whenNotToUse: "If you have a large Pages Router app working fine, a full migration may not be worth it. Both routers can coexist during gradual migration.",
      pitfalls: "Mixing both routers can cause subtle conflicts (e.g., middleware behaves differently for each). Many third-party libraries need 'use client' wrappers. Pages Router patterns like getServerSideProps do not exist in the App Router.",
      codeExamples: [
        {
          title: "Basic App Router Structure",
          code: `// app/layout.js — Root layout (required)
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

// app/page.js — Home page (Server Component by default)
export default async function HomePage() {
  const data = await fetch('https://api.example.com/featured');
  const featured = await data.json();

  return (
    <main>
      <h1>Welcome</h1>
      <p>{featured.headline}</p>
    </main>
  );
}`
        },
        {
          title: "Pages Router Equivalent (for comparison)",
          code: `// pages/index.js — Pages Router approach
export async function getServerSideProps() {
  const res = await fetch('https://api.example.com/featured');
  const featured = await res.json();
  return { props: { featured } };
}

export default function HomePage({ featured }) {
  return (
    <main>
      <h1>Welcome</h1>
      <p>{featured.headline}</p>
    </main>
  );
}`
        }
      ]
    },
    {
      title: "File-System Routing Conventions",
      explanations: {
        layman: "Each folder in your project is like a room. Special files are the furniture: page.js is the desk where work happens, layout.js is the walls that stay put, loading.js is a 'please wait' sign, error.js is the fire extinguisher, and not-found.js is the 'wrong room' sign.",
        mid: "The App Router uses special file names by convention. page.js makes a route public -- without it, a folder is just for organization. layout.js wraps children and stays mounted across navigations. template.js is like layout but re-mounts every navigation. loading.js creates a Suspense boundary automatically. error.js creates an ErrorBoundary. not-found.js handles 404s. default.js is the fallback for parallel routes. These files are composed into a component tree automatically.",
        senior: "The files map to this React tree: Layout > Template > ErrorBoundary (error.js) > Suspense (loading.js) > NotFound boundary > Page. Key detail: error.js catches page errors but NOT layout errors at the same segment -- layout errors bubble up to the parent segment's error boundary. loading.js creates a Suspense boundary that enables streaming SSR: the shell (layout) is sent immediately while the page streams in. Each segment boundary is a potential streaming boundary. This lets you show the nav shell instantly while heavy pages load."
      },
      realWorld: "An e-commerce site uses layout.js for the header/cart, loading.js for skeleton screens, error.js for failed API calls, and not-found.js for invalid product URLs.",
      whenToUse: "Always use these conventions. Every route needs at least page.js. Most routes benefit from layout.js and loading.js.",
      whenNotToUse: "Skip loading.js for routes that render instantly (static content with no data fetching). Unnecessary Suspense boundaries add overhead.",
      pitfalls: "Client state in layout.js does NOT reset on navigation because layouts persist. Use template.js if you need remounting. Also, error.js cannot catch errors in its own segment's layout -- you need the parent's error.js for that.",
      codeExamples: [
        {
          title: "Complete Route Segment with All Conventions",
          code: `// app/products/layout.js
export default function ProductsLayout({ children }) {
  return (
    <div className="products-container">
      <nav className="product-filters">
        <h2>Categories</h2>
        {/* This sidebar stays put across navigations */}
      </nav>
      <section className="product-content">{children}</section>
    </div>
  );
}

// app/products/loading.js
export default function ProductsLoading() {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton-card" />
      ))}
    </div>
  );
}

// app/products/error.js
"use client"; // Error boundaries MUST be client components

import { useEffect } from "react";

export default function ProductsError({ error, reset }) {
  useEffect(() => {
    console.error("Products error:", error);
  }, [error]);

  return (
    <div className="error-container">
      <h2>Failed to load products</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}

// app/products/not-found.js
export default function ProductsNotFound() {
  return (
    <div>
      <h2>Product Not Found</h2>
      <p>The product you are looking for does not exist.</p>
    </div>
  );
}

// app/products/page.js
export default async function ProductsPage() {
  const products = await fetch('https://api.example.com/products', {
    next: { revalidate: 60 }
  }).then(res => res.json());

  return (
    <ul>
      {products.map(p => (
        <li key={p.id}>{p.name} - \${p.price}</li>
      ))}
    </ul>
  );
}`
        }
      ]
    },
    {
      title: "Route Groups",
      explanations: {
        layman: "Route groups are invisible folders. Wrapping a folder name in parentheses like (marketing) helps YOU organize files, but it does not change the website URL. It is like using drawer dividers -- they help you find things, but the customer does not see them.",
        mid: "Route groups use parentheses in folder names: (folderName). They organize routes without affecting the URL. Main uses: (1) group routes by feature or team, (2) give different layouts to different groups, (3) create multiple root layouts. For example, (auth)/login and (dashboard)/settings get different layouts while /login and /settings stay as clean URLs.",
        senior: "Route groups let you create multiple root layouts (each with its own html/body tags) for different app sections -- different metadata, fonts, and styles per section. The build system treats each root layout group independently for code splitting. One key detail: navigating between different root layout groups triggers a full page reload (hard navigation) since the HTML shell changes. Route groups also affect parallel route slot resolution."
      },
      realWorld: "A SaaS product uses (marketing) for the landing page, (app) for the dashboard with sidebar, and (auth) for login/signup with a centered card -- all under the same domain.",
      whenToUse: "When you need different layouts for different sections, or when you want to organize a large app without changing URLs.",
      whenNotToUse: "Do not overuse for simple apps. If all routes share the same layout, a single root layout is cleaner.",
      pitfalls: "Multiple root layouts cause full page reloads when navigating between groups. Two route groups at the same level cannot both have a page.js for the same URL path.",
      codeExamples: [
        {
          title: "Route Groups with Different Layouts",
          code: `// Folder structure:
// app/(marketing)/layout.js
// app/(marketing)/page.js          -> URL: /
// app/(marketing)/about/page.js    -> URL: /about
// app/(app)/layout.js
// app/(app)/dashboard/page.js      -> URL: /dashboard
// app/(auth)/layout.js
// app/(auth)/login/page.js         -> URL: /login

// app/(marketing)/layout.js
export default function MarketingLayout({ children }) {
  return (
    <div className="marketing">
      <header className="marketing-nav">
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/login">Sign In</a>
      </header>
      <main>{children}</main>
      <footer>Marketing Footer</footer>
    </div>
  );
}

// app/(app)/layout.js
export default function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <nav>Dashboard Navigation</nav>
      </aside>
      <main className="app-content">{children}</main>
    </div>
  );
}`
        }
      ]
    },
    {
      title: "Parallel Routes and Intercepting Routes",
      explanations: {
        layman: "Parallel routes are like multiple TV screens on one wall -- each shows different content independently. Intercepting routes are like detour signs -- clicking a link shows a quick modal preview instead of a full new page. But if you refresh or share the URL, you see the full page. It is like peeking through a window vs walking through the door.",
        mid: "Parallel routes use @-prefixed folders (slots) to show multiple pages at once in one layout. Each slot loads independently with its own loading/error states. The layout gets them as props: { children, analytics, activity }. Intercepting routes use (.), (..), (..)(..), or (...) to show a different view on client navigation (usually a modal). On hard refresh, the original full page shows instead.",
        senior: "Parallel routes let dashboard panels fetch and stream data independently. If one slot errors, others keep working. default.js is critical: it provides fallback content when a slot URL does not match during client navigation. Without it, unmatched slots show 404. The router keeps a separate RSC payload cache per slot. Intercepting routes show a different component tree for soft vs hard navigation. The syntax mirrors relative paths: (.) = same level, (..) = one level up, (...) = from root. Great for photo galleries (modal on click, full page on refresh). Caveat: the modal and full-page views should not differ too much or users get confused."
      },
      realWorld: "A social feed: clicking a post shows a modal preview with the feed visible behind it. Refreshing shows the full post page. A dashboard uses parallel routes so analytics, activity, and team panels load independently.",
      whenToUse: "Parallel routes for dashboards with independent panels. Intercepting routes for modal patterns with shareable URLs.",
      whenNotToUse: "Parallel routes add complexity -- skip for simple layouts. Intercepting routes can confuse users if modal and full-page views are too different.",
      pitfalls: "Forgetting default.js for parallel routes causes unexpected 404s. Intercepting routes do not work on hard navigation (page refresh). Parallel routes increase RSC payloads fetched per navigation.",
      codeExamples: [
        {
          title: "Parallel Routes — Dashboard with Independent Panels",
          code: `// Folder structure:
// app/dashboard/@analytics/page.js
// app/dashboard/@activity/page.js
// app/dashboard/@analytics/default.js
// app/dashboard/@activity/default.js
// app/dashboard/layout.js
// app/dashboard/page.js

// app/dashboard/layout.js
export default function DashboardLayout({
  children,
  analytics,
  activity
}) {
  return (
    <div className="dashboard-grid">
      <main className="main-panel">{children}</main>
      <aside className="analytics-panel">{analytics}</aside>
      <aside className="activity-panel">{activity}</aside>
    </div>
  );
}

// app/dashboard/@analytics/page.js
export default async function AnalyticsPanel() {
  const stats = await fetch('https://api.example.com/analytics', {
    next: { revalidate: 300 }
  }).then(res => res.json());

  return (
    <div>
      <h3>Analytics</h3>
      <p>Page views: {stats.views}</p>
      <p>Bounce rate: {stats.bounceRate}%</p>
    </div>
  );
}

// app/dashboard/@analytics/default.js
export default function AnalyticsDefault() {
  return <div>Loading analytics...</div>;
}`
        },
        {
          title: "Intercepting Routes — Photo Modal Pattern",
          code: `// Folder structure:
// app/feed/page.js
// app/feed/@modal/(.)photo/[id]/page.js
// app/feed/@modal/default.js
// app/feed/layout.js
// app/photo/[id]/page.js  (full page view)

// app/feed/layout.js
export default function FeedLayout({ children, modal }) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}

// app/feed/@modal/default.js
export default function ModalDefault() {
  return null; // No modal by default
}

// app/feed/@modal/(.)photo/[id]/page.js
// Intercepts /photo/[id] when navigating from /feed
import { Modal } from '@/components/Modal';

export default async function PhotoModal({ params }) {
  const { id } = await params;
  const photo = await fetch(
    \`https://api.example.com/photos/\${id}\`
  ).then(r => r.json());

  return (
    <Modal>
      <img src={photo.url} alt={photo.title} />
      <p>{photo.title}</p>
    </Modal>
  );
}

// app/photo/[id]/page.js — Full page (on hard refresh)
export default async function PhotoPage({ params }) {
  const { id } = await params;
  const photo = await fetch(
    \`https://api.example.com/photos/\${id}\`
  ).then(r => r.json());

  return (
    <article className="photo-full">
      <img src={photo.url} alt={photo.title} />
      <h1>{photo.title}</h1>
      <p>{photo.description}</p>
    </article>
  );
}`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "What is the component rendering hierarchy in a Next.js App Router route segment?",
      answer: "From outside to inside: Layout > Template > ErrorBoundary (error.js) > Suspense (loading.js) > NotFound boundary > Page. Why it matters: Layouts persist across navigations (sidebar never re-renders). Templates re-mount every navigation (good for animations). The error boundary catches page errors but NOT layout errors at the same level -- layout errors go to the parent's error boundary. The Suspense boundary from loading.js enables streaming: the shell sends instantly while the page streams in.",
      difficulty: "mid",
      followUps: [
        "Why can't error.js catch errors in its own segment's layout.js?",
        "What's the difference between layout.js and template.js in terms of component lifecycle?",
        "How does this hierarchy affect streaming SSR?"
      ]
    },
    {
      question: "How do parallel routes work, and what role does default.js play?",
      answer: "Parallel routes use @-prefixed folders (slots) to show multiple pages at once in one layout. Each slot is independent with its own loading and error states. The layout receives slots as props. default.js is the fallback: when a slot's URL has no matching page during client navigation, default.js shows instead. Without default.js, unmatched slots show 404. On hard navigation (full page load), all slots use their default.js if there is no exact match.",
      difficulty: "hard",
      followUps: [
        "What happens if a parallel route slot doesn't have a default.js and the URL doesn't match?",
        "Can parallel routes have their own independent loading and error states?",
        "How do parallel routes affect the RSC payload size?"
      ]
    },
    {
      question: "What are intercepting routes and when would you use them?",
      answer: "Intercepting routes let you show a route from another part of your app within the current layout, usually as a modal. Convention: (.) = same level, (..) = one level up, (..)(..) = two levels up, (...) = app root. On client-side navigation, the intercepted route shows (modal). On hard refresh or direct URL, the original route shows (full page). Classic use case: image gallery where clicking shows a modal but refreshing shows the full page.",
      difficulty: "hard",
      followUps: [
        "What happens to an intercepting route when the user refreshes the page?",
        "How do you combine intercepting routes with parallel routes?",
        "What are the limitations of intercepting routes?"
      ]
    },
    {
      question: "How does the App Router differ from the Pages Router in terms of data fetching?",
      answer: "Pages Router uses getServerSideProps (SSR), getStaticProps (SSG), and getInitialProps -- all page-level functions that run before rendering. The App Router removes all of these. Instead, components are async Server Components by default -- you fetch data directly with async/await inside the component. Caching is controlled via fetch options (next.revalidate, cache). This allows component-level fetching instead of page-level. Combined with loading.js (Suspense), components stream in as data resolves instead of blocking the whole page.",
      difficulty: "mid",
      followUps: [
        "How do you handle data fetching in Client Components in the App Router?",
        "What are the caching implications of fetch in Server Components?",
        "How does request deduplication work in the App Router?"
      ]
    },
    {
      question: "Can the App Router and Pages Router coexist in the same Next.js project?",
      answer: "Yes. The app/ directory (App Router) and pages/ directory (Pages Router) can both exist. Next.js uses the right router for each. But a route cannot exist in both -- if /about is in both app/about/page.js and pages/about.js, the build fails. This allows gradual migration. Middleware works with both but behaves slightly differently. Shared layouts between the two routers are not possible.",
      difficulty: "mid",
      followUps: [
        "What happens if the same route is defined in both app/ and pages/?",
        "Can middleware work with both routers simultaneously?",
        "What's the recommended strategy for migrating from Pages to App Router?"
      ]
    },
    {
      question: "Explain route groups and their impact on layouts. Can you have multiple root layouts?",
      answer: "Route groups are folders in parentheses like (marketing) that organize routes without changing URLs. Their main power: enabling multiple root layouts. Each group can have its own layout.js with separate <html> and <body> tags, meaning different metadata, fonts, and styles per section. Trade-off: navigating between different root layout groups causes a full page reload because the HTML shell changes. Within one group, navigation stays smooth. Only one group at a given level can have a page.js for the same URL path.",
      difficulty: "hard",
      followUps: [
        "What happens when a user navigates between two different root layout groups?",
        "Can route groups share a common layout?",
        "How do route groups affect code splitting?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Build a Dashboard Layout with Parallel Routes",
      difficulty: "hard",
      description: "Create a dashboard layout that uses parallel routes for three independent panels: a main content area, a notifications panel, and a metrics panel. Each panel should have its own loading and error states. Include default.js files for each slot.",
      solution: `// app/dashboard/layout.js
export default function DashboardLayout({
  children,
  notifications,
  metrics
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1rem' }}>
      <div>
        <main>{children}</main>
      </div>
      <aside>
        <section>{notifications}</section>
        <section>{metrics}</section>
      </aside>
    </div>
  );
}

// app/dashboard/page.js
export default async function DashboardPage() {
  const overview = await fetch('https://api.example.com/overview', {
    next: { revalidate: 60 }
  }).then(r => r.json());

  return (
    <div>
      <h1>Dashboard Overview</h1>
      <p>Total Users: {overview.totalUsers}</p>
      <p>Revenue: \${overview.revenue}</p>
    </div>
  );
}

// app/dashboard/@notifications/page.js
export default async function NotificationsPanel() {
  const notifications = await fetch('https://api.example.com/notifications')
    .then(r => r.json());

  return (
    <div>
      <h3>Notifications</h3>
      <ul>
        {notifications.map(n => (
          <li key={n.id}>{n.message}</li>
        ))}
      </ul>
    </div>
  );
}

// app/dashboard/@notifications/loading.js
export default function NotificationsLoading() {
  return <div className="pulse">Loading notifications...</div>;
}

// app/dashboard/@notifications/error.js
"use client";
export default function NotificationsError({ error, reset }) {
  return (
    <div>
      <p>Failed to load notifications</p>
      <button onClick={() => reset()}>Retry</button>
    </div>
  );
}

// app/dashboard/@notifications/default.js
export default function NotificationsDefault() {
  return <div>No notifications to display</div>;
}

// app/dashboard/@metrics/page.js
export default async function MetricsPanel() {
  const metrics = await fetch('https://api.example.com/metrics', {
    next: { revalidate: 300 }
  }).then(r => r.json());

  return (
    <div>
      <h3>Metrics</h3>
      <p>CPU: {metrics.cpu}%</p>
      <p>Memory: {metrics.memory}%</p>
      <p>Latency: {metrics.latency}ms</p>
    </div>
  );
}

// app/dashboard/@metrics/loading.js
export default function MetricsLoading() {
  return <div className="pulse">Loading metrics...</div>;
}

// app/dashboard/@metrics/error.js
"use client";
export default function MetricsError({ error, reset }) {
  return (
    <div>
      <p>Metrics unavailable</p>
      <button onClick={() => reset()}>Retry</button>
    </div>
  );
}

// app/dashboard/@metrics/default.js
export default function MetricsDefault() {
  return <div>Metrics loading...</div>;
}`,
      explanation: "Three independent slots (@notifications, @metrics, children) each have their own loading.js, error.js, and default.js. The layout arranges them in a CSS Grid. Each panel fetches data independently and streams as it resolves. If one fails, the others keep working. default.js prevents 404s during client navigation."
    },
    {
      title: "Implement an Intercepting Route Modal for Product Quick View",
      difficulty: "hard",
      description: "Build a product listing page where clicking a product shows a modal with product details (intercepting route), but navigating directly to the product URL or refreshing shows a full product page.",
      solution: `// app/products/page.js
import Link from 'next/link';

export default async function ProductsPage() {
  const products = await fetch('https://api.example.com/products', {
    next: { revalidate: 60 }
  }).then(r => r.json());

  return (
    <div>
      <h1>Products</h1>
      <div className="product-grid">
        {products.map(product => (
          <Link key={product.id} href={\`/products/\${product.id}\`}>
            <div className="product-card">
              <h3>{product.name}</h3>
              <p>\${product.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// app/products/layout.js
export default function ProductsLayout({ children, modal }) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}

// app/products/@modal/default.js
export default function ModalDefault() {
  return null;
}

// app/products/@modal/(.)([id])/page.js
// Intercepts /products/[id] when navigating from /products
"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function ProductModal({ params }) {
  const router = useRouter();
  const overlayRef = useRef(null);

  useEffect(() => {
    // Fetch product data client-side for modal
  }, []);

  function handleClose() {
    router.back();
  }

  return (
    <div
      ref={overlayRef}
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === overlayRef.current) handleClose();
      }}
    >
      <div className="modal-content">
        <button onClick={handleClose} className="close-btn">X</button>
        <h2>Product Quick View</h2>
        <p>Product ID: {params.id}</p>
        <a href={\`/products/\${params.id}\`}>View Full Details</a>
      </div>
    </div>
  );
}

// app/products/[id]/page.js — Full product page (hard nav / refresh)
export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await fetch(
    \`https://api.example.com/products/\${id}\`
  ).then(r => r.json());

  return (
    <article>
      <h1>{product.name}</h1>
      <p className="price">\${product.price}</p>
      <p>{product.description}</p>
      <button>Add to Cart</button>
    </article>
  );
}`,
      explanation: "Clicking a product Link from the listing triggers client navigation, which is intercepted by the @modal/(.) route and shows a modal. The listing stays visible behind it. Back button or close dismisses the modal. Direct URL or refresh shows the full product page instead. The (.) convention means 'intercept at the same level'. The modal slot's default.js returns null so no modal shows by default."
    },
    {
      title: "Create a Route Group Setup with Multiple Root Layouts",
      difficulty: "mid",
      description: "Set up an app with two distinct sections: a marketing site (landing, about, pricing) and an authenticated app (dashboard, settings). Each section should have its own root layout with different styling and metadata.",
      solution: `// app/(marketing)/layout.js
export const metadata = {
  title: {
    template: '%s | Acme Inc',
    default: 'Acme Inc - Build Better Products'
  },
  description: 'Acme helps teams ship faster'
};

export default function MarketingLayout({ children }) {
  return (
    <html lang="en">
      <body className="marketing-theme">
        <header className="marketing-header">
          <nav>
            <a href="/">Acme</a>
            <div>
              <a href="/about">About</a>
              <a href="/pricing">Pricing</a>
              <a href="/dashboard">Sign In</a>
            </div>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="marketing-footer">
          <p>2024 Acme Inc. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}

// app/(marketing)/page.js -> URL: /
export default function LandingPage() {
  return (
    <div className="hero">
      <h1>Build Better Products</h1>
      <p>The all-in-one platform for modern teams.</p>
      <a href="/dashboard" className="cta-button">Get Started</a>
    </div>
  );
}

// app/(marketing)/about/page.js -> URL: /about
export default function AboutPage() {
  return <h1>About Acme</h1>;
}

// app/(marketing)/pricing/page.js -> URL: /pricing
export default function PricingPage() {
  return <h1>Pricing Plans</h1>;
}

// app/(platform)/layout.js
export const metadata = {
  title: {
    template: '%s | Acme Dashboard',
    default: 'Dashboard'
  }
};

export default function PlatformLayout({ children }) {
  return (
    <html lang="en">
      <body className="platform-theme">
        <div className="app-shell">
          <aside className="sidebar">
            <nav>
              <a href="/dashboard">Dashboard</a>
              <a href="/settings">Settings</a>
            </nav>
          </aside>
          <main className="app-main">{children}</main>
        </div>
      </body>
    </html>
  );
}

// app/(platform)/dashboard/page.js -> URL: /dashboard
export default function DashboardPage() {
  return <h1>Dashboard</h1>;
}

// app/(platform)/settings/page.js -> URL: /settings
export default function SettingsPage() {
  return <h1>Settings</h1>;
}`,
      explanation: "Two route groups with separate root layouts. (marketing) has a full-width layout with header and footer. (platform) has a sidebar layout. Each has its own <html>/<body> tags, so they can have different styles and metadata. Trade-off: navigating between them (e.g., / to /dashboard) causes a full page reload because the HTML shell changes. Within each group, navigation is smooth."
    }
  ],
  quiz: [
    {
      question: "Which file in the App Router creates an automatic Suspense boundary for streaming?",
      options: [
        "loading.js",
        "error.js",
        "template.js",
        "default.js"
      ],
      correct: 0,
      explanation: "loading.js wraps the page in a React Suspense boundary. While the page fetches data, loading.js content shows as the fallback. This enables streaming SSR -- the layout shell sends instantly while page content streams in."
    },
    {
      question: "What happens if error.js throws an error at the same segment level as layout.js?",
      options: [
        "The error boundary catches the layout error",
        "The error bubbles up to the parent segment's error boundary",
        "Next.js shows a default error page",
        "The application crashes with an unhandled error"
      ],
      correct: 1,
      explanation: "error.js cannot catch layout errors at the same level because the error boundary sits below the layout in the tree (Layout > ErrorBoundary > Page). Layout errors bubble up to the parent segment's error.js. For root layout errors, use global-error.js."
    },
    {
      question: "What does the (.) convention mean in intercepting routes?",
      options: [
        "Intercept from the root of the application",
        "Intercept at the same route segment level",
        "Intercept one level up in the route hierarchy",
        "Intercept only on hard navigation"
      ],
      correct: 1,
      explanation: "(.) means intercept at the same level. (..) means one level up, (..)(..) means two levels up, and (...) means from the root. These mirror relative path resolution."
    },
    {
      question: "In a parallel route setup, what happens when a slot has no matching page and no default.js?",
      options: [
        "The slot renders an empty div",
        "The slot renders the nearest layout",
        "Next.js returns a 404 for that slot",
        "The entire page fails to render"
      ],
      correct: 2,
      explanation: "Without default.js, an unmatched parallel route slot shows a 404. Always include default.js in parallel route slots to provide fallback content."
    },
    {
      question: "What is the key behavioral difference between layout.js and template.js?",
      options: [
        "template.js cannot have children, layout.js can",
        "layout.js persists and preserves state across navigations, template.js re-mounts on every navigation",
        "template.js only works with Server Components",
        "layout.js is cached, template.js is not"
      ],
      correct: 1,
      explanation: "layout.js persists across navigations -- state, effects, and DOM are preserved. template.js re-mounts every navigation -- state resets, effects re-run. Use template.js for enter/exit animations or resetting form state."
    }
  ]
};
