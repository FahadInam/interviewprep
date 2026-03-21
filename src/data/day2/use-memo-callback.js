export const useMemoCallback = {
  id: "use-memo-callback",
  title: "useMemo & useCallback",
  icon: "⚡",
  tag: "React Hooks",
  tagColor: "var(--tag-react)",
  subtitle: "Learn how to skip unnecessary work in React with memoization",
  concepts: [
    {
      title: "useMemo — Memoizing Expensive Computations",
      explanations: {
        layman: "useMemo remembers the result of a slow calculation. Think of sorting a huge list of names. If the list did not change, why sort it again? useMemo saves the sorted result. It only sorts again when the list changes. Without it, React re-sorts on every render, even if nothing changed. Use useMemo when a calculation is slow and the input has not changed.",
        mid: "useMemo takes a function and a list of dependencies. It runs the function and saves the result. On the next render, React checks each dependency with Object.is(). If nothing changed, it returns the saved result without running the function again. Use it for slow work like filtering large arrays, sorting, or building complex data. The function only runs again when a dependency changes.",
        senior: "useMemo stores its value on the fiber node's memoizedState linked list. During updates, React compares each dependency using Object.is(). If all match, it returns the cached value without calling the factory. React can drop cached values under memory pressure -- the docs say useMemo is a performance hint, not a guarantee. In concurrent mode, a fiber may render multiple times before commit, but useMemo ensures the computation runs at most once per unique dependency set per commit."
      },
      realWorld: "Filtering and sorting a big product list based on user choices. Without useMemo, the filter runs on every keystroke or scroll, even when unrelated state changes.",
      whenToUse: "When you have slow operations (sorting or filtering big lists, heavy math). When you create objects or arrays passed to memoized children. When computing values from multiple state variables.",
      whenNotToUse: "For simple math like adding two numbers. When the value changes every render anyway. When comparing dependencies costs more than redoing the work. For lists with fewer than about 100 items.",
      pitfalls: "Missing a dependency gives you old, wrong values. Putting objects or arrays in dependencies without memoizing them makes useMemo recalculate every time. Wrapping simple calculations wastes memory for no gain. React may drop cached values at any time.",
      codeExamples: [
        {
          title: "Memoizing an Expensive Filter Operation",
          code: `function ProductList({ products, search, sortBy }) {
  // Only runs again when products, search, or sortBy change
  const results = useMemo(() => {
    // Step 1: Filter by search text
    const matched = products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
    // Step 2: Sort the filtered list
    return matched.sort((a, b) => {
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });
  }, [products, search, sortBy]);

  return (
    <ul>
      {results.map(p => (
        <li key={p.id}>{p.name} - \${p.price}</li>
      ))}
    </ul>
  );
}`
        },
        {
          title: "Memoizing Object Creation for Child Props",
          code: `function Dashboard({ user, theme }) {
  // BAD: new object every render, breaks React.memo on child
  // const style = { color: theme.primary, fontSize: theme.size };

  // GOOD: same object reference when theme has not changed
  const style = useMemo(
    () => ({ color: theme.primary, fontSize: theme.size }),
    [theme.primary, theme.size]
  );

  return <Chart data={user.data} style={style} />;
}

// Only re-renders when data or style actually change
const Chart = React.memo(function Chart({ data, style }) {
  return <div style={style}>{/* chart here */}</div>;
});`
        }
      ]
    },
    {
      title: "useCallback — Memoizing Function References",
      explanations: {
        layman: "Every time your component renders, all functions inside it are created again. It is like writing out the same recipe on a new card every day. useCallback saves the recipe card. As long as the ingredients stay the same, you keep using the same card. This matters because React checks if the card is the same card, not if the words on it are the same.",
        mid: "useCallback(fn, deps) returns the same function reference across renders, as long as dependencies have not changed. It equals useMemo(() => fn, deps). The main use: passing callbacks to children wrapped in React.memo. Without useCallback, the parent creates a new function each render, and the child re-renders even though the logic is the same. useCallback keeps the reference stable.",
        senior: "useCallback is implemented as useMemo(() => fn, deps) in React source code. During updates, areHookInputsEqual compares deps with Object.is(). The key point: useCallback alone does nothing for performance. It must be paired with React.memo, shouldComponentUpdate, or used as a dependency in another hook. Without a consuming optimization boundary, you pay the comparison cost for zero benefit."
      },
      realWorld: "Passing click handlers to a list of 10,000 items where each item uses React.memo. Without useCallback, every parent render creates new handlers, forcing all 10,000 items to re-render.",
      whenToUse: "When passing callbacks to React.memo children. When callbacks are dependencies of useEffect. When passing handlers to large memoized lists.",
      whenNotToUse: "When the child is NOT wrapped in React.memo -- useCallback alone does not stop re-renders. For event handlers on plain HTML elements. When the component tree is small and re-renders are cheap. When dependencies change every render.",
      pitfalls: "Using useCallback without React.memo on the child is wasted effort. Missing dependencies cause stale closures (old values). Too much useCallback makes code hard to read. State setter functions (like setCount) are already stable -- no need to list them in dependencies.",
      codeExamples: [
        {
          title: "useCallback with React.memo Child",
          code: `function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");

  // Stable function: empty deps because setTodos is already stable
  const addTodo = useCallback((text) => {
    setTodos(prev => [...prev, { id: Date.now(), text, done: false }]);
  }, []);

  const toggleTodo = useCallback((id) => {
    setTodos(prev =>
      prev.map(t => t.id === id ? { ...t, done: !t.done } : t)
    );
  }, []);

  return (
    <div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={() => addTodo(input)}>Add</button>
      {/* TodoItem is memoized, so stable toggleTodo prevents re-renders */}
      {todos.map(t => (
        <TodoItem key={t.id} todo={t} onToggle={toggleTodo} />
      ))}
    </div>
  );
}

// React.memo: only re-renders when todo or onToggle change
const TodoItem = React.memo(function TodoItem({ todo, onToggle }) {
  console.log("Rendering:", todo.text);
  return (
    <div onClick={() => onToggle(todo.id)}>
      {todo.done ? "done" : "open"} {todo.text}
    </div>
  );
});`
        }
      ]
    },
    {
      title: "Referential Equality and Why It Matters",
      explanations: {
        layman: "Think of two identical red cups. They look the same, but they are two different cups. If you tell someone 'only react when the cup changes,' they react every time you hand them a new cup -- even if it looks the same. React works this way with objects and functions. It checks 'is it the same thing?' not 'does it look the same?'",
        mid: "JavaScript compares objects and functions by reference, not by content. {} === {} is false. React uses Object.is() in hook dependencies, React.memo prop checks, and render bailout logic. Creating a new object { color: 'red' } every render -- even with the same content -- triggers re-runs of useEffect, useMemo, and React.memo children. useMemo and useCallback exist to keep the same reference when the data has not changed.",
        senior: "React.memo uses shallowEqual, which iterates own properties and compares each with Object.is(). For hooks, areHookInputsEqual compares each dep with Object.is(). The reconciler's bailout in beginWork checks oldProps === newProps with strict reference equality. If the parent creates new prop objects, this check fails even with identical content, blocking the fast path. This is why the 'children as props' pattern works: if the parent does not re-render, the children JSX reference stays stable."
      },
      realWorld: "A dashboard passes a config object to a chart component. Without memoizing the config, every dashboard re-render creates a new config object, forcing the chart to re-draw even though the values are the same.",
      whenToUse: "Whenever you work with React.memo, useMemo, useCallback, or useEffect dependencies. It is the core idea behind all memoization decisions in React.",
      whenNotToUse: "For simple values like strings, numbers, or booleans. Object.is() compares these by value, so reference does not matter. Also not a concern when re-renders are cheap and no optimization boundary exists.",
      pitfalls: "Thinking React does deep comparison (it does not). Creating inline objects in JSX props breaks memoization. Using JSON.stringify for comparison is slow and fails with undefined, functions, or circular references. Spreading props ({ ...obj }) creates new references.",
      codeExamples: [
        {
          title: "Demonstrating Referential Equality Issues",
          code: `function Parent() {
  const [count, setCount] = useState(0);

  // BAD: new object every render -- breaks React.memo
  const options = { theme: "dark", lang: "en" };

  // GOOD: same reference across renders
  const stableOptions = useMemo(
    () => ({ theme: "dark", lang: "en" }),
    [] // never changes
  );

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      {/* Re-renders every time because options is a new object */}
      <MemoChild options={options} />
      {/* Skips re-renders because stableOptions is the same object */}
      <MemoChild options={stableOptions} />
    </>
  );
}

const MemoChild = React.memo(({ options }) => {
  console.log("MemoChild rendered");
  return <div>{options.theme}</div>;
});`
        }
      ]
    },
    {
      title: "The Cost of Memoization and When It Hurts",
      explanations: {
        layman: "Memoization is not free. It trades memory for speed. Think of keeping a calculator on your desk. It helps if you do hard math all day. But if you only add 2 + 2, the calculator just takes up space. useMemo and useCallback use memory and React checks dependencies every render. If the work is simple (like joining two strings), checking takes longer than just doing the work. Only memoize when the work is truly slow or when you need a stable reference.",
        mid: "Every useMemo/useCallback has costs: (1) memory for the cached value and deps, (2) time to compare deps each render, (3) more complex code. For cheap operations (simple math, short string joins), the overhead can be more than the computation. Use React DevTools or Chrome Performance tab to measure before adding memoization. The React team is building React Compiler to handle this automatically.",
        senior: "Each hook allocates an object on the fiber's memoizedState linked list. For useMemo, it stores [value, deps]. The deps comparison calls Object.is() for each element -- N calls per render per hook. React Compiler aims to auto-memoize at build time, making manual useMemo/useCallback mostly unnecessary. Until then: profile first, memoize second. Concurrent features like transitions and Suspense can reduce the need for manual memoization by keeping the UI responsive during heavy renders."
      },
      realWorld: "A team wraps every function and value in useCallback/useMemo 'for speed.' Result: more memory use, harder code to read, more bugs from stale closures, and almost no real speed gain because the components were already fast.",
      whenToUse: "When profiling shows a real performance problem. When a computation takes several milliseconds. When preventing re-renders of expensive subtrees with React.memo. When stabilizing dependencies for effects that make API calls.",
      whenNotToUse: "For simple calculations. When you have not measured a problem. When dependencies change every render (memoization does nothing). When the component rarely re-renders.",
      pitfalls: "Do not optimize before you measure. Memoizing everything wastes memory and causes stale closure bugs. The React team says: start without memoization, add it only when needed. Too much memoization can slow your app because of comparison overhead.",
      codeExamples: [
        {
          title: "When Memoization Hurts More Than It Helps",
          code: `function OverDone({ firstName, lastName }) {
  // BAD: memoizing simple string join
  const fullName = useMemo(
    () => firstName + " " + lastName,
    [firstName, lastName]
  );
  // Checking deps costs more than just joining two strings!

  // BAD: useCallback on a plain HTML element handler
  const handleClick = useCallback(() => {
    console.log("clicked");
  }, []);
  // No React.memo child uses this, so it is wasted effort

  // GOOD: just write it simply
  const name = firstName + " " + lastName;
  const onClick = () => console.log("clicked");

  return <button onClick={onClick}>{name}</button>;
}

// GOOD: memoize when there is a real reason
function BigList({ items, filter }) {
  const filtered = useMemo(() => {
    // Worth it: checking thousands of items
    return items.filter(item =>
      item.tags.some(tag => tag.includes(filter))
    );
  }, [items, filter]);

  return filtered.map(item => (
    <ExpensiveCard key={item.id} item={item} />
  ));
}`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "What is the difference between useMemo and useCallback?",
      answer: "useMemo caches a computed value. You give it a function, it runs it, and saves the result. useCallback caches a function reference. It returns the same function without calling it. Internally, useCallback(fn, deps) is the same as useMemo(() => fn, deps). Use useMemo for slow calculations (sorting a big list). Use useCallback when passing a function to a React.memo child, so the child does not re-render because of a new function reference.",
      difficulty: "easy",
      followUps: [
        "Can you implement useCallback using useMemo?",
        "When would useMemo and useCallback produce identical results?",
        "Why doesn't React just memoize everything automatically?"
      ]
    },
    {
      question: "Does useCallback alone prevent re-renders of child components?",
      answer: "No. useCallback only keeps the function reference the same. The child must also be wrapped in React.memo to actually skip re-rendering. Without React.memo on the child, useCallback is wasted effort -- the child re-renders anyway because its parent re-rendered. You need both: useCallback in the parent and React.memo on the child.",
      difficulty: "mid",
      followUps: [
        "What happens if you use useCallback but forget React.memo on the child?",
        "Are there cases where useCallback matters without React.memo?",
        "How does useCallback interact with useEffect dependencies?"
      ]
    },
    {
      question: "Can React discard memoized values from useMemo?",
      answer: "Yes. React docs say useMemo is a performance hint, not a guarantee. React may drop cached values during memory pressure, offscreen rendering, or when a fiber tree is thrown away in concurrent rendering. Your code must still work if the function runs again. Never put side effects in useMemo. If you need a value computed only once, use useRef or useEffect instead.",
      difficulty: "hard",
      followUps: [
        "What would happen if your useMemo factory has a side effect and React drops the cached value?",
        "How does concurrent rendering affect memoization guarantees?",
        "What alternatives exist if you need a truly stable one-time computation?"
      ]
    },
    {
      question: "How do you decide whether to add useMemo to a computation?",
      answer: "Ask four questions: (1) Is the computation actually slow? Measure it with React DevTools or console.time. (2) Is the result passed to a memoized child or used in a hook dependency? Then stable references matter. (3) Do the dependencies change often? If they change every render, memoization does nothing. (4) Does the component re-render often? If it renders once, memoization adds nothing. Rule: do not memoize until you measure a real problem.",
      difficulty: "mid",
      followUps: [
        "How would you profile to determine if a computation is expensive?",
        "What is the memory cost of useMemo?",
        "How will React Compiler change memoization decisions?"
      ]
    },
    {
      question: "Explain the stale closure problem with useCallback and how to fix it.",
      answer: "A stale closure happens when useCallback captures old values because the dependency array is missing items. Example: useCallback(() => console.log(count), []) always logs the first count value. Fixes: (1) Add all used variables to the deps array. (2) Use functional updates: setCount(prev => prev + 1) so you do not need count in deps. (3) Use useRef to hold values that should not trigger re-creation. The ESLint exhaustive-deps rule catches most of these bugs.",
      difficulty: "hard",
      followUps: [
        "Why are state setter functions stable and don't need to be in deps?",
        "How does the exhaustive-deps ESLint rule work?",
        "Can useRef solve all stale closure problems?"
      ]
    },
    {
      question: "What is the relationship between useMemo, useCallback, and React.memo?",
      answer: "React.memo wraps a component and skips re-rendering if props have not changed (shallow comparison). useMemo and useCallback are used in the parent to keep object and function props stable across renders. They work as a team: React.memo on the child is the gate, and useMemo/useCallback in the parent make sure props pass the check. Without React.memo, stable references do not help. Without stable references, React.memo cannot tell that props are the same.",
      difficulty: "mid",
      followUps: [
        "Can you pass a custom comparator to React.memo?",
        "When might a custom comparator be more appropriate than useMemo?",
        "How does React.memo interact with context changes?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Implement a useMemo-powered Search Filter",
      difficulty: "mid",
      description: "Create a component that filters a list of 10,000 items by search term. Use useMemo to prevent filtering on every render. Include a counter button that triggers unrelated re-renders to demonstrate memoization benefit.",
      solution: `import { useState, useMemo } from "react";

// Create a big list of items
function makeItems(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: \`Item \${i} - \${Math.random().toString(36).slice(2, 8)}\`,
    category: ["Electronics", "Books", "Clothing", "Food"][i % 4]
  }));
}

const allItems = makeItems(10000);

function SearchableList() {
  const [search, setSearch] = useState("");
  const [count, setCount] = useState(0);

  // Only re-filters when search changes
  const filtered = useMemo(() => {
    console.time("filter");
    const result = allItems.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
    console.timeEnd("filter");
    return result;
  }, [search]);

  return (
    <div>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search items..."
      />
      {/* Clicking this does NOT re-run the filter */}
      <button onClick={() => setCount(c => c + 1)}>
        Counter: {count}
      </button>
      <p>Showing {filtered.length} of {allItems.length} items</p>
      <ul>
        {filtered.slice(0, 100).map(item => (
          <li key={item.id}>{item.name} ({item.category})</li>
        ))}
      </ul>
    </div>
  );
}`,
      explanation: "useMemo makes the filter only run when 'search' changes. Clicking the counter button causes a re-render, but the filter is skipped because its dependency did not change. console.time lets you measure how long filtering takes."
    },
    {
      title: "Optimize a List with useCallback and React.memo",
      difficulty: "mid",
      description: "Create a todo list where adding a new todo does NOT cause existing todos to re-render. Use React.memo and useCallback together.",
      solution: `import { useState, useCallback, memo } from "react";

// memo: only re-renders when props change
const TodoItem = memo(function TodoItem({ todo, onToggle, onDelete }) {
  console.log("Rendering todo:", todo.text);
  return (
    <li>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo.id)}
      />
      <span style={{ textDecoration: todo.done ? "line-through" : "none" }}>
        {todo.text}
      </span>
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </li>
  );
});

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos(prev => [
      ...prev,
      { id: Date.now(), text: input, done: false }
    ]);
    setInput("");
  };

  // Stable function: uses prev => ... so no dependencies needed
  const toggleTodo = useCallback((id) => {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }, []);

  const deleteTodo = useCallback((id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
        ))}
      </ul>
    </div>
  );
}`,
      explanation: "React.memo on TodoItem stops it from re-rendering when props have not changed. useCallback on toggleTodo and deleteTodo keeps the function references stable. Using prev => ... avoids needing todos in the dependency array. When you add a new todo, only the new TodoItem renders. Existing ones are skipped."
    },
    {
      title: "Build a Memoized Derived State Hook",
      difficulty: "hard",
      description: "Create a custom hook useFilteredAndSorted that takes items, filters, and sort config, and returns a memoized result. It should handle multiple filter criteria and sort directions efficiently.",
      solution: `import { useMemo } from "react";

function useFilteredAndSorted(items, filters, sortConfig) {
  // Step 1: Filter items
  const filtered = useMemo(() => {
    if (!filters || Object.keys(filters).length === 0) return items;

    return items.filter(item =>
      Object.entries(filters).every(([key, value]) => {
        // Skip empty filters
        if (value === null || value === undefined || value === "") return true;
        const itemVal = item[key];
        // String filter: partial match
        if (typeof value === "string") {
          return String(itemVal).toLowerCase().includes(value.toLowerCase());
        }
        // Function filter: custom check
        if (typeof value === "function") {
          return value(itemVal);
        }
        // Exact match
        return itemVal === value;
      })
    );
  }, [items, filters]);

  // Step 2: Sort the filtered results
  const sorted = useMemo(() => {
    if (!sortConfig?.key) return filtered;

    return [...filtered].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let result = 0;
      if (typeof aVal === "string") {
        result = aVal.localeCompare(bVal);
      } else {
        result = aVal - bVal;
      }

      return sortConfig.direction === "desc" ? -result : result;
    });
  }, [filtered, sortConfig?.key, sortConfig?.direction]);

  return sorted;
}

// Usage example
function ProductGrid({ products }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  // Memoize filter and sort objects so they stay stable
  const filters = useMemo(
    () => ({ name: search, category: category || null }),
    [search, category]
  );

  const sortConfig = useMemo(
    () => ({ key: sortKey, direction: sortDir }),
    [sortKey, sortDir]
  );

  const displayProducts = useFilteredAndSorted(products, filters, sortConfig);

  return (
    <div>
      <input value={search} onChange={e => setSearch(e.target.value)} />
      <select value={category} onChange={e => setCategory(e.target.value)}>
        <option value="">All</option>
        <option value="Electronics">Electronics</option>
        <option value="Books">Books</option>
      </select>
      <button onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}>
        Sort {sortDir === "asc" ? "up" : "down"}
      </button>
      {displayProducts.map(p => (
        <div key={p.id}>{p.name} - \${p.price}</div>
      ))}
    </div>
  );
}`,
      explanation: "The hook uses two useMemo calls in a chain: first filter, then sort. The sort step depends on the filtered result, so it only re-runs when the filtered list or sort settings change. The caller memoizes the filters and sortConfig objects to avoid unnecessary recalculations from new object references."
    }
  ],
  quiz: [
    {
      question: "What does useCallback(fn, deps) return?",
      options: [
        "The return value of calling fn",
        "A memoized version of fn that only changes when deps change",
        "A new function that wraps fn with error handling",
        "A debounced version of fn"
      ],
      correct: 1,
      explanation: "useCallback returns the same function reference across renders as long as the dependencies have not changed. It saves the function itself, not the return value."
    },
    {
      question: "Which statement about useMemo is FALSE?",
      options: [
        "useMemo runs during rendering",
        "React guarantees memoized values are never discarded",
        "useMemo accepts a dependency array",
        "useMemo should not contain side effects"
      ],
      correct: 1,
      explanation: "React does NOT guarantee memoized values are kept forever. The docs say React may drop cached values to save memory. useMemo is a performance hint, not a promise."
    },
    {
      question: "useCallback without React.memo on the child component will:",
      options: [
        "Prevent the child from re-rendering",
        "Have no effect on re-renders — the child still re-renders",
        "Cause an error",
        "Only prevent re-renders in production mode"
      ],
      correct: 1,
      explanation: "useCallback only keeps the function reference stable. Without React.memo on the child, the child re-renders whenever the parent renders, no matter what."
    },
    {
      question: "What comparison method does React use for useMemo/useCallback deps?",
      options: [
        "Deep equality (recursive comparison)",
        "JSON.stringify comparison",
        "Object.is() (same-value equality)",
        "== (loose equality)"
      ],
      correct: 2,
      explanation: "React uses Object.is() to compare dependency values. It is like === but treats NaN as equal to NaN. It does NOT do deep comparison, which is why object and array references matter."
    },
    {
      question: "What is the output of: useMemo(() => fn, deps) vs useCallback(fn, deps)?",
      options: [
        "useMemo returns fn's return value; useCallback returns fn itself",
        "They are completely identical in behavior",
        "useMemo returns fn itself; useCallback returns fn's return value",
        "useMemo caches forever; useCallback caches per render"
      ],
      correct: 1,
      explanation: "useMemo(() => fn, deps) and useCallback(fn, deps) are the same -- both return the fn reference. useCallback is just a shortcut for useMemo(() => fn, deps). Note: useMemo(() => fn(), deps) with fn() would return fn's return value instead."
    }
  ]
};
