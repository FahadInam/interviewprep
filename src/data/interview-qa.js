// Interview Q&A — Most Frequently Asked Frontend Interview Questions
// Two categories: Conceptual (theory) and Scenario-Based (practical problem-solving)

export const interviewQA = {
  conceptual: [
    {
      id: 1,
      question: "What is the difference between GraphQL and REST API?",
      answer: `REST uses fixed endpoints — each URL returns a specific shape of data (e.g., /users/1 gives you everything about user 1, whether you need it or not).

GraphQL uses a single endpoint. You send a query describing exactly what fields you want, and the server returns only that.

Key differences:
• Over-fetching: REST often sends more data than needed. GraphQL lets you request only the fields you need.
• Under-fetching: In REST, you might need 3 API calls (user, posts, comments). In GraphQL, one query can fetch all of them.
• Versioning: REST APIs need versions (/v1/, /v2/). GraphQL evolves by adding new fields without breaking old queries.
• Caching: REST is easier to cache (each URL = a cache key). GraphQL caching is trickier since all requests go to one endpoint.

When to use REST: Simple CRUD apps, public APIs, when HTTP caching is important.
When to use GraphQL: Complex UIs needing data from multiple sources, mobile apps (save bandwidth), rapidly evolving requirements.`,
      tags: ["API", "Architecture"],
    },
    {
      id: 2,
      question: "How do you decide which library to use in a project? (e.g., Day.js vs Moment.js)",
      answer: `I evaluate libraries on 5 key criteria:

1. Bundle size — How much will it add? (Moment.js is 300KB+, Day.js is 2KB). Use bundlephobia.com to check.

2. Maintenance — Is it actively maintained? Check last commit date, open issues, and release frequency. Moment.js is deprecated; Day.js and date-fns are actively maintained.

3. API & DX — Does it solve my specific need? Is the API clean? Day.js has the same API as Moment but is immutable and tree-shakeable.

4. Community & ecosystem — NPM weekly downloads, GitHub stars, Stack Overflow answers. A big community means faster answers to problems.

5. Tree-shaking support — Does it support ES modules? Can I import only what I need? (date-fns lets you import individual functions; Moment.js imports everything).

My thought process:
• Check bundlephobia.com for size comparison
• Look at the npm trends page to compare popularity
• Read the "Why not Moment.js?" section in their own docs
• Try the API in a quick sandbox
• For date handling in 2025+: Day.js for simple needs, date-fns for utility-style, Temporal API (native) for new projects`,
      tags: ["Architecture", "Decision Making"],
    },
    {
      id: 3,
      question: "How do you reduce bundle size in a frontend application?",
      answer: `Step-by-step approach:

1. Analyze first — Run webpack-bundle-analyzer or next build to see what's taking space. Don't guess.

2. Code splitting — Use dynamic imports: const Chart = lazy(() => import('./Chart')). Each route should be its own chunk.

3. Tree shaking — Use ES module imports (import { debounce } from 'lodash-es' instead of import _ from 'lodash'). This lets the bundler remove unused code.

4. Replace heavy libraries:
   • moment → day.js (300KB → 2KB)
   • lodash → lodash-es or native methods
   • axios → fetch (built-in)

5. Optimize images — Use next/image or WebP format. Lazy load below-the-fold images.

6. Compress — Enable gzip/brotli on your server. Brotli gives ~15-20% better compression.

7. Remove dead code — Check for unused dependencies with depcheck. Remove unused components and imports.

8. Lazy load heavy features — Rich text editors, charts, maps — only load when the user actually needs them.

Real impact: These steps typically cut bundle size by 40-60%. The biggest wins usually come from replacing heavy libraries and code splitting.`,
      tags: ["Performance", "Optimization"],
    },
    {
      id: 4,
      question: "What is Webpack and how does it create bundles?",
      answer: `Webpack is a module bundler — it takes all your files (JS, CSS, images, etc.) and combines them into optimized bundles the browser can use.

How it works step by step:

1. Entry point — Webpack starts from your entry file (usually index.js or app.js).

2. Dependency graph — It reads every import/require statement and builds a tree of all files that depend on each other.

3. Loaders — Files that aren't JavaScript (CSS, images, TypeScript) get transformed by loaders. For example, babel-loader converts modern JS to older syntax, css-loader reads CSS files.

4. Plugins — After bundling, plugins optimize the output. For example, TerserPlugin minifies code, MiniCssExtractPlugin pulls CSS into separate files.

5. Output — Webpack writes the final bundles (usually to a /dist folder). It can split code into multiple chunks for better loading.

Key concepts:
• Chunks — Code-split pieces loaded on demand
• Hash filenames — For cache busting (app.abc123.js)
• Hot Module Replacement (HMR) — Updates in dev without full page reload

Modern alternatives: Vite (uses native ES modules for dev, Rollup for builds — 10-100x faster dev server), Turbopack (Rust-based, Next.js default).`,
      tags: ["Tooling", "Build"],
    },
    {
      id: 5,
      question: "What is Tree Shaking? How does it work and how does it decide what to remove?",
      answer: `Tree shaking removes unused code from your final bundle. The name comes from "shaking a tree" — dead leaves (unused code) fall off.

How it works:

1. Relies on ES modules — import/export are static (analyzable at build time). CommonJS (require) is dynamic, so it can't be tree-shaken.

2. The bundler (Webpack/Rollup/Vite) builds a dependency graph and marks which exports are actually imported somewhere.

3. Unused exports are removed during minification (by Terser or similar).

Example:
// math.js exports add, subtract, multiply
// You only import { add } from './math'
// subtract and multiply are removed from the bundle

What BREAKS tree shaking:
• Side effects — If a module runs code on import (like polyfills or CSS), the bundler can't remove it safely.
• Re-exporting everything — barrel files (index.js that does export * from './everything') can prevent tree shaking.
• CommonJS imports — require() is dynamic, bundler can't analyze it.

How to ensure tree shaking works:
• Use "sideEffects": false in package.json to tell the bundler your modules are safe to tree-shake
• Import specifically: import { debounce } from 'lodash-es' (NOT import _ from 'lodash')
• Avoid barrel files that re-export everything in large libraries`,
      tags: ["Performance", "Tooling"],
    },
    {
      id: 6,
      question: "What is Suspense in React?",
      answer: `Suspense lets you show a fallback (like a loading spinner) while waiting for something to load.

Basic usage:
<Suspense fallback={<Spinner />}>
  <SomeComponent />
</Suspense>

What Suspense can wait for:
1. Lazy-loaded components — const LazyChart = lazy(() => import('./Chart'))
2. Data fetching — With frameworks like Next.js or libraries like React Query that support Suspense mode
3. Server Components — Streaming server-rendered content

How it works:
When a component inside <Suspense> isn't ready (it "suspends"), React shows the fallback. Once ready, it swaps in the real content. No manual isLoading state needed.

Nested Suspense:
You can nest multiple <Suspense> boundaries for granular loading states. The outer content shows first, inner sections load independently.

<Suspense fallback={<PageSkeleton />}>
  <Header />
  <Suspense fallback={<FeedSkeleton />}>
    <Feed />   {/* This can load independently */}
  </Suspense>
</Suspense>

Why it matters: Suspense simplifies loading state management, enables streaming SSR, and lets React prioritize what the user sees first.`,
      tags: ["React", "Performance"],
    },
    {
      id: 7,
      question: "What are loaders and actions in React Router?",
      answer: `Loaders and actions are React Router's data fetching primitives (v6.4+). They move data logic out of components and into the route definition.

Loaders — fetch data BEFORE the route renders:
{
  path: "/users/:id",
  loader: async ({ params }) => {
    return fetch('/api/users/' + params.id);
  },
  element: <UserProfile />
}

Inside the component, you access data with useLoaderData():
function UserProfile() {
  const user = useLoaderData(); // Already loaded, no useEffect needed
}

Actions — handle form submissions and mutations:
{
  path: "/users/:id",
  action: async ({ request, params }) => {
    const formData = await request.formData();
    await updateUser(params.id, formData);
    return redirect('/users');
  }
}

Submit with <Form method="post"> instead of <form>.

Why this pattern matters:
• No loading spinners in components — data is ready when the route renders
• Automatic revalidation — After an action, loaders re-run automatically (fresh data)
• Progressive enhancement — Forms work even without JavaScript
• Parallel loading — Nested route loaders fire simultaneously

Think of it like: loader = GET (read data), action = POST/PUT/DELETE (write data).`,
      tags: ["React", "React Router"],
    },
    {
      id: 8,
      question: "What is hydration and dehydration?",
      answer: `These terms describe how server-rendered HTML becomes interactive in the browser.

Dehydration (server side):
The server renders your React components to HTML string + serializes the state into JSON. This HTML is sent to the browser. It's called "dehydration" because you're extracting the data/state out, like removing water from something.

Hydration (client side):
The browser receives the HTML (which the user can already see and read). Then React "hydrates" it — it attaches event handlers, hooks, and state to the existing HTML instead of re-creating it. The page becomes interactive.

The flow:
1. Server renders HTML + serialized state → User sees content immediately
2. Browser loads JavaScript bundle
3. React hydrates — attaches event listeners to existing DOM
4. App is now fully interactive

Common hydration errors:
• Server/client mismatch — If the HTML rendered on server is different from what React expects on client (e.g., using Date.now() or window.innerWidth during render)
• Fix: Use useEffect for client-only values, or suppressHydrationWarning for known differences

Performance consideration:
Full hydration can be slow for large pages. Solutions:
• Selective hydration (React 18) — Hydrate interactive parts first
• React Server Components — Components that never hydrate (zero client JS)
• Islands architecture (Astro) — Only hydrate interactive "islands"`,
      tags: ["React", "Next.js", "SSR"],
    },
    {
      id: 9,
      question: "What is the Critical Rendering Path?",
      answer: `The Critical Rendering Path (CRP) is the sequence of steps the browser takes to convert HTML, CSS, and JavaScript into pixels on screen.

The steps:
1. HTML parsing → DOM tree (Document Object Model)
2. CSS parsing → CSSOM tree (CSS Object Model)
3. Combine DOM + CSSOM → Render tree (only visible elements)
4. Layout — Calculate position and size of every element
5. Paint — Fill in pixels (colors, borders, shadows, text)
6. Composite — Layer elements together (especially for transforms, opacity)

Why it matters for performance:
• CSS blocks rendering — The browser won't paint until ALL CSS is parsed. Keep critical CSS small and inline it.
• JavaScript blocks parsing — A <script> tag stops HTML parsing until the script downloads and executes. Use async or defer attributes.
• Render-blocking resources — Anything that delays step 1-3 delays First Paint.

How to optimize:
• Inline critical CSS (above-the-fold styles) in <head>
• Defer non-critical CSS with media queries or loadCSS
• Add async/defer to script tags
• Minimize DOM depth — Deeply nested elements slow layout calculation
• Avoid layout thrashing — Don't read then write to DOM in a loop (forces multiple layout recalculations)

This is why Lighthouse measures metrics like FCP (First Contentful Paint) and LCP (Largest Contentful Paint) — they directly relate to CRP optimization.`,
      tags: ["Browser", "Performance"],
    },
    {
      id: 10,
      question: "What are stale closures?",
      answer: `A stale closure happens when a function "captures" a variable's value at one point in time, and that value becomes outdated — but the function still uses the old value.

Simple example:
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      console.log(count); // Always logs 0! Stale closure.
      setCount(count + 1); // Always sets to 1!
    }, 1000);
    return () => clearInterval(id);
  }, []); // Empty deps = effect only runs once, captures count = 0
}

Why it happens:
The useEffect callback "closes over" the count variable from the first render. Even though count updates to 1, 2, 3, the setInterval callback still has a reference to the original count = 0.

How to fix:
1. Functional updater:
   setCount(prev => prev + 1);  // Uses latest value, not the closed-over one

2. Add to dependency array:
   useEffect(() => { ... }, [count]);  // Re-runs when count changes

3. Use a ref for values you need to read (not trigger re-renders):
   const countRef = useRef(count);
   countRef.current = count;  // Always up to date

Most common places stale closures happen:
• setInterval/setTimeout inside useEffect
• Event listeners added in useEffect
• Callbacks passed to child components without proper memoization`,
      tags: ["JavaScript", "React", "Closures"],
    },
    {
      id: 11,
      question: "What is the Virtual DOM and how does React's diffing work?",
      answer: `The Virtual DOM is a lightweight JavaScript representation of the real DOM. Instead of updating the real DOM directly (which is slow), React:

1. Creates a new Virtual DOM when state changes
2. Compares (diffs) the new tree with the previous one
3. Calculates the minimum set of changes needed
4. Applies only those changes to the real DOM (this is called "reconciliation")

How the diffing algorithm works:
• Same type → React keeps the DOM node and updates changed attributes/props
• Different type → React destroys the old node and creates a new one (and all its children)
• Lists → React uses "key" props to match old and new items. Without keys, React re-renders the entire list; with keys, it only moves/updates changed items.

Why keys matter:
// BAD: Using index as key — React can't tell items apart when order changes
items.map((item, i) => <li key={i}>{item}</li>)

// GOOD: Using unique ID
items.map(item => <li key={item.id}>{item.name}</li>)

Performance insight: Appending to the end of a list is cheap. Inserting at the beginning is expensive (every item shifts). That's why proper keys are critical for reordering.`,
      tags: ["React", "Performance"],
    },
    {
      id: 12,
      question: "What is the difference between SSR, SSG, ISR, and CSR?",
      answer: `These are rendering strategies — they decide WHEN and WHERE your HTML is generated.

CSR (Client-Side Rendering):
• Browser downloads empty HTML + JS bundle → JS renders the page
• Pros: Rich interactivity, easy to deploy (static files)
• Cons: Slow initial load, bad for SEO (search engines see empty page)
• Example: Classic Create React App

SSR (Server-Side Rendering):
• Server generates full HTML on EVERY request → sends to browser
• Pros: Fast first paint, great for SEO, always fresh data
• Cons: Server runs on every request (higher load), slower TTFB under heavy traffic
• Example: Next.js pages using server components or getServerSideProps

SSG (Static Site Generation):
• HTML generated at BUILD time → served as static files from CDN
• Pros: Fastest possible load, cheapest to host, great SEO
• Cons: Data is stale until next build, build time grows with pages
• Example: Blog posts, marketing pages, documentation

ISR (Incremental Static Regeneration):
• Static pages that re-generate in the background after a set time
• Pros: Best of SSG + SSR — fast static serving with periodic fresh data
• Cons: Data can be stale for the revalidation window
• Example: E-commerce product pages (revalidate every 60 seconds)

Decision guide:
• Blog/docs → SSG
• Dashboard/user-specific → SSR or CSR
• E-commerce catalog → ISR
• Highly interactive SPA → CSR with selective SSR`,
      tags: ["Next.js", "Architecture"],
    },
    {
      id: 13,
      question: "What are React Server Components (RSCs)? How are they different from SSR?",
      answer: `React Server Components run ONLY on the server and send zero JavaScript to the browser.

SSR vs RSCs:
• SSR renders HTML on the server, but the component's JavaScript still ships to the client for hydration (event handlers, interactivity).
• RSCs render on the server and STAY on the server. No JavaScript for that component is sent to the browser. Ever.

What RSCs can do that client components can't:
• Directly access databases, file systems, internal APIs
• Use heavy libraries (markdown parser, syntax highlighter) without affecting bundle size
• Await async data inline — no useEffect, no loading states

What RSCs CANNOT do:
• Use useState, useEffect, or any hooks
• Handle user events (onClick, onChange)
• Access browser APIs (window, localStorage)

When to use each:
• Server Component (default in Next.js App Router): Static content, data display, layouts, anything non-interactive
• Client Component (add 'use client'): Forms, buttons, interactive features, anything that responds to user input

The mental model:
Think of RSCs as the "static shell" and Client Components as "interactive islands" within that shell. The goal is to keep as much as possible on the server to minimize JavaScript sent to the browser.`,
      tags: ["React", "Next.js"],
    },
    {
      id: 14,
      question: "What is code splitting and how does lazy loading work?",
      answer: `Code splitting breaks your app's JavaScript into smaller chunks that load on demand instead of one giant bundle.

Without code splitting:
User visits homepage → downloads ALL JavaScript for every page (including admin panel, settings, charts they haven't visited yet)

With code splitting:
User visits homepage → downloads only homepage JS. Visits settings → downloads settings JS.

How to implement in React:

1. Route-based splitting (most common):
const Settings = lazy(() => import('./pages/Settings'));

<Suspense fallback={<Spinner />}>
  <Routes>
    <Route path="/settings" element={<Settings />} />
  </Routes>
</Suspense>

2. Component-based splitting (heavy components):
const Chart = lazy(() => import('./Chart'));
// Chart JS only loads when it's actually rendered

3. Next.js does it automatically — Every page in the pages/ or app/ directory is a separate chunk.

How lazy loading works under the hood:
• lazy() tells React "don't import this yet"
• When the component is needed, it triggers a dynamic import()
• import() returns a Promise that resolves to the module
• Webpack/bundler creates a separate chunk file for that module
• The chunk is fetched over the network when needed
• Suspense shows the fallback while waiting, then renders the component

Best practices:
• Split at route level first (biggest wins)
• Split heavy third-party libs (chart libraries, rich text editors)
• Prefetch next likely routes: <Link prefetch={true}>
• Don't over-split — too many tiny chunks can hurt (many HTTP requests)`,
      tags: ["Performance", "React"],
    },
    {
      id: 15,
      question: "What is the difference between useEffect, useLayoutEffect, and useInsertionEffect?",
      answer: `All three run after rendering, but at different times:

useEffect (most common — use this by default):
• Runs AFTER the browser has painted the screen
• Non-blocking — user sees the UI immediately, effect runs in background
• Use for: API calls, subscriptions, analytics, timers
• Timing: Render → Paint → useEffect

useLayoutEffect:
• Runs AFTER render but BEFORE the browser paints
• Blocking — browser waits for it to finish before showing anything
• Use for: Measuring DOM (element size/position), preventing visual flicker
• Example: Tooltip positioning — you need to know element dimensions before showing
• Timing: Render → useLayoutEffect → Paint

useInsertionEffect (rare — library authors only):
• Runs BEFORE React makes any DOM changes
• Used by CSS-in-JS libraries to inject <style> tags before layout
• You almost never use this directly
• Timing: useInsertionEffect → DOM mutations → useLayoutEffect → Paint → useEffect

Decision rule:
• Default to useEffect (99% of cases)
• If you see visual flicker (element jumps position), switch to useLayoutEffect
• Only use useInsertionEffect if you're building a CSS-in-JS library`,
      tags: ["React", "Hooks"],
    },
    {
      id: 16,
      question: "What is CORS and how do you handle CORS errors?",
      answer: `CORS (Cross-Origin Resource Sharing) is a browser security feature that blocks requests from one domain to another unless the server explicitly allows it.

Why it exists:
Without CORS, any website could make API calls to your bank's website using your cookies — stealing your data. CORS prevents this.

When CORS kicks in:
Your app is on localhost:3000, your API is on api.example.com → different origin → browser sends a preflight OPTIONS request asking "can I make this request?"

The CORS error means:
The server didn't include the Access-Control-Allow-Origin header in its response, so the browser blocked the response.

How to fix:

1. Server-side (the real fix):
   // Express example
   app.use(cors({ origin: 'https://myapp.com' }));

   This adds the header: Access-Control-Allow-Origin: https://myapp.com

2. API route proxy (Next.js / dev):
   // Instead of calling external API from browser,
   // call your own API route which calls the external API
   // Server-to-server requests don't have CORS

3. During development:
   • Use a proxy in vite.config.js or next.config.js
   • Or use the CORS browser extension (dev only!)

4. Never do in production:
   • Access-Control-Allow-Origin: * (allows any site)
   • Disabling CORS entirely

Key headers to know:
• Access-Control-Allow-Origin — Which domains can access
• Access-Control-Allow-Methods — Which HTTP methods (GET, POST, etc.)
• Access-Control-Allow-Headers — Which custom headers are allowed
• Access-Control-Allow-Credentials — Whether cookies are included`,
      tags: ["Browser", "Security", "API"],
    },
    {
      id: 17,
      question: "What are Web Vitals (LCP, FID/INP, CLS) and why do they matter?",
      answer: `Web Vitals are Google's metrics for measuring real user experience. They directly affect SEO rankings.

LCP (Largest Contentful Paint) — Loading speed
• Measures when the biggest visible element finishes loading (hero image, main heading)
• Good: < 2.5s | Poor: > 4s
• Fix: Optimize images, preload critical resources, use CDN, reduce server response time

FID → INP (Interaction to Next Paint) — Responsiveness
• FID measured delay of FIRST interaction. INP (its replacement) measures ALL interactions throughout the page visit.
• Measures how quickly the page responds when you click/tap something
• Good: < 200ms | Poor: > 500ms
• Fix: Break up long JavaScript tasks, use web workers for heavy computation, code-split aggressively

CLS (Cumulative Layout Shift) — Visual stability
• Measures unexpected layout shifts (elements moving around as page loads)
• Good: < 0.1 | Poor: > 0.25
• Fix: Always set width/height on images/videos, avoid inserting content above existing content, use CSS contain

Why they matter:
• Google uses them as ranking signals — Poor vitals = lower search ranking
• They measure real user experience, not synthetic benchmarks
• Tools: Lighthouse (lab data), Chrome UX Report (real user data), Web Vitals Chrome extension

Quick wins for all three:
1. Use next/image for automatic image optimization
2. Lazy load below-the-fold content
3. Font-display: swap to prevent invisible text
4. Preconnect to critical third-party origins`,
      tags: ["Performance", "SEO"],
    },
    {
      id: 18,
      question: "What is the difference between cookies, localStorage, and sessionStorage?",
      answer: `All three store data in the browser, but they work very differently:

Cookies:
• Size: ~4KB per cookie
• Lifetime: Set by expiry date (or session)
• Sent with every HTTP request to the server automatically
• Accessible: Server + Client (unless HttpOnly flag is set)
• Use for: Authentication tokens, session IDs, server-needed data
• Security: Use HttpOnly + Secure + SameSite flags

localStorage:
• Size: ~5-10MB
• Lifetime: Persists forever until manually cleared
• NOT sent to server
• Accessible: Client-side JavaScript only
• Use for: User preferences, theme settings, cached data
• Risk: Vulnerable to XSS attacks — never store auth tokens here

sessionStorage:
• Size: ~5-10MB
• Lifetime: Cleared when the browser tab closes
• NOT sent to server
• Accessible: Client-side JavaScript only
• Per-tab isolation — different tabs have different sessionStorage
• Use for: Form drafts, temporary wizard data, one-time session data

Decision guide:
• Auth tokens → HttpOnly cookies (server sets them, JS can't access = XSS safe)
• User preferences (dark mode) → localStorage
• Form data during multi-step wizard → sessionStorage
• Shopping cart → localStorage (persists) or cookies (server needs it)

Common interview trap:
"Why not store JWT in localStorage?" → Because any XSS vulnerability can steal it. HttpOnly cookies are invisible to JavaScript, making them XSS-proof.`,
      tags: ["Browser", "Security"],
    },
    {
      id: 19,
      question: "What is event delegation and why is it useful?",
      answer: `Event delegation is attaching ONE event listener to a parent element instead of many listeners on each child.

Example:
// BAD: 1000 buttons = 1000 listeners
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', handleClick);
});

// GOOD: 1 listener on parent handles all buttons
document.getElementById('button-container').addEventListener('click', (e) => {
  if (e.target.matches('.btn')) {
    handleClick(e);
  }
});

Why it works:
Events in the DOM "bubble up" — when you click a button, the click event fires on the button, then its parent, then its grandparent, all the way up to document. The parent listener catches it.

Benefits:
1. Memory efficient — 1 listener vs 1000 listeners
2. Dynamic elements — Works for elements added AFTER the listener is attached (no need to re-bind)
3. Cleaner code — One place to handle events
4. Better performance — Fewer event listeners = less memory usage

Real-world use:
React already uses event delegation internally — it attaches a single listener at the root and delegates to your component handlers.

When NOT to use:
• Events that don't bubble (focus, blur, scroll) — use focusin/focusout instead
• When you need to stopPropagation on specific elements
• Performance-critical scenarios where checking e.target is expensive (very rare)`,
      tags: ["JavaScript", "DOM"],
    },
    {
      id: 20,
      question: "What is debouncing vs throttling? When would you use each?",
      answer: `Both limit how often a function runs, but in different ways:

Debouncing:
Waits until the user STOPS doing something, then fires once.
"Don't run until there's a pause."

Example: Search input — don't search on every keystroke, wait until user stops typing for 300ms.
const debouncedSearch = debounce((query) => fetchResults(query), 300);

Throttling:
Runs at most once every X milliseconds, no matter how many times it's triggered.
"Run at most once every N ms."

Example: Scroll handler — update position indicator at most every 100ms, even if scroll fires 60 times per second.
const throttledScroll = throttle(() => updatePosition(), 100);

When to use debounce:
• Search input / autocomplete
• Window resize handler (recalculate layout after user finishes resizing)
• Auto-save (save after user stops editing)
• Validation (validate after user finishes typing)

When to use throttle:
• Scroll events (infinite scroll, parallax)
• Mouse move / drag events
• API rate limiting
• Button click (prevent double-submit)
• Analytics event tracking

Key difference in behavior:
• User types continuously for 5 seconds with 300ms debounce → function runs ONCE (after they stop)
• User scrolls continuously for 5 seconds with 100ms throttle → function runs ~50 times (every 100ms)`,
      tags: ["JavaScript", "Performance"],
    },
    {
      id: 21,
      question: "What are Microtasks vs Macrotasks in the event loop?",
      answer: `The event loop has two task queues with different priorities:

Macrotasks (lower priority):
• setTimeout, setInterval
• setImmediate (Node.js)
• I/O operations
• UI rendering events
→ One macrotask is processed per event loop cycle

Microtasks (higher priority):
• Promise.then/.catch/.finally
• queueMicrotask()
• MutationObserver
→ ALL microtasks are processed before the next macrotask

Execution order:
1. Run current synchronous code (call stack)
2. Drain the entire microtask queue
3. Browser may render/paint
4. Pick ONE macrotask from the queue
5. Go to step 2

Classic interview question:
console.log('1');                    // sync
setTimeout(() => console.log('2')); // macrotask
Promise.resolve().then(() => console.log('3')); // microtask
console.log('4');                    // sync

// Output: 1, 4, 3, 2
// Sync first (1, 4), then microtask (3), then macrotask (2)

Why it matters:
• Promises always resolve before setTimeout, even setTimeout(fn, 0)
• Too many microtasks can block rendering (infinite microtask loop = frozen page)
• Understanding this helps debug race conditions and unexpected execution order

Practical tip: If you need something to run after the current task but before rendering, use queueMicrotask(). If you need it after rendering, use setTimeout.`,
      tags: ["JavaScript", "Event Loop"],
    },
    {
      id: 22,
      question: "What is the difference between controlled and uncontrolled components in React?",
      answer: `Controlled component:
React state is the "single source of truth" for the input value. Every change goes through state.

function Controlled() {
  const [value, setValue] = useState('');
  return <input value={value} onChange={e => setValue(e.target.value)} />;
}
// React controls the value. You can validate, transform, or reject input.

Uncontrolled component:
The DOM itself holds the value. You read it when you need it using a ref.

function Uncontrolled() {
  const inputRef = useRef();
  const handleSubmit = () => console.log(inputRef.current.value);
  return <input ref={inputRef} defaultValue="" />;
}
// DOM controls the value. Less code, less control.

When to use controlled:
• Form validation (prevent invalid input in real-time)
• Conditional disabling of submit button
• Formatting input (phone numbers, currency)
• When you need the value for other UI logic during typing

When to use uncontrolled:
• Simple forms with just a submit action
• File inputs (<input type="file"> is always uncontrolled)
• Integrating with non-React libraries
• Performance edge case: huge forms where re-rendering on every keystroke is slow

In practice:
Most teams use controlled components by default. For complex forms, libraries like React Hook Form use uncontrolled components internally (with refs) for better performance, giving you the best of both worlds.`,
      tags: ["React", "Forms"],
    },
    {
      id: 23,
      question: "When should you use useMemo vs useCallback?",
      answer: `Both are memoization hooks — they cache values to avoid recalculating on every render.

useMemo — caches a computed VALUE:
const sortedList = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]); // Only re-sorts when items change

useCallback — caches a FUNCTION reference:
const handleClick = useCallback((id) => {
  deleteItem(id);
}, [deleteItem]); // Same function reference unless deleteItem changes

Why function references matter:
// Without useCallback, handleClick is a NEW function every render
// This means <Child onClick={handleClick} /> re-renders every time
// Even if Child is wrapped in React.memo()

When to use useMemo:
• Expensive calculations (sorting, filtering large arrays)
• Creating objects/arrays passed as props to memoized children
• Deriving state that's expensive to compute

When to use useCallback:
• Functions passed to React.memo() children
• Functions in dependency arrays of useEffect
• Event handlers passed to lists of items

When NOT to use either:
• Simple calculations (adding 2 numbers, string concatenation)
• Functions not passed as props to children
• Components that need to re-render anyway
• When premature optimization adds complexity without measurable benefit

Rule of thumb: Don't memoize by default. Profile first, memoize where you find actual performance issues. The cost of memoization (memory + comparison) can outweigh the benefit.`,
      tags: ["React", "Hooks", "Performance"],
    },
    {
      id: 24,
      question: "What is the difference between HOCs, Render Props, and Custom Hooks?",
      answer: `All three are patterns for sharing logic between components. Custom hooks are the modern preferred approach.

Higher-Order Components (HOC):
A function that takes a component and returns a new component with extra behavior.

const withAuth = (Component) => {
  return (props) => {
    const user = useAuth();
    if (!user) return <Redirect to="/login" />;
    return <Component {...props} user={user} />;
  };
};
const ProtectedPage = withAuth(Dashboard);

Render Props:
A component that takes a function as a prop and calls it with data.

<MouseTracker render={({ x, y }) => (
  <p>Mouse is at {x}, {y}</p>
)} />

Custom Hooks (preferred):
Extract logic into a reusable function that uses hooks.

function useMousePosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => { /* track mouse */ }, []);
  return pos;
}
// Usage: const { x, y } = useMousePosition();

Why custom hooks won:
• No wrapper hell (HOCs nest components, making debugging harder)
• No extra DOM nodes (render props add component layers)
• More readable — just a function call
• Composable — easy to combine multiple hooks
• TypeScript friendly — better type inference

When you'll still see HOCs:
• Legacy codebases (React pre-hooks)
• Library wrappers (e.g., connect() from Redux — though useSelector replaced it)
• Cross-cutting concerns like analytics or error boundaries`,
      tags: ["React", "Patterns"],
    },
    {
      id: 25,
      question: "What is the difference between Vite and Webpack?",
      answer: `Both are build tools, but they take fundamentally different approaches:

Webpack (traditional bundler):
• Bundles EVERYTHING before starting dev server
• Dev server startup: Slow (seconds to minutes for large apps)
• HMR: Rebuilds affected chunks (can be slow)
• Mature ecosystem: Huge plugin library, handles edge cases
• Config: Often complex, verbose webpack.config.js

Vite (next-gen):
• Uses native ES modules in dev — NO bundling during development
• Dev server startup: Near-instant (serves files on demand)
• HMR: Only updates the changed file (milliseconds)
• Uses Rollup for production builds (optimized output)
• Config: Simple vite.config.js, sensible defaults

Why Vite is faster in dev:
Webpack: Change a file → rebuild entire chunk → serve to browser
Vite: Change a file → serve just that one file (browser handles imports)

When to choose Webpack:
• Large legacy projects already on Webpack
• Need specific Webpack plugins with no Vite equivalent
• Complex module federation (micro-frontends)

When to choose Vite:
• New projects (it's the default for React, Vue, Svelte)
• You want fast dev experience
• Building libraries (Rollup produces smaller output)

What about Turbopack?
• Rust-based successor to Webpack, built by the Next.js team
• Incrementally fast — only processes what changed
• Currently default in Next.js for development
• Aims to replace both Webpack and Vite eventually`,
      tags: ["Tooling", "Build"],
    },
    {
      id: 26,
      question: "What is accessibility (a11y) and what are ARIA attributes?",
      answer: `Accessibility (a11y) means making your website usable by everyone, including people with disabilities — visual, motor, auditory, or cognitive.

Why it matters:
• Legal requirement in many countries (ADA, WCAG compliance)
• ~15% of the world's population has some form of disability
• Improves UX for everyone (keyboard navigation, screen readers)
• SEO benefit — semantic HTML is better for search engines

Key accessibility practices:
1. Semantic HTML — Use <button> not <div onClick>, <nav>, <main>, <article>
2. Alt text — Every <img> needs a meaningful alt attribute
3. Keyboard navigation — Everything clickable must be reachable with Tab and activated with Enter/Space
4. Color contrast — Text must have sufficient contrast ratio (4.5:1 minimum)
5. Focus indicators — Never remove :focus outlines without providing alternatives

ARIA attributes (Accessible Rich Internet Applications):
ARIA adds meaning to elements that aren't natively accessible.

• aria-label — Provides a label for screen readers
  <button aria-label="Close dialog">×</button>

• aria-hidden="true" — Hides decorative elements from screen readers

• role — Defines what an element IS
  <div role="alert">Error: Invalid email</div>

• aria-expanded — Tells screen reader if a dropdown is open/closed

• aria-live="polite" — Announces dynamic content changes

Golden rule: Don't use ARIA if native HTML can do it.
<button> is better than <div role="button" tabindex="0">
Native elements come with built-in keyboard handling and screen reader support.`,
      tags: ["Accessibility", "HTML"],
    },
    {
      id: 27,
      question: "What is the difference between authentication and authorization?",
      answer: `Authentication: "WHO are you?" — Verifying identity
Authorization: "WHAT can you do?" — Verifying permissions

Authentication examples:
• Login with username/password
• OAuth (Sign in with Google)
• Biometrics (fingerprint, face ID)
• Multi-factor authentication (password + SMS code)

Authorization examples:
• Admin can delete users, regular users can't
• Free users see ads, premium users don't
• Only the post author can edit their post

How they work together in a web app:

1. User logs in (authentication) → Server creates a session/JWT
2. User makes a request → Server checks the token (authentication: is this a valid user?)
3. Server checks permissions → Can this user access /admin? (authorization: role-based check)

Common implementation:
// Middleware checks both
function protectRoute(req, res, next) {
  const user = verifyToken(req.cookies.token);  // Authentication
  if (!user) return res.status(401).send('Not authenticated');

  if (req.path.startsWith('/admin') && user.role !== 'admin') {
    return res.status(403).send('Not authorized');  // Authorization
  }
  next();
}

Key difference in HTTP status codes:
• 401 Unauthorized = Not authenticated (confusing name, but means "who are you?")
• 403 Forbidden = Not authorized (we know who you are, but you can't do this)

In frontend:
• Authentication = Login/signup pages, token management
• Authorization = Route guards, hiding UI elements based on role, conditional rendering`,
      tags: ["Security", "Architecture"],
    },
    {
      id: 28,
      question: "What are design tokens and why are they important?",
      answer: `Design tokens are the single source of truth for your design system's values — colors, spacing, typography, shadows, etc. stored as platform-agnostic variables.

Example:
// tokens.js
{
  color: { primary: '#6366f1', error: '#ef4444' },
  spacing: { sm: '8px', md: '16px', lg: '24px' },
  fontSize: { body: '16px', heading: '24px' },
  borderRadius: { sm: '4px', pill: '9999px' }
}

These get transformed into whatever platform needs them:
• CSS variables: --color-primary: #6366f1
• Tailwind config: colors.primary = '#6366f1'
• iOS: UIColor(named: "primary")
• Android: @color/primary

Why they matter:
1. Consistency — Everyone uses the same values. No more "is it #333 or #3a3a3a?"
2. Single update point — Change the primary color in one place, it updates everywhere
3. Cross-platform — Same tokens for web, iOS, Android, email
4. Designer-developer alignment — Designers update tokens in Figma, developers consume the same values

How it works in practice:
1. Design team defines tokens in Figma (using Figma Variables or Tokens Studio)
2. Tokens are exported as JSON
3. A tool like Style Dictionary transforms JSON into CSS variables, Tailwind config, etc.
4. Developers use the generated variables in their code

When to invest in design tokens:
• Multi-platform product (web + mobile)
• Large teams (3+ designers, 5+ developers)
• Design system with component library
• Products with theming (dark mode, white-label)`,
      tags: ["Design Systems", "CSS"],
    },
    {
      id: 29,
      question: "What is the difference between == and === in JavaScript?",
      answer: `=== (Strict equality) — Compares value AND type. No conversion.
== (Loose equality) — Compares value after type coercion (automatic conversion).

Examples:
5 === 5       // true (same value, same type)
5 === '5'     // false (number vs string)
5 == '5'      // true (string '5' is coerced to number 5)

null === undefined  // false (different types)
null == undefined   // true (special rule — they're "loosely equal")

0 == false    // true (both coerce to 0)
0 === false   // false (number vs boolean)

'' == false   // true (both coerce to 0)
'' === false  // false

The coercion rules for == are complex and surprising:
[] == false   // true  ([] → '' → 0 → false)
[] == ![]     // true  (believe it or not!)
'' == 0       // true
' ' == 0      // true

Rule: ALWAYS use === (strict equality)

The only exception where == is acceptable:
value == null  // This checks for both null AND undefined (a useful shorthand)
// Equivalent to: value === null || value === undefined

Why interviewers ask this:
It tests your understanding of type coercion — one of JavaScript's most confusing features. It's also a code quality signal — using === shows you write defensive, predictable code.`,
      tags: ["JavaScript", "Fundamentals"],
    },
    {
      id: 30,
      question: "What is a closure and why does it matter?",
      answer: `A closure is when a function "remembers" variables from its outer scope, even after the outer function has finished executing.

Simple example:
function createCounter() {
  let count = 0;                    // This variable is "enclosed"
  return function() {
    count++;
    return count;
  };
}
const counter = createCounter();
counter(); // 1
counter(); // 2
counter(); // 3
// count is private — only accessible through the returned function

Why closures matter:

1. Data privacy — Variables are truly private (can't be accessed from outside)
function createBankAccount(initial) {
  let balance = initial;
  return {
    deposit: (amount) => balance += amount,
    getBalance: () => balance
  };
}
// No way to directly modify balance — only through deposit()

2. Factory functions — Create specialized functions
function multiply(x) {
  return (y) => x * y;
}
const double = multiply(2);
const triple = multiply(3);
double(5); // 10
triple(5); // 15

3. Module pattern — Before ES modules, closures created private scope

4. React hooks — useState, useEffect, useCallback all rely on closures to maintain state between renders

Common gotchas:
• Stale closures (see the stale closure question)
• Loop variable capture:
  for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100); // Logs 3, 3, 3 (not 0, 1, 2)
  }
  // Fix: Use let instead of var (block scoping creates a new closure per iteration)`,
      tags: ["JavaScript", "Fundamentals"],
    },
    {
      id: 31,
      question: "What is the difference between var, let, and const?",
      answer: `All three declare variables, but they differ in scope, hoisting, and reassignment:

var:
• Function-scoped (not block-scoped)
• Hoisted to the top of its function and initialized as undefined
• Can be redeclared and reassigned
  function example() {
    console.log(x); // undefined (hoisted)
    var x = 10;
    var x = 20; // No error — redeclaration allowed
  }

let:
• Block-scoped (only exists inside { })
• Hoisted but NOT initialized — accessing before declaration throws ReferenceError (Temporal Dead Zone)
• Can be reassigned, but NOT redeclared in the same scope
  {
    // console.log(y); // ReferenceError — TDZ
    let y = 10;
    y = 20; // OK
    // let y = 30; // SyntaxError — can't redeclare
  }
  // console.log(y); // ReferenceError — out of scope

const:
• Block-scoped like let
• Must be initialized at declaration
• Cannot be reassigned — but objects/arrays can still be mutated!
  const obj = { name: "Alice" };
  obj.name = "Bob"; // OK — mutating property
  // obj = {}; // TypeError — can't reassign

Rule of thumb: Use const by default. Use let only when you need to reassign. Never use var in modern code.`,
      tags: ["JavaScript", "ES6+"],
    },
    {
      id: 32,
      question: "What is the Temporal Dead Zone (TDZ)?",
      answer: `The Temporal Dead Zone is the period between entering a scope and the variable's declaration being executed. During this period, accessing the variable throws a ReferenceError.

Why does it exist? To catch bugs. With var, variables are hoisted and initialized as undefined, which can cause subtle bugs:

  // var — silently undefined
  console.log(a); // undefined (no error!)
  var a = 5;

  // let — TDZ catches the bug
  console.log(b); // ReferenceError: Cannot access 'b' before initialization
  let b = 5;

How it works internally:
1. When the scope is entered, the variable is "hoisted" (JS knows it exists)
2. But it's in an "uninitialized" state — not undefined, truly uninitialized
3. Any access before the declaration line throws ReferenceError
4. Once the declaration line runs, the TDZ ends

This also applies to:
• const (same behavior as let)
• Function parameters with default values
• Class declarations

  // TDZ in default params
  function foo(a = b, b = 1) {} // ReferenceError — b is in TDZ when a tries to use it

The TDZ is about time (when code runs), not position in the code. That's why it's called "temporal."`,
      tags: ["JavaScript", "ES6+"],
    },
    {
      id: 33,
      question: "How does the 'this' keyword work in JavaScript?",
      answer: `The value of 'this' depends on HOW a function is called, not where it's defined. There are 5 rules:

1. Global context:
   console.log(this); // window (browser) or globalThis (Node)

2. Object method — 'this' = the object calling the method:
   const user = {
     name: "Alice",
     greet() { console.log(this.name); }
   };
   user.greet(); // "Alice"

3. Regular function call — 'this' = undefined (strict mode) or window:
   function sayName() { console.log(this); }
   sayName(); // undefined in strict mode

4. Explicit binding — bind/call/apply let you set 'this':
   function greet() { console.log(this.name); }
   greet.call({ name: "Bob" }); // "Bob"
   const bound = greet.bind({ name: "Charlie" });
   bound(); // "Charlie"

5. Arrow functions — NO own 'this'. They inherit 'this' from the surrounding scope:
   const user = {
     name: "Alice",
     greet: () => console.log(this.name), // 'this' is NOT user!
     delayedGreet() {
       setTimeout(() => {
         console.log(this.name); // "Alice" — arrow inherits from delayedGreet
       }, 100);
     }
   };

Interview tip: "Arrow functions don't have their own this — they capture it from where they're defined (lexical scope). Regular functions get this from how they're called (dynamic binding)."`,
      tags: ["JavaScript", "Fundamentals"],
    },
    {
      id: 34,
      question: "What are Promises vs Observables? When would you use each?",
      answer: `Both handle async operations, but they work very differently:

Promises:
• Handle a SINGLE async value
• Eager — start executing immediately when created
• Not cancellable (once started, you can't stop it)
• Built into JavaScript

  const promise = fetch('/api/data'); // Starts immediately
  promise.then(data => console.log(data));

Observables (from RxJS):
• Handle a STREAM of values over time
• Lazy — don't execute until subscribed
• Cancellable — unsubscribe to stop
• NOT built into JS — need RxJS library

  const obs$ = new Observable(subscriber => {
    subscriber.next(1);
    subscriber.next(2);
    setTimeout(() => subscriber.next(3), 1000);
  });
  const sub = obs$.subscribe(val => console.log(val));
  sub.unsubscribe(); // Cancel anytime

Key differences:
• Single vs Multiple values: Promise resolves once. Observable emits many values.
• Eager vs Lazy: Promise starts immediately. Observable waits for subscribe().
• Operators: Observables have map, filter, debounceTime, switchMap — powerful data transformation.

When to use Promises: API calls, one-time async operations, simple async/await flows.
When to use Observables: Real-time data (WebSockets), user input streams (search-as-you-type), complex async orchestration (race conditions, retries), Angular apps (built-in).`,
      tags: ["JavaScript", "Architecture"],
    },
    {
      id: 35,
      question: "What is the Proxy object in JavaScript and what can you do with it?",
      answer: `A Proxy wraps an object and lets you intercept and customize fundamental operations like reading properties, setting values, function calls, etc.

Basic syntax:
  const handler = {
    get(target, property) {
      console.log(\`Reading \${property}\`);
      return target[property];
    },
    set(target, property, value) {
      console.log(\`Setting \${property} = \${value}\`);
      target[property] = value;
      return true;
    }
  };
  const proxy = new Proxy({}, handler);
  proxy.name = "Alice"; // Logs: Setting name = Alice
  console.log(proxy.name); // Logs: Reading name → "Alice"

Real-world use cases:

1. Validation:
  const validator = new Proxy({}, {
    set(target, prop, value) {
      if (prop === 'age' && typeof value !== 'number') {
        throw new TypeError('Age must be a number');
      }
      target[prop] = value;
      return true;
    }
  });

2. Default values:
  const withDefaults = new Proxy({}, {
    get(target, prop) {
      return prop in target ? target[prop] : 'N/A';
    }
  });

3. Reactive systems — Vue 3 uses Proxy for reactivity (replaced Object.defineProperty from Vue 2). When you access or modify reactive data, Proxy traps detect it and trigger re-renders.

4. API mocking, logging, access control, and change tracking.

Available traps: get, set, has (in operator), deleteProperty, apply (function calls), construct (new), and more.`,
      tags: ["JavaScript", "ES6+"],
    },
    {
      id: 36,
      question: "What are Generators and Iterators in JavaScript?",
      answer: `Iterators are objects that define a sequence and return values one at a time. Generators are special functions that make creating iterators easy.

Iterator protocol — any object with a next() method that returns { value, done }:
  const iterator = {
    current: 0,
    next() {
      return this.current < 3
        ? { value: this.current++, done: false }
        : { done: true };
    }
  };

Generator function — uses function* and yield:
  function* countUp() {
    yield 1;
    yield 2;
    yield 3;
  }
  const gen = countUp();
  gen.next(); // { value: 1, done: false }
  gen.next(); // { value: 2, done: false }
  gen.next(); // { value: 3, done: false }
  gen.next(); // { value: undefined, done: true }

Key feature: Generators PAUSE execution at each yield and resume when next() is called. This makes them great for:

1. Lazy evaluation — Generate infinite sequences without using memory:
  function* fibonacci() {
    let a = 0, b = 1;
    while (true) {
      yield a;
      [a, b] = [b, a + b];
    }
  }

2. Async flow control — Before async/await, generators + promises handled async code (redux-saga still uses this).

3. Custom iterables — Make any object work with for...of:
  const range = {
    *[Symbol.iterator]() {
      for (let i = 0; i < 5; i++) yield i;
    }
  };
  for (const n of range) console.log(n); // 0, 1, 2, 3, 4`,
      tags: ["JavaScript", "ES6+"],
    },
    {
      id: 37,
      question: "What are WeakMap and WeakSet? When would you use them?",
      answer: `WeakMap and WeakSet are like Map and Set but with a critical difference: they hold "weak" references to their keys/values, meaning they DON'T prevent garbage collection.

WeakMap:
• Keys MUST be objects (not primitives)
• If the key object has no other references, it gets garbage collected along with its value
• Not iterable — no .forEach(), no .size, no .keys()

  let user = { name: "Alice" };
  const cache = new WeakMap();
  cache.set(user, "some expensive computed data");

  user = null; // The { name: "Alice" } object AND its cached data
               // are now eligible for garbage collection

Compare with Map:
  const map = new Map();
  map.set(user, "data");
  user = null; // Object is STILL in memory — Map keeps a strong reference!

Use cases for WeakMap:
1. Caching — Store computed results tied to objects without memory leaks
2. Private data — Store private properties for class instances
3. DOM metadata — Attach data to DOM elements that auto-cleans when element is removed
  const elementData = new WeakMap();
  elementData.set(domElement, { clicks: 0 });
  // When domElement is removed from DOM and dereferenced, data is auto-cleaned

WeakSet:
• Only stores objects
• Useful for "tagging" objects (e.g., tracking which objects have been processed)
  const visited = new WeakSet();
  visited.add(node);
  if (visited.has(node)) { /* already processed */ }

Key insight: Use Weak variants when you want to associate data with objects WITHOUT creating memory leaks.`,
      tags: ["JavaScript", "ES6+"],
    },
    {
      id: 38,
      question: "What is the difference between Object.freeze(), Object.seal(), and Object.preventExtensions()?",
      answer: `All three restrict object modifications, but at different levels:

Object.preventExtensions(obj):
• Cannot ADD new properties
• CAN modify existing properties
• CAN delete existing properties
  const obj = { a: 1 };
  Object.preventExtensions(obj);
  obj.b = 2;    // Silently fails (or TypeError in strict mode)
  obj.a = 99;   // OK
  delete obj.a;  // OK

Object.seal(obj):
• Cannot ADD new properties
• Cannot DELETE existing properties
• CAN modify existing property values
  const obj = { a: 1 };
  Object.seal(obj);
  obj.b = 2;    // Fails
  delete obj.a;  // Fails
  obj.a = 99;   // OK

Object.freeze(obj):
• Cannot ADD new properties
• Cannot DELETE existing properties
• Cannot MODIFY existing property values
• Most restrictive
  const obj = { a: 1 };
  Object.freeze(obj);
  obj.b = 2;    // Fails
  delete obj.a;  // Fails
  obj.a = 99;   // Fails

Important: ALL THREE are SHALLOW!
  const obj = Object.freeze({ nested: { value: 1 } });
  obj.nested.value = 2; // This WORKS — nested object is not frozen

For deep freeze:
  function deepFreeze(obj) {
    Object.freeze(obj);
    Object.values(obj).forEach(val => {
      if (typeof val === 'object' && val !== null) deepFreeze(val);
    });
    return obj;
  }

Check methods: Object.isFrozen(), Object.isSealed(), Object.isExtensible().`,
      tags: ["JavaScript", "ES6+"],
    },
    {
      id: 39,
      question: "What is Symbol in JavaScript and why would you use it?",
      answer: `Symbol is a primitive type that creates guaranteed unique identifiers. Every Symbol() call produces a value that's not equal to anything else.

  const s1 = Symbol('description');
  const s2 = Symbol('description');
  s1 === s2; // false — always unique, even with same description

Why use Symbols?

1. Unique object keys — No property name collisions:
  const ID = Symbol('id');
  const user = { [ID]: 123, name: "Alice" };
  user[ID]; // 123
  // Won't clash with any other 'id' property

2. "Private-ish" properties — Symbols don't show up in:
  • Object.keys()
  • for...in loops
  • JSON.stringify()
  // But they're NOT truly private — Object.getOwnPropertySymbols() can find them

3. Well-known Symbols — JavaScript uses built-in symbols to define behavior:
  • Symbol.iterator — Makes objects iterable (for...of)
  • Symbol.toPrimitive — Custom type conversion
  • Symbol.hasInstance — Custom instanceof behavior

  class MyArray {
    static [Symbol.hasInstance](instance) {
      return Array.isArray(instance);
    }
  }
  [] instanceof MyArray; // true

4. Symbol.for() — Creates shared/global symbols:
  const s1 = Symbol.for('app.id'); // Creates or retrieves
  const s2 = Symbol.for('app.id'); // Retrieves existing
  s1 === s2; // true — same global symbol

When to use: Library/framework development (avoid name collisions), defining protocols, creating enum-like constants.`,
      tags: ["JavaScript", "ES6+"],
    },
    {
      id: 40,
      question: "What are Tagged Template Literals?",
      answer: `Tagged template literals let you parse template literal strings with a function. The "tag" is a function that receives the string parts and the interpolated values separately.

Basic syntax:
  function tag(strings, ...values) {
    console.log(strings); // Array of string parts
    console.log(values);  // Array of interpolated values
  }
  const name = "Alice";
  const age = 30;
  tag\`Hello \${name}, you are \${age}\`;
  // strings: ["Hello ", ", you are ", ""]
  // values: ["Alice", 30]

Real-world use cases:

1. HTML sanitization:
  function safe(strings, ...values) {
    return strings.reduce((result, str, i) => {
      const val = values[i - 1];
      return result + escapeHTML(val) + str;
    });
  }
  safe\`<p>\${userInput}</p>\`; // userInput is auto-escaped

2. styled-components (CSS-in-JS):
  const Button = styled.button\`
    background: \${props => props.primary ? 'blue' : 'white'};
    color: \${props => props.primary ? 'white' : 'blue'};
  \`;

3. GraphQL queries:
  const query = gql\`
    query GetUser($id: ID!) {
      user(id: $id) { name email }
    }
  \`;

4. Internationalization:
  i18n\`Hello \${name}, you have \${count} messages\`;

The tag function can return anything — a string, an object, a React component, or even a function. This makes tagged templates incredibly powerful for building DSLs (Domain-Specific Languages).`,
      tags: ["JavaScript", "ES6+"],
    },
    {
      id: 41,
      question: "What is structuredClone() and how is it different from JSON.parse(JSON.stringify())?",
      answer: `structuredClone() is a built-in function (added in 2022) that creates a deep copy of a value. It's the proper way to deep clone objects in modern JavaScript.

  const original = { name: "Alice", hobbies: ["reading", "coding"] };
  const clone = structuredClone(original);
  clone.hobbies.push("gaming");
  original.hobbies; // ["reading", "coding"] — not affected

Why not JSON.parse(JSON.stringify())?

The JSON method has several problems that structuredClone solves:

1. Dates get converted to strings:
  JSON.parse(JSON.stringify({ d: new Date() }))
  // { d: "2024-01-01T00:00:00.000Z" } — string, not Date!
  structuredClone({ d: new Date() })
  // { d: Date object } — preserved!

2. undefined, functions, Symbols are lost:
  JSON.parse(JSON.stringify({ a: undefined, b: () => {} }))
  // {} — both properties gone!

3. Special types not supported:
  // JSON method FAILS with: Map, Set, RegExp, Blob, File, ArrayBuffer
  // structuredClone handles all of them correctly

4. Circular references crash:
  const obj = {};
  obj.self = obj;
  JSON.stringify(obj); // TypeError: circular reference
  structuredClone(obj); // Works fine!

What structuredClone CANNOT clone:
• Functions (throws error)
• DOM nodes
• Class instances (loses prototype)
• Symbols

Quick comparison:
  Spread/Object.assign  → Shallow copy only
  JSON method           → Deep but lossy (no Date, Map, Set, undefined)
  structuredClone()     → Deep and accurate (modern standard)
  lodash.cloneDeep()    → Deep and accurate (needs library)`,
      tags: ["JavaScript", "ES6+"],
    },
    {
      id: 42,
      question: "What is React Fiber and why was it introduced?",
      answer: `React Fiber is React's internal reconciliation engine, introduced in React 16. It replaced the old "Stack Reconciler" to enable incremental rendering.

The Problem with the old engine:
The old reconciler worked synchronously — once it started rendering a component tree, it couldn't stop until done. For large trees, this blocked the main thread, making the UI unresponsive (dropped frames, janky scrolling, unresponsive inputs).

How Fiber solves this:
Fiber breaks rendering work into small units called "fibers" (one per component). Each fiber is a JavaScript object that represents a unit of work:

  {
    type: 'div',           // Component type
    child: fiberNode,      // First child
    sibling: fiberNode,    // Next sibling
    return: fiberNode,     // Parent
    pendingProps: {},      // New props
    memoizedState: {},     // Current state
    effectTag: 'UPDATE',   // What to do (place, update, delete)
  }

Key capabilities Fiber enables:
1. Pause and resume work — Can yield to the browser between units of work (so animations and input stay smooth)
2. Priority-based rendering — Urgent updates (typing) get processed before less urgent ones (fetching data)
3. Concurrent features — Enables Suspense, useTransition, useDeferredValue, Streaming SSR
4. Better error handling — Error Boundaries became possible

Two phases:
• Render phase (interruptible) — Fiber builds a work-in-progress tree, comparing old vs new
• Commit phase (synchronous) — Applies all DOM changes at once

You never interact with Fiber directly — it's the engine under the hood. But understanding it explains why React can prioritize updates and how Concurrent Mode works.`,
      tags: ["React", "Architecture"],
    },
    {
      id: 43,
      question: "When would you use useReducer instead of useState?",
      answer: `Both manage state, but useReducer is better for complex state logic:

useState — Simple, independent state values:
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");

useReducer — State transitions that depend on previous state or involve multiple sub-values:
  const initialState = { count: 0, step: 1, history: [] };

  function reducer(state, action) {
    switch (action.type) {
      case 'increment':
        return {
          ...state,
          count: state.count + state.step,
          history: [...state.history, state.count]
        };
      case 'setStep':
        return { ...state, step: action.payload };
      case 'reset':
        return initialState;
      default:
        throw new Error('Unknown action');
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);
  dispatch({ type: 'increment' });

Use useReducer when:
1. Multiple related state values — e.g., form with multiple fields, loading/error/data states
2. Complex state transitions — Next state depends on previous state in non-trivial ways
3. State machine patterns — Clear, named transitions (like 'submit', 'success', 'error')
4. Testing — Reducer is a pure function, easy to unit test without React
5. Performance — dispatch is stable (doesn't change between renders), unlike setState functions passed through context

Use useState when:
• Simple, independent values (boolean toggle, single input, counter)
• No complex state transitions

Rule of thumb: If you have more than 3 related setState calls in a handler, consider useReducer.`,
      tags: ["React", "State Management"],
    },
    {
      id: 44,
      question: "What are React Portals and when would you use them?",
      answer: `Portals let you render a child component into a different DOM node, outside of the parent's DOM hierarchy, while keeping it inside the React component tree.

  import { createPortal } from 'react-dom';

  function Modal({ children, isOpen }) {
    if (!isOpen) return null;
    return createPortal(
      <div className="modal-overlay">
        <div className="modal-content">{children}</div>
      </div>,
      document.getElementById('modal-root') // Renders HERE in the DOM
    );
  }

  // In your HTML:
  <div id="root">...</div>
  <div id="modal-root"></div>

Why Portals?
The problem they solve is CSS context. Without portals, a modal rendered inside a component with overflow: hidden, z-index, or transform would be clipped or positioned incorrectly.

Key behavior:
• DOM tree: The portal renders outside the parent DOM node
• React tree: Events still bubble up through the React component tree (not the DOM tree!)
  // Click events on the portal still bubble to <App /> in React
  <App onClick={handleClick}>
    <Modal>
      <button>Click me</button> {/* handleClick fires! */}
    </Modal>
  </App>

Common use cases:
1. Modals / Dialogs — Render at body level to avoid z-index/overflow issues
2. Tooltips / Popovers — Position relative to viewport, not parent
3. Toast notifications — Fixed position notifications
4. Dropdown menus — Escape overflow:hidden containers

In Next.js / SSR: You need to check that the target DOM node exists (use useEffect + state to ensure it runs client-side only).`,
      tags: ["React", "Browser APIs"],
    },
    {
      id: 45,
      question: "What is forwardRef and useImperativeHandle?",
      answer: `forwardRef lets a parent component access a DOM element (or component instance) inside a child component. useImperativeHandle customizes what the parent can access.

The problem: By default, refs don't pass through functional components:
  // This DOESN'T work:
  function MyInput(props) {
    return <input {...props} />;
  }
  const ref = useRef();
  <MyInput ref={ref} /> // Warning! Function components can't be given refs

forwardRef — Passes the ref to the child:
  const MyInput = forwardRef(function MyInput(props, ref) {
    return <input ref={ref} {...props} />;
  });

  // Parent
  const inputRef = useRef();
  <MyInput ref={inputRef} />
  inputRef.current.focus(); // Works! Direct DOM access

useImperativeHandle — Limits what the parent can do:
  const MyInput = forwardRef(function MyInput(props, ref) {
    const inputRef = useRef();

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current.focus(),
      clear: () => { inputRef.current.value = ''; },
      // Parent can ONLY call focus() and clear()
      // No access to the raw DOM node
    }));

    return <input ref={inputRef} {...props} />;
  });

  // Parent
  ref.current.focus(); // OK
  ref.current.clear(); // OK
  ref.current.value;   // undefined — hidden!

When to use:
• forwardRef: Reusable input/button components, component libraries
• useImperativeHandle: When you want to expose a clean API instead of raw DOM access

Note: In React 19, forwardRef is no longer needed — ref is passed as a regular prop.`,
      tags: ["React", "ES6+"],
    },
    {
      id: 46,
      question: "What is the difference between useTransition and useDeferredValue?",
      answer: `Both are React 18+ concurrent features that let you mark some updates as non-urgent, keeping the UI responsive. They solve the same problem differently.

useTransition — Wraps a state update to mark it as low priority:
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  function handleChange(e) {
    setQuery(e.target.value);           // Urgent — update input immediately
    startTransition(() => {
      setResults(filterLargeList(e.target.value)); // Non-urgent — can be interrupted
    });
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending ? <Spinner /> : <ResultsList results={results} />}
    </>
  );

useDeferredValue — Takes a value and returns a "lagging" version:
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  // query updates immediately (input stays responsive)
  // deferredQuery updates later (expensive list re-render is deferred)
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <ExpensiveList filter={deferredQuery} />
    </>
  );

Key differences:
• useTransition: You control WHEN the update happens. You wrap the setState call.
• useDeferredValue: You control WHICH VALUE is deferred. The update happens, but the value lags behind.

When to use useTransition: When you own the state-setting code and want to explicitly mark certain updates as non-urgent.
When to use useDeferredValue: When you receive a value from props/parent and want to defer its effect — you don't control the setState call.`,
      tags: ["React", "Performance"],
    },
    {
      id: 47,
      question: "What are Server Actions in Next.js?",
      answer: `Server Actions are async functions that run on the server, triggered directly from client components. They replace the need for separate API routes for form submissions and data mutations.

Define with "use server":
  // In a server component or separate file
  'use server';

  async function createPost(formData) {
    const title = formData.get('title');
    const body = formData.get('body');
    await db.post.create({ data: { title, body } });
    revalidatePath('/posts'); // Refresh the page data
  }

Use in a form:
  // Client component
  export default function PostForm() {
    return (
      <form action={createPost}>
        <input name="title" />
        <textarea name="body" />
        <button type="submit">Create Post</button>
      </form>
    );
  }

With useActionState (React 19):
  const [state, formAction, isPending] = useActionState(createPost, null);

  return (
    <form action={formAction}>
      <button disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </button>
      {state?.error && <p>{state.error}</p>}
    </form>
  );

Key benefits:
1. No API routes needed — Direct server function calls
2. Progressive enhancement — Forms work without JavaScript
3. Automatic serialization — FormData is sent and received automatically
4. Built-in revalidation — revalidatePath/revalidateTag refresh cached data
5. Type safety — Full TypeScript support end-to-end

Important: Server Actions can be called from client components (using action prop or import), but the function ALWAYS runs on the server. The client just sends a POST request under the hood.`,
      tags: ["Next.js", "Architecture"],
    },
    {
      id: 48,
      question: "What is Streaming SSR and how does it improve performance?",
      answer: `Traditional SSR waits for ALL data to be fetched before sending ANY HTML to the browser. Streaming SSR sends HTML in chunks as it becomes ready, so users see content progressively.

Traditional SSR flow:
  1. Server receives request
  2. Fetches ALL data (wait for slowest API) ← bottleneck
  3. Renders ALL HTML
  4. Sends complete HTML to browser
  5. Browser shows everything at once

Streaming SSR flow:
  1. Server receives request
  2. Immediately sends the HTML shell (header, nav, layout)
  3. Each section streams in as its data arrives
  4. Browser progressively shows content

In Next.js, this works automatically with Suspense:
  export default async function DashboardPage() {
    return (
      <div>
        <h1>Dashboard</h1>         {/* Sent immediately */}
        <Suspense fallback={<Skeleton />}>
          <SlowChart />             {/* Streams in when ready */}
        </Suspense>
        <Suspense fallback={<Spinner />}>
          <EvenSlowerFeed />        {/* Streams in independently */}
        </Suspense>
      </div>
    );
  }

How it works technically:
• Uses HTTP chunked transfer encoding
• React renders what it can, sends it, then continues rendering
• Each Suspense boundary is an independent streaming point
• Fallback UI shows while data loads, then gets replaced

Benefits:
1. Time to First Byte (TTFB) — Much faster, shell sent immediately
2. First Contentful Paint (FCP) — Users see layout instantly
3. No waterfall — Slow sections don't block fast ones
4. Better UX — Progressive loading feels faster than blank screen

loading.js files in Next.js App Router create automatic Suspense boundaries for streaming.`,
      tags: ["React", "Next.js", "Performance"],
    },
    {
      id: 49,
      question: "What is the 'use' hook in React 19?",
      answer: `The 'use' hook is new in React 19. It lets you read the value of a Promise or Context directly in your component — including inside conditionals and loops (unlike other hooks).

Reading Promises:
  // Before React 19 — needed useEffect + useState
  function UserProfile({ id }) {
    const [user, setUser] = useState(null);
    useEffect(() => {
      fetchUser(id).then(setUser);
    }, [id]);
    if (!user) return <Spinner />;
    return <h1>{user.name}</h1>;
  }

  // With React 19 — much cleaner
  function UserProfile({ userPromise }) {
    const user = use(userPromise); // Suspends until resolved
    return <h1>{user.name}</h1>;
  }

  // Parent wraps with Suspense
  <Suspense fallback={<Spinner />}>
    <UserProfile userPromise={fetchUser(id)} />
  </Suspense>

Reading Context:
  // Before: only at top level
  function Button() {
    const theme = useContext(ThemeContext); // Must be top level
    return <button className={theme}>Click</button>;
  }

  // With use(): can be conditional
  function Button({ themed }) {
    if (themed) {
      const theme = use(ThemeContext); // OK inside conditional!
      return <button className={theme}>Click</button>;
    }
    return <button>Click</button>;
  }

Key differences from other hooks:
• CAN be called inside if statements, loops, and early returns
• Works with Suspense — automatically shows fallback while Promise resolves
• Works with Error Boundaries — rejected Promises are caught
• Replaces many useEffect + useState data-fetching patterns

Important: The Promise should be created outside the component (in a parent, loader, or server component). Creating it inside would create a new Promise every render.`,
      tags: ["React", "ES6+"],
    },
    {
      id: 50,
      question: "How does caching work in Next.js App Router?",
      answer: `Next.js has multiple caching layers, which can be confusing. Here's each one explained:

1. Request Memoization (per request):
  // Same fetch called in multiple components? Only ONE network request!
  // Layout.js
  const user = await fetch('/api/user');
  // Page.js
  const user = await fetch('/api/user'); // Reuses the cached result
  // Works for the same URL + options within one request

2. Data Cache (persistent, server-side):
  // fetch results are cached across requests by default
  fetch('/api/data');                          // Cached indefinitely
  fetch('/api/data', { next: { revalidate: 60 } }); // Revalidate every 60s
  fetch('/api/data', { cache: 'no-store' });   // Skip cache

3. Full Route Cache (static pages):
  // Static routes are pre-rendered at build time
  // Dynamic routes (using cookies(), headers(), searchParams) are NOT cached
  // Force dynamic: export const dynamic = 'force-dynamic';

4. Router Cache (client-side):
  // Visited pages are cached in the browser during the session
  // Prefetched routes (via <Link>) are also cached
  // Invalidate with: router.refresh()

Revalidation strategies:
  // Time-based:
  fetch(url, { next: { revalidate: 3600 } }); // Every hour

  // On-demand:
  import { revalidatePath, revalidateTag } from 'next/cache';
  revalidatePath('/blog');           // Revalidate a path
  revalidateTag('posts');            // Revalidate by tag

  // Tag your fetches:
  fetch(url, { next: { tags: ['posts'] } });

Mental model: By default, Next.js caches aggressively. You opt OUT of caching when you need fresh data. Use no-store for real-time data, revalidate for periodic freshness, and on-demand revalidation for mutations.`,
      tags: ["Next.js", "Performance"],
    },
    {
      id: 51,
      question: "What are loading.js, error.js, and not-found.js in Next.js App Router?",
      answer: `These are special files in the Next.js App Router that automatically handle common UI states for each route segment.

loading.js — Shows while the page/layout is loading:
  // app/dashboard/loading.js
  export default function Loading() {
    return <div className="skeleton">Loading dashboard...</div>;
  }
  // Automatically wraps the page in a <Suspense> boundary
  // Shows instantly while page.js fetches data

error.js — Catches errors in the route segment:
  // app/dashboard/error.js
  'use client'; // Must be a client component!

  export default function Error({ error, reset }) {
    return (
      <div>
        <h2>Something went wrong!</h2>
        <p>{error.message}</p>
        <button onClick={reset}>Try again</button>
      </div>
    );
  }
  // Acts as an Error Boundary for the segment
  // reset() re-renders the segment without a full page reload

not-found.js — Shows when notFound() is called:
  // app/dashboard/not-found.js
  export default function NotFound() {
    return <h2>Dashboard not found</h2>;
  }

  // Triggered in page.js:
  import { notFound } from 'next/navigation';
  if (!data) notFound(); // Shows not-found.js

How they nest:
  app/
  ├── layout.js          ← Global layout
  ├── error.js           ← Catches errors in ALL routes
  ├── loading.js         ← Shows while any page loads
  ├── not-found.js       ← Global 404
  └── dashboard/
      ├── layout.js
      ├── error.js       ← Only catches dashboard errors
      ├── loading.js     ← Only shows while dashboard loads
      └── page.js

Key points:
• loading.js creates automatic Suspense boundaries (enables streaming)
• error.js MUST be "use client" (Error Boundaries are client components)
• error.js catches errors from page.js and children, but NOT from its own layout.js (need error.js one level up)
• not-found.js is triggered by the notFound() function or unmatched routes`,
      tags: ["Next.js", "Architecture"],
    },
    {
      id: 52,
      question: "What is Partial Prerendering (PPR) in Next.js?",
      answer: `Partial Prerendering (PPR) is an experimental Next.js feature that combines static and dynamic rendering in a single page — the static shell is served instantly from the CDN, and dynamic parts stream in.

The problem it solves:
Currently, a page is either fully static OR fully dynamic. If one small part needs dynamic data (like a user avatar), the ENTIRE page becomes dynamic — losing the benefits of static caching.

How PPR works:
  // app/page.js — The page itself is static (prerendered at build time)
  export default function ProductPage({ params }) {
    return (
      <div>
        <h1>Product Name</h1>           {/* Static — cached on CDN */}
        <p>Product description...</p>    {/* Static */}

        <Suspense fallback={<CartSkeleton />}>
          <CartWidget />                 {/* Dynamic — streams in */}
        </Suspense>

        <Suspense fallback={<ReviewsSkeleton />}>
          <Reviews />                    {/* Dynamic — streams in */}
        </Suspense>
      </div>
    );
  }

What happens:
1. At build time: Next.js prerenderes the static shell (everything outside Suspense boundaries) + the fallback UI
2. At request time: The static HTML is served instantly from the CDN
3. Dynamic parts stream in and replace the fallback skeletons

Enable it:
  // next.config.js
  module.exports = {
    experimental: { ppr: true }
  };

Benefits:
• Instant initial load — Static shell from CDN (fast TTFB)
• Personalized content — Dynamic parts load user-specific data
• No full-page dynamic penalty — Only dynamic parts hit the server
• Better caching — Static parts cached globally, dynamic parts per-request

Think of it as: "Static by default, dynamic where needed" — on a per-component level within the same page.`,
      tags: ["Next.js", "Performance"],
    },
    {
      id: 53,
      question: "What is the difference between redirect, rewrite, and next() in Next.js middleware?",
      answer: `Next.js middleware runs BEFORE a request is completed. You can use redirect, rewrite, or next() to control what happens:

redirect — Changes the URL and sends the user to a different page:
  // middleware.js
  import { NextResponse } from 'next/server';

  export function middleware(request) {
    if (!isAuthenticated(request)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // User sees /login in their browser URL bar
    // HTTP 307 (temporary) or 308 (permanent) status
  }

rewrite — Serves a different page WITHOUT changing the URL:
  export function middleware(request) {
    // URL stays as /dashboard but serves /login page content
    return NextResponse.rewrite(new URL('/login', request.url));

    // Great for A/B testing:
    if (isInExperiment(request)) {
      return NextResponse.rewrite(new URL('/new-homepage', request.url));
    }
    // User sees / in their URL but gets the new design
  }

next() — Continue to the page, optionally modifying headers:
  export function middleware(request) {
    const response = NextResponse.next();
    response.headers.set('x-custom-header', 'hello');
    // Request continues normally to the original page
    return response;
  }

Summary:
  redirect  → URL changes, new page loads, user SEES the new URL
  rewrite   → URL stays same, different page serves, user DOESN'T notice
  next()    → Continue normally, optionally add/modify headers or cookies

Common middleware patterns:
• Authentication: redirect to /login if not signed in
• A/B testing: rewrite to different page variants
• Geolocation: rewrite to country-specific content
• Bot detection: redirect bots or serve different content
• Adding headers: CORS headers, security headers, tracking IDs

Configure which paths run middleware:
  export const config = {
    matcher: ['/dashboard/:path*', '/api/:path*'],
  };`,
      tags: ["Next.js", "Architecture"],
    },
    {
      id: 54,
      question: "Flexbox vs CSS Grid — when should you use each?",
      answer: `Flexbox is for one-dimensional layouts (row OR column). Grid is for two-dimensional layouts (rows AND columns simultaneously).

Flexbox — One direction at a time:
  .nav {
    display: flex;
    justify-content: space-between; /* Main axis */
    align-items: center;            /* Cross axis */
    gap: 16px;
  }

Best for:
• Navigation bars
• Centering content (vertically + horizontally)
• Distributing space between items in a row/column
• When items should size based on their content

Grid — Rows AND columns:
  .dashboard {
    display: grid;
    grid-template-columns: 250px 1fr 300px; /* 3 columns */
    grid-template-rows: auto 1fr auto;       /* 3 rows */
    gap: 20px;
  }
  .header { grid-column: 1 / -1; }  /* Span full width */
  .sidebar { grid-row: 2 / 3; }

Best for:
• Page layouts (header, sidebar, main, footer)
• Card grids with consistent sizing
• Dashboard layouts
• Any layout where you need to control both dimensions

The mental model:
  Flexbox: "Here are my items, distribute them nicely in this row/column"
  Grid: "Here is my grid structure, place items into specific cells"

Can you combine them? YES — and you should!
  .page {
    display: grid;                              /* Grid for overall layout */
    grid-template-columns: 250px 1fr;
  }
  .toolbar {
    display: flex;                              /* Flex for toolbar items */
    justify-content: space-between;
  }

Rule of thumb:
• Flex for components (navbar, card footer, button groups)
• Grid for page-level layout and card grids`,
      tags: ["CSS", "Fundamentals"],
    },
    {
      id: 55,
      question: "Explain the CSS Box Model",
      answer: `Every HTML element is a rectangular box made up of 4 layers (from inside out):

  ┌─────────────────────── Margin ──────────────────┐
  │  ┌────────────────── Border ─────────────────┐  │
  │  │  ┌────────────── Padding ──────────────┐  │  │
  │  │  │  ┌────────── Content ────────────┐  │  │  │
  │  │  │  │    Your text / image          │  │  │  │
  │  │  │  └───────────────────────────────┘  │  │  │
  │  │  └─────────────────────────────────────┘  │  │
  │  └───────────────────────────────────────────┘  │
  └─────────────────────────────────────────────────┘

1. Content — The actual text, image, or child elements
2. Padding — Space between content and border (inside the box)
3. Border — The edge of the box
4. Margin — Space between this box and other elements (outside the box)

The critical difference — box-sizing:

content-box (default):
  width/height = content only
  .box { width: 200px; padding: 20px; border: 5px solid; }
  // Actual rendered width = 200 + 20 + 20 + 5 + 5 = 250px 😱

border-box (what you want):
  width/height = content + padding + border
  .box { box-sizing: border-box; width: 200px; padding: 20px; border: 5px solid; }
  // Actual rendered width = 200px ✅ (content shrinks to fit)

This is why every modern CSS reset includes:
  *, *::before, *::after {
    box-sizing: border-box;
  }

Margin quirks:
• Margin collapsing — Adjacent vertical margins overlap (the larger one wins)
  .box1 { margin-bottom: 20px; }
  .box2 { margin-top: 30px; }
  // Gap between them = 30px, NOT 50px

• Margins can be negative (pulls elements closer)
• Margin: auto centers block elements horizontally`,
      tags: ["CSS", "Fundamentals"],
    },
    {
      id: 56,
      question: "What are the different CSS position values and when to use each?",
      answer: `CSS position controls how an element is placed in the document flow:

static (default):
  • Normal document flow
  • top/right/bottom/left have NO effect
  .box { position: static; } /* This is the default */

relative:
  • Stays in normal flow (still takes up space)
  • Can be offset from its original position
  • Creates a positioning context for absolute children
  .box {
    position: relative;
    top: 10px;    /* Moves 10px DOWN from original position */
    left: 20px;   /* Moves 20px RIGHT */
  }

absolute:
  • REMOVED from normal flow (doesn't take space)
  • Positioned relative to nearest positioned ancestor (not static)
  • If no positioned ancestor, positions relative to <html>
  .parent { position: relative; }
  .child {
    position: absolute;
    top: 0;
    right: 0;   /* Top-right corner of parent */
  }

fixed:
  • REMOVED from normal flow
  • Positioned relative to the viewport (browser window)
  • Stays in place when scrolling
  .navbar {
    position: fixed;
    top: 0;
    width: 100%;  /* Fixed navbar at top */
  }

sticky:
  • Hybrid of relative and fixed
  • Acts relative until scroll reaches threshold, then becomes fixed
  .header {
    position: sticky;
    top: 0;    /* Sticks when scrolled to top edge */
  }

Common patterns:
• Badges on cards → absolute inside relative parent
• Fixed nav/footer → fixed with top:0 or bottom:0
• Sticky table headers → sticky with top:0
• Tooltips/dropdowns → absolute, positioned near trigger
• Centered overlay → fixed + inset:0 + flex centering`,
      tags: ["CSS", "Fundamentals"],
    },
    {
      id: 57,
      question: "How does CSS specificity work?",
      answer: `Specificity determines which CSS rule wins when multiple rules target the same element. Think of it as a scoring system:

The specificity hierarchy (highest to lowest):
1. !important          → Nuclear option (overrides everything)
2. Inline styles       → style="color: red" → (1,0,0,0)
3. ID selectors        → #header            → (0,1,0,0)
4. Classes/attributes  → .nav, [type="text"], :hover → (0,0,1,0)
5. Elements/pseudo     → div, p, ::before   → (0,0,0,1)

Calculate specificity as a tuple (a, b, c, d):
  p                    → (0,0,0,1)
  .card                → (0,0,1,0)
  p.card               → (0,0,1,1)
  #main .card p        → (0,1,1,1)
  #main .card p.active → (0,1,2,1)

Examples — which wins?
  .card { color: blue; }        /* (0,0,1,0) */
  div.card { color: red; }      /* (0,0,1,1) — WINS (higher d) */

  #header .nav { color: blue; } /* (0,1,1,0) — WINS */
  .header .nav.active { color: red; } /* (0,0,3,0) — loses */
  // An ID (0,1,0,0) always beats any number of classes

If specificity is EQUAL, the LAST rule in the stylesheet wins (source order).

Common mistakes:
  /* Fighting specificity with more specificity */
  .card .title { color: blue; }
  .card .title.active { color: red; } /* Need higher specificity to override */

Better approaches:
  /* BEM methodology — flat specificity */
  .card__title { }
  .card__title--active { }

  /* CSS Layers — control cascade order */
  @layer base, components, utilities;

  /* :where() — zero specificity */
  :where(.card) { color: blue; } /* (0,0,0,0) — easy to override */

  /* :is() — takes highest specificity of its arguments */
  :is(#id, .class) { } /* Specificity of #id */

Rule: Keep specificity flat. Avoid IDs in CSS. Avoid !important.`,
      tags: ["CSS", "Fundamentals"],
    },
    {
      id: 58,
      question: "What are CSS Container Queries and how are they different from Media Queries?",
      answer: `Media Queries respond to the VIEWPORT (browser window) size. Container Queries respond to the CONTAINER (parent element) size. This is a game-changer for component-based design.

Media Query (viewport-based):
  @media (max-width: 768px) {
    .card { flex-direction: column; }
  }
  /* Problem: .card layout depends on the WINDOW size,
     not where the card actually lives */

Container Query (parent-based):
  /* 1. Define a container */
  .card-wrapper {
    container-type: inline-size;
    container-name: card;
  }

  /* 2. Query the container's size */
  @container card (max-width: 400px) {
    .card { flex-direction: column; }
  }
  @container card (min-width: 401px) {
    .card { flex-direction: row; }
  }

Why this matters:
  Imagine a card component used in 3 places:
  • Full-width main content → plenty of space
  • Sidebar → narrow space
  • Modal → medium space

  With media queries, you can't make the card adapt to each context — they all respond to the same viewport width.

  With container queries, the card adapts to its PARENT's width automatically, regardless of where it's placed.

container-type values:
  inline-size  — Query container's width (most common)
  size         — Query both width and height
  normal       — No containment (default)

Container Query Units:
  cqw — 1% of container's width
  cqh — 1% of container's height
  .card-title { font-size: clamp(1rem, 4cqw, 2rem); }
  /* Font size scales with container width! */

Browser support: All modern browsers (Chrome, Firefox, Safari, Edge) support container queries. You can start using them today.`,
      tags: ["CSS", "Architecture"],
    },
    {
      id: 59,
      question: "What are Micro Frontends?",
      answer: `Micro Frontends apply the microservices concept to the frontend — splitting a large frontend app into smaller, independently deployable apps that compose into one user experience.

The idea:
  Traditional monolith:     One big React app, one repo, one team
  Micro Frontends:          Multiple small apps, separate repos, separate teams

  ┌──────────────────────────────────────────┐
  │  Shell / Container App                    │
  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
  │  │  Search   │ │  Product │ │   Cart   │ │
  │  │  (React)  │ │  (Vue)   │ │  (React) │ │
  │  └──────────┘ └──────────┘ └──────────┘ │
  └──────────────────────────────────────────┘

Integration approaches:
1. Build-time (npm packages) — Each micro frontend is an npm package composed at build time. Simple but coupled deploys.

2. Runtime via iframes — Each app in an iframe. Strong isolation but poor UX (no shared routing, poor communication).

3. Runtime via JavaScript — Load apps dynamically:
   // Container loads remote apps at runtime
   // Module Federation (Webpack 5):
   const RemoteApp = React.lazy(() => import('remoteApp/Widget'));

4. Web Components — Each micro frontend is a custom element:
   <search-app></search-app>
   <product-app product-id="123"></product-app>

Module Federation (most popular approach):
  // webpack.config.js of Product team
  new ModuleFederationPlugin({
    name: 'products',
    filename: 'remoteEntry.js',
    exposes: { './ProductList': './src/ProductList' },
  });

Tradeoffs:
✅ Independent deployments, team autonomy, tech diversity
❌ Complexity, shared state challenges, duplicate dependencies, performance overhead

When to use: Large organizations with 5+ frontend teams. If you have a small team, a monolith is simpler and better.`,
      tags: ["Architecture", "Tooling"],
    },
    {
      id: 60,
      question: "What is a Monorepo and what are its tradeoffs?",
      answer: `A monorepo is a single repository that contains multiple projects/packages. Instead of each project in its own repo (polyrepo), everything lives together.

  my-monorepo/
  ├── apps/
  │   ├── web/          # Next.js web app
  │   ├── mobile/       # React Native app
  │   └── admin/        # Admin dashboard
  ├── packages/
  │   ├── ui/           # Shared component library
  │   ├── utils/        # Shared utility functions
  │   └── config/       # Shared ESLint, TypeScript config
  ├── package.json
  └── turbo.json        # Turborepo config

Popular monorepo tools:
• Turborepo — Fast, caching-focused, great for Next.js
• Nx — Feature-rich, supports many frameworks
• pnpm workspaces — Built into pnpm, lightweight
• Lerna — Older, now maintained by Nx team

Benefits:
✅ Code sharing — Shared UI components, utils, types across all apps
✅ Atomic changes — One PR can update the API + web + mobile together
✅ Consistent tooling — Same ESLint, TypeScript, prettier config everywhere
✅ Easier refactoring — Rename a shared function, all usages update
✅ Dependency management — One node_modules, no version conflicts

Tradeoffs:
❌ Build complexity — Need smart build tools to only rebuild what changed
❌ CI/CD scaling — Larger repo = slower clones, need caching
❌ Ownership boundaries — Who owns which package? Need clear CODEOWNERS
❌ Tooling learning curve — Turborepo/Nx have their own config

  // turbo.json — Smart task running
  {
    "pipeline": {
      "build": { "dependsOn": ["^build"], "outputs": [".next/**"] },
      "test": { "dependsOn": ["build"] },
      "lint": {}
    }
  }

When to use: When you have shared code across multiple apps, or when multiple teams work on related projects.`,
      tags: ["Architecture", "Tooling"],
    },
    {
      id: 61,
      question: "What are Web Workers and when would you use them?",
      answer: `Web Workers run JavaScript in a background thread, separate from the main thread. This prevents heavy computations from blocking the UI.

The problem:
JavaScript is single-threaded. If you run expensive code (sorting 1M items, image processing, parsing huge JSON), the UI freezes — no scrolling, no clicking, no animations.

Web Worker solution:
  // main.js — UI thread
  const worker = new Worker('worker.js');

  worker.postMessage({ data: hugeArray });

  worker.onmessage = (event) => {
    console.log('Result:', event.data);
    // UI never froze during computation!
  };

  // worker.js — Background thread
  self.onmessage = (event) => {
    const result = expensiveSort(event.data.data);
    self.postMessage(result);
  };

Key rules:
• Workers have NO access to DOM (no document, no window)
• Communication is via postMessage / onmessage (serialized data)
• Workers have their own scope (self instead of window)
• Can use fetch, setTimeout, IndexedDB inside workers
• Data is COPIED between threads (use Transferable objects for large data)

Types:
1. Dedicated Worker — One worker, one page
2. Shared Worker — Shared across tabs/windows
3. Service Worker — Proxy between app and network (for offline/caching)

Real-world use cases:
• Syntax highlighting in code editors (Monaco)
• Image/video processing (filters, compression)
• Parsing large CSV/JSON files
• Complex calculations (spreadsheet formulas)
• Encryption/hashing
• Search indexing

Modern approach with Comlink:
  // Makes workers feel like regular async functions
  import { wrap } from 'comlink';
  const worker = wrap(new Worker('worker.js'));
  const result = await worker.expensiveSort(data);`,
      tags: ["JavaScript", "Browser APIs", "Performance"],
    },
    {
      id: 62,
      question: "What is a Service Worker and how is it different from a Web Worker?",
      answer: `Both run JavaScript in background threads, but they serve completely different purposes:

Web Worker:
• Runs heavy computations off the main thread
• Lives and dies with the page
• Direct communication with the page via postMessage
• Use for: CPU-intensive work (sorting, parsing, image processing)

Service Worker:
• Acts as a network proxy between your app and the internet
• Persists even after the page is closed
• Can intercept ALL network requests
• Use for: Offline support, caching, push notifications, background sync

Service Worker lifecycle:
  // 1. Register
  navigator.serviceWorker.register('/sw.js');

  // 2. Install — Cache static assets
  self.addEventListener('install', event => {
    event.waitUntil(
      caches.open('v1').then(cache =>
        cache.addAll(['/', '/app.js', '/styles.css'])
      )
    );
  });

  // 3. Activate — Clean old caches
  self.addEventListener('activate', event => {
    event.waitUntil(
      caches.keys().then(keys =>
        Promise.all(keys.filter(k => k !== 'v1').map(k => caches.delete(k)))
      )
    );
  });

  // 4. Fetch — Intercept network requests
  self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request)
        .then(cached => cached || fetch(event.request))
    );
  });

Key differences:
  Feature          Web Worker      Service Worker
  Lifetime         Page lifetime   Persists after page close
  DOM access       No              No
  Network proxy    No              Yes
  Push notifs      No              Yes
  Multiple pages   No (Dedicated)  Controls all pages in scope
  HTTPS required   No              Yes (except localhost)

Service Workers enable PWAs (Progressive Web Apps) — making web apps work offline and feel native.`,
      tags: ["JavaScript", "Browser APIs", "Performance"],
    },
    {
      id: 63,
      question: "How does a CDN work and why should frontend developers care?",
      answer: `A CDN (Content Delivery Network) is a network of servers distributed worldwide that caches and serves your content from the location closest to each user.

Without CDN:
  User in Tokyo → Request travels to server in New York → 200ms+ latency

With CDN:
  User in Tokyo → Request goes to CDN edge server in Tokyo → 20ms latency

How it works:
1. You deploy your app/assets to an origin server
2. CDN has edge servers (PoPs — Points of Presence) worldwide
3. First request: CDN fetches from origin, caches the response
4. Subsequent requests: CDN serves from cache (no origin hit)

What frontend devs should put on CDN:
• Static assets — JS bundles, CSS, images, fonts
• Static HTML — Pre-rendered pages (SSG)
• API responses — Cached GET responses

CDN configuration you should know:
  // Cache-Control headers (you set these)
  Cache-Control: public, max-age=31536000, immutable
  // For hashed files (app.abc123.js) — cache forever

  Cache-Control: public, max-age=0, s-maxage=3600, stale-while-revalidate
  // For HTML pages — CDN caches 1 hour, serves stale while revalidating

Cache invalidation:
  // When you deploy, you need to bust the cache:
  // Option 1: Content-hashed filenames (best)
  app.abc123.js → app.def456.js  // New hash = new URL = no stale cache

  // Option 2: Purge CDN cache on deploy
  // Vercel, Cloudflare, AWS CloudFront all support this

Why frontend devs should care:
1. Performance — 50-90% faster page loads for global users
2. Reliability — If origin goes down, CDN still serves cached content
3. Cost — Less load on origin server = lower hosting costs
4. DDoS protection — CDN absorbs traffic spikes

Popular CDNs: Cloudflare, Vercel Edge Network, AWS CloudFront, Fastly, Akamai.

Vercel/Next.js: Static assets and SSG pages are automatically deployed to CDN edge servers.`,
      tags: ["Performance", "Architecture"],
    },
    {
      id: 64,
      question: "What is the difference between npm, yarn, and pnpm?",
      answer: `All three are JavaScript package managers. They install dependencies, manage versions, and run scripts. Here's how they differ:

npm (Node Package Manager):
• Comes with Node.js — no extra installation
• Uses a flat node_modules structure (hoisting)
• package-lock.json for lockfile
  npm install
  npm install react
  npm run build

yarn (by Facebook):
• Introduced parallel downloads (faster than early npm)
• yarn.lock for lockfile
• Workspaces for monorepos (before npm had them)
• Plug'n'Play (PnP) mode — no node_modules! Uses a .pnp.cjs file
  yarn install
  yarn add react
  yarn build

pnpm (Performant npm):
• Uses a content-addressable store — each package version stored ONCE globally
• Projects link to the global store (saves massive disk space)
• Strict node_modules — no phantom dependencies
• pnpm-lock.yaml for lockfile
  pnpm install
  pnpm add react
  pnpm run build

Key differences:

Disk space:
  npm/yarn: Each project copies packages to its own node_modules
  pnpm: Single global store, projects use symlinks → 50-80% less disk space

Speed:
  npm: Slowest (improved a lot since v7)
  yarn: Fast (parallel installs, caching)
  pnpm: Fastest (symlinks + global cache)

Phantom dependencies:
  npm/yarn (flat): Your code can import packages you didn't explicitly install (because hoisting puts them in node_modules root)
  pnpm (strict): Only packages in your package.json are accessible — catches bugs early

  // With npm/yarn, this might work even if 'lodash' isn't in your package.json:
  import _ from 'lodash'; // Works because some other dep installed it
  // With pnpm: Error! You must explicitly add lodash

Monorepo support:
  npm: workspaces (since v7)
  yarn: workspaces (mature)
  pnpm: workspaces (great, most disk efficient)

Recommendation: pnpm for new projects (fastest, strictest, saves disk). npm for simplicity. yarn if your team already uses it.`,
      tags: ["Tooling", "Build"],
    },
    {
      id: 65,
      question: "What is the Testing Pyramid for frontend applications?",
      answer: `The Testing Pyramid describes how many tests you should have at each level. More tests at the bottom (fast, cheap), fewer at the top (slow, expensive):

        /\\
       /  \\        E2E Tests (few)
      /    \\       Simulate real user flows
     /──────\\      Tools: Cypress, Playwright
    /        \\
   / Integra- \\   Integration Tests (some)
  /   tion     \\  Components working together
 /──────────────\\ Tools: Testing Library, MSW
/                \\
/ Unit Tests      \\ Unit Tests (many)
/  (many, fast)    \\ Individual functions, hooks
───────────────────  Tools: Jest, Vitest

1. Unit Tests (70% of tests):
  • Test individual functions, hooks, utilities
  • Fast, isolated, no DOM or network
  // utils.test.js
  test('formatCurrency', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
    expect(formatCurrency(0)).toBe('$0.00');
  });

2. Integration Tests (20% of tests):
  • Test components working together
  • Render components, simulate user interaction, mock API
  // LoginForm.test.jsx
  test('shows error on invalid login', async () => {
    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText('Email'), 'bad@email');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

3. E2E Tests (10% of tests):
  • Test full user flows in a real browser
  • Slowest but highest confidence
  // checkout.spec.ts (Playwright)
  test('complete purchase', async ({ page }) => {
    await page.goto('/products');
    await page.click('text=Add to Cart');
    await page.click('text=Checkout');
    await page.fill('#card', '4242424242424242');
    await page.click('text=Pay');
    await expect(page.locator('.success')).toBeVisible();
  });

The trophy model (Kent C. Dodds) adds Static Analysis at the base: TypeScript + ESLint catch bugs before tests even run.`,
      tags: ["Testing", "Architecture"],
    },
    {
      id: 66,
      question: "What is the difference between Jest, Vitest, and React Testing Library?",
      answer: `These serve different purposes — Jest and Vitest are test RUNNERS, React Testing Library is a testing UTILITY.

Jest:
• Test runner + assertion library + mocking — all in one
• Created by Facebook, default for CRA
• Runs tests in Node.js with jsdom (simulated browser)
• Snapshot testing, code coverage, parallel execution
  // jest.config.js
  test('adds numbers', () => {
    expect(1 + 2).toBe(3);
  });

Vitest:
• Modern alternative to Jest, built on Vite
• Same API as Jest (almost drop-in replacement)
• Native ESM support, TypeScript out of the box
• Much faster — reuses Vite's transform pipeline
• Hot module reloading for tests (instant re-runs)
  // vitest.config.ts
  test('adds numbers', () => {
    expect(1 + 2).toBe(3);
  });

React Testing Library (RTL):
• NOT a test runner — it's a utility library used WITH Jest or Vitest
• Renders React components and provides methods to interact with them
• Philosophy: "Test the way users use your app" (not implementation details)
  import { render, screen } from '@testing-library/react';
  import userEvent from '@testing-library/user-event';

  test('counter increments', async () => {
    render(<Counter />);
    const button = screen.getByRole('button', { name: 'Increment' });
    await userEvent.click(button);
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });

RTL queries (in order of priority):
  getByRole       ← Preferred (how assistive tech sees it)
  getByLabelText  ← Form elements
  getByPlaceholderText
  getByText       ← Non-interactive elements
  getByTestId     ← Last resort

Common stack:
  2020s: Jest + React Testing Library
  2024+: Vitest + React Testing Library (faster, modern)

When to use what:
• Jest: Established projects, CRA, if you need mature ecosystem
• Vitest: New projects, Vite-based apps, want faster tests
• RTL: Always — it's the standard for testing React components`,
      tags: ["Testing", "React", "Tooling"],
    },
    {
      id: 67,
      question: "Cypress vs Playwright — which would you choose and why?",
      answer: `Both are E2E testing tools that automate real browser testing. Here's a practical comparison:

Cypress:
• Runs INSIDE the browser (same event loop as your app)
• JavaScript/TypeScript only
• Chrome-family + Firefox + WebKit (limited)
• Interactive test runner with time-travel debugging
• Great developer experience
  // cypress/e2e/login.cy.js
  describe('Login', () => {
    it('should login successfully', () => {
      cy.visit('/login');
      cy.get('[data-cy=email]').type('user@test.com');
      cy.get('[data-cy=password]').type('password123');
      cy.get('button[type=submit]').click();
      cy.url().should('include', '/dashboard');
    });
  });

Playwright:
• Runs OUTSIDE the browser (controls via DevTools Protocol)
• JavaScript, TypeScript, Python, Java, C#
• Chrome, Firefox, WebKit (true cross-browser)
• Built-in parallelism, auto-waiting, tracing
• Created by Microsoft (ex-Puppeteer team)
  // tests/login.spec.ts
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid=email]', 'user@test.com');
    await page.fill('[data-testid=password]', 'password123');
    await page.click('button[type=submit]');
    await expect(page).toHaveURL(/dashboard/);
  });

Key differences:
  Feature           Cypress          Playwright
  Speed             Slower           Faster (parallel by default)
  Browsers          Limited WebKit   Full cross-browser
  Multi-tab         Not supported    Supported
  iframes           Tricky           Easy
  Network mocking   cy.intercept()   route.fulfill()
  Debugging         Time-travel UI   Trace viewer + codegen
  CI/CD             Cypress Cloud    Free, any CI
  Learning curve    Easier           Slightly harder

My recommendation:
• Choose Playwright for: New projects, cross-browser needs, CI-heavy teams, multi-tab/iframe scenarios
• Choose Cypress for: Teams already using it, simpler E2E needs, when DX and visual debugging are priority

Industry trend: Playwright is gaining momentum rapidly due to speed, true cross-browser support, and no vendor lock-in.`,
      tags: ["Testing", "Tooling"],
    },
  ],

  scenarioBased: [
    {
      id: 1,
      question: "Your React app needs infinite scrolling (like a LinkedIn feed). How would you implement it efficiently?",
      answer: `Step-by-step approach:

1. Intersection Observer — Detect when user scrolls near the bottom:
const observerRef = useRef();
const lastItemRef = useCallback(node => {
  if (observerRef.current) observerRef.current.disconnect();
  observerRef.current = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && hasNextPage) {
      fetchNextPage();
    }
  });
  if (node) observerRef.current.observe(node);
}, [hasNextPage]);

2. Pagination — Use cursor-based pagination (not offset). Send the last item's ID to get the next batch.

3. Virtualization — For very long lists (1000+ items), render only visible items using react-window or @tanstack/virtual. This keeps DOM nodes low (~20-30 visible items instead of 5000).

4. Loading state — Show skeleton loaders at the bottom while fetching.

5. Error handling — If a fetch fails, show a "Retry" button instead of silently failing.

Quick implementation with React Query:
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['feed'],
  queryFn: ({ pageParam }) => fetchFeed(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});

Why NOT scroll event listeners?
Scroll events fire 60+ times per second — expensive. Intersection Observer is passive, browser-optimized, and doesn't block the main thread.`,
      tags: ["React", "Performance", "UX"],
    },
    {
      id: 2,
      question: "How would you auto-logout users after 30 minutes of inactivity in a React app?",
      answer: `Here's the practical approach:

1. Track user activity — Listen for mouse, keyboard, and touch events:
const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];

2. Reset a timer on every activity:
function useIdleTimeout(timeout = 30 * 60 * 1000) {
  const timerRef = useRef();

  const resetTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      logout();
      // Optional: show "Session expired" modal before redirecting
    }, timeout);
  }, [timeout]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer(); // Start timer

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      clearTimeout(timerRef.current);
    };
  }, [resetTimer]);
}

3. Multi-tab support — Use BroadcastChannel or localStorage events to sync across tabs:
// When activity happens in one tab, update a localStorage timestamp
localStorage.setItem('lastActivity', Date.now());
// Other tabs listen for storage events and reset their timers

4. Show warning modal — At 25 minutes, show "Your session will expire in 5 minutes. Continue?" with an "Extend Session" button that refreshes the token.

5. Server-side validation — Always validate token expiry on the server too. Client-side timeout is UX, not security.

Important: Throttle the activity listener (every 30s is fine) — you don't need millisecond precision for a 30-minute timeout.`,
      tags: ["React", "Security", "Auth"],
    },
    {
      id: 3,
      question: "Your application must support multiple languages. How would you implement internationalization (i18n) in React?",
      answer: `Recommended approach with next-intl (for Next.js) or react-i18next:

1. Set up translation files — One JSON per language:
// messages/en.json
{ "greeting": "Hello, {name}!", "cart": "{count, plural, one {# item} other {# items}}" }

// messages/ar.json
{ "greeting": "!مرحبا {name}", "cart": "{count, plural, one {عنصر #} other {عناصر #}}" }

2. Wrap your app with a provider:
<NextIntlClientProvider locale={locale} messages={messages}>
  <App />
</NextIntlClientProvider>

3. Use translations in components:
function Header() {
  const t = useTranslations();
  return <h1>{t('greeting', { name: 'Ahmed' })}</h1>;
}

Key considerations:

Routing: URL-based locale (/en/about, /ar/about) is best for SEO. Next.js middleware can detect browser language and redirect.

RTL support: Arabic, Hebrew need dir="rtl". Use CSS logical properties (margin-inline-start instead of margin-left) so layout flips automatically.

Date/number formatting: Use Intl.DateTimeFormat and Intl.NumberFormat — they're built into JavaScript.
new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(99.99)

Dynamic loading: Don't bundle ALL languages. Load translation files on demand based on the selected locale.

Pluralization: Different languages have different plural rules (English has 2 forms, Arabic has 6). Libraries handle this automatically.

Avoid: String concatenation for translations — "Hello " + name breaks in RTL and languages with different word order.`,
      tags: ["React", "Next.js", "i18n"],
    },
    {
      id: 4,
      question: "You need to upload large files (100MB+) in React. How would you handle this without timeouts?",
      answer: `Use chunked uploading — break the file into smaller pieces:

1. Slice the file into chunks:
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB per chunk
const chunks = [];
for (let i = 0; i < file.size; i += CHUNK_SIZE) {
  chunks.push(file.slice(i, i + CHUNK_SIZE));
}

2. Upload each chunk with metadata:
async function uploadChunks(file, chunks) {
  const uploadId = crypto.randomUUID();
  for (let i = 0; i < chunks.length; i++) {
    const formData = new FormData();
    formData.append('chunk', chunks[i]);
    formData.append('uploadId', uploadId);
    formData.append('chunkIndex', i);
    formData.append('totalChunks', chunks.length);

    await fetch('/api/upload', { method: 'POST', body: formData });
    setProgress(((i + 1) / chunks.length) * 100);
  }
  // Tell server to reassemble
  await fetch('/api/upload/complete', { method: 'POST', body: JSON.stringify({ uploadId }) });
}

3. Resumable uploads — If a chunk fails, retry just that chunk:
• Track which chunks succeeded
• On retry, skip already-uploaded chunks
• TUS protocol (tus.io) is the standard for resumable uploads

4. Show meaningful progress:
• Progress bar per chunk (not just spinner)
• Upload speed indicator
• Estimated time remaining
• Pause/resume buttons

5. Consider direct-to-cloud:
• Use S3 presigned URLs or GCS signed URLs
• Browser uploads directly to cloud storage (bypasses your server)
• Much better for large files — no server memory/timeout issues

Libraries: tus-js-client (resumable), Uppy (full-featured UI + backends), react-dropzone (drag & drop UI).`,
      tags: ["React", "File Upload", "Performance"],
    },
    {
      id: 5,
      question: "Your client complains that Google isn't indexing your React SPA. How would you solve this SEO issue?",
      answer: `The problem: SPAs serve an empty HTML shell. Google sees <div id="root"></div> with no content.

Solutions ranked by effectiveness:

1. Migrate to Next.js (best long-term fix):
• Server-side rendering — Google gets full HTML with content
• Automatic code splitting, image optimization, metadata API
• Can migrate incrementally — start with critical pages

2. If staying with SPA, use pre-rendering:
• Tools like prerender.io or react-snap generate static HTML at build time
• Serves pre-rendered HTML to search engine bots
• Users still get the SPA experience

3. Fix metadata:
• Add proper <title>, <meta description> for each route
• Use React Helmet or Next.js Metadata API
• Structured data (JSON-LD) for rich snippets

4. Technical SEO checklist:
• Create and submit sitemap.xml to Google Search Console
• Add proper robots.txt
• Ensure canonical URLs are set
• Use semantic HTML (h1, h2, article, nav)
• Make sure pages load fast (Core Web Vitals)

5. Fix common SPA SEO killers:
• Hash routing (#/about) → Use proper paths (/about)
• JavaScript-only content → Ensure critical content is in initial HTML
• Lazy-loaded content above the fold → Load it eagerly
• Missing meta tags → Add them per route

Quick verification: Google "site:yourdomain.com" to see what's indexed. Use Google Search Console's URL Inspection tool to see what Googlebot sees.`,
      tags: ["SEO", "React", "Next.js"],
    },
    {
      id: 6,
      question: "Inside useEffect, you're working with outdated state values. How do you fix stale closures?",
      answer: `The problem:
const [count, setCount] = useState(0);
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1); // Always 0+1=1, because count is captured as 0
  }, 1000);
  return () => clearInterval(id);
}, []); // Empty deps = captures initial count forever

Fix 1 — Functional updater (most common):
setCount(prev => prev + 1);
// prev is always the latest value, not the stale closure

Fix 2 — Add to dependency array:
useEffect(() => {
  const id = setInterval(() => setCount(count + 1), 1000);
  return () => clearInterval(id);
}, [count]); // Re-runs effect when count changes
// Downside: creates a new interval every time count changes

Fix 3 — Use a ref:
const countRef = useRef(count);
useEffect(() => { countRef.current = count; }, [count]);

useEffect(() => {
  const id = setInterval(() => {
    console.log(countRef.current); // Always current value
  }, 1000);
  return () => clearInterval(id);
}, []);
// Best when you need to READ the value without triggering re-runs

Fix 4 — useReducer:
const [count, dispatch] = useReducer((state, action) => state + 1, 0);
useEffect(() => {
  const id = setInterval(() => dispatch(), 1000);
  return () => clearInterval(id);
}, []); // dispatch is stable, no stale closure

Which to choose:
• Simple state updates → Functional updater (Fix 1)
• Need to read value without updating → Ref (Fix 3)
• Complex state logic → useReducer (Fix 4)`,
      tags: ["React", "Hooks", "Debugging"],
    },
    {
      id: 7,
      question: "Your app bundle size is too large. How would you diagnose and reduce it?",
      answer: `Step 1 — Diagnose (don't guess):
• Run: npx webpack-bundle-analyzer or next build (Next.js shows sizes)
• Or: npx source-map-explorer build/static/js/*.js
• Look for: Massive dependencies, duplicate packages, unused code

Step 2 — Quick wins (usually 30-50% reduction):
• Replace heavy libraries:
  moment.js (300KB) → day.js (2KB)
  lodash (70KB) → lodash-es + named imports (only what you use)
  axios → native fetch
• Remove unused dependencies: npx depcheck

Step 3 — Code splitting:
• Route-based: Each page = separate chunk (automatic in Next.js)
• Component-based: lazy(() => import('./HeavyChart'))
• Library-based: dynamic import of chart/editor/map libraries

Step 4 — Tree shaking:
• Use ES module versions: import { debounce } from 'lodash-es'
• Check "sideEffects" in package.json
• Avoid barrel files (index.js re-exporting everything)

Step 5 — Advanced:
• Image optimization: next/image, WebP, responsive srcset
• Font subsetting: Only include characters you use
• Compression: Enable Brotli on your CDN/server
• Set performance budgets in CI: Fail build if bundle > threshold

Step 6 — Monitor:
• Track bundle size in CI with bundlesize or size-limit
• Set up alerts for unexpected increases
• Review bundle impact in PR reviews

Expected results: A typical React app can go from 500KB to 150-200KB with these steps.`,
      tags: ["Performance", "Optimization", "Tooling"],
    },
    {
      id: 8,
      question: "Some routes must only be accessed by Admins. How would you implement role-based access in React Router?",
      answer: `Two layers: client-side (UX) + server-side (security).

1. Protected route component:
function RequireRole({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" />;

  return children;
}

// Usage in routes:
<Route path="/admin" element={
  <RequireRole allowedRoles={['admin']}>
    <AdminDashboard />
  </RequireRole>
} />

<Route path="/manager" element={
  <RequireRole allowedRoles={['admin', 'manager']}>
    <ManagerPanel />
  </RequireRole>
} />

2. Conditional navigation — Don't show links to pages user can't access:
{user.role === 'admin' && <Link to="/admin">Admin Panel</Link>}

3. Server-side validation (critical!):
// Every API endpoint must check roles too
app.get('/api/admin/users', authenticate, authorize(['admin']), (req, res) => {
  // Only reaches here if user is authenticated AND is admin
});

Client-side route protection is just UX — anyone can bypass it by typing the URL. The real security is the API refusing to return data.

4. In Next.js (middleware approach):
// middleware.js
export function middleware(request) {
  const token = request.cookies.get('token');
  const user = verifyToken(token);
  if (request.nextUrl.pathname.startsWith('/admin') && user?.role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
}

5. Permission system for complex apps:
Instead of role strings, use a permissions array:
user.permissions = ['users:read', 'users:write', 'reports:read']
This is more flexible than role-based checks when you have many roles with overlapping permissions.`,
      tags: ["React", "Auth", "Security"],
    },
    {
      id: 9,
      question: "The product team wants smooth page transitions and animations. What approach would you take in React?",
      answer: `Options from simplest to most powerful:

1. CSS Transitions (simplest, best for most cases):
.page-enter { opacity: 0; transform: translateY(20px); }
.page-enter-active { opacity: 1; transform: translateY(0); transition: all 0.3s ease; }
.page-exit { opacity: 1; }
.page-exit-active { opacity: 0; transition: opacity 0.2s ease; }

2. View Transitions API (modern, native browser):
// Supported in Chrome, Edge. Progressive enhancement — works without JS too.
document.startViewTransition(() => {
  // Update the DOM
  navigate('/new-page');
});
// Next.js: experimental support via next.config.js

3. Framer Motion (most popular React library):
import { AnimatePresence, motion } from 'framer-motion';

<AnimatePresence mode="wait">
  <motion.div
    key={pathname}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
</AnimatePresence>

4. Route transition wrapper (Next.js App Router):
// Create a template.js (re-mounts on navigation, unlike layout.js)
// Wrap children in AnimatePresence

Key decisions:
• Simple fade/slide → CSS transitions (zero bundle cost)
• Shared element transitions → View Transitions API
• Complex choreography → Framer Motion (~30KB)
• Performance → Always use transform/opacity (GPU-accelerated), avoid animating width/height/top/left

Performance rules:
• Only animate transform and opacity (composited, no layout recalculation)
• Use will-change: transform sparingly
• Reduce motion for users who prefer it: @media (prefers-reduced-motion: reduce)
• Test on low-end devices — animations that are smooth on your MacBook may lag on budget phones`,
      tags: ["React", "Animation", "UX"],
    },
    {
      id: 10,
      question: "Your API calls frequently hit the rate limit. How would you implement throttling or control request frequency?",
      answer: `Multiple strategies depending on the situation:

1. Client-side request throttling:
// Simple throttle — max 1 request per second
let lastCall = 0;
async function throttledFetch(url) {
  const now = Date.now();
  const delay = Math.max(0, 1000 - (now - lastCall));
  await new Promise(r => setTimeout(r, delay));
  lastCall = Date.now();
  return fetch(url);
}

2. Request queue with concurrency limit:
// Process max 3 requests at a time
class RequestQueue {
  constructor(maxConcurrent = 3) {
    this.queue = [];
    this.running = 0;
    this.max = maxConcurrent;
  }
  async add(fn) {
    if (this.running >= this.max) {
      await new Promise(r => this.queue.push(r));
    }
    this.running++;
    try { return await fn(); }
    finally {
      this.running--;
      this.queue.shift()?.();
    }
  }
}

3. Exponential backoff on 429 errors:
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url);
    if (res.status === 429) {
      const retryAfter = res.headers.get('Retry-After') || Math.pow(2, i);
      await new Promise(r => setTimeout(r, retryAfter * 1000));
      continue;
    }
    return res;
  }
  throw new Error('Rate limit exceeded after retries');
}

4. Cache responses — Don't re-fetch what you already have:
• Use React Query/SWR with staleTime — data stays cached for X seconds
• Browser cache headers (Cache-Control)
• In-memory cache for frequently accessed data

5. Debounce user-triggered requests:
• Search input → debounce 300ms (don't fire on every keystroke)
• Autocomplete → debounce + abort previous request with AbortController

6. Batch requests — Instead of 50 individual calls, send one batched request:
// Instead of: GET /user/1, GET /user/2, ...
// Use: POST /users/batch { ids: [1, 2, 3, ...] }

Best practice: Combine multiple strategies. Cache + debounce + retry with backoff covers most scenarios.`,
      tags: ["API", "Performance", "Architecture"],
    },
    {
      id: 11,
      question: "Your app loads slowly on mobile devices. How would you optimize performance?",
      answer: `Systematic approach — measure first, then optimize:

Step 1 — Measure on real devices:
• Use Chrome DevTools → Performance tab with CPU 4x slowdown
• Lighthouse in mobile mode
• Test on a real mid-range Android phone (not just your MacBook)
• Check Core Web Vitals in Google Search Console (real user data)

Step 2 — Reduce JavaScript:
• Code split aggressively — mobile users often have slow networks
• Lazy load below-fold content
• Replace heavy libraries with lighter alternatives
• Remove unused CSS (PurgeCSS or Tailwind's built-in purging)

Step 3 — Optimize images (usually biggest impact):
• Use next/image or responsive images with srcset
• Serve WebP/AVIF format (30-50% smaller than JPEG)
• Lazy load images below the fold
• Use blur placeholder for perceived performance

Step 4 — Reduce network requests:
• Preconnect to critical origins: <link rel="preconnect" href="https://api.example.com">
• Preload critical resources: <link rel="preload" href="/font.woff2" as="font">
• Use HTTP/2 for multiplexing
• Enable compression (Brotli > gzip)

Step 5 — Optimize rendering:
• Avoid layout thrashing (batch DOM reads/writes)
• Use CSS contain on heavy components
• Virtualize long lists
• Use content-visibility: auto for off-screen content

Step 6 — Service worker:
• Cache static assets for instant repeat visits
• Offline fallback page
• Background sync for poor connections

Quick wins with biggest impact: Image optimization + code splitting + compression typically improve mobile load time by 50-70%.`,
      tags: ["Performance", "Mobile", "Optimization"],
    },
    {
      id: 12,
      question: "Users report that the form loses data when they accidentally navigate away. How would you prevent this?",
      answer: `Multiple layers of protection:

1. Browser beforeunload warning (for tab close/refresh):
useEffect(() => {
  const handler = (e) => {
    if (formIsDirty) {
      e.preventDefault();
      e.returnValue = ''; // Shows browser's default "Leave page?" dialog
    }
  };
  window.addEventListener('beforeunload', handler);
  return () => window.removeEventListener('beforeunload', handler);
}, [formIsDirty]);

2. React Router navigation blocking:
// React Router v6.4+
const blocker = useBlocker(({ currentLocation, nextLocation }) => {
  return formIsDirty && currentLocation.pathname !== nextLocation.pathname;
});

// Show custom modal when blocker.state === 'blocked'
{blocker.state === 'blocked' && (
  <ConfirmDialog
    message="You have unsaved changes. Leave anyway?"
    onConfirm={() => blocker.proceed()}
    onCancel={() => blocker.reset()}
  />
)}

3. Auto-save drafts:
// Save to localStorage or sessionStorage on every change (debounced)
const debouncedSave = useMemo(
  () => debounce((data) => {
    sessionStorage.setItem('form-draft', JSON.stringify(data));
  }, 1000),
  []
);

// On mount, restore draft
useEffect(() => {
  const draft = sessionStorage.getItem('form-draft');
  if (draft) {
    const parsed = JSON.parse(draft);
    // Show: "Restore unsaved draft?" prompt
  }
}, []);

4. Track dirty state properly:
const [isDirty, setIsDirty] = useState(false);
// Compare current values to initial values
// Or use React Hook Form's formState.isDirty

5. Clear draft on successful submit:
const onSubmit = async (data) => {
  await saveToServer(data);
  sessionStorage.removeItem('form-draft');
  setIsDirty(false);
};

Best approach: Combine #1 (browser protection) + #2 (router protection) + #3 (auto-save). This handles all scenarios: tab close, navigation, and crash recovery.`,
      tags: ["React", "Forms", "UX"],
    },
    {
      id: 13,
      question: "You need to implement real-time features (live chat, notifications). What approach would you take?",
      answer: `Options from simplest to most scalable:

1. Polling (simplest, limited):
// Check for new messages every 5 seconds
useEffect(() => {
  const id = setInterval(() => fetchMessages(), 5000);
  return () => clearInterval(id);
}, []);
// Simple but wasteful — most requests return nothing

2. Long Polling (slightly better):
// Server holds the connection open until there's new data
async function longPoll() {
  const res = await fetch('/api/messages?since=' + lastId);
  const data = await res.json();
  setMessages(prev => [...prev, ...data]);
  longPoll(); // Immediately poll again
}
// Less wasteful than regular polling, but still HTTP overhead per message

3. Server-Sent Events / SSE (good for one-way):
// Server pushes data to client (notifications, feed updates)
useEffect(() => {
  const source = new EventSource('/api/notifications');
  source.onmessage = (e) => {
    setNotifications(prev => [...prev, JSON.parse(e.data)]);
  };
  return () => source.close();
}, []);
// Automatic reconnection, works through proxies, HTTP-based

4. WebSockets (best for bidirectional):
// Full duplex — both sides send/receive anytime (chat, gaming)
const ws = new WebSocket('wss://api.example.com/chat');
ws.onmessage = (e) => setMessages(prev => [...prev, JSON.parse(e.data)]);
ws.send(JSON.stringify({ text: 'Hello!' }));

5. Libraries that handle the complexity:
• Socket.io — WebSocket with fallbacks, rooms, reconnection
• Pusher/Ably — Managed real-time infrastructure
• Supabase Realtime — Real-time database subscriptions
• Firebase Realtime/Firestore — Full real-time backend

Decision guide:
• Notifications (one-way) → SSE
• Chat (two-way) → WebSocket or Socket.io
• Collaborative editing → CRDTs (Yjs, Automerge) over WebSocket
• Simple dashboard updates → Polling or SSE
• Need reliability at scale → Managed service (Pusher, Ably)`,
      tags: ["Architecture", "Real-time", "WebSocket"],
    },
    {
      id: 14,
      question: "Your team is debating between Redux, Zustand, and Context API. How do you decide?",
      answer: `It depends on three factors: complexity, frequency of updates, and team size.

Context API — Built-in, no library:
✅ Use when: Rarely changing data (theme, locale, auth status)
❌ Don't use when: Frequently updating data (form state, real-time data)
Why: Context re-renders ALL consumers when value changes. No built-in selectors.

// Good for Context:
<ThemeProvider value={{ theme: 'dark' }}> // Changes rarely

// Bad for Context:
<FormProvider value={{ ...50 form fields }}> // Changes on every keystroke

Zustand — Lightweight (1KB), simple API:
✅ Use when: Small-to-medium apps, when you want simplicity
✅ Use when: Need selectors (only re-render when specific state changes)
✅ Use when: You want minimal boilerplate

const useStore = create((set) => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 })),
}));
// Component only re-renders if count changes:
const count = useStore(state => state.count);

Redux Toolkit — Full ecosystem:
✅ Use when: Large apps with complex state (many reducers, middleware)
✅ Use when: Need dev tools with time-travel debugging
✅ Use when: Large team needs enforced patterns and structure
❌ Don't use when: Small app — too much boilerplate for simple state

My decision framework:
1. Can the state live in a component? → useState/useReducer
2. Need to share across a few components? → Lift state up or Context
3. Need shared state with frequent updates? → Zustand (simple) or Redux (complex)
4. Server state (API data)? → React Query/TanStack Query (not Redux!)

Most common mistake: Using Redux or Context for server state. React Query handles caching, refetching, and loading states much better.`,
      tags: ["React", "State Management", "Architecture"],
    },
    {
      id: 15,
      question: "You need to implement optimistic UI updates. How would you approach it?",
      answer: `Optimistic UI means showing the result immediately before the server confirms it, then rolling back if it fails.

Example: Like button
// Without optimistic: Click → spinner → server confirms → show liked (slow feeling)
// With optimistic: Click → show liked immediately → server confirms in background

Implementation with React Query:
const likeMutation = useMutation({
  mutationFn: (postId) => fetch('/api/like/' + postId, { method: 'POST' }),

  onMutate: async (postId) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['posts']);

    // Snapshot previous state (for rollback)
    const previousPosts = queryClient.getQueryData(['posts']);

    // Optimistically update
    queryClient.setQueryData(['posts'], (old) =>
      old.map(post => post.id === postId
        ? { ...post, liked: true, likes: post.likes + 1 }
        : post
      )
    );

    return { previousPosts }; // Context for rollback
  },

  onError: (err, postId, context) => {
    // Rollback on failure
    queryClient.setQueryData(['posts'], context.previousPosts);
    toast.error('Failed to like. Please try again.');
  },

  onSettled: () => {
    // Refetch to ensure server state matches
    queryClient.invalidateQueries(['posts']);
  },
});

When to use optimistic updates:
• Like/unlike, follow/unfollow (instant feedback expected)
• Adding items to a list or cart
• Toggling settings
• Deleting items (show as deleted immediately)

When NOT to use:
• Payment processing (never pretend money was charged)
• Complex operations that might fail for business logic reasons
• When rollback UI is confusing to the user

Key principles:
1. Always keep a snapshot for rollback
2. Always refetch after mutation (onSettled) to sync with server truth
3. Show clear feedback if the optimistic action fails
4. Use unique IDs for optimistic items (avoid duplicates when server responds)`,
      tags: ["React", "UX", "Performance"],
    },
    {
      id: 16,
      question: "Users report layout shifts when the page loads. How would you diagnose and fix CLS issues?",
      answer: `CLS (Cumulative Layout Shift) = elements moving around unexpectedly during page load.

Step 1 — Diagnose:
• Chrome DevTools → Performance tab → Check "Layout Shifts"
• Lighthouse → See CLS score and which elements shifted
• Web Vitals Chrome extension → See CLS in real-time
• Layout Instability API:
  new PerformanceObserver((list) => {
    list.getEntries().forEach(entry => console.log(entry));
  }).observe({ type: 'layout-shift', buffered: true });

Step 2 — Common causes and fixes:

Images without dimensions:
// BAD: Image loads, pushes content down
<img src="photo.jpg" />

// GOOD: Reserve space before load
<img src="photo.jpg" width={800} height={600} />
// Or use aspect-ratio in CSS
.img-wrapper { aspect-ratio: 16/9; }

// BEST: Next.js Image (automatic)
<Image src="photo.jpg" width={800} height={600} />

Fonts causing text reflow:
/* Text renders in fallback font, then shifts when custom font loads */
@font-face {
  font-display: swap; /* Shows fallback immediately */
  size-adjust: 105%; /* Reduce shift by matching fallback size */
}
/* Preload critical fonts */
<link rel="preload" href="/font.woff2" as="font" type="font/woff2" crossorigin />

Dynamically injected content:
• Ads/embeds → Reserve space with min-height
• Cookie banners → Use position: fixed (doesn't shift layout)
• "Load more" above content → Always insert below, never above

Skeleton screens:
// Reserve exact space of the final content
<div className="skeleton" style={{ height: '200px', width: '100%' }} />

Step 3 — Prevention:
• Always set explicit dimensions on images and videos
• Use CSS aspect-ratio for responsive containers
• Preload fonts and use font-display: optional
• Reserve space for async content (ads, embeds)
• Test with Slow 3G throttling to see shifts clearly`,
      tags: ["Performance", "CSS", "Web Vitals"],
    },
    {
      id: 17,
      question: "How would you migrate a large Create React App (CRA) to Next.js?",
      answer: `Incremental migration — don't rewrite everything at once.

Phase 1 — Setup (1-2 days):
• Create Next.js project alongside existing CRA
• Copy shared utilities, hooks, constants, types
• Set up the same styling solution (Tailwind, CSS modules, etc.)
• Configure environment variables (.env → .env.local)

Phase 2 — Move pages incrementally:
• Start with simple, low-traffic pages (About, FAQ, Terms)
• Move one page at a time to Next.js /app directory
• Each page becomes a route in the App Router

Phase 3 — Handle routing differences:
CRA: React Router with <Route>, <Switch>
Next.js: File-based routing (app/about/page.js = /about)

// CRA route
<Route path="/users/:id" component={UserProfile} />

// Next.js equivalent
// app/users/[id]/page.js
export default function UserProfile({ params }) { ... }

Phase 4 — Convert data fetching:
// CRA: useEffect + useState
useEffect(() => { fetchUser(id).then(setUser); }, [id]);

// Next.js: Server Component (no useEffect needed)
export default async function UserPage({ params }) {
  const user = await fetchUser(params.id); // Runs on server
  return <UserProfile user={user} />;
}

Phase 5 — Handle client-side only code:
• Components using window, localStorage → Add 'use client' directive
• Third-party libs that need browser → Dynamic import with ssr: false

Common pain points:
• Global CSS imports → Move to app/globals.css or CSS modules
• React Router specific features (useNavigate) → Next.js equivalents (useRouter)
• Environment variables → Prefix with NEXT_PUBLIC_ for client-side access
• Build process → Update CI/CD for Next.js build output

Timeline estimate: Small app (20 pages) → 2-3 weeks. Large app (100+ pages) → 2-3 months with incremental migration.`,
      tags: ["Next.js", "Migration", "Architecture"],
    },
    {
      id: 18,
      question: "Your app needs to work offline. How would you implement offline support?",
      answer: `Use Service Workers + caching strategies:

1. Register a Service Worker:
// In your app entry point
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

2. Cache static assets (App Shell):
// sw.js — Cache on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('static-v1').then(cache =>
      cache.addAll(['/', '/offline.html', '/styles.css', '/app.js'])
    )
  );
});

3. Choose caching strategies per resource type:

Cache First (static assets — CSS, JS, images):
// Check cache first, fall back to network
event.respondWith(
  caches.match(request).then(cached => cached || fetch(request))
);

Network First (API data — want fresh, fallback to cached):
// Try network, fall back to cache if offline
event.respondWith(
  fetch(request).catch(() => caches.match(request))
);

Stale While Revalidate (best of both):
// Return cached immediately, update cache in background
event.respondWith(
  caches.match(request).then(cached => {
    const fetched = fetch(request).then(response => {
      cache.put(request, response.clone());
      return response;
    });
    return cached || fetched;
  })
);

4. Handle offline form submissions:
// Queue failed requests in IndexedDB
// When back online, replay them (Background Sync API)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-forms') {
    event.waitUntil(replayQueuedRequests());
  }
});

5. Show offline indicator:
window.addEventListener('online', () => showBanner('Back online'));
window.addEventListener('offline', () => showBanner('You are offline'));

Tools that simplify this:
• Workbox (Google) — Declarative caching strategies
• next-pwa — PWA support for Next.js
• PWA Builder — Generate service worker + manifest

The key mental model: Cache everything the user needs to use the app without internet. Queue mutations and sync when back online.`,
      tags: ["PWA", "Performance", "Architecture"],
    },
    {
      id: 19,
      question: "You're building a dashboard that fetches data from 5 different APIs. How do you handle loading states, errors, and rendering?",
      answer: `This is a common real-world problem. Here's a structured approach:

1. Parallel fetching with Promise.allSettled — Don't chain requests sequentially:
const useDashboardData = () => {
  const queries = [
    useQuery({ queryKey: ['revenue'], queryFn: fetchRevenue }),
    useQuery({ queryKey: ['users'], queryFn: fetchUsers }),
    useQuery({ queryKey: ['orders'], queryFn: fetchOrders }),
    useQuery({ queryKey: ['inventory'], queryFn: fetchInventory }),
    useQuery({ queryKey: ['analytics'], queryFn: fetchAnalytics }),
  ];
  return queries;
};

2. Independent loading states per widget — Don't block the entire dashboard on one slow API:
function DashboardWidget({ query, title, children }) {
  if (query.isLoading) return <SkeletonCard title={title} />;
  if (query.isError) return <ErrorCard title={title} onRetry={query.refetch} />;
  return children(query.data);
}

3. Skeleton UI pattern — Show the full layout immediately with skeleton placeholders. Each widget loads independently and "pops in" when ready. This feels much faster than a single spinner.

4. Error boundaries per widget — If one API fails, show an error card with a Retry button for just that widget. The rest of the dashboard stays functional:
<ErrorBoundary fallback={<ErrorCard onRetry={refetch} />}>
  <RevenueChart data={revenueData} />
</ErrorBoundary>

5. Stale-while-revalidate — Show cached data immediately and update in the background:
useQuery({
  queryKey: ['revenue'],
  queryFn: fetchRevenue,
  staleTime: 30_000,         // Data is "fresh" for 30 seconds
  refetchInterval: 60_000,   // Auto-refresh every minute
});

6. Global loading indicator — A thin progress bar at the top (like NProgress) signals "something is updating" without blocking the UI.

Key mistakes to avoid:
• Don't use a single isLoading boolean for 5 APIs — it creates an all-or-nothing experience
• Don't use Promise.all — if one fails, you lose all results. Use Promise.allSettled or independent queries
• Don't forget retry logic — transient API failures are common in dashboards`,
      tags: ["React", "Architecture", "State Management", "Performance"],
    },
    {
      id: 20,
      question: "How would you implement search autocomplete with debouncing and caching in React?",
      answer: `Here's a production-grade approach:

1. Debounce the input — Don't fire an API call on every keystroke:
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

2. Wire it up with React Query for caching:
function SearchAutocomplete() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchAPI(debouncedQuery),
    enabled: debouncedQuery.length >= 2,  // Don't search single chars
    staleTime: 5 * 60 * 1000,            // Cache results for 5 min
  });

  return (
    <div className="autocomplete">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      {isLoading && <Spinner />}
      {suggestions?.map(item => (
        <div key={item.id} onClick={() => selectItem(item)}>
          <HighlightMatch text={item.name} query={query} />
        </div>
      ))}
    </div>
  );
}

3. Highlight matching text in results:
function HighlightMatch({ text, query }) {
  const regex = new RegExp(\`(\${escapeRegex(query)})\`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i}>{part}</mark> : part
  );
}

4. Keyboard navigation — Handle ArrowUp, ArrowDown, Enter, and Escape:
const [activeIndex, setActiveIndex] = useState(-1);
const onKeyDown = (e) => {
  if (e.key === 'ArrowDown') setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
  if (e.key === 'ArrowUp') setActiveIndex(i => Math.max(i - 1, 0));
  if (e.key === 'Enter' && activeIndex >= 0) selectItem(suggestions[activeIndex]);
  if (e.key === 'Escape') setQuery('');
};

5. Abort previous requests — Cancel in-flight requests when the user types more:
const controller = new AbortController();
fetch(url, { signal: controller.signal });
// On new keystroke: controller.abort();

Why 300ms debounce? It's the sweet spot — fast enough to feel responsive, slow enough to skip most intermediate keystrokes. For fast typists, you might lower it to 200ms.

Accessibility considerations:
• Use role="combobox" and aria-expanded on the input
• Use role="listbox" on the suggestions container
• Announce result count to screen readers with aria-live="polite"`,
      tags: ["React", "Performance", "Browser APIs", "JavaScript"],
    },
    {
      id: 21,
      question: "You need to render a table with 10,000+ rows. The browser freezes. How do you fix it?",
      answer: `The browser freezes because 10,000 DOM nodes is too many. The solution is virtualization — only render rows that are visible in the viewport.

1. Use @tanstack/react-virtual (formerly react-virtual):
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualTable({ rows }) {
  const parentRef = useRef(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,   // estimated row height in px
    overscan: 10,             // render 10 extra rows above/below viewport
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: virtualRow.start,
              height: virtualRow.size,
              width: '100%',
            }}
          >
            <TableRow data={rows[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}

2. Sorting and filtering — Do it on the data array BEFORE virtualizing. Don't filter DOM nodes:
const filtered = useMemo(
  () => rows.filter(r => r.name.includes(search)).sort(compareFn),
  [rows, search, sortKey]
);

3. Memoize row components — Prevent unnecessary re-renders:
const TableRow = React.memo(({ data }) => (
  <tr>
    <td>{data.name}</td>
    <td>{data.email}</td>
  </tr>
));

4. Pagination as an alternative — If virtualization feels complex, server-side pagination with 50-100 rows per page is simpler and often good enough.

5. Web Workers for heavy computation — If sorting/filtering 10k+ rows lags the UI, offload it:
const worker = new Worker('sort-worker.js');
worker.postMessage({ rows, sortKey });
worker.onmessage = (e) => setRows(e.data);

Performance comparison:
• No virtualization: 10,000 DOM nodes, ~2-5s render, scroll jank
• With virtualization: ~30 DOM nodes, <50ms render, smooth 60fps scroll

Libraries to consider:
• @tanstack/react-virtual — Headless, works with any markup
• react-window — Lightweight, proven
• AG Grid — Full-featured enterprise data grid with built-in virtualization`,
      tags: ["React", "Performance", "JavaScript"],
    },
    {
      id: 22,
      question: "Users report your React SPA gets slower over time. You suspect memory leaks. How do you diagnose and fix them?",
      answer: `Memory leaks in SPAs are subtle. Here's a systematic debugging workflow:

1. Confirm the leak — Open Chrome DevTools > Performance Monitor. Watch "JS Heap Size" as you navigate between pages. If it keeps climbing and never drops (even after garbage collection), you have a leak.

2. Take heap snapshots — DevTools > Memory tab:
• Take Snapshot 1 on the home page
• Navigate to another page and back
• Take Snapshot 2
• Compare them — look for objects that exist in Snapshot 2 but not in Snapshot 1 (these are "leaked")

3. Common causes and fixes:

a) Uncleared event listeners:
// BAD — listener stays after unmount
useEffect(() => {
  window.addEventListener('resize', handleResize);
}, []);

// GOOD — cleanup function
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

b) Uncleared timers and intervals:
useEffect(() => {
  const id = setInterval(pollData, 5000);
  return () => clearInterval(id);
}, []);

c) Abandoned fetch requests — Component unmounts but the response callback tries to setState:
useEffect(() => {
  const controller = new AbortController();
  fetch('/api/data', { signal: controller.signal })
    .then(res => res.json())
    .then(data => setData(data))
    .catch(err => {
      if (err.name !== 'AbortError') throw err;
    });
  return () => controller.abort();
}, []);

d) Closures capturing large objects:
// BAD — closure holds reference to a huge array
const bigData = fetchHugeDataset();
element.onclick = () => console.log(bigData.length);

// GOOD — extract only what you need
const length = bigData.length;
element.onclick = () => console.log(length);

e) Detached DOM nodes — Storing references to DOM nodes that were removed:
// BAD — global reference keeps detached node alive
let cachedNode = document.getElementById('tooltip');
// Even after React removes it, cachedNode still references it

4. Automated detection — Use why-did-you-render to detect unnecessary re-renders, and the React DevTools Profiler to find components that re-render too often.

5. Prevention checklist:
• Every addEventListener needs a removeEventListener in cleanup
• Every setInterval/setTimeout needs clearInterval/clearTimeout
• Every fetch needs an AbortController
• Avoid storing DOM references in module-level variables
• Use WeakMap/WeakSet for caches that reference objects`,
      tags: ["React", "Debugging", "Performance", "DevTools"],
    },
    {
      id: 23,
      question: "How would you implement dark mode / theme switching across an entire React application?",
      answer: `Here's a clean, scalable approach:

1. Define your theme tokens:
const themes = {
  light: {
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#f5f5f5',
    '--text-primary': '#1a1a1a',
    '--text-secondary': '#666666',
    '--border': '#e0e0e0',
    '--accent': '#0066ff',
  },
  dark: {
    '--bg-primary': '#1a1a1a',
    '--bg-secondary': '#2d2d2d',
    '--text-primary': '#f0f0f0',
    '--text-secondary': '#aaaaaa',
    '--border': '#404040',
    '--accent': '#4d94ff',
  },
};

2. Create a ThemeProvider with React Context:
const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Priority: user preference > OS preference > default
    return localStorage.getItem('theme')
      || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(themes[theme]).forEach(([prop, value]) => {
      root.style.setProperty(prop, value);
    });
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

3. Use CSS custom properties in your styles — this is the key:
.card {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

4. Respect OS preference and listen for changes:
useEffect(() => {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e) => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  };
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}, []);

5. Avoid flash of wrong theme (FOWT) — Add a blocking script in the HTML <head>:
<script>
  (function() {
    const theme = localStorage.getItem('theme')
      || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  })();
</script>

6. Handle images and media — Swap image sources for dark mode:
<picture>
  <source srcset="/logo-dark.svg" media="(prefers-color-scheme: dark)" />
  <img src="/logo-light.svg" alt="Logo" />
</picture>

Why CSS custom properties over CSS-in-JS theme objects?
• Zero JS re-renders on theme switch — only CSS repaints
• Works with plain CSS, Tailwind, and any CSS framework
• Animations between themes are trivial with CSS transitions`,
      tags: ["React", "CSS", "Architecture", "Browser APIs"],
    },
    {
      id: 24,
      question: "A third-party analytics script is adding 2 seconds to your page load. How do you fix it without removing the script?",
      answer: `Third-party scripts are one of the biggest performance killers. Here's how to tame them:

1. Load the script asynchronously — Use async or defer:
<!-- BAD — blocks parsing -->
<script src="https://analytics.example.com/tracker.js"></script>

<!-- GOOD — async: downloads in parallel, executes when ready -->
<script async src="https://analytics.example.com/tracker.js"></script>

<!-- GOOD — defer: downloads in parallel, executes after HTML parsing -->
<script defer src="https://analytics.example.com/tracker.js"></script>

2. Lazy-load after user interaction — Don't load analytics until the page is interactive:
// Load analytics after the page is idle
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => loadAnalytics());
} else {
  setTimeout(loadAnalytics, 3000);
}

function loadAnalytics() {
  const script = document.createElement('script');
  script.src = 'https://analytics.example.com/tracker.js';
  document.body.appendChild(script);
}

3. Use a Web Worker with Partytown — Move third-party scripts off the main thread entirely:
// next.config.js (Next.js example)
import { withPartytown } from '@builder.io/partytown/nextjs';

// In your component:
<Script
  src="https://analytics.example.com/tracker.js"
  strategy="worker"  // Runs in a web worker via Partytown
/>

4. Resource hints — Tell the browser to prepare early:
<link rel="dns-prefetch" href="https://analytics.example.com" />
<link rel="preconnect" href="https://analytics.example.com" crossorigin />

5. Self-host the script — Download it and serve it from your CDN:
• Eliminates DNS lookup + connection to third-party server
• Lets you control caching headers
• Risk: you need to keep it updated

6. Set a performance budget — Use Lighthouse CI to fail builds if third-party scripts push Total Blocking Time above a threshold:
// lighthouserc.js
assertions: {
  'total-blocking-time': ['error', { maxNumericValue: 300 }],
}

7. Measure the actual impact — Chrome DevTools > Performance > Network tab. Filter by domain to see exactly how much time the third-party script costs in DNS, connection, download, and execution.

Decision framework:
• Critical analytics (page views): Use async + preconnect
• Non-critical (heatmaps, A/B testing): Load on requestIdleCallback
• Heavy scripts (chat widgets, video embeds): Use Partytown or lazy-load on user interaction`,
      tags: ["Performance", "Browser APIs", "JavaScript"],
    },
    {
      id: 25,
      question: "How would you implement feature flags in a frontend application?",
      answer: `Feature flags let you deploy code without releasing it to users. Here's a practical implementation:

1. Simple local feature flags to start:
// featureFlags.js
const flags = {
  NEW_CHECKOUT: process.env.REACT_APP_FF_NEW_CHECKOUT === 'true',
  DARK_MODE: process.env.REACT_APP_FF_DARK_MODE === 'true',
  AI_SEARCH: false,
};

export const isEnabled = (flag) => flags[flag] ?? false;

2. React context for app-wide access:
const FeatureFlagContext = createContext({});

function FeatureFlagProvider({ children }) {
  const [flags, setFlags] = useState({});

  useEffect(() => {
    // Fetch flags from your backend or service
    fetch('/api/feature-flags')
      .then(res => res.json())
      .then(setFlags);
  }, []);

  return (
    <FeatureFlagContext.Provider value={flags}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

function useFeatureFlag(flagName) {
  const flags = useContext(FeatureFlagContext);
  return flags[flagName] ?? false;
}

3. Conditional rendering in components:
function CheckoutPage() {
  const useNewCheckout = useFeatureFlag('NEW_CHECKOUT');

  return useNewCheckout
    ? <NewCheckoutFlow />
    : <LegacyCheckoutFlow />;
}

4. A reusable Feature component for cleaner JSX:
function Feature({ name, children, fallback = null }) {
  const enabled = useFeatureFlag(name);
  return enabled ? children : fallback;
}

// Usage:
<Feature name="AI_SEARCH" fallback={<ClassicSearch />}>
  <AISearchBar />
</Feature>

5. Percentage-based rollouts — Release to a percentage of users:
function isEnabledForUser(flag, userId) {
  // Deterministic hash so the same user always gets the same result
  const hash = simpleHash(flag + userId);
  const percentage = flagConfig[flag]?.percentage ?? 0;
  return (hash % 100) < percentage;
}

6. Clean up old flags — Feature flags are technical debt if left forever. Maintain a registry:
// feature-flag-registry.js
export const FLAGS = {
  NEW_CHECKOUT: {
    description: 'New multi-step checkout flow',
    owner: 'payments-team',
    createdAt: '2024-01-15',
    expectedRemoval: '2024-03-01',  // Forces cleanup
  },
};

Popular services for production:
• LaunchDarkly — Full-featured, real-time flag updates
• Unleash — Open-source alternative
• Flagsmith — Open-source with a hosted option
• PostHog — Combines feature flags with analytics

Key best practices:
• Always have a fallback for when flag evaluation fails (default to off)
• Use server-side evaluation for sensitive features (don't expose upcoming features in the client bundle)
• Log which flags are active per user session for debugging`,
      tags: ["Architecture", "React", "JavaScript"],
    },
    {
      id: 26,
      question: "Your Lighthouse performance score dropped from 95 to 60 after a sprint. How do you diagnose and fix it?",
      answer: `Here's a systematic debugging workflow:

1. Run Lighthouse and read the report — Focus on the specific metrics that dropped:
• LCP (Largest Contentful Paint) — Largest visible element took too long
• TBT (Total Blocking Time) — Main thread was blocked by JavaScript
• CLS (Cumulative Layout Shift) — Elements moved around during load
• FCP (First Contentful Paint) — Time until first pixel rendered

2. Compare with the previous build — Use Lighthouse CI to diff reports:
npx lhci diff --base=report-before.json --compare=report-after.json

3. Check the "Opportunities" and "Diagnostics" sections — They tell you exactly what's wrong:
• "Reduce unused JavaScript" — You added or imported a large library
• "Properly size images" — New images aren't optimized
• "Avoid large layout shifts" — New elements lack explicit dimensions

4. Common culprits after a sprint:

a) A new npm package bloated the bundle:
# Check what changed in bundle size
npx webpack-bundle-analyzer stats.json
# Or use next/bundle-analyzer for Next.js

b) An unoptimized image was added:
// BAD
<img src="/hero.png" />  // 2MB uncompressed PNG

// GOOD (Next.js)
<Image src="/hero.png" width={1200} height={600} priority />

c) A new component is render-blocking:
// BAD — heavy component in critical path
import HeavyChart from './HeavyChart';

// GOOD — lazy load it
const HeavyChart = lazy(() => import('./HeavyChart'));

d) Third-party scripts were added without async/defer.

e) CSS regression caused layout shifts — new elements without width/height.

5. Use Chrome DevTools Performance tab:
• Record a page load
• Look at the "Main" thread flame chart
• Identify long tasks (red bars > 50ms)
• Check the "Network" waterfall for blocking resources

6. Set up automated performance budgets to prevent future regressions:
// In CI pipeline
{
  "budgets": [{
    "resourceType": "script",
    "budget": 300  // KB
  }, {
    "resourceType": "image",
    "budget": 500
  }]
}

7. Quick wins that usually recover 20-30 points:
• Add loading="lazy" to below-the-fold images
• Defer non-critical JavaScript
• Preload the LCP image: <link rel="preload" as="image" href="hero.webp">
• Remove unused CSS with PurgeCSS or the Coverage tab in DevTools

Prevention: Add Lighthouse CI to your CI/CD pipeline with assertions that fail the build if the score drops below a threshold.`,
      tags: ["Performance", "DevTools", "Debugging"],
    },
    {
      id: 27,
      question: "How would you implement global keyboard shortcuts in a complex React application?",
      answer: `Here's a clean, scalable approach:

1. Create a centralized keyboard shortcut hook:
function useKeyboardShortcut(shortcut, callback, options = {}) {
  const { enabled = true, preventDefault = true } = options;
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;

    const handler = (event) => {
      const { key, ctrlKey, metaKey, shiftKey, altKey } = event;
      const combo = shortcut.toLowerCase();

      const modifiers = {
        ctrl: ctrlKey || metaKey,  // Support both Ctrl (Win) and Cmd (Mac)
        shift: shiftKey,
        alt: altKey,
      };

      const parts = combo.split('+');
      const targetKey = parts.pop();
      const requiredMods = parts;

      const modsMatch = requiredMods.every(mod => modifiers[mod]);
      const keyMatch = key.toLowerCase() === targetKey;

      if (modsMatch && keyMatch) {
        if (preventDefault) event.preventDefault();
        callbackRef.current(event);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcut, enabled, preventDefault]);
}

// Usage:
useKeyboardShortcut('ctrl+k', () => openSearchModal());
useKeyboardShortcut('ctrl+shift+p', () => openCommandPalette());

2. Don't intercept shortcuts when the user is typing:
const handler = (event) => {
  const target = event.target;
  const isInput = target.tagName === 'INPUT'
    || target.tagName === 'TEXTAREA'
    || target.isContentEditable;

  if (isInput) return;  // Don't hijack typing in form fields
  // ... process shortcut
};

3. Build a Command Palette (like VS Code's Ctrl+K):
const commands = [
  { id: 'search', label: 'Search', shortcut: 'Ctrl+K', action: openSearch },
  { id: 'theme', label: 'Toggle Theme', shortcut: 'Ctrl+Shift+T', action: toggleTheme },
  { id: 'save', label: 'Save Draft', shortcut: 'Ctrl+S', action: saveDraft },
];

function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useKeyboardShortcut('ctrl+k', () => setOpen(true));

  const filtered = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  return open ? (
    <Modal onClose={() => setOpen(false)}>
      <input value={query} onChange={e => setQuery(e.target.value)} autoFocus />
      {filtered.map(cmd => (
        <button key={cmd.id} onClick={() => { cmd.action(); setOpen(false); }}>
          {cmd.label} <kbd>{cmd.shortcut}</kbd>
        </button>
      ))}
    </Modal>
  ) : null;
}

4. Show a shortcut cheat sheet — Press ? to display all available shortcuts:
useKeyboardShortcut('shift+/', () => setShowHelp(true));

5. Handle platform differences:
const isMac = navigator.platform.includes('Mac');
const modKey = isMac ? 'Cmd' : 'Ctrl';
// Display: "Cmd+K" on Mac, "Ctrl+K" on Windows

Accessibility considerations:
• Never override browser defaults (Ctrl+C, Ctrl+V, Ctrl+T, etc.)
• Always provide non-keyboard alternatives for the same actions
• Use aria-keyshortcuts attribute to announce shortcuts to screen readers
• Document all shortcuts in an accessible help dialog`,
      tags: ["React", "Browser APIs", "JavaScript", "Architecture"],
    },
    {
      id: 28,
      question: "How would you migrate a large JavaScript codebase to TypeScript incrementally?",
      answer: `Incremental migration is the only sane approach for large codebases. Here's the playbook:

1. Set up TypeScript alongside JavaScript — Allow both:
// tsconfig.json
{
  "compilerOptions": {
    "allowJs": true,              // Allow .js files
    "checkJs": false,             // Don't type-check .js files yet
    "strict": false,              // Start loose, tighten later
    "noEmit": true,               // Let your bundler handle output
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "baseUrl": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}

2. Rename files gradually — Start with .js to .ts (or .jsx to .tsx). Do NOT rewrite the code yet. Just rename:
# Rename one file at a time
git mv src/utils/helpers.js src/utils/helpers.ts

3. Add types bottom-up — Start with leaf modules (utilities, constants, types) and work toward the top:

Migration order:
a) Constants and config files (easiest)
b) Utility functions (pure functions are simple to type)
c) API layer and data models
d) Hooks and state management
e) Components (most complex, do last)

4. Use the 'any' escape hatch temporarily:
// When migrating a file, use 'any' for complex types you'll fix later
function processData(data: any): any {
  // TODO: Add proper types
  return data.map((item: any) => item.value);
}

5. Create a shared types directory early:
// src/types/api.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

6. Enable strict mode progressively — Add one strict flag at a time:
// Phase 1: Start here
"strict": false

// Phase 2: Add one by one
"noImplicitAny": true        // No implicit 'any' types
"strictNullChecks": true     // null/undefined must be handled
"strictFunctionTypes": true  // Stricter function type checking

// Phase 3: Full strict mode
"strict": true

7. Track migration progress — Add a script to your CI:
#!/bin/bash
total=$(find src -name '*.js' -o -name '*.ts' -o -name '*.tsx' | wc -l)
typed=$(find src -name '*.ts' -o -name '*.tsx' | wc -l)
echo "TypeScript migration: $typed / $total files"

8. Use ts-migrate for bulk conversion — Automatically add 'any' annotations:
npx ts-migrate-full src/

Key rules:
• Never block feature work — migration runs in parallel with normal development
• One file per PR — small, reviewable changes
• Add types to new code from day one — all new files must be .ts/.tsx
• Don't chase 100% immediately — 80% coverage with strict: false beats 40% with strict: true
• Write .d.ts declaration files for third-party code that lacks types`,
      tags: ["TypeScript", "Architecture", "JavaScript"],
    },
  ],
  outputBased: [
    {
      id: 1,
      question: "What does `typeof null` return and why?",
      answer: `Output:
"object"

This is one of JavaScript's oldest bugs, dating back to the very first implementation in 1995.

Why it happens:
In the original JavaScript engine, values were stored as a type tag + value. Objects had a type tag of 0. null was represented as the NULL pointer (0x00), so its type tag was also 0 — making the engine think it was an object.

The internal logic was essentially:
// Original JS engine pseudocode
if (value === NULL_POINTER) {
  // This check SHOULD have returned "null"
  // But it fell through to the object check below
}
if (typeTag === 0) {
  return "object";  // null lands here because its tag is 0
}

Why it was never fixed:
A proposal to fix this (typeof null === "null") was submitted to TC39 but rejected because it would break millions of existing websites that rely on typeof null === "object".

How to properly check for null:
// DON'T rely on typeof
typeof null === "object"  // true — misleading

// DO use strict equality
value === null            // true — correct way

// Check for "real" objects
function isObject(val) {
  return val !== null && typeof val === 'object';
}

Fun fact: typeof is reliable for everything else — "string", "number", "boolean", "undefined", "function", "symbol", "bigint" — null is the only exception.`,
      tags: ["JavaScript"],
    },
    {
      id: 2,
      question: "What does `[] == ![]` evaluate to and why?",
      answer: `Output:
true

Yes, an empty array equals NOT an empty array. This is JavaScript's type coercion at its most confusing.

Step-by-step breakdown:

Step 1: Evaluate the right side first — ![]
• [] is a truthy value (all objects are truthy in JS)
• ![] becomes false

So the expression becomes: [] == false

Step 2: The == operator triggers Abstract Equality Comparison (spec section 7.2.14)
• When comparing an object to a boolean, convert the boolean to a number first
• false becomes 0

Now it's: [] == 0

Step 3: When comparing an object to a number, convert the object to a primitive
• [].valueOf() returns [] (not a primitive, so try toString)
• [].toString() returns "" (empty string)

Now it's: "" == 0

Step 4: When comparing a string to a number, convert the string to a number
• Number("") returns 0

Now it's: 0 == 0

Step 5: 0 == 0 is true ✓

The full chain:
[] == ![]
[] == false      // ! converts truthy [] to false
[] == 0          // false converts to 0
"" == 0          // [] converts to "" via toString()
0 == 0           // "" converts to 0
true             // same value

The lesson: Always use === (strict equality) to avoid type coercion surprises:
[] === ![]  // false — no coercion, different types

Other weird == results for reference:
"" == false   // true
"0" == false  // true
" " == false  // true (whitespace-only strings coerce to 0)`,
      tags: ["JavaScript"],
    },
    {
      id: 3,
      question: "What will this print? `for (var i = 0; i < 3; i++) { setTimeout(() => console.log(i), 0); }`",
      answer: `Output:
3
3
3

Most people expect 0, 1, 2 — but var and closures make it print 3, 3, 3.

Why it happens:

1. var is function-scoped, not block-scoped — There's only ONE variable i shared across all iterations and the setTimeout callbacks.

2. setTimeout is asynchronous — The callbacks are placed in the task queue and execute AFTER the loop finishes.

3. By the time the callbacks run, the loop has completed and i === 3 (the value that made i < 3 false). All three callbacks reference the same i.

Visual timeline:
// Loop runs synchronously:
i = 0 → schedule callback → i = 1 → schedule callback → i = 2 → schedule callback → i = 3 (loop ends)

// Event loop processes callbacks:
callback 1: console.log(i) → i is 3 → prints 3
callback 2: console.log(i) → i is 3 → prints 3
callback 3: console.log(i) → i is 3 → prints 3

Three ways to fix it:

Fix 1: Use let (creates a new binding per iteration)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// Output: 0, 1, 2

Fix 2: IIFE (creates a new scope per iteration)
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => console.log(j), 0);
  })(i);
}
// Output: 0, 1, 2

Fix 3: setTimeout's third argument (passed to the callback)
for (var i = 0; i < 3; i++) {
  setTimeout((j) => console.log(j), 0, i);
}
// Output: 0, 1, 2

The key concept: let creates a new variable for each loop iteration. var reuses the same variable. This is the single most common closure interview question.`,
      tags: ["JavaScript"],
    },
    {
      id: 4,
      question: "What does `\"2\" + 3 - 1` evaluate to and why?",
      answer: `Output:
22

Not 4, not 24 — it's 22. Here's why:

JavaScript evaluates left to right, and the + and - operators behave differently with strings.

Step 1: "2" + 3
• The + operator sees a string on the left side
• It performs string concatenation (not addition)
• "2" + 3 becomes "23" (the number 3 is coerced to the string "3")

Step 2: "23" - 1
• The - operator ONLY works with numbers (there's no "string subtraction")
• It converts "23" to the number 23
• 23 - 1 = 22

The key insight:
• + with a string → concatenation (string wins)
• - with a string → arithmetic (number wins)

More examples to build intuition:
"5" + 2      // "52"  (concatenation)
"5" - 2      // 3     (arithmetic)
"5" * 2      // 10    (arithmetic)
"5" / 2      // 2.5   (arithmetic)
"5" + 2 - 1  // 51    ("52" - 1)
5 + 2 + "3"  // "73"  (7 + "3" → "73")
"3" + 2 + 5  // "325" ("32" + 5 → "325")

The rule:
• + is overloaded: it does concatenation if EITHER operand is a string
• -, *, / always convert to numbers first

To avoid confusion, always use explicit conversion:
Number("2") + 3 - 1  // 4 (all numeric)
String(2) + String(3) // "23" (all string)
parseInt("2") + 3     // 5 (explicit parsing)`,
      tags: ["JavaScript"],
    },
    {
      id: 5,
      question: "Why does `0.1 + 0.2 !== 0.3` in JavaScript? How do you fix it?",
      answer: `Output:
0.1 + 0.2 === 0.3  // false
0.1 + 0.2          // 0.30000000000000004

This is NOT a JavaScript bug — it happens in every language that uses IEEE 754 floating-point arithmetic (Python, Java, C++, etc.).

Why it happens:
Computers store numbers in binary (base 2). Just like 1/3 can't be represented exactly in decimal (0.333...), some decimal fractions can't be represented exactly in binary.

• 0.1 in binary: 0.0001100110011... (repeating forever)
• 0.2 in binary: 0.0011001100110... (repeating forever)

Since the storage has 64 bits, these values are truncated, losing precision. When you add the two truncated values, the small errors accumulate.

0.1 → 0.1000000000000000055511151231257827021181583404541015625
0.2 → 0.2000000000000000111022302462515654042363166809082031250
Sum → 0.3000000000000000444089209850062616169452667236328125000

How to fix it:

Fix 1: Use a tolerance (epsilon comparison)
function areEqual(a, b) {
  return Math.abs(a - b) < Number.EPSILON;
}
areEqual(0.1 + 0.2, 0.3);  // true

Fix 2: Work with integers (multiply then divide)
// Convert dollars to cents
const price = 0.1 * 100 + 0.2 * 100;  // 10 + 20 = 30
const result = price / 100;            // 0.3 (exact)

Fix 3: Use toFixed for display (not comparison)
(0.1 + 0.2).toFixed(2)  // "0.30" (string)

Fix 4: For financial calculations, use a library
// decimal.js or big.js
const Decimal = require('decimal.js');
new Decimal('0.1').plus('0.2').equals(0.3);  // true

Rule of thumb:
• Display: toFixed() is fine
• Comparison: Use epsilon or integer math
• Money: Always use integer cents or a decimal library — never raw floats`,
      tags: ["JavaScript"],
    },
    {
      id: 6,
      question: "What will `Object.keys({2: 'a', 1: 'b', '3': 'c'})` return and why?",
      answer: `Output:
["1", "2", "3"]

Not ["2", "1", "3"] as you might expect from insertion order. The keys are sorted numerically.

Why it happens:
The ECMAScript spec defines a specific key ordering for objects (since ES2015):

1. Integer indices — sorted in ascending numeric order
2. String keys — in insertion order
3. Symbol keys — in insertion order

In this example, 2, 1, and '3' are all "integer indices" (strings that represent non-negative integers). So they get sorted numerically: 1, 2, 3.

The spec defines an "integer index" as a string whose numeric value is a non-negative integer less than 2^32 - 1.

More examples:
Object.keys({ b: 1, a: 2 })
// ["b", "a"] — string keys keep insertion order

Object.keys({ 10: 'x', 2: 'y', a: 'z', 1: 'w' })
// ["1", "2", "10", "a"]
// Integer indices first (sorted), then string keys (insertion order)

Object.keys({ '01': 'a', '1': 'b', 1: 'c' })
// ["1", "01"]
// '1' and 1 are the same integer index (last write wins)
// '01' is NOT an integer index (leading zero), so it's a string key

Important note: Object.keys always returns strings, even if the original keys were numbers:
const obj = { 1: 'a' };
Object.keys(obj)    // ["1"] — string, not number
typeof Object.keys(obj)[0]  // "string"

When insertion order matters, use Map instead:
const map = new Map();
map.set(2, 'a');
map.set(1, 'b');
map.set('3', 'c');
[...map.keys()]  // [2, 1, "3"] — always insertion order

Key takeaway: Plain objects in JavaScript do NOT guarantee insertion order for numeric keys. Use Map when key order matters.`,
      tags: ["JavaScript"],
    },
    {
      id: 7,
      question: "What happens if you call setState inside a useEffect with no dependency array?",
      answer: `Output:
The component enters an infinite re-render loop and eventually crashes with:
"Error: Too many re-renders. React limits the number of renders to prevent an infinite loop."

Here's the code that causes it:
function BadComponent() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(count + 1);  // Triggers re-render
  }); // No dependency array = runs after EVERY render

  return <div>{count}</div>;
}

Step-by-step of what happens:

1. Component renders with count = 0
2. useEffect runs (no deps = runs after every render)
3. setCount(1) is called → triggers a re-render
4. Component re-renders with count = 1
5. useEffect runs again (because it runs after every render)
6. setCount(2) is called → triggers another re-render
7. This repeats infinitely until React bails out

The cycle:
render → useEffect → setState → render → useEffect → setState → ...

How to fix it:

Fix 1: Add a dependency array
useEffect(() => {
  setCount(count + 1);
}, []);  // Empty array = runs only once after mount

Fix 2: Add the correct dependency
useEffect(() => {
  // Only run when "data" changes
  setCount(data.length);
}, [data]);

Fix 3: Use a condition to break the loop
useEffect(() => {
  if (count < 10) {
    setCount(count + 1);
  }
});

Fix 4: Use the functional updater (still needs deps to avoid infinite loop)
useEffect(() => {
  setCount(prev => prev + 1);
}, []);  // Still need the dependency array!

Common real-world mistake:
useEffect(() => {
  // Fetches data, sets state, triggers re-render, fetches again...
  fetchData().then(data => setItems(data));
});
// FIX: Add [] or [someCondition] as dependency

Key rule: useEffect without a dependency array is almost always a bug. Always ask yourself: "When should this effect re-run?" and put those values in the dependency array.`,
      tags: ["React", "JavaScript", "Debugging"],
    },
  ],
};
