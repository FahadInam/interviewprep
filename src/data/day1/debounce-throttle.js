export const debounceThrottle = {
  id: "debounce-throttle",
  title: "Debounce & Throttle",
  icon: "⏱️",
  tag: "Advanced JS",
  tagColor: "var(--tag-js)",
  subtitle: "Control how often functions run to keep apps fast and smooth.",
  concepts: [
    {
      title: "Debounce",
      explanations: {
        layman: "Imagine an elevator door. It only closes after people stop walking in. Every new person resets the wait timer. Debounce works the same way -- it waits until events stop, then runs once.",
        mid: "Debounce delays a function call until a quiet period passes. If new events keep coming, the timer resets each time. Only the last call goes through. Perfect for search inputs and autosave where you only care about the final value.",
        senior: "Debounce collapses a burst of calls into one. Leading mode fires on the first call, trailing fires after the quiet period. Always pair cancel/flush with component teardown to avoid firing on unmounted components or stale closures."
      },
      realWorld: "A search input that fires an API call on every keystroke wastes bandwidth. Debounce at 300ms means the request only fires once the user pauses typing, cutting calls from 10+ down to 1.",
      whenToUse: "Use when you only care about the final value after a burst of events, like search fields, window resize handlers, or autosave.",
      whenNotToUse: "Skip debounce when you need regular updates during the event, like showing scroll progress. Use throttle instead.",
      pitfalls: "Forgetting to specify leading vs trailing mode. By default most debounce functions use trailing, which means the very first click or keystroke feels delayed. Also, not calling cancel on cleanup leads to callbacks firing after a component unmounts.",
      codeExamples: [
        {
          title: "Complete debounce implementation",
          code: `function debounce(fn, delay, { leading = false, trailing = true } = {}) {
  let timer = null;
  let savedArgs = null;
  let savedThis = null;

  function run() {
    const args = savedArgs;
    const context = savedThis;
    savedArgs = savedThis = null;
    fn.apply(context, args);
  }

  function debounced(...args) {
    savedArgs = args;
    savedThis = this;

    const isFirst = timer === null;

    if (leading && isFirst) {
      run();
    }

    clearTimeout(timer);

    timer = setTimeout(() => {
      timer = null;
      if (trailing && savedArgs) {
        run();
      }
    }, delay);
  }

  debounced.cancel = () => {
    clearTimeout(timer);
    timer = null;
    savedArgs = savedThis = null;
  };

  debounced.flush = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
      if (savedArgs) run();
    }
  };

  return debounced;
}

const input = document.querySelector('#search');
const debouncedSearch = debounce(async (query) => {
  const results = await fetch('/api/search?q=' + query);
  console.log('Searching:', query);
}, 300);`
        }
      ]
    },
    {
      title: "Throttle",
      explanations: {
        layman: "Think of a security guard who lets one person through the gate every 5 seconds, no matter how many people are waiting. Throttle lets a function run at most once per time window.",
        mid: "Throttle guarantees a function runs at a steady pace during continuous events. Unlike debounce, it does not wait for silence. It fires at regular intervals, so users get periodic feedback while scrolling or dragging.",
        senior: "Throttle is debounce with a maxWait equal to the interval. Choose the interval based on what users can perceive (e.g., 16ms for animation, 100-200ms for scroll UI updates). Always handle the trailing call so the final state is captured."
      },
      realWorld: "A scroll event fires hundreds of times per second. Throttling a scroll-position tracker to every 200ms gives smooth progress bar updates without bogging down the main thread.",
      whenToUse: "Use when you want regular updates during ongoing activity, like scroll tracking, drag-and-drop, or mousemove handlers.",
      whenNotToUse: "Skip throttle when you only care about the final result, like a search input. Debounce is a better fit there.",
      pitfalls: "Setting the interval too high makes the UI feel laggy. Setting it too low defeats the purpose. Also, forgetting the trailing call means you miss the user's final position or value.",
      codeExamples: [
        {
          title: "Complete throttle implementation",
          code: `function throttle(fn, interval, { leading = true, trailing = true } = {}) {
  let lastRun = 0;
  let timer = null;
  let savedArgs = null;
  let savedThis = null;

  function run() {
    lastRun = Date.now();
    const args = savedArgs;
    const context = savedThis;
    savedArgs = savedThis = null;
    fn.apply(context, args);
  }

  function throttled(...args) {
    const now = Date.now();
    const elapsed = now - lastRun;
    savedArgs = args;
    savedThis = this;

    if (elapsed >= interval) {
      clearTimeout(timer);
      timer = null;
      if (leading) {
        run();
      } else {
        lastRun = now;
        if (trailing && !timer) {
          timer = setTimeout(() => {
            timer = null;
            run();
          }, interval);
        }
      }
    } else if (trailing && !timer) {
      timer = setTimeout(() => {
        timer = null;
        run();
      }, interval - elapsed);
    }
  }

  throttled.cancel = () => {
    clearTimeout(timer);
    timer = null;
    savedArgs = savedThis = null;
    lastRun = 0;
  };

  return throttled;
}

const throttledScroll = throttle(() => {
  const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  console.log('Scroll:', Math.round(pct) + '%');
}, 200);

window.addEventListener('scroll', throttledScroll);`
        }
      ]
    },
    {
      title: "requestAnimationFrame as Throttle Alternative",
      explanations: {
        layman: "Your screen refreshes about 60 times per second. rAF says: 'Run my code right before the next screen refresh.' This way your visual updates stay perfectly in sync with what the screen can actually show.",
        mid: "requestAnimationFrame naturally throttles to the display refresh rate (usually 60fps). Unlike setTimeout, it pauses when the tab is in the background, saving CPU. It is the best choice for any visual update like animations or layout changes.",
        senior: "rAF batches DOM reads and writes within one frame, avoiding layout thrashing. Always cancel pending frames on component teardown. On high-refresh displays (120Hz+), rAF fires more often, so keep callbacks lightweight or add your own frame-skipping logic."
      },
      realWorld: "A scroll-driven progress bar needs to update visually. Using rAF instead of a setTimeout throttle ensures the bar moves in sync with the browser's paint cycle, resulting in zero visual jank.",
      whenToUse: "Use for any visual or DOM update that should stay in sync with the screen refresh, like animations, scroll effects, or resize layouts.",
      whenNotToUse: "Skip rAF for non-visual work like API calls or analytics. A regular throttle with a fixed interval is simpler and more predictable for those cases.",
      pitfalls: "Not canceling rAF on cleanup causes callbacks to fire after the component is gone. Also, rAF does not guarantee a fixed interval -- on 120Hz screens it runs twice as often, which can cause performance issues if the callback is heavy.",
      codeExamples: [
        {
          title: "rAF-based throttle pattern",
          code: `function rafThrottle(fn) {
  let frameId = null;
  let savedArgs = null;

  function throttled(...args) {
    savedArgs = args;

    if (frameId === null) {
      frameId = requestAnimationFrame(() => {
        frameId = null;
        fn(...savedArgs);
      });
    }
  }

  throttled.cancel = () => {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  };

  return throttled;
}

const updateBar = rafThrottle((scrollY) => {
  const pct = scrollY / (document.body.scrollHeight - innerHeight);
  bar.style.width = (pct * 100) + '%';
});

window.addEventListener('scroll', () => {
  updateBar(window.scrollY);
});

const reads = [];
const writes = [];

function addRead(fn) { reads.push(fn); flush(); }
function addWrite(fn) { writes.push(fn); flush(); }

let scheduled = false;
function flush() {
  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(() => {
      reads.splice(0).map(fn => fn());
      writes.splice(0).forEach(fn => fn());
      scheduled = false;
    });
  }
}`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "What is the difference between debounce and throttle? When would you use each?",
      answer: "Debounce waits until events stop, then fires once. Throttle fires at regular intervals while events continue. Use debounce for search inputs where only the final value matters. Use throttle for scroll handlers where you need periodic updates. In practice, Lodash implements throttle as debounce with a maxWait, so they share the same core. A common gotcha is forgetting the trailing call in throttle, which means you miss the user's final action.",
      difficulty: "easy",
      followUps: [
        "Can you combine leading and trailing edge in a debounce?",
        "How does Lodash implement throttle using debounce?",
        "How would you debounce a search input that also shows a loading spinner immediately?"
      ]
    },
    {
      question: "Implement a debounce function with cancel and flush capabilities.",
      answer: "Store a timer ID and saved arguments in a closure. Each call clears the old timer and sets a new one. When the timer fires, invoke the function with the saved arguments. For cancel, clear the timer and reset saved arguments so nothing fires. For flush, clear the timer and immediately invoke the function with whatever arguments were saved. The key detail is preserving 'this' context by saving it alongside the arguments.",
      difficulty: "mid",
      followUps: [
        "How do you debounce in a React useEffect?",
        "What happens if the component unmounts before the debounced call fires?",
        "How does leading edge debounce differ from throttle?"
      ]
    },
    {
      question: "What are leading and trailing edge execution, and when would you use each?",
      answer: "Leading edge fires the function immediately on the first call, then ignores further calls until the quiet period ends. Trailing edge fires after the quiet period. Use leading for button clicks where instant feedback matters. Use trailing for search inputs where you want the final value. When both are enabled, the function fires immediately on the first call AND again after the quiet period if more calls came in.",
      difficulty: "mid",
      followUps: [
        "When would you use leading-edge debounce on a submit button?",
        "What happens with both leading and trailing enabled?",
        "How would you implement a debounce with both leading and trailing execution?"
      ]
    },
    {
      question: "How does requestAnimationFrame differ from setTimeout for throttling, and when is it better?",
      answer: "setTimeout fires after a fixed delay regardless of the screen. rAF fires right before the browser paints, so it naturally syncs with the display refresh rate. rAF also pauses in background tabs, saving CPU. Use rAF for visual updates like animations and scroll effects. Use setTimeout-based throttle for non-visual work like analytics where you want a specific time interval. On 120Hz displays, rAF fires every 8ms instead of 16ms, so keep callbacks cheap.",
      difficulty: "mid",
      followUps: [
        "What is layout thrashing and how does rAF help?",
        "How do 120Hz+ displays affect rAF-based code?",
        "How would you throttle a scroll handler that updates a sticky header?"
      ]
    },
    {
      question: "Explain how you'd implement a throttle that works correctly with both leading and trailing edge, including the edge case of the final call.",
      answer: "Track the timestamp of the last execution and a pending timer. On each call, check if enough time has passed. If yes and leading is on, run immediately. If not, schedule a trailing timer for the remaining time. The tricky part is the final call: when events stop, there might be saved arguments that need to fire after the interval. Without the trailing timer, the last user action gets silently dropped. Always clear any existing timer before setting a new one to avoid double-fires.",
      difficulty: "hard",
      followUps: [
        "How does Lodash handle the leading+trailing edge case?",
        "What happens if the system clock changes during throttle?",
        "How would you test this with fake timers?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Implement debounce with Promise support",
      difficulty: "mid",
      description: "Build a debounce function that returns a Promise. Each call should return a promise that resolves when the debounced function finally executes. If a new call comes in before the timer fires, the previous promise should still resolve with the eventual result.",
      solution: `function debouncePromise(fn, delay) {
  let timer = null;
  let waitingCallers = [];

  return function(...args) {
    clearTimeout(timer);

    return new Promise((resolve, reject) => {
      waitingCallers.push({ resolve, reject });

      timer = setTimeout(async () => {
        const callers = waitingCallers;
        waitingCallers = [];
        timer = null;

        try {
          const result = await fn.apply(this, args);
          callers.forEach(c => c.resolve(result));
        } catch (error) {
          callers.forEach(c => c.reject(error));
        }
      }, delay);
    });
  };
}

const debouncedFetch = debouncePromise(async (query) => {
  console.log('Fetching:', query);
  return { results: ['item1', 'item2'], query };
}, 300);

async function test() {
  const p1 = debouncedFetch('he');
  const p2 = debouncedFetch('hel');
  const p3 = debouncedFetch('hello');

  const results = await Promise.all([p1, p2, p3]);
  console.log(results);
}
test();`,
      explanation: "Each call returns a Promise and collects all waiting callers. When the debounce timer fires, the function runs once with the latest arguments. The single result is then delivered to every caller's Promise. This way, rapid calls share one API request but each caller still gets a resolved value."
    },
    {
      title: "Implement a throttle with maxWait (Lodash-style)",
      difficulty: "hard",
      description: "Build a throttle function with a maxWait option (like Lodash). The function should execute at most once per wait period, but if maxWait is reached, it forces execution even if the regular throttle hasn't fired yet.",
      solution: `function debounceWithMaxWait(fn, delay, { maxWait, leading = false, trailing = true } = {}) {
  let timer = null;
  let maxTimer = null;
  let savedArgs = null;
  let savedThis = null;

  function run() {
    clearTimeout(timer);
    clearTimeout(maxTimer);
    timer = null;
    maxTimer = null;

    const args = savedArgs;
    const context = savedThis;
    savedArgs = savedThis = null;

    fn.apply(context, args);
  }

  function debounced(...args) {
    savedArgs = args;
    savedThis = this;

    const isFirst = timer === null;

    if (leading && isFirst) {
      run();
      return;
    }

    clearTimeout(timer);
    timer = setTimeout(() => { run(); }, delay);

    if (maxWait !== undefined && maxTimer === null) {
      maxTimer = setTimeout(() => { run(); }, maxWait);
    }
  }

  debounced.cancel = () => {
    clearTimeout(timer);
    clearTimeout(maxTimer);
    timer = maxTimer = null;
    savedArgs = savedThis = null;
  };

  debounced.flush = () => {
    if (savedArgs) run();
  };

  return debounced;
}

const handler = debounceWithMaxWait(
  (value) => console.log('Ran:', value, 'at', Date.now()),
  500,
  { maxWait: 2000, trailing: true }
);

let count = 0;
const interval = setInterval(() => {
  handler('key-' + (++count));
  if (count >= 50) {
    clearInterval(interval);
  }
}, 100);`,
      explanation: "This combines debounce with a maxWait ceiling. The debounce timer resets on each call as usual, but the maxWait timer starts on the first call and never resets. Whichever timer fires first triggers execution. This guarantees the function runs at least every maxWait milliseconds, even under constant input. It is exactly how Lodash turns debounce into throttle."
    },
    {
      title: "Build a rate limiter using throttle concepts",
      difficulty: "mid",
      description: "Build a rate limiter that allows a maximum number of function calls within a time window. If the limit is exceeded, queue the call and execute it when the window resets.",
      solution: `function rateLimiter(fn, maxCalls, windowMs) {
  const queue = [];
  const callTimes = [];
  let running = false;

  function processQueue() {
    if (running || queue.length === 0) return;
    running = true;

    while (queue.length > 0) {
      const now = Date.now();

      while (callTimes.length > 0 && callTimes[0] <= now - windowMs) {
        callTimes.shift();
      }

      if (callTimes.length < maxCalls) {
        const { args, thisArg, resolve, reject } = queue.shift();
        callTimes.push(now);

        try {
          const result = fn.apply(thisArg, args);
          if (result instanceof Promise) {
            result.then(resolve, reject);
          } else {
            resolve(result);
          }
        } catch (err) {
          reject(err);
        }
      } else {
        const waitTime = callTimes[0] + windowMs - now + 1;
        setTimeout(processQueue, waitTime);
        break;
      }
    }

    running = false;
  }

  function limited(...args) {
    return new Promise((resolve, reject) => {
      queue.push({ args, thisArg: this, resolve, reject });
      processQueue();
    });
  }

  limited.pending = () => queue.length;
  limited.clear = () => { queue.length = 0; callTimes.length = 0; };

  return limited;
}

const limitedFetch = rateLimiter(async (url) => {
  console.log('Fetching:', url, 'at', Date.now());
  return 'result: ' + url;
}, 3, 1000);

async function test() {
  const promises = Array.from({ length: 10 }, (_, i) =>
    limitedFetch('/api/' + i)
  );

  const results = await Promise.all(promises);
  console.log('All done:', results.length);
  console.log('Pending:', limitedFetch.pending());
}
test();`,
      explanation: "Unlike throttle which limits one function, a rate limiter tracks how many calls happened in a sliding time window. It queues excess calls and processes them when slots open up. Each call returns a Promise so the caller can await its turn. The sliding window is maintained by removing timestamps older than windowMs."
    }
  ],
  quiz: [
    {
      question: "A user types 'hello' in a search box debounced at 300ms. How many API calls are made if each keystroke is 100ms apart?",
      options: ["5 calls", "1 call", "2 calls", "0 calls"],
      correct: 1,
      explanation: "Each keystroke comes 100ms apart, which is faster than the 300ms delay. So every keystroke resets the timer before it fires. Only after the last letter ('o') does the timer run uninterrupted for 300ms, making exactly 1 API call."
    },
    {
      question: "What is the key advantage of using requestAnimationFrame over setTimeout(fn, 16) for visual updates?",
      options: [
        "rAF is always faster",
        "rAF syncs with the display refresh rate and pauses in background tabs",
        "rAF has higher priority in the event loop",
        "rAF works with Web Workers"
      ],
      correct: 1,
      explanation: "setTimeout(fn, 16) is a rough guess at 60fps and can drift out of sync with the actual screen refresh. rAF is called by the browser right before each paint, so it stays perfectly aligned. It also automatically pauses when the tab is hidden, saving battery and CPU."
    },
    {
      question: "In Lodash, throttle(fn, 200) is internally implemented as:",
      options: [
        "setInterval(fn, 200)",
        "debounce(fn, 200, { maxWait: 200 })",
        "requestAnimationFrame with a counter",
        "A custom implementation unrelated to debounce"
      ],
      correct: 1,
      explanation: "Lodash's throttle is just debounce with maxWait set to the same value as the delay. The debounce timer resets on each call, but maxWait guarantees execution happens at least every 200ms. This is a clever reuse -- one implementation handles both patterns."
    },
    {
      question: "What happens if you debounce a function with delay 0?",
      options: [
        "The function runs synchronously",
        "The function is deferred to the next microtask",
        "The function is deferred to the next macrotask (setTimeout 0)",
        "It throws an error"
      ],
      correct: 2,
      explanation: "setTimeout with delay 0 does not run synchronously. It schedules a macrotask, which means the function waits until the current call stack clears and the event loop picks up the next task. This still debounces rapid calls because each one clears the previous setTimeout(0)."
    }
  ]
};
