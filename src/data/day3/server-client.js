export const serverClient = {
  id: "server-client",
  title: "Server Components vs Client Components",
  icon: "🔀",
  tag: "Next.js",
  tagColor: "var(--tag-next)",
  subtitle: "The mental model, boundaries, composition patterns, and serialization rules",
  concepts: [
    {
      title: "Server Components vs Client Components — The Mental Model",
      explanations: {
        layman: "Imagine a restaurant menu printed on paper versus a touchscreen menu. The paper menu (Server Component) is created in the back office and handed to you ready to read. It is lightweight and cheap -- no batteries needed. The touchscreen menu (Client Component) lets you tap buttons, filter dishes, and place orders interactively, but it needs power and software to work. In Next.js, most of your page is like a paper menu -- pre-made on the server with no JavaScript cost. Only the parts that need to respond to clicks and typing become touchscreen menus. The rule: start with paper (server), and only upgrade to touchscreen (client) when you need interactivity.",
        mid: "Server Components run exclusively on the server and send only their rendered output (HTML + RSC payload) to the client. They have zero JavaScript footprint in the browser bundle. They can directly access backend resources (databases, file system, environment variables) and perform async operations. Client Components are marked with 'use client' and run on both the server (for initial SSR) and the client (for hydration and interactivity). They can use hooks (useState, useEffect, etc.), event handlers, and browser APIs. The default in the App Router is Server Components — you opt INTO the client, not out of it.",
        senior: "The Server/Client boundary is a module-level concept, not a runtime concept. When the bundler encounters 'use client', it creates a client module reference — a serializable pointer that tells React to include this module in the client bundle and hydrate it. Server Components are never included in the client bundle; they're replaced by their rendered output in the RSC payload. This means Server Components can contain secrets (API keys, database passwords) safely — they never leak to the client. The RSC payload is a streaming JSON-like format (React Flight protocol) that describes the component tree as a mix of rendered HTML, client component references, and serialized props. In production, this architecture dramatically reduces bundle size: a page with 50 components where only 3 need interactivity ships JavaScript for only those 3. The server tree can be arbitrarily deep and complex without client-side cost. However, the boundary introduces constraints: data crossing the boundary must be serializable (no functions, classes, or Dates), and the boundary is one-directional (server renders, client hydrates — not the other way around)."
      },
      realWorld: "A blog page: the layout, article content, sidebar, and footer are Server Components (zero JS shipped). Only the like button, comment form, and share dropdown are Client Components. The page loads fast because 90% of it is static HTML with no hydration cost.",
      whenToUse: "Default to Server Components for everything. Only add 'use client' when you need: hooks (useState, useEffect), event handlers (onClick, onChange), browser APIs (window, localStorage), or third-party libraries that use these.",
      whenNotToUse: "Don't make everything a Client Component 'just to be safe.' Every Client Component adds to the JavaScript bundle. Conversely, don't try to force interactivity into Server Components — embrace the boundary and compose appropriately.",
      pitfalls: "The biggest misconception: 'use client' does NOT mean 'only renders in the browser.' Client Components are still server-rendered for the initial HTML -- the name is misleading. 'use client' actually means 'this component needs JavaScript shipped to the browser for interactivity.' The second biggest pitfall: placing 'use client' too high in the component tree. If you mark a layout as 'use client', every component it imports becomes a Client Component, and you lose all Server Component benefits for that entire subtree. Push 'use client' as far down (as close to the leaves) as possible.",
      codeExamples: [
        {
          title: "Server and Client Components Working Together",
          code: `// app/blog/[slug]/page.js — Server Component (default)
// This runs ONLY on the server. Zero client-side JavaScript.
import { LikeButton } from './_components/LikeButton';
import { ShareMenu } from './_components/ShareMenu';

export default async function BlogPost({ params }) {
  const { slug } = await params;

  // Direct database access — safe, never exposed to client
  const post = await db.post.findUnique({
    where: { slug },
    include: { author: true }
  });

  // Environment variable — safe in Server Components
  const analyticsKey = process.env.ANALYTICS_SECRET;
  await trackView(analyticsKey, post.id);

  return (
    <article>
      {/* All of this is rendered to HTML on the server */}
      <h1>{post.title}</h1>
      <p className="author">By {post.author.name}</p>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />

      {/* Only these ship JavaScript to the client */}
      <div className="actions">
        <LikeButton postId={post.id} initialLikes={post.likes} />
        <ShareMenu url={\`/blog/\${slug}\`} title={post.title} />
      </div>
    </article>
  );
}

// app/blog/[slug]/_components/LikeButton.js
"use client"; // This component needs interactivity

import { useState, useTransition } from 'react';

export function LikeButton({ postId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes);
  const [isPending, startTransition] = useTransition();

  async function handleLike() {
    startTransition(async () => {
      const res = await fetch(\`/api/posts/\${postId}/like\`, {
        method: 'POST'
      });
      const data = await res.json();
      setLikes(data.likes);
    });
  }

  return (
    <button onClick={handleLike} disabled={isPending}>
      {isPending ? 'Liking...' : \`Like (\${likes})\`}
    </button>
  );
}`
        }
      ]
    },
    {
      title: "The 'use client' Directive and Client Boundary",
      explanations: {
        layman: "The 'use client' directive is like a velvet rope at a VIP area. Everything above the rope (server side) is exclusive, private, and handles the important behind-the-scenes work. Below the rope (client side) is where the action happens — people interact, dance, and react. Once you cross the rope, everything below you is also in the VIP-accessible area. The rope is a one-way boundary.",
        mid: "'use client' is a module-level directive placed at the top of a file. It marks that file — and everything it imports — as part of the client module graph. When React encounters this boundary during rendering, it knows to include that component's JavaScript in the client bundle for hydration. Crucially, 'use client' doesn't mean 'skip SSR.' Client Components are still server-rendered for the initial HTML; the directive means 'also ship the JS so this component is interactive in the browser.' The boundary is transitive: if ComponentA has 'use client' and imports ComponentB (without the directive), ComponentB becomes a Client Component too, because it's pulled into the client module graph.",
        senior: "The 'use client' directive is a bundler instruction, not a runtime instruction. When the module bundler (webpack/turbopack) encounters it, it creates a split point: everything above is the server module graph, everything at and below is the client module graph. The boundary creates a serialization point — props passed from Server Components to Client Components must be serializable (JSON-compatible). The bundler generates a client reference for each 'use client' module, which is a small JSON pointer (module ID + export name) embedded in the RSC payload. At hydration time, React resolves these references to the actual client module and hydrates the component. This means the boundary placement directly impacts bundle size: placing 'use client' on a barrel file (index.js that re-exports 20 components) pulls ALL 20 into the client bundle, even if only 1 is used. Place 'use client' on the leaf components that actually need it. In production, analyze your client bundle to ensure Server Components aren't accidentally crossing the boundary through transitive imports."
      },
      realWorld: "A dashboard page imports a Chart library that uses canvas (browser-only). Only the ChartWrapper component gets 'use client' — the data fetching, layout, and statistics calculations remain Server Components. This keeps the heavy chart code confined to the client boundary while the rest of the page is zero-JS.",
      whenToUse: "Add 'use client' to the specific component file that needs interactivity — not its parent or ancestor. Push the boundary as low in the tree as possible to minimize the client bundle.",
      whenNotToUse: "Never add 'use client' to layout.js or page.js unless the entire page truly needs client interactivity. Never add it 'just to be safe' or because you're unsure. If no hooks or event handlers are used, it's a Server Component.",
      pitfalls: "The transitive boundary: importing a Server-only library (like a database client) in a Client Component causes a build error. Barrel files (index.js re-exports) can accidentally pull server-only code into the client boundary. Also, 'use client' cannot be conditionally applied — it's all or nothing for that module. If you need part of a component to be a Server Component and part to be a Client Component, split them into separate files.",
      codeExamples: [
        {
          title: "The Boundary Is Transitive — Understanding Module Graphs",
          code: `// WRONG: 'use client' too high — entire subtree becomes client
// app/dashboard/page.js
"use client"; // DON'T DO THIS — everything below is now client

import { Sidebar } from './_components/Sidebar';
import { Metrics } from './_components/Metrics';
import { UserTable } from './_components/UserTable';
// All of these are now Client Components, even if they
// don't need interactivity. Data fetching must happen client-side.

// RIGHT: 'use client' only on components that need it
// app/dashboard/page.js — Server Component (no directive)
import { Sidebar } from './_components/Sidebar';       // Server
import { Metrics } from './_components/Metrics';         // Server
import { UserTable } from './_components/UserTable';     // Server
import { FilterBar } from './_components/FilterBar';     // Client

export default async function Dashboard() {
  const metrics = await db.metrics.getLatest();
  const users = await db.users.findMany({ take: 20 });

  return (
    <div className="dashboard">
      <Sidebar />
      <main>
        <Metrics data={metrics} />
        <FilterBar /> {/* Only this needs 'use client' */}
        <UserTable users={users} />
      </main>
    </div>
  );
}

// app/dashboard/_components/FilterBar.js
"use client"; // Only THIS component is a Client Component

import { useState } from 'react';

export function FilterBar() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  return (
    <div className="filter-bar">
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search users..."
      />
      <select value={filter} onChange={e => setFilter(e.target.value)}>
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>
  );
}`
        }
      ]
    },
    {
      title: "Composition Patterns — Server Components as Children of Client Components",
      explanations: {
        layman: "Imagine a picture frame (Client Component) and a photograph (Server Component). The frame is interactive — you can rotate it, resize it, add effects. The photograph inside is pre-printed and static. You can put any photograph in any frame because the frame doesn't need to know how the photograph was made. In React, this works through the children prop: the Client Component is the frame, and the Server Component is passed in as children.",
        mid: "The key composition pattern: Client Components can render Server Components passed as children or props. This works because when a Server Component is passed as a child, it's already rendered to RSC payload on the server. The Client Component receives the pre-rendered output, not the component function. So the Client Component doesn't need to know or execute the Server Component — it just renders the output. This lets you create interactive wrappers (modals, accordions, tabs) that contain server-rendered content without pulling that content into the client bundle.",
        senior: "This pattern works because of how the RSC protocol serializes the component tree. When a Server Component renders and encounters a Client Component with Server Component children, the children are resolved on the server first. The RSC payload contains the Client Component reference (module pointer) with the pre-rendered children serialized as React elements (not component functions). The client receives: ClientComponent({ children: <already-rendered-server-output> }). This is why you CAN'T import a Server Component inside a Client Component directly — the Client Component would need to execute it, but Server Components can't run on the client. You CAN pass them as children because the parent (Server Component) renders them first. This pattern is essential for: animated wrappers around server content, stateful containers (tabs, accordions) with server-rendered panels, context providers that need to wrap server content, and modal/dialog patterns where the trigger is client-side but the content is server-rendered."
      },
      realWorld: "A tabs component where the tab headers are interactive (Client Component) but the tab content is heavy HTML from a CMS (Server Component). The tabs handle click state client-side, but the content is rendered on the server and never adds to the client bundle.",
      whenToUse: "Use this pattern whenever you need an interactive wrapper around static or data-heavy content. Common examples: modals, accordions, tabs, sidebars, context providers, and animation wrappers.",
      whenNotToUse: "If the content itself needs to be interactive (respond to hooks/events), it must be a Client Component anyway — no benefit from this pattern. Also, don't over-engineer with this pattern for simple cases where a single Client Component would be clearer.",
      pitfalls: "You CANNOT import a Server Component inside a Client Component file. This is the #1 mistake. Instead, pass it as a prop (children, slot, render prop). Also, the server-rendered content passed as children is static — the Client Component can't re-render it or pass new props to it. If you need the Server Component to update, you need a router refresh (router.refresh()) to get a new RSC payload.",
      codeExamples: [
        {
          title: "The Children Pattern — Interactive Wrapper with Server Content",
          code: `// WRONG: Can't import Server Component in Client Component
// app/_components/Accordion.js
"use client";
import { ProductDetails } from './ProductDetails'; // ERROR!
// ProductDetails is a Server Component — can't be imported
// in a Client Component because the client can't execute it.

// RIGHT: Pass Server Component as children
// app/products/[id]/page.js — Server Component
import { Accordion } from './_components/Accordion';

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await db.products.findUnique({ where: { id } });
  const specs = await db.specs.findMany({ where: { productId: id } });

  return (
    <div>
      <h1>{product.name}</h1>

      {/* Server-rendered content passed as children to Client Component */}
      <Accordion title="Product Specifications">
        {/* This is a Server Component rendered on the server */}
        <SpecsTable specs={specs} />
      </Accordion>

      <Accordion title="Shipping Information">
        <ShippingInfo productId={id} />
      </Accordion>
    </div>
  );
}

// Server Component — renders on server, zero client JS
async function SpecsTable({ specs }) {
  return (
    <table>
      <tbody>
        {specs.map(spec => (
          <tr key={spec.id}>
            <td>{spec.name}</td>
            <td>{spec.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

async function ShippingInfo({ productId }) {
  const shipping = await fetch(
    \`https://api.example.com/shipping/\${productId}\`
  ).then(r => r.json());

  return (
    <div>
      <p>Estimated delivery: {shipping.estimatedDays} business days</p>
      <p>Shipping cost: \${shipping.cost.toFixed(2)}</p>
    </div>
  );
}

// app/products/[id]/_components/Accordion.js
"use client";

import { useState } from 'react';

export function Accordion({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="accordion">
      <button onClick={() => setIsOpen(!isOpen)}>
        {title} {isOpen ? '▲' : '▼'}
      </button>
      {isOpen && (
        <div className="accordion-content">
          {/* children is pre-rendered Server Component output */}
          {children}
        </div>
      )}
    </div>
  );
}`
        }
      ]
    },
    {
      title: "Serialization Boundary and Third-Party Libraries",
      explanations: {
        layman: "The server-to-client boundary is like sending a package through the mail. You can send a book (string), a box of numbers, or a list (array) — these are simple things the receiver can understand. But you can't mail a live pet (function), a running machine (class instance), or a recipe that needs to be cooked on the spot (Date object). Only things that can be 'flattened' and 'unflattened' can cross the boundary.",
        mid: "When Server Components pass props to Client Components, those props must be serializable — they cross the network via the RSC payload. Serializable types include: strings, numbers, booleans, null, undefined, arrays, plain objects, Date (serialized to string), Map, Set, BigInt, TypedArrays, and React elements (JSX). NOT serializable: functions, class instances, Symbols, Errors, and circular references. This means you can't pass an event handler from a Server Component to a Client Component — the handler must be defined within the Client Component. For data from databases, you often need to serialize dates and strip non-serializable fields before passing to client components.",
        senior: "The serialization boundary is enforced by the React Flight protocol. When React serializes the RSC payload, it traverses the tree and encodes each value. Client Component references become module pointers. Server Component output becomes pre-rendered elements. Props become serialized values. Functions trigger a serialization error at build/runtime. The practical implications are significant for large apps: (1) Database ORM objects (Prisma models, Mongoose documents) often contain methods and getters that aren't serializable — map them to plain objects first. (2) Date objects ARE supported in the RSC protocol as a special type, but some serialization paths may convert them to strings. (3) React elements (JSX) can be passed as props — this is how the children pattern works. (4) For third-party libraries, any library that uses hooks, context, browser APIs, or React state must be used in Client Components. If a library doesn't have a 'use client' directive, you need a wrapper. The community convention is emerging where library authors export separate server and client entry points. Check if the library supports RSC before wrapping it — many popular libraries (Recharts, Framer Motion, React Hook Form) are client-only and need 'use client' wrappers."
      },
      realWorld: "A dashboard uses Recharts for data visualization. The data is fetched and transformed in a Server Component (no JS cost), then passed as plain arrays to a ChartWrapper Client Component that renders the Recharts components. The heavy chart library only loads on the client, while the data processing happens on the server.",
      whenToUse: "Always be aware of the serialization boundary when passing props from Server to Client Components. Design your data flow to keep non-serializable values on the server side.",
      whenNotToUse: "If all your data is simple (strings, numbers, arrays of plain objects), you don't need to worry — it serializes automatically. Don't over-engineer serialization for simple cases.",
      pitfalls: "Passing a function prop from a Server Component to a Client Component causes a runtime error. Passing a Prisma model directly may fail due to hidden methods/getters — always map to plain objects. Date handling can be inconsistent — prefer ISO strings. Large serialized payloads increase RSC payload size and slow down client-side navigation. Also, circular references in props will crash serialization.",
      codeExamples: [
        {
          title: "Handling Serialization and Third-Party Library Wrappers",
          code: `// WRONG: Passing non-serializable props
// app/dashboard/page.js
import { Chart } from './_components/Chart';

export default async function Dashboard() {
  const data = await db.metrics.findMany({
    orderBy: { date: 'desc' },
    take: 30
  });

  return (
    <Chart
      data={data} // Prisma objects may not serialize cleanly
      onHover={(point) => console.log(point)} // FUNCTIONS CAN'T CROSS!
      formatter={new Intl.NumberFormat('en-US')} // CLASS INSTANCE!
    />
  );
}

// RIGHT: Serialize data, keep functions on the client
// app/dashboard/page.js
import { Chart } from './_components/Chart';

export default async function Dashboard() {
  const rawData = await db.metrics.findMany({
    orderBy: { date: 'desc' },
    take: 30
  });

  // Map to plain serializable objects
  const chartData = rawData.map(item => ({
    date: item.date.toISOString(), // Date -> string
    value: item.value,
    label: item.label
  }));

  return (
    <Chart
      data={chartData}    // Plain array of objects — serializable
      locale="en-US"      // Pass config, not instances
      currency="USD"      // Client creates the formatter
    />
  );
}

// app/dashboard/_components/Chart.js
"use client";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'; // Third-party library — client only

export function Chart({ data, locale, currency }) {
  // Create non-serializable objects on the client
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  });

  function handleHover(point) {
    // Event handlers live on the client
    console.log('Hovered:', point);
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} onMouseMove={handleHover}>
        <XAxis
          dataKey="date"
          tickFormatter={(d) => new Date(d).toLocaleDateString()}
        />
        <YAxis tickFormatter={(v) => formatter.format(v)} />
        <Tooltip
          formatter={(v) => formatter.format(v)}
          labelFormatter={(d) => new Date(d).toLocaleDateString()}
        />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Third-party wrapper pattern
// app/_components/MotionDiv.js
"use client";
// Framer Motion doesn't export 'use client' — wrap it
import { motion } from 'framer-motion';
export const MotionDiv = motion.div;

// Now use in Server Components:
// app/page.js
import { MotionDiv } from './_components/MotionDiv';

export default function Page() {
  return (
    <MotionDiv
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1>Animated heading</h1>
    </MotionDiv>
  );
}`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "What does 'use client' actually do? Does it mean the component only renders on the client?",
      answer: "No, 'use client' does NOT mean client-only rendering. Client Components are still server-rendered (SSR'd) for the initial HTML. The directive tells the bundler to include this component's JavaScript in the client bundle so it can be hydrated and become interactive in the browser. Without 'use client', a component is a Server Component that runs only on the server and ships zero JavaScript. With 'use client', the component runs on the server for the initial render AND on the client for hydration and subsequent re-renders. The distinction is about interactivity, not rendering location.",
      difficulty: "easy",
      followUps: [
        "If Client Components are SSR'd, how do you truly skip server rendering?",
        "What happens to useState during the SSR of a Client Component?",
        "Can you use async/await in Client Components?"
      ]
    },
    {
      question: "Why can't you import a Server Component inside a Client Component?",
      answer: "When a file has 'use client', the bundler includes that file and all its imports in the client bundle. A Server Component may access databases, file systems, environment variables, and other server-only resources. Including it in the client bundle would: (1) expose secrets, (2) include server-only dependencies (like database drivers) in the browser bundle, and (3) fail because those APIs don't exist in the browser. The fix is the children pattern: pass the Server Component as a prop (children) from a shared parent Server Component. The Server Component is rendered on the server first, and its output (not its code) is passed to the Client Component.",
      difficulty: "mid",
      followUps: [
        "How does the children pattern solve this problem?",
        "What error do you see when you accidentally import a Server Component in a Client Component?",
        "Can a Client Component import another Client Component?"
      ]
    },
    {
      question: "What types can be passed as props from Server Components to Client Components?",
      answer: "Only serializable types can cross the boundary because props are transmitted via the RSC payload (React Flight protocol). Serializable: strings, numbers, booleans, null, undefined, arrays, plain objects, Date, BigInt, Map, Set, TypedArrays, and React elements (JSX). NOT serializable: functions, class instances, Symbols, Error objects, DOM nodes, and circular references. This means you cannot pass event handlers, callback functions, or ORM model instances as props. Convert data to plain objects, pass configuration primitives instead of instances, and define functions within the Client Component itself.",
      difficulty: "mid",
      followUps: [
        "How do you handle Date objects across the boundary?",
        "Can you pass JSX as a prop from Server to Client Component?",
        "What happens at runtime when you accidentally pass a non-serializable prop?"
      ]
    },
    {
      question: "Explain the composition pattern of passing Server Components as children to Client Components.",
      answer: "This is the most important pattern for mixing Server and Client Components. A Server Component renders both a Client Component and another Server Component, passing the latter as children to the former. The Server Component children are fully rendered on the server first — the Client Component receives pre-rendered output, not executable code. The Client Component doesn't need to know or care that its children were server-rendered. This enables interactive wrappers (modals, tabs, accordions, context providers) around server-rendered content. The pattern preserves the benefits of both: zero-JS server content inside interactive client containers.",
      difficulty: "hard",
      followUps: [
        "Can the Client Component conditionally render its server-rendered children?",
        "How do you update the server-rendered children after user interaction?",
        "Can you pass multiple Server Components as named props to a Client Component?"
      ]
    },
    {
      question: "How should you handle third-party libraries that don't support Server Components?",
      answer: "Most existing React libraries (Recharts, Framer Motion, React Hook Form, etc.) use hooks, context, or browser APIs and require the client boundary. Three approaches: (1) Create a thin wrapper file with 'use client' that re-exports the library components. (2) Import the library only in Client Component files. (3) Check if the library publishes separate server/client entry points (e.g., 'library/server' and 'library/client'). The wrapper pattern is most common: create a file like MotionDiv.js with 'use client' that imports and re-exports motion.div from framer-motion. You can then use MotionDiv in Server Components because the import resolves to a Client Component reference. Keep the wrapper minimal to avoid pulling unnecessary code into the client bundle.",
      difficulty: "mid",
      followUps: [
        "What if a library works fine on the server but you're unsure if it needs 'use client'?",
        "How do you check a library's bundle size impact as a Client Component?",
        "Can you lazy-load a third-party Client Component?"
      ]
    },
    {
      question: "What is the decision framework for choosing Server vs Client Components?",
      answer: "Start with Server Components (the default). Switch to Client Components ONLY when you need: (1) Interactivity — event handlers like onClick, onChange. (2) State — useState, useReducer. (3) Lifecycle effects — useEffect, useLayoutEffect. (4) Browser APIs — window, document, localStorage, geolocation. (5) Custom hooks that use any of the above. (6) React Class Components (they use lifecycle methods). Everything else — data fetching, rendering HTML, accessing backend resources, heavy computations, sensitive logic — belongs in Server Components. When you do need a Client Component, push the 'use client' boundary as low as possible. Instead of making a whole page client-side, extract only the interactive button or form into a Client Component.",
      difficulty: "easy",
      followUps: [
        "Can Server Components use React context?",
        "Where do you handle form submissions — server or client?",
        "How do Server Actions fit into this decision framework?"
      ]
    },
    {
      question: "How does the 'use client' boundary affect the component tree and bundle size?",
      answer: "The 'use client' boundary is transitive — once a module has 'use client', every module it imports is also included in the client bundle. This means placing 'use client' on a high-level component (like a layout) pulls the entire subtree's code into the client bundle, defeating the purpose of Server Components. In production, this directly impacts JavaScript bundle size, parse time, and hydration cost. The optimization strategy: push 'use client' to the leaves of the component tree. Instead of a client-side ProductPage, have a server-rendered ProductPage with client-side AddToCartButton and ImageCarousel. Barrel files (index.js that re-exports many components) are especially dangerous — a single 'use client' on a barrel file includes everything it exports. Use targeted imports (import { X } from './X') instead of barrel imports to enable better tree-shaking.",
      difficulty: "hard",
      followUps: [
        "How do you audit which components are in the client bundle?",
        "What tools can you use to analyze the Server/Client boundary?",
        "Can tree-shaking help reduce the impact of barrel files?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Build a Tab Component with Server-Rendered Content",
      difficulty: "mid",
      description: "Create a Tabs component (Client Component for interactivity) that renders multiple tab panels. Each panel's content should be a Server Component passed as children. The active tab should be controlled by client state, but the content should be server-rendered with no additional JavaScript cost.",
      solution: `// app/product/[id]/page.js — Server Component
import { Tabs, TabPanel } from './_components/Tabs';

export default async function ProductPage({ params }) {
  const { id } = await params;

  // All data fetching happens on the server — zero client cost
  const product = await db.products.findUnique({ where: { id } });
  const specs = await db.specs.findMany({ where: { productId: id } });
  const reviews = await db.reviews.findMany({
    where: { productId: id },
    include: { author: true },
    take: 10
  });

  return (
    <div>
      <h1>{product.name}</h1>
      <p>\${product.price}</p>

      {/* Tabs is a Client Component, but content is server-rendered */}
      <Tabs labels={['Description', 'Specifications', 'Reviews']}>
        <TabPanel>
          <div className="prose">
            <p>{product.description}</p>
            <h3>Features</h3>
            <ul>
              {product.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        </TabPanel>

        <TabPanel>
          <table className="specs-table">
            <tbody>
              {specs.map(spec => (
                <tr key={spec.id}>
                  <th>{spec.name}</th>
                  <td>{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabPanel>

        <TabPanel>
          <div className="reviews-list">
            {reviews.map(review => (
              <div key={review.id} className="review">
                <div className="review-header">
                  <strong>{review.author.name}</strong>
                  <span>{'*'.repeat(review.rating)}</span>
                </div>
                <p>{review.text}</p>
              </div>
            ))}
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}

// app/product/[id]/_components/Tabs.js
"use client";

import { useState, Children } from 'react';

export function Tabs({ labels, children }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const panels = Children.toArray(children);

  return (
    <div className="tabs">
      <div className="tab-headers" role="tablist">
        {labels.map((label, index) => (
          <button
            key={label}
            role="tab"
            aria-selected={index === activeIndex}
            className={\`tab-button \${index === activeIndex ? 'active' : ''}\`}
            onClick={() => setActiveIndex(index)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="tab-content" role="tabpanel">
        {/* Render the active panel — this is pre-rendered Server Component output */}
        {panels[activeIndex]}
      </div>
    </div>
  );
}

export function TabPanel({ children }) {
  return <div className="tab-panel">{children}</div>;
}`,
      explanation: "The Tabs component is a Client Component (needs useState for active tab tracking). The tab content (product description, specs table, reviews list) is all rendered on the server as Server Components and passed as children. The Client Component only manages which panel is visible — the content itself ships zero JavaScript. This is the ideal composition: interactive shell with server-rendered content. The product data, including database queries and complex rendering, happens entirely on the server. Only the tiny tab-switching logic runs on the client."
    },
    {
      title: "Create a Context Provider Pattern That Preserves Server Components",
      difficulty: "hard",
      description: "Build a theme context provider (Client Component) that wraps the entire app but still allows children to be Server Components. Demonstrate how to structure the layout so that the theme provider doesn't force the entire app into client-side rendering.",
      solution: `// app/_providers/ThemeProvider.js
"use client";

import { createContext, useContext, useState, useCallback } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children, initialTheme = 'light' }) {
  const [theme, setTheme] = useState(initialTheme);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
    // Optionally persist to cookie for SSR
    document.cookie = \`theme=\${theme === 'light' ? 'dark' : 'light'}; path=/; max-age=31536000\`;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div data-theme={theme} className={\`theme-\${theme}\`}>
        {/* children can be Server Components! */}
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}

// app/layout.js — Server Component!
// The layout itself remains a Server Component
import { ThemeProvider } from './_providers/ThemeProvider';
import { cookies } from 'next/headers';

export default async function RootLayout({ children }) {
  // Read theme preference from cookie on the server
  const cookieStore = await cookies();
  const savedTheme = cookieStore.get('theme')?.value || 'light';

  return (
    <html lang="en">
      <body>
        {/* ThemeProvider is Client, but children stay Server */}
        <ThemeProvider initialTheme={savedTheme}>
          <Header />
          {/* children (pages) are Server Components */}
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

// Server Component — not affected by ThemeProvider being a Client Component
async function Header() {
  const navItems = await db.navigation.findMany();

  return (
    <header>
      <nav>
        {navItems.map(item => (
          <a key={item.id} href={item.url}>{item.label}</a>
        ))}
      </nav>
      {/* Only the toggle button is a Client Component */}
      <ThemeToggle />
    </header>
  );
}

function Footer() {
  return <footer><p>2024 My App</p></footer>;
}

// app/_components/ThemeToggle.js
"use client";

import { useTheme } from '../_providers/ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} aria-label="Toggle theme">
      {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
    </button>
  );
}

// app/about/page.js — This is a Server Component despite being
// wrapped by ThemeProvider (a Client Component) in the layout!
export default async function AboutPage() {
  const team = await db.team.findMany();

  return (
    <section>
      <h1>About Us</h1>
      {team.map(member => (
        <div key={member.id}>
          <h3>{member.name}</h3>
          <p>{member.role}</p>
        </div>
      ))}
    </section>
  );
}`,
      explanation: "This demonstrates the critical pattern: a Client Component (ThemeProvider) wrapping the entire app while preserving Server Components as children. The layout.js is a Server Component that reads the initial theme from cookies (server-side). It passes this to ThemeProvider as initialTheme. The ThemeProvider is a Client Component with useState for theme toggling. Crucially, {children} passed to ThemeProvider is the page content — which remains a Server Component! This works because the children are rendered on the server before being passed to the Client Component. The ThemeToggle is a separate tiny Client Component that uses the context. The about page is a full Server Component with database access, despite being rendered inside ThemeProvider."
    },
    {
      title: "Build a Search Interface with Server and Client Boundary Optimization",
      difficulty: "hard",
      description: "Create a product search page where the search input and filters are Client Components, but the search results are Server Components that stream in. Use the URL search params pattern to keep results server-rendered while making the search interactive.",
      solution: `// app/search/page.js — Server Component
import { Suspense } from 'react';
import { SearchInput } from './_components/SearchInput';
import { FilterSidebar } from './_components/FilterSidebar';
import { ResultsSkeleton } from './_components/Skeletons';

export default function SearchPage({ searchParams }) {
  // searchParams makes this page dynamic (SSR per request)
  return (
    <div className="search-page">
      <aside className="search-filters">
        <FilterSidebar />
      </aside>
      <main className="search-main">
        <SearchInput />
        {/* Key forces re-mount when search changes, triggering new Suspense */}
        <Suspense
          key={JSON.stringify(searchParams)}
          fallback={<ResultsSkeleton />}
        >
          <SearchResults searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

// Server Component — fetches and renders results on the server
async function SearchResults({ searchParams }) {
  const params = await searchParams;
  const query = params.q || '';
  const category = params.category || '';
  const sort = params.sort || 'relevance';
  const page = parseInt(params.page || '1');

  if (!query) {
    return (
      <div className="empty-state">
        <p>Enter a search term to find products.</p>
      </div>
    );
  }

  const results = await fetch(
    \`https://api.example.com/search?\${new URLSearchParams({
      q: query,
      category,
      sort,
      page: String(page),
      limit: '20'
    })}\`,
    { cache: 'no-store' } // Always fresh search results
  ).then(r => r.json());

  if (results.items.length === 0) {
    return <p>No results found for "{query}".</p>;
  }

  return (
    <div>
      <p className="results-count">{results.total} results for "{query}"</p>
      <div className="results-grid">
        {results.items.map(product => (
          <a
            key={product.id}
            href={\`/products/\${product.id}\`}
            className="result-card"
          >
            <img src={product.image} alt={product.name} loading="lazy" />
            <h3>{product.name}</h3>
            <p className="price">\${product.price.toFixed(2)}</p>
            <p className="rating">
              {'*'.repeat(Math.round(product.rating))} ({product.reviewCount})
            </p>
          </a>
        ))}
      </div>

      {/* Server-rendered pagination */}
      <Pagination
        currentPage={page}
        totalPages={Math.ceil(results.total / 20)}
        baseUrl={\`/search?q=\${query}&category=\${category}&sort=\${sort}\`}
      />
    </div>
  );
}

function Pagination({ currentPage, totalPages, baseUrl }) {
  return (
    <nav className="pagination">
      {currentPage > 1 && (
        <a href={\`\${baseUrl}&page=\${currentPage - 1}\`}>Previous</a>
      )}
      {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(
        page => (
          <a
            key={page}
            href={\`\${baseUrl}&page=\${page}\`}
            className={page === currentPage ? 'active' : ''}
          >
            {page}
          </a>
        )
      )}
      {currentPage < totalPages && (
        <a href={\`\${baseUrl}&page=\${currentPage + 1}\`}>Next</a>
      )}
    </nav>
  );
}

// app/search/_components/SearchInput.js
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition, useEffect } from 'react';

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [isPending, startTransition] = useTransition();

  // Debounced search via URL params
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query) {
        startTransition(() => {
          const params = new URLSearchParams(searchParams.toString());
          params.set('q', query);
          params.delete('page'); // Reset to page 1
          router.push(\`/search?\${params.toString()}\`);
        });
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="search-input-wrapper">
      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search products..."
        className={isPending ? 'searching' : ''}
      />
      {isPending && <span className="spinner" />}
    </div>
  );
}

// app/search/_components/FilterSidebar.js
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

export function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateFilter(key, value) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete('page');
      router.push(\`/search?\${params.toString()}\`);
    });
  }

  return (
    <div className={isPending ? 'filters loading' : 'filters'}>
      <h3>Filters</h3>

      <div className="filter-group">
        <label>Category</label>
        <select
          value={searchParams.get('category') || ''}
          onChange={e => updateFilter('category', e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
          <option value="books">Books</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Sort By</label>
        <select
          value={searchParams.get('sort') || 'relevance'}
          onChange={e => updateFilter('sort', e.target.value)}
        >
          <option value="relevance">Relevance</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Rating</option>
        </select>
      </div>
    </div>
  );
}

// app/search/_components/Skeletons.js
export function ResultsSkeleton() {
  return (
    <div className="results-skeleton">
      <div className="skeleton-line" style={{ width: '30%' }} />
      <div className="results-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-image" />
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
          </div>
        ))}
      </div>
    </div>
  );
}`,
      explanation: "This demonstrates the URL-driven search pattern that optimizes the Server/Client boundary. The search input and filter sidebar are Client Components (they need useState for controlled inputs). But instead of fetching results client-side, they update the URL search params using router.push(). This triggers a server-side re-render where SearchResults (a Server Component) fetches fresh data from the API and streams in via the Suspense boundary. The results are fully server-rendered — no API calls from the client, no loading states managed in React state, and the search results contain zero JavaScript. The Suspense key={JSON.stringify(searchParams)} ensures a fresh loading state on each search. useTransition keeps the old results visible while new ones stream in. Pagination is also server-rendered using plain <a> tags, keeping it zero-JS."
    }
  ],
  quiz: [
    {
      question: "What happens when you add 'use client' to a component file?",
      options: [
        "The component only renders in the browser, never on the server",
        "The component is SSR'd for initial HTML AND its JavaScript is shipped to the client for hydration",
        "The component's data fetching moves from server to client",
        "The component becomes an API route"
      ],
      correct: 1,
      explanation: "'use client' means the component is included in the client JavaScript bundle for hydration and interactivity. It is still server-rendered (SSR'd) for the initial HTML. The common misconception is that 'use client' skips SSR — it doesn't. It adds client-side JavaScript ON TOP of the server render."
    },
    {
      question: "Can you import a Server Component directly inside a Client Component?",
      options: [
        "Yes, it works the same as any import",
        "Yes, but only if the Server Component doesn't fetch data",
        "No, but you can pass Server Components as children from a parent Server Component",
        "No, and there is no workaround"
      ],
      correct: 2,
      explanation: "You cannot import a Server Component in a Client Component because the Client Component's module graph is included in the client bundle, and Server Components contain server-only code. The solution is the children pattern: a parent Server Component renders both the Client Component and the Server Component, passing the latter as children to the former. The Server Component is resolved on the server, and only its output crosses the boundary."
    },
    {
      question: "Which of these CANNOT be passed as a prop from a Server Component to a Client Component?",
      options: [
        "An array of strings",
        "A callback function",
        "A JSX element (React element)",
        "A Date object"
      ],
      correct: 1,
      explanation: "Functions cannot be serialized across the Server/Client boundary. The RSC payload uses a JSON-like format that supports primitives, arrays, objects, Dates, Maps, Sets, and React elements — but NOT functions. Event handlers and callbacks must be defined within the Client Component itself."
    },
    {
      question: "Where should you place the 'use client' directive for optimal bundle size?",
      options: [
        "At the top of page.js to make the whole page interactive",
        "At the top of layout.js to enable hooks everywhere",
        "On the smallest leaf components that actually need interactivity",
        "On a barrel file that exports all client components"
      ],
      correct: 2,
      explanation: "Place 'use client' as low in the component tree as possible — on the leaf components that actually need hooks, event handlers, or browser APIs. Placing it on page.js or layout.js pulls the entire subtree into the client bundle, defeating Server Components. A barrel file with 'use client' is especially bad because it includes ALL exported components in the client bundle."
    },
    {
      question: "How do you use a third-party library like Recharts that doesn't have 'use client' in its source?",
      options: [
        "You can't — it won't work in the App Router",
        "Add 'use client' to your node_modules copy of the library",
        "Create a thin wrapper file with 'use client' that re-exports the library components",
        "Use the library only in Server Components since it has no directive"
      ],
      correct: 2,
      explanation: "Create a wrapper file with 'use client' that imports and re-exports the library's components. For example: create ChartWrapper.js with 'use client' at the top, then import { LineChart } from 'recharts' and export it. This tells the bundler to include the library in the client bundle. You can then import from your wrapper file in Server Components."
    }
  ]
};
