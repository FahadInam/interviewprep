// Additional Interview Q&A — Part 2: JavaScript Deep Dive, React/Next.js, CSS, Tooling, Testing, Output-Based

export const interviewQANew = {
  conceptualJS: [
    {
      id: 31,
      question: "What is the difference between var, let, and const?",
      answer: `var:
• Function-scoped (not block-scoped)
• Hoisted to the top of the function with value undefined
• Can be re-declared and re-assigned

let:
• Block-scoped (only exists inside { })
• Hoisted but NOT initialized — accessing before declaration throws ReferenceError (Temporal Dead Zone)
• Can be re-assigned, but NOT re-declared in the same scope

const:
• Block-scoped (same as let)
• Must be initialized at declaration
• Cannot be re-assigned
• BUT: Objects and arrays declared with const CAN be mutated

Example:
if (true) {
  var a = 1;    // Accessible outside the block
  let b = 2;    // Only inside this block
  const c = 3;  // Only inside this block
}
console.log(a); // 1
console.log(b); // ReferenceError
console.log(c); // ReferenceError

const obj = { name: 'Ali' };
obj.name = 'Sara';  // ✅ Works — mutating the object
obj = {};            // ❌ TypeError — can't reassign

Rule: Use const by default. Use let only when you need to reassign. Never use var.`,
      tags: ["JavaScript", "Fundamentals"],
    },
    {
      id: 32,
      question: "What is the Temporal Dead Zone (TDZ)?",
      answer: `The TDZ is the period between entering a scope and the variable's declaration being executed. During this time, accessing the variable throws a ReferenceError.

Example:
console.log(x); // ❌ ReferenceError: Cannot access 'x' before initialization
let x = 5;

// Compare with var:
console.log(y); // undefined (hoisted with value undefined)
var y = 5;

Why does TDZ exist?
It catches bugs. With var, you could accidentally use a variable before it was assigned — and it would silently be undefined. TDZ forces you to declare before you use.

TDZ applies to:
• let declarations
• const declarations
• Class declarations
• Function default parameters that reference later params

Tricky example:
let a = a; // ❌ ReferenceError — 'a' is in TDZ during its own initialization

function foo(x = y, y = 1) {} // ❌ ReferenceError — y is in TDZ when x tries to use it
function bar(x = 1, y = x) {} // ✅ Works — x is already declared

typeof in TDZ:
typeof undeclaredVar; // "undefined" (safe, no error)
typeof tdzVar;        // ❌ ReferenceError if tdzVar is in TDZ
let tdzVar = 1;`,
      tags: ["JavaScript", "Fundamentals"],
    },
    {
      id: 33,
      question: "Explain the 'this' keyword in different contexts",
      answer: `'this' refers to the object that is executing the current function. Its value depends on HOW the function is called, not where it's defined.

1. Global context:
console.log(this); // window (browser) or global (Node.js)

2. Object method:
const obj = {
  name: 'Ali',
  greet() { console.log(this.name); }
};
obj.greet(); // 'Ali' — this = obj

3. Regular function:
function show() { console.log(this); }
show(); // window (non-strict) or undefined (strict mode)

4. Arrow function:
const obj = {
  name: 'Ali',
  greet: () => { console.log(this.name); }
};
obj.greet(); // undefined — arrow functions inherit 'this' from the enclosing scope (not obj)

5. Constructor (new keyword):
function Person(name) { this.name = name; }
const p = new Person('Ali'); // this = the new object

6. Event handler:
button.addEventListener('click', function() {
  console.log(this); // the button element
});
button.addEventListener('click', () => {
  console.log(this); // window — arrow function doesn't get its own 'this'
});

7. call / apply / bind:
function greet() { console.log(this.name); }
greet.call({ name: 'Ali' });   // 'Ali' — explicitly set this
greet.apply({ name: 'Sara' }); // 'Sara'
const bound = greet.bind({ name: 'Ahmed' });
bound(); // 'Ahmed' — permanently bound

Key rule: Arrow functions DON'T have their own 'this'. They use the 'this' from where they were defined. This is why arrow functions are great for callbacks inside methods.`,
      tags: ["JavaScript", "Fundamentals"],
    },
    {
      id: 34,
      question: "What are Promises vs Observables?",
      answer: `Both handle async operations, but they work differently:

Promise:
• Handles a SINGLE async value
• Eager — starts executing immediately when created
• Not cancellable once started
• Built into JavaScript

const promise = fetch('/api/data'); // Starts immediately
promise.then(data => console.log(data));

Observable (from RxJS):
• Handles a STREAM of values over time
• Lazy — doesn't execute until you subscribe
• Cancellable — unsubscribe to stop
• NOT built into JavaScript (requires RxJS library)

const obs = new Observable(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  setTimeout(() => subscriber.next(3), 1000);
});
const sub = obs.subscribe(val => console.log(val)); // 1, 2, then 3 after 1s
sub.unsubscribe(); // Cancel — no more values

Key differences:
• Values: Promise = single value, Observable = multiple values over time
• Execution: Promise = eager, Observable = lazy
• Cancellation: Promise = no, Observable = yes (unsubscribe)
• Operators: Observable has map, filter, debounceTime, switchMap, etc.

When to use what:
• API call that returns once → Promise (fetch, axios)
• WebSocket messages, user input streams, real-time data → Observable
• Most React apps → Promises are enough. Observables are common in Angular.`,
      tags: ["JavaScript", "Async"],
    },
    {
      id: 35,
      question: "What is a Proxy in JavaScript and what are its real use cases?",
      answer: `A Proxy wraps an object and lets you intercept and customize operations on it — like getting/setting properties, function calls, and more.

Basic syntax:
const handler = {
  get(target, prop) {
    console.log('Reading ' + prop);
    return target[prop];
  },
  set(target, prop, value) {
    console.log('Setting ' + prop + ' to ' + value);
    target[prop] = value;
    return true;
  }
};

const user = new Proxy({}, handler);
user.name = 'Ali';     // logs: "Setting name to Ali"
console.log(user.name); // logs: "Reading name", then "Ali"

Real use cases:

1. Validation:
const validator = {
  set(target, prop, value) {
    if (prop === 'age' && (typeof value !== 'number' || value < 0)) {
      throw new Error('Age must be a positive number');
    }
    target[prop] = value;
    return true;
  }
};
const person = new Proxy({}, validator);
person.age = 25;   // ✅
person.age = -5;   // ❌ Error

2. Reactive systems — Vue 3 uses Proxy for its reactivity. When you change a reactive property, Vue's Proxy handler detects it and re-renders.

3. Default values:
const defaults = new Proxy({}, {
  get(target, prop) {
    return prop in target ? target[prop] : 'Not found';
  }
});
defaults.name; // "Not found"

4. Logging/debugging — Track every property access for debugging.

5. API wrappers — Create objects that auto-build API URLs:
const api = new Proxy({}, {
  get(target, prop) {
    return () => fetch('/api/' + prop);
  }
});
api.users(); // fetches /api/users`,
      tags: ["JavaScript", "Advanced"],
    },
    {
      id: 36,
      question: "What are Generators and Iterators in JavaScript?",
      answer: `Iterator: An object that knows how to access items one at a time, with a next() method that returns { value, done }.

const arr = [1, 2, 3];
const iterator = arr[Symbol.iterator]();
iterator.next(); // { value: 1, done: false }
iterator.next(); // { value: 2, done: false }
iterator.next(); // { value: 3, done: false }
iterator.next(); // { value: undefined, done: true }

Generator: A special function that can pause and resume. Uses function* and yield.

function* countUp() {
  yield 1;
  yield 2;
  yield 3;
}

const gen = countUp();
gen.next(); // { value: 1, done: false }
gen.next(); // { value: 2, done: false }
gen.next(); // { value: 3, done: false }
gen.next(); // { value: undefined, done: true }

Why they're useful:

1. Lazy evaluation — Generate values on demand (memory efficient):
function* infiniteNumbers() {
  let n = 0;
  while (true) yield n++;
}
// Only calculates the next number when you ask for it

2. Custom iteration:
function* range(start, end) {
  for (let i = start; i <= end; i++) yield i;
}
for (const num of range(1, 5)) console.log(num); // 1, 2, 3, 4, 5

3. Async flow control — Redux-Saga uses generators to handle side effects:
function* fetchUser() {
  const user = yield call(api.getUser);
  yield put({ type: 'USER_LOADED', user });
}

In practice: You rarely write generators directly in React apps, but understanding them helps with libraries like Redux-Saga and interview questions.`,
      tags: ["JavaScript", "Advanced"],
    },
    {
      id: 37,
      question: "What are WeakMap and WeakSet? When would you use them?",
      answer: `WeakMap and WeakSet are collections where the keys/values are "weakly held" — they don't prevent garbage collection.

WeakMap:
• Keys must be objects (not strings or numbers)
• If the key object has no other references, it gets garbage collected (along with its entry)
• Not iterable (no forEach, no size property)

const cache = new WeakMap();
let user = { name: 'Ali' };
cache.set(user, 'cached data');
cache.get(user); // 'cached data'
user = null; // The entry is automatically garbage collected

WeakSet:
• Same idea but for sets — stores objects with weak references
• Only has add, has, delete methods

Practical use cases:

1. Caching without memory leaks:
const cache = new WeakMap();
function expensiveCompute(obj) {
  if (cache.has(obj)) return cache.get(obj);
  const result = /* expensive calculation */;
  cache.set(obj, result);
  return result;
}
// When obj is garbage collected, the cache entry disappears too

2. Private data:
const privateData = new WeakMap();
class User {
  constructor(name) {
    privateData.set(this, { name });
  }
  getName() {
    return privateData.get(this).name;
  }
}
// No way to access privateData from outside

3. Tracking DOM nodes:
const visited = new WeakSet();
function processNode(node) {
  if (visited.has(node)) return; // Already processed
  visited.add(node);
  // ... process node
}
// When DOM node is removed, it's automatically cleaned up from the Set

Map vs WeakMap:
• Map: Any key type, iterable, prevents garbage collection of keys
• WeakMap: Only object keys, not iterable, allows garbage collection`,
      tags: ["JavaScript", "Advanced"],
    },
    {
      id: 38,
      question: "What is the difference between Object.freeze(), Object.seal(), and Object.preventExtensions()?",
      answer: `All three restrict object modifications, but at different levels:

Object.preventExtensions(obj):
• Cannot ADD new properties
• CAN modify existing properties
• CAN delete existing properties

const obj = { a: 1 };
Object.preventExtensions(obj);
obj.a = 2;     // ✅ Works
obj.b = 3;     // ❌ Silently fails (or throws in strict mode)
delete obj.a;  // ✅ Works

Object.seal(obj):
• Cannot ADD new properties
• Cannot DELETE existing properties
• CAN modify existing property values
• Property descriptors are locked (can't change configurable/enumerable)

const obj = { a: 1 };
Object.seal(obj);
obj.a = 2;     // ✅ Works
obj.b = 3;     // ❌ Fails
delete obj.a;  // ❌ Fails

Object.freeze(obj):
• Cannot ADD new properties
• Cannot DELETE existing properties
• Cannot MODIFY existing property values
• Completely immutable (shallow)

const obj = { a: 1 };
Object.freeze(obj);
obj.a = 2;     // ❌ Fails
obj.b = 3;     // ❌ Fails
delete obj.a;  // ❌ Fails

⚠️ Important: All three are SHALLOW only!
const obj = { nested: { x: 1 } };
Object.freeze(obj);
obj.nested.x = 999; // ✅ This WORKS — nested object is not frozen

For deep freeze, you need a recursive function:
function deepFreeze(obj) {
  Object.freeze(obj);
  Object.values(obj).forEach(val => {
    if (typeof val === 'object' && val !== null) deepFreeze(val);
  });
}`,
      tags: ["JavaScript", "Objects"],
    },
    {
      id: 39,
      question: "What is Symbol in JavaScript and what are its real use cases?",
      answer: `Symbol is a primitive data type that creates unique, immutable identifiers.

const s1 = Symbol('id');
const s2 = Symbol('id');
s1 === s2; // false — every Symbol is unique, even with the same description

Use cases:

1. Unique object keys (no name collisions):
const ID = Symbol('id');
const user = { [ID]: 123, name: 'Ali' };
user[ID]; // 123
// Won't clash with any other property, even if someone adds a string 'id'

2. "Private" properties:
const _balance = Symbol('balance');
class Account {
  constructor(amount) { this[_balance] = amount; }
  getBalance() { return this[_balance]; }
}
// _balance won't show up in Object.keys() or for...in loops

3. Well-known Symbols (built-in behavior):

Symbol.iterator — Make any object iterable:
const range = {
  from: 1, to: 3,
  [Symbol.iterator]() {
    let current = this.from;
    return {
      next: () => current <= this.to
        ? { value: current++, done: false }
        : { done: true }
    };
  }
};
for (const num of range) console.log(num); // 1, 2, 3

Symbol.toPrimitive — Customize type conversion:
const money = {
  amount: 100,
  [Symbol.toPrimitive](hint) {
    if (hint === 'number') return this.amount;
    if (hint === 'string') return '$' + this.amount;
    return this.amount;
  }
};
+money;         // 100
money + '';     // "$100" (template literal hint)

4. Global Symbol registry:
const s = Symbol.for('app.id'); // Creates or reuses a global symbol
Symbol.for('app.id') === s;     // true — same symbol across the app`,
      tags: ["JavaScript", "Advanced"],
    },
    {
      id: 40,
      question: "What are tagged template literals?",
      answer: `Tagged templates let you process a template literal with a function. The function receives the string parts and expression values separately.

Syntax:
function tag(strings, ...values) {
  console.log(strings); // Array of string parts
  console.log(values);  // Array of interpolated values
}

tag\`Hello \${name}, you are \${age}\`;
// strings: ["Hello ", ", you are ", ""]
// values: ["Ali", 25]

Real-world use cases:

1. styled-components (CSS-in-JS):
const Button = styled.button\`
  background: \${props => props.primary ? 'blue' : 'gray'};
  color: white;
  padding: 10px 20px;
\`;
// The tagged template processes CSS and injects dynamic values

2. GraphQL queries:
const query = gql\`
  query GetUser($id: ID!) {
    user(id: $id) {
      name
      email
    }
  }
\`;
// gql parses the template and creates a query document

3. Internationalization:
function i18n(strings, ...values) {
  // Look up translated string template, insert values
  return translate(strings.join('{}'), values);
}
i18n\`Hello \${name}, you have \${count} messages\`;

4. SQL injection prevention:
function sql(strings, ...values) {
  // Escape all values to prevent SQL injection
  return strings.reduce((result, str, i) =>
    result + str + (values[i] !== undefined ? escape(values[i]) : ''), ''
  );
}
sql\`SELECT * FROM users WHERE name = \${userInput}\`;

5. HTML sanitization:
function safe(strings, ...values) {
  return strings.reduce((result, str, i) =>
    result + str + (values[i] !== undefined ? escapeHTML(values[i]) : ''), ''
  );
}`,
      tags: ["JavaScript", "Advanced"],
    },
    {
      id: 41,
      question: "What is structuredClone() and how is it different from JSON.parse(JSON.stringify())?",
      answer: `Both create deep copies of objects, but structuredClone() (added in 2022) handles many cases that JSON.parse(JSON.stringify()) cannot.

const original = { name: 'Ali', date: new Date(), items: [1, 2, 3] };

// JSON method:
const copy1 = JSON.parse(JSON.stringify(original));
// copy1.date is now a STRING, not a Date object!

// structuredClone:
const copy2 = structuredClone(original);
// copy2.date is still a Date object ✅

What JSON method BREAKS:
• Date → becomes a string
• undefined → removed entirely
• NaN, Infinity → become null
• RegExp → becomes empty object {}
• Map, Set → become empty object {}
• Circular references → throws an error
• Functions → removed

What structuredClone handles:
✅ Date, RegExp, Map, Set, ArrayBuffer, Blob
✅ Circular references
✅ Nested objects and arrays
✅ undefined and NaN preserved

What structuredClone CANNOT clone:
❌ Functions
❌ DOM nodes
❌ Class instances (loses prototype — becomes plain object)
❌ Symbols as property keys

Example with circular reference:
const obj = { name: 'Ali' };
obj.self = obj; // Circular!

JSON.parse(JSON.stringify(obj)); // ❌ TypeError: circular
structuredClone(obj);            // ✅ Works perfectly

When to use what:
• Simple flat objects → JSON method is fine
• Dates, Maps, Sets, circular refs → structuredClone
• Need to clone functions → Manual approach or library (lodash cloneDeep)
• Browser support: All modern browsers + Node 17+`,
      tags: ["JavaScript", "Fundamentals"],
    },
  ],
  conceptualReact: [
    {
      id: 42,
      question: "What is React Fiber and why was it introduced?",
      answer: `React Fiber is a complete rewrite of React's core algorithm (the reconciler), introduced in React 16.

The problem with the old algorithm:
The old reconciler (called "Stack Reconciler") processed updates synchronously — once it started rendering, it couldn't stop until the entire tree was processed. For large component trees, this meant the UI could freeze for hundreds of milliseconds.

What Fiber changed:
Fiber breaks rendering work into small units called "fibers" (one per component). It can:
• Pause work and come back later
• Assign priorities to different types of updates
• Reuse previously completed work
• Abort work if it's no longer needed

Think of it like:
Old: Reading a book cover-to-cover without stopping (even if someone calls you)
Fiber: Reading one page at a time, checking if something more urgent came up between pages

What this enables:
1. Concurrent rendering — React can work on multiple updates simultaneously
2. useTransition — Mark updates as non-urgent so they don't block typing/clicks
3. Suspense — Pause rendering while waiting for data, show fallback
4. Automatic batching — Group multiple state updates into one render

In practice:
You don't interact with Fiber directly. It's the engine under the hood that makes concurrent features possible. When an interviewer asks about Fiber, they want to know WHY React needed it and WHAT user-facing features it enables.`,
      tags: ["React", "Architecture"],
    },
    {
      id: 43,
      question: "What is the difference between useReducer and useState?",
      answer: `Both manage state in function components, but for different complexity levels.

useState — Simple state:
const [count, setCount] = useState(0);
setCount(count + 1);
setCount(prev => prev + 1);

useReducer — Complex state with actions:
function reducer(state, action) {
  switch (action.type) {
    case 'increment': return { count: state.count + 1 };
    case 'decrement': return { count: state.count - 1 };
    case 'reset':     return { count: 0 };
    default: return state;
  }
}
const [state, dispatch] = useReducer(reducer, { count: 0 });
dispatch({ type: 'increment' });

When to use useReducer:
• Multiple related state values (form with many fields)
• Next state depends on previous state in complex ways
• State transitions have clear "actions" (add, remove, toggle, reset)
• You want to centralize state logic in one place

When to stick with useState:
• Simple values (boolean, number, string)
• Independent state variables
• One or two state updates

Practical example — form with useReducer:
function formReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_ERROR':
      return { ...state, errors: { ...state.errors, [action.field]: action.error }};
    case 'RESET':
      return initialState;
    default: return state;
  }
}

Bonus: dispatch is stable across renders (doesn't change reference), which makes it safe to pass as a prop or put in dependency arrays without causing re-renders.`,
      tags: ["React", "Hooks"],
    },
    {
      id: 44,
      question: "What are React Portals and when would you use them?",
      answer: `Portals let you render a component's children into a different DOM node — outside the parent component's DOM hierarchy.

import { createPortal } from 'react-dom';

function Modal({ children, isOpen }) {
  if (!isOpen) return null;
  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">{children}</div>
    </div>,
    document.getElementById('modal-root') // Renders HERE in the DOM
  );
}

// In index.html:
<body>
  <div id="root"></div>        <!-- App renders here -->
  <div id="modal-root"></div>  <!-- Modals render here -->
</body>

Why you need Portals:

1. CSS overflow issues:
// Without portal: Modal is inside a parent with overflow: hidden
// The modal gets clipped! Portal moves it outside the parent.

2. z-index stacking:
// Portals escape the parent's stacking context
// Modal always appears on top, regardless of parent z-index

3. Event bubbling still works:
// Even though the Portal renders in a different DOM node,
// React events still bubble up through the React component tree
// (not the DOM tree). So onClick on a parent still catches Portal clicks.

Common use cases:
• Modals / Dialogs
• Tooltips and Popovers
• Dropdown menus that need to overflow
• Toasts / Notifications
• Full-screen overlays

Libraries that use portals internally:
• Radix UI, Headless UI — all their overlays use portals
• React Select — dropdown menu uses portal to avoid clipping`,
      tags: ["React", "DOM"],
    },
    {
      id: 45,
      question: "What is forwardRef and useImperativeHandle?",
      answer: `forwardRef lets a parent component pass a ref to a child component's DOM element.

Problem without forwardRef:
function CustomInput({ ref }) { // ❌ ref is NOT a regular prop
  return <input ref={ref} />;
}
// This won't work — React strips ref from props

Solution with forwardRef:
const CustomInput = forwardRef(function CustomInput(props, ref) {
  return <input ref={ref} className="custom" {...props} />;
});

// Parent can now access the input DOM element:
function Parent() {
  const inputRef = useRef();
  return (
    <>
      <CustomInput ref={inputRef} />
      <button onClick={() => inputRef.current.focus()}>Focus</button>
    </>
  );
}

useImperativeHandle — Customize what the parent sees:
Instead of exposing the full DOM node, expose only specific methods:

const FancyInput = forwardRef(function FancyInput(props, ref) {
  const inputRef = useRef();

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    clear: () => { inputRef.current.value = ''; },
    // Parent can ONLY call focus() and clear()
    // Cannot access other DOM properties
  }));

  return <input ref={inputRef} {...props} />;
});

When to use:
• Reusable input/form components that parent needs to control (focus, scroll)
• Complex components where you want to expose a limited API
• Video/audio player components (play, pause, seek)

When NOT to use:
• Don't use refs for things that can be done with props/state
• If you're reaching for refs constantly, you might be fighting React's data flow`,
      tags: ["React", "Hooks", "Refs"],
    },
    {
      id: 46,
      question: "What is the difference between useTransition and useDeferredValue?",
      answer: `Both are concurrent features that let you mark updates as non-urgent so they don't block the UI.

useTransition — Wraps a STATE UPDATE as low priority:
function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  function handleChange(e) {
    setQuery(e.target.value);          // ⚡ High priority — update input immediately
    startTransition(() => {
      setResults(filterItems(e.target.value)); // 🐢 Low priority — can be interrupted
    });
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending ? <Spinner /> : <ResultsList results={results} />}
    </>
  );
}

useDeferredValue — Defers a VALUE to a lower priority:
function Search({ query }) {
  const deferredQuery = useDeferredValue(query);
  // query updates immediately (for the input)
  // deferredQuery lags behind (for the heavy list)

  return <HeavyList filter={deferredQuery} />;
}

When to use which:
• useTransition: When YOU control the state update. Wrap the setter in startTransition.
• useDeferredValue: When you receive a value as a PROP and can't control when it updates. You defer the value you received.

Both solve the same problem: Typing in a search box feels laggy because filtering 10,000 items blocks the input update. These hooks let React update the input instantly and filter the list in the background.

Key insight: Neither is debouncing. They don't delay the work — they let React interrupt the work if something more urgent comes up (like another keystroke).`,
      tags: ["React", "Hooks", "Performance"],
    },
    {
      id: 47,
      question: "What are React Server Actions? How do they differ from API routes?",
      answer: `Server Actions are async functions that run on the server, called directly from client components. No need to create a separate API endpoint.

// actions.js
'use server';

export async function addTodo(formData) {
  const title = formData.get('title');
  await db.todos.create({ title });
  revalidatePath('/todos');
}

// TodoForm.jsx (client component)
'use client';
import { addTodo } from './actions';

function TodoForm() {
  return (
    <form action={addTodo}>
      <input name="title" />
      <button type="submit">Add</button>
    </form>
  );
}

How they differ from API routes:

API Routes:
• You create a separate file (app/api/todos/route.js)
• Client calls fetch('/api/todos', { method: 'POST', body: ... })
• You handle serialization, error codes, CORS manually
• More boilerplate, more flexible

Server Actions:
• Just a function with 'use server'
• Called like a regular function (or via form action)
• React handles serialization/deserialization automatically
• Built-in form handling with progressive enhancement
• Forms work even with JavaScript disabled

When to use Server Actions:
• Form submissions (create, update, delete)
• Mutations that should revalidate cached data
• Simple CRUD operations

When to use API Routes:
• Third-party webhooks (Stripe, GitHub)
• Public APIs consumed by external clients
• Complex request/response handling
• When you need specific HTTP methods or headers`,
      tags: ["Next.js", "React", "Server"],
    },
    {
      id: 48,
      question: "What is Streaming SSR and how does it improve performance?",
      answer: `Traditional SSR sends the ENTIRE HTML page at once. The server must finish rendering everything before sending anything. If one component is slow (database query, API call), the whole page waits.

Streaming SSR sends HTML in chunks as they're ready:

1. Server starts sending the shell (layout, navigation) immediately
2. Slow parts are streamed later with inline <script> tags that swap placeholder content
3. User sees content progressively — no blank white screen

How it works with React:
<Suspense fallback={<Skeleton />}>
  <SlowComponent />    {/* Streamed later when data is ready */}
</Suspense>

The server sends:
1. First chunk: The HTML shell + <Skeleton /> placeholder
2. Second chunk (when SlowComponent is ready): The real HTML + a script that replaces the skeleton

Benefits:
• Time to First Byte (TTFB) is much faster — don't wait for all data
• Users see useful content sooner (progressive rendering)
• Slow components don't block fast ones
• Works with Suspense boundaries — each boundary streams independently

Example in Next.js App Router:
// This page streams automatically — the layout renders first,
// then each Suspense boundary resolves independently
export default async function Dashboard() {
  return (
    <div>
      <Header />  {/* Sent immediately */}
      <Suspense fallback={<ChartSkeleton />}>
        <SlowChart />  {/* Streamed when DB query finishes */}
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <SlowTable />  {/* Streamed independently */}
      </Suspense>
    </div>
  );
}

In Next.js App Router, streaming is automatic when you use Suspense.`,
      tags: ["Next.js", "React", "Performance"],
    },
    {
      id: 49,
      question: "What is the 'use' hook in React 19?",
      answer: `The 'use' hook lets you read the value of a resource (like a Promise or Context) during render.

Reading a Promise:
async function fetchUser(id) {
  const res = await fetch('/api/users/' + id);
  return res.json();
}

function UserProfile({ id }) {
  const user = use(fetchUser(id)); // Suspends until Promise resolves
  return <h1>{user.name}</h1>;
}

// Wrapped in Suspense:
<Suspense fallback={<Spinner />}>
  <UserProfile id={1} />
</Suspense>

Reading Context (replaces useContext):
function Theme() {
  const theme = use(ThemeContext); // Same as useContext(ThemeContext)
  return <div style={{ color: theme.color }}>Hello</div>;
}

What makes 'use' special:
• Can be called inside conditionals and loops (unlike other hooks!)
• Works with Promises natively — no useEffect + useState pattern
• Integrates with Suspense automatically

// This is valid with 'use' (NOT valid with other hooks):
function Component({ shouldLoad }) {
  if (shouldLoad) {
    const data = use(fetchData()); // ✅ Can be conditional
  }
}

Before vs After:
// Before (React 18): useEffect + useState
function UserProfile({ id }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchUser(id).then(setUser).finally(() => setLoading(false));
  }, [id]);
  if (loading) return <Spinner />;
  return <h1>{user.name}</h1>;
}

// After (React 19): use + Suspense
function UserProfile({ id }) {
  const user = use(fetchUser(id));
  return <h1>{user.name}</h1>;
}

Much cleaner! The loading state is handled by the parent Suspense boundary.`,
      tags: ["React", "Hooks"],
    },
    {
      id: 50,
      question: "How does caching work in Next.js App Router?",
      answer: `Next.js has 4 layers of caching. Understanding them is crucial for debugging "why isn't my data updating?"

1. Request Memoization (per-request):
• If you call fetch() with the same URL multiple times during a single render, Next.js deduplicates them — only one actual request is made.
• Scope: Single server request. Gone after the request completes.

2. Data Cache (persistent):
• fetch() responses are cached on the server across requests.
• Persists across deployments by default!
• Control with: fetch(url, { cache: 'no-store' }) or { next: { revalidate: 60 } }

3. Full Route Cache (static rendering):
• Entire HTML + RSC payload is cached at build time for static routes.
• Like SSG — the whole page is pre-built.
• Dynamic routes (using cookies(), headers(), searchParams) opt out automatically.

4. Router Cache (client-side):
• Browser caches visited route RSC payloads during navigation.
• Makes back/forward navigation instant.
• Cleared on page refresh.

How to revalidate (bust the cache):
• Time-based: fetch(url, { next: { revalidate: 60 } }) — refresh every 60s
• On-demand: revalidatePath('/products') — bust cache for a specific page
• Tag-based: revalidateTag('products') — bust all fetches tagged 'products'

Common debugging pattern:
"My data is stale!" →
1. Check if fetch has { cache: 'no-store' } or revalidate set
2. Check if the route is statically or dynamically rendered
3. Try revalidatePath() after mutations
4. Router cache: router.refresh() forces client to re-fetch`,
      tags: ["Next.js", "Performance"],
    },
    {
      id: 51,
      question: "What is the difference between loading.js, error.js, and not-found.js in Next.js?",
      answer: `These are convention-based files in Next.js App Router that handle common UI states automatically.

loading.js — Shows while the page is loading:
// app/dashboard/loading.js
export default function Loading() {
  return <DashboardSkeleton />;
}
// Automatically wraps the page in <Suspense fallback={<Loading />}>
// Shows while the page's async data is being fetched

error.js — Catches rendering errors:
// app/dashboard/error.js
'use client'; // Must be a client component!

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
// Acts as an Error Boundary for this route segment
// reset() attempts to re-render the segment

not-found.js — Custom 404 page:
// app/not-found.js (root level = global 404)
export default function NotFound() {
  return <h1>Page not found</h1>;
}

// Can also be triggered manually:
import { notFound } from 'next/navigation';
async function ProductPage({ params }) {
  const product = await getProduct(params.id);
  if (!product) notFound(); // Shows the nearest not-found.js
}

How they nest:
app/
  layout.js
  error.js         ← Catches errors for all routes
  not-found.js     ← Global 404
  dashboard/
    loading.js     ← Only for /dashboard
    error.js       ← Only catches /dashboard errors
    page.js

Key details:
• error.js does NOT catch errors in the same-level layout.js — it catches errors in page.js and children
• loading.js creates a Suspense boundary automatically
• not-found.js is rendered as a child of the nearest layout`,
      tags: ["Next.js", "App Router"],
    },
    {
      id: 52,
      question: "What is Partial Prerendering (PPR) in Next.js?",
      answer: `PPR combines the best of static and dynamic rendering in a SINGLE page. Instead of the whole page being static OR dynamic, parts can be each.

How it works:
1. At build time, Next.js renders the static parts of the page (header, sidebar, layout)
2. Dynamic parts (user-specific content, real-time data) are marked with Suspense boundaries
3. When a user requests the page:
   - Static shell is served instantly from CDN (like SSG)
   - Dynamic holes are streamed in as they resolve (like SSR)

Example:
export default function ProductPage({ params }) {
  return (
    <div>
      <Header />           {/* Static — prerendered at build */}
      <ProductInfo id={params.id} />  {/* Static — prerendered */}

      <Suspense fallback={<PriceSkeleton />}>
        <LivePrice id={params.id} />   {/* Dynamic — streamed */}
      </Suspense>

      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews id={params.id} />     {/* Dynamic — streamed */}
      </Suspense>

      <Footer />           {/* Static — prerendered */}
    </div>
  );
}

Before PPR, you had to choose:
• SSG: Fast but stale data
• SSR: Fresh data but slower TTFB
• ISR: Compromise but still whole-page

With PPR:
• Static parts are instant (CDN-served)
• Dynamic parts stream in quickly
• Best of ALL worlds — fast TTFB + fresh data where needed

The Suspense boundary is the dividing line between static and dynamic. Everything outside Suspense is prerendered. Everything inside is streamed dynamically.`,
      tags: ["Next.js", "Performance"],
    },
    {
      id: 53,
      question: "What is the difference between redirect(), rewrite(), and next() in Next.js Middleware?",
      answer: `These are the three response options in Next.js middleware:

redirect() — Send user to a different URL (URL changes in browser):
import { NextResponse } from 'next/server';

export function middleware(request) {
  if (!isAuthenticated(request)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  // User sees /login in their address bar
}

rewrite() — Show different content WITHOUT changing the URL:
export function middleware(request) {
  const country = request.geo?.country || 'US';
  // URL stays /products but serves /products/us or /products/uk content
  return NextResponse.rewrite(new URL('/products/' + country.toLowerCase(), request.url));
}
// User sees /products in address bar, but gets country-specific page

next() — Continue to the route (optionally modify headers):
export function middleware(request) {
  const response = NextResponse.next();
  response.headers.set('x-user-id', getUserId(request));
  return response;
  // Request continues normally with added headers
}

Common patterns:

1. Auth guard:
if (!token) return NextResponse.redirect(new URL('/login', req.url));

2. A/B testing:
const variant = Math.random() > 0.5 ? 'a' : 'b';
return NextResponse.rewrite(new URL('/experiment/' + variant, req.url));

3. Locale detection:
const locale = detectLocale(req.headers);
if (!req.nextUrl.pathname.startsWith('/' + locale)) {
  return NextResponse.redirect(new URL('/' + locale + req.nextUrl.pathname, req.url));
}

4. Bot detection:
const isBot = req.headers.get('user-agent')?.includes('bot');
if (isBot) return NextResponse.rewrite(new URL('/prerendered' + req.nextUrl.pathname, req.url));

Remember: Middleware runs on the Edge Runtime — keep it fast and lightweight.`,
      tags: ["Next.js", "Middleware"],
    },
  ],
  conceptualCSS: [
    {
      id: 54,
      question: "What is the difference between Flexbox and CSS Grid? When do you use each?",
      answer: `Flexbox = 1-dimensional (row OR column)
Grid = 2-dimensional (rows AND columns)

Flexbox — Best for:
• Navigation bars
• Centering content
• Distributing space between items in a row
• Components where items flow in one direction

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

Grid — Best for:
• Page layouts (header, sidebar, main, footer)
• Card grids with consistent columns
• Any layout that needs alignment in both directions

.page {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
}

Quick decision:
• "Items in a line" → Flexbox
• "Items in a grid" → Grid
• Navbar, button groups, form rows → Flexbox
• Dashboard, card gallery, page layout → Grid

You can (and should) combine them:
.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
.card { display: flex; flex-direction: column; } /* Each card uses flex internally */

Responsive without media queries (Grid magic):
grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
// Cards auto-wrap and auto-size. No breakpoints needed.`,
      tags: ["CSS", "Layout"],
    },
    {
      id: 55,
      question: "What is the CSS Box Model? What is box-sizing: border-box?",
      answer: `Every HTML element is a rectangular box with 4 layers:

Content → Padding → Border → Margin

Default behavior (content-box):
An element with width: 200px, padding: 20px, border: 5px actually takes up:
200 + 20 + 20 + 5 + 5 = 250px total width
// The width only applies to the content area!

With box-sizing: border-box:
The same element with width: 200px is EXACTLY 200px total.
Padding and border are included INSIDE the width.
Content area shrinks to fit: 200 - 20 - 20 - 5 - 5 = 150px

This is why every CSS reset starts with:
*, *::before, *::after {
  box-sizing: border-box;
}

Why border-box is better:
• width: 100% actually means 100% (not 100% + padding + border)
• Easier to create layouts — what you set is what you get
• No surprise overflow from padding/border
• All modern frameworks (Tailwind, Bootstrap) use border-box

Margin doesn't count:
Neither box model includes margin in the element's size. Margin is the space BETWEEN elements.

Margin collapsing gotcha:
When two vertical margins meet, they collapse into the larger one:
<div style="margin-bottom: 20px">A</div>
<div style="margin-top: 30px">B</div>
// Gap between A and B is 30px, NOT 50px`,
      tags: ["CSS", "Fundamentals"],
    },
    {
      id: 56,
      question: "What is the difference between position: relative, absolute, fixed, and sticky?",
      answer: `static (default):
• Normal document flow. top/left/right/bottom have no effect.

relative:
• Stays in normal flow (still takes up space)
• Can be offset with top/left/right/bottom (relative to its normal position)
• Creates a positioning context for absolute children

.parent { position: relative; }
// Child with position: absolute will be positioned relative to THIS element

absolute:
• Removed from document flow (doesn't take up space)
• Positioned relative to the nearest positioned ancestor (not static)
• If no positioned ancestor, positioned relative to <html>

.tooltip {
  position: absolute;
  top: 100%;      /* Below the parent */
  left: 50%;      /* Centered */
  transform: translateX(-50%);
}

fixed:
• Removed from document flow
• Positioned relative to the VIEWPORT (browser window)
• Stays in place when scrolling

.header { position: fixed; top: 0; left: 0; right: 0; z-index: 100; }
// Header stays at top even when scrolling

sticky:
• Acts like relative UNTIL a scroll threshold, then acts like fixed
• Must specify at least one of top/bottom/left/right

.sidebar-heading {
  position: sticky;
  top: 0; /* Sticks to top when scrolled past */
}
// Great for: sticky headers, table headers, sidebar navigation

Common gotcha: sticky doesn't work if any parent has overflow: hidden or overflow: auto.`,
      tags: ["CSS", "Layout"],
    },
    {
      id: 57,
      question: "What is CSS specificity? How is it calculated?",
      answer: `Specificity determines which CSS rule wins when multiple rules target the same element.

The hierarchy (highest to lowest):
1. !important (overrides everything — avoid using it)
2. Inline styles (style="color: red")
3. ID selectors (#header)
4. Class selectors (.nav), attribute selectors ([type="text"]), pseudo-classes (:hover)
5. Element selectors (div, p, h1), pseudo-elements (::before)

Calculated as a tuple (a, b, c):
• a = number of ID selectors
• b = number of class/attribute/pseudo-class selectors
• c = number of element/pseudo-element selectors

Examples:
p                    → (0, 0, 1)
.nav                 → (0, 1, 0)
#header              → (1, 0, 0)
#header .nav li      → (1, 1, 1)
#header .nav li a:hover → (1, 2, 2)

(1, 0, 0) beats (0, 99, 99) — one ID beats any number of classes!

Common specificity issues:
// Can't override because of high specificity:
#sidebar .widget .title { color: blue; }
// This won't work:
.title { color: red; } // Too low specificity

Fixes:
1. Avoid IDs in CSS — use classes instead
2. Keep specificity flat — .card-title instead of .card .header .title
3. Use CSS Layers (@layer) for library vs. custom styles
4. Last resort: !important (but it makes code hard to maintain)

Tailwind's approach: All utilities are single-class selectors (same specificity), so the last class in the HTML wins. This keeps specificity wars minimal.`,
      tags: ["CSS", "Fundamentals"],
    },
    {
      id: 58,
      question: "What are CSS Container Queries? How are they different from Media Queries?",
      answer: `Media Queries respond to the VIEWPORT (browser window) size.
Container Queries respond to the PARENT CONTAINER's size.

Why this matters:
A card component might be:
• Full-width on mobile → shows vertically
• In a sidebar on desktop → should ALSO show vertically (sidebar is narrow)
• In the main content → shows horizontally

Media queries can't handle this — the viewport is the same for sidebar and main content. Container queries can because they check the card's parent width.

Syntax:
/* Define the container */
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

/* Style based on container width */
@container card (min-width: 400px) {
  .card {
    display: flex;
    flex-direction: row;  /* Horizontal when container is wide */
  }
}

@container card (max-width: 399px) {
  .card {
    flex-direction: column; /* Vertical when container is narrow */
  }
}

Real example — responsive card:
The same <Card /> component automatically adapts whether it's in a wide grid or a narrow sidebar. No JavaScript needed.

container-type options:
• inline-size — Queries based on width (most common)
• size — Queries based on both width and height
• normal — No containment (default)

Browser support: All modern browsers (Chrome, Firefox, Safari, Edge). Safe to use in production since 2023+.

When to use what:
• Page-level layout changes → Media queries
• Component-level responsive design → Container queries
• The future: Container queries for most component styles`,
      tags: ["CSS", "Responsive"],
    },
  ],
  conceptualTooling: [
    {
      id: 59,
      question: "What are Micro Frontends? When should you use them?",
      answer: `Micro frontends split a large frontend app into smaller, independently deployable pieces — each owned by a different team.

Example:
An e-commerce site split into:
• Team A owns: Product catalog (React)
• Team B owns: Shopping cart (Vue)
• Team C owns: User account (React)
Each team deploys independently. Changes to the cart don't require redeploying the catalog.

Implementation approaches:
1. Module Federation (Webpack 5) — Share components at runtime between separate builds
2. Single-SPA — Framework for orchestrating multiple frontend apps
3. iframes — Simple but limited (no shared state, poor UX)
4. Web Components — Framework-agnostic custom elements

When to use:
✅ Multiple teams (5+) working on one product
✅ Teams need to deploy independently
✅ Different parts have different update frequencies
✅ Legacy migration (replace one section at a time)

When NOT to use:
❌ Small team (1-3 developers) — overkill
❌ Simple app — added complexity isn't worth it
❌ Consistent UX is critical — harder to maintain across micro-frontends

Trade-offs:
• Pro: Independent deployments, team autonomy, tech diversity
• Con: Complex setup, shared state is hard, bundle duplication, inconsistent UX risk
• Con: Need shared design system to keep things looking consistent

Rule of thumb: If you don't have organizational pain (teams blocking each other, deploy conflicts), you don't need micro frontends.`,
      tags: ["Architecture", "Advanced"],
    },
    {
      id: 60,
      question: "What is a Monorepo? What tools support it?",
      answer: `A monorepo is a single repository containing multiple projects/packages that may or may not be related.

Example structure:
my-company/
  packages/
    ui/           ← Shared component library
    utils/        ← Shared utilities
  apps/
    web/          ← Next.js marketing site
    dashboard/    ← React admin dashboard
    mobile/       ← React Native app
  package.json    ← Root workspace config

Benefits:
• Code sharing — Import shared components directly, no npm publishing
• Atomic changes — Update a shared component and all apps in one commit
• Consistent tooling — Same ESLint, TypeScript config, CI pipeline
• Easier refactoring — Find all usages across projects instantly

Drawbacks:
• Build times can be slow (mitigated with caching)
• Repository size grows large
• CI/CD needs to be smart about what to build (affected packages only)

Popular tools:
• Nx — Full-featured monorepo toolkit, smart caching, affected commands
• Turborepo — Fast builds with remote caching, simpler than Nx
• pnpm workspaces — Package manager with built-in workspace support, strict dependency resolution
• Yarn workspaces — Similar to pnpm but less strict

Package manager matters:
• pnpm: Strict mode prevents "phantom dependencies" (accidentally using a package you didn't declare). Fastest install times.
• npm/yarn: Hoist dependencies (can cause phantom dependency issues)

Decision: Monorepo is great for companies with multiple related projects and shared code. Not needed for a single small project.`,
      tags: ["Architecture", "Tooling"],
    },
    {
      id: 61,
      question: "What are Web Workers? When would you use them?",
      answer: `Web Workers run JavaScript in a background thread, separate from the main thread. This prevents heavy computation from freezing the UI.

Without Web Worker:
// Heavy calculation on main thread — UI freezes!
function fibonacci(n) { /* recursive calculation */ }
const result = fibonacci(45); // UI is unresponsive for seconds

With Web Worker:
// main.js
const worker = new Worker('worker.js');
worker.postMessage(45);              // Send data to worker
worker.onmessage = (e) => {
  console.log(e.data);               // Receive result
};

// worker.js
self.onmessage = (e) => {
  const result = fibonacci(e.data);  // Runs in background
  self.postMessage(result);           // Send result back
};
// UI stays responsive the entire time!

Key limitations:
• No DOM access — Workers can't read or modify the page
• Communication via postMessage only (data is copied, not shared)
• Separate global scope (no window object, but has self)
• Can use fetch, setTimeout, indexedDB

Real use cases:
• Image/video processing (resizing, filters, compression)
• Large data parsing (CSV, JSON with 100K+ rows)
• Encryption/hashing
• Complex search/sort/filter on large datasets
• WebAssembly computation

In React:
• Use the comlink library to make Web Workers feel like async functions
• Or use useWorker hook from react-hooks-worker

const [result, { run }] = useWorker(heavyComputation);
run(inputData); // Runs in background, component re-renders with result

When NOT to use:
• Simple calculations that take < 16ms
• When you need DOM access
• For I/O operations (fetch is already async and non-blocking)`,
      tags: ["Browser", "Performance"],
    },
    {
      id: 62,
      question: "What are Service Workers and how are they different from Web Workers?",
      answer: `Both run JavaScript off the main thread, but they serve completely different purposes.

Web Workers:
• Purpose: Heavy computation in background
• Lifetime: Lives as long as the page is open
• Communication: postMessage with the page
• Use case: Data processing, image manipulation, crypto

Service Workers:
• Purpose: Network proxy between app and internet
• Lifetime: Persists even after the page is closed
• Communication: Intercepts fetch requests, push notifications
• Use case: Offline support, caching, background sync, push notifications

Service Worker as a network proxy:
// sw.js
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)      // Check cache first
      .then(cached => cached || fetch(event.request))  // Fallback to network
  );
});

What Service Workers enable:
1. Offline support — Serve cached pages when offline
2. Cache strategies — Cache-first, network-first, stale-while-revalidate
3. Push notifications — Receive notifications even when app is closed
4. Background sync — Queue failed requests, retry when back online
5. Precaching — Download critical assets ahead of time

Lifecycle:
Install → Activate → Running (intercepts fetches) → Idle → Terminated

Key differences summarized:
| Feature         | Web Worker       | Service Worker        |
|-----------------|------------------|-----------------------|
| Purpose         | Computation      | Network caching       |
| Lifetime        | Page session     | Persists              |
| DOM access      | No               | No                    |
| Network access  | Yes              | Yes (intercepts all!) |
| Scope           | Single page      | All pages in scope    |
| HTTPS required  | No               | Yes (except localhost)|`,
      tags: ["Browser", "PWA", "Performance"],
    },
    {
      id: 63,
      question: "What is a CDN and how does it improve performance?",
      answer: `CDN (Content Delivery Network) is a network of servers distributed worldwide that serves your static files from the location closest to the user.

Without CDN:
User in Tokyo → Request travels to server in New York → 200ms+ latency

With CDN:
User in Tokyo → Served from CDN edge server in Tokyo → 20ms latency

What goes on a CDN:
• Static assets: JS bundles, CSS, images, fonts, videos
• HTML pages (for static/ISR pages)
• API responses (with proper cache headers)

How it works:
1. First user in Tokyo requests style.css
2. CDN edge in Tokyo doesn't have it → fetches from origin server
3. CDN caches it at the Tokyo edge
4. Next user in Tokyo → served from Tokyo cache (instant!)
5. Cache-Control headers determine how long it's cached

Cache strategies:
// Immutable assets (hashed filenames like app.abc123.js):
Cache-Control: public, max-age=31536000, immutable
// Cached for 1 year. Filename changes when content changes.

// HTML pages:
Cache-Control: public, max-age=0, s-maxage=60, stale-while-revalidate=300
// CDN caches for 60s, serves stale for 5 min while revalidating

Cache invalidation:
The hardest problem in computer science! Solutions:
• Content hashing (app.[hash].js) — new content = new URL = no stale cache
• Purge API — Most CDNs let you manually invalidate paths
• Versioned URLs — /v2/api/data

Popular CDNs:
• Vercel Edge Network (auto with Next.js deployment)
• Cloudflare
• AWS CloudFront
• Fastly
• Akamai

For Next.js: Deploying to Vercel automatically puts everything on their edge network. No CDN configuration needed.`,
      tags: ["Performance", "Infrastructure"],
    },
    {
      id: 64,
      question: "What is the difference between npm, yarn, and pnpm?",
      answer: `All three are JavaScript package managers. They install dependencies, manage versions, and run scripts.

npm (Node Package Manager):
• Comes with Node.js — no extra install
• Uses node_modules with flat dependency tree
• package-lock.json for deterministic installs
• Slower than alternatives for large projects

yarn (by Facebook):
• Created to fix npm's early speed/security issues
• yarn.lock for deterministic installs
• Parallel downloads (faster than npm)
• Yarn Berry (v2+): Plug'n'Play — no node_modules folder, dependencies stored as .zip files

pnpm (Performant npm):
• Uses a content-addressable store — each package version is stored once on disk
• Hard links instead of copying — saves massive disk space
• Strict mode — prevents accessing packages you didn't declare
• Fastest install times of the three

Key difference — phantom dependencies:
// You install package A, which depends on package B
// With npm/yarn: B is hoisted to node_modules root
// Your code can accidentally import B directly (even though you didn't install it)
// This is a "phantom dependency" — it works until A removes B as a dependency

// pnpm prevents this — only YOUR declared dependencies are accessible

Workspace support (monorepos):
• npm: npm workspaces (basic, since npm 7)
• yarn: yarn workspaces (mature, widely used)
• pnpm: pnpm workspaces (fastest, strictest)

Which to choose:
• Solo/small project → npm (simplest, no extra install)
• Team project → pnpm (fast, strict, saves disk space)
• Existing project → Keep what it uses (don't migrate for no reason)
• Monorepo → pnpm or yarn workspaces

Speed comparison (typical large project):
pnpm > yarn > npm (pnpm is 2-3x faster than npm for cold installs)`,
      tags: ["Tooling", "Node.js"],
    },
  ],
  conceptualTesting: [
    {
      id: 65,
      question: "What is the Testing Pyramid? Unit vs Integration vs E2E?",
      answer: `The Testing Pyramid shows the ideal ratio of test types:

        /\\
       / E2E \\        ← Few (slow, expensive, high confidence)
      /--------\\
     / Integration \\   ← Some (medium speed, medium confidence)
    /--------------\\
   /    Unit Tests   \\ ← Many (fast, cheap, low confidence per test)
  /------------------\\

Unit Tests (bottom — most tests):
• Test a single function/component in isolation
• Mock dependencies
• Fast (milliseconds), cheap to write and maintain
• Example: Does formatDate() return the right string?

test('formatDate returns formatted string', () => {
  expect(formatDate(new Date('2025-01-15'))).toBe('Jan 15, 2025');
});

Integration Tests (middle):
• Test how multiple units work together
• Less mocking, more realistic
• Example: Does the form submit correctly and show a success message?

test('form submits and shows success', async () => {
  render(<ContactForm />);
  await userEvent.type(screen.getByLabelText('Email'), 'test@test.com');
  await userEvent.click(screen.getByText('Submit'));
  expect(screen.getByText('Message sent!')).toBeInTheDocument();
});

E2E Tests (top — fewest tests):
• Test the entire app from the user's perspective
• Real browser, real API (or mocked server)
• Slowest but highest confidence
• Example: Can a user sign up, log in, and place an order?

test('user can complete checkout', async ({ page }) => {
  await page.goto('/products');
  await page.click('[data-testid="add-to-cart"]');
  await page.click('[data-testid="checkout"]');
  await expect(page.locator('.order-confirmation')).toBeVisible();
});

Rule of thumb: 70% unit, 20% integration, 10% E2E. But many teams now prefer more integration tests because they give better confidence per test.`,
      tags: ["Testing", "Architecture"],
    },
    {
      id: 66,
      question: "What is the difference between Jest, Vitest, and React Testing Library?",
      answer: `They serve different purposes and often work together:

Jest — Test RUNNER:
• Runs your tests, reports results
• Provides assertions: expect(value).toBe(expected)
• Built-in mocking: jest.fn(), jest.mock()
• Snapshot testing
• Code coverage reports
• Slow for large projects (transforms every file)

Vitest — Faster Test RUNNER (alternative to Jest):
• Same API as Jest (easy migration)
• Uses Vite under the hood — much faster (native ESM, no transform overhead)
• Built-in TypeScript support
• Compatible with most Jest plugins
• Best choice for Vite-based projects

React Testing Library (RTL) — Testing UTILITIES:
• NOT a test runner — works WITH Jest or Vitest
• Provides tools to render and interact with React components
• Philosophy: Test components the way users use them
• Queries: getByText, getByRole, getByLabelText (not implementation details)

How they work together:
// Vitest (or Jest) = runner + assertions
// RTL = rendering + querying + user interactions

import { render, screen } from '@testing-library/react'; // RTL
import userEvent from '@testing-library/user-event';      // RTL
import { describe, test, expect } from 'vitest';          // Vitest

test('counter increments', async () => {
  render(<Counter />);                                     // RTL
  await userEvent.click(screen.getByText('Increment'));   // RTL
  expect(screen.getByText('Count: 1')).toBeInTheDocument(); // RTL + Vitest
});

Decision:
• New project → Vitest + React Testing Library
• Existing Jest project → Keep Jest + React Testing Library
• Don't use Enzyme (deprecated) — use React Testing Library instead`,
      tags: ["Testing", "Tooling"],
    },
    {
      id: 67,
      question: "What is the difference between Cypress and Playwright?",
      answer: `Both are E2E testing frameworks that test your app in a real browser.

Cypress:
• Runs inside the browser (same event loop as your app)
• Excellent DevTools and time-travel debugging
• Built-in dashboard for CI results
• Single browser tab only (can't test multi-tab)
• Chromium-based browsers + Firefox (no Safari/WebKit)
• JavaScript only

Playwright:
• Runs outside the browser (controls it via protocol)
• Cross-browser: Chromium, Firefox, AND WebKit (Safari)
• Multi-tab, multi-window, multi-origin support
• Faster execution (parallel by default)
• Multiple languages (JS, TS, Python, C#, Java)
• Built-in API testing
• Better mobile emulation

Key differences:
| Feature            | Cypress          | Playwright       |
|--------------------|------------------|------------------|
| Cross-browser      | Chrome + Firefox | Chrome+FF+Safari |
| Speed              | Slower           | Faster           |
| Multi-tab          | No               | Yes              |
| Auto-wait          | Yes              | Yes              |
| DX (DevTools)      | Excellent        | Good             |
| Network mocking    | Yes              | Yes              |
| Component testing  | Yes              | Experimental     |
| CI Dashboard       | Built-in (paid)  | Free HTML report |

When to choose Cypress:
• Team already knows it
• Value the visual test runner and debugging experience
• Don't need Safari testing

When to choose Playwright:
• Need cross-browser testing (especially Safari)
• Need multi-tab or multi-origin scenarios
• Want faster CI runs
• Starting a new project (Playwright is the modern choice)

Industry trend: Playwright is gaining market share rapidly due to speed, cross-browser support, and being free/open source.`,
      tags: ["Testing", "Tooling"],
    },
  ],
  outputBased: [
    {
      id: 68,
      question: "What will be the output? console.log(typeof null)",
      answer: `Output: "object"

This is a famous JavaScript bug that has existed since the very first version of JavaScript (1995) and was never fixed for backward compatibility.

Why it happens:
In the original implementation, values were represented as a type tag + value. Objects had type tag 0. null was represented as the NULL pointer (0x00), which had type tag 0 — so typeof null returns "object".

How to properly check for null:
value === null  // ✅ Direct comparison

// Common pattern to check for objects:
typeof value === 'object' && value !== null

Fun fact: There was a proposal to fix this (typeof null === 'null') but it was rejected because too much existing code relies on the current behavior.`,
      tags: ["JavaScript", "Gotcha"],
    },
    {
      id: 69,
      question: "What will be the output? console.log([] == ![])",
      answer: `Output: true

This is one of JavaScript's most mind-bending coercion results. Here's what happens step by step:

1. ![] evaluates first:
   [] is truthy (all objects are truthy), so ![] = false

2. Now we have: [] == false

3. Both sides are coerced to numbers:
   false → 0
   [] → "" (toString) → 0 (toNumber)

4. 0 == 0 → true!

So: [] == ![] → [] == false → 0 == 0 → true

More coercion madness:
[] == false    // true
[] == 0        // true
[] == ""       // true
[1] == 1       // true
[1,2] == "1,2" // true

This is why you should ALWAYS use === (strict equality). It doesn't do type coercion:
[] === ![]     // false ✅ (array is not a boolean)`,
      tags: ["JavaScript", "Gotcha"],
    },
    {
      id: 70,
      question: "What will be the output of this loop with var and setTimeout?",
      answer: `Code:
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}

Output: 3, 3, 3 (NOT 0, 1, 2!)

Why:
• var is function-scoped, not block-scoped. There's only ONE i variable.
• setTimeout callbacks run AFTER the loop finishes.
• By then, i = 3 (the loop exits when i < 3 is false, so i = 3).
• All three callbacks reference the same i, which is now 3.

Fix 1 — Use let:
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 0, 1, 2
// let creates a new binding for each iteration

Fix 2 — IIFE (old school):
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => console.log(j), 100);
  })(i);
}
// Each IIFE captures the current value of i in j

Fix 3 — setTimeout's third parameter:
for (var i = 0; i < 3; i++) {
  setTimeout((j) => console.log(j), 100, i);
}
// setTimeout passes i as an argument to the callback

This question tests your understanding of closures, var scoping, and the event loop.`,
      tags: ["JavaScript", "Closures", "Gotcha"],
    },
    {
      id: 71,
      question: "What's the output? console.log(1 + '2' + '2') and console.log(1 + +'2' + '2')",
      answer: `Expression 1: 1 + '2' + '2'
Step by step:
• 1 + '2' → '12' (number + string = string concatenation)
• '12' + '2' → '122'
Output: "122"

Expression 2: 1 + +'2' + '2'
Step by step:
• +'2' → 2 (unary + converts string to number)
• 1 + 2 → 3 (number + number = addition)
• 3 + '2' → '32' (number + string = concatenation)
Output: "32"

More examples:
'A' - 'B' + '2'
• 'A' - 'B' → NaN (can't subtract strings)
• NaN + '2' → 'NaN2' (NaN + string = concatenation)
Output: "NaN2"

The rules:
• + with a string on either side → concatenation (converts the other to string)
• + with two numbers → addition
• Unary + before a string → converts to number
• - always converts both sides to numbers (no string subtraction)

Quick trick to remember:
• + is overloaded (addition AND concatenation)
• -, *, / always do math (convert to numbers first)

This is why TypeScript exists — to catch these type issues at compile time instead of runtime.`,
      tags: ["JavaScript", "Type Coercion", "Gotcha"],
    },
    {
      id: 72,
      question: "What's the output? console.log(0.1 + 0.2 === 0.3)",
      answer: `Output: false

0.1 + 0.2 = 0.30000000000000004 (not exactly 0.3!)

Why:
JavaScript (and most languages) uses IEEE 754 floating-point arithmetic. Numbers like 0.1 and 0.2 can't be represented exactly in binary — they have infinite repeating decimals in binary, just like 1/3 = 0.333... in decimal.

So:
0.1 + 0.2 = 0.30000000000000004
0.3 = 0.29999999999999998...
These are NOT equal.

How to compare floating-point numbers:
// Method 1: Epsilon comparison
Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON // true

// Method 2: Fixed decimal comparison
(0.1 + 0.2).toFixed(1) === '0.3' // true

// Method 3: Multiply to integers first (for money!)
(0.1 * 100 + 0.2 * 100) === 0.3 * 100 // true (10 + 20 === 30)

For money/financial calculations:
NEVER use floating point. Use:
• Integer cents: $10.50 → 1050 cents
• Libraries: dinero.js, currency.js
• Intl.NumberFormat for display

This question tests whether you understand floating-point limitations — a common source of bugs in financial and scientific applications.`,
      tags: ["JavaScript", "Gotcha"],
    },
    {
      id: 73,
      question: "What's the output? Object keys with objects",
      answer: `Code:
const a = {};
const b = { key: 'b' };
const c = { key: 'c' };

a[b] = 123;
a[c] = 456;

console.log(a[b]);

Output: 456

Why:
When you use an object as a property key, JavaScript calls toString() on it. For regular objects:
b.toString() → "[object Object]"
c.toString() → "[object Object]"

So both b and c become the SAME key: "[object Object]"

What actually happens:
a["[object Object]"] = 123;  // First assignment
a["[object Object]"] = 456;  // Overwrites!
console.log(a["[object Object]"]); // 456

The fix — use Map:
const map = new Map();
map.set(b, 123);
map.set(c, 456);
map.get(b); // 123 ✅ (Map uses actual object references as keys)
map.get(c); // 456 ✅

Or use Symbol/string keys:
const a = {};
a[Symbol('b')] = 123; // Unique key
a[Symbol('c')] = 456; // Different unique key

This is why Map exists — when you need objects as keys, Map preserves the actual key identity.`,
      tags: ["JavaScript", "Objects", "Gotcha"],
    },
    {
      id: 74,
      question: "What happens if you call setState inside useEffect without a dependency array?",
      answer: `Code:
function Component() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(count + 1); // setState inside useEffect
  }); // ← NO dependency array!

  return <div>{count}</div>;
}

Output: INFINITE RENDER LOOP! (React will warn and eventually crash)

Why:
1. Component renders → count = 0
2. useEffect runs (no deps = runs after EVERY render) → setCount(1)
3. State changed → Component re-renders → count = 1
4. useEffect runs again → setCount(2)
5. State changed → Component re-renders → count = 2
6. ... forever!

How to fix:

// Fix 1: Add dependency array to run only once
useEffect(() => {
  setCount(1);
}, []); // Empty array = only on mount

// Fix 2: Add specific dependency
useEffect(() => {
  setCount(count + 1);
}, [someCondition]); // Only when someCondition changes

// Fix 3: Use functional updater with condition
useEffect(() => {
  if (shouldUpdate) {
    setCount(prev => prev + 1);
  }
}, [shouldUpdate]);

Common gotcha: Even with a dependency, you can still create a loop:
useEffect(() => {
  setObj({ ...obj, updated: true }); // Creates new object reference
}, [obj]); // obj changed → effect runs → creates new obj → loop!

Fix: Use a specific property or useMemo to stabilize the reference.`,
      tags: ["React", "Hooks", "Gotcha"],
    },
  ],
  scenarioNew: [
    {
      id: 19,
      question: "You're building a dashboard that fetches data from 5 different APIs. How do you handle loading, errors, and stale data?",
      answer: `Use React Query (TanStack Query) — it handles all three elegantly:

// Each widget fetches independently
function Dashboard() {
  return (
    <div className="grid">
      <Suspense fallback={<Skeleton />}><RevenueChart /></Suspense>
      <Suspense fallback={<Skeleton />}><UserStats /></Suspense>
      <Suspense fallback={<Skeleton />}><RecentOrders /></Suspense>
      <Suspense fallback={<Skeleton />}><TopProducts /></Suspense>
      <Suspense fallback={<Skeleton />}><ActivityFeed /></Suspense>
    </div>
  );
}

function RevenueChart() {
  const { data, error, isStale } = useQuery({
    queryKey: ['revenue'],
    queryFn: fetchRevenue,
    staleTime: 5 * 60 * 1000,  // Fresh for 5 minutes
    retry: 2,                    // Retry failed requests twice
  });

  if (error) return <ErrorCard message="Revenue unavailable" onRetry={refetch} />;
  return <Chart data={data} />;
}

Key patterns:
1. Independent Suspense boundaries — One failing widget doesn't break the whole dashboard
2. Error boundaries per section — Show "retry" button, not a full-page error
3. staleTime — Don't refetch on every focus/mount, cache for X minutes
4. Background refetching — stale-while-revalidate: show cached data instantly, update in background
5. Polling for live data: refetchInterval: 30000 (every 30 seconds)

Error handling strategy:
• Network error → Show cached data + "Offline" badge
• API error → Show "Error loading X" with retry button
• Partial failure → Other widgets still work independently

Don't build this from scratch with useEffect — you'll re-invent caching, deduplication, retry logic, and background updates badly.`,
      tags: ["React", "Architecture", "API"],
    },
    {
      id: 20,
      question: "You need to implement search with autocomplete that calls an API. How do you handle it efficiently?",
      answer: `Key challenges: Don't flood the API, handle race conditions, good keyboard UX.

function SearchAutocomplete() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const abortRef = useRef();

  const search = useMemo(
    () => debounce(async (q) => {
      if (q.length < 2) { setResults([]); return; }

      // Cancel previous request
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        const res = await fetch('/api/search?q=' + q, {
          signal: abortRef.current.signal
        });
        const data = await res.json();
        setResults(data);
      } catch (e) {
        if (e.name !== 'AbortError') console.error(e);
      }
    }, 300),
    []
  );

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') setActiveIndex(i => Math.min(i + 1, results.length - 1));
    if (e.key === 'ArrowUp') setActiveIndex(i => Math.max(i - 1, 0));
    if (e.key === 'Enter' && activeIndex >= 0) selectResult(results[activeIndex]);
    if (e.key === 'Escape') setResults([]);
  }

  return (
    <div role="combobox" aria-expanded={results.length > 0}>
      <input value={query} onChange={e => { setQuery(e.target.value); search(e.target.value); }}
        onKeyDown={handleKeyDown} aria-autocomplete="list" />
      <ul role="listbox">
        {results.map((r, i) => (
          <li key={r.id} role="option" aria-selected={i === activeIndex}>{r.name}</li>
        ))}
      </ul>
    </div>
  );
}

Critical pieces:
1. Debounce (300ms) — Don't call API on every keystroke
2. AbortController — Cancel previous request when user types more (prevents race conditions)
3. Minimum query length — Don't search for "a" or "ab"
4. Keyboard navigation — Arrow keys + Enter (accessibility requirement)
5. ARIA attributes — Screen reader support
6. Loading indicator — Show while fetching
7. Highlight matching text — Bold the matched portion in results`,
      tags: ["React", "UX", "Performance"],
    },
    {
      id: 21,
      question: "You need to render 10,000 rows in a table. How do you prevent performance issues?",
      answer: `Never render 10,000 DOM nodes. Use virtualization — only render what's visible.

Approach 1 — Virtualization (best for browsing):
import { useVirtualizer } from '@tanstack/react-virtual';

function BigTable({ data }) {
  const parentRef = useRef();
  const virtualizer = useVirtualizer({
    count: data.length,     // 10,000 items
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40, // Row height in px
    overscan: 10,           // Render 10 extra rows above/below
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(row => (
          <div key={row.key} style={{
            position: 'absolute',
            top: row.start,
            height: row.size,
          }}>
            {data[row.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
// Only ~20-30 DOM nodes exist at any time, regardless of data size!

Approach 2 — Pagination (best for structured browsing):
• Show 50 rows per page with Next/Previous buttons
• Server-side pagination: /api/data?page=1&limit=50
• Simpler UX for tabular data

Approach 3 — Infinite scroll + virtualization:
• Load data in pages (50 at a time)
• As user scrolls, fetch next page
• Virtualize the entire list

Performance tips:
• Memoize row components with React.memo
• Avoid inline styles/objects in map — use useMemo or CSS classes
• Sort/filter on the server, not client (don't load 10K rows just to show 50)
• Use CSS contain: strict on the scroll container

Libraries: @tanstack/react-virtual (recommended), react-window, react-virtuoso`,
      tags: ["React", "Performance"],
    },
    {
      id: 22,
      question: "Your app has memory leaks and gets slower over time. How do you diagnose and fix?",
      answer: `Step 1 — Identify symptoms:
• App gets slower the longer it's used
• Browser tab memory keeps growing in Task Manager
• Performance tab shows increasing JS heap

Step 2 — Diagnose with Chrome DevTools:

Memory tab → Take Heap Snapshot:
• Take snapshot, use the app, take another snapshot
• Compare: Filter by "Objects allocated between snapshots"
• Look for: Detached DOM nodes, large arrays, event listeners

Performance tab → Record:
• Record user actions
• Look for: Growing memory graph (should be sawtooth, not upward line)
• Check if garbage collection reclaims memory

Step 3 — Common causes and fixes:

1. Forgotten event listeners:
// BAD: Listener never removed
useEffect(() => {
  window.addEventListener('resize', handleResize);
  // Missing cleanup!
}, []);

// GOOD:
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

2. Uncleared timers:
useEffect(() => {
  const id = setInterval(fetchData, 5000);
  return () => clearInterval(id); // ← MUST clear
}, []);

3. Stale closures holding references:
// Large array captured in closure, never released
useEffect(() => {
  const hugeData = processLargeDataset();
  setResult(hugeData.summary);
  // hugeData is still in memory because the closure holds it!
}, []);

4. Detached DOM nodes:
// Removed from DOM but still referenced in JavaScript
const nodes = document.querySelectorAll('.item');
// Even after removing items from DOM, 'nodes' holds references

5. Growing state arrays:
// Messages keep growing, never trimmed
setMessages(prev => [...prev, newMessage]);
// Fix: Limit to last 100 messages
setMessages(prev => [...prev, newMessage].slice(-100));

6. Unsubscribed observables/WebSockets:
useEffect(() => {
  const ws = new WebSocket(url);
  return () => ws.close(); // ← MUST close
}, []);`,
      tags: ["Debugging", "Performance", "React"],
    },
    {
      id: 23,
      question: "You're asked to implement dark mode / theme switching. What's the best approach?",
      answer: `Best approach: CSS variables + system preference + localStorage persistence.

Step 1 — Define theme with CSS variables:
:root {
  --bg: #ffffff;
  --text: #1a1a1a;
  --border: #e5e5e5;
}

[data-theme="dark"] {
  --bg: #0a0a0a;
  --text: #fafafa;
  --border: #2a2a2a;
}

body { background: var(--bg); color: var(--text); }

Step 2 — Detect system preference:
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

Step 3 — React hook:
function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  return { theme, toggle };
}

Step 4 — Prevent flash of wrong theme (FOUC):
Add this script in <head> BEFORE React loads:
<script>
  (function() {
    var theme = localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  })();
</script>

Step 5 — Listen for system changes:
useEffect(() => {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e) => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  };
  media.addEventListener('change', handler);
  return () => media.removeEventListener('change', handler);
}, []);

With Tailwind: Use the 'class' strategy in tailwind.config.js — add 'dark' class to <html> and use dark: prefix.`,
      tags: ["CSS", "React", "UX"],
    },
    {
      id: 24,
      question: "A third-party script is blocking your page load. How do you fix it?",
      answer: `Problem: Third-party scripts (analytics, chat widgets, ads) can block rendering and tank your performance scores.

Solution 1 — async/defer attributes:
<!-- BAD: Blocks HTML parsing -->
<script src="https://third-party.com/widget.js"></script>

<!-- GOOD: async — downloads in parallel, executes when ready -->
<script async src="https://third-party.com/analytics.js"></script>

<!-- GOOD: defer — downloads in parallel, executes after HTML is parsed -->
<script defer src="https://third-party.com/widget.js"></script>

Difference:
• async: Executes as soon as downloaded (order not guaranteed)
• defer: Executes after HTML parsing, in order
• Use defer for scripts that depend on DOM. Use async for independent scripts.

Solution 2 — Dynamic loading (load after user interaction):
// Don't load chat widget until user clicks "Chat"
function loadChatWidget() {
  const script = document.createElement('script');
  script.src = 'https://chat-provider.com/widget.js';
  document.body.appendChild(script);
}

<button onClick={loadChatWidget}>Need help? Chat with us</button>

Solution 3 — Facade pattern (show a fake, load real on interaction):
// Show a static image/button that looks like the chat widget
// Only load the real script when user hovers or clicks
// YouTube embeds: Show thumbnail, load iframe on click

Solution 4 — Load after page load:
window.addEventListener('load', () => {
  // Page fully loaded, now load non-critical scripts
  loadAnalytics();
  loadChatWidget();
});

// Or with requestIdleCallback:
requestIdleCallback(() => loadNonCriticalScripts());

Solution 5 — Use Web Workers for heavy scripts:
// Move heavy processing to a worker thread
// Partytown library does this for third-party scripts

In Next.js:
import Script from 'next/script';
<Script src="https://analytics.com/script.js" strategy="lazyOnload" />
// strategy options: beforeInteractive, afterInteractive, lazyOnload, worker`,
      tags: ["Performance", "Browser"],
    },
    {
      id: 25,
      question: "How would you implement feature flags in your frontend?",
      answer: `Feature flags let you enable/disable features without deploying new code.

Simple approach (good for small teams):
// feature-flags.js
const flags = {
  newCheckout: true,
  darkMode: false,
  betaSearch: process.env.NEXT_PUBLIC_ENABLE_BETA_SEARCH === 'true',
};

function FeatureFlag({ name, children, fallback = null }) {
  return flags[name] ? children : fallback;
}

// Usage:
<FeatureFlag name="newCheckout">
  <NewCheckoutFlow />
</FeatureFlag>

Server-side evaluation (best for Next.js):
// In middleware or server component
export async function middleware(request) {
  const flags = await getFeatureFlags(request.cookies.get('userId'));

  if (flags.newHomepage) {
    return NextResponse.rewrite(new URL('/experiments/new-homepage', request.url));
  }
}
// User never sees the flag logic — it's decided on the server

Professional approach (LaunchDarkly, Flagsmith, Unleash):
import { useFlags } from 'launchdarkly-react-client-sdk';

function Checkout() {
  const { newCheckoutEnabled } = useFlags();

  if (newCheckoutEnabled) return <NewCheckout />;
  return <OldCheckout />;
}

Key patterns:
1. Gradual rollout — Enable for 5% of users, then 25%, then 100%
2. User targeting — Enable for specific users/segments (beta testers, premium)
3. Kill switch — Instantly disable a broken feature without deploying
4. A/B testing — Show variant A to 50%, variant B to 50%, measure results

Best practices:
• Clean up old flags (tech debt builds fast)
• Server-side evaluation when possible (no flash of old UI)
• Don't wrap entire pages — wrap specific components
• Log which flags are active for debugging`,
      tags: ["Architecture", "DevOps"],
    },
    {
      id: 26,
      question: "Your Lighthouse performance score dropped from 95 to 60 after a deploy. How do you investigate?",
      answer: `Systematic debugging approach:

Step 1 — Compare before and after:
• Run Lighthouse on both the current and previous deploy
• Compare: Which metrics changed? (LCP? TBT? CLS?)
• If you have Lighthouse CI: Check the diff report automatically

Step 2 — Check what changed in the deploy:
• git diff between the two commits
• Look for: New dependencies, image changes, removed lazy loading, new third-party scripts

Step 3 — Diagnose by metric:

LCP dropped (Largest Contentful Paint):
• Was a large image added above the fold?
• Was image optimization removed (next/image → regular <img>)?
• New render-blocking CSS or fonts?
• Server response time increased?

TBT increased (Total Blocking Time):
• Large new JavaScript bundle? Run webpack-bundle-analyzer
• New heavy library added? Check bundlephobia
• Removed code splitting (lazy loading)?
• Synchronous API call blocking render?

CLS increased (Layout Shift):
• Images without width/height added?
• Font swap causing text reflow?
• Dynamically injected content above fold?

Step 4 — Tools:
• Chrome DevTools Performance tab — Record page load, find long tasks
• Bundle analyzer — Compare bundle sizes before/after
• Network tab — Check if new requests were added
• Coverage tab — Check for unused JavaScript/CSS

Step 5 — Prevent future regressions:
• Add Lighthouse CI to PR checks — fail builds if score drops >5 points
• Set up bundle size budgets — alert if JS grows >10KB
• Track Web Vitals in production with real user monitoring (RUM)
• Add size-limit to CI: npx size-limit checks bundle on every PR

Quick checklist:
□ New npm dependency? → Check its size
□ Removed lazy() or dynamic import? → Restore it
□ New image without optimization? → Use next/image
□ Third-party script added? → Use async/defer/lazyOnload`,
      tags: ["Performance", "Debugging", "DevOps"],
    },
    {
      id: 27,
      question: "How would you implement keyboard shortcuts in your React app (Ctrl+S to save, Ctrl+K for search)?",
      answer: `Approach with a custom hook:

function useKeyboardShortcut(keys, callback, options = {}) {
  const { ctrl = false, shift = false, alt = false, preventDefault = true } = options;

  useEffect(() => {
    function handler(e) {
      const key = e.key.toLowerCase();
      if (
        key === keys.toLowerCase() &&
        e.ctrlKey === ctrl &&
        e.shiftKey === shift &&
        e.altKey === alt
      ) {
        if (preventDefault) e.preventDefault(); // Prevent browser default (Ctrl+S = save page)
        callback(e);
      }
    }

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [keys, callback, ctrl, shift, alt, preventDefault]);
}

// Usage:
useKeyboardShortcut('s', handleSave, { ctrl: true });     // Ctrl+S
useKeyboardShortcut('k', openSearch, { ctrl: true });      // Ctrl+K
useKeyboardShortcut('Escape', closeModal);                  // Escape

Important considerations:

1. Prevent browser defaults:
   e.preventDefault() stops Ctrl+S from opening "Save Page" dialog

2. Don't capture when user is typing:
   // Skip if user is in an input/textarea
   if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

3. macOS compatibility:
   // Use metaKey (⌘) on Mac, ctrlKey on Windows/Linux
   const modifier = e.ctrlKey || e.metaKey;

4. Show shortcut hints in UI:
   <button>Save <kbd>Ctrl+S</kbd></button>

5. Accessibility:
   • Shortcuts should ENHANCE, not be the ONLY way to do something
   • Provide visual buttons for all shortcut actions
   • Don't override browser/screen reader shortcuts

Libraries: react-hotkeys-hook (lightweight), tinykeys (800 bytes), mousetrap

import { useHotkeys } from 'react-hotkeys-hook';
useHotkeys('ctrl+s', handleSave);
useHotkeys('ctrl+k', openSearch);`,
      tags: ["React", "UX", "Accessibility"],
    },
    {
      id: 28,
      question: "You're migrating from JavaScript to TypeScript in a large existing project. What's your strategy?",
      answer: `Incremental migration — don't convert everything at once.

Phase 1 — Setup (Day 1):
// tsconfig.json — Start permissive
{
  "compilerOptions": {
    "allowJs": true,          // Mix JS and TS files
    "strict": false,          // Start lenient
    "noImplicitAny": false,   // Allow implicit 'any' for now
    "target": "es2020",
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
// Rename index.js to index.ts — app still works!

Phase 2 — Convert shared utilities first (Week 1):
• Start with pure functions: utils, helpers, constants
• These are easiest — no React/JSX complexity
• Add types to function signatures:
  // Before: function formatDate(date) { ... }
  // After:  function formatDate(date: Date): string { ... }

Phase 3 — Add types for API responses (Week 1-2):
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}
// Typed API calls catch errors at compile time
const user: User = await fetchUser(id);

Phase 4 — Convert components (Week 2-4):
• Rename .jsx → .tsx one file at a time
• Add prop types:
  interface ButtonProps {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }

Phase 5 — Gradually tighten strictness:
// After most files are converted, enable strict options one by one:
"noImplicitAny": true,     // No more implicit any
"strictNullChecks": true,  // null/undefined checked
"strict": true,            // Full strict mode (final goal)

Tips:
• Use any as an escape hatch initially — replace with real types later
• Don't aim for perfect types on Day 1 — working code > perfect types
• Use IDE "Convert to TypeScript" features
• Add types at the boundaries first (API responses, component props)
• Set up a lint rule to prevent NEW .js files (only .ts/.tsx allowed)`,
      tags: ["TypeScript", "Migration", "Architecture"],
    },
  ],
};
