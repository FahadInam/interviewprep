export const thisKeyword = {
  id: "this-keyword",
  title: "The 'this' Keyword",
  icon: "👆",
  tag: "JavaScript Core",
  tagColor: "var(--tag-js)",
  subtitle: "Understand how 'this' works in every situation.",
  concepts: [
    {
      title: "this in Global Context & Strict Mode",
      explanations: {
        layman: "Think of `this` as a name tag. In a browser, the default name tag says 'window'. In strict mode functions (not at the top level), the name tag is blank — `this` is `undefined`.",
        mid: "In browser scripts, top-level 'this' is the window object. In strict mode or ES modules, it's undefined. The difference catches people off guard when migrating code between environments.",
        senior: "Big gotcha when migrating: if you move code from a `<script>` tag to a module (`<script type='module'>`), top-level `this` changes from `window` to `undefined`. So any code that relied on `this.someGlobal` at the top level will break. Same thing in Node.js — inside a CommonJS file, top-level `this` is the `exports` object, but in an ES module it's `undefined`. In interviews, if someone asks 'what's the difference between script and module mode?' — this `this` change is one of the key answers."
      },
      realWorld: "You hit this when a method gets passed as a callback to setTimeout or an event listener and suddenly 'this' is window or undefined instead of your object.",
      whenToUse: "When your function relies on 'this' and might run in different environments like browsers, Node, or strict mode.",
      whenNotToUse: "If your function never references 'this', don't worry about binding rules.",
      pitfalls: "Regular functions get 'this' from how they're called, not where they're written. Pulling a method out of an object and calling it alone loses the object context.",
      codeExamples: [
        {
          title: "Global this in Different Contexts",
          code: `console.log(this === window); // true

function show() {
  console.log(this);
}
show(); // Window {...}

function showStrict() {
  'use strict';
  console.log(this);
}
showStrict(); // undefined

console.log(globalThis); // Window {...}`
        }
      ]
    },
    {
      title: "this in Object Methods & Implicit Binding",
      explanations: {
        layman: "When you call a function as obj.method(), JavaScript sets 'this' to obj. It's like asking 'who's calling?' — the thing before the dot is the answer.",
        mid: "obj.method() sets this to obj. But if you save that method to a variable and call it standalone, the dot is gone, so 'this' falls back to window or undefined. The #1 bug: you do `const fn = obj.method` and call `fn()` — now `this` is undefined instead of obj.",
        senior: "The real-world version of this bug: `button.addEventListener('click', this.handleClick)` — inside handleClick, `this` is now the button, not your class. Three fixes: (1) `this.handleClick.bind(this)` in the constructor — stores one bound copy, (2) arrow wrapper: `(e) => this.handleClick(e)` — works but you can't remove the listener easily, (3) arrow class field: `handleClick = () => {}` — cleanest syntax, but each instance gets its own copy (more memory). Pick based on whether you need to remove the listener later and how many instances you'll create."
      },
      realWorld: "Classic bug: you pass user.greet to setTimeout, and it logs undefined instead of the user's name because setTimeout calls it without the object.",
      whenToUse: "When you have object methods that need to access the object's own properties through 'this'.",
      whenNotToUse: "If your function doesn't need to know which object called it, skip worrying about implicit binding.",
      pitfalls: "Destructuring a method from an object (const { greet } = obj) strips the binding. The extracted function no longer knows about the object.",
      codeExamples: [
        {
          title: "Implicit Binding and Binding Loss",
          code: `const user = {
  name: 'Alice',
  greet() {
    console.log('Hello, ' + this.name);
  },
  delayedGreet() {
    setTimeout(function() {
      console.log('Delayed: ' + this.name);
    }, 100);

    setTimeout(() => {
      console.log('Delayed: ' + this.name);
    }, 100);

    setTimeout(function() {
      console.log('Delayed: ' + this.name);
    }.bind(this), 100);

    const self = this;
    setTimeout(function() {
      console.log('Delayed: ' + self.name);
    }, 100);
  }
};

user.greet();

const greetFn = user.greet;
greetFn();

const admin = Object.create(user);
admin.name = 'Bob';
admin.greet();`
        }
      ]
    },
    {
      title: "this in Arrow Functions (Lexical this)",
      explanations: {
        layman: "Arrow functions don't get their own 'this'. They just use whatever 'this' was in the code around them — like inheriting your parent's last name instead of picking your own.",
        mid: "Arrow functions capture 'this' from the surrounding scope when they're created. Great for callbacks inside methods, but don't use them as object methods because they won't point to the object.",
        senior: "Arrow functions can never be constructors — `new` always throws a TypeError on them, no matter what. They also don't have their own `arguments` object — they grab it from the surrounding function. When used as class fields (`method = () => {}`), each instance gets its own copy of the function instead of sharing one from the prototype — this uses more memory per instance but guarantees correct `this` binding. Trade-off: 100 instances = 100 copies of the function vs. 1 shared prototype method + a bind call."
      },
      realWorld: "Arrow functions shine inside setTimeout or .map() inside a method — they keep 'this' pointing to your object without needing bind or self = this.",
      whenToUse: "When you need a callback inside a method and want it to share the method's 'this' automatically.",
      whenNotToUse: "Don't use arrow functions as object methods or constructors — they'll grab the wrong 'this' or throw an error.",
      pitfalls: "An arrow function defined at the top level of an object literal captures the outer scope's this (usually window), not the object itself.",
      codeExamples: [
        {
          title: "Arrow Functions vs Regular Functions",
          code: `const obj = {
  name: 'Widget',

  getName: () => {
    return this.name;
  },

  getNameCorrect() {
    return this.name;
  },

  getNameDelayed() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.name);
      }, 100);
    });
  }
};

const arrow = () => this;
console.log(arrow.call({ a: 1 })); // Window {...} (call has no effect on arrow)
console.log(arrow.bind({ b: 2 })()); // Window {...} (bind has no effect on arrow)

const Foo = () => {};
// new Foo() → TypeError: Foo is not a constructor`
        }
      ]
    },
    {
      title: "Explicit Binding: bind, call, apply",
      explanations: {
        layman: "bind, call, and apply let you tell a function exactly what 'this' should be. call and apply run the function right away. bind gives you a new function with 'this' locked in for later.",
        mid: "call(thisArg, arg1, arg2) and apply(thisArg, [args]) both invoke immediately with a chosen `this`. bind(thisArg) returns a new function with `this` permanently locked. A bound function's `this` can't be changed by call, apply, or another bind — only `new` can override it.",
        senior: "A common interview trick: `const BoundFoo = Foo.bind({x: 99}); const obj = new BoundFoo()` — what is `obj.x`? Answer: not 99. `new` always wins over `bind` because constructors must create a fresh object. The bound `this` is ignored, but any pre-filled arguments from bind still apply. This is actually useful: you can do `const Make = Foo.bind(null, 'default')` to pre-fill the first argument while letting `new` handle the `this`. Also: `bind` creates a new function every call — so `el.addEventListener('click', this.fn.bind(this))` in a loop means you can't `removeEventListener` later because each bind returns a different reference."
      },
      realWorld: "You use bind when passing a method as a callback and want to lock its context. call/apply are handy for borrowing array methods on array-like objects.",
      whenToUse: "When you need to force a specific 'this' — passing methods as callbacks, borrowing methods from other objects, or pre-filling arguments.",
      whenNotToUse: "If arrow functions solve your problem more cleanly, prefer those over manual bind calls.",
      pitfalls: "Binding an already-bound function doesn't change 'this' — the first bind wins. Also, bind creates a new function each time, which can cause issues with removeEventListener if you're not careful.",
      codeExamples: [
        {
          title: "call, apply, and bind Deep Dive",
          code: `function introduce(greeting, punctuation) {
  return greeting + ', I am ' + this.name + punctuation;
}

const person = { name: 'Alice' };

console.log(introduce.call(person, 'Hi', '!'));

console.log(introduce.apply(person, ['Hello', '.']));

const aliceIntro = introduce.bind(person, 'Hey');
console.log(aliceIntro('!!'));

const bob = { name: 'Bob' };
console.log(aliceIntro.call(bob, '?'));

function User(name) {
  this.name = name;
}
const BoundUser = User.bind({ name: 'Ignored' });
const user = new BoundUser('Charlie');
console.log(user.name);

const arrayLike = { 0: 'a', 1: 'b', 2: 'c', length: 3 };
const arr = Array.prototype.slice.call(arrayLike);
console.log(arr);

const numbers = [5, 2, 8, 1, 9];
console.log(Math.max.apply(null, numbers));`
        }
      ]
    },
    {
      title: "this Precedence Rules & new Binding",
      explanations: {
        layman: "When multiple rules try to set `this`, JavaScript follows a pecking order: `new` keyword wins over everything. Next is explicit binding (bind/call/apply). Then comes the object dot pattern (`obj.method()`). And last is the default (window or undefined). Think of it like a chain of command.",
        mid: "The priority is: new binding > explicit binding (bind/call/apply) > implicit binding (obj.method()) > default binding. Even if you bind a constructor, using new still creates a fresh object as 'this'.",
        senior: "At the call-site, check in order: is it `new`? Then `this` is the fresh object. Is it `call`/`apply`/`bind`? Use that context. Is there a dot? Use that object. Otherwise default. Arrow functions skip all of this — they locked in `this` from where they were written, and nothing at the call-site can change it. Debug tip: always read the call-site, not the function body."
      },
      realWorld: "Understanding precedence helps you predict behavior when a bound method is used with 'new', or when an explicitly bound function is called as an object method.",
      whenToUse: "When debugging confusing 'this' values, walk through the precedence rules at the actual call-site to figure out what wins.",
      whenNotToUse: "Don't create code that intentionally mixes multiple binding styles — it's clever but confusing for your teammates.",
      pitfalls: "People often forget that 'new' beats bind. A bound constructor still creates a new object — the bound this value gets ignored.",
      codeExamples: [
        {
          title: "this Precedence Demonstration",
          code: `function showThis() {
  return this;
}
console.log(showThis()); // Window {...} (default binding)

const obj = { showThis };
console.log(obj.showThis() === obj); // true (implicit binding)

const other = { name: 'other' };
console.log(obj.showThis.call(other) === other); // true (explicit binding)

function Person(name) {
  this.name = name;
}
const boundPerson = Person.bind({ name: 'bound' });
const p = new boundPerson('constructed');
console.log(p.name); // 'constructed' (new overrides bind)

function test() {
  console.log(this.id);
}

const bound = test.bind({ id: 'bound' });
const obj2 = { id: 'implicit', test: bound };

bound(); // 'bound' (explicit binding)
obj2.test(); // 'bound' (bind beats implicit)
bound.call({ id: 'call' }); // 'bound' (bind can't be overridden by call)

function Ctor() { this.id = 'new'; }
const BoundCtor = Ctor.bind({ id: 'bound' });
const instance = new BoundCtor();
console.log(instance.id); // 'new' (new beats bind)`,
        },
        {
          title: "this in Classes and Constructors",
          code: `class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return this.name + ' makes a sound';
  }

  speakArrow = () => {
    return this.name + ' makes a sound (arrow)';
  };
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);
    this.breed = breed;
  }

  fetch() {
    return this.name + ' the ' + this.breed + ' fetches!';
  }
}

const dog = new Dog('Rex', 'Labrador');
console.log(dog.speak());
console.log(dog.fetch());

const speak = dog.speak;
speak(); // TypeError or undefined (depending on strict mode) — 'this' is lost

const speakArrow = dog.speakArrow;
console.log(speakArrow());`
        }
      ]
    },
    {
      title: "this in Event Handlers & DOM Context",
      explanations: {
        layman: "When a regular function handles a click event, 'this' is the element that was clicked. Arrow functions don't do this — they keep 'this' from wherever the code was written.",
        mid: "In addEventListener with a regular function, this equals e.currentTarget (the element the listener is on). Arrow functions ignore this and keep their outer scope. For class-based handlers, bind the method in the constructor or use arrow class fields. Important: `this` and `e.currentTarget` point to the element the listener is attached to. `e.target` points to the actual element that was clicked (could be a child). This distinction matters in event delegation.",
        senior: "Pro tip: use `e.currentTarget` instead of `this` in handlers — it works with both regular and arrow functions, so you avoid binding confusion entirely. For cleanup, the tricky part is `removeEventListener` — you need the exact same function reference. If you do `el.addEventListener('click', fn.bind(this))`, you can't remove it later because `bind` returns a new function each time. Solution: bind once in the constructor and store it: `this.onClick = this.onClick.bind(this)`. Or use the lesser-known `handleEvent` pattern — pass an object with a `handleEvent` method, and `this` inside it automatically points to the object, no bind needed."
      },
      realWorld: "You'll deal with this in every UI component that adds event listeners, especially when class methods need to access both the DOM element and the class instance.",
      whenToUse: "When you're wiring up DOM event listeners and your handler needs to reference the element or your class instance.",
      whenNotToUse: "If you're using a framework like React, it manages event binding for you — you rarely need to think about raw DOM this binding.",
      pitfalls: "If you bind a method in a loop or render cycle without storing the reference, you can't remove the listener later because each bind creates a different function.",
      codeExamples: [
        {
          title: "Event Handler this Binding",
          code: `const button = document.querySelector('#myBtn');

button.addEventListener('click', function(e) {
  console.log(this === e.currentTarget);
  this.classList.toggle('active');
});

button.addEventListener('click', (e) => {
  console.log(this === window);
  e.currentTarget.classList.toggle('active');
});

const handler = {
  count: 0,
  handleEvent(e) {
    this.count++;
    console.log('Clicked ' + this.count + ' times');
  }
};
button.addEventListener('click', handler);

class Widget {
  constructor(el) {
    this.el = el;
    this.count = 0;

    this.onClick = this.onClick.bind(this);
    el.addEventListener('click', this.onClick);
  }

  onClick() {
    this.count++;
    console.log(this.count);
  }

  destroy() {
    this.el.removeEventListener('click', this.onClick);
  }
}`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "Explain the four rules for determining 'this' in JavaScript and their priority order.",
      answer: "The four rules from highest to lowest priority: (1) new binding — this is the newly created object, (2) explicit binding via call/apply/bind — this is whatever you pass in, (3) implicit binding — this is the object before the dot, (4) default binding — this is window (or undefined in strict mode). Arrow functions skip all four and use the this from their surrounding code.",
      difficulty: "mid",
      followUps: [
        "What happens when you use new on a bound function?",
        "How do arrow functions fit into this precedence system?",
        "Can you give an example where two rules conflict?"
      ]
    },
    {
      question: "What does this code output?\n\nconst obj = {\n  name: 'obj',\n  getThis: () => this,\n  getThisRegular() { return this; }\n};\n\nconsole.log(obj.getThis());\nconsole.log(obj.getThisRegular());",
      answer: "obj.getThis() returns window (or undefined in a module) because arrow functions capture this from the surrounding scope, and an object literal doesn't create a scope. obj.getThisRegular() returns the obj because it's a regular function called with the dot notation, so implicit binding applies.",
      difficulty: "mid",
      followUps: [
        "Why doesn't the object literal create a scope for the arrow function?",
        "How would you fix getThis to return obj using an arrow function?",
        "What if getThis was defined inside a method?"
      ]
    },
    {
      question: "How does 'this' work differently in arrow functions versus regular functions?",
      answer: "Regular functions get their this from how they're called (the call-site). Arrow functions don't have their own this at all — they capture it from the surrounding scope when they're created. You can't change an arrow function's this with call, apply, or bind.",
      difficulty: "easy",
      followUps: [
        "Can you use bind() on an arrow function?",
        "What other things do arrow functions lack besides their own 'this'?",
        "Why can't arrow functions be constructors?"
      ]
    },
    {
      question: "Explain what happens with 'this' when you pass an object method as a callback.",
      answer: "When you extract a method and pass it as a callback, the connection to the original object is lost. The callback gets called without the dot syntax, so this becomes window or undefined. Fix it with bind, an arrow wrapper, or arrow class fields.",
      difficulty: "easy",
      followUps: [
        "Why does extracting a method lose its this binding?",
        "What's the memory trade-off of using arrow class fields?",
        "How does the handleEvent pattern solve this problem?"
      ]
    },
    {
      question: "What will this code output and why?\n\nfunction Foo() {\n  this.x = 1;\n  return { x: 2 };\n}\n\nconst foo = new Foo();\nconsole.log(foo.x);",
      answer: "It outputs 2. When a constructor explicitly returns an object, that object replaces the default this. So foo is { x: 2 }, not the auto-created this with x = 1. If the constructor returned a primitive (like a number), it would be ignored and this would be used instead.",
      difficulty: "hard",
      followUps: [
        "What if the constructor returned a number instead?",
        "How does this behavior relate to factory functions?",
        "Does this behavior apply when the constructor returns an array or a function?"
      ]
    },
    {
      question: "How do call, apply, and bind differ? When would you use each?",
      answer: "call invokes the function immediately with arguments listed out. apply does the same but takes arguments as an array. bind doesn't invoke the function — it returns a new function with this permanently set. Use call/apply for one-off invocations, bind for callbacks you'll pass around.",
      difficulty: "easy",
      followUps: [
        "What happens if you pass null or undefined as thisArg?",
        "Can you bind a function that's already bound?",
        "How does bind interact with the new keyword?"
      ]
    },
    {
      question: "What's the output?\n\nconst obj = {\n  x: 42,\n  getX: function() {\n    return this.x;\n  }\n};\n\nconst { getX } = obj;\nconsole.log(getX());",
      answer: "It outputs undefined. Destructuring extracts the function from the object, so calling getX() is a plain function call with no dot. this falls back to window (or undefined in strict mode), and window.x is undefined.",
      difficulty: "mid",
      followUps: [
        "How would you destructure while preserving the this context?",
        "Is this a common real-world bug?",
        "How do class arrow field methods avoid this problem?"
      ]
    },
    {
      question: "Explain how this works in class inheritance with super calls.",
      answer: "In a subclass constructor, you must call super() before using this. super() runs the parent constructor which sets up the initial this object. After that, the subclass constructor can add its own properties. Regular methods on the prototype use normal implicit binding — this is whatever instance called the method.",
      difficulty: "hard",
      followUps: [
        "What happens if you call a parent method that uses `this` from a child instance?",
        "How does this work in static methods?",
        "Can you use this before super in any scenario?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Implement Function.prototype.bind",
      difficulty: "hard",
      description: "Write your own version of Function.prototype.bind. It should set 'this' for the function, allow pre-filling arguments, and work correctly with the 'new' operator.",
      solution: `Function.prototype.myBind = function(context, ...boundArgs) {
  if (typeof this !== 'function') {
    throw new TypeError('Bind must be called on a function');
  }

  const targetFn = this;

  function boundFn(...callArgs) {
    // If called with new, use the new object as this, not the bound context
    const isNew = this instanceof boundFn;
    return targetFn.apply(
      isNew ? this : context,
      [...boundArgs, ...callArgs]
    );
  }

  // Keep prototype chain so instanceof works
  if (targetFn.prototype) {
    boundFn.prototype = Object.create(targetFn.prototype);
  }

  return boundFn;
};

function Greet(greeting, name) {
  this.greeting = greeting;
  this.name = name;
}

const BoundGreet = Greet.myBind(null, 'Hello');
const obj = new BoundGreet('World');
console.log(obj.greeting);
console.log(obj.name);
console.log(obj instanceof Greet);
console.log(obj instanceof BoundGreet);

function sayHi() {
  return 'Hi, ' + this.name;
}
const bound = sayHi.myBind({ name: 'Alice' });
console.log(bound());`,
      explanation: "The key trick is checking 'this instanceof boundFn' to detect when the bound function is called with new. If so, ignore the bound context and use the fresh object. The prototype link ensures instanceof still works across the original and bound constructors."
    },
    {
      title: "Implement Function.prototype.call",
      difficulty: "mid",
      description: "Write your own version of Function.prototype.call. It should invoke the function with a given this value and individual arguments. Handle edge cases like null/undefined context and primitive wrapping.",
      solution: `Function.prototype.myCall = function(context, ...args) {
  // Default to globalThis if null/undefined, wrap primitives in objects
  context = context != null ? Object(context) : globalThis;

  // Use a unique Symbol so we don't clash with existing properties
  const key = Symbol('fn');

  // Attach the function as a method so calling it gives us the right this
  context[key] = this;

  const result = context[key](...args);

  delete context[key];

  return result;
};

function greet(greeting) {
  return greeting + ', ' + this.name;
}

console.log(greet.myCall({ name: 'Alice' }, 'Hello'));

function getType() {
  return typeof this;
}
console.log(getType.myCall(42));

function getThis() {
  return this;
}
console.log(getThis.myCall(null) === globalThis);`,
      explanation: "The trick is temporarily attaching the function as a property on the context object. When called as context[key](), implicit binding makes this point to context. The Symbol key prevents property name collisions."
    },
    {
      title: "Fix the this Binding Issues",
      difficulty: "mid",
      description: "The EventTracker class has three methods with broken this binding. Identify the bugs and fix them using different strategies: bind in constructor, arrow functions, and arrow class fields.",
      solution: `class EventTracker {
  constructor() {
    this.events = [];
    this.count = 0;
  }

  handleEvent(eventName) {
    this.count++;
    this.events.push({ name: eventName, time: Date.now() });
  }

  logAfterDelay(message, delay) {
    // BUG: regular function in setTimeout loses this
    setTimeout(function() {
      console.log(this.count + ': ' + message);
    }, delay);
  }

  processEvents() {
    // BUG: standalone function call loses this
    function helper() {
      return this.events.length;
    }
    return helper();
  }
}

class EventTrackerFixed {
  constructor() {
    this.events = [];
    this.count = 0;

    // FIX: bind in constructor so handleEvent keeps context
    this.handleEvent = this.handleEvent.bind(this);
  }

  handleEvent(eventName) {
    this.count++;
    this.events.push({ name: eventName, time: Date.now() });
  }

  logAfterDelay(message, delay) {
    // FIX: arrow function captures this from the method
    setTimeout(() => {
      console.log(this.count + ': ' + message);
    }, delay);
  }

  processEvents() {
    // FIX: arrow function captures this from the method
    const helper = () => {
      return this.events.length;
    };
    return helper();
  }
}

class EventTrackerAlt {
  events = [];
  count = 0;

  // FIX: arrow class fields always bind to the instance
  handleEvent = (eventName) => {
    this.count++;
    this.events.push({ name: eventName, time: Date.now() });
  };

  logAfterDelay = (message, delay) => {
    setTimeout(() => {
      console.log(this.count + ': ' + message);
    }, delay);
  };

  processEvents = () => {
    return this.events.length;
  };
}`,
      explanation: "Three strategies to fix lost this: (1) bind in the constructor — creates a bound copy per instance, (2) arrow functions inside methods — captures this from the surrounding method, (3) arrow class fields — each instance gets its own function with this locked in. Arrow class fields are cleanest but use more memory since each instance gets a copy."
    },
    {
      title: "Implement a Method Chaining Builder",
      difficulty: "mid",
      description: "Build a QueryBuilder class that uses method chaining (returning this) to construct SQL queries. Each method should return this so calls can be chained together fluently.",
      solution: `class QueryBuilder {
  constructor() {
    this._select = '*';
    this._from = '';
    this._where = [];
    this._orderBy = '';
    this._limit = null;
  }

  select(fields) {
    this._select = Array.isArray(fields) ? fields.join(', ') : fields;
    return this; // Return this to enable chaining
  }

  from(table) {
    this._from = table;
    return this;
  }

  where(condition) {
    this._where.push(condition);
    return this;
  }

  orderBy(field, direction = 'ASC') {
    this._orderBy = field + ' ' + direction;
    return this;
  }

  limit(n) {
    this._limit = n;
    return this;
  }

  build() {
    if (!this._from) throw new Error('FROM clause is required');

    let query = 'SELECT ' + this._select;
    query += ' FROM ' + this._from;

    if (this._where.length > 0) {
      query += ' WHERE ' + this._where.join(' AND ');
    }

    if (this._orderBy) {
      query += ' ORDER BY ' + this._orderBy;
    }

    if (this._limit !== null) {
      query += ' LIMIT ' + this._limit;
    }

    return query;
  }
}

const query = new QueryBuilder()
  .select(['name', 'email', 'age'])
  .from('users')
  .where('age > 18')
  .where('active = true')
  .orderBy('name', 'ASC')
  .limit(10)
  .build();

console.log(query);`,
      explanation: "Method chaining works because every method returns 'this', so the next method call operates on the same object. build() is the terminal method that computes the final result. This pattern depends on this always being the QueryBuilder instance — if you extracted a method and called it standalone, this would break."
    }
  ],
  quiz: [
    {
      question: "What is the output?\n\nconst obj = {\n  a: 1,\n  b: () => this.a,\n  c() { return this.a; }\n};\nconsole.log(obj.b());\nconsole.log(obj.c());",
      options: ["1, 1", "undefined, 1", "1, undefined", "undefined, undefined"],
      correct: 1,
      explanation: "The arrow function b captures this from the outer scope (window), where this.a is undefined. The regular function c gets this from the call-site (obj), so this.a is 1."
    },
    {
      question: "What happens when you call bind on an already-bound function?",
      options: [
        "The second bind overrides the first",
        "It throws a TypeError",
        "The first bind's this is permanent; the second bind can only add more preset arguments",
        "Both binds are ignored"
      ],
      correct: 2,
      explanation: "The second bind wraps the first bound function, creating another layer. It can add its own preset arguments, but it cannot change the `this` value that was locked in by the first bind."
    },
    {
      question: "In strict mode, what is 'this' in a plain function call?",
      options: ["The global object", "undefined", "null", "The function itself"],
      correct: 1,
      explanation: "Strict mode doesn't auto-box this to the global object. A plain function call like fn() gets this as undefined instead of window."
    },
    {
      question: "What does 'new' do to the 'this' binding of a bound function?",
      options: [
        "Uses the bound this value",
        "Ignores the bound this and creates a new object",
        "Throws a TypeError",
        "Uses the global object"
      ],
      correct: 1,
      explanation: "The new operator has the highest priority. Even on a bound function, new creates a fresh object and uses that as this, ignoring whatever was bound."
    },
    {
      question: "What's the output?\n\nfunction Foo() {\n  this.value = 42;\n  return { value: 100 };\n}\nconst a = new Foo();\nconsole.log(a.value);",
      options: ["42", "100", "undefined", "TypeError"],
      correct: 1,
      explanation: "When a constructor returns an object, that object replaces the auto-created this. So a is { value: 100 }, not the object where value was set to 42."
    },
    {
      question: "Which statement about 'this' in arrow functions is FALSE?",
      options: [
        "Arrow functions inherit 'this' from the enclosing lexical scope",
        "call() and apply() cannot change an arrow function's this",
        "Arrow functions can be used with the new operator if bound first",
        "Arrow functions don't have their own arguments object"
      ],
      correct: 2,
      explanation: "Arrow functions can never be constructors, period. Binding them first doesn't help — JavaScript simply won't let you use new on an arrow function, and it always throws a TypeError."
    }
  ]
};
