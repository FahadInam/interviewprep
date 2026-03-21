export const frontendArchitecture = {
  id: "frontend-architecture",
  title: "Frontend Architecture",
  icon: "🏗️",
  tag: "System Design",
  tagColor: "var(--tag-system)",
  subtitle: "Scalable patterns, module boundaries, and architectural decisions for large frontend applications",
  concepts: [
    {
      title: "Scalable Folder Structures",
      explanations: {
        layman: "Think of your codebase like a bookshelf. One approach is organizing books by type: all hardcovers together, all paperbacks together, all audiobooks together. Need a sci-fi book? Good luck — it could be on any shelf. The other approach is organizing by topic: all sci-fi together, all history together. Now everything about one subject lives in the same spot. That is the difference between layer-based folders (components/, hooks/, utils/) and feature-based folders (auth/, dashboard/, checkout/). As your project grows, feature-based wins because adding a new feature means creating one folder, not hunting through five.",
        mid: "Layer-based structures (components/, hooks/, utils/, services/) group by technical role, while feature-based structures (auth/, dashboard/, settings/) group by domain. Feature-based scales better because adding a feature means creating one folder rather than touching many. A hybrid approach often works best: shared utilities in a common layer, but feature-specific code co-located. The key metric is 'change locality' — how many folders you touch for a single feature change.",
        senior: "At scale, folder structure is a proxy for module boundaries and team ownership. Feature-based slicing aligns with vertical team ownership (team owns auth/, team owns checkout/) enabling autonomous deployments. The 'screaming architecture' principle says your folder structure should scream the domain, not the framework. In large codebases, enforce boundaries via eslint-plugin-boundaries or dependency-cruiser to prevent cross-feature imports that create hidden coupling. Consider the Fractal pattern where each feature mirrors the app structure internally. The real decision isn't flat vs nested — it's about defining clear public APIs (barrel exports) for each module so refactoring internals doesn't ripple outward."
      },
      realWorld: "A fintech dashboard with 50+ features uses feature-based folders. Each feature (accounts/, transactions/, analytics/) has its own components, hooks, utils, and tests. Shared design system components live in a separate shared/ directory. Teams own entire feature folders and can ship independently.",
      whenToUse: "Use feature-based for any project with more than 5-6 distinct features or multiple contributing teams. Use layer-based only for very small projects or shared libraries where the 'feature' is the library itself.",
      whenNotToUse: "Don't force feature-based on a tiny prototype or a library that has a single concern. Layer-based is fine when your entire app IS one feature.",
      pitfalls: "Circular dependencies between feature folders indicate poor boundary design. Barrel files (index.js) can accidentally re-export internals. Over-nesting creates deep paths that hurt DX. Not enforcing boundaries with tooling means they erode over time.",
      codeExamples: [
        {
          title: "Feature-Based Folder Structure",
          code: `// Feature-based structure
// src/
//   features/
//     auth/
//       components/
//         LoginForm.jsx
//         SignupForm.jsx
//       hooks/
//         useAuth.js
//         useSession.js
//       services/
//         authApi.js
//       utils/
//         tokenHelpers.js
//       auth.test.js
//       index.js        <-- public API barrel
//     dashboard/
//       components/
//       hooks/
//       index.js
//   shared/
//     components/
//       Button.jsx
//       Modal.jsx
//     hooks/
//       useDebounce.js
//     utils/
//       formatDate.js

// auth/index.js — Public API
export { LoginForm } from './components/LoginForm';
export { useAuth } from './hooks/useAuth';
export { useSession } from './hooks/useSession';
// Internal details are NOT exported`
        },
        {
          title: "Enforcing Boundaries with ESLint",
          code: `// .eslintrc.js — using eslint-plugin-boundaries
module.exports = {
  plugins: ['boundaries'],
  settings: {
    'boundaries/elements': [
      { type: 'shared', pattern: 'src/shared/*' },
      { type: 'feature', pattern: 'src/features/*' },
      { type: 'app', pattern: 'src/app/*' },
    ],
  },
  rules: {
    'boundaries/element-types': [2, {
      default: 'disallow',
      rules: [
        // Features can import from shared, not from other features
        { from: 'feature', allow: ['shared'] },
        // App layer can import from features and shared
        { from: 'app', allow: ['feature', 'shared'] },
        // Shared cannot import from features
        { from: 'shared', allow: ['shared'] },
      ],
    }],
  },
};`
        }
      ]
    },
    {
      title: "Module Boundaries and Dependency Management",
      explanations: {
        layman: "Imagine departments in a company. Marketing shouldn't reach directly into Engineering's filing cabinet — they should go through a defined contact point. Module boundaries work the same way: each part of your code has a 'front desk' (public API) and 'internal offices' (private implementation). This prevents chaos when one department reorganizes — others only interact through the front desk, so they're unaffected.",
        mid: "Module boundaries define what a module exposes (public API via index.js/barrel files) versus what stays internal. Good boundaries mean you can refactor a module's internals without breaking consumers. Dependency direction should flow one way: app -> features -> shared, never backwards. Use static analysis tools like dependency-cruiser to visualize and enforce the dependency graph. Circular dependencies are a code smell indicating modules are too tightly coupled.",
        senior: "In production-scale apps, module boundaries are the single most important architectural decision for long-term maintainability. They enable: independent deployability (each module can be tested/deployed alone), team autonomy (teams own modules end-to-end), and safe refactoring (internals can change freely). Enforce boundaries at multiple levels: TypeScript path aliases to control import paths, ESLint rules to prevent cross-boundary imports, and CI checks via dependency-cruiser that fail the build on violations. The Dependency Inversion Principle applies here — high-level features should depend on abstractions (interfaces/types) not concrete implementations of other features. Consider the Ports and Adapters pattern where your domain logic has no knowledge of infrastructure concerns."
      },
      realWorld: "A large e-commerce platform enforces that the 'cart' feature cannot directly import from the 'product-catalog' feature. Instead, they communicate through a shared event bus or well-defined TypeScript interfaces. This allowed the team to completely rewrite the product catalog from REST to GraphQL without touching the cart code.",
      whenToUse: "Always establish module boundaries when your project has more than one team contributing or more than 10k lines of code. Even on smaller projects, clear boundaries prevent future headaches.",
      whenNotToUse: "Very early prototypes where speed matters more than structure. But plan to introduce boundaries before the first major refactor.",
      pitfalls: "Barrel files that re-export everything defeat the purpose — be intentional about public APIs. TypeScript path aliases without enforcement become suggestions, not rules. Shared modules that grow unbounded become a dumping ground — have clear criteria for what belongs in shared.",
      codeExamples: [
        {
          title: "Dependency Inversion Between Features",
          code: `// shared/types/cart.ts — Abstraction both features depend on
export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface ProductInfo {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

// features/product-catalog/hooks/useProductLookup.js
// Exposes product data through a shared interface
export function useProductLookup() {
  const cache = new Map();

  async function getProduct(productId) {
    if (cache.has(productId)) return cache.get(productId);
    const res = await fetch(\`/api/products/\${productId}\`);
    const product = await res.json();
    // Returns shape matching the shared ProductInfo interface
    const info = {
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.images[0]?.url
    };
    cache.set(productId, info);
    return info;
  }

  return { getProduct };
}

// features/cart/hooks/useCart.js
// Depends on the ProductInfo abstraction, NOT on product-catalog internals
import { useCallback, useState } from 'react';

export function useCart(productLookup) {
  const [items, setItems] = useState([]);

  const addItem = useCallback(async (productId, quantity) => {
    const product = await productLookup.getProduct(productId);
    setItems(prev => [
      ...prev,
      { productId, quantity, price: product.price }
    ]);
  }, [productLookup]);

  return { items, addItem };
}`
        }
      ]
    },
    {
      title: "Monorepo Patterns",
      explanations: {
        layman: "A monorepo is like one big apartment building instead of separate houses. Everyone shares the same address (repository), utilities (build tools), and lobby (CI/CD), but each apartment (package) is independent inside. The building manager (Turborepo/Nx) makes sure that when you renovate one apartment, you only rebuild what's affected — not the whole building. The alternative, polyrepo, is like separate houses — fully independent but you need separate maintenance contracts for each.",
        mid: "A monorepo houses multiple packages/apps in one repository with shared tooling. Tools like Turborepo, Nx, and Lerna manage builds, dependencies, and caching. Key benefits: atomic cross-package changes, shared CI, consistent tooling. Turborepo uses content-based hashing and remote caching — if a package hasn't changed, its build is skipped. Workspace protocols (npm/yarn/pnpm workspaces) handle internal linking. The dependency graph determines build order. Nx adds dependency graph visualization and affected-command support to rebuild only changed packages and their dependents.",
        senior: "Monorepo adoption is a team topology decision as much as a technical one. It works when teams share significant code (design system, utilities, types) and need atomic cross-cutting changes. The critical infrastructure pieces are: 1) Incremental builds with remote caching (Turborepo's remote cache or Nx Cloud) to keep CI fast even as the repo grows. 2) Affected analysis to test only changed packages plus their dependents. 3) CODEOWNERS for governance — team A owns packages/design-system, team B owns apps/dashboard. 4) Versioning strategy — fixed (all packages same version) vs independent (each package versioned separately via Changesets). Avoid monorepo if teams are truly independent with no shared code, or if your CI infra can't handle the repo size. At extreme scale (1000+ packages), consider virtual monorepos or code-splitting across repos with a shared registry."
      },
      realWorld: "Vercel's open-source projects use Turborepo. A company might have packages/ui (design system), packages/utils (shared helpers), apps/web (main app), apps/docs (documentation site). Changing a Button component in packages/ui triggers rebuilds of apps/web and apps/docs but not packages/utils.",
      whenToUse: "When multiple packages share significant code, when you need atomic cross-package changes, when teams want consistent tooling, or when a design system needs to be developed alongside the apps consuming it.",
      whenNotToUse: "When teams are fully independent with no shared code. When your CI pipeline cannot handle the build complexity. When packages have vastly different release cycles and audiences (e.g., a CLI tool and a web app with no shared code).",
      pitfalls: "Without remote caching, CI times grow linearly with package count. Poorly defined package boundaries lead to a 'distributed monolith' — all the downsides of both approaches. Version management across packages is complex — use Changesets for independent versioning. Not all tools play well with monorepos (some test runners, deploy platforms).",
      codeExamples: [
        {
          title: "Turborepo Configuration",
          code: `// turbo.json — Turborepo pipeline configuration
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"],
      "cache": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": [],
      "cache": true
    },
    "lint": {
      "outputs": [],
      "cache": true
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}

// package.json — Root workspace config (pnpm)
// {
//   "private": true,
//   "scripts": {
//     "build": "turbo run build",
//     "dev": "turbo run dev",
//     "test": "turbo run test",
//     "lint": "turbo run lint"
//   },
//   "devDependencies": {
//     "turbo": "^1.10.0"
//   }
// }

// pnpm-workspace.yaml
// packages:
//   - "apps/*"
//   - "packages/*"`
        }
      ]
    },
    {
      title: "Micro-Frontend Architecture",
      explanations: {
        layman: "Imagine a shopping mall. Each store (micro-frontend) is independently owned and operated — they choose their own decor, staff, and inventory. But from the customer's perspective, it's one seamless mall experience. The mall management (shell application) provides shared infrastructure: hallways, parking, HVAC. If one store renovates, the others keep running. Similarly, micro-frontends let different teams build and deploy parts of a web app independently, while users see one unified application.",
        mid: "Micro-frontends decompose a frontend monolith into independently deployable units, each owned by a team. Webpack Module Federation is the most popular approach — it allows separate builds to share modules at runtime. The shell app loads remote entries dynamically. Other approaches include iframes (strong isolation, poor UX), Web Components (good encapsulation, limited framework support), and server-side composition (Edge Side Includes, Tailor). Shared dependencies (React, design system) are declared as singletons to avoid duplication. Communication between micro-frontends happens through custom events, a shared event bus, or URL-based state.",
        senior: "Micro-frontends solve organizational scaling, not technical scaling. They're justified when: multiple autonomous teams own distinct product domains, teams need independent deployment cadences, or you're migrating from a legacy frontend incrementally. The critical architectural decisions are: 1) Composition strategy — build-time (npm packages, simpler but coupled deploys) vs runtime (Module Federation, truly independent but complex). 2) Shared dependency management — singleton React to avoid multiple instances, but version skew between micro-frontends becomes a real problem. 3) Cross-cutting concerns — authentication, routing, error monitoring, analytics must be handled by the shell or a shared library. 4) Performance — each micro-frontend adds JavaScript overhead; lazy-load aggressively and share vendor bundles. 5) Testing — integration testing across micro-frontends requires contract tests or E2E tests against the composed app. Avoid micro-frontends for small teams or simple apps — the operational complexity (separate CI/CD per MFE, shared dependency management, cross-MFE debugging) is substantial."
      },
      realWorld: "IKEA's website uses micro-frontends where different teams own different sections (product listing, checkout, customer service). Spotify's desktop app historically used iframes for team isolation. Module Federation allows a dashboard shell to dynamically load a 'reports' micro-frontend at runtime without rebuilding the shell.",
      whenToUse: "When you have 3+ autonomous teams each owning a distinct product area. When independent deployment is critical (team A ships without waiting for team B). When incrementally migrating a legacy frontend. When different parts of the app have vastly different tech requirements.",
      whenNotToUse: "When you have a single small team. When the app is simple enough for a monolith. When you don't have the DevOps maturity to manage multiple deployment pipelines. When performance is the top priority and you can't afford the overhead.",
      pitfalls: "Shared state management across micro-frontends becomes a distributed systems problem. CSS conflicts between micro-frontends require strict scoping (CSS Modules, Shadow DOM). Bundle size bloats if shared dependencies aren't properly configured as singletons. User experience suffers if micro-frontends have inconsistent design/behavior. Debugging production issues across micro-frontend boundaries is significantly harder.",
      codeExamples: [
        {
          title: "Webpack Module Federation Setup",
          code: `// Shell App — webpack.config.js
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        // Load remote micro-frontends at runtime
        dashboard: 'dashboard@http://localhost:3001/remoteEntry.js',
        settings: 'settings@http://localhost:3002/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
      },
    }),
  ],
};

// Shell App — App.jsx (lazy-loads micro-frontends)
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ShellHeader from './components/ShellHeader';
import LoadingFallback from './components/LoadingFallback';
import ErrorBoundary from './components/ErrorBoundary';

const DashboardApp = lazy(() => import('dashboard/App'));
const SettingsApp = lazy(() => import('settings/App'));

export default function App() {
  return (
    <BrowserRouter>
      <ShellHeader />
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/dashboard/*" element={<DashboardApp />} />
            <Route path="/settings/*" element={<SettingsApp />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

// Remote App (Dashboard) — webpack.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'dashboard',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
      },
    }),
  ],
};`
        }
      ]
    },
    {
      title: "State Management Architecture",
      explanations: {
        layman: "Think of state management like managing information in a restaurant. The waiter's notepad (local state) tracks one table's order — simple, no need to broadcast it. The kitchen display (global state) shows all active orders so every cook can see them. The reservation system (server state) lives on the computer and needs to be fetched, can go stale, and multiple staff might update it simultaneously. Choosing the wrong tool for the job — like announcing every single table's water refill over the intercom (putting everything in global state) — creates unnecessary chaos.",
        mid: "State has three distinct categories: 1) Local/UI state (form inputs, toggles, modals) — use useState/useReducer, keep it in the component. 2) Global/client state (theme, user preferences, shopping cart) — use Context, Zustand, Redux, or Jotai. 3) Server/async state (API data, cached responses) — use React Query/TanStack Query or SWR, which handle caching, refetching, and synchronization. The biggest architectural mistake is putting server state in Redux — you end up reimplementing caching, loading states, and synchronization that React Query provides out of the box. A modern stack uses React Query for server state and a lightweight store (Zustand/Jotai) for the small amount of truly global client state.",
        senior: "State architecture decisions cascade through your entire application. At scale, the key principles are: 1) Colocation — state lives as close to where it's used as possible. Lifting state should be a deliberate, lazy decision. 2) Single source of truth — server state's source of truth is the server; don't copy it into client stores. React Query's cache IS your store for server data. 3) Derivation over synchronization — compute derived state (filtered lists, totals) rather than storing it separately, which avoids sync bugs. 4) Minimal global state — in a well-architected app with React Query, your global client state is surprisingly small (theme, auth token, maybe UI preferences). 5) State machines for complex flows — use XState for multi-step processes (checkout, onboarding) where state transitions must be explicit and predictable. The performance dimension matters too: atomic state (Jotai/Recoil) causes granular re-renders while store-based (Redux/Zustand) requires selector optimization. For very large apps, consider state slicing — splitting your store into domain-specific slices with independent selectors."
      },
      realWorld: "An e-commerce app uses React Query for all product/order data (server state), Zustand for cart state (client-global), and local useState for form inputs and UI toggles. The cart is persisted to localStorage via Zustand middleware. Complex checkout flow uses XState to model states: idle -> shipping -> payment -> confirmation, preventing invalid transitions like going from idle directly to payment.",
      whenToUse: "Always categorize your state before choosing tools. Use React Query for any data that comes from a server. Use lightweight global stores (Zustand) when multiple unrelated components need the same client data. Use local state for everything else — which should be the majority.",
      whenNotToUse: "Don't use Redux for small apps where Context + React Query covers everything. Don't use global state for form data that's only relevant to one component tree. Don't use React Query for purely client-side data that has no server equivalent.",
      pitfalls: "Putting everything in global state causes unnecessary re-renders and makes components hard to test. Storing server responses in Redux means you're manually managing loading/error/stale states that React Query handles automatically. Using Context for frequently-changing values (like a timer or animation frame) causes the entire consumer tree to re-render. Over-engineering state architecture for a simple CRUD app wastes time.",
      codeExamples: [
        {
          title: "Modern State Architecture Pattern",
          code: `// Server state — React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function useProducts(filters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Global client state — Zustand (minimal)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, qty) =>
        set((state) => ({
          items: [...state.items, { ...product, qty }],
        })),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== productId),
        })),
      total: () =>
        get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
    }),
    { name: 'cart-storage' }
  )
);

// Local state — useState (component-scoped)
function ProductFilter({ onFilterChange }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  // Derived state — computed, not stored
  const hasActiveFilters = search !== '' || category !== 'all';

  return (
    <div>
      <input value={search} onChange={(e) => setSearch(e.target.value)} />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="all">All</option>
        <option value="electronics">Electronics</option>
      </select>
      {hasActiveFilters && <button onClick={() => { setSearch(''); setCategory('all'); }}>Clear</button>}
    </div>
  );
}`
        }
      ]
    },
    {
      title: "Design Patterns in Frontend",
      explanations: {
        layman: "Design patterns are like cooking recipes for code. The Observer pattern is like a newspaper subscription — you sign up once, and new editions arrive automatically without you checking every day. The Strategy pattern is like choosing a payment method at checkout — the process is the same, but the payment 'strategy' (credit card, PayPal, crypto) is interchangeable. The Facade pattern is like a hotel concierge — instead of you calling restaurants, taxis, and theaters separately, the concierge provides one simple interface to many complex services.",
        mid: "Common frontend patterns: 1) Observer — event emitters, pub/sub for decoupled communication between modules (React's useEffect subscribing to stores). 2) Strategy — swappable algorithms behind a common interface (different validation strategies, different API adapters). 3) Facade — simplify complex subsystems (an API layer that wraps fetch, adds auth, handles errors, transforms data). 4) Factory — create objects without specifying exact classes (component factories that return different components based on config). 5) Adapter — convert one interface to another (wrapping a third-party API response to match your internal types). These patterns emerge naturally in well-structured code; the key is recognizing when you're solving a problem that a pattern already addresses.",
        senior: "In production frontend code, patterns manifest differently than in textbook OOP. The Observer pattern underpins all reactive state management — Redux subscribers, RxJS observables, and even React's re-render cycle are all Observer implementations. The Strategy pattern is essential for configurable systems: different rendering strategies (SSR/CSR/SSG), different storage strategies (localStorage/sessionStorage/IndexedDB), different analytics providers — all behind a common interface enabling zero-disruption swaps. The Facade pattern is arguably the most impactful — your API layer should be a Facade over HTTP, auth, caching, error handling, and retry logic. The Mediator pattern (exemplified by a central event bus or Redux middleware) prevents direct coupling between features. The key senior insight is that patterns are tools for managing change — they create seams in your code where modifications can be made without cascading effects. Over-applying patterns is as harmful as ignoring them; apply them at boundaries (API layer, feature interfaces, plugin systems) not within simple components."
      },
      realWorld: "A multi-tenant SaaS uses the Strategy pattern for theming — each tenant has a ThemeStrategy that the rendering engine uses, enabling completely different visual experiences with no code branching. The Facade pattern wraps their API client, hiding retry logic, token refresh, request queuing, and error normalization behind simple method calls like api.users.getById(id).",
      whenToUse: "Observer: when you need loose coupling between producers and consumers of events. Strategy: when an algorithm should be interchangeable without modifying the consuming code. Facade: always wrap complex third-party integrations and infrastructure. Factory: when component/object creation depends on runtime configuration.",
      whenNotToUse: "Don't create elaborate Observer systems when simple prop passing or Context works. Don't add Strategy abstraction for something with only one implementation and no foreseeable variants. Don't over-abstract with Facades when the underlying API is already simple.",
      pitfalls: "Observer: memory leaks from forgotten unsubscribes. Strategy: premature abstraction — don't create an interface for one implementation. Facade: hiding too much makes debugging hard; provide escape hatches. Factory: over-engineering simple conditional rendering with a Factory class.",
      codeExamples: [
        {
          title: "Facade Pattern for API Layer",
          code: `// A Facade wrapping complex API interactions
class ApiFacade {
  constructor(baseUrl, authProvider) {
    this.baseUrl = baseUrl;
    this.authProvider = authProvider;
    this.retryCount = 3;
  }

  async request(method, path, data, options = {}) {
    const url = \`\${this.baseUrl}\${path}\`;
    let lastError;

    for (let attempt = 0; attempt <= this.retryCount; attempt++) {
      try {
        const token = await this.authProvider.getToken();
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${token}\`,
            ...options.headers,
          },
          body: data ? JSON.stringify(data) : undefined,
          signal: options.signal,
        });

        if (response.status === 401) {
          await this.authProvider.refreshToken();
          continue; // retry with new token
        }

        if (!response.ok) {
          throw new ApiError(response.status, await response.text());
        }

        return await response.json();
      } catch (error) {
        lastError = error;
        if (attempt < this.retryCount && this.isRetryable(error)) {
          await this.delay(Math.pow(2, attempt) * 1000);
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  }

  isRetryable(error) {
    return error instanceof TypeError || // network error
           (error instanceof ApiError && error.status >= 500);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Clean, simple public API
  get(path, options) { return this.request('GET', path, null, options); }
  post(path, data, options) { return this.request('POST', path, data, options); }
  put(path, data, options) { return this.request('PUT', path, data, options); }
  delete(path, options) { return this.request('DELETE', path, null, options); }
}

// Usage — consumers see a simple interface
const api = new ApiFacade('https://api.example.com', authProvider);
const users = await api.get('/users');
await api.post('/users', { name: 'Alice', role: 'admin' });`
        },
        {
          title: "Strategy Pattern for Storage",
          code: `// Strategy interface — each strategy has the same methods
const localStorageStrategy = {
  get(key) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key) {
    localStorage.removeItem(key);
  },
};

const sessionStorageStrategy = {
  get(key) {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  set(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
  },
  remove(key) {
    sessionStorage.removeItem(key);
  },
};

const memoryStorageStrategy = (() => {
  const store = new Map();
  return {
    get(key) { return store.get(key) ?? null; },
    set(key, value) { store.set(key, value); },
    remove(key) { store.delete(key); },
  };
})();

// Context that uses a strategy
class StorageManager {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  save(key, data) { this.strategy.set(key, data); }
  load(key) { return this.strategy.get(key); }
  clear(key) { this.strategy.remove(key); }
}

// Swap strategies at runtime based on environment
const storage = new StorageManager(
  typeof window !== 'undefined'
    ? localStorageStrategy
    : memoryStorageStrategy
);`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "How would you structure a frontend project for a team of 15 developers working on an e-commerce platform?",
      answer: "Feature-based folder structure, aligned with team ownership. Each team owns a folder (product-catalog/, checkout/, user-account/) that is self-contained: its own components, hooks, services, and tests. Each folder exposes only a public API via an index.js barrel file, so other teams import from the 'front desk,' not the internals. Shared code (design system components, utility hooks, TypeScript types) goes in a separate shared/ directory. I would enforce these boundaries with eslint-plugin-boundaries so cross-feature imports fail the linter. For state management: React Query for server data, Zustand for minimal global client state, and local useState for everything else. If teams share heavy infrastructure like a design system or API types, I would use a monorepo with Turborepo for caching and parallel builds. Each feature gets its own CI checks so teams can ship independently.",
      difficulty: "hard",
      followUps: [
        "How would you handle shared types between features?",
        "What happens when a feature grows too large — how do you split it?",
        "How would you handle cross-feature navigation and deep linking?"
      ]
    },
    {
      question: "When would you choose a monorepo over a polyrepo for frontend projects?",
      answer: "Choose a monorepo when: 1) Multiple packages share significant code (e.g., a design system used by 3 apps). 2) You need atomic changes across packages (updating a shared component and all consumers in one PR). 3) You want consistent tooling, linting, and testing across projects. 4) Teams collaborate frequently and cross-cutting refactors are common. Choose polyrepo when: teams are fully independent, packages have no shared code, different packages need vastly different CI/CD pipelines, or the org lacks DevOps maturity for monorepo tooling. The key question is 'how often do changes span multiple packages?' — if frequently, monorepo. If rarely, polyrepo.",
      difficulty: "mid",
      followUps: [
        "How do you keep CI fast in a monorepo with 50+ packages?",
        "How do you handle versioning in a monorepo?",
        "What's the difference between Turborepo and Nx?"
      ]
    },
    {
      question: "Explain the tradeoffs of micro-frontend architecture.",
      answer: "Benefits: 1) Team autonomy — each team owns, builds, and deploys their micro-frontend independently. 2) Technology flexibility — different MFEs can use different frameworks (though this is often more theoretical than practical). 3) Incremental migration — replace a legacy app piece by piece. 4) Independent scaling — heavily trafficked MFEs can be optimized independently. Tradeoffs: 1) Performance overhead — each MFE adds bundle size, and shared dependencies need careful singleton management. 2) Operational complexity — separate CI/CD pipelines, deployment coordination, monitoring per MFE. 3) UX consistency — harder to maintain consistent design across independently deployed MFEs. 4) Cross-MFE communication — requires explicit patterns (custom events, URL state) adding complexity. 5) Debugging — distributed tracing across MFE boundaries is harder. Rule of thumb: don't adopt micro-frontends until your team structure demands it.",
      difficulty: "hard",
      followUps: [
        "How does Module Federation handle shared dependencies?",
        "How would you handle authentication across micro-frontends?",
        "What testing strategy would you use?"
      ]
    },
    {
      question: "What's the difference between local state, global state, and server state? How do you decide where data belongs?",
      answer: "Local state is component-scoped (form inputs, modal open/close, UI toggles) — managed via useState/useReducer. Global state is shared across unrelated component trees (theme, auth, cart) — managed via Zustand, Redux, or Context. Server state is data originating from the server (user profiles, product lists, orders) — managed via React Query/SWR. The decision framework: 1) Does it come from the server? Use React Query — it handles caching, refetching, loading/error states. 2) Do multiple unrelated components need it? Use global state, but only for truly global client-side data. 3) Everything else is local state. The common mistake is putting server data in Redux and manually managing isLoading, error, and cache invalidation — React Query does this automatically and better.",
      difficulty: "mid",
      followUps: [
        "How would you handle data that's both server and client state, like a shopping cart?",
        "When would you choose Zustand over Redux?",
        "How does React Query's staleTime differ from cacheTime?"
      ]
    },
    {
      question: "Describe a Facade pattern implementation in a real frontend project.",
      answer: "A Facade pattern wraps complex subsystems behind a simple interface. In frontend, the most common application is an API layer that facades over HTTP, authentication, caching, error handling, and retry logic. Instead of every component calling fetch() with headers, error handling, and retry logic, you create an API service: api.users.getById(id) that internally handles auth token injection, request/response transformation, retries with exponential backoff, error normalization, and request deduplication. Another example is a Facade over browser APIs: a StorageFacade that abstracts localStorage, sessionStorage, and IndexedDB behind a common interface with serialization, quota management, and fallbacks. The key benefit is that changing the underlying implementation (switching from fetch to axios, or from REST to GraphQL) affects only the Facade, not the 200 components using it.",
      difficulty: "mid",
      followUps: [
        "How do you provide escape hatches when the Facade hides too much?",
        "How would you test components that use the Facade?",
        "When does a Facade become an anti-pattern?"
      ]
    },
    {
      question: "How would you enforce architectural boundaries in a large frontend codebase?",
      answer: "Multiple layers of enforcement: 1) Convention — feature-based folder structure with barrel exports (index.js) defining public APIs. 2) Static analysis — eslint-plugin-boundaries or dependency-cruiser to fail the build on boundary violations (e.g., feature A importing feature B's internals). 3) TypeScript — path aliases to control import paths, making invalid imports impossible or ugly. 4) Code review — CODEOWNERS file ensuring changes to shared code are reviewed by the platform team. 5) CI checks — dependency-cruiser generates a dependency graph and asserts rules (no circular deps, layered architecture). 6) Architecture Decision Records (ADRs) documenting why boundaries exist. The most common enforcement failure is relying solely on convention — without automated checks, boundaries erode within months.",
      difficulty: "hard",
      followUps: [
        "What do you do when a legitimate use case requires crossing a boundary?",
        "How do you handle gradual migration when introducing boundaries to an existing codebase?",
        "How do barrel files interact with tree shaking?"
      ]
    },
    {
      question: "What is the Observer pattern and where does it appear in modern frontend development?",
      answer: "The Observer pattern defines a one-to-many dependency where when one object (subject) changes state, all dependents (observers) are notified automatically. In frontend, it's everywhere: 1) React's useState and re-rendering — setting state notifies React to re-render observer components. 2) Redux/Zustand store subscriptions — components subscribe to store slices and re-render on changes. 3) DOM EventListeners — addEventListener is literally subscribe/observe. 4) IntersectionObserver, MutationObserver, ResizeObserver — browser APIs using the pattern. 5) RxJS Observables — reactive streams for complex async flows. 6) Custom event emitters for cross-module communication. The pattern's power is decoupling — the subject doesn't know about its observers, enabling flexible composition. The key pitfall is forgetting to unsubscribe, causing memory leaks.",
      difficulty: "easy",
      followUps: [
        "How do you prevent memory leaks with the Observer pattern in React?",
        "What's the difference between push-based and pull-based observation?",
        "How does React Query use the Observer pattern internally?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Implement a Simple Event Emitter (Observer Pattern)",
      difficulty: "mid",
      description: "Create an EventEmitter class that supports on(event, callback), off(event, callback), emit(event, ...args), and once(event, callback). It should handle multiple listeners per event and properly clean up once-listeners after they fire.",
      solution: `class EventEmitter {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  off(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emit(event, ...args) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      // Iterate over a copy so removals during emit are safe
      for (const callback of [...callbacks]) {
        callback(...args);
      }
    }
  }

  once(event, callback) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      callback(...args);
    };
    return this.on(event, wrapper);
  }
}

// Usage
const emitter = new EventEmitter();
const unsub = emitter.on('data', (payload) => console.log('Received:', payload));
emitter.once('data', (payload) => console.log('Once:', payload));
emitter.emit('data', { id: 1 }); // Both fire
emitter.emit('data', { id: 2 }); // Only 'on' fires
unsub(); // Unsubscribe
emitter.emit('data', { id: 3 }); // Nothing fires`,
      explanation: "Uses a Map of Sets for O(1) add/remove of listeners. The once() method wraps the callback to auto-remove after first invocation. The on() method returns an unsubscribe function for convenient cleanup. Iterating over a copy of callbacks during emit() prevents issues when a listener removes itself during emission."
    },
    {
      title: "Build a Feature Module Registry",
      difficulty: "hard",
      description: "Create a ModuleRegistry that supports registering feature modules with dependencies, lazy loading, and initialization in dependency order. Each module has a name, dependencies (array of other module names), and an async init() function.",
      solution: `class ModuleRegistry {
  constructor() {
    this.modules = new Map();
    this.initialized = new Set();
    this.initializing = new Set();
  }

  register(name, config) {
    if (this.modules.has(name)) {
      throw new Error(\`Module "\${name}" is already registered\`);
    }
    this.modules.set(name, {
      name,
      dependencies: config.dependencies || [],
      init: config.init,
      instance: null,
    });
  }

  async initialize(name) {
    if (this.initialized.has(name)) {
      return this.modules.get(name).instance;
    }

    if (this.initializing.has(name)) {
      throw new Error(\`Circular dependency detected: "\${name}" is already being initialized\`);
    }

    const mod = this.modules.get(name);
    if (!mod) {
      throw new Error(\`Module "\${name}" is not registered\`);
    }

    this.initializing.add(name);

    // Initialize dependencies first (topological order)
    const depInstances = {};
    for (const dep of mod.dependencies) {
      depInstances[dep] = await this.initialize(dep);
    }

    // Initialize this module with resolved dependencies
    mod.instance = await mod.init(depInstances);
    this.initializing.delete(name);
    this.initialized.add(name);

    return mod.instance;
  }

  async initializeAll() {
    const results = {};
    for (const [name] of this.modules) {
      results[name] = await this.initialize(name);
    }
    return results;
  }

  getModule(name) {
    const mod = this.modules.get(name);
    if (!mod || !this.initialized.has(name)) {
      throw new Error(\`Module "\${name}" is not initialized\`);
    }
    return mod.instance;
  }
}

// Usage
const registry = new ModuleRegistry();

registry.register('logger', {
  dependencies: [],
  init: async () => ({
    log: (msg) => console.log(\`[LOG] \${msg}\`),
  }),
});

registry.register('auth', {
  dependencies: ['logger'],
  init: async ({ logger }) => {
    logger.log('Auth module initializing...');
    return {
      getToken: () => 'mock-token',
      isAuthenticated: () => true,
    };
  },
});

registry.register('api', {
  dependencies: ['auth', 'logger'],
  init: async ({ auth, logger }) => {
    logger.log('API module initializing...');
    return {
      fetch: async (url) => {
        const token = auth.getToken();
        logger.log(\`Fetching \${url} with token\`);
        return { data: 'mock' };
      },
    };
  },
});

await registry.initializeAll();
const api = registry.getModule('api');
await api.fetch('/users');`,
      explanation: "This implements a dependency injection container for frontend modules. The initialize() method performs a recursive topological sort by initializing dependencies before the module itself. Circular dependency detection uses an 'initializing' set — if we encounter a module that's currently in the init chain, it's circular. Each module receives its resolved dependencies as an argument to init(), enabling loose coupling. This pattern is used in large-scale apps to manage feature module lifecycle."
    },
    {
      title: "Implement a Plugin System with Strategy Pattern",
      difficulty: "mid",
      description: "Create a plugin system for a form validation library. The system should allow registering validation strategies (plugins) and running them against form data. Each plugin defines a name and a validate function.",
      solution: `class FormValidator {
  constructor() {
    this.plugins = new Map();
    this.fieldRules = new Map();
  }

  // Register a validation strategy plugin
  registerPlugin(name, validateFn) {
    this.plugins.set(name, validateFn);
    return this; // chainable
  }

  // Assign rules to a field
  addFieldRules(fieldName, rules) {
    this.fieldRules.set(fieldName, rules);
    return this;
  }

  // Validate a single field
  validateField(fieldName, value, allValues) {
    const rules = this.fieldRules.get(fieldName) || [];
    const errors = [];

    for (const rule of rules) {
      const plugin = this.plugins.get(rule.type);
      if (!plugin) {
        throw new Error(\`Unknown validation plugin: "\${rule.type}"\`);
      }
      const error = plugin(value, rule.params, allValues);
      if (error) {
        errors.push(error);
      }
    }

    return errors;
  }

  // Validate entire form
  validate(formValues) {
    const errors = {};
    let isValid = true;

    for (const [field, rules] of this.fieldRules) {
      const fieldErrors = this.validateField(field, formValues[field], formValues);
      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
        isValid = false;
      }
    }

    return { isValid, errors };
  }
}

// Built-in validation strategy plugins
const required = (value) =>
  value == null || value === '' ? 'This field is required' : null;

const minLength = (value, params) =>
  value && value.length < params.min
    ? \`Must be at least \${params.min} characters\`
    : null;

const maxLength = (value, params) =>
  value && value.length > params.max
    ? \`Must be at most \${params.max} characters\`
    : null;

const pattern = (value, params) =>
  value && !params.regex.test(value)
    ? params.message || 'Invalid format'
    : null;

const matchField = (value, params, allValues) =>
  value !== allValues[params.field]
    ? \`Must match \${params.field}\`
    : null;

// Usage
const validator = new FormValidator()
  .registerPlugin('required', required)
  .registerPlugin('minLength', minLength)
  .registerPlugin('maxLength', maxLength)
  .registerPlugin('pattern', pattern)
  .registerPlugin('matchField', matchField)
  .addFieldRules('email', [
    { type: 'required' },
    { type: 'pattern', params: { regex: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/, message: 'Invalid email' } },
  ])
  .addFieldRules('password', [
    { type: 'required' },
    { type: 'minLength', params: { min: 8 } },
  ])
  .addFieldRules('confirmPassword', [
    { type: 'required' },
    { type: 'matchField', params: { field: 'password' } },
  ]);

const result = validator.validate({
  email: 'user@example.com',
  password: '12345',
  confirmPassword: '123',
});
// result.isValid === false
// result.errors.password === ['Must be at least 8 characters']
// result.errors.confirmPassword === ['Must match password']`,
      explanation: "This demonstrates the Strategy pattern applied to form validation. Each validation plugin is a strategy — a function with the same interface (value, params, allValues) => error | null. The FormValidator is the context that delegates validation to the appropriate strategy based on rule type. New validation rules can be added without modifying existing code (Open/Closed Principle). The chainable API and separation of rule registration from execution enables flexible, testable validation."
    }
  ],
  quiz: [
    {
      question: "In a feature-based folder structure, what is the primary purpose of a barrel file (index.js)?",
      options: [
        "Define the public API of the feature module",
        "Improve build performance by pre-bundling",
        "Enable hot module replacement",
        "Provide default exports for all components"
      ],
      correct: 0,
      explanation: "A barrel file (index.js) in a feature folder defines the public API — it explicitly re-exports only the components, hooks, and utilities that other features should use. Internal implementation details are not exported, creating a clear boundary. This enables refactoring internals without breaking consumers."
    },
    {
      question: "Which tool would you use to detect and prevent circular dependencies between feature modules in CI?",
      options: [
        "ESLint core rules",
        "dependency-cruiser",
        "TypeScript compiler",
        "Webpack Bundle Analyzer"
      ],
      correct: 1,
      explanation: "dependency-cruiser analyzes your project's dependency graph and can enforce custom rules like 'no circular dependencies' and 'features cannot import from other features'. It can be run in CI to fail the build on violations. ESLint core doesn't analyze the full dependency graph, TypeScript doesn't enforce architectural rules, and Bundle Analyzer shows bundle composition, not architectural violations."
    },
    {
      question: "In a monorepo using Turborepo, what enables skipping builds for unchanged packages?",
      options: [
        "File watching with chokidar",
        "Content-based hashing and remote caching",
        "Git hooks that detect changed files",
        "Package-level lockfiles"
      ],
      correct: 1,
      explanation: "Turborepo uses content-based hashing — it hashes the inputs of each task (source files, dependencies, env variables) and checks a cache (local or remote) for a matching hash. If found, the build output is restored from cache instead of rebuilding. Remote caching means team members share the same cache, so if one person already built a package, others get the cached result."
    },
    {
      question: "When using Webpack Module Federation for micro-frontends, why are React and ReactDOM declared as 'singleton' shared modules?",
      options: [
        "To reduce bundle size by loading React only once",
        "To prevent multiple React instances which causes hooks to break",
        "To enable faster hot module replacement",
        "To allow different micro-frontends to use different React versions"
      ],
      correct: 1,
      explanation: "React hooks rely on a single React instance — having two copies of React causes the 'Invalid hook call' error because hooks track state on the specific React instance. Declaring React as a singleton in Module Federation ensures all micro-frontends share the exact same React instance at runtime, preventing this critical bug. Bundle size reduction is a secondary benefit."
    },
    {
      question: "What is the strongest argument for using React Query (TanStack Query) for server state instead of Redux?",
      options: [
        "React Query has a smaller bundle size",
        "React Query automatically handles caching, background refetching, and stale data",
        "Redux cannot handle asynchronous operations",
        "React Query uses less memory"
      ],
      correct: 1,
      explanation: "React Query is purpose-built for server state — it provides automatic caching, background refetching, stale-while-revalidate, request deduplication, garbage collection, and optimistic updates out of the box. With Redux, you'd manually implement all of these behaviors via middleware, selectors, and action creators. Redux CAN handle async (via thunks, sagas) but requires significantly more boilerplate for server state management."
    }
  ]
};
