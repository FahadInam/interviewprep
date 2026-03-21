export const apiLayer = {
  id: "api-layer",
  title: "API Layer Design",
  icon: "🔌",
  tag: "System Design",
  tagColor: "var(--tag-system)",
  subtitle: "Abstraction layers, interceptors, caching, and resilient error handling for frontend-server communication",
  concepts: [
    {
      title: "API Abstraction Layer Design",
      explanations: {
        layman: "Without an API layer, every part of your app talks directly to the server — like every customer in a restaurant yelling their order straight at the kitchen. An API layer is the waiter. You tell the waiter 'I want the salmon,' and the waiter handles everything: walks to the kitchen, translates your order, deals with problems ('we are out of salmon, how about trout?'), and brings back a nicely plated response. Your components never need to know how the kitchen works. They just call simple functions like getUser() or createOrder() and get clean data back.",
        mid: "An API abstraction layer centralizes all HTTP communication behind a clean interface. Common patterns include: 1) Service classes — UserService.getById(id), OrderService.create(data) — grouping endpoints by domain. 2) Custom hooks — useUsers(), useCreateOrder() — wrapping React Query with domain-specific logic. 3) A base HTTP client configured with base URL, interceptors, auth headers, and error handling. The layer transforms raw API responses into frontend-friendly shapes, handles auth token injection, and provides a single place to swap implementations (REST to GraphQL, mock for testing). This decouples your components from transport details — they call service methods, not fetch().",
        senior: "A well-designed API layer is the most impactful architectural investment in a frontend codebase. At production scale, it handles: 1) Transport abstraction — swap REST/GraphQL/gRPC without changing consumers by coding to interfaces. 2) Request lifecycle — interceptors for auth, logging, metrics, retry, and circuit breaking. 3) Response normalization — transform inconsistent API shapes into consistent internal models (Adapter pattern). 4) Type safety — generate TypeScript types from OpenAPI/GraphQL schemas, ensuring compile-time correctness. 5) Request coordination — deduplication (same request in-flight returns the same promise), batching (combine multiple ID lookups into one request via DataLoader pattern), and cancellation (AbortController on unmount). 6) Testing seam — inject mock implementations for unit tests without mocking fetch globally. The layer should be structured in tiers: raw HTTP client -> domain services -> React hooks. Each tier can be tested and swapped independently. Use code generation (openapi-typescript, graphql-codegen) to keep types in sync with the backend schema automatically in CI."
      },
      realWorld: "A healthcare app has an API layer with strict typing generated from the OpenAPI spec. Domain services (PatientService, AppointmentService) wrap the HTTP client with business-specific methods. React hooks (usePatient, useAppointments) wrap React Query with the services. When the backend team changed the appointment response format, only the AppointmentService adapter was updated — none of the 40+ components using useAppointments() changed.",
      whenToUse: "Always. Even small projects benefit from a thin abstraction layer — a configured fetch wrapper with error handling. As projects grow, add domain services and typed hooks. The investment pays off immediately when you need to add auth, change base URLs, or mock APIs for testing.",
      whenNotToUse: "A literal one-page prototype with a single API call might not need a full service layer, but even then a configured fetch wrapper is worth the 20 lines of code.",
      pitfalls: "Over-abstraction — five layers of indirection for a simple GET request makes debugging painful. Leaky abstractions — when the layer exposes HTTP details (status codes, headers) to components, you lose the benefit. Not handling cancellation — stale requests updating unmounted components. Tight coupling to a specific HTTP library (axios) deep in the layer instead of at the boundary.",
      codeExamples: [
        {
          title: "Tiered API Layer Architecture",
          code: `// Tier 1: Base HTTP Client
class HttpClient {
  constructor(config) {
    this.baseUrl = config.baseUrl;
    this.interceptors = { request: [], response: [] };
  }

  useRequestInterceptor(fn) {
    this.interceptors.request.push(fn);
  }

  useResponseInterceptor(fn) {
    this.interceptors.response.push(fn);
  }

  async request(method, path, options = {}) {
    let config = {
      method,
      url: \`\${this.baseUrl}\${path}\`,
      headers: { 'Content-Type': 'application/json' },
      ...options,
    };

    // Apply request interceptors
    for (const interceptor of this.interceptors.request) {
      config = await interceptor(config);
    }

    const response = await fetch(config.url, {
      method: config.method,
      headers: config.headers,
      body: config.body ? JSON.stringify(config.body) : undefined,
      signal: config.signal,
    });

    let result = { status: response.status, data: await response.json() };

    // Apply response interceptors
    for (const interceptor of this.interceptors.response) {
      result = await interceptor(result, config);
    }

    return result.data;
  }

  get(path, opts) { return this.request('GET', path, opts); }
  post(path, body, opts) { return this.request('POST', path, { ...opts, body }); }
  put(path, body, opts) { return this.request('PUT', path, { ...opts, body }); }
  delete(path, opts) { return this.request('DELETE', path, opts); }
}

// Tier 2: Domain Service
class UserService {
  constructor(httpClient) {
    this.http = httpClient;
  }

  async getAll(params) {
    const query = new URLSearchParams(params).toString();
    return this.http.get(\`/users?\${query}\`);
  }

  async getById(id) {
    return this.http.get(\`/users/\${id}\`);
  }

  async create(userData) {
    return this.http.post('/users', userData);
  }

  async update(id, userData) {
    return this.http.put(\`/users/\${id}\`, userData);
  }

  async delete(id) {
    return this.http.delete(\`/users/\${id}\`);
  }
}

// Tier 3: React Hook (wraps React Query + Service)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function useUsers(params) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.getAll(params),
    staleTime: 30_000,
  });
}

function useUser(id) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => userService.getById(id),
    enabled: !!id,
  });
}

function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => userService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}`
        }
      ]
    },
    {
      title: "Request/Response Interceptors",
      explanations: {
        layman: "Interceptors are like security checkpoints at an airport. Before your luggage (request) goes to the plane, it passes through a checkpoint that adds tags, scans contents, and verifies tickets. When your luggage (response) comes back, another checkpoint inspects it before you receive it. You don't think about these checkpoints when traveling — they work automatically in the background. Interceptors automatically modify every request (add auth tokens, log timing) and every response (handle errors, transform data) without you doing anything in your components.",
        mid: "Interceptors are middleware functions that hook into the request/response lifecycle. Request interceptors modify outgoing requests — inject Authorization headers, add correlation IDs, log request timing. Response interceptors process incoming responses — handle 401 by refreshing tokens and retrying, normalize error shapes, transform response data. They follow a pipeline pattern where each interceptor receives the request/response and passes it to the next. Popular libraries like Axios have built-in interceptor support. For fetch, you implement them manually or use a wrapper. The chain order matters — auth should run before logging so logs include the auth header.",
        senior: "At scale, interceptors form a sophisticated request pipeline. Production concerns: 1) Token refresh race condition — when multiple requests hit 401 simultaneously, only one should trigger a refresh; others queue and replay with the new token. Use a promise-based lock: first 401 creates a refresh promise, subsequent 401s await it. 2) Request deduplication — if the same GET is in-flight, return the existing promise instead of making a duplicate request. Track in-flight requests by a key derived from method + URL + params. 3) Telemetry — measure request duration, status distribution, and error rates; send to your monitoring system (DataDog, Sentry). 4) Circuit breaking — if an endpoint fails N times in a window, stop calling it temporarily and return a cached fallback. 5) Request prioritization — critical API calls (auth, checkout) bypass rate limiting while background fetches (analytics, prefetch) are throttled. The key architectural decision is interceptor ordering and error propagation — should a logging interceptor run before or after error handling? Generally: auth -> dedup -> logging/telemetry -> error handling -> retry."
      },
      realWorld: "A financial trading platform uses interceptors for: request signing (HMAC), request deduplication (prevent double-submitting trades), automatic retry with exponential backoff for transient failures, 401 handling with token refresh queuing (dozens of concurrent WebSocket and REST calls), and latency tracking per endpoint sent to DataDog for SLO monitoring.",
      whenToUse: "Always configure at least auth and error handling interceptors. Add logging/telemetry interceptors in production. Use request deduplication for apps with many concurrent reads. Use retry interceptors for critical operations that can safely be retried (idempotent requests).",
      whenNotToUse: "Don't add complex interceptors (circuit breaking, request prioritization) unless you have the scale to justify the complexity. Simple apps with a few API calls need only auth and basic error handling.",
      pitfalls: "Token refresh race conditions — multiple simultaneous 401s each triggering a separate refresh, causing a cascade. Infinite retry loops — always have a max retry count. Interceptor order bugs — auth interceptor must run before logging if you want to log the auth header. Swallowing errors in interceptors makes debugging impossible — always re-throw or propagate. Testing — interceptors are hard to test if tightly coupled to the HTTP client.",
      codeExamples: [
        {
          title: "Token Refresh with Queue Pattern",
          code: `// Handles concurrent 401s with a single token refresh
function createAuthInterceptor(authService) {
  let refreshPromise = null;

  return {
    request: async (config) => {
      const token = authService.getAccessToken();
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: \`Bearer \${token}\`,
        };
      }
      return config;
    },

    response: async (result, originalConfig) => {
      if (result.status !== 401) return result;

      // If a refresh is already in progress, wait for it
      if (!refreshPromise) {
        refreshPromise = authService.refreshToken()
          .finally(() => { refreshPromise = null; });
      }

      try {
        await refreshPromise;
      } catch (refreshError) {
        // Refresh failed — redirect to login
        authService.logout();
        window.location.href = '/login';
        throw refreshError;
      }

      // Retry original request with new token
      const newToken = authService.getAccessToken();
      originalConfig.headers = {
        ...originalConfig.headers,
        Authorization: \`Bearer \${newToken}\`,
      };

      const retryResponse = await fetch(originalConfig.url, {
        method: originalConfig.method,
        headers: originalConfig.headers,
        body: originalConfig.body ? JSON.stringify(originalConfig.body) : undefined,
      });

      return { status: retryResponse.status, data: await retryResponse.json() };
    },
  };
}

// Request Deduplication Interceptor
function createDeduplicationInterceptor() {
  const inFlight = new Map();

  return {
    request: async (config) => {
      // Only deduplicate GET requests
      if (config.method !== 'GET') return config;

      const key = \`\${config.method}:\${config.url}\`;
      if (inFlight.has(key)) {
        // Return the existing promise — caller awaits it
        config._deduplicated = true;
        config._existingPromise = inFlight.get(key);
      } else {
        // Create a deferred promise other requests can await
        let resolve, reject;
        const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
        inFlight.set(key, promise);
        config._deduplicationKey = key;
        config._deduplicationResolve = resolve;
        config._deduplicationReject = reject;
      }
      return config;
    },

    response: async (result, config) => {
      if (config._deduplicationKey) {
        config._deduplicationResolve(result);
        inFlight.delete(config._deduplicationKey);
      }
      return result;
    },
  };
}`
        }
      ]
    },
    {
      title: "Error Handling Strategies",
      explanations: {
        layman: "Imagine you're a customer service agent. When something goes wrong, you have a playbook: 1) Try again — 'Let me try that again for you' (retry). 2) Offer an alternative — 'That item is unavailable, but here's a similar one' (fallback). 3) Escalate gracefully — 'I apologize, our system is currently updating. Here's what you can do in the meantime' (error boundary). Good error handling means users never see a blank screen or cryptic error message — they always get a helpful response, even when things go wrong behind the scenes.",
        mid: "Frontend error handling operates at multiple levels: 1) Network layer — retry with exponential backoff for transient failures (5xx, network errors). Retry only idempotent requests (GET, PUT, DELETE, not POST for creation). 2) API layer — normalize errors into a consistent shape ({ code, message, details }) regardless of backend format. Map HTTP status codes to user-friendly messages. 3) Component layer — React Error Boundaries catch rendering errors and show fallback UI. 4) Global layer — window.onerror and unhandledrejection catch uncaught errors for logging. Strategy pattern for error handling: different error types (NetworkError, AuthError, ValidationError) trigger different recovery mechanisms (retry, redirect to login, show field errors).",
        senior: "Production error handling is a system design problem spanning multiple layers. Key architectural decisions: 1) Error classification — categorize errors by recoverability: transient (retry), auth (refresh token or redirect), validation (show to user), fatal (error boundary). Use a discriminated union type for errors so handlers can switch on error type. 2) Retry strategy — exponential backoff with jitter prevents thundering herd on server recovery. Circuit breaker pattern: after N consecutive failures, stop retrying and return cached data or a degraded experience. 3) Graceful degradation — define what each feature looks like in degraded mode. If recommendations API fails, show popular items from cache. If search fails, show browse categories. 4) Error boundaries — nest them strategically: one around each major feature (sidebar, main content, header) so a failure in one doesn't crash the others. Never put one error boundary around the entire app. 5) Error reporting — structured error logs to Sentry/DataDog with context (user ID, request ID, component stack, breadcrumbs). Correlate frontend errors with backend request IDs for end-to-end debugging. 6) Offline support — detect connectivity changes and queue mutations for later replay using a service worker."
      },
      realWorld: "A streaming platform handles API errors gracefully: video metadata fetch retries 3 times with backoff, then falls back to cached metadata. If the video CDN fails, it tries alternate CDN endpoints. Search errors show 'trending content' from cache instead of an error screen. Each section (recommendations, continue watching, search) has its own error boundary so one failure doesn't blank the entire page. All errors are sent to Sentry with the user's session replay for debugging.",
      whenToUse: "Always implement at minimum: retry for transient failures, error boundaries for rendering errors, and global error logging. Add circuit breaking and graceful degradation for user-facing features where availability matters more than consistency.",
      whenNotToUse: "Don't over-engineer error handling for internal tools with technical users who can handle raw errors. Don't retry non-idempotent operations (POST for payment) without careful consideration — this could result in duplicate transactions.",
      pitfalls: "Retrying non-idempotent requests can cause duplicates (double-charging a credit card). Error boundaries only catch rendering errors, not event handler or async errors. Swallowing errors silently (catch blocks that do nothing) makes debugging impossible. Showing raw server error messages to users is a security risk and poor UX. Not setting a max retry limit can flood a struggling server.",
      codeExamples: [
        {
          title: "Comprehensive Error Handling System",
          code: `// Error classification
class AppError extends Error {
  constructor(type, message, details = {}) {
    super(message);
    this.type = type;
    this.details = details;
  }
}

const ErrorType = {
  NETWORK: 'NETWORK',
  AUTH: 'AUTH',
  VALIDATION: 'VALIDATION',
  NOT_FOUND: 'NOT_FOUND',
  SERVER: 'SERVER',
  UNKNOWN: 'UNKNOWN',
};

function classifyError(error, response) {
  if (!response) return new AppError(ErrorType.NETWORK, 'No internet connection');
  if (response.status === 401) return new AppError(ErrorType.AUTH, 'Session expired');
  if (response.status === 403) return new AppError(ErrorType.AUTH, 'Access denied');
  if (response.status === 404) return new AppError(ErrorType.NOT_FOUND, 'Resource not found');
  if (response.status === 422) return new AppError(ErrorType.VALIDATION, 'Validation failed', error.details);
  if (response.status >= 500) return new AppError(ErrorType.SERVER, 'Server error');
  return new AppError(ErrorType.UNKNOWN, 'An unexpected error occurred');
}

// Retry with exponential backoff + jitter
async function withRetry(fn, options = {}) {
  const { maxRetries = 3, baseDelay = 1000, shouldRetry = () => true } = options;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      if (isLastAttempt || !shouldRetry(error)) throw error;

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// React Error Boundary with recovery
import React from 'react';

class FeatureErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Report to error monitoring
    reportError({
      error,
      componentStack: errorInfo.componentStack,
      feature: this.props.feature,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback ? (
        this.props.fallback({ error: this.state.error, retry: this.handleRetry })
      ) : (
        <div className="error-boundary-fallback">
          <h3>Something went wrong in {this.props.feature}</h3>
          <button onClick={this.handleRetry}>Try Again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Usage: Nested error boundaries per feature
function App() {
  return (
    <div className="app">
      <FeatureErrorBoundary feature="header">
        <Header />
      </FeatureErrorBoundary>
      <FeatureErrorBoundary
        feature="dashboard"
        fallback={({ retry }) => (
          <div>
            <p>Dashboard is temporarily unavailable.</p>
            <button onClick={retry}>Reload Dashboard</button>
          </div>
        )}
      >
        <Dashboard />
      </FeatureErrorBoundary>
      <FeatureErrorBoundary feature="sidebar">
        <Sidebar />
      </FeatureErrorBoundary>
    </div>
  );
}`
        }
      ]
    },
    {
      title: "Caching Strategies and Optimistic Updates",
      explanations: {
        layman: "Caching is like your browser's memory. The first time you visit a friend's house, you need GPS directions (fetch from server). After that, you remember the way (cached) and only re-check GPS if you think roads might have changed (stale check). The 'stale-while-revalidate' strategy is like using your memorized route while GPS recalculates in the background — you're never stuck waiting. Optimistic updates go further: when you text your friend 'I'm coming,' the message appears as 'sent' immediately even before the server confirms delivery. If sending fails, it reverts to 'failed.' Users perceive instant responsiveness.",
        mid: "Frontend caching revolves around the stale-while-revalidate (SWR) pattern: return cached data immediately (stale is OK for perceived speed), then refetch in the background and update when fresh data arrives. React Query implements this with configurable staleTime (how long data is considered fresh) and cacheTime (how long unused data stays in memory). Cache invalidation happens on: mutation success (invalidateQueries), window focus (refetchOnWindowFocus), network reconnection, or manual triggers. Optimistic updates modify the cache immediately before the mutation completes, then reconcile on success/failure. This gives the perception of instant responses. The mutation's onMutate sets optimistic data, onError rolls back, and onSettled invalidates to ensure eventual consistency.",
        senior: "Caching architecture decisions at scale: 1) Cache granularity — cache per-entity (normalize like Apollo/Relay) vs per-query (React Query default). Normalized caching deduplicates entities but adds complexity; per-query is simpler but may show stale data in one query while another is updated. React Query's selective invalidation (invalidateQueries by key prefix) bridges the gap. 2) Cache persistence — persist React Query cache to IndexedDB (via persistQueryClient plugin) for offline support and instant page loads. But handle cache schema migrations when your API changes. 3) Optimistic update correctness — optimistic UI works for additive operations (add item to list) but gets complex for operations with server-computed fields (timestamps, IDs, sort order). Use 'optimistic' for simple toggles/counters and 'invalidation' for complex mutations. 4) Cache warming — prefetch data on hover (queryClient.prefetchQuery) for perceived instant navigation. Prefetch the next page of paginated data. 5) Stale time tuning — frequently-changing data (stock prices, notifications) needs short staleTime; rarely-changing data (user profile, app config) can use minutes or hours. Wrong staleTime is either too many requests (short) or stale UI (long). 6) Request waterfall elimination — use parallel queries (useQueries) and dependent queries (enabled flag) to minimize sequential roundtrips."
      },
      realWorld: "A social media app uses optimistic updates for likes — clicking the heart immediately increments the count and fills the icon. If the API fails, it rolls back. The feed uses stale-while-revalidate with a 30-second stale time — pulling to refresh fetches fresh data, but navigation between tabs shows cached content instantly. User profiles are prefetched on hover, so clicking a username feels instantaneous. The entire query cache is persisted to IndexedDB so reopening the app shows the last-seen feed while fresh data loads in the background.",
      whenToUse: "Use SWR/React Query caching for all server data — the defaults are sensible. Use optimistic updates for user-triggered mutations where immediate feedback improves UX (likes, toggles, adding items to lists). Use cache prefetching for predictable navigation paths (hover-to-prefetch, pagination prefetch).",
      whenNotToUse: "Don't use optimistic updates for operations that can't be safely rolled back (payments, irreversible deletions). Don't cache highly sensitive data (auth tokens, PII) in queryClient cache if it persists to storage. Don't set infinite staleTime for data that changes — users will see outdated content.",
      pitfalls: "Optimistic update rollback bugs — forgetting to snapshot previous state means you can't revert on error. Cache key design — inconsistent keys (sometimes including params, sometimes not) cause cache misses. Over-invalidation — invalidating too broadly causes unnecessary refetches. Under-invalidation — not invalidating related queries leaves stale data visible. Persisted cache schema drift — old cached data shapes crash the app after API changes.",
      codeExamples: [
        {
          title: "Optimistic Update with Rollback",
          code: `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Optimistic like/unlike toggle
function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, liked }) =>
      fetch(\`/api/posts/\${postId}/like\`, {
        method: liked ? 'DELETE' : 'POST',
      }).then(r => r.json()),

    onMutate: async ({ postId, liked }) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      // Snapshot current state for rollback
      const previousPosts = queryClient.getQueryData(['posts']);

      // Optimistically update the cache
      queryClient.setQueryData(['posts'], (old) =>
        old.map(post =>
          post.id === postId
            ? {
                ...post,
                liked: !liked,
                likeCount: liked ? post.likeCount - 1 : post.likeCount + 1,
              }
            : post
        )
      );

      // Return context with snapshot for rollback
      return { previousPosts };
    },

    onError: (error, variables, context) => {
      // Rollback to snapshot on failure
      queryClient.setQueryData(['posts'], context.previousPosts);
      // Optionally show error toast
      showToast('Failed to update like. Please try again.');
    },

    onSettled: () => {
      // Refetch to ensure server state is synced
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// Prefetching on hover for instant navigation
function PostCard({ post }) {
  const queryClient = useQueryClient();

  const handleHover = () => {
    queryClient.prefetchQuery({
      queryKey: ['post', post.id],
      queryFn: () => fetch(\`/api/posts/\${post.id}\`).then(r => r.json()),
      staleTime: 60_000, // Don't refetch if already cached within 1 min
    });
  };

  return (
    <a href={\`/posts/\${post.id}\`} onMouseEnter={handleHover}>
      <h3>{post.title}</h3>
    </a>
  );
}`
        }
      ]
    },
    {
      title: "API Versioning and Backward Compatibility",
      explanations: {
        layman: "API versioning is like how your phone's charger port has evolved — from the original wide connector to USB-C. When Apple releases a new port, they don't immediately break all old cables. They provide adapters or keep the old port on some devices for a transition period. API versioning works similarly: when the server updates its 'connector' (response format), your frontend needs to handle both old and new formats during the transition, or explicitly request the version it understands.",
        mid: "API versioning strategies: 1) URL-based (/api/v1/users, /api/v2/users) — explicit, easy to route, but means different endpoints. 2) Header-based (Accept: application/vnd.api+json;version=2) — cleaner URLs, more RESTful, harder to test in browser. 3) Query parameter (/api/users?version=2) — easy to add, but pollutes URLs. On the frontend, handle versioning by: abstracting the version in the API layer so components don't know which version they're calling, creating adapters that transform between API versions and internal models, and implementing feature flags to gradually migrate features to new API versions. Backward compatibility means the frontend should handle both old and new response shapes gracefully during migration periods.",
        senior: "API versioning at scale is a coordination problem between frontend and backend teams. Best practices: 1) Version at the API layer, not in components — your UserService abstracts whether it's calling v1 or v2. Internally, it can use an adapter to normalize v1 and v2 responses into the same internal model. 2) Consumer-driven contracts — the frontend team defines what they need (Pact tests), and the backend ensures compatibility. This catches breaking changes before deployment. 3) Gradual migration — use feature flags to shift traffic from v1 to v2 per-feature: 'checkout uses v2, profile still on v1.' 4) Schema validation — validate API responses at runtime (zod, io-ts) to catch unexpected changes before they cause UI bugs. If validation fails, fall back to a safe default or show an appropriate error. 5) Deprecation strategy — API layer logs warnings when calling deprecated endpoints, giving the team visibility. 6) GraphQL advantage — clients request exactly the fields they need, so adding fields is non-breaking. Removing fields breaks clients explicitly. Consider GraphQL for APIs with diverse frontend consumers (web, mobile, third-party). 7) BFF (Backend for Frontend) — a thin backend layer that transforms API responses for each frontend's needs, handling versioning concerns server-side."
      },
      realWorld: "A banking app maintains two API versions simultaneously. The API layer has adapters: v1 returns account balances as strings (legacy), v2 as numbers. The AccountAdapter normalizes both to the internal model with numeric balances. Feature flags control which version each screen uses. Runtime schema validation (zod) catches any unexpected response changes and reports them to the monitoring dashboard. The team uses Pact contract tests to verify their frontend expectations match the backend's output before each deploy.",
      whenToUse: "Always version your API integration — even if you control both frontend and backend. Use adapters when migrating between API versions. Use runtime schema validation in production to detect API contract violations early.",
      whenNotToUse: "Don't over-version for internal APIs with a single consumer — sometimes a coordinated deploy is simpler. Don't maintain more than 2-3 API versions simultaneously — the maintenance burden grows exponentially.",
      pitfalls: "Forgetting to deprecate old versions — they accumulate tech debt. Not testing with both API versions in CI — regressions slip through. URL-based versioning can lead to code duplication on the backend. Not communicating version deprecation timelines to frontend teams causes last-minute scrambles.",
      codeExamples: [
        {
          title: "API Version Adapter Pattern",
          code: `// Adapter pattern for API versioning
const userAdapters = {
  v1: {
    // v1 returns { first_name, last_name, email_address, account_balance: "1234.56" }
    toInternal(apiUser) {
      return {
        id: apiUser.id,
        firstName: apiUser.first_name,
        lastName: apiUser.last_name,
        email: apiUser.email_address,
        balance: parseFloat(apiUser.account_balance),
        fullName: \`\${apiUser.first_name} \${apiUser.last_name}\`,
      };
    },
    toApi(internalUser) {
      return {
        first_name: internalUser.firstName,
        last_name: internalUser.lastName,
        email_address: internalUser.email,
      };
    },
  },
  v2: {
    // v2 returns { firstName, lastName, email, balance: 1234.56 }
    toInternal(apiUser) {
      return {
        id: apiUser.id,
        firstName: apiUser.firstName,
        lastName: apiUser.lastName,
        email: apiUser.email,
        balance: apiUser.balance,
        fullName: \`\${apiUser.firstName} \${apiUser.lastName}\`,
      };
    },
    toApi(internalUser) {
      return {
        firstName: internalUser.firstName,
        lastName: internalUser.lastName,
        email: internalUser.email,
      };
    },
  },
};

// Service uses adapter based on configured version
class UserService {
  constructor(httpClient, apiVersion = 'v2') {
    this.http = httpClient;
    this.adapter = userAdapters[apiVersion];
    this.basePath = \`/api/\${apiVersion}/users\`;
  }

  async getById(id) {
    const raw = await this.http.get(\`\${this.basePath}/\${id}\`);
    return this.adapter.toInternal(raw);
  }

  async update(id, userData) {
    const apiData = this.adapter.toApi(userData);
    const raw = await this.http.put(\`\${this.basePath}/\${id}\`, apiData);
    return this.adapter.toInternal(raw);
  }
}

// Runtime schema validation with zod
import { z } from 'zod';

const UserSchemaV2 = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  balance: z.number(),
});

class ValidatedUserService extends UserService {
  async getById(id) {
    const raw = await this.http.get(\`\${this.basePath}/\${id}\`);
    const parsed = UserSchemaV2.safeParse(raw);
    if (!parsed.success) {
      reportSchemaViolation('UserService.getById', parsed.error);
      // Fall back to best-effort parsing
    }
    return this.adapter.toInternal(raw);
  }
}`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "How would you design an API layer for a large React application?",
      answer: "Three layers, each with a single job. Layer 1 (HTTP client): a thin wrapper around fetch with interceptors for auth tokens, error handling, logging, and retry logic. It knows nothing about your business domain. Layer 2 (Domain services): classes like UserService.getById(id) and OrderService.create(data) that group endpoints by domain. They call the HTTP client internally, transform raw API responses into frontend-friendly shapes, and are where you would swap REST for GraphQL later. Layer 3 (React hooks): useUsers(), useCreateOrder() wrapping React Query. Components only see this layer — clean data, loading states, and error handling come for free. Each layer is independently testable: mock the HTTP client to test services, mock services to test hooks. Types are generated from the OpenAPI spec so frontend and backend stay in sync automatically.",
      difficulty: "hard",
      followUps: [
        "How do you handle request cancellation when a component unmounts?",
        "How would you migrate this API layer from REST to GraphQL?",
        "How do you handle different response formats from different microservices?"
      ]
    },
    {
      question: "Explain the stale-while-revalidate caching strategy and how React Query implements it.",
      answer: "Stale-while-revalidate (SWR) serves cached data immediately (even if potentially stale) while fetching fresh data in the background. When the fresh data arrives, the UI updates seamlessly. React Query implements this via staleTime and gcTime (formerly cacheTime). staleTime is how long data is considered fresh — fresh data is never refetched. After staleTime, data is 'stale' and will be refetched in the background on the next access (window focus, component mount, or manual trigger). gcTime is how long unused (no active observers) cached data stays in memory before garbage collection. The key insight: staleTime = 0 (default) means data is immediately stale, so every component mount triggers a background refetch while showing cached data. staleTime = Infinity means data is never refetched automatically. Tuning these per query type is critical — user profile might have staleTime of 5 minutes while notifications might have 10 seconds.",
      difficulty: "mid",
      followUps: [
        "What's the difference between staleTime and gcTime?",
        "How do you decide the right staleTime for different data types?",
        "How does React Query handle cache invalidation after mutations?"
      ]
    },
    {
      question: "How do you handle token refresh when multiple requests fail with 401 simultaneously?",
      answer: "The challenge is avoiding multiple concurrent refresh requests. The solution is a promise-based lock pattern: the first request that receives a 401 initiates the token refresh and stores the refresh promise. All subsequent 401 responses await the same promise instead of initiating their own refreshes. Once the refresh completes, all waiting requests retry with the new token. Implementation: in the response interceptor, check if a refresh is already in progress (refreshPromise !== null). If not, start one and store the promise. If yes, await it. On refresh success, clear the promise and retry. On refresh failure, clear the promise, log out the user, and redirect to login. This prevents the thundering herd problem where 10 parallel requests each trigger their own refresh, potentially invalidating each other's tokens.",
      difficulty: "hard",
      followUps: [
        "How do you handle the case where the refresh token itself has expired?",
        "How do you queue requests that happen during the refresh window?",
        "How would you implement this with axios interceptors?"
      ]
    },
    {
      question: "When would you use optimistic updates, and what are the risks?",
      answer: "Use optimistic updates when: 1) The mutation is very likely to succeed (>99%). 2) The operation is reversible (unlike payments). 3) Immediate feedback significantly improves UX (like/unlike, toggle, add to list). 4) The server response doesn't add critical information the UI needs. Risks: 1) Rollback complexity — you must snapshot the previous state and restore it on failure. 2) Inconsistency — if the server rejects the mutation, the user briefly saw wrong data. 3) Server-computed values — if the server adds timestamps, IDs, or sort order, the optimistic state may differ from the actual state. 4) Concurrent mutations — two users optimistically updating the same resource can see conflicting states. 5) Error messaging — users may not notice a brief optimistic state followed by a rollback. Implementation: React Query's onMutate returns a rollback context, onError uses it to restore, and onSettled invalidates to sync with server truth.",
      difficulty: "mid",
      followUps: [
        "How would you handle optimistic updates for a drag-and-drop reorder?",
        "What happens if the user navigates away before the mutation completes?",
        "How do optimistic updates interact with React Query's cache invalidation?"
      ]
    },
    {
      question: "What is the difference between request deduplication and response caching?",
      answer: "Request deduplication prevents identical in-flight requests from being sent simultaneously. If component A and component B both call GET /users at the same time, deduplication ensures only one HTTP request is made and both components receive the same response. It operates at the network level during the request lifecycle. Response caching stores the response after it completes and serves it for subsequent requests without hitting the network. When component C calls GET /users 30 seconds later, it gets the cached response. React Query does both: it deduplicates queries with the same queryKey that are active simultaneously (deduplication), and it caches responses based on staleTime/gcTime (caching). The distinction matters because deduplication is about concurrent requests while caching is about sequential requests. Deduplication is always safe — it's the same request. Caching has freshness concerns — the data might have changed since it was cached.",
      difficulty: "mid",
      followUps: [
        "How does React Query implement request deduplication?",
        "How would you implement deduplication for POST requests?",
        "Can stale cache data cause bugs? Give an example."
      ]
    },
    {
      question: "How would you implement a circuit breaker pattern in a frontend API layer?",
      answer: "A circuit breaker prevents cascading failures by stopping requests to a failing endpoint. Three states: 1) Closed (normal) — requests pass through. Track failure count. 2) Open (tripped) — after N failures in a time window, stop sending requests and return a fallback (cached data, default response, or a user-friendly error). 3) Half-open (recovery) — after a timeout, allow one test request through. If it succeeds, reset to Closed. If it fails, go back to Open. Frontend implementation: wrap the HTTP client with a circuit breaker per endpoint (or endpoint group). Store failure counts in memory (Map<endpoint, {failures, state, lastFailureTime}>). When a request fails, increment the counter. When threshold is exceeded, switch to Open and start the timeout. In Open state, return immediately with a cached response or throw a CircuitOpenError that the UI handles gracefully. This protects both the user (no waiting for doomed requests) and the server (reduced load during partial outages).",
      difficulty: "hard",
      followUps: [
        "How do you decide the failure threshold and timeout values?",
        "How does this interact with retry logic?",
        "What fallback strategies would you use when the circuit is open?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Implement a Retry with Exponential Backoff Utility",
      difficulty: "mid",
      description: "Create an async retry function that accepts a function to retry, max retries, base delay, and a shouldRetry predicate. It should use exponential backoff with jitter and support AbortController for cancellation.",
      solution: `async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    shouldRetry = () => true,
    signal = null,
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // Check if aborted before attempting
    if (signal?.aborted) {
      throw new DOMException('Retry aborted', 'AbortError');
    }

    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;

      // Don't retry if this was the last attempt
      if (attempt === maxRetries) break;

      // Don't retry if the predicate says no
      if (!shouldRetry(error, attempt)) break;

      // Calculate delay: exponential backoff + random jitter
      const exponentialDelay = baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * baseDelay;
      const delay = Math.min(exponentialDelay + jitter, maxDelay);

      // Wait, but respect abort signal
      await new Promise((resolve, reject) => {
        const timer = setTimeout(resolve, delay);
        if (signal) {
          signal.addEventListener('abort', () => {
            clearTimeout(timer);
            reject(new DOMException('Retry aborted', 'AbortError'));
          }, { once: true });
        }
      });
    }
  }

  throw lastError;
}

// Usage
const controller = new AbortController();

try {
  const data = await retryWithBackoff(
    async (attempt) => {
      console.log(\`Attempt \${attempt + 1}\`);
      const response = await fetch('/api/data', { signal: controller.signal });
      if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
      return response.json();
    },
    {
      maxRetries: 3,
      baseDelay: 1000,
      shouldRetry: (error) => {
        // Only retry on network errors or 5xx
        if (error.name === 'TypeError') return true; // network error
        if (error.message.includes('5')) return true; // 5xx
        return false;
      },
      signal: controller.signal,
    }
  );
  console.log('Success:', data);
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Request was cancelled');
  } else {
    console.error('All retries failed:', error);
  }
}

// Cancel retries from outside
// controller.abort();`,
      explanation: "Uses exponential backoff (delay doubles each attempt) with random jitter to prevent thundering herd. The shouldRetry predicate allows callers to control which errors warrant retrying. AbortController support enables cancellation from outside (e.g., on component unmount). The maxDelay cap prevents absurdly long waits on high retry counts."
    },
    {
      title: "Build a Request Cache with Stale-While-Revalidate",
      difficulty: "hard",
      description: "Implement a cache that stores fetch responses with timestamps. When a cached entry is accessed: if fresh (within staleTime), return it. If stale, return it immediately AND refetch in the background. If expired (beyond cacheTime), refetch and wait.",
      solution: `class SWRCache {
  constructor(options = {}) {
    this.cache = new Map();
    this.inFlight = new Map();
    this.subscribers = new Map();
    this.defaultStaleTime = options.staleTime ?? 30_000; // 30 seconds
    this.defaultCacheTime = options.cacheTime ?? 300_000; // 5 minutes
  }

  _getCacheKey(key) {
    return typeof key === 'string' ? key : JSON.stringify(key);
  }

  _isStale(entry) {
    return Date.now() - entry.timestamp > (entry.staleTime ?? this.defaultStaleTime);
  }

  _isExpired(entry) {
    return Date.now() - entry.timestamp > (entry.cacheTime ?? this.defaultCacheTime);
  }

  _notifySubscribers(key, data) {
    const subs = this.subscribers.get(key);
    if (subs) {
      subs.forEach(cb => cb(data));
    }
  }

  subscribe(key, callback) {
    const cacheKey = this._getCacheKey(key);
    if (!this.subscribers.has(cacheKey)) {
      this.subscribers.set(cacheKey, new Set());
    }
    this.subscribers.get(cacheKey).add(callback);
    return () => {
      this.subscribers.get(cacheKey)?.delete(callback);
    };
  }

  async _fetchAndCache(cacheKey, fetcher, options) {
    // Deduplicate in-flight requests
    if (this.inFlight.has(cacheKey)) {
      return this.inFlight.get(cacheKey);
    }

    const promise = (async () => {
      try {
        const data = await fetcher();
        const entry = {
          data,
          timestamp: Date.now(),
          staleTime: options.staleTime,
          cacheTime: options.cacheTime,
        };
        this.cache.set(cacheKey, entry);
        this._notifySubscribers(cacheKey, data);
        return data;
      } finally {
        this.inFlight.delete(cacheKey);
      }
    })();

    this.inFlight.set(cacheKey, promise);
    return promise;
  }

  async get(key, fetcher, options = {}) {
    const cacheKey = this._getCacheKey(key);
    const entry = this.cache.get(cacheKey);

    // No cache entry — fetch and wait
    if (!entry) {
      return this._fetchAndCache(cacheKey, fetcher, options);
    }

    // Expired — fetch and wait (don't serve very old data)
    if (this._isExpired(entry)) {
      this.cache.delete(cacheKey);
      return this._fetchAndCache(cacheKey, fetcher, options);
    }

    // Stale — return cached immediately, revalidate in background
    if (this._isStale(entry)) {
      this._fetchAndCache(cacheKey, fetcher, options); // fire and forget
      return entry.data;
    }

    // Fresh — return cached
    return entry.data;
  }

  invalidate(key) {
    const cacheKey = this._getCacheKey(key);
    this.cache.delete(cacheKey);
  }

  invalidateAll() {
    this.cache.clear();
  }
}

// Usage
const cache = new SWRCache({ staleTime: 10_000, cacheTime: 60_000 });

// First call — fetches from network
const users1 = await cache.get('users', () =>
  fetch('/api/users').then(r => r.json())
);

// Within 10 seconds — returns cached (fresh)
const users2 = await cache.get('users', () =>
  fetch('/api/users').then(r => r.json())
);

// After 10 seconds — returns cached immediately,
// refetches in background (stale-while-revalidate)
const users3 = await cache.get('users', () =>
  fetch('/api/users').then(r => r.json())
);

// Subscribe to updates when background revalidation completes
const unsub = cache.subscribe('users', (newData) => {
  console.log('Users updated:', newData);
});`,
      explanation: "Implements the full SWR lifecycle: fresh data is served from cache, stale data is served immediately while revalidating in the background, and expired data forces a fresh fetch. Request deduplication prevents concurrent fetches for the same key. The subscriber pattern allows UI components to react when background revalidation completes with new data. This is a simplified version of what React Query does internally."
    },
    {
      title: "Implement a Simple Circuit Breaker",
      difficulty: "hard",
      description: "Build a circuit breaker that wraps async functions. It should track failures, open the circuit after a threshold, return fallback values when open, and transition to half-open after a timeout to test recovery.",
      solution: `class CircuitBreaker {
  static STATES = { CLOSED: 'CLOSED', OPEN: 'OPEN', HALF_OPEN: 'HALF_OPEN' };

  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold ?? 5;
    this.resetTimeout = options.resetTimeout ?? 30_000; // 30 seconds
    this.monitorWindow = options.monitorWindow ?? 60_000; // 1 minute
    this.state = CircuitBreaker.STATES.CLOSED;
    this.failures = [];
    this.lastFailureTime = null;
    this.onStateChange = options.onStateChange ?? (() => {});
  }

  _setState(newState) {
    const oldState = this.state;
    this.state = newState;
    if (oldState !== newState) {
      this.onStateChange({ from: oldState, to: newState });
    }
  }

  _cleanOldFailures() {
    const cutoff = Date.now() - this.monitorWindow;
    this.failures = this.failures.filter(t => t > cutoff);
  }

  _recordFailure() {
    this.failures.push(Date.now());
    this.lastFailureTime = Date.now();
    this._cleanOldFailures();

    if (this.failures.length >= this.failureThreshold) {
      this._setState(CircuitBreaker.STATES.OPEN);
    }
  }

  _recordSuccess() {
    this.failures = [];
    this._setState(CircuitBreaker.STATES.CLOSED);
  }

  _shouldAllowRequest() {
    if (this.state === CircuitBreaker.STATES.CLOSED) return true;

    if (this.state === CircuitBreaker.STATES.OPEN) {
      // Check if enough time has passed to try again
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this._setState(CircuitBreaker.STATES.HALF_OPEN);
        return true; // Allow one test request
      }
      return false;
    }

    // HALF_OPEN — one request is already in flight
    return false;
  }

  async execute(fn, fallback) {
    if (!this._shouldAllowRequest()) {
      if (fallback !== undefined) {
        return typeof fallback === 'function' ? fallback() : fallback;
      }
      throw new Error(\`Circuit breaker is \${this.state} — request blocked\`);
    }

    try {
      const result = await fn();
      this._recordSuccess();
      return result;
    } catch (error) {
      this._recordFailure();
      if (fallback !== undefined && this.state === CircuitBreaker.STATES.OPEN) {
        return typeof fallback === 'function' ? fallback() : fallback;
      }
      throw error;
    }
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failures.length,
      threshold: this.failureThreshold,
    };
  }
}

// Usage
const apiBreaker = new CircuitBreaker({
  failureThreshold: 3,
  resetTimeout: 10_000,
  onStateChange: ({ from, to }) => {
    console.log(\`Circuit breaker: \${from} -> \${to}\`);
    if (to === 'OPEN') {
      // Alert monitoring dashboard
      reportCircuitOpen('recommendations-api');
    }
  },
});

// Cached recommendations as fallback
let cachedRecommendations = [
  { id: 1, title: 'Popular Item 1' },
  { id: 2, title: 'Popular Item 2' },
];

async function getRecommendations(userId) {
  return apiBreaker.execute(
    async () => {
      const response = await fetch(\`/api/recommendations/\${userId}\`);
      if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
      const data = await response.json();
      cachedRecommendations = data; // Update fallback cache
      return data;
    },
    () => cachedRecommendations // Serve cached when circuit is open
  );
}

// After 3 failures, circuit opens and returns cached data
// After 10 seconds, circuit half-opens and tests with one request
// On success, circuit closes and normal operation resumes`,
      explanation: "The circuit breaker has three states: CLOSED (normal operation, tracking failures), OPEN (blocking requests, returning fallback), and HALF_OPEN (testing recovery with a single request). Failures within the monitoring window are tracked, and when the threshold is exceeded, the circuit opens. After the reset timeout, one test request is allowed (half-open). If it succeeds, the circuit closes. If it fails, it reopens. This prevents cascading failures and provides graceful degradation."
    }
  ],
  quiz: [
    {
      question: "In a three-tier API layer (HTTP client → Service → Hook), which tier should handle response data transformation?",
      options: [
        "HTTP client via response interceptors",
        "Domain service layer using adapters",
        "React hooks before returning data",
        "Individual components that consume the data"
      ],
      correct: 1,
      explanation: "The domain service layer is the right place for data transformation because it has domain knowledge (understanding what a User or Order looks like internally). The HTTP client should stay transport-agnostic, hooks should focus on caching/state, and components shouldn't handle data shaping. Services use the Adapter pattern to transform API responses into internal models."
    },
    {
      question: "What problem does the 'promise-based lock' pattern solve in token refresh interceptors?",
      options: [
        "It prevents the access token from expiring during a request",
        "It prevents multiple simultaneous 401 responses from each triggering separate refresh requests",
        "It ensures the refresh token is stored securely",
        "It queues all requests until the initial authentication completes"
      ],
      correct: 1,
      explanation: "When multiple concurrent requests all receive 401, without the lock pattern each would independently try to refresh the token, causing multiple refresh API calls and potential race conditions. The lock pattern ensures only the first 401 triggers a refresh; all subsequent 401s await the same promise and retry with the new token once it resolves."
    },
    {
      question: "In React Query, what does setting staleTime to 0 (the default) mean?",
      options: [
        "Data is never cached",
        "Data is considered stale immediately and will be refetched on every component mount",
        "Data expires immediately and is garbage collected",
        "Queries are disabled by default"
      ],
      correct: 1,
      explanation: "staleTime: 0 means data is immediately considered stale after being fetched. This means any new component mount, window focus, or refetch trigger will cause a background refetch — but the cached (stale) data is still shown immediately while the fresh data loads. This is different from no caching; the stale data IS served, it's just also revalidated. This is the stale-while-revalidate pattern in action."
    },
    {
      question: "Which error handling strategy is UNSAFE for a payment API endpoint?",
      options: [
        "Error boundaries to show fallback UI",
        "Automatic retry with exponential backoff",
        "Circuit breaker to prevent repeated failures",
        "Error classification to show user-friendly messages"
      ],
      correct: 1,
      explanation: "Automatic retry is unsafe for non-idempotent operations like payments because retrying a payment request could result in double-charging the customer. If the first request succeeded but the response was lost (network issue), the retry would create a second charge. Payment endpoints should either use idempotency keys or require explicit user action to retry."
    },
    {
      question: "What is the primary advantage of generating TypeScript types from an OpenAPI spec for your API layer?",
      options: [
        "It eliminates the need for runtime validation",
        "It ensures compile-time type safety between frontend expectations and API contracts",
        "It makes the API layer faster at runtime",
        "It replaces the need for unit testing the API layer"
      ],
      correct: 1,
      explanation: "Generated types ensure that if the API contract changes, TypeScript will flag type errors at compile time in every place the frontend uses that API. This catches breaking changes before they reach production. However, it doesn't replace runtime validation (APIs can still return unexpected data), doesn't affect runtime performance, and doesn't replace tests (which verify behavior, not types)."
    }
  ]
};
