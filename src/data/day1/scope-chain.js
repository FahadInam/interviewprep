export const scopeChain = {
  id: "scope-chain",
  title: "Scope Chain",
  icon: "\uD83D\uDD17",
  tag: "JavaScript Core",
  tagColor: "var(--tag-js)",
  subtitle: "How JavaScript finds variables by looking through nested scopes.",
  concepts: [
    {
      title: "Scope Chain and How Variable Lookup Works",
      explanations: {
        layman: "Think of it like asking for sugar. You check your kitchen first. Not there? You ask your neighbor. Still no? You ask the whole street. JavaScript does the same thing with variables — it looks in the current function first, then the one around it, then the next one out, all the way to the top.",
        mid: "When JavaScript needs a variable, it walks outward through each enclosing scope until it finds a match. This path is set by where the code is written, not where the function is called. If two scopes have the same variable name, the inner one wins.",
        senior: "The scope chain is locked in when a function is created — the function permanently remembers which scope it was born in. Where you call the function doesn't matter. Deep chains have a minor lookup cost, but V8 optimizes most lookups at compile time. During refactors, trace the full chain to catch accidental shadowing — an inner variable with the same name silently hides the outer one with no error."
      },
      realWorld: "During a refactor, someone names a local variable the same as one in an outer scope. Now the inner function silently reads the wrong value, and the bug only shows up at runtime.",
      whenToUse: "When you have nested functions and need to be sure each one reads the right variable.",
      whenNotToUse: "In a flat script with no nesting and all unique variable names, the chain is trivial and not worth overthinking.",
      pitfalls: "A common trap is thinking that where you call a function changes which variables it can see. It does not. The scope chain is locked in based on where the function was written in the source code.",
      codeExamples: [
        {
          title: "Scope Chain Lookup in Action",
          code: `const color = "red";

function outer() {
  const size = "big";

  function middle() {
    const shape = "circle";

    function inner() {
      const name = "dot";

      console.log(name);
      console.log(shape);
      console.log(size);
      console.log(color);
    }

    inner();
  }

  middle();
}

outer();`
        },
        {
          title: "Lexical (Static) vs Dynamic Scoping",
          code: `const x = "global";

function printX() {
  console.log(x);
}

function wrapper() {
  const x = "wrapper";
  printX();
}

wrapper();`
        }
      ]
    },
    {
      title: "Lexical Environment in Detail",
      explanations: {
        layman: "Every time JavaScript enters a function or a block, it creates a little notebook. That notebook lists all the variables declared there. If it cannot find a variable in the current notebook, it checks the notebook of the surrounding scope, and so on up the chain.",
        mid: "A lexical environment holds variable bindings for a given scope, with a pointer to its parent environment. This is the mechanism behind closures: when a function returns but its inner function still exists, the environment stays alive so the inner function can still read its variables. This is also why `let` in loops works — each iteration creates a new environment.",
        senior: "V8 optimizes closure scope by only keeping variables that are actually referenced — unreferenced variables can be garbage collected even if they were in the same function. However, if `eval` is present, the engine can't determine which variables are referenced, so it keeps everything alive. This is one reason `eval` causes performance issues."
      },
      realWorld: "A returned function still accesses a variable from the parent function that already finished running. The lexical environment of that parent is kept alive because the inner function holds a reference to it.",
      whenToUse: "When you need to understand why a closure can read a variable from a function that has already returned.",
      whenNotToUse: "In simple scripts with no closures or nesting, you rarely need to think about how scope environments are created and linked.",
      pitfalls: "Forgetting that the environment stays alive as long as something references it. This can cause memory leaks if a closure accidentally holds onto a large object it no longer needs.",
      codeExamples: [
        {
          title: "Environment Record Types in Practice",
          code: `var globalVar = "on window";
let globalLet = "not on window";

function demo(a, b) {

  var local = "function-scoped";
  let blockable = "also in function scope";

  if (true) {
    let blockOnly = "only here";
    const alsoBlock = "only here too";
    var leaksOut = "escapes block";
  }

  console.log(leaksOut);
}

demo(1, 2);`
        }
      ]
    },
    {
      title: "Block Scope vs Function Scope vs Global Scope",
      explanations: {
        layman: "Imagine three sizes of boxes. A block scope is a small box inside an if or loop. A function scope is a medium box wrapping the whole function. A global scope is the biggest box that holds everything. Variables declared with let or const stay in the small box, but var jumps out into the medium one.",
        mid: "let and const are confined to the nearest curly braces (block scope). var ignores blocks entirely and attaches to the enclosing function or the global scope. This is why var inside an if-block is still accessible outside it.",
        senior: "Block scope with `let`/`const` creates a fresh scope for each block, giving variables the shortest possible lifetime. `var` hoists to the function scope, widening the window where the variable is accessible. Module scope is a fourth scope type — each module gets its own scope, which is why top-level `let` in modules doesn't leak to other files. `const` vs `let` communicates intent: `const` signals 'this binding won't change,' helping both readers and the engine optimize."
      },
      realWorld: "A developer uses var inside a for-loop in an Express route handler. The variable leaks into the whole function, and under concurrent requests, the value gets overwritten before the callback fires.",
      whenToUse: "Any time you declare a variable, pick the narrowest scope that works. Use let or const by default.",
      whenNotToUse: "In modern code, `var` is almost never the right choice. If you encounter it in legacy code, understand its hoisting behavior but prefer `let`/`const` in new code.",
      pitfalls: "Using var inside a block (like an if or for) and assuming it stays there. It does not — var is scoped to the function, not the block.",
      codeExamples: [
        {
          title: "Three Types of Scope Compared",
          code: `var gVar = "global var";
let gLet = "global let";

function showScopes() {
  var fVar = "function var";
  let fLet = "function let";

  if (true) {
    var bVar = "I escape the block!";
    let bLet = "I stay in the block";
    const bConst = "Me too";

    console.log(fVar);
    console.log(fLet);
  }

  console.log(bVar);

  switch (true) {
    case true:
      let val = "defined here";
      break;
    case false:
      break;
  }
}

showScopes();
console.log(gVar);`
        },
        {
          title: "Per-Iteration Scope with let in for Loops",
          code: `const fns = [];

for (let i = 0; i < 3; i++) {
  fns.push(() => i);
}

console.log(fns[0]());
console.log(fns[1]());
console.log(fns[2]());`
        }
      ]
    },
    {
      title: "Variable Shadowing",
      explanations: {
        layman: "Say your dad's name is Bob and your friend's name is also Bob. When someone in your room says 'Bob,' they mean your friend — the closer Bob wins. That is shadowing. The inner variable with the same name hides the outer one.",
        mid: "Shadowing is sometimes intentional — like using `error` in nested try/catch blocks where each block handles its own error. But in large functions, accidentally reusing a variable name can silently hide the outer one. ESLint's `no-shadow` rule catches this automatically.",
        senior: "Shadowing is safe when intentional and obvious. The risk grows during refactors when a newly introduced name accidentally collides with an outer binding. Linting rules like no-shadow catch this early. For critical variables, use distinct names across scope layers."
      },
      realWorld: "A callback parameter is named data, same as a variable in the outer function. The callback silently uses its own data instead of the outer one, and the bug goes unnoticed until edge cases hit production.",
      whenToUse: "When you intentionally want to reuse a common name like error or result inside a nested block without affecting the outer value.",
      whenNotToUse: "When the outer variable is important to the logic. Shadowing it by accident makes debugging much harder.",
      pitfalls: "The real trap is thinking you're reading or modifying the outer variable when you've actually declared a new inner one with the same name. Changes to the inner variable don't affect the outer one, and vice versa.",
      codeExamples: [
        {
          title: "Variable Shadowing Examples",
          code: `const x = "global";

function outer() {
  const x = "outer";

  function inner() {
    const x = "inner";
    console.log(x);
  }

  inner();
  console.log(x);
}

outer();
console.log(x);

const name = "Global";
function greet(name) {
  console.log("Hello, " + name);
}
greet("Alice");

let count = 10;
if (true) {
  let count = 0;
  count++;
  console.log(count);
}
console.log(count);

var status = "global";
if (true) {
  let status = "blocked";
  console.log(status);
}
console.log(status);`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "What is the scope chain and how does JavaScript resolve variable lookups?",
      answer: "The scope chain is the path JavaScript follows to find a variable. It starts in the current function's scope. If the variable is not there, it moves to the enclosing function's scope, then the next one, all the way up to the global scope. This chain is determined by where functions are written in the code, not where they are called. If two scopes have the same variable name, the innermost one wins — that is called shadowing. A common issue is name collisions during refactors, where a new inner variable accidentally hides an outer one. In practice, you can verify this by opening the Scope panel in DevTools — it shows exactly which scope each variable belongs to.",
      difficulty: "mid",
      followUps: [
        "How does the scope chain differ from the prototype chain?",
        "Can the scope chain be modified at runtime?"
      ]
    },
    {
      question: "Explain lexical scoping vs dynamic scoping. Which does JavaScript use?",
      answer: "With lexical scoping, a function can access variables from the scope where it was written. With dynamic scoping, it would access variables from the scope where it was called. JavaScript uses lexical scoping. So if function A is defined inside function B, A always sees B's variables — no matter where A is actually called from. This matters in practice because moving a function call to a different location does not change which variables it resolves. One thing to watch: the this keyword behaves more like dynamic scoping in regular functions (because `this` is resolved at call-time for regular functions, not at definition-time — making it behave like dynamic binding), but arrow functions capture this lexically.",
      difficulty: "mid",
      followUps: [
        "Is the `this` keyword lexically or dynamically scoped?",
        "How do arrow functions change the scoping behavior of `this`?"
      ]
    },
    {
      question: "What will this code output? Explain using the scope chain.\n\n```js\nfunction createCounter() {\n  let count = 0;\n  return {\n    increment: function() { count++; },\n    getCount: function() { return count; }\n  };\n}\nconst counter = createCounter();\ncounter.increment();\ncounter.increment();\nconsole.log(counter.getCount());\n```",
      answer: "The output is 2. When createCounter runs, it creates a local variable count set to 0 and returns an object with two methods. Both increment and getCount close over the same count variable from createCounter's scope. After calling increment twice, count goes from 0 to 1 to 2. When getCount runs, it walks up the scope chain, finds count in createCounter's environment (which is still alive because the returned object references it), and returns 2. This is a closure in action — the inner functions keep the outer scope alive even after createCounter has finished executing.",
      difficulty: "mid",
      followUps: [
        "How would you create two independent counters?",
        "What if we added a decrement method later -- could it access count?"
      ]
    },
    {
      question: "What is variable shadowing and what are its pitfalls in JavaScript?",
      answer: "Variable shadowing happens when an inner scope declares a variable with the same name as one in an outer scope. The inner one hides the outer one within that scope. For example, if a function has let x = 5 and a block inside it also has let x = 10, the block uses 10 while the function outside the block still sees 5. The main pitfall is doing this by accident — you think you are updating the outer variable, but you are actually working with a separate inner one. To catch this, enable the no-shadow linting rule. In DevTools, the Scope panel will show you exactly which binding each reference points to.",
      difficulty: "easy",
      followUps: [
        "Can you shadow a const with a let in a nested block?",
        "What happens if you shadow the arguments object?"
      ]
    },
    {
      question: "How do closures work in terms of the scope chain and Lexical Environments?",
      answer: "When a function is created, it permanently remembers the scope where it was born. When that function runs later, its scope chain is built by linking its own scope to that stored outer scope. This is a closure: the function carries its birth scope with it. Even if the outer function has returned, the scope stays in memory because the inner function still points to it. This is how patterns like private variables and factory functions work. The risk is that closures can unintentionally keep large objects alive, causing memory leaks if you are not careful about what the closure captures.",
      difficulty: "hard",
      followUps: [
        "How does V8 decide which variables to keep in a closure's scope?",
        "Can closures cause memory leaks? Give an example?"
      ]
    },
    {
      question: "What is the output and why? Explain the scope chain at each step.\n\n```js\nvar a = 1;\nfunction outer() {\n  var a = 2;\n  function inner() {\n    console.log(a);\n  }\n  return inner;\n}\nvar fn = outer();\nvar a = 3;\nfn();\n```",
      answer: "The output is 2. Here is why: outer declares var a = 2 in its own scope. inner is defined inside outer, so inner's scope chain goes inner -> outer -> global. When fn() is called, inner runs and looks up a. It finds a = 2 in outer's scope and stops there. It never reaches the global a. The var a = 3 at the bottom re-declares the global a (since var a = 1 already exists globally, this just updates it to 3), but inner does not care about the global a because it found a closer match in outer. This proves JavaScript uses lexical scoping — where inner was written determines its chain, not where fn() is called.",
      difficulty: "hard",
      followUps: [
        "How would you make fn() output 3 instead?",
        "What if inner was defined with eval inside outer?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Scope Chain Resolution Simulator",
      difficulty: "mid",
      description: "Build a small simulator that models how JavaScript resolves variables through the scope chain. Create scope objects with a name, a set of variable bindings, and a reference to a parent scope. Then write a function that walks the chain to find a variable, returning where it was found and the path it took.",
      solution: `function createScope(name, variables, parent) {
  return {
    name,
    bindings: variables,
    parent,
  };
}

function resolveVariable(scope, varName) {
  const path = [];
  let current = scope;

  while (current !== null) {
    path.push(current.name);

    if (varName in current.bindings) {
      return {
        found: true,
        value: current.bindings[varName],
        foundIn: current.name,
        lookupPath: path,
      };
    }

    current = current.parent;
  }

  return {
    found: false,
    value: undefined,
    foundIn: null,
    lookupPath: path,
    error: "ReferenceError: " + varName + " is not defined",
  };
}

const globalScope = createScope("global", {
  console: "[native]",
  x: "global-x",
  y: "global-y",
}, null);

const outerScope = createScope("outer()", {
  x: "outer-x",
  z: "outer-z",
}, globalScope);

const innerScope = createScope("inner()", {
  z: "inner-z",
  w: "inner-w",
}, outerScope);

console.log(resolveVariable(innerScope, "w"));

console.log(resolveVariable(innerScope, "x"));

console.log(resolveVariable(innerScope, "y"));

console.log(resolveVariable(innerScope, "notDefined"));`,
      explanation: "The simulator mirrors real JavaScript behavior. Each scope object acts like a lexical environment with its own bindings and a link to its parent. The resolveVariable function walks up the chain just like the engine does — checking the current scope first, then moving outward. If the variable is found, it returns the value and which scope held it. If not, it returns a ReferenceError, just like JavaScript would."
    },
    {
      title: "Module Pattern Using Scope Chain",
      difficulty: "mid",
      description: "Create a user management module using an IIFE (Immediately Invoked Function Expression). The private data (users array, ID counter, helper functions) should live in the IIFE's scope and be inaccessible from outside. Only the returned public methods should be usable.",
      solution: `const UserModule = (function() {
  let users = [];
  let nextId = 1;

  function isValidEmail(email) {
    return email.includes("@") && email.includes(".");
  }

  function findIndex(id) {
    return users.findIndex(u => u.id === id);
  }

  return {
    addUser(name, email) {
      if (!isValidEmail(email)) {
        throw new Error("Invalid email: " + email);
      }
      const user = { id: nextId++, name, email, createdAt: new Date() };
      users.push(user);
      return user.id;
    },

    getUser(id) {
      const idx = findIndex(id);
      if (idx === -1) return null;
      return { ...users[idx] };
    },

    removeUser(id) {
      const idx = findIndex(id);
      if (idx === -1) return false;
      users.splice(idx, 1);
      return true;
    },

    get count() {
      return users.length;
    },

    listUsers() {
      return users.map(u => ({ ...u }));
    }
  };
})();

const id1 = UserModule.addUser("Alice", "alice@example.com");
const id2 = UserModule.addUser("Bob", "bob@example.com");
console.log(UserModule.count);
console.log(UserModule.getUser(id1));`,
      explanation: "The IIFE creates a function scope that holds users, nextId, and the helper functions. These are private — nothing outside can touch them directly. The returned object's methods (addUser, getUser, etc.) form closures over that scope, so they can still access the private data. This is the module pattern: you get encapsulation without classes, powered entirely by the scope chain."
    },
    {
      title: "Scope Chain Gotcha: Closures in Loops",
      difficulty: "hard",
      description: "Demonstrate the classic closure-in-a-loop bug where var shares a single variable across all iterations, and then show three different fixes: using let for per-iteration scope, using an IIFE to capture each value, and using Function.prototype.bind to lock in each value.",
      solution: `function broken() {
  for (var i = 0; i < 3; i++) {
    setTimeout(function() {
      console.log("broken:", i);
    }, i * 100);
  }
}
broken();

function fix1() {
  for (let i = 0; i < 3; i++) {
    setTimeout(function() {
      console.log("let:", i);
    }, i * 100);
  }
}
fix1();

function fix2() {
  for (var i = 0; i < 3; i++) {
    (function(copy) {
      setTimeout(function() {
        console.log("IIFE:", copy);
      }, copy * 100);
    })(i);
  }
}
fix2();

function fix3() {
  for (var i = 0; i < 3; i++) {
    setTimeout(function(copy) {
      console.log("bind:", copy);
    }.bind(null, i), i * 100);
  }
}
fix3();`,
      explanation: "The broken version prints 3 three times because var i is function-scoped — all three setTimeout callbacks share the same i, which is 3 by the time they run. Fix 1 uses let, which creates a fresh i for each loop iteration, so each callback captures its own copy. Fix 2 uses an IIFE to immediately pass i as a parameter, creating a new scope with its own copy. Fix 3 uses bind to lock in the current value of i as an argument. All three fixes work by giving each callback its own separate value instead of sharing one."
    }
  ],
  quiz: [
    {
      question: "What determines a function's scope chain in JavaScript?",
      options: [
        "Where the function is called (dynamic scoping)",
        "Where the function is defined in the source code (lexical scoping)",
        "The order in which functions are declared",
        "The prototype chain of the function object"
      ],
      correct: 1,
      explanation: "JavaScript uses lexical scoping. A function's scope chain is determined by where it appears in the source code, not where it is called. When the engine parses the code, it sets up the chain based on nesting. This is why a function always sees variables from its enclosing scope, regardless of how or where it gets invoked."
    },
    {
      question: "What happens when a variable is not found in any scope of the scope chain?",
      options: [
        "It returns undefined",
        "It returns null",
        "A ReferenceError is thrown",
        "The global object creates the variable automatically"
      ],
      correct: 2,
      explanation: "When JavaScript walks the entire scope chain and does not find the variable in any scope (including global), it throws a ReferenceError. This is different from a variable that exists but has no value assigned, which would be undefined. Note: in sloppy mode, assigning to an undeclared variable does create a global, but reading one that was never declared always throws."
    },
    {
      question: "In which internal slot does a function store a reference to its birth Lexical Environment?",
      options: [
        "[[Scope]]",
        "[[Environment]]",
        "[[LexicalParent]]",
        "[[OuterEnv]]"
      ],
      correct: 1,
      explanation: "Every function remembers the scope where it was created. The spec calls this storage spot [[Environment]], and it's what makes closures work — when the function runs later, it uses this stored reference to walk up the scope chain. [[Scope]] was an older name used in V8 internals. Practical tip: in Chrome DevTools, if you inspect a function and expand it, you'll see a `[[Scopes]]` property — that's the same concept, showing you the chain of scopes the function has access to."
    },
    {
      question: "What is the output?\n```js\nlet x = 1;\nfunction a() {\n  let x = 2;\n  b();\n}\nfunction b() {\n  console.log(x);\n}\na();\n```",
      options: [
        "1",
        "2",
        "undefined",
        "ReferenceError"
      ],
      correct: 0,
      explanation: "The output is 1. Function b is defined at the top level, so its scope chain goes b -> global. Even though b is called from inside a (where x is 2), that does not matter — JavaScript uses lexical scoping, not dynamic scoping. b looks up x in its own scope (not found), then in the global scope, and finds x = 1."
    },
    {
      question: "Why does `for (let i = 0; i < 3; i++)` create separate closures correctly while `for (var i = 0; i < 3; i++)` does not?",
      options: [
        "let is faster than var",
        "let creates a new Lexical Environment for each iteration",
        "var creates a copy of the variable for each iteration",
        "let variables cannot be captured by closures"
      ],
      correct: 1,
      explanation: "With let, the engine creates a brand new scope for each loop iteration. Each iteration gets its own i, so closures created inside the loop each capture a different value. With var, there is only one i for the entire function, so all closures share it and see whatever value i has when they finally run (which is 3, after the loop ends). Think of it this way: let gives each iteration its own box with its own copy of i, while var makes every iteration share a single box."
    }
  ]
};
