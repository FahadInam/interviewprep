export const webVitals = {
  id: "web-vitals",
  title: "Core Web Vitals",
  icon: "📊",
  tag: "System Design",
  tagColor: "var(--tag-system)",
  subtitle: "LCP, CLS, INP/FID measurement and optimization strategies for real-world performance",
  concepts: [
    {
      title: "Core Web Vitals Explained",
      explanations: {
        layman: "Picture opening a webpage like opening a door to a room. Core Web Vitals measure three things about that experience: 1) LCP (Largest Contentful Paint) = How fast the lights turn on. Can you see the main content? Goal: under 2.5 seconds. 2) CLS (Cumulative Layout Shift) = Does the furniture keep moving? You reach for a button, but an ad loads and shoves it down the page. Goal: a score under 0.1. 3) INP (Interaction to Next Paint) = When you flip a switch, does the light respond instantly or is there a lag? Goal: under 200 milliseconds. Google grades every website on these three scores and uses them to decide search rankings. Bad scores = fewer people find your site.",
        mid: "Core Web Vitals are Google's user-experience metrics that directly influence search rankings. LCP (Largest Contentful Paint) measures perceived load speed — the time until the largest visible element (hero image, heading text, video poster) renders. Target: <2.5s. CLS (Cumulative Layout Shift) measures visual stability — the sum of unexpected layout shift scores during the page lifecycle. A layout shift happens when visible elements move without user interaction (ad loading, images without dimensions, dynamically injected content). Target: <0.1. INP (Interaction to Next Paint), which replaced FID in March 2024, measures responsiveness to ALL user interactions throughout the page lifecycle, not just the first. It's the longest interaction latency (from user input to next paint), at the 98th percentile. Target: <200ms. FID (First Input Delay) only measured the delay of the first interaction and ignored processing/rendering time — INP is far more comprehensive.",
        senior: "Core Web Vitals represent a shift from lab metrics to field metrics in performance culture. The critical architectural implications: 1) LCP is a function of your critical rendering path — server response time (TTFB), render-blocking resources (CSS, sync JS), resource load time (images, fonts), and client-side rendering time. Improving LCP requires optimization across the entire stack: CDN, server-side rendering or streaming HTML, critical CSS inlining, font preloading, image optimization. 2) CLS is an architecture problem — it emerges from patterns baked into the codebase: dynamic ad slots without reserved space, lazy-loaded images without aspect ratios, web fonts without font-display:swap and size-adjust. Fixing CLS often means changing component contracts (all images MUST have width/height). 3) INP is the hardest to optimize because it measures the full lifecycle of every interaction: input delay (is the main thread busy?), processing time (how long does the event handler take?), and presentation delay (how long until the DOM update paints?). Improving INP means: breaking long tasks (yield to main thread), efficient React re-renders (avoid cascade re-renders), and avoiding forced layouts in handlers. The 75th percentile threshold means 75% of your users must meet the target — you can't just optimize for fast devices. Field data (CrUX, RUM) matters more than lab data (Lighthouse) because it captures real device/network diversity."
      },
      realWorld: "An e-commerce company improved their Core Web Vitals and saw a 15% increase in organic search traffic. Their LCP was 4.2s (hero image loading slowly) — fixed by preloading the hero, serving WebP, and adding a CDN. CLS was 0.35 (ads and lazy images pushing content down) — fixed by reserving ad slot dimensions and adding width/height to all images. INP was 380ms (heavy click handlers on product filters) — fixed by debouncing filter logic and moving sort/filter computation to a Web Worker.",
      whenToUse: "Always monitor Core Web Vitals. They should be part of your CI pipeline (Lighthouse CI), your monitoring dashboard (RUM with web-vitals library), and your sprint planning (dedicate time to performance improvements when metrics degrade).",
      whenNotToUse: "Don't obsess over Lighthouse scores in development — they vary between runs and don't represent real users. Focus on field data (CrUX, your own RUM). Don't optimize for metrics that are already well within thresholds — diminishing returns.",
      pitfalls: "Optimizing only for Lighthouse (lab) while ignoring field data — your users on slow phones may have very different experiences. LCP element can change between mobile and desktop — test both. CLS can accumulate after initial load (infinite scroll, lazy content) — monitor the full session, not just load. INP can be high even with fast individual handlers if the main thread is consistently busy (long tasks from third-party scripts, heavy React re-renders).",
      codeExamples: [
        {
          title: "Measuring Core Web Vitals",
          code: `// Using the web-vitals library
import { onLCP, onCLS, onINP, onFCP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating, // 'good', 'needs-improvement', 'poor'
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    // Include attribution for debugging
    ...(metric.attribution && {
      attribution: {
        element: metric.attribution.element,
        url: metric.attribution.url,
        timeToFirstByte: metric.attribution.timeToFirstByte,
        resourceLoadDelay: metric.attribution.resourceLoadDelay,
        resourceLoadTime: metric.attribution.resourceLoadTime,
      },
    }),
  });

  // Use sendBeacon for reliability (survives page unload)
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/vitals', body);
  } else {
    fetch('/api/analytics/vitals', { body, method: 'POST', keepalive: true });
  }
}

// Measure all Core Web Vitals
onLCP(sendToAnalytics);
onCLS(sendToAnalytics);
onINP(sendToAnalytics);
onFCP(sendToAnalytics);
onTTFB(sendToAnalytics);

// Custom performance marks for debugging
performance.mark('hero-image-start');
heroImage.onload = () => {
  performance.mark('hero-image-end');
  performance.measure('hero-image-load', 'hero-image-start', 'hero-image-end');
};`
        }
      ]
    },
    {
      title: "Optimizing Largest Contentful Paint (LCP)",
      explanations: {
        layman: "LCP is about how fast the 'main thing' on the page appears. On a news article, it's the headline or hero image. On a product page, it's the product image. Imagine walking into a store and the lights take 5 seconds to turn on — that's a slow LCP. The goal is to make the most important visual element appear in under 2.5 seconds. This means: make the server respond fast (turn on the lights quickly), don't block the entrance (remove render-blocking CSS/JS), and have the main display ready (preload the hero image).",
        mid: "LCP measures when the largest visible content element finishes rendering. The LCP element is usually a hero image, video poster, large text block, or background image. Four sub-parts to optimize: 1) Time to First Byte (TTFB) — server response time. Use CDN, server-side caching, streaming HTML, edge computing. 2) Resource load delay — time between TTFB and when the LCP resource starts loading. Remove render-blocking JS/CSS, preload the LCP image, inline critical CSS. 3) Resource load time — how long the LCP resource takes to download. Optimize image size (WebP/AVIF, responsive sizes via srcset), use CDN, compress. 4) Element render delay — time between resource load and actual paint. Minimize main-thread blocking (defer non-critical JS, reduce JavaScript execution). For SPAs, server-side rendering (SSR) or static generation (SSG) dramatically improves LCP by sending rendered HTML instead of waiting for JS to boot and fetch data.",
        senior: "LCP optimization is a full-stack concern that requires coordinated effort. Production strategies by sub-part: TTFB (<0.8s target): Server-side rendering or streaming SSR (React 18 renderToPipeableStream) sends HTML progressively. Edge computing (Cloudflare Workers, Vercel Edge) reduces geographic latency. HTTP/2 103 Early Hints sends preload headers before the HTML response is ready. Resource Load Delay (<0.1s target): The LCP image must be discoverable in the initial HTML — avoid loading it via CSS background-image or JS. Use <link rel='preload'> for the LCP image. Inline critical CSS (extract above-fold CSS with tools like Critical) and defer the rest. Set fetchpriority='high' on the LCP image element. Resource Load Time: Serve responsive images with srcset and sizes. Use modern formats (AVIF saves 50% vs JPEG, WebP saves 30%). Implement a CDN image transformation pipeline (Cloudinary, imgix) for on-the-fly optimization. Element Render Delay: For React SPAs, the LCP element can't render until: JS downloads, parses, executes, and the component tree renders. SSR eliminates this bottleneck. For CSR apps, minimize JS on the critical path and use streaming for data fetching. Monitor the LCP element across different pages — it may differ between mobile and desktop, and different page types (homepage vs PDP vs article) have different LCP elements requiring different optimizations."
      },
      realWorld: "A media site had LCP of 4.8s on mobile. Root causes: 1) TTFB was 1.5s — moved to edge-rendered pages with Vercel, reducing to 0.3s. 2) Hero image was 800KB JPEG — converted to AVIF with responsive sizes, reduced to 120KB. 3) Two render-blocking stylesheets — inlined critical CSS, deferred the rest. 4) Hero image was loaded via CSS background-image (not discoverable by preload scanner) — moved to <img> tag with fetchpriority='high'. Result: LCP dropped to 1.8s on mobile.",
      whenToUse: "Always optimize LCP — it's the most impactful Web Vital for user perception. Prioritize: 1) Identify your LCP element (Lighthouse tells you). 2) Preload it. 3) Optimize its size. 4) Remove render-blocking resources. 5) Consider SSR if you're a CSR SPA.",
      whenNotToUse: "Don't optimize LCP for pages that don't matter for SEO or user experience (admin dashboards, internal tools). Don't inline ALL CSS — only critical above-fold CSS; inlining too much increases HTML size.",
      pitfalls: "Preloading too many resources competes with the LCP resource, potentially making it slower. Lazy loading the LCP image (a common mistake) delays it — the LCP element should NEVER be lazy loaded. Using CSS background-image for the LCP element makes it invisible to the preload scanner. Client-side rendering without SSR means LCP can't happen until JS executes — for content sites, this is a significant penalty.",
      codeExamples: [
        {
          title: "LCP Optimization Techniques",
          code: `<!-- 1. Preload the LCP image with high priority -->
<head>
  <!-- Critical CSS inlined -->
  <style>
    /* Only above-the-fold styles */
    .hero { position: relative; height: 60vh; }
    .hero-img { width: 100%; height: 100%; object-fit: cover; }
    .nav { display: flex; align-items: center; height: 60px; }
  </style>

  <!-- Preload LCP image -->
  <link
    rel="preload"
    href="/hero-desktop.avif"
    as="image"
    type="image/avif"
    imagesrcset="/hero-mobile.avif 768w, /hero-desktop.avif 1440w"
    imagesizes="100vw"
  />

  <!-- Defer non-critical CSS -->
  <link rel="stylesheet" href="/styles/main.css" media="print" onload="this.media='all'" />
  <noscript><link rel="stylesheet" href="/styles/main.css" /></noscript>
</head>

<!-- 2. LCP image with fetchpriority and responsive sizes -->
<img
  class="hero-img"
  src="/hero-desktop.avif"
  srcset="/hero-mobile.avif 768w, /hero-tablet.avif 1024w, /hero-desktop.avif 1440w"
  sizes="100vw"
  alt="Hero banner"
  width="1440"
  height="600"
  fetchpriority="high"
/>

<!-- 3. React SSR streaming for fast LCP -->
// server.js — Streaming SSR with React 18
import { renderToPipeableStream } from 'react-dom/server';
import App from './App';

function handleRequest(req, res) {
  const { pipe } = renderToPipeableStream(<App url={req.url} />, {
    // Shell streams immediately (nav, header, above-fold)
    bootstrapScripts: ['/js/main.js'],
    onShellReady() {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      pipe(res); // Start streaming HTML
    },
    onShellError(error) {
      res.statusCode = 500;
      res.send('<h1>Something went wrong</h1>');
    },
  });
}`
        }
      ]
    },
    {
      title: "Optimizing Cumulative Layout Shift (CLS)",
      explanations: {
        layman: "You are reading a webpage on your phone and about to tap a link. Suddenly an ad loads above it, the whole page jumps down, and you accidentally tap the ad instead. That is a layout shift. CLS measures how much the page jumps around while loading. Think of it like a puzzle that keeps rearranging itself before you can click on a piece. The fix is simple in concept: reserve the right amount of space for everything BEFORE it loads, like leaving an empty picture frame on the wall so nothing moves when the picture arrives.",
        mid: "CLS scores the visual instability of a page. A layout shift occurs when a visible element changes its position between frames without user interaction. The score = impact fraction x distance fraction (how much of the viewport shifted x how far it moved). Common causes: 1) Images without dimensions — browser doesn't know the size until loaded, then content jumps. Fix: always set width and height or use aspect-ratio CSS. 2) Ads/embeds without reserved space — dynamic content injected above existing content. Fix: reserve fixed-size containers. 3) Web fonts — FOUT (Flash of Unstyled Text) when the custom font loads and changes text metrics. Fix: font-display: swap with size-adjust or font metric overrides. 4) Dynamic content insertion — injecting banners, notifications above content. Fix: inject below or use transforms (translate doesn't cause layout shifts). 5) Late-loading CSS — styles applied after content renders cause reflow.",
        senior: "CLS optimization requires systemic architectural changes, not point fixes. Production strategies: 1) Component contracts — every component that renders media MUST accept width/height or aspectRatio props. Enforce via ESLint custom rule or TypeScript required props. 2) Aspect ratio containers — use CSS aspect-ratio property for responsive images/embeds that maintain proportions without JavaScript. 3) Font optimization pipeline — use @font-face with font-display: swap, CSS size-adjust to match fallback font metrics (prevents FOUT shift), and preload critical fonts. Tools like Fontaine and capsize calculate exact size-adjust and line-height values. 4) Animation safety — position changes via top/left trigger layout shifts; use transform: translate() instead (it only affects compositing, not layout). 5) Content reservation for async content — ad slots, user-generated content, and dynamic banners need skeleton placeholders that match the final dimensions. Use min-height on containers if exact height is unknown. 6) Layout shift monitoring — track CLS in RUM with attribution to identify which elements cause shifts. Chrome's Layout Instability API gives you the shifted nodes. Set up alerts when CLS regresses above threshold. 7) BF cache awareness — CLS is measured across the entire page lifecycle including back/forward navigation. Ensure restored pages don't re-trigger layout shifts."
      },
      realWorld: "A news site had CLS of 0.42 — mostly from ads and images. Fixes: 1) All article images got explicit width/height attributes from the CMS (the CMS was updated to require dimensions on upload). 2) Ad slots got fixed-height containers with skeleton backgrounds. 3) Web font replaced FOUT with size-adjust: the fallback (Arial) was configured to match the custom font's metrics exactly, eliminating the text reflow. 4) A cookie consent banner was changed from position:relative (pushing content down) to position:fixed (overlay, no shift). Result: CLS dropped to 0.04.",
      whenToUse: "Always set explicit dimensions on images and media. Always reserve space for dynamic content. Always handle web fonts with font-display and size-adjust. These should be architectural standards, not ad-hoc fixes.",
      whenNotToUse: "Don't worry about layout shifts caused by user interaction (clicking a button that expands a section) — those are excluded from CLS. Don't over-constrain dynamic content with fixed heights if the content length is truly unpredictable — use min-height instead.",
      pitfalls: "Setting width/height on responsive images requires also setting CSS max-width:100%; height:auto — otherwise the fixed attributes break responsiveness. Skeleton screens can cause shifts if they don't match the final content dimensions. position:fixed elements don't cause layout shifts but can still be jarring — use transitions. Single-page app navigations reset CLS measurement, so route changes start fresh.",
      codeExamples: [
        {
          title: "CLS Prevention Patterns",
          code: `/* 1. Responsive images with aspect ratio preservation */
.image-container {
  /* Modern: aspect-ratio property */
  aspect-ratio: 16 / 9;
  width: 100%;
  overflow: hidden;
  background-color: #f0f0f0; /* Placeholder color */
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 2. Ad slot with reserved space */
.ad-slot {
  min-height: 250px; /* Match ad dimensions */
  width: 300px;
  background-color: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ad-slot::before {
  content: 'Advertisement';
  color: #ccc;
  font-size: 12px;
}

/* 3. Font with size-adjust to prevent FOUT shift */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/CustomFont.woff2') format('woff2');
  font-display: swap;
}

/* Fallback font that matches custom font metrics */
@font-face {
  font-family: 'CustomFont-Fallback';
  src: local('Arial');
  size-adjust: 105.2%; /* Adjusted to match CustomFont metrics */
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
}

body {
  font-family: 'CustomFont', 'CustomFont-Fallback', sans-serif;
}

/* 4. Dynamic content that doesn't cause shifts */
.notification-banner {
  /* BAD: position: relative pushes content down */
  /* GOOD: fixed or transform-based positioning */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  transform: translateY(-100%);
  transition: transform 0.3s ease;
}

.notification-banner.visible {
  transform: translateY(0);
}

<!-- 5. Images with explicit dimensions -->
<!-- Always include width and height to reserve space -->
<img
  src="product.jpg"
  alt="Product"
  width="400"
  height="300"
  loading="lazy"
  style="max-width: 100%; height: auto;"
/>

<!-- 6. Responsive embed with aspect ratio -->
<div style="aspect-ratio: 16/9; width: 100%;">
  <iframe
    src="https://www.youtube.com/embed/VIDEO_ID"
    style="width: 100%; height: 100%; border: 0;"
    loading="lazy"
    allow="accelerometer; autoplay; encrypted-media"
  ></iframe>
</div>`
        }
      ]
    },
    {
      title: "Optimizing INP/FID and Real User Monitoring",
      explanations: {
        layman: "INP measures how quickly your website responds when someone clicks, types, or taps. It's like measuring how long a cashier takes between hearing your order and handing you the receipt. If the cashier is busy counting inventory (main thread is blocked), they can't serve you immediately. The fix is to make sure the cashier is never stuck doing long tasks — break big jobs into smaller ones so they can respond to customers between each small task. Real User Monitoring (RUM) is like putting a speed camera on the road — it measures actual driving speeds of real drivers, not the theoretical limit.",
        mid: "INP (Interaction to Next Paint) replaced FID in March 2024 as a Core Web Vital. Key differences: FID measured only the delay before the first interaction's handler runs; INP measures the full input-to-paint latency of ALL interactions and reports the worst (at the 98th percentile). INP has three phases: 1) Input delay — time the main thread is busy before the handler can run. 2) Processing time — how long the event handler itself takes. 3) Presentation delay — time from handler completion to the next paint (React re-render, layout, paint). Optimization: break long tasks (>50ms) using setTimeout(0) or scheduler.yield(). Use startTransition for non-urgent React updates. Move heavy computation to Web Workers. Avoid forced layouts in event handlers. RUM vs Lab data: Lighthouse (lab) runs on a controlled device/network — useful for catching regressions but doesn't reflect real users. RUM (web-vitals library + analytics) measures actual users on real devices and networks. Google uses CrUX (Chrome User Experience Report) field data for ranking, not Lighthouse scores.",
        senior: "INP is architecturally the hardest Web Vital to optimize because it's about the responsiveness of your entire application, not just the initial load. Production strategies: 1) Long Task identification — use the Long Tasks API (PerformanceObserver with 'longtask' type) to find which tasks exceed 50ms. Then use the Profiler to drill into them. Common culprits: large React re-render trees, heavy third-party scripts (analytics, A/B testing), complex DOM manipulations. 2) Yielding strategies — scheduler.yield() (Chrome-only, behind a flag) yields to the main thread between microtasks. The isInputPending() API checks if user input is waiting and yields if so. Portable approach: break work into chunks with setTimeout(0) between them. 3) React-specific: use startTransition() to mark non-critical updates as low-priority (React won't block input for them). Use useDeferredValue() for expensive derived renders. Avoid cascading state updates that trigger multiple synchronous re-renders. 4) Event handler optimization — don't read layout properties (getBoundingClientRect) in click handlers (forced layout). Don't perform heavy computation synchronously — schedule it. 5) Third-party script impact — third-party scripts (ads, analytics, chat widgets) can dominate INP by occupying the main thread. Use web workers for analytics, async/defer for third-party scripts, and Partytown to run third-party scripts in a web worker. 6) RUM implementation — collect web-vitals with attribution, segment by page type, device class, and geography. Set up p75 dashboards with alerting. Track INP per interaction type (click, keypress, tap) to identify specific problem areas."
      },
      realWorld: "A SaaS dashboard had INP of 450ms on the data table page. Profiling revealed: clicking a column header to sort triggered a synchronous sort of 50K rows (200ms), then React re-rendered the entire table (150ms), followed by a forced layout from scroll position restoration (100ms). Fixes: 1) Sort computation moved to a Web Worker (0ms main thread). 2) Table virtualized with react-virtuoso (only ~30 rows rendered, 8ms re-render). 3) Scroll restoration deferred with requestAnimationFrame. 4) React.startTransition() wrapped the state update so it didn't block input. Result: INP dropped to 85ms.",
      whenToUse: "Monitor INP in production via RUM — it reveals issues that lab testing misses (slow devices, heavy third-party scripts). Optimize any interaction exceeding 200ms. Prioritize the most common interactions (navigation clicks, form inputs, search) over rare ones.",
      whenNotToUse: "Don't micro-optimize interactions that are already under 100ms — the user won't notice. Don't yield in hot paths where the total work is already fast (<50ms) — the overhead of yielding is worse than just finishing.",
      pitfalls: "FID scores can be 'good' while INP is 'poor' — FID only measured the first interaction, so sites with good initial load but laggy subsequent interactions had misleading FID scores. Testing only on fast developer machines gives false confidence — test on throttled devices or use RUM data. Third-party scripts are often the biggest INP offender but are overlooked because they're not 'your' code. React's startTransition doesn't help if the processing itself is synchronous and long — it needs to be breakable into chunks or offloaded.",
      codeExamples: [
        {
          title: "INP Optimization and RUM Setup",
          code: `// 1. Breaking long tasks with yielding
function yieldToMainThread() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

async function processItemsWithYielding(items, processItem) {
  const CHUNK_SIZE = 50;
  const results = [];

  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);
    results.push(...chunk.map(processItem));

    // Yield between chunks so the browser can handle user input
    if (i + CHUNK_SIZE < items.length) {
      await yieldToMainThread();
    }
  }

  return results;
}

// 2. React startTransition for non-blocking updates
import { useState, startTransition, useDeferredValue } from 'react';

function SearchableList({ items }) {
  const [query, setQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);

  // Deferred value for expensive rendering
  const deferredFilteredItems = useDeferredValue(filteredItems);

  function handleSearch(e) {
    const value = e.target.value;
    setQuery(value); // Urgent: update input immediately

    // Non-urgent: filter list can be deferred
    startTransition(() => {
      const filtered = items.filter(item =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredItems(filtered);
    });
  }

  return (
    <div>
      <input value={query} onChange={handleSearch} placeholder="Search..." />
      {/* Uses deferred value — won't block input */}
      <ul>
        {deferredFilteredItems.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

// 3. Long Task monitoring
const longTaskObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    // Report any task longer than 50ms
    if (entry.duration > 50) {
      console.warn(\`Long task detected: \${entry.duration.toFixed(0)}ms\`, {
        startTime: entry.startTime,
        duration: entry.duration,
        name: entry.name,
        // attribution tells you the source (script URL)
        attribution: entry.attribution?.[0]?.containerSrc,
      });

      // Send to monitoring
      reportLongTask({
        duration: entry.duration,
        source: entry.attribution?.[0]?.containerSrc || 'unknown',
        page: window.location.pathname,
      });
    }
  }
});

longTaskObserver.observe({ type: 'longtask', buffered: true });

// 4. Complete RUM dashboard data collection
import { onLCP, onCLS, onINP, onFCP, onTTFB } from 'web-vitals/attribution';

function collectVitalWithContext(metric) {
  const payload = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    // Page context
    page: window.location.pathname,
    timestamp: Date.now(),
    // Device context
    deviceType: navigator.userAgentData?.mobile ? 'mobile' : 'desktop',
    connectionType: navigator.connection?.effectiveType || 'unknown',
    // User context (anonymized)
    sessionId: getSessionId(),
    // Metric-specific attribution
    attribution: {},
  };

  // Add metric-specific debugging info
  if (metric.name === 'LCP' && metric.attribution) {
    payload.attribution = {
      element: metric.attribution.element,
      url: metric.attribution.url,
      timeToFirstByte: metric.attribution.timeToFirstByte,
      resourceLoadDelay: metric.attribution.resourceLoadDelay,
      resourceLoadTime: metric.attribution.resourceLoadTime,
      renderDelay: metric.attribution.renderDelay,
    };
  }

  if (metric.name === 'INP' && metric.attribution) {
    payload.attribution = {
      eventTarget: metric.attribution.eventTarget,
      eventType: metric.attribution.eventType,
      inputDelay: metric.attribution.inputDelay,
      processingDuration: metric.attribution.processingDuration,
      presentationDelay: metric.attribution.presentationDelay,
      longAnimationFrameEntries: metric.attribution.longAnimationFrameEntries?.length,
    };
  }

  if (metric.name === 'CLS' && metric.attribution) {
    payload.attribution = {
      largestShiftTarget: metric.attribution.largestShiftTarget,
      largestShiftTime: metric.attribution.largestShiftTime,
      largestShiftValue: metric.attribution.largestShiftValue,
    };
  }

  navigator.sendBeacon('/api/rum', JSON.stringify(payload));
}

onLCP(collectVitalWithContext);
onCLS(collectVitalWithContext);
onINP(collectVitalWithContext);
onFCP(collectVitalWithContext);
onTTFB(collectVitalWithContext);`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "Explain the difference between LCP, CLS, and INP and what each measures.",
      answer: "Each metric answers one user experience question. LCP (Largest Contentful Paint): 'How fast does the main content show up?' It measures when the biggest visible element — a hero image, headline, or video — finishes rendering. Good: under 2.5 seconds. CLS (Cumulative Layout Shift): 'Does the page jump around while loading?' It adds up every unexpected movement of visible elements. Good: under 0.1. INP (Interaction to Next Paint): 'When I click something, how fast does the page respond?' It tracks every interaction during the session and reports the slowest one (98th percentile). Good: under 200 milliseconds. Together, these three metrics cover the full user experience: fast loading, visual stability, and responsiveness to input.",
      difficulty: "easy",
      followUps: [
        "Why did Google replace FID with INP?",
        "Which metric is typically hardest to optimize for SPAs?",
        "How are these metrics used in Google's search ranking?"
      ]
    },
    {
      question: "How would you improve LCP from 4 seconds to under 2.5 seconds?",
      answer: "Systematic approach: 1) Identify the LCP element using Lighthouse or DevTools Performance tab. 2) Reduce TTFB — use a CDN, enable server caching, consider edge rendering or SSR. Target <0.8s. 3) Eliminate render-blocking resources — inline critical CSS, defer non-critical CSS with media='print' trick, async/defer non-critical JS. 4) Optimize the LCP resource — if it's an image: convert to WebP/AVIF, serve responsive sizes via srcset, preload with <link rel='preload'>, set fetchpriority='high'. If it's text: preload the font, use font-display:swap. 5) Reduce client-side rendering delay — if using a SPA, consider SSR or SSG so the LCP element is in the initial HTML. 6) Preconnect to required origins — <link rel='preconnect'> for CDN, API, and font origins. 7) Measure impact of each change with Lighthouse and verify with field data.",
      difficulty: "mid",
      followUps: [
        "How does streaming SSR help with LCP?",
        "What if the LCP element is different on mobile vs desktop?",
        "How do you preload a responsive image?"
      ]
    },
    {
      question: "What causes Cumulative Layout Shift and how do you prevent it?",
      answer: "Common causes and fixes: 1) Images/videos without dimensions — the browser doesn't know the size until loaded. Fix: always set width and height attributes, use CSS aspect-ratio. 2) Ads and embeds — dynamically injected content pushes existing content down. Fix: reserve space with min-height or fixed-size containers. 3) Web fonts — FOUT (Flash of Unstyled Text) when the custom font loads and text reflows. Fix: font-display:swap with CSS size-adjust to match fallback font metrics. 4) Dynamic content injection above existing content — banners, notifications. Fix: use position:fixed for overlays, or insert below viewport. 5) Late-loading CSS — styles arriving after initial render cause reflow. Fix: inline critical CSS, preload key stylesheets. Prevention architecture: enforce dimensions on all media components via TypeScript required props or ESLint rules. Monitor CLS in RUM with attribution to catch new shift sources.",
      difficulty: "mid",
      followUps: [
        "How does CSS size-adjust prevent font-related CLS?",
        "Are layout shifts during user interactions counted in CLS?",
        "How would you diagnose which element is causing CLS?"
      ]
    },
    {
      question: "How does INP differ from FID, and why was the change made?",
      answer: "FID (First Input Delay) measured only the input delay (how long the main thread was busy before the handler could run) of the FIRST user interaction. It had two major blind spots: 1) It ignored all subsequent interactions — a page could have excellent FID but terrible responsiveness on later clicks. 2) It measured only the delay, not the processing time or presentation delay — even if the handler took 500ms to run, FID wouldn't capture it. INP (Interaction to Next Paint) fixes both: it measures ALL interactions throughout the page lifecycle and captures the full latency (input delay + processing + presentation delay). It reports the worst interaction at the 98th percentile, giving a more representative picture of the page's overall responsiveness. The threshold is also stricter: INP good <200ms vs FID good <100ms, but INP measures more of the pipeline. The change was made because Google's data showed FID scores were 'good' for 97% of sites, yet users still reported slow interactions — FID was too narrow to capture real responsiveness issues.",
      difficulty: "mid",
      followUps: [
        "What are the three phases of an INP measurement?",
        "How do you optimize each phase of INP?",
        "How does React.startTransition() help with INP?"
      ]
    },
    {
      question: "Explain the difference between lab data and field data (RUM). Which should you prioritize?",
      answer: "Lab data (Lighthouse, Chrome DevTools, WebPageTest) is collected in a controlled environment — fixed device, fixed network, simulated conditions. It's deterministic and reproducible, great for debugging and catching regressions in CI. But it doesn't represent real users. Field data (RUM — Real User Monitoring) is collected from actual users via the web-vitals library or CrUX (Chrome User Experience Report). It captures real device diversity (slow phones in India, fast desktops in the US), real network conditions (3G, flaky WiFi), and real user behavior patterns. Google uses CrUX field data for search ranking, not Lighthouse scores. Prioritize field data for understanding actual user experience and making business decisions. Use lab data for development workflow, debugging specific issues, and CI checks. The ideal setup uses both: Lighthouse CI catches regressions before deploy, RUM dashboards monitor real users after deploy.",
      difficulty: "mid",
      followUps: [
        "How do you segment RUM data to find the most impactful optimizations?",
        "What is CrUX and how is it different from your own RUM?",
        "How do you handle the variance in RUM data?"
      ]
    },
    {
      question: "How would you set up a Core Web Vitals monitoring pipeline for a production application?",
      answer: "Three layers: 1) Development/CI (lab) — Lighthouse CI runs on every PR against key pages (homepage, PDP, checkout). Performance budgets are configured: LCP <2.5s, CLS <0.1, TBT <300ms (proxy for INP in lab). PRs that exceed budgets require justification. 2) Staging/Pre-production — synthetic monitoring (WebPageTest, SpeedCurve) runs scheduled tests from multiple locations and devices. Alerts fire if metrics degrade vs the previous release. 3) Production (field/RUM) — the web-vitals library with attribution collects CWV from real users. Data is sent via sendBeacon to an analytics endpoint, stored in a time-series database (InfluxDB, BigQuery). Dashboards show p75 values segmented by page type, device class, geography, and connection type. Alerts trigger when p75 exceeds thresholds. Additionally, CrUX data is checked monthly for Google's view of your site's performance. The key architectural decision is attribution — collecting not just the metric values but WHY they're bad (which element caused the shift, which handler caused the INP delay) so the team can act on the data.",
      difficulty: "hard",
      followUps: [
        "How do you correlate CWV data with business metrics (conversion, bounce rate)?",
        "How do you handle A/B testing's impact on performance monitoring?",
        "What sampling rate would you use for RUM in a high-traffic site?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Build a Layout Shift Detector",
      difficulty: "mid",
      description: "Create a utility that uses the Layout Instability API (PerformanceObserver) to detect and report layout shifts. It should track which elements shifted, by how much, and log a warning when cumulative CLS exceeds a threshold.",
      solution: `class LayoutShiftDetector {
  constructor(options = {}) {
    this.threshold = options.threshold ?? 0.1;
    this.onShift = options.onShift ?? console.warn;
    this.onThresholdExceeded = options.onThresholdExceeded ?? console.error;
    this.cumulativeScore = 0;
    this.shifts = [];
    this.sessionEntries = [];
    this.sessionValue = 0;
    this.sessionMaxValue = 0;
    this.thresholdExceeded = false;
    this.observer = null;
  }

  start() {
    if (!PerformanceObserver.supportedEntryTypes?.includes('layout-shift')) {
      console.warn('Layout Instability API not supported');
      return;
    }

    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Only count shifts without user input (unexpected shifts)
        if (entry.hadRecentInput) continue;

        const shiftInfo = {
          score: entry.value,
          timestamp: entry.startTime,
          sources: entry.sources?.map(source => ({
            node: source.node?.nodeName || 'unknown',
            nodeId: source.node?.id || '',
            nodeClass: source.node?.className || '',
            previousRect: {
              x: source.previousRect.x,
              y: source.previousRect.y,
              width: source.previousRect.width,
              height: source.previousRect.height,
            },
            currentRect: {
              x: source.currentRect.x,
              y: source.currentRect.y,
              width: source.currentRect.width,
              height: source.currentRect.height,
            },
          })) || [],
        };

        this.shifts.push(shiftInfo);

        // Session window calculation (matches CrUX methodology)
        // Sessions have max 1 second gap and max 5 seconds duration
        if (
          this.sessionEntries.length > 0 &&
          (entry.startTime - this.sessionEntries[this.sessionEntries.length - 1].startTime > 1000 ||
           entry.startTime - this.sessionEntries[0].startTime > 5000)
        ) {
          // New session
          this.sessionEntries = [];
          this.sessionValue = 0;
        }

        this.sessionEntries.push(entry);
        this.sessionValue += entry.value;

        if (this.sessionValue > this.sessionMaxValue) {
          this.sessionMaxValue = this.sessionValue;
        }

        this.cumulativeScore = this.sessionMaxValue;

        // Notify on each shift
        this.onShift(shiftInfo);

        // Check threshold
        if (this.cumulativeScore > this.threshold && !this.thresholdExceeded) {
          this.thresholdExceeded = true;
          this.onThresholdExceeded({
            cumulativeScore: this.cumulativeScore,
            shiftCount: this.shifts.length,
            worstShift: this.shifts.reduce(
              (max, s) => (s.score > max.score ? s : max),
              this.shifts[0]
            ),
          });
        }
      }
    });

    this.observer.observe({ type: 'layout-shift', buffered: true });
  }

  getReport() {
    return {
      cumulativeScore: this.cumulativeScore,
      rating: this.cumulativeScore <= 0.1 ? 'good' :
              this.cumulativeScore <= 0.25 ? 'needs-improvement' : 'poor',
      totalShifts: this.shifts.length,
      shifts: this.shifts,
      worstShift: this.shifts.reduce(
        (max, s) => (s.score > max.score ? s : max),
        this.shifts[0] || null
      ),
    };
  }

  stop() {
    this.observer?.disconnect();
  }
}

// Usage
const detector = new LayoutShiftDetector({
  threshold: 0.1,
  onShift: (shift) => {
    if (shift.score > 0.01) {
      console.warn('Layout shift detected:', {
        score: shift.score.toFixed(4),
        elements: shift.sources.map(s =>
          \`\${s.node}\${s.nodeId ? '#' + s.nodeId : ''}\${s.nodeClass ? '.' + s.nodeClass.split(' ')[0] : ''}\`
        ),
      });
    }
  },
  onThresholdExceeded: (report) => {
    console.error('CLS threshold exceeded!', report);
    // Send alert to monitoring
  },
});

detector.start();

// Later: get a full report
// const report = detector.getReport();`,
      explanation: "Uses the Layout Instability API via PerformanceObserver to detect layout shifts in real time. It filters out expected shifts (those with recent user input) and tracks the CLS score using the session window approach that matches how Chrome calculates CLS (max session value, with sessions having max 1-second gap and 5-second duration). Each shift includes attribution — which DOM elements shifted and from/to what positions. The threshold alert enables proactive detection during development."
    },
    {
      title: "Implement an Interaction Responsiveness Tracker",
      difficulty: "hard",
      description: "Build a tracker that measures the full interaction latency (input delay + processing + presentation) for click and keypress events. It should identify slow interactions (>200ms) and report which event handler caused the delay.",
      solution: `class InteractionTracker {
  constructor(options = {}) {
    this.threshold = options.threshold ?? 200;
    this.onSlowInteraction = options.onSlowInteraction ?? console.warn;
    this.interactions = [];
    this.observer = null;
  }

  start() {
    // Use Event Timing API for accurate interaction measurement
    if (PerformanceObserver.supportedEntryTypes?.includes('event')) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Only track meaningful interactions
          if (!['click', 'keydown', 'pointerdown'].includes(entry.name)) continue;
          // Skip interactions with very short duration (not meaningful)
          if (entry.duration < 16) continue;

          const interaction = {
            type: entry.name,
            startTime: entry.startTime,
            duration: entry.duration,
            // INP phases
            inputDelay: entry.processingStart - entry.startTime,
            processingTime: entry.processingEnd - entry.processingStart,
            presentationDelay: entry.startTime + entry.duration - entry.processingEnd,
            // Target element
            target: entry.target?.tagName || 'unknown',
            targetId: entry.target?.id || '',
            targetClass: entry.target?.className?.split?.(' ')?.[0] || '',
            // Interaction ID groups related entries
            interactionId: entry.interactionId,
          };

          this.interactions.push(interaction);

          if (interaction.duration > this.threshold) {
            this.onSlowInteraction(interaction);
          }
        }
      });

      this.observer.observe({
        type: 'event',
        buffered: true,
        durationThreshold: 16,
      });
    }

    // Also monitor long animation frames for attribution
    if (PerformanceObserver.supportedEntryTypes?.includes('long-animation-frame')) {
      this.loafObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            const scripts = entry.scripts?.map(s => ({
              sourceURL: s.sourceURL,
              sourceFunctionName: s.sourceFunctionName,
              duration: s.duration,
              invokerType: s.invokerType,
            }));

            if (scripts?.length > 0) {
              console.debug('Long Animation Frame:', {
                duration: entry.duration.toFixed(0) + 'ms',
                scripts,
              });
            }
          }
        }
      });

      this.loafObserver.observe({ type: 'long-animation-frame', buffered: true });
    }
  }

  getINPEstimate() {
    if (this.interactions.length === 0) return null;

    // Group by interactionId to deduplicate
    const interactionMap = new Map();
    for (const interaction of this.interactions) {
      const id = interaction.interactionId;
      if (!id) continue;
      const existing = interactionMap.get(id);
      if (!existing || interaction.duration > existing.duration) {
        interactionMap.set(id, interaction);
      }
    }

    const uniqueInteractions = [...interactionMap.values()];
    if (uniqueInteractions.length === 0) return null;

    // INP is the worst interaction at p98
    const sorted = uniqueInteractions.sort((a, b) => b.duration - a.duration);
    const p98Index = Math.max(0, Math.floor(sorted.length * 0.02));
    const inp = sorted[p98Index];

    return {
      value: inp.duration,
      rating: inp.duration <= 200 ? 'good' :
              inp.duration <= 500 ? 'needs-improvement' : 'poor',
      interaction: inp,
      totalInteractions: uniqueInteractions.length,
      slowInteractions: uniqueInteractions.filter(i => i.duration > this.threshold).length,
    };
  }

  getReport() {
    const slowInteractions = this.interactions
      .filter(i => i.duration > this.threshold)
      .sort((a, b) => b.duration - a.duration);

    const byType = {};
    for (const i of this.interactions) {
      if (!byType[i.type]) byType[i.type] = { count: 0, totalDuration: 0, maxDuration: 0 };
      byType[i.type].count++;
      byType[i.type].totalDuration += i.duration;
      byType[i.type].maxDuration = Math.max(byType[i.type].maxDuration, i.duration);
    }

    return {
      inp: this.getINPEstimate(),
      totalInteractions: this.interactions.length,
      slowInteractions: slowInteractions.slice(0, 10),
      byType,
    };
  }

  stop() {
    this.observer?.disconnect();
    this.loafObserver?.disconnect();
  }
}

// Usage
const tracker = new InteractionTracker({
  threshold: 200,
  onSlowInteraction: (interaction) => {
    console.warn(\`Slow \${interaction.type} on \${interaction.target}: \${interaction.duration.toFixed(0)}ms\`, {
      inputDelay: interaction.inputDelay.toFixed(0) + 'ms',
      processingTime: interaction.processingTime.toFixed(0) + 'ms',
      presentationDelay: interaction.presentationDelay.toFixed(0) + 'ms',
    });
    // Send to monitoring
    reportSlowInteraction(interaction);
  },
});

tracker.start();

// Check INP estimate periodically
setInterval(() => {
  const inp = tracker.getINPEstimate();
  if (inp) {
    console.log(\`Estimated INP: \${inp.value.toFixed(0)}ms (\${inp.rating})\`);
  }
}, 10000);`,
      explanation: "Uses the Event Timing API to measure the full interaction lifecycle: input delay (main thread busy), processing time (event handler execution), and presentation delay (rendering). Each interaction is tracked with its target element for debugging. The INP estimate groups interactions by interactionId (deduplicating related events like pointerdown + click) and reports the 98th percentile worst interaction. The Long Animation Frame observer provides script-level attribution for slow frames. This gives developers the same data that Chrome uses to calculate INP, enabling targeted optimization."
    },
    {
      title: "Create a Performance Budget Checker",
      difficulty: "mid",
      description: "Build a utility that runs in the browser and checks if the current page meets defined performance budgets for LCP, CLS, INP, total JS size, and number of requests. It should collect all metrics and produce a pass/fail report.",
      solution: `class PerformanceBudgetChecker {
  constructor(budgets = {}) {
    this.budgets = {
      lcp: budgets.lcp ?? 2500,           // ms
      cls: budgets.cls ?? 0.1,             // score
      fcp: budgets.fcp ?? 1800,            // ms
      ttfb: budgets.ttfb ?? 800,           // ms
      totalJSSize: budgets.totalJSSize ?? 300_000,   // bytes
      totalRequests: budgets.totalRequests ?? 50,
      longTasks: budgets.longTasks ?? 3,   // count
      ...budgets,
    };

    this.metrics = {};
    this.observers = [];
  }

  async collectMetrics(timeout = 10000) {
    return new Promise((resolve) => {
      const done = () => {
        this.observers.forEach(obs => obs.disconnect());
        resolve(this.metrics);
      };

      const timer = setTimeout(done, timeout);

      // Collect Web Vitals
      if (PerformanceObserver.supportedEntryTypes?.includes('largest-contentful-paint')) {
        const lcpObs = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          this.metrics.lcp = entries[entries.length - 1]?.startTime;
        });
        lcpObs.observe({ type: 'largest-contentful-paint', buffered: true });
        this.observers.push(lcpObs);
      }

      if (PerformanceObserver.supportedEntryTypes?.includes('layout-shift')) {
        let clsValue = 0;
        const clsObs = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          this.metrics.cls = clsValue;
        });
        clsObs.observe({ type: 'layout-shift', buffered: true });
        this.observers.push(clsObs);
      }

      if (PerformanceObserver.supportedEntryTypes?.includes('longtask')) {
        let longTaskCount = 0;
        const ltObs = new PerformanceObserver((list) => {
          longTaskCount += list.getEntries().length;
          this.metrics.longTasks = longTaskCount;
        });
        ltObs.observe({ type: 'longtask', buffered: true });
        this.observers.push(ltObs);
      }

      // Navigation timing
      const navEntry = performance.getEntriesByType('navigation')[0];
      if (navEntry) {
        this.metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
        this.metrics.fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime;
      }

      // Resource metrics
      const resources = performance.getEntriesByType('resource');
      this.metrics.totalRequests = resources.length;
      this.metrics.totalJSSize = resources
        .filter(r => r.initiatorType === 'script')
        .reduce((sum, r) => sum + (r.transferSize || 0), 0);
      this.metrics.totalCSSSize = resources
        .filter(r => r.initiatorType === 'link' || r.initiatorType === 'css')
        .reduce((sum, r) => sum + (r.transferSize || 0), 0);
      this.metrics.totalImageSize = resources
        .filter(r => r.initiatorType === 'img')
        .reduce((sum, r) => sum + (r.transferSize || 0), 0);

      // Wait for LCP to stabilize (fires on page visibility change)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          clearTimeout(timer);
          done();
        }
      }, { once: true });
    });
  }

  checkBudgets() {
    const results = {};
    let allPassed = true;

    for (const [metric, budget] of Object.entries(this.budgets)) {
      const actual = this.metrics[metric];
      if (actual === undefined) {
        results[metric] = { status: 'unknown', budget, actual: null };
        continue;
      }

      const passed = actual <= budget;
      if (!passed) allPassed = false;

      results[metric] = {
        status: passed ? 'pass' : 'fail',
        budget,
        actual: typeof actual === 'number' ? Math.round(actual * 100) / 100 : actual,
        overBy: passed ? 0 : Math.round((actual - budget) * 100) / 100,
      };
    }

    return { passed: allPassed, results };
  }

  formatReport() {
    const { passed, results } = this.checkBudgets();
    const lines = [];

    lines.push(passed ? 'PERFORMANCE BUDGET: ALL PASSED' : 'PERFORMANCE BUDGET: FAILED');
    lines.push('─'.repeat(55));

    for (const [metric, result] of Object.entries(results)) {
      const icon = result.status === 'pass' ? '[PASS]' :
                   result.status === 'fail' ? '[FAIL]' : '[????]';
      const unit = ['cls'].includes(metric) ? '' :
                   ['totalJSSize', 'totalCSSSize', 'totalImageSize'].includes(metric) ? ' bytes' :
                   ['totalRequests', 'longTasks'].includes(metric) ? '' : 'ms';

      lines.push(
        \`\${icon} \${metric.padEnd(16)} actual: \${String(result.actual ?? 'N/A').padStart(8)}\${unit}  budget: \${String(result.budget).padStart(8)}\${unit}\`
      );
    }

    return lines.join('\\n');
  }
}

// Usage
async function checkPagePerformance() {
  const checker = new PerformanceBudgetChecker({
    lcp: 2500,
    cls: 0.1,
    fcp: 1800,
    ttfb: 800,
    totalJSSize: 300_000,
    totalRequests: 50,
    longTasks: 3,
  });

  await checker.collectMetrics(8000);
  console.log(checker.formatReport());

  const { passed, results } = checker.checkBudgets();
  if (!passed) {
    const failures = Object.entries(results)
      .filter(([, r]) => r.status === 'fail')
      .map(([metric, r]) => \`\${metric}: \${r.actual} (budget: \${r.budget})\`);
    console.error('Budget failures:', failures);
  }

  return { passed, results };
}

checkPagePerformance();`,
      explanation: "Collects real performance metrics using browser APIs (PerformanceObserver for LCP, CLS, Long Tasks; Navigation Timing for TTFB and FCP; Resource Timing for JS/CSS/image sizes and request counts). Then compares each metric against defined budgets and produces a pass/fail report. This can be used in development for quick checks, in CI with Puppeteer/Playwright to automate budget enforcement, or as a debugging tool to quickly assess any page's performance. The formatted report provides a clear view of which budgets passed and by how much each failure exceeded the budget."
    }
  ],
  quiz: [
    {
      question: "What is the 'good' threshold for Largest Contentful Paint (LCP)?",
      options: [
        "Under 1.0 second",
        "Under 2.5 seconds",
        "Under 4.0 seconds",
        "Under 100 milliseconds"
      ],
      correct: 1,
      explanation: "Google defines LCP as 'good' when it occurs within 2.5 seconds of page load. Between 2.5s and 4.0s is 'needs improvement,' and above 4.0s is 'poor.' This threshold applies at the 75th percentile of real user page loads."
    },
    {
      question: "Which of the following does NOT cause a CLS (layout shift)?",
      options: [
        "An image loading without explicit width/height attributes",
        "A web font loading and changing text metrics",
        "A CSS animation using transform: translateY()",
        "An ad banner injected above existing content"
      ],
      correct: 2,
      explanation: "CSS transforms (translate, scale, rotate) move elements visually without affecting the document layout. They operate on the compositor layer and don't trigger layout recalculation, so they produce no layout shift. Images without dimensions, font loading, and dynamic content injection all trigger actual layout changes that count as CLS."
    },
    {
      question: "Why did Google replace FID (First Input Delay) with INP (Interaction to Next Paint)?",
      options: [
        "FID was too hard to measure accurately",
        "FID only measured the first interaction's delay, missing ongoing responsiveness issues",
        "INP is easier for developers to optimize",
        "FID was causing performance regressions in modern browsers"
      ],
      correct: 1,
      explanation: "FID only measured the input delay (not processing or rendering time) of the first interaction only. 97% of sites had 'good' FID, yet users still experienced slow interactions. INP measures the full latency (input delay + processing + presentation delay) of ALL interactions throughout the session, giving a much more accurate picture of real-world responsiveness."
    },
    {
      question: "What is the most important data source for Core Web Vitals that impacts Google search ranking?",
      options: [
        "Lighthouse lab scores",
        "Chrome DevTools Performance panel",
        "Chrome User Experience Report (CrUX) field data",
        "WebPageTest results"
      ],
      correct: 2,
      explanation: "Google uses CrUX (Chrome User Experience Report) field data — real measurements from Chrome users who have opted into sharing — for search ranking decisions. Lighthouse and other lab tools are useful for development and debugging but don't represent real-world user experience. CrUX captures the diversity of devices, networks, and usage patterns that lab testing cannot replicate."
    },
    {
      question: "Which LCP optimization has the MOST impact for a client-side rendered React SPA?",
      options: [
        "Preloading the hero image",
        "Implementing server-side rendering (SSR) or static generation (SSG)",
        "Minifying JavaScript",
        "Adding a CDN"
      ],
      correct: 1,
      explanation: "In a client-side rendered SPA, the LCP element can't render until: HTML downloads, JS downloads and parses, React hydrates, components render, and data fetches complete. SSR/SSG sends rendered HTML from the server, so the LCP element is visible immediately after HTML arrives — eliminating the entire JS boot sequence from the critical path. This typically reduces LCP by 2-4 seconds. Image preloading and CDN help but don't address the fundamental CSR bottleneck."
    }
  ]
};
