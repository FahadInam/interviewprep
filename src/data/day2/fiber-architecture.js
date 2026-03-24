export const fiberArchitecture = {
  id: "fiber-architecture",
  title: "React Fiber Architecture",
  icon: "\uD83E\uDDF5",
  tag: "React Core",
  tagColor: "var(--tag-react)",
  subtitle: "The internal engine that powers React's rendering, scheduling, and concurrent features",
  concepts: [
    {
      title: "What is Fiber and Why React Needed It",
      explanations: {
        layman: "Fiber lets React pause and resume its work, like a pause button on a video. Before Fiber, React had no pause button. Once it started updating the screen, it had to finish everything before doing anything else. If you tried to type while React was busy, your typing would freeze. With Fiber, React works in small pieces. After each piece, it asks: 'Is there something more urgent?' If yes, it stops, handles the urgent thing first, then comes back to finish.",
        mid: "Fiber is React's rendering engine, added in React 16. It replaced the old 'stack reconciler' that processed the whole component tree in one go. The old way was recursive and could not be stopped once started. For big trees, this froze the page. Fiber fixes this by using a loop instead of recursion. It processes one node at a time and can stop between nodes to let the browser handle user input. This gives React two key powers: (1) it can pause low-priority work to handle high-priority work, and (2) it can work on multiple UI updates at the same time.",
        senior: "Fiber is both an architecture and a data structure. Each Fiber node is a plain JS object holding the component type, props, state, effects, and tree pointers. The core insight: React replaced the JavaScript call stack with its own 'virtual stack.' Each Fiber is like a stack frame React fully controls — it can pause, resume, or discard it. The work loop processes one Fiber at a time, then checks if the browser needs control back (roughly every 5ms). If time is up, React yields and picks up where it left off next frame. The old recursive approach couldn't be paused because you can't freeze a JS call stack mid-execution. Fiber's linked list structure (child → sibling → return pointers) makes resuming trivial — the current position is just a pointer. This is what enables concurrent features like useTransition and Suspense."
      },
      realWorld: "You see Fiber working when you type in a search box while React renders a big list in the background. With useTransition, the input stays smooth because React pauses the list render to handle your keystrokes first.",
      whenToUse: "You do not use Fiber directly — it is React's internal engine. But knowing how it works helps you use concurrent features well (useTransition, useDeferredValue, Suspense), debug performance, and understand why render functions must be pure.",
      whenNotToUse: "You do not need to know Fiber internals for basic React work. Do not over-optimize based on Fiber knowledge. React's defaults work well for most apps. Focus on Fiber only when building high-performance UIs or debugging render issues.",
      pitfalls: "Do not assume renders happen all at once — in concurrent mode, a render can be paused and restarted. Side effects in render functions break because render may run more than once. Do not rely on render timing for measurements. Strict Mode double-calls renders in development to catch these issues.",
      codeExamples: [
        {
          title: "Old Stack Reconciler vs Fiber (Conceptual)",
          code: `// OLD WAY (before React 16):
// Uses recursion — cannot be stopped once started
function oldReconcile(element, container) {
  const children = element.props.children;
  children.forEach(child => {
    const node = createDOMNode(child);
    container.appendChild(node);
    oldReconcile(child, node); // Keeps calling itself until done
  });
  // Problem: blocks the page until the whole tree is done
}

// NEW WAY — FIBER (React 16+):
// Uses a loop — can stop and resume anytime
function workLoopConcurrent() {
  // Process one item at a time
  while (workInProgress !== null && !shouldYield()) {
    workInProgress = performUnitOfWork(workInProgress);
    // After each item, check if the browser needs control back
  }

  // If there is more work, schedule it for later
  if (workInProgress !== null) {
    return INCOMPLETE; // "I'll finish this later"
  }
  return COMPLETE;
}`
        }
      ]
    },
    {
      title: "Fiber Node Structure and Tree Traversal",
      explanations: {
        layman: "Think of a Fiber tree like a family tree. But instead of each parent knowing all their kids, they only know their first kid. Each kid knows the next kid in line (their sibling) and who their parent is. To visit everyone: go to the first kid, then visit each sibling one by one. When you run out of siblings, go back to the parent. This 'one step at a time' approach lets you stop anywhere and pick up where you left off.",
        mid: "A Fiber node has three main pointers: 'child' (first child), 'sibling' (next sibling), and 'return' (parent). This is a linked list version of a tree. To traverse: start at root, go to child. If no child, go to sibling. If no sibling, go back to parent and check its sibling. Repeat. Each Fiber also stores: type (function, class, or tag name), key, stateNode (the DOM node or class instance), pendingProps and memoizedProps, memoizedState (hooks list), updateQueue, flags (what DOM changes are needed), lanes (priority level), and alternate (its twin in the other tree for double buffering).",
        senior: "React maintains two Fiber trees simultaneously — 'current' (what's on screen) and 'workInProgress' (what's being built). This is double buffering: React works on the WIP copy without touching the current tree. When the WIP tree is complete, React swaps them with a single pointer change — the WIP becomes current. This swap is what makes commits appear atomic. The traversal is a depth-first walk: go down to children, process leaves, then move to siblings, then back up to parents. It mimics recursion but with explicit pointers instead of a call stack, which is why it can be paused and resumed. Each Fiber has an 'alternate' pointer to its twin in the other tree, so React can efficiently compare old vs new without creating everything from scratch."
      },
      realWorld: "Each node in React DevTools is backed by a Fiber. Your hooks are stored as a linked list on the fiber's memoizedState. When you call useState, React reads from this list. That is why hooks must always be called in the same order.",
      whenToUse: "Knowing the Fiber tree helps you debug with React DevTools, understand why hooks must be called in the same order every render, and understand why conditional hook calls are not allowed.",
      whenNotToUse: "Do not access or modify Fiber nodes in your app code. They are internal and can change between React versions. React does not expose Fiber APIs publicly.",
      pitfalls: "Do not confuse the Fiber tree with the React Element tree. Elements are created fresh each render and are read-only. Fibers are reused across renders and can be changed. Remember that 'child' is not an array — it points to the first child only. Siblings are connected through 'sibling' pointers.",
      codeExamples: [
        {
          title: "Fiber Node Shape (Simplified)",
          code: `// What a Fiber node looks like (simplified)
const fiberNode = {
  // === What is this node? ===
  tag: 0,              // 0=Function, 1=Class, 5=DOM element, etc.
  key: null,           // The key prop from JSX
  type: MyComponent,   // The actual function, class, or tag name ('div')

  // === Tree links (linked list) ===
  child: childFiber,   // Points to first child
  sibling: nextFiber,  // Points to next sibling
  return: parentFiber, // Points to parent

  // === Data ===
  stateNode: domNode,    // The real DOM node (for div, span, etc.)
  memoizedState: hook1,  // First hook in the hooks list
  memoizedProps: {},     // Props from last render
  pendingProps: {},      // Props for this render

  // === Work to do ===
  updateQueue: queue,    // Queued state updates
  flags: 0b00000010,    // What DOM changes are needed
  subtreeFlags: 0,       // Flags from children
  lanes: 0b00000001,    // Priority level

  // === Double buffer ===
  alternate: otherFiber, // Twin in the other tree
};

// Hooks are a linked list:
// fiber.memoizedState -> hook1 -> hook2 -> hook3 -> null
//                       (useState) (useEffect) (useMemo)
// This is why hooks must be called in the same order every render!`
        },
        {
          title: "Tree Traversal Order",
          code: `// Given this component tree:
// <App>
//   <Header>
//     <Logo />
//     <Nav />
//   </Header>
//   <Main>
//     <Article />
//   </Main>
// </App>

// How Fibers are linked:
// App.child = Header
// Header.child = Logo
// Header.sibling = Main
// Logo.sibling = Nav
// Logo.return = Header
// Nav.return = Header
// Main.child = Article
// Main.return = App

// React visits them in this order:
// 1. beginWork(App)       -> go down to child
// 2. beginWork(Header)    -> go down to child
// 3. beginWork(Logo)      -> no children (leaf)
// 4. completeWork(Logo)   -> go to sibling
// 5. beginWork(Nav)       -> no children (leaf)
// 6. completeWork(Nav)    -> no sibling, go up to parent
// 7. completeWork(Header) -> go to sibling
// 8. beginWork(Main)      -> go down to child
// 9. beginWork(Article)   -> no children (leaf)
// 10. completeWork(Article) -> no sibling, go up
// 11. completeWork(Main)  -> no sibling, go up
// 12. completeWork(App)   -> done!

// React can PAUSE between any two steps
// and continue later. This is how concurrent rendering works.`
        }
      ]
    },
    {
      title: "Render Phase vs Commit Phase and Priority Scheduling",
      explanations: {
        layman: "React does its work in two steps. Step 1 is the RENDER phase — React figures out what changed by comparing the new UI to the old one. Think of it as making a to-do list of changes. This step CAN be paused or restarted. Step 2 is the COMMIT phase — React applies all the changes to the screen at once. This step CANNOT be paused, so you never see a half-finished update. Priority decides the order: urgent things (like typing) go first, less urgent things (like loading data) wait.",
        mid: "The render phase walks the Fiber tree, calls your components, compares old and new output, and marks what DOM changes are needed. This phase is pure — no DOM changes happen. In concurrent mode, it can be paused, thrown away, or restarted. That is why your component functions must be pure — they may run more than once. The commit phase is synchronous and cannot be stopped. It has three steps: (1) Before Mutation — read from the DOM. (2) Mutation — change the DOM (add, update, remove nodes). (3) Layout — run useLayoutEffect and attach refs. After commit, useEffect runs later (after the browser paints). Priority uses 'lanes' — numbers that represent urgency. User input (SyncLane) beats transitions (TransitionLane). Higher-priority work can interrupt lower-priority rendering.",
        senior: "React uses a priority system called 'lanes' to decide which updates to process first. Think of it as highway lanes: user interactions (clicks, typing) get the fast lane and process synchronously. Transitions get a slower lane and can be interrupted. There are also lanes for continuous events (mouse move), default updates (normal setState), and idle work. When setState is called, React assigns a lane based on the context — inside startTransition gets a transition lane, inside an event handler gets a sync lane. During render, React only processes updates matching the current lane. If a higher-priority update arrives mid-render, React can abandon the current work and restart with the urgent update included. The commit phase is always synchronous: apply all DOM changes, swap the trees, run effects. This two-phase model (interruptible render + synchronous commit) is the heart of concurrent React."
      },
      realWorld: "When you wrap a page change in startTransition, React gives it low priority. If you type in a search box during that transition, the typing gets high priority and updates instantly. The page change finishes in the background. You get a responsive input with a slightly delayed page update.",
      whenToUse: "Knowing the two phases tells you where to put side effects: never in render, always in effects or event handlers. Knowing about priority helps you use useTransition and useDeferredValue — you are telling React which updates can wait.",
      whenNotToUse: "Do not try to control React's scheduling manually. Use the provided APIs (useTransition, useDeferredValue). Do not assume exact timing for when phases run — React adapts based on workload.",
      pitfalls: "Do not put side effects in the render phase (component body) — they will run multiple times in concurrent mode. useEffect does NOT run during commit — it runs after the browser paints. useLayoutEffect runs during commit, before the paint. A concurrent render can be thrown away — any work in the render phase may be discarded if a more urgent update arrives.",
      codeExamples: [
        {
          title: "useTransition — Leveraging Priority Scheduling",
          code: `import { useState, useTransition, memo } from 'react';

// A slow list component
const BigList = memo(function BigList({ filter }) {
  // Imagine rendering 10,000 filtered items
  const items = getFilteredItems(filter);
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
});

function SearchPage() {
  const [text, setText] = useState('');
  const [filter, setFilter] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    const value = e.target.value;

    // HIGH PRIORITY: input updates right away
    setText(value);

    // LOW PRIORITY: list update can be interrupted
    startTransition(() => {
      setFilter(value);
    });
  };

  return (
    <div>
      <input value={text} onChange={handleChange} />
      {isPending && <span>Updating list...</span>}
      <BigList filter={filter} />
    </div>
  );
}

// What happens step by step:
// 1. User types 'a' -> handleChange runs
// 2. setText('a') -> high priority (SyncLane)
// 3. setFilter('a') -> low priority (TransitionLane)
// 4. React handles SyncLane first -> input shows 'a' instantly
// 5. React starts rendering BigList with filter='a'
// 6. User types 'ab' -> new high priority update
// 7. React STOPS the BigList render
// 8. Handles SyncLane -> input shows 'ab' instantly
// 9. Restarts BigList render with filter='ab'
// 10. When user stops typing, BigList render finishes`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "What is React Fiber and why was it introduced? What problem did the old stack reconciler have?",
      answer: "React Fiber is the rewrite of React's rendering engine, shipped in React 16. The old stack reconciler was recursive and synchronous — once it started, it processed the entire tree without stopping. For big trees, this blocked the main thread and caused frozen inputs and janky animations. The problem was that work lived on the JS call stack, which cannot be paused. Fiber's fix: replace the call stack with a linked list of Fiber nodes. Each Fiber is like a stack frame that React controls. The work loop processes one Fiber at a time and checks shouldYield() between each one — asking 'does the browser need the thread back?' If yes, React pauses and continues later via MessageChannel. If a more urgent update arrives (like user typing), React can interrupt the current work. This one change made all concurrent features possible: useTransition, Suspense, selective hydration, and streaming SSR. By owning the 'stack,' React can prioritize, interrupt, resume, and cancel rendering work.",
      difficulty: "mid",
      followUps: [
        "How does React's scheduler determine when to yield control back to the browser?",
        "Can you explain the difference between synchronous and concurrent rendering modes?"
      ]
    },
    {
      question: "Describe the structure of a Fiber node. What are child, sibling, and return pointers?",
      answer: "A Fiber node is a JS object that represents one component or DOM element. The tree uses three pointers instead of a children array: 'child' points to the first child only, 'sibling' points to the next sibling, and 'return' points to the parent. For example, if App has Header and Main as children: App.child=Header, Header.sibling=Main, and both have return=App. Header's children Logo and Nav are linked as Header.child=Logo, Logo.sibling=Nav. Beyond tree pointers, a Fiber stores: tag (component type), type (the function/class/string), stateNode (DOM node or class instance), memoizedState (hooks linked list for function components), memoizedProps and pendingProps, updateQueue (pending state updates), flags (bitmask for needed DOM changes like Placement, Update, Deletion), lanes (priority bits), and alternate (pointer to the twin Fiber in the other tree for double buffering). Hooks must be called in the same order every render because each hook maps to a position in the memoizedState linked list.",
      difficulty: "hard",
      followUps: [
        "Why does React use a linked list structure instead of a children array for the Fiber tree?",
        "What is the 'alternate' field and how does double buffering work in React?"
      ]
    },
    {
      question: "Explain the render phase and commit phase in React. Why are they separated?",
      answer: "React splits work into two phases. The Render Phase walks the Fiber tree, calls component functions, diffs old and new output, and marks what DOM changes are needed. It makes NO DOM changes — it is pure computation. In concurrent mode it can be paused, thrown away, or restarted, and your component may be called more than once. The Commit Phase takes the finished work and applies it to the DOM. It is synchronous and cannot be stopped. It has three steps: Before Mutation (read from DOM), Mutation (add/remove/update DOM nodes), and Layout (run useLayoutEffect, attach refs). After commit, useEffect runs later after the browser paints. They are separated for two reasons: (1) The render phase must be pure so it can safely be interrupted and restarted. (2) The commit phase must be synchronous so users never see half-finished UI — all changes apply together or not at all. This split is what makes concurrent features work — React can prepare new UI in the background without showing incomplete work.",
      difficulty: "hard",
      followUps: [
        "What are the sub-phases of the commit phase and what happens in each?",
        "Why must the commit phase be synchronous?"
      ]
    },
    {
      question: "What are lanes in React's scheduling system? How do they relate to concurrent rendering?",
      answer: "Lanes are a bitmask priority system for updates. Each lane is a bit in a 31-bit number. From highest to lowest priority: SyncLane (clicks, key presses), InputContinuousLane (mousemove, scroll), DefaultLane (normal setState), TransitionLanes (16 lanes for startTransition), RetryLanes (Suspense retries), and IdleLane (background work). When you call setState, React picks a lane based on context — event handlers get SyncLane, startTransition gets TransitionLane. The scheduler picks the highest-priority pending lane and renders those updates first. Lower-priority updates wait. During concurrent rendering, if a higher-priority update arrives, shouldYield returns true, the current render is dropped, and React restarts with the higher-priority work included. Lanes use bitwise operations which are very fast. Lanes replaced the old expiration time model because expiration times could not express 'skip this update now but include it later' — which Suspense and selective hydration need.",
      difficulty: "hard",
      followUps: [
        "Why did React switch from expiration times to lanes?",
        "How do the 16 transition lanes work and why are there multiple?"
      ]
    },
    {
      question: "How does Fiber enable features like Suspense and concurrent rendering?",
      answer: "Fiber makes these features possible through its interruptible, resumable design. For Suspense: when a component throws a Promise (meaning 'not ready yet'), React catches it during the render phase. Because Fiber keeps its state in objects (not on the call stack), React can mark that subtree as suspended, show the fallback instead, and save the partial work. When the Promise resolves, React retries from where it stopped. For concurrent rendering: the work loop processes one Fiber at a time and checks shouldYield() between each one. When a low-priority update (startTransition) is being rendered and a high-priority input arrives, React stops the transition render, handles the input first, then goes back to the transition. Double buffering (current vs workInProgress trees) means incomplete renders never show on screen — only finished renders get swapped in during commit. For streaming SSR, Fiber lets React hydrate components one at a time based on priority. If a user clicks an unhydrated component, React hydrates that one first. None of this is possible with the old synchronous recursive approach.",
      difficulty: "hard",
      followUps: [
        "How does Suspense catch the thrown Promise during the render phase?",
        "What happens to the partially rendered work-in-progress tree when a render is interrupted?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Visualize the Render-Commit Phases with Logging",
      difficulty: "mid",
      description: "Create a component tree that uses console.log to demonstrate when the render phase and commit phase happen, including the timing of useEffect and useLayoutEffect. Include a parent and child component to show the order of operations.",
      solution: `import { useState, useEffect, useLayoutEffect, useRef } from 'react';

function Child({ value }) {
  console.log('[RENDER] Child runs, value:', value);

  useLayoutEffect(() => {
    console.log('[COMMIT] Child useLayoutEffect runs');
    console.log('  DOM is updated but NOT painted yet');
    return () => {
      console.log('[COMMIT] Child useLayoutEffect CLEANUP');
    };
  }, [value]);

  useEffect(() => {
    console.log('[AFTER PAINT] Child useEffect runs');
    console.log('  Browser has painted, user can see changes');
    return () => {
      console.log('[AFTER PAINT] Child useEffect CLEANUP');
    };
  }, [value]);

  return <div>Child: {value}</div>;
}

function Parent() {
  const [count, setCount] = useState(0);
  const renders = useRef(0);
  renders.current++;

  console.log('[RENDER] Parent render #' + renders.current);

  useLayoutEffect(() => {
    console.log('[COMMIT] Parent useLayoutEffect');
    return () => {
      console.log('[COMMIT] Parent useLayoutEffect CLEANUP');
    };
  }, [count]);

  useEffect(() => {
    console.log('[AFTER PAINT] Parent useEffect');
    return () => {
      console.log('[AFTER PAINT] Parent useEffect CLEANUP');
    };
  }, [count]);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => {
        console.log('--- CLICK: updating state ---');
        setCount(c => c + 1);
      }}>
        Add One
      </button>
      <Child value={count} />
    </div>
  );
}

// What you see in console when clicking (count 0 -> 1):
// --- CLICK: updating state ---
// [RENDER] Parent render #2
// [RENDER] Child runs, value: 1
// -- render done, commit starts --
// [COMMIT] Child useLayoutEffect CLEANUP (old)
// [COMMIT] Parent useLayoutEffect CLEANUP (old)
// [COMMIT] Child useLayoutEffect runs
// [COMMIT] Parent useLayoutEffect
// -- browser paints --
// [AFTER PAINT] Child useEffect CLEANUP (old)
// [AFTER PAINT] Parent useEffect CLEANUP (old)
// [AFTER PAINT] Child useEffect runs
// [AFTER PAINT] Parent useEffect

// Key takeaways:
// 1. Render: parent first, then child (top down)
// 2. Layout effects: child first, then parent (bottom up)
// 3. Cleanup runs BEFORE setup for each effect
// 4. useEffect runs AFTER the browser paints

export default Parent;`,
      explanation: "This shows React's rendering steps. The render phase runs components top-down (parent then child). The commit phase runs layout effects bottom-up (child then parent), with old cleanups before new setups. useEffect runs after the browser paints. Use useLayoutEffect when you need to measure the DOM before the user sees it. Use useEffect for everything else."
    },
    {
      title: "Demonstrate Concurrent Rendering with useTransition",
      difficulty: "hard",
      description: "Build a component that clearly demonstrates how React Fiber's concurrent rendering prioritizes urgent updates over transition updates. Include a text input and a heavy computed list, showing how the input stays responsive while the list renders in the background.",
      solution: `import { useState, useTransition, useDeferredValue, memo, useMemo } from 'react';

// A slow item — takes about 1ms to render
const SlowItem = memo(function SlowItem({ text }) {
  const start = performance.now();
  while (performance.now() - start < 1) {} // Fake delay
  return (
    <li style={{
      padding: '2px 8px',
      background: text.startsWith('>>') ? '#e8f5e9' : 'transparent'
    }}>
      {text}
    </li>
  );
});

function BigList({ filter, isPending }) {
  const items = useMemo(() => {
    const result = [];
    for (let i = 0; i < 500; i++) {
      const text = 'Item ' + i + (filter ? ' (filter: ' + filter + ')' : '');
      const matches = !filter || text.toLowerCase().includes(filter.toLowerCase());
      if (matches) {
        result.push(
          <SlowItem key={i} text={filter ? '>> ' + text : text} />
        );
      }
    }
    return result;
  }, [filter]);

  return (
    <ul style={{
      opacity: isPending ? 0.6 : 1,
      transition: 'opacity 0.2s',
      height: 400,
      overflow: 'auto'
    }}>
      {items}
    </ul>
  );
}

export default function ConcurrentDemo() {
  const [text, setText] = useState('');
  const [filter, setFilter] = useState('');
  const [isPending, startTransition] = useTransition();
  const [log, setLog] = useState([]);

  const handleChange = (e) => {
    const value = e.target.value;

    // HIGH PRIORITY: input updates right away
    setText(value);

    // LOW PRIORITY: list updates in the background
    startTransition(() => {
      setFilter(value);
      setLog(prev => [
        ...prev.slice(-4),
        new Date().toISOString().slice(11, 23) + ' Filter: ' + value
      ]);
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Concurrent Rendering Demo</h2>
      <p>Type fast — the input stays smooth while the list catches up.</p>

      <input
        value={text}
        onChange={handleChange}
        placeholder="Type to filter..."
        style={{ fontSize: 18, padding: 8, width: 300 }}
      />

      {isPending && (
        <span style={{ marginLeft: 12, color: '#999' }}>
          Updating list...
        </span>
      )}

      <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
        <strong>Update log:</strong>
        {log.map((entry, i) => <div key={i}>{entry}</div>)}
      </div>

      <BigList filter={filter} isPending={isPending} />
    </div>
  );
}

// How it works:
// 1. Each keystroke creates TWO updates with different priorities
// 2. SyncLane (text) renders and shows instantly — input is responsive
// 3. TransitionLane (filter) starts rendering the slow list
// 4. If another keystroke comes before the list finishes:
//    a. React sees a higher priority update
//    b. It drops the current list render
//    c. Updates the input first
//    d. Starts the list render again with the latest filter
// 5. The list only finishes rendering when you stop typing`,
      explanation: "This shows Fiber's main benefit: priority-based rendering. The work loop can stop a low-priority list render to handle a high-priority input update. Without Fiber, the input would freeze while the list renders. The key is the lane system — setState inside startTransition gets a low-priority TransitionLane, while the regular setText gets a high-priority SyncLane. React always handles higher lanes first."
    }
  ],
  quiz: [
    {
      question: "What was the primary limitation of React's old stack reconciler that Fiber was designed to solve?",
      options: [
        "It couldn't handle components with state",
        "It processed the entire tree synchronously and uninterruptibly, blocking the main thread",
        "It didn't support JSX compilation",
        "It couldn't render lists efficiently"
      ],
      correct: 1,
      explanation: "The old reconciler used recursive calls to walk the component tree. Once started, it could not stop until the whole tree was done. For big trees, this blocked the main thread long enough to cause frozen inputs and choppy animations. Fiber replaced this with a loop that can pause between steps."
    },
    {
      question: "In React's Fiber tree, how are children of a node connected?",
      options: [
        "Through a children array on the parent fiber",
        "Through a child pointer to the first child, and sibling pointers between children",
        "Through a Map of child keys to fiber nodes",
        "Through a doubly-linked list with prev and next pointers"
      ],
      correct: 1,
      explanation: "A Fiber node has a 'child' pointer to its FIRST child only. That first child has a 'sibling' pointer to the next child, and so on. Each child has a 'return' pointer back to the parent. This linked structure lets React walk the tree step by step without recursion."
    },
    {
      question: "During which phase can React interrupt and restart rendering in concurrent mode?",
      options: [
        "The commit phase",
        "The render phase",
        "Both the render and commit phases",
        "Neither — rendering is always synchronous"
      ],
      correct: 1,
      explanation: "Only the render phase can be interrupted. It does not change the DOM, so it is safe to stop and restart. The commit phase cannot be stopped because it changes the DOM — stopping halfway would leave the page in a broken state."
    },
    {
      question: "What mechanism does React use to ensure the user never sees a partially-rendered UI?",
      options: [
        "It locks the DOM during rendering",
        "Double buffering — maintaining current and work-in-progress Fiber trees",
        "It uses requestAnimationFrame to sync with the display",
        "It clones the entire DOM before making changes"
      ],
      correct: 1,
      explanation: "React keeps two Fiber trees: 'current' (what is on screen) and 'work-in-progress' (being built). All render work happens on the WIP tree. Only when rendering is fully done does React swap the WIP tree to become the new current tree. If rendering is interrupted, the current tree stays the same — the user never sees incomplete work."
    }
  ]
};
