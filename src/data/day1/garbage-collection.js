export const garbageCollection = {
  id: "garbage-collection",
  title: "Garbage Collection & Memory",
  icon: "♻️",
  tag: "Advanced JS",
  tagColor: "var(--tag-js)",
  subtitle: "Understand how JavaScript manages memory, detects leaks, and optimizes with weak.",
  concepts: [
    {
      title: "Mark-and-Sweep & Generational GC",
      explanations: {
        layman: "Think of GC like a janitor walking through your house. Anything connected to a doorway (reachable) stays. Anything in a sealed room nobody can enter gets thrown out. New objects go in a 'nursery' that gets cleaned often, since most objects die young.",
        mid: "The engine starts from root references (global, stack, closures) and marks everything reachable. Unmarked objects get swept. V8 splits the heap into young and old generations -- young objects get collected frequently with a fast copying collector, survivors get promoted to old space where mark-sweep runs less often.",
        senior: "V8 splits the heap into two spaces because most objects die young. The young generation uses a fast copying collector: it has two halves, copies surviving objects from one half to the other, and frees the rest in bulk. Objects that survive multiple collections get promoted to the old generation, which uses a slower mark-and-compact pass. Short-lived objects (like temp variables in a loop) are nearly free to allocate. But if you accidentally keep a reference (like caching in a closure), the object gets promoted to old space and stays there. To catch this, take heap snapshots before and after repeating a user action and look for objects that keep accumulating."
      },
      realWorld: "SPAs that run for hours (dashboards, editors) slowly eat memory if long-lived caches or closures hold references the GC can never reclaim.",
      whenToUse: "When your app's memory keeps climbing over time, or you need to understand why objects aren't being freed.",
      whenNotToUse: "Short-lived scripts or simple pages where everything gets cleaned up when the page closes anyway.",
      pitfalls: "Forgetting to remove event listeners or clear timers is the most common cause of leaks. Old references silently keep entire object trees alive.",
      codeExamples: [
        {
          title: "Demonstrating reachability and GC",
          code: `let user = { name: 'Alice', data: new ArrayBuffer(1024 * 1024) };
let admin = user;

user = null;
admin = null;
// Now nothing points to the object -- GC can collect it

function makeGetter() {
  const bigList = new Array(1000000).fill('data');

  // The closure keeps bigList alive as long as getter exists
  return function get(i) {
    return bigList[i];
  };
}

let getter = makeGetter();
getter = null;
// bigList can now be collected too

function makeCircle() {
  const a = {};
  const b = {};
  a.ref = b;
  b.ref = a;
  return 'done';
}
makeCircle();
// a and b reference each other, but neither is reachable from outside -- GC collects both

function example() {
  for (let i = 0; i < 10000; i++) {
    const temp = { x: i };
  }
  // All 10k temp objects are short-lived, collected quickly from young generation

  const cache = {};
  for (let i = 0; i < 10000; i++) {
    cache['key' + i] = { data: i };
  }
  return cache;
  // cache survives because we return it -- all 10k entries stay in memory
}`
        }
      ]
    },
    {
      title: "Common Memory Leak Patterns",
      explanations: {
        layman: "A memory leak is like leaving the tap running. The water (memory) keeps filling up because something is still connected that shouldn't be. The four usual culprits: forgotten timers, event listeners nobody removed, caches that grow forever, and DOM nodes you removed from the page but still hold a variable to.",
        mid: "Leaks happen when references outlive their usefulness. A setInterval keeps its closure alive until cleared. An anonymous event listener can't be removed because you lost the reference. A closure might accidentally capture a large variable it doesn't even need. Detached DOM nodes stay in memory if any JS variable still points to them.",
        senior: "Systematic leak hunting: run the suspect action 5+ times, take heap snapshots before and after, filter by objects allocated between snapshots. Detached DOM trees show up as 'Detached HTMLDivElement'. Closure retainers are visible in the retainer tree. Always store listener references so you can removeEventListener in a destroy method."
      },
      realWorld: "A modal component that adds a keydown listener on every open but never removes it will stack up listeners and keep every modal instance in memory.",
      whenToUse: "Whenever you build components that get created and destroyed repeatedly -- modals, routes, sliders, tooltips.",
      whenNotToUse: "Static pages with no dynamic component lifecycle don't need explicit cleanup.",
      pitfalls: "Anonymous arrow functions can't be removed with removeEventListener. Always save a named reference so cleanup is possible.",
      codeExamples: [
        {
          title: "Memory leak patterns and fixes",
          code: `class Slider {
  constructor(el) {
    this.el = el;
    this.data = new Array(10000).fill('slide');
    this.timerId = setInterval(() => {
      this.update();
    }, 1000);
  }
  update() { /* ... */ }
  destroy() {
    // Always clear timers and drop references
    clearInterval(this.timerId);
    this.el = null;
    this.data = null;
  }
}

let savedNode = null;
function showPopup() {
  const div = document.createElement('div');
  div.innerHTML = '<p>Hello</p>';
  document.body.appendChild(div);
  setTimeout(() => {
    document.body.removeChild(div);
    savedNode = div; // Leak! div is removed from DOM but savedNode keeps it in memory
  }, 3000);
}

function process() {
  const bigArray = new Array(1000000).fill(0);
  const total = bigArray.reduce((a, b) => a + b, 0);

  // Leak: closure captures bigArray even though it only needs total
  return function getTotal() {
    return total;
  };
}
function processFixed() {
  let bigArray = new Array(1000000).fill(0);
  const total = bigArray.reduce((a, b) => a + b, 0);
  bigArray = null; // Fix: drop the reference so GC can collect the array
  return function getTotal() { return total; };
}

class Modal {
  constructor() {
    // Bad: anonymous listener can never be removed
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  }

  init() {
    // Good: save a reference so we can remove it later
    this.onKey = this.onKey.bind(this);
    window.addEventListener('keydown', this.onKey);
  }
  onKey(e) { if (e.key === 'Escape') this.close(); }
  destroy() {
    window.removeEventListener('keydown', this.onKey);
  }
}`
        }
      ]
    },
    {
      title: "WeakRef, WeakMap, WeakSet, and FinalizationRegistry",
      explanations: {
        layman: "A normal reference is like holding someone's hand -- they can't leave as long as you hold on. A weak reference is like knowing someone's phone number -- they can leave anytime, and when you call, the number might be disconnected. WeakMap and WeakSet work the same way: they don't prevent their keys from being garbage collected.",
        mid: "WeakMap lets you attach metadata to objects without preventing their collection. When the key object is GC'd, the entry disappears automatically. WeakRef gives you a direct weak pointer you can check with deref(). FinalizationRegistry lets you run a callback after an object is collected -- useful for resource cleanup but timing is unpredictable.",
        senior: "WeakRef.deref() is stable within a single microtask turn but may return undefined in the next. FinalizationRegistry callbacks are non-deterministic and may never fire (e.g., page unload), so never rely on them for correctness -- only for best-effort cleanup like closing file handles or clearing cache entries. WeakMap is the go-to for associating private data with DOM nodes or framework objects."
      },
      realWorld: "Frameworks use WeakMap to attach component state to DOM elements. When the element is removed and GC'd, the state disappears automatically with no manual cleanup.",
      whenToUse: "When you need to associate data with objects you don't own, like DOM nodes or third-party instances, without preventing their cleanup.",
      whenNotToUse: "When you need to iterate over entries or guarantee the data sticks around. WeakMap is not enumerable and entries can vanish anytime.",
      pitfalls: "Don't put business logic in FinalizationRegistry callbacks. They might run late, out of order, or not at all if the page closes.",
      codeExamples: [
        {
          title: "WeakRef cache and FinalizationRegistry",
          code: `class SmartCache {
  #store = new Map();
  #cleanup = new FinalizationRegistry((key) => {
    const ref = this.#store.get(key);
    // Only delete if the ref is actually dead
    if (ref && !ref.deref()) {
      this.#store.delete(key);
      console.log('Cleaned up:', key);
    }
  });

  set(key, value) {
    const ref = new WeakRef(value);
    this.#store.set(key, ref);
    // Register so we auto-clean the map entry when value is GC'd
    this.#cleanup.register(value, key, value);
  }

  get(key) {
    const ref = this.#store.get(key);
    if (!ref) return undefined;

    const value = ref.deref();
    if (!value) {
      // Object was collected, clean up the stale entry
      this.#store.delete(key);
      return undefined;
    }
    return value;
  }

  has(key) {
    return this.get(key) !== undefined;
  }
}

const cache = new SmartCache();

let bigData = { items: new Array(100000).fill('data') };
cache.set('report', bigData);

console.log(cache.get('report')); // returns the object

bigData = null;
// Now the object can be GC'd, and the cache entry will auto-clean

const nodeInfo = new WeakMap();

function tagElement(el) {
  // Attach metadata to a DOM node without preventing its collection
  nodeInfo.set(el, {
    createdAt: Date.now(),
    renderCount: 0
  });
}

function getInfo(el) {
  return nodeInfo.get(el);
}`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "How does JavaScript's garbage collector work?",
      answer: "JS uses mark-and-sweep. The engine starts from roots (global object, call stack, closures) and walks all reachable references, marking everything it can reach. Anything unmarked is unreachable and gets freed. V8 also uses generational collection: new objects go in a nursery that's collected often with a fast copying algorithm. Objects that survive multiple collections get promoted to old space, which is collected less frequently with mark-compact. A common failure mode is accidental retention -- for example, a forgotten event listener keeping an entire component tree alive. You can catch this by taking heap snapshots before and after repeating a user action and comparing what's been retained.",
      difficulty: "mid",
      followUps: [
        "What is the difference between Scavenge and Mark-Compact?",
        "How does V8 keep GC pauses short?",
        "What replaced reference counting in modern engines?"
      ]
    },
    {
      question: "Name 4 common memory leak patterns in JavaScript and how to prevent them.",
      answer: "1) Forgotten timers: setInterval callbacks keep their closures alive -- always clearInterval in a cleanup method. 2) Event listeners: anonymous listeners can't be removed -- store a named reference and call removeEventListener. 3) Detached DOM nodes: removing an element from the page but keeping a JS variable pointing to it -- set the variable to null. 4) Unbounded caches: objects added to a Map or array that grow forever -- use an LRU strategy or WeakMap. To detect leaks, repeat the suspect action several times, take heap snapshots, and look for objects that keep accumulating.",
      difficulty: "mid",
      followUps: [
        "How do you detect memory leaks in Chrome DevTools?",
        "What is a detached DOM tree?",
        "How does React's useEffect cleanup prevent leaks?"
      ]
    },
    {
      question: "What is the difference between WeakMap and Map?",
      answer: "Map holds strong references to its keys, so entries stay forever until you manually delete them. WeakMap holds weak references -- when nothing else points to the key object, both the key and value get garbage collected automatically. This means WeakMap keys must be objects (primitives have no identity to track), and you can't iterate over a WeakMap or check its size. Use WeakMap when you want to attach data to objects without preventing their cleanup, like caching computed results for DOM nodes. Use Map when you need to enumerate entries or keep them alive intentionally.",
      difficulty: "mid",
      followUps: [
        "Why can't WeakMap have primitive keys?",
        "How do frameworks like React or Vue use WeakMap internally?",
        "How is WeakMap used for private class fields?"
      ]
    },
    {
      question: "Explain WeakRef and FinalizationRegistry. When would you use them?",
      answer: "WeakRef wraps an object without preventing its garbage collection. You call deref() to get the object back -- it returns the object if it's still alive, or undefined if it's been collected. deref() is stable within one microtask turn. FinalizationRegistry lets you register a callback that fires after a tracked object is collected, useful for cleaning up external resources like cache entries or file handles. The key caveat: finalization timing is non-deterministic. The callback might run late or never (on page close). So use them for best-effort cleanup only, never for correctness-critical logic. A practical use case is a cache that automatically drops entries when the cached objects are no longer used anywhere else.",
      difficulty: "hard",
      followUps: [
        "Why is deref() guaranteed stable within one event loop turn?",
        "Can you build a reliable cache with WeakRef?",
        "How does FinalizationRegistry relate to C++ destructor patterns?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Implement an LRU Cache with automatic memory-sensitive eviction",
      difficulty: "hard",
      description: "Build an LRU (Least Recently Used) cache with a fixed size limit. When the cache is full, evict the least recently used entry. Include get, set, and delete operations.",
      solution: `class LRUCache {
  #max;
  #store = new Map();

  constructor(max) {
    this.#max = max;
  }

  get(key) {
    if (!this.#store.has(key)) return undefined;

    // Move to end (most recently used) by re-inserting
    const val = this.#store.get(key);
    this.#store.delete(key);
    this.#store.set(key, val);
    return val;
  }

  set(key, val) {
    if (this.#store.has(key)) {
      this.#store.delete(key);
    } else if (this.#store.size >= this.#max) {
      // Evict the oldest entry (first key in Map iteration order)
      const oldest = this.#store.keys().next().value;
      this.#store.delete(oldest);
    }

    this.#store.set(key, val);
  }

  get size() {
    return this.#store.size;
  }

  has(key) {
    return this.#store.has(key);
  }

  delete(key) {
    return this.#store.delete(key);
  }

  clear() {
    this.#store.clear();
  }

  *entries() {
    // Yield from most recent to oldest
    const items = [...this.#store.entries()];
    for (let i = items.length - 1; i >= 0; i--) {
      yield items[i];
    }
  }
}

const cache = new LRUCache(3);
cache.set('a', 1);
cache.set('b', 2);
cache.set('c', 3);

console.log(cache.get('a')); // 1 -- also makes 'a' most recent

cache.set('d', 4); // evicts 'b' (oldest after 'a' was accessed)
console.log(cache.has('b')); // false
console.log(cache.has('a')); // true
console.log(cache.size); // 3

for (const [key, val] of cache.entries()) {
  console.log(key, val);
}`,
      explanation: "Uses Map's insertion order as the LRU queue. Getting a key deletes and re-inserts it to move it to the end. When full, the first key in iteration order is the least recently used and gets evicted. Simple, O(1) for both get and set."
    },
    {
      title: "Build a memory leak detector utility",
      difficulty: "mid",
      description: "Build a utility that tracks object references and detects potential memory leaks. Use WeakRef to hold references and FinalizationRegistry to log when objects are collected.",
      solution: `class LeakDetector {
  #items = new Map();
  #cleanup;
  #nextId = 0;

  constructor() {
    // Auto-remove entries when tracked objects get collected
    this.#cleanup = new FinalizationRegistry((id) => {
      this.#items.delete(id);
    });
  }

  track(obj, label = 'unnamed') {
    const id = this.#nextId++;
    const ref = new WeakRef(obj);
    const time = Date.now();
    const stack = new Error().stack; // Capture where track() was called

    this.#items.set(id, { ref, label, time, stack });
    this.#cleanup.register(obj, id);

    return id;
  }

  checkLeaks(maxAge = 30000) {
    const now = Date.now();
    const suspects = [];

    for (const [id, info] of this.#items) {
      const obj = info.ref.deref();
      // If the object is still alive AND older than maxAge, it might be a leak
      if (obj && (now - info.time) > maxAge) {
        suspects.push({
          id,
          label: info.label,
          age: now - info.time,
          stack: info.stack
        });
      }
    }

    return suspects;
  }

  get activeCount() {
    let count = 0;
    for (const [, info] of this.#items) {
      if (info.ref.deref()) count++;
    }
    return count;
  }

  report() {
    const suspects = this.checkLeaks();
    if (suspects.length === 0) {
      return 'No suspected leaks';
    }
    return suspects.map(s =>
      \`SUSPECT: "\${s.label}" alive for \${(s.age / 1000).toFixed(1)}s\`
    ).join('\\n');
  }
}

const detector = new LeakDetector();

function makeWidget() {
  const data = { type: 'widget', buffer: new ArrayBuffer(1024) };
  detector.track(data, 'Widget data');
  return data;
}

let w1 = makeWidget();
let w2 = makeWidget();

w1 = null; // This one can be collected

console.log('Active objects:', detector.activeCount); // 2 until GC runs`,
      explanation: "Uses WeakRef to watch objects without preventing their collection. FinalizationRegistry auto-cleans entries when objects are GC'd. checkLeaks() flags objects that have been alive longer than expected -- if they should have been collected but weren't, you likely have a leak."
    }
  ],
  quiz: [
    {
      question: "What algorithm does V8 use for the young generation (nursery)?",
      options: [
        "Mark-and-sweep",
        "Reference counting",
        "Semi-space Scavenge (copying collector)",
        "Mark-compact"
      ],
      correct: 2,
      explanation: "V8's young generation uses a semi-space Scavenge collector. It copies surviving objects between two equal-sized spaces, which is very fast for short-lived objects since most die before the first collection."
    },
    {
      question: "Why can't WeakMap keys be primitives (strings, numbers)?",
      options: [
        "Primitives are too small for weak references",
        "Primitives are not garbage collected — they're immutable values, not heap objects",
        "It's a bug in the specification",
        "Primitives don't have identity — two equal primitives are indistinguishable"
      ],
      correct: 3,
      explanation: "Primitives have no unique identity. The number 42 is always the same 42 everywhere -- the engine can't tell two uses apart, so there's no specific object to weakly reference or track for collection."
    },
    {
      question: "What is the most reliable way to clean up resources in JavaScript?",
      options: [
        "FinalizationRegistry callbacks",
        "WeakRef with periodic checking",
        "Explicit cleanup methods (dispose/destroy/close)",
        "Setting variables to null"
      ],
      correct: 2,
      explanation: "Explicit cleanup methods are the only reliable approach. FinalizationRegistry and WeakRef are non-deterministic -- callbacks might fire late or never. A destroy() or close() method gives you guaranteed, predictable cleanup at exactly the right time."
    }
  ]
};
