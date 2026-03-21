export const reactPerformance = {
  id: "react-performance",
  title: "React Performance",
  icon: "\u26A1",
  tag: "React Advanced",
  tagColor: "var(--tag-react)",
  subtitle: "Master memoization, code splitting, virtualization, and profiling for blazing-fast React apps",
  concepts: [
    {
      title: "React.memo Deep Dive",
      explanations: {
        layman: "When a parent component updates, all its children update too -- even if nothing changed for them. React.memo fixes this. It tells React: 'Before you re-render this component, check if the props are the same as last time. If yes, skip it.' Think of it like a waiter who checks your order: same as before? No need to cook again -- just serve the same dish.",
        mid: "React.memo is a wrapper that stops a component from re-rendering if its props haven't changed. It does a shallow comparison -- it checks each prop using Object.is. This means objects and arrays are compared by reference, not by content. So `{a: 1} !== {a: 1}` because they are different objects in memory. If you pass a new object or function as a prop every render, memo won't help. You can pass a custom comparison function as the second argument: `React.memo(Component, (prev, next) => boolean)`. Return true to skip re-render, false to allow it. Use memo for expensive list items, charts, or components that get the same props often but have a parent that re-renders a lot.",
        senior: "In the Fiber architecture, when a parent re-renders, React creates new fiber nodes for all children. React.memo intercepts this at the beginWork phase. If props haven't changed (shallow check or custom comparator), it bails out early and reuses the existing subtree. But bailout isn't free -- React still creates the fiber node and runs the comparison. For very simple components, this overhead can cost more than just re-rendering. Key details: (1) memo only checks props, not context. Context changes bypass memo entirely because React marks context consumers for re-render through a separate path. (2) If the parent passes JSX children, those are new objects every render, which breaks memo. (3) useMemo + context selectors (or use() in React 19) can work around the context issue."
      },
      realWorld: "Memoizing list items in a big list where the parent re-renders on scroll. Memoizing heavy chart components. Preventing sidebar or header from re-rendering when main content changes. Memoizing form fields so typing in one field doesn't re-render all fields.",
      whenToUse: "When a component gets the same props often but its parent re-renders frequently. When the component is expensive to render (heavy calculations, large JSX). When profiling shows the component re-renders without reason.",
      whenNotToUse: "Don't wrap every component in memo -- the comparison itself has a cost. Don't use it on components that almost always get different props. Don't use it to hide the real problem, like creating new objects or functions on every render in the parent.",
      pitfalls: "Passing inline objects, arrays, or functions as props breaks memo because they are new references every render. Fix with useMemo/useCallback in the parent. The children prop is an object, so `<Memo><Child /></Memo>` breaks memo too. Context changes ignore memo completely. The custom comparator returns true to SKIP re-render (opposite of shouldComponentUpdate) -- mixing this up is a common bug.",
      codeExamples: [
        {
          title: "React.memo with useCallback to Prevent Re-renders",
          code: `// This list won't re-render when the parent updates,
// as long as items and onItemClick stay the same.
const ItemList = React.memo(function ItemList({ items, onItemClick }) {
  console.log("ItemList rendered");
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id} onClick={() => onItemClick(item.id)}>
          {item.name} - {item.price}
        </li>
      ))}
    </ul>
  );
});

function App() {
  const [search, setSearch] = useState("");
  const [items] = useState([
    { id: 1, name: "Hat", price: 9.99 },
    { id: 2, name: "Bag", price: 24.99 },
  ]);

  // useCallback keeps the same function reference between renders.
  // Without it, memo on ItemList would be useless.
  const handleClick = useCallback((id) => {
    console.log("Clicked:", id);
  }, []);

  return (
    <div>
      {/* Typing here re-renders App, but NOT ItemList */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Type here (list won't re-render)"
      />
      <ItemList items={items} onItemClick={handleClick} />
    </div>
  );
}`
        },
        {
          title: "Custom Comparison Function",
          code: `const UserCard = React.memo(
  function UserCard({ user, theme, onSelect }) {
    console.log("UserCard rendered for", user.name);
    return (
      <div className={\`card \${theme}\`} onClick={() => onSelect(user.id)}>
        <img src={user.avatar} alt={user.name} />
        <h3>{user.name}</h3>
        <p>{user.email}</p>
      </div>
    );
  },
  (prev, next) => {
    // Only re-render if user data or theme actually changed.
    // We skip comparing onSelect (we trust it stays stable).
    return (
      prev.user.id === next.user.id &&
      prev.user.name === next.user.name &&
      prev.user.email === next.user.email &&
      prev.theme === next.theme
    );
  }
);`
        }
      ]
    },
    {
      title: "Code Splitting with React.lazy and Suspense",
      explanations: {
        layman: "Without code splitting, your app sends ALL its code to the browser at once -- even pages the user may never visit. That makes the first load slow. Code splitting fixes this by breaking your app into smaller pieces. Each page loads its own code only when the user goes to it. It's like a streaming service: you don't download every movie when you sign up. You just stream the one you want to watch.",
        mid: "Code splitting breaks your JavaScript bundle into smaller files loaded on demand. React.lazy creates a component from a dynamic import: `const Page = React.lazy(() => import('./Page'))`. The import() returns a Promise that resolves to the component. Suspense wraps the lazy component and shows a loading UI while the code downloads: `<Suspense fallback={<Spinner />}><Page /></Suspense>`. Webpack and Vite detect dynamic imports and create separate files automatically. Best impact comes from route-based splitting (each page is a separate file). You can also split heavy features like admin panels, modals, or chart libraries.",
        senior: "React.lazy wraps a dynamic import promise. On first render, the lazy component throws the promise as an exception. Suspense catches this thrown promise (similar to error boundaries) and renders the fallback while it's pending. When the promise resolves, React re-renders the Suspense boundary with the loaded component. React.lazy only supports default exports. For named exports, use: `() => import('./utils').then(m => ({ default: m.MyComponent }))`. For good UX, preload chunks on hover or route proximity using `/* webpackPrefetch: true */` or calling import() early. In React 19, the use() hook gives a more flexible way to handle async resources."
      },
      realWorld: "Each page as a separate chunk. Loading admin dashboards only for admins. Splitting modals and dialogs that aren't needed right away. Loading chart libraries only when the user visits analytics pages.",
      whenToUse: "When the bundle is large and first load is slow. For pages most users never visit (admin, settings). For heavy components not visible on first load (modals, below-the-fold content). For optional features (PDF export, rich text editor).",
      whenNotToUse: "Don't split tiny components -- the network request costs more than the savings. Don't split components that always show on the first page. Don't over-split so much that the page makes too many requests at once. SSR needs extra setup to work with lazy loading.",
      pitfalls: "Lazy components must be wrapped in Suspense or you get an error. The import path must be a static string (no variables). Named exports need a workaround. Network failures crash the app unless you add an error boundary. Loading spinners can flash briefly for cached chunks -- use startTransition to avoid this.",
      codeExamples: [
        {
          title: "Route-Based Code Splitting",
          code: `import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Each page loads as a separate file
const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Settings = lazy(() => import("./pages/Settings"));
const Admin = lazy(() => import("./pages/Admin"));

// Simple loading screen
function Loading() {
  return <div className="spinner">Loading page...</div>;
}

function App() {
  return (
    <BrowserRouter>
      <nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/settings">Settings</NavLink>
      </nav>

      {/* Suspense shows Loading while the page code downloads */}
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

// Start loading the page code when user hovers over the link
function NavLink({ to, children }) {
  const preload = () => {
    if (to === "/dashboard") import("./pages/Dashboard");
    if (to === "/settings") import("./pages/Settings");
  };

  return (
    <Link to={to} onMouseEnter={preload}>
      {children}
    </Link>
  );
}`
        }
      ]
    },
    {
      title: "Virtualization (Windowing) for Long Lists",
      explanations: {
        layman: "Imagine looking through a window at a tall building. You can only see a few floors at a time. Virtualization works the same way: instead of putting all 10,000 items in the page (which makes the browser slow), you only show the ones visible on screen. As you scroll, old items are removed and new ones appear. It looks like all items are there, but only about 20 actually exist at any time.",
        mid: "Virtualization renders only the items visible on screen plus a small buffer above and below. Libraries like react-window calculate which items are visible based on scroll position and item height. For 10,000 items at 50px each, the container is 500,000px tall (for the scrollbar), but only ~20 real DOM elements exist. Two types: FixedSizeList (all items same height, simpler and faster) and VariableSizeList (items have different heights). Each visible item is positioned with `position: absolute` at the right spot.",
        senior: "Without virtualization, 10K items means 10K DOM nodes and O(10K) work on every re-render. With it, you keep ~20-50 DOM nodes regardless of list size, making updates O(1) relative to total items. Key details: (1) Scroll handlers must use passive listeners and avoid sync state updates. react-window uses onScroll + requestAnimationFrame. (2) Overscan (extra items above/below viewport) prevents blank flashes during fast scrolling. (3) Variable-size lists need a size cache and sometimes ResizeObserver. (4) Use stable keys (item IDs, not array indices) because items at the same index change during scroll. (5) Each item component should use React.memo since the list re-renders visible items on every scroll. (6) For accessibility, add aria-rowcount, aria-rowindex, and keyboard navigation since most items aren't in the DOM."
      },
      realWorld: "Chat apps (Slack, Discord), social media feeds with infinite scroll, large data tables, file explorers, autocomplete dropdowns with many results, log viewers.",
      whenToUse: "When lists with 100+ items cause slow scrolling. When each item has expensive rendering (images, complex layout). When the list is infinite (infinite scroll). When you need smooth scrolling with 10K+ items.",
      whenNotToUse: "For short lists (under 50 items) that work fine without it. When items have heights that change often and are hard to measure. When SEO needs all content in the DOM. When accessibility rules require all items in the DOM.",
      pitfalls: "Items with changing heights can cause scroll jumping. Focused items may disappear when you scroll away. Ctrl+F browser search can't find items that aren't rendered. Screen readers may not know the total list size without ARIA attributes. Keeping scroll position when navigating back is hard.",
      codeExamples: [
        {
          title: "Virtualized List with react-window",
          code: `import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

// Each row is memoized so it only re-renders when its data changes
const Row = React.memo(function Row({ index, style, data }) {
  const item = data[index];
  return (
    <div style={style} className="row">
      <img src={item.avatar} alt="" loading="lazy" />
      <strong>{item.name}</strong>
      <span>{item.status}</span>
    </div>
  );
});

function UserList({ users }) {
  return (
    <div style={{ height: "80vh", width: "100%" }}>
      {/* AutoSizer fills the parent container */}
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            width={width}
            itemCount={users.length}  // total items
            itemSize={64}             // height of each row in px
            itemData={users}          // passed to each Row as "data"
            overscanCount={5}         // render 5 extra rows above/below
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  );
}

// Works smoothly even with 100,000 items
function App() {
  const users = useMemo(
    () =>
      Array.from({ length: 100000 }, (_, i) => ({
        id: i,
        name: \`User \${i}\`,
        avatar: \`https://i.pravatar.cc/40?img=\${i % 70}\`,
        status: i % 3 === 0 ? "active" : "inactive",
      })),
    []
  );

  return <UserList users={users} />;
}`
        }
      ]
    },
    {
      title: "React Profiler API and Performance Debugging",
      explanations: {
        layman: "The React Profiler is like a stopwatch for your app. It measures how long each component takes to render and tells you what caused it to render. It helps you find the slow parts of your app so you can fix them. Just like a doctor checks your heartbeat to find problems, the Profiler checks your components to find performance problems.",
        mid: "React has two profiling tools: the Profiler component and React DevTools Profiler. The `<Profiler>` component wraps a section of your app and calls a callback after every render with timing info: `<Profiler id=\"sidebar\" onRender={callback}>...</Profiler>`. The callback gives you: id (which section), phase ('mount' or 'update'), actualDuration (time spent rendering), baseDuration (how long it would take without any memoization). React DevTools Profiler shows this visually as flamegraphs (which components rendered and how long) and ranked charts (slowest first). It also tells you why each component rendered: props changed, state changed, or parent rendered.",
        senior: "The Profiler instruments the Fiber tree during the commit phase. actualDuration sums the time of all fibers that did work (didn't bail out). baseDuration sums the latest render time of every fiber in the subtree -- the worst-case cost without memoization. The gap between them shows how much memo is saving you. In production, Profiler is stripped unless you use the profiling build (react-dom/profiling). Debugging workflow: (1) Record the slow interaction. (2) Find wide bars in the flamegraph (slow components). (3) Check 'why did this render' for unnecessary re-renders. (4) Use ranked chart to find the most expensive components. (5) Apply fixes (memo, useMemo, useCallback) and re-profile. React 18's concurrent mode complicates this because one interaction can span multiple commits."
      },
      realWorld: "Finding why a page transition is slow. Spotting components that re-render for no reason. Measuring the impact of adding memo. Running performance checks in CI to catch regressions. Finding effects that cause layout thrashing.",
      whenToUse: "When users say the app feels slow and you need to find why. During performance optimization work to measure before and after. In development to catch performance problems early. When deciding whether to add memoization -- always profile first.",
      whenNotToUse: "Don't leave Profiler in production unless using the profiling build. Don't trust dev mode timings for exact numbers -- dev mode is 2-5x slower. Don't micro-optimize based on profiler data if the measured time doesn't actually affect user experience.",
      pitfalls: "Dev mode is much slower than production due to StrictMode double-rendering. The Profiler itself adds some overhead. Browser extensions and DevTools can change timing results. Concurrent mode renders may show as many short commits instead of one long render. For memory issues, use Chrome DevTools Memory tab, not React Profiler.",
      codeExamples: [
        {
          title: "Profiler with Performance Logging",
          code: `// This callback runs after every render of the wrapped components
function onRender(
  id,              // which Profiler ("App", "Sidebar", etc.)
  phase,           // "mount" (first render) or "update"
  actualDuration,  // time spent rendering (with memoization)
  baseDuration,    // time it would take without memoization
  startTime,       // when rendering started
  commitTime       // when rendering finished
) {
  // Warn if a render takes longer than one frame (16ms)
  if (actualDuration > 16) {
    console.warn(
      "[Slow] " + id + " " + phase + ": " + actualDuration.toFixed(1) + "ms" +
      " (without memo: " + baseDuration.toFixed(1) + "ms)"
    );
  }
}

function App() {
  return (
    <Profiler id="App" onRender={onRender}>
      <Header />
      <Profiler id="MainContent" onRender={onRender}>
        <Dashboard />
      </Profiler>
      <Profiler id="Sidebar" onRender={onRender}>
        <Sidebar />
      </Profiler>
    </Profiler>
  );
}`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "How does React.memo work internally, and what are its limitations?",
      answer: "React.memo wraps a component and checks props before each re-render. It compares each prop using Object.is (shallow comparison). If all props are the same, it skips the render and reuses the last output. This happens in the Fiber beginWork phase -- the memo fiber compares old and new props and skips the whole subtree if they match. Five limitations: (1) It only checks props, not context -- context changes force a re-render even with memo. (2) It compares references, not content -- new objects, arrays, or functions in the parent break it. Use useMemo/useCallback to keep references stable. (3) The comparison has a cost -- for very simple components, memo can be slower than just re-rendering. (4) JSX children are objects, so `<Memo><Child /></Memo>` breaks memo every render. (5) Memo only prevents the wrapped component from rendering -- the parent still re-renders.",
      difficulty: "mid",
      followUps: [
        "How does React.memo differ from useMemo?",
        "When would a custom comparator be useful?",
        "How do context changes interact with React.memo?"
      ]
    },
    {
      question: "Explain code splitting in React. What are the best strategies for splitting and what pitfalls should you watch for?",
      answer: "Code splitting breaks your JS bundle into smaller files loaded on demand using dynamic import(). React.lazy wraps an import into a component. Suspense shows a fallback while it loads. Best strategies: (1) Route-based -- each page is a separate file (biggest impact). (2) Feature-based -- heavy features like admin panels, editors. (3) Below-the-fold -- content not visible on first load. (4) Conditional -- based on user role or feature flags. Pitfalls: chunks can fail on bad networks (add error boundaries), loading spinners flash for cached chunks (use startTransition), over-splitting causes too many requests, lazy only works with default exports, SSR needs special setup. Preload chunks on hover to make navigation feel instant.",
      difficulty: "mid",
      followUps: [
        "How would you preload a lazy component?",
        "What happens if a chunk fails to load?",
        "How does React.lazy work with SSR?"
      ]
    },
    {
      question: "When would you use list virtualization, and what are the tradeoffs?",
      answer: "Use virtualization when long lists (100+ items) make scrolling slow. Libraries like react-window render only visible items, keeping a small number of DOM nodes no matter how big the list is. Tradeoffs: (1) Ctrl+F won't find items not on screen. (2) Screen readers may miss the full list size without ARIA attributes. (3) Variable-height items are harder and can cause scroll jumping. (4) Focused items may disappear when scrolled away. (5) SEO is affected since content isn't in the DOM. (6) Restoring scroll position on navigation needs manual work. Benefits: constant DOM node count, smooth 60fps scrolling with 100K+ items, and much less memory usage.",
      difficulty: "mid",
      followUps: [
        "How does virtualization handle variable height items?",
        "How would you implement infinite scrolling with virtualization?",
        "What accessibility concerns does virtualization introduce?"
      ]
    },
    {
      question: "You have a React app that feels sluggish. Walk me through your performance debugging process.",
      answer: "Step 1: Find the exact interaction that is slow. Step 2: Open React DevTools Profiler, record the interaction, and look at the flamegraph -- wide bars are slow components, grey bars are memoized components that skipped rendering. Step 3: Use 'Why did this render?' to find unnecessary re-renders. Step 4: Check the ranked chart for the most expensive components. Step 5: Use Chrome DevTools Performance tab for non-React issues (layout thrashing, long tasks, garbage collection pauses). Step 6: Apply fixes: React.memo for components re-rendering with same props, useMemo/useCallback for expensive work and stable references, virtualization for long lists, code splitting for heavy components. Step 7: Profile again to confirm the fix actually helped. Golden rule: always profile first, then optimize. Never guess where the problem is.",
      difficulty: "hard",
      followUps: [
        "What's the difference between actualDuration and baseDuration in the Profiler?",
        "How do you profile in production?",
        "How does React DevTools highlight re-renders?"
      ]
    },
    {
      question: "What are the different strategies for reducing a React app's bundle size?",
      answer: "Key strategies: (1) Code splitting with React.lazy -- split by route, feature, and user role. (2) Tree shaking -- use ES modules (import/export). Import only what you need: `import { debounce } from 'lodash-es'` not `import _ from 'lodash'`. (3) Analyze the bundle with webpack-bundle-analyzer to find heavy dependencies. (4) Replace heavy libraries with lighter ones (date-fns instead of moment, zustand instead of redux). (5) Dynamic imports for optional features (charts, PDF export). (6) Use production builds (strips dev warnings, enables minification). (7) Enable gzip/brotli compression on the server. (8) Put large dependencies on a CDN. (9) Consider preact as a smaller alternative (3KB vs ~40KB). (10) Regularly audit and remove unused dependencies.",
      difficulty: "mid",
      followUps: [
        "How does tree shaking work, and what prevents it?",
        "What is the cost of adding a dependency to your bundle?",
        "How do you set up bundle analysis in a Vite/Webpack project?"
      ]
    },
    {
      question: "Explain the difference between useMemo and useCallback. When are they actually necessary vs premature optimization?",
      answer: "useMemo saves a computed value: `const sorted = useMemo(() => items.sort(...), [items])`. useCallback saves a function reference: `const handleClick = useCallback(() => {...}, [deps])`. useCallback(fn, deps) is the same as useMemo(() => fn, deps). When they are necessary: (1) useCallback when passing functions to memo'd children -- without it, the new function breaks memo. (2) useMemo for expensive work (sorting/filtering big arrays). (3) useMemo for keeping object/array references stable for other hooks or memo'd components. When they are premature: (1) Memoizing cheap calculations that are faster to redo than to cache. (2) useCallback on functions not passed to memoized children. (3) useMemo on values that don't affect any downstream memoization. Rule of thumb: don't memoize until profiling shows the need, unless you're building a reusable library where users may depend on stable references.",
      difficulty: "hard",
      followUps: [
        "What happens to useMemo when React needs to free memory?",
        "How does React Compiler (React Forget) change the memoization story?",
        "Can useMemo guarantee referential stability?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Implement a useDebounce Hook for Search Input Optimization",
      difficulty: "easy",
      description: "Create a useDebounce hook that delays updating a value until a specified time has passed since the last change. Use it to debounce a search input that filters a large list.",
      solution: `// useDebounce: waits for the user to stop changing 'value'
// before updating the returned debounced value.
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    // Set a timer to update after 'delay' ms
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delay);

    // If value changes again before timer fires, cancel and restart
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

// Example: search input that filters a big list
function SearchList({ items }) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // This filter only runs when debouncedSearch changes,
  // not on every keystroke
  const results = useMemo(() => {
    if (!debouncedSearch) return items;
    const term = debouncedSearch.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term)
    );
  }, [items, debouncedSearch]);

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
      />
      <p>Showing {results.length} of {items.length} items</p>
      <ul>
        {results.map((item) => (
          <li key={item.id}>{item.name}: {item.description}</li>
        ))}
      </ul>
    </div>
  );
}`,
      explanation: "useDebounce sets a timer each time the value changes. If the value changes again before the timer fires, the old timer is canceled and a new one starts. So the debounced value only updates after the user stops typing for the given delay. Combined with useMemo, the expensive filtering only runs when typing pauses, not on every keystroke."
    },
    {
      title: "Build a Lazy-Loaded Image Component with Intersection Observer",
      difficulty: "mid",
      description: "Create an Image component that uses Intersection Observer to load images only when they enter the viewport. Include a placeholder, loading state, and error handling.",
      solution: `function LazyImage({ src, alt, width, height, placeholder }) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const [error, setError] = useState(false);
  const ref = useRef(null);

  // Watch when the image container scrolls into view
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);           // Start loading the image
          observer.unobserve(el);    // Stop watching
        }
      },
      { rootMargin: "200px" }        // Start 200px before visible
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ width, height, position: "relative", overflow: "hidden" }}
    >
      {/* Show placeholder until image is loaded */}
      {!loaded && !error && (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: placeholder || "#e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {inView && <span className="spinner" />}
        </div>
      )}

      {/* Show error with retry button */}
      {error && (
        <div className="error">
          <span>Failed to load</span>
          <button onClick={() => { setError(false); setLoaded(false); }}>
            Retry
          </button>
        </div>
      )}

      {/* Only load the image when it's in the viewport */}
      {inView && !error && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.3s",
          }}
        />
      )}
    </div>
  );
}

// Use it in an image gallery
function Gallery({ images }) {
  return (
    <div className="grid">
      {images.map((img) => (
        <LazyImage
          key={img.id}
          src={img.url}
          alt={img.alt}
          width={300}
          height={200}
        />
      ))}
    </div>
  );
}`,
      explanation: "IntersectionObserver watches when the image container scrolls into view (with a 200px head start). Only then does the <img> element appear and start downloading. A placeholder shows until the image is ready, with a smooth fade-in. If loading fails, a retry button appears. This avoids loading images the user hasn't scrolled to yet, making the page load faster and saving bandwidth."
    },
    {
      title: "Create a Performance-Aware Context with Selective Subscriptions",
      difficulty: "hard",
      description: "React Context re-renders ALL consumers when the context value changes. Build a createFastContext utility that only re-renders consumers that use the changed part of the state, similar to Zustand's selector pattern.",
      solution: `function createFastContext(initialState) {
  // Store data in a ref (not state) so changes don't
  // trigger React Context re-renders
  function useStoreData() {
    const store = useRef(initialState);
    const listeners = useRef(new Set());

    // Get current state
    const get = useCallback(() => store.current, []);

    // Update state and notify all listeners
    const set = useCallback((value) => {
      store.current =
        typeof value === "function" ? value(store.current) : value;
      listeners.current.forEach((fn) => fn());
    }, []);

    // Subscribe to changes
    const subscribe = useCallback((fn) => {
      listeners.current.add(fn);
      return () => listeners.current.delete(fn);
    }, []);

    return { get, set, subscribe };
  }

  const StoreContext = createContext(null);

  function Provider({ children }) {
    const store = useStoreData();
    return (
      <StoreContext.Provider value={store}>
        {children}
      </StoreContext.Provider>
    );
  }

  // useStore with a selector: only re-renders when
  // the selected value changes
  function useStore(selector) {
    const store = useContext(StoreContext);
    if (!store) {
      throw new Error("useStore must be used inside Provider");
    }

    const [value, setValue] = useState(() => selector(store.get()));
    const selectorRef = useRef(selector);
    selectorRef.current = selector;

    useEffect(() => {
      return store.subscribe(() => {
        const next = selectorRef.current(store.get());
        // Only update if the selected value actually changed
        setValue((prev) => (Object.is(prev, next) ? prev : next));
      });
    }, [store]);

    return [value, store.set];
  }

  return { Provider, useStore };
}

// --- Usage ---
const { Provider, useStore } = createFastContext({
  firstName: "John",
  lastName: "Doe",
  age: 30,
});

// Only re-renders when firstName changes
function FirstName() {
  const [firstName] = useStore((s) => s.firstName);
  console.log("FirstName rendered");
  return <p>First: {firstName}</p>;
}

// Only re-renders when lastName changes
function LastName() {
  const [lastName] = useStore((s) => s.lastName);
  console.log("LastName rendered");
  return <p>Last: {lastName}</p>;
}

// Typing here only re-renders FirstName, not LastName
function FirstNameInput() {
  const [firstName, setStore] = useStore((s) => s.firstName);
  return (
    <input
      value={firstName}
      onChange={(e) =>
        setStore((prev) => ({ ...prev, firstName: e.target.value }))
      }
    />
  );
}

function App() {
  return (
    <Provider>
      <FirstNameInput />
      <FirstName />
      <LastName />
    </Provider>
  );
}`,
      explanation: "Normal React Context re-renders every consumer when anything changes. This utility avoids that by storing data in a ref instead of state, so context never triggers re-renders. Instead, it uses a publish-subscribe pattern: when state changes, every subscriber is notified. Each useStore hook picks out just the data it needs with a selector. It only calls setState if that specific piece of data actually changed (using Object.is). So components that don't use the changed data never re-render. This is the same pattern used by Zustand and useSyncExternalStore."
    }
  ],
  quiz: [
    {
      question: "What does React.memo compare by default to decide if a component should re-render?",
      options: [
        "Deep equality of all props using JSON.stringify",
        "Shallow comparison of each prop using Object.is",
        "Reference equality of the entire props object",
        "It checks if the component's state changed"
      ],
      correct: 1,
      explanation: "React.memo checks each prop one by one using Object.is (shallow comparison). Numbers and strings are compared by value, but objects and arrays are compared by reference. It does NOT use deep equality or JSON.stringify because those would be too slow."
    },
    {
      question: "What happens when a React.lazy component's chunk fails to load due to a network error?",
      options: [
        "React automatically retries the load 3 times",
        "The Suspense fallback is shown indefinitely",
        "The error propagates to the nearest error boundary",
        "React shows a white screen with no error"
      ],
      correct: 2,
      explanation: "When the import() fails (bad network, 404, etc.), the error goes to the nearest error boundary. Suspense only handles the loading state, not errors. Without an error boundary, the whole app crashes. That's why you should always have an error boundary near your Suspense that can show a retry button."
    },
    {
      question: "In a virtualized list of 50,000 items, approximately how many DOM nodes exist at any time?",
      options: [
        "50,000 DOM nodes (all items)",
        "Half the items (25,000 DOM nodes)",
        "Only the visible items plus a small overscan buffer (typically 20-50 nodes)",
        "One DOM node that updates its content on scroll"
      ],
      correct: 2,
      explanation: "Virtualization only creates DOM elements for items visible on screen, plus a few extra above and below (the overscan buffer). If 20 items fit on screen with an overscan of 5, about 30 DOM nodes exist. The container has the full scroll height (50,000 x item height) so the scrollbar works correctly, but only visible items are real elements."
    },
    {
      question: "What does the baseDuration in React Profiler's onRender callback represent?",
      options: [
        "The time it took React to actually render the committed changes",
        "The time spent in the component's useEffect hooks",
        "The estimated time to render the entire subtree without any memoization",
        "The time between the previous render and the current render"
      ],
      correct: 2,
      explanation: "baseDuration is the estimated cost of rendering everything from scratch with no memoization. It's the worst-case scenario. Compare it with actualDuration (the real time with memoization) to see how much your memo optimizations are saving."
    },
    {
      question: "Why is useCallback(fn, deps) essentially equivalent to useMemo(() => fn, deps)?",
      options: [
        "They're not equivalent \u2014 useCallback caches the return value of fn",
        "useCallback is just syntactic sugar that returns the function itself instead of calling it",
        "useCallback runs fn immediately while useMemo defers it",
        "They both deep-clone the function for immutability"
      ],
      correct: 1,
      explanation: "useCallback(fn, deps) returns the fn function itself when deps haven't changed. useMemo(() => fn, deps) does exactly the same thing -- the factory returns fn without calling it. useCallback is just a shortcut so you don't need the extra arrow function wrapper. Both give you a stable reference to the same function."
    }
  ]
};
