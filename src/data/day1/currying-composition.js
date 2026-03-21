export const curryingComposition = {
  id: "currying-composition",
  title: "Currying & Composition",
  icon: "🔗",
  tag: "Advanced JS",
  tagColor: "var(--tag-js)",
  subtitle: "Build powerful abstractions through partial application and function pipelines.",
  concepts: [
    {
      title: "Currying",
      explanations: {
        layman: "Imagine ordering a burger. First you pick the bun, then the patty, then the toppings -- one choice at a time. Currying works the same way: instead of giving a function all its inputs at once, you feed them one by one, and each step remembers what you already picked.",
        mid: "Currying transforms a function that takes multiple arguments into a chain of functions that each take one argument. This lets you lock in some values early and reuse that partially-configured function later without repeating yourself.",
        senior: "Currying lets you build reusable, pre-configured functions without extra wrappers. For example, `const get = curry((prop, obj) => obj[prop])` lets you write `users.map(get('name'))` instead of `users.map(u => u.name)`. Put the data argument last so partial application works naturally in chains like `pipe(filter(isActive), map(get('name')))`."
      },
      realWorld: "An API client where you curry the base URL and auth token once, then reuse it across dozens of endpoint calls without passing those values every time.",
      whenToUse: "When you find yourself passing the same first few arguments to a function over and over again.",
      whenNotToUse: "When a plain function with all arguments is already clear and you only call it in one or two places.",
      pitfalls: "Deeply nested curried calls like f(1)(2)(3)(4)(5) become hard to read fast. Also, if you change argument order during a refactor, every partial application silently breaks.",
      codeExamples: [
        {
          title: "Manual currying vs auto-curry",
          code: `function addManual(a) {
  return function(b) {
    return function(c) {
      return a + b + c;
    };
  };
}
console.log(addManual(1)(2)(3));

function curry(fn, arity = fn.length) {
  return function curried(...args) {
    if (args.length >= arity) {
      return fn(...args);
    }
    return function(...more) {
      return curried(...args, ...more);
    };
  };
}

const add = curry((a, b, c) => a + b + c);
console.log(add(1)(2)(3));
console.log(add(1, 2)(3));
console.log(add(1)(2, 3));

const add10 = add(10);
const add10and20 = add10(20);
console.log(add10and20(5));

const request = curry((method, url, data) => {
  return fetch(url, { method, body: JSON.stringify(data) });
});
const post = request('POST');
const postToUsers = post('/api/users');`
        }
      ]
    },
    {
      title: "Partial Application",
      explanations: {
        layman: "Think of a coffee order form where your name and size are already filled in. You just pick the flavor each time. Partial application pre-fills some arguments of a function so you only supply the rest later.",
        mid: "Partial application creates a new function with some arguments already locked in. Unlike currying which always takes one argument at a time, partial application lets you fix any number of arguments in one step.",
        senior: "Partial application with placeholder support lets you skip arguments and fill them in later: `partial(greet, _, '!', 'Alice')('Hey')` fills the first slot last. This gives you positional flexibility that basic currying lacks. Be careful with argument order stability -- if someone refactors the underlying function and swaps parameter positions, every partial application silently binds the wrong values with no error."
      },
      realWorld: "Event handlers in React where you partially apply an item ID so the click handler only needs the event object: onClick={handleDelete(itemId)}.",
      whenToUse: "When you repeatedly call a function with the same first few arguments, like a logger that always prefixes with a tag.",
      whenNotToUse: "When each call uses completely different arguments. Partial application adds a layer of indirection for no benefit.",
      pitfalls: "If you change the parameter order of the original function, every partially applied version breaks silently -- the wrong values get locked into the wrong slots.",
      codeExamples: [
        {
          title: "Partial application with placeholder support",
          code: `const _ = Symbol('placeholder');

function partial(fn, ...preset) {
  return function(...later) {
    const args = [];
    let laterIdx = 0;

    for (let i = 0; i < preset.length; i++) {
      if (preset[i] === _) {
        args.push(later[laterIdx++]);
      } else {
        args.push(preset[i]);
      }
    }

    while (laterIdx < later.length) {
      args.push(later[laterIdx++]);
    }

    return fn(...args);
  };
}

function greet(greeting, punctuation, name) {
  return greeting + ', ' + name + punctuation;
}

const greetHello = partial(greet, 'Hello', '!');
console.log(greetHello('Alice'));

const greetAlice = partial(greet, _, '!', 'Alice');
console.log(greetAlice('Hey'));
console.log(greetAlice('Bye'));

const log = partial(console.log, '[APP]');
log('Server started');
log('Request received');`
        }
      ]
    },
    {
      title: "Function Composition (compose & pipe)",
      explanations: {
        layman: "Think of an assembly line in a factory. Each station does one small job, and the product moves from one station to the next. Composition connects small functions the same way -- the output of one becomes the input of the next.",
        mid: "compose runs functions right-to-left, pipe runs them left-to-right. Both chain single-purpose functions together so you can build complex transformations from simple, testable pieces.",
        senior: "Keep each composed function pure and single-purpose. If you need to debug, insert a tap function (x => (console.log(x), x)) between steps. Avoid mixing side effects into the pipeline -- isolate them at the boundaries."
      },
      realWorld: "A data processing pipeline that trims user input, lowercases it, splits into words, and joins with hyphens to create a URL slug -- each step is its own function.",
      whenToUse: "When you need to apply several transformations in sequence and want each step to be testable on its own.",
      whenNotToUse: "When the transformation is a single simple operation, or when the steps have side effects that depend on each other.",
      pitfalls: "Debugging is tricky because you cannot set a breakpoint between composed steps. Also, if one function in the chain returns an unexpected type, every function after it fails with a confusing error.",
      codeExamples: [
        {
          title: "Compose, pipe, and point-free style",
          code: `function compose(...fns) {
  if (fns.length === 0) return (x) => x;
  if (fns.length === 1) return fns[0];
  return fns.reduce((a, b) => (...args) => a(b(...args)));
}

function pipe(...fns) {
  if (fns.length === 0) return (x) => x;
  if (fns.length === 1) return fns[0];
  return fns.reduce((a, b) => (...args) => b(a(...args)));
}

const trim = s => s.trim();
const lower = s => s.toLowerCase();
const split = sep => s => s.split(sep);
const join = sep => arr => arr.join(sep);
const map = fn => arr => arr.map(fn);
const capitalize = s => s[0].toUpperCase() + s.slice(1);

const slugify = pipe(
  trim,
  lower,
  split(/\\s+/),
  join('-')
);

console.log(slugify('  Hello World Example  '));

const titleCase = pipe(
  trim,
  lower,
  split(/\\s+/),
  map(capitalize),
  join(' ')
);

console.log(titleCase('  hello WORLD  '));

const processUser = compose(
  JSON.stringify,
  user => ({ ...user, done: true }),
  user => ({ ...user, name: user.name.trim() })
);

console.log(processUser({ name: '  Alice  ', age: 30 }));`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "What is currying and how does it differ from partial application?",
      answer: "Currying converts a function with multiple arguments into a series of functions that each take exactly one argument: add(1, 2, 3) becomes add(1)(2)(3). Partial application is different -- it fixes some arguments upfront and returns a function that takes the rest, but not necessarily one at a time. For example, bind is partial application: add.bind(null, 1) gives you a function that still takes two arguments. A practical risk is argument order -- if you curry a function and later swap parameter positions, every partially applied usage silently gets the wrong values.",
      difficulty: "mid",
      followUps: [
        "Can you implement an auto-curry function?",
        "How does fn.length affect auto-curry implementations?",
        "What's the connection to lambda calculus?"
      ]
    },
    {
      question: "Implement a compose function that works right-to-left and explain why direction matters.",
      answer: "compose takes an array of functions and reduces them so the last function runs first and its output feeds into the second-to-last, and so on: compose(f, g, h)(x) equals f(g(h(x))). Direction matters because it determines readability -- compose reads like math (innermost first), while pipe reads like English (first step first). Under the hood, compose uses reduceRight or reverses the reduce order. If any function in the chain returns an unexpected type, every subsequent function breaks, so each step should have a clear input/output contract.",
      difficulty: "mid",
      followUps: [
        "What is point-free style and when does it hurt readability?",
        "How would you add error handling to a composition pipeline?",
        "What are transducers and how do they relate to composition?"
      ]
    },
    {
      question: "How would you implement curry to handle functions with default parameters or rest parameters?",
      answer: "The core challenge is that fn.length only counts parameters before the first default or rest parameter. So (a, b = 1, ...rest) => {} has length 1, not 3. To handle this, you accept an explicit arity argument: curry(fn, 4) tells the curry utility how many arguments to collect before calling fn. For rest parameters, you can never truly know when the caller is 'done' providing arguments, so you either require an explicit arity or provide a .value() method to force execution. TypeScript typing for this is also hard -- you need recursive conditional types to peel off one parameter at a time.",
      difficulty: "hard",
      followUps: [
        "What is fn.length and what affects it?",
        "How would you type a curry function in TypeScript?",
        "Does V8 optimize curried functions differently than regular ones?"
      ]
    },
    {
      question: "What is point-free style and what are its tradeoffs?",
      answer: "Point-free style means defining functions without mentioning their arguments. Instead of const process = (x) => toUpper(trim(x)), you write const process = compose(toUpper, trim). The benefit is conciseness and focus on the transformation pipeline rather than the data. The downside is debugging -- you cannot set breakpoints on intermediate values, and stack traces become harder to read. It also hurts readability when the composed chain is long or when function names are not self-descriptive. Use it for short, well-named pipelines; switch to explicit arguments when the chain gets complex.",
      difficulty: "mid",
      followUps: [
        "When does point-free style hurt readability?",
        "How does the pipeline operator proposal relate to point-free style?",
        "Give an example where pointed style is clearly better?"
      ]
    },
    {
      question: "How do Redux middleware like thunk use currying/composition?",
      answer: "Redux middleware uses a triple-nested curried function: store => next => action => {}. The outer function receives the store API (dispatch, getState), the middle one receives the next middleware's dispatch, and the inner one receives the actual action. applyMiddleware composes these together using compose(...chain)(store.dispatch) so each middleware wraps the next. This curried shape lets Redux configure each layer separately during setup. Thunk specifically checks if the action is a function -- if so, it calls it with dispatch and getState instead of passing it to the next middleware.",
      difficulty: "hard",
      followUps: [
        "How does applyMiddleware compose the middleware chain?",
        "Why not use a single function with all three parameters?",
        "How would you write custom Redux middleware?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Implement auto-curry with placeholder support",
      difficulty: "hard",
      description: "Write a curry function that converts any multi-argument function into a curried version. It should support a special placeholder symbol that lets you skip arguments and fill them in later. For example, curry(add3)(_, 2, 3)(1) should work the same as curry(add3)(1, 2, 3).",
      solution: `const _ = Symbol.for('curry.placeholder');

function curry(fn, arity = fn.length) {
  return function curried(...args) {
    const real = args.filter(a => a !== _);

    if (real.length >= arity && !args.includes(_)) {
      return fn(...args);
    }

    return function(...more) {
      const merged = [];
      let moreIdx = 0;

      for (let i = 0; i < args.length; i++) {
        if (args[i] === _ && moreIdx < more.length) {
          merged.push(more[moreIdx++]);
        } else {
          merged.push(args[i]);
        }
      }

      while (moreIdx < more.length) {
        merged.push(more[moreIdx++]);
      }

      return curried(...merged);
    };
  };
}

const add3 = curry((a, b, c) => a + b + c);

console.log(add3(1)(2)(3));
console.log(add3(1, 2, 3));
console.log(add3(1, 2)(3));
console.log(add3(_, 2, 3)(1));
console.log(add3(_, _, 3)(1)(2));
console.log(add3(_, 2)(_, 3)(1));

const multiply = curry((a, b, c, d) => a * b * c * d);
const double = multiply(2);
const doubleAndTriple = double(3);
console.log(doubleAndTriple(4, 5));`,
      explanation: "The curried function checks two things: do we have enough real (non-placeholder) arguments, and are there any placeholders left? If both conditions are met, it calls the original function. Otherwise, it returns a new function that merges incoming arguments into the placeholder slots. This lets you fill in arguments in any order across multiple calls."
    },
    {
      title: "Implement pipe with async function support",
      difficulty: "mid",
      description: "Build a pipe function that chains functions left-to-right, but also handles async functions. If any function in the pipeline returns a Promise, the rest of the chain should wait for it to resolve before continuing.",
      solution: `function asyncPipe(...fns) {
  return function(input) {
    return fns.reduce((result, fn) => {
      if (result instanceof Promise) {
        return result.then(val => fn(val));
      }
      return fn(result);
    }, input);
  };
}

function asyncPipeSimple(...fns) {
  return async function(input) {
    let result = input;
    for (const fn of fns) {
      result = await fn(result);
    }
    return result;
  };
}

const double = x => x * 2;
const addOneAsync = x => Promise.resolve(x + 1);
const square = x => x * x;
const delayedString = x => new Promise(resolve =>
  setTimeout(() => resolve(String(x)), 100)
);

const transform = asyncPipe(
  double,
  addOneAsync,
  square,
  delayedString
);

transform(5).then(result => {
  console.log(result);
  console.log(typeof result);
});

const syncTransform = asyncPipe(double, square, double);
console.log(asyncPipeSimple(double, square, double)(3));`,
      explanation: "The key insight is checking whether the accumulated result is a Promise. If it is, we chain the next function with .then(). If not, we call it directly. This means the pipeline stays synchronous until it hits the first async function, then becomes async for the rest. The simpler version just uses async/await and always returns a Promise, which is easier to reason about but adds overhead for purely synchronous pipelines."
    },
    {
      title: "Implement memoized curry",
      difficulty: "hard",
      description: "Build a curry function that also memoizes results. If the same sequence of arguments has been seen before, it should return the cached result instead of recomputing. Include a way to clear the cache.",
      solution: `function memoizedCurry(fn, arity = fn.length) {
  const cache = new Map();

  function makeKey(args) {
    return args.map(a =>
      typeof a === 'object' && a !== null
        ? JSON.stringify(a)
        : String(a) + ':' + typeof a
    ).join('|');
  }

  function curried(...args) {
    const key = makeKey(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    if (args.length >= arity) {
      const result = fn(...args);
      cache.set(key, result);
      return result;
    }

    const partial = (...more) => curried(...args, ...more);
    cache.set(key, partial);
    return partial;
  }

  curried.clearCache = () => cache.clear();
  return curried;
}

const add = memoizedCurry((a, b, c) => {
  console.log('Computing:', a, b, c);
  return a + b + c;
});

const add1 = add(1);
const add1Again = add(1);
console.log(add1 === add1Again);

const add1and2 = add1(2);
const add1and2Again = add(1)(2);
console.log(add1and2 === add1and2Again);

console.log(add(1)(2)(3));
console.log(add(1)(2)(3));

console.log(add(2)(3)(4));

add.clearCache();`,
      explanation: "Each call generates a cache key from its arguments. If the key exists, the cached value is returned -- this works for both final results and intermediate curried functions. The tricky part is the key generation: we include the type alongside the value (so the number 1 and the string '1' produce different keys), and objects are serialized with JSON.stringify. The clearCache method prevents memory leaks in long-running apps."
    }
  ],
  quiz: [
    {
      question: "What does ((a, b = 1, ...rest) => {}).length return?",
      options: ["1", "2", "3", "0"],
      correct: 0,
      explanation: "fn.length only counts parameters before the first one with a default value or a rest parameter. Here, 'a' is the only parameter before 'b = 1', so the length is 1. This is why auto-curry functions often need an explicit arity argument."
    },
    {
      question: "What is the output of: const f = compose(x => x + 1, x => x * 2); f(3);",
      options: ["7", "8", "6", "9"],
      correct: 0,
      explanation: "compose runs right-to-left. First x * 2 runs with 3, giving 6. Then x + 1 runs with 6, giving 7. If this were pipe (left-to-right), the answer would be 8: first 3 + 1 = 4, then 4 * 2 = 8."
    },
    {
      question: "Which is true about Function.prototype.bind?",
      options: [
        "It implements currying",
        "It implements partial application",
        "It returns a deep copy of the function",
        "It modifies the original function"
      ],
      correct: 1,
      explanation: "bind fixes some arguments and returns a new function that takes the remaining ones. That is exactly what partial application does. It is not currying because currying specifically transforms into a chain of single-argument functions, while bind can fix any number of arguments at once."
    },
    {
      question: "What is the main danger of the point-free style: const process = compose(map(toUpper), filter(isActive), sortBy(name))?",
      options: [
        "It runs slower than the equivalent imperative code",
        "It creates intermediate arrays for each step",
        "It's impossible to debug or add breakpoints to intermediate values",
        "It doesn't work with async data"
      ],
      correct: 2,
      explanation: "With point-free composition, there is no variable holding the intermediate value between steps. That means you cannot set a breakpoint to inspect what filter returned before map runs. You would need to insert a tap function like x => (console.log(x), x) between steps to see intermediate results."
    }
  ]
};
