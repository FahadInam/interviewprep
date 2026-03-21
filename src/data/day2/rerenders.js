export const rerenders = {
  id: "rerenders",
  title: "Re-renders & Performance",
  icon: "🔄",
  tag: "React Hooks",
  tagColor: "var(--tag-react)",
  subtitle: "Understand what triggers re-renders and how to prevent unnecessary ones",
  concepts: [
    {
      title: "What Triggers a Re-render",
      explanations: {
        layman: "A re-render means React runs your component again to check if the screen needs to change. Only 3 things cause this: (1) You changed your own state with setState. (2) Your parent component re-rendered — even if your props stayed the same. (3) A context value you use changed. That's it. Changing a ref? No re-render. Props changing by themselves? That doesn't happen — props only change when the parent re-renders.",
        mid: "A component re-renders when: (1) Its state changes via setState — React marks it for an update. (2) Its parent re-renders — React re-renders ALL children by default, no matter if props changed or not. (3) A context it uses changes. Important: props changing does NOT cause re-renders. The parent re-rendering is what causes it. Props just happen to be new (or the same). Without React.memo, there is no props check at all.",
        senior: "Re-renders are scheduled in scheduleUpdateOnFiber. setState adds an update to the fiber's queue and triggers a re-render upward. During reconciliation, React visits each fiber top-down, calling component functions again. By default, ALL children are re-rendered. The bailout check only skips when: (1) oldProps === newProps (reference check, not deep), (2) no pending state, (3) context unchanged, (4) same fiber type. React.memo adds a shallow props comparison. Context triggers come from propagateContextChange, which walks the tree and marks all consumers."
      },
      realWorld: "A dashboard where typing in a search box re-renders every chart, table, and widget because the search state is too high up in the component tree. This causes the page to feel slow on every keystroke.",
      whenToUse: "You need this knowledge for all React work. It helps you decide where to put state, how to structure components, and when to optimize.",
      whenNotToUse: "Don't optimize too early. Many re-renders are fine because React is fast at diffing. Only optimize when you can measure a real performance problem.",
      pitfalls: "Thinking props changes cause re-renders (they don't — the parent re-rendering does). Thinking rendering means the DOM changed (rendering just calls your function; the DOM only updates if something actually changed). Putting state too high up causes unnecessary re-renders in other branches.",
      codeExamples: [
        {
          title: "Three Re-render Triggers Demonstrated",
          code: `// 1. State change — component re-renders when its own state changes
function Counter() {
  const [count, setCount] = useState(0);
  console.log("Counter rendered"); // Logs on every click
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// 2. Parent re-render — child re-renders even with no props
function Parent() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      <Child /> {/* Re-renders every time Parent updates */}
    </div>
  );
}
function Child() {
  console.log("Child rendered"); // Logs every time Parent changes!
  return <p>I'm a child</p>;
}

// 3. Context change — consumers re-render when context value changes
const ThemeContext = createContext("light");
function App() {
  const [theme, setTheme] = useState("light");
  return (
    <ThemeContext.Provider value={theme}>
      <button onClick={() => setTheme(t => t === "light" ? "dark" : "light")}>
        Toggle
      </button>
      <ThemedButton />
    </ThemeContext.Provider>
  );
}
function ThemedButton() {
  const theme = useContext(ThemeContext);
  console.log("ThemedButton rendered"); // Logs when theme changes
  return <button className={theme}>Click me</button>;
}`
        }
      ]
    },
    {
      title: "Rendering vs Committing — Rendering Doesn't Mean DOM Update",
      explanations: {
        layman: "Think of it like drafting vs building. React first draws a plan (rendering) and then only builds the parts that actually changed (committing). React might draw 10 plans but only change one thing on the page. So 're-rendering' is just React checking what should change — it doesn't mean the page actually updated.",
        mid: "React works in two steps: (1) Render phase — React calls your component functions to figure out what the UI should look like. No DOM changes happen here. (2) Commit phase — React compares the new output with the old one and only updates the DOM parts that are different. A component can re-render without any DOM changes if its output is the same as before. This is why re-renders are usually cheap — the costly part is DOM updates, which React already keeps to a minimum.",
        senior: "The render phase (beginWork to completeWork) is interruptible in concurrent mode. React calls component functions and builds the work-in-progress tree without touching the DOM. Effect flags are set on fibers that need updates. The commit phase (commitRoot) is synchronous with sub-phases: beforeMutation (cleanup scheduling), mutation (actual DOM changes), layout (useLayoutEffect, ref assignments). Even if 100 components re-render, if their JSX output produces the same types, keys, and props, the commit phase does zero DOM work."
      },
      realWorld: "A list of 1000 items re-renders when one item changes. React calls all 1000 component functions (about 5ms), but only updates 1 DOM node (about 0.1ms). The re-renders are fast; trying to prevent them is often wasted effort.",
      whenToUse: "This helps you make better optimization choices. Focus on: (1) making render-time calculations fast (useMemo), (2) reducing DOM work (fewer DOM nodes), and (3) keeping component functions lightweight.",
      whenNotToUse: "Don't use this as an excuse to ignore all performance issues. Each re-render calls your function — if it does heavy work like sorting or filtering, that cost adds up.",
      pitfalls: "Thinking every re-render means a slow DOM update. Seeing React DevTools highlights and worrying — highlights show renders, not DOM changes. Over-using memoization to prevent renders that wouldn't change the DOM anyway.",
      codeExamples: [
        {
          title: "Proving Render != DOM Update",
          code: `function StaticContent() {
  const renderCount = useRef(0);
  renderCount.current += 1;

  // This function runs on every parent re-render
  // But the DOM won't change because the output is the same
  console.log(\`Rendered \${renderCount.current} times\`);

  return (
    <div>
      <p>This text never changes, but the component still re-renders.</p>
      <p>Check the DOM inspector — no updates happen here.</p>
    </div>
  );
}

// Use Profiler to measure how long renders take
function ProfiledApp() {
  return (
    <Profiler
      id="App"
      onRender={(id, phase, actualDuration, baseDuration) => {
        console.log({
          id,
          phase, // "mount" or "update"
          actualDuration, // Time spent rendering (ms)
          baseDuration  // Time without any memoization
        });
      }}
    >
      <App />
    </Profiler>
  );
}`
        }
      ]
    },
    {
      title: "Automatic Batching in React 18+ and flushSync",
      explanations: {
        layman: "Imagine a waiter who collects all your orders before going to the kitchen. In React 17, the waiter only collected orders at the table (event handlers). If you ordered from somewhere else (like setTimeout), each order was a separate trip. React 18's waiter collects ALL orders no matter where they come from. flushSync is like saying 'bring this dish right now before anything else.'",
        mid: "React 18 groups multiple state updates into one re-render, no matter where they happen — event handlers, setTimeout, Promises, or anywhere else. In React 17, this grouping only worked inside React event handlers. So calling setState three times in a row causes just ONE re-render, not three. flushSync forces React to update the DOM right away for a specific update. It's rarely needed — mainly for cases where you need to read DOM measurements right after a state change.",
        senior: "React 18's createRoot enables automatic batching through lane-based scheduling. All updates in the same execution context get the same lane and process in one render pass. Updates are queued on fiber updateQueues and processed together. flushSync sets the execution context to SyncContext, forcing synchronous rendering within the call stack. This bypasses the scheduler and processes the update immediately. Batching saves work because React computes one diff instead of several."
      },
      realWorld: "A form handler that validates input, shows a loading spinner, clears errors, and updates fields. In React 17 inside a setTimeout, each setState caused a separate re-render. React 18 batches them all into one.",
      whenToUse: "Automatic batching is always on in React 18 with createRoot. You get it for free. Use flushSync only when you must update the DOM right away — like scrolling to a new list item that needs to exist in the DOM first.",
      whenNotToUse: "Don't use flushSync for normal updates — it breaks batching and hurts performance. Save it for rare DOM measurement cases.",
      pitfalls: "Using ReactDOM.render instead of createRoot turns off automatic batching. flushSync inside event handlers can cause surprises. Batching means state isn't updated between consecutive setState calls — each one sees the old state unless you use a function updater.",
      codeExamples: [
        {
          title: "Automatic Batching and flushSync",
          code: `import { flushSync } from "react-dom";

function BatchingDemo() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);
  const renderCount = useRef(0);

  renderCount.current += 1;

  // React 18: both updates are batched into 1 re-render
  const handleClick = () => {
    setCount(c => c + 1);
    setFlag(f => !f);
    // Only 1 re-render happens!
  };

  // React 18: also batched inside setTimeout!
  const handleAsync = () => {
    setTimeout(() => {
      setCount(c => c + 1);
      setFlag(f => !f);
      // Still only 1 re-render!
    }, 0);
  };

  // flushSync forces immediate DOM update
  const handleFlushSync = () => {
    flushSync(() => {
      setCount(c => c + 1);
    });
    // DOM is updated right here — you can measure it now

    flushSync(() => {
      setFlag(f => !f);
    });
    // This causes a second re-render
  };

  return (
    <div>
      <p>Renders: {renderCount.current}</p>
      <p>Count: {count}, Flag: {String(flag)}</p>
      <button onClick={handleClick}>Batched (event)</button>
      <button onClick={handleAsync}>Batched (timeout)</button>
      <button onClick={handleFlushSync}>Flush Sync (2 renders)</button>
    </div>
  );
}`
        }
      ]
    },
    {
      title: "React.memo and the Children Pattern",
      explanations: {
        layman: "React.memo is like a guard at a door. Before letting React re-render a component, the guard checks: 'Did the props change?' If not, it skips the re-render. The 'children pattern' is even simpler — instead of using a guard, you arrange things so the children come from a parent that didn't re-render. Since they were created somewhere that didn't change, React knows they're the same and skips them automatically.",
        mid: "React.memo wraps a component so it skips re-rendering if props haven't changed (shallow check). But there's a free alternative: the children pattern. When you pass children from a higher parent into a wrapper, those children stay the same reference because the higher parent didn't re-render. So when the wrapper re-renders (from its own state), React sees the same children reference and skips that subtree. No memo needed — just smart component structure.",
        senior: "The children pattern works because of React's bailout in beginWork. When oldProps === newProps (reference equality), React skips the subtree. If ParentA renders <Wrapper>{children}</Wrapper> and Wrapper's state changes, React re-renders Wrapper but the children prop is the SAME reference — it was created in ParentA's render, which didn't run. JSX elements are objects from createElement. If the creator doesn't re-render, the reference stays stable. This pattern is used by React Router, Redux Provider, and many UI libraries."
      },
      realWorld: "A layout with a collapsible sidebar wraps page content. Without the children pattern, toggling the sidebar re-renders the entire page. With it, only the sidebar wrapper re-renders; the page content stays untouched.",
      whenToUse: "Use React.memo for components that render often with the same props and have heavy render logic. Use the children pattern as a free alternative when you can restructure components to separate state from expensive content.",
      whenNotToUse: "Don't wrap everything in React.memo — the comparison has a cost. Don't use it on components that always get new props. Don't use the children pattern when it makes the code confusing.",
      pitfalls: "React.memo only does a shallow check — passing new objects, arrays, or functions as props defeats it. The children pattern needs you to restructure your component tree. React.memo does NOT stop re-renders from context changes — context consumers always re-render when the value changes.",
      codeExamples: [
        {
          title: "Children Pattern vs React.memo",
          code: `// PROBLEM: BigList re-renders on every color change
function AppBad() {
  const [color, setColor] = useState("red");
  return (
    <div style={{ color }}>
      <input value={color} onChange={e => setColor(e.target.value)} />
      <BigList /> {/* Re-renders every time! */}
    </div>
  );
}

// FIX 1: Use React.memo to skip re-renders when props are the same
const BigList = React.memo(function BigList() {
  console.log("BigList rendered");
  const items = Array.from({ length: 10000 }, (_, i) => <li key={i}>Item {i}</li>);
  return <ul>{items}</ul>;
});

// FIX 2: Children pattern — no React.memo needed!
function ColorWrapper({ children }) {
  const [color, setColor] = useState("red");
  return (
    <div style={{ color }}>
      <input value={color} onChange={e => setColor(e.target.value)} />
      {children} {/* Same reference — created by AppGood, not ColorWrapper */}
    </div>
  );
}

function AppGood() {
  return (
    <ColorWrapper>
      {/* BigList is created here in AppGood's scope.
          ColorWrapper re-renders, but this reference stays the same. */}
      <BigList />
    </ColorWrapper>
  );
}

// FIX 3: Move state into its own component
function AppBest() {
  return (
    <div>
      <ColorPicker /> {/* Only this re-renders */}
      <BigList /> {/* Not affected by color state */}
    </div>
  );
}
function ColorPicker() {
  const [color, setColor] = useState("red");
  return (
    <div style={{ color }}>
      <input value={color} onChange={e => setColor(e.target.value)} />
    </div>
  );
}`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "Does a component re-render when its props change?",
      answer: "No. This is a common mistake. A component re-renders because its PARENT re-rendered, not because props changed. Without React.memo, a child re-renders every time the parent renders, even if all props are exactly the same. There is no automatic props check. React.memo adds a shallow comparison that CAN skip re-renders when props match. But by default, props are not compared at all. The real trigger is always the parent re-rendering.",
      difficulty: "mid",
      followUps: [
        "What is the only thing that can trigger a re-render on a component?",
        "How does React.memo change this behavior?",
        "What about context — does it bypass this rule?"
      ]
    },
    {
      question: "What is the difference between the render phase and the commit phase?",
      answer: "The render phase is when React calls your component functions and figures out what the UI should look like. No DOM changes happen here. It can be paused or restarted in concurrent mode. The commit phase is when React actually updates the DOM, runs layout effects, and sets refs. It runs all at once and can't be interrupted. A component can render (function gets called) without committing (no DOM changes) if the output is the same as before.",
      difficulty: "mid",
      followUps: [
        "Can the render phase be interrupted in concurrent mode?",
        "Where do useEffect callbacks run relative to these phases?",
        "What's the difference between useEffect and useLayoutEffect timing?"
      ]
    },
    {
      question: "Explain automatic batching in React 18 and when you might use flushSync.",
      answer: "React 18 groups all state updates into one re-render, no matter where they happen — event handlers, setTimeout, Promises, anywhere. In React 17, this only worked inside event handlers. This means fewer re-renders and better performance. flushSync forces React to update the DOM immediately for a specific update. Use it when you need to read from the DOM right after a state change, like measuring a new element's position. Use it rarely since it breaks batching.",
      difficulty: "mid",
      followUps: [
        "How did batching work in React 17?",
        "What happens if you call flushSync inside a React event handler?",
        "Does automatic batching affect the order in which state updates are applied?"
      ]
    },
    {
      question: "How does the children-as-props pattern prevent unnecessary re-renders?",
      answer: "When a parent creates JSX children and passes them into a wrapper via props.children, those children are created in the parent's scope. When the wrapper re-renders from its own state change, the children prop is still the same object reference because the parent didn't re-render. React checks if oldProps === newProps by reference. Since children is the same reference, React skips re-rendering that subtree. This gives you the same result as React.memo but through component structure, with no comparison cost.",
      difficulty: "hard",
      followUps: [
        "Why is this sometimes called the 'composition pattern'?",
        "Does this work with multiple children?",
        "Can you combine this pattern with React.memo?"
      ]
    },
    {
      question: "How would you diagnose and fix a re-render performance problem?",
      answer: "Step by step: (1) Use React DevTools Profiler to record an interaction. Check the flamegraph to see which components rendered and how long each took. (2) Use 'Why did this render?' to find the cause. (3) Look for common problems: state placed too high up, new objects or functions created every render, or context changes. (4) Fix by: moving state closer to where it's used, extracting stateful parts into their own components, using the children pattern, or adding React.memo with useMemo/useCallback. (5) Use stable keys for list items. (6) For very long lists, use virtualization (like react-window).",
      difficulty: "hard",
      followUps: [
        "How does the React DevTools Profiler work?",
        "What's the difference between 'actual duration' and 'base duration' in the Profiler?",
        "When should you consider virtualization over memoization?"
      ]
    },
    {
      question: "What are the three main strategies to prevent unnecessary re-renders?",
      answer: "(1) State colocation — put state close to where it's used. If only a search box needs search state, don't put it in the page component. (2) Children pattern — pass expensive children from a parent that doesn't re-render, so their reference stays stable. (3) Memoization — use React.memo on the component plus useMemo/useCallback for its props. Try them in this order: colocation is free, the children pattern is free, memoization has a cost. Always try restructuring before using memo.",
      difficulty: "mid",
      followUps: [
        "Why is state colocation 'free'?",
        "Can you give an example of each strategy?",
        "When would memoization be the only viable option?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Optimize a Dashboard with Multiple Widgets",
      difficulty: "mid",
      description: "A dashboard has a search input and several expensive widgets. Currently, typing in the search box re-renders ALL widgets. Fix it using state colocation and the children pattern.",
      solution: `import { useState, memo } from "react";

// BEFORE: Everything re-renders on every keystroke
function DashboardBad() {
  const [search, setSearch] = useState("");
  const [data] = useState({ revenue: 50000, users: 1200, orders: 340 });

  return (
    <div>
      <input value={search} onChange={e => setSearch(e.target.value)} />
      <RevenueWidget revenue={data.revenue} />
      <UsersWidget users={data.users} />
      <OrdersWidget orders={data.orders} />
      <SearchResults query={search} />
    </div>
  );
}

// AFTER: Only SearchSection re-renders on keystroke
function DashboardGood() {
  const [data] = useState({ revenue: 50000, users: 1200, orders: 340 });

  return (
    <div>
      {/* Search state lives here — doesn't affect widgets */}
      <SearchSection />
      {/* These only re-render if data changes */}
      <RevenueWidget revenue={data.revenue} />
      <UsersWidget users={data.users} />
      <OrdersWidget orders={data.orders} />
    </div>
  );
}

// Search state is kept close to where it's used
function SearchSection() {
  const [search, setSearch] = useState("");
  return (
    <div>
      <input value={search} onChange={e => setSearch(e.target.value)} />
      <SearchResults query={search} />
    </div>
  );
}

// Widgets use memo as a safety net
const RevenueWidget = memo(function RevenueWidget({ revenue }) {
  console.log("RevenueWidget rendered");
  return <div className="widget">Revenue: \${revenue.toLocaleString()}</div>;
});

const UsersWidget = memo(function UsersWidget({ users }) {
  console.log("UsersWidget rendered");
  return <div className="widget">Active Users: {users}</div>;
});

const OrdersWidget = memo(function OrdersWidget({ orders }) {
  console.log("OrdersWidget rendered");
  return <div className="widget">Orders: {orders}</div>;
});

function SearchResults({ query }) {
  if (!query) return null;
  return <p>Results for: {query}</p>;
}`,
      explanation: "The fix is state colocation: search state moved from DashboardGood into SearchSection. Now typing only re-renders SearchSection, not the widgets. React.memo on widgets is a safety net in case more state is added to Dashboard later. No useMemo or useCallback needed — just putting state in the right place."
    },
    {
      title: "Implement the Children Pattern for a Resizable Sidebar Layout",
      difficulty: "mid",
      description: "Create a layout with a resizable sidebar. The sidebar toggle should NOT re-render the main content area. Use the children pattern.",
      solution: `import { useState } from "react";

// SidebarLayout owns the collapse state
function SidebarLayout({ sidebar, children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: "flex" }}>
      <aside style={{
        width: collapsed ? 60 : 250,
        transition: "width 0.3s",
        borderRight: "1px solid #ddd",
        overflow: "hidden"
      }}>
        <button onClick={() => setCollapsed(c => !c)}>
          {collapsed ? "→" : "←"}
        </button>
        {!collapsed && sidebar}
      </aside>
      <main style={{ flex: 1, padding: 20 }}>
        {/* children comes from App — same reference, won't re-render */}
        {children}
      </main>
    </div>
  );
}

// Sidebar navigation
function SidebarNav() {
  console.log("SidebarNav rendered");
  return (
    <nav>
      <a href="/dashboard">Dashboard</a>
      <a href="/settings">Settings</a>
    </nav>
  );
}

// Heavy main content
function MainContent() {
  console.log("MainContent rendered"); // Only logs on first render!
  const items = Array.from({ length: 5000 }, (_, i) => (
    <div key={i}>Row {i}</div>
  ));
  return <div>{items}</div>;
}

// App creates both — their references stay stable
function App() {
  return (
    <SidebarLayout sidebar={<SidebarNav />}>
      <MainContent />
    </SidebarLayout>
  );
}`,
      explanation: "When collapsed state changes in SidebarLayout, it re-renders. But children (MainContent) and sidebar (SidebarNav) were created in App, which didn't re-render. The references are the same, so React skips re-rendering MainContent. No memoization needed — just smart component structure."
    },
    {
      title: "Build a Re-render Tracker Component",
      difficulty: "hard",
      description: "Create a RenderTracker component and hook that visually highlights components when they re-render (similar to React DevTools). Use a flash effect that fades out.",
      solution: `import { useRef, useEffect, useCallback } from "react";

// Hook that flashes an outline on the element when the component re-renders
function useRenderHighlight(ref, color = "rgba(100, 200, 255, 0.4)") {
  const renderCount = useRef(0);
  const timeoutRef = useRef(null);

  renderCount.current += 1;

  useEffect(() => {
    // Skip the first render (mount)
    if (!ref.current || renderCount.current <= 1) return;

    const el = ref.current;
    // Show a colored outline
    el.style.outline = \`2px solid \${color}\`;
    el.style.transition = "outline-color 1s ease-out";

    // Fade it out after a short time
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      el.style.outlineColor = "transparent";
    }, 100);

    return () => clearTimeout(timeoutRef.current);
  });

  return renderCount.current;
}

// Wrapper that shows a render count badge on any component
function RenderTracker({ name, children }) {
  const ref = useRef(null);
  const count = useRenderHighlight(ref);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <span style={{
        position: "absolute",
        top: -8,
        right: -8,
        background: count > 5 ? "#ff4444" : "#4488ff",
        color: "white",
        borderRadius: "50%",
        width: 20,
        height: 20,
        fontSize: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999
      }}>
        {count}
      </span>
      {children}
    </div>
  );
}

// Usage example
function App() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");

  return (
    <div>
      <RenderTracker name="Counter">
        <button onClick={() => setCount(c => c + 1)}>
          Count: {count}
        </button>
      </RenderTracker>

      <RenderTracker name="Input">
        <input value={text} onChange={e => setText(e.target.value)} />
      </RenderTracker>

      <RenderTracker name="Static">
        <p>I re-render too! (because parent re-renders)</p>
      </RenderTracker>
    </div>
  );
}`,
      explanation: "useRenderHighlight counts renders with a ref and flashes an outline after each re-render (skipping the first mount). The badge turns red after 5 renders so you can spot problem areas. The effect runs on every render (no dependency array) to catch all re-renders. The timeout creates a flash-then-fade effect."
    }
  ],
  quiz: [
    {
      question: "Which of these does NOT trigger a re-render?",
      options: [
        "Calling setState with a new value",
        "Parent component re-rendering",
        "Mutating a useRef value",
        "Context value changing"
      ],
      correct: 2,
      explanation: "Changing ref.current does NOT cause a re-render. React can't detect ref changes. Re-renders only happen when: your own state changes, your parent re-renders, or a context value you use changes."
    },
    {
      question: "In React 18, how many re-renders does this code cause: setState(1); setState(2); setState(3);",
      options: [
        "3 re-renders",
        "1 re-render (batched)",
        "0 re-renders (deferred)",
        "Depends on whether it's in an event handler"
      ],
      correct: 1,
      explanation: "React 18 batches all state updates into one re-render, no matter where they happen. All three setState calls are grouped into a single render."
    },
    {
      question: "What does the children pattern achieve?",
      options: [
        "It makes children render faster",
        "It prevents children from re-rendering when the wrapper's state changes because the children JSX reference is stable from the parent",
        "It automatically memoizes children",
        "It enables concurrent rendering for children"
      ],
      correct: 1,
      explanation: "When children are passed from a parent that didn't re-render, the JSX reference stays the same. When the wrapper re-renders, React sees the same children reference and skips that subtree. No memoization needed."
    },
    {
      question: "React.memo prevents re-renders triggered by:",
      options: [
        "Context changes, parent re-renders, and state changes",
        "Only parent re-renders (when props haven't changed)",
        "All re-render triggers",
        "State changes and parent re-renders"
      ],
      correct: 1,
      explanation: "React.memo only stops re-renders from the parent when props are the same (shallow check). It does NOT stop re-renders from: (1) the component's own state changes, or (2) context changes. Context goes right through React.memo."
    },
    {
      question: "A component re-renders but the DOM doesn't change. What happened?",
      options: [
        "A bug in React",
        "React called the component function (render phase) but the output was identical, so no DOM mutations occurred (commit phase was a no-op)",
        "The component is memoized",
        "The browser optimized away the update"
      ],
      correct: 1,
      explanation: "This is normal. Rendering (calling the function) and committing (updating the DOM) are separate steps. If the output matches what was there before, React finds no differences and skips all DOM updates."
    }
  ]
};
