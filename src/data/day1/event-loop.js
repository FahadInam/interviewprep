export const eventLoop = {
  id: "event-loop",
  title: "Event Loop",
  icon: "🔄",
  tag: "JavaScript Core",
  tagColor: "var(--tag-js)",
  subtitle: "How JavaScript handles async tasks behind the scenes.",
  concepts: [
    {
      title: "The Event Loop Mechanism",
      explanations: {
        layman: "Think of the event loop like a waiter at a restaurant. It checks if your table (the call stack) is clear, then brings the next dish (callback) from the kitchen (queue). Promises get VIP treatment and are served before timers.",
        mid: "All synchronous code runs first and empties the call stack. Then the engine drains the microtask queue (Promises, queueMicrotask). Only after that does it pick up the next macrotask (setTimeout, setInterval). The browser may paint between macrotasks.",
        senior: "Understanding task scheduling is critical for performance. Long tasks (>50ms) block the main thread and cause jank. You can detect them by listening for tasks that take too long — the browser has a built-in observer (`PerformanceObserver` with entry type `'longtask'`) that fires whenever a task exceeds 50ms. For chunking heavy work so the browser can paint between batches, you can pause your JavaScript and let the browser catch up — `scheduler.yield()` does exactly this (fall back to `setTimeout(fn, 0)` in older browsers). If you need to run background work without blocking user interactions, you can queue tasks at different priority levels — `scheduler.postTask(fn, {priority: 'background'})` tells the browser 'run this when you're free', while `'user-blocking'` means 'run this ASAP'. This is essentially a built-in version of the priority task scheduler pattern."
      },
      realWorld: "Promise .then() callbacks always run before setTimeout callbacks, even setTimeout(fn, 0). This catches people off guard when they mix both.",
      whenToUse: "When debugging why async operations run in unexpected order, or when the UI freezes during heavy work.",
      whenNotToUse: "When your code is fully synchronous with no callbacks, promises, or timers involved.",
      pitfalls: "setTimeout(fn, 0) does not run immediately. It waits for the current code and all microtasks to finish first. Recursive microtasks can freeze the page forever.",
      codeExamples: [
        {
          title: "Event Loop Execution Order",
          code: `console.log('1: start');

setTimeout(() => {
  console.log('2: setTimeout');
}, 0);

Promise.resolve().then(() => {
  console.log('3: promise');
});

queueMicrotask(() => {
  console.log('4: microtask');
});

console.log('5: end');`
        }
      ]
    },
    {
      title: "Call Stack, Web APIs & Callback Queue",
      explanations: {
        layman: "The call stack is like a stack of plates — JS handles one plate at a time, top first. When you call setTimeout, the browser takes that plate to a separate counter (Web API), waits, then puts the callback plate back in a queue. JS picks it up only when the stack is empty.",
        mid: "When you call something like setTimeout or fetch, the browser handles the waiting outside the JS engine. Once the timer expires or data arrives, the callback is placed in the task queue. The event loop moves it to the call stack only when the stack is completely empty.",
        senior: "The call stack works like a stack of plates — last function in, first function out (LIFO). Each function call pushes a new frame onto the stack; when it returns, that frame is popped off. Web APIs (timers, network, DOM events) run in separate browser threads and place their callbacks into the appropriate task queue when they're ready. The event loop checks the stack on every iteration — callbacks never interrupt running code, they wait for a completely empty stack. This is why a single long-running function blocks everything: nothing else can run until it finishes and its frame is popped."
      },
      realWorld: "If you run a heavy loop on the call stack, click handlers and timers will queue up and wait. Nothing else runs until the stack clears.",
      whenToUse: "When figuring out why a callback runs later than expected, or debugging stack overflow errors.",
      whenNotToUse: "When you only have simple variable assignments and calculations with no async code.",
      pitfalls: "A synchronous loop of 100,000 iterations blocks the thread. Use iteration (not recursion) for large counts. If you must yield to the browser during processing, chunk the work with setTimeout or requestIdleCallback — but note that setTimeout-based chunking is slow (minimum 4ms per chunk after nesting), so only use it when you need the browser to paint between batches.",
      codeExamples: [
        {
          title: "Call Stack Trace & Stack Overflow",
          code: `function a() {
  console.log('a start');
  b();
  console.log('a end');
}

function b() {
  console.log('b start');
  c();
  console.log('b end');
}

function c() {
  console.log('c');
}

a();

function loop() {
  return loop();
}

function safeLoop(n) {
  if (n <= 0) return console.log('Done!');
  console.log(n);
  setTimeout(() => safeLoop(n - 1), 0);
}
safeLoop(100000);`
        }
      ]
    },
    {
      title: "Microtask Queue vs Macrotask Queue",
      explanations: {
        layman: "Imagine two lines at a coffee shop. The microtask line (Promises) always gets served completely before anyone in the macrotask line (timers) gets their order. Even if new people join the microtask line while it is being served, they go first.",
        mid: "Promise.then, catch, finally, and queueMicrotask go to the microtask queue. setTimeout, setInterval, and I/O go to the macrotask queue. After each macrotask, the engine drains ALL pending microtasks before touching the next macrotask.",
        senior: "Microtask starvation is a real risk: a microtask that schedules another microtask creates an infinite loop that never yields to rendering or macrotasks. For CPU-heavy async chains, break them with `setTimeout(fn, 0)` to push work to the macrotask queue and let the browser paint. If you want finer control, you can use the browser's built-in priority scheduler — `scheduler.postTask(fn, {priority: 'background'})` tells the browser 'run this only when idle', which is even gentler than setTimeout. The key insight: microtasks run to exhaustion between every macrotask — this is why uncontrolled Promise chains can freeze the UI."
      },
      realWorld: "If you chain Promises that keep creating more Promises, setTimeout callbacks will never fire and the screen will freeze.",
      whenToUse: "When you need to understand or control the exact order of async callbacks in mixed Promise/timer code.",
      whenNotToUse: "The micro vs macro distinction matters most when debugging ordering bugs or building framework-level scheduling. For straightforward async/await code, the runtime handles it correctly.",
      pitfalls: "Recursive microtasks (a .then that creates another .then forever) will lock up the page. Timers and rendering are completely blocked until microtasks stop.",
      codeExamples: [
        {
          title: "Microtask vs Macrotask Priority",
          code: `console.log('1');

setTimeout(() => console.log('2'), 0);
setTimeout(() => console.log('3'), 0);

Promise.resolve()
  .then(() => {
    console.log('4');
    Promise.resolve().then(() => console.log('5'));
  })
  .then(() => console.log('6'));

queueMicrotask(() => console.log('7'));

console.log('8');`
        },
        {
          title: "Microtask Starvation Demo",
          code: `function starve() {
  Promise.resolve().then(() => {
    console.log('microtask');
    starve();
  });
}

setTimeout(() => console.log('I will never run'), 0);

function yieldToBrowser() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

async function processBigList(items) {
  for (let i = 0; i < items.length; i++) {
    if (i % 1000 === 0) {
      await yieldToBrowser();
    }
  }
}`
        }
      ]
    },
    {
      title: "Timers, rAF & Advanced Scheduling",
      explanations: {
        layman: "setTimeout is like setting an alarm — it goes off after at least the time you set, but could be later if you are busy. requestAnimationFrame is like syncing with your TV refresh rate — it runs your code right before the screen repaints, giving you smooth animations.",
        mid: "setTimeout guarantees a minimum delay, not an exact one. Nested timers beyond 5 levels deep get clamped to at least 4ms. requestAnimationFrame fires once per frame (usually 60fps), right before the browser paints. Always use rAF for visual updates and setTimeout for non-visual delays.",
        senior: "Choose your scheduling API based on what you're doing: `requestAnimationFrame` for visual updates (runs right before paint), `setTimeout` for non-visual delays, `requestIdleCallback` for low-priority background work that can wait. Prefer chained `setTimeout` over `setInterval` -- setInterval fires at fixed clock intervals regardless of how long the callback takes, so if a callback runs slow, the next one fires immediately after, stacking up. Chained setTimeout always waits the full delay after each callback finishes. In background tabs, browsers throttle timers to ~1 call per second, and rAF stops entirely."
      },
      realWorld: "Animations built with setTimeout look choppy because they do not sync with the screen refresh. Switching to requestAnimationFrame makes them smooth.",
      whenToUse: "When building animations, throttling scroll handlers, or scheduling work that should not block the UI.",
      whenNotToUse: "When you just need a simple one-time delay and there is nothing visual happening.",
      pitfalls: "Do not assume setTimeout(fn, 100) runs at exactly 100ms — it is a minimum, not a guarantee. In background tabs, browsers throttle timers to once per second or slower.",
      codeExamples: [
        {
          title: "Timer Behavior & rAF vs setTimeout",
          code: `let start = Date.now();
function nested(depth) {
  if (depth >= 10) {
    console.log('Total:', Date.now() - start, 'ms');
    return;
  }
  setTimeout(() => {
    console.log('Depth', depth, 'at', Date.now() - start, 'ms');
    nested(depth + 1);
  }, 0);
}

function safeInterval(fn, delay) {
  let id;
  function tick() {
    fn();
    id = setTimeout(tick, delay);
  }
  id = setTimeout(tick, delay);
  return () => clearTimeout(id);
}

function animate(el) {
  let pos = 0;
  let id;

  function step() {
    pos += 2;
    el.style.transform = 'translateX(' + pos + 'px)';
    if (pos < 500) {
      id = requestAnimationFrame(step);
    }
  }

  id = requestAnimationFrame(step);
  return () => cancelAnimationFrame(id);
}`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "What is the event loop in JavaScript? Explain how it works.",
      answer: "JavaScript is single-threaded. The event loop is the mechanism that lets it handle async work. It runs all synchronous code first (empties the call stack), then processes all microtasks (Promise callbacks), then picks up the next macrotask (timer callbacks). The browser can paint between macrotasks. This cycle repeats forever. A common gotcha: if microtasks keep adding more microtasks, the page freezes because macrotasks and rendering never get a turn.",
      difficulty: "easy",
      followUps: [
        "How does the event loop differ in Node.js vs browsers?",
        "What happens if a microtask schedules another microtask?",
        "Where does requestAnimationFrame fit in the event loop?"
      ]
    },
    {
      question: "What will this code output and why?\n\nconsole.log('A');\nsetTimeout(() => console.log('B'), 0);\nPromise.resolve().then(() => console.log('C'));\nPromise.resolve().then(() => {\n  console.log('D');\n  setTimeout(() => console.log('E'), 0);\n});\nsetTimeout(() => console.log('F'), 0);\nconsole.log('G');",
      answer: "Output: A, G, C, D, B, F, E. First, synchronous code runs: A and G. Then all microtasks run: C, then D. During D, a new setTimeout for E is queued. Now macrotasks run in order: B (queued first), F (queued second), E (queued last, during the microtask phase). The key rule: all microtasks drain before ANY macrotask runs.",
      difficulty: "mid",
      followUps: [
        "What if the Promise.then that logs D also scheduled another Promise.then?",
        "Would the output change if we used queueMicrotask instead of Promise.then?",
        "What if there was an await statement?"
      ]
    },
    {
      question: "What's the difference between microtasks and macrotasks? Give examples of each.",
      answer: "Microtasks (Promise.then, queueMicrotask, MutationObserver) run immediately after the current code finishes, before the next macrotask. Macrotasks (setTimeout, setInterval, I/O, UI events) run one at a time, with all microtasks drained between each one. In practice this means Promise callbacks always beat timer callbacks. Watch out for recursive Promises — they starve timers and block rendering.",
      difficulty: "mid",
      followUps: [
        "How can recursive Promise.resolve() calls starve setTimeout callbacks?",
        "What changes if we refactor this and hit microtask starvation and long tasks?",
        "Where does process.nextTick fit relative to Promise microtasks?"
      ]
    },
    {
      question: "Predict the output:\n\nasync function foo() {\n  console.log('foo start');\n  await bar();\n  console.log('foo end');\n}\n\nasync function bar() {\n  console.log('bar');\n}\n\nconsole.log('script start');\nsetTimeout(() => console.log('setTimeout'), 0);\nfoo();\nnew Promise(resolve => {\n  console.log('promise executor');\n  resolve();\n}).then(() => console.log('promise then'));\nconsole.log('script end');",
      answer: "Output: script start, foo start, bar, promise executor, script end, foo end, promise then, setTimeout. The key: await bar() runs bar() synchronously (logs 'bar'), then pauses foo. The Promise executor also runs synchronously. After all sync code, microtasks run: 'foo end' (from the resolved await) and 'promise then'. Finally the setTimeout macrotask runs last. Note: the exact ordering of await resolution has changed between Node.js versions (related to the extra microtask tick). The general principle holds, but edge cases may vary by engine version.",
      difficulty: "hard",
      followUps: [
        "What if bar() returned a non-thenable value vs a Promise?",
        "How does await transform into Promise internally?",
        "What if we added await Promise.resolve() inside bar?"
      ]
    },
    {
      question: "Why does setTimeout(fn, 0) not execute immediately? What's the minimum delay?",
      answer: "setTimeout(fn, 0) puts the callback in the macrotask queue. It cannot run until the call stack is empty AND all microtasks are done. So there is always some delay. On top of that, the HTML spec says browsers must clamp the delay to at least 4ms when timers are nested more than 5 levels deep. Background tabs get throttled even more, often to once per second.",
      difficulty: "mid",
      followUps: [
        "What causes the 4ms clamping to activate?",
        "How do background tab throttling rules differ across browsers?",
        "What's the difference between setTimeout(fn, 0) and queueMicrotask(fn)?"
      ]
    },
    {
      question: "Explain requestAnimationFrame. Where does it fit in the event loop?",
      answer: "requestAnimationFrame (rAF) tells the browser to call your function right before the next screen repaint, typically 60 times per second. In the event loop, rAF runs after microtasks but before the browser actually paints pixels. This makes it perfect for animations because your changes are applied right before the user sees the frame. Unlike setTimeout, rAF pauses in background tabs to save resources.",
      difficulty: "mid",
      followUps: [
        "What's the difference between rAF and setTimeout for animations?",
        "How does requestIdleCallback differ from rAF?",
        "Can microtasks inside a rAF callback delay the paint?"
      ]
    },
    {
      question: "What will this code output?\n\nPromise.resolve().then(() => {\n  console.log(1);\n  return Promise.resolve(2);\n}).then(val => {\n  console.log(val);\n});\n\nPromise.resolve().then(() => {\n  console.log(3);\n}).then(() => {\n  console.log(4);\n}).then(() => {\n  console.log(5);\n});",
      answer: "Output: 1, 3, 4, 5, 2. The trick is that returning Promise.resolve(2) from a .then() adds extra microtask ticks (the spec requires unwrapping the returned thenable). So while that unwrapping happens, the second promise chain keeps running and logs 3, 4, 5. Only after the extra ticks does 2 finally log. If you returned the plain value 2 instead, the output would be 1, 3, 2, 4, 5.",
      difficulty: "hard",
      followUps: [
        "Why does returning a Promise from.then() add extra microtask ticks?",
        "What if we returned a plain value instead of Promise.resolve(2)?",
        "How do extra microtask ticks from returning a Promise affect real-world async chains?"
      ]
    },
    {
      question: "How does the Node.js event loop differ from the browser event loop?",
      answer: "Node uses libuv and has distinct phases: timers, pending callbacks, poll (I/O), check (setImmediate), close callbacks. Browsers have a simpler model: one macrotask, then all microtasks, then maybe render. Node also has process.nextTick which runs before Promise microtasks — it has even higher priority. setImmediate in Node runs in the check phase, after I/O, which has no browser equivalent.",
      difficulty: "hard",
      followUps: [
        "What's the difference between setImmediate and setTimeout(fn, 0) in Node?",
        "Why is process.nextTick higher priority than Promise.then?",
        "How does libuv's thread pool relate to the event loop?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Predict the Output: Mixed Async Challenge",
      difficulty: "mid",
      description: "Trace through this code and predict the exact console output. Pay attention to the order of microtasks vs macrotasks, and what happens when a Promise is created inside a setTimeout.",
      solution: `console.log('start');

setTimeout(() => {
  console.log('timeout 1');
  Promise.resolve().then(() => console.log('promise in timeout'));
}, 0);

setTimeout(() => {
  console.log('timeout 2');
}, 0);

Promise.resolve()
  .then(() => {
    console.log('promise 1');
  })
  .then(() => {
    console.log('promise 2');
  });

Promise.resolve().then(() => {
  console.log('promise 3');
});

console.log('end');`,
      explanation: "Output: start, end, promise 1, promise 3, promise 2, timeout 1, promise in timeout, timeout 2. Sync code runs first. Then all microtasks drain (promise 1, promise 3, then promise 2 which was chained). Then the first setTimeout runs and creates a new microtask. That microtask drains before the second setTimeout gets its turn."
    },
    {
      title: "Implement a Task Scheduler with Priorities",
      difficulty: "hard",
      description: "Build a task scheduler that runs async tasks in priority order (high, normal, low). It should yield to the browser between tasks using setTimeout so the UI stays responsive.",
      solution: `class TaskScheduler {
  constructor() {
    this.queues = { high: [], normal: [], low: [] };
    this.isRunning = false;
  }

  addTask(task, priority = 'normal') {
    this.queues[priority].push(task);
    if (!this.isRunning) this.run();
  }

  getNext() {
    for (const p of ['high', 'normal', 'low']) {
      if (this.queues[p].length > 0) {
        return { task: this.queues[p].shift(), priority: p };
      }
    }
    return null;
  }

  async run() {
    this.isRunning = true;

    while (true) {
      const next = this.getNext();
      if (!next) break;

      try {
        const result = await next.task();
        console.log('[' + next.priority + '] Done:', result);
      } catch (err) {
        console.error('[' + next.priority + '] Failed:', err);
      }

      // Yield to browser so UI stays responsive
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    this.isRunning = false;
  }
}

const scheduler = new TaskScheduler();

scheduler.addTask(() => 'Low work', 'low');
scheduler.addTask(() => 'High work', 'high');
scheduler.addTask(() => 'Normal work', 'normal');
scheduler.addTask(() => 'High work 2', 'high');`,
      explanation: "High-priority tasks always run first because getNext() checks queues in priority order. The await setTimeout(0) after each task yields control back to the browser, preventing UI freezes. If a task throws, it is caught and logged without killing the whole scheduler."
    },
    {
      title: "Implement requestAnimationFrame Polyfill",
      difficulty: "mid",
      description: "Write a polyfill for requestAnimationFrame that falls back to setTimeout with ~16.6ms spacing (60fps). Include cancellation support and feature detection.",
      solution: `const rafPolyfill = (function() {
  // Use native rAF if available
  if (typeof requestAnimationFrame === 'function') {
    return requestAnimationFrame.bind(window);
  }

  let lastTime = 0;

  return function(callback) {
    const now = Date.now();
    // Wait just long enough to hit ~60fps
    const wait = Math.max(0, 16.6 - (now - lastTime));

    const id = setTimeout(() => {
      const time = Date.now();
      lastTime = time;
      callback(time);
    }, wait);

    return id;
  };
})();

const cancelRafPolyfill = (function() {
  if (typeof cancelAnimationFrame === 'function') {
    return cancelAnimationFrame.bind(window);
  }
  return function(id) { clearTimeout(id); };
})();

let frames = 0;
let id;

function draw(time) {
  frames++;
  console.log('Frame ' + frames + ' at ' + Math.round(time) + 'ms');
  if (frames < 10) {
    id = rafPolyfill(draw);
  }
}

id = rafPolyfill(draw);`,
      explanation: "The polyfill calculates how long to wait so each frame is ~16.6ms apart (60fps). It tracks lastTime to space out calls evenly. If the browser already has native rAF, it just uses that instead of the fallback."
    },
    {
      title: "Batch DOM Updates Using Microtasks",
      difficulty: "mid",
      description: "Build a reactive state container that batches multiple setState calls into a single render using queueMicrotask. Calling setState three times in a row should only trigger one render.",
      solution: `class ReactiveState {
  constructor(initial, renderFn) {
    this._state = { ...initial };
    this._renderFn = renderFn;
    this._updateQueued = false;
    this._changes = {};
  }

  setState(updates) {
    // Collect all changes
    Object.assign(this._changes, updates);

    if (!this._updateQueued) {
      this._updateQueued = true;

      // Batch: apply all changes in one microtask
      queueMicrotask(() => {
        Object.assign(this._state, this._changes);
        this._changes = {};
        this._updateQueued = false;

        this._renderFn(this._state);
      });
    }
  }

  getState() {
    return { ...this._state };
  }
}

let renders = 0;

const state = new ReactiveState(
  { count: 0, name: 'Alice', active: false },
  (s) => {
    renders++;
    console.log('Render #' + renders + ':', JSON.stringify(s));
  }
);

// Three setState calls, but only ONE render
state.setState({ count: 1 });
state.setState({ name: 'Bob' });
state.setState({ active: true });

console.log('Renders so far:', renders);`,
      explanation: "The first setState schedules a microtask. The second and third calls just add to _changes without scheduling another microtask. When the microtask runs, all three changes are applied at once and render is called only once. This is the same pattern React uses internally."
    },
    {
      title: "Async Execution Order Challenge",
      difficulty: "hard",
      description: "Trace through this code with nested async/await, Promises, and queueMicrotask. Predict the exact output order and explain each step.",
      solution: `async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}

async function async2() {
  console.log('async2 start');
  await Promise.resolve();
  console.log('async2 end');
}

console.log('script start');

setTimeout(() => {
  console.log('setTimeout');
}, 0);

async1();

new Promise((resolve) => {
  console.log('promise1');
  resolve();
})
  .then(() => {
    console.log('promise2');
  })
  .then(() => {
    console.log('promise3');
  });

queueMicrotask(() => {
  console.log('microtask');
});

console.log('script end');`,
      explanation: "Output: script start, async1 start, async2 start, promise1, script end, async2 end, promise2, microtask, async1 end, promise3, setTimeout. Each await pauses execution and queues the rest as a microtask. The tricky part is that async2's await pauses both async2 AND async1 (which is waiting for async2). All microtasks drain before setTimeout gets its turn."
    }
  ],
  quiz: [
    {
      question: "Which of the following is a microtask?",
      options: [
        "setTimeout callback",
        "setInterval callback",
        "Promise.then callback",
        "requestAnimationFrame callback"
      ],
      correct: 2,
      explanation: "Promise.then callbacks go to the microtask queue. The other three (setTimeout, setInterval, rAF) are all scheduled differently and run after microtasks."
    },
    {
      question: "What happens when the microtask queue keeps getting new microtasks added during processing?",
      options: [
        "The browser stops after processing 1000 microtasks",
        "New microtasks are deferred to the next event loop iteration",
        "All microtasks are processed, potentially blocking macrotasks and rendering indefinitely",
        "An error is thrown after the queue exceeds a limit"
      ],
      correct: 2,
      explanation: "The engine keeps processing microtasks until the queue is empty. If each microtask adds another one, the loop never ends. Timers and screen rendering are completely blocked."
    },
    {
      question: "What is the output?\n\nsetTimeout(() => console.log('A'), 0);\nqueueMicrotask(() => {\n  console.log('B');\n  queueMicrotask(() => console.log('C'));\n});\nconsole.log('D');",
      options: ["D, B, C, A", "D, B, A, C", "D, A, B, C", "A, D, B, C"],
      correct: 0,
      explanation: "D runs first (sync). Then microtasks: B runs and queues C. C runs next because microtasks drain fully. A (setTimeout) runs last since macrotasks wait for all microtasks."
    },
    {
      question: "Why does setTimeout(fn, 0) have a minimum delay of ~4ms in some cases?",
      options: [
        "JavaScript engines are too slow to process faster",
        "The HTML5 spec mandates 4ms minimum for timers nested more than 5 levels deep",
        "The operating system scheduler can't switch contexts faster",
        "It's a browser bug that hasn't been fixed"
      ],
      correct: 1,
      explanation: "The HTML spec requires browsers to clamp setTimeout to at least 4ms when timers are nested beyond 5 levels. This prevents tight timer loops from consuming too much CPU."
    },
    {
      question: "Where does requestAnimationFrame fit in the event loop?",
      options: [
        "In the microtask queue, before macrotasks",
        "In the macrotask queue, after setTimeout callbacks",
        "In the rendering phase, after microtasks and before paint",
        "It runs synchronously on the call stack"
      ],
      correct: 2,
      explanation: "rAF callbacks run during the rendering phase, right after microtasks are drained and right before the browser paints the screen. This is what makes it ideal for smooth animations."
    },
    {
      question: "In Node.js, what is the priority order of these async callbacks?",
      options: [
        "setTimeout > setImmediate > Promise.then > process.nextTick",
        "process.nextTick > Promise.then > setTimeout > setImmediate",
        "process.nextTick > Promise.then > setImmediate > setTimeout",
        "Promise.then > process.nextTick > setTimeout > setImmediate"
      ],
      correct: 1,
      explanation: "process.nextTick has the highest priority and runs before everything else. Promise.then runs next as a microtask. setTimeout and setImmediate are both macrotasks, with setTimeout (timers phase) running before setImmediate (check phase). Important caveat: when setTimeout(0) and setImmediate are called outside of an I/O callback, their order is non-deterministic in Node.js. The guaranteed ordering only applies within an I/O callback."
    }
  ]
};
