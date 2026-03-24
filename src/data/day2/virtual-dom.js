export const virtualDom = {
  id: "virtual-dom",
  title: "Virtual DOM & Reconciliation",
  icon: "\uD83C\uDF33",
  tag: "React Core",
  tagColor: "var(--tag-react)",
  subtitle: "How React efficiently updates the UI through its virtual representation of the DOM",
  concepts: [
    {
      title: "What is the Virtual DOM?",
      explanations: {
        layman: "The Virtual DOM is like a rough draft of your webpage. Instead of changing the real page every time something updates (which is slow), React keeps a cheap copy in memory. When something changes, React updates the copy, compares the new copy with the old one, and only changes the parts of the real page that are different. Think: draft, compare, update.",
        mid: "The Virtual DOM is a plain JavaScript object tree that mirrors the real DOM. When state changes, React builds a new VDOM tree, compares it with the old one, and figures out the smallest set of real DOM changes needed. JSX like <div> compiles to React.createElement() calls that return simple objects with type, props, and children. These objects are very cheap to create compared to real DOM nodes.",
        senior: "The VDOM is a tree of React Elements — plain JS objects from React.createElement(type, props, ...children). Each element is immutable and represents a UI snapshot. In React 18+, the Fiber reconciler converts these into Fiber nodes (mutable work units). The VDOM is not Shadow DOM (a browser spec). Its main value is not that JS is faster than DOM — it is that it provides a declarative model while batching DOM writes. Cost: O(n) diff + minimal DOM mutations. The same element tree can target DOM, native views (React Native), or strings (SSR)."
      },
      realWorld: "Every React component produces VDOM elements. When you write <div className='box'><span>{text}</span></div>, JSX turns it into React.createElement calls that return a plain object tree. React then compares this tree with the previous one to find what changed.",
      whenToUse: "You always use the VDOM in React — it is the core idea. Understanding it helps you write faster components by knowing what causes re-renders and what makes diffing slow.",
      whenNotToUse: "If your app updates thousands of DOM nodes at 60fps (like a canvas game), VDOM overhead hurts. Use direct canvas/WebGL or libraries like PixiJS instead. For simple static pages, vanilla HTML or a lighter framework works better.",
      pitfalls: "The VDOM does not make everything fast — it adds overhead vs. direct DOM updates. Creating new object/array references in render causes unnecessary child re-renders. A parent re-render makes all children re-render (create new VDOM) unless you use React.memo.",
      codeExamples: [
        {
          title: "React Element Structure",
          code: `// JSX code:
const el = <div className="greeting"><h1>Hello</h1></div>;

// JSX compiles to this:
const el = React.createElement(
  'div',
  { className: 'greeting' },
  React.createElement('h1', null, 'Hello')
);

// Which creates this simple object (VDOM node):
// {
//   type: 'div',
//   props: {
//     className: 'greeting',
//     children: {
//       type: 'h1',
//       props: { children: 'Hello' }
//     }
//   }
// }`
        },
        {
          title: "Why VDOM Batching Matters",
          code: `// Without VDOM — each line updates the page separately (slow):
document.getElementById('name').textContent = 'Alice';
document.getElementById('age').textContent = '30';
document.getElementById('role').textContent = 'Engineer';
// 3 separate DOM writes = 3 possible reflows

// With React VDOM — all changes grouped into one update:
function Profile({ user }) {
  return (
    <div>
      <span>{user.name}</span>
      <span>{user.age}</span>
      <span>{user.role}</span>
    </div>
  );
  // React collects all changes, diffs once, updates DOM once
}`
        }
      ]
    },
    {
      title: "The Diffing Algorithm",
      explanations: {
        layman: "React uses shortcuts to quickly find differences between the old page and the new page. Two rules keep it fast: (1) It only compares items at the same level — it never looks across different levels. (2) If something changed type (like a heading became a paragraph), React throws the whole section away and rebuilds it instead of trying to transform it. These shortcuts make comparison very fast.",
        mid: "React's diff runs in O(n) time using two rules: (1) Different element types mean different trees — if <div> becomes <section>, React removes the old subtree and builds a new one. (2) Keys identify items in lists. The diff goes level by level. For same-type HTML elements, it updates only changed attributes. For same-type components, it keeps the instance and updates props. For lists, it uses keys to match old and new items and detect adds, removes, and moves.",
        senior: "React's diff is O(n) because it uses two heuristics to avoid a full tree comparison. For single elements: same type = update props, different type = destroy and recreate (all children lose state). For lists: React builds a map of old items by key, then matches new items against it. Items with matching keys get reused, unmatched old items get removed, unmatched new items get created. A practical performance gotcha: moving an item from the end to the start (like [A,B,C,D] → [D,A,B,C]) is expensive because React moves A, B, and C — not D. Appending is cheap, prepending is slow. This matters for chat messages, notifications, or any list where new items appear at the top."
      },
      realWorld: "Every time your component re-renders, React diffs the new elements against the old ones. If you change a <div> to a <section>, all child state is lost because React destroys that whole subtree. Knowing this helps you avoid accidental state resets.",
      whenToUse: "Understanding diffing is key for debugging performance problems and unexpected state resets. It matters most with dynamic lists, conditional rendering, and changing element types.",
      whenNotToUse: "You do not control the diffing algorithm directly — React handles it. But understanding it helps you avoid problems like needlessly changing wrapper element types.",
      pitfalls: "Changing wrapper types conditionally causes full unmount/remount of children. The diff does not deep-compare props — new object references trigger child updates even if data is the same. Restructuring your component tree can cause unexpected unmounts.",
      codeExamples: [
        {
          title: "Type Change Destroys Subtree",
          code: `// BAD: Changing wrapper type resets ALL child state
function App({ isAdmin }) {
  if (isAdmin) {
    return (
      <section>
        <UserProfile />  {/* destroyed when isAdmin toggles */}
        <Settings />
      </section>
    );
  }
  return (
    <div>
      <UserProfile />  {/* new instance — state lost */}
      <Settings />
    </div>
  );
}

// GOOD: Keep the same wrapper type, just change className
function App({ isAdmin }) {
  return (
    <div className={isAdmin ? 'admin' : 'user'}>
      <UserProfile />  {/* same instance — state kept */}
      <Settings />
    </div>
  );
}`
        },
        {
          title: "How Diffing Walks the Tree",
          code: `// Old render:
<ul>
  <li>Apple</li>
  <li>Banana</li>
</ul>

// New render (item added at end):
<ul>
  <li>Apple</li>
  <li>Banana</li>
  <li>Cherry</li>
</ul>

// React compares children one by one:
// Index 0: Apple vs Apple -> no change
// Index 1: Banana vs Banana -> no change
// Index 2: nothing vs Cherry -> INSERT
// Result: just 1 DOM insert. Fast!

// But if we add at the START without keys:
<ul>
  <li>Cherry</li>
  <li>Apple</li>
  <li>Banana</li>
</ul>
// Index 0: "Apple" -> "Cherry" (change text)
// Index 1: "Banana" -> "Apple" (change text)
// Index 2: nothing -> "Banana" (insert)
// Result: 3 DOM changes instead of 1! Keys fix this.`
        }
      ]
    },
    {
      title: "Keys and Reconciliation",
      explanations: {
        layman: "Imagine students without name tags. If a new student sits at the front, the teacher thinks everyone shifted and re-learns every name. But with name tags (keys), she knows the new kid is new and everyone else just moved. Keys are name tags for list items — they tell React which item is which, even if the order changes.",
        mid: "Keys are string attributes that give list items a stable identity across renders. React uses keys (not position) to match old and new items. Same key in both renders = reuse the component and keep its state. Key only in old list = unmount it. Key only in new list = mount a new one. Using array index as key breaks when items are reordered or inserted, because index 0 can be a different item after the change.",
        senior: "Keys must be stable, unique, and derived from the data — not generated during render. Using `Math.random()` or `Date.now()` as keys causes React to unmount and remount every item on every render, destroying all internal state (input values, scroll position, animation state). Using array index as key is fine ONLY if the list is static and never reordered. For dynamic lists, use a database ID or a hash of the content. Performance tip: if you have a list with thousands of items and keys that change frequently, consider virtualization (react-window) instead of relying on React's diffing — even O(n) diff is slow when n is 10,000."
      },
      realWorld: "Any time you render a list with .map(), you need keys. Database IDs make the best keys. When you sort or filter a list, stable keys let React move DOM nodes instead of destroying and recreating them.",
      whenToUse: "Always give keys to list items. Use stable, unique IDs (database IDs, slugs). You can also use keys to force a component to reset — changing a key makes React unmount and remount it with fresh state.",
      whenNotToUse: "Array index as key is OK only when: the list never changes order, items have no internal state, and the list is never sorted or filtered.",
      pitfalls: "Index keys on reorderable lists cause state to stick to wrong items (like checkbox state staying at index 0 after sorting). Duplicate keys cause React to drop or mix up elements. Math.random() as key forces remount every render, killing performance. Keys only need to be unique among siblings, not globally.",
      codeExamples: [
        {
          title: "Index Key Bug",
          code: `function TodoList() {
  const [todos, setTodos] = useState([
    { id: 'a', text: 'Buy milk' },
    { id: 'b', text: 'Walk dog' },
    { id: 'c', text: 'Code review' }
  ]);

  const addToFront = () => {
    setTodos([{ id: 'd', text: 'New task' }, ...todos]);
  };

  return (
    <div>
      <button onClick={addToFront}>Add to front</button>

      {/* BAD: index as key */}
      {todos.map((todo, i) => (
        <TodoItem key={i} todo={todo} />
        // After add: key=0 was "Buy milk", now is "New task"
        // React reuses the component — old state sticks!
      ))}

      {/* GOOD: stable id as key */}
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
        // key="a" always means "Buy milk" no matter where it is
      ))}
    </div>
  );
}`
        },
        {
          title: "Key to Force Remount (Reset Pattern)",
          code: `// When userId changes, we want a fresh form with empty fields
function EditProfile({ userId }) {
  // Changing key forces React to throw away old form and make new one
  return <ProfileForm key={userId} userId={userId} />;
}

function ProfileForm({ userId }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // State starts fresh for each userId because key changed
  return (
    <form>
      <input value={name} onChange={e => setName(e.target.value)} />
      <input value={email} onChange={e => setEmail(e.target.value)} />
    </form>
  );
}`
        }
      ]
    },
    {
      title: "Batched DOM Updates",
      explanations: {
        layman: "Imagine you have 10 letters to mail. You would not drive to the post office for each one — you would batch them and make one trip. React does the same. Even if your code says 'change the name, change the color, change the size' in three lines, React waits, collects all changes, and updates the screen just once.",
        mid: "React groups state updates to reduce DOM writes. In React 18+, ALL state updates are batched automatically — even inside setTimeout, Promises, and native event handlers. Multiple setState calls are queued without triggering a re-render. Once the batch ends, React processes all updates in one render pass, producing one diff and one set of DOM changes. Use flushSync() if you need a DOM update to happen immediately (rare).",
        senior: "React 18 batches by deferring rendering until the current synchronous work finishes. Multiple setState calls queue updates, and React processes them all in one render pass. This applies everywhere — event handlers, setTimeout, Promise callbacks, native listeners. Before React 18, only React event handlers were batched. The practical impact: if you call setState 5 times in a setTimeout, React 17 did 5 re-renders, React 18 does 1. Use flushSync() only when you need to read DOM measurements immediately after a state change (like scrolling to a new element). In concurrent mode, React can also interrupt low-priority renders to handle urgent updates like user input."
      },
      realWorld: "When you call multiple setState functions in one event handler, React renders only once with all changes applied. This is why console.log right after setState shows the old value — the render has not happened yet.",
      whenToUse: "Batching is automatic in React 18+. Group related state updates in the same handler. If many values always update together, consider useReducer for a single dispatch call.",
      whenNotToUse: "Use flushSync() when you must read from the DOM right after a state change (like scrolling to a new element). This is rare and should be used sparingly.",
      pitfalls: "State is not updated right after setState — it is queued. Too many flushSync calls negate batching benefits. In React 17, updates in setTimeout or fetch .then() were NOT batched. Code relying on that may behave differently after upgrading to React 18.",
      codeExamples: [
        {
          title: "Automatic Batching in React 18",
          code: `function Counter() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  const handleClick = () => {
    // Both updates batched into ONE re-render
    setCount(c => c + 1);
    setFlag(f => !f);
    // Component renders once with both changes
  };

  const handleAsync = () => {
    fetch('/api/data').then(() => {
      // React 18: also batched! One re-render
      // (React 17 would do TWO re-renders here)
      setCount(c => c + 1);
      setFlag(f => !f);
    });

    setTimeout(() => {
      // React 18: also batched!
      setCount(c => c + 1);
      setFlag(f => !f);
    }, 1000);
  };

  console.log('Render'); // Logs once per batch, not per setState
  return <div>{count} {flag.toString()}</div>;
}`
        },
        {
          title: "Opting Out with flushSync",
          code: `import { flushSync } from 'react-dom';

function ScrollToNew() {
  const [items, setItems] = useState([]);
  const listRef = useRef(null);

  const addItem = () => {
    // flushSync forces the DOM to update right now
    flushSync(() => {
      setItems(prev => [...prev, { id: Date.now(), text: 'New' }]);
    });

    // Now the new item is in the DOM, so we can scroll to it
    const last = listRef.current.lastElementChild;
    last.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <ul ref={listRef}>
      {items.map(item => <li key={item.id}>{item.text}</li>)}
    </ul>
  );
}`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "What is the Virtual DOM and why does React use it instead of directly manipulating the real DOM?",
      answer: "The Virtual DOM is a lightweight JS object tree that mirrors the real DOM — like a draft document. When state changes, React builds a new VDOM, compares it with the old one, and applies only the differences to the real DOM in one batch. The VDOM is not always faster than direct DOM updates for tiny changes. Its real benefits are: (1) Batching — multiple state changes result in one DOM update instead of many. (2) Cross-platform — the same element tree can render to browser DOM, React Native, or server-side strings. (3) Simpler code — you describe what UI should look like, and React handles the DOM updates, which means fewer bugs. The tradeoff is overhead from creating objects and diffing on every update, which is worth it for complex UIs but unnecessary for simple static pages.",
      difficulty: "easy",
      followUps: [
        "Is the Virtual DOM always faster than direct DOM manipulation? When might it not be?",
        "How does the VDOM relate to React's cross-platform capabilities (React Native, React Three Fiber)?"
      ]
    },
    {
      question: "Explain React's diffing algorithm. What heuristics does it use and what is the time complexity?",
      answer: "A full tree diff is O(n^3) which is too slow. React gets it down to O(n) with two shortcuts. First: different element types mean different trees — if <div> becomes <span>, React destroys the old subtree and builds a new one (no morphing). Second: keys give list items stable identity so React can track moves, adds, and deletes. The algorithm goes level by level and never compares across levels. For matching types: HTML elements get their attributes updated; components keep their instance and get new props. For lists: React uses keys to match items. It tracks a lastPlacedIndex — items whose old index is below this value need to be moved in the DOM. This makes appending cheap (no moves) but prepending expensive (all existing items appear to move).",
      difficulty: "mid",
      followUps: [
        "Why is prepending to a list less efficient than appending in React's diffing? Can you trace through an example?",
        "What is the lastPlacedIndex optimization and how does it work?"
      ]
    },
    {
      question: "Why are keys important in React? What happens if you use array index as a key?",
      answer: "Keys give list items a stable identity so React can match old and new items correctly across renders. Without proper keys, React matches by position. With index keys on a dynamic list: inserting at position 0 makes React think key=0 is a different item. It updates the component's props but keeps the old state — causing state corruption (e.g., a checkbox stays checked on the wrong item). It also wastes performance by updating every item instead of inserting one. Internally, React builds a Map of existing children by key. Matched fibers are reused; unmatched old ones are deleted; unmatched new ones are created. Good keys are stable (same item = same key), unique among siblings, and predictable (not random). Database IDs and slugs work well.",
      difficulty: "mid",
      followUps: [
        "When is it actually safe to use index as a key?",
        "What happens internally when React encounters duplicate keys?"
      ]
    },
    {
      question: "How does React's reconciliation process work from state change to DOM update?",
      answer: "The pipeline has clear phases. (1) setState enqueues an update on the fiber's updateQueue and schedules a render at the right priority. (2) RENDER PHASE (can be paused in concurrent mode): React walks the fiber tree, calls each component's render function, and produces new elements. It diffs these against current fibers and flags changes (PLACEMENT, UPDATE, DELETION). This builds a work-in-progress tree. (3) COMMIT PHASE (runs all at once, cannot be paused): Three sub-phases — Before Mutation (read DOM), Mutation (apply DOM inserts/updates/deletes), Layout (run useLayoutEffect, attach refs). (4) The work-in-progress tree becomes the current tree (double buffering). (5) useEffect callbacks run asynchronously after the browser paints. Splitting render and commit is what makes concurrent features possible — React can prepare new UI without showing it until ready.",
      difficulty: "hard",
      followUps: [
        "What is double buffering in the context of React's fiber tree?",
        "Why is the commit phase synchronous while the render phase can be interrupted?"
      ]
    },
    {
      question: "How does the Virtual DOM approach compare to other frameworks' change detection strategies?",
      answer: "React builds a new VDOM tree and diffs it (a 'pull' model — React figures out what changed). Angular uses Zone.js to detect async events and walks the component tree checking bindings — also pull-based but compares values on the existing tree. Svelte compiles reactive code at build time into direct DOM update instructions — no runtime diffing at all. Vue 3 uses Proxy-based reactivity to track which components depend on which state, combined with a VDOM diff that uses compiler hints to skip static parts. SolidJS uses fine-grained reactivity with no VDOM — signals directly update specific DOM nodes. React's approach trades some runtime overhead for simplicity and flexibility. It works without a compiler, supports flexible composition, and has a simple mental model: your component is a function from state to UI.",
      difficulty: "hard",
      followUps: [
        "What advantages do compile-time approaches like Svelte have over React's runtime VDOM?",
        "How does the React Compiler (React Forget) optimize VDOM operations?"
      ]
    },
    {
      question: "Can you explain how React handles reconciliation differently for single children vs. multiple children (lists)?",
      answer: "React has separate paths for single vs. multiple children. Single child (reconcileSingleElement): React looks for an existing child with the same key and type. If found, it reuses that fiber and deletes siblings. If not found, it deletes all children and creates a new fiber. Simple and fast. Multiple children (reconcileChildrenArray): uses a two-pass approach. First pass: walk old and new children side by side from the start. While keys match, update in place. Stop at the first mismatch. Second pass: put remaining old children into a Map by key. For each remaining new child, look it up in the map — matches are reused, misses create new fibers. Leftovers in the map are deleted. Throughout, lastPlacedIndex tracks whether matched nodes need to be moved in the DOM. The two-pass design optimizes for the common case where changes happen at the end of the list.",
      difficulty: "hard",
      followUps: [
        "Why does React use a two-pass approach for list reconciliation?",
        "How would you optimize a list that frequently has items prepended?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Implement a Simple Virtual DOM Diff",
      difficulty: "hard",
      description: "Write a simplified diff function that takes an old VDOM tree and a new VDOM tree and returns a list of patches (operations) needed to transform the old tree into the new tree. Support REPLACE, UPDATE_PROPS, and REMOVE operations.",
      solution: `// Compare two VDOM trees and return a list of changes needed
function diff(oldNode, newNode, patches = [], path = '') {
  // Node was removed
  if (oldNode && !newNode) {
    patches.push({ type: 'REMOVE', path });
    return patches;
  }

  // Node was added
  if (!oldNode && newNode) {
    patches.push({ type: 'ADD', path, node: newNode });
    return patches;
  }

  // Type changed — replace the whole thing
  if (oldNode.type !== newNode.type) {
    patches.push({ type: 'REPLACE', path, node: newNode });
    return patches;
  }

  // Same type — check if props changed
  const propChanges = diffProps(oldNode.props, newNode.props);
  if (propChanges.length > 0) {
    patches.push({ type: 'UPDATE_PROPS', path, changes: propChanges });
  }

  // Compare children one by one
  const oldKids = oldNode.props?.children || [];
  const newKids = newNode.props?.children || [];
  const max = Math.max(oldKids.length, newKids.length);

  for (let i = 0; i < max; i++) {
    diff(oldKids[i], newKids[i], patches, path + '.' + i);
  }

  return patches;
}

// Compare props and return list of differences
function diffProps(oldProps = {}, newProps = {}) {
  const changes = [];
  const allKeys = new Set([
    ...Object.keys(oldProps),
    ...Object.keys(newProps)
  ]);

  for (const key of allKeys) {
    if (key === 'children') continue; // children handled separately
    if (oldProps[key] !== newProps[key]) {
      changes.push({
        key,
        oldValue: oldProps[key],
        newValue: newProps[key]
      });
    }
  }
  return changes;
}

// Example usage:
const oldTree = {
  type: 'div', props: {
    className: 'old',
    children: [
      { type: 'span', props: { children: ['Hello'] } },
      { type: 'p', props: { children: ['World'] } }
    ]
  }
};

const newTree = {
  type: 'div', props: {
    className: 'new',
    children: [
      { type: 'span', props: { children: ['Hello'] } },
      { type: 'h1', props: { children: ['World!'] } }
    ]
  }
};

console.log(diff(oldTree, newTree));
// [
//   { type: 'UPDATE_PROPS', path: '', changes: [{key: 'className', ...}] },
//   { type: 'REPLACE', path: '.1', node: {type: 'h1', ...} }
// ]`,
      explanation: "This simplified diff shows the core idea behind React's reconciliation: compare nodes by type, compare props shallowly, and check children one by one. Real React is more advanced — it uses keys for lists, handles components differently from HTML elements, and works on Fiber nodes. But the basic idea is the same: find the smallest set of changes needed."
    },
    {
      title: "Demonstrate Key-Based Reconciliation Bug",
      difficulty: "mid",
      description: "Create a component that shows the difference between using index keys vs stable keys. The component should render a list of inputs where each item has local state. Include a button to add items to the beginning of the list to demonstrate the bug.",
      solution: `import { useState } from 'react';

// Each item has its own internal state (the input value)
function ListItem({ item }) {
  const [value, setValue] = useState('');

  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
      <span>{item.name}</span>
      <input
        placeholder="Type something..."
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <small style={{ color: '#888' }}>
        (state: "{value}")
      </small>
    </div>
  );
}

export default function KeyDemo() {
  const [items, setItems] = useState([
    { id: 'a', name: 'Apple' },
    { id: 'b', name: 'Banana' },
    { id: 'c', name: 'Cherry' },
  ]);

  const addToStart = () => {
    const newId = Math.random().toString(36).slice(2, 6);
    setItems([
      { id: newId, name: 'New-' + newId },
      ...items,
    ]);
  };

  return (
    <div style={{ display: 'flex', gap: 40 }}>
      <div>
        <h3>Index Keys (Buggy)</h3>
        <button onClick={addToStart}>Add to start</button>
        {items.map((item, i) => (
          <ListItem key={i} item={item} />
          // Type in inputs, then click "Add to start"
          // Input values stay at their index, not with the item!
        ))}
      </div>

      <div>
        <h3>Stable Keys (Correct)</h3>
        <button onClick={addToStart}>Add to start</button>
        {items.map(item => (
          <ListItem key={item.id} item={item} />
          // Type in inputs, then click "Add to start"
          // Input values correctly follow their items
        ))}
      </div>
    </div>
  );
}`,
      explanation: "With index keys, adding to the front shifts all indices. React sees key=0 with new props and updates the component, but internal state (the input value) stays at that key position. So text you typed for 'Apple' (index 0) now shows next to the new item (now at index 0). With stable keys (item.id), React knows 'Apple' moved from position 0 to 1, and creates a new component for the new item."
    },
    {
      title: "Build a Component that Efficiently Renders a Large List",
      difficulty: "mid",
      description: "Create a component that renders a list of 1000 items where items can be added, removed, and reordered. Use proper keys and demonstrate how to use React.memo to prevent unnecessary re-renders of unchanged list items.",
      solution: `import { useState, useCallback, memo } from 'react';

// memo: only re-renders when its props actually change
const ListItem = memo(function ListItem({ item, onRemove, onMoveUp }) {
  console.log('Rendering:', item.name);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '4px 0',
      borderBottom: '1px solid #eee'
    }}>
      <span style={{ flex: 1 }}>{item.name}</span>
      <span style={{ color: '#888', fontSize: 12 }}>id: {item.id}</span>
      <button onClick={() => onMoveUp(item.id)}>Move Up</button>
      <button onClick={() => onRemove(item.id)}>Remove</button>
    </div>
  );
});

// Create a list of items with unique IDs
function makeItems(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: crypto.randomUUID(),
    name: 'Item ' + (i + 1),
  }));
}

export default function EfficientList() {
  const [items, setItems] = useState(() => makeItems(1000));

  // useCallback keeps the same function reference between renders
  // so memo'd children do not re-render unnecessarily
  const handleRemove = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleMoveUp = useCallback((id) => {
    setItems(prev => {
      const idx = prev.findIndex(item => item.id === id);
      if (idx <= 0) return prev; // already at top
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]; // swap
      return next;
    });
  }, []);

  const addToStart = () => {
    setItems(prev => [{
      id: crypto.randomUUID(),
      name: 'New Item ' + Date.now()
    }, ...prev]);
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <button onClick={addToStart}>Add to Start</button>
        <span> Total: {items.length}</span>
      </div>
      <div style={{ height: 600, overflow: 'auto' }}>
        {items.map(item => (
          <ListItem
            key={item.id}
            item={item}
            onRemove={handleRemove}
            onMoveUp={handleMoveUp}
          />
        ))}
      </div>
    </div>
  );
}`,
      explanation: "This shows key VDOM performance patterns: (1) Stable unique keys (crypto.randomUUID()) let React efficiently track inserts, removes, and moves. (2) React.memo on ListItem stops unchanged items from re-rendering — without it, all 1000 items re-render on any change. (3) useCallback keeps function references stable so memo comparisons work. (4) Functional updaters (prev => ...) avoid stale closure bugs. Together, only the affected items re-render, not the whole list."
    }
  ],
  quiz: [
    {
      question: "What is the time complexity of React's diffing algorithm?",
      options: [
        "O(n) — linear in the number of elements",
        "O(n^2) — quadratic",
        "O(n^3) — the standard tree diff complexity",
        "O(n log n) — like merge sort"
      ],
      correct: 0,
      explanation: "React uses shortcuts (same-type assumption and keys) to reduce tree diffing from O(n^3) to O(n). It only compares nodes at the same level and uses keys to match list items, avoiding a full tree comparison."
    },
    {
      question: "What happens when a parent element's type changes from <div> to <section> during re-render?",
      options: [
        "React updates the element's tag name in place",
        "React destroys the entire old subtree and creates a new one from scratch",
        "React only changes the parent, keeping children intact",
        "React throws an error because element types can't change"
      ],
      correct: 1,
      explanation: "When an element type changes, React assumes the whole subtree is different. It unmounts the old tree (cleaning up effects and state) and mounts a new one. This is one of the two core rules of React's O(n) diffing."
    },
    {
      question: "Which scenario makes using array index as a key problematic?",
      options: [
        "When the list is static and never changes",
        "When items are only appended to the end",
        "When items can be reordered, inserted at the start, or deleted from the middle",
        "When the list has fewer than 10 items"
      ],
      correct: 2,
      explanation: "Index keys break when list order changes because the index does not represent a stable identity. Inserting at position 0 shifts every index, making React update every component's props while state stays at the old positions. Static or append-only lists do not have this problem."
    },
    {
      question: "In React 18, which of these scenarios does NOT automatically batch state updates?",
      options: [
        "Multiple setState calls in a click handler",
        "Multiple setState calls inside a setTimeout callback",
        "Multiple setState calls inside a Promise .then()",
        "All of the above are automatically batched in React 18"
      ],
      correct: 3,
      explanation: "React 18 batches ALL state updates automatically — event handlers, setTimeout, Promise callbacks, and everything else. In React 17, only React event handlers and lifecycle methods were batched. This is a key improvement in React 18."
    },
    {
      question: "What does React do when it encounters duplicate keys in a list?",
      options: [
        "It throws an error and stops rendering",
        "It renders all items normally with no issues",
        "It warns in development and may skip or duplicate elements unpredictably",
        "It automatically generates unique keys as fallback"
      ],
      correct: 2,
      explanation: "React shows a warning in dev mode but does not crash. The behavior is unpredictable — when building the key-to-fiber map, later items with the same key overwrite earlier ones. This can cause elements to be dropped, duplicated, or have mixed-up state."
    }
  ]
};
