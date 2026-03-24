export const contextApi = {
  id: "context-api",
  title: "Context API",
  icon: "🌐",
  tag: "React Hooks",
  tagColor: "var(--tag-react)",
  subtitle: "Global state sharing, performance traps, and when to use (or avoid) Context",
  concepts: [
    {
      title: "Context API Fundamentals",
      explanations: {
        layman: "Context lets you share data with any component without passing it down through every level. Without Context, if a deeply nested component needs the current user, you'd pass it through 10 components that don't even use it. That's like passing a note through a chain of people. Context is a shortcut. You put data in a shared place (Provider). Any component can grab it directly (useContext). Great for things the whole app needs: current user, color theme, language.",
        mid: "Context shares values across the component tree without passing props through every level. createContext(defaultValue) makes a context object. <MyContext.Provider value={...}> wraps components and shares the value with all children. useContext(MyContext) reads the nearest Provider's value. Key point: when the Provider's value changes, ALL consumers re-render. The default value from createContext is only used when no Provider exists above the consumer.",
        senior: "The #1 Context performance trap: when the Provider's value changes, EVERY consumer re-renders — and React.memo can't stop it. Context bypasses memo entirely. So if you put `value={{ user, theme, settings }}` on a Provider and only `theme` changes, components that only use `user` still re-render. Fix: split into separate contexts (AuthContext, ThemeContext). Another fix: memoize the value object with useMemo so React sees the same reference when nothing changed. For high-frequency updates (like mouse position), Context is the wrong tool — use Zustand, Jotai, or a ref-based approach instead."
      },
      realWorld: "Theme context (light/dark), auth context (current user), locale context (current language), and feature flag context. These are values many components need at different tree levels.",
      whenToUse: "For global data that rarely changes: themes, auth, locale, feature flags. To avoid passing props through 5+ levels. When many components need the same data.",
      whenNotToUse: "For data that changes often (form input, scroll position, mouse position) because every change re-renders ALL consumers. For state only a few nearby components need (just use props). For complex state management (use Zustand, Jotai, or Redux instead).",
      pitfalls: "Creating a new value object every render (breaks optimization). Putting too many values in one context (one change re-renders all consumers). Not knowing that context changes skip React.memo. Using context for fast updates like animations or scroll position.",
      codeExamples: [
        {
          title: "Complete Context Pattern",
          code: `import { createContext, useContext, useState, useMemo } from "react";

// 1. Create context
const AuthContext = createContext(null);

// 2. Provider component holds the state
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Log in: call API and save user
  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify(credentials)
      });
      const data = await res.json();
      setUser(data);
    } finally {
      setLoading(false);
    }
  };

  // Log out: clear user
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  // Memoize so consumers don't re-render unless user or loading changes
  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Custom hook to use the context safely
function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// 4. Any component can now use auth data
function NavBar() {
  const { user, logout } = useAuth();
  return (
    <nav>
      <span>Welcome, {user?.name}</span>
      <button onClick={logout}>Logout</button>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <NavBar />
      <MainContent />
    </AuthProvider>
  );
}`
        }
      ]
    },
    {
      title: "Context Performance Problems and Solutions",
      explanations: {
        layman: "Context has one big problem: when ANY part of the shared data changes, EVERY component reading that data re-renders, even if it only cares about a different part. Imagine a group chat where every message buzzes everyone's phone, even if the message isn't for them. Three fixes: (1) Split into separate contexts (one for user, one for theme, one for notifications) so a notification update won't re-render components that only need the theme. (2) Use useMemo on the value so it doesn't look 'new' when nothing changed. (3) For data that changes a lot, use a library like Zustand that only updates the components that care.",
        mid: "The problem: when a Provider's value changes, ALL consumers re-render, even if they only use a part that didn't change. If your context has { user, theme, notifications } and only notifications changes, components that only need user still re-render. Fixes: (1) Split into UserContext, ThemeContext, NotificationContext. (2) Memoize the value with useMemo. (3) Use a selector library (use-context-selector). (4) For fast updates, use Zustand or Jotai which only re-render components whose selected data changed.",
        senior: "React has no built-in way to subscribe to only PART of a context value — any change re-renders all consumers. The React team considered adding useContextSelector but never shipped it. Your options: (1) Split contexts so each has one concern — this is the simplest fix. (2) Use useMemo on the value object so the reference stays stable when content hasn't changed. (3) For high-frequency updates, use Zustand/Jotai/useSyncExternalStore which support selectors — only components whose selected slice changed will re-render. The decision framework: if the value changes rarely (theme, auth), Context is fine. If it changes often (form state, real-time data), use a state library with selectors instead."
      },
      realWorld: "A global AppContext with user, theme, notifications, cart, and settings. Every notification badge update re-renders the entire app because every component consumes AppContext for at least one field.",
      whenToUse: "Split contexts when you have separate pieces of state that change at different speeds. Use external state when you need selector-based updates. Always memoize context values.",
      whenNotToUse: "Don't split contexts that always change together (it just adds nesting for no benefit). Don't use selector libraries for simple, rarely-changing contexts.",
      pitfalls: "Passing a new object as Provider value every render: <Provider value={{ user, theme }}> creates a new object each time, re-rendering all consumers even if user and theme are the same. Always use useMemo.",
      codeExamples: [
        {
          title: "The Performance Trap and the Fix",
          code: `// BAD: new object every render — ALL consumers re-render on every App render
function AppBad() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");
  const [count, setCount] = useState(0);

  return (
    // This object is new every render!
    <AppContext.Provider value={{ user, theme }}>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
      <UserProfile /> {/* Re-renders on every count click! */}
    </AppContext.Provider>
  );
}

// GOOD: memoize value + use separate contexts
const UserContext = createContext(null);
const ThemeContext = createContext("light");

function AppGood() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");
  const [count, setCount] = useState(0);

  // Only changes when user changes
  const userValue = useMemo(
    () => ({ user, setUser }),
    [user]
  );

  // Only changes when theme changes
  const themeValue = useMemo(
    () => ({ theme, setTheme }),
    [theme]
  );

  return (
    <UserContext.Provider value={userValue}>
      <ThemeContext.Provider value={themeValue}>
        <button onClick={() => setCount(c => c + 1)}>
          Count: {count}
        </button>
        <UserProfile /> {/* Does NOT re-render on count click! */}
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
}

function UserProfile() {
  const { user } = useContext(UserContext);
  console.log("UserProfile rendered");
  return <p>{user?.name}</p>;
}`
        }
      ]
    },
    {
      title: "Context + useReducer for State Management",
      explanations: {
        layman: "Instead of managing state yourself, you use a helper called useReducer. You send it simple messages like 'ADD_ITEM' or 'REMOVE_ITEM'. The helper has a rulebook (reducer) that knows how to update the state for each message. Combine this with Context, and any component in your app can send messages and read the state. It's like a mini control center for your app.",
        mid: "Context + useReducer manages complex shared state. The reducer keeps all update logic in one place, making updates predictable and testable. Key pattern: use TWO separate contexts. One for state (changes when data updates). One for dispatch (stable reference, never changes). This way, components that only send actions (like buttons) use the dispatch context and never re-render when state changes. Components that show data use the state context.",
        senior: "The dispatch function from useReducer has a stable reference across renders. Putting dispatch in a separate context from state means action-dispatching components get a value that never changes, so they never re-render from state updates. This is a key optimization. The reducer pattern also supports middleware-like logging, combining reducers, and time-travel debugging. This two-context approach is basically mini-Redux with built-in React tools. For complex apps, consider whether Zustand or Redux Toolkit would be better since they offer devtools, middleware, and selector-based subscriptions."
      },
      realWorld: "A shopping cart in an e-commerce app. The reducer handles ADD_ITEM, REMOVE_ITEM, UPDATE_QUANTITY, APPLY_COUPON, and CLEAR_CART. State context shows cart data on the cart page and header badge. Dispatch context lets product cards add items without re-rendering when the cart changes.",
      whenToUse: "When shared state has complex update logic (many actions, conditional updates). When you want predictable state changes. When many components send actions but don't read state.",
      whenNotToUse: "For simple state like a toggle or single value (too much setup). When you need middleware, devtools, or persistence (use Redux/Zustand). When you'd end up with too many nested providers.",
      pitfalls: "Putting state and dispatch in the same context (loses the performance benefit). Not splitting the reducer when it gets big. Using this for fast updates (still re-renders all consumers).",
      codeExamples: [
        {
          title: "Two-Context Pattern with useReducer",
          code: `import { createContext, useContext, useReducer, useMemo } from "react";

// Two separate contexts: one for data, one for actions
const CartStateContext = createContext(null);
const CartDispatchContext = createContext(null);

const initialState = { items: [], total: 0 };

// All cart logic lives here
function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const exists = state.items.find(i => i.id === action.payload.id);
      const items = exists
        ? state.items.map(i =>
            i.id === action.payload.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        : [...state.items, { ...action.payload, quantity: 1 }];
      return { items, total: items.reduce((s, i) => s + i.price * i.quantity, 0) };
    }
    case "REMOVE_ITEM": {
      const items = state.items.filter(i => i.id !== action.payload);
      return { items, total: items.reduce((s, i) => s + i.price * i.quantity, 0) };
    }
    case "CLEAR":
      return initialState;
    default:
      throw new Error(\`Unknown action: \${action.type}\`);
  }
}

function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  return (
    <CartStateContext.Provider value={state}>
      <CartDispatchContext.Provider value={dispatch}>
        {children}
      </CartDispatchContext.Provider>
    </CartStateContext.Provider>
  );
}

// Hook to read cart data
function useCartState() {
  const context = useContext(CartStateContext);
  if (!context) throw new Error("useCartState must be within CartProvider");
  return context;
}

// Hook to send cart actions
function useCartDispatch() {
  const context = useContext(CartDispatchContext);
  if (!context) throw new Error("useCartDispatch must be within CartProvider");
  return context;
}

// Only sends actions — never re-renders when cart data changes!
function AddToCartButton({ product }) {
  const dispatch = useCartDispatch();
  return (
    <button onClick={() => dispatch({ type: "ADD_ITEM", payload: product })}>
      Add to Cart
    </button>
  );
}

// Reads cart data — re-renders when cart changes
function CartBadge() {
  const { items } = useCartState();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  return <span className="badge">{count}</span>;
}`
        }
      ]
    },
    {
      title: "Context vs Props vs External State — Decision Framework",
      explanations: {
        layman: "You have three ways to share data: (1) Hand-deliver a note (props) — clear and reliable, but annoying if you have to go through 10 floors. (2) Loudspeaker (Context) — easy, but everyone hears everything. (3) Bulletin board with alerts (Zustand/Redux) — anyone can check it, and only people who signed up for specific topics get notified. Each works best in different situations.",
        mid: "Use PROPS when data goes 1-3 levels and few components need it. Use CONTEXT when many components at different depths need data that rarely changes (theme, auth, locale). Use EXTERNAL STATE (Redux, Zustand, Jotai) when: you need selective updates (only re-render what changed), you need middleware or devtools, or state is complex and updates often. Passing props for 2-3 levels is fine. It is explicit and easy to follow.",
        senior: "Performance differs at a basic level. Props rely on parent-child rendering and React.memo can skip unnecessary renders. Context bypasses React.memo and re-renders all consumers. External stores (Zustand, Jotai) use useSyncExternalStore with selectors, giving the most precise updates. Redux/Zustand also offer: time-travel debugging, middleware for logging, persistence to localStorage, and SSR hydration. For teams: Context + useReducer has zero dependencies but limited tooling. Zustand is tiny (~1KB) with selectors. Redux Toolkit has full devtools but a bigger API."
      },
      realWorld: "A large SaaS app uses Context for auth and theme (rare changes, needed everywhere), props for component-specific data (table columns, form fields), and Zustand for real-time dashboard data (frequent updates, many consumers that only care about specific numbers).",
      whenToUse: "Props: always the default. Context: global data that rarely changes. External state: frequent updates with selective subscriptions, complex logic, or devtools needs.",
      whenNotToUse: "Don't use Context for everything. It doesn't replace props. Don't use external state for simple apps. Don't pass props through 10+ levels when Context or external state would be cleaner.",
      pitfalls: "Using Context or Redux before trying props. Putting everything in one Context (poor performance). Using Context for fast-changing state (scroll, animations). Over-engineering state that two siblings share (just lift state to parent).",
      codeExamples: [
        {
          title: "When Props Drilling Is Actually Fine",
          code: `// This is FINE — only 2-3 levels, clear data flow
function UserPage({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <UserHeader user={user} />
      <UserPosts userId={user.id} />
    </div>
  );
}

function UserHeader({ user }) {
  return (
    <header>
      <UserAvatar src={user.avatar} name={user.name} />
      <h1>{user.name}</h1>
    </header>
  );
}

function UserAvatar({ src, name }) {
  return <img src={src} alt={name} />;
}

// DON'T add Context for this! The data flow is clear.
// Context hides where data comes from.
// Props make data flow easy to see and debug.

// Use Context when:
// - 10+ components need the data across different areas
// - Data has to pass through 5+ components that don't use it
// - Components at different depths need the same data
// Example: theme, auth, locale, feature flags`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "Why do ALL context consumers re-render when the context value changes, even with React.memo?",
      answer: "Context and React.memo work on different channels. React.memo checks props and skips re-renders if props are the same. But context doesn't go through props. When a Provider's value changes, React walks the fiber tree and directly marks every consumer for re-render. This happens before React.memo even checks props. Think of it as two doors: props go through the front door (where React.memo is the guard), but context comes through a back door that memo can't block. The only fix is to stop consuming that context, or split the context so a component only subscribes to the data it needs.",
      difficulty: "hard",
      followUps: [
        "How does the context propagation algorithm work internally?",
        "Is there a proposal to add context selectors to React core?",
        "How do libraries like use-context-selector work around this?"
      ]
    },
    {
      question: "What is the split context pattern and why is it important?",
      answer: "It means separating different pieces of data into their own contexts. Instead of one AppContext with user, theme, and notifications, you make UserContext, ThemeContext, and NotificationContext. Now when notifications update, only notification consumers re-render. User and theme consumers are untouched. Important sub-pattern: with useReducer, put state and dispatch in separate contexts. Dispatch never changes, so components that only send actions never re-render from state changes.",
      difficulty: "mid",
      followUps: [
        "How many contexts is too many?",
        "What's the performance cost of deeply nested Providers?",
        "How does Provider nesting order affect performance?"
      ]
    },
    {
      question: "When would you choose Context over an external state library like Zustand?",
      answer: "Use Context when: (1) data rarely changes (theme, auth, locale), (2) most consumers need the full value, (3) you want zero dependencies, (4) the app is small to medium. Use Zustand/Jotai/Redux when: (1) state changes often and many components use it, (2) you need selectors so only affected components re-render, (3) you need middleware, devtools, or persistence, (4) state logic is complex. The key difference: Context re-renders ALL consumers on ANY change. Zustand only re-renders consumers whose selected data actually changed.",
      difficulty: "mid",
      followUps: [
        "How does useSyncExternalStore enable selector-based subscriptions?",
        "What's the bundle size difference between Context and Zustand?",
        "Can you combine Context and Zustand in the same app?"
      ]
    },
    {
      question: "How do you prevent the Provider value from causing unnecessary re-renders?",
      answer: "React compares the Provider's value using Object.is(). If you pass an inline object like <Provider value={{ user, theme }}>, a new object is created every render. All consumers re-render even if user and theme are the same. Fix: wrap the value in useMemo: const value = useMemo(() => ({ user, theme }), [user, theme]). Now the reference only changes when user or theme actually change. Stable functions like dispatch can go in a separate context since they never change.",
      difficulty: "easy",
      followUps: [
        "What comparison does React use for the Provider value?",
        "Why is useMemo appropriate here but not for all values?",
        "What happens if you forget useMemo on the Provider value?"
      ]
    },
    {
      question: "Explain how Context + useReducer compares to Redux.",
      answer: "They are similar: both use reducers with dispatched actions and one-way data flow. But Redux adds: middleware (thunks, sagas), time-travel debugging with DevTools, selector-based subscriptions (useSelector only re-renders when selected data changes), and a big ecosystem. Context + useReducer has zero dependencies but lacks: selectors (all consumers re-render), middleware, devtools, and efficient updates for large state. For small apps, Context + useReducer works fine. For large apps with frequent state changes, Redux Toolkit or Zustand is much better for performance.",
      difficulty: "hard",
      followUps: [
        "How does useSelector in React-Redux achieve selective re-rendering?",
        "Could you implement a selector pattern on top of Context?",
        "What is Redux Toolkit and how does it simplify Redux?"
      ]
    },
    {
      question: "Is prop drilling always bad? When is it actually preferable?",
      answer: "Prop drilling is NOT always bad. It is better when: (1) data goes through 1-3 levels (the flow is clear and easy to trace), (2) only a few components need the data, (3) you want easy testing (props are simple to mock), (4) you're building a component library. It becomes a problem when: (1) passing through 5+ levels where middle components don't use the data, (2) many unrelated components at different depths need the same data, (3) adding a new consumer means changing many files. React docs recommend props as the default. Use Context only when needed.",
      difficulty: "easy",
      followUps: [
        "How does TypeScript help with prop drilling?",
        "What is the component composition pattern as an alternative to prop drilling?",
        "When would you switch from prop drilling to Context?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Build a Theme System with Context",
      difficulty: "easy",
      description: "Create a theme context that supports light/dark mode with CSS variables, persists the choice to localStorage, and provides a toggle function.",
      solution: `import { createContext, useContext, useState, useMemo, useEffect } from "react";

// Create context
const ThemeContext = createContext(null);

// Define color values for each theme
const themes = {
  light: {
    "--bg-primary": "#ffffff",
    "--bg-secondary": "#f5f5f5",
    "--text-primary": "#1a1a1a",
    "--text-secondary": "#666666",
    "--accent": "#0066cc"
  },
  dark: {
    "--bg-primary": "#1a1a1a",
    "--bg-secondary": "#2d2d2d",
    "--text-primary": "#f0f0f0",
    "--text-secondary": "#a0a0a0",
    "--accent": "#4da6ff"
  }
};

function ThemeProvider({ children }) {
  // Load saved theme or default to "light"
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem("theme") || "light";
    } catch {
      return "light";
    }
  });

  // When theme changes, set CSS variables and save to localStorage
  useEffect(() => {
    const colors = themes[mode];
    Object.entries(colors).forEach(([key, val]) => {
      document.documentElement.style.setProperty(key, val);
    });
    try {
      localStorage.setItem("theme", mode);
    } catch {
      // Ignore storage errors
    }
  }, [mode]);

  // Memoize to avoid unnecessary re-renders
  const value = useMemo(() => ({
    mode,
    toggle: () => setMode(m => m === "light" ? "dark" : "light"),
    setMode,
    colors: themes[mode]
  }), [mode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Safe hook with error if Provider is missing
function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

// Example usage
function Header() {
  const { mode, toggle } = useTheme();
  return (
    <header style={{
      background: "var(--bg-secondary)",
      color: "var(--text-primary)",
      padding: 16
    }}>
      <h1>My App</h1>
      <button onClick={toggle}>
        {mode === "light" ? "Switch to Dark" : "Switch to Light"}
      </button>
    </header>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Header />
      <main style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
        <p>Content with theme-aware colors</p>
      </main>
    </ThemeProvider>
  );
}`,
      explanation: "ThemeProvider manages theme state, saves to localStorage, and sets CSS variables on the page. useMemo stops unnecessary re-renders. CSS variables are used so even non-React elements get themed. useTheme throws an error if no Provider is found above it."
    },
    {
      title: "Implement the Split Context Pattern for a Todo App",
      difficulty: "mid",
      description: "Build a todo app using Context + useReducer with the split context pattern. State context and dispatch context should be separate so AddTodo doesn't re-render when todos change.",
      solution: `import {
  createContext, useContext, useReducer, useMemo, memo
} from "react";

// Two separate contexts
const TodoStateContext = createContext(null);
const TodoDispatchContext = createContext(null);

// All update logic in one place
function todoReducer(state, action) {
  switch (action.type) {
    case "ADD":
      return {
        ...state,
        todos: [
          ...state.todos,
          { id: Date.now(), text: action.text, done: false }
        ]
      };
    case "TOGGLE":
      return {
        ...state,
        todos: state.todos.map(t =>
          t.id === action.id ? { ...t, done: !t.done } : t
        )
      };
    case "DELETE":
      return {
        ...state,
        todos: state.todos.filter(t => t.id !== action.id)
      };
    case "SET_FILTER":
      return { ...state, filter: action.filter };
    default:
      throw new Error(\`Unknown action: \${action.type}\`);
  }
}

const initialState = {
  todos: [],
  filter: "all" // "all" | "active" | "completed"
};

function TodoProvider({ children }) {
  const [state, dispatch] = useReducer(todoReducer, initialState);

  return (
    <TodoStateContext.Provider value={state}>
      <TodoDispatchContext.Provider value={dispatch}>
        {children}
      </TodoDispatchContext.Provider>
    </TodoStateContext.Provider>
  );
}

// Hook to read todo data
function useTodoState() {
  const ctx = useContext(TodoStateContext);
  if (!ctx) throw new Error("useTodoState requires TodoProvider");
  return ctx;
}

// Hook to send actions
function useTodoDispatch() {
  const ctx = useContext(TodoDispatchContext);
  if (!ctx) throw new Error("useTodoDispatch requires TodoProvider");
  return ctx;
}

// Only uses dispatch — does NOT re-render when todos change!
function AddTodo() {
  const dispatch = useTodoDispatch();
  const [text, setText] = useState("");

  console.log("AddTodo rendered");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    dispatch({ type: "ADD", text: text.trim() });
    setText("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Add a todo..."
      />
      <button type="submit">Add</button>
    </form>
  );
}

// Reads state — re-renders when todos or filter change
function TodoList() {
  const { todos, filter } = useTodoState();
  const dispatch = useTodoDispatch();

  // Filter todos based on current filter
  const filteredTodos = useMemo(() => {
    switch (filter) {
      case "active": return todos.filter(t => !t.done);
      case "completed": return todos.filter(t => t.done);
      default: return todos;
    }
  }, [todos, filter]);

  return (
    <div>
      <div>
        {["all", "active", "completed"].map(f => (
          <button
            key={f}
            onClick={() => dispatch({ type: "SET_FILTER", filter: f })}
            style={{ fontWeight: filter === f ? "bold" : "normal" }}
          >
            {f}
          </button>
        ))}
      </div>
      <ul>
        {filteredTodos.map(todo => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
    </div>
  );
}

// memo + dispatch only = re-renders only when its own todo prop changes
const TodoItem = memo(function TodoItem({ todo }) {
  const dispatch = useTodoDispatch();
  console.log("TodoItem rendered:", todo.text);

  return (
    <li>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => dispatch({ type: "TOGGLE", id: todo.id })}
      />
      <span style={{ textDecoration: todo.done ? "line-through" : "none" }}>
        {todo.text}
      </span>
      <button onClick={() => dispatch({ type: "DELETE", id: todo.id })}>
        Delete
      </button>
    </li>
  );
});

function App() {
  return (
    <TodoProvider>
      <h1>Todos</h1>
      <AddTodo />
      <TodoList />
    </TodoProvider>
  );
}`,
      explanation: "State and dispatch live in separate contexts. Dispatch is stable (never changes), so AddTodo (which only dispatches) never re-renders when todos change. TodoItem is wrapped in memo and only uses dispatch, so it only re-renders when its own todo prop changes. This pattern keeps re-renders to a minimum."
    },
    {
      title: "Build a Context-based Notification System",
      difficulty: "hard",
      description: "Create a notification system with Context that supports multiple notification types, auto-dismiss, stacking, and optimized re-rendering (components that only add notifications shouldn't re-render when the list changes).",
      solution: `import {
  createContext, useContext, useReducer, useCallback, useEffect, useRef, useMemo
} from "react";

// Split: notification list vs notification actions
const NotificationStateContext = createContext([]);
const NotificationActionsContext = createContext(null);

function notificationReducer(state, action) {
  switch (action.type) {
    case "ADD":
      return [...state, {
        id: Date.now() + Math.random(),
        message: action.message,
        type: action.notificationType || "info", // info | success | error | warning
        duration: action.duration ?? 5000,
        createdAt: Date.now()
      }];
    case "REMOVE":
      return state.filter(n => n.id !== action.id);
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

function NotificationProvider({ children, maxVisible = 5 }) {
  const [notifications, dispatch] = useReducer(notificationReducer, []);

  // Actions are memoized with [] so they never change
  // Components using these actions won't re-render when notifications change
  const actions = useMemo(() => ({
    addNotification: (message, options = {}) => {
      dispatch({
        type: "ADD",
        message,
        notificationType: options.type,
        duration: options.duration
      });
    },
    removeNotification: (id) => {
      dispatch({ type: "REMOVE", id });
    },
    clearAll: () => {
      dispatch({ type: "CLEAR" });
    },
    // Shortcut methods
    success: (msg, opts) => dispatch({ type: "ADD", message: msg, notificationType: "success", ...opts }),
    error: (msg, opts) => dispatch({ type: "ADD", message: msg, notificationType: "error", duration: opts?.duration ?? 8000 }),
    warning: (msg, opts) => dispatch({ type: "ADD", message: msg, notificationType: "warning", ...opts }),
    info: (msg, opts) => dispatch({ type: "ADD", message: msg, notificationType: "info", ...opts })
  }), []);

  // Only show the last N notifications
  const visibleNotifications = notifications.slice(-maxVisible);

  return (
    <NotificationActionsContext.Provider value={actions}>
      <NotificationStateContext.Provider value={visibleNotifications}>
        {children}
        <NotificationContainer />
      </NotificationStateContext.Provider>
    </NotificationActionsContext.Provider>
  );
}

// Hook to read notification list
function useNotifications() {
  return useContext(NotificationStateContext);
}

// Hook to send notification actions (stable, never causes re-renders)
function useNotify() {
  const ctx = useContext(NotificationActionsContext);
  if (!ctx) throw new Error("useNotify must be within NotificationProvider");
  return ctx;
}

// Each notification handles its own auto-dismiss timer
function NotificationItem({ notification }) {
  const { removeNotification } = useNotify();
  const timerRef = useRef(null);

  useEffect(() => {
    if (notification.duration > 0) {
      timerRef.current = setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration);
    }
    return () => clearTimeout(timerRef.current);
  }, [notification.id, notification.duration, removeNotification]);

  const colors = {
    info: "#2196F3", success: "#4CAF50",
    error: "#f44336", warning: "#FF9800"
  };

  return (
    <div style={{
      padding: "12px 20px",
      marginBottom: 8,
      borderRadius: 8,
      backgroundColor: colors[notification.type] || colors.info,
      color: "white",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      animation: "slideIn 0.3s ease-out"
    }}>
      <span>{notification.message}</span>
      <button
        onClick={() => removeNotification(notification.id)}
        style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}
      >
        x
      </button>
    </div>
  );
}

// Shows the notification stack
function NotificationContainer() {
  const notifications = useNotifications();

  return (
    <div style={{
      position: "fixed",
      top: 16,
      right: 16,
      width: 350,
      zIndex: 9999
    }}>
      {notifications.map(n => (
        <NotificationItem key={n.id} notification={n} />
      ))}
    </div>
  );
}

// This component NEVER re-renders when notifications change
function SaveButton() {
  const { success, error } = useNotify();

  console.log("SaveButton rendered"); // Only once!

  const handleSave = async () => {
    try {
      await fetch("/api/save", { method: "POST" });
      success("Saved successfully!");
    } catch {
      error("Failed to save. Please try again.");
    }
  };

  return <button onClick={handleSave}>Save</button>;
}`,
      explanation: "Two contexts split the notification list from the action functions. The actions context is memoized with an empty array, so it never changes. Components that only add notifications (like SaveButton) never re-render when the list changes. Each NotificationItem manages its own auto-dismiss timer. Shortcut methods (success, error, warning, info) make the API easy to use."
    }
  ],
  quiz: [
    {
      question: "When does a component receive the default value from createContext(defaultValue)?",
      options: [
        "When the Provider passes undefined as value",
        "When there is no matching Provider above the component in the tree",
        "When the Provider's value is null",
        "On the first render only"
      ],
      correct: 1,
      explanation: "The default value is used ONLY when there is no Provider above the consumer. Passing undefined or null as the Provider's value is different from having no Provider. Those are valid values that the consumer will receive."
    },
    {
      question: "Why should you memoize the Provider's value?",
      options: [
        "To make the Provider render faster",
        "To prevent all consumers from re-rendering when the Provider's parent re-renders without changing the actual context data",
        "It's required by React",
        "To enable deep comparison of values"
      ],
      correct: 1,
      explanation: "Without useMemo, an inline object like <Provider value={{ user }}> creates a new reference every render. Even if 'user' is the same, Object.is() sees a new object and re-renders ALL consumers. useMemo keeps the same reference when the data hasn't changed."
    },
    {
      question: "Can React.memo prevent a component from re-rendering due to context changes?",
      options: [
        "Yes, React.memo blocks all unnecessary re-renders",
        "No, context propagation bypasses React.memo entirely",
        "Only if you provide a custom comparison function",
        "Only in production mode"
      ],
      correct: 1,
      explanation: "Context marks consumer components directly for re-render, skipping the React.memo props check entirely. A memo-wrapped component that uses a context WILL still re-render when that context value changes, no matter what its props are."
    },
    {
      question: "In the Context + useReducer pattern, why split state and dispatch into separate contexts?",
      options: [
        "React requires it",
        "It makes the code more organized",
        "dispatch is stable (never changes reference), so components that only dispatch never re-render from state changes",
        "It prevents the reducer from running on every render"
      ],
      correct: 2,
      explanation: "The dispatch function from useReducer always has the same reference. By putting it in its own context, components that only send actions (buttons, forms) get a value that never changes, so they never re-render when state updates."
    },
    {
      question: "When is prop drilling preferable to using Context?",
      options: [
        "Never — Context is always better",
        "When data passes through 1-3 levels and few components need it — explicit data flow is clearer",
        "Only in class components",
        "When you're using TypeScript"
      ],
      correct: 1,
      explanation: "Prop drilling is clear, easy to trace, and simple to understand. For shallow trees (1-3 levels) with few consumers, props are better. Context adds hidden data flow and possible performance issues. React docs recommend props as the default."
    }
  ]
};
