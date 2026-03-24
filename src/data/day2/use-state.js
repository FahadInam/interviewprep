export const useStateTopic = {
  id: "use-state",
  title: "useState Deep Dive",
  icon: "\uD83D\uDCE6",
  tag: "React Core",
  tagColor: "var(--tag-react)",
  subtitle: "How React stores, updates, and batches component state under the hood",
  concepts: [
    {
      title: "useState Internals — How State Lives in Fiber",
      explanations: {
        layman: "useState gives your component a memory that stays between renders. Picture numbered boxes on a shelf. Each useState call gets one box. Box 1 holds your first state, Box 2 holds your second, and so on. React always reads them in order: Box 1, Box 2, Box 3. This is why you can never put useState inside an if-block. If you skip Box 2 sometimes, React grabs Box 3's data when it looks for Box 2, and everything breaks.",
        mid: "Every function component has a Fiber node. That Fiber has a memoizedState field with a linked list of hooks. Each useState call matches one node in this list. On the first render, React creates a hook object for each call: { memoizedState: initialValue, queue: updateQueue, next: nextHook }. On re-renders, React walks the list in order and returns each hook's current value. The setState function is tied to that hook's update queue. When you call setState, React adds an update to the queue and schedules a re-render. During re-render, React processes all queued updates to get the new state.",
        senior: "useState is actually useReducer under the hood — it uses a simple reducer: if the action is a function, call it with current state; otherwise, just use the action as the new state. Each setState call queues an update, and React processes all queued updates in order during the next render. Key optimization: if you call setState with the same value (compared with Object.is), React bails out early and skips the re-render entirely — this is why immutable updates matter. Multiple setState calls in the same event handler get batched into one re-render (React 18+ batches everywhere, not just event handlers). The functional form `setState(prev => prev + 1)` is essential inside closures, intervals, and event listeners where the closure captures a stale value."
      },
      realWorld: "Every useState in your component creates one node in the Fiber's hook list. Three useState calls means three nodes. This is why the 'Rules of Hooks' exist. Calling hooks in a different order would make React read the wrong node and return wrong values.",
      whenToUse: "useState is the main way to add local state to function components. Use it for any data that should trigger a re-render when changed: form inputs, toggles, counters, selected items, show/hide flags.",
      whenNotToUse: "For complex state with many related values, useReducer is clearer. For global state shared across many components, use context or a state library. For values that should persist but not cause re-renders, use useRef.",
      pitfalls: "Calling useState in conditions or loops breaks hook order. State does not update right away after setState — it is queued. Forgetting functional updaters leads to stale state bugs. Storing data you could compute from other state is wasteful.",
      codeExamples: [
        {
          title: "Hook Linked List in Action",
          code: `function MyComponent() {
  // Each useState creates a node in the hook list
  const [name, setName] = useState('Alice');   // hook 1
  const [age, setAge] = useState(25);          // hook 2
  const [active, setActive] = useState(true);  // hook 3

  // Inside React, the list looks like:
  // hook1: { value: 'Alice', next: hook2 }
  //   -> hook2: { value: 25, next: hook3 }
  //     -> hook3: { value: true, next: null }

  // On re-render, React reads them in order:
  // 1st useState -> gets 'Alice'
  // 2nd useState -> gets 25
  // 3rd useState -> gets true

  // BAD: This breaks the list order!
  // if (someCondition) {
  //   const [extra, setExtra] = useState('oops');
  //   // Now the order is wrong on next render
  // }

  return <div>{name}, {age}, {active.toString()}</div>;
}`
        }
      ]
    },
    {
      title: "Lazy Initialization",
      explanations: {
        layman: "Think of setting up a kitchen. If prep is easy (grabbing salt), you can do it every time. But if it is expensive (grinding spices for 30 minutes), you only want to do it once on the first day. Lazy initialization tells React: 'Here is how to make the first value. Only run this once.'",
        mid: "When you write useState(expensiveFunction()), that function runs on EVERY render, even though React only uses the result on the first render. This is wasteful. Instead, pass a function: useState(() => expensiveFunction()). React calls it only on the first render. On re-renders, the function is ignored — React reads the current value from the hook's stored state.",
        senior: "On the first render, React checks if the initial value is a function — if so, it calls it once and stores the result. On every re-render, React completely ignores the initializer and reads from its stored state. This matters when the initializer does something expensive like reading localStorage or parsing a big JSON blob — without the function form, that work runs on every single render for nothing. The lazy initializer gets no arguments and should be pure. In Strict Mode, React calls it twice to catch side effects, but only uses the first result."
      },
      realWorld: "Common uses: reading from localStorage, parsing URL params, building data structures from props, creating unique IDs. Any expensive setup for initial state should use lazy initialization.",
      whenToUse: "When computing initial state is not trivial: reading localStorage, parsing data, filtering large lists, creating complex objects. The function form has zero cost on re-renders.",
      whenNotToUse: "For simple values like useState(0), useState(''), or useState(false). Creating a simple value is nearly free, so wrapping it in a function adds needless complexity.",
      pitfalls: "Passing a function directly: useState(myFunc) calls myFunc() on mount, which is correct but can confuse people. The initializer runs only once — if props change and you want state to reset, use the key pattern. Keep the initializer pure because Strict Mode calls it twice.",
      codeExamples: [
        {
          title: "Lazy Initialization vs Direct Computation",
          code: `// BAD: Runs on EVERY render
function TodoApp() {
  // JSON.parse runs every time the component renders
  const [todos, setTodos] = useState(
    JSON.parse(localStorage.getItem('todos')) || []
  );
}

// GOOD: Runs only ONCE on first render
function TodoApp() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });
  // On re-renders, the function above is never called
  return <TodoList todos={todos} />;
}

// ALSO GOOD: Named function for clarity
function makeGrid(rows, cols) {
  // Creates a big grid of objects
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      row: r, col: c, value: 0
    }))
  );
}

function GridEditor() {
  // makeGrid only runs on the first render
  const [grid, setGrid] = useState(() => makeGrid(100, 100));
  return <Grid data={grid} onChange={setGrid} />;
}`
        }
      ]
    },
    {
      title: "Functional Updates vs Direct Value",
      explanations: {
        layman: "Imagine you and three friends each want to add $1 to a tip jar with $10 in it. If everyone looks at the jar at the same time and says 'make it $11', the jar ends up at $11 — not $14! That is the 'direct value' problem. Functional updates say 'whatever is in the jar right now, add $1.' Each person's dollar stacks correctly.",
        mid: "setState takes either a value or an updater function. With setState(count + 1), the value is based on count from the current closure. If you call this multiple times in one render cycle, they all use the same stale count. With setState(prev => prev + 1), React passes the latest state as prev. Multiple functional updates chain correctly: three calls go from 0 to 1 to 2 to 3. This matters when updates are batched together.",
        senior: "Functional updaters are essential in three scenarios: (1) Inside closures that capture stale state — intervals, timeouts, event listeners added once. (2) When calling setState multiple times in the same event — direct values all use the same snapshot, but updaters chain correctly. (3) In useCallback with an empty dependency array — `setCount(prev => prev + 1)` doesn't need `count` in deps. React processes updaters in order: if you call `setState(prev => prev + 1)` three times, it chains 0→1→2→3. Direct values just replace: `setState(count + 1)` three times with count=0 results in 1, not 3."
      },
      realWorld: "Functional updates are needed in event handlers with multiple updates, in setTimeout/setInterval where closure values go stale, and whenever the next state depends on the previous state. Common examples: counters, toggles, and adding items to arrays.",
      whenToUse: "Always use functional updates when the new state depends on the old state: counters, toggles, array push/filter/map, object updates. Also use them in callbacks that run later (timeouts, intervals, event listeners).",
      whenNotToUse: "When setting state to a brand new value that does not depend on the old one: setName('Alice'), setVisible(true), setSelectedId(id). Direct values are simpler here.",
      pitfalls: "Using setCount(count + 1) in setInterval always uses the initial count from the closure. Calling setState(prev => prev + 1) three times WILL add 3 — each call gets the result of the previous one. Mixing direct and functional updates works but can be confusing.",
      codeExamples: [
        {
          title: "Stale Closure Problem and Fix",
          code: `function Counter() {
  const [count, setCount] = useState(0);

  // BUG: count is always 0 inside the interval
  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1); // count is always 0 here!
    }, 1000);
    return () => clearInterval(id);
  }, []); // empty deps = count stays at 0 forever

  // FIX: Use a function to get the latest value
  useEffect(() => {
    const id = setInterval(() => {
      setCount(prev => prev + 1); // prev is always current
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <div>{count}</div>;
}

// WHY IT WORKS:
// The function gets the real current state from React,
// not the old value trapped in the closure.
// React runs: 0 => 0+1=1, then 1 => 1+1=2, and so on.`
        },
        {
          title: "Multiple Updates in Same Event",
          code: `function BatchingDemo() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    // WRONG: All three use count=0 from closure
    setCount(count + 1); // sets to 1
    setCount(count + 1); // sets to 1 again
    setCount(count + 1); // sets to 1 again
    // Result: count = 1 (not 3!)

    // RIGHT: Each gets the result of the one before it
    setCount(prev => prev + 1); // 0 -> 1
    setCount(prev => prev + 1); // 1 -> 2
    setCount(prev => prev + 1); // 2 -> 3
    // Result: count = 3
  };

  return <button onClick={handleClick}>{count}</button>;
}`
        }
      ]
    },
    {
      title: "State Identity and Object.is Comparison",
      explanations: {
        layman: "React is like a painter who checks 'is this the exact same can of paint as before?' If you hand them the same can, they skip repainting. If you give them a new can — even with the same color — they repaint. For numbers, 5 is always 5 (same can). But for objects, even {a: 1} and {a: 1} are different cans, so React repaints.",
        mid: "When you call setState, React uses Object.is() to compare old and new state. If they match, React skips the re-render. For numbers and strings, Object.is compares by value: Object.is(5, 5) is true. For objects and arrays, it compares by reference: Object.is({a:1}, {a:1}) is false because they are different objects in memory. So if you change a property on an existing object and pass the same object to setState, React sees the same reference and does nothing. You must create a new object or array for React to see the change.",
        senior: "React has two levels of bailout. First: if you call setState with the same value (checked with Object.is), React may skip scheduling a re-render entirely — this is the 'eager bailout' and happens before any rendering work. Second: even if React starts rendering, if the final computed state matches the previous state, React can skip re-rendering children. The gotcha: even with a bailout, React may still call your component function once (but not its children) — so don't assume setState with the same value means zero work. For objects, always create a new reference when something changed: `setState({ ...prev, name: 'new' })`. Mutating the existing object and passing it back won't trigger a re-render because Object.is sees the same reference."
      },
      realWorld: "This is why you must make new objects and arrays when updating state. Use [...items, newItem] instead of items.push(newItem). Use {...user, name: 'New'} instead of user.name = 'New'. Mutating the same reference is the most common state bug in React — state changes but the UI stays the same.",
      whenToUse: "You need to understand Object.is for all state updates with objects, arrays, Maps, or Sets. It also helps with performance — setting state to the same primitive value is a no-op, which avoids needless renders.",
      whenNotToUse: "Do not try to outsmart React's comparison. Always create new references for changed state. Do not use deep equality checks as a replacement (use React.memo or useMemo for that).",
      pitfalls: "Mutating state directly: state.items.push(item); setState(state.items) — same reference, no re-render. Object.is(NaN, NaN) is true (unlike ===), so setting NaN repeatedly will not re-render. Passing the same object reference with changed properties will not trigger a re-render.",
      codeExamples: [
        {
          title: "Mutation vs Immutable Update",
          code: `function UserProfile() {
  const [user, setUser] = useState({ name: 'Alice', age: 25 });

  const birthdayBug = () => {
    // BUG: Same object, same reference
    user.age += 1;
    setUser(user);
    // Object.is(user, user) === true -> NO re-render!
  };

  const birthdayFixed = () => {
    // CORRECT: New object with spread
    setUser(prev => ({ ...prev, age: prev.age + 1 }));
    // New reference -> re-render happens
  };

  const [items, setItems] = useState(['a', 'b', 'c']);

  const addItemBug = () => {
    // BUG: push changes the same array
    items.push('d');
    setItems(items);
    // Same reference -> no re-render
  };

  const addItemFixed = () => {
    // CORRECT: Spread makes a new array
    setItems(prev => [...prev, 'd']);
    // New reference -> re-render happens
  };

  return (
    <div>
      <p>{user.name}, {user.age}</p>
      <button onClick={birthdayFixed}>Birthday</button>
      <ul>{items.map(i => <li key={i}>{i}</li>)}</ul>
      <button onClick={addItemFixed}>Add Item</button>
    </div>
  );
}`
        }
      ]
    },
    {
      title: "Automatic Batching in React 18+",
      explanations: {
        layman: "Think of a waiter at a restaurant. In React 17, the waiter runs to the kitchen after each order at a table. But for special orders (like from a timer), the waiter rushed each plate one at a time. React 18 upgraded the waiter to ALWAYS collect all orders first, then make one kitchen trip — no matter where the order comes from.",
        mid: "React 18's createRoot turns on automatic batching for ALL state updates, no matter where they happen. In React 17, only updates inside React event handlers were batched. Updates in setTimeout, Promise.then, or native event listeners caused a separate re-render for EACH setState. React 18 fixes this: all setState calls in the same task are grouped into one re-render. You can opt out with flushSync() when you need the DOM to update right away.",
        senior: "In React 18, batching works because setState doesn't immediately trigger a render — it queues the update and schedules a render for later (as a microtask). So all setState calls in the same synchronous block naturally batch together. This is why React 18 batches everywhere, not just in event handlers. In React 17, updates outside React event handlers (like setTimeout) triggered an immediate render per setState call — making 3 setState calls cause 3 re-renders. If you need the DOM to update immediately (e.g., to measure an element's size), use flushSync(() => setState(newValue)) — but this defeats batching, so use it sparingly."
      },
      realWorld: "If your app had fewer re-renders after upgrading to React 18, automatic batching is why. A common win: fetching data then setting multiple states in a .then() — React 17 re-rendered for each setState, React 18 does it once.",
      whenToUse: "Automatic batching is always on in React 18. Feel free to call multiple setState functions knowing React will batch them. Group related state updates together.",
      whenNotToUse: "Use flushSync only when you need the DOM to update before the next line runs (e.g., measuring the DOM after a state change). flushSync is an escape hatch, not a regular pattern.",
      pitfalls: "Code that relied on React 17's unbatched behavior in setTimeout/Promise may behave differently in React 18. Reading state right after setState still shows the old value. flushSync inside event handlers can hurt performance. Mixing flushSync and batched updates can cause confusing render order.",
      codeExamples: [
        {
          title: "React 17 vs React 18 Batching",
          code: `function FetchExample() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    // React 17: 2 re-renders (not batched here)
    // React 18: 1 re-render (batched)

    try {
      const res = await fetch('/api/data');
      const json = await res.json();

      setData(json);
      setLoading(false);
      // React 17: 2 more re-renders
      // React 18: 1 re-render for both
    } catch (err) {
      setError(err.message);
      setLoading(false);
      // React 17: 2 re-renders
      // React 18: 1 re-render
    }
  };

  // Total for a successful fetch:
  // React 17: 4 re-renders
  // React 18: 2 re-renders

  return (
    <div>
      <button onClick={fetchData}>Fetch</button>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {data && <pre>{JSON.stringify(data)}</pre>}
    </div>
  );
}`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "How does useState work internally in React? Where is state actually stored?",
      answer: "State is stored on the Fiber node, not in the component function. Each component has a Fiber in React's tree. The Fiber's memoizedState field holds a linked list of hooks — each useState call is one node with a value and an update queue. On the first render, React creates these nodes in order. On re-renders, it walks the same list in the same order. This is why hook order must stay the same — the list is position-based. The setState function is dispatchSetState, pre-bound to that hook's queue. Calling it adds an update and schedules a re-render. During re-render, React processes all queued updates. A key detail: useState is actually useReducer with a simple reducer: (state, action) => typeof action === 'function' ? action(state) : action. That is why functional updates like setCount(prev => prev + 1) work.",
      difficulty: "hard",
      followUps: [
        "Why does React use a linked list for hooks instead of an array or object?",
        "What is the eager state bailout optimization?"
      ]
    },
    {
      question: "What is lazy initialization in useState and when should you use it?",
      answer: "Lazy initialization means passing a function to useState: useState(() => getValue()) instead of useState(getValue()). With the function form, React calls it only once on mount. With the direct call, getValue() runs on EVERY render, even though React ignores the result after the first render. Use it when computing initial state is expensive: reading localStorage, parsing JSON, building large data structures. For simple values like useState(0), it is not needed. Under the hood, React checks if the argument is a function and calls it only during mount. On re-renders, it reads from the stored state instead.",
      difficulty: "easy",
      followUps: [
        "What happens if you accidentally pass a function as state instead of as an initializer?",
        "Does the lazy initializer receive any arguments?"
      ]
    },
    {
      question: "Explain the difference between setState(newValue) and setState(prev => newValue). When does it matter?",
      answer: "setState(newValue) sets state to a fixed value from the current closure. setState(prev => newValue) is a functional update where React passes the current state as prev. It matters in two cases. First, multiple updates in one batch: calling setState(count + 1) three times when count is 0 all compute 1, because they all use the same count. Using setState(prev => prev + 1) three times correctly gives 3, because each call gets the result of the previous one. Second, stale closures: setState(count + 1) inside a setTimeout uses the old count from when the closure was created. Functional updates always get the latest state. Under the hood, direct values replace state, while updater functions are called with the accumulated state.",
      difficulty: "mid",
      followUps: [
        "Can you mix functional and direct updates for the same state? What happens?",
        "How does React's internal basicStateReducer work?"
      ]
    },
    {
      question: "Why does setting state with the same value not cause a re-render? How does React detect this?",
      answer: "React uses Object.is() to compare old and new state. If they match, React skips the re-render. This check happens in two places. First, in the dispatch function (eager bailout): if there are no pending updates, React computes the new state and compares with Object.is. If equal, it does not even schedule a re-render. Second, during the render phase: after processing all updates, if the result matches the old state via Object.is, React can skip the subtree. For numbers and strings, this works simply: Object.is(5, 5) is true. For objects, it compares references: Object.is({a:1}, {a:1}) is false. That is why mutations do not trigger re-renders (same reference) and you must create new objects. One subtle point: even with a bailout, React may still render the component itself (but not children) before realizing nothing changed.",
      difficulty: "mid",
      followUps: [
        "What is the difference between Object.is and === in this context?",
        "What happens if you setState with the same object reference but mutated properties?"
      ]
    },
    {
      question: "What is a stale closure in React, and how does it relate to useState?",
      answer: "A stale closure happens when a function captures an old value and uses it instead of the current one. In React, each render creates its own snapshot of state and props. If a callback (setTimeout, interval, event listener) is created during render N, it still sees render N's values even when called later. Classic example: an interval that calls setCount(count + 1) with empty deps always uses count = 0 from the first render, so it always sets state to 1. The fix is a functional update: setCount(prev => prev + 1), which gets the latest state from React. Other fixes include using a ref to hold the current value, or listing the right dependencies. Stale closures are the most common hooks bug.",
      difficulty: "mid",
      followUps: [
        "How can useRef help solve stale closure problems?",
        "Why doesn't React just always give you the latest state value?"
      ]
    },
    {
      question: "When should you use multiple useState calls vs a single useReducer?",
      answer: "Use multiple useState calls for independent state that changes for different reasons: a name field and a modal toggle. Each has its own setter and they do not interact. Use useReducer when: (1) Multiple values always change together — like data, loading, and error for a fetch. A reducer handles these as one action. (2) Next state needs complex logic from previous state — a reducer keeps this logic in one place. (3) You want testable state logic — reducers are pure functions. (4) You pass dispatch via context — dispatch has a stable reference unlike individual setters. Rule of thumb: if you call 3+ setState functions together every time, or one setState depends on another state value, consider useReducer.",
      difficulty: "mid",
      followUps: [
        "Why is the dispatch function from useReducer referentially stable?",
        "Can you implement useReducer using useState, or vice versa?"
      ]
    },
    {
      question: "Explain React 18's automatic batching. How does it differ from React 17?",
      answer: "In React 17, batching only worked inside React event handlers. Updates in setTimeout, Promise callbacks, or native event listeners caused a separate re-render for each setState. React 18 with createRoot batches ALL updates no matter where they happen. Internally, React 17 used a flag to track if code was inside React-managed context. Inside, setState queued without flushing. Outside, each setState flushed immediately. React 18 removes this split — all updates use the same scheduler. Every setState enqueues an update and calls ensureRootIsScheduled, which avoids duplicate scheduling. The render runs as a microtask, naturally batching all synchronous setState calls. So a Promise.then with three setState calls causes one render in React 18 vs three in React 17. Use flushSync for the rare case when you need the DOM to update immediately.",
      difficulty: "hard",
      followUps: [
        "How does flushSync interact with automatic batching?",
        "What migration issues might arise when moving from React 17 to 18 due to batching changes?"
      ]
    },
    {
      question: "How does the 'key' prop interact with component state? How can you use it to reset state?",
      answer: "React uses component type + key to decide identity during reconciliation. Same type and key means React keeps the Fiber and all its state. Different key means React treats it as a new component — it unmounts the old one (destroying state, running cleanup) and mounts a new one (fresh state, mount effects). You can use this to reset state: <ProfileForm key={userId} userId={userId} />. When userId changes, the key changes, so React creates a fresh ProfileForm. This is cleaner than using useEffect to reset state on prop change, which renders once with stale state before resetting. At the Fiber level, a key mismatch causes React to delete the old Fiber and create a new one — no attempt to update it.",
      difficulty: "mid",
      followUps: [
        "What is the difference between using key to reset state vs. using useEffect to reset state?",
        "Why is the key-based reset pattern considered more correct?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Implement a Custom useState Hook",
      difficulty: "hard",
      description: "Implement a simplified version of useState that demonstrates the core mechanics: storing state in a persistent array, returning [state, setState], triggering re-renders, and supporting functional updates. Use a module-level state array to simulate Fiber storage.",
      solution: `// Simple useState implementation
// Shows how React stores hook state on Fiber nodes

let states = [];    // Like Fiber's memoizedState
let hookIndex = 0;  // Which hook we are on
let renderFn = null; // The component's render function

function useState(initialValue) {
  const i = hookIndex; // Save current position

  // First time: set up initial state
  if (states[i] === undefined) {
    states[i] =
      typeof initialValue === 'function' ? initialValue() : initialValue;
  }

  // Create setState for this hook
  const setState = (newValue) => {
    const current = states[i];

    // Support functional updates: prev => newValue
    const next =
      typeof newValue === 'function'
        ? newValue(current)
        : newValue;

    // Skip re-render if value is the same
    if (Object.is(current, next)) {
      return;
    }

    states[i] = next;

    // Re-render: reset index and call render
    hookIndex = 0;
    renderFn();
  };

  hookIndex++;
  return [states[i], setState];
}

// === Demo ===
function render() {
  hookIndex = 0; // Reset for each render

  const [count, setCount] = useState(0);
  const [name, setName] = useState('Alice');

  console.log('Render:', { count, name });

  return {
    increment: () => setCount(prev => prev + 1),
    setName: (n) => setName(n),
    addThree: () => {
      // Shows functional update chaining
      setCount(prev => prev + 1);
      setCount(prev => prev + 1);
      setCount(prev => prev + 1);
    }
  };
}

// Start
renderFn = render;
const handlers = render();
// Logs: Render: { count: 0, name: 'Alice' }

handlers.increment();
// Logs: Render: { count: 1, name: 'Alice' }

handlers.addThree();
// Final: Render: { count: 4, name: 'Alice' }`,
      explanation: "This shows the core ideas behind useState: state stored by index (like hooks in a Fiber), position-based hook identity (why order matters), functional update support (calling updater with current state), and Object.is bailout. Real React uses a linked list instead of an array, stores hooks on Fiber nodes, and batches re-renders through a scheduler."
    },
    {
      title: "Fix the Stale State Bug",
      difficulty: "mid",
      description: "The following component has multiple stale state bugs. Identify and fix all of them. The component should: increment a counter every second, allow manual increment/decrement that works correctly with the interval, and display an accurate count.",
      solution: `import { useState, useEffect, useCallback, useRef } from 'react';

// BUGGY VERSION:
function BuggyCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1); // BUG 1: count is always 0
    }, 1000);
    return () => clearInterval(id);
  }, []); // BUG 2: empty deps = stale count forever

  const increment = () => {
    setCount(count + 1); // BUG 3: rapid clicks miss increments
    setCount(count + 1); // Same value as line above
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+2</button>
    </div>
  );
}

// FIXED VERSION:
function FixedCounter() {
  const [count, setCount] = useState(0);

  // FIX 1: Functional update — no stale closure
  useEffect(() => {
    const id = setInterval(() => {
      setCount(prev => prev + 1); // Always uses latest state
    }, 1000);
    return () => clearInterval(id);
  }, []); // Empty deps is fine now

  // FIX 2: Functional updates for manual increment
  const increment = useCallback(() => {
    setCount(prev => prev + 1); // First +1
    setCount(prev => prev + 1); // Second +1 = total +2
  }, []);

  // Bonus: Reading count without stale closure
  const countRef = useRef(count);
  countRef.current = count; // Always up to date

  const logCount = useCallback(() => {
    console.log('Current count:', countRef.current);
  }, []);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+2</button>
      <button onClick={logCount}>Log Count</button>
    </div>
  );
}

export default FixedCounter;`,
      explanation: "The buggy version has three stale closure issues. The interval captures count=0 and never sees updates. The manual increment uses the same stale count twice, so +2 only adds 1. The fixes use functional updates (prev => prev + 1) which always get the latest state from React, bypassing the stale closure. The ref pattern is shown for reading (not writing) the latest state in callbacks."
    },
    {
      title: "Build a useUndoState Hook",
      difficulty: "mid",
      description: "Create a custom hook useUndoState(initialState) that returns [state, setState, undo, redo, canUndo, canRedo]. It should support undo/redo operations while maintaining proper React state semantics (immutable updates, functional updaters).",
      solution: `import { useState, useCallback, useRef } from 'react';

function useUndoState(initialState) {
  // Keep all history in one state object
  const [history, setHistory] = useState(() => ({
    past: [],
    present: typeof initialState === 'function' ? initialState() : initialState,
    future: []
  }));

  const setState = useCallback((updater) => {
    setHistory(prev => {
      const newValue = typeof updater === 'function'
        ? updater(prev.present)
        : updater;

      // Skip if nothing changed
      if (Object.is(prev.present, newValue)) {
        return prev;
      }

      return {
        past: [...prev.past, prev.present],  // Save current to past
        present: newValue,                     // Set new value
        future: []                             // Clear redo on new action
      };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.past.length === 0) return prev;

      const last = prev.past[prev.past.length - 1];

      return {
        past: prev.past.slice(0, -1),           // Remove last from past
        present: last,                            // Restore it
        future: [prev.present, ...prev.future]   // Save current to future
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory(prev => {
      if (prev.future.length === 0) return prev;

      const next = prev.future[0];

      return {
        past: [...prev.past, prev.present],  // Save current to past
        present: next,                        // Restore from future
        future: prev.future.slice(1)          // Remove first from future
      };
    });
  }, []);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  return [history.present, setState, undo, redo, canUndo, canRedo];
}

// Usage:
function DrawingApp() {
  const [color, setColor, undo, redo, canUndo, canRedo] = useUndoState('#000000');
  const [strokes, setStrokes, undoStroke, redoStroke, canUndoStroke, canRedoStroke] =
    useUndoState([]);

  const addStroke = (points) => {
    setStrokes(prev => [...prev, { points, color }]);
  };

  return (
    <div>
      <input type="color" value={color} onChange={e => setColor(e.target.value)} />
      <button onClick={undoStroke} disabled={!canUndoStroke}>Undo Stroke</button>
      <button onClick={redoStroke} disabled={!canRedoStroke}>Redo Stroke</button>
      <p>Strokes: {strokes.length}</p>
      <p>History: {canUndoStroke ? 'can undo' : 'nothing to undo'}</p>
    </div>
  );
}

export { useUndoState };`,
      explanation: "This hook keeps past states, present state, and future states (for redo) in one state object. All updates are immutable — past is built with spread, future is cleared on new actions. The hook supports functional updates like useState, uses Object.is for bailout, and all functions are stable via useCallback. The key idea: store the whole history as one state value so undo/redo happens in a single re-render."
    },
    {
      title: "State Batching Behavior Quiz Component",
      difficulty: "easy",
      description: "Build a component that demonstrates and verifies React 18's batching behavior. Show a render counter and log when the component renders. Provide buttons that trigger state updates in different contexts (event handler, setTimeout, Promise) and show how many renders each causes.",
      solution: `import { useState, useRef, useEffect } from 'react';
import { flushSync } from 'react-dom';

function BatchingDemo() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);
  const [text, setText] = useState('initial');
  const renderCount = useRef(0);
  const [log, setLog] = useState([]);

  // Count each render
  renderCount.current++;

  const addLog = (msg) => {
    setLog(prev => [...prev, renderCount.current + ': ' + msg]);
  };

  // Log every render
  useEffect(() => {
    console.log('Render #' + renderCount.current, { count, flag, text });
  });

  // All 3 updates batch into 1 render
  const handleEventBatching = () => {
    setCount(c => c + 1);
    setFlag(f => !f);
    setText('event-' + Date.now());
    addLog('Event: 3 setStates -> 1 render');
  };

  // React 18: also batched into 1 render
  const handleTimeoutBatching = () => {
    setTimeout(() => {
      setCount(c => c + 1);
      setFlag(f => !f);
      setText('timeout-' + Date.now());
      addLog('setTimeout: 3 setStates -> 1 render in React 18');
    }, 0);
  };

  // React 18: also batched into 1 render
  const handlePromiseBatching = () => {
    Promise.resolve().then(() => {
      setCount(c => c + 1);
      setFlag(f => !f);
      setText('promise-' + Date.now());
      addLog('Promise: 3 setStates -> 1 render in React 18');
    });
  };

  // flushSync forces immediate render
  const handleFlushSync = () => {
    flushSync(() => {
      setCount(c => c + 1);
    });
    // DOM is updated here already
    addLog('flushSync: forced immediate render');

    // This causes a second render
    setFlag(f => !f);
    setText('flushed-' + Date.now());
    addLog('Remaining updates: batched in a second render');
  };

  return (
    <div style={{ fontFamily: 'monospace', padding: 16 }}>
      <h3>Batching Demo (renders: {renderCount.current})</h3>
      <div>count={count}, flag={flag.toString()}, text={text}</div>

      <div style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
        <button onClick={handleEventBatching}>Event (1 render)</button>
        <button onClick={handleTimeoutBatching}>setTimeout (1 render)</button>
        <button onClick={handlePromiseBatching}>Promise (1 render)</button>
        <button onClick={handleFlushSync}>flushSync (2 renders)</button>
      </div>

      <div style={{ background: '#f5f5f5', padding: 8, maxHeight: 200, overflow: 'auto' }}>
        {log.map((entry, i) => (
          <div key={i} style={{ fontSize: 12 }}>{entry}</div>
        ))}
      </div>
    </div>
  );
}

export default BatchingDemo;`,
      explanation: "This component shows React 18's batching in action. The render counter (useRef) goes up each time the function runs, showing exact render counts. Event handler, setTimeout, and Promise all batch 3 setState calls into 1 render in React 18. flushSync forces an immediate render, splitting updates into 2 renders. This helps you see and verify batching behavior."
    }
  ],
  quiz: [
    {
      question: "Where is React state stored for function components?",
      options: [
        "In a global state object managed by React",
        "In the component function's closure scope",
        "In a linked list on the component's Fiber node (memoizedState)",
        "In the DOM element's dataset attributes"
      ],
      correct: 2,
      explanation: "Each function component has a Fiber node in React's internal tree. The Fiber's memoizedState field holds a linked list of hook objects. Each useState call is one node in this list. This is why hooks must be called in the same order every render — React finds hooks by their position in the list."
    },
    {
      question: "What is the output of this code?\n\nconst [count, setCount] = useState(0);\nsetCount(count + 1);\nsetCount(count + 1);\nsetCount(count + 1);\nconsole.log('count:', count);",
      options: [
        "count: 3",
        "count: 1",
        "count: 0",
        "It throws an error"
      ],
      correct: 2,
      explanation: "console.log runs right away and count is still 0 because setState does not change the variable immediately — it queues an update. All three setCount(count + 1) calls use count = 0, so they all compute 1. The next render will have count = 1 (not 3). To get 3, use functional updates: setCount(prev => prev + 1) three times."
    },
    {
      question: "What is lazy initialization in useState?",
      options: [
        "Deferring state creation until the component mounts",
        "Passing a function to useState that's only called on the initial render",
        "Using React.lazy to load state asynchronously",
        "Setting state to undefined initially and loading it later"
      ],
      correct: 1,
      explanation: "Lazy initialization means passing a function to useState: useState(() => expensiveWork()). React calls this function only on the first render to get the initial value. On re-renders, the function is ignored — React reads the current value from the hook's stored state. This avoids running expensive work on every render."
    },
    {
      question: "Why does mutating an object and calling setState with it NOT trigger a re-render?",
      options: [
        "React doesn't support object state",
        "The mutation happens too fast for React to detect",
        "Object.is returns true because it's the same reference, so React bails out",
        "setState only works with primitive values"
      ],
      correct: 2,
      explanation: "React uses Object.is() to compare old and new state. For objects, Object.is checks by reference, not by content. If you change a property on an object and pass the same object to setState, Object.is(obj, obj) is true, so React thinks nothing changed and skips the re-render. You must create a new object ({ ...obj, changed: true }) to get a new reference."
    },
    {
      question: "In React 18, how many re-renders does this code cause?\n\nsetTimeout(() => {\n  setA(1);\n  setB(2);\n  setC(3);\n}, 0);",
      options: [
        "3 re-renders (one per setState)",
        "1 re-render (all batched)",
        "0 re-renders (setTimeout updates are ignored)",
        "It depends on the React version — 3 in React 17, 1 in React 18"
      ],
      correct: 3,
      explanation: "This depends on the version. In React 17, updates inside setTimeout were NOT batched — each setState caused its own re-render, so 3 total. In React 18 with createRoot, ALL updates are batched no matter where they happen, so all three setState calls cause just 1 re-render. This is one of the biggest improvements in React 18."
    },
    {
      question: "What happens when you call useState inside a condition?\n\nif (showName) {\n  const [name, setName] = useState('Alice');\n}",
      options: [
        "It works fine — React handles conditional hooks",
        "It breaks the hook order, causing state values to be read from wrong positions in the linked list",
        "React throws a runtime error and crashes the app",
        "The state is created but never cleaned up, causing a memory leak"
      ],
      correct: 1,
      explanation: "React finds hooks by their position in the list. If showName is true on one render (creating 'name' as hook #2), but false on the next (skipping it), all hooks after it shift position. Hook #3 now reads hook #2's data, hook #4 reads hook #3's data, and so on. React warns about this in development, but the real danger is wrong state values and crashes."
    }
  ]
};
