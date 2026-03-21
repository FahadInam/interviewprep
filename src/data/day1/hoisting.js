export const hoisting = {
  id: "hoisting",
  title: "Hoisting",
  icon: "\uD83C\uDFCB\uFE0F",
  tag: "JavaScript Core",
  tagColor: "var(--tag-js)",
  subtitle: "How JavaScript registers variable and function names before running your code.",
  concepts: [
    {
      title: "Hoisting of var, let, const, and Function Declarations",
      explanations: {
        layman: "Think of JavaScript like a teacher taking attendance before class starts. It scans your code and registers all variable names first. But not all variables are ready to use right away -- function declarations are fully ready, var starts as undefined, and let/const are registered but not usable yet — trying to access them before their declaration line throws an error.",
        mid: "Before any code executes, the engine does a creation phase. Function declarations are fully hoisted with their body. var is hoisted and initialized to undefined. let and const are hoisted but sit in the Temporal Dead Zone (TDZ) until their declaration line executes -- accessing them before that throws a ReferenceError.",
        senior: "During the creation phase, the engine registers every declaration — but treats them differently. Function declarations are fully set up and callable immediately. `var` is set to `undefined` right away, so reading it early gives you `undefined` instead of an error. `let`, `const`, and `class` are registered but locked — you get a ReferenceError if you touch them before their declaration line runs (that's the TDZ). This distinction matters in module refactors: switching from `var` to `let` can surface hidden ordering dependencies that `var` was silently papering over with `undefined`."
      },
      realWorld: "Switching a var to let during a refactor can break code that relied on reading the variable before its declaration line.",
      whenToUse: "When debugging why a variable is undefined or throwing errors before its declaration.",
      whenNotToUse: "When the variable is declared and used right next to each other -- hoisting is not a factor.",
      pitfalls: "Declaring a var and a function with the same name causes confusing overwrites. The function wins during setup, but the var assignment overwrites it at runtime.",
      codeExamples: [
        {
          title: "How Each Declaration Type Gets Hoisted",
          code: `// var is hoisted and initialized to undefined
console.log(a); // undefined
var a = "hello";
console.log(a); // "hello"

// let is hoisted but locked in TDZ
// Uncomment the next line to see a ReferenceError:
// console.log(b); // ReferenceError: Cannot access 'b' before initialization
let b = "hello";
console.log(b); // "hello"

// const behaves like let -- TDZ until declaration
const c = "hello";

// Function declarations are fully hoisted -- callable before their line
console.log(greet("World")); // "Hello, World!"
function greet(name) {
  return "Hello, " + name + "!";
}

// Function expressions are NOT hoisted as functions
var greetExpr = function(name) {
  return "Hi, " + name;
};

// Arrow functions behave like any other variable assignment
const greetArrow = (name) => "Hey, " + name;

// Classes are hoisted but stay in TDZ
class Person {
  constructor(name) { this.name = name; }
}`
        },
        {
          title: "Function Declaration vs var: Same Name",
          code: `// During creation phase, function foo is hoisted with its body
// var foo is also hoisted but doesn't overwrite the function yet
console.log(typeof foo); // "function"

// Now at runtime, this assignment overwrites foo
var foo = "I'm a string";

function foo() {
  return "I'm a function";
}

// foo is now a string because the var assignment ran
console.log(typeof foo); // "string"`
        }
      ]
    },
    {
      title: "Temporal Dead Zone (TDZ) in Depth",
      explanations: {
        layman: "Imagine you reserved a locker at school but haven't put anything in it yet. The locker exists, but if you try to open it before putting your stuff in, the school stops you — your code throws a ReferenceError and crashes right there. That's TDZ -- the variable is reserved but not ready yet.",
        mid: "When you write `let x = 5`, JavaScript knows `x` exists from the top of the block, but it won't let you use it until that line runs — try to access it early and you get a ReferenceError. This is different from `var`, which gives you `undefined` if you read it before its assignment.",
        senior: "TDZ turns silent `undefined` bugs (with `var`) into loud ReferenceErrors, so initialization-order issues fail fast. Internally, the engine marks `let`/`const` variables as 'not yet ready' — which is a different state from `undefined`. That's why `console.log(x)` before `let x` throws instead of printing `undefined`. One gotcha: `typeof x` on a TDZ variable also throws, even though `typeof` on a completely undeclared variable safely returns `'undefined'`. TDZ also shows up in circular module dependencies — if module A imports a `let` export from module B, but B hasn't finished running yet, you get a TDZ ReferenceError at runtime."
      },
      realWorld: "TDZ errors show up when you reorganize code and accidentally move a usage above its let/const declaration.",
      whenToUse: "When tracking down ReferenceErrors that only appear after moving code around.",
      whenNotToUse: "When your variable is declared at the top of the block and used below it -- TDZ is not relevant.",
      pitfalls: "You might assume let behaves like var and returns undefined before its line. It doesn't -- it throws.",
      codeExamples: [
        {
          title: "TDZ Is About Time, Not Position",
          code: `// This function references myLet, but it's called AFTER myLet is initialized
function printValue() {
  console.log(myLet); // Works fine: 42
}

let myLet = 42;
printValue(); // Called after declaration -- no TDZ issue

// Same pattern -- works because the call happens after the declaration
function printEarly() {
  console.log(earlyLet);
}

let earlyLet = 100;
printEarly(); // 100`
        },
        {
          title: "typeof and TDZ Surprise",
          code: `// typeof on a variable that was never declared returns "undefined" safely
console.log(typeof nonExistent); // "undefined"

// But typeof on a TDZ variable throws ReferenceError!
// console.log(typeof myConst); // Would throw if placed before next line
const myConst = "hello";
console.log(typeof myConst); // "string"

// A safe way to check variables that might be in TDZ
// WARNING: eval-based patterns like this are for learning only — never use eval in production code.
function safeTypeCheck(name) {
  try {
    return typeof eval(name);
  } catch (e) {
    return "in TDZ or error";
  }
}`
        }
      ]
    },
    {
      title: "TDZ with Class Declarations",
      explanations: {
        layman: "Classes work like let and const when it comes to hoisting. JavaScript knows the class name exists, but you can't create objects from it until after the class definition runs. It's like knowing a store is coming to your street but you can't shop there until it actually opens.",
        mid: "Class declarations are hoisted but not initialized. Trying to instantiate a class before its declaration throws a ReferenceError, just like let/const. Class expressions assigned to var/let/const follow the rules of that variable type.",
        senior: "Classes follow the exact same TDZ rules as `let`. The engine registers the class name at the top of the scope, but it's locked until the `class` statement actually runs. So `new MyClass()` before the class definition throws a ReferenceError, not a TypeError. This matters in circular module graphs — if module A imports class B from module B, and module B imports class A from module A, whichever class hasn't finished initializing yet will trigger a TDZ error when the other module tries to use it."
      },
      realWorld: "Circular imports between files that export classes can trigger TDZ errors if the import order causes a class to be used before its module finishes evaluating.",
      whenToUse: "When debugging import-order issues or ReferenceErrors involving classes.",
      whenNotToUse: "When classes are defined at the top of the file and used below -- no TDZ concern.",
      pitfalls: "A class expression assigned to var won't throw a ReferenceError before its line, but it will be undefined, so new on it will throw a TypeError instead.",
      codeExamples: [
        {
          title: "Class Declaration TDZ",
          code: `// Using the class after its declaration works fine
class Person {
  constructor(name) {
    this.name = name;
  }
}

const p = new Person("Alice");
console.log(p.name); // "Alice"

// Class expression with var -- hoisted as undefined, not as a class
var AnimalVar = class {
  constructor(type) { this.type = type; }
};

// Class expression with const -- TDZ rules apply
const AnimalConst = class {
  constructor(type) { this.type = type; }
};`
        },
        {
          title: "this TDZ in Child Class Constructors",
          code: `class Animal {
  constructor(name) {
    this.name = name;
    this.alive = true;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    // 'this' is in TDZ here -- can't use it before super()
    super(name); // This call initializes 'this'
    // Now 'this' is available
    this.breed = breed;
    console.log(this.name); // "Rex"
  }
}

const rex = new Dog("Rex", "German Shepherd");
console.log(rex); // Dog { name: "Rex", alive: true, breed: "German Shepherd" }

// Edge case: returning an object from constructor skips super() requirement
class Tricky extends Animal {
  constructor() {
    return { custom: true }; // Overrides normal instance creation
  }
}

const t = new Tricky();
console.log(t); // { custom: true }
console.log(t instanceof Tricky); // false`
        }
      ]
    },
    {
      title: "Why TDZ Exists (Design Rationale) and Hoisting Edge Cases",
      explanations: {
        layman: "TDZ is like a safety net. In the old days with var, you could accidentally use a variable before setting it up and get undefined without any warning. TDZ makes JavaScript yell at you instead, so you catch the mistake early.",
        mid: "If you reorganize a module and a `let` variable ends up declared after a function that reads it, you get an immediate ReferenceError instead of a mysterious `undefined` value that might cause a bug much later. TDZ makes refactoring safer by catching these ordering mistakes instantly.",
        senior: "TDZ extends beyond variables: in derived class constructors, `this` is in TDZ until `super()` is called — accessing `this` before `super()` throws a ReferenceError, not a TypeError. Internally, the engine tracks a 'not yet ready' state that's different from `undefined` — that's why `typeof x` before `let x` throws instead of returning `'undefined'`. In practice, ESLint's `no-use-before-define` rule catches most TDZ issues at build time so you don't have to debug them at runtime."
      },
      realWorld: "TDZ saves you during refactors. If you move a let declaration below code that reads it, you get an immediate error instead of a mysterious undefined value.",
      whenToUse: "When explaining why let/const are safer than var, or when debugging errors after code reorganization.",
      whenNotToUse: "When code is straightforward with declarations at the top -- TDZ rationale is not relevant to explain.",
      pitfalls: "Default parameters create their own scope. A parameter can reference an earlier parameter, but not a later one -- that's a TDZ error.",
      codeExamples: [
        {
          title: "Default Parameter TDZ",
          code: `// b can reference a because a is already initialized
function working(a = 1, b = a) {
  console.log(a, b); // 1 1
}
working();

// a tries to use b, but b isn't initialized yet -- TDZ error
function broken(a = b, b = 1) {
  console.log(a, b);
}
// broken(); // ReferenceError

// Default params use the outer scope, not the function body
let x = "outer";
function paramScope(a = x) {
  let x = "inner"; // This x doesn't affect the default param
  console.log(a); // "outer"
}
paramScope();`
        },
        {
          title: "Hoisting Edge Cases for Interviews",
          code: `// Function declarations inside blocks have inconsistent behavior across engines
console.log(typeof blockFunc); // undefined in most engines
if (true) {
  function blockFunc() { return "inside"; }
}
console.log(typeof blockFunc); // "function" after the block runs

// Named function expressions: the name is only visible inside the function
var myFunc = function namedFn() {
  console.log(typeof namedFn); // "function" -- visible inside
};
myFunc();
console.log(typeof namedFn); // "undefined" -- not visible outside

// var inside catch escapes into the outer scope
try {
  throw new Error("test");
} catch (err) {
  var escaped = "I escape!";
}
console.log(escaped); // "I escape!" -- var ignores block scope

// Re-declaring var just updates the same binding
var multi = 1;
var multi = 2;
console.log(multi); // 2`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "Is it true that let and const are not hoisted? Explain.",
      answer: "No, let and const are hoisted -- their bindings are created at the top of the scope. But unlike var, they are not initialized to undefined. They stay in the Temporal Dead Zone until the declaration line runs. If you try to access them before that, you get a ReferenceError. You can prove let is hoisted by showing that a let inside a block shadows an outer variable even before the let line: the outer variable becomes inaccessible, which means the inner binding already exists.",
      difficulty: "mid",
      followUps: [
        "How can you prove let is hoisted using code?",
        "What is the 'the hole' value in V8 and how does it relate to TDZ?"
      ]
    },
    {
      question: "What is the output of this code?\n\n```js\nconsole.log(a);\nconsole.log(b);\nvar a = 1;\nlet b = 2;\n```",
      answer: "The first console.log prints undefined because var a is hoisted and initialized to undefined. The second console.log never runs -- it throws a ReferenceError because let b is in the Temporal Dead Zone. The variable b is hoisted (the binding exists) but it cannot be accessed until the declaration line executes.",
      difficulty: "easy",
      followUps: [
        "What if you replace let with const?",
        "What if the let declaration was inside an if block?"
      ]
    },
    {
      question: "What is the output and why?\n\n```js\nvar x = 1;\nfunction foo() {\n  console.log(x);\n  if (false) {\n    var x = 2;\n  }\n  console.log(x);\n}\nfoo();\n```",
      answer: "Both console.logs print undefined. The var x = 2 inside the if block is hoisted to the top of foo(), creating a local x that shadows the outer x = 1. Since var hoisting ignores block scope, it doesn't matter that the if condition is false -- the declaration is still hoisted. But the assignment x = 2 never runs because the block is skipped, so x stays undefined.",
      difficulty: "mid",
      followUps: [
        "How would this change with let instead of var?",
        "Does the engine actually 'move' the declaration, or is that a simplification?"
      ]
    },
    {
      question: "Explain the order in which declarations are processed during hoisting when there are name conflicts.",
      answer: "During the creation phase, function declarations are processed first and get their full value. Then var declarations are processed, but they don't overwrite an existing function binding -- they just skip. At runtime, var assignments do overwrite. So if you have both function foo() {} and var foo = 'string', foo starts as the function, then becomes 'string' when the assignment runs. let/const with the same name as a var or function in the same scope causes a SyntaxError.",
      difficulty: "hard",
      followUps: [
        "What happens with two function declarations of the same name?",
        "Can a var and a let coexist with the same name?"
      ]
    },
    {
      question: "What is the Temporal Dead Zone, and why was it added to JavaScript?",
      answer: "The TDZ is the period between entering a scope and the point where a let/const/class declaration is evaluated. During this window, the binding exists but accessing it throws a ReferenceError. It was added to catch bugs early. With var, reading a variable before its assignment silently gives undefined, which can cause hard-to-find bugs. TDZ makes these mistakes loud and obvious.",
      difficulty: "mid",
      followUps: [
        "Does typeof throw when used on a TDZ variable?",
        "How is TDZ implemented in V8 internally?"
      ]
    },
    {
      question: "What is the output?\n\n```js\nfunction test() {\n  console.log(typeof fn);\n  console.log(typeof cls);\n  function fn() {}\n  class cls {}\n}\ntest();\n```",
      answer: "First log prints 'function' because function declarations are fully hoisted with their value. Second log throws a ReferenceError because class declarations are in the TDZ -- typeof does not protect you from TDZ variables, unlike undeclared variables where typeof safely returns 'undefined'.",
      difficulty: "hard",
      followUps: [
        "Why does typeof behave differently for undeclared vs TDZ variables?",
        "How does this typeof/TDZ behavior affect feature-detection patterns in libraries?"
      ]
    },
    {
      question: "What is the output?\n\n```js\nvar a = 1;\nfunction a() {}\nconsole.log(typeof a);\n```",
      answer: "It prints 'number'. During the creation phase, function a is hoisted first with its full body. The var a declaration is then processed but doesn't overwrite the function. However, at runtime, var a = 1 assigns the number 1 to a, overwriting the function. So by the time console.log runs, a is 1.",
      difficulty: "hard",
      followUps: [
        "What if the var assignment was removed (just var a;)?",
        "What if there were two function declarations with the same name?"
      ]
    },
    {
      question: "Explain function declaration hoisting inside blocks and why it is problematic.",
      answer: "Function declarations inside blocks (like if or for) have inconsistent behavior across engines. The spec says they should be block-scoped in strict mode, but in sloppy mode browsers handle them differently for legacy reasons. Some engines hoist only the var binding to the function scope while keeping the function value block-scoped. This makes the behavior unpredictable, so you should avoid function declarations inside blocks and use function expressions instead. In browsers running sloppy mode, the function name is hoisted to the function scope as `undefined`, then assigned when the block executes. This is a legacy web compatibility behavior (Annex B) — in strict mode, block-scoped functions stay within the block.",
      difficulty: "hard",
      followUps: [
        "What changes if we refactor this and hit TDZ access and declaration collisions?",
        "How does block-scoped function declaration behavior differ between strict mode and sloppy mode?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Predict the Hoisting Output",
      difficulty: "mid",
      description: "Read the code below and predict what each console.log prints. Think about which declarations are hoisted, what values they get during the creation phase, and what happens when a var and a function share the same name.",
      solution: `// Step 1: Creation phase
// - function a() is hoisted with its body
// - var a is hoisted but doesn't overwrite the function
// - let b and const c are hoisted but in TDZ

console.log(a); // [Function: a] -- function wins over var in creation phase
console.log(b); // ReferenceError -- let b is in TDZ
console.log(c); // Never reached

var a = "var";
let b = "let";
const c = "const";

function a() { return "function"; }`,
      explanation: "During the creation phase, function a is fully hoisted. var a doesn't overwrite it. So the first log prints the function. The second log throws because let b is in the TDZ. The var assignment a = 'var' would overwrite the function at runtime, but we never get there because of the ReferenceError."
    },
    {
      title: "Fix the TDZ Bug",
      difficulty: "mid",
      description: "The code below has TDZ-related issues. Identify which lines would throw ReferenceError and reorder the declarations to fix them.",
      solution: `function init() {
  // loadConfig is a function declaration -- hoisted and callable here
  const config = loadConfig();
  console.log("Config:", config);

  // logLevel must be declared before setupLogger uses it
  let logLevel = config.logLevel;
  setupLogger(logLevel);

  // EventBus class must be defined before we create an instance
  class EventBus {
    constructor() {
      this.handlers = {};
    }
    on(event, handler) {
      if (!this.handlers[event]) this.handlers[event] = [];
      this.handlers[event].push(handler);
    }
    emit(event, data) {
      (this.handlers[event] || []).forEach(h => h(data));
    }
  }
  const bus = new EventBus();

  return { config, bus, logLevel };
}

// These function declarations are hoisted -- callable from init()
function loadConfig() {
  return { logLevel: "info", debug: false };
}

function setupLogger(level) {
  console.log("Logger set to:", level);
}

const result = init();
console.log(result);`,
      explanation: "This works because function declarations (loadConfig, setupLogger) are fully hoisted and callable anywhere. Inside init(), the let, const, and class are used only after their declarations. Moving any of them above their declaration would cause a TDZ ReferenceError."
    },
    {
      title: "Hoisting Order Challenge",
      difficulty: "hard",
      description: "Trace through this function call and predict each console.log output. Consider how the parameter x, var y, block-scoped function z, and function declaration x interact during the creation and execution phases.",
      solution: `function challenge(x) {
  // Creation phase: function x is hoisted, overwriting the parameter
  // var y is hoisted as undefined
  // z is tricky -- block-scoped function, partially hoisted

  console.log("1:", x);          // The function x (hoisted over param)
  console.log("2:", typeof y);   // "undefined" -- var hoisted
  console.log("3:", typeof z);   // "undefined" -- block func partially hoisted

  var y = "var y";

  if (true) {
    function z() { return "z from if"; }
  }

  console.log("4:", y);          // "var y" -- assignment has run
  console.log("5:", typeof z);   // "function" -- block func now available

  function x() { return "fn x"; }

  console.log("6:", x);          // Still the function -- no reassignment happened
}

challenge("argument");`,
      explanation: "The function declaration x overrides the parameter during the creation phase. var y starts as undefined. The block-scoped function z is partially hoisted (var-like binding) and only gets its function value after the block executes. After the if block runs, z becomes a function."
    },
    {
      title: "Implement a Hoisting Simulator",
      difficulty: "hard",
      description: "Build a function that simulates JavaScript's creation phase. Given an array of declarations, it should process them in the correct order (functions first, then var, then let/const/class) and return the state of variable and lexical environments, including TDZ tracking and name conflict detection.",
      solution: `function simulateHoisting(declarations) {
  // Two environments, just like the JS engine
  const varEnv = {};   // For var and function declarations
  const lexEnv = {};   // For let, const, and class
  const tdz = new Set();

  // Step 1: Function declarations are processed first and get full values
  for (const decl of declarations) {
    if (decl.type === "function") {
      varEnv[decl.name] = "[Function: " + decl.name + "]";
    }
  }

  // Step 2: var declarations -- only create binding if name doesn't exist yet
  for (const decl of declarations) {
    if (decl.type === "var") {
      if (!(decl.name in varEnv)) {
        varEnv[decl.name] = "undefined";
      }
    }
  }

  // Step 3: let/const/class -- check for conflicts, then add to lexical env
  for (const decl of declarations) {
    if (decl.type === "let" || decl.type === "const" || decl.type === "class") {
      if (decl.name in varEnv) {
        return {
          error: "SyntaxError: '" + decl.name + "' has already been declared"
        };
      }
      lexEnv[decl.name] = "<uninitialized>";
      tdz.add(decl.name);
    }
  }

  return {
    varEnv,
    lexEnv,
    tdz: Array.from(tdz),
    summary: buildSummary(varEnv, lexEnv),
  };
}

function buildSummary(varEnv, lexEnv) {
  const lines = ["After creation phase (before code runs):"];
  for (const [name, val] of Object.entries(varEnv)) {
    lines.push("  " + name + " = " + val + " (accessible)");
  }
  for (const [name, val] of Object.entries(lexEnv)) {
    lines.push("  " + name + " = " + val + " (TDZ - throws if accessed)");
  }
  return lines.join("\\n");
}

// Test: mixed declarations with a function overriding a var
const result = simulateHoisting([
  { type: "var", name: "x", value: 10 },
  { type: "let", name: "y", value: 20 },
  { type: "const", name: "z", value: 30 },
  { type: "function", name: "greet", value: "function body" },
  { type: "var", name: "greet", value: "string" },
]);

console.log(result.summary);

// Test: name conflict between var and let
const conflict = simulateHoisting([
  { type: "var", name: "a", value: 1 },
  { type: "let", name: "a", value: 2 },
]);
console.log(conflict); // SyntaxError`,
      explanation: "The simulator mirrors the engine's creation phase: functions are processed first and get their full value. Then `var` declarations are set to `undefined`, but skipped if a function already claimed that name. Finally, `let`/`const`/`class` are registered but locked (TDZ) — you can't touch them until their declaration line runs. If a `var`/function and a `let`/`const` share the same name, it's a SyntaxError."
    }
  ],
  quiz: [
    {
      question: "Which of the following is fully hoisted with its value during the creation phase?",
      options: [
        "var declarations",
        "let declarations",
        "Function declarations",
        "Class declarations"
      ],
      correct: 2,
      explanation: "Function declarations are the only ones fully hoisted with their value. var is hoisted but set to undefined. let, const, and class are hoisted but stay in the TDZ."
    },
    {
      question: "What does `typeof x` return when `x` is a `let` variable in the TDZ?",
      options: [
        "\"undefined\"",
        "\"object\"",
        "It throws a ReferenceError",
        "\"uninitialized\""
      ],
      correct: 2,
      explanation: "Unlike undeclared variables where typeof safely returns 'undefined', using typeof on a TDZ variable throws a ReferenceError because the binding exists but is not initialized."
    },
    {
      question: "What happens when a `var` declaration and a function declaration share the same name?",
      options: [
        "SyntaxError at parse time",
        "The var declaration wins and the function is discarded",
        "The function declaration wins during creation; the var assignment can overwrite during execution",
        "The last one in source order wins"
      ],
      correct: 2,
      explanation: "During the creation phase, the function declaration takes priority and its value is set. The var declaration doesn't overwrite it. But when the code runs, the var's assignment (like var foo = 'string') will overwrite the function value."
    },
    {
      question: "In a derived class constructor, when is `this` available?",
      options: [
        "Immediately when the constructor starts",
        "After calling super()",
        "After all instance properties are defined",
        "this is never available in derived constructors"
      ],
      correct: 1,
      explanation: "In a child class constructor, 'this' is in a TDZ until you call super(). Trying to use this before super() throws a ReferenceError. The parent constructor is responsible for creating the object that becomes `this`. Until `super()` runs, there's no object to bind to, so `this` stays in TDZ."
    },
    {
      question: "What is the output?\n```js\nvar x = 1;\nif (false) { var x = 2; }\nconsole.log(x);\n```",
      options: [
        "undefined",
        "1",
        "2",
        "ReferenceError"
      ],
      correct: 1,
      explanation: "var ignores block scope, so both declarations refer to the same variable. The var x = 2 inside the if block is hoisted, but since the condition is false, the assignment never runs. The first assignment x = 1 does run, so the output is 1."
    },
    {
      question: "Which statement about the Temporal Dead Zone is FALSE?",
      options: [
        "TDZ exists from the start of the scope until the declaration is evaluated",
        "TDZ variables have their bindings created during hoisting",
        "TDZ prevents typeof from working on the variable",
        "TDZ causes the variable to not exist at all until the declaration"
      ],
      correct: 3,
      explanation: "The variable's binding does exist during TDZ -- it's created during hoisting. It's just not initialized yet. That's the whole point: the binding is there but locked until the declaration line runs. Options A, B, and C are all true: the variable IS hoisted (binding exists), accessing it DOES throw ReferenceError, and `typeof` in the TDZ DOES throw (unlike undeclared variables)."
    }
  ]
};
