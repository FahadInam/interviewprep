export const fetchCors = {
  id: "fetch-cors",
  title: "Fetch API & CORS",
  icon: "🌐",
  tag: "Browser APIs",
  tagColor: "var(--tag-js)",
  subtitle: "Deep dive into the Fetch API, CORS mechanism, same-origin policy, and proxy patterns.",
  concepts: [
    {
      title: "Fetch API Deep Dive",
      explanations: {
        layman: "Fetch is like ordering food online. You place an order (request) and get a delivery (response). But just because the delivery arrives doesn't mean your food is correct -- you still need to check the bag. Similarly, fetch gives you a response even for errors like 404, and you have to check yourself.",
        mid: "Fetch resolves the promise as long as the server responds, even for 404 or 500 status codes. It only rejects on network failures like no internet. Always check response.ok or response.status before reading the body. The response body is a stream, so you can only read it once.",
        senior: "Production fetch layers typically wrap the native API with AbortController for timeouts, exponential backoff retries for transient failures, and normalized error objects that carry status, body, and request metadata. Body streams are single-read, so clone before consuming if you need the data in multiple places."
      },
      realWorld: "Your API call works perfectly in Postman but breaks in the browser -- usually because CORS headers are missing on the server side.",
      whenToUse: "Whenever you need to make HTTP requests from the browser, especially with custom headers, auth tokens, or cookies.",
      whenNotToUse: "If your frontend and API share the same origin and you have no special header needs, basic fetch without CORS config is fine.",
      pitfalls: "CORS is a server-side fix, not a client-side one. Adding headers on the frontend won't solve a missing Access-Control-Allow-Origin from the server.",
      codeExamples: [
        {
          title: "Comprehensive fetch patterns",
          code: `async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(\`HTTP \${res.status}: \${res.statusText}\`);
  }
  return res.json();
}

async function postData(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(\`\${res.status}: \${text}\`);
  }

  return res.json();
}

async function fetchWithTimeout(url, ms = 5000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);

  try {
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw err;
  }
}

async function readStream(url) {
  const res = await fetch(url);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
  }

  return text;
}

async function fetchRetry(url, options = {}, maxRetries = 3) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.ok || res.status < 500) return res;
      throw new Error(\`Server error: \${res.status}\`);
    } catch (err) {
      if (i === maxRetries) throw err;
      const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}`
        }
      ]
    },
    {
      title: "CORS Deep Dive",
      explanations: {
        layman: "Imagine a building with a security guard. Your browser is the guard, and it won't let your website talk to a different server unless that server shows an ID badge (special headers) saying 'yes, I allow this visitor.' That's CORS -- the server has to give permission.",
        mid: "When your frontend makes a cross-origin request with custom headers or non-simple methods like PUT/DELETE, the browser sends a preflight OPTIONS request first. The server must respond with the right Access-Control headers, or the browser blocks the actual request. Credentials (cookies) require the server to specify your exact origin, not a wildcard. POST requests with `Content-Type: application/json` also trigger a preflight — only `text/plain`, `multipart/form-data`, and `application/x-www-form-urlencoded` are considered 'simple' content types.",
        senior: "Debug CORS by inspecting the OPTIONS preflight response headers in the Network tab, not by guessing. Check Access-Control-Allow-Origin, Allow-Methods, Allow-Headers, and Max-Age. Credential-mode requests require explicit origin matching and Access-Control-Allow-Credentials: true. Cached preflights can mask config changes."
      },
      realWorld: "Your PUT request with a JSON body works in Postman but fails in the browser because the server isn't responding to the preflight OPTIONS request.",
      whenToUse: "When your frontend calls an API on a different domain, port, or protocol.",
      whenNotToUse: "When your frontend and API are served from the same origin -- the browser skips CORS entirely.",
      pitfalls: "You can't fix CORS from the frontend. The fix is always on the server. Also, wildcard origins and credentials don't mix.",
      codeExamples: [
        {
          title: "CORS request types and server configuration",
          code: `// Simple request -- no preflight needed
fetch('https://api.example.com/data'); // Browser adds Origin header

// This triggers a preflight because of PUT method and custom headers
fetch('https://api.example.com/data', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123',
    'X-Custom-Header': 'value'
  },
  body: JSON.stringify({ key: 'value' })
});

// Sends cookies cross-origin -- server must allow credentials explicitly
fetch('https://api.example.com/user', {
  credentials: 'include'
});`
        }
      ]
    },
    {
      title: "Same-Origin Policy",
      explanations: {
        layman: "Think of same-origin policy like apartment mailboxes. You can only open your own mailbox. A website at one address can't read data from a website at a different address. The browser enforces this to stop malicious sites from stealing your data from other tabs.",
        mid: "Two URLs share the same origin only when protocol, hostname, and port all match. https://example.com and http://example.com are different origins because the protocol differs. The browser blocks JavaScript from reading responses across origins unless the server opts in via CORS headers.",
        senior: "Same-origin policy is the foundation of browser security. It governs DOM access, XHR/fetch, cookies, and storage. Exceptions exist for scripts, images, and stylesheets (they load cross-origin but their content can't be read). postMessage provides controlled cross-origin communication between windows and iframes."
      },
      realWorld: "Your iframe from a third-party domain throws errors when your JavaScript tries to access its content, because same-origin policy blocks cross-origin DOM access.",
      whenToUse: "Understanding SOP matters whenever you embed iframes, load third-party scripts, or make cross-origin API calls.",
      whenNotToUse: "When everything -- frontend, API, assets -- lives on the same domain, port, and protocol.",
      pitfalls: "People often confuse domain with origin. Subdomains like api.example.com and example.com are different origins even though they share a domain.",
      codeExamples: [
        {
          title: "Same-origin checks and cross-origin communication",
          code: `function isSameOrigin(url1, url2) {
  const a = new URL(url1);
  const b = new URL(url2);
  return a.protocol === b.protocol
      && a.hostname === b.hostname
      && a.port === b.port;
}

// true -- same protocol, host, port, just different paths
console.log(isSameOrigin(
  'https://example.com/page1',
  'https://example.com/page2'
));

// false -- different protocols (https vs http)
console.log(isSameOrigin(
  'https://example.com',
  'http://example.com'
));

// false -- different hostnames (subdomain counts)
console.log(isSameOrigin(
  'https://example.com',
  'https://api.example.com'
));

// postMessage lets you safely talk across origins
const iframe = document.getElementById('widget');
iframe.contentWindow.postMessage(
  { type: 'INIT', data: { theme: 'dark' } },
  'https://widget.example.com' // always specify target origin!
);

// Always verify the sender's origin before trusting the message
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://myapp.com') return;

  if (event.data.type === 'INIT') {
    applyTheme(event.data.data.theme);
  }
});`
        }
      ]
    },
    {
      title: "CORS Proxy Patterns",
      explanations: {
        layman: "A CORS proxy is like asking a friend to buy something for you from a store that won't sell to you directly. Your browser can't call the API directly, so your own server calls it on your behalf and passes the result back.",
        mid: "In development, tools like Vite or Webpack can proxy API calls so the browser thinks it's talking to the same origin. In production, your backend or an API gateway acts as the proxy. This avoids CORS entirely because the browser only talks to your own server.",
        senior: "Treat your proxy layer as a security boundary. Validate and sanitize all forwarded requests. Rate-limit to prevent abuse. Whitelist allowed target hosts. Don't blindly forward auth headers to third-party APIs. In dev, use the bundler's built-in proxy config to avoid CORS during development."
      },
      realWorld: "During development, you proxy /api calls through Vite's dev server to your backend so you never hit CORS issues locally.",
      whenToUse: "When you can't control the third-party API's CORS headers, or during local development when frontend and backend run on different ports.",
      whenNotToUse: "When the API already supports CORS properly or when your frontend and backend share the same origin in production.",
      pitfalls: "An open proxy that forwards any request anywhere is a security hole. Always restrict which hosts your proxy can reach.",
      codeExamples: [
        {
          title: "CORS proxy patterns",
          code: `// In dev, /api hits the local proxy. In prod, it hits the real API directly.
const API = import.meta.env.DEV ? '/api' : 'https://your-api.com';

async function getData() {
  const res = await fetch(\`\${API}/endpoint\`);
  return res.json();
}`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "Why does fetch not reject on HTTP 404 or 500 errors?",
      answer: "Fetch treats any completed HTTP response as a success, even 404 or 500. It only rejects when the request can't complete at all, like a network failure or DNS error. This design separates 'did the server respond?' from 'was the response good?' You need to check response.ok or response.status yourself. Axios, by comparison, rejects on non-2xx automatically.",
      difficulty: "easy",
      followUps: [
        "How would you write a fetch wrapper that rejects on non-2xx responses?",
        "What causes fetch to actually reject?",
        "How does this differ from Axios?"
      ]
    },
    {
      question: "What is a CORS preflight request and when is it triggered?",
      answer: "A preflight is an OPTIONS request the browser sends before the real request to ask the server 'do you allow this method and these headers from this origin?' It triggers when you use non-simple methods (PUT, DELETE, PATCH), custom headers, or JSON content type. The server must respond with the right Access-Control-Allow headers. If the preflight fails, the browser never sends the actual request. You debug this by checking the OPTIONS response in the Network tab.",
      difficulty: "mid",
      followUps: [
        "What headers are in the CORS safelist?",
        "How would you debug a preflight failure in Chrome DevTools?",
        "Can you avoid preflight for authenticated requests?"
      ]
    },
    {
      question: "Explain the same-origin policy. Why does it exist?",
      answer: "Same-origin policy prevents a website from reading data from a different origin (protocol + hostname + port). It exists to stop attacks where a malicious page reads your banking data from another tab. Without it, any site could make requests to your logged-in services and steal the responses. CORS is the opt-in mechanism that lets servers selectively relax this restriction.",
      difficulty: "mid",
      followUps: [
        "What are the exceptions to same-origin policy?",
        "How does CORS relate to SOP?",
        "What is Site Isolation in Chrome?"
      ]
    },
    {
      question: "How do you cancel a fetch request?",
      answer: "Create an AbortController, pass its signal to fetch, and call controller.abort() when you want to cancel. The fetch promise rejects with an AbortError. Once aborted, the controller can't be reused -- you need a new one. This is essential for cancelling requests when a component unmounts or when the user types a new search query before the old one finishes.",
      difficulty: "mid",
      followUps: [
        "Can you reuse an AbortController after abort?",
        "How does a CORS proxy work under the hood?",
        "What are the security risks of using a public CORS proxy?"
      ]
    },
    {
      question: "Why can't you use Access-Control-Allow-Origin: * with credentials?",
      answer: "If the browser sent cookies to any server that uses *, a malicious site could make credentialed requests to your bank and read the response. So the spec requires the server to echo back the exact origin, not a wildcard, when Access-Control-Allow-Credentials is true. The server typically reads the Origin header from the request, checks it against an allowlist, and echoes it back.",
      difficulty: "hard",
      followUps: [
        "How do you handle multiple allowed origins on the server?",
        "How would you configure CORS on an Express server for a multi-tenant SaaS app?",
        "What is the Vary: Origin header and why is it important?"
      ]
    },
    {
      question: "What happens when you read a fetch Response body twice?",
      answer: "It throws a TypeError because the body is a ReadableStream that can only be consumed once. After you call response.json() or response.text(), the stream is locked and drained. If you need the body twice, call response.clone() before reading the first copy. This matters in service workers where you might cache a response and also return it to the page.",
      difficulty: "mid",
      followUps: [
        "When would you need to read a body twice?",
        "What is the performance impact of clone()?",
        "How does this relate to service worker response caching?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Build a fetch wrapper with retry, timeout, and error handling",
      difficulty: "hard",
      description: "Build a reusable fetch wrapper that supports automatic retries with exponential backoff, request timeouts via AbortController, and proper error handling that distinguishes client errors (4xx) from server errors (5xx).",
      solution: `async function fetchAPI(url, options = {}) {
  const {
    retries = 3,
    timeout = 5000,
    backoff = (attempt) => Math.pow(2, attempt) * 1000,
    ...fetchOptions
  } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);

    try {
      const res = await fetch(url, {
        ...fetchOptions,
        signal: ctrl.signal
      });

      clearTimeout(timer);

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        const err = new Error(\`HTTP \${res.status}: \${body}\`);
        err.status = res.status;
        err.response = res;

        // Don't retry client errors (except 429 rate limit)
        if (res.status < 500 && res.status !== 429) {
          throw err;
        }

        if (attempt === retries) throw err;
      } else {
        return res;
      }
    } catch (err) {
      clearTimeout(timer);

      if (err.name === 'AbortError') {
        err = new Error(\`Request timeout after \${timeout}ms\`);
        err.code = 'TIMEOUT';
      }

      if (attempt === retries) throw err;

      // Don't retry client errors
      if (err.status && err.status < 500 && err.status !== 429) throw err;
    }

    // Wait with exponential backoff before retrying
    await new Promise(r => setTimeout(r, backoff(attempt)));
  }
}

const res = await fetchAPI('https://api.example.com/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ key: 'value' }),
  retries: 3,
  timeout: 5000
});
const data = await res.json();`,
      explanation: "Separates retry/timeout config from fetch options. Only retries server errors and rate limits, not client errors like 404. Uses AbortController for clean timeouts. Exponential backoff prevents hammering a struggling server."
    },
    {
      title: "Implement a request deduplication layer",
      difficulty: "mid",
      description: "Build a fetch wrapper that deduplicates identical GET requests happening at the same time. If three components all request /api/user/123 simultaneously, only one actual HTTP request should be made, and all three callers should get the response.",
      solution: `function createDedupFetch() {
  const pending = new Map(); // tracks in-flight requests by key

  return async function dedupFetch(url, options = {}) {
    // Only dedup GET requests -- mutations should always go through
    if (options.method && options.method.toUpperCase() !== 'GET') {
      return fetch(url, options);
    }

    // Build a cache key from URL + headers
    const key = url + (options.headers
      ? JSON.stringify(options.headers)
      : '');

    // If this exact request is already in flight, wait for it and clone
    if (pending.has(key)) {
      const existing = pending.get(key);
      const res = await existing;
      return res.clone(); // each caller needs their own body stream
    }

    // Make the actual request and track it
    const promise = fetch(url, options).then(res => {
      queueMicrotask(() => pending.delete(key)); // clean up after microtask
      return res;
    }).catch(err => {
      pending.delete(key); // clean up on failure too
      throw err;
    });

    pending.set(key, promise);

    return promise;
  };
}

const dedupFetch = createDedupFetch();

// Only 1 real HTTP request fires, all 3 get the response
const [a, b, c] = await Promise.all([
  dedupFetch('/api/user/123'),
  dedupFetch('/api/user/123'),
  dedupFetch('/api/user/123'),
]);`,
      explanation: "Uses a Map to track in-flight requests by URL+headers key. Duplicate callers wait for the same promise and get a cloned response (since each body stream can only be read once). Only deduplicates GETs because POST/PUT should never be silently skipped."
    },
    {
      title: "Build a simple same-origin checker",
      difficulty: "easy",
      description: "Write a function that takes two URLs and returns true if they share the same origin (protocol + hostname + port). Handle relative URLs by resolving them against the current page's origin.",
      solution: `function isSameOrigin(url1, url2) {
  try {
    const a = new URL(url1);
    const b = new URL(url2);
    return a.origin === b.origin;
  } catch (e) {
    // If URL parsing fails, try resolving as relative URLs
    try {
      const base = window.location.origin;
      const a = new URL(url1, base);
      const b = new URL(url2, base);
      return a.origin === b.origin;
    } catch {
      return false;
    }
  }
}

// true -- same origin, different paths
console.log(isSameOrigin(
  'https://example.com/path',
  'https://example.com/other'
));

// false -- http vs https is a different origin
console.log(isSameOrigin(
  'https://example.com',
  'http://example.com'
));

// true -- port 443 is the default for https
console.log(isSameOrigin(
  'https://example.com:443',
  'https://example.com'
));

// false -- subdomain means different hostname
console.log(isSameOrigin(
  'https://api.example.com',
  'https://example.com'
));`,
      explanation: "Uses the URL constructor which gives you a built-in .origin property (protocol + hostname + port). Falls back to resolving relative URLs against the current page. Returns false if the URL can't be parsed at all."
    }
  ],
  quiz: [
    {
      question: "What does fetch return when the server responds with HTTP 500?",
      options: [
        "A rejected promise with a network error",
        "A resolved promise with response.ok === false",
        "undefined",
        "A rejected promise with the status code"
      ],
      correct: 1,
      explanation: "Fetch resolves as long as the server responds. A 500 is still a valid HTTP response, so you get a resolved promise. But response.ok is false because the status isn't in the 200-299 range."
    },
    {
      question: "Which of these triggers a CORS preflight request?",
      options: [
        "A simple GET request with no custom headers",
        "A POST request with Content-Type: application/x-www-form-urlencoded",
        "A PUT request with Content-Type: application/json",
        "A GET request with Accept: application/json"
      ],
      correct: 2,
      explanation: "PUT is not a 'simple' method, and application/json is not a 'simple' content type. Either one alone would trigger a preflight, and this has both."
    },
    {
      question: "What makes two URLs 'same-origin'?",
      options: [
        "Same domain name only",
        "Same domain and path",
        "Same protocol, hostname, and port",
        "Same protocol and domain"
      ],
      correct: 2,
      explanation: "Origin is strictly protocol + hostname + port. Even if the domain matches, a different protocol (http vs https) or port makes it a different origin."
    },
    {
      question: "What happens if you call response.json() twice on the same Response?",
      options: [
        "Returns the same parsed JSON both times",
        "Returns the parsed JSON, then returns null",
        "Throws a TypeError because the body has already been consumed",
        "Returns the parsed JSON, then returns an empty object"
      ],
      correct: 2,
      explanation: "The response body is a stream that can only be read once. After the first .json() call drains the stream, calling it again throws a TypeError. Use response.clone() if you need the body twice."
    }
  ]
};
