export const useRefTopic = {
  id: "use-ref",
  title: "useRef & Refs",
  icon: "📌",
  tag: "React Hooks",
  tagColor: "var(--tag-react)",
  subtitle: "Store values without re-rendering, access DOM elements, and use imperative patterns in React",
  concepts: [
    {
      title: "useRef as a Mutable Container",
      explanations: {
        layman: "useRef is like a box that holds one thing. You can put anything in it and look at it later — a timer, a DOM element, an old value. Two big differences from useState: (1) Changing what is in the box does NOT update the screen. React does not notice. (2) The change happens right away, not on the next render. useState is like a public whiteboard — change it and the whole room repaints. useRef is a private drawer — only you look inside.",
        mid: "useRef returns an object { current: initialValue } that stays the same for the whole life of the component. Changing ref.current does NOT cause a re-render. This makes it great for values that need to survive re-renders but do not affect what shows on screen — timer IDs, old values, flags, DOM nodes. React creates this object once on mount and gives you the same one every render.",
        senior: "useRef is the simplest hook internally — it creates a `{ current: value }` object once and returns the exact same object every render. No comparison, no re-render trigger, no special logic. The key trade-off vs useState: refs are invisible to React's rendering system, so they're perfect for values that don't affect UI (timer IDs, previous values, DOM references). In concurrent mode, don't read or write ref.current during render — the render might get thrown away, leaving the ref in an inconsistent state. Read refs in effects or event handlers instead. DOM refs (via `ref={myRef}`) are set during the commit phase, so they're null during render and populated after."
      },
      realWorld: "Storing a WebSocket connection, an AbortController, a mounted flag, or counting events for analytics without updating the UI.",
      whenToUse: "When you need a value that lives across renders but should NOT cause re-renders when changed. Good for timer IDs, subscription handles, old values, and references to imperative APIs.",
      whenNotToUse: "When the value affects what the user sees — use useState so React updates the screen. Do not use refs to skip state management for visible UI data.",
      pitfalls: "Reading or writing ref.current during rendering can cause bugs in concurrent mode because that render might get thrown away. Refs are not reactive — components will not update when ref.current changes. ref.current can be null before mount or after unmount.",
      codeExamples: [
        {
          title: "Using useRef for a Timer ID",
          code: `function Stopwatch() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  // Store timer ID in a ref (no re-render needed)
  const timerRef = useRef(null);

  const start = () => {
    if (running) return;
    setRunning(true);
    timerRef.current = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
  };

  const stop = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    setRunning(false);
  };

  const reset = () => {
    stop();
    setSeconds(0);
  };

  // Clean up timer when component is removed
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div>
      <p>{seconds}s</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}`
        }
      ]
    },
    {
      title: "useRef for DOM Access",
      explanations: {
        layman: "In React, you usually describe what you want and React builds it. But sometimes you need to touch a real element on the page — like focusing an input or measuring its size. useRef gives you a direct link to that element. It is like grabbing a book off the shelf yourself instead of asking someone to get it for you.",
        mid: "When you pass a ref to a JSX element (<input ref={myRef} />), React puts the real DOM node into myRef.current after mount (during the commit phase). This lets you do things React cannot do declaratively: focus inputs, measure sizes with getBoundingClientRect(), work with third-party DOM libraries, or control video/canvas elements. The ref is set to null when the element unmounts.",
        senior: "Refs are set during the commit phase, after all DOM changes are applied. This means refs are NOT available during render — only in effects, event handlers, and after mount. In concurrent mode, renders can restart multiple times, but ref assignments only happen once per final commit, so they're always consistent. Important pattern: callback refs (ref={node => ...}) let you react to attachment and detachment. They're the only way to get notified when a ref target changes — useful for measuring elements, setting up observers, or integrating with third-party DOM libraries that need a node reference."
      },
      realWorld: "Auto-focusing an input when a modal opens. Measuring element sizes for layouts. Working with chart libraries like D3 or Chart.js. Building infinite scroll with IntersectionObserver.",
      whenToUse: "When you need direct DOM control: focus, scroll, measure, play media, draw on canvas, or connect third-party libraries that need a DOM node.",
      whenNotToUse: "For showing/hiding elements, changing text, or setting styles — React handles those declaratively. Do not read DOM layout during render (causes performance problems).",
      pitfalls: "ref.current is null before mount. You cannot set ref on a child component without forwardRef. Reading layout in render causes forced layouts. Do not use refs for values that should be state.",
      codeExamples: [
        {
          title: "Auto-Focus and Scroll into View",
          code: `function SearchPage() {
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  // Focus the input when page loads
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const search = async () => {
    const data = await fetchResults(query);
    setResults(data);
    // Scroll to results after they show up
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };

  return (
    <div>
      <input
        ref={inputRef}
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => e.key === "Enter" && search()}
      />
      <button onClick={search}>Search</button>
      <div ref={resultsRef}>
        {results.map(r => <div key={r.id}>{r.title}</div>)}
      </div>
    </div>
  );
}`
        }
      ]
    },
    {
      title: "useRef for Previous Values and Render Tracking",
      explanations: {
        layman: "Imagine you want to know your score from the last round of a game. The scoreboard already shows this round. useRef is like a personal notebook where you write your score after each round. Next round, you check: 'Last time I had 50, now I have 75 — I gained 25!'",
        mid: "The usePrevious pattern stores the last render's value using useRef + useEffect. During render, ref.current still has the old value. useEffect runs after the render is done and updates the ref to the new value. This one-render delay lets you compare current vs previous values. Useful for detecting changes, running animations, or deciding when to fetch new data.",
        senior: "usePrevious works because of React's phase timing: (1) During render, ref.current still has the value from the last commit. (2) useEffect runs after commit and updates ref.current. This creates a one-render delay. It is safe in concurrent mode because effects only run after committed renders, not abandoned ones. Updating the ref during render (via useMemo) is unsafe because the render might be thrown away. React considered adding usePrevious natively but decided it works fine as a custom hook."
      },
      realWorld: "Triggering animations when a prop changes. Comparing old and new filter values to decide if you need new data. Building undo features. Counting renders for debugging.",
      whenToUse: "When you need to compare the current value with what it was last render. For detecting changes like 'loading just finished' or 'price went up'.",
      whenNotToUse: "When you can figure out the answer from current state alone. When the old value should be explicit state (like an undo history list).",
      pitfalls: "On first render, the previous value is undefined. Updating the ref during render (not in useEffect) is unsafe in concurrent mode. The previous value is one render behind, not one state-update behind.",
      codeExamples: [
        {
          title: "usePrevious Custom Hook",
          code: `// Hook: remembers the value from last render
function usePrevious(value) {
  const ref = useRef();
  // After each render, save the current value
  useEffect(() => {
    ref.current = value;
  });
  // During render, ref still has the OLD value
  return ref.current;
}

// Example: show if price went up or down
function PriceTag({ price }) {
  const oldPrice = usePrevious(price);

  const direction =
    oldPrice === undefined ? "neutral" :
    price > oldPrice ? "up" :
    price < oldPrice ? "down" : "neutral";

  return (
    <span className={\`price price--\${direction}\`}>
      {direction === "up" && "↑"}
      {direction === "down" && "↓"}
      \${price.toFixed(2)}
    </span>
  );
}

// Example: count how many times a component renders
function RenderCounter() {
  const count = useRef(0);
  count.current += 1;
  return <span>Renders: {count.current}</span>;
}`
        }
      ]
    },
    {
      title: "forwardRef and useImperativeHandle",
      explanations: {
        layman: "Normally, you cannot reach inside a component from the outside. forwardRef opens a small window so the parent can look in. useImperativeHandle lets the child decide what the parent can see through that window — like a front desk that controls what visitors can access in a building.",
        mid: "forwardRef lets a component accept a ref from its parent: const Input = forwardRef((props, ref) => <input ref={ref} />). The parent can then access the child's DOM node. useImperativeHandle controls what the parent sees through that ref. Instead of the raw DOM node, you expose a custom API: useImperativeHandle(ref, () => ({ focus() { ... }, reset() { ... } })). This gives the parent useful methods while hiding internal details.",
        senior: "forwardRef wraps a component so it receives (props, ref) instead of just (props). useImperativeHandle runs during commit (like useLayoutEffect) to assign a custom handle object to the parent's ref. Since React 19, forwardRef is no longer needed — ref is just a regular prop. The key design decision: use useImperativeHandle to expose a minimal, stable API rather than the raw DOM node. This creates a clean contract between parent and child. Component libraries use this heavily (e.g., Dialog with open/close, Form with validate/reset). Keep the exposed API small and document it — consumers should not need to read the source to know what methods are available."
      },
      realWorld: "A Form component that exposes validate() and reset(). A video player with play(), pause(), and seek(). A modal the parent can open and close with methods.",
      whenToUse: "When a reusable component needs to give the parent access to imperative methods. When wrapping DOM elements that consumers need to control. When you want to expose only specific methods, not the whole DOM node.",
      whenNotToUse: "When props and state can handle the interaction (prefer declarative). When simple callback props are enough. Do not use imperative handles to replace normal data flow.",
      pitfalls: "Overusing imperative patterns when declarative works fine. Forgetting forwardRef (before React 19). Exposing too many internals defeats the point. useImperativeHandle deps work like useEffect — missing deps cause stale values.",
      codeExamples: [
        {
          title: "Custom Input with Imperative Handle",
          code: `import { forwardRef, useRef, useImperativeHandle, useState } from "react";

// Child: exposes focus, clear, validate, getValue to parent
const CustomInput = forwardRef(function CustomInput({ label, check }, ref) {
  const inputRef = useRef(null);
  const [error, setError] = useState("");

  // Define what the parent can do with the ref
  useImperativeHandle(ref, () => ({
    focus() {
      inputRef.current.focus();
    },
    clear() {
      inputRef.current.value = "";
      setError("");
    },
    validate() {
      const val = inputRef.current.value;
      if (check) {
        const err = check(val);
        setError(err || "");
        return !err;
      }
      return true;
    },
    getValue() {
      return inputRef.current.value;
    }
  }), [check]);

  return (
    <div>
      <label>{label}</label>
      <input ref={inputRef} />
      {error && <span className="error">{error}</span>}
    </div>
  );
});

// Parent: uses the ref to call child methods
function SignupForm() {
  const nameRef = useRef(null);
  const emailRef = useRef(null);

  const handleSubmit = () => {
    const nameOk = nameRef.current.validate();
    const emailOk = emailRef.current.validate();

    if (nameOk && emailOk) {
      const data = {
        name: nameRef.current.getValue(),
        email: emailRef.current.getValue()
      };
      console.log("Submit:", data);
    } else {
      // Focus the first bad field
      if (!nameOk) nameRef.current.focus();
      else emailRef.current.focus();
    }
  };

  return (
    <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
      <CustomInput
        ref={nameRef}
        label="Name"
        check={v => (!v ? "Name is required" : null)}
      />
      <CustomInput
        ref={emailRef}
        label="Email"
        check={v => (!v.includes("@") ? "Invalid email" : null)}
      />
      <button type="submit">Sign Up</button>
    </form>
  );
}`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "What is the difference between useRef and useState?",
      answer: "Both keep their value between renders, but they differ in one key way: re-rendering. Updating useState causes a re-render — the screen updates. Changing useRef.current does nothing visually — React does not notice. Also, ref changes happen instantly, while setState is batched. Simple rule: if the value shows on screen, use useState. If it is behind the scenes (timer ID, DOM node, old value, a flag), use useRef to avoid unnecessary re-renders.",
      difficulty: "easy",
      followUps: [
        "Can you force a re-render after updating a ref?",
        "Why doesn't React re-render when ref.current changes?",
        "When might you use both useState and useRef for the same logical value?"
      ]
    },
    {
      question: "Why does mutating ref.current during render cause problems in concurrent mode?",
      answer: "In concurrent mode, React can start a render, pause it, and throw it away. If you change a ref during render, that change sticks even if the render is discarded. Now the ref value does not match the UI. The fix: change refs in useEffect, useLayoutEffect, or event handlers — these only run after a render is fully committed.",
      difficulty: "hard",
      followUps: [
        "What is the difference between a committed render and an abandoned render?",
        "Is incrementing a render counter in ref.current during render truly safe?",
        "How does Strict Mode help catch these bugs?"
      ]
    },
    {
      question: "Explain callback refs and when you'd use them instead of useRef.",
      answer: "A callback ref is a function you pass to the ref attribute: <div ref={node => { ... }}>. React calls it with the DOM node on mount and with null on unmount. Unlike useRef, callback refs tell you when a ref attaches or detaches. They are great for measuring elements as soon as they appear, handling dynamic lists, or setting up observers. In React 19, callback refs can also return a cleanup function.",
      difficulty: "mid",
      followUps: [
        "How do callback refs interact with re-renders?",
        "Can you combine callback refs with useRef?",
        "How would you use a callback ref with IntersectionObserver?"
      ]
    },
    {
      question: "How would you implement a usePrevious hook?",
      answer: "Use useRef + useEffect. During render, ref.current still has the old value. After the render commits, useEffect saves the new value into the ref. Code: function usePrevious(value) { const ref = useRef(); useEffect(() => { ref.current = value; }); return ref.current; }. It returns undefined on the first render. This is safe in concurrent mode because useEffect only runs after committed renders.",
      difficulty: "easy",
      followUps: [
        "Why use useEffect instead of updating the ref during render?",
        "What does usePrevious return on the first render?",
        "How would you implement usePrevious with an initial value?"
      ]
    },
    {
      question: "What is useImperativeHandle and when should you use it?",
      answer: "useImperativeHandle controls what a parent sees through a forwarded ref. Instead of exposing the raw DOM node, you define specific methods. Syntax: useImperativeHandle(ref, () => ({ focus() {}, reset() {} }), [deps]). Use it when building reusable components that need to give parents imperative actions (focus, validate, reset) without exposing all the internals.",
      difficulty: "mid",
      followUps: [
        "Why is useImperativeHandle preferable to exposing the raw DOM ref?",
        "How does useImperativeHandle interact with React 19's ref-as-prop?",
        "What happens if you forget the dependency array?"
      ]
    },
    {
      question: "Can you use useRef to store a reference to the previous render's props AND avoid stale closures in event handlers?",
      answer: "Yes. For stale closures: keep the latest value in a ref updated every render (via useEffect). Then read ref.current inside callbacks or timeouts to always get the fresh value. Example: const latestRef = useRef(props); useEffect(() => { latestRef.current = props; }). For previous props: use the usePrevious pattern. You can use both at the same time — one ref for 'latest' (async callbacks) and another for 'previous' (comparison).",
      difficulty: "hard",
      followUps: [
        "How does this pattern relate to the useEvent proposal?",
        "Is updating a ref in useEffect or useLayoutEffect better for this pattern?",
        "What are the tradeoffs vs using functional state updates?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Build a useClickOutside Hook",
      difficulty: "mid",
      description: "Create a custom hook that detects clicks outside a given element and calls a handler. Used for closing dropdowns, modals, and popovers.",
      solution: `import { useEffect, useRef } from "react";

// Hook: calls handler when user clicks outside the ref element
function useClickOutside(handler) {
  const ref = useRef(null);

  useEffect(() => {
    function onClickAway(e) {
      // If click is outside our element, call handler
      if (ref.current && !ref.current.contains(e.target)) {
        handler();
      }
    }

    document.addEventListener("mousedown", onClickAway);
    document.addEventListener("touchstart", onClickAway);

    // Clean up listeners
    return () => {
      document.removeEventListener("mousedown", onClickAway);
      document.removeEventListener("touchstart", onClickAway);
    };
  }, [handler]);

  return ref;
}

// Usage: dropdown that closes when clicking outside
function Dropdown({ onClose }) {
  const boxRef = useClickOutside(onClose);

  return (
    <div ref={boxRef} className="dropdown">
      <p>Menu items here</p>
      <button>Option 1</button>
      <button>Option 2</button>
    </div>
  );
}

function App() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setOpen(true)}>Open</button>
      {open && <Dropdown onClose={() => setOpen(false)} />}
    </div>
  );
}`,
      explanation: "The hook returns a ref you attach to the element you want to watch. It adds click listeners to the whole document. When a click happens, it checks if the click was inside the element using contains(). If outside, it calls your handler. Cleanup removes the listeners to prevent memory leaks."
    },
    {
      title: "Build a Resizable Panel with useRef",
      difficulty: "hard",
      description: "Create a resizable panel that tracks mouse dragging using refs. Use refs (not state) for drag values to avoid re-renders during dragging.",
      solution: `import { useRef, useState, useCallback, useEffect } from "react";

function ResizablePanel({ minWidth = 200, maxWidth = 600, children }) {
  const panelRef = useRef(null);
  // Drag state in refs — no re-renders while dragging
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);
  const [width, setWidth] = useState(300);

  // Start dragging
  const onMouseDown = useCallback((e) => {
    dragging.current = true;
    dragStartX.current = e.clientX;
    dragStartWidth.current = panelRef.current.offsetWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    // While dragging, update DOM directly (fast, no re-renders)
    function onMouseMove(e) {
      if (!dragging.current) return;
      const diff = e.clientX - dragStartX.current;
      const newW = Math.min(
        maxWidth,
        Math.max(minWidth, dragStartWidth.current + diff)
      );
      panelRef.current.style.width = newW + "px";
    }

    // Stop dragging — sync final width to state (one re-render)
    function onMouseUp() {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      if (panelRef.current) {
        setWidth(panelRef.current.offsetWidth);
      }
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [minWidth, maxWidth]);

  return (
    <div
      ref={panelRef}
      style={{
        width,
        position: "relative",
        border: "1px solid #ccc",
        overflow: "auto"
      }}
    >
      {children}
      {/* Drag handle on the right edge */}
      <div
        onMouseDown={onMouseDown}
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 8,
          cursor: "col-resize",
          backgroundColor: "transparent"
        }}
        onMouseOver={e => e.target.style.backgroundColor = "#4a90d9"}
        onMouseOut={e => e.target.style.backgroundColor = "transparent"}
      />
    </div>
  );
}`,
      explanation: "While dragging, width is set directly on the DOM (panelRef.current.style.width) to avoid hundreds of re-renders per second. Drag state values (dragging, startX, startWidth) are refs because they do not need to trigger re-renders. Only when dragging ends do we save the final width to state (one re-render). This shows how refs help with performance-sensitive operations."
    },
    {
      title: "Build a useInterval Hook with Refs",
      difficulty: "mid",
      description: "Create a useInterval hook that handles changing delay values and cleans up properly. The callback should always use the latest values without restarting the interval.",
      solution: `import { useEffect, useRef } from "react";

// Hook: runs callback on an interval, handles delay changes
function useInterval(callback, delay) {
  const savedCallback = useRef(callback);

  // Always keep the ref pointing to the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval (restarts only when delay changes)
  useEffect(() => {
    if (delay === null) return; // null = paused

    const id = setInterval(() => {
      savedCallback.current(); // Always calls latest callback
    }, delay);

    return () => clearInterval(id);
  }, [delay]);
}

// Usage: counter with adjustable speed
function Counter() {
  const [count, setCount] = useState(0);
  const [speed, setSpeed] = useState(1000);
  const [running, setRunning] = useState(true);

  // Pass null to pause the interval
  useInterval(
    () => setCount(c => c + 1),
    running ? speed : null
  );

  return (
    <div>
      <h2>Count: {count}</h2>
      <label>
        Speed: {speed}ms
        <input
          type="range"
          min={100}
          max={2000}
          step={100}
          value={speed}
          onChange={e => setSpeed(Number(e.target.value))}
        />
      </label>
      <button onClick={() => setRunning(r => !r)}>
        {running ? "Pause" : "Resume"}
      </button>
    </div>
  );
}`,
      explanation: "The trick is separating the callback from the timing. The savedCallback ref always points to the latest callback, so the interval never uses stale values. The interval only restarts when delay changes. Passing null as delay pauses it. This pattern solves the stale closure problem with setInterval in React."
    }
  ],
  quiz: [
    {
      question: "When does React assign a DOM node to ref.current?",
      options: [
        "During the render phase",
        "During the commit phase (after DOM updates)",
        "Before the component function runs",
        "Immediately when useRef is called"
      ],
      correct: 1,
      explanation: "React sets DOM refs during the commit phase, after all DOM changes are applied. This makes sure the DOM node actually exists when ref.current is set."
    },
    {
      question: "What happens when you update ref.current?",
      options: [
        "The component re-renders with the new value",
        "Nothing visible — no re-render is triggered",
        "React schedules a re-render for the next tick",
        "An error is thrown because refs are read-only"
      ],
      correct: 1,
      explanation: "Changing ref.current is just a normal JavaScript change. React cannot detect it, so no re-render happens. The value changes instantly but the screen will not show it until the next render caused by something else."
    },
    {
      question: "What does forwardRef allow a parent to do?",
      options: [
        "Pass state down without props",
        "Access the child component's internal DOM node or imperative handle via ref",
        "Force the child to re-render",
        "Share context with the child"
      ],
      correct: 1,
      explanation: "forwardRef passes the parent's ref into the child component. The parent can then access the child's DOM node or a custom set of methods defined with useImperativeHandle."
    },
    {
      question: "Which hook is useImperativeHandle typically paired with?",
      options: [
        "useState",
        "useEffect",
        "forwardRef",
        "useContext"
      ],
      correct: 2,
      explanation: "useImperativeHandle controls what the parent sees through a ref. That ref needs to come from the parent, which is what forwardRef does — it passes the parent's ref into the child component."
    },
    {
      question: "In the usePrevious pattern, why is useEffect used instead of updating the ref during render?",
      options: [
        "useEffect is faster than direct assignment",
        "Direct ref mutation during render is unsafe in concurrent mode — abandoned renders would corrupt the value",
        "Refs can only be modified inside effects",
        "It makes the hook testable"
      ],
      correct: 1,
      explanation: "In concurrent mode, a render can be thrown away. If you change a ref during render, that change stays even for discarded renders, making the previous value wrong. useEffect only runs after committed renders, so the ref always matches the last value that actually showed on screen."
    }
  ]
};
