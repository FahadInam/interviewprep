export const nextjsAuth = {
  id: "nextjs-auth",
  title: "Authentication in Next.js",
  icon: "🔐",
  tag: "Next.js",
  tagColor: "var(--tag-next)",
  subtitle: "Cookie-based auth, token-based auth, and session management patterns for production Next.js apps",
  concepts: [
    {
      title: "Cookie-Based Authentication",
      explanations: {
        layman: "Cookie-based auth is like getting your hand stamped at an amusement park. You show your ticket once at the entrance, they stamp your hand, and every ride just checks the stamp. You never show the ticket again. The server stamps your browser with a cookie after login, and every future request includes that stamp automatically. The stamp is invisible to scripts (HttpOnly) and only works on this site (SameSite).",
        mid: "Cookie-based auth stores a session ID in an HTTP cookie. User logs in, server validates credentials, creates a session record (in DB or Redis), and sets a Set-Cookie header with the session ID. The browser sends this cookie automatically on every subsequent request. In Next.js App Router, use cookies() from 'next/headers' to read and set cookies in Server Components and Server Actions. Always set HttpOnly, Secure, SameSite=Lax, and a reasonable maxAge.",
        senior: "In serverless (Vercel), in-memory sessions don't work -- use Redis, a database, or encrypted stateless cookies (iron-session / Jose JWE). cookies() is a dynamic API that opts the route out of static rendering, which is correct for auth-gated pages. Always rotate session IDs after login to prevent session fixation, and invalidate all sessions after password changes. For CSRF, SameSite=Lax handles most cases, and Server Actions have built-in origin checking. Use __Host- cookie prefixes for enhanced security in production."
      },
      realWorld: "Every traditional web application uses cookie-based auth — banking sites, e-commerce, social media. It's the most battle-tested pattern because browsers handle cookies automatically, including on page navigations, form submissions, and fetch requests with credentials: 'include'.",
      whenToUse: "Use cookie-based auth when you need SSR (the cookie is automatically sent with the initial page request), when you want the server to control session lifecycle, and when your frontend and backend share the same domain.",
      whenNotToUse: "Avoid if your API serves mobile apps or third-party clients where cookies are impractical. Avoid if your frontend and API are on completely different domains (cross-origin cookies are increasingly restricted by browsers).",
      pitfalls: "Forgetting HttpOnly exposes the cookie to XSS. Missing Secure sends it over HTTP. Not setting SameSite allows CSRF. Storing large amounts of data in cookies hits the 4KB limit and bloats every request. Not rotating session IDs after login enables session fixation.",
      codeExamples: [
        {
          title: "Server Action Login with Cookie",
          code: `// app/actions/auth.js
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSession, verifyCredentials } from '@/lib/auth';

export async function login(formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  // Validate credentials
  const user = await verifyCredentials(email, password);
  if (!user) {
    return { error: 'Invalid email or password' };
  }

  // Create session (store in DB/Redis)
  const sessionId = await createSession(user.id);

  // Set secure cookie
  const cookieStore = await cookies();
  cookieStore.set('session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });

  redirect('/dashboard');
}`
        },
        {
          title: "Reading Session in Server Component",
          code: `// app/dashboard/page.js
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session')?.value;

  if (!sessionId) {
    redirect('/login');
  }

  const session = await getSession(sessionId);
  if (!session) {
    redirect('/login');
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
    </div>
  );
}`
        }
      ]
    },
    {
      title: "Token-Based Authentication (JWT)",
      explanations: {
        layman: "A JWT is like a sealed ID card with your name and membership level printed on it, protected by a tamper-proof hologram. You show it at every ride, and the operator checks the hologram and reads your info right off the card -- no need to call the front office. The trade-off: if you lose the card, there is no way to cancel it until it expires. Session cookies can be revoked instantly; JWTs cannot.",
        mid: `JWT (JSON Web Token) authentication works differently from sessions:\n\n1. User submits credentials\n2. Server validates and creates a JWT containing user claims (id, role, etc.)\n3. JWT is signed with a secret key (HMAC) or private key (RSA/ECDSA)\n4. Token is sent to the client (in response body, not Set-Cookie)\n5. Client stores it (localStorage, memory, or cookie) and sends it in Authorization header\n6. Server verifies the signature and extracts claims — no database lookup needed\n\nJWT structure: header.payload.signature (Base64URL encoded)\n\nIn Next.js, you'd typically store the JWT in an httpOnly cookie (not localStorage) for security, and read it in middleware or Server Components. This gives you the statelessness of JWT with the security of cookies.`,
        senior: `JWT in production Next.js demands nuanced decisions:\n\n1. Storage: NEVER localStorage (XSS-accessible). Use httpOnly cookies for the access token. If you need the token for client-side API calls, use a BFF (Backend-for-Frontend) pattern where Next.js API routes proxy requests.\n\n2. Token rotation: Short-lived access tokens (15min) + longer-lived refresh tokens stored in httpOnly cookies. Implement silent refresh via a /api/refresh route handler.\n\n3. Revocation problem: JWTs are stateless — you can't invalidate them before expiry. Solutions: short expiry + refresh tokens, token blacklist in Redis (defeats statelessness), or a version counter in the DB that's checked on sensitive operations.\n\n4. Claims design: Keep payloads small. Include user ID, role, token version. NEVER include sensitive data (email, password hash). Remember the payload is Base64 encoded, NOT encrypted.\n\n5. Algorithm: Use RS256 (asymmetric) for distributed systems where multiple services verify tokens. Use HS256 (symmetric) for simple setups. NEVER accept 'none' algorithm — this is a well-known JWT attack vector.`
      },
      realWorld: "SPAs calling external APIs, mobile app backends, microservice architectures where services need to verify identity without a centralized session store. Auth0, Firebase Auth, and Supabase all use JWTs.",
      whenToUse: "When your API serves multiple clients (web, mobile, third-party), when you need stateless authentication for horizontal scaling, or when you're working with microservices that need to independently verify tokens.",
      whenNotToUse: "When you need instant token revocation (e.g., after password change, user must be immediately logged out). When your architecture is simple (single server, single client) — sessions are simpler.",
      pitfalls: "Storing JWTs in localStorage exposes them to XSS. Making tokens too long-lived. Not validating the algorithm (allows 'none' attack). Including sensitive data in the payload. Not implementing refresh token rotation.",
      codeExamples: [
        {
          title: "JWT Creation and Verification",
          code: `// lib/jwt.js
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function createToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (err) {
    return null; // Expired, invalid, or tampered
  }
}

// Route handler for login
// app/api/auth/login/route.js
import { cookies } from 'next/headers';
import { createToken } from '@/lib/jwt';

export async function POST(request) {
  const { email, password } = await request.json();
  const user = await verifyCredentials(email, password);

  if (!user) {
    return Response.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }

  const token = await createToken({
    userId: user.id,
    role: user.role,
  });

  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 15, // 15 minutes
  });

  return Response.json({ success: true });
}`
        }
      ]
    },
    {
      title: "Protecting Routes with Middleware",
      explanations: {
        layman: `Think of middleware as a security checkpoint at the entrance of a building. Before you can enter any floor, you pass through this checkpoint. The guard checks your badge and either lets you through, sends you to the lobby (login page), or tells you that floor is restricted.\n\nNext.js middleware works the same way — it runs BEFORE any page loads and can redirect unauthorized users.`,
        mid: `Next.js middleware runs on the Edge Runtime before a request reaches your page. For auth, this means:\n\n1. Middleware reads the auth cookie/token from the request\n2. Verifies it's valid (checks signature, expiry)\n3. If invalid: redirects to /login\n4. If valid: allows the request to proceed, optionally adding headers\n\nThe matcher config controls which routes the middleware protects. Use it to exclude public routes like /login, /signup, and static assets.\n\nMiddleware is the first line of defense, but Server Components should ALSO verify auth — defense in depth.`,
        senior: `Middleware auth in production requires understanding Edge Runtime constraints:\n\n1. Edge Runtime has no Node.js APIs — you can't use 'crypto' module, most ORMs, or Node-specific JWT libraries. Use 'jose' (works in Edge) or verify tokens with Web Crypto API.\n\n2. Middleware can't do database lookups efficiently (Edge functions are globally distributed, DB calls add latency). Pattern: use JWT for middleware (verify signature only), then do full session validation in Server Components.\n\n3. Performance: middleware runs on EVERY matched request including client-side navigations (RSC payloads). Keep it fast — no network calls if possible.\n\n4. The matcher pattern supports regex-like syntax. Exclude _next/static, _next/image, and public assets.\n\n5. For role-based access: decode JWT claims in middleware and redirect based on role. But remember — middleware can be bypassed if someone directly calls your API. Always validate auth server-side too.`
      },
      realWorld: "Every authenticated Next.js app uses middleware for route protection — dashboards, admin panels, SaaS apps. It provides the fastest possible redirect for unauthenticated users.",
      whenToUse: "Always use middleware as the first layer of auth protection in Next.js. It catches unauthenticated requests before they hit your Server Components.",
      whenNotToUse: "Don't rely on middleware as your ONLY auth check. It's a UX optimization (fast redirects), not a security boundary on its own.",
      pitfalls: "Trying to use Node.js-only libraries in Edge Runtime. Not excluding static assets from the matcher (causes unnecessary middleware runs). Doing expensive DB lookups in middleware. Forgetting that middleware doesn't protect API routes unless explicitly matched.",
      codeExamples: [
        {
          title: "Auth Middleware with JWT",
          code: `// middleware.js (root of project)
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

const publicPaths = ['/login', '/signup', '/forgot-password'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for auth token
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret);

    // Optionally add user info to headers for Server Components
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.userId);
    response.headers.set('x-user-role', payload.role);
    return response;
  } catch {
    // Token expired or invalid
    const response = NextResponse.redirect(
      new URL('/login', request.url)
    );
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: [
    // Match all paths except static files and api
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};`
        }
      ]
    },
    {
      title: "Session Management Patterns",
      explanations: {
        layman: `Session management is like managing visitor passes at a corporate office. You need to decide: How long is the pass valid? What happens when it expires? Can someone have passes for multiple buildings at once? What if a pass is stolen?\n\nGood session management means visitors get smooth access while stolen passes are quickly deactivated.`,
        mid: `Key session management patterns in Next.js:\n\n1. Sliding window: Session extends on each request (maxAge resets). Good for active users, but means abandoned sessions stay alive.\n\n2. Absolute timeout: Session has a fixed lifetime regardless of activity. More secure for sensitive apps.\n\n3. Refresh token rotation: Short-lived access token + long-lived refresh token. On refresh, both tokens are rotated. If a refresh token is reused (theft detected), all sessions for that user are invalidated.\n\n4. Logout: Clear the cookie AND invalidate the server-side session. Client-side only logout (deleting cookie) leaves the session valid on the server.\n\n5. Multi-device: Store sessions with device metadata. Allow users to see and revoke active sessions.`,
        senior: `Production session management must handle edge cases:\n\n1. Race conditions: Multiple tabs refreshing tokens simultaneously. Solution: use a mutex/lock on refresh, or accept the first refresh and let subsequent ones use the new token.\n\n2. Session synchronization across tabs: Use BroadcastChannel API or storage events to sync auth state. When one tab logs out, all tabs should redirect.\n\n3. Token binding: Bind sessions to the client (device fingerprint, TLS channel binding) to prevent stolen cookies from being used on other devices.\n\n4. Session hijacking detection: Track IP and User-Agent. Flag sessions that change dramatically. Don't auto-terminate (VPN users change IP) but require re-authentication for sensitive operations.\n\n5. Serverless considerations: In Vercel/serverless, you can't use in-memory sessions. Use JWT + httpOnly cookie (encrypted stateless session) with iron-session, or external stores like Upstash Redis with their Edge-compatible client.`
      },
      realWorld: "Banking apps use absolute timeouts with short sessions. Social media uses sliding windows with long sessions. SaaS apps often show active devices and allow remote logout.",
      whenToUse: "Always implement proper session management. The specific pattern depends on your security requirements.",
      whenNotToUse: "Don't over-engineer session management for internal tools or low-risk applications. Simple cookie sessions with reasonable expiry are often sufficient.",
      pitfalls: "Not invalidating server-side sessions on logout (only deleting the cookie). Not handling concurrent tab scenarios. Not implementing session rotation after login. Using predictable session IDs.",
      codeExamples: [
        {
          title: "Encrypted Stateless Session with iron-session pattern",
          code: `// lib/session.js
// Using jose for encrypted JWE tokens (stateless sessions)
import { EncryptJWT, jwtDecrypt } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET // Must be 32+ characters
);

export async function createSession(data) {
  const cookieStore = await cookies();
  const token = await new EncryptJWT(data)
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .encrypt(secret);

  cookieStore.set('session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtDecrypt(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "Compare cookie-based authentication vs token-based (JWT) authentication. When would you choose one over the other?",
      answer: "Cookie-based auth: the server stores session data (in a database or Redis) and gives the browser a session ID in a cookie. The browser sends that cookie automatically on every request. Pros: the server can revoke sessions instantly, cookies are sent automatically (great for SSR), and the cookie itself contains no sensitive data. Cons: you need a server-side session store, which complicates horizontal scaling.\n\nJWT auth: all user info (ID, role) is packed into a signed token. The server does not need to store anything -- it just verifies the token's signature. Pros: stateless, works across multiple services, no session store needed. Cons: you cannot revoke a JWT before it expires (the biggest drawback), the payload adds to every request, and the data is only encoded (not encrypted) by default.\n\nDecision framework: Choose cookies when you need instant revocation (banking, admin panels) or SSR. Choose JWT when serving multiple clients (web + mobile) or microservices.\n\nBest practice in Next.js: Store a JWT inside an httpOnly cookie. This gives you the statelessness of JWT with the security of cookies (immune to XSS token theft).",
      difficulty: "mid",
      followUps: [
        "How would you handle JWT revocation in a production system?",
        "What are the security implications of storing a JWT in localStorage vs an httpOnly cookie?",
        "How does the refresh token rotation pattern work?"
      ]
    },
    {
      question: "How do you protect routes in a Next.js App Router application?",
      answer: "Defense in depth with three layers:\n\n1. Middleware (first line): Runs on Edge before any page renders. Check for auth cookie/token, redirect to login if missing. Fast UX because the user never sees a flash of protected content.\n\n2. Server Components (second line): In each protected page's Server Component, verify the session/token and fetch user data. This is the actual security boundary.\n\n3. Layout-level protection: Create a protected layout that wraps all authenticated routes and does the auth check once.\n\nMiddleware is for UX (fast redirects), Server Components are for security (can't be bypassed). Never rely on client-side route protection alone.",
      difficulty: "mid",
      followUps: [
        "Why can't you rely on middleware alone for security?",
        "How do you handle role-based access in Next.js?",
        "What are the Edge Runtime limitations for auth in middleware?"
      ]
    },
    {
      question: "Explain the security risks of different token storage locations in the browser.",
      answer: "localStorage: Accessible by any JavaScript on the page. If there's an XSS vulnerability, attacker can steal the token. Persists until explicitly cleared. NEVER store auth tokens here.\n\nsessionStorage: Same XSS risk as localStorage, but cleared when the tab closes. Slightly better, but still vulnerable.\n\nIn-memory (JavaScript variable): Safe from XSS script injection (can't access another script's variables easily). But lost on page refresh, and still vulnerable if attacker can execute JS in your app context.\n\nhttpOnly cookie: Not accessible by JavaScript AT ALL. Immune to XSS token theft. Automatically sent with requests. Can be protected with Secure (HTTPS only), SameSite (CSRF protection). This is the recommended approach.\n\nThe gold standard: httpOnly, Secure, SameSite=Lax cookie for the auth token, with short expiry and refresh rotation.",
      difficulty: "hard",
      followUps: [
        "If httpOnly cookies can't be read by JavaScript, how do you check if a user is logged in on the client?",
        "What is the BFF pattern and how does it solve the token storage problem?",
        "How do SameSite cookie attributes protect against CSRF?"
      ]
    },
    {
      question: "How would you implement 'remember me' functionality in a Next.js app?",
      answer: "The 'remember me' pattern uses two different session durations:\n\n1. Without 'remember me': Set a session cookie (no max-age/expires) — it's deleted when the browser closes. Or set a short max-age (e.g., 1 hour).\n\n2. With 'remember me': Set a persistent cookie with a longer max-age (e.g., 30 days). Use a refresh token stored in the cookie.\n\nImplementation: In your login Server Action, check the 'remember me' checkbox value. Set the cookie's maxAge accordingly. For security, even 'remember me' sessions should require re-authentication for sensitive operations (password change, payment).\n\nAlways use refresh token rotation — if a 30-day token is stolen, the real user's next refresh invalidates the stolen token.",
      difficulty: "mid",
      followUps: [
        "How do you balance security and convenience with long-lived sessions?",
        "What sensitive operations should require re-authentication even with an active session?"
      ]
    },
    {
      question: "Design an authentication system for a Next.js SaaS application with role-based access control.",
      answer: "Architecture:\n\n1. Auth flow: Email/password + OAuth (Google, GitHub). Use a library like Auth.js (NextAuth) for OAuth complexity.\n\n2. Session: JWT in httpOnly cookie (encrypted with jose or iron-session). Claims: userId, organizationId, role (admin/member/viewer).\n\n3. Middleware: Verify token exists, redirect to login if not. For admin routes (/admin/*), check role claim and redirect to /unauthorized.\n\n4. Server Components: getSession() helper reads and verifies the cookie. Each protected page calls it. Fetch user permissions from DB for fine-grained checks.\n\n5. Client components: useSession() custom hook that fetches /api/auth/session to get non-sensitive user info (name, role, avatar).\n\n6. API routes: Verify token in each route handler. Use a withAuth() middleware wrapper.\n\n7. Multi-tenancy: Include organizationId in the token. Ensure all data queries filter by organizationId.\n\n8. Security: Rate limit login attempts, hash passwords with bcrypt/argon2, implement CSRF protection, log auth events for audit trail.",
      difficulty: "hard",
      followUps: [
        "How would you handle permission changes taking effect immediately across all sessions?",
        "How do you implement team invitations with role assignment?",
        "What happens when a user belongs to multiple organizations?"
      ]
    },
    {
      question: "What is Auth.js (NextAuth) and when would you use it vs building your own auth?",
      answer: "Auth.js is a popular authentication library for Next.js that handles OAuth providers, session management, database adapters, and CSRF protection out of the box.\n\nUse Auth.js when: You need OAuth (Google, GitHub, etc.) — implementing OAuth flows correctly is complex and error-prone. When you want battle-tested session management. When you need database session storage with adapters for Prisma, Drizzle, etc.\n\nBuild your own when: You have simple email/password only auth. When you need full control over the auth flow. When Auth.js's abstractions don't fit your architecture. When you're using a BaaS like Supabase or Firebase that provides auth.\n\nCommon pattern: Use Auth.js for the OAuth complexity, but customize the session and JWT callbacks to include your custom claims (role, orgId). Use middleware and Server Components for authorization logic.",
      difficulty: "mid",
      followUps: [
        "How do Auth.js callbacks work for customizing the session?",
        "What are the tradeoffs of database sessions vs JWT sessions in Auth.js?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Implement a Login Form with Server Action",
      difficulty: "easy",
      description: "Create a login form component that submits credentials via a Server Action, handles errors, and redirects on success.",
      solution: `// app/login/page.js
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <div style={{ maxWidth: 400, margin: '100px auto' }}>
      <h1>Sign In</h1>
      <LoginForm />
    </div>
  );
}

// app/login/login-form.js
'use client';

import { useActionState } from 'react';
import { login } from '@/app/actions/auth';

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <form action={formAction}>
      {state?.error && (
        <div style={{ color: 'red', marginBottom: 16 }}>
          {state.error}
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          style={{ display: 'block', width: '100%', padding: 8 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          style={{ display: 'block', width: '100%', padding: 8 }}
        />
      </div>

      <button type="submit" disabled={isPending}>
        {isPending ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}`,
      explanation: "Uses React 19's useActionState for form state management with Server Actions. The Server Action validates credentials, creates a session, and sets a cookie. Errors are returned to the client for display. The form works without JavaScript (progressive enhancement) because it's a standard HTML form with action."
    },
    {
      title: "Build a useSession Hook",
      difficulty: "mid",
      description: "Create a custom hook that provides session data to client components, with loading state and automatic refresh.",
      solution: `// hooks/useSession.js
'use client';

import { useState, useEffect, createContext, useContext } from 'react';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        setSession(data.user);
      } else {
        setSession(null);
      }
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();

    // Refresh session when tab regains focus
    const handleFocus = () => fetchSession();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setSession(null);
    window.location.href = '/login';
  };

  return (
    <SessionContext.Provider value={{ session, loading, logout, refresh: fetchSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be inside SessionProvider');
  return ctx;
}

// app/api/auth/session/route.js
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ user: null }, { status: 401 });
  }
  // Return only non-sensitive fields
  return Response.json({
    user: {
      id: session.userId,
      name: session.name,
      role: session.role,
    },
  });
}`,
      explanation: "The SessionProvider fetches session data from an API route (which reads the httpOnly cookie server-side). It provides session, loading, and logout to all client components via context. The focus listener re-validates the session when the user returns to the tab, catching expired sessions."
    },
    {
      title: "Implement Refresh Token Rotation",
      difficulty: "hard",
      description: "Build a token refresh system with rotation that detects token reuse (stolen refresh tokens).",
      solution: `// lib/tokens.js
import { SignJWT, jwtVerify } from 'jose';
import { db } from './db';

const accessSecret = new TextEncoder().encode(process.env.ACCESS_SECRET);
const refreshSecret = new TextEncoder().encode(process.env.REFRESH_SECRET);

export async function createTokenPair(userId) {
  const accessToken = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m')
    .sign(accessSecret);

  // Create refresh token with a family ID
  const familyId = crypto.randomUUID();
  const refreshToken = await new SignJWT({ userId, familyId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(refreshSecret);

  // Store refresh token family in DB
  await db.refreshToken.create({
    data: { familyId, userId, valid: true },
  });

  return { accessToken, refreshToken };
}

export async function rotateRefreshToken(oldRefreshToken) {
  // Verify the old refresh token
  const { payload } = await jwtVerify(oldRefreshToken, refreshSecret);
  const { userId, familyId } = payload;

  // Check if this family is still valid
  const family = await db.refreshToken.findUnique({
    where: { familyId },
  });

  if (!family || !family.valid) {
    // REUSE DETECTED — someone used an old token
    // Invalidate ALL tokens for this user (nuclear option)
    await db.refreshToken.updateMany({
      where: { userId },
      data: { valid: false },
    });
    throw new Error('Refresh token reuse detected');
  }

  // Invalidate old family, create new one
  await db.refreshToken.update({
    where: { familyId },
    data: { valid: false },
  });

  // Issue new token pair
  return createTokenPair(userId);
}

// app/api/auth/refresh/route.js
import { cookies } from 'next/headers';
import { rotateRefreshToken } from '@/lib/tokens';

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) {
    return Response.json({ error: 'No refresh token' }, { status: 401 });
  }

  try {
    const { accessToken, refreshToken: newRefresh } =
      await rotateRefreshToken(refreshToken);

    cookieStore.set('access_token', accessToken, {
      httpOnly: true, secure: true, sameSite: 'lax', maxAge: 900,
    });
    cookieStore.set('refresh_token', newRefresh, {
      httpOnly: true, secure: true, sameSite: 'lax', maxAge: 604800,
    });

    return Response.json({ success: true });
  } catch (err) {
    // Clear all cookies on reuse detection
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');
    return Response.json({ error: 'Session invalidated' }, { status: 401 });
  }
}`,
      explanation: "Refresh token rotation issues a new token pair on each refresh, invalidating the old one. If an old refresh token is reused (indicating theft), ALL tokens for that user are invalidated. This is the recommended pattern by OAuth 2.0 security best practices. The 'family' concept tracks token lineage to detect reuse."
    }
  ],
  quiz: [
    {
      question: "Where should you store JWT tokens in a browser for maximum security?",
      options: [
        "httpOnly cookie with Secure and SameSite flags",
        "localStorage for persistence",
        "sessionStorage for tab-scoped storage",
        "In a JavaScript variable (in-memory)"
      ],
      correct: 0,
      explanation: "httpOnly cookies cannot be accessed by JavaScript, making them immune to XSS token theft. Combined with Secure (HTTPS only) and SameSite (CSRF protection), this is the most secure storage option."
    },
    {
      question: "What is the main disadvantage of JWT-based authentication compared to session-based?",
      options: [
        "JWTs cannot be easily revoked before they expire",
        "JWTs are slower to verify than session lookups",
        "JWTs cannot contain user information",
        "JWTs don't work with HTTPS"
      ],
      correct: 0,
      explanation: "Since JWTs are self-contained and stateless, the server has no way to invalidate them before their expiration time. With session-based auth, you can simply delete the session from your store. This is why short-lived access tokens + refresh tokens are recommended."
    },
    {
      question: "In Next.js, what runs first when a user navigates to a protected page?",
      options: [
        "Middleware",
        "The page's Server Component",
        "The root layout",
        "Client-side JavaScript"
      ],
      correct: 0,
      explanation: "Middleware runs on the Edge before the request reaches any Server Component, layout, or page. This makes it the ideal first line of defense for authentication checks and redirects."
    },
    {
      question: "Why should you NOT use localStorage to store authentication tokens?",
      options: [
        "Any JavaScript running on the page can read localStorage, making tokens vulnerable to XSS",
        "localStorage has a 1KB size limit",
        "localStorage is not available in all browsers",
        "localStorage is cleared on every page navigation"
      ],
      correct: 0,
      explanation: "localStorage is accessible to all JavaScript running on the page. If an attacker can inject a script (XSS), they can read the token with localStorage.getItem(). httpOnly cookies are invisible to JavaScript."
    },
    {
      question: "What is refresh token rotation and why is it important?",
      options: [
        "Issuing a new refresh token on each use and invalidating the old one, to detect token theft",
        "Rotating between multiple secret keys for signing tokens",
        "Automatically refreshing the page when a token expires",
        "Changing the token's encryption algorithm periodically"
      ],
      correct: 0,
      explanation: "Refresh token rotation means each time a refresh token is used, a new one is issued and the old one is invalidated. If a stolen token is used after the legitimate user has already refreshed, the reuse is detected and all tokens for that user can be invalidated."
    }
  ]
};
