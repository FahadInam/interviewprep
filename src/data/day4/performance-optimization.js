export const performanceOptimization = {
  id: "performance-optimization",
  title: "Performance Optimization",
  icon: "⚡",
  tag: "System Design",
  tagColor: "var(--tag-system)",
  subtitle: "Code splitting, lazy loading, bundle optimization, runtime performance, and network strategies",
  concepts: [
    {
      title: "Code Splitting Strategies",
      explanations: {
        layman: "When you visit a website, your browser downloads all the JavaScript needed to run it. Without code splitting, that is like downloading an entire Netflix catalog just to watch one movie. Code splitting breaks your app into smaller pieces and only downloads the piece the user needs right now. On the homepage? Download homepage code only. Click Settings? Download settings code then. The result: the page loads much faster because the browser does less work upfront.",
        mid: "Code splitting breaks your bundle into smaller chunks loaded on demand. Three main strategies: 1) Route-based — each route is a separate chunk, loaded when the user navigates (most impactful, easiest). 2) Component-based — heavy components (rich text editors, chart libraries, modals) are split into their own chunks, loaded when rendered. 3) Vendor splitting — separate third-party libraries into their own chunk that changes less frequently (better caching). Webpack/Vite handle splitting via dynamic import() which returns a promise. React.lazy() wraps dynamic imports for component-level splitting. The key metric is Time to Interactive (TTI) — smaller initial bundles mean faster TTI.",
        senior: "Code splitting strategy must align with your application's usage patterns. Route-based splitting is table stakes — every modern bundler does this by default with framework routers. The deeper decisions: 1) Granularity tradeoff — too few chunks = large initial download; too many = request waterfall (each chunk is an HTTP request). Use bundle analysis to find the sweet spot. 2) Preloading strategy — split aggressively but preload predictable next chunks (prefetch links the user is likely to click, preload components the route will definitely need). 3) Shared chunk optimization — if Page A and Page B both import Chart.js, the bundler should extract it into a shared chunk, not duplicate it. Configure splitChunks.cacheGroups in Webpack for this. 4) Critical vs non-critical — split below-the-fold content, analytics scripts, A/B testing libraries into deferred chunks. The initial chunk should contain only what's needed for First Contentful Paint. 5) Dynamic feature flags — conditionally import feature code based on flags: if (!featureFlags.experimentalEditor) skip loading the heavy editor chunk entirely. 6) Module Federation for micro-frontends enables cross-application code splitting at the architecture level."
      },
      realWorld: "An e-commerce site splits by route (homepage, PDP, cart, checkout), then further splits heavy components within routes: the product image zoom library (200KB) loads only when the user hovers on the image. The rich text review editor loads only when the user clicks 'Write a Review.' Vendor libraries (React, Lodash) are in a separate cached chunk. This reduced the initial JS from 1.8MB to 280KB, cutting TTI from 6s to 2.1s.",
      whenToUse: "Always split by route at minimum. Split large components (>50KB) that aren't needed immediately. Split vendor libraries that change infrequently. Split feature-flagged code that only a subset of users see.",
      whenNotToUse: "Don't split tiny components — the overhead of an additional HTTP request negates the savings. Don't split code that's always needed on every page (core UI shell, auth). Very small apps (<100KB total) don't benefit enough to justify the complexity.",
      pitfalls: "Loading waterfall — chunk A loads, which triggers chunk B, which triggers chunk C. Prefetch to parallelize. Flash of loading state — too many lazy boundaries create a janky experience; batch related code into the same chunk. Not analyzing bundles — you can't optimize what you don't measure; use webpack-bundle-analyzer or vite-plugin-visualizer regularly. SSR complications — dynamic imports work differently on the server; use loadable-components or framework-specific solutions.",
      codeExamples: [
        {
          title: "Route-Based and Component-Based Code Splitting",
          code: `import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Route-based splitting — each route is a separate chunk
const Home = lazy(() => import(/* webpackChunkName: "home" */ './pages/Home'));
const Products = lazy(() => import(/* webpackChunkName: "products" */ './pages/Products'));
const ProductDetail = lazy(() => import(/* webpackChunkName: "product-detail" */ './pages/ProductDetail'));
const Cart = lazy(() => import(/* webpackChunkName: "cart" */ './pages/Cart'));
const Checkout = lazy(() => import(/* webpackChunkName: "checkout" */ './pages/Checkout'));

// Prefetch on hover for instant navigation
function prefetchRoute(importFn) {
  return () => { importFn(); };
}

function AppRouter() {
  return (
    <BrowserRouter>
      <nav>
        <a href="/products" onMouseEnter={prefetchRoute(() => import('./pages/Products'))}>
          Products
        </a>
      </nav>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

// Component-based splitting within a route
function ProductDetail({ product }) {
  const [showReviewEditor, setShowReviewEditor] = useState(false);

  // Heavy editor only loads when user clicks "Write Review"
  const ReviewEditor = lazy(() =>
    import(/* webpackChunkName: "review-editor" */ './components/ReviewEditor')
  );

  return (
    <div>
      <h1>{product.name}</h1>
      <ProductImages images={product.images} />
      <button onClick={() => setShowReviewEditor(true)}>Write a Review</button>
      {showReviewEditor && (
        <Suspense fallback={<div>Loading editor...</div>}>
          <ReviewEditor productId={product.id} />
        </Suspense>
      )}
    </div>
  );
}`
        },
        {
          title: "Webpack splitChunks Configuration",
          code: `// webpack.config.js — Optimized chunk splitting
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 10,
      minSize: 20_000,
      cacheGroups: {
        // Vendor chunk — rarely changes, cached long-term
        vendor: {
          test: /[\\\\/]node_modules[\\\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 20,
        },
        // React ecosystem — very stable, separate cache
        react: {
          test: /[\\\\/]node_modules[\\\\/](react|react-dom|react-router)[\\\\/]/,
          name: 'react-vendor',
          chunks: 'all',
          priority: 30,
        },
        // Shared code used by multiple routes
        common: {
          minChunks: 2,
          name: 'common',
          chunks: 'all',
          priority: 10,
          reuseExistingChunk: true,
        },
      },
    },
  },
};`
        }
      ]
    },
    {
      title: "Lazy Loading",
      explanations: {
        layman: "Think of a newspaper website. If every article's images loaded when you opened the homepage, you'd wait minutes and waste data on pictures you'd never scroll down to see. Instead, images load as you scroll near them — that's lazy loading. It's like a smart waiter who only brings your appetizer first, then your main course when you're almost done, rather than stacking everything on the table at once. This applies to images, components, even entire sections of a page.",
        mid: "Lazy loading defers loading non-critical resources until they're needed. Types: 1) Image lazy loading — native loading='lazy' attribute or IntersectionObserver for custom behavior. Browser-native support makes this nearly free. 2) Component lazy loading — React.lazy() + Suspense for below-the-fold components, modals, tabs that aren't initially visible. 3) Route lazy loading — dynamic import() for route components (covered in code splitting). 4) Data lazy loading — infinite scroll or 'load more' patterns that fetch data as the user scrolls. IntersectionObserver is the key API — it efficiently detects when elements enter the viewport without scroll event listeners (which cause layout thrashing).",
        senior: "Lazy loading at production scale requires thinking about the entire loading experience: 1) Priority-based loading — critical above-the-fold images should NOT be lazy-loaded (they're needed for LCP); below-the-fold images should be. Use fetchpriority='high' for hero images and loading='lazy' for everything else. 2) Placeholder strategy — layout shift (CLS) is a consequence of lazy loading if dimensions aren't reserved. Use aspect-ratio boxes, blur-up placeholders (tiny base64 preview), or skeleton screens. 3) Progressive loading for images — serve low-quality placeholder first (LQIP), then load the full resolution. Modern formats (WebP, AVIF) with srcset provide responsive image loading. 4) Virtualization for lists — if you have 10,000 items, don't even create DOM nodes for off-screen items. Use react-window or react-virtuoso. This isn't lazy loading — it's virtual rendering, and it's far more performant for long lists than lazy loading individual items. 5) Module preloading — after the page loads, prefetch modules the user is likely to need next (next page, common modals). requestIdleCallback or link rel='prefetch' in the document head."
      },
      realWorld: "An image-heavy social media feed uses native lazy loading for images with blur-up placeholders (tiny 20px base64 thumbnails that blur-expand while the full image loads). The feed itself is virtualized using react-virtuoso — only ~20 posts exist in the DOM at any time, even if the user has scrolled through 500. Comment sections are lazy-loaded components that fetch data and render only when the user clicks 'Show comments.' This keeps initial load under 200KB of JS and achieves consistent 60fps scrolling.",
      whenToUse: "Lazy load all below-the-fold images. Lazy load heavy components that aren't immediately visible (modals, tabs, drawers, below-fold sections). Virtualize lists with >100 items. Prefetch resources the user is likely to need next.",
      whenNotToUse: "Don't lazy load above-the-fold hero images — they're critical for LCP. Don't lazy load small, lightweight components — the overhead of Suspense/loading boundaries isn't worth it. Don't virtualize short lists (<50 items) — the complexity isn't justified.",
      pitfalls: "Lazy loading images without setting dimensions causes CLS (Cumulative Layout Shift) as images pop in and push content around. Over-eagerly lazy loading makes the user wait for things that should be ready immediately. Scroll-based data fetching without proper debouncing fires too many requests. Virtualized lists break Ctrl+F (browser search) since items don't exist in the DOM — provide an alternative search mechanism.",
      codeExamples: [
        {
          title: "Lazy Image Component with IntersectionObserver",
          code: `import { useState, useRef, useEffect } from 'react';

function LazyImage({ src, alt, width, height, placeholder, className }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin: '200px', // Start loading 200px before viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={imgRef}
      className={className}
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
      }}
    >
      {/* Low-quality placeholder (always rendered to prevent CLS) */}
      {placeholder && (
        <img
          src={placeholder}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: isLoaded ? 'none' : 'blur(20px)',
            transition: 'filter 0.3s ease-out',
          }}
        />
      )}

      {/* Full image (loaded when in viewport) */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in',
          }}
        />
      )}
    </div>
  );
}

// Usage
function ProductGrid({ products }) {
  return (
    <div className="grid">
      {products.map(product => (
        <LazyImage
          key={product.id}
          src={product.imageUrl}
          alt={product.name}
          width={300}
          height={300}
          placeholder={product.thumbnailBase64}
        />
      ))}
    </div>
  );
}`
        }
      ]
    },
    {
      title: "Bundle Analysis and Tree Shaking",
      explanations: {
        layman: "Imagine you're packing for a trip. Tree shaking is like a smart suitcase that automatically removes items you packed but won't actually wear. If you put in 20 shirts but your itinerary only needs 5, the suitcase keeps only those 5. Bundle analysis is like weighing your suitcase and seeing a breakdown of what's inside — 'wow, that winter coat is 30% of the weight and I'm going to the beach!' This helps you make informed decisions about what to pack (import) and what to leave behind.",
        mid: "Tree shaking eliminates unused exports from the final bundle. It relies on ES module static analysis — import/export are statically analyzable (unlike require() which is dynamic). Webpack and Rollup perform tree shaking by building a dependency graph and removing unreachable exports. For tree shaking to work: 1) Use ES module syntax (import/export). 2) Set 'sideEffects: false' in package.json to tell the bundler that modules can be safely eliminated. 3) Avoid side effects at the top level of modules. Bundle analysis (webpack-bundle-analyzer, source-map-explorer) visualizes your bundle's composition — which dependencies take the most space, what's duplicated, what could be lazy-loaded. Common wins: replacing moment.js (300KB) with date-fns or dayjs (tree-shakeable), importing only needed lodash functions, removing unused CSS with PurgeCSS.",
        senior: "Bundle optimization is a continuous process, not a one-time task. Production strategies: 1) Bundle budget — set a hard limit (e.g., 200KB gzipped for initial JS) and fail CI when exceeded. Tools: bundlesize, Lighthouse CI. 2) Import analysis — use eslint-plugin-import to detect unused imports at the module level before the bundler even runs. 3) Side effect auditing — many npm packages don't declare sideEffects correctly. Audit your top dependencies: if a library with sideEffects: true is imported for one utility, the entire library ships. Fork or patch sideEffects in such cases. 4) Dynamic import for large utilities — instead of statically importing a heavy library at the top, dynamically import it when needed: const { parse } = await import('csv-parse'). 5) Dependency deduplication — yarn/pnpm can install multiple versions of the same package. Use 'resolutions' (yarn) or 'overrides' (npm) to force a single version. 6) Module replacement — Webpack's NormalModuleReplacementPlugin can swap heavy modules for lighter alternatives at build time. 7) Modern vs legacy bundles — serve smaller modern JS (no polyfills) to modern browsers and transpiled/polyfilled JS to older ones via module/nomodule pattern or differential serving. 8) Chunk analysis over time — track bundle size in CI and chart it. Regressions are immediately visible when a PR adds an unexpected dependency."
      },
      realWorld: "A news site's bundle audit revealed: moment.js was 30% of the bundle (replaced with dayjs, saving 280KB). lodash was fully imported in 3 places (switched to per-function imports, saving 70KB). An unused feature flag left dead code referencing a chart library (removed, saving 150KB). After optimization, the total JS dropped from 800KB to 320KB gzipped. They set a 350KB CI budget that has prevented regression for 18 months.",
      whenToUse: "Always set up bundle analysis as part of your build pipeline. Review it before every major release and after adding new dependencies. Set bundle budgets in CI from day one. Enable tree shaking by default (use ES modules).",
      whenNotToUse: "Don't spend days optimizing a 50KB bundle — the ROI isn't there. Don't sacrifice code readability for marginal bundle savings (e.g., avoiding a 2KB utility to write your own buggy version).",
      pitfalls: "Tree shaking fails silently — code you expect to be eliminated might stay because of side effects. Barrel files (index.js) that re-export everything can defeat tree shaking if the bundler can't determine that individual exports are side-effect-free. Source maps can mislead — gzipped size is what matters for network performance, not raw size. Not accounting for polyfills — core-js can add 100KB+ if you target old browsers.",
      codeExamples: [
        {
          title: "Bundle Optimization Patterns",
          code: `// BAD: Imports entire lodash (70KB+)
import _ from 'lodash';
const sorted = _.sortBy(users, 'name');

// GOOD: Tree-shakeable per-function import
import sortBy from 'lodash/sortBy';
const sorted = sortBy(users, 'name');

// BAD: moment.js (300KB, not tree-shakeable)
import moment from 'moment';
const formatted = moment().format('YYYY-MM-DD');

// GOOD: dayjs (2KB, same API)
import dayjs from 'dayjs';
const formatted = dayjs().format('YYYY-MM-DD');

// Dynamic import for heavy, infrequently-used libraries
async function exportToCSV(data) {
  // Only loads csv-stringify when user clicks "Export"
  const { stringify } = await import('csv-stringify/browser/esm/sync');
  const csv = stringify(data, { header: true });
  downloadFile('export.csv', csv);
}

// package.json — Enable tree shaking for your own code
// {
//   "sideEffects": false,
//   // Or be specific about which files DO have side effects:
//   "sideEffects": ["./src/polyfills.js", "*.css"]
// }

// Bundle budget in CI (bundlesize config)
// {
//   "bundlesize": [
//     { "path": "dist/main.*.js", "maxSize": "150 kB" },
//     { "path": "dist/vendor.*.js", "maxSize": "100 kB" },
//     { "path": "dist/*.css", "maxSize": "30 kB" }
//   ]
// }`
        }
      ]
    },
    {
      title: "Runtime Performance and DOM Optimization",
      explanations: {
        layman: "Your browser is like a meticulous painter. Every time you change something on the page, it has to measure everything (layout), paint the pixels (paint), and stack layers together (composite). If you make 100 tiny changes one by one, the painter starts over 100 times. But if you batch all changes together, the painter does it once. Layout thrashing is like asking the painter to measure after every single brushstroke instead of painting everything first and measuring once. Efficient DOM updates avoid making the painter restart unnecessarily.",
        mid: "The browser rendering pipeline: JavaScript -> Style -> Layout -> Paint -> Composite. Performance issues happen when JavaScript forces the browser to recalculate layout synchronously (layout thrashing). This occurs when you read layout properties (offsetHeight, getBoundingClientRect) after modifying the DOM in the same frame — the browser must perform a synchronous layout to give you accurate values. Mitigation strategies: 1) Batch DOM reads and writes separately — read all values first, then write all changes. 2) Use requestAnimationFrame to defer visual updates to the next frame. 3) Use CSS transforms and opacity for animations (they only trigger compositing, skipping layout and paint). 4) Use will-change on elements that will animate to promote them to their own compositor layer. 5) Debounce/throttle scroll and resize handlers. 6) Use CSS containment (contain: layout paint) to limit the scope of layout recalculations.",
        senior: "Runtime performance optimization requires understanding the browser's rendering architecture. Key production strategies: 1) Layout isolation — use CSS contain: layout on sections that change independently. This tells the browser that layout changes inside a container won't affect elements outside it, limiting recalculation scope. 2) Compositor-only animations — transforms (translate, scale, rotate) and opacity can be animated on the GPU compositor thread without touching the main thread. Position and size properties (top, left, width, height) trigger layout recalculations on the main thread — avoid animating them. 3) Virtual DOM isn't free — React's reconciliation compares vDOM trees, which has a cost proportional to the tree size. For components that re-render frequently (animations, live data), use React.memo with custom comparators, or escape React entirely and use refs to manipulate DOM directly. 4) Long task breaking — tasks >50ms block the main thread. Use scheduler.yield() (Chrome) or setTimeout(0) to break long tasks, keeping the main thread responsive to user input. 5) Web Workers for heavy computation — parsing large JSON, complex filtering/sorting, image processing — offload to a worker to keep the main thread free. 6) Passive event listeners — scroll/touch listeners should be passive (the default in modern browsers) to avoid blocking scrolling while the handler executes."
      },
      realWorld: "A data-heavy dashboard was experiencing jank when updating a table of 5,000 rows. Profiling revealed layout thrashing: after updating each row, the code read the row's height to calculate scroll position. The fix: batch all row updates via documentFragment, then read heights once afterward. Additionally, the sort/filter logic (running on 50K records) was moved to a Web Worker, keeping the main thread responsive. CSS contain: layout on the table prevented sorting from triggering layout recalculation on the sidebar charts. Result: sort time unchanged (120ms), but perceived responsiveness improved from 400ms (blocked main thread) to <16ms (worker + rAF).",
      whenToUse: "Profile before optimizing — use Chrome DevTools Performance panel to identify actual bottlenecks. Apply layout containment to independent page sections. Use compositor-only animations for anything that moves. Move heavy computation (>50ms) to Web Workers. Virtualize lists with >100 items.",
      whenNotToUse: "Don't prematurely optimize render performance — React's reconciliation is fast enough for most cases. Don't use Web Workers for trivial calculations (the postMessage serialization overhead may exceed the computation time). Don't add will-change to everything (it creates compositor layers that consume GPU memory).",
      pitfalls: "Over-using React.memo causes bugs when the comparison function has errors and blocks necessary re-renders. will-change on many elements exhausts GPU memory (especially on mobile). Web Workers can't access the DOM — they're for computation only. requestAnimationFrame callbacks still run on the main thread — they just align with the refresh rate. Premature optimization wastes development time and adds complexity.",
      codeExamples: [
        {
          title: "Avoiding Layout Thrashing",
          code: `// BAD: Layout thrashing — read/write interleaved
function resizeElements(elements) {
  elements.forEach(el => {
    // Read (forces layout)
    const height = el.offsetHeight;
    // Write (invalidates layout)
    el.style.height = height * 2 + 'px';
    // Next iteration reads again -> forced synchronous layout!
  });
}

// GOOD: Batch reads, then batch writes
function resizeElementsBatched(elements) {
  // Read phase — all reads first
  const heights = elements.map(el => el.offsetHeight);

  // Write phase — all writes after
  elements.forEach((el, i) => {
    el.style.height = heights[i] * 2 + 'px';
  });
}

// GOOD: Use requestAnimationFrame for visual updates
function animateProgress(element, targetWidth) {
  let currentWidth = 0;

  function step() {
    currentWidth += 2;
    // Use transform instead of width for GPU-accelerated animation
    element.style.transform = \`scaleX(\${currentWidth / 100})\`;

    if (currentWidth < targetWidth) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

// Breaking long tasks to keep the main thread responsive
async function processLargeDataset(items) {
  const CHUNK_SIZE = 100;
  const results = [];

  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);
    const processed = chunk.map(item => expensiveTransform(item));
    results.push(...processed);

    // Yield to main thread between chunks
    if (i + CHUNK_SIZE < items.length) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  return results;
}

// Web Worker for heavy computation
// worker.js
self.onmessage = function(e) {
  const { data, sortKey, filters } = e.data;

  let result = data;

  // Heavy filtering
  if (filters.length > 0) {
    result = result.filter(item =>
      filters.every(f => item[f.field] === f.value)
    );
  }

  // Heavy sorting
  result.sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
  });

  self.postMessage({ result });
};

// main.js — Using the worker
const worker = new Worker(new URL('./worker.js', import.meta.url));

function sortAndFilterData(data, sortKey, filters) {
  return new Promise(resolve => {
    worker.onmessage = (e) => resolve(e.data.result);
    worker.postMessage({ data, sortKey, filters });
  });
}`
        }
      ]
    },
    {
      title: "Network Optimization and Service Workers",
      explanations: {
        layman: "Network optimization is like planning a road trip. Preconnecting is like mapping out gas stations in advance so you know exactly where to stop. Preloading is like packing snacks for the parts of the trip you know you'll need them. Prefetching is like checking weather for tomorrow's destination while you're still driving today. Service workers are like having a local convenience store that caches popular items — if the main supply truck (internet) is delayed, you still have what you need from the local store. All of these reduce waiting time.",
        mid: "Resource hints tell the browser about resources it will need: 1) preconnect — establishes early connection (DNS + TCP + TLS) to third-party origins you'll fetch from. 2) preload — fetches critical resources for the current page with high priority (fonts, above-fold images, critical CSS). 3) prefetch — fetches resources for future navigation with low priority during idle time. 4) dns-prefetch — resolves DNS only (lighter than preconnect, for less-critical origins). Service workers are programmable network proxies that intercept requests and serve responses from cache. Caching strategies: Cache First (serve cache, fall back to network — good for static assets), Network First (try network, fall back to cache — good for API data), Stale While Revalidate (serve cache, update in background — good for semi-dynamic content). Workbox simplifies service worker implementation with pre-built strategies.",
        senior: "Network optimization at scale is about eliminating every unnecessary byte and millisecond from the critical path. Production strategies: 1) Critical request chain analysis — use Lighthouse to identify the chain of resources blocking first render. Inline critical CSS, preload critical fonts with font-display: swap, and defer non-critical JS. 2) HTTP/2 server push (or 103 Early Hints) — the server sends critical resources before the browser even requests them. H2 push is being deprecated in favor of 103 Early Hints. 3) Compression — ensure Brotli compression is configured server-side (20-30% smaller than gzip for JS/CSS). 4) CDN edge caching — static assets served from the nearest edge node. Use content-based hashing (main.a8b2c3.js) for immutable caching (Cache-Control: max-age=31536000). 5) Service worker cache strategies per-resource: immutable assets (JS, CSS with hash) use Cache First with long max-age; HTML uses Network First to always get fresh content; API responses use Stale While Revalidate for perceived performance; images use Cache First with periodic cache cleanup. 6) Background sync — queue failed POST/PUT requests in the service worker and replay when connectivity returns. 7) Navigation preload — the service worker can allow the navigation fetch to start in parallel with its boot time, preventing a performance regression from SW startup latency."
      },
      realWorld: "A news app uses a service worker with three cache strategies: static assets (JS, CSS, fonts) use Cache First with a one-year max-age. Article HTML uses Network First so users always get the latest version, falling back to the cached version when offline. Article images use Cache First to avoid re-downloading already-seen images. The app preconnects to its API and CDN origins. Fonts are preloaded with font-display: swap. The result: returning users see the app in <1 second (from SW cache), and the app works fully offline for previously visited articles.",
      whenToUse: "Always use preconnect for known third-party origins (APIs, CDNs, analytics). Always preload critical fonts and above-fold images. Use service workers when offline support matters or when caching can significantly improve repeat visits. Prefetch next-page resources for predictable user journeys.",
      whenNotToUse: "Don't preload everything — it competes with more critical resources and can actually slow down the page. Don't use service workers for apps with constantly changing content that must always be fresh (real-time trading). Don't implement offline support if your app is meaningless without connectivity (video conferencing).",
      pitfalls: "Preloading unused resources wastes bandwidth and hurts performance (resources loaded but never used). Service worker cache invalidation bugs can serve stale content indefinitely — always version your SW and have a cache-busting strategy. Service workers intercept all requests, including third-party scripts — ensure your fetch handler has proper fallbacks. Over-caching sensitive data (auth tokens, PII) in the service worker cache is a security risk.",
      codeExamples: [
        {
          title: "Resource Hints and Service Worker Setup",
          code: `<!-- Resource hints in HTML head -->
<!-- Preconnect to known origins (saves 100-500ms per origin) -->
<link rel="preconnect" href="https://api.example.com" />
<link rel="preconnect" href="https://cdn.example.com" crossorigin />

<!-- DNS prefetch for less-critical origins -->
<link rel="dns-prefetch" href="https://analytics.example.com" />

<!-- Preload critical resources for current page -->
<link rel="preload" href="/fonts/Inter-Regular.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/hero-image.webp" as="image" />

<!-- Prefetch resources for likely next navigation -->
<link rel="prefetch" href="/products.html" />
<link rel="prefetch" href="/js/product-page.chunk.js" />

<!-- Service Worker with Workbox strategies -->
// sw.js (using Workbox)
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// Precache static assets (injected by build tool)
precacheAndRoute(self.__WB_MANIFEST);

// Cache First for images (with 30-day expiration)
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Network First for API data (with cache fallback)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60, // 1 day
      }),
    ],
  })
);

// Stale While Revalidate for page navigations
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new StaleWhileRevalidate({
    cacheName: 'pages',
  })
);

// Background sync for offline form submissions
const bgSyncPlugin = new BackgroundSyncPlugin('formSubmissions', {
  maxRetentionTime: 24 * 60, // Retry for up to 24 hours
});

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/submit'),
  new NetworkFirst({
    plugins: [bgSyncPlugin],
  }),
  'POST'
);`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "How would you reduce the initial bundle size of a large React application?",
      answer: "Step by step, highest impact first. 1) Measure: run webpack-bundle-analyzer to see exactly what is in your bundle — you cannot optimize what you cannot see. 2) Route-based code splitting: wrap every route in React.lazy() + Suspense so each page downloads only when visited. This alone is often the biggest win. 3) Audit heavy dependencies: swap moment.js for dayjs (70KB saved), replace full lodash with per-function imports. 4) Verify tree shaking works: use ES module imports, add sideEffects: false to package.json. 5) Lazy load heavy components: chart libraries, rich text editors, and modals that are not immediately visible. 6) Vendor splitting: put React and stable vendor code in a separate chunk that rarely changes (better browser caching). 7) Set a bundle budget in CI so no PR can silently add 200KB. This approach typically cuts initial JavaScript by 60-80%.",
      difficulty: "mid",
      followUps: [
        "How do you measure the impact of each optimization?",
        "What's the difference between gzipped and parsed size, and which matters more?",
        "How do you handle code splitting with SSR?"
      ]
    },
    {
      question: "Explain layout thrashing and how to prevent it.",
      answer: "Layout thrashing occurs when JavaScript alternates between reading layout properties and modifying the DOM, forcing the browser to perform synchronous layout calculations between each pair. For example: reading offsetHeight, setting style.height, reading offsetHeight again — each read after a write forces a 'forced synchronous layout.' The browser normally batches layout calculations efficiently, but interleaved reads/writes prevent this. Prevention: 1) Separate read and write phases — read all needed values first, then write all changes. 2) Use requestAnimationFrame to defer writes to the next frame. 3) Use the FastDOM library which automatically batches reads and writes. 4) Use CSS transforms instead of layout-triggering properties for animations. 5) Use the CSS 'contain' property to limit layout scope. Common triggers: offsetWidth/Height, getBoundingClientRect(), scrollTop, getComputedStyle(). Chrome DevTools Performance panel highlights forced layouts with a warning triangle.",
      difficulty: "hard",
      followUps: [
        "Which CSS properties trigger layout vs paint vs composite?",
        "How does CSS contain help with layout performance?",
        "How would you detect layout thrashing in production?"
      ]
    },
    {
      question: "What is tree shaking and why might it fail?",
      answer: "Tree shaking is dead code elimination based on ES module static analysis. The bundler builds a dependency graph of imports/exports and removes exports that no one imports. It can fail for several reasons: 1) CommonJS modules — require() is dynamic and can't be statically analyzed. Use ES modules (import/export) exclusively. 2) Side effects — if a module has top-level code that runs on import (logging, global state mutation, polyfills), the bundler can't safely remove it. Mark safe packages with 'sideEffects: false' in package.json. 3) Barrel files — re-exporting everything via index.js can prevent tree shaking if the bundler can't determine which re-exports are side-effect-free. 4) Dynamic imports — import(variable) can't be statically analyzed. 5) eval() or Function() — dynamic code execution prevents analysis. 6) Class static properties — some older transpiler outputs don't tree-shake class methods correctly.",
      difficulty: "mid",
      followUps: [
        "How do barrel files affect tree shaking in practice?",
        "What does 'sideEffects: false' actually tell the bundler?",
        "How do you verify tree shaking is working correctly?"
      ]
    },
    {
      question: "Compare service worker caching strategies and when to use each.",
      answer: "Five main strategies: 1) Cache First — check cache, fall back to network. Best for: static assets (JS, CSS, images) that change infrequently and have cache-busting hashes. Fastest for repeat visits. 2) Network First — try network, fall back to cache on failure. Best for: dynamic content (API data, HTML) that should always be fresh but has offline fallback. Slowest but freshest. 3) Stale While Revalidate — serve from cache immediately, update cache in background. Best for: semi-dynamic content (user profile, app shell) where slight staleness is acceptable. Balance of speed and freshness. 4) Network Only — always use network, no caching. For: real-time data, authentication endpoints, one-time requests. 5) Cache Only — always use cache. For: precached assets during offline mode. Choosing depends on the freshness vs speed tradeoff: how important is it that the user sees the absolute latest data vs how important is it that they see something instantly?",
      difficulty: "mid",
      followUps: [
        "How do you handle cache invalidation with service workers?",
        "What happens when the service worker itself needs updating?",
        "How does navigation preload improve service worker performance?"
      ]
    },
    {
      question: "How do you profile and diagnose a runtime performance issue in a React application?",
      answer: "Systematic debugging approach: 1) Chrome DevTools Performance tab — record a profile during the sluggish interaction. Look for: long tasks (>50ms red bars), forced layouts (purple with warning triangles), excessive JavaScript execution. 2) React DevTools Profiler — identify which components re-render, how long each render takes, and why they re-rendered (props changed, parent re-rendered, hooks changed). 3) Identify the category: a) Rendering — too many component re-renders (use React.memo, useMemo, useCallback). b) Layout — layout thrashing or expensive CSS (use transforms, CSS contain). c) JavaScript — heavy computation blocking the main thread (use Web Workers, break into chunks). d) Memory — growing memory causing GC pauses (check for leaks with Memory tab). 4) Lighthouse audit for overall performance score and specific recommendations. 5) Fix the bottleneck, then verify the fix in the Performance tab. Always profile in production mode — React's development mode adds significant overhead that skews results.",
      difficulty: "hard",
      followUps: [
        "How do you detect memory leaks in a React application?",
        "What's the difference between profiling in development vs production mode?",
        "How would you set up performance monitoring in production?"
      ]
    },
    {
      question: "Explain the difference between preload, prefetch, and preconnect resource hints.",
      answer: "preconnect establishes the connection (DNS + TCP + TLS handshake) to a third-party origin before the browser discovers it needs resources from that origin. Saves 100-500ms per connection. Use for origins you'll definitely fetch from on the current page (API server, font CDN). prefetch fetches a resource with low priority for future navigation — the browser downloads it during idle time. Use for resources the user will likely need next (next page JS, next page data). preload fetches a resource with high priority for the current page — it tells the browser 'you'll need this very soon, start downloading now.' Use for critical resources the browser discovers late (fonts, above-fold images referenced in CSS, async scripts needed early). Key differences: preload = current page, high priority, mandatory. prefetch = future pages, low priority, speculative. preconnect = just the connection, no specific resource. Overusing preload contends with other critical resources; overusing prefetch wastes bandwidth.",
      difficulty: "easy",
      followUps: [
        "What happens if you preload a resource but never use it?",
        "How does fetchpriority interact with preload?",
        "Can prefetch resources be used on the current page?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Implement a Virtual Scroll List",
      difficulty: "hard",
      description: "Create a VirtualList component/class that only renders items visible in the viewport plus a small overscan buffer. Given a total item count, item height, and container height, calculate which items to render and their positions.",
      solution: `class VirtualList {
  constructor(container, options) {
    this.container = container;
    this.itemHeight = options.itemHeight;
    this.totalItems = options.totalItems;
    this.overscan = options.overscan ?? 5;
    this.renderItem = options.renderItem;

    this.containerHeight = container.clientHeight;
    this.totalHeight = this.totalItems * this.itemHeight;
    this.scrollTop = 0;

    // Create inner spacer to maintain scroll height
    this.spacer = document.createElement('div');
    this.spacer.style.height = this.totalHeight + 'px';
    this.spacer.style.position = 'relative';
    this.container.appendChild(this.spacer);

    // Pool of reusable DOM nodes
    this.nodePool = [];
    this.activeNodes = new Map(); // index -> node

    // Set up scroll listener (passive for performance)
    this.container.style.overflow = 'auto';
    this.container.addEventListener('scroll', this._onScroll.bind(this), { passive: true });

    // Initial render
    this._render();
  }

  _getVisibleRange() {
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.ceil((this.scrollTop + this.containerHeight) / this.itemHeight);

    // Add overscan
    const overscanStart = Math.max(0, startIndex - this.overscan);
    const overscanEnd = Math.min(this.totalItems - 1, endIndex + this.overscan);

    return { start: overscanStart, end: overscanEnd };
  }

  _getOrCreateNode() {
    if (this.nodePool.length > 0) {
      return this.nodePool.pop();
    }
    const node = document.createElement('div');
    node.style.position = 'absolute';
    node.style.left = '0';
    node.style.right = '0';
    node.style.height = this.itemHeight + 'px';
    this.spacer.appendChild(node);
    return node;
  }

  _recycleNode(index) {
    const node = this.activeNodes.get(index);
    if (node) {
      node.style.display = 'none';
      this.nodePool.push(node);
      this.activeNodes.delete(index);
    }
  }

  _render() {
    const { start, end } = this._getVisibleRange();

    // Recycle nodes that are no longer visible
    for (const [index] of this.activeNodes) {
      if (index < start || index > end) {
        this._recycleNode(index);
      }
    }

    // Render visible items
    for (let i = start; i <= end; i++) {
      if (!this.activeNodes.has(i)) {
        const node = this._getOrCreateNode();
        node.style.display = '';
        node.style.top = (i * this.itemHeight) + 'px';
        node.innerHTML = this.renderItem(i);
        this.activeNodes.set(i, node);
      }
    }
  }

  _onScroll() {
    this.scrollTop = this.container.scrollTop;
    // Use rAF to batch with next paint
    requestAnimationFrame(() => this._render());
  }

  // Update total count (e.g., after data load)
  setTotalItems(count) {
    this.totalItems = count;
    this.totalHeight = count * this.itemHeight;
    this.spacer.style.height = this.totalHeight + 'px';
    this._render();
  }

  destroy() {
    this.container.removeEventListener('scroll', this._onScroll);
    this.spacer.remove();
  }
}

// Usage
const container = document.getElementById('list-container');
const virtualList = new VirtualList(container, {
  itemHeight: 50,
  totalItems: 100_000,
  overscan: 5,
  renderItem: (index) => \`
    <div style="padding: 10px; border-bottom: 1px solid #eee;">
      Item \${index + 1}
    </div>
  \`,
});`,
      explanation: "The virtual list calculates which items are visible based on scroll position and container height. Only visible items (plus an overscan buffer for smooth scrolling) are rendered as DOM nodes. A node pool recycles DOM elements when items scroll out of view, avoiding costly createElement/removeChild operations. The spacer div maintains the correct total scroll height. The scroll handler uses requestAnimationFrame to batch updates with the browser's paint cycle. This renders 100K items with only ~30 DOM nodes."
    },
    {
      title: "Implement a Resource Preloader",
      difficulty: "mid",
      description: "Create a preloader that accepts a list of resources (scripts, styles, images, fonts) and loads them with the correct strategy. Scripts should be preloaded then executed, images should be prefetched, and fonts should use font-display: swap.",
      solution: `class ResourcePreloader {
  constructor() {
    this.loaded = new Set();
    this.loading = new Map(); // url -> Promise
  }

  _createLink(rel, href, attrs = {}) {
    const link = document.createElement('link');
    link.rel = rel;
    link.href = href;
    Object.entries(attrs).forEach(([key, value]) => {
      link.setAttribute(key, value);
    });
    document.head.appendChild(link);
    return link;
  }

  preconnect(origin) {
    if (this.loaded.has('preconnect:' + origin)) return;
    this._createLink('preconnect', origin, { crossorigin: '' });
    this.loaded.add('preconnect:' + origin);
  }

  preloadScript(url) {
    if (this.loaded.has(url)) return Promise.resolve();
    if (this.loading.has(url)) return this.loading.get(url);

    const promise = new Promise((resolve, reject) => {
      const link = this._createLink('preload', url, { as: 'script' });
      link.onload = resolve;
      link.onerror = reject;
    });

    this.loading.set(url, promise);
    promise.then(() => {
      this.loaded.add(url);
      this.loading.delete(url);
    });

    return promise;
  }

  async loadScript(url) {
    // Preload first, then execute
    await this.preloadScript(url);

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  preloadImage(url) {
    if (this.loaded.has(url)) return Promise.resolve();
    if (this.loading.has(url)) return this.loading.get(url);

    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });

    this.loading.set(url, promise);
    promise.then(() => {
      this.loaded.add(url);
      this.loading.delete(url);
    });

    return promise;
  }

  preloadFont(url, fontFamily) {
    if (this.loaded.has(url)) return Promise.resolve();

    this._createLink('preload', url, {
      as: 'font',
      type: 'font/woff2',
      crossorigin: '',
    });

    // Add @font-face with font-display: swap
    if (fontFamily) {
      const style = document.createElement('style');
      style.textContent = \`
        @font-face {
          font-family: '\${fontFamily}';
          src: url('\${url}') format('woff2');
          font-display: swap;
        }
      \`;
      document.head.appendChild(style);
    }

    this.loaded.add(url);
    return Promise.resolve();
  }

  prefetch(url, as) {
    if (this.loaded.has('prefetch:' + url)) return;
    this._createLink('prefetch', url, as ? { as } : {});
    this.loaded.add('prefetch:' + url);
  }

  // Batch preload resources based on type
  async preloadBatch(resources) {
    const promises = resources.map(resource => {
      switch (resource.type) {
        case 'script': return this.preloadScript(resource.url);
        case 'image': return this.preloadImage(resource.url);
        case 'font': return this.preloadFont(resource.url, resource.fontFamily);
        case 'prefetch': return this.prefetch(resource.url, resource.as);
        default: return Promise.resolve();
      }
    });

    return Promise.allSettled(promises);
  }
}

// Usage
const preloader = new ResourcePreloader();

// Preconnect to known origins
preloader.preconnect('https://api.example.com');
preloader.preconnect('https://cdn.example.com');

// Preload critical fonts
preloader.preloadFont('/fonts/Inter-Regular.woff2', 'Inter');

// Preload batch on hover (prepare for navigation)
document.querySelector('#products-link').addEventListener('mouseenter', () => {
  preloader.preloadBatch([
    { type: 'script', url: '/js/products.chunk.js' },
    { type: 'image', url: '/images/products-hero.webp' },
    { type: 'prefetch', url: '/api/products?page=1', as: 'fetch' },
  ]);
});`,
      explanation: "The ResourcePreloader handles different resource types with appropriate loading strategies. Scripts are preloaded (downloaded without execution) then executed when needed. Images are preloaded via Image objects. Fonts are preloaded with link[rel=preload] and font-display: swap prevents invisible text. Prefetch is used for resources needed on future pages. Deduplication prevents loading the same resource twice. The batch method enables preloading groups of resources for predictive navigation."
    },
    {
      title: "Build a Debounced Resize Observer",
      difficulty: "mid",
      description: "Create a utility that observes element resizes using ResizeObserver but debounces the callbacks to avoid layout thrashing. It should support observing multiple elements with different callbacks and cleanup.",
      solution: `class DebouncedResizeObserver {
  constructor(defaultDebounceMs = 150) {
    this.defaultDebounceMs = defaultDebounceMs;
    this.callbacks = new Map(); // element -> { callback, debounceMs, timerId }
    this.observer = new ResizeObserver(this._handleResize.bind(this));
  }

  _handleResize(entries) {
    for (const entry of entries) {
      const config = this.callbacks.get(entry.target);
      if (!config) continue;

      // Clear previous debounce timer
      if (config.timerId !== null) {
        clearTimeout(config.timerId);
      }

      // Schedule debounced callback
      config.timerId = setTimeout(() => {
        config.timerId = null;

        // Use rAF to align with paint cycle
        requestAnimationFrame(() => {
          const { width, height } = entry.contentRect;
          config.callback({
            element: entry.target,
            width,
            height,
            entry,
          });
        });
      }, config.debounceMs);
    }
  }

  observe(element, callback, debounceMs) {
    if (this.callbacks.has(element)) {
      this.unobserve(element);
    }

    this.callbacks.set(element, {
      callback,
      debounceMs: debounceMs ?? this.defaultDebounceMs,
      timerId: null,
    });

    this.observer.observe(element);

    // Return cleanup function
    return () => this.unobserve(element);
  }

  unobserve(element) {
    const config = this.callbacks.get(element);
    if (config) {
      if (config.timerId !== null) {
        clearTimeout(config.timerId);
      }
      this.callbacks.delete(element);
      this.observer.unobserve(element);
    }
  }

  disconnect() {
    // Clear all pending timers
    for (const [, config] of this.callbacks) {
      if (config.timerId !== null) {
        clearTimeout(config.timerId);
      }
    }
    this.callbacks.clear();
    this.observer.disconnect();
  }
}

// Usage
const resizeObserver = new DebouncedResizeObserver(100);

// Observe a chart container — recalculate chart on resize
const chartContainer = document.getElementById('chart');
const cleanup = resizeObserver.observe(chartContainer, ({ width, height }) => {
  console.log(\`Chart container resized: \${width}x\${height}\`);
  // Recalculate chart dimensions without thrashing
  chart.resize(width, height);
}, 200);

// React hook version
function useDebouncedResize(ref, debounceMs = 150) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const observer = new DebouncedResizeObserver(debounceMs);
    const cleanup = observer.observe(ref.current, ({ width, height }) => {
      setSize({ width, height });
    });

    return () => {
      cleanup();
      observer.disconnect();
    };
  }, [ref, debounceMs]);

  return size;
}

// Usage in React
function ResponsiveChart({ data }) {
  const containerRef = useRef(null);
  const { width, height } = useDebouncedResize(containerRef);

  return (
    <div ref={containerRef} style={{ width: '100%', height: 400 }}>
      {width > 0 && <Chart data={data} width={width} height={height} />}
    </div>
  );
}`,
      explanation: "Wraps ResizeObserver with debouncing to prevent callback storms during continuous resizing (e.g., window drag). Each observed element can have its own debounce interval. The callback is scheduled via setTimeout for debouncing, then wrapped in requestAnimationFrame to align with the paint cycle. The cleanup pattern (returning an unobserve function from observe()) follows React hook conventions. The React hook version provides a declarative API for responsive components."
    }
  ],
  quiz: [
    {
      question: "Which code splitting strategy has the highest impact on reducing initial load time?",
      options: [
        "Vendor splitting (separating node_modules)",
        "Route-based splitting (lazy loading each route)",
        "Component-based splitting (lazy loading heavy components)",
        "CSS splitting (separate CSS per route)"
      ],
      correct: 1,
      explanation: "Route-based splitting has the highest impact because routes typically contain the most code. Instead of loading every page's JavaScript upfront, only the current route's code loads initially. Users visiting the homepage don't download the settings page code. Vendor splitting helps caching but doesn't reduce what's downloaded on first visit. Component splitting is useful but usually addresses smaller portions of the bundle."
    },
    {
      question: "What causes layout thrashing in the browser?",
      options: [
        "Using too many CSS classes on an element",
        "Alternating between reading layout properties and modifying the DOM",
        "Having too many elements in the DOM tree",
        "Using JavaScript animations instead of CSS animations"
      ],
      correct: 1,
      explanation: "Layout thrashing occurs when JavaScript interleaves DOM reads (offsetHeight, getBoundingClientRect) and writes (style changes). Each read after a write forces the browser to perform a synchronous layout calculation to return accurate values. The fix is to batch all reads first, then batch all writes, so the browser only recalculates layout once."
    },
    {
      question: "Why should above-the-fold hero images NOT use loading='lazy'?",
      options: [
        "The lazy attribute doesn't work on large images",
        "It causes the image to flash when it loads",
        "It delays loading of the LCP (Largest Contentful Paint) element, hurting Core Web Vitals",
        "It prevents the image from being cached by the browser"
      ],
      correct: 2,
      explanation: "The hero image is typically the Largest Contentful Paint (LCP) element. Using loading='lazy' defers its load until it enters the viewport, but since it's above the fold, it's already visible — the browser just delayed downloading it unnecessarily. This directly hurts the LCP metric. Hero images should load eagerly (default) and even use fetchpriority='high' to prioritize them."
    },
    {
      question: "Which service worker caching strategy returns the fastest response while still eventually updating to fresh data?",
      options: [
        "Cache First",
        "Network First",
        "Stale While Revalidate",
        "Network Only"
      ],
      correct: 2,
      explanation: "Stale While Revalidate immediately returns the cached response (fast) while simultaneously fetching a fresh copy from the network to update the cache. The user sees content instantly, and the next visit gets the updated version. Cache First is also fast but never updates unless the cache expires. Network First waits for the network response, making it slower."
    },
    {
      question: "What does setting 'sideEffects: false' in package.json tell the bundler?",
      options: [
        "The package has no dependencies",
        "Unused exports from this package can be safely tree-shaken without side effects",
        "The package doesn't modify global state at runtime",
        "The package's modules can be loaded in any order"
      ],
      correct: 1,
      explanation: "sideEffects: false tells the bundler that importing a module from this package and not using its exports has no observable effect (no global mutations, no CSS injection, no polyfill registration). This allows the bundler to safely eliminate entire modules if their exports are unused. Without this flag, the bundler conservatively keeps all modules because they might have side effects that would break if removed."
    }
  ]
};
