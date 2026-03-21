export const corsCookiesSecurity = {
  id: "cors-cookies",
  title: "CORS & Cookie Security",
  icon: "🍪",
  tag: "Security",
  tagColor: "var(--tag-system)",
  subtitle: "Cross-origin resource sharing and secure cookie configuration in depth.",
  concepts: [
    {
      title: "CORS from a Security Perspective",
      explanations: {
        layman: "Your browser has a simple security rule: code from website A is not allowed to read data from website B. This is called the Same-Origin Policy, and it protects you by default. But sometimes website B WANTS to share data with website A — for example, your frontend at app.com needs to call your API at api.com. CORS is how website B gives permission. It sends special headers that say 'Yes, I trust app.com — let them read my data.' For certain requests, the browser even makes a quick phone call first (called a preflight) to ask: 'Hey api.com, is this type of request okay?' Only if api.com says yes does the browser send the real request.",
        mid: "CORS is a browser-enforced security mechanism that relaxes the Same-Origin Policy in a controlled way. The Same-Origin Policy blocks JavaScript from reading cross-origin responses. CORS lets servers opt in to allowing specific cross-origin access via response headers. Simple requests (GET/HEAD/POST with standard headers and content types) go through directly, but the browser only exposes the response if the server includes `Access-Control-Allow-Origin`. Non-simple requests (custom headers, PUT/DELETE, non-standard Content-Type) trigger a preflight OPTIONS request where the browser asks 'Is this type of request allowed?' before sending the actual request. Credentialed requests (with cookies) require `Access-Control-Allow-Credentials: true` AND a specific origin (not wildcard `*`). Security pitfalls include: reflecting the Origin header blindly (effectively allowing all origins), allowing `null` origin (exploitable via sandboxed iframes and data URIs), and exposing sensitive response headers without `Access-Control-Expose-Headers`.",
        senior: "CORS misconfigurations are consistently in the OWASP Top 10 and are among the most common security findings in penetration tests. Critical audit points: (1) Origin reflection — servers that echo back whatever Origin header they receive effectively disable CORS protection. Check for `Access-Control-Allow-Origin: ${req.headers.origin}` patterns. (2) Null origin — `Access-Control-Allow-Origin: null` is exploitable because sandboxed iframes, data URIs, and redirected requests send Origin: null. (3) Regex bypasses — patterns like `/^https:\\/\\/.*\\.example\\.com$/` can be bypassed with `https://evil.example.com` or `https://example.com.evil.com` depending on the regex. Always anchor regexes and use an explicit allowlist. (4) Pre-domain wildcard — `*.example.com` doesn't match `example.com` itself, and subdomain takeover on any subdomain breaks the entire CORS policy. (5) Internal network exposure — CORS headers on internal APIs can let public websites access internal resources if an employee visits a malicious site. (6) Cache poisoning — if the server varies responses by Origin but the CDN doesn't include Origin in its cache key, an attacker can poison the cache with a response lacking CORS headers (or containing the wrong origin). Always ensure `Vary: Origin` is set when CORS headers are dynamic."
      },
      realWorld: "In 2019, multiple cryptocurrency exchanges had CORS misconfigurations that allowed attackers to read API keys and perform trades. AWS S3 CORS misconfigurations frequently expose sensitive data. Many GraphQL APIs are discovered to reflect Origin headers blindly because of copy-pasted boilerplate CORS middleware configuration.",
      whenToUse: "Configure CORS when your API needs to be accessed from a different origin than where it's hosted — e.g., your React app at app.example.com calling api.example.com. Use explicit origin allowlists, not wildcards, for any endpoint that handles sensitive data or authentication.",
      whenNotToUse: "Don't enable CORS if your API is only accessed same-origin. Don't use `Access-Control-Allow-Origin: *` with credentials. Don't add CORS headers to internal-only APIs unless you understand the risk — it expands the attack surface.",
      pitfalls: "Using `*` as allowed origin with credentials (browsers reject this, but developers often misconfigure the fallback). Not including `Vary: Origin` causing CDN cache poisoning. Using regex matching for origins without proper anchoring. Forgetting that CORS only protects browser-initiated requests — server-to-server calls bypass CORS entirely. Allowing `null` origin thinking it is safe.",
      codeExamples: [
        {
          title: "Secure CORS Configuration",
          code: `// Express: Secure CORS with explicit allowlist
const allowedOrigins = new Set([
  'https://app.example.com',
  'https://admin.example.com',
]);

function secureCors(req, res, next) {
  const origin = req.headers.origin;

  if (allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin'); // Critical for CDN caching
  }

  if (req.method === 'OPTIONS') {
    // Preflight response
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-CSRF-Token');
    res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight 24h
    return res.status(204).end();
  }

  next();
}

// DANGEROUS: Never do this
function insecureCors(req, res, next) {
  // Reflects any origin — effectively disables CORS
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
}`
        }
      ]
    },
    {
      title: "Cookie Security Attributes",
      explanations: {
        layman: "Think of cookies like ID badges in an office building. A basic badge just has your name — anyone who finds it can use it. A secure cookie is like a badge with multiple security features: it only works in the main building (Secure = HTTPS only), it can't be photocopied (HttpOnly = JavaScript can't read it), and it only works when you walk through the front door (SameSite = only sent from the right website). The more security features your badge has, the harder it is for someone to misuse it if they find it.",
        mid: "Cookie attributes control how and when the browser sends cookies: `HttpOnly` prevents JavaScript from accessing the cookie via `document.cookie`, mitigating XSS-based cookie theft. `Secure` ensures the cookie is only sent over HTTPS, preventing network sniffing on unencrypted connections. `SameSite` controls cross-site sending behavior: `Strict` never sends the cookie cross-site (even on link clicks), `Lax` sends on top-level GET navigations but blocks subrequests and POSTs, `None` always sends (requires `Secure`). `Domain` controls which domains receive the cookie — omitting it restricts to the exact domain (no subdomains), while setting it enables subdomain access. `Path` restricts the cookie to specific URL paths. The `__Host-` prefix enforces that the cookie must be Secure, must not have a Domain attribute, and Path must be `/` — this prevents subdomain and path-based attacks. `__Secure-` prefix only requires the Secure flag.",
        senior: "Cookie security in production requires understanding the interplay between attributes and attack vectors. HttpOnly prevents direct XSS cookie theft but doesn't prevent XSS from using the cookie — an XSS payload can still make authenticated API calls. SameSite=Strict breaks OAuth flows and third-party integrations because cookies won't be sent on the redirect back. The practical choice is usually Lax for session cookies, plus CSRF tokens for POST endpoints. Cookie prefixes (`__Host-`, `__Secure-`) are underutilized but powerful: `__Host-session=abc` guarantees the cookie was set over HTTPS with no domain attribute (preventing subdomain injection) and path `/`. For multi-tenant SaaS on subdomains (tenant1.app.com, tenant2.app.com), cookie isolation is critical — if Domain is set to `.app.com`, all tenants share cookies. Use `__Host-` prefix or separate session management per tenant. Modern session management: use short-lived JWTs in memory for API auth + a long-lived refresh token in an HttpOnly, Secure, SameSite=Strict cookie. The refresh token endpoint issues new JWTs. This gives CSRF protection (cookie is Strict), XSS resilience (refresh token is HttpOnly), and token theft minimization (JWT expires quickly)."
      },
      realWorld: "GitHub uses `__Host-` prefix cookies for session management. Google's auth cookies combine HttpOnly, Secure, and SameSite. Many security breaches stem from misconfigured cookies — overly broad Domain attributes, missing HttpOnly on session cookies, or missing Secure flag allowing MITM attacks on public Wi-Fi.",
      whenToUse: "Every cookie containing sensitive data (session IDs, auth tokens) should have HttpOnly, Secure, and an appropriate SameSite value. Use `__Host-` prefix for the strongest protection. Set short maxAge/expires for session cookies. Use Path restrictions when a cookie is only needed for specific routes.",
      whenNotToUse: "HttpOnly cannot be set on cookies that JavaScript needs to read (like CSRF double-submit cookies or theme preference cookies). SameSite=Strict breaks OAuth redirect flows, so use Lax or None for cookies involved in third-party authentication.",
      pitfalls: "Setting Domain to a parent domain (`.example.com`) when subdomains aren't trusted. Forgetting that SameSite=None requires the Secure flag (browsers reject it otherwise). Not setting cookie expiration (creates session cookies that persist until the browser tab closes but not the session itself). Trusting that HttpOnly prevents all cookie-related attacks (it only prevents direct JS access, not usage via authenticated requests).",
      codeExamples: [
        {
          title: "Comprehensive Cookie Security Setup",
          code: `// Setting cookies with all security attributes
function setSecureSessionCookie(res, sessionId) {
  const cookieOptions = [
    '__Host-session=' + sessionId,    // __Host- prefix for max security
    'HttpOnly',                        // No JS access
    'Secure',                          // HTTPS only
    'SameSite=Lax',                    // CSRF baseline
    'Path=/',                          // Required for __Host-
    'Max-Age=3600',                    // 1 hour expiry
  ];
  res.setHeader('Set-Cookie', cookieOptions.join('; '));
}

// For CSRF double-submit cookie (JS needs to read it)
function setCsrfCookie(res, token) {
  const cookieOptions = [
    '__Secure-csrf=' + token,          // __Secure- prefix
    // NOT HttpOnly — JS needs to read this
    'Secure',
    'SameSite=Strict',                 // Strictest cross-site policy
    'Path=/',
    'Max-Age=3600',
  ];
  res.setHeader('Set-Cookie', cookieOptions.join('; '));
}

// Reading cookies safely on the client
function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) return decodeURIComponent(value);
  }
  return null;
}

// React hook for cookie management
function useSecureCookie(name) {
  const [value, setValue] = useState(() => getCookie(name));

  const setCookie = useCallback((val, maxAge = 3600) => {
    document.cookie = [
      name + '=' + encodeURIComponent(val),
      'Secure',
      'SameSite=Strict',
      'Path=/',
      'Max-Age=' + maxAge,
    ].join('; ');
    setValue(val);
  }, [name]);

  const removeCookie = useCallback(() => {
    document.cookie = name + '=; Max-Age=0; Path=/';
    setValue(null);
  }, [name]);

  return [value, setCookie, removeCookie];
}`
        }
      ]
    },
    {
      title: "Subresource Integrity (SRI)",
      explanations: {
        layman: "When you order a package online, you expect to receive exactly what you ordered. But what if someone at the warehouse swaps your item with something else? Subresource Integrity is like a tamper-proof seal on web resources. When you include a script from a CDN (Content Delivery Network), SRI lets you specify a 'fingerprint' (hash) of the file. The browser downloads the file, calculates its fingerprint, and only runs it if it matches. If someone tampers with the CDN file (like swapping your package), the browser refuses to use it.",
        mid: "SRI is a security feature that allows browsers to verify that files fetched from CDNs or third-party hosts haven't been tampered with. You add an `integrity` attribute with a cryptographic hash to `<script>` and `<link>` tags. The browser computes the hash of the downloaded file and compares it: if they don't match, the resource is blocked. The hash format is `{algorithm}-{base64-hash}` — e.g., `sha384-abc123...`. You can provide multiple hashes for fallback during version transitions. The `crossorigin` attribute must be set to `anonymous` (or `use-credentials`) for SRI to work with cross-origin resources — this ensures the browser has access to the raw response body for hashing. SRI only works with `<script>` and `<link>` elements, not images or fonts. If a SRI check fails, the browser fires an error event and blocks execution, but the page continues loading — so your application should handle graceful degradation.",
        senior: "SRI is a critical defense against supply chain attacks — one of the fastest-growing attack vectors. The 2018 event-stream incident (malicious code injected into an npm package) and the 2021 ua-parser-js compromise demonstrate real-world supply chain risks. For CDN-hosted resources, SRI provides integrity verification. Implementation strategy: (1) Generate SRI hashes at build time using `shasum -b -a 384 file.js | awk '{print $1}' | xxd -r -p | base64`. (2) Automate hash generation in your build pipeline — tools like webpack's `SriPlugin` or manually via `crypto.createHash('sha384').update(fileContent).digest('base64')`. (3) Use `sha384` as the standard algorithm (SHA-256 is also acceptable, SHA-512 for highest security). (4) Always pair with `crossorigin='anonymous'` for cross-origin resources. (5) Consider fallback loading: if the CDN file fails SRI, dynamically load from your own origin. Limitations: SRI doesn't protect against first-party compromises, doesn't work for resources that change dynamically (like frequently updated third-party scripts), and requires updating hashes whenever the resource version changes. For modern SPAs using bundlers, self-hosting dependencies eliminates the need for SRI on most resources, but it remains essential for any externally hosted scripts."
      },
      realWorld: "The British Airways breach in 2018 involved a compromised third-party script that skimmed payment card data for 15 days, affecting 380,000 transactions. SRI could have prevented the tampered script from executing. GitHub and Cloudflare provide SRI hashes for hosted resources. MDN Web Docs uses SRI for all CDN-loaded scripts.",
      whenToUse: "Use SRI for any script or stylesheet loaded from a CDN or third-party domain. Essential for payment pages, login forms, and any page handling sensitive data. Include it in build pipelines for automated hash generation.",
      whenNotToUse: "SRI is not practical for resources that change frequently without versioned URLs (like analytics scripts that auto-update). It's unnecessary for same-origin resources (though it adds defense in depth). It doesn't apply to images, fonts, or other non-script/style resources.",
      pitfalls: "Forgetting the `crossorigin` attribute (SRI silently fails without it for cross-origin resources). Not updating hashes when CDN resources are updated. Using SHA-1 (deprecated and insecure). Not having a fallback strategy when SRI blocks a resource — the page might break without the blocked script.",
      codeExamples: [
        {
          title: "SRI Implementation with Fallback",
          code: `<!-- SRI for CDN-loaded resources -->
<script
  src="https://cdn.example.com/react@18.2.0/react.production.min.js"
  integrity="sha384-oqVuNbFeAzXNPibrDFGH1aGn+7m8AOTK0YEPatJfJ2R83Rm6s/d/7JKoN2L9U8M"
  crossorigin="anonymous"
></script>

<link
  rel="stylesheet"
  href="https://cdn.example.com/bootstrap@5.3.0/css/bootstrap.min.css"
  integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7icsOvIY5xPMC"
  crossorigin="anonymous"
/>

<!-- JavaScript fallback when SRI fails -->
<script>
  // Check if the CDN script loaded successfully
  if (typeof React === 'undefined') {
    // SRI check failed or CDN is down — load from own server
    const fallback = document.createElement('script');
    fallback.src = '/vendor/react.production.min.js';
    document.head.appendChild(fallback);
    console.warn('CDN script failed SRI check, loaded local fallback');
  }
</script>

<!-- Node.js: Generate SRI hashes at build time -->
<script>
// build-sri.js
const crypto = require('crypto');
const fs = require('fs');

function generateSRI(filePath, algorithm = 'sha384') {
  const content = fs.readFileSync(filePath);
  const hash = crypto
    .createHash(algorithm)
    .update(content)
    .digest('base64');
  return algorithm + '-' + hash;
}

// Usage in build script
const sriHash = generateSRI('./dist/vendor/react.min.js');
console.log(sriHash);
// Output: sha384-oqVuNbFeAz...
</script>`
        }
      ]
    },
    {
      title: "Security Headers",
      explanations: {
        layman: "Security headers are like instructions you give to a delivery driver about how to handle your package. 'Handle with care' (Strict-Transport-Security — always use the safe HTTPS route). 'Do not open' (X-Content-Type-Options — don't try to guess what's inside, trust the label). 'Do not forward' (X-Frame-Options — don't let other websites embed this page in a frame). These headers are sent by the web server and tell the browser how to handle the content securely.",
        mid: "HTTP security headers are server-sent directives that activate browser-side security features: `Strict-Transport-Security` (HSTS) tells browsers to always use HTTPS for this domain, even if the user types `http://`. `max-age=31536000; includeSubDomains; preload` sets a year-long HTTPS policy including subdomains and eligibility for browser HSTS preload lists. `X-Content-Type-Options: nosniff` prevents MIME-type sniffing — the browser won't try to interpret a file as a different type than declared (prevents executing uploaded `.txt` files as scripts). `X-Frame-Options: DENY` prevents the page from being embedded in iframes (clickjacking protection). `Referrer-Policy: strict-origin-when-cross-origin` limits referrer information sent to other sites (prevents leaking URLs with sensitive query parameters). `Permissions-Policy` (formerly Feature-Policy) disables browser features like camera, microphone, geolocation at the document level.",
        senior: "Security headers should be deployed as a cohesive set. A production-grade configuration: (1) HSTS with preload — submit your domain to the browser HSTS preload list (hstspreload.org) so browsers enforce HTTPS even on the very first visit (before receiving the header). Set `max-age` to at least 1 year. (2) CSP — covered in XSS section but also prevents mixed content and clickjacking via `frame-ancestors`. (3) `X-Content-Type-Options: nosniff` — always set this. Without it, browsers may interpret uploaded files as executable content (e.g., an uploaded .jpg with script content could be sniffed as text/html). (4) Use `frame-ancestors` in CSP instead of X-Frame-Options (it's more granular and the modern standard). (5) `Referrer-Policy: strict-origin-when-cross-origin` balances functionality (origin is sent cross-origin) with privacy (path/query are not). (6) `Permissions-Policy: camera=(), microphone=(), geolocation=()` — deny by default, then allow specific features per-frame. (7) `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` enable `SharedArrayBuffer` and `performance.measureUserAgentSpecificMemory()` while isolating your origin from Spectre-like attacks. Monitor deployment with securityheaders.com and Mozilla Observatory. Use report-only variants first for HSTS and CSP."
      },
      realWorld: "Twitter was among the first major sites on the HSTS preload list. Google mandates security headers across all their properties. Many security audits start by checking headers using tools like Mozilla Observatory — a site scoring an 'F' without proper headers is a red flag even before any code review.",
      whenToUse: "Every production web application should deploy all the standard security headers. They are low-effort, high-impact security improvements. Add them at the web server or CDN level (Nginx, Cloudflare, Vercel) so they apply to all responses.",
      whenNotToUse: "Be cautious with HSTS if you might need to revert to HTTP (rare but possible during certificate issues). Don't set overly restrictive Permissions-Policy if you need browser features. Don't enable COEP without testing — it breaks loading cross-origin resources that don't set CORP headers.",
      pitfalls: "Setting HSTS max-age too low (use at least 1 year for meaningful protection). Setting X-Frame-Options to SAMEORIGIN when you need cross-origin framing (use CSP frame-ancestors instead for granular control). Not testing security headers before deploying (strict CSP or COEP can break your site). Forgetting to add Vary: Origin when CORS headers are present (cache poisoning risk).",
      codeExamples: [
        {
          title: "Complete Security Headers Middleware",
          code: `// Express middleware: all essential security headers
function securityHeaders(req, res, next) {
  // Force HTTPS for 1 year, including subdomains
  res.setHeader('Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload');

  // Prevent MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Clickjacking protection (legacy browsers)
  res.setHeader('X-Frame-Options', 'DENY');

  // Limit referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Disable dangerous browser features
  res.setHeader('Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()');

  // Cross-origin isolation (enables SharedArrayBuffer)
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

  // Prevent DNS prefetch leaks
  res.setHeader('X-DNS-Prefetch-Control', 'off');

  // Don't cache sensitive pages
  if (req.path.startsWith('/api/') || req.path.startsWith('/account')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
  }

  next();
}

app.use(securityHeaders);

// Nginx equivalent:
// add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
// add_header X-Content-Type-Options "nosniff" always;
// add_header X-Frame-Options "DENY" always;
// add_header Referrer-Policy "strict-origin-when-cross-origin" always;
// add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "Explain the CORS preflight mechanism. When does it trigger and why?",
      answer: "Before sending certain cross-origin requests, the browser sends a quick OPTIONS request called a preflight to ask the server: 'Will you accept this?' It triggers when the request is 'non-simple' — meaning it uses methods other than GET/HEAD/POST, includes custom headers like Authorization, or has a Content-Type other than form-data or plain text. The server responds with Access-Control-Allow-* headers. If they match what the browser wants to send, the real request proceeds. If not, the browser blocks it entirely. You can cache preflight results with Access-Control-Max-Age (e.g., 86400 for 24 hours) so the browser does not repeat the OPTIONS call on every request. The reason preflights exist: older servers were built before cross-origin requests existed, so this mechanism gives them a chance to say no before anything happens.",
      difficulty: "mid",
      followUps: [
        "How would you reduce preflight latency in a high-traffic application?",
        "What happens if the preflight succeeds but the actual request's CORS headers are different?",
        "Can you force a simple request to trigger a preflight?"
      ]
    },
    {
      question: "What is the difference between SameSite=Strict, Lax, and None?",
      answer: "SameSite=Strict never sends the cookie on cross-site requests — not even when clicking a link from another site to your site. This provides the strongest CSRF protection but breaks navigation flows (users clicking links from emails or other sites won't be authenticated). SameSite=Lax (the browser default since Chrome 80) sends cookies on top-level GET navigations (clicking a link) but blocks them on cross-site subrequests (iframes, images, AJAX, form POSTs). This balances security with usability. SameSite=None sends cookies on all cross-origin requests, which is the pre-SameSite behavior — it requires the Secure flag and is needed for legitimate cross-site scenarios like OAuth, embedded widgets, and third-party integrations. The key decision: use Strict for high-security cookies that never need cross-site access, Lax for session cookies (the most common choice), and None only when cross-site sending is genuinely required.",
      difficulty: "mid",
      followUps: [
        "How does SameSite interact with subdomain access?",
        "What broke when Chrome defaulted to SameSite=Lax?",
        "How does SameSite work with OAuth redirect flows?"
      ]
    },
    {
      question: "How does Subresource Integrity (SRI) protect against supply chain attacks?",
      answer: "SRI allows you to specify a cryptographic hash of a resource's expected content in the HTML tag's `integrity` attribute. When the browser downloads the resource, it computes the hash and compares it to the expected hash. If they don't match (because the file was tampered with on the CDN), the browser refuses to execute the resource. This protects against CDN compromises, man-in-the-middle attacks, and supply chain attacks where an attacker modifies a popular library. The hash is generated at build time from the known-good version of the file. You must also include `crossorigin='anonymous'` for cross-origin resources so the browser can access the raw response body for hashing. SRI works for script and link (stylesheet) elements only.",
      difficulty: "mid",
      followUps: [
        "How do you handle SRI when a CDN resource gets updated?",
        "What are the limitations of SRI?",
        "How would you automate SRI hash generation in a CI/CD pipeline?"
      ]
    },
    {
      question: "Why should you never use `Access-Control-Allow-Origin: *` with credentialed requests?",
      answer: "Browsers explicitly reject responses that combine `Access-Control-Allow-Origin: *` with `Access-Control-Allow-Credentials: true`. This is a deliberate security measure: if wildcard origins were allowed with credentials, any website on the internet could make authenticated requests to your API and read the responses — effectively giving every website full access to your users' data. The browser enforces that credentialed cross-origin requests must have a specific, explicit origin in the Allow-Origin header. A common but dangerous workaround is to dynamically set the origin from the request's Origin header: `res.setHeader('Access-Control-Allow-Origin', req.headers.origin)` — this technically satisfies the browser but effectively allows all origins, recreating the vulnerability. The correct approach is maintaining an explicit allowlist of trusted origins.",
      difficulty: "hard",
      followUps: [
        "What is the `null` origin and why is it dangerous to allow it?",
        "How do you handle CORS for microservices that need to accept requests from multiple frontends?",
        "What CORS risks exist with WebSocket connections?"
      ]
    },
    {
      question: "What is HSTS preloading and why is it important?",
      answer: "HSTS (HTTP Strict-Transport-Security) tells browsers to only connect to your site via HTTPS. But there is a bootstrap problem: on the very first visit, the browser hasn't seen the header yet and might connect via HTTP, vulnerable to SSL stripping attacks. HSTS preloading solves this by hardcoding your domain into the browser's source code (Chrome, Firefox, Safari all share a preload list). To qualify, you need: HTTPS on all subdomains, an HSTS header with max-age of at least 31536000 (1 year), includeSubDomains directive, and the preload directive. You submit at hstspreload.org. The catch: removal takes months and requires a browser update cycle. Before preloading, ensure all subdomains support HTTPS — including forgotten staging, legacy, or internal subdomains.",
      difficulty: "hard",
      followUps: [
        "What is an SSL stripping attack?",
        "What are the risks of HSTS preloading?",
        "How does HSTS interact with certificate errors?"
      ]
    },
    {
      question: "Explain the __Host- and __Secure- cookie prefixes and when to use each.",
      answer: "Cookie prefixes are a defense-in-depth mechanism enforced by the browser. `__Host-` is the strictest: the cookie must have the Secure flag, must NOT have a Domain attribute (restricting it to the exact host, no subdomains), and Path must be `/`. This prevents subdomain cookie injection attacks where an attacker controlling a subdomain sets a cookie that overrides the parent domain's cookie. `__Secure-` only requires the Secure flag, allowing Domain and Path to be set freely. Use `__Host-` for session cookies and any authentication tokens — it provides the strongest isolation. Use `__Secure-` when you need the cookie accessible across subdomains (like a shared login across sub.example.com and app.example.com) but still want to guarantee HTTPS-only transmission. The prefixes are enforced by the browser: if the requirements aren't met, the cookie is silently rejected.",
      difficulty: "hard",
      followUps: [
        "How do cookie prefixes interact with SameSite?",
        "What is a subdomain cookie injection attack?",
        "Why would you choose __Secure- over __Host-?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Implement a Secure Cookie Parser and Builder",
      difficulty: "mid",
      description: "Create a CookieBuilder class that enforces security best practices. It should support all security attributes, validate that __Host- and __Secure- prefix requirements are met, and throw errors for insecure configurations.",
      solution: `class CookieBuilder {
  constructor(name, value) {
    this.name = name;
    this.value = encodeURIComponent(value);
    this.attrs = {};
  }

  httpOnly() {
    this.attrs.httpOnly = true;
    return this;
  }

  secure() {
    this.attrs.secure = true;
    return this;
  }

  sameSite(value) {
    const allowed = ['Strict', 'Lax', 'None'];
    if (!allowed.includes(value)) {
      throw new Error('SameSite must be Strict, Lax, or None');
    }
    if (value === 'None' && !this.attrs.secure) {
      throw new Error('SameSite=None requires Secure flag');
    }
    this.attrs.sameSite = value;
    return this;
  }

  domain(domain) {
    if (this.name.startsWith('__Host-')) {
      throw new Error('__Host- cookies cannot have a Domain attribute');
    }
    this.attrs.domain = domain;
    return this;
  }

  path(path) {
    this.attrs.path = path;
    return this;
  }

  maxAge(seconds) {
    if (seconds < 0) throw new Error('maxAge must be positive');
    this.attrs.maxAge = seconds;
    return this;
  }

  expires(date) {
    this.attrs.expires = date instanceof Date ? date.toUTCString() : date;
    return this;
  }

  build() {
    this.validate();
    const parts = [this.name + '=' + this.value];

    if (this.attrs.httpOnly) parts.push('HttpOnly');
    if (this.attrs.secure) parts.push('Secure');
    if (this.attrs.sameSite) parts.push('SameSite=' + this.attrs.sameSite);
    if (this.attrs.domain) parts.push('Domain=' + this.attrs.domain);
    if (this.attrs.path) parts.push('Path=' + this.attrs.path);
    if (this.attrs.maxAge != null) parts.push('Max-Age=' + this.attrs.maxAge);
    if (this.attrs.expires) parts.push('Expires=' + this.attrs.expires);

    return parts.join('; ');
  }

  validate() {
    // __Host- prefix requirements
    if (this.name.startsWith('__Host-')) {
      if (!this.attrs.secure) {
        throw new Error('__Host- cookies require Secure flag');
      }
      if (this.attrs.domain) {
        throw new Error('__Host- cookies must not set Domain');
      }
      if (this.attrs.path !== '/') {
        throw new Error('__Host- cookies require Path=/');
      }
    }

    // __Secure- prefix requirements
    if (this.name.startsWith('__Secure-')) {
      if (!this.attrs.secure) {
        throw new Error('__Secure- cookies require Secure flag');
      }
    }

    // SameSite=None requires Secure
    if (this.attrs.sameSite === 'None' && !this.attrs.secure) {
      throw new Error('SameSite=None requires Secure flag');
    }
  }
}

// Usage
const session = new CookieBuilder('__Host-session', 'abc123')
  .httpOnly()
  .secure()
  .sameSite('Lax')
  .path('/')
  .maxAge(3600)
  .build();

console.log(session);
// __Host-session=abc123; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600

// This throws an error:
try {
  new CookieBuilder('__Host-bad', 'value')
    .domain('.example.com') // Error! __Host- cannot have Domain
    .build();
} catch (e) {
  console.log('Caught:', e.message);
}`,
      explanation: "The CookieBuilder enforces browser-mandated rules at construction time rather than at runtime: __Host- prefix requires Secure, no Domain, and Path=/. __Secure- prefix requires Secure. SameSite=None requires Secure. This prevents common misconfigurations and makes cookie security declarative and explicit."
    },
    {
      title: "Build a CORS Origin Validator",
      difficulty: "mid",
      description: "Create a robust CORS origin validator that supports exact matches, subdomain patterns, and regex patterns. It should defend against common bypass techniques like subdomain spoofing and null origin attacks.",
      solution: `class CorsValidator {
  constructor(config) {
    this.exactOrigins = new Set(config.exact || []);
    this.subdomainPatterns = (config.subdomains || []).map(domain => {
      // Ensure domain starts with a dot for subdomain matching
      const normalized = domain.startsWith('.') ? domain : '.' + domain;
      return normalized.toLowerCase();
    });
    this.allowNull = config.allowNull || false; // Default: reject null
  }

  isAllowed(origin) {
    if (!origin) return false;

    // NEVER allow 'null' origin unless explicitly configured
    // (sandboxed iframes and data URIs send Origin: null)
    if (origin === 'null') return this.allowNull;

    const normalized = origin.toLowerCase();

    // Check exact matches first
    if (this.exactOrigins.has(normalized)) {
      return true;
    }

    // Validate the origin is a proper URL
    let parsed;
    try {
      parsed = new URL(normalized);
    } catch {
      return false;
    }

    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    // Check subdomain patterns
    for (const pattern of this.subdomainPatterns) {
      // parsed.hostname must END with the pattern
      // AND the character before the match must be the start
      // This prevents evil.com matching .evil-example.com
      if (parsed.hostname === pattern.slice(1)) {
        // Exact match with base domain (without the leading dot)
        return true;
      }
      if (parsed.hostname.endsWith(pattern)) {
        return true;
      }
    }

    return false;
  }

  middleware() {
    return (req, res, next) => {
      const origin = req.headers.origin;

      if (origin && this.isAllowed(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Vary', 'Origin');
      }

      if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods',
          'GET, POST, PUT, DELETE, PATCH');
        res.setHeader('Access-Control-Allow-Headers',
          'Content-Type, Authorization, X-CSRF-Token');
        res.setHeader('Access-Control-Max-Age', '86400');
        return res.status(204).end();
      }

      next();
    };
  }
}

// Usage
const cors = new CorsValidator({
  exact: [
    'https://app.example.com',
    'https://admin.example.com',
  ],
  subdomains: ['.example.com'],
  allowNull: false, // Reject null origin (secure default)
});

// Tests
console.assert(cors.isAllowed('https://app.example.com') === true);
console.assert(cors.isAllowed('https://sub.example.com') === true);
console.assert(cors.isAllowed('https://evil.com') === false);
console.assert(cors.isAllowed('https://example.com.evil.com') === false);
console.assert(cors.isAllowed('null') === false);
console.assert(cors.isAllowed('javascript://example.com') === false);

app.use(cors.middleware());`,
      explanation: "This validator defends against common CORS bypass techniques: null origin attacks (rejected by default), subdomain spoofing (e.g., example.com.evil.com — the endsWith check requires a dot boundary), protocol-based attacks (only http/https allowed), and case sensitivity issues (everything is lowercased). Using a class makes the CORS policy testable and auditable."
    },
    {
      title: "Security Headers Audit Tool",
      difficulty: "hard",
      description: "Build a function that audits HTTP response headers and returns a security score with specific recommendations. Check for all essential security headers, detect dangerous configurations, and provide actionable fixes.",
      solution: `function auditSecurityHeaders(headers) {
  const results = {
    score: 0,
    maxScore: 0,
    grade: '',
    findings: [],
  };

  const checks = [
    {
      name: 'Strict-Transport-Security',
      weight: 15,
      check: (value) => {
        if (!value) return { pass: false, message: 'Missing HSTS header', fix: "Add: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload" };
        const maxAge = parseInt(value.match(/max-age=(\\d+)/)?.[1] || '0');
        if (maxAge < 31536000) return { pass: false, message: 'HSTS max-age is less than 1 year (' + maxAge + 's)', fix: 'Set max-age to at least 31536000' };
        if (!value.includes('includeSubDomains')) return { pass: false, message: 'HSTS missing includeSubDomains', fix: 'Add includeSubDomains directive' };
        return { pass: true, message: 'HSTS properly configured' };
      }
    },
    {
      name: 'Content-Security-Policy',
      weight: 25,
      check: (value) => {
        if (!value) return { pass: false, message: 'Missing CSP header', fix: "Add a Content-Security-Policy with at least: default-src 'self'; script-src 'self'" };
        const issues = [];
        if (value.includes("'unsafe-inline'") && value.includes('script-src'))
          issues.push("script-src uses 'unsafe-inline' (allows XSS)");
        if (value.includes("'unsafe-eval'"))
          issues.push("Uses 'unsafe-eval' (allows code injection)");
        if (value.includes('script-src *') || value.includes("default-src *"))
          issues.push('Wildcard in script-src or default-src (too permissive)');
        if (issues.length > 0) return { pass: false, message: issues.join('; '), fix: "Use nonce-based script-src and remove unsafe-inline/unsafe-eval" };
        return { pass: true, message: 'CSP is configured' };
      }
    },
    {
      name: 'X-Content-Type-Options',
      weight: 10,
      check: (value) => {
        if (!value) return { pass: false, message: 'Missing X-Content-Type-Options', fix: 'Add: X-Content-Type-Options: nosniff' };
        if (value !== 'nosniff') return { pass: false, message: 'X-Content-Type-Options is not set to nosniff', fix: 'Set value to: nosniff' };
        return { pass: true, message: 'MIME sniffing protection enabled' };
      }
    },
    {
      name: 'X-Frame-Options',
      weight: 10,
      check: (value) => {
        if (!value) return { pass: false, message: 'Missing X-Frame-Options (clickjacking risk)', fix: 'Add: X-Frame-Options: DENY (or use CSP frame-ancestors)' };
        return { pass: true, message: 'Clickjacking protection enabled' };
      }
    },
    {
      name: 'Referrer-Policy',
      weight: 10,
      check: (value) => {
        if (!value) return { pass: false, message: 'Missing Referrer-Policy', fix: 'Add: Referrer-Policy: strict-origin-when-cross-origin' };
        const unsafe = ['unsafe-url', 'no-referrer-when-downgrade'];
        if (unsafe.includes(value)) return { pass: false, message: 'Referrer-Policy is too permissive: ' + value, fix: 'Use strict-origin-when-cross-origin or no-referrer' };
        return { pass: true, message: 'Referrer policy configured' };
      }
    },
    {
      name: 'Permissions-Policy',
      weight: 10,
      check: (value) => {
        if (!value) return { pass: false, message: 'Missing Permissions-Policy', fix: 'Add: Permissions-Policy: camera=(), microphone=(), geolocation=()' };
        return { pass: true, message: 'Permissions policy configured' };
      }
    },
    {
      name: 'Access-Control-Allow-Origin',
      weight: 10,
      check: (value) => {
        if (!value) return { pass: true, message: 'No CORS headers (same-origin only)' };
        if (value === '*') return { pass: false, message: 'CORS allows all origins', fix: 'Use specific origin allowlist instead of wildcard' };
        if (value === 'null') return { pass: false, message: 'CORS allows null origin (exploitable)', fix: 'Remove null from allowed origins' };
        return { pass: true, message: 'CORS configured with specific origin' };
      }
    },
    {
      name: 'X-Powered-By',
      weight: 5,
      check: (value) => {
        if (value) return { pass: false, message: 'X-Powered-By header exposes server technology: ' + value, fix: 'Remove X-Powered-By header (app.disable("x-powered-by") in Express)' };
        return { pass: true, message: 'Server technology not exposed' };
      }
    },
    {
      name: 'Server',
      weight: 5,
      check: (value) => {
        if (value && (value.includes('/') || value.match(/\\d/))) {
          return { pass: false, message: 'Server header exposes version info: ' + value, fix: 'Remove version from Server header' };
        }
        return { pass: true, message: 'Server version not exposed' };
      }
    },
  ];

  for (const check of checks) {
    results.maxScore += check.weight;
    const headerValue = headers[check.name.toLowerCase()] || headers[check.name] || null;
    const result = check.check(headerValue);

    if (result.pass) results.score += check.weight;
    results.findings.push({
      header: check.name,
      passed: result.pass,
      message: result.message,
      fix: result.fix || null,
      weight: check.weight,
    });
  }

  const percentage = (results.score / results.maxScore) * 100;
  results.grade = percentage >= 90 ? 'A' : percentage >= 70 ? 'B' :
    percentage >= 50 ? 'C' : percentage >= 30 ? 'D' : 'F';

  return results;
}

// Test
const audit = auditSecurityHeaders({
  'strict-transport-security': 'max-age=31536000; includeSubDomains; preload',
  'content-security-policy': "default-src 'self'; script-src 'nonce-abc123'",
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
});

console.log('Grade:', audit.grade);
console.log('Score:', audit.score + '/' + audit.maxScore);
audit.findings.filter(f => !f.passed).forEach(f => {
  console.log('FAIL:', f.header, '-', f.message);
  console.log('  Fix:', f.fix);
});`,
      explanation: "The audit function checks for all essential security headers, detects dangerous configurations (unsafe-inline in CSP, wildcard CORS, exposed server versions), provides specific fix instructions, and computes a weighted security score. This mirrors what tools like Mozilla Observatory and securityheaders.com do, giving developers actionable feedback during development."
    }
  ],
  quiz: [
    {
      question: "What triggers a CORS preflight (OPTIONS) request?",
      options: [
        "Any request to a different domain",
        "Only GET requests with custom headers",
        "Requests with non-simple methods, custom headers, or non-standard Content-Types",
        "Only POST requests with JSON body"
      ],
      correct: 2,
      explanation: "A preflight is triggered by 'non-simple' requests: methods other than GET/HEAD/POST, custom headers (like Authorization or X-Custom), or Content-Type values other than application/x-www-form-urlencoded, multipart/form-data, or text/plain. A POST with Content-Type: application/json triggers a preflight because application/json is not a 'simple' content type."
    },
    {
      question: "What does the HttpOnly cookie attribute prevent?",
      options: [
        "The cookie from being sent over HTTP (requires HTTPS)",
        "JavaScript from accessing the cookie via document.cookie",
        "The cookie from being sent in cross-site requests",
        "The cookie from being stored in the browser"
      ],
      correct: 1,
      explanation: "HttpOnly prevents client-side JavaScript from reading the cookie via document.cookie or any DOM API. This mitigates XSS-based cookie theft — even if an attacker injects a script, they cannot exfiltrate HttpOnly cookies. Note: HttpOnly does NOT prevent the cookie from being sent with requests (the browser still sends it automatically)."
    },
    {
      question: "What is the security risk of `Access-Control-Allow-Origin: null`?",
      options: [
        "It blocks all cross-origin requests",
        "It only allows requests from localhost",
        "It allows requests from sandboxed iframes and data URIs, which attackers can create",
        "It disables CORS entirely"
      ],
      correct: 2,
      explanation: "The 'null' origin is sent by sandboxed iframes, data: URIs, file: URIs, and certain redirect scenarios. An attacker can create a sandboxed iframe that sends Origin: null, so allowing null effectively lets any attacker make credentialed cross-origin requests that the server will accept."
    },
    {
      question: "What does Strict-Transport-Security: max-age=0 do?",
      options: [
        "Enables HSTS permanently",
        "Disables HSTS by telling the browser to remove the HSTS policy for this domain",
        "Sets the HTTPS upgrade to happen instantly",
        "Causes an error in the browser"
      ],
      correct: 1,
      explanation: "Setting max-age=0 tells the browser to remove the HSTS entry for the domain — it is the standard way to disable HSTS. This is useful when transitioning away from HTTPS-only (though this is rare). Note that if the domain is in the browser's HSTS preload list, max-age=0 has no effect — the preloaded entry takes precedence."
    },
    {
      question: "Why must the `crossorigin` attribute be set when using SRI with cross-origin resources?",
      options: [
        "It forces the browser to use HTTPS",
        "It enables the browser to access the raw response body for hash verification",
        "It prevents CSRF attacks on the CDN",
        "It is only required for stylesheet resources, not scripts"
      ],
      correct: 1,
      explanation: "Without the crossorigin attribute, the browser treats cross-origin responses as opaque — it cannot access the raw bytes of the response body. SRI needs to compute a hash of the content, which requires access to the actual bytes. Setting crossorigin='anonymous' (or 'use-credentials') triggers a CORS request, and if the server includes the appropriate CORS headers, the browser can access the response body to compute and verify the SRI hash."
    }
  ]
};
