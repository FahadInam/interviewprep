export const webStorage = {
  id: "web-storage",
  title: "Web Storage & Cookies",
  icon: "💾",
  tag: "Browser APIs",
  tagColor: "var(--tag-js)",
  subtitle: "Master cookies, localStorage, sessionStorage, IndexedDB, and their security considerations.",
  concepts: [
    {
      title: "Cookies Deep Dive",
      explanations: {
        layman: "Cookies are small pieces of text the browser saves and sends to the server with every request. Think of them like a name tag the server gives you so it remembers who you are next time.",
        mid: "Cookies have flags that control security and scope: HttpOnly blocks JavaScript access, Secure requires HTTPS, SameSite limits cross-site sending, and Path/Domain control which URLs receive the cookie.",
        senior: "For auth tokens, use `HttpOnly; Secure; SameSite=Strict` so JavaScript can never read them and they only travel over HTTPS. If you need SSO across subdomains, set `Domain=.example.com` with `SameSite=Lax` instead of Strict -- Strict blocks the cookie on cross-site navigations, which breaks 'Login with Google' flows. Watch the ~4KB per-cookie limit: if you're storing JSON in a cookie and it grows past that, the browser silently truncates or drops it."
      },
      realWorld: "E-commerce sites use cookies to keep you logged in and remember your cart across pages and visits.",
      whenToUse: "When you need data sent automatically with every HTTP request, like auth tokens or session IDs.",
      whenNotToUse: "When storing large amounts of data or anything that doesn't need to go to the server on every request.",
      pitfalls: "Storing auth tokens in localStorage exposes them to XSS attacks. Cookies without HttpOnly have the same problem.",
      codeExamples: [
        {
          title: "Cookie operations and security attributes",
          code: `document.cookie = 'theme=dark; Path=/; Max-Age=31536000; SameSite=Lax';

function getCookie(name) {
  const all = document.cookie.split('; ');
  const match = all.find(c => c.startsWith(name + '='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

function setCookie(name, value, options = {}) {
  const {
    maxAge,
    expires,
    path = '/',
    domain,
    secure = true,
    sameSite = 'Lax',
  } = options;

  let str = encodeURIComponent(name) + '=' + encodeURIComponent(value);

  if (maxAge != null) str += '; Max-Age=' + maxAge;
  if (expires) str += '; Expires=' + expires.toUTCString();
  if (path) str += '; Path=' + path;
  if (domain) str += '; Domain=' + domain;
  if (secure) str += '; Secure';
  if (sameSite) str += '; SameSite=' + sameSite;

  document.cookie = str;
}

function deleteCookie(name, path = '/') {
  document.cookie = name + '=; Path=' + path + '; Max-Age=0';
}

setCookie('prefs', JSON.stringify({ lang: 'en' }), {
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'Lax'
});

console.log(getCookie('prefs'));
deleteCookie('prefs');`
        }
      ]
    },
    {
      title: "localStorage vs sessionStorage",
      explanations: {
        layman: "Both store text data in the browser. localStorage stays forever (until you delete it). sessionStorage disappears when you close the tab. Like a notebook you keep vs. a sticky note you throw away.",
        mid: "Both are origin-scoped and store strings only (~5MB). localStorage persists across sessions; sessionStorage is tied to a single tab's lifetime. Use the storage event to react to changes from other tabs.",
        senior: "Pick localStorage for cross-session data like theme or language. Pick sessionStorage for per-tab state like form drafts that should disappear when the tab closes. Neither is encrypted -- any script on your page (including XSS-injected scripts) can read everything. Wrap `setItem` in try/catch because browsers throw `QuotaExceededError` at ~5MB, and private browsing modes may have even smaller limits or disable storage entirely."
      },
      realWorld: "Apps save your theme preference in localStorage so it persists, and save unsent form data in sessionStorage so a tab refresh doesn't lose your work.",
      whenToUse: "When you need fast, synchronous, client-only storage for small amounts of data.",
      whenNotToUse: "When storing sensitive data like tokens (use HttpOnly cookies) or large datasets (use IndexedDB).",
      pitfalls: "Auth tokens in localStorage are readable by any script on your page, including injected XSS scripts. Also, storage events only fire in other tabs, not the tab that made the change.",
      codeExamples: [
        {
          title: "localStorage and sessionStorage patterns",
          code: `const storage = {
  get(key, fallback = null) {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.warn('Storage is full');
      }
      return false;
    }
  },

  remove(key) {
    localStorage.removeItem(key);
  }
};

// Listen for changes made in OTHER tabs
window.addEventListener('storage', (e) => {
  if (e.key === 'auth_token' && e.newValue === null) {
    handleLogout();
  }

  if (e.key === 'theme') {
    applyTheme(JSON.parse(e.newValue));
  }
});

// Store data with an expiration time
function setWithExpiry(key, value, ttlMs) {
  const item = {
    value: value,
    expiry: Date.now() + ttlMs
  };
  localStorage.setItem(key, JSON.stringify(item));
}

// Get data only if it hasn't expired
function getWithExpiry(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  const item = JSON.parse(raw);
  if (Date.now() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  return item.value;
}

// Auto-save form data so refreshing the tab doesn't lose it
const form = document.querySelector('form');

form.addEventListener('input', () => {
  const data = Object.fromEntries(new FormData(form).entries());
  sessionStorage.setItem('form_draft', JSON.stringify(data));
});

// Restore saved form data on page load
const draft = sessionStorage.getItem('form_draft');
if (draft) {
  const data = JSON.parse(draft);
  Object.entries(data).forEach(([key, value]) => {
    const input = form.elements[key];
    if (input) input.value = value;
  });
}`
        }
      ]
    },
    {
      title: "IndexedDB and Storage Limits",
      explanations: {
        layman: "IndexedDB is like a mini database inside your browser. It can store way more data than localStorage and lets you search through it. Think of localStorage as a single drawer, IndexedDB as a filing cabinet.",
        mid: "IndexedDB is async and transaction-based, handling hundreds of megabytes. It supports indexes for fast lookups. The API is callback-heavy, so wrapping it in Promises makes it much easier to use.",
        senior: "Production IndexedDB needs versioned schema migrations in onupgradeneeded, proper error handling on transactions, and quota management via navigator.storage.estimate(). Consider libraries like idb for a cleaner async API."
      },
      realWorld: "Offline-first apps like Google Docs store document data in IndexedDB so you can keep working without internet.",
      whenToUse: "When you need to store large or structured data client-side, like cached API responses, offline data, or files.",
      whenNotToUse: "For small key-value pairs where localStorage is simpler. IndexedDB is overkill for saving a theme preference.",
      pitfalls: "Forgetting to handle version upgrades properly can corrupt your database. Always check storage quota before writing large amounts of data.",
      codeExamples: [
        {
          title: "IndexedDB with promise wrapper",
          code: `// Wraps the callback-based open() in a Promise
function openDB(name, version, onUpgrade) {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(name, version);

    req.onupgradeneeded = (e) => {
      onUpgrade(e.target.result, e.oldVersion);
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Runs a single transaction and returns the result
function dbRun(db, storeName, mode, callback) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const result = callback(store);

    tx.oncomplete = () => resolve(result.result || undefined);
    tx.onerror = () => reject(tx.error);

    if (result && result.onsuccess !== undefined) {
      result.onsuccess = () => resolve(result.result);
    }
  });
}

async function demo() {
  // Create database and define schema on first run
  const db = await openDB('myApp', 1, (db, oldVersion) => {
    if (oldVersion < 1) {
      const store = db.createObjectStore('users', { keyPath: 'id' });
      store.createIndex('email', 'email', { unique: true });
      store.createIndex('age', 'age', { unique: false });
    }
  });

  // Add or update a user
  await dbRun(db, 'users', 'readwrite', (store) => {
    return store.put({ id: 1, name: 'Alice', email: 'alice@test.com', age: 30 });
  });

  // Read a user by ID
  const user = await dbRun(db, 'users', 'readonly', (store) => {
    return store.get(1);
  });
  console.log(user);

  // Check how much storage space is used
  if (navigator.storage && navigator.storage.estimate) {
    const { usage, quota } = await navigator.storage.estimate();
    console.log(\`Using \${(usage / 1e6).toFixed(1)}MB of \${(quota / 1e6).toFixed(0)}MB\`);
  }
}

demo();`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "What are the SameSite cookie attribute values and what does each do?",
      answer: "There are three values: Strict (cookie is never sent on cross-site requests), Lax (sent on top-level navigations like clicking a link, but not on embedded requests like images or forms), and None (always sent, but requires the Secure flag). Modern browsers default to Lax. This is the main defense against CSRF attacks because it stops cookies from being sent with forged cross-site requests.",
      difficulty: "mid",
      followUps: [
        "How does SameSite help prevent CSRF attacks?",
        "What is the difference between same-site and same-origin?",
        "What are __Host- and __Secure- cookie prefixes?"
      ]
    },
    {
      question: "Compare localStorage, sessionStorage, cookies, and IndexedDB.",
      answer: "Cookies (~4KB) are sent with every HTTP request and can be secured with HttpOnly/Secure flags. localStorage (~5MB) persists forever and works across tabs. sessionStorage (~5MB) is per-tab and clears when the tab closes. IndexedDB (hundreds of MB) is async, supports indexes and transactions, and is best for large structured data. Use cookies for auth, localStorage for preferences, sessionStorage for temporary tab state, and IndexedDB for offline data.",
      difficulty: "easy",
      followUps: [
        "How would you choose between cookies and localStorage for storing a user's language preference?",
        "Which storage mechanisms survive browser restarts?",
        "How do you handle localStorage being full (QuotaExceededError)?"
      ]
    },
    {
      question: "Why is HttpOnly important for cookies, and what doesn't it protect against?",
      answer: "HttpOnly prevents JavaScript from reading the cookie via document.cookie, so XSS attacks can't steal it. But it doesn't stop CSRF: the browser still sends HttpOnly cookies automatically with requests to that domain. So an attacker can trick your browser into making requests that carry your cookie, even though they can't read it. You need SameSite and CSRF tokens alongside HttpOnly.",
      difficulty: "mid",
      followUps: [
        "How would you implement CSRF protection alongside HttpOnly cookies?",
        "Can CSRF attacks read the response when HttpOnly cookies are sent?",
        "What is the double-submit cookie pattern?"
      ]
    },
    {
      question: "How does the storage event enable cross-tab communication?",
      answer: "When one tab changes localStorage, all other same-origin tabs receive a 'storage' event with the key, old value, and new value. The tab that made the change does NOT get the event. This lets tabs stay in sync: for example, if one tab logs out and clears the auth token, other tabs can detect that and redirect to the login page. For same-tab notifications, you need to dispatch a custom event yourself.",
      difficulty: "mid",
      followUps: [
        "What other methods exist for cross-tab communication?",
        "How would you use the storage event to sync a logout across all open tabs?",
        "Can you implement a simple cross-tab state sync?"
      ]
    },
    {
      question: "What happens when localStorage is full and you try to write more data?",
      answer: "The browser throws a QuotaExceededError. You should wrap setItem in a try/catch to handle it gracefully. Recovery options include clearing expired items, removing least-recently-used data, or notifying the user. Most browsers give about 5MB per origin. Private/incognito mode may have even smaller limits or disable storage entirely.",
      difficulty: "mid",
      followUps: [
        "How do you implement an LRU eviction strategy for localStorage?",
        "What is the actual quota in different browsers?",
        "How does Private Browsing affect storage quotas?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Build a localStorage wrapper with TTL and namespace support",
      difficulty: "mid",
      description: "Create a storage class that adds two features on top of localStorage: namespaced keys (so different parts of your app don't collide) and optional TTL (time-to-live) so entries auto-expire. Handle quota errors and expired entry cleanup.",
      solution: `class StorageManager {
  constructor(namespace = 'app') {
    this.namespace = namespace;
    this.prefix = namespace + ':';
  }

  // Add namespace prefix to keys
  _key(key) {
    return this.prefix + key;
  }

  set(key, value, ttlMs = null) {
    const item = {
      value: value,
      created: Date.now(),
      expiry: ttlMs ? Date.now() + ttlMs : null
    };

    try {
      localStorage.setItem(this._key(key), JSON.stringify(item));
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        // Storage full — clean up expired items and retry
        this.evictExpired();
        try {
          localStorage.setItem(this._key(key), JSON.stringify(item));
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  }

  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(this._key(key));
      if (raw === null) return fallback;

      const item = JSON.parse(raw);

      // Remove and return fallback if expired
      if (item.expiry && Date.now() > item.expiry) {
        localStorage.removeItem(this._key(key));
        return fallback;
      }

      return item.value;
    } catch {
      return fallback;
    }
  }

  remove(key) {
    localStorage.removeItem(this._key(key));
  }

  has(key) {
    return this.get(key) !== null;
  }

  // Delete all expired items in this namespace
  evictExpired() {
    const now = Date.now();
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const storageKey = localStorage.key(i);
      if (!storageKey.startsWith(this.prefix)) continue;

      try {
        const item = JSON.parse(localStorage.getItem(storageKey));
        if (item.expiry && now > item.expiry) {
          localStorage.removeItem(storageKey);
        }
      } catch {
        localStorage.removeItem(storageKey);
      }
    }
  }

  // Remove all items in this namespace
  clear() {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    }
  }

  // List all keys in this namespace (without the prefix)
  keys() {
    const result = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(this.prefix)) {
        result.push(key.slice(this.prefix.length));
      }
    }
    return result;
  }
}

const store = new StorageManager('myApp');
store.set('user', { name: 'Alice' }, 3600000);
store.set('prefs', { theme: 'dark' });

console.log(store.get('user'));
console.log(store.keys());`,
      explanation: "The wrapper adds a namespace prefix to every key so different app modules don't overwrite each other. TTL is handled by storing an expiry timestamp alongside the value and checking it on read. When storage is full, it cleans up expired items first before giving up."
    },
    {
      title: "Implement cross-tab state synchronization",
      difficulty: "hard",
      description: "Build a class that keeps state in sync across browser tabs using localStorage and the storage event. Support subscribing to specific keys and knowing whether a change came from the current tab or another one.",
      solution: `class CrossTabSync {
  constructor(channel = 'cross-tab-sync') {
    this.channel = channel;
    this.listeners = new Map();
    this.state = {};

    // Listen for changes from OTHER tabs
    this._onStorage = (e) => {
      if (!e.key || !e.key.startsWith(this.channel + ':')) return;

      const stateKey = e.key.slice(this.channel.length + 1);
      const newVal = e.newValue ? JSON.parse(e.newValue).value : undefined;
      const oldVal = e.oldValue ? JSON.parse(e.oldValue).value : undefined;

      this.state[stateKey] = newVal;

      if (this.listeners.has(stateKey)) {
        this.listeners.get(stateKey).forEach(fn =>
          fn(newVal, oldVal, { remote: true })
        );
      }
    };

    window.addEventListener('storage', this._onStorage);

    this._loadState();
  }

  // Load existing state from localStorage on startup
  _loadState() {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(this.channel + ':')) {
        const stateKey = key.slice(this.channel.length + 1);
        try {
          this.state[stateKey] = JSON.parse(localStorage.getItem(key)).value;
        } catch {}
      }
    }
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    const oldVal = this.state[key];
    this.state[key] = value;

    // Write to localStorage so other tabs get the storage event
    localStorage.setItem(
      this.channel + ':' + key,
      JSON.stringify({ value, timestamp: Date.now() })
    );

    // Notify local listeners too (storage event only fires in other tabs)
    if (this.listeners.has(key)) {
      this.listeners.get(key).forEach(fn =>
        fn(value, oldVal, { remote: false })
      );
    }
  }

  // Returns an unsubscribe function
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);

    return () => {
      this.listeners.get(key).delete(callback);
    };
  }

  destroy() {
    window.removeEventListener('storage', this._onStorage);
    this.listeners.clear();
  }
}

const sync = new CrossTabSync('app');

const unsub = sync.subscribe('theme', (newVal, oldVal, { remote }) => {
  console.log(\`Theme changed to \${newVal} (\${remote ? 'other tab' : 'this tab'})\`);
  document.body.className = newVal;
});

sync.set('theme', 'dark');`,
      explanation: "Uses localStorage as the transport layer: writing triggers a storage event in other tabs. Local listeners are called directly since the storage event only fires remotely. The { remote } flag tells subscribers whether the change came from this tab or another one."
    }
  ],
  quiz: [
    {
      question: "Which cookie attribute prevents JavaScript from accessing the cookie?",
      options: [
        "Secure",
        "SameSite=Strict",
        "HttpOnly",
        "Path=/"
      ],
      correct: 2,
      explanation: "HttpOnly tells the browser to hide the cookie from JavaScript. document.cookie won't include it, protecting it from XSS attacks."
    },
    {
      question: "What happens when you modify localStorage in one tab?",
      options: [
        "The 'storage' event fires in the same tab",
        "The 'storage' event fires in all same-origin tabs including the current one",
        "The 'storage' event fires in all other same-origin tabs but NOT the current one",
        "No event is fired — you must poll for changes"
      ],
      correct: 2,
      explanation: "The storage event only fires in other tabs with the same origin. The tab that made the change does not receive the event."
    },
    {
      question: "What is the default SameSite value for cookies in modern browsers?",
      options: [
        "None",
        "Strict",
        "Lax",
        "There is no default — it must be specified"
      ],
      correct: 2,
      explanation: "Modern browsers default to Lax, which blocks cookies on cross-site subrequests but allows them on top-level navigations like clicking a link."
    },
    {
      question: "Which storage mechanism is best for storing 50MB of structured data with querying capability?",
      options: [
        "localStorage with JSON encoding",
        "sessionStorage with compression",
        "Cookies split across multiple values",
        "IndexedDB"
      ],
      correct: 3,
      explanation: "IndexedDB is the only browser storage that handles large datasets (hundreds of MB) and supports indexed queries. The others are limited to ~5MB or ~4KB."
    }
  ]
};
