export const promises = {
  id: "promises",
  title: "Promises & Async/Await",
  icon: "🤝",
  tag: "JavaScript Core",
  tagColor: "var(--tag-js)",
  subtitle: "Master asynchronous JavaScript from callbacks to modern async patterns.",
  concepts: [
    {
      title: "Promise States & Lifecycle",
      explanations: {
        layman: "A promise is like ordering food. First it's 'pending' (cooking). Then it either gets 'fulfilled' (food arrives) or 'rejected' (order cancelled). Once decided, it never changes.",
        mid: "A promise settles once and stays that way. Handlers attached via .then/.catch always run asynchronously as microtasks, even if the promise already settled.",
        senior: "A common bug is a 'floating promise' — you call an async function but never await it or attach .then/.catch, so if it rejects, nobody handles the error. ESLint's `no-floating-promises` rule catches this at build time. Every .then chain should end with a .catch, and every async function call should either be awaited inside try/catch or have a .catch attached. In Node.js, unhandled rejections crash the process by default (since v15); in browsers, they log a warning but your code continues with missing data."
      },
      realWorld: "A common production bug: an API call returns a rejected promise but there's no .catch handler. In Node.js, this can crash the process. In browsers, it shows a console warning but the error is silently swallowed.",
      whenToUse: "When you need to coordinate async operations that depend on each other.",
      whenNotToUse: "When simple synchronous code would be clearer.",
      pitfalls: "Forgetting to return inside a .then creates a broken chain where the next .then gets undefined.",
      codeExamples: [
        {
          title: "Promise Lifecycle Demonstration",
          code: `const p = new Promise((resolve, reject) => {
  console.log('1: runs right away');

  resolve('done');
  console.log('2: still runs after resolve!');

  reject('error'); // ignored -- already resolved
});

console.log('3: after Promise created');

p.then(value => {
  console.log('4: got:', value);
});

console.log('5: after .then added');

// Output order: 1, 2, 3, 5, 4
// .then callback waits for current code to finish

const done = Promise.resolve(42);
done.then(v => console.log(v)); // 42
done.then(v => console.log(v)); // 42 -- same value, both run`
        }
      ]
    },
    {
      title: "Promise Chaining: .then(), .catch(), .finally()",
      explanations: {
        layman: "Chaining is like an assembly line. Each .then does one step and passes the result forward. If something breaks, .catch handles it. .finally always runs at the end, like cleanup.",
        mid: "Each .then returns a new promise. Returning a value passes it forward; throwing an error skips to the nearest .catch. A .catch that returns a value resumes the happy path.",
        senior: "Design promise chains to be linear and readable — avoid nesting .then inside .then (that's callback hell with promises). When you need conditional logic in a chain, extract branches into named functions. Each .then should return a value or another promise — if you forget the return, the chain gets `undefined` instead of your result, and any inner promise runs without error handling (a 'floating promise' — nobody is watching it, so failures are silent)."
      },
      realWorld: "Fetch API calls naturally chain: get response, parse JSON, then use data. Breaking this chain causes silent failures.",
      whenToUse: "When each async step needs the result of the previous one.",
      whenNotToUse: "For simple one-off async calls, async/await is usually more readable.",
      pitfalls: "Forgetting return inside .then is the #1 chaining bug. The next .then gets undefined instead of your value.",
      codeExamples: [
        {
          title: "Chaining Patterns and Gotchas",
          code: `// Good chain: each step returns something
fetch('/api/user/1')
  .then(res => {
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json(); // returns a promise
  })
  .then(user => {
    console.log(user.name);
    return fetch('/api/posts?userId=' + user.id);
  })
  .then(res => res.json())
  .then(posts => console.log('Posts:', posts.length))
  .catch(err => console.error('Failed:', err.message))
  .finally(() => console.log('Done'));

// Bug: missing return! val + 1 is computed but not returned
Promise.resolve(1)
  .then(val => {
    val + 1; // no return -- next .then gets undefined
  })
  .then(val => console.log(val)); // undefined

// .catch can recover the chain
Promise.reject('error')
  .catch(err => {
    console.log('Caught:', err);
    return 'fixed'; // chain continues with 'fixed'
  })
  .then(val => console.log('Got:', val)); // 'Got: fixed'

// .then's error handler only catches errors BEFORE it, not IN it
Promise.resolve('data')
  .then(
    val => { throw new Error('oops'); }, // throws here
    err => console.log('missed') // won't catch the throw above
  );

// .catch after .then catches errors FROM .then
Promise.resolve('data')
  .then(val => { throw new Error('oops'); })
  .catch(err => console.log('Caught:', err.message)); // 'Caught: oops'`
        }
      ]
    },
    {
      title: "Promise Combinators: all, race, any, allSettled",
      explanations: {
        layman: "Think of ordering from multiple restaurants. 'all' waits for every order. 'race' takes whichever arrives first. 'any' takes the first successful one. 'allSettled' waits for all and tells you which succeeded or failed.",
        mid: "Pick the combinator based on what you need: all fails fast on any rejection, race settles on the first result (success or failure), any ignores failures unless all fail, allSettled never rejects.",
        senior: "Pair `race` with a timeout promise for deadlines: `Promise.race([fetch(url), timeoutPromise(5000)])`. Use `allSettled` when partial failure is acceptable — e.g., a dashboard where some widgets can fail without blocking others. Important trade-off: losing promises in `race`/`any` still run to completion in the background — JavaScript has no built-in promise cancellation. If you need to actually stop the work, use `AbortController` with fetch or build your own cancellation token."
      },
      realWorld: "Dashboard loading uses Promise.all to fetch user, posts, and settings in parallel. If any fails, the whole load fails fast.",
      whenToUse: "When you have multiple independent async tasks to coordinate.",
      whenNotToUse: "When tasks must run one after another in sequence.",
      pitfalls: "Promise.race with an empty array stays pending forever. Also, 'losing' promises in race still execute -- they just get ignored.",
      codeExamples: [
        {
          title: "All Four Combinators in Practice",
          code: `// all: fetch everything, fail if any one fails
async function loadDashboard() {
  try {
    const [user, posts, notes] = await Promise.all([
      fetch('/api/user').then(r => r.json()),
      fetch('/api/posts').then(r => r.json()),
      fetch('/api/notes').then(r => r.json())
    ]);
    return { user, posts, notes };
  } catch (err) {
    console.error('Failed:', err);
  }
}

// race: first to settle wins (used for timeouts)
function fetchWithTimeout(url, ms) {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), ms)
    )
  ]);
}

// any: first success wins, only fails if ALL fail
async function loadImage(urls) {
  try {
    const first = await Promise.any(
      urls.map(url => fetch(url).then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.blob();
      }))
    );
    return URL.createObjectURL(first);
  } catch (err) {
    console.error('All failed:', err.errors);
  }
}

// allSettled: wait for all, get status of each
async function notifyUsers(users) {
  const results = await Promise.allSettled(
    users.map(u =>
      fetch('/api/notify', {
        method: 'POST',
        body: JSON.stringify({ userId: u.id })
      })
    )
  );

  const ok = results.filter(r => r.status === 'fulfilled');
  const bad = results.filter(r => r.status === 'rejected');
  console.log(ok.length + ' sent, ' + bad.length + ' failed');
}`
        }
      ]
    },
    {
      title: "async/await Internals",
      explanations: {
        layman: "await pauses your function at that point, like pausing a TV show. But everything else keeps running — JavaScript isn't frozen, it's just your function that's on pause. When the promise finishes, your function picks up right where it left off.",
        mid: "An async function always returns a promise. When it hits 'await', it pauses that function and lets other code run. When the awaited promise settles, the function resumes from where it stopped.",
        senior: "Under the hood, `await` pauses only that function and schedules its resumption after the awaited promise settles. The rest of your code keeps running. When the promise resolves, the function resumes — this happens before any setTimeout callbacks, because promise callbacks (.then/await continuations) go into the microtask queue, which runs before the next timer or I/O event. One debugging gotcha: stack traces can lose context across await boundaries because the function was suspended and resumed. V8 works around this with 'zero-cost async stack traces' (enabled by default in Chrome DevTools and Node.js)."
      },
      realWorld: "Almost all modern API calls use async/await. Understanding the internals helps debug mysterious ordering bugs.",
      whenToUse: "For any async code that needs to be readable and sequential-looking.",
      whenNotToUse: "When you want parallel execution -- use Promise.all instead of sequential awaits.",
      pitfalls: "Using await inside forEach doesn't wait for all iterations to complete — forEach ignores the returned promises, so all iterations start their async work simultaneously. Use `for...of` with await for sequential execution, or `Promise.all` with `.map` for parallel.",
      codeExamples: [
        {
          title: "async/await Patterns and Pitfalls",
          code: `// Basic: try/catch works naturally with await
async function getUser(id) {
  try {
    const res = await fetch('/api/users/' + id);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (err) {
    console.error('Failed:', err.message);
    throw err;
  }
}

// Bad: sequential awaits when they could be parallel
async function slow() {
  const a = await fetch('/api/a'); // waits for a...
  const b = await fetch('/api/b'); // then starts b
  return [await a.json(), await b.json()];
}

// Good: parallel with Promise.all
async function fast() {
  const [a, b] = await Promise.all([
    fetch('/api/a').then(r => r.json()),
    fetch('/api/b').then(r => r.json())
  ]);
  return [a, b];
}

// Bug: forEach ignores the returned promises
async function broken(urls) {
  urls.forEach(async (url) => {
    const data = await fetch(url); // these run, but nobody waits
  });
  console.log('Done'); // prints before fetches finish!
}

// Fix: use for...of for sequential async loops
async function sequential(urls) {
  for (const url of urls) {
    const res = await fetch(url);
    console.log(await res.json());
  }
  console.log('Done'); // prints after all fetches
}

// IIFE to use await at top level
(async () => {
  const data = await getUser(1);
  console.log(data);
})();`
        }
      ]
    },
    {
      title: "Error Handling Patterns & Anti-Patterns",
      explanations: {
        layman: "Errors in async code are like a package that gets lost — in modern Node.js, the runtime warns you (or even crashes), but in browsers, unhandled rejections just show a console warning and your code continues silently with missing data.",
        mid: "Use try/catch with await, or .catch at the end of chains. Use .finally for cleanup like hiding spinners. Always re-throw if you only want to log, not swallow the error.",
        senior: "Split your error handling into retryable errors (network timeouts, 503s) and fatal errors (404s, auth failures) — retry the first kind, fail fast on the second. When you catch and re-throw, preserve the original error with the `cause` option: `throw new Error('Save failed', { cause: originalErr })` — this chains errors so you can trace back to the root cause in logs. Use `window.addEventListener('unhandledrejection', ...)` as a safety net to catch any promise rejection you missed, but don't rely on it as your primary error strategy."
      },
      realWorld: "A missing .catch on a fetch call can silently fail, leaving users staring at a loading spinner forever.",
      whenToUse: "Every async operation needs an error strategy -- even if it's just logging and re-throwing.",
      whenNotToUse: "Don't wrap every single line in try/catch. Catch at meaningful boundaries where you can actually handle or recover.",
      pitfalls: "Catching an error and not re-throwing it silently swallows the failure. Callers will think everything worked.",
      codeExamples: [
        {
          title: "Error Handling Best Practices",
          code: `// Return null on failure (swallows the error intentionally)
async function getData(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (err) {
    console.error('Failed:', err.message);
    return null;
  }
}

// Retry with exponential backoff
async function fetchRetry(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (err) {
      const wait = Math.pow(2, i) * 1000;
      console.log('Try ' + (i + 1) + ' failed, wait ' + wait + 'ms');
      if (i === tries - 1) throw err; // last try, give up
      await new Promise(r => setTimeout(r, wait));
    }
  }
}

// Go-style error handling: returns [error, data]
async function safe(promise) {
  try {
    return [null, await promise];
  } catch (err) {
    return [err, null];
  }
}

async function main() {
  const [err, user] = await safe(getData('/api/user'));
  if (err) {
    console.error('Failed:', err);
    return;
  }
  console.log('User:', user);
}

// Safety net: catches any promise rejection you missed
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled:', event.reason);
  event.preventDefault();
});`
        }
      ]
    },
    {
      title: "Promise Anti-Patterns & Microtask Timing",
      explanations: {
        layman: "Anti-patterns are common mistakes that look right but cause bugs. The biggest one: wrapping a promise inside `new Promise()` — this is the 'Promise constructor anti-pattern.' If you already have a promise, just return it directly.",
        mid: "The biggest anti-patterns: wrapping a promise in new Promise (unnecessary), nesting .then instead of chaining, and missing returns. Microtasks (.then) run before macrotasks (setTimeout), which can make log order surprising.",
        senior: "Fix anti-patterns with flat chains, explicit returns, and a single .catch at the end of each chain. For microtask timing: `.then` callbacks don't run immediately — they wait until the current synchronous code finishes. If a `.then` callback returns another promise (like `return Promise.resolve('B')`), the engine needs an extra turn to unwrap it before the next `.then` runs. That's why in interleaved chains, `return Promise.resolve(x)` is one tick slower than `return x`. This rarely matters in app code, but it's a common interview question."
      },
      realWorld: "Nested .then callbacks are a code smell that hides bugs and makes error handling nearly impossible.",
      whenToUse: "Learn these patterns to recognize and fix bad async code during code reviews.",
      whenNotToUse: "Don't over-optimize microtask timing unless you're building a framework or have a proven performance issue.",
      pitfalls: "The constructor anti-pattern (wrapping a promise in new Promise) hides errors and adds unnecessary complexity.",
      codeExamples: [
        {
          title: "Anti-Patterns and Corrections",
          code: `// Anti-pattern: wrapping a promise in new Promise (pointless!)
function getUser(id) {
  return new Promise((resolve, reject) => {
    fetch('/api/users/' + id)
      .then(res => res.json())
      .then(resolve)
      .catch(reject);
  });
}
// Fix: just return the promise chain directly
function getUser(id) {
  return fetch('/api/users/' + id).then(res => res.json());
}

// Anti-pattern: nested .then (callback hell with promises)
getUser().then(user => {
  getPosts(user.id).then(posts => {
    getComments(posts[0].id).then(comments => {
      console.log(comments);
    });
  });
});
// Fix: flat chain
getUser()
  .then(user => getPosts(user.id))
  .then(posts => getComments(posts[0].id))
  .then(comments => console.log(comments));
// Even better: async/await
async function loadData() {
  const user = await getUser();
  const posts = await getPosts(user.id);
  const comments = await getComments(posts[0].id);
  console.log(comments);
}

// Anti-pattern: missing return and no error handling
fetch('/api/data').then(res => {
  if (res.ok) {
    res.json().then(data => process(data)); // no return!
  }
  // no error handling for !res.ok
});
// Fix: return the inner promise, handle errors
fetch('/api/data').then(res => {
  if (res.ok) {
    return res.json().then(data => process(data));
  }
  throw new Error('Not OK');
});

// Microtask timing: both chains run interleaved
Promise.resolve()
  .then(() => {
    console.log('A');
    return Promise.resolve('B'); // extra tick for unwrapping
  })
  .then(val => console.log(val));

Promise.resolve()
  .then(() => console.log('C'))
  .then(() => console.log('D'));
// Output: A, C, D, B (B is delayed by the extra unwrap tick)`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "What are the three states of a Promise? Can a Promise change state more than once?",
      answer: "Pending, fulfilled, and rejected. A promise can only change state once -- from pending to either fulfilled or rejected. After that, it's locked. If you call resolve() twice, the second call is silently ignored. Same if you call resolve() then reject() -- the reject is ignored because it already settled.",
      difficulty: "easy",
      followUps: [
        "What happens if you call resolve() twice?",
        "Can you observe when a Promise transitions states?",
        "What's the difference between 'settled' and 'resolved'?"
      ]
    },
    {
      question: "What's the difference between Promise.all, Promise.race, Promise.any, and Promise.allSettled?",
      answer: "Promise.all waits for everything and fails if any one fails. Promise.race returns whichever settles first (success or failure). Promise.any returns the first success and only fails if all fail. Promise.allSettled waits for everything and gives you the status of each, never rejects. Use all for 'need everything', race for timeouts, any for fallbacks, allSettled for partial results.",
      difficulty: "mid",
      followUps: [
        "How would you implement a timeout using Promise.race?",
        "How would you use Promise.allSettled to show partial results when some API calls fail?",
        "Which combinator would you use for a 'best of N' approach?"
      ]
    },
    {
      question: "Explain the difference between 'return' and 'return await' inside an async function's try/catch.",
      answer: "With 'return promise', the promise is passed through -- if it rejects, the catch block in THIS function won't catch it. With 'return await promise', the await unwraps the promise inside the try block, so a rejection IS caught by catch. Use 'return await' inside try/catch when you need to handle errors locally.",
      difficulty: "hard",
      followUps: [
        "Does 'return await' add an extra microtask tick?",
        "Why does ESLint have a no-return-await rule?",
        "How does this affect stack traces?"
      ]
    },
    {
      question: "What is the Promise constructor anti-pattern?",
      answer: "It's wrapping an existing promise inside new Promise() for no reason. Like: new Promise((resolve, reject) => fetch(url).then(resolve).catch(reject)). This is pointless because fetch already returns a promise. Just return fetch(url) directly. The anti-pattern also hides errors -- if you forget the .catch(reject), rejections are swallowed silently.",
      difficulty: "mid",
      followUps: [
        "What happens if you forget .catch(reject) inside the constructor — where does the error go?",
        "What errors can this anti-pattern cause?",
        "How do you promisify a callback-based function?"
      ]
    },
    {
      question: "How does async/await work under the hood?",
      answer: "An async function returns a promise. When it hits await, it pauses the function and saves its state. The rest of the function becomes a .then callback on the awaited promise. When the promise settles, the function resumes as a microtask. Under the hood, it's equivalent to chaining .then calls, but with cleaner syntax and proper try/catch support.",
      difficulty: "hard",
      followUps: [
        "How is async/await different from generators with Promise?",
        "What optimizations does V8 apply to async/await?",
        "Can you implement async/await using generators?"
      ]
    },
    {
      question: "What will this code output?\n\nconsole.log('start');\nconst p1 = new Promise(resolve => {\n  console.log('executor');\n  resolve('value');\n});\np1.then(v => console.log(v));\nconsole.log('end');",
      answer: "Output: 'start', 'executor', 'end', 'value'. The executor runs synchronously during Promise construction, so 'start' and 'executor' print right away. Then 'end' prints because the current code finishes first. The .then callback runs as a microtask after the current code completes, so 'value' prints last.",
      difficulty: "easy",
      followUps: [
        "What if we added another.then after the console.log('end')?",
        "What if the executor was async?",
        "What if resolve was called inside setTimeout?"
      ]
    },
    {
      question: "How do you handle errors in Promise.all when you need partial results?",
      answer: "Use Promise.allSettled -- it waits for all promises and returns an array of {status, value/reason} objects, never rejects. Alternatively, wrap each promise in a .catch that returns a fallback value, so Promise.all gets a mix of real results and fallbacks. Choose allSettled when you need to know which ones failed.",
      difficulty: "mid",
      followUps: [
        "What are the performance implications of these approaches?",
        "How does error handling differ with Promise.any?",
        "What if you need to cancel remaining promises on first failure?"
      ]
    },
    {
      question: "Why doesn't await work inside forEach? How do you fix it?",
      answer: "forEach calls your callback but ignores the returned promise. It doesn't wait for it, so all iterations fire at once and forEach returns before any await finishes. Fix: use for...of for sequential execution, or Promise.all with .map for parallel execution. Both properly wait for all async work to complete.",
      difficulty: "mid",
      followUps: [
        "Does the same problem apply to map, filter, and reduce?",
        "How would you implement an async reduce?",
        "What about for await...of with async iterables?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Implement Promise.all from Scratch",
      difficulty: "mid",
      description: "Write your own version of Promise.all. It should take an iterable of promises (or values), run them in parallel, and resolve with an array of results in the same order. If any promise rejects, reject immediately with that error.",
      solution: `function promiseAll(items) {
  return new Promise((resolve, reject) => {
    const list = Array.from(items);

    // Empty input resolves immediately
    if (list.length === 0) {
      resolve([]);
      return;
    }

    const results = new Array(list.length);
    let done = 0;

    list.forEach((item, i) => {
      // Wrap in Promise.resolve to handle non-promise values
      Promise.resolve(item)
        .then(value => {
          results[i] = value; // keep original order
          done++;
          if (done === list.length) {
            resolve(results);
          }
        })
        .catch(reject); // first rejection wins
    });
  });
}

// Test: all succeed
promiseAll([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3)
]).then(console.log); // [1, 2, 3]

// Test: mix of promises and plain values
promiseAll([
  Promise.resolve(1),
  42,
  'hello'
]).then(console.log); // [1, 42, 'hello']

// Test: empty array
promiseAll([]).then(console.log); // []

// Test: one rejects
promiseAll([
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
]).catch(console.error); // 'error'

// Test: results keep original order regardless of timing
promiseAll([
  new Promise(r => setTimeout(() => r('slow'), 100)),
  new Promise(r => setTimeout(() => r('fast'), 10))
]).then(console.log); // ['slow', 'fast']`,
      explanation: "Handle the empty case first, then track results by index to preserve order. Count completions instead of checking the array, because array slots could be undefined as valid values. The first .catch(reject) to fire wins since a promise can only settle once."
    },
    {
      title: "Implement a Promisified Sleep and Retry Utility",
      difficulty: "easy",
      description: "Build a sleep function that returns a promise resolving after N milliseconds, and a retry function that calls an async function up to N times with exponential backoff between attempts.",
      solution: `function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retry(fn, maxTries = 3, delay = 1000, multiply = 2) {
  let lastErr;

  for (let i = 1; i <= maxTries; i++) {
    try {
      return await fn(i);
    } catch (err) {
      lastErr = err;
      console.log('Try ' + i + '/' + maxTries + ' failed: ' + err.message);

      if (i < maxTries) {
        const wait = delay * Math.pow(multiply, i - 1);
        console.log('Waiting ' + wait + 'ms...');
        await sleep(wait);
      }
    }
  }

  throw new Error(
    'All ' + maxTries + ' tries failed: ' + lastErr.message
  );
}

// Simulate an API that fails the first 2 times
let calls = 0;

async function flakyAPI() {
  calls++;
  if (calls < 3) {
    throw new Error('Server error (try ' + calls + ')');
  }
  return { data: 'got it on try ' + calls };
}

async function main() {
  try {
    const result = await retry(flakyAPI, 5, 500);
    console.log('Result:', result);
  } catch (err) {
    console.error('Gave up:', err.message);
  }
}

main();`,
      explanation: "Sleep wraps setTimeout in a promise. Retry loops up to maxTries, catching errors and waiting longer each time (exponential backoff). On the last failed attempt, it throws instead of waiting."
    },
    {
      title: "Implement Promise.race and Promise.any",
      difficulty: "mid",
      description: "Write your own Promise.race (first to settle wins, success or failure) and Promise.any (first success wins, only rejects if all fail with an AggregateError).",
      solution: `function promiseRace(items) {
  return new Promise((resolve, reject) => {
    const list = Array.from(items);
    // First to settle wins -- resolve or reject
    list.forEach(item => {
      Promise.resolve(item).then(resolve, reject);
    });
  });
}

function promiseAny(items) {
  return new Promise((resolve, reject) => {
    const list = Array.from(items);

    if (list.length === 0) {
      reject(new AggregateError([], 'All promises were rejected'));
      return;
    }

    const errors = new Array(list.length);
    let failCount = 0;

    list.forEach((item, i) => {
      Promise.resolve(item).then(
        resolve, // first success wins
        (err) => {
          errors[i] = err; // collect failures in order
          failCount++;
          if (failCount === list.length) {
            reject(new AggregateError(errors, 'All promises were rejected'));
          }
        }
      );
    });
  });
}

// race: fastest wins
promiseRace([
  new Promise(r => setTimeout(() => r('slow'), 200)),
  new Promise(r => setTimeout(() => r('fast'), 50))
]).then(console.log); // 'fast'

// race: rejection can win too
promiseRace([
  new Promise((_, r) => setTimeout(() => r('fail'), 50)),
  new Promise(r => setTimeout(() => r('ok'), 200))
]).catch(console.error); // 'fail'

// any: first success wins, failures ignored
promiseAny([
  Promise.reject('e1'),
  new Promise(r => setTimeout(() => r('success'), 100)),
  Promise.reject('e2')
]).then(console.log); // 'success'

// any: all fail = AggregateError
promiseAny([
  Promise.reject('e1'),
  Promise.reject('e2'),
  Promise.reject('e3')
]).catch(err => {
  console.log(err instanceof AggregateError); // true
  console.log(err.errors); // ['e1', 'e2', 'e3']
});`,
      explanation: "Race is simple: pass both resolve and reject to each promise, first one to fire wins. Any is the opposite of all: it collects failures and only rejects when every single promise has failed, using AggregateError to bundle all the errors."
    },
    {
      title: "Build a Promise-Based Task Queue with Concurrency Limit",
      difficulty: "hard",
      description: "Build a task queue that runs async functions with a maximum concurrency limit. Adding a task returns a promise that resolves when that task completes. New tasks wait in the queue until a slot opens up.",
      solution: `class TaskQueue {
  constructor(limit = 3) {
    this.limit = limit;
    this.running = 0;
    this.queue = [];
  }

  add(taskFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn: taskFn, resolve, reject });
      this._run();
    });
  }

  async _run() {
    // Start tasks while we have capacity and queued work
    while (this.running < this.limit && this.queue.length > 0) {
      const task = this.queue.shift();
      this.running++;

      task.fn()
        .then(task.resolve)
        .catch(task.reject)
        .finally(() => {
          this.running--;
          this._run(); // check for more work
        });
    }
  }

  get pending() { return this.queue.length; }
  get active() { return this.running; }
}

function makeTask(id, ms) {
  return () => new Promise(resolve => {
    console.log('Task ' + id + ' started');
    setTimeout(() => {
      console.log('Task ' + id + ' done');
      resolve('Result ' + id);
    }, ms);
  });
}

// Only 2 tasks run at a time
const q = new TaskQueue(2);

async function main() {
  const results = await Promise.all([
    q.add(makeTask(1, 300)),
    q.add(makeTask(2, 200)),
    q.add(makeTask(3, 100)),
    q.add(makeTask(4, 150)),
    q.add(makeTask(5, 50))
  ]);
  console.log('All done:', results);
}

main();`,
      explanation: "Each add() stores the task function along with its resolve/reject in the queue. The _run method starts tasks up to the concurrency limit. When a task finishes, it resolves the caller's promise and triggers _run again to pick up the next queued task."
    },
    {
      title: "Implement Promisify Utility",
      difficulty: "mid",
      description: "Write a promisify function that converts a Node-style callback function (err, result) into a function that returns a promise. Also build promisifyAll to convert all methods on an object.",
      solution: `// Convert callback-style fn(args..., callback) to fn(args...) => Promise
function promisify(fn) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      fn.call(this, ...args, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };
}

// Handle callbacks with multiple results: cb(err, a, b, c)
function promisifyMulti(fn) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      fn.call(this, ...args, (err, ...results) => {
        if (err) reject(err);
        else if (results.length <= 1) resolve(results[0]);
        else resolve(results);
      });
    });
  };
}

// Convert all methods on an object, adding 'Async' suffix
function promisifyAll(obj) {
  const result = {};
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'function') {
      result[key + 'Async'] = promisify(obj[key].bind(obj));
    }
  }
  return result;
}

// Example: old-style callback function
function readFile(path, callback) {
  setTimeout(() => {
    if (path === '/error') {
      callback(new Error('File not found'));
    } else {
      callback(null, 'Content of ' + path);
    }
  }, 100);
}

const readFileAsync = promisify(readFile);

async function main() {
  try {
    const text = await readFileAsync('/hello.txt');
    console.log(text); // 'Content of /hello.txt'

    await readFileAsync('/error'); // throws
  } catch (err) {
    console.error(err.message); // 'File not found'
  }
}

main();

// promisifyAll example
const oldAPI = {
  readFile,
  writeFile(path, data, cb) {
    setTimeout(() => cb(null, 'Written'), 50);
  }
};
const newAPI = promisifyAll(oldAPI);
newAPI.readFileAsync('/test.txt').then(console.log);`,
      explanation: "Promisify wraps the original function, appending a callback that routes to resolve or reject. It uses fn.call(this, ...) to preserve the correct 'this' context. promisifyAll creates a new object with 'Async' versions of every method."
    }
  ],
  quiz: [
    {
      question: "What does the Promise constructor's executor function run?",
      options: [
        "Asynchronously, as a microtask",
        "Asynchronously, as a macrotask",
        "Synchronously, during Promise construction",
        "It depends on the JavaScript engine"
      ],
      correct: 2,
      explanation: "The executor runs immediately when you call new Promise(). It's synchronous. Only .then/.catch callbacks are async."
    },
    {
      question: "What happens if you call resolve() and then reject() in a Promise executor?",
      options: [
        "The Promise is both fulfilled and rejected",
        "An error is thrown",
        "The Promise is fulfilled (first call wins, reject is ignored)",
        "The Promise is rejected (reject always takes priority)"
      ],
      correct: 2,
      explanation: "First call wins. Once a promise is fulfilled by resolve(), calling reject() does nothing."
    },
    {
      question: "What's the output?\n\nPromise.resolve(1)\n  .then(x => x + 1)\n  .then(x => { throw new Error('fail'); })\n  .then(x => x + 1)\n  .catch(err => 'caught')\n  .then(x => console.log(x));",
      options: ["3", "'caught'", "Error: fail", "undefined"],
      correct: 1,
      explanation: "The error skips the third .then and lands in .catch. The .catch returns 'caught', which flows into the final .then."
    },
    {
      question: "Which Promise combinator stays pending forever when given an empty iterable?",
      options: ["Promise.all", "Promise.race", "Promise.any", "Promise.allSettled"],
      correct: 1,
      explanation: "Promise.race with no promises has nothing to settle on, so it stays pending forever. Promise.all and allSettled resolve with [], Promise.any rejects with AggregateError."
    },
    {
      question: "Why does 'await' inside forEach not work as expected?",
      options: [
        "forEach doesn't support async callbacks",
        "forEach calls the callback but ignores the returned Promise, so iterations run in parallel",
        "await is not allowed inside callback functions",
        "forEach processes items in reverse order with async callbacks"
      ],
      correct: 1,
      explanation: "forEach fires all callbacks synchronously, ignoring their returned promises. The await inside each callback works, but forEach doesn't wait for any of them — so all iterations start their async work before any individual await resolves. Use for...of for sequential execution."
    },
    {
      question: "What is the key difference between 'return promise' and 'return await promise' inside a try/catch?",
      options: [
        "There is no difference",
        "'return await' catches rejections in the catch block; 'return' does not",
        "'return' is faster",
        "'return await' creates a memory leak"
      ],
      correct: 1,
      explanation: "'return await' unwraps the promise inside try, so rejections hit the catch block. Plain 'return' passes the promise through without unwrapping, so the catch block never sees the rejection."
    }
  ]
};
