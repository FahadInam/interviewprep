export const middlewareTopic = {
  id: "middleware",
  title: "Middleware & Edge Runtime",
  icon: "🔗",
  tag: "Next.js",
  tagColor: "var(--tag-next)",
  subtitle: "Request interception, edge functions, and middleware patterns",
  concepts: [
    {
      title: "Next.js Middleware — The Request Interceptor",
      explanations: {
        layman: "Middleware is like a security guard at the front door of a building. Every visitor must pass through the guard before reaching any room. The guard can: check your ID and turn you away (authentication), send you to a different floor (redirect), put a visitor badge on you (add headers), or silently route you to a special entrance (URL rewrite). The guard is fast because they stand right at the door (Edge Runtime, close to the user), but they cannot do heavy work like cooking meals -- just quick checks and decisions.",
        mid: "Middleware in Next.js is a function exported from a middleware.js file at the project root (or src/ root). It runs before every matched request, intercepting the request/response cycle. You can read/modify headers, cookies, redirect users, rewrite URLs, or return early with a custom response. Middleware runs on the Edge Runtime, which means it executes close to the user geographically for low latency. It receives a NextRequest object and must return a NextResponse. The matcher config controls which paths trigger the middleware, avoiding unnecessary execution on static assets.",
        senior: "Middleware executes in the Edge Runtime (based on V8 isolates, not Node.js), which provides sub-millisecond cold starts and global distribution. This has significant implications: no access to Node.js APIs (fs, child_process, native modules), limited to Web APIs (fetch, crypto, TextEncoder, URL), a 1MB code size limit on Vercel, and no long-running connections. Middleware runs in a single pass per request — there's no middleware chain like Express. If you need multiple middleware behaviors (auth + i18n + A/B testing), you compose them manually in a single function. Middleware executes BEFORE the route cache is checked, making it ideal for personalization that must bypass static caches. However, be cautious: middleware runs on EVERY request (including prefetches), so expensive operations (database queries, external API calls) can severely impact performance. Use matcher to scope middleware to only necessary paths."
      },
      realWorld: "Authentication checks before protected pages, redirecting users based on geolocation (US users to /en, EU users to /eu), A/B testing by rewriting to different page variants, adding security headers to all responses, rate limiting API routes.",
      whenToUse: "Use middleware for cross-cutting concerns that must run before route handling: authentication redirects, geolocation-based routing, A/B testing, bot detection, feature flags, and security headers. Use it when you need to modify the request or response before it hits any page or API route.",
      whenNotToUse: "Don't use middleware for heavy computation, database queries, or anything that requires Node.js APIs. Don't use it for page-specific logic that only applies to one route — put that in the page's Server Component instead. Don't use it for data fetching — it adds latency to every request.",
      pitfalls: "Middleware runs on EVERY matched request including prefetches and static asset requests — use matcher to avoid this. The Edge Runtime lacks Node.js APIs, so libraries like bcrypt, sharp, or database drivers that use native modules won't work. Middleware can't read the request body for non-GET requests easily. Adding async operations (fetch calls) to middleware increases latency for every page load. Middleware doesn't have access to the route's params directly — you must parse them from the URL.",
      codeExamples: [
        {
          title: "Basic Middleware with Authentication Redirect",
          code: `// middleware.js (project root or src/)
import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("session-token")?.value;
  const { pathname } = request.nextUrl;

  // Allow access to public routes
  const publicPaths = ["/login", "/signup", "/about"];
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Add custom header for downstream use
  const response = NextResponse.next();
  response.headers.set("x-user-authenticated", "true");
  return response;
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    // Match all paths except static files and API routes
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};`
        },
        {
          title: "A/B Testing with URL Rewriting",
          code: `// middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Only A/B test the homepage
  if (pathname !== "/") return NextResponse.next();

  // Check for existing bucket assignment
  let bucket = request.cookies.get("ab-bucket")?.value;

  if (!bucket) {
    // Assign 50/50 split
    bucket = Math.random() < 0.5 ? "control" : "variant";
  }

  // Rewrite to the variant page (URL stays as /)
  const url = request.nextUrl.clone();
  url.pathname = bucket === "variant" ? "/home-variant" : "/home-control";

  const response = NextResponse.rewrite(url);

  // Persist bucket assignment for 30 days
  response.cookies.set("ab-bucket", bucket, {
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  });

  return response;
}

export const config = {
  matcher: ["/"],
};`
        }
      ]
    },
    {
      title: "Matcher Configuration & Path Filtering",
      explanations: {
        layman: "Imagine your security guard only needs to check badges on certain floors — they don't need to stand at the entrance to the cafeteria or the parking lot. The matcher configuration tells Next.js middleware which paths it should run on, so it doesn't waste time processing requests for images, CSS files, or other static assets.",
        mid: "The matcher config is an array of path patterns that determine which requests trigger the middleware. Without a matcher, middleware runs on every request (including _next/static assets). Patterns support basic wildcards: '/dashboard/:path*' matches /dashboard and all sub-paths. You can use regex-like syntax for more complex matching. Negative lookahead patterns like '/((?!api|_next).*' exclude specific prefixes. Each pattern is tested against the request pathname — query strings are not considered.",
        senior: "The matcher is evaluated at build time and compiled into an efficient path-matching function. It uses path-to-regexp under the hood (same as Express routing). Key patterns: ':path*' matches zero or more segments, ':path+' matches one or more. The matcher only matches against the pathname, not search params or hash. In production, improper matchers are a major performance issue — matching too broadly means middleware runs on every prefetch, image request, and chunk load. The recommended production pattern is to explicitly list the paths you need and exclude everything else. Note: the matcher doesn't support dynamic runtime evaluation — it's static configuration. For dynamic path filtering, add conditional logic inside the middleware function itself."
      },
      realWorld: "Scoping auth middleware to only /dashboard/* and /api/* paths, excluding static assets and public pages from middleware processing, matching specific route patterns for feature flags.",
      whenToUse: "Always use a matcher to scope your middleware. Never let middleware run on every request without filtering — it degrades performance for static assets and prefetches.",
      whenNotToUse: "If your middleware truly needs to run on every request (e.g., security headers for all responses), you can omit the matcher, but be aware of the performance implications.",
      pitfalls: "Forgetting to exclude _next/static and _next/image causes middleware to run on every asset request. Regex patterns in matcher can be tricky — test them thoroughly. The matcher doesn't support query parameter matching — use conditional logic inside the middleware function for that. Middleware runs on prefetch requests too, which can cause unexpected behavior with A/B tests or redirects.",
      codeExamples: [
        {
          title: "Common Matcher Patterns",
          code: `// Match specific paths
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/:path*"],
};

// Match everything EXCEPT static files and images
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

// Match specific file extensions (e.g., only HTML pages)
export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      // Skip middleware for prefetch requests
      missing: [
        { type: "header", key: "next-router-prefetch" },
      ],
    },
  ],
};`
        }
      ]
    },
    {
      title: "Edge Runtime Limitations & NextResponse API",
      explanations: {
        layman: "The Edge Runtime is like a tiny security booth at the gate versus a full office building inside. The booth opens instantly and is right next to the visitor (low latency), but it only has a clipboard and a walkie-talkie. It cannot access the filing cabinet (no file system), cannot run heavy machinery (no Node.js), and cannot store much (limited memory). It can check IDs, redirect people, and add visitor badges -- quick, simple tasks only. For anything heavier, you send the visitor inside to the main building (Node.js runtime).",
        mid: "The Edge Runtime is built on V8 isolates (same engine as Chrome) but without Node.js. Available APIs: fetch, Request, Response, URL, crypto, TextEncoder/TextDecoder, setTimeout, structuredClone. NOT available: fs, path, child_process, Buffer (use Uint8Array), most npm packages that use native modules. NextResponse extends the Web Response API with helpers: NextResponse.redirect(url) for redirects, NextResponse.rewrite(url) for transparent URL rewriting, NextResponse.next() to continue to the route handler, and methods for setting cookies and headers. The Edge Runtime starts in microseconds (no cold starts) and runs at CDN edge locations globally.",
        senior: "Edge Runtime V8 isolates have strict constraints: 1MB code size limit (on Vercel), 128MB memory limit, 30-second execution timeout, no eval() or new Function() (CSP restrictions). The lack of Node.js APIs means you cannot use: pg/mysql2 (database drivers with native bindings), bcrypt (native crypto), sharp (image processing), or any npm package with a native addon. For auth in middleware, you're limited to JWT verification using the Web Crypto API or lightweight libraries like jose. NextResponse.rewrite() is particularly powerful — it changes the internal route resolution without changing the user's URL, enabling A/B tests, multi-tenant routing, and feature flags. The cookies() method on NextResponse handles Set-Cookie header properly (multiple cookies, attributes). A critical production pattern: use middleware only for lightweight checks (JWT signature verification, cookie presence) and defer heavy operations (database permission checks) to Server Components."
      },
      realWorld: "Using jose library for JWT verification in middleware instead of jsonwebtoken (which requires Node.js). Geolocation-based routing using the request's geo property. Setting security headers (CSP, HSTS, X-Frame-Options) on all responses via middleware.",
      whenToUse: "Use the Edge Runtime when you need global low-latency execution for lightweight operations. It's ideal for auth token verification, URL rewriting, header manipulation, and cookie management.",
      whenNotToUse: "Don't use Edge Runtime (middleware) for database queries, image processing, heavy computation, or any operation requiring Node.js APIs. Use Server Components or Route Handlers with the Node.js runtime for those.",
      pitfalls: "Importing a Node.js-dependent library crashes middleware at build time, not runtime — easy to miss during development. The 1MB bundle limit can be exceeded by large libraries (e.g., importing all of lodash). fetch() in middleware doesn't have Next.js caching extensions — it's standard Web fetch. Error handling is limited — unhandled errors in middleware return a 500 with minimal error info.",
      codeExamples: [
        {
          title: "NextResponse API — Redirect, Rewrite, and Headers",
          code: `import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;

  // 1. REDIRECT — changes the URL, sends 307/308 to browser
  if (pathname === "/old-page") {
    return NextResponse.redirect(new URL("/new-page", request.url));
  }

  // 2. REWRITE — changes route internally, URL stays the same
  if (pathname === "/blog" && searchParams.get("preview")) {
    return NextResponse.rewrite(new URL("/blog/preview-mode", request.url));
  }

  // 3. Continue with modified headers
  const response = NextResponse.next();

  // Set security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'"
  );

  // Set/modify cookies
  response.cookies.set("visited", "true", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 1 day
  });

  return response;
}

// 4. Geolocation-based routing (Vercel provides geo data)
export function middleware(request) {
  const country = request.geo?.country || "US";
  if (country === "DE") {
    return NextResponse.rewrite(new URL("/de" + request.nextUrl.pathname, request.url));
  }
  return NextResponse.next();
}`
        },
        {
          title: "JWT Verification with jose (Edge-Compatible)",
          code: `// middleware.js
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request) {
  const token = request.cookies.get("auth-token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // jose works on Edge Runtime (no Node.js dependency)
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Add user info to headers for downstream use
    const response = NextResponse.next();
    response.headers.set("x-user-id", payload.sub);
    response.headers.set("x-user-role", payload.role);
    return response;
  } catch (error) {
    // Token expired or invalid
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("auth-token");
    return response;
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/protected/:path*"],
};`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "What is Next.js middleware, where does it run, and what are its primary use cases?",
      answer: "Middleware is a single function in middleware.js at the project root that runs before every matched request reaches any page or API route. It executes on the Edge Runtime (V8 isolates, not Node.js), meaning it runs at CDN edge locations worldwide with sub-millisecond cold starts. Think of it as one security checkpoint for your entire app. Primary use cases: (1) Auth redirects -- check for a session cookie and redirect to /login if missing. (2) Geo-routing -- send users to country-specific pages. (3) A/B testing -- rewrite URLs to variant pages without changing the visible URL. (4) Security headers -- add CSP, HSTS to all responses. The critical limitation: Edge Runtime has no Node.js APIs, so you cannot use database drivers, bcrypt, or fs. Keep middleware lightweight -- quick checks only, no heavy computation.",
      difficulty: "easy",
      followUps: [
        "What's the difference between running middleware on the Edge vs in a Node.js server?",
        "Can middleware access the request body?"
      ]
    },
    {
      question: "Explain the difference between NextResponse.redirect() and NextResponse.rewrite(). When would you use each?",
      answer: "redirect() sends an HTTP redirect response (307 or 308) to the browser, causing the URL bar to change. The browser makes a new request to the target URL. Use it when the URL should visibly change (old URLs to new ones, unauthenticated users to login). rewrite() internally remaps the request to a different route without the browser knowing — the URL bar stays the same. The response comes from the rewritten route but the user sees the original URL. Use it for A/B testing (/ rewrites to /home-variant), multi-tenant apps (example.com rewrites to /tenant/example internally), and feature flags (same URL, different implementation).",
      difficulty: "mid",
      followUps: [
        "Does a rewrite affect client-side navigation?",
        "Can you chain a rewrite with header modifications?"
      ]
    },
    {
      question: "What are the limitations of the Edge Runtime, and how do they affect what you can do in middleware?",
      answer: "The Edge Runtime lacks Node.js APIs: no fs, path, child_process, Buffer, or native module support. This means no database drivers with native bindings (pg, mysql2), no bcrypt, no sharp, and many npm packages won't work. There's a 1MB code size limit (Vercel) and 128MB memory limit. You can't use eval() or new Function(). Available APIs are limited to Web standards: fetch, crypto, URL, TextEncoder, Response, Headers. This means middleware should only do lightweight operations: JWT verification (using jose, not jsonwebtoken), cookie checks, URL manipulation, and header modifications. Heavy operations like database permission checks should be deferred to Server Components running on the Node.js runtime.",
      difficulty: "hard",
      followUps: [
        "How would you do database-backed authorization if you can't query a database in middleware?",
        "What's the maximum execution time for middleware on Vercel?"
      ]
    },
    {
      question: "How would you implement A/B testing using middleware? What considerations affect the implementation?",
      answer: "Assign users to buckets via a cookie in middleware. On first visit, randomly assign 'control' or 'variant', set a cookie, and rewrite to the corresponding page variant. On subsequent visits, read the cookie and rewrite consistently. Considerations: (1) Consistency — always use the same bucket for the same user via cookies. (2) Bot handling — search engine crawlers should see the canonical version. (3) Analytics — pass the bucket value to analytics via headers or cookies. (4) Caching — rewrites bypass the Full Route Cache, which is correct for personalization. (5) Performance — middleware runs on every request, so keep the logic lightweight. (6) Statistical validity — ensure randomization is truly random and sample sizes are large enough.",
      difficulty: "mid",
      followUps: [
        "How do you prevent search engines from indexing the variant page?",
        "How would you gradually roll out a new feature using this pattern?"
      ]
    },
    {
      question: "Why should you always use a matcher config with middleware, and what happens if you don't?",
      answer: "Without a matcher, middleware runs on EVERY request — including requests for static files (_next/static JavaScript chunks, CSS files), images (_next/image), favicons, and prefetch requests from next/link. This adds unnecessary latency to every resource load, potentially degrading page performance significantly. The matcher limits middleware execution to only the paths that need it. A common production matcher excludes static assets and images: '/((?!_next/static|_next/image|favicon.ico).*)'. You can also target specific paths: ['/dashboard/:path*', '/api/:path*']. For even more control, use the missing/has conditions to skip prefetch requests or match on headers.",
      difficulty: "easy",
      followUps: [
        "How do prefetch requests interact with middleware?",
        "Can you use regex in the matcher?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Multi-Feature Middleware Composition",
      difficulty: "hard",
      description: "Build a middleware that combines authentication, geolocation-based redirects, and security headers in a single function with clean composition.",
      solution: `// middleware.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Individual middleware functions
async function withAuth(request, response) {
  const protectedPaths = ["/dashboard", "/admin", "/settings"];
  const isProtected = protectedPaths.some((p) =>
    request.nextUrl.pathname.startsWith(p)
  );

  if (!isProtected) return response;

  const token = request.cookies.get("auth-token")?.value;
  if (!token) {
    return NextResponse.redirect(
      new URL(\`/login?callbackUrl=\${request.nextUrl.pathname}\`, request.url)
    );
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    response.headers.set("x-user-id", payload.sub);
    response.headers.set("x-user-role", payload.role);

    // Admin-only paths
    if (request.nextUrl.pathname.startsWith("/admin") && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  } catch {
    const redirectResponse = NextResponse.redirect(new URL("/login", request.url));
    redirectResponse.cookies.delete("auth-token");
    return redirectResponse;
  }

  return response;
}

function withGeo(request, response) {
  const country = request.geo?.country;
  const pathname = request.nextUrl.pathname;

  // Redirect EU users to EU-specific pages
  const euCountries = ["DE", "FR", "IT", "ES", "NL", "BE", "AT"];
  if (euCountries.includes(country) && !pathname.startsWith("/eu")) {
    return NextResponse.rewrite(
      new URL("/eu" + pathname, request.url)
    );
  }

  return response;
}

function withSecurityHeaders(request, response) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  return response;
}

// Compose middleware
export async function middleware(request) {
  let response = NextResponse.next();

  // Apply security headers first (always)
  response = withSecurityHeaders(request, response);

  // Apply auth checks (may redirect — short-circuits)
  response = await withAuth(request, response);
  if (response.status === 307 || response.status === 308) return response;

  // Apply geo routing
  response = withGeo(request, response);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};`,
      explanation: "Individual middleware concerns are split into separate functions that take and return a response. They're composed sequentially — auth can short-circuit with a redirect (checked via status code). Security headers apply to all responses. Geo routing only runs after auth passes. This pattern keeps the middleware function clean and each concern testable."
    },
    {
      title: "Rate Limiting Middleware with In-Memory Counter",
      difficulty: "mid",
      description: "Implement simple rate limiting in middleware that blocks an IP after too many requests in a time window. Note: in production you'd use a distributed store, but this demonstrates the pattern.",
      solution: `// middleware.js
import { NextResponse } from "next/server";

// In-memory rate limit store (resets on cold start)
// In production, use Redis/Upstash for distributed rate limiting
const rateLimitMap = new Map();

function rateLimit(ip, limit = 60, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }

  const timestamps = rateLimitMap.get(ip).filter((t) => t > windowStart);
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);

  return {
    isLimited: timestamps.length > limit,
    remaining: Math.max(0, limit - timestamps.length),
    resetAt: new Date(timestamps[0] + windowMs).toISOString(),
  };
}

export function middleware(request) {
  // Only rate-limit API routes
  if (!request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]
    || request.ip
    || "unknown";

  const { isLimited, remaining, resetAt } = rateLimit(ip);

  if (isLimited) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": resetAt,
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Remaining", remaining.toString());
  response.headers.set("X-RateLimit-Reset", resetAt);
  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};`,
      explanation: "The middleware tracks request timestamps per IP in a Map. Timestamps older than the window are pruned. If the count exceeds the limit, a 429 response with Retry-After header is returned. The remaining count is sent on successful requests. This in-memory approach works for single-instance deployments but needs Redis/Upstash for distributed edge deployments where each isolate has its own memory."
    }
  ],
  quiz: [
    {
      question: "Where must the middleware.js file be placed in a Next.js project?",
      options: [
        "Inside the app/ directory next to page.js files",
        "In the project root (or src/ root), at the same level as app/",
        "Inside a special middleware/ directory",
        "Anywhere — Next.js auto-discovers it"
      ],
      correct: 1,
      explanation: "middleware.js must be at the project root (next to package.json) or the src/ root if using the src directory. There can only be ONE middleware file per project. Placing it inside app/ or elsewhere won't work."
    },
    {
      question: "What runtime does Next.js middleware execute on?",
      options: [
        "Node.js runtime with full API access",
        "Edge Runtime (V8 isolates, Web APIs only)",
        "Deno runtime with permission system",
        "Bun runtime for faster execution"
      ],
      correct: 1,
      explanation: "Middleware runs on the Edge Runtime, which is built on V8 isolates (same JavaScript engine as Chrome). It only supports Web APIs — no Node.js APIs like fs, path, or native modules. This enables sub-millisecond cold starts and global edge deployment."
    },
    {
      question: "What does NextResponse.rewrite() do differently from NextResponse.redirect()?",
      options: [
        "rewrite() is faster because it skips the HTTP layer",
        "rewrite() changes the internal route without changing the browser URL",
        "rewrite() only works for API routes, not pages",
        "rewrite() caches the response while redirect() doesn't"
      ],
      correct: 1,
      explanation: "rewrite() internally remaps the request to a different route while keeping the browser's URL bar unchanged. The user sees the original URL but gets content from the rewritten path. redirect() sends a 307/308 HTTP redirect, causing the browser to navigate to the new URL visibly."
    },
    {
      question: "Why is it important to use a matcher config with middleware?",
      options: [
        "Middleware won't compile without a matcher",
        "The matcher enables TypeScript type checking for route params",
        "Without a matcher, middleware runs on every request including static files, degrading performance",
        "The matcher is required for Edge Runtime compatibility"
      ],
      correct: 2,
      explanation: "Without a matcher, middleware executes on every request — including JavaScript chunks, CSS files, images, and prefetch requests. This adds unnecessary latency to static asset loading. The matcher limits execution to only the paths that need middleware processing."
    }
  ]
};
