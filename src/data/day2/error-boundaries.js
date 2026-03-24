export const errorBoundaries = {
  id: "error-boundaries",
  title: "Error Boundaries",
  icon: "\uD83D\uDEE1\uFE0F",
  tag: "React Advanced",
  tagColor: "var(--tag-react)",
  subtitle: "Gracefully catch and recover from rendering errors with error boundaries, fallback UIs, and recovery patterns",
  concepts: [
    {
      title: "Error Boundaries: What They Catch and What They Don't",
      explanations: {
        layman: "Error boundaries are like safety nets for your React app. If a component crashes, the safety net catches it and shows a backup screen instead of a blank page. CATCHES: errors that happen when React draws your screen (rendering, useEffect, lifecycle methods). DOES NOT CATCH: errors from button clicks, timers like setTimeout, or async code. For those, use regular try-catch. Simple rule: error boundaries guard the drawing. Everything else needs its own error handling.",
        mid: "Error boundaries are class components that catch errors during rendering. They CATCH errors in: render(), lifecycle methods (componentDidMount, componentDidUpdate), getDerivedStateFromProps, useEffect, and useLayoutEffect. They DO NOT CATCH: event handler errors (use try-catch), async code (promises, setTimeout), server-side rendering, or errors in the boundary itself. When an error is caught, getDerivedStateFromError sets state to show a fallback UI. componentDidCatch gets the error and component stack for logging.",
        senior: "Error boundaries have two methods that run at different times: getDerivedStateFromError runs during render (must be pure — just return new state), componentDidCatch runs after commit (safe for side effects like logging to Sentry). A boundary can't catch its own errors — if the fallback UI throws, the error bubbles to the parent boundary. Strategy: place boundaries at route level (each page fails independently), around third-party widgets, and around data-dependent sections. Always include a retry mechanism — a 'Try Again' button that resets the error state. There's no hook-based error boundary yet, but libraries like react-error-boundary give you a clean API with useErrorBoundary() for programmatic error throwing."
      },
      realWorld: "Wrapping third-party components that might crash, protecting routes so one broken page does not break the whole app, wrapping user-generated content, protecting dashboard widgets so one failure does not affect others.",
      whenToUse: "At route boundaries (each page gets its own), around third-party components, around complex features that can fail on their own, around components that process untrusted data.",
      whenNotToUse: "Do not use for expected errors like form validation or API 404s. Handle those with normal if/else rendering. Do not wrap every single component. Do not use error boundaries instead of fixing bugs.",
      pitfalls: "Error boundaries only catch rendering errors. Click handler errors need try-catch. Error boundaries must be class components (no hook version exists). If the fallback UI throws, the error goes to the parent boundary. Too many small error boundaries create a confusing user experience.",
      codeExamples: [
        {
          title: "Full-Featured Error Boundary Class Component",
          code: `class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  // Runs during render phase - set fallback state
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Runs during commit phase - log the error
  componentDidCatch(error, errorInfo) {
    console.error("Caught:", error);
    console.error("Stack:", errorInfo.componentStack);
    this.setState({ errorInfo });

    // Send to error tracking service
    if (typeof window !== "undefined" && window.Sentry) {
      window.Sentry.captureException(error, {
        extra: { componentStack: errorInfo.componentStack },
      });
    }
  }

  // Reset the error state to try again
  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Show custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          resetError: this.handleReset,
        });
      }

      // Default fallback UI
      return (
        <div role="alert" className="error-boundary-fallback">
          <h2>Something went wrong</h2>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error?.toString()}</pre>
            <pre>{this.state.errorInfo?.componentStack}</pre>
          </details>
          <button onClick={this.handleReset}>Try Again</button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage:
function App() {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="custom-error">
          <h2>Oops! {error.message}</h2>
          <button onClick={resetError}>Retry</button>
        </div>
      )}
    >
      <Dashboard />
    </ErrorBoundary>
  );
}`
        }
      ]
    },
    {
      title: "Error Boundary Placement Strategies and Recovery Patterns",
      explanations: {
        layman: "Think of error boundaries like fire doors in a building. You do not put a fire door around every desk. And you do not have just one for the whole building. You put them between floors and wings so a fire in one area does not bring down everything. Error boundaries work the same way: put them between major sections so a crash in one part does not break the rest.",
        mid: "There are four placement levels: (1) App-level: one boundary at the root. Last resort. Shows full-page error with reload button. (2) Route-level: each page wrapped separately. One broken page does not kill navigation. (3) Feature-level: widgets, sidebars, chat wrapped individually. They fail on their own. (4) Component-level: wrap risky components like third-party widgets. Recovery patterns: (a) Retry: reset error state and re-render children. (b) Fallback UI: show a simpler version. (c) Navigate away: redirect to a safe page. (d) Key-based reset: change the boundary's key prop to force a full remount.",
        senior: "When an error boundary catches an error, all state inside the crashed subtree is lost — React can't recover partial state. To implement retry, change the boundary's `key` prop: `<ErrorBoundary key={retryCount}>`. This forces React to create a fresh subtree, cleanly resetting everything. For Suspense interaction: if a lazy component fails to load, the error goes to the error boundary, not Suspense. Wrap it as: `<ErrorBoundary><Suspense fallback={<Spinner />}><LazyComponent /></Suspense></ErrorBoundary>`. The `componentDidCatch` method gives you the component stack trace, which shows the exact component hierarchy (App > Dashboard > Widget > Chart) — much more useful than a JavaScript stack trace for finding which component crashed."
      },
      realWorld: "Dashboard apps where widgets should fail independently. E-commerce sites where a sidebar crash should not block checkout. Email clients where one broken preview should not block the inbox. Code editors where a plugin crash should not lose your work.",
      whenToUse: "Use multiple boundaries at different levels: app-level (last resort), route-level (per page), and feature-level (independent sections). Use key-based reset when retry should start fresh. Use retry pattern for temporary errors.",
      whenNotToUse: "Do not wrap every component individually. Too many error states confuse users. Do not use for non-rendering errors. Do not retry without a limit or you get infinite loops.",
      pitfalls: "Resetting error state without changing the key prop means the same broken component renders and errors again. Forgetting to log errors means you will never know about production crashes. Error boundaries in SSR work differently. The componentStack only shows component names, not exact lines of code.",
      codeExamples: [
        {
          title: "Layered Error Boundaries with Key-Based Reset",
          code: `function App() {
  return (
    // App-level: last resort
    <ErrorBoundary fallback={<FullPageError />}>
      <Layout>
        <Sidebar>
          {/* Feature-level: sidebar fails on its own */}
          <ErrorBoundary fallback={<SidebarError />}>
            <Navigation />
            <RecentActivity />
          </ErrorBoundary>
        </Sidebar>

        <Main>
          {/* Route-level: each page fails on its own */}
          <ErrorBoundary
            fallback={({ error, resetError }) => (
              <PageError error={error} onRetry={resetError} />
            )}
          >
            <Suspense fallback={<PageSpinner />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Main>
      </Layout>
    </ErrorBoundary>
  );
}

// Key-based reset: change key to fully remount children
function ResettableWidget({ widgetId }) {
  const [resetKey, setResetKey] = useState(0);

  return (
    <ErrorBoundary
      key={resetKey}
      fallback={({ error }) => (
        <div className="widget-error">
          <p>Widget crashed: {error.message}</p>
          <button onClick={() => setResetKey((k) => k + 1)}>
            Reset Widget
          </button>
        </div>
      )}
    >
      <Widget id={widgetId} />
    </ErrorBoundary>
  );
}`
        }
      ]
    },
    {
      title: "Why No Hook-Based Error Boundary (and Workarounds)",
      explanations: {
        layman: "Hooks run inside a component while it is rendering. But error boundaries need to catch errors from child components after they already crashed. A hook inside a component cannot catch errors from its children. It is like asking a cook to also be the fire alarm. The cook works inside the kitchen, but the fire alarm needs to watch from outside. React has not added a hook that can watch from outside yet.",
        mid: "Error boundaries need two class methods: getDerivedStateFromError (runs during error recovery, before render, to set fallback state) and componentDidCatch (runs after render for logging). There is no hook version because: (1) getDerivedStateFromError runs during error recovery, outside normal rendering. A hook in the crashed component cannot run because that component already threw. (2) The catching must happen on a parent component, but hooks run inside their own component. The React team has discussed a useErrorBoundary hook but has not shipped one. The react-error-boundary library is the recommended workaround.",
        senior: "The core issue is in React's Fiber error handling. When a fiber throws, throwException in ReactFiberThrow walks up the tree looking for a fiber with the ShouldCapture flag. This flag is set on class components with getDerivedStateFromError or componentDidCatch. Function components have no way to set this flag. Adding a hook would require: (1) A new hook primitive that registers a catch handler on the fiber node. (2) Synchronous state updates during the render phase, conflicting with how useState batches updates. (3) Clear cleanup semantics for effects of the failed render. The react-error-boundary library by Brian Vaughn wraps a class component with a hooks-friendly API, which is the standard workaround."
      },
      realWorld: "The react-error-boundary library gives you an ErrorBoundary component with hooks-friendly features: useErrorBoundary hook for throwing errors from event handlers, onError callback, onReset callback, and resetKeys for auto-reset.",
      whenToUse: "Use react-error-boundary for a hooks-friendly API. Use class-based boundaries for custom behavior. Use the useErrorBoundary hook to show the nearest boundary's fallback from event handlers.",
      whenNotToUse: "Do not try to build a hook-based error boundary from scratch. It is not possible with current React APIs. Do not avoid error boundaries just because they need class components. One class component in a hooks codebase is fine.",
      pitfalls: "Wrapping a class boundary in a function component does not make it hook-based. The class does all the work. The useErrorBoundary hook from react-error-boundary does not catch render errors in the same component. It throws them to the nearest boundary above. Using resetKeys without fixing the root cause creates infinite error loops.",
      codeExamples: [
        {
          title: "Using react-error-boundary Library",
          code: `import {
  ErrorBoundary,
  useErrorBoundary,
} from "react-error-boundary";

// Fallback shown when an error is caught
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" className="error-fallback">
      <h2>Something went wrong</h2>
      <pre className="error-message">{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

// useErrorBoundary lets you send errors to the boundary
// from event handlers (which boundaries normally cannot catch)
function DataEditor({ data }) {
  const { showBoundary } = useErrorBoundary();

  const handleSave = async () => {
    try {
      await saveData(data);
    } catch (error) {
      // Send this error to the nearest ErrorBoundary
      showBoundary(error);
    }
  };

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <button onClick={handleSave}>Save</button>
    </div>
  );
}

// resetKeys: boundary auto-resets when these values change
function App() {
  const [userId, setUserId] = useState(1);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        // Log error to monitoring service
        logErrorToService(error, info.componentStack);
      }}
      onReset={() => {
        console.log("Error boundary reset");
      }}
      resetKeys={[userId]} // Auto-reset when userId changes
    >
      <UserProfile userId={userId} />
      <button onClick={() => setUserId((id) => id + 1)}>
        Next User
      </button>
    </ErrorBoundary>
  );
}`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "What errors do error boundaries catch, and what errors do they NOT catch?",
      answer: "Easy rule: error boundaries catch errors during React's rendering, nothing else. CATCHES: (1) Component render functions. (2) Lifecycle methods like componentDidMount and componentDidUpdate. (3) Constructors of child components. (4) useEffect and useLayoutEffect (React wraps these in try-catch). DOES NOT CATCH: (1) Event handlers like onClick. Use try-catch for these. (2) Async code like setTimeout or Promise callbacks. (3) Server-side rendering. (4) Errors in the boundary itself. Those go to the next boundary up. Think of it this way: error boundaries protect rendering. Everything else needs normal JavaScript error handling.",
      difficulty: "easy",
      followUps: [
        "How would you catch errors in event handlers?",
        "What happens if an error boundary's render method throws?",
        "Do error boundaries catch errors in useEffect?"
      ]
    },
    {
      question: "Explain the difference between getDerivedStateFromError and componentDidCatch. Why are there two methods?",
      answer: "getDerivedStateFromError is a static method that runs during the render phase. It takes the error and returns new state to show the fallback UI. It must be pure with no side effects. componentDidCatch runs during the commit phase. It gets the error plus an errorInfo object with the component stack trace. It is meant for side effects like logging. Two methods exist because React separates rendering (pure, can be retried) from committing (side effects, runs once). getDerivedStateFromError answers 'what to show.' componentDidCatch answers 'what to do about it.' You can use getDerivedStateFromError alone for just a fallback UI, but you need componentDidCatch for error logging.",
      difficulty: "mid",
      followUps: [
        "Why is getDerivedStateFromError a static method?",
        "What information is in the errorInfo.componentStack?",
        "Can you use only one of the two methods?"
      ]
    },
    {
      question: "Why is there no hook-based error boundary in React?",
      answer: "Error boundaries must catch errors from child components during rendering, not from the component itself. When a child throws, React walks up the Fiber tree looking for a parent with a ShouldCapture flag (set by getDerivedStateFromError/componentDidCatch on class components). Hooks run inside their own component, so they cannot catch errors from children during the parent's render. getDerivedStateFromError is a static method that runs during error recovery, outside the normal lifecycle. There is no hooks version of this. The react-error-boundary library solves this by wrapping a class component with a hooks-friendly API. Its useErrorBoundary hook lets you trigger the boundary from event handlers, but the boundary itself is still a class component.",
      difficulty: "hard",
      followUps: [
        "What is the react-error-boundary library and how does it help?",
        "Could React theoretically add a useErrorBoundary hook?",
        "How does the ShouldCapture flag work in Fiber?"
      ]
    },
    {
      question: "How do error boundaries interact with React Suspense?",
      answer: "They handle different things thrown during rendering. Suspense catches thrown Promises and shows a loading fallback. Error boundaries catch thrown Errors and show an error fallback. If a lazy-loaded chunk fails to load, the rejected promise becomes an error that goes to the error boundary, not Suspense. Best practice: put ErrorBoundary outside Suspense: `<ErrorBoundary><Suspense fallback={<Spinner />}><LazyComponent /></Suspense></ErrorBoundary>`. This way Suspense handles loading states and the boundary handles errors. If Suspense were outside, a load failure would skip the error boundary.",
      difficulty: "hard",
      followUps: [
        "What happens if you put Suspense outside the ErrorBoundary?",
        "How does startTransition interact with error boundaries?",
        "Can an error in a Suspense fallback be caught by an error boundary?"
      ]
    },
    {
      question: "Describe your strategy for error boundary placement in a large production React application.",
      answer: "I use layers: (1) App-level boundary at the root. Last resort. Full-page error with reload button. (2) Layout-level boundaries around header, sidebar, and main content separately. A sidebar crash should not kill main content. (3) Route-level boundaries per page. This is the most important layer. Each page gets its own error UI and retry button. (4) Feature-level boundaries around independent features like widgets, third-party integrations, and chat panels. (5) Critical component boundaries around anything rendering untrusted data. Each boundary logs errors to a service like Sentry, shows a user-friendly fallback matching its scope, and offers a way to recover (retry, navigate away, or key-based reset). I do not wrap every small component. The granularity should match the recovery experience.",
      difficulty: "mid",
      followUps: [
        "How would you test error boundaries?",
        "How do you handle error boundaries in SSR?",
        "How do you prevent error boundary infinite loops?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Build an Error Boundary with Retry and Exponential Backoff",
      difficulty: "mid",
      description: "Create an error boundary that automatically retries rendering its children up to 3 times with exponential backoff delays. After max retries, show a permanent error UI with a manual retry button.",
      solution: `class RetryErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
      isRetrying: false,
    };
    this.maxRetries = props.maxRetries || 3;
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    const { retryCount } = this.state;

    console.error(
      \`Error (attempt \${retryCount + 1}/\${this.maxRetries}):\`,
      error,
      errorInfo.componentStack
    );

    // Auto-retry if we have retries left
    if (retryCount < this.maxRetries) {
      // Wait longer each time: 1s, 2s, 4s
      const delay = Math.pow(2, retryCount) * 1000;
      this.setState({ isRetrying: true });

      setTimeout(() => {
        this.setState((prev) => ({
          hasError: false,
          error: null,
          retryCount: prev.retryCount + 1,
          isRetrying: false,
        }));
      }, delay);
    } else {
      // All retries used up
      this.props.onMaxRetriesExceeded?.(error, errorInfo);
    }
  }

  // Reset everything and start over
  handleManualRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      retryCount: 0,
      isRetrying: false,
    });
  };

  render() {
    const { hasError, error, retryCount, isRetrying } = this.state;

    // Show spinner while waiting to retry
    if (isRetrying) {
      return (
        <div className="retry-overlay">
          <div className="spinner" />
          <p>Retrying... (attempt {retryCount + 1} of {this.maxRetries})</p>
        </div>
      );
    }

    // Show permanent error after all retries fail
    if (hasError) {
      if (retryCount >= this.maxRetries) {
        return (
          <div role="alert" className="error-permanent">
            <h3>Something went wrong</h3>
            <p>We tried {this.maxRetries} times but it kept failing.</p>
            <pre className="error-detail">{error?.message}</pre>
            <button onClick={this.handleManualRetry}>
              Try Again From Scratch
            </button>
          </div>
        );
      }
    }

    return this.props.children;
  }
}

// Usage:
function App() {
  return (
    <RetryErrorBoundary
      maxRetries={3}
      onMaxRetriesExceeded={(error) => {
        sendToSentry(error);
      }}
    >
      <UnstableWidget />
    </RetryErrorBoundary>
  );
}`,
      explanation: "The boundary tracks how many times it has retried. When componentDidCatch fires and retries are left, it waits using setTimeout with increasing delays (1s, 2s, 4s). During the wait, it shows a retrying message. When the timer fires, it resets hasError to false, which makes React try rendering the children again. If they crash again, the cycle repeats with a higher retry count. After all retries fail, it shows a permanent error screen with a manual retry button that resets everything to zero."
    },
    {
      title: "Create a useErrorHandler Hook for Event Handler Errors",
      difficulty: "easy",
      description: "Since error boundaries don't catch event handler errors, create a useErrorHandler hook that can catch async/event errors and propagate them to the nearest error boundary.",
      solution: `// This hook bridges event handler errors to error boundaries.
// It stores the error in state, then throws it during render
// so the nearest error boundary can catch it.
function useErrorHandler() {
  const [error, setError] = useState(null);

  // Throw during render so error boundary catches it
  if (error) {
    throw error;
  }

  // Call this to send an error to the boundary
  const handleError = useCallback((error) => {
    setError(error);
  }, []);

  // Wraps an async function to auto-catch errors
  const wrapAsync = useCallback(
    (asyncFn) => {
      return async (...args) => {
        try {
          return await asyncFn(...args);
        } catch (err) {
          setError(err);
        }
      };
    },
    []
  );

  return { handleError, wrapAsync };
}

// Usage:
function UserActions({ userId }) {
  const { handleError, wrapAsync } = useErrorHandler();
  const [deleting, setDeleting] = useState(false);

  // Option 1: Manual try-catch, then call handleError
  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteUser(userId);
    } catch (error) {
      handleError(error); // Sends error to boundary
    } finally {
      setDeleting(false);
    }
  };

  // Option 2: Wrap the whole async function
  const handleExport = wrapAsync(async () => {
    const data = await exportUserData(userId);
    downloadFile(data);
  });

  return (
    <div>
      <button onClick={handleDelete} disabled={deleting}>
        {deleting ? "Deleting..." : "Delete User"}
      </button>
      <button onClick={handleExport}>Export Data</button>
    </div>
  );
}

// Wrap in error boundary
function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <UserActions userId={123} />
    </ErrorBoundary>
  );
}`,
      explanation: "The trick is simple: error boundaries catch errors thrown during render. This hook stores the error in state using useState. On the next render, it throws the error (the if (error) throw error line), which the error boundary catches. The wrapAsync helper wraps any async function so errors are automatically caught and stored. This connects event handlers (which boundaries cannot catch) to the error boundary system."
    },
    {
      title: "Build an Error Boundary That Shows Different Fallbacks Based on Error Type",
      difficulty: "mid",
      description: "Create an error boundary that renders different fallback UIs based on the type of error: NetworkError shows a retry button, AuthError shows a login redirect, ValidationError shows the specific validation message, and unknown errors show a generic fallback.",
      solution: `// Custom error types
class NetworkError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "NetworkError";
    this.statusCode = statusCode;
  }
}

class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthError";
  }
}

class ValidationError extends Error {
  constructor(message, fields) {
    super(message);
    this.name = "ValidationError";
    this.fields = fields; // List of bad fields
  }
}

// Error boundary that checks error type
class TypedErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logToService(error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  // Show different UI based on error type
  renderFallback() {
    const { error } = this.state;

    // Network error: show retry button
    if (error instanceof NetworkError) {
      return (
        <div className="error-network" role="alert">
          <h3>Connection Problem</h3>
          <p>
            {error.statusCode === 503
              ? "The server is temporarily down."
              : "Could not connect to the server."}
          </p>
          <button onClick={this.reset}>Retry</button>
        </div>
      );
    }

    // Auth error: redirect to login
    if (error instanceof AuthError) {
      return (
        <div className="error-auth" role="alert">
          <h3>Session Expired</h3>
          <p>Please log in again.</p>
          <button
            onClick={() => {
              window.location.href = "/login?redirect=" +
                encodeURIComponent(window.location.pathname);
            }}
          >
            Go to Login
          </button>
        </div>
      );
    }

    // Validation error: show which fields are wrong
    if (error instanceof ValidationError) {
      return (
        <div className="error-validation" role="alert">
          <h3>Invalid Data</h3>
          <p>{error.message}</p>
          <ul>
            {error.fields?.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
          <button onClick={this.reset}>Fix and Retry</button>
        </div>
      );
    }

    // Unknown error: generic fallback
    return (
      <div className="error-generic" role="alert">
        <h3>Something went wrong</h3>
        <p>An unexpected error happened.</p>
        <details>
          <summary>Technical details</summary>
          <pre>{error?.message}</pre>
        </details>
        <button onClick={this.reset}>Try Again</button>
        <button onClick={() => window.location.reload()}>
          Reload Page
        </button>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderFallback();
    }
    return this.props.children;
  }
}

// Usage:
function DataComponent({ url }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(url).then(res => {
      if (res.status === 401) throw new AuthError("Unauthorized");
      if (!res.ok) throw new NetworkError("Request failed", res.status);
      return res.json();
    }).then(setData);
  }, [url]);

  // Throws during render, so the boundary catches it
  if (data?.invalid) {
    throw new ValidationError("Data format invalid", ["field1", "field2"]);
  }

  return <div>{JSON.stringify(data)}</div>;
}`,
      explanation: "The boundary uses instanceof to check what kind of error it caught and shows a different fallback for each. Network errors get a retry button. Auth errors redirect to login with the current URL saved. Validation errors list the bad fields. Unknown errors show a generic screen. Custom error classes extend Error and add useful properties like statusCode or fields. This gives users a much better experience than a one-size-fits-all error message."
    }
  ],
  quiz: [
    {
      question: "Which of the following errors will NOT be caught by an error boundary?",
      options: [
        "An error thrown inside a useEffect cleanup function",
        "An error thrown inside an onClick event handler",
        "An error thrown inside a component's render method",
        "An error thrown inside getDerivedStateFromProps"
      ],
      correct: 1,
      explanation: "Event handler errors are NOT caught by error boundaries. Error boundaries only catch errors during rendering and lifecycle methods. Event handlers run outside React's rendering cycle, so you need regular try-catch for them. Errors in useEffect (including cleanup), render methods, and getDerivedStateFromProps are all caught."
    },
    {
      question: "Why is getDerivedStateFromError a static method while componentDidCatch is an instance method?",
      options: [
        "It's a historical API design inconsistency",
        "getDerivedStateFromError runs during the render phase (must be pure), componentDidCatch runs during commit phase (can have side effects)",
        "Static methods are faster than instance methods",
        "getDerivedStateFromError doesn't need access to the error object"
      ],
      correct: 1,
      explanation: "getDerivedStateFromError is static because it runs during the render phase, which must be pure and free of side effects. This is important in concurrent mode where renders can be retried. It only computes new state from the error. componentDidCatch is an instance method because it runs during the commit phase, where side effects like logging and analytics are allowed and should only happen once."
    },
    {
      question: "What is the recommended nesting order for ErrorBoundary and Suspense?",
      options: [
        "Suspense should always be outside ErrorBoundary",
        "ErrorBoundary should be outside Suspense so it can catch loading failures",
        "They should never be used together",
        "The order doesn't matter"
      ],
      correct: 1,
      explanation: "Put ErrorBoundary outside Suspense: `<ErrorBoundary><Suspense><Lazy /></Suspense></ErrorBoundary>`. If a lazy chunk fails to load (rejected promise), the error goes to the ErrorBoundary which shows an error UI. If Suspense were outside, a loading failure would skip the ErrorBoundary. Suspense handles loading (pending promise). ErrorBoundary handles errors (rejected promise or thrown error)."
    },
    {
      question: "What happens to the state of all child components when an error boundary catches an error?",
      options: [
        "Child component state is preserved and restored after recovery",
        "All child component state is lost \u2014 the subtree is unmounted and replaced with the fallback",
        "Only the state of the component that threw is lost",
        "State is saved to sessionStorage automatically"
      ],
      correct: 1,
      explanation: "When an error boundary catches an error, React unmounts the entire subtree below it and replaces it with the fallback UI. ALL state, refs, and DOM nodes in the subtree are destroyed. When the error clears and children re-render, they start fresh with initial state. This is why key-based reset works well for recovery. Changing the key forces a complete remount, which is the cleanest way to start over."
    }
  ]
};
