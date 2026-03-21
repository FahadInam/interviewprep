export const xssCsrf = {
  id: "xss-csrf",
  title: "XSS & CSRF Security",
  icon: "🔒",
  tag: "Security",
  tagColor: "var(--tag-system)",
  subtitle: "Understanding and preventing cross-site scripting and request forgery attacks.",
  concepts: [
    {
      title: "Cross-Site Scripting (XSS)",
      explanations: {
        layman: "Picture a community bulletin board at a coffee shop where anyone can pin a note. One day, someone pins a note with a hidden trick: it looks normal, but scanning its QR code secretly installs spyware on your phone. You trusted it because it was on the coffee shop's board. XSS works the same way. An attacker sneaks malicious code into a website you trust. Your browser runs it because it looks like it belongs there. Three types to know: Stored XSS — the bad note stays pinned to the board permanently, attacking every person who reads it. Reflected XSS — someone hands you a trick link; clicking it bounces the attack off the server and back to you. DOM-based XSS — the attack never touches the server at all; it manipulates the page directly in your browser using JavaScript.",
        mid: "XSS occurs when untrusted data is included in web output without proper validation or escaping. Stored XSS persists in the database — for example, a forum post containing `<script>document.cookie</script>` that executes for every visitor. Reflected XSS comes from the current HTTP request — like a search query `?q=<script>alert(1)</script>` reflected back in the page. DOM-based XSS happens entirely client-side when JavaScript reads from an attacker-controllable source (like `location.hash` or `document.referrer`) and passes it to a sink (like `innerHTML` or `eval()`). The attack surface includes anywhere user input touches the DOM: form fields, URL parameters, WebSocket messages, postMessage handlers, and even SVG uploads. React mitigates most XSS by escaping JSX output by default, but `dangerouslySetInnerHTML`, `href` with `javascript:` protocol, and server-side rendering injection points remain vulnerable.",
        senior: "From a security audit perspective, XSS classification goes beyond the basic three types. Consider mutation XSS (mXSS) where seemingly safe HTML mutates into executable code during browser parsing — e.g., `<listing>&lt;img src=1 onerror=alert(1)&gt;</listing>` becoming executable after innerHTML assignment due to parser context switching. Blind XSS is another vector where payloads fire in admin panels or logging dashboards days later. In SPAs, the attack surface shifts: client-side routing means reflected XSS often becomes DOM-based, and state management (Redux, Zustand) can propagate tainted data across components. Modern frameworks like React escape by default, but escape hatches exist — `dangerouslySetInnerHTML`, `ref.current.innerHTML`, dynamic `href`/`src` attributes with `javascript:` protocol, CSS injection via `style` props, and SSR hydration mismatches where server-rendered HTML differs from client expectations. In production audits, I look for: (1) any use of `dangerouslySetInnerHTML` without DOMPurify, (2) URL construction from user input without protocol validation, (3) `postMessage` handlers without origin checking, (4) template literal usage in dynamic component rendering, and (5) third-party script injection via compromised CDNs."
      },
      realWorld: "In 2005, the Samy worm exploited stored XSS on MySpace, adding over one million friends to an account in under 24 hours. Twitter, eBay, and British Airways have all suffered XSS attacks. Modern SPAs are targeted through DOM-based XSS in client-side routers and markdown renderers.",
      whenToUse: "XSS awareness should be applied in every feature that handles user input or displays dynamic content. This includes search bars, comment systems, profile fields, URL parameters, file uploads (SVGs can contain scripts), and third-party widget integrations.",
      whenNotToUse: "There is never a valid scenario to intentionally allow XSS. Even in internal tools, XSS can be exploited via CSRF or by disgruntled employees. Never assume 'only trusted users have access' is a valid defense.",
      pitfalls: "Relying solely on client-side validation (easily bypassed). Using blacklists instead of whitelists for input filtering (attackers always find bypasses like `<img/src=x onerror=alert(1)>`). Forgetting to sanitize data on output, not just input. Trusting React's default escaping while using `dangerouslySetInnerHTML`. Not sanitizing SVG uploads. Allowing `javascript:` protocol in href attributes.",
      codeExamples: [
        {
          title: "DOM-based XSS Vulnerability and Fix",
          code: `// VULNERABLE: DOM-based XSS via innerHTML
function SearchResults() {
  const query = new URLSearchParams(window.location.search).get('q');
  // An attacker crafts: ?q=<img src=x onerror=alert(document.cookie)>
  document.getElementById('results').innerHTML =
    'Results for: ' + query; // XSS!
}

// FIXED: Use textContent or React's default escaping
function SearchResults() {
  const [params] = useSearchParams();
  const query = params.get('q') || '';
  // React auto-escapes this — no XSS possible
  return <h2>Results for: {query}</h2>;
}

// FIXED: When you MUST render HTML, use DOMPurify
import DOMPurify from 'dompurify';

function RichContent({ htmlContent }) {
  const clean = DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false,
  });
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}`
        },
        {
          title: "Preventing javascript: Protocol XSS in Links",
          code: `// VULNERABLE: User-controlled href
function UserProfile({ website }) {
  // Attacker sets website to "javascript:alert(document.cookie)"
  return <a href={website}>Visit Website</a>;
}

// FIXED: Validate URL protocol
function sanitizeUrl(url) {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
      return '#';
    }
    return parsed.href;
  } catch {
    return '#';
  }
}

function UserProfile({ website }) {
  return <a href={sanitizeUrl(website)}>Visit Website</a>;
}`
        }
      ]
    },
    {
      title: "XSS Prevention Strategies",
      explanations: {
        layman: "Think of XSS prevention like airport security. You don't just check bags at one point — you have multiple layers: metal detectors (input validation), X-ray machines (output encoding), no-fly lists (Content Security Policy), and air marshals (runtime monitoring). Each layer catches what the others might miss. Input sanitization cleans dirty data coming in. Output encoding makes sure data is treated as text, not code, when displayed. CSP tells the browser which scripts are allowed to run. Together they create defense in depth.",
        mid: "XSS prevention follows defense-in-depth with multiple layers: (1) Input validation — reject or sanitize input at the boundary using allowlists, not blocklists. (2) Output encoding — context-aware encoding when rendering (HTML entity encoding for HTML context, JavaScript encoding for JS context, URL encoding for URL context). (3) Content Security Policy — HTTP headers that restrict script sources, preventing inline scripts and unauthorized external scripts. (4) Framework protections — React escapes JSX expressions by default, converting `<script>` to `&lt;script&gt;`. (5) HTTP-only cookies — prevent `document.cookie` theft even if XSS occurs. (6) Trusted Types API — a browser API that enforces sanitization at dangerous sinks like `innerHTML`. The key insight is that sanitization must be context-aware: data safe in an HTML context might be dangerous in a JavaScript or URL context.",
        senior: "Production-grade XSS prevention requires a systematic approach. First, establish a Trusted Types policy to create a compile-time-like enforcement of sanitization at DOM sinks — this catches XSS at the root cause. Deploy CSP with `script-src` using nonces (not `unsafe-inline`) with a strict-dynamic fallback: `script-src 'nonce-{random}' 'strict-dynamic'`. Use CSP reporting (`report-uri` or `report-to`) to detect violations in production without breaking functionality. For React apps, lint rules like `eslint-plugin-react` flag `dangerouslySetInnerHTML` usage, but also audit: (1) ref-based DOM manipulation, (2) dynamic import() with user input, (3) server components that interpolate user data into HTML, (4) SSR hydration where server-rendered markup could differ. In micro-frontend architectures, each sub-app needs its own CSP scope. For markdown rendering (very common in SaaS), use a strict sanitizer like DOMPurify with RETURN_DOM_FRAGMENT and custom hooks to strip event handlers. Monitor with CSP violation reports and consider a Web Application Firewall (WAF) as an additional layer for high-value targets."
      },
      realWorld: "GitHub uses CSP with strict nonces, DOMPurify for markdown rendering, and Trusted Types. Slack sanitizes all user content through a custom pipeline. Google was an early adopter of Trusted Types to prevent DOM XSS across their properties.",
      whenToUse: "Always. Every web application should implement CSP headers, use framework-provided escaping, sanitize any HTML rendering, and validate URLs. The depth of implementation scales with risk — a banking app needs stricter policies than a static blog.",
      whenNotToUse: "Overly restrictive CSP can break legitimate functionality like third-party analytics, A/B testing tools, or browser extensions. Balance security with functionality by using CSP report-only mode first to identify issues before enforcing.",
      pitfalls: "Setting CSP with `unsafe-inline` and `unsafe-eval` (defeats the purpose). Not applying context-specific encoding (HTML-encoding data that will be placed in a JavaScript string). Forgetting to sanitize data from APIs (your own API might return user-generated content). Using DOMPurify without configuring allowed tags (defaults may be too permissive for your context).",
      codeExamples: [
        {
          title: "Content Security Policy Implementation",
          code: `// Express middleware for CSP headers
import crypto from 'crypto';

function cspMiddleware(req, res, next) {
  // Generate a unique nonce for each request
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.cspNonce = nonce;

  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    \`script-src 'nonce-\${nonce}' 'strict-dynamic'\`,
    "style-src 'self' 'unsafe-inline'", // CSS is lower risk
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://api.example.com",
    "frame-ancestors 'none'",         // Prevent clickjacking
    "base-uri 'self'",               // Prevent base tag hijacking
    "form-action 'self'",            // Restrict form targets
    "report-uri /csp-violations",    // Collect violations
  ].join('; '));

  next();
}

// In your HTML template, use the nonce:
// <script nonce="<%= cspNonce %>">...</script>`
        },
        {
          title: "Trusted Types Policy for DOM XSS Prevention",
          code: `// Set up Trusted Types to prevent DOM XSS at the browser level
if (window.trustedTypes && trustedTypes.createPolicy) {
  // Default policy — catches ALL dangerous sink assignments
  trustedTypes.createPolicy('default', {
    createHTML: (input) => {
      // Use DOMPurify as the sanitizer
      return DOMPurify.sanitize(input, {
        RETURN_TRUSTED_TYPE: true,
        ALLOWED_TAGS: ['b', 'i', 'p', 'br', 'a'],
        ALLOWED_ATTR: ['href'],
      });
    },
    createScriptURL: (input) => {
      const url = new URL(input, window.location.origin);
      if (url.origin === window.location.origin) {
        return url.href;
      }
      throw new TypeError('Script URL not allowed: ' + input);
    },
    createScript: () => {
      throw new TypeError('Dynamic script creation is blocked');
    },
  });
}

// CSP header to enforce Trusted Types:
// Content-Security-Policy: trusted-types default; require-trusted-types-for 'script'`
        }
      ]
    },
    {
      title: "Cross-Site Request Forgery (CSRF)",
      explanations: {
        layman: "You are logged into your bank in one browser tab. In another tab, you visit a funny meme site. Behind the scenes, that meme site has a hidden form that tells your browser: 'Send $5,000 to this attacker's account at bank.com.' Your browser obeys because it automatically attaches your bank login cookie to any request going to bank.com. The bank sees a valid cookie and thinks YOU made the transfer. That is CSRF. The key difference from XSS: the attacker never sees your data. Instead, they trick your browser into taking actions as if they were you — transferring money, changing your password, or deleting your account.",
        mid: "CSRF exploits the browser's automatic inclusion of cookies (and other credentials) in cross-origin requests. The attack flow: (1) User authenticates with bank.com and receives a session cookie. (2) User visits evil.com which contains `<form action='https://bank.com/transfer' method='POST'><input name='to' value='attacker'><input name='amount' value='10000'></form><script>document.forms[0].submit()</script>`. (3) Browser sends the POST to bank.com WITH the session cookie attached automatically. (4) Bank processes the transfer thinking the user initiated it. CSRF works because: cookies are sent automatically with requests, the Same-Origin Policy only prevents reading responses (not sending requests), and servers often can't distinguish legitimate from forged requests. Modern defenses include CSRF tokens (a secret per-session value the attacker can't guess), SameSite cookie attribute (prevents cross-site cookie sending), and checking the Origin/Referer headers.",
        senior: "CSRF remains relevant despite SameSite cookies because: (1) SameSite=Lax (the default in modern browsers) still allows GET requests cross-site, so any state-changing GET endpoint is vulnerable. (2) Older browsers don't support SameSite. (3) Subdomains can be exploited — if attacker controls `evil.subdomain.bank.com`, SameSite won't help. (4) Login CSRF is often overlooked — an attacker forces the victim to log into the attacker's account, then the victim enters sensitive data thinking it's their own account. Modern CSRF involves: (a) Token-based: synchronizer tokens stored server-side and verified per request — must be tied to the session, not a global secret. (b) Double-submit cookies: CSRF token in both a cookie and request body/header — works for stateless backends but vulnerable to subdomain cookie injection. (c) Custom headers: APIs requiring `X-Requested-With` or similar headers that cannot be set cross-origin without CORS preflight. In SPA architectures, CSRF for API calls is typically handled by storing tokens in JavaScript memory (not cookies) and sending them as headers — since the attacker's page can't read the token from your domain. For SSR apps with form submissions, the synchronizer token pattern remains the gold standard."
      },
      realWorld: "In 2008, a CSRF vulnerability in Netflix allowed attackers to change user account details. ING Direct's banking app had a CSRF flaw that allowed money transfers. WordPress has had multiple CSRF vulnerabilities in plugin settings pages. Even GitHub had CSRF issues in its early days around repository actions.",
      whenToUse: "CSRF protection is required on every state-changing endpoint (POST, PUT, DELETE, PATCH). Any action that modifies data, changes settings, or performs transactions needs CSRF protection. This includes AJAX requests, form submissions, and API calls from authenticated sessions.",
      whenNotToUse: "Pure GET requests that only read data don't need CSRF protection (but ensure GETs never modify state). Public APIs using token-based auth (Bearer tokens in headers) are inherently CSRF-resistant because the token isn't automatically sent. Static sites with no user sessions don't need CSRF protection.",
      pitfalls: "Using predictable CSRF tokens (must be cryptographically random). Not validating tokens on the server. Accepting GET requests for state-changing operations. Relying solely on Referer header checking (can be stripped by privacy extensions). Not regenerating tokens after login. Storing CSRF tokens in cookies without the double-submit pattern (defeats the purpose).",
      codeExamples: [
        {
          title: "CSRF Token Implementation (Express + React)",
          code: `// SERVER: Express CSRF middleware
import crypto from 'crypto';

function csrfProtection(req, res, next) {
  // Generate token on GET requests
  if (req.method === 'GET') {
    const token = crypto.randomBytes(32).toString('hex');
    req.session.csrfToken = token;
    res.locals.csrfToken = token;
    return next();
  }

  // Validate token on state-changing requests
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  if (!token || token !== req.session.csrfToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  // Rotate token after successful validation
  req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  next();
}

// API endpoint to fetch token
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ token: res.locals.csrfToken });
});

// CLIENT: React hook for CSRF
function useCsrfToken() {
  const [token, setToken] = useState('');

  useEffect(() => {
    fetch('/api/csrf-token', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setToken(data.token));
  }, []);

  const csrfFetch = useCallback(async (url, options = {}) => {
    return fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...options.headers,
        'X-CSRF-Token': token,
      },
    });
  }, [token]);

  return { csrfFetch };
}`
        }
      ]
    },
    {
      title: "CSRF Prevention Patterns",
      explanations: {
        layman: "Think of CSRF prevention like a bouncer checking wristbands at a private event. When you enter the party (load the web page), you get a unique wristband (CSRF token) that only the bouncer and you know about. When you want to go to the VIP area (make a state-changing request), the bouncer checks your wristband. An impersonator at another party (the attacker's website) doesn't have your wristband, so they can't get in. SameSite cookies are like telling the post office to only deliver packages that were mailed from your own house — packages mailed from someone else's address get rejected.",
        mid: "Three main CSRF prevention approaches: (1) Synchronizer Token Pattern — server generates a random token per session, embeds it in forms/pages, and validates it on each state-changing request. The attacker can't read the token due to Same-Origin Policy. (2) Double-Submit Cookie — set a random token as both a cookie AND a request parameter. The server checks they match. Works for stateless backends because nothing is stored server-side, but vulnerable to subdomain cookie injection. (3) SameSite Cookies — `SameSite=Strict` prevents the cookie from being sent on ANY cross-site request. `SameSite=Lax` allows cookies on top-level GET navigations but blocks them on cross-site POST/PUT/DELETE. `SameSite=None; Secure` sends cookies everywhere (opt-in to old behavior). Additional defense: check the `Origin` header on the server — it's set by the browser on cross-origin requests and cannot be spoofed by JavaScript.",
        senior: "In production, CSRF defense strategy depends on your architecture. For traditional server-rendered apps, synchronizer tokens remain the gold standard — use a per-request token (not per-session) for extra protection against BREACH attacks that can leak session-level tokens via compression side channels. For SPAs consuming REST APIs, store the auth token in JavaScript memory (not cookies) and send it as a Bearer header — this is inherently CSRF-safe since the attacker can't access your JavaScript variables. If you must use cookie-based auth for an SPA (common with SSR frameworks), combine SameSite=Lax with a custom header check — require `X-Requested-With: XMLHttpRequest` on all state-changing requests. Since this header triggers a CORS preflight for cross-origin requests, and your CORS policy won't whitelist the attacker's origin, the request is blocked. For GraphQL, all mutations go through POST, so SameSite=Lax + Origin header checking covers most cases. Edge cases to audit: (1) CORS misconfigurations that whitelist `null` origin or use regex matching that can be bypassed, (2) WebSocket connections that inherit cookies but don't have Origin checking, (3) file upload endpoints that accept multipart/form-data (these don't trigger preflight), (4) JSON APIs that also accept form-encoded data."
      },
      realWorld: "Django includes CSRF middleware by default with the double-submit cookie pattern. Rails uses the synchronizer token pattern with `authenticity_token`. Next.js API routes don't include CSRF protection by default — a common security gap in new projects. Express requires explicit middleware like csurf (now deprecated) or custom implementation.",
      whenToUse: "Use synchronizer tokens for server-rendered forms. Use SameSite cookies as a baseline for all cookie-based sessions. Use custom header checking for SPA API calls. Use the double-submit pattern when you need stateless CSRF protection for microservices that don't share session state.",
      whenNotToUse: "Don't rely solely on SameSite=Lax for high-security applications (it still allows GET-based attacks). Don't use the double-submit pattern if your application has subdomain takeover risks. Don't skip CSRF for internal APIs — internal networks can still be exploited via a user's browser.",
      pitfalls: "Not protecting all state-changing endpoints (forgetting PATCH or DELETE routes). Accepting tokens from query parameters (leaks via Referer header). Not using HTTPS (MITM can steal tokens). Caching pages with CSRF tokens (stale tokens cause usability issues). Not handling token rotation in SPAs (the token changes but the client still sends the old one).",
      codeExamples: [
        {
          title: "SameSite Cookie Configuration",
          code: `// Express session with secure cookie settings
import session from 'express-session';

app.use(session({
  name: '__Host-session', // __Host- prefix enforces Secure + no Domain
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,        // Prevent XSS cookie theft
    secure: true,          // HTTPS only
    sameSite: 'lax',       // CSRF protection baseline
    maxAge: 3600000,       // 1 hour
    path: '/',
  },
}));

// For APIs that need cross-origin cookie access:
app.use(session({
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'none',      // Required for cross-origin
    // Must combine with CSRF tokens when using SameSite=None
  },
}));

// Double-Submit Cookie Pattern
function doubleSubmitCsrf(req, res, next) {
  if (req.method === 'GET') {
    const token = crypto.randomBytes(32).toString('hex');
    res.cookie('csrf-token', token, {
      httpOnly: false, // JS needs to read this
      secure: true,
      sameSite: 'strict',
    });
    return next();
  }

  const cookieToken = req.cookies['csrf-token'];
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || cookieToken !== headerToken) {
    return res.status(403).json({ error: 'CSRF validation failed' });
  }
  next();
}`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "What is the difference between stored, reflected, and DOM-based XSS?",
      answer: "Think of three different attack delivery methods. Stored XSS: the malicious script is saved in the database (e.g., inside a comment) and runs for every user who views that page — most dangerous because it is always active. Reflected XSS: the script is embedded in a URL. The attacker tricks someone into clicking it, the server includes the script in its response, and it runs once in the victim's browser. DOM-based XSS: the script never touches the server. Client-side JavaScript reads something the attacker controls (like location.hash or a URL parameter) and passes it to a dangerous operation (like innerHTML). The critical distinction for interviews: stored and reflected are server-side injection problems that server-side sanitization can catch. DOM-based is purely a client-side problem — you must fix it in your frontend JavaScript.",
      difficulty: "mid",
      followUps: [
        "Which type is hardest to detect with automated tools and why?",
        "How does mutation XSS (mXSS) differ from these three types?",
        "Can you have XSS in a purely static site with no server?"
      ]
    },
    {
      question: "How does React protect against XSS by default, and what are the escape hatches that can reintroduce XSS?",
      answer: "React auto-escapes all values embedded in JSX before rendering them to the DOM. When you write `<div>{userInput}</div>`, React converts characters like <, >, &, and quotes to their HTML entity equivalents, preventing script injection. However, several escape hatches bypass this protection: (1) `dangerouslySetInnerHTML` injects raw HTML without escaping, (2) `href` and `src` attributes accept `javascript:` protocol URLs, (3) spreading user-controlled objects as props (`{...userProps}`) can inject event handlers like `onError`, (4) Server-side rendering can inject unsanitized data before React hydrates, and (5) using refs to directly manipulate DOM elements bypasses React's virtual DOM escaping entirely.",
      difficulty: "mid",
      followUps: [
        "How would you audit a React codebase for XSS vulnerabilities?",
        "What ESLint rules help catch XSS risks in React?",
        "How does React's escaping differ from Angular's or Vue's approach?"
      ]
    },
    {
      question: "Explain CSRF attacks and why SameSite=Lax cookies alone are not sufficient protection.",
      answer: "CSRF tricks a user's browser into making authenticated requests to a target site by exploiting automatic cookie inclusion. SameSite=Lax is a good baseline but insufficient because: (1) It allows cookies on top-level GET navigations, so any state-changing GET endpoint remains vulnerable. (2) There's a 2-minute window after cookie creation where Lax cookies are sent with cross-site POST requests (to avoid breaking OAuth flows). (3) It doesn't protect against subdomain attacks — if an attacker controls a subdomain, they can set cookies for the parent domain. (4) Older browsers don't support SameSite at all. (5) It doesn't protect WebSocket connections that inherit cookies. A defense-in-depth approach combines SameSite cookies with CSRF tokens and Origin header validation.",
      difficulty: "hard",
      followUps: [
        "How does the CSRF protection strategy differ between SSR apps and SPAs?",
        "What is login CSRF and why is it dangerous?",
        "How do you handle CSRF in a microservices architecture?"
      ]
    },
    {
      question: "What is Content Security Policy (CSP) and how do you implement it effectively?",
      answer: "CSP is an HTTP response header that tells the browser which sources of content are allowed to load and execute. It works by declaring allowed origins for scripts, styles, images, fonts, frames, and other resources. An effective CSP uses nonces for inline scripts (`script-src 'nonce-abc123' 'strict-dynamic'`), avoids `unsafe-inline` and `unsafe-eval`, restricts `default-src` to `'self'`, and uses `frame-ancestors 'none'` to prevent clickjacking. Implementation should start with `Content-Security-Policy-Report-Only` to collect violations without breaking the site, then gradually tighten the policy. The `strict-dynamic` keyword allows nonce-approved scripts to load additional scripts, which is essential for bundler-generated code.",
      difficulty: "hard",
      followUps: [
        "How do nonce-based CSPs work with CDN caching?",
        "What is the difference between CSP Level 2 and Level 3?",
        "How do you handle CSP with third-party analytics and ad scripts?"
      ]
    },
    {
      question: "How would you implement XSS protection for a rich text editor that allows HTML formatting?",
      answer: "This is one of the hardest XSS challenges because you intentionally need to allow some HTML. The approach: (1) Use a well-maintained sanitization library like DOMPurify on both client and server. (2) Define a strict allowlist of tags (p, b, i, em, strong, a, ul, ol, li, h1-h6) and attributes (href with http/https protocol only, class for styling). (3) Strip all event handler attributes (onclick, onerror, etc.). (4) Sanitize on output, not just input, because sanitization rules may be updated after content was stored. (5) Use CSP as a second line of defense. (6) Consider using a structured format like Markdown or a JSON AST (like Slate.js or ProseMirror) instead of raw HTML — sanitize only at the rendering boundary. (7) Test with an XSS payload list (like the OWASP XSS Filter Evasion Cheat Sheet).",
      difficulty: "hard",
      followUps: [
        "Should you sanitize on input, output, or both?",
        "How do you handle SVG content in a rich text editor?",
        "What is the security implication of allowing CSS in user content?"
      ]
    },
    {
      question: "What is the difference between a CSRF token and a CORS preflight in preventing forged requests?",
      answer: "They solve different problems with different mechanisms. A CSRF token is a secret value that proves the request originated from your own application — the server generates it, embeds it in the page, and validates it on submission. An attacker's page cannot read the token due to the Same-Origin Policy. CORS preflight is a browser mechanism where the browser sends an OPTIONS request before certain cross-origin requests to check if the server allows them. If the server's CORS policy doesn't include the attacker's origin, the browser blocks the actual request. They complement each other: CORS preflight protects API calls with custom headers or non-simple content types, while CSRF tokens protect form submissions (which don't trigger preflight). Neither alone is sufficient — simple form POST requests bypass CORS entirely, and CORS misconfigurations (like allowing `*` with credentials) negate preflight protection.",
      difficulty: "mid",
      followUps: [
        "Can CORS replace CSRF tokens for API security?",
        "What happens if a server has no CORS headers at all?",
        "How do file upload forms interact with CORS and CSRF?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Build a URL Sanitizer",
      difficulty: "mid",
      description: "Create a function that sanitizes user-provided URLs to prevent javascript: protocol XSS attacks. The function should allow http, https, and mailto protocols, reject all others, handle edge cases like mixed-case protocols and whitespace, and return a safe fallback for invalid URLs.",
      solution: `function sanitizeUrl(url) {
  if (typeof url !== 'string') return '#';

  // Trim whitespace and remove null bytes
  const cleaned = url.trim().replace(/\\0/g, '');

  // Empty string check
  if (!cleaned) return '#';

  // Block data: URIs (can contain scripts)
  if (/^data:/i.test(cleaned)) return '#';

  // Handle protocol-relative URLs
  if (cleaned.startsWith('//')) {
    return 'https:' + cleaned;
  }

  // If no protocol, assume https
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(cleaned)) {
    return 'https://' + cleaned;
  }

  try {
    const parsed = new URL(cleaned);
    const allowedProtocols = ['http:', 'https:', 'mailto:'];

    if (!allowedProtocols.includes(parsed.protocol.toLowerCase())) {
      return '#';
    }

    return parsed.href;
  } catch {
    return '#';
  }
}

// Tests
console.assert(sanitizeUrl('https://example.com') === 'https://example.com/');
console.assert(sanitizeUrl('javascript:alert(1)') === '#');
console.assert(sanitizeUrl('JAVASCRIPT:alert(1)') === '#');
console.assert(sanitizeUrl('  javascript:alert(1)  ') === '#');
console.assert(sanitizeUrl('data:text/html,<script>alert(1)</script>') === '#');
console.assert(sanitizeUrl('example.com') === 'https://example.com/');
console.assert(sanitizeUrl('') === '#');
console.assert(sanitizeUrl(null) === '#');`,
      explanation: "The sanitizer handles multiple attack vectors: direct javascript: protocol, case-variation bypasses (JaVaScRiPt:), whitespace injection, null byte injection, and data: URIs. It uses the URL constructor for robust parsing and falls back to '#' for anything suspicious. The allowlist approach (only permitting known-safe protocols) is more secure than a blocklist approach."
    },
    {
      title: "Implement a CSRF Token System",
      difficulty: "mid",
      description: "Build a simple CSRF token generation and validation system. Create functions to generate cryptographically secure tokens, store them, and validate them on form submission. Include token rotation after successful validation.",
      solution: `class CsrfProtection {
  constructor() {
    this.tokens = new Map(); // sessionId -> token
  }

  generateToken(sessionId) {
    // Generate 32 bytes of cryptographic randomness
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const token = Array.from(array, b =>
      b.toString(16).padStart(2, '0')
    ).join('');

    this.tokens.set(sessionId, {
      value: token,
      createdAt: Date.now(),
      maxAge: 3600000, // 1 hour
    });

    return token;
  }

  validateToken(sessionId, submittedToken) {
    const stored = this.tokens.get(sessionId);

    if (!stored) {
      return { valid: false, reason: 'No token found for session' };
    }

    // Check expiration
    if (Date.now() - stored.createdAt > stored.maxAge) {
      this.tokens.delete(sessionId);
      return { valid: false, reason: 'Token expired' };
    }

    // Constant-time comparison to prevent timing attacks
    if (!this.timingSafeEqual(stored.value, submittedToken)) {
      return { valid: false, reason: 'Token mismatch' };
    }

    // Rotate token after successful validation
    const newToken = this.generateToken(sessionId);
    return { valid: true, newToken };
  }

  timingSafeEqual(a, b) {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }

  cleanup() {
    const now = Date.now();
    for (const [sessionId, data] of this.tokens) {
      if (now - data.createdAt > data.maxAge) {
        this.tokens.delete(sessionId);
      }
    }
  }
}

// Usage
const csrf = new CsrfProtection();
const token = csrf.generateToken('session-123');
console.log('Generated:', token);

const result = csrf.validateToken('session-123', token);
console.log('Valid:', result.valid); // true
console.log('New token for next request:', result.newToken);

// Reusing old token fails
const replayResult = csrf.validateToken('session-123', token);
console.log('Replay valid:', replayResult.valid); // false`,
      explanation: "This implementation covers the key security aspects: cryptographically secure token generation, timing-safe comparison to prevent side-channel attacks, token expiration to limit the window of vulnerability, token rotation after use to prevent replay attacks, and session-bound tokens. The constant-time comparison is critical — without it, an attacker could measure response times to guess the token character by character."
    },
    {
      title: "Build an XSS Detection Scanner",
      difficulty: "hard",
      description: "Create a function that scans HTML strings for potential XSS payloads. It should detect script tags, event handlers, javascript: URLs, data: URIs, and encoding-based evasion attempts. Return an array of detected threats with their types and locations.",
      solution: `function scanForXss(html) {
  const threats = [];

  const patterns = [
    {
      name: 'script-tag',
      regex: /<script[\\s>]/gi,
      severity: 'critical',
      description: 'Script tag detected',
    },
    {
      name: 'event-handler',
      regex: /\\bon[a-z]+\\s*=\\s*['"]/gi,
      severity: 'critical',
      description: 'Inline event handler detected',
    },
    {
      name: 'javascript-protocol',
      regex: /javascript\\s*:/gi,
      severity: 'critical',
      description: 'javascript: protocol detected',
    },
    {
      name: 'data-uri',
      regex: /data\\s*:[^,]*(?:text\\/html|application\\/x?html)/gi,
      severity: 'high',
      description: 'HTML data URI detected',
    },
    {
      name: 'vbscript-protocol',
      regex: /vbscript\\s*:/gi,
      severity: 'critical',
      description: 'vbscript: protocol detected',
    },
    {
      name: 'expression-css',
      regex: /expression\\s*\\(/gi,
      severity: 'high',
      description: 'CSS expression() detected',
    },
    {
      name: 'eval-usage',
      regex: /\\beval\\s*\\(/gi,
      severity: 'high',
      description: 'eval() call detected',
    },
    {
      name: 'iframe-injection',
      regex: /<iframe[\\s>]/gi,
      severity: 'medium',
      description: 'iframe tag detected',
    },
    {
      name: 'object-embed',
      regex: /<(?:object|embed|applet)[\\s>]/gi,
      severity: 'high',
      description: 'Object/Embed/Applet tag detected',
    },
    {
      name: 'base-tag',
      regex: /<base[\\s>]/gi,
      severity: 'high',
      description: 'Base tag detected (can hijack relative URLs)',
    },
    {
      name: 'svg-script',
      regex: /<svg[^>]*>.*?<script/gis,
      severity: 'critical',
      description: 'Script inside SVG detected',
    },
    {
      name: 'html-entity-evasion',
      regex: /&#x?[0-9a-f]+;/gi,
      severity: 'low',
      description: 'HTML entity encoding (potential evasion)',
    },
  ];

  // Decode common evasion techniques before scanning
  let decoded = html;
  try {
    decoded = decodeURIComponent(html);
  } catch {}

  // Scan both original and decoded versions
  for (const input of [html, decoded]) {
    for (const pattern of patterns) {
      let match;
      pattern.regex.lastIndex = 0;
      while ((match = pattern.regex.exec(input)) !== null) {
        const existing = threats.find(
          t => t.type === pattern.name && t.position === match.index
        );
        if (!existing) {
          threats.push({
            type: pattern.name,
            severity: pattern.severity,
            description: pattern.description,
            matched: match[0],
            position: match.index,
            context: input.substring(
              Math.max(0, match.index - 20),
              match.index + match[0].length + 20
            ),
          });
        }
      }
    }
  }

  return threats.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.severity] - order[b.severity];
  });
}

// Tests
const results = scanForXss(
  '<div onclick="alert(1)"><a href="javascript:void(0)">click</a></div>'
);
console.log(JSON.stringify(results, null, 2));
// Detects: event-handler (onclick), javascript-protocol`,
      explanation: "This scanner uses pattern matching to detect common XSS vectors. It checks for script tags, inline event handlers, dangerous protocols, CSS expressions, eval calls, and encoding evasion. It decodes URL-encoded input to catch basic evasion attempts. Note: this is a heuristic tool — it will produce false positives and cannot catch all XSS. Production applications should use established libraries like DOMPurify for sanitization and CSP for enforcement, not regex-based detection."
    }
  ],
  quiz: [
    {
      question: "Which XSS type persists in the database and executes for every user who views the affected page?",
      options: [
        "Stored XSS",
        "Reflected XSS",
        "DOM-based XSS",
        "Self-XSS"
      ],
      correct: 0,
      explanation: "Stored (persistent) XSS occurs when malicious input is saved to the server's database and rendered to all users who view the affected content. This makes it the most dangerous type because it doesn't require the victim to click a specially crafted link."
    },
    {
      question: "What does `SameSite=Lax` on a cookie prevent?",
      options: [
        "Cross-site cookies on top-level GET navigations",
        "Cross-site cookies on POST requests and subresource loads, but allows top-level GET navigations",
        "All cross-site cookie transmission",
        "JavaScript access to the cookie"
      ],
      correct: 1,
      explanation: "SameSite=Lax blocks cookies from being sent on cross-site subrequests (images, iframes, AJAX) and cross-site POST form submissions, but still allows cookies on top-level GET navigations (clicking a link from another site). This protects against most CSRF attacks while preserving the user experience of following links."
    },
    {
      question: "Why is `dangerouslySetInnerHTML` in React named with 'dangerously'?",
      options: [
        "It causes performance issues",
        "It bypasses React's virtual DOM diffing",
        "It bypasses React's automatic XSS escaping and injects raw HTML",
        "It only works in development mode"
      ],
      correct: 2,
      explanation: "React auto-escapes all values in JSX to prevent XSS. `dangerouslySetInnerHTML` bypasses this protection and injects raw HTML directly into the DOM, which can execute malicious scripts if the HTML is not properly sanitized. The name is intentionally alarming to make developers think twice before using it."
    },
    {
      question: "In a CSRF attack, what does the attacker exploit?",
      options: [
        "A vulnerability in the browser's JavaScript engine",
        "The browser's automatic inclusion of cookies with cross-origin requests",
        "An XSS vulnerability on the target site",
        "Weak password policies"
      ],
      correct: 1,
      explanation: "CSRF exploits the fact that browsers automatically attach cookies (including session cookies) to every request made to a domain, regardless of which site initiated the request. The attacker's site can create requests to the target site that the browser will send with the victim's authentication cookies."
    },
    {
      question: "Which CSP directive is most effective at preventing inline script execution XSS?",
      options: [
        "default-src 'self'",
        "script-src 'nonce-{random}' 'strict-dynamic'",
        "style-src 'unsafe-inline'",
        "img-src *"
      ],
      correct: 1,
      explanation: "Using `script-src` with a nonce ensures only scripts with the matching server-generated nonce attribute can execute. `strict-dynamic` allows those approved scripts to load additional scripts. This blocks all inline scripts, injected scripts, and unauthorized external scripts — the most common XSS execution paths."
    }
  ]
};
