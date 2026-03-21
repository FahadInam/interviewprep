export const customHooks = {
  id: "custom-hooks",
  title: "Custom Hooks",
  icon: "🪝",
  tag: "React Hooks",
  tagColor: "var(--tag-react)",
  subtitle: "Extract, compose, and test reusable stateful logic with custom hooks",
  concepts: [
    {
      title: "Rules of Hooks — Why They Exist",
      explanations: {
        layman: "Hooks must always be called in the same order every time your component runs. Think of it like a checklist: React goes down the list asking 'Hook #1? Hook #2? Hook #3?' If you skip one with an if-statement, all the hooks after it get mixed up. Two simple rules: (1) Never put hooks inside if-statements, loops, or nested functions. (2) Only use hooks inside React components or other custom hooks.",
        mid: "Two strict rules: (1) Only call hooks at the top level — never inside conditions, loops, or nested functions. (2) Only call hooks from React components or custom hooks. React stores hooks as a list, tracked by position. On each render, it walks the list in order. If the order changes (like skipping a hook inside an if-block), React gives the wrong state to the wrong hook. Use eslint-plugin-react-hooks to catch these mistakes automatically.",
        senior: "React stores hooks as a linked list on the fiber node (memoizedState). Each hook call adds a node via hook.next. On re-renders, React walks this list in order using nextCurrentHook = currentHook.next. If the call order changes, the pointer lands on the wrong node — a useState might read a useEffect's data, causing type errors or silent bugs. React chose call-order tracking over key-based lookup for simplicity and performance. The React Compiler may eventually relax some of these rules by generating correct code at build time."
      },
      realWorld: "A developer puts useEffect after an early return. React's Strict Mode catches the hook count mismatch and throws: 'Rendered more hooks than during the previous render.' This finds the bug before it causes silent problems in production.",
      whenToUse: "Always follow these rules. Use eslint-plugin-react-hooks with exhaustive-deps. Call all hooks at the top of your component. Put conditions inside the hook callbacks instead.",
      whenNotToUse: "There are no exceptions. If you think you need a conditional hook, put the condition inside the hook's callback, use a separate component, or pass a disabled flag.",
      pitfalls: "Calling hooks after early returns. Calling hooks inside loops with changing sizes. Calling hooks inside try-catch where they might be skipped. Calling hooks in regular functions that are not components or custom hooks.",
      codeExamples: [
        {
          title: "Common Rule Violations and Fixes",
          code: `// BAD: hook after early return
function Profile({ userId }) {
  if (!userId) return <p>No user</p>;
  // This hook is skipped when userId is empty!
  const [user, setUser] = useState(null);
  useEffect(() => { fetchUser(userId).then(setUser); }, [userId]);
  return <p>{user?.name}</p>;
}

// GOOD: hooks first, condition inside
function Profile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!userId) return; // condition INSIDE the hook
    fetchUser(userId).then(setUser);
  }, [userId]);

  if (!userId) return <p>No user</p>;
  return <p>{user?.name}</p>;
}

// BAD: hook inside a loop
function MultiInput({ fields }) {
  const values = fields.map(f => useState(f.default)); // hook count changes!
}

// GOOD: move hook into its own component
function MultiInput({ fields }) {
  return fields.map(f => <FieldInput key={f.id} field={f} />);
}
function FieldInput({ field }) {
  const [value, setValue] = useState(field.default); // one hook per component
  return <input value={value} onChange={e => setValue(e.target.value)} />;
}`
        }
      ]
    },
    {
      title: "Extracting Logic into Custom Hooks",
      explanations: {
        layman: "If you keep writing the same code in many components — like fetching data, tracking a value, or listening for events — you can put that code into a reusable function called a custom hook. Each component that uses it gets its own separate copy of the data. Custom hooks share the recipe, not the ingredients.",
        mid: "A custom hook is a function that starts with 'use' and calls other hooks. It lets you pull repeated logic out of components into a reusable function. The key point: each component that calls a custom hook gets its own independent state and effects. Custom hooks share logic, not state. The 'use' prefix tells React and the linter to enforce hook rules on this function.",
        senior: "Custom hooks are a naming convention, not a special React feature. When ComponentA calls useMyHook() which calls useState(), that state is added to ComponentA's fiber, not some shared location. There is no 'hook scope' — hooks inside a custom hook run in the calling component's fiber context. The 'use' prefix matters for two reasons: (1) ESLint only enforces hook rules for 'use' functions, and (2) React's hook dispatcher checks that hooks run inside a valid render context. Custom hooks can nest to any depth — all hooks flatten onto the calling fiber's list."
      },
      realWorld: "A useFormField hook that handles validation, dirty tracking, and error display for form fields. Used across many forms in an app, keeping validation consistent and cutting boilerplate by 70%.",
      whenToUse: "When two or more components share the same state + effect pattern. When a component's hook logic gets complex and deserves a clear name. When you want to test stateful logic separately from the UI.",
      whenNotToUse: "Do not extract a hook if the logic is used once and is simple. Too many tiny hooks hurts readability. Do not use custom hooks to share state between components — use context or state management for that.",
      pitfalls: "Forgetting the 'use' prefix — ESLint will not check hook rules. Thinking custom hooks share state (they do not). Making hooks that do too many things. Not thinking about re-renders — a hook that re-renders often affects every component that uses it.",
      codeExamples: [
        {
          title: "Extracting a useLocalStorage Hook",
          code: `// Custom hook: save and load from localStorage
function useLocalStorage(key, startValue) {
  // Load saved value, or use startValue
  const [value, setValue] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key);
      return saved ? JSON.parse(saved) : startValue;
    } catch {
      return startValue;
    }
  });

  // Update both state and localStorage
  const update = useCallback((newVal) => {
    try {
      const result = newVal instanceof Function ? newVal(value) : newVal;
      setValue(result);
      window.localStorage.setItem(key, JSON.stringify(result));
    } catch (err) {
      console.warn("localStorage error:", err);
    }
  }, [key, value]);

  return [value, update];
}

// Usage — each component gets its own state
function Settings() {
  const [theme, setTheme] = useLocalStorage("theme", "light");
  const [fontSize, setFontSize] = useLocalStorage("fontSize", 14);

  return (
    <div>
      <select value={theme} onChange={e => setTheme(e.target.value)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
      <input
        type="range"
        min={12}
        max={24}
        value={fontSize}
        onChange={e => setFontSize(Number(e.target.value))}
      />
    </div>
  );
}`
        }
      ]
    },
    {
      title: "Essential Custom Hook Patterns",
      explanations: {
        layman: "Think of custom hooks as tools in a toolbox. useFetch grabs data from a server. useDebounce waits until you stop typing before doing something. usePrevious remembers the last value. useOnClickOutside notices when you click outside a box. Each tool does one simple job, but together they can build anything.",
        mid: "Common patterns: useFetch for data loading with loading/error states, useDebounce for waiting after fast input changes, usePrevious for tracking old values, useOnClickOutside for closing dropdowns/modals, useMediaQuery for screen size checks, useToggle for on/off state. Good hooks do one thing, return a small API, and clean up after themselves.",
        senior: "Well-built hooks have a small, stable API. useFetch should handle race conditions (abort old requests when inputs change), cache results, and handle unmounting (AbortController + ref flag). useDebounce should use useRef for timer IDs and clean up on unmount. Key principles: (1) effects must clean up, (2) refs hold values that survive renders, (3) functional state updates avoid stale closures, (4) consumers should not need to worry about cleanup. Libraries like TanStack Query and SWR provide production-ready versions of these patterns."
      },
      realWorld: "useDebounce powers every search-as-you-type feature. useFetch loads data across many components. useOnClickOutside is needed for any dropdown or modal. These hooks form the utility layer of most React apps.",
      whenToUse: "Use these as building blocks. Start simple, then add features (caching, retry, abort) as needed. For production, prefer tested libraries (React Query, usehooks-ts) over writing your own.",
      whenNotToUse: "Do not reinvent the wheel. If React Query or SWR handles your case, use it. They handle edge cases (race conditions, cache, SSR) that are hard to get right.",
      pitfalls: "Not cleaning up (memory leaks, state updates after unmount). Not handling race conditions in async hooks. Over-engineering hooks that should be simple. Forgetting SSR (window/document may not exist on the server).",
      codeExamples: [
        {
          title: "useFetch with Abort and Race Condition Handling",
          code: `// useFetch: loads data from a URL
function useFetch(url) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Create abort controller to cancel old requests
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(url, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        if (err.name === "AbortError") return; // ignore cancelled requests
        setError(err);
        setLoading(false);
      });

    // Cancel request if URL changes or component unmounts
    return () => controller.abort();
  }, [url]);

  return { data, error, loading };
}

// useDebounce: waits before updating a value
function useDebounce(value, delay) {
  const [delayed, setDelayed] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDelayed(value), delay);
    return () => clearTimeout(timer); // cancel if value changes again
  }, [value, delay]);

  return delayed;
}

// Using them together
function UserSearch() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const { data, error, loading } = useFetch(
    debouncedQuery
      ? \`/api/users?search=\${encodeURIComponent(debouncedQuery)}\`
      : null
  );

  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search users..."
      />
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data?.map(user => <p key={user.id}>{user.name}</p>)}
    </div>
  );
}`
        }
      ]
    },
    {
      title: "Composing and Testing Custom Hooks",
      explanations: {
        layman: "You can connect hooks together like building blocks. useDebounce feeds into useFetch, which feeds into your component. Each hook is a small piece you can test on its own. Testing means running the hook in a fake component and checking it does the right thing.",
        mid: "Hooks compose naturally because they are just functions that call other hooks. A useSearchResults hook might use useDebounce + useFetch + useMemo inside. For testing, use renderHook from @testing-library/react. It runs the hook in a test component and gives you the result. Test each hook alone first, then test them together. Mock external things (fetch, localStorage) at the boundary.",
        senior: "Hook composition works because all hooks in a custom hook run in the calling fiber's context, sharing the same render cycle and batching. React 18's automatic batching means multiple setState calls across composed hooks merge into one re-render. For testing, renderHook creates a minimal TestComponent, giving you result.current and act() for updates. Async effects need waitFor or act(async () => ...). Use jest.useFakeTimers for debounce/throttle tests. Integration tests should check that composed hooks interact correctly — for example, that changing the debounced URL triggers an abort in useFetch."
      },
      realWorld: "A useDataTable hook combines useFilter, useSort, usePagination, and useFetch into one hook for the entire data table. Each piece is tested alone, and the combination is tested as an integration test.",
      whenToUse: "Compose hooks when you need to combine multiple behaviors into one clean abstraction. Test hooks when they have real logic, especially async operations, cleanup, or complex state changes.",
      whenNotToUse: "Do not over-compose — if a hook does too many things, it is hard to understand. Do not test simple hooks (a 3-line useToggle does not need its own test file). Component-level tests may be more useful than testing every tiny hook.",
      pitfalls: "Circular dependencies between hooks. Hidden re-render chains from deeply nested hooks. Not testing cleanup. Testing internal details instead of behavior. Forgetting to wrap async updates in act().",
      codeExamples: [
        {
          title: "Composing Hooks and Testing with renderHook",
          code: `// Composed hook: combines debounce + fetch + memo
function useSearchResults(startQuery = "") {
  const [query, setQuery] = useState(startQuery);
  const debouncedQuery = useDebounce(query, 300);

  const url = debouncedQuery
    ? \`/api/search?q=\${encodeURIComponent(debouncedQuery)}\`
    : null;
  const { data, loading, error } = useFetch(url);

  // Only recalculate results when data changes
  const results = useMemo(() => data?.results ?? [], [data]);

  return { query, setQuery, results, loading, error };
}

// Testing with @testing-library/react
import { renderHook, act, waitFor } from "@testing-library/react";

describe("useDebounce", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("waits before updating the value", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "hello", delay: 300 } }
    );

    expect(result.current).toBe("hello");

    // Change the value
    rerender({ value: "world", delay: 300 });
    expect(result.current).toBe("hello"); // not updated yet

    // Fast-forward time
    act(() => jest.advanceTimersByTime(300));
    expect(result.current).toBe("world"); // now updated
  });

  it("only keeps the last value on fast changes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "a" } }
    );

    rerender({ value: "ab" });
    act(() => jest.advanceTimersByTime(100));
    rerender({ value: "abc" });
    act(() => jest.advanceTimersByTime(300));

    // Should be "abc", not "ab"
    expect(result.current).toBe("abc");
  });
});`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "What makes a function a 'custom hook' vs a regular function?",
      answer: "Two things: (1) its name starts with 'use', and (2) it calls other React hooks inside it. The 'use' prefix tells the ESLint plugin to check hook rules on this function. Without it, the linter will not catch mistakes like conditional hook calls. A regular function like formatDate() cannot call useState or useEffect because hooks must run inside a component or another hook. Think of a custom hook as a reusable recipe of hooks — each component that calls it gets its own separate copy of the state.",
      difficulty: "easy",
      followUps: [
        "What happens if you call useState in a function without the 'use' prefix?",
        "Can a custom hook return JSX?",
        "Is useMyHelper(value) a valid custom hook name?"
      ]
    },
    {
      question: "Do two components using the same custom hook share state?",
      answer: "No. Each component gets its own separate copy of all state and effects from the hook. Custom hooks share the logic (the code pattern), not the state (the data). When ComponentA calls useCounter(), it creates its own useState. When ComponentB calls useCounter(), it creates a different useState. They are completely independent. To share state between components, use context, props, or a state management library.",
      difficulty: "easy",
      followUps: [
        "How would you share state between two components using the same hook?",
        "What if you wanted a singleton version of a hook?",
        "How does this relate to the module-level state pattern?"
      ]
    },
    {
      question: "How do you handle cleanup in custom hooks that manage subscriptions?",
      answer: "Return a cleanup function from useEffect. This cleanup runs when: (1) the component unmounts, or (2) dependencies change (before the next effect). For subscriptions: unsubscribe. For timers: clearTimeout/clearInterval. For fetch: abort with AbortController. For events: removeEventListener. The cleanup is hidden inside the hook — the component using it never needs to worry about it.",
      difficulty: "mid",
      followUps: [
        "What happens if you forget cleanup in a subscription hook?",
        "How does cleanup order work with multiple effects?",
        "How do you test that cleanup runs properly?"
      ]
    },
    {
      question: "Explain the pattern behind a useAsync hook and handle race conditions.",
      answer: "useAsync manages an async operation through states: idle, loading, success, or error. Key parts: (1) Track status, data, and error in state. (2) Use AbortController to cancel old requests when inputs change. (3) Prevent state updates after unmount using an abort signal or ref. (4) Return { execute, data, error, loading }. To fix race conditions: each effect creates its own AbortController. When inputs change, cleanup aborts the old request, so the old response is ignored. This stops old responses from overwriting newer ones.",
      difficulty: "hard",
      followUps: [
        "How would you add retry logic to useAsync?",
        "How does React Query solve race conditions differently?",
        "Can you implement useAsync with useReducer instead of multiple useState calls?"
      ]
    },
    {
      question: "Why are the rules of hooks necessary? Could React have designed hooks differently?",
      answer: "The rules exist because React tracks hooks by their call position (order in a list), not by name or key. This was chosen for simplicity and speed — no need for unique keys. Other designs considered: (1) Key-based like useState('counter', 0) — adds boilerplate and risk of key collisions. (2) Symbol-based — requires declaring hooks outside the component. (3) Proxy-based like Vue's composition API — different tradeoffs. The call-order approach gives a clean API with no extra overhead. The tradeoff is the top-level-only rule, which the ESLint plugin makes easy to follow.",
      difficulty: "hard",
      followUps: [
        "How does Vue's composition API differ from React hooks?",
        "Could the React Compiler eliminate the need for hook rules?",
        "What happens at the fiber level when hook order changes?"
      ]
    },
    {
      question: "How would you build a useMediaQuery hook for responsive logic in JS?",
      answer: "Use window.matchMedia(query) to check a media query, then listen for changes. Steps: (1) useState with the initial match from matchMedia(query).matches. (2) useEffect that creates the MediaQueryList, adds a 'change' listener, and removes it on cleanup. (3) Check if window exists for SSR safety. The hook returns a boolean: const isMobile = useMediaQuery('(max-width: 768px)'). Create the MediaQueryList inside useEffect to avoid SSR problems.",
      difficulty: "mid",
      followUps: [
        "How would you handle SSR where window doesn't exist?",
        "Why use matchMedia instead of resize events?",
        "How would you test this hook?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Build a useDebounce Hook",
      difficulty: "easy",
      description: "Implement a useDebounce hook that delays updating a value until a specified time has passed since the last change. Include proper cleanup.",
      solution: `import { useState, useEffect } from "react";

// Hook: delays a value update until you stop changing it
function useDebounce(value, delay = 300) {
  const [delayed, setDelayed] = useState(value);

  useEffect(() => {
    // Set a timer to update the value
    const timer = setTimeout(() => {
      setDelayed(value);
    }, delay);

    // If value changes again, cancel the old timer
    return () => clearTimeout(timer);
  }, [value, delay]);

  return delayed;
}

// Usage: search input that waits before fetching
function SearchInput() {
  const [text, setText] = useState("");
  const debouncedText = useDebounce(text, 500);

  useEffect(() => {
    if (!debouncedText) return;
    console.log("Searching for:", debouncedText);
    // fetch(\`/api/search?q=\${debouncedText}\`)...
  }, [debouncedText]);

  return (
    <div>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type to search..."
      />
      <p>Searching for: {debouncedText || "..."}</p>
    </div>
  );
}`,
      explanation: "Each time 'value' changes, the effect sets a timer. If value changes again before the timer fires, cleanup cancels the old timer and starts a new one. The debounced value only updates when you stop changing it for 'delay' milliseconds."
    },
    {
      title: "Build a useLocalStorage Hook with Cross-Tab Sync",
      difficulty: "mid",
      description: "Create a useLocalStorage hook that persists state to localStorage AND syncs across browser tabs using the storage event.",
      solution: `import { useState, useEffect, useCallback } from "react";

function useLocalStorage(key, startValue) {
  // Load saved value from localStorage
  const [value, setValue] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : startValue;
    } catch {
      return startValue;
    }
  });

  // Save to both state and localStorage
  const update = useCallback((newVal) => {
    setValue(prev => {
      const result = newVal instanceof Function ? newVal(prev) : newVal;
      try {
        window.localStorage.setItem(key, JSON.stringify(result));
      } catch (err) {
        console.warn("localStorage write failed:", err);
      }
      return result;
    });
  }, [key]);

  // Sync when another tab changes the same key
  useEffect(() => {
    function onStorageChange(e) {
      if (e.key === key && e.newValue !== null) {
        try {
          setValue(JSON.parse(e.newValue));
        } catch {
          // ignore bad data from other tabs
        }
      } else if (e.key === key && e.newValue === null) {
        setValue(startValue); // key was removed
      }
    }

    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, [key, startValue]);

  // Remove the value from localStorage
  const remove = useCallback(() => {
    setValue(startValue);
    try {
      window.localStorage.removeItem(key);
    } catch (err) {
      console.warn("localStorage remove failed:", err);
    }
  }, [key, startValue]);

  return [value, update, remove];
}

// Usage
function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage("theme", "light");

  return (
    <button onClick={() => setTheme(t => t === "light" ? "dark" : "light")}>
      Current: {theme} (syncs across tabs!)
    </button>
  );
}`,
      explanation: "The hook loads from localStorage on first render. The update function writes to both React state and localStorage. The 'storage' event listener picks up changes from OTHER tabs (it does not fire in the tab that made the change). This keeps tabs in sync. Errors are handled for full storage and bad data."
    },
    {
      title: "Build a useFetch Hook with Caching and Refetch",
      difficulty: "hard",
      description: "Create a useFetch hook that includes: in-memory caching, loading/error states, AbortController for race conditions, and a manual refetch function.",
      solution: `import { useState, useEffect, useRef, useCallback } from "react";

// Simple cache shared by all components
const cache = new Map();

function useFetch(url, options = {}) {
  const { cacheTime = 5 * 60 * 1000, enabled = true } = options;

  const [state, setState] = useState({
    data: cache.get(url)?.data ?? null,
    error: null,
    loading: enabled && !cache.has(url)
  });

  const abortRef = useRef(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async (fetchUrl) => {
    if (!fetchUrl) return;

    // Return cached data if still fresh
    const cached = cache.get(fetchUrl);
    if (cached && Date.now() - cached.time < cacheTime) {
      setState({ data: cached.data, error: null, loading: false });
      return;
    }

    // Cancel any previous request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const res = await fetch(fetchUrl, {
        signal: abortRef.current.signal
      });

      if (!res.ok) throw new Error(\`HTTP error \${res.status}\`);

      const data = await res.json();

      // Save to cache
      cache.set(fetchUrl, { data, time: Date.now() });

      if (mountedRef.current) {
        setState({ data, error: null, loading: false });
      }
    } catch (err) {
      if (err.name === "AbortError") return; // ignore cancelled
      if (mountedRef.current) {
        setState(prev => ({ ...prev, error: err, loading: false }));
      }
    }
  }, [cacheTime]);

  useEffect(() => {
    mountedRef.current = true;
    if (enabled && url) {
      fetchData(url);
    }
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, [url, enabled, fetchData]);

  // Clear cache and fetch again
  const refetch = useCallback(() => {
    if (url) {
      cache.delete(url);
      fetchData(url);
    }
  }, [url, fetchData]);

  return { ...state, refetch };
}

// Usage
function UserProfile({ userId }) {
  const { data: user, loading, error, refetch } = useFetch(
    userId ? \`/api/users/\${userId}\` : null,
    { cacheTime: 30000 }
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message} <button onClick={refetch}>Retry</button></p>;

  return (
    <div>
      <h2>{user.name}</h2>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}`,
      explanation: "AbortController cancels old requests when the URL changes or the component unmounts. This prevents race conditions where an old response overwrites a newer one. mountedRef prevents state updates after unmount. The cache is a module-level Map shared across all components. refetch clears the cache and fetches fresh data. The enabled option lets you skip fetching when not ready."
    },
    {
      title: "Build a useOnClickOutside Hook",
      difficulty: "mid",
      description: "Create a hook that calls a handler when clicking outside a referenced element. Support both mouse and touch events, and handle the case where the handler changes.",
      solution: `import { useEffect, useRef } from "react";

function useOnClickOutside(ref, handler) {
  // Store handler in a ref so we do not re-add listeners when handler changes
  const savedHandler = useRef(handler);
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    function onClickAway(event) {
      // Ignore clicks inside the element
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      savedHandler.current(event);
    }

    // Listen for both mouse and touch
    document.addEventListener("mousedown", onClickAway);
    document.addEventListener("touchstart", onClickAway);

    return () => {
      document.removeEventListener("mousedown", onClickAway);
      document.removeEventListener("touchstart", onClickAway);
    };
  }, [ref]);
}

// Usage: modal that closes on outside click
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef(null);
  useOnClickOutside(modalRef, onClose);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div ref={modalRef} className="modal-content">
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

function App() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <button onClick={() => setShowModal(true)}>Open Modal</button>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h2>Click outside to close</h2>
        <p>This modal closes when you click outside of it.</p>
      </Modal>
    </div>
  );
}`,
      explanation: "The handler is stored in a ref so the event listeners do not need to be re-added when the handler function changes (common with inline arrow functions). mousedown is used instead of click because it catches the start of the click. Touch events are included for mobile support."
    }
  ],
  quiz: [
    {
      question: "What happens if you call a hook inside an if-statement?",
      options: [
        "React automatically handles it correctly",
        "It works but is slower",
        "The hook order may change between renders, causing React to mismatch state",
        "It throws a compile-time error"
      ],
      correct: 2,
      explanation: "React tracks hooks by their position in the call order. If a hook is inside an if-statement, it might run on one render but not the next. This shifts all the hooks after it, so React gives the wrong state to the wrong hook."
    },
    {
      question: "Do two components using the same custom hook share state?",
      options: [
        "Yes, they share a single state instance",
        "No, each component gets its own independent state copy",
        "Only if the hook uses useContext",
        "Only for useRef-based state"
      ],
      correct: 1,
      explanation: "Custom hooks share the code pattern, not the state. Each component that calls the hook creates its own separate hook instances. To share state between components, use Context, props, or a state management library."
    },
    {
      question: "Why must custom hook names start with 'use'?",
      options: [
        "It's just a coding style preference",
        "React throws an error otherwise",
        "It tells the ESLint plugin to enforce hook rules and React's dispatcher to allow hook calls",
        "It makes hooks faster at runtime"
      ],
      correct: 2,
      explanation: "The 'use' prefix does two things: (1) the ESLint plugin only checks hook rules for functions starting with 'use', and (2) it tells React that this function follows hook rules and may call other hooks."
    },
    {
      question: "What is the correct way to handle race conditions in a useFetch hook?",
      options: [
        "Use a global lock variable",
        "Use AbortController to cancel previous requests when deps change",
        "Add a setTimeout to space out requests",
        "Use Promise.race to pick the fastest response"
      ],
      correct: 1,
      explanation: "AbortController lets you cancel old fetch requests. When the URL changes or the component unmounts, the effect cleanup calls controller.abort(). The catch handler ignores the AbortError, so stale responses do not update state."
    },
    {
      question: "What does renderHook from @testing-library/react do?",
      options: [
        "Mocks all hooks in a component",
        "Renders a hook inside a test component and provides access to its return value",
        "Converts hooks to class component lifecycle methods",
        "Profiles hook performance"
      ],
      correct: 1,
      explanation: "renderHook creates a small test component that calls your hook. It gives you result.current (the hook's return value) and rerender() to trigger updates. Use act() to flush state updates and waitFor() for async operations."
    }
  ]
};
