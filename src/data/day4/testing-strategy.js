export const testingStrategy = {
  id: "testing-strategy",
  title: "Testing Strategy",
  icon: "🧪",
  tag: "Testing",
  tagColor: "var(--tag-system)",
  subtitle: "Jest, React Testing Library, and what, how, and when to test.",
  concepts: [
    {
      title: "The Testing Pyramid",
      explanations: {
        layman: "The testing pyramid tells you how many of each type of test to write. Picture an actual pyramid with three layers. Bottom layer (unit tests): test one small piece in isolation, like checking that a single light switch works. These are fast and cheap, so you write lots of them. Middle layer (integration tests): test that pieces work together, like checking that the switch actually turns on the light AND the light illuminates the room. Fewer of these, but they catch problems that unit tests miss. Top layer (end-to-end tests): walk through the whole house as a real person would — open the door, flip the switch, check the light, run the faucet. These are slow and expensive, so you only write a few for your most critical flows.",
        mid: "The testing pyramid is a strategy for balancing test speed, coverage, and maintenance cost. Unit tests form the base — they test individual functions, hooks, or components in isolation (mocking dependencies), run in milliseconds, and catch logic errors early. Integration tests sit in the middle — they test how multiple units work together (e.g., a form component with validation logic and API calls), may use a test database or mock server, and catch interface mismatches. E2E tests are at the top — they test complete user flows through the actual application in a real browser (Cypress, Playwright), are slow and flaky but catch issues that lower-level tests miss. The recommended ratio is roughly 70/20/10. An alternative view is the 'testing trophy' (Kent C. Dodds) which emphasizes integration tests as the sweet spot: they provide the best confidence-to-effort ratio because they test real component interactions without the overhead and flakiness of E2E tests.",
        senior: "In practice, the pyramid shape shifts based on your architecture. For frontend SPAs, the testing trophy is more practical: static analysis (TypeScript, ESLint) as the base, then integration tests as the largest layer, with unit tests for complex logic and minimal E2E for critical paths. The economics: unit tests have the lowest marginal cost but also the lowest marginal confidence per test (testing a function in isolation doesn't prove the system works). Integration tests hit the sweet spot — testing a component with its real hooks, context, and child components gives high confidence that the feature works. E2E tests have the highest confidence but also the highest maintenance cost (brittle selectors, timing issues, environment dependencies). Strategic testing priorities for a mature frontend: (1) Integration tests for every user-facing feature — render the page component, simulate user interactions, assert on visible outcomes. (2) Unit tests only for complex algorithms, data transformations, and business logic. (3) E2E tests for critical revenue paths (signup, checkout, payment). (4) Visual regression tests for design system components. (5) Performance budgets in CI. (6) Contract tests if consuming APIs from other teams. The goal is not 100% coverage — it's maximum confidence with minimum maintenance."
      },
      realWorld: "Google follows the 70/20/10 unit/integration/e2e ratio. Spotify focuses heavily on integration tests for their web player. Shopify uses a combination of integration tests with React Testing Library and Playwright for critical checkout flows. Netflix uses the testing trophy approach for their React frontends.",
      whenToUse: "Apply the pyramid (or trophy) as a strategic guide when building a test suite from scratch or auditing an existing one. Use it to allocate team testing effort and budget CI resources. When a team has 500 unit tests and zero integration tests, the pyramid reveals the gap.",
      whenNotToUse: "Don't follow the pyramid dogmatically. A CLI tool might need mostly unit tests. A CRUD app with simple logic might benefit from mostly E2E tests. A design system might need visual regression tests more than any other type. Adapt the strategy to your specific application and risk profile.",
      pitfalls: "Writing too many unit tests for simple code (testing that a button renders is low-value). Writing zero integration tests because unit tests 'cover everything' (they don't — integration bugs are a different class). Making E2E tests test implementation details instead of user behavior (fragile to refactors). Not running tests in CI (tests that don't run don't help).",
      codeExamples: [
        {
          title: "Testing Pyramid Example: Same Feature at Each Level",
          code: `// Feature: Login form

// === UNIT TEST: Validate email format ===
describe('validateEmail', () => {
  it('returns true for valid email', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });
  it('returns false for invalid email', () => {
    expect(validateEmail('not-an-email')).toBe(false);
  });
  it('returns false for empty string', () => {
    expect(validateEmail('')).toBe(false);
  });
});

// === INTEGRATION TEST: Login form component ===
describe('LoginForm', () => {
  it('shows validation errors and submits on valid input', async () => {
    const onSubmit = jest.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    // Submit empty form — should show errors
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();

    // Fill in valid data
    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Pass123!');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'user@test.com',
      password: 'Pass123!',
    });
  });
});

// === E2E TEST: Full login flow (Playwright) ===
test('user can log in and see dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@test.com');
  await page.getByLabel('Password').fill('Pass123!');
  await page.getByRole('button', { name: 'Log In' }).click();

  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByText('Welcome, user')).toBeVisible();
});`
        }
      ]
    },
    {
      title: "Jest Fundamentals",
      explanations: {
        layman: "Jest is like a robot inspector for your code. You tell it: 'Go check if this function adds numbers correctly.' The robot runs the function, looks at the result, and reports back: green checkmark (passed) or red X (failed). You can organize inspections into groups (describe blocks), give each check a name (it/test blocks), and tell the robot what to expect (expect/matchers). You can also give the robot a fake version of something (mocking) — like testing a recipe by using fake sugar to see if the mixing process works, without actually baking.",
        mid: "Jest is a testing framework with built-in test runner, assertion library, and mocking capabilities. Core API: `describe()` groups related tests, `it()`/`test()` defines individual test cases, `expect()` creates assertions with matchers like `toBe()`, `toEqual()`, `toHaveBeenCalledWith()`. Jest's mocking system includes: `jest.fn()` creates spy functions that track calls and return values, `jest.mock()` replaces entire modules, `jest.spyOn()` wraps existing methods with spy functionality while preserving the original. Setup/teardown: `beforeEach`, `afterEach`, `beforeAll`, `afterAll`. Async testing: return a Promise, use async/await, or use the `done` callback. Jest also provides: snapshot testing (`toMatchSnapshot()`), code coverage reports (`--coverage`), watch mode for development, and parallel test execution. Key configuration: `moduleNameMapper` for path aliases, `setupFilesAfterFramework` for test utilities, `testEnvironment: 'jsdom'` for DOM testing.",
        senior: "Jest performance at scale requires strategic configuration. For large monorepos: (1) Use `--shard` flag to parallelize across CI nodes (`jest --shard=1/4`). (2) Configure `projects` in jest.config to run different test suites with different configurations (unit tests with jsdom, API tests with node environment). (3) Use `--changedSince` to only run tests affected by changed files (works with git). (4) Module mocking strategy: prefer dependency injection over `jest.mock()` for testability — DI makes tests explicit about dependencies while jest.mock creates implicit, file-level coupling. (5) Custom matchers via `expect.extend()` for domain-specific assertions (e.g., `expect(response).toBeSuccessfulApiResponse()`). (6) Snapshot testing anti-patterns: large snapshots that nobody reviews, snapshots of implementation details (CSS classes), snapshot churn that becomes noise. Use snapshots only for small, stable outputs like error messages or serialized configs. (7) Mock best practices: mock at the boundary (API calls, file system), never mock what you own (test the real implementation), use `jest.requireActual()` to partially mock modules. (8) Coverage thresholds: set global thresholds in config (`coverageThreshold: { global: { branches: 80, functions: 85, lines: 85 } }`) but focus on meaningful coverage, not numbers."
      },
      realWorld: "Jest is used by Facebook, Airbnb, Spotify, and most React projects. It's the default test runner for Create React App and is deeply integrated with the React ecosystem. The Jest team at Meta runs hundreds of thousands of tests in their monorepo.",
      whenToUse: "Use Jest for all JavaScript/TypeScript testing — unit tests, integration tests, and component tests. It's the standard for React applications and works well with React Testing Library, Enzyme (legacy), and testing utilities.",
      whenNotToUse: "Jest is not ideal for E2E testing (use Playwright or Cypress). For non-JavaScript backends, use language-native test frameworks. For very large test suites where Jest's startup time is an issue, consider Vitest (Vite-native, API-compatible with Jest).",
      pitfalls: "Overusing jest.mock (makes tests coupled to implementation). Not clearing mocks between tests (jest.restoreAllMocks in afterEach). Async tests without proper await/assertion (tests pass vacuously). Snapshot tests that are too large to meaningfully review. Not using jest.config's moduleNameMapper when the project uses path aliases.",
      codeExamples: [
        {
          title: "Jest Core API: Mocking, Spying, Async Testing",
          code: `// Mocking a module
jest.mock('../api/userService');
import { fetchUser } from '../api/userService';

describe('UserProfile', () => {
  // Reset mocks between tests
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('displays user data after loading', async () => {
    // Configure the mock return value
    fetchUser.mockResolvedValue({
      id: 1,
      name: 'Alice',
      email: 'alice@test.com',
    });

    render(<UserProfile userId={1} />);

    // Assert loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for async data
    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('alice@test.com')).toBeInTheDocument();

    // Verify the mock was called correctly
    expect(fetchUser).toHaveBeenCalledTimes(1);
    expect(fetchUser).toHaveBeenCalledWith(1);
  });

  it('shows error state on failure', async () => {
    fetchUser.mockRejectedValue(new Error('Network error'));

    render(<UserProfile userId={1} />);

    expect(await screen.findByText(/failed to load/i)).toBeInTheDocument();
  });
});

// Spying on existing methods
describe('Analytics', () => {
  it('tracks page views', () => {
    const spy = jest.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    trackPageView('/home');

    expect(spy).toHaveBeenCalledWith('/api/analytics', expect.objectContaining({
      method: 'POST',
      body: expect.stringContaining('/home'),
    }));

    spy.mockRestore();
  });
});

// Custom matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    return {
      pass,
      message: () =>
        \`expected \${received} to be within [\${floor}, \${ceiling}]\`,
    };
  },
});

test('response time is acceptable', () => {
  expect(responseTime).toBeWithinRange(0, 300);
});`
        }
      ]
    },
    {
      title: "React Testing Library Philosophy",
      explanations: {
        layman: "Imagine testing a TV remote. The old way (Enzyme) was to open the remote, check the circuit board, count the capacitors, and verify the soldering. React Testing Library says: 'Just press the buttons and check if the TV responds.' Does pressing the power button turn on the TV? Does the volume button make it louder? You test what the USER experiences, not how the internal wiring works. This means if the manufacturer redesigns the circuit board but the remote still works the same way, your tests still pass — because you tested behavior, not implementation.",
        mid: "React Testing Library (RTL) is built on a core philosophy: 'The more your tests resemble the way your software is used, the more confidence they can give you.' Instead of testing component internals (state, methods, lifecycle), RTL encourages testing user-visible behavior. Key principles: (1) Query by accessibility roles, labels, and text — not by CSS selectors, component names, or test IDs (`getByRole('button', { name: /submit/i })` over `getByTestId('submit-btn')`). (2) Use `userEvent` over `fireEvent` for more realistic interaction simulation (userEvent simulates the full browser event chain: focus, keydown, keyup, change, blur). (3) Assert on what the user sees (`toBeInTheDocument`, `toHaveTextContent`, `toBeVisible`) not internal state. (4) Use `screen` as the primary query source (represents what the user sees). (5) Prefer `findBy` queries for async content (they wait for the element to appear). The query priority: getByRole > getByLabelText > getByPlaceholderText > getByText > getByDisplayValue > getByAltText > getByTitle > getByTestId.",
        senior: "RTL in production codebases requires nuanced application. The 'test behavior not implementation' mantra has limits: sometimes you need to verify side effects (API calls, analytics events, state management dispatches) which are implementation details from the user's perspective but critical for correctness. Strategy: test the user-visible outcome first, then selectively verify critical side effects. For complex forms, prefer testing the full submission flow rather than individual validation. For state management, test through the component — if Redux state changes, the component should reflect it visually. Testing strategy for large apps: (1) Create render helpers that wrap components with all required providers (Router, Theme, Auth, Store), (2) Use MSW (Mock Service Worker) instead of jest.mock for API calls — MSW intercepts at the network level, testing your actual fetch/axios code, (3) Create custom `renderWithProviders` functions per feature area, (4) For hooks, use `renderHook` from RTL only when the hook has no visual output — otherwise test through a component. Anti-patterns to catch in code review: testing implementation details (checking useState values), using `container.querySelector` (breaks the abstraction), excessive use of getByTestId (usually means the component isn't accessible), and waitFor with arbitrary timeouts instead of proper async queries."
      },
      realWorld: "React Testing Library is the recommended testing library in the React docs. It's used by Meta, Shopify, GitHub, and the majority of React projects. Kent C. Dodds created it as a replacement for Enzyme, which encouraged testing implementation details. The library influenced testing approaches in Vue (Vue Testing Library) and Angular (Angular Testing Library).",
      whenToUse: "Use RTL for all React component testing. It should be your primary integration testing tool. Combine with Jest for the test runner, MSW for API mocking, and userEvent for interaction simulation.",
      whenNotToUse: "RTL is not designed for testing non-rendered logic (use plain Jest for utility functions, reducers, and pure logic). It's not suitable for E2E testing (use Playwright/Cypress). For testing React Native, use React Native Testing Library (same philosophy, different renderer).",
      pitfalls: "Using getByTestId as the default query (indicates accessibility issues in the component). Using fireEvent instead of userEvent (fireEvent doesn't simulate the full browser event chain). Not waiting for async operations (tests pass inconsistently). Wrapping everything in act() manually (RTL handles most act() wrapping automatically via its query helpers).",
      codeExamples: [
        {
          title: "React Testing Library: Proper vs Anti-pattern",
          code: `// ANTI-PATTERN: Testing implementation details
it('sets isLoading state to true', () => {
  const { result } = renderHook(() => useAuth());
  act(() => result.current.login('user', 'pass'));
  // Testing internal state — fragile, meaningless to users
  expect(result.current.isLoading).toBe(true);
});

// CORRECT: Testing user-visible behavior
it('shows loading spinner during login', async () => {
  render(<LoginPage />);

  await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com');
  await userEvent.type(screen.getByLabelText(/password/i), 'password');
  await userEvent.click(screen.getByRole('button', { name: /log in/i }));

  // Test what the user SEES
  expect(screen.getByRole('progressbar')).toBeInTheDocument();

  // Wait for login to complete
  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
  expect(screen.getByText(/welcome/i)).toBeInTheDocument();
});

// ANTI-PATTERN: Using container.querySelector
it('renders the header', () => {
  const { container } = render(<Header />);
  const h1 = container.querySelector('h1.header-title'); // fragile!
  expect(h1.textContent).toBe('Dashboard');
});

// CORRECT: Using accessible queries
it('renders the header', () => {
  render(<Header />);
  expect(screen.getByRole('heading', { name: /dashboard/i }))
    .toBeInTheDocument();
});

// ANTI-PATTERN: fireEvent (incomplete event simulation)
fireEvent.change(input, { target: { value: 'test' } });

// CORRECT: userEvent (realistic interaction)
await userEvent.type(input, 'test');
// This fires: focus, keydown, keypress, input, keyup for EACH character`
        }
      ]
    },
    {
      title: "What to Test and What NOT to Test",
      explanations: {
        layman: "Think of testing like a restaurant health inspection. You check: Does the food taste right? (user-facing behavior). Is the kitchen clean? (no bugs or errors). Do the ovens work? (critical infrastructure). You DON'T check: Which brand of knife the chef uses (implementation details). Whether the chef is right-handed or left-handed (internal mechanics). Whether the plates are arranged at exactly 45 degrees (trivial details). Focus your testing budget on things that would hurt customers if they broke.",
        mid: "WHAT TO TEST: (1) User interactions — forms, clicks, navigation, keyboard shortcuts. (2) Conditional rendering — loading states, error states, empty states, permissions. (3) Data transformations — formatting dates, computing totals, filtering/sorting. (4) Integration points — API responses, context values, route parameters affecting behavior. (5) Edge cases — empty arrays, null values, very long strings, special characters. (6) Accessibility — focus management, ARIA attributes, keyboard navigation. WHAT NOT TO TEST: (1) Implementation details — internal state values, private methods, component structure. (2) Third-party libraries — don't test that React renders, that Axios makes requests, or that date-fns formats dates. (3) Trivial code — a component that just passes props through to children. (4) CSS/styling — unless critical to functionality (use visual regression for styling). (5) Constants and configuration — static objects don't need unit tests. (6) Framework internals — useEffect firing order, React rendering behavior.",
        senior: "Testing strategy should be driven by risk analysis, not coverage metrics. Prioritize tests by impact: (1) Revenue-critical paths (checkout, subscription, payment) — test exhaustively at integration and E2E levels. (2) Authentication and authorization — test every permutation (logged out, different roles, expired tokens). (3) Data integrity — test that forms save correctly, that calculations are accurate, that concurrent operations don't corrupt data. (4) Error recovery — test that failures are handled gracefully (network errors, invalid data, timeout, session expiration). Don't test: component rendering in isolation (if it's just JSX with no logic), getters/setters, boilerplate code generated by frameworks, or implementation details that change frequently without user impact. The decision framework: 'If this code broke in production, what would the user experience?' If the answer is 'nothing visible,' it's low priority for testing. If the answer is 'they can't complete their task,' it's critical. Code coverage is a useful metric but misleading if optimized directly — 100% coverage doesn't mean 100% confidence. A single integration test can cover more meaningful behavior than 20 unit tests of trivial getters."
      },
      realWorld: "At Shopify, testing prioritizes checkout and payment flows with extensive integration tests, while admin UI components rely on visual regression tests. Stripe tests every possible payment state and error condition. Airbnb's testing strategy focuses on booking-critical paths with E2E tests and uses visual regression for their design system.",
      whenToUse: "Apply this framework when deciding what tests to write for a new feature, when reviewing test plans in PRs, or when prioritizing test debt reduction. Every team should have a shared understanding of testing priorities.",
      whenNotToUse: "Don't use 'it's not worth testing' as an excuse to skip tests on complex business logic or security-sensitive code. When in doubt, write the test — the cost of a test is low compared to the cost of a production bug.",
      pitfalls: "Chasing 100% code coverage by testing trivial code (wastes time and creates maintenance burden). Not testing error states (the 'happy path bias'). Testing mock implementations instead of real behavior (your tests pass but the feature is broken). Skipping accessibility testing (legal and usability risk).",
      codeExamples: [
        {
          title: "High-Value vs Low-Value Tests",
          code: `// LOW VALUE: Testing that a component renders (trivial)
it('renders without crashing', () => {
  render(<Button label="Click" />);
  // This test tells us almost nothing useful
});

// HIGH VALUE: Testing user interaction and outcome
it('disables button and shows spinner during form submission', async () => {
  const mockSubmit = jest.fn(() => new Promise(r => setTimeout(r, 100)));
  render(<CheckoutForm onSubmit={mockSubmit} />);

  await userEvent.type(screen.getByLabelText(/card number/i), '4242424242424242');
  await userEvent.type(screen.getByLabelText(/expiry/i), '12/25');
  await userEvent.type(screen.getByLabelText(/cvc/i), '123');

  const submitBtn = screen.getByRole('button', { name: /pay/i });
  await userEvent.click(submitBtn);

  // Button should be disabled during submission
  expect(submitBtn).toBeDisabled();
  expect(screen.getByRole('progressbar')).toBeInTheDocument();

  await waitFor(() => {
    expect(submitBtn).toBeEnabled();
  });
});

// HIGH VALUE: Testing error handling
it('shows error message and retry button on payment failure', async () => {
  server.use(
    rest.post('/api/payment', (req, res, ctx) =>
      res(ctx.status(402), ctx.json({ error: 'Card declined' }))
    )
  );

  render(<CheckoutForm />);
  // ... fill form ...
  await userEvent.click(screen.getByRole('button', { name: /pay/i }));

  expect(await screen.findByText(/card declined/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /try again/i }))
    .toBeInTheDocument();
});

// HIGH VALUE: Testing accessibility
it('manages focus correctly after error', async () => {
  render(<CheckoutForm />);
  await userEvent.click(screen.getByRole('button', { name: /pay/i }));

  // Focus should move to the first error
  await waitFor(() => {
    expect(screen.getByLabelText(/card number/i)).toHaveFocus();
  });
});`
        }
      ]
    },
    {
      title: "Testing Hooks, Async Code, and Context",
      explanations: {
        layman: "Testing hooks is like testing a recipe — you can't taste the recipe instructions themselves, you can only taste the dish they produce. So instead of testing the recipe in isolation, you cook the dish and taste it. Similarly, custom hooks are best tested by rendering a component that uses them and checking what the user sees. For async code (like fetching data from a server), it's like testing a mail-order service: you send the order, wait for delivery, and check if the right package arrives.",
        mid: "Testing custom hooks: (1) Prefer testing through a component that uses the hook — this gives the most realistic test. (2) Use `renderHook` from `@testing-library/react` when the hook has no visual output (like `useLocalStorage` or `useDebounce`). (3) Wrap hooks that use context in the appropriate Provider. Testing async code: (1) Use `findBy` queries (they internally use `waitFor`) for elements that appear after async operations. (2) Use `waitFor` for assertions that need to eventually pass. (3) Use MSW (Mock Service Worker) to mock API responses at the network level. (4) Use `jest.useFakeTimers()` for testing debounce, throttle, and setTimeout. Testing context: (1) Create a wrapper function that provides the context. (2) Test that components respond correctly to different context values. (3) Test that context updates propagate correctly.",
        senior: "Advanced testing patterns for production React apps: (1) Custom render function: create a `renderWithProviders` that wraps components in all necessary providers (QueryClient, Router, Theme, Auth, Store) — this eliminates boilerplate and ensures consistent test setup. (2) MSW for API mocking: set up a test server with `setupServer()` from MSW, define default handlers for common endpoints, and override per-test for error cases. This tests your actual fetch code (unlike jest.mock which replaces it). (3) Testing race conditions: use fake timers + manual MSW response resolution to test what happens when a slow response arrives after the user navigated away. (4) Testing hooks with effects: `renderHook` returns a `result` ref and `rerender` function — use `rerender` to test how the hook responds to prop changes. Use `waitFor` to assert on async state changes. (5) Context testing strategy: don't test the context provider in isolation — test components that consume it. If you need to test that provider logic is correct, render a test consumer component that displays the context values. (6) Testing suspense boundaries: wrap components in `<Suspense>` in tests just like in production, and use MSW to control when data resolves. (7) Testing error boundaries: throw errors from child components and assert the fallback UI renders."
      },
      realWorld: "React Query (TanStack Query) provides its own test utilities that work with RTL, including a `QueryClientProvider` wrapper. Next.js apps need router mocking — most teams create a custom render function. Redux Toolkit includes test utilities for creating test stores with pre-loaded state.",
      whenToUse: "Test custom hooks when they contain complex logic (data fetching, state machines, complex calculations). Test context when authorization, theming, or feature flags affect component behavior. Test async code for every data-fetching component.",
      whenNotToUse: "Don't test simple hooks that are just thin wrappers (like `useToggle` — test through the component instead). Don't test context providers that just pass through values without logic. Don't test async code that's fully mocked away (you're just testing your mocks).",
      pitfalls: "Not awaiting async operations (tests pass vacuously because assertions run before data loads). Using `waitFor` with a timeout instead of proper async queries. Not cleaning up timers (jest.useRealTimers in afterEach). Forgetting to wrap hook tests in act(). Not providing necessary context providers (cryptic errors about missing providers).",
      codeExamples: [
        {
          title: "Testing Custom Hooks, Async, and Context Providers",
          code: `// Custom render with all providers
function renderWithProviders(ui, options = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }, // Don't retry in tests
    },
  });

  function Wrapper({ children }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider initialUser={options.user || null}>
          <MemoryRouter initialEntries={options.routes || ['/']}>
            {children}
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// Testing a custom hook with renderHook
describe('useDebounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('debounces value updates', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial'); // Not yet updated

    jest.advanceTimersByTime(300);
    expect(result.current).toBe('updated'); // Now updated
  });
});

// Testing async data fetching with MSW
const server = setupServer(
  rest.get('/api/users/:id', (req, res, ctx) => {
    return res(ctx.json({ id: req.params.id, name: 'Alice' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('fetches and displays user data', async () => {
  renderWithProviders(<UserProfile userId="1" />);

  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  expect(await screen.findByText('Alice')).toBeInTheDocument();
});

// Testing context-dependent behavior
it('shows admin controls for admin users', () => {
  renderWithProviders(<Dashboard />, {
    user: { role: 'admin', name: 'Admin User' },
  });

  expect(screen.getByRole('button', { name: /manage users/i }))
    .toBeInTheDocument();
});

it('hides admin controls for regular users', () => {
  renderWithProviders(<Dashboard />, {
    user: { role: 'user', name: 'Regular User' },
  });

  expect(screen.queryByRole('button', { name: /manage users/i }))
    .not.toBeInTheDocument();
});`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "Explain the testing pyramid and how you'd apply it to a React application.",
      answer: "The classic pyramid says: many unit tests, fewer integration tests, few E2E tests. For React, I use the 'testing trophy' variant, which shifts the balance. The base is static analysis — TypeScript and ESLint catch entire categories of bugs for free. The largest layer is integration tests: render a component with React Testing Library, simulate real user actions (type, click), and assert on what the user sees. These give the best confidence-per-test because they exercise real hooks, real children, and real state. Unit tests go only where there is complex logic worth isolating — data transformations, custom algorithms, business rule functions. E2E tests (Playwright or Cypress) cover only the critical money paths: sign up, checkout, payment. The practical rule: if a test breaks when you refactor internals but the feature still works, the test is too coupled to implementation.",
      difficulty: "mid",
      followUps: [
        "How would the pyramid change for a design system vs. a SaaS application?",
        "What metrics do you track for test suite health?",
        "How do you decide if a bug should be prevented by a unit, integration, or E2E test?"
      ]
    },
    {
      question: "What is the key philosophy behind React Testing Library, and how does it differ from Enzyme?",
      answer: "React Testing Library's guiding principle is 'test behavior, not implementation.' It encourages querying elements the way users find them — by roles, labels, and text — rather than by component names, CSS classes, or internal state. Enzyme let you shallow render components, access internal state via `component.state()`, call methods via `component.instance().handleClick()`, and find elements by component name. This coupled tests to implementation — renaming a state variable or refactoring a method broke tests even when the behavior was unchanged. RTL only exposes what the user sees, so refactoring internals doesn't break tests. This gives higher confidence that the application works as expected and lower maintenance cost.",
      difficulty: "mid",
      followUps: [
        "When might you need to access implementation details in a test?",
        "How do you test components that have no visible output (like analytics trackers)?",
        "What's the RTL query priority and why does it matter?"
      ]
    },
    {
      question: "How would you test a component that fetches data from an API?",
      answer: "I'd use Mock Service Worker (MSW) to intercept network requests at the network level rather than mocking fetch/axios with jest.mock. Setup: create a mock server with `setupServer()`, define handlers for the endpoints the component calls, and use the test lifecycle hooks (beforeAll/afterAll/afterEach) to manage the server. In the test: render the component, assert the loading state appears, use `findBy` queries to wait for data to appear, and assert the final UI matches expectations. For error testing: use `server.use()` to override a handler for a specific test with an error response. This approach tests the entire data-fetching pipeline (fetch call, response parsing, state updates, rendering) without mocking implementation details.",
      difficulty: "mid",
      followUps: [
        "Why is MSW preferred over jest.mock for API testing?",
        "How do you test loading, error, and empty states?",
        "How do you handle tests that depend on specific API response timing?"
      ]
    },
    {
      question: "When should you use snapshot testing, and when should you avoid it?",
      answer: "Snapshot testing captures a serialized output (like rendered HTML) and compares future runs against it. Good uses: (1) Small, stable outputs like error messages, serialized configurations, or computed data structures. (2) Catching unintended changes in component output during refactoring. (3) Design system component regression detection. Avoid snapshots when: (1) The output is large — nobody reviews 500-line snapshots, they just 'update snapshot' blindly. (2) The output changes frequently (high churn creates noise). (3) You're testing behavior, not structure — 'the button is disabled after clicking' is a better assertion than 'the HTML matches this 200-line snapshot.' (4) Testing implementation details — CSS class names in snapshots couple tests to styling. Use inline snapshots (`toMatchInlineSnapshot`) for small outputs to keep the expected value visible in the test file.",
      difficulty: "mid",
      followUps: [
        "How do you handle snapshot test reviews in PRs?",
        "What is the difference between toMatchSnapshot and toMatchInlineSnapshot?",
        "How would you migrate away from snapshot tests to explicit assertions?"
      ]
    },
    {
      question: "How would you set up a test suite for a large React application from scratch?",
      answer: "Step 1: Infrastructure — Jest with jsdom environment, RTL, userEvent, MSW, and jest-dom matchers. Configure moduleNameMapper for path aliases and setupFilesAfterFramework for global test utilities. Step 2: Custom render — create a renderWithProviders function wrapping all required providers (Router, QueryClient, Auth, Theme, Store) with configurable initial values. Step 3: MSW server — create a test server with default handlers for common API endpoints and export helpers for error scenarios. Step 4: Testing standards — document the team's testing approach: query priority (getByRole first), what to test (user behavior, not implementation), and required test cases per feature (happy path, error states, loading states, accessibility). Step 5: CI integration — run tests on every PR, enforce coverage thresholds for critical paths, and fail builds on test failures. Step 6: Maintenance — review test health quarterly, remove low-value tests, and add integration tests for newly discovered bugs.",
      difficulty: "hard",
      followUps: [
        "How do you parallelize test runs in CI?",
        "How do you handle flaky tests?",
        "What coverage thresholds are reasonable?"
      ]
    },
    {
      question: "How do you test error boundaries in React?",
      answer: "Error boundaries are React components that catch JavaScript errors in their child component tree. To test them: (1) Create a test component that throws an error on demand (e.g., a component that reads a prop and throws if it's a certain value, or use a mock that throws). (2) Wrap it with the error boundary in your test. (3) Suppress console.error in the test (React logs caught errors to console). (4) Assert that the fallback UI is rendered. (5) If the error boundary has a 'retry' feature, click the retry button and assert the component re-renders. Key gotchas: error boundaries only catch errors during rendering, not in event handlers or async code. Also, in React 18's Strict Mode, components render twice in development, which can affect how errors surface. Use `jest.spyOn(console, 'error').mockImplementation()` to prevent noisy error output in test results.",
      difficulty: "hard",
      followUps: [
        "What errors do error boundaries NOT catch?",
        "How do you test error boundaries with async errors?",
        "How do you test that error reporting (like Sentry) fires when an error boundary catches?"
      ]
    },
    {
      question: "What are the tradeoffs between jest.mock and Mock Service Worker (MSW)?",
      answer: "jest.mock replaces the module at import time — it's fast and gives full control but has downsides: (1) It doesn't test your actual fetch/axios code (the mock replaces it entirely). (2) If you change your HTTP client library, all mocked tests break. (3) It creates tight coupling between tests and implementation. (4) It can't test request interceptors, retry logic, or error transformation. MSW intercepts at the network level — your actual fetch code runs, hits MSW's mock server, and returns configured responses. Benefits: (1) Tests exercise the full request pipeline. (2) Changing HTTP clients doesn't break tests. (3) The same handlers work for unit tests, integration tests, and Storybook. (4) Closer to production behavior. Downsides: (1) Slightly more setup. (2) Slightly slower than jest.mock (negligible in practice). (3) Requires understanding the MSW API. Use jest.mock for non-HTTP dependencies (like localStorage, clipboard API). Use MSW for all HTTP/API mocking.",
      difficulty: "hard",
      followUps: [
        "How do you share MSW handlers between tests and Storybook?",
        "How do you test WebSocket connections?",
        "How does MSW handle parallel test execution?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Write Tests for a Todo List Component",
      difficulty: "mid",
      description: "Write a complete test suite for a TodoList component that supports adding, completing, and deleting todos. Test user interactions, keyboard accessibility, empty states, and edge cases using React Testing Library best practices.",
      solution: `import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoList } from './TodoList';

describe('TodoList', () => {
  it('renders empty state when no todos exist', () => {
    render(<TodoList />);
    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('adds a new todo when form is submitted', async () => {
    render(<TodoList />);

    const input = screen.getByRole('textbox', { name: /new todo/i });
    const addButton = screen.getByRole('button', { name: /add/i });

    await userEvent.type(input, 'Buy groceries');
    await userEvent.click(addButton);

    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    expect(input).toHaveValue(''); // Input cleared after add
  });

  it('adds a todo on Enter key press', async () => {
    render(<TodoList />);

    const input = screen.getByRole('textbox', { name: /new todo/i });
    await userEvent.type(input, 'Walk the dog{Enter}');

    expect(screen.getByText('Walk the dog')).toBeInTheDocument();
  });

  it('does not add empty todos', async () => {
    render(<TodoList />);

    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
  });

  it('marks a todo as completed when checkbox is clicked', async () => {
    render(<TodoList />);

    // Add a todo first
    await userEvent.type(
      screen.getByRole('textbox', { name: /new todo/i }),
      'Buy groceries{Enter}'
    );

    const todoItem = screen.getByText('Buy groceries').closest('li');
    const checkbox = within(todoItem).getByRole('checkbox');

    expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    // Visual indication of completion
    expect(todoItem).toHaveClass('completed');
  });

  it('deletes a todo when delete button is clicked', async () => {
    render(<TodoList />);

    await userEvent.type(
      screen.getByRole('textbox', { name: /new todo/i }),
      'Buy groceries{Enter}'
    );

    expect(screen.getByText('Buy groceries')).toBeInTheDocument();

    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteBtn);

    expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
  });

  it('displays correct count of remaining todos', async () => {
    render(<TodoList />);
    const input = screen.getByRole('textbox', { name: /new todo/i });

    await userEvent.type(input, 'Task 1{Enter}');
    await userEvent.type(input, 'Task 2{Enter}');
    await userEvent.type(input, 'Task 3{Enter}');

    expect(screen.getByText(/3 items left/i)).toBeInTheDocument();

    // Complete one
    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[0]);

    expect(screen.getByText(/2 items left/i)).toBeInTheDocument();
  });

  it('trims whitespace from todo text', async () => {
    render(<TodoList />);
    await userEvent.type(
      screen.getByRole('textbox', { name: /new todo/i }),
      '   Buy groceries   {Enter}'
    );
    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
  });
});`,
      explanation: "This test suite follows RTL best practices: queries by role and accessible name (not test IDs), uses userEvent for realistic interactions, tests user-visible behavior (not internal state), covers edge cases (empty input, whitespace), and tests the full user flow (add, complete, delete). Each test is independent and descriptive."
    },
    {
      title: "Test a Custom Hook: useLocalStorage",
      difficulty: "mid",
      description: "Write tests for a useLocalStorage hook that syncs state with localStorage. Test initial value, updates, JSON serialization, error handling for corrupt data, and cross-tab synchronization via storage events.",
      solution: `import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() =>
      useLocalStorage('theme', 'light')
    );
    expect(result.current[0]).toBe('light');
  });

  it('returns stored value from localStorage', () => {
    localStorage.setItem('theme', JSON.stringify('dark'));

    const { result } = renderHook(() =>
      useLocalStorage('theme', 'light')
    );
    expect(result.current[0]).toBe('dark');
  });

  it('updates localStorage when value changes', () => {
    const { result } = renderHook(() =>
      useLocalStorage('count', 0)
    );

    act(() => {
      result.current[1](42);
    });

    expect(result.current[0]).toBe(42);
    expect(JSON.parse(localStorage.getItem('count'))).toBe(42);
  });

  it('supports function updater (like useState)', () => {
    const { result } = renderHook(() =>
      useLocalStorage('count', 0)
    );

    act(() => {
      result.current[1](prev => prev + 1);
    });

    expect(result.current[0]).toBe(1);

    act(() => {
      result.current[1](prev => prev + 10);
    });

    expect(result.current[0]).toBe(11);
  });

  it('handles complex objects', () => {
    const initial = { name: 'Alice', preferences: { theme: 'dark' } };
    const { result } = renderHook(() =>
      useLocalStorage('user', initial)
    );

    expect(result.current[0]).toEqual(initial);

    const updated = { ...initial, name: 'Bob' };
    act(() => {
      result.current[1](updated);
    });

    expect(result.current[0]).toEqual(updated);
    expect(JSON.parse(localStorage.getItem('user'))).toEqual(updated);
  });

  it('falls back to initial value on corrupt localStorage data', () => {
    localStorage.setItem('data', 'not-valid-json{{{');
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const { result } = renderHook(() =>
      useLocalStorage('data', 'fallback')
    );

    expect(result.current[0]).toBe('fallback');
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('handles localStorage quota exceeded error', () => {
    const { result } = renderHook(() =>
      useLocalStorage('key', 'initial')
    );

    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    act(() => {
      result.current[1]('new value');
    });

    // State still updates in memory even if localStorage fails
    expect(result.current[0]).toBe('new value');
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('syncs across tabs via storage event', () => {
    const { result } = renderHook(() =>
      useLocalStorage('shared', 'initial')
    );

    // Simulate another tab changing the value
    act(() => {
      const event = new StorageEvent('storage', {
        key: 'shared',
        newValue: JSON.stringify('from-other-tab'),
        storageArea: localStorage,
      });
      window.dispatchEvent(event);
    });

    expect(result.current[0]).toBe('from-other-tab');
  });

  it('ignores storage events for different keys', () => {
    const { result } = renderHook(() =>
      useLocalStorage('myKey', 'initial')
    );

    act(() => {
      const event = new StorageEvent('storage', {
        key: 'differentKey',
        newValue: JSON.stringify('other'),
        storageArea: localStorage,
      });
      window.dispatchEvent(event);
    });

    expect(result.current[0]).toBe('initial');
  });
});`,
      explanation: "This test suite covers the full API of useLocalStorage: initial values, stored values, updates (direct and functional), complex objects, error handling for corrupt data and quota limits, and cross-tab synchronization. It uses renderHook for non-visual hook testing, act() for state updates, and properly mocks localStorage for error scenarios."
    },
    {
      title: "Test an API Integration with MSW",
      difficulty: "hard",
      description: "Write tests for a ProductList component that fetches products from an API, supports pagination, handles loading/error/empty states, and allows filtering. Use Mock Service Worker for API mocking.",
      solution: `import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductList } from './ProductList';

const mockProducts = [
  { id: 1, name: 'Laptop', price: 999, category: 'electronics' },
  { id: 2, name: 'Shirt', price: 29, category: 'clothing' },
  { id: 3, name: 'Book', price: 15, category: 'books' },
];

const server = setupServer(
  rest.get('/api/products', (req, res, ctx) => {
    const page = Number(req.url.searchParams.get('page') || 1);
    const category = req.url.searchParams.get('category');

    let filtered = mockProducts;
    if (category) {
      filtered = mockProducts.filter(p => p.category === category);
    }

    const perPage = 2;
    const start = (page - 1) * perPage;
    const paginated = filtered.slice(start, start + perPage);

    return res(
      ctx.json({
        products: paginated,
        total: filtered.length,
        page,
        totalPages: Math.ceil(filtered.length / perPage),
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderProductList() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ProductList />
    </QueryClientProvider>
  );
}

describe('ProductList', () => {
  it('shows loading state initially', () => {
    renderProductList();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders products after loading', async () => {
    renderProductList();

    expect(await screen.findByText('Laptop')).toBeInTheDocument();
    expect(screen.getByText('$999')).toBeInTheDocument();
    expect(screen.getByText('Shirt')).toBeInTheDocument();
    // Third product is on page 2
    expect(screen.queryByText('Book')).not.toBeInTheDocument();
  });

  it('handles pagination', async () => {
    renderProductList();

    // Wait for first page
    await screen.findByText('Laptop');
    expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument();

    // Go to next page
    await userEvent.click(screen.getByRole('button', { name: /next/i }));

    // Wait for second page
    expect(await screen.findByText('Book')).toBeInTheDocument();
    expect(screen.queryByText('Laptop')).not.toBeInTheDocument();
    expect(screen.getByText(/page 2 of 2/i)).toBeInTheDocument();
  });

  it('filters products by category', async () => {
    renderProductList();
    await screen.findByText('Laptop');

    const categoryFilter = screen.getByRole('combobox', { name: /category/i });
    await userEvent.selectOptions(categoryFilter, 'electronics');

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
      expect(screen.queryByText('Shirt')).not.toBeInTheDocument();
    });
  });

  it('shows empty state when no products match filter', async () => {
    server.use(
      rest.get('/api/products', (req, res, ctx) => {
        return res(ctx.json({
          products: [],
          total: 0,
          page: 1,
          totalPages: 0,
        }));
      })
    );

    renderProductList();
    expect(await screen.findByText(/no products found/i)).toBeInTheDocument();
  });

  it('shows error state and retry button on network failure', async () => {
    server.use(
      rest.get('/api/products', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );

    renderProductList();

    expect(await screen.findByText(/failed to load products/i))
      .toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i }))
      .toBeInTheDocument();
  });

  it('retries after error and displays data', async () => {
    let requestCount = 0;
    server.use(
      rest.get('/api/products', (req, res, ctx) => {
        requestCount++;
        if (requestCount === 1) {
          return res(ctx.status(500));
        }
        return res(ctx.json({
          products: mockProducts.slice(0, 2),
          total: 3,
          page: 1,
          totalPages: 2,
        }));
      })
    );

    renderProductList();

    // First request fails
    await screen.findByText(/failed to load/i);

    // Click retry
    await userEvent.click(screen.getByRole('button', { name: /retry/i }));

    // Second request succeeds
    expect(await screen.findByText('Laptop')).toBeInTheDocument();
  });

  it('shows product count', async () => {
    renderProductList();
    await screen.findByText('Laptop');
    expect(screen.getByText(/3 products/i)).toBeInTheDocument();
  });
});`,
      explanation: "This test suite uses MSW to mock API responses at the network level, testing the full data-fetching pipeline. It covers all states (loading, success, empty, error), pagination, filtering, retry functionality, and uses proper RTL patterns. The server.use() pattern allows overriding default handlers per test for error scenarios without affecting other tests. QueryClient is configured with retry: false to prevent test flakiness."
    },
    {
      title: "Test an Error Boundary Component",
      difficulty: "hard",
      description: "Write tests for a React Error Boundary that catches rendering errors, displays a fallback UI with error details, supports retry functionality, and reports errors to an error tracking service.",
      solution: `import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from './ErrorBoundary';
import * as errorReporting from './errorReporting';

// Component that throws on demand
function BuggyComponent({ shouldThrow = false }) {
  if (shouldThrow) {
    throw new Error('Component crashed!');
  }
  return <div>Working correctly</div>;
}

// Component that throws on second render
let renderCount = 0;
function IntermittentBug() {
  renderCount++;
  if (renderCount === 1) throw new Error('First render failed');
  return <div>Recovered successfully</div>;
}

describe('ErrorBoundary', () => {
  // Suppress React error logging in test output
  const originalError = console.error;
  beforeEach(() => {
    console.error = jest.fn();
    renderCount = 0;
    jest.restoreAllMocks();
  });
  afterEach(() => {
    console.error = originalError;
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <BuggyComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Working correctly')).toBeInTheDocument();
  });

  it('renders fallback UI when child throws', () => {
    render(
      <ErrorBoundary>
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.queryByText('Working correctly')).not.toBeInTheDocument();
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/component crashed/i)).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error page</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error page')).toBeInTheDocument();
  });

  it('provides retry button that re-renders children', async () => {
    render(
      <ErrorBoundary>
        <IntermittentBug />
      </ErrorBoundary>
    );

    // First render throws
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

    // Click retry
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));

    // Second render succeeds
    expect(screen.getByText('Recovered successfully')).toBeInTheDocument();
  });

  it('reports errors to error tracking service', () => {
    const reportSpy = jest.spyOn(errorReporting, 'captureException')
      .mockImplementation();

    render(
      <ErrorBoundary>
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(reportSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Component crashed!' }),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });

  it('calls onError prop when error occurs', () => {
    const onError = jest.fn();

    render(
      <ErrorBoundary onError={onError}>
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Component crashed!' }),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });

  it('catches errors from nested children', () => {
    function Parent() {
      return (
        <div>
          <h1>Parent</h1>
          <BuggyComponent shouldThrow={true} />
        </div>
      );
    }

    render(
      <ErrorBoundary>
        <Parent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('isolates errors to the boundary scope', () => {
    render(
      <div>
        <ErrorBoundary>
          <BuggyComponent shouldThrow={true} />
        </ErrorBoundary>
        <div>Unaffected sibling</div>
      </div>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText('Unaffected sibling')).toBeInTheDocument();
  });
});`,
      explanation: "Testing error boundaries requires: (1) a component that throws errors on demand, (2) suppressing console.error to keep test output clean, (3) testing both the error fallback and the retry/recovery flow. The suite tests default and custom fallbacks, error reporting integration, retry functionality, nested error catching, and error isolation. This covers all the behaviors users and developers depend on from an error boundary."
    }
  ],
  quiz: [
    {
      question: "Which query should you prefer when testing with React Testing Library?",
      options: [
        "getByTestId",
        "getByClassName",
        "getByRole",
        "container.querySelector"
      ],
      correct: 2,
      explanation: "getByRole is the highest-priority query in RTL because it reflects how assistive technologies (screen readers) and users perceive the page. Testing by role ensures your components are accessible. getByTestId should be a last resort, getByClassName doesn't exist in RTL, and container.querySelector bypasses RTL's abstraction."
    },
    {
      question: "What is the main advantage of Mock Service Worker (MSW) over jest.mock for API testing?",
      options: [
        "MSW is faster than jest.mock",
        "MSW tests the actual fetch/axios code path, not a replaced mock",
        "MSW doesn't require any setup",
        "MSW works only in the browser, not Node"
      ],
      correct: 1,
      explanation: "MSW intercepts at the network level, so your actual HTTP client code (fetch, axios, interceptors, retry logic) executes during tests. jest.mock replaces the module entirely, meaning you don't test how your code actually makes requests. MSW catches bugs in request construction, error handling, and response parsing that jest.mock would miss."
    },
    {
      question: "What does the 'testing trophy' emphasize compared to the traditional testing pyramid?",
      options: [
        "More E2E tests and fewer unit tests",
        "Integration tests as the largest layer for maximum confidence-to-effort ratio",
        "Only snapshot tests for React components",
        "Static analysis as the only testing approach"
      ],
      correct: 1,
      explanation: "Kent C. Dodds' testing trophy has static analysis at the base, then unit tests, then integration tests as the largest layer, then E2E tests at the top. Integration tests are emphasized because they test realistic component interactions (rendering, hooks, user events, API responses) without the fragility and cost of full E2E tests, providing the best return on testing investment."
    },
    {
      question: "Why should you use userEvent instead of fireEvent in React Testing Library?",
      options: [
        "userEvent is faster",
        "fireEvent is deprecated",
        "userEvent simulates the full browser event chain (focus, keydown, input, keyup, etc.)",
        "userEvent works with TypeScript, fireEvent does not"
      ],
      correct: 2,
      explanation: "userEvent simulates user interactions more realistically by firing the complete sequence of browser events. For example, typing with userEvent fires focus, keydown, keypress, input, and keyup events for each character, while fireEvent.change only fires a single change event. This catches bugs related to event handlers attached to intermediate events (like onKeyDown validation)."
    },
    {
      question: "When is snapshot testing most appropriate?",
      options: [
        "For testing every component's rendered output",
        "For large components with frequently changing markup",
        "For small, stable outputs like error messages or serialized configurations",
        "As a replacement for all other assertions"
      ],
      correct: 2,
      explanation: "Snapshot testing works best for small, stable outputs where you want to detect unintended changes. Large snapshots become unreviewed noise — developers blindly run 'update snapshot' without checking differences. Frequently changing components create snapshot churn. For most component testing, explicit assertions about user-visible behavior are more meaningful and maintainable."
    }
  ]
};
