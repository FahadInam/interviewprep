export const layoutsMetadata = {
  id: "layouts-metadata",
  title: "Layouts & Metadata",
  icon: "📐",
  tag: "Next.js",
  tagColor: "var(--tag-next)",
  subtitle: "Nested layouts, metadata API, and SEO optimization",
  concepts: [
    {
      title: "Root Layout vs Nested Layouts",
      explanations: {
        layman: "Picture a set of Russian nesting dolls. The biggest doll is your root layout -- it wraps the entire site with things like the navigation bar and footer. Inside that sits a smaller doll, like a dashboard layout that adds a sidebar. Inside that might be a settings layout that adds a tab bar. Each doll stays in place when you navigate -- only the innermost content (the page) swaps out. So when you click from Settings > General to Settings > Security, the outer dolls (navbar, sidebar, tab bar) never move. Only the content inside the smallest doll changes.",
        mid: "The root layout (app/layout.js) is required and wraps the entire application. It must include <html> and <body> tags. Nested layouts (e.g., app/dashboard/layout.js) wrap all pages within their route segment. The critical feature: layouts are preserved across navigation. When a user navigates from /dashboard/analytics to /dashboard/settings, the dashboard layout (sidebar, header) doesn't re-render — only the page content swaps. This enables shared UI patterns like persistent navigation, sidebars, and audio/video players. Layouts receive a children prop containing the page or nested layout. Each route segment can have its own layout, and they nest automatically.",
        senior: "Layouts are Server Components by default and rendered once per navigation lifecycle. They persist in the React component tree and are NOT re-mounted when navigating between pages in the same segment — React preserves the fiber node. This means useState in a layout persists across child page navigations (if the layout is a Client Component). The root layout is special: it's the only place to define document-level HTML (charset, viewport meta), and it wraps the entire RSC tree. During streaming SSR, the root layout's HTML shell is sent first, and page content streams in within Suspense boundaries. A production consideration: heavy client-side state in layouts (like theme context or toast containers) persists across navigations, which is usually desired but can cause memory leaks if not cleaned up. Parallel routes (@slot) and intercepting routes ((..)route) interact with layouts — a modal intercepting route renders inside the parent layout alongside the slot."
      },
      realWorld: "A SaaS app has a root layout with the global navbar and theme provider. The /dashboard layout adds a sidebar and breadcrumbs. The /dashboard/settings layout adds a settings-specific sub-navigation. Each nests within the parent, creating a consistent shell that persists while page content changes.",
      whenToUse: "Use layouts for any UI that should persist across navigation within a route group: navigation bars, sidebars, footer, audio/video players, breadcrumbs, and context providers. Use the root layout for global elements: fonts, themes, analytics scripts.",
      whenNotToUse: "Don't use layouts for UI that should reset on every navigation — use template.js instead. Don't put page-specific data fetching in layouts (it runs for every child page). Don't make the root layout a Client Component unnecessarily — keep it a Server Component and wrap only the interactive parts with Client Component wrappers.",
      pitfalls: "Layouts can't access the current pathname directly (use usePathname in a Client Component child). Layouts don't re-render when navigating between child pages, so data fetched in a layout won't refresh automatically — this is a feature, not a bug, but can cause stale UI if not understood. You cannot pass data from a layout to its children via props — use server-side data patterns or React context instead. Removing a layout.js file and expecting pages to stop sharing UI — they'll fall back to the parent layout.",
      codeExamples: [
        {
          title: "Root Layout with Global Providers",
          code: `// app/layout.js — Required root layout
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: { default: "My App", template: "%s | My App" },
  description: "A production Next.js application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system">
          <main>{children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}`
        },
        {
          title: "Nested Dashboard Layout with Persistent Sidebar",
          code: `// app/dashboard/layout.js
import { Sidebar } from "@/components/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-main">
        <DashboardHeader />
        <div className="dashboard-content">
          {children}
        </div>
      </div>
    </div>
  );
}

// Navigation between /dashboard/analytics and /dashboard/settings
// keeps the Sidebar and DashboardHeader mounted — only {children} changes`
        }
      ]
    },
    {
      title: "template.js vs layout.js — When Layouts Should Reset",
      explanations: {
        layman: "A layout is like a picture frame that stays on the wall — you swap the photo inside but the frame never moves. A template is like a greeting card envelope — every time you open a new card, you get a completely fresh envelope too. Templates re-create themselves on every navigation, while layouts persist.",
        mid: "template.js has the same API as layout.js (receives a children prop, wraps child pages), but with one crucial difference: templates create a new instance on EVERY navigation. When a user navigates between sibling routes, the template component unmounts and remounts, resetting all state, effects, and DOM. This means: useState resets, useEffect cleanup runs then re-runs, animations restart, and form inputs clear. Templates sit between the layout and the page in the component hierarchy: layout.js > template.js > page.js.",
        senior: "Under the hood, layout.js components maintain their fiber node in the React tree across navigations — React reconciles them as the same component instance. template.js components are given a unique key based on the route segment, forcing React to treat each navigation as a completely new component (unmount old, mount new). This has implications for: (1) Enter/exit animations — template remounts trigger CSS/Framer Motion enter animations on every page change. (2) Feature tracking — useEffect in a template runs on every page view, useful for page-view analytics. (3) Per-page state isolation — form state in a template won't leak between pages. (4) Performance — templates add overhead because they unmount/remount the entire subtree, including all child components. Use them sparingly."
      },
      realWorld: "An enter animation that plays on every page transition (template remounts trigger the animation). Per-page analytics tracking via useEffect in a template. A wizard form where each step should start fresh, not preserve the previous step's state.",
      whenToUse: "Use template.js when you need a fresh component instance on every navigation: enter/exit animations, per-page analytics/logging, forms that must reset between pages, or components that depend on useEffect running on each navigation.",
      whenNotToUse: "Don't use templates as a default — layouts are correct 90% of the time. Don't use templates for persistent UI (navbars, sidebars) — they'd remount and flash on every navigation. Don't use templates for components with expensive initialization (heavy state setup, large data fetches).",
      pitfalls: "Using template.js when you mean layout.js causes unnecessary remounts, visual flashes, and performance degradation. Templates reset ALL child state — not just the template's own state. If a template wraps a complex form, the entire form resets on navigation. You can have both layout.js and template.js in the same directory — layout wraps template wraps page.",
      codeExamples: [
        {
          title: "Template with Page Transition Animation",
          code: `// app/dashboard/template.js
"use client";
import { motion } from "framer-motion";

export default function DashboardTemplate({ children }) {
  // This component remounts on every navigation
  // triggering the enter animation each time
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

// Component hierarchy:
// app/dashboard/layout.js (persists — sidebar stays)
//   > app/dashboard/template.js (remounts — animation replays)
//     > app/dashboard/[page]/page.js (new content)`
        },
        {
          title: "Template for Per-Page Analytics",
          code: `// app/template.js
"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

export default function AnalyticsTemplate({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    // Runs on every navigation because template remounts
    trackPageView(pathname);
  }, [pathname]);

  return children;
}`
        }
      ]
    },
    {
      title: "Metadata API — Static and Dynamic Metadata",
      explanations: {
        layman: "When you share a link on social media, that preview card with the title, description, and image comes from metadata. The Metadata API is like filling out a form for each page that tells search engines and social media what the page is about. Static metadata is like printing a business card ahead of time — it's fixed. Dynamic metadata is like customizing a nametag at a conference based on who's attending.",
        mid: "Next.js provides two ways to define metadata per route segment. Static metadata: export a metadata object with title, description, openGraph, icons, etc. Dynamic metadata: export an async generateMetadata function that receives the route params and searchParams, letting you fetch data and return metadata based on it (e.g., a blog post title from the database). Metadata is automatically deduped and merged — child segments override parent metadata for the same fields. The title.template feature lets you define a pattern like '%s | My Site' in the root layout, and child pages only need to set their specific title.",
        senior: "Metadata resolution follows a bottom-up merge strategy: each route segment's metadata is collected, and child fields override parent fields (shallow merge per metadata field). The title field has special template behavior: a parent's title.template is applied to child title.default or direct string titles. generateMetadata receives the same params and searchParams as the page component, and its fetch requests are automatically deduped with the page's fetches (if the same URL/options are used). Critically, generateMetadata blocks the page from streaming until it resolves — this ensures <head> tags are sent before body content. For performance, keep generateMetadata fast and avoid unnecessary async work. The metadata API also supports file-based conventions: opengraph-image.js, twitter-image.js, icon.js can export dynamic image generation functions using ImageResponse (uses Satori for SVG-based OG image generation)."
      },
      realWorld: "A blog where each post has unique title, description, and OG image generated from the post content. An e-commerce site where product pages have structured data (JSON-LD) for rich search results. A multi-tenant app where each tenant's branding appears in metadata.",
      whenToUse: "Use static metadata for pages with fixed content (home, about, contact). Use generateMetadata for dynamic pages where metadata depends on route params (blog posts, product pages, user profiles). Use metadata templates for consistent title formatting across the site.",
      whenNotToUse: "Don't put all metadata in the root layout — it will be the same for every page. Don't use generateMetadata for static pages where a simple metadata export suffices. Don't generate OG images in generateMetadata if they're expensive — use ISR or static generation for them.",
      pitfalls: "Metadata from layouts applies to ALL child pages — be careful with overly specific descriptions in layouts. generateMetadata blocks streaming, so slow database queries in it delay the entire page. The metadata object doesn't accept arbitrary HTML — use the other metadata fields or a viewport export for viewport meta tags. Forgetting to set the title.template in the root layout means every page needs the full title including the site name.",
      codeExamples: [
        {
          title: "Static Metadata with Title Template",
          code: `// app/layout.js
export const metadata = {
  title: {
    default: "Acme Store",
    template: "%s | Acme Store",
  },
  description: "The best e-commerce experience",
  metadataBase: new URL("https://acme.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Acme Store",
  },
};

// app/products/page.js
export const metadata = {
  title: "All Products", // Renders as "All Products | Acme Store"
  description: "Browse our complete product catalog",
};

// app/about/page.js
export const metadata = {
  title: "About Us", // Renders as "About Us | Acme Store"
};`
        },
        {
          title: "Dynamic Metadata with generateMetadata",
          code: `// app/blog/[slug]/page.js
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = await getPost(slug); // Deduped with generateMetadata
  if (!post) notFound();

  return <article>{/* render post */}</article>;
}`
        }
      ]
    },
    {
      title: "Open Graph, SEO, and Structured Data",
      explanations: {
        layman: "When Google shows your website in search results, it uses SEO metadata to decide what title and description to display. When you share a link on Twitter or Facebook, Open Graph tags control what that preview card looks like — the image, title, and description. Structured data is like giving Google a detailed resume of your page so it can show rich results (star ratings, prices, FAQ sections) instead of plain blue links.",
        mid: "Open Graph (og:title, og:description, og:image) controls social media link previews. Twitter has its own card format (twitter:card, twitter:title, twitter:image). Next.js metadata API maps these directly: openGraph and twitter objects in the metadata export. For SEO, the key fields are title, description, robots (indexing directives), and alternates (canonical URLs, language variants). Structured data (JSON-LD) provides machine-readable content descriptions using schema.org vocabulary. You inject it via a <script type='application/ld+json'> tag in your page component. Next.js doesn't have a built-in JSON-LD API, but you can render it as part of your page JSX.",
        senior: "Production SEO in Next.js requires layered optimization: (1) Technical SEO — proper canonical URLs via metadata.alternates.canonical, robots.txt via app/robots.js, sitemap.xml via app/sitemap.js (can be dynamic with generateSitemaps for large sites). (2) OG images — use Next.js ImageResponse (Satori-based) in opengraph-image.js for dynamic OG images rendered at build time or on-demand. (3) Structured data — inject JSON-LD for articles, products, FAQ, breadcrumbs, etc. Use the schema-dts library for type safety. (4) Performance — Core Web Vitals directly impact SEO rankings. Streaming SSR ensures fast FCP/LCP. (5) Edge cases — handle trailing slashes consistently, manage pagination metadata, set appropriate cache headers for crawlers. The metadataBase setting is critical — it resolves relative URLs in OG images and canonical links to absolute URLs."
      },
      realWorld: "A recipe site with JSON-LD structured data showing cook time, rating, and ingredients in Google search results. An e-commerce product page with OG images showing the product photo, price, and rating for social sharing. A blog with canonical URLs preventing duplicate content issues across syndication.",
      whenToUse: "Use Open Graph and Twitter cards on every page that might be shared socially. Use structured data on content pages (articles, products, recipes, events) to qualify for rich search results. Use canonical URLs on every page to prevent duplicate content.",
      whenNotToUse: "Don't add structured data for page types that don't match any schema.org type. Don't set noindex on pages you want indexed (sounds obvious, but it's a common mistake during staging). Don't generate OG images for every page if they're all identical — use a default.",
      pitfalls: "Missing metadataBase causes relative OG image URLs that social platforms can't resolve. OG images must be absolute URLs with proper dimensions (1200x630 recommended). JSON-LD errors (invalid schema) silently fail — use Google's Rich Results Test to validate. Setting robots: { index: false } in a layout accidentally noindexes all child pages. Forgetting to set a canonical URL on paginated pages causes duplicate content issues.",
      codeExamples: [
        {
          title: "JSON-LD Structured Data for a Product Page",
          code: `// app/products/[id]/page.js
export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.image, width: 1200, height: 630 }],
    },
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);

  // JSON-LD structured data for rich search results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="product-page">
        <h1>{product.name}</h1>
        <p>\${product.price}</p>
      </div>
    </>
  );
}`
        },
        {
          title: "Dynamic Sitemap and Robots.txt",
          code: `// app/sitemap.js
export default async function sitemap() {
  const posts = await db.post.findMany({
    select: { slug: true, updatedAt: true },
  });

  const postUrls = posts.map((post) => ({
    url: \`https://acme.com/blog/\${post.slug}\`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: "https://acme.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://acme.com/about",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...postUrls,
  ];
}

// app/robots.js
export default function robots() {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    ],
    sitemap: "https://acme.com/sitemap.xml",
  };
}`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "How do layouts work in the Next.js App Router, and what makes them different from wrapping components manually?",
      answer: "Layouts are components defined in layout.js that wrap all pages within their route segment. The critical difference from manually wrapping components: layouts persist across navigation. When you go from /dashboard/analytics to /dashboard/settings, the dashboard layout stays mounted -- React keeps it alive and only swaps the page content inside. This means: no sidebar flicker, scroll position is maintained, and client-side state (like a search input value) survives navigation. If you manually wrapped components instead, they would unmount and remount on every navigation, losing all state. Layouts also nest automatically. A root layout wraps a dashboard layout, which wraps a settings layout, which wraps the page. Each layer persists independently, and only the innermost changing piece re-renders.",
      difficulty: "easy",
      followUps: [
        "Can a layout access the current URL pathname?",
        "What happens to layout state when navigating between child pages?"
      ]
    },
    {
      question: "Explain the difference between template.js and layout.js. Give a concrete use case for template.js.",
      answer: "Both wrap child pages, but layout.js persists across navigations (same component instance) while template.js creates a new instance on every navigation (unmounts and remounts). This means template.js resets all React state, re-runs useEffect, and triggers mount animations. Concrete use case: page transition animations. Wrap pages in a template.js with Framer Motion's initial/animate props — every navigation triggers the enter animation because the template remounts. Another use case: per-page analytics tracking via useEffect in a template — it fires on every page change because the component remounts. A layout would only run useEffect once.",
      difficulty: "mid",
      followUps: [
        "Can you have both layout.js and template.js in the same route segment?",
        "What's the rendering order: layout, template, or page first?"
      ]
    },
    {
      question: "How does the Metadata API handle merging between parent and child route segments?",
      answer: "Metadata merges using a shallow merge strategy from parent to child. Each metadata field (title, description, openGraph, etc.) in a child segment overrides the same field from the parent. Nested objects like openGraph are also shallow-merged — child openGraph fields override parent openGraph fields. The title field has special template behavior: a parent can define title.template: '%s | My Site', and child pages only set their specific title string, which gets interpolated into the template. generateMetadata in child segments completely overrides parent metadata for the same fields. Importantly, metadata defined in a layout applies to ALL pages in that segment, so be cautious with specific descriptions in layouts.",
      difficulty: "mid",
      followUps: [
        "What happens if a child doesn't define a title but the parent has a title.template?",
        "Can metadata be conditionally set based on the page's data?"
      ]
    },
    {
      question: "How would you implement dynamic OG images in Next.js?",
      answer: "Use the file-based convention: create an opengraph-image.js file in the route directory that exports a default function returning an ImageResponse. ImageResponse uses Satori (a library that converts JSX to SVG) to render the image on the server. For dynamic content, the function receives the route params and can fetch data to customize the image. For example, a blog post's OG image could display the post title, author name, and a gradient background. The image is generated at request time (or build time for static routes) and cached. You can also use opengraph-image.png for static images. The generated URL is automatically added to the page's <meta> tags.",
      difficulty: "hard",
      followUps: [
        "How do you test OG images during development?",
        "What are the performance implications of dynamic OG image generation?"
      ]
    },
    {
      question: "What is structured data (JSON-LD), and how do you implement it in Next.js App Router?",
      answer: "JSON-LD (JavaScript Object Notation for Linked Data) is a structured data format using schema.org vocabulary that helps search engines understand page content. It enables rich search results: star ratings, prices, FAQ accordions, recipe details. In Next.js, render a <script type='application/ld+json'> tag with the JSON-LD object in your page component using dangerouslySetInnerHTML. There's no built-in metadata field for JSON-LD, so it goes in the JSX return. For type safety, use the schema-dts library. The data should match the page content exactly — Google can penalize mismatched structured data. Always validate with Google's Rich Results Test tool.",
      difficulty: "mid",
      followUps: [
        "Can JSON-LD be placed in a layout to apply to all child pages?",
        "What schema.org types are most valuable for SEO?"
      ]
    },
    {
      question: "A Next.js app has stale titles appearing on social media shares despite updating metadata. How do you debug and fix this?",
      answer: "Social media platforms aggressively cache OG metadata. Steps: (1) Check that generateMetadata returns correct data by viewing the page source. (2) Verify metadataBase is set correctly — relative OG image URLs won't resolve without it. (3) Use platform-specific debug tools: Facebook Sharing Debugger (developers.facebook.com/tools/debug) and Twitter Card Validator to force cache refresh. (4) Check if the metadata is being overridden by a parent layout's metadata. (5) Verify the OG image URL is absolute and accessible (not behind auth). (6) Check if the page is cached by a CDN — the HTML itself might be stale, serving old metadata. Use revalidateTag or revalidatePath to refresh. (7) Ensure generateMetadata isn't returning early due to a failed data fetch.",
      difficulty: "hard",
      followUps: [
        "How long do social platforms typically cache OG metadata?",
        "How do you handle OG metadata for pages behind authentication?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Build a Multi-Level Layout System",
      difficulty: "mid",
      description: "Create a layout hierarchy for a SaaS app: root layout (navbar + theme), dashboard layout (sidebar + breadcrumbs), and settings layout (settings sub-nav). Each layout should be a Server Component that fetches its own data.",
      solution: `// app/layout.js — Root layout
import { Inter } from "next/font/google";
import { Navbar } from "@/components/navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: { default: "SaaS App", template: "%s | SaaS App" },
  description: "Enterprise SaaS Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}

// app/dashboard/layout.js — Dashboard layout with sidebar
import { Sidebar } from "@/components/sidebar";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default async function DashboardLayout({ children }) {
  // Fetch sidebar navigation items
  const navItems = await fetch("https://api.example.com/nav", {
    next: { tags: ["navigation"] },
  }).then((r) => r.json());

  return (
    <div className="flex">
      <Sidebar items={navItems} />
      <div className="flex-1">
        <Breadcrumbs />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

// app/dashboard/settings/layout.js — Settings sub-nav
const settingsNav = [
  { label: "General", href: "/dashboard/settings" },
  { label: "Security", href: "/dashboard/settings/security" },
  { label: "Billing", href: "/dashboard/settings/billing" },
  { label: "Team", href: "/dashboard/settings/team" },
];

export default function SettingsLayout({ children }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="flex gap-6">
        <nav className="w-48 space-y-1">
          {settingsNav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block p-2 rounded hover:bg-gray-100"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

// app/dashboard/settings/page.js
export const metadata = { title: "General Settings" };

export default function GeneralSettings() {
  return <div><h2>General Settings</h2>{/* form content */}</div>;
}

// app/dashboard/settings/security/page.js
export const metadata = { title: "Security Settings" };

export default function SecuritySettings() {
  return <div><h2>Security Settings</h2>{/* form content */}</div>;
}`,
      explanation: "Three layout levels nest automatically. The root layout provides the global navbar. The dashboard layout adds a sidebar (with server-fetched nav data) and breadcrumbs. The settings layout adds a sub-navigation specific to settings pages. Navigating between security and billing settings only re-renders the page content — all three layouts persist. Each page sets its own metadata title, which gets the template from the root layout."
    },
    {
      title: "Dynamic generateMetadata with Fallbacks",
      difficulty: "mid",
      description: "Build a blog post page with comprehensive generateMetadata that handles missing data gracefully, generates proper OG tags, and includes JSON-LD structured data.",
      solution: `// app/blog/[slug]/page.js
import { notFound } from "next/navigation";
import { cache } from "react";

const getPost = cache(async (slug) => {
  const res = await fetch(\`https://api.example.com/posts/\${slug}\`, {
    next: { tags: [\`post-\${slug}\`], revalidate: 3600 },
  });
  if (!res.ok) return null;
  return res.json();
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested blog post could not be found.",
      robots: { index: false },
    };
  }

  const ogImageUrl = post.coverImage
    || \`https://acme.com/api/og?title=\${encodeURIComponent(post.title)}\`;

  return {
    title: post.title,
    description: post.excerpt || post.content.slice(0, 160),
    authors: [{ name: post.author.name }],
    alternates: {
      canonical: \`https://acme.com/blog/\${slug}\`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImageUrl],
      creator: post.author.twitterHandle,
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getPost(slug); // Deduped — same call as generateMetadata
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.author.name,
      url: post.author.url,
    },
    publisher: {
      "@type": "Organization",
      name: "Acme Blog",
      logo: { "@type": "ImageObject", url: "https://acme.com/logo.png" },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": \`https://acme.com/blog/\${slug}\`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>
        <h1>{post.title}</h1>
        <p className="meta">
          By {post.author.name} on {new Date(post.publishedAt).toLocaleDateString()}
        </p>
        <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
      </article>
    </>
  );
}`,
      explanation: "generateMetadata fetches the same post data as the page (deduped by React cache). It handles missing posts by returning noindex metadata. OG images fall back to a dynamic OG image API if no cover image exists. The canonical URL is set explicitly. JSON-LD BlogPosting schema is injected in the page for rich search results. Both generateMetadata and the page use the cached getPost function."
    },
    {
      title: "Template.js for Page Transition Animations",
      difficulty: "easy",
      description: "Create a template.js that animates page transitions using CSS, without requiring any external animation libraries.",
      solution: `// app/dashboard/template.js
"use client";
import { useEffect, useState } from "react";
import "./transitions.css";

export default function AnimatedTemplate({ children }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation after mount
    const timer = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div className={\`page-transition \${isVisible ? "page-enter-active" : "page-enter"}\`}>
      {children}
    </div>
  );
}

// app/dashboard/transitions.css
/*
.page-transition {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-enter {
  opacity: 0;
  transform: translateY(12px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
}
*/

// Because this is a template.js (not layout.js),
// it remounts on EVERY navigation between dashboard pages.
// This means:
// 1. useState(false) resets — animation starts from invisible
// 2. useEffect runs — triggers the enter animation
// 3. The user sees a smooth fade-in slide-up on every page change`,
      explanation: "The template remounts on every navigation, resetting the isVisible state to false. After mount, useEffect triggers the CSS transition by setting isVisible to true. This creates a smooth fade-in animation on every page change without any animation library. A layout.js would only animate on first mount since it persists across navigation."
    }
  ],
  quiz: [
    {
      question: "What happens to a layout's React state when navigating between its child pages?",
      options: [
        "State is reset on every navigation",
        "State is preserved because the layout doesn't remount",
        "State is serialized to the URL and restored",
        "State is lost unless you use a state management library"
      ],
      correct: 1,
      explanation: "Layouts persist across navigation — they don't unmount when you navigate between child pages. This means any client-side state (useState, useRef, etc.) is preserved. This is why sidebars, search inputs, and media players in layouts work seamlessly across page changes."
    },
    {
      question: "Which file creates a new component instance on every navigation?",
      options: [
        "layout.js — it wraps children with a fresh wrapper",
        "page.js — every page is a new instance",
        "template.js — it unmounts and remounts on navigation",
        "loading.js — it recreates the loading state each time"
      ],
      correct: 2,
      explanation: "template.js creates a new instance on every navigation. Unlike layout.js which persists, template.js unmounts and remounts, resetting all state and re-running effects. This is useful for enter animations, per-page analytics, and form resets."
    },
    {
      question: "How does the title.template metadata feature work?",
      options: [
        "It generates a title from the page's content automatically",
        "Parent defines a pattern like '%s | Site Name' and child pages fill in the %s",
        "It creates a different title for each viewport size",
        "It's a TypeScript template literal type for title validation"
      ],
      correct: 1,
      explanation: "The parent layout defines title.template (e.g., '%s | My Site'), and child pages set their own title string. The %s is replaced with the child's title. So a child with title: 'About' renders as 'About | My Site'. This ensures consistent title formatting without repeating the site name in every page."
    },
    {
      question: "When does generateMetadata execute relative to the page component?",
      answer: "It executes before the page",
      options: [
        "After the page component renders, to optimize streaming",
        "Before the page, blocking streaming until metadata resolves",
        "In parallel with the page component for performance",
        "Only at build time, never at request time"
      ],
      correct: 1,
      explanation: "generateMetadata blocks streaming — it must resolve before the <head> tags can be sent to the browser. This ensures metadata is available before any body content streams in. This is why you should keep generateMetadata fast and avoid expensive operations in it."
    },
    {
      question: "What is the recommended way to add JSON-LD structured data in the App Router?",
      options: [
        "Export it from the metadata object's jsonLd field",
        "Use the generateJsonLd function in a separate file",
        "Render a <script type='application/ld+json'> tag in the page's JSX",
        "Add it to the head via the Head component from next/head"
      ],
      correct: 2,
      explanation: "There's no built-in metadata field for JSON-LD. Render it as a <script type='application/ld+json'> tag directly in your page component's JSX using dangerouslySetInnerHTML. The next/head component is from the Pages Router and doesn't work in the App Router."
    }
  ]
};
