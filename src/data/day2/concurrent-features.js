export const concurrentFeatures = {
  id: "concurrent-features",
  title: "Concurrent Features",
  icon: "\u{1F300}",
  tag: "React Advanced",
  tagColor: "var(--tag-react)",
  subtitle: "Master useTransition, useDeferredValue, Suspense, and startTransition for responsive UIs during heavy updates",
  concepts: [
    {
      title: "Concurrent Rendering: Interruptible Rendering Explained",
      explanations: {
        layman: "Think of React like a chef cooking meals. Before concurrent rendering, the chef had to finish one big meal before starting anything else. If someone needed a glass of water, they had to wait. With concurrent rendering, the chef can pause cooking to get the water, then go back to cooking. In your app, this means typing in a search box stays smooth even if React is busy filtering a huge list. React pauses the slow work to handle your typing first.",
        mid: "Concurrent rendering lets React pause, resume, or abandon rendering work. Before React 18, rendering was all-or-nothing. Once React started, it blocked the main thread until done. Now React can: (1) Pause rendering to handle urgent updates like typing. (2) Throw away stale renders if data changed. (3) Prepare UI in memory without showing it yet. You opt in using useTransition, useDeferredValue, or Suspense. Use createRoot to enable it. Without these features, React still renders synchronously.",
        senior: "Concurrent rendering works because React's render phase is pure — it builds a virtual tree without touching the DOM. This means React can safely abandon a half-finished render if something more urgent comes in (like user typing). The commit phase (actual DOM updates) is still synchronous and can't be interrupted. React assigns priority levels to updates: user input is high priority, transitions are low priority. High-priority updates interrupt low-priority renders. The practical implication: your components may render multiple times but only commit once — so side effects in render (like mutating refs or logging) will fire extra times. StrictMode double-renders to catch this. Bottom line: keep render functions pure, put side effects in useEffect or event handlers."
      },
      realWorld: "Search boxes that filter large lists without freezing. Tab switching where new content loads in the background. Autocomplete that stays responsive while computing suggestions. Any heavy computation that should not block user input.",
      whenToUse: "When heavy renders block user input. When you want the UI to stay responsive during data loading. When you want to show old content while new content renders. When typing or clicking should feel instant even during slow updates.",
      whenNotToUse: "Skip it for simple, fast UIs. It does not make slow code faster, it just keeps the UI feeling responsive. Do not use transitions for things that must show instantly like error messages. Does not work with external stores unless you use useSyncExternalStore.",
      pitfalls: "Components may render many times without showing on screen. Changing useRef during render is unsafe because the render might be thrown away. Some third-party libraries may break. Race conditions hidden in sync mode can appear. StrictMode double-rendering is expected, not a bug.",
      codeExamples: [
        {
          title: "Demonstrating Priority with createRoot",
          code: `import { createRoot } from "react-dom/client";

// createRoot turns on concurrent rendering
const root = createRoot(document.getElementById("root"));
root.render(<App />);

function App() {
  const [text, setText] = useState("");
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    const value = e.target.value;

    // URGENT: show typed text right away
    setText(value);

    // NOT URGENT: search can wait
    startTransition(() => {
      const found = heavySearch(value);
      setResults(found);
    });
  };

  return (
    <div>
      <input value={text} onChange={handleChange} />
      {isPending && <p className="loading">Updating results...</p>}
      <SearchResults results={results} />
    </div>
  );
}`
        }
      ]
    },
    {
      title: "useTransition: Non-Urgent State Updates",
      explanations: {
        layman: "Imagine you are on the phone and someone knocks on the door. The phone call is important but the knock is urgent. useTransition is like telling React: 'This update is like the phone call. If something urgent happens, pause this and handle the urgent thing first.' It keeps your app feeling fast by letting React skip slow updates when the user is doing something important like typing.",
        mid: "useTransition returns [isPending, startTransition]. Wrap slow state updates in startTransition to tell React they are low priority. React starts the work right away but will pause it if something urgent (like typing) happens. isPending is true while the update is in progress, so you can show a loading indicator. Unlike debouncing, there is no artificial delay. React starts immediately but can pause and restart. The old UI stays visible and clickable until the update finishes.",
        senior: "startTransition marks an update as low priority. React starts the work immediately but will abandon and restart it if a higher-priority update (like typing) arrives. Key insight: the transition render is restarted from scratch, not resumed, which guarantees consistent state. This means components inside a transition may render multiple times without ever committing — so they must be pure. When the user triggers multiple rapid transitions (like clicking tabs fast), React only commits the latest one, skipping intermediate renders. This is why transitions feel snappier than debouncing: no artificial delay, just intelligent scheduling. The standalone startTransition (imported from 'react') works outside components for things like router navigation but has no isPending feedback."
      },
      realWorld: "Filtering large lists while keeping the search box responsive. Switching tabs in heavy dashboards. Page navigation in single-page apps. Sorting or reordering big lists. Any state change that causes a slow re-render.",
      whenToUse: "When a state update causes a slow re-render that freezes the UI. When you want to show old content while new content prepares. When you want a loading indicator without blocking clicks. When users can tolerate briefly seeing stale data.",
      whenNotToUse: "Do not wrap urgent updates like error messages or toggle switches. Do not use if the render is already fast. isPending causes an extra render, so skip it for cheap updates. If everything is a transition, nothing is urgent and you lose the benefit.",
      pitfalls: "The function inside startTransition must be synchronous. No await allowed. startTransition does not delay anything, it lowers priority. isPending causes an extra render. Transition renders can restart many times, so components must be pure with no side effects in render.",
      codeExamples: [
        {
          title: "Tab Switching with useTransition",
          code: `function TabContainer() {
  const [tab, setTab] = useState("home");
  const [isPending, startTransition] = useTransition();

  function selectTab(newTab) {
    // Mark tab switch as non-urgent
    startTransition(() => {
      setTab(newTab);
    });
  }

  return (
    <div>
      <div className="tab-bar">
        {["home", "posts", "analytics"].map((t) => (
          <button
            key={t}
            onClick={() => selectTab(t)}
            className={tab === t ? "active" : ""}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Dim content while loading new tab */}
      <div className={isPending ? "tab-content pending" : "tab-content"}>
        {tab === "home" && <HomePage />}
        {tab === "posts" && <PostsFeed />}
        {tab === "analytics" && <AnalyticsDashboard />}
      </div>
    </div>
  );
}

// CSS: .tab-content.pending { opacity: 0.7; pointer-events: none; }`
        },
        {
          title: "Search Filter with useTransition vs Debounce",
          code: `function ProductSearch({ products }) {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState(products);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e) => {
    const value = e.target.value;

    // Urgent: update input right away
    setQuery(value);

    // Not urgent: filtering can be paused
    startTransition(() => {
      const matches = products.filter((p) =>
        p.name.toLowerCase().includes(value.toLowerCase()) ||
        p.description.toLowerCase().includes(value.toLowerCase())
      );
      setFiltered(matches);
    });
  };

  return (
    <div>
      <input
        value={query}
        onChange={handleSearch}
        placeholder="Search products..."
      />

      {isPending ? (
        <p>Filtering...</p>
      ) : (
        <p>{filtered.length} results</p>
      )}

      <div className="product-grid">
        {filtered.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </div>
  );
}`
        }
      ]
    },
    {
      title: "useDeferredValue: Deferring Expensive Re-renders",
      explanations: {
        layman: "Imagine a mirror that takes a few seconds to update. You move your hand, but the mirror still shows where your hand was a moment ago. When it catches up, it shows the new position. useDeferredValue works the same way. It gives your component an older version of a value so it can keep showing something fast. When the new version is ready, React swaps it in. The screen never freezes.",
        mid: "useDeferredValue takes a value and returns a copy that lags behind during fast updates. When the value changes, React first renders with the old deferred value (fast), then renders again with the new value at low priority (can be interrupted). Key difference from useTransition: useTransition wraps the state setter, useDeferredValue wraps the value itself. Use useDeferredValue when you do not control the state update, like when the value comes from props. Pair it with React.memo on the component that uses the deferred value, or you get two renders with no benefit.",
        senior: "useDeferredValue triggers two renders: first with the old value (fast, lets memoized children bail out), then with the new value at low priority (interruptible). The critical detail most people miss: without React.memo on the consuming component, you get two full renders with zero benefit — it actually makes things worse. Decision framework: use useTransition when you control the state setter, use useDeferredValue when the value comes from props or a parent you can't modify. In React 19, useDeferredValue accepts an initialValue for SSR: `useDeferredValue(value, initialValue)`, which defers the real value during hydration — great for heavy client-side renders that shouldn't block the initial page load."
      },
      realWorld: "Heavy charts or graphs that depend on fast-changing input. Search results lists that receive the query from a parent. Live preview panels like Markdown editors. Data grids that re-sort based on user input.",
      whenToUse: "When you want to show old content while new content renders. When the value comes from props and you do not control the state update. When combined with React.memo to skip expensive renders. When the expensive part is in a child component.",
      whenNotToUse: "Do not use without React.memo on the consuming component. Do not use for values that must always be current like form inputs or errors. Do not use when the render is already fast. It is not the same as debouncing.",
      pitfalls: "Without React.memo, you get two renders instead of one with no benefit. The deferred value can be stale, so show a visual hint (like lower opacity). Multiple deferred values may update at different times causing visual mismatches. Always indicate staleness to users.",
      codeExamples: [
        {
          title: "Deferred Search Results with Visual Feedback",
          code: `function SearchPage() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  // Check if results are stale
  const isStale = query !== deferredQuery;

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      {/* Dim results while they update */}
      <div style={{ opacity: isStale ? 0.6 : 1 }}>
        <SearchResults query={deferredQuery} />
      </div>
    </div>
  );
}

// MUST use React.memo for useDeferredValue to help
const SearchResults = React.memo(function SearchResults({ query }) {
  const results = useMemo(() => {
    return filterBigList(query); // Slow operation
  }, [query]);

  return (
    <ul>
      {results.map((item) => (
        <li key={item.id}>
          <Highlight text={item.name} query={query} />
          <p>{item.description}</p>
        </li>
      ))}
    </ul>
  );
});`
        },
        {
          title: "Deferred Live Preview (Markdown Editor)",
          code: `function MarkdownEditor() {
  const [text, setText] = useState("# Hello World");
  const deferredText = useDeferredValue(text);
  const isStale = text !== deferredText;

  return (
    <div className="editor-layout">
      <textarea
        className="editor-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={20}
      />

      <div className="preview-panel">
        <div>{isStale ? "Rendering..." : "Preview ready"}</div>
        <div style={{ opacity: isStale ? 0.7 : 1 }}>
          {/* Heavy component - must be memoized */}
          <MarkdownPreview content={deferredText} />
        </div>
      </div>
    </div>
  );
}

const MarkdownPreview = React.memo(function MarkdownPreview({ content }) {
  // Slow: parse markdown and highlight code
  const html = useMemo(() => {
    return parseMarkdown(content);
  }, [content]);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
});`
        }
      ]
    },
    {
      title: "Suspense for Data Fetching and the use() Hook",
      explanations: {
        layman: "Imagine ordering food at a restaurant. Instead of asking the kitchen every 5 seconds 'Is it ready?', you just place your order and the kitchen tells you when it is done. While you wait, they bring you bread. Suspense works the same way. A component says 'I need data.' If the data is not ready, React shows a placeholder (like the bread). When the data arrives, the real content appears. No need for loading flags or if-else checks.",
        mid: "Suspense lets components 'wait' for async data. Instead of writing `if (loading) return <Spinner />`, a Suspense-enabled data source throws a Promise when data is not ready. The nearest Suspense boundary catches it and shows a fallback. When the Promise resolves, React re-renders with the real data. React 19's use() hook makes this simple: `const data = use(fetchData())`. Pending = suspends. Resolved = returns data. Rejected = throws to error boundary. Important: the Promise must be created outside the render function (in a cache or framework) to avoid infinite loops. Frameworks like Next.js and Remix support this already.",
        senior: "Suspense works by catching thrown Promises. When use(promise) is called and the promise is pending, it throws — the nearest Suspense boundary catches it and shows the fallback. When the promise resolves, React re-renders and the component gets the resolved value. The #1 gotcha: the Promise must be referentially stable across renders. Writing `use(fetch('/api'))` inside render creates a new Promise each time → infinite loop. This is why you need a cache layer (React cache(), framework route loaders, or a simple Map cache). Unlike other hooks, use() can be called conditionally and inside loops, which makes it flexible for conditional data fetching. Powerful pattern: combine Suspense with transitions — instead of showing a fallback spinner on navigation, the old page stays visible until the new data is ready, which feels much smoother."
      },
      realWorld: "Data fetching in Next.js App Router. Route-based data loading. Parallel data fetching where sections load independently. Image loading with skeleton placeholders.",
      whenToUse: "When your framework supports Suspense data fetching (Next.js, Remix, Relay). When you want to remove loading state boilerplate. When you want sections to load independently. When combined with transitions to avoid loading spinners on navigation.",
      whenNotToUse: "Do not use in client-only apps without a caching layer. Do not create promises inside render. Do not use for writes or mutations, only reads. Do not wrap every component in its own Suspense boundary.",
      pitfalls: "Creating promises in render causes infinite loops. Without a cache, data is refetched every render. Fallbacks can cause layout jumps if not designed well. Nested Suspense can create waterfalls where inner components wait for outer ones. use() is React 19+ only. Older versions need framework-specific APIs.",
      codeExamples: [
        {
          title: "Suspense Data Fetching with use() (React 19+)",
          code: `import { use, Suspense } from "react";

// Simple cache: create each promise only once
const cache = new Map();

function fetchUser(id) {
  if (!cache.has(id)) {
    cache.set(id,
      fetch(\`/api/users/\${id}\`).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
    );
  }
  return cache.get(id);
}

function fetchPosts(userId) {
  const key = \`posts-\${userId}\`;
  if (!cache.has(key)) {
    cache.set(key,
      fetch(\`/api/users/\${userId}/posts\`).then((r) => r.json())
    );
  }
  return cache.get(key);
}

// Components just read data. No loading states needed.
function UserProfile({ userId }) {
  const user = use(fetchUser(userId));
  return (
    <div className="profile">
      <img src={user.avatar} alt={user.name} />
      <h1>{user.name}</h1>
      <p>{user.bio}</p>
    </div>
  );
}

function UserPosts({ userId }) {
  const posts = use(fetchPosts(userId));
  return (
    <ul className="posts">
      {posts.map((post) => (
        <li key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.excerpt}</p>
        </li>
      ))}
    </ul>
  );
}

// Each section loads on its own
function UserPage({ userId }) {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<ProfileSkeleton />}>
        <UserProfile userId={userId} />
      </Suspense>

      <Suspense fallback={<PostsSkeleton />}>
        <UserPosts userId={userId} />
      </Suspense>
    </ErrorBoundary>
  );
}`
        },
        {
          title: "Suspense + Transition for Seamless Navigation",
          code: `function UserDirectory() {
  const [userId, setUserId] = useState(null);
  const [isPending, startTransition] = useTransition();

  function selectUser(id) {
    // Keep showing current user while new one loads
    startTransition(() => {
      setUserId(id);
    });
  }

  return (
    <div className="directory">
      <UserList onSelect={selectUser} selectedId={userId} />

      <div
        className="detail-panel"
        style={{ opacity: isPending ? 0.7 : 1 }}
      >
        {isPending && <div className="loading-overlay">Loading...</div>}

        {userId ? (
          <Suspense fallback={<DetailSkeleton />}>
            <UserDetail userId={userId} />
          </Suspense>
        ) : (
          <p>Select a user to view details</p>
        )}
      </div>
    </div>
  );
}

// Without transition: clicking a user shows the skeleton instantly (jarring).
// With transition: old user stays visible (dimmed) while new data loads.
// The skeleton only shows the first time.`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "What is concurrent rendering in React, and how is it different from synchronous rendering?",
      answer: "The main difference is that concurrent rendering can be paused. In React 17 (synchronous), once rendering starts, it blocks everything until it finishes. A tree with 10,000 components can freeze the page for 100ms+. In React 18 (concurrent), React works in small 5ms chunks. After each chunk, it checks if the browser needs to handle something urgent like user typing. If so, it pauses rendering and handles the urgent task first. It can also throw away a render that is no longer needed. Important: you must use createRoot AND opt in with useTransition, useDeferredValue, or Suspense. Without these, React still renders synchronously.",
      difficulty: "mid",
      followUps: [
        "What are 'lanes' in React's scheduler?",
        "How does time-slicing work technically?",
        "Can concurrent rendering make total render time faster?"
      ]
    },
    {
      question: "Explain useTransition and give an example of when you'd use it over debouncing.",
      answer: "useTransition returns [isPending, startTransition]. Wrap slow state updates in startTransition to mark them as low priority. Three advantages over debouncing: (1) No artificial delay. React starts work right away, just at lower priority. (2) It integrates with React's scheduler, not a timer. (3) It can cancel stale renders. If the user types again, React throws away the old work and starts fresh. Example: in a search box, debounce waits 300ms after typing stops, then filters. useTransition starts filtering after each keystroke but pauses it when a new keystroke arrives. Result: the input never freezes, and results update as soon as the user pauses.",
      difficulty: "mid",
      followUps: [
        "What's the difference between startTransition from 'react' vs useTransition?",
        "Can you use async functions inside startTransition?",
        "How do multiple concurrent transitions interact?"
      ]
    },
    {
      question: "What is useDeferredValue and how does it differ from useTransition?",
      answer: "useDeferredValue takes a value and returns an older version of it during fast updates. React renders twice: first with the old deferred value (fast), then with the new value at low priority (can be paused). The key difference: useTransition wraps the state setter (you control the update). useDeferredValue wraps the value (you control the consumer). Use useDeferredValue when you do not control the update, like when the value comes from props. Important: wrap the consuming component in React.memo. Without memo, the component renders on both passes with no benefit. Check for staleness with: `const isStale = value !== deferredValue`.",
      difficulty: "mid",
      followUps: [
        "Why must the consuming component be wrapped in React.memo?",
        "What does the initialValue parameter do in React 19?",
        "How many times does a component render when useDeferredValue transitions?"
      ]
    },
    {
      question: "How does Suspense work under the hood for data fetching? What role does the use() hook play?",
      answer: "When a component needs data that is not ready, it throws a Promise. React catches this (similar to error boundaries), finds the nearest Suspense boundary, and shows the fallback. React listens for the Promise to resolve. When it does, React re-renders the component, which now gets the data. The use() hook (React 19) makes this clean: `const data = use(promise)`. Pending = component suspends. Resolved = returns data. Rejected = throws to error boundary. Critical rule: Promises must be cached. If you create a new Promise in render, each retry creates another pending Promise, causing an infinite loop. This is why you need a framework or cache layer. With startTransition, Suspense keeps old content visible instead of showing the fallback.",
      difficulty: "hard",
      followUps: [
        "Why can't you create the Promise inside the render function?",
        "How does Suspense differ from useEffect + loading state?",
        "How do Suspense waterfalls form and how do you avoid them?"
      ]
    },
    {
      question: "How do concurrent features improve perceived performance even though they don't reduce total computation time?",
      answer: "Three ways: (1) Responsiveness. React yields to the browser every 5ms, so the main thread is never blocked for long. Animations stay smooth and input stays responsive. The same work is spread across many small chunks instead of one big block. (2) Priority. Urgent updates (typing, clicking) run first. Slow updates (filtering, charts) run later. The user sees their input reflected instantly. (3) Skipped work. If the user types 'abc' quickly, React may start rendering for 'a', throw it away when 'b' arrives, throw that away when 'c' arrives, and only finish the render for 'abc'. This actually reduces total work. The app feels fast because the things the user directly interacts with are never blocked.",
      difficulty: "hard",
      followUps: [
        "What is 'tearing' in the context of concurrent rendering?",
        "How does useSyncExternalStore prevent tearing?",
        "What is the 5ms time slice and why was that number chosen?"
      ]
    },
    {
      question: "What is the startTransition standalone API and when would you use it instead of useTransition?",
      answer: "startTransition (imported from 'react') is a function that marks state updates as low priority, just like useTransition, but without isPending. Use it when: (1) You are outside a React component, like in a router or store. (2) You do not need a loading indicator. (3) In class components that cannot use hooks. Example: a router marking navigation as a transition: `startTransition(() => navigate('/dashboard'))`. The current page stays interactive while the new page renders. The trade-off is no isPending, so you cannot show loading state directly. React Router v6.4+ uses this internally.",
      difficulty: "easy",
      followUps: [
        "Can you nest startTransition calls?",
        "What happens if you call startTransition in a class component?",
        "How does startTransition interact with Suspense?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Build a Search-As-You-Type with useTransition",
      difficulty: "easy",
      description: "Create a search interface that filters through 10,000 items. The input should remain responsive even during heavy filtering. Show a pending indicator when results are updating.",
      solution: `// Create fake data
function makeItems(count) {
  const types = ["Electronics", "Books", "Clothing", "Home", "Sports"];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: \`Product \${i} - \${types[i % types.length]}\`,
    description: \`Description for product \${i}\`,
    price: parseFloat((Math.random() * 100).toFixed(2)),
    category: types[i % types.length],
  }));
}

const ALL_ITEMS = makeItems(10000);

function SearchApp() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(ALL_ITEMS);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e) => {
    const value = e.target.value;

    // Urgent: show typed text right away
    setQuery(value);

    // Not urgent: filtering 10K items can wait
    startTransition(() => {
      if (!value.trim()) {
        setResults(ALL_ITEMS);
        return;
      }

      const lower = value.toLowerCase();
      const matches = ALL_ITEMS.filter(
        (item) =>
          item.name.toLowerCase().includes(lower) ||
          item.description.toLowerCase().includes(lower) ||
          item.category.toLowerCase().includes(lower)
      );
      setResults(matches);
    });
  };

  return (
    <div className="search-app">
      <div className="search-bar">
        <input
          value={query}
          onChange={handleSearch}
          placeholder="Search 10,000 products..."
        />
        <span>
          {isPending ? "Searching..." : \`\${results.length} results\`}
        </span>
      </div>

      {/* Dim results while updating */}
      <div style={{ opacity: isPending ? 0.6 : 1 }}>
        {results.slice(0, 100).map((item) => (
          <div key={item.id} className="product-card">
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <span>\${item.price}</span>
            <span>{item.category}</span>
          </div>
        ))}
        {results.length > 100 && (
          <p>...and {results.length - 100} more results</p>
        )}
      </div>
    </div>
  );
}`,
      explanation: "The key idea: the input (query) uses a normal setState so it updates instantly. The slow filtering (setResults) is inside startTransition so it can be paused. When the user types fast, React shows each keystroke immediately but may skip intermediate filter results. isPending drives the visual feedback (dimmed results + 'Searching...'). No debouncing needed."
    },
    {
      title: "Implement a Deferred Heavy Visualization",
      difficulty: "mid",
      description: "Create a slider that controls a heavy visualization (grid of colored cells). The slider must stay responsive while the grid re-renders. Use useDeferredValue to defer the grid rendering.",
      solution: `function SliderVisualization() {
  const [gridSize, setGridSize] = useState(20);
  const deferredSize = useDeferredValue(gridSize);
  const isStale = gridSize !== deferredSize;

  return (
    <div className="visualization-app">
      <div className="controls">
        <label>
          Grid Size: {gridSize} x {gridSize} ({gridSize * gridSize} cells)
          <input
            type="range"
            min={5}
            max={100}
            value={gridSize}
            onChange={(e) => setGridSize(Number(e.target.value))}
          />
        </label>
        {isStale && <span className="updating-badge">Updating...</span>}
      </div>

      {/* Dim while updating */}
      <div style={{ opacity: isStale ? 0.6 : 1 }}>
        <HeavyGrid size={deferredSize} />
      </div>
    </div>
  );
}

// MUST use React.memo so useDeferredValue actually helps
const HeavyGrid = React.memo(function HeavyGrid({ size }) {
  // Build grid of colored cells
  const cells = useMemo(() => {
    const grid = [];
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        // Calculate a color for each cell
        const hue = ((row * col * 7) % 360);
        const sat = 50 + ((row + col) % 50);
        const light = 40 + ((row * 3 + col * 7) % 30);
        grid.push({
          key: \`\${row}-\${col}\`,
          color: \`hsl(\${hue}, \${sat}%, \${light}%)\`,
        });
      }
    }
    return grid;
  }, [size]);

  return (
    <div
      className="grid"
      style={{
        display: "grid",
        gridTemplateColumns: \`repeat(\${size}, 1fr)\`,
        gap: "1px",
      }}
    >
      {cells.map((cell) => (
        <div
          key={cell.key}
          style={{
            backgroundColor: cell.color,
            aspectRatio: "1",
            minWidth: 0,
          }}
        />
      ))}
    </div>
  );
});`,
      explanation: "The slider updates gridSize instantly (urgent). The grid gets deferredSize which lags behind. Because HeavyGrid uses React.memo, it skips the urgent render (deferred value has not changed). The deferred render updates the grid at low priority and can be interrupted. The opacity and 'Updating...' text tell the user the grid is recalculating. Without useDeferredValue and memo, dragging the slider with a 100x100 grid (10,000 cells) would be very laggy."
    },
    {
      title: "Build a Suspense-Powered Data Dashboard with Parallel Loading",
      difficulty: "hard",
      description: "Create a dashboard with three data panels (Stats, Chart, Activity) that each fetch data independently. Use Suspense to show individual loading states. Use startTransition for tab navigation to avoid showing loading states when switching between cached views.",
      solution: `// Simple cache: store promises so they are not recreated
const cache = new Map();

function cachedFetch(url) {
  if (!cache.has(url)) {
    const promise = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        return res.json();
      })
      .then((data) => {
        // Mark as resolved
        promise._done = true;
        promise._data = data;
        return data;
      })
      .catch((err) => {
        cache.delete(url); // Allow retry on failure
        throw err;
      });
    cache.set(url, promise);
  }
  return cache.get(url);
}

// Read data or throw promise for Suspense
function readData(url) {
  const promise = cachedFetch(url);
  if (promise._done) return promise._data;
  throw promise; // Suspense catches this
}

// Each panel fetches its own data
function StatsPanel() {
  const stats = readData("/api/dashboard/stats");
  return (
    <div className="panel stats-panel">
      <h3>Key Metrics</h3>
      <div className="stats-grid">
        <div className="stat">
          <span className="stat-value">{stats.totalUsers}</span>
          <span className="stat-label">Total Users</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.revenue}</span>
          <span className="stat-label">Revenue</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.conversion}%</span>
          <span className="stat-label">Conversion</span>
        </div>
      </div>
    </div>
  );
}

function ChartPanel() {
  const chartData = readData("/api/dashboard/chart");
  return (
    <div className="panel chart-panel">
      <h3>Revenue Over Time</h3>
      <div className="chart">
        {chartData.points.map((point, i) => (
          <div
            key={i}
            className="chart-bar"
            style={{ height: \`\${point.value}%\` }}
            title={\`\${point.label}: \${point.value}\`}
          />
        ))}
      </div>
    </div>
  );
}

function ActivityPanel() {
  const activity = readData("/api/dashboard/activity");
  return (
    <div className="panel activity-panel">
      <h3>Recent Activity</h3>
      <ul className="activity-list">
        {activity.events.map((event) => (
          <li key={event.id}>
            <span>{event.time}</span>
            <span>{event.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Skeleton placeholders
function StatsSkeleton() {
  return (
    <div className="panel stats-panel skeleton">
      <h3>Key Metrics</h3>
      <div className="stats-grid">
        {[1, 2, 3].map((i) => (
          <div key={i} className="stat">
            <div className="skeleton-line wide" />
            <div className="skeleton-line narrow" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="panel chart-panel skeleton">
      <h3>Revenue Over Time</h3>
      <div className="skeleton-chart" />
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="panel activity-panel skeleton">
      <h3>Recent Activity</h3>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton-line" />
      ))}
    </div>
  );
}

// Dashboard with independent loading for each panel
function Dashboard() {
  const [view, setView] = useState("overview");
  const [isPending, startTransition] = useTransition();

  const switchView = (newView) => {
    startTransition(() => {
      setView(newView);
    });
  };

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        {["overview", "analytics", "settings"].map((v) => (
          <button
            key={v}
            onClick={() => switchView(v)}
            className={view === v ? "active" : ""}
          >
            {v}
          </button>
        ))}
      </nav>

      <div
        className="dashboard-content"
        style={{ opacity: isPending ? 0.7 : 1 }}
      >
        {view === "overview" && (
          <ErrorBoundary fallback={<p>Dashboard error. Try refreshing.</p>}>
            <div className="dashboard-grid">
              {/* Each panel loads on its own */}
              <Suspense fallback={<StatsSkeleton />}>
                <StatsPanel />
              </Suspense>

              <Suspense fallback={<ChartSkeleton />}>
                <ChartPanel />
              </Suspense>

              <Suspense fallback={<ActivitySkeleton />}>
                <ActivityPanel />
              </Suspense>
            </div>
          </ErrorBoundary>
        )}

        {view === "analytics" && (
          <Suspense fallback={<div>Loading analytics...</div>}>
            <AnalyticsView />
          </Suspense>
        )}
      </div>
    </div>
  );
}`,
      explanation: "Three patterns working together: (1) Parallel Suspense: each panel has its own Suspense boundary so they load independently. Stats can appear before Chart or Activity. (2) Cached data fetching: the cache ensures stable promise references (no infinite loops). readData either returns cached data or throws the promise for Suspense. (3) startTransition for navigation: switching views keeps the current view visible (dimmed) until new data is ready, avoiding jarring loading states for cached views."
    }
  ],
  quiz: [
    {
      question: "What happens if you DON'T use createRoot (use legacy ReactDOM.render instead) in React 18?",
      options: [
        "React throws an error and refuses to render",
        "All concurrent features work but with a deprecation warning",
        "React works in legacy synchronous mode \u2014 concurrent features are unavailable",
        "React automatically upgrades to concurrent mode"
      ],
      correct: 2,
      explanation: "ReactDOM.render runs React in the old synchronous mode. Concurrent features like useTransition, useDeferredValue, and automatic batching of async updates will not work. React behaves like React 17. You must use createRoot to enable concurrent rendering. Both APIs exist in React 18 for gradual migration."
    },
    {
      question: "What is the key difference between useTransition and useDeferredValue?",
      options: [
        "useTransition is for class components, useDeferredValue is for function components",
        "useTransition wraps the state UPDATE, useDeferredValue wraps the state VALUE",
        "useTransition is synchronous, useDeferredValue is asynchronous",
        "useTransition only works with Suspense, useDeferredValue works everywhere"
      ],
      correct: 1,
      explanation: "useTransition gives you startTransition to wrap the state setter call (you control the update). useDeferredValue takes a value and returns a deferred copy (you consume a value you do not control). Use useTransition when you own the setter. Use useDeferredValue when the value comes from props or a parent."
    },
    {
      question: "Why must useDeferredValue be paired with React.memo on the consuming component?",
      options: [
        "React.memo is required for useDeferredValue to compile correctly",
        "Without memo, the component renders twice with no performance benefit since both the urgent and deferred renders trigger it",
        "React.memo prevents the deferred value from being stale",
        "React.memo is needed to cache the deferred value between renders"
      ],
      correct: 1,
      explanation: "useDeferredValue causes two renders: first with the OLD value (urgent), then with the NEW value (deferred). Without React.memo, the component runs on both renders anyway. With React.memo, the component skips the urgent render because props did not change (deferred value is still old). It only renders once when the deferred value actually updates. Without memo, you get two renders instead of one, which is worse than not using useDeferredValue."
    },
    {
      question: "In Suspense for data fetching, why can't you create the Promise inside the component render function?",
      options: [
        "Promises are not allowed in React components",
        "Each render creates a new Promise, causing infinite suspension since React never sees the same Promise resolve",
        "Promises inside render are automatically cancelled by React",
        "The JavaScript event loop prevents Promises from resolving during render"
      ],
      correct: 1,
      explanation: "If you write `use(fetch('/api'))` inside render, each render creates a NEW Promise. When the component suspends and React retries, it calls render again, making another new pending Promise. This loops forever: suspend, retry, new promise, suspend, retry. The Promise must come from a cache or framework so React gets the same Promise on retry, which has now resolved."
    },
    {
      question: "What does the isPending flag from useTransition represent?",
      options: [
        "Whether the component is currently mounted",
        "Whether there is a pending transition render that hasn't committed yet",
        "Whether the browser's event loop is busy",
        "Whether React.lazy components are still loading"
      ],
      correct: 1,
      explanation: "isPending is true when a transition was started but has not yet appeared on screen. React is rendering the new UI in the background but has not swapped it in. Use isPending to show visual feedback like dimming or spinners so the user knows an update is coming. It becomes false when the transition render finishes and appears on screen."
    }
  ]
};
