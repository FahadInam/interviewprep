export const closures = {
  id: "closures",
  title: "Closures",
  icon: "🔒",
  tag: "JavaScript Core",
  tagColor: "var(--tag-js)",
  subtitle: "The #1 JavaScript interview topic, made simple.",
  concepts: [
    {
      title: "What Are Closures & How They Form",
      explanations: {
        layman: "A closure is like a backpack. When a function is created inside another function, it packs up the variables around it and carries them wherever it goes.",
        mid: "A closure remembers variables from where it was written, not where it runs. The link is set at declaration time and stays alive across calls. This is why a counter function can keep counting between calls — the closure holds the count variable alive even after the outer function returned.",
        senior: "Closures capture references to variables, not snapshots of their values — so all inner functions inside the same outer function share the same variables. If one inner function changes `count`, every other inner function sees the updated value. This shared-variable behavior is the root cause of most closure bugs (like the classic for-loop issue). Also, if you use `eval` inside a closure, the engine can't tell which variables `eval` might access, so it's forced to keep every variable from the outer scope alive instead of only the ones the closure actually uses."
      },
      realWorld: "Event handlers and timers often use closures. If state changes but the handler still holds old values, you get bugs.",
      whenToUse: "When a callback needs access to variables from its surrounding function.",
      whenNotToUse: "When you can just pass values as arguments directly.",
      pitfalls: "Closures can accidentally hold onto large objects and leak memory. Only capture what you actually need.",
      codeExamples: [
        {
          title: "Basic Closure Formation",
          code: `function makeCounter() {
  let count = 0;

  return function() {
    count++;
    return count;
  };
}

const counter = makeCounter();

console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3`
        },
        {
          title: "What Gets Captured",
          code: `function outer() {
  let used = 10;
  let notUsed = 20;       // not referenced by inner — can be garbage collected
  let bigData = new Array(1000000); // same — engine can drop it

  return function inner() {
    return used; // only 'used' is captured
  };
}

const fn = outer();`
        }
      ]
    },
    {
      title: "Lexical Scoping & Closure Relationship",
      explanations: {
        layman: "JavaScript looks up variables based on where functions are written, not where they run. Think of it like your home address — it doesn't change just because you travel somewhere else.",
        mid: "Closures rely on lexical scope. A function always reads variables from its original location in the code, regardless of where it gets called.",
        senior: "The scope chain is like a linked list of variable containers — each function gets a pointer to its parent's variables, fixed at the time the function is created, not when it's called. For example: `function outer() { let x = 1; return function inner() { return x; }; }` — `inner` always looks up `x` through `outer`'s scope, no matter where you call `inner` from. Watch for variable shadowing — if an inner scope declares `let x = 2`, it silently hides the outer `x` with no error, which can cause subtle bugs when you meant to use the outer one."
      },
      realWorld: "Knowing this prevents confusion when a callback runs in a different context but still reads the original scope's variables.",
      whenToUse: "When you need to understand why a function reads a variable from where it was written, not from where it's called.",
      whenNotToUse: "When the function only uses its own parameters and local variables — no outer scope is involved.",
      pitfalls: "Shadowing a variable name in a nested scope can hide the outer one and cause subtle bugs.",
      codeExamples: [
        {
          title: "Scope Chain: Inner Sees Everything Above",
          code: `const top = "I'm global";

function outer() {
  const mid = "I'm outer";

  function middle() {
    const low = "I'm middle";

    function inner() {
      // inner can see all three variables above it
      console.log(top);
      console.log(mid);
      console.log(low);
    }

    return inner;
  }

  return middle;
}

const middleFn = outer();
const innerFn = middleFn();
innerFn();`
        }
      ]
    },
    {
      title: "Memory Implications & Garbage Collection",
      explanations: {
        layman: "As long as a closure exists, the variables it uses stay in memory. It's like keeping a storage unit rented — the stuff inside can't be thrown away until you cancel the lease.",
        mid: "Event listeners, timers, and caches can keep closures alive much longer than expected. Remove them when no longer needed.",
        senior: "Use heap snapshots and retainer trees in DevTools to trace which closure keeps memory alive. Remember: if multiple inner functions were created inside the same outer function, they all share the same captured variables — nulling just one of those inner functions won't free the variables, because the other inner functions still hold references. All of them must be released before garbage collection kicks in. For caches or event maps, consider `WeakRef` or `WeakMap` so entries can be garbage collected when their keys are no longer referenced elsewhere."
      },
      realWorld: "Forgetting to remove event listeners or clear timers is the most common way closures cause memory leaks in apps.",
      whenToUse: "Be mindful of this whenever closures live beyond a short function call — especially in long-running apps.",
      whenNotToUse: "Don't worry about it for short-lived closures that get garbage collected quickly.",
      pitfalls: "Capturing a huge array when you only need its length wastes memory. Extract the value you need first.",
      codeExamples: [
        {
          title: "Memory Leak and How to Fix It",
          code: `// BAD: the closure captures the entire bigData array
function setup() {
  const bigData = new Array(1000000).fill('*');
  const btn = document.getElementById('btn');

  btn.addEventListener('click', function() {
    console.log(bigData.length);
  });
}

// GOOD: only capture the small value you need
function setupFixed() {
  const bigData = new Array(1000000).fill('*');
  const len = bigData.length; // grab just the length

  const btn = document.getElementById('btn');
  btn.addEventListener('click', () => {
    console.log(len);
  });
}`
        }
      ]
    },
    {
      title: "Classic Interview Trap: Loop + var + Closure",
      explanations: {
        layman: "Using var in a loop with setTimeout is a famous trick question. All the callbacks share the same variable, so by the time they run, the loop is already done and the variable is at its final value.",
        mid: "var is function-scoped, so all iterations share one variable. By the time setTimeout fires, the loop is finished. Use let, an IIFE, or pass i as an argument to fix it.",
        senior: "This is the textbook proof that closures capture references, not values. With `var`, there's one variable shared across all iterations — every closure points to the same `i`, which is 5 after the loop. With `let`, the engine creates a fresh `i` for each iteration, so each closure gets its own copy. The IIFE fix works differently: `(function(j) { ... })(i)` passes `i` by value into a new function parameter `j`, so each closure captures a separate `j`. The trade-off is that `let` is zero-cost syntactically, while IIFEs add a function call per iteration — but in practice the performance difference is negligible."
      },
      realWorld: "This pattern shows up anytime async callbacks run inside loops — common with API calls and event setup.",
      whenToUse: "Always use let in loops with async callbacks to avoid this trap.",
      whenNotToUse: "If you're already using let or const, you don't need IIFE workarounds.",
      pitfalls: "Even experienced developers sometimes forget that var is shared across all iterations.",
      codeExamples: [
        {
          title: "The Bug and Three Fixes",
          code: `// BUG: prints 5 five times because var is shared
for (var i = 0; i < 5; i++) {
  setTimeout(function() {
    console.log(i);
  }, i * 1000);
}

// FIX 1: IIFE creates a new scope per iteration
for (var i = 0; i < 5; i++) {
  (function(j) {
    setTimeout(function() {
      console.log(j);
    }, j * 1000);
  })(i);
}

// FIX 2: let creates a new binding per iteration
for (let i = 0; i < 5; i++) {
  setTimeout(function() {
    console.log(i);
  }, i * 1000);
}

// FIX 3: pass i as third argument to setTimeout
for (var i = 0; i < 5; i++) {
  setTimeout(function(j) {
    console.log(j);
  }, i * 1000, i);
}`
        }
      ]
    },
    {
      title: "Real-World Closure Patterns",
      explanations: {
        layman: "Closures let you create functions with built-in memory. They're used to make private variables, save past results, and pre-fill arguments.",
        mid: "They reduce global state by keeping data inside function scope. Factories, memoization, and currying all rely on closures.",
        senior: "When designing long-lived closure-based APIs, always include cleanup methods so consumers can release captured resources."
      },
      realWorld: "The module pattern, memoization, and currying are everywhere in JavaScript libraries and real codebases.",
      whenToUse: "When you want to hide data, cache results, or create specialized versions of a function.",
      whenNotToUse: "For simple one-off operations where a plain function with arguments does the job.",
      pitfalls: "Long-lived closures (like cached functions) can grow in memory forever if you don't add a cache size limit or cleanup.",
      codeExamples: [
        {
          title: "Module Pattern: Private Data",
          code: `const Wallet = (function() {
  let balance = 0;       // private — can't be accessed from outside
  const log = [];        // private transaction history

  return {
    add(amount) {
      if (amount <= 0) throw new Error("Bad amount");
      balance += amount;
      log.push({ type: 'add', amount });
      return balance;
    },
    spend(amount) {
      if (amount > balance) throw new Error("Not enough");
      balance -= amount;
      log.push({ type: 'spend', amount });
      return balance;
    },
    check() {
      return balance;
    },
    history() {
      return [...log]; // return a copy so the original stays safe
    }
  };
})();

Wallet.add(100);
Wallet.spend(30);
console.log(Wallet.balance); // undefined — balance is private`
        },
        {
          title: "Memoization: Remember Past Results",
          code: `function memoize(fn) {
  const cache = new Map(); // closure keeps the cache alive

  return function(...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key); // return cached result
    }

    const result = fn.apply(this, args);
    cache.set(key, result); // store for next time
    return result;
  };
}

const fib = memoize(function(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
});

console.log(fib(40)); // fast because results are cached
console.log(fib(40)); // instant — already in cache`
        },
        {
          title: "Currying: Pre-fill Arguments",
          code: `function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args); // all args received, call the function
    }
    return function(...more) {
      return curried.apply(this, [...args, ...more]); // collect more args
    };
  };
}

const add = curry((a, b, c) => a + b + c);

console.log(add(1)(2)(3));    // 6
console.log(add(1, 2)(3));    // 6
console.log(add(1, 2, 3));    // 6

// Practical use: create tax calculators
const addTax = curry((rate, price) => price * (1 + rate));
const addVAT = addTax(0.2);   // 20% VAT locked in
const addGST = addTax(0.18);  // 18% GST locked in

console.log(addVAT(100));     // 120
console.log(addGST(100));     // 118`
        }
      ]
    },
    {
      title: "Stale Closures in React",
      explanations: {
        layman: "In React, every render creates new variables. If a callback was created during an old render, it still sees the old values — like reading yesterday's newspaper.",
        mid: "Every React render creates a new closure snapshot. If an async operation (timer, API call) still references a closure from a previous render, it sees stale values — because its closure captured the old snapshot, not the current one. Missing useEffect dependencies and delayed callbacks are the most common triggers.",
        senior: "Three fixes, each with trade-offs: (1) `setCount(prev => prev + 1)` — the functional update form doesn't need to read `count` at all, so staleness is impossible. Best for state that only depends on its previous value. (2) `useRef` — store the value in `ref.current` and read it inside the callback. The ref is a mutable container that always holds the latest value, but updating it doesn't trigger a re-render, so it's best for values you need to read but don't render directly. (3) Adding the variable to the dependency array — this re-creates the effect every time the value changes, which means the cleanup runs more often and can cause performance issues if the effect is expensive (like setting up a WebSocket)."
      },
      realWorld: "Stale closures cause bugs where buttons show wrong counts, timers use outdated state, or effects skip updates.",
      whenToUse: "Use functional updates (`setCount(prev => prev + 1)`) when state updates depend on the current value inside closures. Use useRef for values that must always be current without triggering re-renders.",
      whenNotToUse: "If your callback doesn't reference any changing state, stale closures aren't a concern.",
      pitfalls: "Adding a variable to the dependency array re-creates the effect, which may cause other issues. Use functional updates when possible.",
      codeExamples: [
        {
          title: "Stale Closure Bug and Fixes",
          code: `function Counter() {
  const [count, setCount] = useState(0);

  // BUG: count is always 0 because the closure captured the first render's value
  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1); // always 0 + 1 = 1
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // FIX 1: use functional update — no need to read count
  useEffect(() => {
    const id = setInterval(() => {
      setCount(prev => prev + 1); // always uses latest value
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // FIX 2: use a ref to always get the current value
  const countRef = useRef(count);
  countRef.current = count; // keep ref in sync every render

  useEffect(() => {
    const id = setInterval(() => {
      console.log(countRef.current); // always reads the latest
    }, 1000);
    return () => clearInterval(id);
  }, []);
}`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "What is a closure in JavaScript? Can you explain it with an example?",
      answer: "A closure is a function that remembers the variables from the scope where it was created, even after that outer function has finished running. For example, a makeCounter function can return an inner function that keeps incrementing a private count variable. The key thing is closures capture references to variables, not copies — so if the outer variable changes before the closure runs, the closure sees the new value. A common pitfall is stale closures, where a callback holds onto an outdated value.",
      difficulty: "easy",
      followUps: [
        "How does the JavaScript engine implement closures internally?",
        "Can you explain the difference between a closure and a regular function?",
        "What happens to variables in the outer scope that are NOT referenced by the closure?"
      ]
    },
    {
      question: "What will this code output and why?\n\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 1000);\n}",
      answer: "It prints 3 three times. var is function-scoped, so there's only one i shared by all three callbacks. By the time the timeouts fire, the loop has finished and i is 3. You can fix it with let (which creates a new i per iteration), an IIFE wrapper, or by passing i as the third argument to setTimeout.",
      difficulty: "easy",
      followUps: [
        "How would you fix this using at least three different approaches?",
        "Why does let fix this problem at the specification level?",
        "What if we used const instead of let?"
      ]
    },
    {
      question: "How do closures relate to memory management and garbage collection?",
      answer: "Closures keep their captured variables alive in memory as long as the closure itself is reachable. If you attach a closure to an event listener or timer and never remove it, those variables can't be garbage collected. Modern engines like V8 only capture variables the closure actually references, but using eval inside a closure forces the engine to keep everything. Use DevTools heap snapshots to find closures that are holding onto memory unexpectedly.",
      difficulty: "mid",
      followUps: [
        "How does eval() affect closure optimization?",
        "How would you debug a memory leak caused by a closure?",
        "What Chrome DevTools features help inspect closure scopes?"
      ]
    },
    {
      question: "Implement a function once(fn) that ensures fn is only called once. Subsequent calls return the first result.",
      answer: "Use a closure to store a `called` flag and the cached result:\n```js\nfunction once(fn) {\n  let called = false;\n  let result;\n  return function(...args) {\n    if (!called) {\n      called = true;\n      result = fn(...args);\n    }\n    return result;\n  };\n}\n```\nThe closure remembers `called` and `result` across calls. After the first call, subsequent calls skip `fn` and return the cached value.",
      difficulty: "mid",
      followUps: [
        "How would you modify this to allow resetting?",
        "What happens if fn throws an error on the first call?",
        "How would you make this work with async functions?"
      ]
    },
    {
      question: "Explain the module pattern and how closures enable data privacy.",
      answer: "The module pattern uses an IIFE that returns an object with methods. The variables inside the IIFE are private because they live in the closure — only the returned methods can access them. It's like a class with private fields, but achieved through closures. This was the main way to do data privacy before ES modules and private class fields (#) existed.",
      difficulty: "mid",
      followUps: [
        "How does the module pattern compare to ES modules?",
        "What are the drawbacks of the module pattern?",
        "How do private class fields (#) work compared to closure-based privacy?"
      ]
    },
    {
      question: "What is a stale closure? Give an example in React hooks context.",
      answer: "A stale closure happens when a callback captures a variable from an old render and keeps using that outdated value. For example, a setInterval inside useEffect with an empty dependency array captures count as 0 and never sees updates. Fix it with functional updates (setCount(prev => prev + 1)), useRef to always read the latest value, or by adding the variable to the dependency array.",
      difficulty: "hard",
      followUps: [
        "Why did the React team choose the closure-based snapshot model?",
        "How does useRef help solve stale closure problems?",
        "What's the relationship between stale closures and React Concurrent Mode?"
      ]
    },
    {
      question: "What's the difference between these two approaches?\n\n// Approach A\nfunction createFunctions() {\n  var funcs = [];\n  for (var i = 0; i < 5; i++) {\n    funcs.push(function() { return i; });\n  }\n  return funcs;\n}\n\n// Approach B\nfunction createFunctions() {\n  var funcs = [];\n  for (var i = 0; i < 5; i++) {\n    funcs.push((function(j) { return function() { return j; }; })(i));\n  }\n  return funcs;\n}",
      answer: "The modern fix is simple: use `let` instead of `var` in the loop — `let` creates a fresh binding per iteration, so each closure captures its own `i`. Approach A: every function returns 5 because they all share the same var i, which is 5 after the loop ends. Approach B: each function returns its own number (0-4) because the IIFE creates a separate copy of i (as j) for each iteration. Approach B uses more memory since it creates 5 extra scopes, but gives correct results.",
      difficulty: "mid",
      followUps: [
        "What is the memory cost difference between these two approaches?",
        "How does this pattern relate to the concept of partial application?",
        "Can you solve this without IIFE using modern JavaScript?"
      ]
    },
    {
      question: "Explain how closures work at the V8 engine level. What are Context objects?",
      answer: "When V8 compiles a function, it checks which outer variables the function references. Those variables get moved from the stack into a heap-allocated Context object. The inner function holds a pointer to this Context. Variables that aren't referenced by any inner function stay on the stack and get cleaned up normally. This is why eval forces the engine to keep all variables — it can't predict what eval will access.",
      difficulty: "hard",
      followUps: [
        "How does TurboFan optimize closures through inlining?",
        "What's the difference between stack-allocated and context-allocated variables?",
        "How can you observe closure scopes in Chrome DevTools?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Implement a Private Counter with Reset",
      difficulty: "easy",
      description: "Create a counter using closures where the count variable is private. It should support increment, decrement, getCount, and reset. The reset should return to the starting value.",
      solution: `function makeCounter(start = 0) {
  let count = start;

  return {
    increment() {
      return ++count;
    },
    decrement() {
      return --count;
    },
    getCount() {
      return count;
    },
    reset() {
      count = start; // 'start' is also captured by the closure
      return count;
    }
  };
}

const counter = makeCounter(10);
console.log(counter.increment()); // 11
console.log(counter.increment()); // 12
console.log(counter.decrement()); // 11
console.log(counter.getCount());  // 11
console.log(counter.reset());     // 10
console.log(counter.count);       // undefined — count is private`,
      explanation: "The closure keeps 'count' and 'start' private. Outside code can only interact through the returned methods. Direct access like counter.count returns undefined because count lives inside the closure, not on the returned object."
    },
    {
      title: "Create a Function Rate Limiter",
      difficulty: "mid",
      description: "Build a rate limiter that only allows a function to be called a certain number of times per second. Extra calls within the window are ignored and return undefined.",
      solution: `function rateLimit(fn, limit) {
  const times = []; // tracks timestamps of recent calls

  return function(...args) {
    const now = Date.now();

    // remove timestamps older than 1 second
    while (times.length > 0 && times[0] <= now - 1000) {
      times.shift();
    }

    if (times.length < limit) {
      times.push(now);
      return fn.apply(this, args);
    }

    return undefined; // over the limit, skip this call
  };
}

const limitedLog = rateLimit(console.log, 3);

limitedLog("call 1"); // works
limitedLog("call 2"); // works
limitedLog("call 3"); // works
limitedLog("call 4"); // ignored — 3 calls already in this second`,
      explanation: "The closure holds the timestamps array. Each call cleans out old timestamps, then checks if there's room for another call within the limit. This sliding window approach is simple and works well for most use cases. Note: `times.shift()` is O(n) per call because it shifts all elements. For high-frequency rate limiting, a circular buffer or token bucket would be more efficient."
    },
    {
      title: "Implement Function Composition with Closures",
      difficulty: "mid",
      description: "Create a compose function that takes multiple functions and returns a new function that runs them right-to-left. compose(f, g, h)(x) should equal f(g(h(x))).",
      solution: `function compose(...fns) {
  if (fns.length === 0) return (x) => x; // identity function
  if (fns.length === 1) return fns[0];

  return function(...args) {
    // start with the rightmost function (it can take multiple args)
    let result = fns[fns.length - 1].apply(this, args);

    // pipe the result through the rest from right to left
    for (let i = fns.length - 2; i >= 0; i--) {
      result = fns[i].call(this, result);
    }

    return result;
  };
}

const add10 = (x) => x + 10;
const double = (x) => x * 2;
const minus5 = (x) => x - 5;

const transform = compose(minus5, double, add10);

console.log(transform(5)); // minus5(double(add10(5))) = minus5(double(15)) = minus5(30) = 25

const processUser = compose(
  JSON.stringify,
  (u) => ({ ...u, full: u.first + ' ' + u.last }),
  (u) => ({ ...u, first: u.first.trim(), last: u.last.trim() })
);

console.log(processUser({ first: "  Jo ", last: " Doe  " }));`,
      explanation: "The closure captures the array of functions. When called, it runs them right-to-left, passing each result to the next function. This is a fundamental pattern in functional programming."
    },
    {
      title: "Build a Memoize Function with Cache Limit",
      difficulty: "hard",
      description: "Create a memoize function that caches results but has a maximum cache size. When the cache is full, remove the least recently used entry (LRU). Include clear() and size() helpers.",
      solution: `function memoize(fn, maxSize = 100) {
  const cache = new Map(); // Map keeps insertion order

  function memoized(...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      const val = cache.get(key);
      cache.delete(key);
      cache.set(key, val); // move to end (most recently used)
      return val;
    }

    const result = fn.apply(this, args);

    if (cache.size >= maxSize) {
      const oldest = cache.keys().next().value;
      cache.delete(oldest); // evict least recently used
    }

    cache.set(key, result);
    return result;
  }

  memoized.cache = cache;
  memoized.clear = () => cache.clear();
  memoized.size = () => cache.size;

  return memoized;
}

const fib = memoize(function(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}, 50);

console.log(fib(100));
console.log(fib.size());

const calc = memoize((x, y) => {
  console.log('computing...');
  return x * y;
}, 3);

calc(4, 5); // computes
calc(2, 3); // computes
calc(6, 7); // computes
calc(8, 9); // computes, evicts (4,5)
calc(4, 5); // computes again — it was evicted`,
      explanation: "The closure holds a Map as the cache. Map preserves insertion order, which makes LRU eviction simple: the first key is always the oldest. On cache hit, we delete and re-insert to move the entry to the end. This keeps the cache bounded while prioritizing frequently used results."
    },
    {
      title: "Implement Partial Application",
      difficulty: "mid",
      description: "Create a partial function that pre-fills some arguments of a function. Support a special placeholder symbol (partial._) that lets you skip arguments and fill them later.",
      solution: `function partial(fn, ...preset) {
  return function(...later) {
    const args = [];
    let j = 0;

    // replace placeholders with values from 'later'
    for (let i = 0; i < preset.length; i++) {
      if (preset[i] === partial._) {
        args.push(later[j++]);
      } else {
        args.push(preset[i]);
      }
    }

    // append any remaining arguments
    while (j < later.length) {
      args.push(later[j++]);
    }

    return fn.apply(this, args);
  };
}

partial._ = Symbol('placeholder');

function greet(greeting, title, name) {
  return greeting + ', ' + title + ' ' + name + '!';
}

const greetMr = partial(greet, partial._, 'Mr.'); // skip greeting, lock in 'Mr.'
console.log(greetMr('Hello', 'Smith'));    // "Hello, Mr. Smith!"
console.log(greetMr('Good day', 'Jones')); // "Good day, Mr. Jones!"

const sayHi = partial(greet, 'Hello'); // lock in 'Hello'
console.log(sayHi('Ms.', 'Davis'));    // "Hello, Ms. Davis!"

const multiply = (a, b) => a * b;
const double = partial(multiply, 2);
const triple = partial(multiply, 3);

console.log(double(5)); // 10
console.log(triple(5)); // 15

const halve = partial(multiply, partial._, 0.5);
console.log(halve(10)); // 5`,
      explanation: "The closure captures the preset arguments and the placeholder positions. When the returned function is called, it fills in placeholders with the new arguments and appends any extras. This lets you lock in some arguments while leaving others flexible."
    }
  ],
  quiz: [
    {
      question: "What will this code output?\n\nfunction outer() {\n  let x = 10;\n  function inner() {\n    console.log(x);\n  }\n  x = 20;\n  return inner;\n}\nouter()();",
      options: ["10", "20", "undefined", "ReferenceError"],
      correct: 1,
      explanation: "Closures capture references, not values. When inner() runs, x has already been changed to 20."
    },
    {
      question: "Which of the following is NOT a common use case for closures?",
      options: [
        "Data privacy / encapsulation",
        "Memoization and caching",
        "Changing the prototype chain of an object",
        "Creating factory functions"
      ],
      correct: 2,
      explanation: "Prototype chain changes have nothing to do with closures. The other three are classic closure use cases."
    },
    {
      question: "What will this output?\n\nfor (let i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}\nfor (var j = 0; j < 3; j++) {\n  setTimeout(() => console.log(j), 0);\n}",
      options: [
        "0, 1, 2, 0, 1, 2",
        "0, 1, 2, 3, 3, 3",
        "3, 3, 3, 3, 3, 3",
        "0, 1, 2 then 3, 3, 3 (but all after the loops finish)"
      ],
      correct: 3,
      explanation: "All six timeouts run after both loops finish. `let` gives each iteration its own separate `i` (0, 1, 2) — the engine creates a fresh copy of the variable for each loop cycle. `var` shares one `j` across all iterations, which is 3 when the loop ends. So the output is 0, 1, 2 (from the `let` loop) then 3, 3, 3 (from the `var` loop), and all of them print after both loops complete."
    },
    {
      question: "In V8, what happens to outer variables that are NOT referenced by an inner function?",
      options: [
        "They are always retained in the closure scope",
        "They can be garbage collected since V8 only captures referenced variables",
        "They are moved to the global scope",
        "They cause a memory leak"
      ],
      correct: 1,
      explanation: "V8 analyzes which variables the inner function actually uses and only keeps those. Unreferenced variables stay on the stack and get cleaned up normally."
    },
    {
      question: "What will this code output?\n\nfunction createFn() {\n  let a = 1;\n  function fn() {\n    console.log(a);\n  }\n  a = 2;\n  function fn2() {\n    let a = 3;\n    fn();\n  }\n  return fn2;\n}\ncreateFn()();",
      options: ["1", "2", "3", "undefined"],
      correct: 1,
      explanation: "`fn` closes over the variable `a` in `createFn`'s scope. By the time `fn()` runs, `a` has been updated to 2. The local `a = 3` inside `fn2` is a separate binding — `fn` can't see it because `fn` was defined outside `fn2`."
    },
    {
      question: "Which statement about closures and eval() is correct?",
      options: [
        "eval() has no effect on closure optimization",
        "eval() forces the engine to retain the entire enclosing scope in the closure",
        "eval() prevents closures from being created",
        "eval() makes closures faster by pre-compiling the scope"
      ],
      correct: 1,
      explanation: "The engine can't know what variables eval() might access, so it has to keep everything in the enclosing scope alive. This defeats the normal optimization of only capturing referenced variables."
    }
  ]
};
