export const reactPatterns = {
  id: "react-patterns",
  title: "React Patterns",
  icon: "\u{1F9E9}",
  tag: "React Advanced",
  tagColor: "var(--tag-react)",
  subtitle: "Master controlled/uncontrolled components, compound patterns, HOCs, render props, and composition",
  concepts: [
    {
      title: "Controlled vs Uncontrolled Components",
      explanations: {
        layman: "This is about who is in charge of form data: React or the browser. A controlled component is when React tracks every letter you type. You store the value in state, and update it on every keystroke. You always know what the user typed. An uncontrolled component is when the browser handles the input. You only grab the value when you need it (like on submit) using a ref. Controlled = React is in charge. Uncontrolled = browser is in charge.",
        mid: "A controlled component gets its value from state and updates via onChange: `<input value={name} onChange={e => setName(e.target.value)} />`. React is the single source of truth. An uncontrolled component stores its value in the DOM. You read it with a ref: `const ref = useRef(); <input ref={ref} defaultValue=\"hello\" />`. Use controlled for live validation or formatted inputs. Use uncontrolled for simple forms where you only need the value on submit.",
        senior: "React's reconciliation sets the DOM input's value property on every commit, overriding user input. That is why a controlled input without onChange is read-only. A subtle bug: setting state asynchronously in onChange (e.g., in setTimeout) can cause cursor jumps because React resets the value before the update lands. React 18+ batching can also interact with IME composition events. Internally, React's inputValueTracking compares cached vs DOM values to decide whether to fire synthetic onChange. Uncontrolled inputs skip all this since React never touches the value after mount. File inputs must be uncontrolled because JavaScript cannot set their value."
      },
      realWorld: "Controlled: search bars with live filtering, credit card formatting, forms with cross-field checks. Uncontrolled: file uploads, simple submit-only forms, wrapping non-React libraries.",
      whenToUse: "Use controlled for live validation, input formatting, or when multiple components share the same value. Use uncontrolled for simple forms, file inputs, or third-party DOM library integration.",
      whenNotToUse: "Do not use controlled for huge forms with hundreds of fields. Each keystroke re-renders the parent. Use uncontrolled or a form library like React Hook Form instead. Do not use uncontrolled when you need instant validation.",
      pitfalls: "Switching between controlled and uncontrolled (value going from undefined to defined) causes a React warning. Always start controlled inputs with an empty string, not undefined. Forgetting onChange on a controlled input makes it read-only. defaultValue on a controlled input does nothing after mount.",
      codeExamples: [
        {
          title: "Controlled Input with Validation",
          code: `function ControlledForm() {
  // Store the email value in state
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    // Check if email is valid
    if (value && !value.includes("@")) {
      setError("Invalid email address");
    } else {
      setError("");
    }
  };

  return (
    <form>
      <input
        type="email"
        value={email}
        onChange={handleChange}
        className={error ? "input-error" : ""}
      />
      {error && <span className="error">{error}</span>}
    </form>
  );
}`
        },
        {
          title: "Uncontrolled Input with Ref",
          code: `function UncontrolledForm() {
  // Use refs to grab values on submit
  const nameRef = useRef(null);
  const fileRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = nameRef.current.value;
    const file = fileRef.current.files[0];
    console.log("Submitted:", { name, file });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={nameRef} defaultValue="John" />
      <input ref={fileRef} type="file" />
      <button type="submit">Submit</button>
    </form>
  );
}`
        }
      ]
    },
    {
      title: "Lifting State Up",
      explanations: {
        layman: "When two sibling components need to share data, move that data to their parent. The parent holds the data and passes it down to both children. This way both children always show the same thing. It is like two kids sharing one toy held by a parent instead of each having their own copy.",
        mid: "Lifting state up means moving state from a child to the nearest common parent so multiple children can share it. The parent owns the state and passes it down as props, along with setter functions. For example, if Celsius and Fahrenheit inputs need to stay in sync, the parent holds the temperature and computes both values. Data flows down via props, events flow up via callbacks.",
        senior: "Lifting state is a natural result of React's one-way data flow. When state is lifted, every update re-renders the parent and all children receiving that state. This can hurt performance. Use React.memo, useMemo, and useCallback to avoid unnecessary child re-renders. In React Fiber, the update goes to the parent fiber's queue, marking its subtree for re-render. Over-lifting to a high ancestor causes large subtree re-renders. Fix this by keeping state close to where it is used, using Context for deep consumers, or using external state managers with targeted subscriptions."
      },
      realWorld: "Currency converters with synced inputs, filter controls that affect sibling displays, parent forms collecting child input values, cart totals that update when product quantities change.",
      whenToUse: "When two or more sibling components need the same data, or when a parent needs to coordinate children based on shared state.",
      whenNotToUse: "Do not lift state higher than needed. If only one component uses the data, keep it local. Do not lift to the app root just for convenience. For deeply nested consumers, use Context or a state library instead.",
      pitfalls: "Over-lifting causes performance issues because the parent and all children re-render on every change. Forgetting to memoize callbacks means children re-render even when their data has not changed. When lifting state, also move the related logic (validation, formatting) to the parent.",
      codeExamples: [
        {
          title: "Temperature Sync Between Celsius and Fahrenheit",
          code: `function Calculator() {
  // Parent holds the shared temperature
  const [temperature, setTemperature] = useState("");
  const [scale, setScale] = useState("c");

  // Compute both values from one source
  const celsius = scale === "f"
    ? ((parseFloat(temperature) - 32) * 5) / 9
    : temperature;
  const fahrenheit = scale === "c"
    ? (parseFloat(temperature) * 9) / 5 + 32
    : temperature;

  return (
    <div>
      <TemperatureInput
        scale="c"
        value={celsius}
        onChange={(val) => { setTemperature(val); setScale("c"); }}
      />
      <TemperatureInput
        scale="f"
        value={fahrenheit}
        onChange={(val) => { setTemperature(val); setScale("f"); }}
      />
    </div>
  );
}

function TemperatureInput({ scale, value, onChange }) {
  return (
    <fieldset>
      <legend>{scale === "c" ? "Celsius" : "Fahrenheit"}</legend>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </fieldset>
  );
}`
        }
      ]
    },
    {
      title: "Compound Components Pattern",
      explanations: {
        layman: "Think of HTML's <select> and <option>. They only work together. The <select> tracks which option is picked, and each <option> just shows itself. Compound components work the same way. A parent component manages shared state, and its children use that state automatically. Like a TV remote (parent) and its buttons (children). The remote knows which button is active.",
        mid: "Compound components let a parent manage internal state and share it with children through Context. The user writes clean JSX like `<Tabs><Tab>One</Tab><Tab>Two</Tab></Tabs>` without wiring state manually. Inside, Tabs shares activeIndex via context, and each Tab reads it to know if it is active. This keeps logic hidden while giving full control over layout. Libraries like Radix UI and Headless UI use this pattern.",
        senior: "Two ways to build this: React.cloneElement or Context. cloneElement injects props into direct children. It is simple but breaks with fragments, wrappers, or deeply nested children. Context is more flexible since children consume it at any depth. To avoid unnecessary re-renders, stabilize the context value with useMemo. An advanced version uses a ref-based registry where children register themselves via useEffect. In Fiber, context consumers are tracked via a dependencies list on each fiber. When context changes, React walks the subtree to find and re-render all consumers. This is O(n) in subtree size, so frequent updates in deeply nested compound components can be costly."
      },
      realWorld: "Tab components, Accordion, Dropdown menus, Modal with Header/Body/Footer, Stepper/Wizard, Form with Field/Label/Error parts.",
      whenToUse: "When components work as a group, where the parent manages state and children define the layout. When you want a clean, declarative API for your component library.",
      whenNotToUse: "When simple props are enough. Do not over-engineer a component that just takes an array. Compound components add complexity that can confuse developers new to the pattern.",
      pitfalls: "cloneElement breaks with wrappers, fragments, or render functions. Context-based versions cause extra re-renders if the context value is not memoized. Children used outside the parent will crash if context is missing. Always show a clear error message in the context hook.",
      codeExamples: [
        {
          title: "Compound Tabs Component with Context",
          code: `// Create context for sharing tab state
const TabsContext = createContext(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tab components must be used within <Tabs>");
  return ctx;
}

function Tabs({ children, defaultIndex = 0 }) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  // Memoize to prevent unnecessary re-renders
  const value = useMemo(
    () => ({ activeIndex, setActiveIndex }),
    [activeIndex]
  );
  return (
    <TabsContext.Provider value={value}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children }) {
  return <div className="tab-list" role="tablist">{children}</div>;
}

function Tab({ children, index }) {
  const { activeIndex, setActiveIndex } = useTabs();
  return (
    <button
      role="tab"
      aria-selected={activeIndex === index}
      className={activeIndex === index ? "tab active" : "tab"}
      onClick={() => setActiveIndex(index)}
    >
      {children}
    </button>
  );
}

function TabPanel({ children, index }) {
  const { activeIndex } = useTabs();
  if (activeIndex !== index) return null;
  return <div role="tabpanel" className="tab-panel">{children}</div>;
}

// Usage:
function App() {
  return (
    <Tabs defaultIndex={0}>
      <TabList>
        <Tab index={0}>Profile</Tab>
        <Tab index={1}>Settings</Tab>
        <Tab index={2}>Billing</Tab>
      </TabList>
      <TabPanel index={0}><ProfilePage /></TabPanel>
      <TabPanel index={1}><SettingsPage /></TabPanel>
      <TabPanel index={2}><BillingPage /></TabPanel>
    </Tabs>
  );
}`
        }
      ]
    },
    {
      title: "Render Props Pattern",
      explanations: {
        layman: "Imagine hiring a photographer. You tell them what pictures you want, but they handle all the camera work. A render prop component does the hard work (tracking the mouse, fetching data) and then asks you: 'Here is the data. What should I show?' You give it a function that says how to display the data. The component calls your function with the results.",
        mid: "A render prop is a function passed as a prop that returns JSX. The component calls this function with its internal state, letting the consumer decide what to render. Example: `<Mouse render={({ x, y }) => <Cursor x={x} y={y} />} />`. Mouse tracks position and passes it to the render function. The children-as-a-function variant uses the children prop: `<Mouse>{({ x, y }) => <Cursor x={x} y={y} />}</Mouse>`. This gives reusable logic with customizable output.",
        senior: "Render props were the main code reuse pattern before hooks. They avoid HOC issues like wrapper hell and prop collisions. But they have their own problem: nesting multiple render prop components creates callback hell with deep indentation. Performance-wise, inline render functions create new references on every parent render, so the render prop component cannot bail out via React.memo. Hooks replaced most render prop use cases. Render props are still useful for component-level inversion of control (like React Router's Route or Formik's Field). In Fiber, render prop components are regular fibers that call props.render() or props.children(). There is no special optimization."
      },
      realWorld: "React Router v5 Route, Formik Field and Form, downshift for accessible comboboxes, mouse/scroll/resize trackers, auth gate components.",
      whenToUse: "When you want to share logic but let consumers control the output. When building library components where you cannot predict how users will display data. When hooks are not an option (class components).",
      whenNotToUse: "If hooks solve the problem, use hooks. They are simpler and add no nesting. Do not use render props when simple props or composition work. Avoid nesting many render props together.",
      pitfalls: "Inline render functions create new references every render, breaking React.memo. Nesting multiple render props makes code hard to read. The pattern confuses developers not used to functions-as-children. TypeScript types for render props can be verbose.",
      codeExamples: [
        {
          title: "Mouse Position Tracker with Render Prop",
          code: `function MouseTracker({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // Call the render function with position data
  return render(position);
}

// Usage: you decide what to show with the position
function App() {
  return (
    <MouseTracker
      render={({ x, y }) => (
        <div>
          <h1>Move your mouse</h1>
          <p>Position: ({x}, {y})</p>
          <div
            style={{
              position: "absolute",
              left: x - 10,
              top: y - 10,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "red",
              pointerEvents: "none",
            }}
          />
        </div>
      )}
    />
  );
}`
        },
        {
          title: "Children-as-a-Function Toggle",
          code: `function Toggle({ children }) {
  const [on, setOn] = useState(false);
  const toggle = useCallback(() => setOn(prev => !prev), []);

  // Pass state to children function
  return children({ on, toggle });
}

// Usage: children is a function that receives toggle state
function App() {
  return (
    <Toggle>
      {({ on, toggle }) => (
        <div>
          <button onClick={toggle}>
            {on ? "Hide" : "Show"} Details
          </button>
          {on && <p>Here are the hidden details!</p>}
        </div>
      )}
    </Toggle>
  );
}`
        }
      ]
    },
    {
      title: "Higher-Order Components (HOCs)",
      explanations: {
        layman: "A HOC is like a phone case factory. You give it your phone (component), and it adds extra features like a kickstand or wallet (extra data or logic). The original phone still works. It just has more abilities. A HOC takes a component in and returns a new, upgraded component out.",
        mid: "A Higher-Order Component is a function that takes a component and returns a new component with extra behavior: `const Enhanced = withFeature(Original)`. The HOC wraps the original, injecting extra props or adding logic. Examples: `withRouter` (React Router v5), `connect` (Redux), `withAuth`. The enhanced component renders the original with all its props plus injected ones: `return <WrappedComponent {...props} extraData={data} />`.",
        senior: "HOCs were the main pattern before hooks. Known problems: (1) Wrapper hell with deeply nested trees in DevTools. (2) Prop collisions when two HOCs inject the same prop name. (3) Static composition at definition time, not render time. (4) Refs break unless you use React.forwardRef. (5) Static methods are lost unless you use hoist-non-react-statics. Each HOC adds a fiber node, increasing memory and reconciliation cost. Hooks replaced most HOC use cases: useAuth() instead of withAuth(). HOCs are still valid for error boundaries (which must be class components) and wrapping third-party components you cannot modify."
      },
      realWorld: "Redux connect(), React Router withRouter, withAuth for protecting routes, withTheme for injecting theme, withLoading for spinners. React.memo() is technically a HOC too.",
      whenToUse: "When many components need the same behavior. When wrapping third-party components you cannot change. When working with class components. When composing multiple enhancements.",
      whenNotToUse: "Prefer hooks when possible. Do not make a HOC for logic used by one component. Do not stack many HOCs. Avoid them when injected props would collide with existing ones.",
      pitfalls: "Prop name collisions between HOCs. Forgetting to forward refs (use React.forwardRef). Losing static methods (use hoist-non-react-statics). Creating HOCs inside render destroys state on every render. Not setting displayName for debugging.",
      codeExamples: [
        {
          title: "withAuth HOC for Protected Components",
          code: `function withAuth(WrappedComponent) {
  function WithAuth(props) {
    const { user, loading } = useAuth();

    if (loading) return <Spinner />;
    if (!user) return <Navigate to="/login" />;

    // Pass all props plus the user to the wrapped component
    return <WrappedComponent {...props} user={user} />;
  }

  // Set display name for React DevTools
  WithAuth.displayName = \`WithAuth(\${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })\`;

  return WithAuth;
}

// Usage: wrap any component to make it require login
const ProtectedDashboard = withAuth(Dashboard);

function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<ProtectedDashboard />} />
    </Routes>
  );
}`
        }
      ]
    },
    {
      title: "Composition vs Inheritance in React",
      explanations: {
        layman: "Inheritance is like a family tree where children get everything from parents. Composition is like building with LEGO. You snap pieces together to make something new. React uses the LEGO approach. Instead of making a SpecialButton that inherits from Button, you make a Button that accepts children, icons, and styles as props. You build complex things from simple parts.",
        mid: "React is built on composition, not inheritance. You combine components by nesting them and passing children and props. `<Dialog><AlertContent /></Dialog>` is composition. Dialog does not need to know about AlertContent. You use the children prop for single slots, named props for multiple slots (header, footer), and render props for dynamic content. The React docs say Facebook uses React in thousands of components and has never needed inheritance hierarchies. Error Boundaries are the only exception (they require extending React.Component).",
        senior: "Composition fits React's functional roots. Components are functions that compose like f(g(x)). Inheritance creates tight coupling and makes refactoring risky. When you pass components as props (slot pattern), they are created by the parent, so their position in the fiber tree belongs to the parent. This affects context access and error boundary scope. Advanced patterns include component injection (`as={CustomButton}`) and polymorphic components (`<Box as=\"section\">`). Typing polymorphic components in TypeScript requires careful use of generics."
      },
      realWorld: "Layout components with slots (header, sidebar, content), Dialog with composable content, Button with icon and text, polymorphic components like MUI Box, compound component APIs.",
      whenToUse: "Always prefer composition in React. Use children for single slots. Use named props for multi-slot layouts. Use render props or component injection for maximum flexibility.",
      whenNotToUse: "Do not force composition when a simple component with a few props is enough. Too many tiny components can make code hard to follow. Only extend a React class for Error Boundaries.",
      pitfalls: "Too many layers of composition makes the component tree hard to follow. Prop drilling through many composed layers is painful. Use context to skip levels. Not using the children prop enough leads to rigid APIs with too many specific props.",
      codeExamples: [
        {
          title: "Multi-Slot Composition Pattern",
          code: `// Card with header, body, and footer slots
function Card({ header, children, footer, variant = "default" }) {
  return (
    <div className={\`card card--\${variant}\`}>
      {header && <div className="card-header">{header}</div>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

// Usage: compose any content into each slot
function UserProfile({ user }) {
  return (
    <Card
      variant="elevated"
      header={
        <div className="flex items-center gap-2">
          <Avatar src={user.avatar} />
          <h2>{user.name}</h2>
        </div>
      }
      footer={
        <div className="flex gap-2">
          <Button variant="primary">Follow</Button>
          <Button variant="ghost">Message</Button>
        </div>
      }
    >
      <p>{user.bio}</p>
      <Stats followers={user.followers} posts={user.posts} />
    </Card>
  );
}`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "What is the difference between controlled and uncontrolled components? When would you choose one over the other?",
      answer: "The difference is who owns the data. In controlled components, React owns the value. The input reads from state (value={name}) and updates via onChange. The DOM always matches state. In uncontrolled components, the DOM owns the value. You set an initial value with defaultValue and read it via ref when needed. Choose controlled for: live validation, input formatting, synced inputs, or programmatic resets. Choose uncontrolled for: simple submit-only forms, file inputs (must be uncontrolled), or non-React library integration. Performance tip: controlled inputs re-render on every keystroke. For large forms, use uncontrolled inputs or React Hook Form.",
      difficulty: "easy",
      followUps: [
        "What happens if you provide a value prop but no onChange handler?",
        "Why must file inputs always be uncontrolled?",
        "How does React Hook Form achieve performance with uncontrolled inputs?"
      ]
    },
    {
      question: "Explain the compound components pattern. How would you implement it, and what are the tradeoffs of using React.cloneElement vs Context?",
      answer: "Compound components are a group of components that work together. A parent manages shared state, and children use it automatically. Like HTML's <select>/<option>. Two ways to build it: (1) React.cloneElement: the parent injects props into children. Simple, but only works with direct children. Breaks with fragments or wrapper divs. (2) Context: the parent shares state via context. Children consume it at any depth. More flexible but needs more setup (createContext, Provider, custom hook). The tradeoff: Context needs memoization (useMemo) on the value to prevent extra re-renders of all consumers.",
      difficulty: "mid",
      followUps: [
        "How do you prevent consumers from using child components outside the parent?",
        "How would you type compound components in TypeScript?",
        "How do you optimize re-renders in context-based compound components?"
      ]
    },
    {
      question: "What are Higher-Order Components? What problems do they have that hooks solve?",
      answer: "HOCs are functions that take a component and return a new enhanced component. They were the main pattern for shared logic before hooks. Problems: (1) Wrapper hell with deeply nested component trees. (2) Prop collisions when two HOCs inject the same prop name. (3) Applied at definition time, not render time. (4) Refs break without React.forwardRef. (5) Static methods get lost. (6) Hard to tell which HOC provides which prop. Hooks fix all of these: no wrappers, no collisions (you name variables), dynamic at render time, refs work normally, and logic is clear and colocated.",
      difficulty: "mid",
      followUps: [
        "Are there any cases where HOCs are still useful over hooks?",
        "Why should you never create a HOC inside a render method?",
        "How does React.memo relate to the HOC pattern?"
      ]
    },
    {
      question: "Explain the render props pattern. Why has it fallen out of favor, and when is it still useful?",
      answer: "Render props is when a component takes a function as a prop and calls it with its internal data, letting the consumer decide what to show. Example: `<DataFetcher render={({ data, loading }) => ...} />`. It fell out of favor because hooks do the same thing with less nesting and better performance. But render props are still useful for: (1) Letting a parent control what a child slot renders based on the child's state. (2) Library APIs like Formik's Field. (3) When you want a component API instead of exposing a hook.",
      difficulty: "mid",
      followUps: [
        "How does the children-as-a-function variant work?",
        "What performance issues can arise from inline render functions?",
        "How would you refactor a render prop component to use hooks?"
      ]
    },
    {
      question: "Why does React favor composition over inheritance? Give a concrete example where someone might reach for inheritance but composition is better.",
      answer: "React favors composition because components are functions that naturally combine together. Inheritance creates tight coupling and makes changes risky. Example: You need FancyButton and DangerButton. With inheritance, you might extend a ButtonBase. But what about FancyDangerButton? Multiple inheritance does not exist in JavaScript. With composition, Button accepts variant, size, icon, and children: `<Button variant=\"danger\" size=\"lg\"><Icon /> Delete</Button>`. Or use the polymorphic 'as' prop: `<Button as={Link} to=\"/home\">Go Home</Button>`. Composition handles every combination without a class hierarchy.",
      difficulty: "easy",
      followUps: [
        "What is the one exception where class inheritance is required in React?",
        "What is the polymorphic component pattern?",
        "How does TypeScript handle polymorphic component types?"
      ]
    },
    {
      question: "How would you design a flexible Form component API using React patterns? Walk through the tradeoffs of different approaches.",
      answer: "Four main approaches: (1) Props-based: `<Form fields={[...]} />`. Simple but inflexible, hard to customize fields. (2) Compound components: `<Form><Field name=\"email\"><Input /></Field></Form>`. Flexible layout, declarative, needs context for state. (3) Render props: `<Form>{({ values, errors }) => <form>...</form>}</Form>`. Maximum flexibility but adds nesting. (4) Hook-based: `const { register, handleSubmit } = useForm()`. No component overhead, full flexibility. Formik uses render props + compound components. React Hook Form uses hooks + uncontrolled inputs for best performance. Pick compound components for design systems, hooks for performance-critical forms.",
      difficulty: "hard",
      followUps: [
        "How would you handle cross-field validation in each approach?",
        "What is the performance difference between controlled form libraries and React Hook Form?",
        "How would you implement a multi-step wizard form?"
      ]
    },
    {
      question: "What is the 'component as prop' pattern and how does it differ from render props? When is each more appropriate?",
      answer: "Component-as-prop passes a component TYPE: `<List renderItem={ItemCard} />`. The parent creates instances: `items.map(item => <renderItem key={item.id} {...item} />)`. Render props pass a FUNCTION that returns JSX: `<List renderItem={(item) => <ItemCard {...item} />} />`. The key difference: component-as-prop lets the parent control memoization and keying. The component can have its own hooks. Render props give more control (access to parent variables, conditional logic) but create new function references each render. Use component-as-prop for repeated elements like list items. Use render props for one-off custom rendering that needs parent scope access.",
      difficulty: "hard",
      followUps: [
        "How does the 'as' prop (polymorphic component) relate to this pattern?",
        "What are the TypeScript implications of each approach?",
        "How would you memoize a render prop function?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Build a Compound Accordion Component",
      difficulty: "mid",
      description: "Create a compound Accordion component with Accordion, AccordionItem, AccordionHeader, and AccordionPanel subcomponents. Only one item should be open at a time (single-expand mode). Use Context for state sharing.",
      solution: `// Context for the whole accordion (which item is open)
const AccordionContext = createContext(null);

function useAccordion() {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error("Accordion components must be used within <Accordion>");
  return ctx;
}

// Context for each item (its id and open state)
const ItemContext = createContext(null);

function Accordion({ children, defaultOpen = null }) {
  const [openId, setOpenId] = useState(defaultOpen);

  // Toggle: close if already open, otherwise open
  const toggle = useCallback((id) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  const value = useMemo(() => ({ openId, toggle }), [openId, toggle]);

  return (
    <AccordionContext.Provider value={value}>
      <div className="accordion">{children}</div>
    </AccordionContext.Provider>
  );
}

function AccordionItem({ children, id }) {
  const { openId } = useAccordion();
  const isOpen = openId === id;
  const value = useMemo(() => ({ id, isOpen }), [id, isOpen]);

  return (
    <ItemContext.Provider value={value}>
      <div className={\`accordion-item \${isOpen ? "open" : ""}\`}>
        {children}
      </div>
    </ItemContext.Provider>
  );
}

function AccordionHeader({ children }) {
  const { toggle } = useAccordion();
  const { id, isOpen } = useContext(ItemContext);

  return (
    <button
      className="accordion-header"
      onClick={() => toggle(id)}
      aria-expanded={isOpen}
    >
      {children}
      <span className={\`chevron \${isOpen ? "rotated" : ""}\`}>&#9660;</span>
    </button>
  );
}

function AccordionPanel({ children }) {
  const { isOpen } = useContext(ItemContext);
  if (!isOpen) return null;

  return (
    <div className="accordion-panel" role="region">
      {children}
    </div>
  );
}

// Usage:
function FAQ() {
  return (
    <Accordion defaultOpen="q1">
      <AccordionItem id="q1">
        <AccordionHeader>What is React?</AccordionHeader>
        <AccordionPanel>
          React is a JavaScript library for building user interfaces.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem id="q2">
        <AccordionHeader>What are hooks?</AccordionHeader>
        <AccordionPanel>
          Hooks let you use state and lifecycle features in function components.
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}`,
      explanation: "Two layers of context: AccordionContext shares the open/toggle state for the whole accordion. ItemContext gives each item its own id and open state. The parent Accordion tracks which item is open. AccordionHeader toggles via the parent context. AccordionPanel shows or hides based on open state. useMemo and useCallback keep context values stable to prevent extra re-renders."
    },
    {
      title: "Create a withLogger HOC",
      difficulty: "easy",
      description: "Create a Higher-Order Component called withLogger that logs when the wrapped component mounts, updates, and unmounts. It should also log the props received on each render. Make sure to handle displayName and ref forwarding.",
      solution: `function withLogger(WrappedComponent) {
  // forwardRef so refs pass through to the wrapped component
  const WithLogger = React.forwardRef((props, ref) => {
    const renderCount = useRef(0);
    const componentName =
      WrappedComponent.displayName || WrappedComponent.name || "Component";

    // Log mount and unmount
    useEffect(() => {
      console.log(\`[\${componentName}] Mounted with props:\`, props);
      return () => {
        console.log(\`[\${componentName}] Unmounted\`);
      };
    }, []);

    // Log every render
    useEffect(() => {
      renderCount.current += 1;
      console.log(
        \`[\${componentName}] Render #\${renderCount.current}, props:\`,
        props
      );
    });

    return <WrappedComponent ref={ref} {...props} />;
  });

  // Set display name for React DevTools
  WithLogger.displayName = \`WithLogger(\${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })\`;

  return WithLogger;
}

// Usage:
const LoggedButton = withLogger(Button);

function App() {
  const buttonRef = useRef(null);
  return <LoggedButton ref={buttonRef} onClick={() => alert("hi")}>Click</LoggedButton>;
}`,
      explanation: "The HOC wraps the original component and adds useEffect hooks for logging. React.forwardRef makes sure refs reach the wrapped component. displayName helps with debugging in React DevTools. The render count ref tracks re-renders without causing extra renders itself."
    },
    {
      title: "Refactor Render Props to Custom Hook",
      difficulty: "mid",
      description: "Given a WindowSize render prop component, refactor it into a useWindowSize custom hook while maintaining the same functionality.",
      solution: `// BEFORE: Render prop pattern
function WindowSize({ render }) {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return render(size);
}

// Usage was: <WindowSize render={({ width }) => <p>Width: {width}</p>} />

// AFTER: Custom hook (same logic, cleaner API)
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}

// Usage: just call the hook, no nesting needed
function ResponsiveComponent() {
  const { width, height } = useWindowSize();

  return (
    <div>
      <p>Width: {width}, Height: {height}</p>
      {width < 768 ? <MobileNav /> : <DesktopNav />}
    </div>
  );
}`,
      explanation: "The state and effects from the render prop component map directly to the hook's useState and useEffect. The hook returns the data that was previously passed to the render function. This removes the nesting, removes the function-as-prop overhead, and gives a cleaner API. Values are now regular variables instead of callback parameters."
    },
    {
      title: "Build a Polymorphic Component",
      difficulty: "hard",
      description: "Create a polymorphic Box component that accepts an 'as' prop to change the rendered HTML element. It should properly forward all props to the rendered element and support ref forwarding.",
      solution: `// 'as' prop lets you choose what HTML element to render
const Box = React.forwardRef(function Box(
  { as: Component = "div", children, className, style, ...rest },
  ref
) {
  return (
    <Component
      ref={ref}
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </Component>
  );
});

// Usage examples:
function App() {
  const linkRef = useRef(null);

  return (
    <div>
      {/* Renders as a <section> */}
      <Box as="section" className="hero">
        <h1>Welcome</h1>
      </Box>

      {/* Renders as a <button> */}
      <Box as="button" onClick={() => alert("clicked")} disabled={false}>
        Click Me
      </Box>

      {/* Renders as an <a> tag with ref */}
      <Box as="a" href="https://react.dev" ref={linkRef} target="_blank">
        React Docs
      </Box>

      {/* Renders as a custom component */}
      <Box as={motion.div} animate={{ opacity: 1 }} initial={{ opacity: 0 }}>
        Animated content
      </Box>

      {/* Renders as React Router Link */}
      <Box as={Link} to="/about">
        Go to About
      </Box>
    </div>
  );
}`,
      explanation: "The 'as' prop picks which element to render. Renaming it to Component (capitalized) lets JSX treat it as a component. The rest spread (...rest) forwards all remaining props, so element-specific props (href for links, onClick for buttons) just work. Used widely in design systems like Chakra UI and Styled Components. In TypeScript, you would add generics to ensure type safety between the 'as' prop and allowed props."
    }
  ],
  quiz: [
    {
      question: "What happens if you render <input value=\"hello\" /> without an onChange handler?",
      options: [
        "The input displays 'hello' and is read-only \u2014 React prevents user edits",
        "The input works normally because value is just an initial value",
        "React throws an error and refuses to render",
        "The input displays nothing because value without onChange is invalid"
      ],
      correct: 0,
      explanation: "With a value prop but no onChange, React makes a controlled input with no way to update. React keeps resetting the DOM value to 'hello' on every render, so the user cannot type. React also logs a console warning about missing onChange."
    },
    {
      question: "In the compound components pattern, why is Context preferred over React.cloneElement for state sharing?",
      options: [
        "cloneElement is deprecated in React 18",
        "Context works regardless of nesting depth, while cloneElement only works with direct children",
        "Context is faster than cloneElement",
        "cloneElement doesn't support passing functions as props"
      ],
      correct: 1,
      explanation: "cloneElement only modifies direct children. If a child is wrapped in a div or fragment, cloneElement will not reach it. Context works at any depth because children use useContext no matter where they are in the tree. cloneElement is NOT deprecated, but Context is more flexible."
    },
    {
      question: "Why should you never define a HOC inside a component's render method?",
      options: [
        "It causes a memory leak in React",
        "HOCs are only allowed at the module level",
        "It creates a new component type on every render, destroying and remounting the subtree",
        "It breaks React's event system"
      ],
      correct: 2,
      explanation: "Calling withFeature(MyComponent) inside render creates a new component type each time. React compares types by reference, so a new type means the old tree is unmounted and a new one is mounted. This destroys all state, refs, and DOM nodes. Always apply HOCs outside the render path."
    },
    {
      question: "What is the main reason the React documentation recommends composition over inheritance?",
      options: [
        "Inheritance is not supported in JavaScript",
        "Composition is always faster than inheritance",
        "React components compose naturally as functions, and no use case has required inheritance hierarchies",
        "Inheritance breaks React's virtual DOM diffing algorithm"
      ],
      correct: 2,
      explanation: "The React team says they have used React in thousands of components and never needed inheritance hierarchies. Components are functions that take props and return elements. They compose naturally. JavaScript does support inheritance, and it would not break the virtual DOM, but composition avoids unnecessary coupling."
    },
    {
      question: "Which of the following is a problem with the render props pattern that hooks solve?",
      options: [
        "Render props can't access component state",
        "Render props cause components to re-render more frequently",
        "Nesting multiple render props creates deeply indented 'callback hell'",
        "Render props don't work with React.memo"
      ],
      correct: 2,
      explanation: "Combining multiple render prop components creates deep nesting: <Mouse>{mouse => <Keyboard>{keyboard => ...}</Keyboard>}</Mouse>. Each one adds indentation. With hooks, you just call useMousePosition(), useKeyboard(), useWindowSize() as flat, sequential lines with no nesting."
    }
  ]
};
