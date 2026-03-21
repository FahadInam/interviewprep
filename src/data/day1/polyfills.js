export const polyfills = {
  id: "polyfills",
  title: "JavaScript Polyfills",
  icon: "🔧",
  tag: "Browser APIs",
  tagColor: "var(--tag-js)",
  subtitle: "Master writing polyfills for bind, call, apply, debounce, throttle, and Promise.",
  concepts: [
    {
      title: "Function.prototype.bind Polyfill",
      explanations: {
        layman: "Think of bind like saving a phone's speed-dial setting. You lock in who you're calling (the `this` context) and optionally pre-fill some info (arguments). Later, you just press the button and it fills in the rest.",
        mid: "Your polyfill needs to return a new function that remembers the original context and any pre-set arguments. It also needs to work correctly with `new` -- when used as a constructor, the bound `this` should be ignored in favor of the newly created object.",
        senior: "The tricky part is constructor support. When the bound function is called with `new`, `this instanceof bound` detects it and skips the bound context. You also need to set up the prototype chain so `instanceof` checks still work on the original constructor."
      },
      realWorld: "Libraries like Lodash used to ship bind polyfills for IE8 and below, where `Function.prototype.bind` didn't exist natively.",
      whenToUse: "When you need to support old browsers that lack `Function.prototype.bind` and a transpiler or bundler isn't an option.",
      whenNotToUse: "Skip it if all your target browsers already support bind natively -- every modern browser does.",
      pitfalls: "Always check if `bind` already exists before patching. Overwriting the native version can cause subtle bugs because your polyfill won't match every edge case of the spec.",
      codeExamples: [
        {
          title: "Spec-compliant bind polyfill",
          code: `Function.prototype.myBind = function(ctx, ...preArgs) {
  // Only functions can be bound
  if (typeof this !== 'function') {
    throw new TypeError('myBind must be called on a function');
  }

  const fn = this;

  const bound = function(...newArgs) {
    // If called with 'new', ignore the bound context
    const useNew = this instanceof bound;
    return fn.apply(
      useNew ? this : ctx,
      [...preArgs, ...newArgs]
    );
  };

  // Keep the prototype chain so instanceof works
  if (fn.prototype) {
    bound.prototype = Object.create(fn.prototype);
  }

  return bound;
};

const user = { name: 'Alice' };
function greet(greeting, end) {
  return greeting + ', ' + this.name + end;
}

const hi = greet.myBind(user, 'Hello');
console.log(hi('!'));`
        }
      ]
    },
    {
      title: "Function.prototype.call and apply Polyfills",
      explanations: {
        layman: "Imagine asking a friend to use your tool. You temporarily hand them the tool, they do the job, and you take it back. That's what call/apply do -- they temporarily attach a function to an object, run it, and clean up.",
        mid: "The trick is to temporarily add the function as a property on the context object, invoke it (so `this` points to that object), then delete the property. Use a Symbol for the temp key so you never collide with existing properties.",
        senior: "Handle null/undefined context by falling back to globalThis. Wrapping primitives with Object() matches the spec. Using Symbol() for the temporary key avoids any property name collision, even on frozen objects (which will throw -- a known edge case)."
      },
      realWorld: "These polyfills show up in interview coding rounds constantly. In real code, they were needed for very old environments before ES5 was universal.",
      whenToUse: "When targeting environments without native call/apply, or when an interviewer asks you to show how `this` binding works under the hood.",
      whenNotToUse: "In any modern codebase -- call and apply have been supported everywhere since IE6.",
      pitfalls: "If the context object is frozen or sealed, adding even a Symbol property will throw. Also, don't use a plain string key -- it could overwrite an existing property.",
      codeExamples: [
        {
          title: "call and apply polyfills",
          code: `Function.prototype.myCall = function(ctx, ...args) {
  if (typeof this !== 'function') {
    throw new TypeError('myCall must be called on a function');
  }

  // Fall back to globalThis for null/undefined
  ctx = ctx != null ? Object(ctx) : globalThis;

  // Use a Symbol so we don't clash with existing keys
  const key = Symbol('fn');
  ctx[key] = this;

  const result = ctx[key](...args);
  delete ctx[key];

  return result;
};

Function.prototype.myApply = function(ctx, argsList) {
  if (typeof this !== 'function') {
    throw new TypeError('myApply must be called on a function');
  }

  ctx = ctx != null ? Object(ctx) : globalThis;
  const key = Symbol('fn');
  ctx[key] = this;

  // apply takes an array (or nothing)
  const result = argsList ? ctx[key](...argsList) : ctx[key]();
  delete ctx[key];

  return result;
};

function intro(role) {
  return this.name + ' is a ' + role;
}

console.log(intro.myCall({ name: 'Bob' }, 'developer'));
console.log(intro.myApply({ name: 'Bob' }, ['developer']));`
        }
      ]
    },
    {
      title: "Debounce and Throttle Polyfills",
      explanations: {
        layman: "Debounce is like an elevator door -- it waits until people stop getting on before it closes. Throttle is like a metronome -- it fires at a steady beat no matter how many times you tap it.",
        mid: "Debounce resets a timer on every call and only fires after the delay passes with no new calls. Throttle lets the function run once per time window. Both need to forward the correct `this` and arguments to the original function.",
        senior: "Leading vs trailing matters: leading debounce fires on the first call then ignores the rest, trailing fires after silence. A production throttle should guarantee a trailing call so the last event is never swallowed. Both need cancel() for cleanup on unmount."
      },
      realWorld: "Search boxes use debounce to wait until the user stops typing before making an API call. Scroll handlers use throttle to limit expensive layout calculations to once every ~200ms.",
      whenToUse: "Debounce for input-driven events where you only care about the final value. Throttle for continuous events like scroll or resize where you need regular updates.",
      whenNotToUse: "For visual animations, use requestAnimationFrame instead -- it syncs with the browser's paint cycle and gives smoother results than a fixed timer.",
      pitfalls: "Forgetting to call cancel() when a component unmounts can fire the callback after the DOM is gone, causing errors. Also, make sure you forward `this` correctly or event handlers will lose their context.",
      codeExamples: [
        {
          title: "Debounce with leading/trailing options",
          code: `function debounce(fn, delay, options = {}) {
  const { leading = false, trailing = true } = options;
  let timer = null;
  let savedArgs = null;
  let savedThis = null;

  function debounced(...args) {
    savedArgs = args;
    savedThis = this;

    // Fire immediately on first call if leading is on
    const fireNow = leading && timer === null;

    clearTimeout(timer);

    timer = setTimeout(() => {
      timer = null;
      // Fire after the delay if trailing is on
      if (trailing && savedArgs) {
        fn.apply(savedThis, savedArgs);
        savedArgs = null;
        savedThis = null;
      }
    }, delay);

    if (fireNow) {
      fn.apply(savedThis, savedArgs);
      savedArgs = null;
      savedThis = null;
    }
  }

  debounced.cancel = function() {
    clearTimeout(timer);
    timer = null;
    savedArgs = null;
    savedThis = null;
  };

  debounced.flush = function() {
    if (timer !== null && savedArgs) {
      fn.apply(savedThis, savedArgs);
      debounced.cancel();
    }
  };

  return debounced;
}

const handleSearch = debounce((query) => {
  console.log('Searching for:', query);
}, 300);`
        },
        {
          title: "Throttle implementation",
          code: `function throttle(fn, wait) {
  let lastRun = 0;
  let timer = null;
  let savedArgs = null;
  let savedThis = null;

  function throttled(...args) {
    const now = Date.now();
    const timeLeft = wait - (now - lastRun);
    savedArgs = args;
    savedThis = this;

    if (timeLeft <= 0) {
      // Enough time has passed -- run now
      clearTimeout(timer);
      timer = null;
      lastRun = now;
      fn.apply(savedThis, savedArgs);
      savedArgs = null;
      savedThis = null;
    } else if (timer === null) {
      // Schedule a trailing call for the remaining time
      timer = setTimeout(() => {
        lastRun = Date.now();
        timer = null;
        fn.apply(savedThis, savedArgs);
        savedArgs = null;
        savedThis = null;
      }, timeLeft);
    }
  }

  throttled.cancel = function() {
    clearTimeout(timer);
    timer = null;
    savedArgs = null;
    savedThis = null;
    lastRun = 0;
  };

  return throttled;
}

const onScroll = throttle(() => {
  console.log('Scroll position:', window.scrollY);
}, 200);
window.addEventListener('scroll', onScroll);`
        }
      ]
    },
    {
      title: "Basic Promise Polyfill",
      explanations: {
        layman: "A Promise is like ordering food at a restaurant. You get a ticket (the Promise). The kitchen is working on it (pending). Eventually you either get your food (fulfilled) or they tell you they're out (rejected). You can't change the outcome once it's decided.",
        mid: "A Promise holds a state (pending/fulfilled/rejected) and a queue of handlers. When it settles, it runs each handler asynchronously via queueMicrotask. The `.then()` method returns a new Promise, which is how chaining works -- each handler's return value resolves the next Promise in the chain.",
        senior: "When you `resolve(someValue)`, the implementation must check if `someValue` has a `.then` method. If it does, it treats it as another Promise and waits for it to settle -- this is how different Promise libraries can work together. Use a `called` flag to prevent double-resolution (a badly-written thenable might call both resolve and reject). Handlers must always run as microtasks via `queueMicrotask`, never synchronously, so that code after `.then()` always executes before the handler, regardless of whether the Promise was already settled."
      },
      realWorld: "Before native Promises landed in browsers, libraries like Bluebird and es6-promise shipped exactly this kind of polyfill so developers could use async patterns everywhere.",
      whenToUse: "When you need Promise support in old environments like IE11, or when an interviewer wants to see that you understand how async chaining actually works.",
      whenNotToUse: "In any modern project -- native Promises are available in all current browsers and Node.js versions.",
      pitfalls: "The biggest mistake is running handlers synchronously instead of as microtasks. This creates inconsistent behavior depending on whether the Promise was already resolved when `.then()` was called.",
      codeExamples: [
        {
          title: "Promises/A+ compliant polyfill",
          code: `class MyPromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = undefined;
    this.handlers = [];

    const resolve = (val) => {
      if (this.state !== 'pending') return;

      // If val is a thenable, unwrap it first
      if (val && (typeof val === 'object' || typeof val === 'function')) {
        let called = false;
        try {
          const then = val.then;
          if (typeof then === 'function') {
            then.call(
              val,
              (v) => { if (!called) { called = true; resolve(v); } },
              (r) => { if (!called) { called = true; reject(r); } }
            );
            return;
          }
        } catch (e) {
          if (!called) { called = true; reject(e); }
          return;
        }
      }

      this.state = 'fulfilled';
      this.value = val;
      this._run();
    };

    const reject = (reason) => {
      if (this.state !== 'pending') return;
      this.state = 'rejected';
      this.value = reason;
      this._run();
    };

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  _run() {
    if (this.state === 'pending') return;
    this.handlers.forEach((h) => {
      // Always async -- this is required by the spec
      queueMicrotask(() => {
        const cb = this.state === 'fulfilled'
          ? h.onFulfilled
          : h.onRejected;

        // No handler? Pass the value through to the next promise
        if (typeof cb !== 'function') {
          if (this.state === 'fulfilled') {
            h.resolve(this.value);
          } else {
            h.reject(this.value);
          }
          return;
        }

        try {
          h.resolve(cb(this.value));
        } catch (err) {
          h.reject(err);
        }
      });
    });
    this.handlers = [];
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      this.handlers.push({ onFulfilled, onRejected, resolve, reject });
      this._run();
    });
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  finally(cb) {
    return this.then(
      (val) => MyPromise.resolve(cb()).then(() => val),
      (err) => MyPromise.resolve(cb()).then(() => { throw err; })
    );
  }

  static resolve(val) {
    if (val instanceof MyPromise) return val;
    return new MyPromise((res) => res(val));
  }

  static reject(reason) {
    return new MyPromise((_, rej) => rej(reason));
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      const results = [];
      let left = promises.length;
      if (left === 0) return resolve([]);

      promises.forEach((p, i) => {
        MyPromise.resolve(p).then(
          (val) => {
            results[i] = val;
            if (--left === 0) resolve(results);
          },
          reject
        );
      });
    });
  }
}

const p = new MyPromise((resolve) => {
  setTimeout(() => resolve('done'), 100);
});
p.then((val) => console.log(val));`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "Implement Function.prototype.bind from scratch. Make sure it handles partial application and constructor invocation.",
      answer: "I'd store the original function and bound context in a closure, then return a new function that merges the pre-set args with any new args. For constructor support, I check `this instanceof bound` -- if true, I ignore the bound context and let `this` be the new object. I also link prototypes with Object.create so instanceof still works. A common mistake is forgetting the constructor case, which breaks code that uses `new` on bound functions.",
      difficulty: "hard",
      followUps: [
        "What happens if you bind an already-bound function?",
        "How does the.length property behave on bound functions?",
        "Why do native bound functions have no .prototype property?"
      ]
    },
    {
      question: "Write a polyfill for Function.prototype.call without using apply or bind.",
      answer: "I temporarily attach the function as a property on the context object using a Symbol key, call it as a method (which sets `this` correctly), then delete the property. I use Symbol to avoid clashing with existing keys. For null or undefined context, I fall back to globalThis. One gotcha: this breaks on frozen objects since you can't add properties to them.",
      difficulty: "mid",
      followUps: [
        "Why do we use Symbol instead of a string key?",
        "What happens if the context object is frozen?",
        "How does `this` behave differently in strict mode?"
      ]
    },
    {
      question: "What is the difference between debounce and throttle? When would you use each?",
      answer: "Debounce waits until calls stop coming, then fires once after a quiet period. Throttle fires at most once per time window, no matter how many calls happen. I use debounce for search inputs so I only hit the API after the user stops typing. I use throttle for scroll handlers so I get regular updates without flooding the browser. A good rule of thumb: if you want the final value, debounce; if you want steady sampling, throttle.",
      difficulty: "easy",
      followUps: [
        "What is a leading vs trailing debounce?",
        "How would you implement a debounce with a maxWait option?",
        "Why might requestAnimationFrame be better than throttle for visual updates?"
      ]
    },
    {
      question: "Implement Promise.all from scratch.",
      answer: "I create a new Promise, set up a results array and a counter. For each input, I wrap it with Promise.resolve (to handle non-Promise values), then in its .then callback I store the result at the correct index and decrement the counter. When the counter hits zero, I resolve with the full results array. If any single promise rejects, I reject immediately. Don't forget the empty array edge case -- resolve right away with [].",
      difficulty: "mid",
      followUps: [
        "How does Promise.allSettled differ from Promise.all?",
        "What happens if one of the values is not a promise?",
        "How would you use Promise.all to load multiple API endpoints in parallel on page load?"
      ]
    },
    {
      question: "Why must Promise handlers execute asynchronously even if the promise is already settled?",
      answer: "It guarantees consistent ordering. If handlers ran synchronously when the promise was already resolved but asynchronously when it was pending, the same code would behave differently depending on timing. This unpredictability is called the 'Zalgo' problem. By always deferring to a microtask, code after `.then()` always runs before the handler, every time, regardless of the promise's state.",
      difficulty: "hard",
      followUps: [
        "What is the difference between microtasks and macrotasks?",
        "Why is queueMicrotask preferred over setTimeout(fn, 0)?",
        "What is the 'Zalgo' problem in async programming?"
      ]
    },
    {
      question: "How would you write a polyfill for Array.prototype.flat?",
      answer: "I'd loop through the array and check each element. If it's an array and depth is greater than 0, I recursively flatten it with depth - 1. Otherwise, I push it to the result. For sparse arrays, I use `in` operator to skip holes. A stack-based approach avoids stack overflow for very deep nesting when depth is Infinity.",
      difficulty: "mid",
      followUps: [
        "How would you handle Infinity depth without stack overflow?",
        "What about flatMap — how does it differ?",
        "How do you detect sparse array holes?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Implement Function.prototype.bind",
      difficulty: "hard",
      description: "Write a custom myBind method that works like native bind. It should support partial application (pre-filling arguments) and work correctly when the bound function is called with `new`.",
      solution: `Function.prototype.myBind = function(ctx, ...preArgs) {
  if (typeof this !== 'function') {
    throw new TypeError('Bind must be called on a function');
  }
  const fn = this;

  const bound = function(...newArgs) {
    return fn.apply(
      this instanceof bound ? this : ctx,
      [...preArgs, ...newArgs]
    );
  };

  if (fn.prototype) {
    bound.prototype = Object.create(fn.prototype);
  }

  return bound;
};`,
      explanation: "The closure captures the original function and context. When called normally, it applies the bound context. When called with `new`, `this instanceof bound` is true, so it uses the new object instead. The prototype link ensures instanceof checks work on the original constructor."
    },
    {
      title: "Implement Function.prototype.call",
      difficulty: "mid",
      description: "Write a custom myCall method that invokes a function with a given `this` context and individual arguments, without using native call, apply, or bind.",
      solution: `Function.prototype.myCall = function(ctx, ...args) {
  if (typeof this !== 'function') {
    throw new TypeError('myCall is not a function');
  }
  ctx = ctx != null ? Object(ctx) : globalThis;
  const key = Symbol('fn');
  ctx[key] = this;
  const result = ctx[key](...args);
  delete ctx[key];
  return result;
};`,
      explanation: "We temporarily attach the function to the context object using a Symbol key (to avoid name collisions), call it as a method so `this` points to the context, then clean up by deleting the temporary property."
    },
    {
      title: "Implement Function.prototype.apply",
      difficulty: "mid",
      description: "Write a custom myApply method that works like native apply -- it takes a context and an array of arguments, without using native call, apply, or bind.",
      solution: `Function.prototype.myApply = function(ctx, argsList) {
  if (typeof this !== 'function') {
    throw new TypeError('myApply is not a function');
  }
  ctx = ctx != null ? Object(ctx) : globalThis;
  const key = Symbol('fn');
  ctx[key] = this;
  const result = argsList ? ctx[key](...argsList) : ctx[key]();
  delete ctx[key];
  return result;
};`,
      explanation: "Same approach as myCall, but we spread an array of arguments instead of individual ones. If no argument list is provided, we just call the function with no arguments."
    },
    {
      title: "Implement debounce with cancel and flush",
      difficulty: "mid",
      description: "Write a debounce function that delays execution until calls stop for the given delay. Include cancel() to abort a pending call and flush() to fire it immediately.",
      solution: `function debounce(fn, delay) {
  let timer = null;
  let savedArgs = null;
  let savedThis = null;

  function debounced(...args) {
    savedArgs = args;
    savedThis = this;
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn.apply(savedThis, savedArgs);
      savedArgs = null;
      savedThis = null;
    }, delay);
  }

  debounced.cancel = function() {
    clearTimeout(timer);
    timer = null;
    savedArgs = null;
    savedThis = null;
  };

  debounced.flush = function() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
      fn.apply(savedThis, savedArgs);
      savedArgs = null;
      savedThis = null;
    }
  };

  return debounced;
}`,
      explanation: "Each call resets the timer. The function only fires after the full delay passes with no new calls. cancel() clears everything so nothing fires. flush() fires the pending call immediately and cleans up the timer."
    },
    {
      title: "Implement throttle with trailing call",
      difficulty: "mid",
      description: "Write a throttle function that runs the callback at most once per time window. Make sure the last call during a window still fires after the window ends (trailing call).",
      solution: `function throttle(fn, wait) {
  let lastRun = 0;
  let timer = null;
  let savedArgs = null;
  let savedThis = null;

  return function(...args) {
    const now = Date.now();
    const timeLeft = wait - (now - lastRun);
    savedArgs = args;
    savedThis = this;

    if (timeLeft <= 0) {
      clearTimeout(timer);
      timer = null;
      lastRun = now;
      fn.apply(savedThis, savedArgs);
      savedArgs = null;
      savedThis = null;
    } else if (!timer) {
      timer = setTimeout(() => {
        lastRun = Date.now();
        timer = null;
        fn.apply(savedThis, savedArgs);
        savedArgs = null;
        savedThis = null;
      }, timeLeft);
    }
  };
}`,
      explanation: "If enough time has passed since the last run, fire immediately. Otherwise, schedule a trailing call for the remaining time. This guarantees the last event in a burst is never lost."
    },
    {
      title: "Implement a basic Promise with then, catch, and static methods",
      difficulty: "hard",
      description: "Build a Promise class that supports then/catch chaining, handles async resolution, and includes static resolve/reject/all methods. Handlers must run asynchronously as microtasks.",
      solution: `class SimplePromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = undefined;
    this.callbacks = [];

    const settle = (state, value) => {
      if (this.state !== 'pending') return;
      this.state = state;
      this.value = value;
      this.callbacks.forEach(cb => this._handle(cb));
      this.callbacks = [];
    };

    const resolve = (val) => {
      // Unwrap thenables
      if (val && typeof val.then === 'function') {
        val.then(resolve, reject);
        return;
      }
      settle('fulfilled', val);
    };

    const reject = (reason) => settle('rejected', reason);

    try { executor(resolve, reject); }
    catch (e) { reject(e); }
  }

  _handle(cb) {
    if (this.state === 'pending') {
      this.callbacks.push(cb);
      return;
    }
    const handler = this.state === 'fulfilled'
      ? cb.onFulfilled
      : cb.onRejected;

    queueMicrotask(() => {
      if (!handler) {
        // No handler -- pass value through
        (this.state === 'fulfilled'
          ? cb.resolve
          : cb.reject)(this.value);
        return;
      }
      try { cb.resolve(handler(this.value)); }
      catch (e) { cb.reject(e); }
    });
  }

  then(onFulfilled, onRejected) {
    return new SimplePromise((resolve, reject) => {
      this._handle({ onFulfilled, onRejected, resolve, reject });
    });
  }

  catch(onRejected) { return this.then(null, onRejected); }

  static resolve(v) {
    return v instanceof SimplePromise ? v : new SimplePromise(r => r(v));
  }

  static reject(r) { return new SimplePromise((_, rej) => rej(r)); }

  static all(promises) {
    return new SimplePromise((resolve, reject) => {
      if (!promises.length) return resolve([]);
      const results = [];
      let left = promises.length;
      promises.forEach((p, i) => {
        SimplePromise.resolve(p).then(val => {
          results[i] = val;
          if (--left === 0) resolve(results);
        }, reject);
      });
    });
  }
}`,
      explanation: "The constructor runs the executor and wires up resolve/reject. Resolve unwraps thenables recursively. _handle queues callbacks while pending and runs them as microtasks once settled. Each .then() returns a new Promise, enabling chaining. Promise.all tracks a counter and resolves when all inputs are done."
    }
  ],
  quiz: [
    {
      question: "What happens when you use `new` with a bound function?",
      options: [
        "The bound `this` context is ignored and a new object is created",
        "The bound `this` context is used as the new object's prototype",
        "A TypeError is thrown",
        "The bound `this` context becomes the new object"
      ],
      correct: 0,
      explanation: "When you use `new`, JavaScript creates a fresh object and uses it as `this`. The previously bound context is ignored because constructor behavior takes priority over bind."
    },
    {
      question: "What is the main difference between call() and apply()?",
      options: [
        "call() is faster than apply()",
        "apply() can only be used with arrays",
        "call() takes arguments individually, apply() takes them as an array",
        "apply() permanently binds `this`, call() does not"
      ],
      correct: 2,
      explanation: "They do the same thing -- invoke a function with a specific `this`. The only difference is how you pass arguments: call takes them one by one, apply takes a single array."
    },
    {
      question: "In a Promises/A+ compliant implementation, when do .then() handlers execute?",
      options: [
        "Synchronously if the promise is already resolved",
        "In the next macrotask (setTimeout)",
        "Asynchronously as a microtask, after current synchronous code completes",
        "It depends on the browser implementation"
      ],
      correct: 2,
      explanation: "The spec requires handlers to always run asynchronously as microtasks. This ensures consistent behavior whether the promise was already settled or not when .then() was called."
    },
    {
      question: "What happens if you call debounce's returned function continuously for 2 seconds with a 500ms delay?",
      options: [
        "The function fires 4 times (every 500ms)",
        "The function fires once, 500ms after the last call",
        "The function fires twice (at start and end)",
        "The function never fires because the timer keeps resetting"
      ],
      correct: 1,
      explanation: "Each call resets the 500ms timer. Since calls keep coming for 2 seconds straight, the timer never finishes until 500ms after the very last call. So it fires exactly once."
    }
  ]
};
