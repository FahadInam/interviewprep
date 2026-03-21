export const callStack = {
  id: "call-stack",
  title: "Call Stack",
  icon: "\uD83D\uDCDA",
  tag: "JavaScript Core",
  tagColor: "var(--tag-js)",
  subtitle: "How JavaScript tracks which function is running right now.",
  concepts: [
    {
      title: "What the Call Stack Is and How It Works",
      explanations: {
        layman: "Think of the call stack like a stack of plates. Each time a function is called, a new plate goes on top. When the function finishes, its plate is removed. JavaScript always works on the top plate.",
        mid: "Every function call creates a frame that gets pushed onto the stack. When the function returns, its frame is popped off. JavaScript is single-threaded, so only the top frame executes at any given time. This single-threaded model is why a slow function blocks everything — the browser can't paint or handle clicks until the current stack is empty.",
        senior: "Each stack frame holds the function's local variables, arguments, and `this` binding. Say you call `a()` which calls `b()` which calls `c()` and `c()` throws — the stack trace reads `c → b → a → global`, so the top line tells you where it broke and reading down tells you how you got there. This is your #1 debugging tool in production. Note: V8 dropped tail call optimization (TCO) despite ES2015 specifying it — TCO eliminates frames before they return, which made stack traces incomplete and debugging much harder."
      },
      realWorld: "When your app crashes, the browser shows a stack trace. The top line is where the error happened. Read downward to trace the chain of function calls that led there.",
      whenToUse: "Understanding the call stack matters whenever you debug errors, trace function call order, or figure out why code runs in a particular sequence.",
      whenNotToUse: "Don't manually reason about stack depth for simple, flat code. It becomes important only with recursion, nested callbacks, or debugging async flows.",
      pitfalls: "A common mistake is assuming that a setTimeout callback can run while the current function is still executing. It cannot — callbacks only run after the current stack is completely empty.",
      codeExamples: [
        {
          title: "Visualizing the Call Stack Step by Step",
          code: `function first() {
  console.log("first start");
  second();
  console.log("first end");
}

function second() {
  console.log("second start");
  third();
  console.log("second end");
}

function third() {
  console.log("third");
}

first();`
        },
        {
          title: "Reading Stack Traces from Errors",
          code: `function a() {
  b();
}

function b() {
  c();
}

function c() {
  console.log(new Error("snapshot").stack);

}

a();`
        }
      ]
    },
    {
      title: "Stack Overflow and Recursion",
      explanations: {
        layman: "Imagine stacking plates forever without ever removing one. Eventually the stack gets too tall and falls over. That is a stack overflow — a function keeps calling itself with no stopping point.",
        mid: "Every recursive function needs two things: a base case that stops the recursion, and each call must move closer to that base case. For example, `countdown(n)` that calls `countdown(n - 1)` and stops at `n === 0` works fine. But if you forget the `- 1` and always pass `n`, the stack fills up and the engine throws `RangeError: Maximum call stack size exceeded`.",
        senior: "When recursion depth depends on input size (like traversing a tree with 50,000 nodes), convert to an iterative approach with a plain array as your stack — `const stack = [root]; while (stack.length) { ... }`. The call stack typically maxes out around 10,000-15,000 frames, but a JavaScript array can hold millions of entries because it lives on the heap. The trampoline pattern is another option: instead of calling itself directly, the function returns a function, and a while loop keeps calling it — this keeps the actual call stack at depth 1. V8 dropped tail call optimization despite it being in the ES2015 spec because it hid frames from stack traces."
      },
      realWorld: "A recursive tree-walker on a deeply nested JSON structure (like a file system or comment thread) can overflow the stack if the nesting goes hundreds of levels deep.",
      whenToUse: "Think about stack overflow risk whenever you write recursive code, especially if the recursion depth depends on input size rather than a fixed small number.",
      whenNotToUse: "Stack overflow is not a concern when recursion depth is small and bounded, like traversing a known shallow data structure.",
      pitfalls: "A common mistake is writing a base case that never actually gets reached — for example, forgetting to decrement a counter or passing the same arguments each time.",
      codeExamples: [
        {
          title: "Stack Overflow and How to Fix It",
          code: `function countForever(n) {
  console.log(n);
  countForever(n + 1);
}

function countTo(n, max) {
  if (n > max) return;
  console.log(n);
  countTo(n + 1, max);
}
countTo(1, 5);

function countWithLoop(max) {
  for (let i = 1; i <= max; i++) {
    console.log(i);
  }
}
countWithLoop(5);`
        },
        {
          title: "Trampoline Pattern for Safe Deep Recursion",
          code: `function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

function trampoline(fn) {
  return function(...args) {
    let result = fn(...args);
    while (typeof result === "function") {
      result = result();
    }
    return result;
  };
}

function factStep(n, total = 1n) {
  if (n <= 1) return total;
  return () => factStep(n - 1, BigInt(n) * total);
}

const safeFact = trampoline(factStep);
console.log(safeFact(20));`
        }
      ]
    },
    {
      title: "Single-Threaded Nature and the Event Loop Connection",
      explanations: {
        layman: "JavaScript is like a restaurant with one chef. The chef handles one order at a time. New orders (like setTimeout callbacks) wait on a ticket board until the chef finishes the current order.",
        mid: "JavaScript runs on a single thread — only one piece of code runs at a time. So if you write `setTimeout(fn, 0)` and then run a heavy loop for 2 seconds, `fn` waits the full 2 seconds even though the timer says 0ms. Async callbacks (setTimeout, Promises, event handlers) sit in a queue and only execute after the current call stack is completely empty.",
        senior: "For heavy computation, choose the right offloading strategy: `setTimeout` chunks add minimum 4ms overhead per step — fine for non-urgent work. `requestAnimationFrame` runs before each paint (~16ms budget) — ideal for visual updates. `requestIdleCallback` runs during browser idle time — good for low-priority work but has no guaranteed execution window. Web Workers run on a separate thread — best for CPU-heavy tasks, but require message-passing and can't touch the DOM."
      },
      realWorld: "If you run a heavy loop that takes 2 seconds, the entire page freezes — buttons do not respond, animations stop, and even a setTimeout set to 0ms will not fire until the loop finishes.",
      whenToUse: "This matters whenever your code does heavy computation, processes large datasets, or when you notice the UI becoming unresponsive.",
      whenNotToUse: "For lightweight operations that finish in a few milliseconds, you do not need to worry about blocking the main thread.",
      pitfalls: "setTimeout(fn, 0) doesn't run immediately — it waits for the current stack to empty and all microtasks (Promises) to finish. Also, browsers clamp nested setTimeout to a minimum 4ms delay after 5 levels of nesting, which matters if you're using it for chunked loops.",
      codeExamples: [
        {
          title: "Call Stack vs Event Loop: Execution Order",
          code: `console.log("1: start");

setTimeout(() => {
  console.log("2: setTimeout");
}, 0);

Promise.resolve().then(() => {
  console.log("3: Promise 1");
}).then(() => {
  console.log("4: Promise 2");
});

console.log("5: end");`
        },
        {
          title: "Blocking the Call Stack Demonstration",
          code: `function blockFor(ms) {
  const start = Date.now();
  while (Date.now() - start < ms) {
  }
}

console.log("Start");

setTimeout(() => {
  console.log("Timeout fired");
}, 100);

console.log("Blocking for 2 seconds...");
blockFor(2000);
console.log("Done blocking");`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "Explain what the call stack is and how JavaScript uses it to manage function execution.",
      answer: "The call stack is basically JavaScript's to-do list for function calls, and it works like a stack of plates — last in, first out. When you call a function, a new frame goes on top with that function's local variables and arguments. When it returns, the frame is popped off. Since JavaScript is single-threaded, only the top frame runs at any time — if `a()` calls `b()`, `b` goes on top and `a` just waits. This is also why stack traces are so useful: each line is one frame, so you can read top-to-bottom to see exactly how you got to the error.",
      difficulty: "easy",
      followUps: [
        "What data is stored in each stack frame?",
        "How does the call stack relate to the event loop?"
      ]
    },
    {
      question: "What causes a stack overflow, and what are strategies to prevent it?",
      answer: "A stack overflow happens when the call stack runs out of space, almost always from recursion without a working base case — the engine throws a RangeError. To prevent it: first, make sure you have a base case that actually gets reached and that each recursive call moves toward it. If the recursion depth depends on input size, convert to an iterative loop with a plain array as your stack — `const stack = [root]; while (stack.length) { ... }`. Another option is the trampoline pattern, where instead of calling itself directly, the function returns a function, and a while loop keeps invoking it — this keeps the real call stack at depth 1. Common follow-up: V8 chose not to implement tail call optimization even though ES2015 specifies it, because it hides frames from stack traces and makes debugging harder.",
      difficulty: "mid",
      followUps: [
        "Why does V8 not implement tail call optimization?",
        "How does the trampoline pattern work under the hood?"
      ]
    },
    {
      question: "What is the output order and why?\n\n```js\nconsole.log('A');\nsetTimeout(() => console.log('B'), 0);\nPromise.resolve().then(() => console.log('C'));\nconsole.log('D');\n```",
      answer: "The output is A, D, C, B. First, the synchronous code runs top to bottom, so 'A' prints, then setTimeout schedules 'B' in the task queue, then the Promise schedules 'C' in the microtask queue, then 'D' prints. After the synchronous stack clears, the engine processes all microtasks before any macrotasks, so 'C' prints next. Finally, 'B' prints from the task queue. The key insight is that microtasks (Promises) always run before macrotasks (setTimeout) once the stack is empty.",
      difficulty: "mid",
      followUps: [
        "What if the Promise callback itself scheduled a setTimeout?",
        "What happens if a microtask keeps scheduling more microtasks?"
      ]
    },
    {
      question: "How do async functions interact with the call stack?",
      answer: "An async function runs normally until it hits its first `await`. At that point, the function pauses and its frame is removed from the call stack, so other code can run. When the awaited Promise resolves, the rest of the function is scheduled as a microtask — it picks up where it left off once the stack is empty again. So an async function might show up in stack traces at different times, but it never blocks the stack while waiting. The important detail is that when the function pauses, its local variables are saved off to the side in memory (the heap), not kept on the call stack. That saved state is what lets it resume later with all its variables intact.",
      difficulty: "hard",
      followUps: [
        "What is the difference between how generators and async functions save their state?",
        "Can an async function cause a stack overflow?"
      ]
    },
    {
      question: "Explain what happens at the call stack level when an error is thrown and not caught.",
      answer: "When you throw an error, the engine starts popping frames off the call stack one by one, looking for a try/catch at each level. If it finds one, execution jumps to that catch block and continues from there. If it pops every frame without finding a catch, the error is uncaught — in browsers that fires `window.onerror`, in Node it fires the `uncaughtException` event. One thing that trips people up: uncaught Promise rejections go to a different handler — `unhandledrejection` — so `window.onerror` won't catch them. The stack trace on the error object is a snapshot of every frame that was on the stack at the exact moment the throw happened, which is why it's so useful for debugging.",
      difficulty: "hard",
      followUps: [
        "Why can you not wrap setTimeout callbacks in try/catch from the outer function?",
        "How do async stack traces work in modern engines?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Implement a Call Stack Simulator",
      difficulty: "mid",
      description: "Build a CallStackSimulator class that mimics how a real call stack works. It should support push (adding a frame), pop (removing the top frame), peek (viewing the top frame), and getStackTrace (printing all frames). Include a configurable max depth that throws a RangeError when exceeded, just like a real stack overflow.",
      solution: `class CallStackSimulator {
  constructor(maxDepth = 10) {
    this.stack = [];
    this.maxDepth = maxDepth;
  }

  push(name) {
    if (this.stack.length >= this.maxDepth) {
      throw new RangeError(
        "Stack overflow at: " + name +
        "\\nStack trace:\\n" + this.getStackTrace()
      );
    }
    this.stack.push({ name, timestamp: Date.now() });
    return this.stack.length;
  }

  pop() {
    if (this.stack.length === 0) {
      throw new Error("Stack is empty");
    }
    return this.stack.pop();
  }

  peek() {
    return this.stack[this.stack.length - 1] || null;
  }

  getStackTrace() {
    return this.stack
      .slice()
      .reverse()
      .map((frame) => "    at " + frame.name)
      .join("\\n");
  }

  get depth() {
    return this.stack.length;
  }

  isEmpty() {
    return this.stack.length === 0;
  }
}

const cs = new CallStackSimulator(5);
cs.push("global()");
cs.push("main()");
cs.push("processData()");
cs.push("parseJSON()");
console.log("Depth:", cs.depth);
console.log("Current:", cs.peek().name);
console.log(cs.getStackTrace());

cs.pop();
cs.pop();
console.log("After 2 pops, depth:", cs.depth);

cs.push("a()");
cs.push("b()");
cs.push("c()");
try {
  cs.push("overflow!");
} catch (e) {
  console.log(e.message);
}`,
      explanation: "The simulator uses an array as a LIFO stack. Push adds a frame with a name and timestamp, pop removes the top frame, and peek returns it without removing. The max depth check on push mirrors how real engines throw RangeError on stack overflow. The getStackTrace method reverses the array so the most recent call appears first, matching how real stack traces are displayed."
    },
    {
      title: "Convert Recursive Function to Iterative Using Explicit Stack",
      difficulty: "hard",
      description: "Take a recursive tree-summing function and rewrite it iteratively using an explicit stack (a plain array). Both versions should produce the same result, but the iterative version avoids call stack limits and can handle very deep trees. This avoids the call stack's frame limit by using heap memory for the explicit stack array.",
      solution: `function sumTreeRecursive(node) {
  if (!node) return 0;
  return node.value + sumTreeRecursive(node.left) + sumTreeRecursive(node.right);
}

function sumTreeIterative(root) {
  if (!root) return 0;
  const stack = [root];
  let total = 0;

  while (stack.length > 0) {
    const node = stack.pop();
    total += node.value;

    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);
  }

  return total;
}

const tree = {
  value: 1,
  left: {
    value: 2,
    left: { value: 4, left: null, right: null },
    right: { value: 5, left: null, right: null }
  },
  right: {
    value: 3,
    left: null,
    right: { value: 6, left: null, right: null }
  }
};

console.log(sumTreeRecursive(tree));
console.log(sumTreeIterative(tree));

function makeDeepTree(depth) {
  if (depth === 0) return { value: 1, left: null, right: null };
  return { value: 1, left: makeDeepTree(depth - 1), right: null };
}`,
      explanation: "The iterative version replaces the implicit call stack with a plain array. Instead of recursing into children, it pushes them onto the array and processes them in a while loop. This gives the same depth-first traversal order but without growing the call stack. The key benefit is that a JavaScript array can hold millions of entries, while the call stack typically limits you to around 10,000-15,000 frames."
    }
  ],
  quiz: [
    {
      question: "What data structure does the call stack use?",
      options: [
        "FIFO (First In, First Out) queue",
        "LIFO (Last In, First Out) stack",
        "Priority queue",
        "Double-ended queue (deque)"
      ],
      correct: 1,
      explanation: "The call stack is a LIFO structure — the last function pushed onto the stack is the first one to finish and get popped off. This is why the most recently called function always runs first before returning control to the function that called it."
    },
    {
      question: "What happens when the call stack exceeds its maximum size?",
      options: [
        "The engine silently truncates old frames",
        "A RangeError is thrown",
        "The program is terminated immediately without an error",
        "The engine switches to heap-based execution"
      ],
      correct: 1,
      explanation: "When the stack exceeds its limit, the JavaScript engine throws a RangeError with a message like 'Maximum call stack size exceeded.' The engine does not silently drop frames or switch execution modes — it stops and reports the error."
    },
    {
      question: "When does the event loop move a callback from the task queue to the call stack?",
      options: [
        "Immediately when the callback is ready",
        "After a minimum delay of 4ms",
        "Only when the call stack is empty",
        "At the next animation frame"
      ],
      correct: 2,
      explanation: "The event loop only moves a queued callback onto the call stack when the stack is completely empty. Even if a setTimeout is set to 0ms, its callback waits until all synchronous code finishes AND all microtasks (like Promise callbacks) are processed first."
    },
    {
      question: "Why can you NOT catch errors from setTimeout callbacks with a surrounding try/catch?",
      options: [
        "setTimeout callbacks do not throw errors",
        "The try/catch and the callback run on different call stacks",
        "Errors in setTimeout are automatically suppressed",
        "try/catch does not work with callback functions"
      ],
      correct: 1,
      explanation: "By the time the setTimeout callback runs, the original function with the try/catch has already finished and its frame has been popped off the stack. The callback runs on a completely fresh call stack, so the try/catch from the original function is no longer there to catch anything. There's only one call stack — 'different call stack' means the original stack was emptied and the callback runs in a fresh, separate stack frame."
    }
  ]
};
