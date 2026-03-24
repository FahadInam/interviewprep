export const useEffectTopic = {
  id: "use-effect",
  title: "useEffect Deep Dive",
  icon: "\uD83D\uDD04",
  tag: "React Core",
  tagColor: "var(--tag-react)",
  subtitle: "Synchronizing components with external systems — the right mental model for effects",
  concepts: [
    {
      title: "The Correct Mental Model: Synchronization, Not Lifecycle",
      explanations: {
        layman: "useEffect keeps outside things in sync with your component. Think of it like auto-saving a document. You don't say 'save at 2pm.' You say 'save whenever the text changes.' useEffect works the same way. You say 'stay connected to this chat room.' When the room changes, React disconnects the old room and connects the new one. You describe WHAT to keep in sync. React handles WHEN.",
        mid: "Stop thinking in lifecycle terms (componentDidMount, componentDidUpdate, componentWillUnmount). Think in sync terms instead. useEffect says: 'keep this external system in sync with these values.' When values change, the cleanup runs first (tear down old sync), then setup runs (start new sync). The dependency array defines WHAT the effect syncs with, not WHEN it runs. [userId] means 'sync with userId.' When userId changes, clean up the old sync, start the new one. Mount is just 'first sync.' Unmount is just 'final cleanup.'",
        senior: "useEffect runs AFTER the browser paints — it never blocks the screen update. React compares each dependency using Object.is(). If any changed (or it's the first render), the effect runs. Important timing detail: React runs ALL cleanups first, then ALL setups — not cleanup-then-setup per effect. This matters when effects interact with shared resources. If you need code to run BEFORE paint (like measuring DOM layout), use useLayoutEffect instead — but it blocks paint, so use it sparingly. Common interview question: 'What's the difference between useEffect and useLayoutEffect?' Answer: useEffect is async (after paint), useLayoutEffect is sync (before paint, blocks rendering)."
      },
      realWorld: "WebSocket connections, DOM event listeners, timers, browser APIs (document.title, localStorage), data fetching based on props. All are 'sync this outside thing with React state' tasks.",
      whenToUse: "Use useEffect to sync with things outside React: browser APIs, third-party libraries, network requests, subscriptions, DOM changes not managed by React.",
      whenNotToUse: "Do NOT use useEffect for: computing values from state (calculate during render or use useMemo), transforming data for display (do it in the render function), handling clicks or form submissions (use event handlers), or syncing state with props (often means you have unnecessary state).",
      pitfalls: "Thinking in 'mount/unmount' leads to missing dependencies and broken cleanup. Fetching data without handling race conditions shows stale data. Using effects when the work could happen during render. Forgetting that effects run AFTER paint, not before.",
      codeExamples: [
        {
          title: "Synchronization Mental Model",
          code: `// WRONG: thinking in "lifecycle events"
function ChatRoom({ roomId }) {
  useEffect(() => {
    // "on mount, connect"
    const conn = createConnection(roomId);
    conn.connect();
    return () => conn.disconnect();
  }, []); // BAD: missing roomId!
  // If roomId changes, still connected to OLD room
}

// RIGHT: thinking in "synchronization"
function ChatRoom({ roomId }) {
  useEffect(() => {
    // "keep chat in sync with roomId"
    const conn = createConnection(roomId);
    conn.connect();
    return () => conn.disconnect();
  }, [roomId]); // re-syncs when roomId changes

  // When roomId changes from 'general' to 'random':
  // 1. Cleanup: disconnect from 'general'
  // 2. Setup: connect to 'random'
}`
        }
      ]
    },
    {
      title: "Dependency Array Deep Dive",
      explanations: {
        layman: "The dependency array is a watch list. If you write [door, window], the alarm only goes off when the door or window changes. If you write [] (empty), the alarm sets once and never fires again. If you skip the list entirely, the alarm goes off after every little change. Picking the right watch list controls when your effect runs.",
        mid: "The dependency array controls re-runs. React compares each item using Object.is. Three modes: (1) No array: effect runs after every render. Usually a mistake. (2) Empty []: effect runs on mount, cleanup on unmount. Good for one-time setup. (3) [dep1, dep2]: effect runs on mount and when any dep changes. Include every value from state/props used inside the effect. The exhaustive-deps ESLint rule catches missing deps. If you read a value inside the effect but leave it out of deps, you get a stale closure bug.",
        senior: "React compares each dependency using Object.is() — which means reference equality for objects. If you put `[{ id: 1 }]` as a dep, the effect re-runs every render because a new object is created each time, even though the content is the same. Same problem with arrays and functions. This is why useCallback and useMemo exist — they keep references stable across renders. The exhaustive-deps lint rule is critical: if you read a value inside the effect but leave it out of deps, you get a stale closure bug where the effect uses an old value. Always include everything the effect reads from state or props."
      },
      realWorld: "A search component with useEffect([query]): fetches results when query changes. An analytics tracker with useEffect([page]): fires pageview when page changes. A WebSocket with useEffect([url]): reconnects when URL changes.",
      whenToUse: "Always specify the dependency array. Empty array for one-time setup. Specific deps for reactive sync. Skipping the array should be very rare.",
      whenNotToUse: "Don't use the dependency array to conditionally run effects. If you need conditional logic, use early returns inside the effect body or split into separate effects.",
      pitfalls: "Leaving out a dep to stop re-runs creates stale closure bugs. Putting objects or functions directly in deps causes the effect to run every render. Treat the exhaustive-deps rule as an error, not a warning. Effects are cheap to run; the real cost is what happens inside them.",
      codeExamples: [
        {
          title: "Three Dependency Patterns",
          code: `function App({ userId, theme }) {
  const [data, setData] = useState(null);

  // Pattern 1: specific deps -- re-syncs when userId changes
  useEffect(() => {
    let cancelled = false;
    fetchUser(userId).then(result => {
      if (!cancelled) setData(result);
    });
    return () => { cancelled = true; };
  }, [userId]);

  // Pattern 2: empty deps -- runs once on mount
  useEffect(() => {
    const onResize = () => console.log(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Pattern 3: no deps -- runs after every render (usually wrong)
  useEffect(() => {
    document.title = theme + ' | ' + (data?.name ?? 'Loading');
  });

  return <div>{data?.name}</div>;
}`
        },
        {
          title: "Unstable Dependencies Trap",
          code: `function Search({ query }) {
  const [results, setResults] = useState([]);

  // BUG: options is a new object every render
  const options = { query, limit: 10 };
  useEffect(() => {
    fetchResults(options).then(setResults);
  }, [options]);
  // Runs EVERY render because {} !== {} (different references)

  // FIX 1: use simple values as deps
  useEffect(() => {
    fetchResults({ query, limit: 10 }).then(setResults);
  }, [query]); // only re-runs when query string changes

  // FIX 2: useMemo for complex objects
  const stableOptions = useMemo(
    () => ({ query, limit: 10 }),
    [query]
  );
  useEffect(() => {
    fetchResults(stableOptions).then(setResults);
  }, [stableOptions]);

  return <ul>{results.map(r => <li key={r.id}>{r.title}</li>)}</ul>;
}`
        }
      ]
    },
    {
      title: "Cleanup Functions — When and Why",
      explanations: {
        layman: "If you turn on a faucet, you need to know how to turn it off. The cleanup function is your 'turn it off' step. React calls it before starting a new effect (turn off old faucet before opening a new one) and when the component leaves the screen (turn off everything when leaving the house).",
        mid: "The cleanup function runs in two cases: (1) Before re-running the effect when deps change -- it tears down the old sync before starting the new one. (2) On unmount -- final teardown. The cleanup closes over values from the render that created it, not the current render. This is on purpose: it cleans up the PREVIOUS effect. Common cleanup tasks: clearInterval/clearTimeout, removeEventListener, unsubscribe, AbortController.abort(), WebSocket.close().",
        senior: "The cleanup function captures values from the render that created it — this is intentional. When userId changes from 1 to 2, the cleanup needs to unsubscribe from userId=1, not userId=2. It cleans up the PREVIOUS effect's work. All cleanups across the component tree run before any new setups — this prevents resource conflicts. In React 18 Strict Mode (dev only), React runs mount -> cleanup -> mount to verify your effect cleans up properly. If your effect works but the double-mount breaks something, your cleanup is incomplete. Common cleanup mistakes: not aborting fetch requests (causes 'set state on unmounted component'), not clearing intervals, and not removing event listeners."
      },
      realWorld: "WebSocket connections, event listeners, timers, AbortController for fetch requests. Anything that persists beyond the render needs cleanup.",
      whenToUse: "Whenever your effect creates something that lives on: a subscription, listener, timer, connection, or ongoing request. If it's a one-shot action (like setting document.title), cleanup may not be needed.",
      whenNotToUse: "Don't use cleanup for simple actions that don't leave anything running. Don't use it to 'undo' state changes.",
      pitfalls: "Forgetting cleanup for subscriptions causes memory leaks. Forgetting cleanup for fetch causes race conditions. Not understanding that cleanup captures old values. Putting cleanup in a separate useEffect instead of returning it from the effect that created the resource.",
      codeExamples: [
        {
          title: "Cleanup Timing and Closure Values",
          code: `function Logger({ userId }) {
  useEffect(() => {
    console.log('Subscribe to', userId);
    const handler = (event) => {
      console.log('Event for', userId, event);
    };
    eventBus.subscribe(userId, handler);

    return () => {
      // cleanup uses userId from THIS render, not the next one
      console.log('Unsubscribe from', userId);
      eventBus.unsubscribe(userId, handler);
    };
  }, [userId]);

  // When userId changes from 'alice' to 'bob':
  // 1. "Unsubscribe from alice" (old value)
  // 2. "Subscribe to bob" (new value)

  return <div>Logged in as: {userId}</div>;
}`
        },
        {
          title: "AbortController for Fetch Cleanup",
          code: `function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadUser() {
      try {
        setUser(null);
        setError(null);
        const res = await fetch('/api/users/' + userId, {
          signal: controller.signal
        });
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setUser(data);
      } catch (err) {
        // AbortError is normal during cleanup -- ignore it
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      }
    }

    loadUser();

    return () => {
      // Cancel the request when userId changes or component unmounts
      controller.abort();
    };
  }, [userId]);

  // Without cleanup: old fetch could finish after new fetch,
  // showing wrong user data briefly.
  // With AbortController: old fetch gets cancelled, only latest shows.

  if (error) return <p>Error: {error}</p>;
  if (!user) return <p>Loading...</p>;
  return <p>{user.name}</p>;
}`
        }
      ]
    },
    {
      title: "useEffect vs useLayoutEffect",
      explanations: {
        layman: "Imagine rearranging a room. useEffect rearranges AFTER guests see the room -- they might see things moving around. useLayoutEffect rearranges BEFORE opening the door -- guests see the final layout right away. useLayoutEffect blocks the door (screen paint) until you're done.",
        mid: "useEffect runs async AFTER the browser paints. useLayoutEffect runs sync AFTER DOM changes but BEFORE the browser paints. The difference is visual: useLayoutEffect changes appear in the same frame, while useEffect changes appear in the next frame (causing flicker). Use useLayoutEffect when you need to: read DOM layout (getBoundingClientRect) and apply fixes that must show on the first frame. Use useEffect for everything else -- it's the default.",
        senior: "The timing difference matters for one specific use case: measuring DOM and applying corrections before the user sees the screen. For example, measuring a tooltip's size to position it correctly. With useEffect, the user would briefly see the tooltip in the wrong spot (flicker). With useLayoutEffect, the measurement and correction happen before paint — no flicker. But useLayoutEffect blocks the paint, so keep it fast. If you call setState inside useLayoutEffect, React processes that update synchronously before painting — the user never sees the intermediate state. Warning: useLayoutEffect doesn't work in SSR because there's no DOM to measure — use useEffect with a mounted check for SSR-safe code."
      },
      realWorld: "Tooltip positioning (measure element, set position before paint). Animation libraries reading DOM positions. Auto-focusing inputs while measuring position. Scroll position sync after DOM changes.",
      whenToUse: "Only when you need to read DOM measurements and write back before the user sees anything. Tooltip positioning, preventing visual flicker, syncing with non-React DOM libraries.",
      whenNotToUse: "For data fetching, subscriptions, timers, logging, or anything that doesn't need to block the paint. useEffect is the default. useLayoutEffect is the exception.",
      pitfalls: "Using useLayoutEffect everywhere 'to be safe' blocks painting and hurts performance. It warns during SSR. Long code in useLayoutEffect causes visible frame drops.",
      codeExamples: [
        {
          title: "Preventing Visual Flicker with useLayoutEffect",
          code: `import { useState, useRef, useLayoutEffect, useEffect } from 'react';

// BAD: useEffect causes flicker
function FlickyTooltip({ targetRef, children }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    // Runs AFTER paint -- user sees tooltip at (0,0) first!
    const rect = targetRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 8, left: rect.left });
  }, [targetRef]);

  return (
    <div style={{ position: 'fixed', top: pos.top, left: pos.left }}>
      {children}
    </div>
  );
}

// GOOD: useLayoutEffect prevents flicker
function SmoothTooltip({ targetRef, children }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const tipRef = useRef(null);

  useLayoutEffect(() => {
    // Runs BEFORE paint -- position is correct on first frame
    const rect = targetRef.current.getBoundingClientRect();
    const tipRect = tipRef.current.getBoundingClientRect();

    const fitsBelow = rect.bottom + 8 + tipRect.height < window.innerHeight;
    setPos({
      top: fitsBelow ? rect.bottom + 8 : rect.top - tipRect.height - 8,
      left: rect.left
    });
  }, [targetRef]);
  // setState inside useLayoutEffect triggers a sync re-render
  // BEFORE paint. No flicker.

  return (
    <div ref={tipRef} style={{ position: 'fixed', top: pos.top, left: pos.left }}>
      {children}
    </div>
  );
}`
        }
      ]
    },
    {
      title: "Race Conditions and Strict Mode Double-Invocation",
      explanations: {
        layman: "Imagine ordering food from two places at once, but you only want one meal. If both arrive, you eat whichever came last -- but it might be the wrong one! Race conditions are like this: when you switch pages fast, old data might arrive after new data, showing the wrong thing. The fix: cancel the old order when you place a new one. Strict Mode is like a fire drill -- React pretends to remove and re-add your component to make sure cleanup works. If it breaks during the drill, it would break in real use too.",
        mid: "Race conditions happen when an old async operation finishes after a newer one started. Example: user types 'abc', each keystroke fetches. If the fetch for 'ab' returns after 'abc', stale data shows. Two fixes: (1) Boolean flag: set cancelled = true in cleanup, check before setState. (2) AbortController: pass signal to fetch, abort in cleanup. AbortController is better because it actually stops the network request. Strict Mode runs mount -> cleanup -> mount in development. This catches: duplicate subscriptions (no cleanup), double fetches (no cancellation), and effects that assume they run once.",
        senior: "The race condition exists because effects are async and React doesn't await them. When userId changes from 1 to 2, both fetches are in flight. Without cancellation, the userId=1 response could arrive after userId=2's response, overwriting good data with stale data. AbortController.abort() rejects the fetch with AbortError. The boolean flag is weaker -- the request still completes, you just ignore the result. For production, React recommends framework data fetching (Remix loaders, Next.js) or cache libraries (react-query, SWR) over useEffect for data fetching. Strict Mode's mount-cleanup-mount cycle catches non-idempotent setups, accumulated state (listener added twice), and effects that don't restore external state."
      },
      realWorld: "Any data fetching in useEffect can have race conditions. Type-ahead search, pagination, navigating between profiles -- all need race condition handling. Strict Mode catches bugs before production.",
      whenToUse: "Always handle race conditions when doing async work in useEffect. Always test with Strict Mode on. Use AbortController for fetch requests.",
      whenNotToUse: "If you use a data fetching library (react-query, SWR, RTK Query), they handle race conditions for you. Framework-level fetching (Next.js, Remix) also handles this.",
      pitfalls: "Not checking for AbortError in catch blocks sets error state incorrectly. Not cancelling in cleanup is the most common fetch bug. Disabling Strict Mode to 'fix' double-run bugs instead of fixing cleanup. Using async directly as useEffect callback -- it returns a Promise which React treats as a cleanup function.",
      codeExamples: [
        {
          title: "Race Condition Patterns",
          code: `// Pattern 1: Boolean cancel flag
function Search({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function doSearch() {
      const data = await fetchResults(query);
      if (!cancelled) setResults(data); // skip if outdated
    }
    doSearch();

    return () => { cancelled = true; }; // mark old effect as stale
  }, [query]);

  return <ul>{results.map(r => <li key={r.id}>{r.name}</li>)}</ul>;
}

// Pattern 2: AbortController (preferred)
function Search({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    async function doSearch() {
      try {
        const res = await fetch(
          '/api/search?q=' + encodeURIComponent(query),
          { signal: controller.signal }
        );
        const data = await res.json();
        setResults(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Search failed:', err);
        }
      }
    }
    doSearch();

    return () => controller.abort(); // actually cancels the request
  }, [query]);

  return <ul>{results.map(r => <li key={r.id}>{r.name}</li>)}</ul>;
}

// When query goes from "re" -> "rea" -> "react":
// Each change cancels the previous fetch.
// Only the "react" fetch completes. No stale data.`
        },
        {
          title: "Strict Mode Double-Invocation Test",
          code: `// BUG: no cleanup -- Strict Mode catches it
function BuggyChat({ roomId }) {
  useEffect(() => {
    const conn = createConnection(roomId);
    conn.connect();
    // No cleanup! Leaks connections
  }, [roomId]);
  // Strict Mode: connect -> (no cleanup) -> connect again
  // Result: TWO connections! Bug found.

  return <div>Chat: {roomId}</div>;
}

// FIXED: cleanup disconnects properly
function FixedChat({ roomId }) {
  useEffect(() => {
    const conn = createConnection(roomId);
    conn.connect();
    return () => conn.disconnect(); // cleanup!
  }, [roomId]);
  // Strict Mode: connect -> disconnect -> connect
  // Result: ONE connection. Correct!

  return <div>Chat: {roomId}</div>;
}`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "What is the correct mental model for useEffect? How is it different from lifecycle methods?",
      answer: "Think synchronization, not lifecycle. Don't think 'run on mount, run on update, clean up on unmount.' Think: 'keep this external thing in sync with these values.' You tell useEffect WHAT to sync and WITH WHAT (the dependency array). React decides WHEN. Mount is just 'the first sync.' Unmount is 'the final cleanup.' An update is 're-sync because a dep changed.' This matters because lifecycle thinking leads to empty dependency arrays and broken effects. Sync thinking leads to correct deps and proper cleanup. Example: an effect syncing a chat connection with [roomId] automatically disconnects from the old room and connects to the new room when roomId changes.",
      difficulty: "easy",
      followUps: [
        "What problems arise from thinking about useEffect as componentDidMount?",
        "Can a single useEffect replace all three class lifecycle methods?"
      ]
    },
    {
      question: "Explain the three modes of the useEffect dependency array and when to use each.",
      answer: "Three modes: (1) [dep1, dep2] -- 're-sync when these change.' Most common and correct. List every value from state/props used in the effect. React compares with Object.is(). (2) [] -- 'sync once on mount, clean up on unmount.' Use for one-time setup like analytics init or global listeners. (3) No array -- 're-sync after every render.' Rarely correct, usually a bug. Key gotcha: Object.is() compares objects by reference. So { name: 'Alice' } !== { name: 'Alice' } across renders. Passing an object as a dep makes the effect run every render. Fix: use simple values as deps, or stabilize references with useMemo.",
      difficulty: "easy",
      followUps: [
        "What happens if you put an object literal in the dependency array?",
        "Is there ever a valid reason to omit the dependency array entirely?"
      ]
    },
    {
      question: "When does the useEffect cleanup function run and what values does it close over?",
      answer: "Cleanup runs in two cases: (1) before re-running the effect when deps change, and (2) when the component unmounts. The cleanup closes over values from the render that created it, not the current render. This is by design. When userId goes from 'alice' to 'bob': cleanup runs with userId='alice' (unsubscribes from alice), then setup runs with userId='bob' (subscribes to bob). If cleanup used current values, it would try to unsubscribe from 'bob' instead of 'alice' -- wrong! Internally, React runs all cleanups first, then all setups. This two-pass approach prevents race conditions between cleanup and setup across components.",
      difficulty: "mid",
      followUps: [
        "Why is it important that cleanup closes over old values instead of current values?",
        "What is the order of cleanup and setup across parent and child components?"
      ]
    },
    {
      question: "What is the difference between useEffect and useLayoutEffect? When would you use each?",
      answer: "Same API, different timing. useEffect runs async AFTER the browser paints -- the user sees the screen before the effect runs. useLayoutEffect runs sync AFTER DOM changes but BEFORE the browser paints -- it blocks the paint until done. Use useEffect (default) for: data fetching, subscriptions, logging, timers. Use useLayoutEffect when you need to: measure DOM layout (getBoundingClientRect) and fix it before the user sees it. Classic example: tooltip positioning. With useEffect, the tooltip appears at (0,0) then jumps to the right spot (flicker). With useLayoutEffect, the tooltip appears in the right spot on the first frame (no flicker). Downsides of useLayoutEffect: blocks painting (hurts performance), warns during SSR (no DOM on server).",
      difficulty: "mid",
      followUps: [
        "What happens if you setState inside useLayoutEffect?",
        "Why does useLayoutEffect cause a warning during server-side rendering?"
      ]
    },
    {
      question: "How do you handle race conditions in useEffect when fetching data? Explain multiple approaches.",
      answer: "Race conditions happen when fast changes (like rapid typing) cause old responses to arrive after newer ones. Two solutions: (1) Boolean flag: set 'let ignore = false' in the effect. In cleanup, set 'ignore = true'. Check before setState. The old request still finishes but you ignore its result. (2) AbortController: create a controller, pass signal to fetch, call abort() in cleanup. This actually cancels the HTTP request. AbortController is better because it saves bandwidth too. For production, a third option is using libraries like react-query or SWR, which handle race conditions, caching, and retries automatically. The core issue is that useEffect is 'fire and forget' -- you have to add cancellation yourself through cleanup.",
      difficulty: "mid",
      followUps: [
        "How does AbortController differ from the boolean flag approach under the hood?",
        "Why does React recommend against fetching data directly in useEffect?"
      ]
    },
    {
      question: "Why does React's Strict Mode run effects twice? How should you write effects that survive double-invocation?",
      answer: "Strict Mode runs mount -> cleanup -> mount in development to find bugs. It catches: effects without cleanup (subscriptions get duplicated), effects that assume they run once (counters, one-time calls), and effects with side effects that don't get reversed. A correct effect is one where setup + cleanup + setup gives the same result as a single setup. This means: subscriptions must be unsubscribed in cleanup, listeners must be removed, timers must be cleared. For truly one-time effects (like analytics), use a ref: 'const sent = useRef(false); if (!sent.current) { sent.current = true; sendEvent(); }'. But most effects shouldn't need this -- if you need a ref guard, the code might not belong in useEffect. Strict Mode only runs in development, not production.",
      difficulty: "hard",
      followUps: [
        "Does Strict Mode double-invocation happen in production?",
        "How would you handle a one-time analytics event in Strict Mode?"
      ]
    },
    {
      question: "What are common dependency array mistakes and how does the exhaustive-deps rule help?",
      answer: "Most common mistake: leaving out a dep to prevent re-runs. This causes stale closures -- the effect reads an old value. Example: setInterval with setCount(count + 1) and []: count is always 0 inside the closure. Fix: use functional update setCount(prev => prev + 1) which doesn't need count in deps. Another mistake: putting objects or functions in deps -- they're new references each render, so the effect runs every time. Fix with useMemo/useCallback or use simple values. The exhaustive-deps ESLint rule checks your deps and flags missing ones. Treat it as an error. When it flags something, don't suppress it -- restructure. Common fixes: move functions inside the effect, wrap with useCallback, use a ref for values you want to read but not react to, or split into smaller effects.",
      difficulty: "mid",
      followUps: [
        "When is it acceptable to suppress the exhaustive-deps warning?",
        "How can you restructure an effect that has too many dependencies?"
      ]
    },
    {
      question: "How would you implement data fetching correctly with useEffect, handling loading, error, race conditions, and cleanup?",
      answer: "You need four things: (1) Loading/error states: track them, reset when starting a new fetch. (2) AbortController: create in the effect, pass signal to fetch, abort in cleanup. (3) Error handling: catch network errors but ignore AbortError (that's expected during cleanup). (4) Stale response check: add an ignore flag as a backup. The pattern: put the resource ID in deps. Inside: create AbortController, define async function, call it. Return cleanup that aborts. The async function sets loading=true, try/catch the fetch, sets data on success, sets error on failure (skip AbortError). For production, this is repetitive. Libraries like react-query add caching, retries, background refetch, and deduplication. Modern React prefers framework-level fetching (Suspense, Server Components) or dedicated libraries over useEffect fetching.",
      difficulty: "hard",
      followUps: [
        "Why does the React team recommend against fetching in useEffect for production apps?",
        "How would you implement the same pattern with Suspense instead?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Build a useDebounce Hook",
      difficulty: "easy",
      description: "Implement a useDebounce(value, delay) hook that returns a debounced version of the value. The debounced value should only update after the specified delay has passed since the last change. Use proper cleanup to prevent stale timers.",
      solution: `import { useState, useEffect } from 'react';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    // Wait before updating the debounced value
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delay);

    // If value changes again, cancel the old timer
    return () => clearTimeout(timer);
  }, [value, delay]);
  // Rapid changes: each new value cancels the previous timer.
  // Only the last value survives after the delay.

  return debounced;
}

// Usage: search with debounced API calls
function SearchPage() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState([]);

  // Only fetches when typing stops for 300ms
  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    const controller = new AbortController();

    fetch('/api/search?q=' + encodeURIComponent(debouncedQuery), {
      signal: controller.signal
    })
      .then(res => res.json())
      .then(data => setResults(data))
      .catch(err => {
        if (err.name !== 'AbortError') console.error(err);
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <ul>
        {results.map(r => <li key={r.id}>{r.name}</li>)}
      </ul>
    </div>
  );
}

export { useDebounce };`,
      explanation: "Shows useEffect cleanup for timer management. Each value change clears the old timer and starts a new one. Only when the value stays the same for the full delay does the timer fire. The search example adds AbortController on top for fetch cancellation. useDebounce handles timing, the search effect handles fetching -- clean separation."
    },
    {
      title: "Implement a useEventListener Hook with Proper Cleanup",
      difficulty: "mid",
      description: "Create a useEventListener(eventName, handler, element) hook that correctly attaches and cleans up event listeners. Handle the common pitfall of handler identity changing on every render without re-adding the listener.",
      solution: `import { useEffect, useRef } from 'react';

function useEventListener(eventName, handler, element = window) {
  // Store latest handler in a ref so we don't re-subscribe
  // when the handler function changes (which is every render
  // for inline functions)
  const savedHandler = useRef(handler);

  // Keep the ref up to date
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const target = element?.current || element;
    if (!target?.addEventListener) return;

    // This wrapper always calls the latest handler
    const listener = (event) => {
      savedHandler.current(event);
    };

    target.addEventListener(eventName, listener);

    return () => {
      target.removeEventListener(eventName, listener);
    };
  }, [eventName, element]);
  // Only re-subscribes when eventName or element changes.
  // Handler changes are handled by the ref -- no re-subscription.
}

// Usage:

function MouseTracker() {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  // This handler is new every render, but the hook handles it
  useEventListener('mousemove', (e) => {
    setPos({ x: e.clientX, y: e.clientY });
  });

  return <p>Mouse: {pos.x}, {pos.y}</p>;
}

function ClickOutside({ onClose, children }) {
  const ref = useRef(null);

  useEventListener('mousedown', (e) => {
    if (ref.current && !ref.current.contains(e.target)) {
      onClose();
    }
  });

  return <div ref={ref}>{children}</div>;
}

function KeyboardShortcuts() {
  useEventListener('keydown', (e) => {
    if (e.key === 'Escape') console.log('Escape pressed');
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      console.log('Save shortcut');
    }
  });

  return <div>Press Escape or Ctrl+S</div>;
}

export { useEventListener };`,
      explanation: "The key pattern: use a ref to store the latest handler while keeping the actual DOM listener stable. Without the ref, inline functions (new every render) would cause the effect to remove and re-add the listener on every render -- wasteful and could miss events. The ref separates 'what to call' (changes often) from 'the listener lifecycle' (changes rarely)."
    },
    {
      title: "Fix All Bugs in this useEffect Component",
      difficulty: "mid",
      description: "The following component has multiple useEffect bugs. Find and fix all of them: missing cleanup, race condition, stale closure, wrong dependency array, and useEffect vs useLayoutEffect misuse.",
      solution: `import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';

// ===== BUGGY VERSION =====
function BuggyDashboard({ userId }) {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [tipPos, setTipPos] = useState({ x: 0, y: 0 });
  const tipRef = useRef(null);

  // BUG 1: Race condition -- no cleanup, stale fetch can set wrong user
  useEffect(() => {
    fetch('/api/users/' + userId)
      .then(res => res.json())
      .then(data => setUser(data));
  }, [userId]);

  // BUG 2: Missing cleanup -- WebSocket leaks when userId changes
  useEffect(() => {
    const ws = new WebSocket('wss://api.example.com/notifications/' + userId);
    ws.onmessage = (event) => {
      setNotifications(prev => [...prev, JSON.parse(event.data)]);
    };
  }, [userId]);

  // BUG 3: Stale closure -- notifications.length is always 0
  useEffect(() => {
    const id = setInterval(() => {
      console.log('Count:', notifications.length);
    }, 5000);
    return () => clearInterval(id);
  }, []); // missing dep (or should use ref)

  // BUG 4: Should be useLayoutEffect -- tooltip flickers
  useEffect(() => {
    if (tipRef.current) {
      const rect = tipRef.current.getBoundingClientRect();
      setTipPos({ x: rect.left, y: rect.bottom + 8 });
    }
  }, [user]);

  return (
    <div>
      {user && <div ref={tipRef}>{user.name}</div>}
      <div style={{ position: 'fixed', left: tipPos.x, top: tipPos.y }}>
        Tooltip
      </div>
      <ul>
        {notifications.map((n, i) => <li key={i}>{n.message}</li>)}
      </ul>
    </div>
  );
}

// ===== FIXED VERSION =====
function FixedDashboard({ userId }) {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [tipPos, setTipPos] = useState({ x: 0, y: 0 });
  const tipRef = useRef(null);

  // Ref to read latest notifications without adding to deps
  const notificationsRef = useRef(notifications);
  notificationsRef.current = notifications;

  // FIX 1: AbortController prevents race condition
  useEffect(() => {
    const controller = new AbortController();
    setUser(null);

    fetch('/api/users/' + userId, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error('Fetch failed');
        return res.json();
      })
      .then(data => setUser(data))
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Failed to fetch user:', err);
        }
      });

    return () => controller.abort();
  }, [userId]);

  // FIX 2: Cleanup closes the WebSocket
  useEffect(() => {
    const ws = new WebSocket('wss://api.example.com/notifications/' + userId);

    ws.onmessage = (event) => {
      setNotifications(prev => [...prev, JSON.parse(event.data)]);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => ws.close(); // close on cleanup
  }, [userId]);

  // FIX 3: Use ref to read latest value without dep
  useEffect(() => {
    const id = setInterval(() => {
      console.log('Count:', notificationsRef.current.length);
    }, 5000);
    return () => clearInterval(id);
  }, []); // empty deps is correct now -- reads from ref

  // FIX 4: useLayoutEffect prevents tooltip flicker
  useLayoutEffect(() => {
    if (tipRef.current) {
      const rect = tipRef.current.getBoundingClientRect();
      setTipPos({ x: rect.left, y: rect.bottom + 8 });
    }
  }, [user]);

  // Clear notifications when user changes
  useEffect(() => {
    setNotifications([]);
  }, [userId]);

  return (
    <div>
      {user && <div ref={tipRef}>{user.name}</div>}
      <div style={{ position: 'fixed', left: tipPos.x, top: tipPos.y }}>
        Tooltip
      </div>
      <ul>
        {notifications.map((n, i) => <li key={n.id || i}>{n.message}</li>)}
      </ul>
    </div>
  );
}

export default FixedDashboard;`,
      explanation: "Four bugs fixed: (1) Race condition: AbortController cancels old fetches so stale data can't arrive. (2) WebSocket leak: ws.close() in cleanup prevents old connections from piling up. (3) Stale closure: ref pattern lets the interval read the latest notifications without needing it as a dep (which would reset the interval constantly). (4) Tooltip flicker: useLayoutEffect measures and positions before paint, so the tooltip appears in the right spot on the first frame."
    },
    {
      title: "Build a useFetch Hook with Full Error Handling",
      difficulty: "mid",
      description: "Create a custom useFetch(url, options) hook that returns { data, loading, error, refetch }. Handle race conditions, loading states, error states, AbortController cleanup, and provide a manual refetch function.",
      solution: `import { useState, useEffect, useCallback, useRef } from 'react';

function useFetch(url, options = {}) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  // Track which fetch is latest to prevent race conditions
  const fetchIdRef = useRef(0);

  // Store options in ref to avoid re-fetching when reference changes
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const fetchData = useCallback(async (signal) => {
    const fetchId = ++fetchIdRef.current;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const res = await fetch(url, {
        ...optionsRef.current,
        signal,
      });

      if (!res.ok) {
        throw new Error(res.status + ' ' + res.statusText);
      }

      const data = await res.json();

      // Only update if this is still the latest request
      if (fetchId === fetchIdRef.current) {
        setState({ data, loading: false, error: null });
      }
    } catch (err) {
      if (err.name === 'AbortError') return; // expected on cleanup

      if (fetchId === fetchIdRef.current) {
        setState({ data: null, loading: false, error: err.message });
      }
    }
  }, [url]);

  // Fetch on mount and when URL changes
  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  // Manual refetch
  const refetch = useCallback(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  return { ...state, refetch };
}

// Usage:
function UserProfile({ userId }) {
  const { data: user, loading, error, refetch } = useFetch(
    '/api/users/' + userId
  );

  if (loading) return <div>Loading...</div>;
  if (error) return (
    <div>
      <p>Error: {error}</p>
      <button onClick={refetch}>Retry</button>
    </div>
  );

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}

// Advanced usage with POST:
function CreatePost() {
  const [title, setTitle] = useState('');
  const { data, loading, error, refetch: submit } = useFetch(
    '/api/posts',
    { method: 'POST', body: JSON.stringify({ title }) }
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <input value={title} onChange={e => setTitle(e.target.value)} />
      <button disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>
      {error && <p>Error: {error}</p>}
      {data && <p>Created: {data.id}</p>}
    </form>
  );
}

export { useFetch };`,
      explanation: "Shows production-quality useEffect patterns. Race conditions handled with AbortController (cancels requests) plus a fetch ID counter (backup check). Options stored in a ref to prevent re-fetching on reference changes. The refetch function is stable via useCallback. This is the foundation that libraries like react-query build on, adding caching, retries, and background updates."
    },
    {
      title: "Implement useWindowSize with Throttled Updates",
      difficulty: "easy",
      description: "Create a useWindowSize() hook that returns { width, height } of the browser window. Throttle the resize updates to prevent excessive re-renders during rapid resizing. Properly clean up the event listener.",
      solution: `import { useState, useEffect } from 'react';

function useWindowSize(throttleMs = 100) {
  const [size, setSize] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  }));

  useEffect(() => {
    let timerId = null;
    let lastRun = 0;

    const handleResize = () => {
      const now = Date.now();
      const elapsed = now - lastRun;

      if (elapsed >= throttleMs) {
        // Enough time passed -- update now
        lastRun = now;
        setSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      } else {
        // Too soon -- schedule for later
        clearTimeout(timerId);
        timerId = setTimeout(() => {
          lastRun = Date.now();
          setSize({
            width: window.innerWidth,
            height: window.innerHeight,
          });
        }, throttleMs - elapsed);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timerId); // clean up pending timer too
    };
  }, [throttleMs]);

  return size;
}

// Usage:
function ResponsiveLayout() {
  const { width, height } = useWindowSize(150);

  const layout = width > 1024 ? 'desktop' : width > 768 ? 'tablet' : 'mobile';

  return (
    <div>
      <p>Window: {width} x {height}</p>
      <p>Layout: {layout}</p>
      {layout === 'mobile' && <MobileNav />}
      {layout !== 'mobile' && <DesktopNav />}
    </div>
  );
}

function MobileNav() { return <nav>Mobile Navigation</nav>; }
function DesktopNav() { return <nav>Desktop Navigation</nav>; }

export { useWindowSize };`,
      explanation: "Shows key useEffect practices: lazy init for SSR safety (check typeof window), proper event listener cleanup, timer cleanup in the return function, and throttling to limit re-renders. The throttle updates immediately if enough time passed, otherwise schedules a trailing update. Both the listener and any pending timer are cleaned up on unmount."
    }
  ],
  quiz: [
    {
      question: "When does a useEffect cleanup function run?",
      options: [
        "Only when the component unmounts",
        "Before every re-render of the component",
        "Before the effect re-runs (when deps change) AND when the component unmounts",
        "After the new effect runs, to clean up the new setup"
      ],
      correct: 2,
      explanation: "Cleanup runs in two cases: (1) before the effect re-runs when deps change (cleans up the old sync), and (2) when the component unmounts (final teardown). It always cleans up the PREVIOUS effect, using values from the render that created it."
    },
    {
      question: "What is the key difference between useEffect and useLayoutEffect?",
      options: [
        "useLayoutEffect can access refs while useEffect cannot",
        "useEffect runs after the browser paints; useLayoutEffect runs before the browser paints",
        "useLayoutEffect only runs on mount while useEffect runs on every update",
        "useEffect is synchronous while useLayoutEffect is asynchronous"
      ],
      correct: 1,
      explanation: "useEffect runs async after the browser paints. useLayoutEffect runs sync after DOM changes but before the browser paints. This makes useLayoutEffect good for DOM measurements that must be applied before the user sees anything (no flicker), but it blocks painting."
    },
    {
      question: "What happens if you pass an async function directly to useEffect?\n\nuseEffect(async () => {\n  const data = await fetchData();\n  setData(data);\n}, []);",
      options: [
        "It works correctly — useEffect supports async functions",
        "React throws an error at runtime",
        "The async function returns a Promise, which React tries to use as the cleanup function, causing a warning",
        "The effect never runs because async functions are not allowed"
      ],
      correct: 2,
      explanation: "An async function returns a Promise. useEffect expects either nothing or a cleanup function. A Promise is not a valid cleanup function, so React logs a warning. Fix: define the async function inside the effect and call it: useEffect(() => { async function load() { ... } load(); }, []);"
    },
    {
      question: "Why does React's Strict Mode run effects twice in development?",
      options: [
        "To improve performance by caching the effect result",
        "To catch bugs in effects that don't properly clean up — the mount-unmount-mount cycle tests cleanup correctness",
        "It's a known bug in React that will be fixed in a future version",
        "To pre-warm the browser's rendering pipeline"
      ],
      correct: 1,
      explanation: "Strict Mode runs mount -> cleanup -> mount to check that your effects clean up properly. If cleanup is missing, you'll see duplicate listeners, connections, or side effects. This catches bugs early. It only happens in development, not production."
    },
    {
      question: "What is the race condition problem in useEffect data fetching, and what is the best way to handle it?",
      options: [
        "Using useState with a loading flag to prevent multiple fetches",
        "Using useRef to store the previous fetch result",
        "Using AbortController to cancel in-flight requests in the cleanup function",
        "Using React.memo to prevent the component from re-rendering during a fetch"
      ],
      correct: 2,
      explanation: "Race conditions happen when fast changes trigger multiple fetches, and an old response arrives after a newer one, showing wrong data. AbortController cancels the old request via controller.abort() in cleanup, so only the latest fetch completes. Better than a boolean flag because it actually cancels the network request and saves bandwidth."
    },
    {
      question: "Which of the following is NOT a valid use case for useEffect?",
      options: [
        "Subscribing to a WebSocket connection",
        "Computing a filtered list from state and storing it in another state variable",
        "Setting up a resize event listener on window",
        "Fetching data when a prop changes"
      ],
      correct: 1,
      explanation: "Computing derived data and storing it in state via useEffect is an anti-pattern. It causes an extra render: first with stale data, then the effect updates state, causing a second render. Instead, compute it during render: const filtered = items.filter(i => i.active), or use useMemo for expensive work."
    }
  ]
};
