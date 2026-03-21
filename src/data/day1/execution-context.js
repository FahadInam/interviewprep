export const executionContext = {
  id: "execution-context",
  title: "Execution Context",
  icon: "\u2699\uFE0F",
  tag: "JavaScript Core",
  tagColor: "var(--tag-js)",
  subtitle: "How JavaScript sets up and runs your code behind the scenes.",
  concepts: [
    {
      title: "Execution Context & Its Phases",
      explanations: {
        layman: "Think of it like a chef reading the whole recipe first (creation phase), then cooking step by step (execution phase). JavaScript scans your code to note all the variable names and functions, then goes back to the top and runs everything line by line.",
        mid: "During the creation phase, the engine registers function declarations (fully hoisted), var declarations (set to undefined), and let/const declarations (left uninitialized in the TDZ). During the execution phase, assignments and function calls happen line by line.",
        senior: "JavaScript first registers all names (phase 1), then runs code (phase 2). This is exactly why `function greet()` works above its declaration but `const greet = () => {}` crashes — functions are fully ready after phase 1, but const is not assigned until phase 2 reaches that line. In interviews, if someone asks 'why does hoisting work differently for var vs let?' — the answer is this two-phase setup. Each function call gets its own separate set of variables (called an Environment Record), which is also why two calls to the same function don't share local variables."
      },
      realWorld: "You refactor a file and move a function declaration below the code that calls it. Everything still works because function declarations are fully hoisted. But when a teammate converts it to a const arrow function, the app crashes on startup because const is not hoisted the same way.",
      whenToUse: "Reach for this concept when you need to explain why code can use a function before its declaration, or why a variable logs undefined instead of its assigned value.",
      whenNotToUse: "Not worth explaining when code runs top-to-bottom with no hoisting surprises or scope confusion.",
      pitfalls: "Assuming a variable has its value as soon as the file loads. var declarations exist but are undefined until the assignment line runs. let and const declarations throw a ReferenceError if accessed before their declaration line.",
      codeExamples: [
        {
          title: "Creation Phase vs Execution Phase in Action",
          code: `console.log(greet);
console.log(name);

var name = "Alice";
let age = 30;

function greet() {
  return "Hello, " + name;
}

console.log(greet());
console.log(age);`
        },
        {
          title: "What the Engine Does During Creation Phase",
          code: `function demo() {
  console.log(a);
  console.log(b);
  var a = 1;
  let b = 2;
}`
        }
      ]
    },
    {
      title: "Global Execution Context vs Function Execution Context",
      explanations: {
        layman: "The global context is like the main room of your house -- it exists the whole time you are home. Every time you call a function, you walk into a new room. That room has its own stuff, and when the function finishes, you walk back out and the room is cleaned up.",
        mid: "The global execution context is created once when your script starts and stays alive until the page closes. Every function call creates a fresh execution context with its own variable storage and its own this value. Even calling the same function twice produces two separate contexts. The global context's `this` is `window` in browsers. Each function context gets its own `this` based on how the function is called.",
        senior: "Here's the key difference: when you write `var x = 5` at the top level, it actually becomes `window.x = 5` — because global var is stored directly on the window object. But `let y = 10` at the top level does NOT go on window — it's stored separately. Inside functions, everything (var, let, const) is stored privately — nothing leaks to window. This is why global `var` causes surprising bugs when two scripts use the same variable name — they're writing to the same window property. Using modules or wrapping code in functions avoids this entirely."
      },
      realWorld: "A global var counter is accidentally shared between two unrelated features because both scripts run in the same global context. Wrapping each feature in a function (or using modules) gives each one its own execution context and prevents the collision.",
      whenToUse: "When debugging why a variable is unexpectedly visible everywhere (global context pollution), or why each function call starts with fresh local variables.",
      whenNotToUse: "Not worth bringing up when code is already organized into modules and there is no confusion about scope boundaries.",
      pitfalls: "Forgetting that every function call creates a brand-new context. If you rely on a local variable from a previous call, it will not be there -- each call starts fresh.",
      codeExamples: [
        {
          title: "Global vs Function Execution Context",
          code: `var globalVar = "I'm on window";
let globalLet = "I'm NOT on window";

function outer() {
  var outerVar = "outer scope";

  function inner() {
    var innerVar = "inner scope";
    console.log(outerVar);
    console.log(globalVar);
  }

  inner();
}

outer();`
        },
        {
          title: "Global Context: var vs let vs const",
          code: `var a = 1;
let b = 2;
const c = 3;

console.log(window.a);
console.log(window.b);
console.log(window.c);

var a = 10;`
        }
      ]
    },
    {
      title: "Variable Environment & Lexical Environment",
      explanations: {
        layman: "Think of it like a stack of transparent overlays. Each block adds a new overlay on top. Variables on the new overlay can shadow ones below, but the original overlays stay intact underneath.",
        mid: "The Variable Environment holds var and function bindings and stays the same for the entire function. The Lexical Environment starts out pointing to the same record, but every time you enter a block (if, for, etc.), a new Lexical Environment is created for that block's let/const bindings. That is why let inside a loop gets a fresh copy each iteration.",
        senior: "Think of it this way: `var` lives at the function level — no matter how deep inside `if` or `for` blocks you write it, it belongs to the whole function. But `let` and `const` get a fresh box every time you enter a new block. This is why the classic loop bug exists: `var i` is shared across all iterations (one box), but `let i` gets a brand new copy for each iteration (separate boxes). When a closure captures `i`, it grabs whatever box it can see — with `var` that's the one shared box (final value), with `let` it's that iteration's private box (correct value). This is the #1 thing interviewers test about block scoping."
      },
      realWorld: "A for loop with var shares one binding across all iterations, so click handlers all see the final value. Switching to let gives each iteration its own Lexical Environment, and the handlers capture the correct value.",
      whenToUse: "Pull this out when explaining why let inside a loop behaves differently from var, or when tracing how a closure captures a block-scoped variable.",
      whenNotToUse: "Overkill for simple code that does not mix var and let, and has no closures inside blocks.",
      pitfalls: "Thinking that var inside a block is scoped to that block. It is not. var always belongs to the nearest function or global scope, regardless of curly braces.",
      codeExamples: [
        {
          title: "Block Scope Creates New Lexical Environment",
          code: `function demo() {
  var x = 1;
  let y = 2;

  if (true) {
    var x2 = 10;
    let y2 = 20;

    console.log(x);
    console.log(y);
  }

  console.log(x2);
}

demo();`
        },
        {
          title: "The Classic Loop Problem Explained",
          code: `var funcsVar = [];
for (var i = 0; i < 3; i++) {
  funcsVar.push(function() { return i; });
}
console.log(funcsVar[0]());
console.log(funcsVar[1]());
console.log(funcsVar[2]());

var funcsLet = [];
for (let j = 0; j < 3; j++) {
  funcsLet.push(function() { return j; });
}
console.log(funcsLet[0]());
console.log(funcsLet[1]());
console.log(funcsLet[2]());`
        }
      ]
    },
    {
      title: "The this Binding in Execution Contexts",
      explanations: {
        layman: "this is like the word 'I' in a sentence. Who 'I' refers to depends on who is speaking. In JavaScript, this depends on how a function is called, not where it is written.",
        mid: "Regular functions get their this from the call site: obj.fn() sets this to obj, a plain fn() call sets this to window (or undefined in strict mode). Arrow functions have no this of their own -- they permanently use this from the scope where they were created.",
        senior: "There's a priority order when multiple rules compete: `new` wins over everything, then `call/apply/bind`, then dot-call (`obj.fn()`), and lastly the default (window or undefined). The #1 production bug: you extract a method like `const fn = obj.greet` and call `fn()` — now `this` is no longer `obj`, it's the default. Arrow functions avoid this entirely because they lock in `this` from where they were defined — you can't change it with call/bind/new. Trade-off: arrow functions can't be constructors (`new Arrow()` throws) and don't have their own `arguments` object. In classes, using arrow methods means each instance gets its own copy of the function (uses more memory) instead of sharing one from the prototype."
      },
      realWorld: "You pass a class method as a click handler: button.addEventListener('click', this.handleClick). Inside handleClick, this is now the button element, not your class instance. Fixing it with an arrow function or .bind(this) in the constructor locks the correct this.",
      whenToUse: "Bring this up when debugging why this is undefined or points to the wrong object, especially in event handlers, callbacks, and extracted methods.",
      whenNotToUse: "No need to discuss this binding rules when all functions are arrow functions and there is no ambiguity about what this refers to.",
      pitfalls: "Using an arrow function as an object method. Arrow functions ignore the object they are attached to, so this.name will not refer to the object -- it uses `this` from the scope where the arrow function was defined.",
      codeExamples: [
        {
          title: "The Four Rules of this Binding",
          code: `const obj = {
  name: "Alice",
  greet: function() {
    return "Hello, " + this.name;
  }
};

console.log(obj.greet());

const greet = obj.greet;
console.log(greet());

console.log(greet.call({ name: "Bob" }));
console.log(greet.apply({ name: "Carol" }));

const boundGreet = greet.bind({ name: "Dave" });
console.log(boundGreet());

function Person(name) {
  this.name = name;
}
const p = new Person("Eve");
console.log(p.name);`
        },
        {
          title: "Arrow Functions and Lexical this",
          code: `const team = {
  name: "Engineering",
  members: ["Alice", "Bob", "Carol"],

  printMembers: function() {
    this.members.forEach((member) => {
      console.log(this.name + ": " + member);
    });
  },

  printMembersBroken: function() {
    this.members.forEach(function(member) {
      console.log(this.name + ": " + member);
    });
  }
};

team.printMembers();

team.printMembersBroken();`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "What is an execution context in JavaScript, and what are its main components?",
      answer: "An execution context is the environment JavaScript creates to run a piece of code. It has three main parts: the Variable Environment (stores var and function declarations), the Lexical Environment (stores let and const bindings and the scope chain), and the this binding. A new execution context is created for every function call and pushed onto the call stack. When the function finishes, its context is popped off.",
      difficulty: "mid",
      followUps: [
        "What creates a new execution context besides a function call?",
        "What happens to the execution context when a function returns?"
      ]
    },
    {
      question: "Explain the creation phase and execution phase of an execution context.",
      answer: "In the creation phase, the engine scans the code and sets up bindings: function declarations are fully hoisted (available immediately), var declarations are set to undefined, and let/const declarations are registered but left uninitialized (in the Temporal Dead Zone). The this value is also determined. In the execution phase, code runs line by line -- assignments happen, function calls are made, and expressions are evaluated. This two-step process is why you can call a function before its declaration but get undefined when reading a var before its assignment.",
      difficulty: "mid",
      followUps: [
        "What happens if a var and a function declaration share the same name in the same scope?",
        "How does strict mode affect the creation phase?"
      ]
    },
    {
      question: "What is the difference between the Global Execution Context and a Function Execution Context?",
      answer: "The Global Execution Context is created once when the script starts and lives until the page is closed. Its this points to the global object (window in browsers). Variables declared with var become properties of window. A Function Execution Context is created fresh for every function call, has its own scope for local variables, and gets its own this value based on how the function was called. Once the function returns, its context is removed from the call stack.",
      difficulty: "easy",
      followUps: [
        "What execution context does eval() create?",
        "What happens when you have both var and let declarations with the same name in the global scope?"
      ]
    },
    {
      question: "What will the following code output and why? Explain in terms of execution context.\n\n```js\nvar x = 1;\nfunction foo() {\n  console.log(x);\n  var x = 2;\n  console.log(x);\n}\nfoo();\nconsole.log(x);\n```",
      answer: "The output is: undefined, 2, 1. When foo() is called, a new execution context is created. During its creation phase, the local var x is hoisted and set to undefined -- this shadows the global x. So the first console.log(x) prints undefined (the local x exists but has not been assigned yet). Then x = 2 runs, so the second console.log(x) prints 2. After foo() returns, we are back in the global context where x is still 1 because the local x inside foo is completely separate.",
      difficulty: "mid",
      followUps: [
        "How would the output change if the inner var x was let x instead?",
        "What if we used this.x inside foo()?"
      ]
    },
    {
      question: "How does the this binding get resolved in an execution context? Explain the priority rules.",
      answer: "The this binding follows four rules in order of priority: (1) new binding -- when a function is called with new, this is the newly created object. (2) Explicit binding -- call(), apply(), or bind() set this to the provided object. (3) Implicit binding -- when called as obj.fn(), this is obj. (4) Default binding -- a plain function call sets this to the global object (or undefined in strict mode). Arrow functions are the exception: they skip all these rules and permanently use the this value from the scope where they were defined.",
      difficulty: "hard",
      followUps: [
        "What happens when you bind an already-bound function?",
        "Can you override the this binding of an arrow function with call or apply?"
      ]
    },
    {
      question: "What happens to a function's execution context after it returns, and how do closures affect this?",
      answer: "When a function returns, its execution context is popped off the call stack and normally garbage collected. However, if an inner function (closure) still references variables from that context, the Environment Record containing those variables is kept alive in memory. The execution context itself is gone, but the variable bindings survive as long as the closure exists. This is why closures can access variables from functions that have already finished running. It can also cause memory leaks if large objects are unintentionally retained by closures.",
      difficulty: "hard",
      followUps: [
        "How does V8 decide which variables to keep alive in a closure?",
        "Can you demonstrate a memory leak caused by closures and execution context retention?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Predict the Execution Context Output",
      difficulty: "mid",
      description: "Trace through the code below and predict the exact console output. For each line, identify which execution context is active, what the creation phase set up, and what value each variable holds at that moment.",
      solution: `var a = 10;
function outer() {
  console.log(a);
  var a = 20;
  function inner() {
    console.log(a);
    var a = 30;
    console.log(a);
  }
  inner();
  console.log(a);
}
outer();
console.log(a);`,
      explanation: "Output is: undefined, undefined, 30, 20, 10. Each function creates its own context. In outer(), the local var a shadows the global a and is undefined until assigned 20. In inner(), another local var a shadows outer's a and is undefined until assigned 30. After inner() finishes, outer's a is 20. After outer() finishes, the global a is still 10. Each context has its own separate copy of a. At each log, the active context is: log1 → global context, log2 → outer's context, log3 → inner's context, log4 → back to outer's context, log5 → back to global context."
    },
    {
      title: "Implement a Simple Execution Context Tracker",
      difficulty: "hard",
      description: "Build a tracker object that simulates how JavaScript manages execution contexts. It should support entering a new context (push), exiting (pop), viewing the current context, and printing a stack trace. This reinforces how the call stack works under the hood.",
      solution: `function createContextTracker() {
  const stack = [];
  let id = 0;

  return {
    enterContext(name) {
      id++;
      const ctx = {
        id: id,
        name: name,
        createdAt: Date.now(),
        variableEnvironment: {},
        thisBinding: null,
      };
      stack.push(ctx);
      console.log(
        "ENTER: " + name +
        " (depth: " + stack.length + ", id: " + id + ")"
      );
      return ctx;
    },

    exitContext() {
      const ctx = stack.pop();
      if (ctx) {
        console.log(
          "EXIT: " + ctx.name +
          " (depth: " + stack.length + ", id: " + ctx.id + ")"
        );
      }
      return ctx;
    },

    currentContext() {
      return stack[stack.length - 1] || null;
    },

    stackTrace() {
      return stack
        .map((ctx, i) => "  ".repeat(i) + ctx.name + " (id:" + ctx.id + ")")
        .join("\\n");
    },

    depth() {
      return stack.length;
    }
  };
}

const tracker = createContextTracker();
tracker.enterContext("Global");
tracker.enterContext("main()");
tracker.enterContext("helper()");
console.log("--- Stack Trace ---");
console.log(tracker.stackTrace());
tracker.exitContext();
tracker.exitContext();
tracker.exitContext();`,
      explanation: "The tracker uses a closure over an array (stack) to mimic the call stack. enterContext pushes a new context object, exitContext pops it. The stack trace shows the nesting visually with indentation. This mirrors how the JS engine creates a new execution context for each function call and removes it when the function returns."
    },
    {
      title: "this Binding Prediction Challenge",
      difficulty: "hard",
      description: "Read the code below and predict the output for each numbered console.log. For each one, identify which this binding rule applies (new, explicit, implicit, or default) and explain why.",
      solution: `const obj = {
  name: "obj",
  regularFn: function() {
    console.log("1:", this.name);

    const arrowFn = () => {
      console.log("2:", this.name);
    };
    arrowFn();

    function innerRegular() {
      console.log("3:", this === globalThis);
    }
    innerRegular();
  },

  arrowMethod: () => {
    console.log("4:", typeof this.name);
  }
};

obj.regularFn();
obj.arrowMethod();

const extracted = obj.regularFn;

function Foo() {
  this.value = 42;
}
const BoundFoo = Foo.bind({ value: 99 });
const instance = new BoundFoo();
console.log("5:", instance.value);`,
      explanation: "Line 1 prints 'obj' because regularFn is called with implicit binding (obj.regularFn()). Line 2 also prints 'obj' because the arrow function captures this from regularFn's context. Line 3 prints true because innerRegular is a plain function call with no object, so this defaults to globalThis. Line 4: The arrow method captures `this` from its surrounding scope. In a browser script, that's the global `window`, so `this.name` returns `undefined` (or an empty string if `window.name` is set). The exact output depends on the environment. Line 5 prints 42 because the new operator always creates a fresh object and overrides bind -- BoundFoo was bound to {value: 99}, but new ignores that and gives this a brand-new object."
    }
  ],
  quiz: [
    {
      question: "During the creation phase of a function execution context, how are `var` declarations initialized?",
      options: [
        "They are initialized to `undefined`",
        "They are left uninitialized (TDZ)",
        "They are initialized to `null`",
        "They are not processed until the execution phase"
      ],
      correct: 0,
      explanation: "During the creation phase, var declarations are registered and immediately set to undefined. This is why reading a var before its assignment line gives you undefined instead of throwing an error. In contrast, let and const are left uninitialized and will throw a ReferenceError if accessed before their declaration."
    },
    {
      question: "What is the key difference between the Variable Environment and the Lexical Environment when a block scope is entered?",
      options: [
        "Both are replaced with a new environment for the block",
        "Only the Variable Environment changes; Lexical Environment stays the same",
        "Only the Lexical Environment changes; Variable Environment stays the same",
        "Neither changes; block scope is handled by a separate mechanism"
      ],
      correct: 2,
      explanation: "When you enter a block (like an if or for), only the Lexical Environment gets a fresh record for that block's let and const bindings. The Variable Environment stays fixed at the function level, which is why var declarations ignore block boundaries and are visible throughout the entire function."
    },
    {
      question: "In a browser, what is true about `var x = 5` declared at the global level?",
      options: [
        "`x` is in the Declarative Environment Record only",
        "`x` becomes a property of `window` via the Object Environment Record",
        "`x` is stored in a separate global variable map",
        "`x` is placed in the Temporal Dead Zone first"
      ],
      correct: 1,
      explanation: "Global var declarations are stored in the Object Environment Record, which is backed by the global object (window in browsers). That is why var x = 5 at the top level makes window.x === 5. In contrast, let and const at the global level go into a Declarative Environment Record and do not appear on window."
    },
    {
      question: "What determines the value of `this` inside an arrow function?",
      options: [
        "The object that the arrow function is a property of",
        "The global object always",
        "The `this` value of the enclosing lexical execution context",
        "It is always `undefined`"
      ],
      correct: 2,
      explanation: "Arrow functions do not have their own this. They capture the this value from the surrounding scope at the time they are created, and that value can never be changed -- not by call(), apply(), bind(), or even attaching the arrow function to a different object."
    },
    {
      question: "What happens to a function's execution context after the function returns and there are closures referencing its variables?",
      options: [
        "The entire execution context is kept in memory",
        "The execution context is destroyed but the Environment Record (with referenced variables) is retained",
        "The execution context and all its variables are immediately garbage collected",
        "The closures get copies of the variables they reference"
      ],
      correct: 1,
      explanation: "The execution context itself (call stack entry) is removed when the function returns. However, the Environment Record -- the part that holds the actual variable bindings -- stays alive in memory because the closure still has a reference to it. This is not a copy; the closure accesses the same live bindings, which is why closures can see updated values."
    }
  ]
};
