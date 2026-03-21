export const prototypes = {
  id: "prototypes",
  title: "Prototypes & Inheritance",
  icon: "🧬",
  tag: "JavaScript Core",
  tagColor: "var(--tag-js)",
  subtitle: "Master the prototype chain — the backbone of JavaScript's object system.",
  concepts: [
    {
      title: "The Prototype Chain",
      explanations: {
        layman: "Think of it like a family tree. When you ask someone a question and they don't know the answer, they ask their parent. That parent might ask their parent. JavaScript does the same thing with objects — it keeps looking up the chain until it finds what it needs or runs out of ancestors — which is `null` at the very top. That's where the chain stops.",
        mid: "When you access a property, JavaScript first checks the object itself. If the property isn't there, it follows the hidden __proto__ link to the parent object, then that object's parent, and so on until it reaches null. Methods on the prototype are shared across all instances, saving memory.",
        senior: "The prototype chain doesn't copy methods — it links objects together so they share them. If you change a method on a shared prototype, every object linked to it sees the change immediately. Writing a property behaves differently from reading: `dog.name = 'Rex'` always puts `name` directly on `dog`, even if `name` exists on the prototype. But reading `dog.name` still walks up the chain if `dog` doesn't have its own `name`. This read/write asymmetry causes subtle bugs. Important exception: if the prototype defines a setter for that property (using `set`), assignment calls the setter instead of creating an own property — a genuine gotcha in inheritance hierarchies."
      },
      realWorld: "A UI component library defines a base Component prototype with render() and destroy() methods. Every Button, Modal, and Tooltip inherits these without duplicating the code. When you patch a bug in Component.prototype.destroy(), every component gets the fix immediately.",
      whenToUse: "Use the prototype chain when multiple objects need to share behavior, like giving all user objects the same save() or validate() method.",
      whenNotToUse: "Skip it for plain data objects like config or API response payloads that just hold values and don't need shared methods.",
      pitfalls: "If you store an array or object on the prototype, every instance shares that same reference. One instance pushing to the array modifies it for all instances. Always initialize mutable data inside the constructor.",
      codeExamples: [
        {
          title: "Walking the Prototype Chain",
          code: `function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function() {
  return this.name + ' makes a sound';
};

function Dog(name, breed) {
  Animal.call(this, name);
  this.breed = breed;
}
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
Dog.prototype.bark = function() {
  return this.name + ' barks!';
};

const rex = new Dog('Rex', 'Shepherd');

console.log(rex.bark());
console.log(rex.speak());
console.log(rex.toString());
console.log(rex.hasOwnProperty('name'));
console.log(rex.hasOwnProperty('bark'));`
        },
        {
          title: "Prototype Chain Inspection",
          code: `const parent = { a: 1 };
const child = Object.create(parent);
child.b = 2;

let current = child;
while (current !== null) {
  console.log(Object.getOwnPropertyNames(current));
  current = Object.getPrototypeOf(current);
}`
        }
      ]
    },
    {
      title: "__proto__ vs .prototype",
      explanations: {
        layman: "Think of .prototype as a blueprint that a factory (constructor function) uses. When the factory builds a new object, that object gets a hidden link (__proto__) pointing back to the blueprint. The blueprint belongs to the factory. The link belongs to the object.",
        mid: ".prototype is a property on constructor functions — it's the object that will become the __proto__ of any instance created with new. __proto__ is the actual link on every object that JavaScript follows during property lookup. Use Object.getPrototypeOf() instead of __proto__ in real code, because `__proto__` is a legacy feature that's slower and not guaranteed in all environments.",
        senior: "`__proto__` is actually a getter/setter defined on `Object.prototype` — it's not baked into every object. Under the hood, the engine stores each object's parent link in a hidden field (the spec calls it [[Prototype]], but you never touch it directly). Since `__proto__` lives on `Object.prototype`, objects created with `Object.create(null)` don't have it — they have no prototype at all, so the getter doesn't exist. This is why `Object.create(null)` objects are useful as safe dictionaries: no inherited properties means no accidental collisions with keys like `'constructor'` or `'toString'`."
      },
      realWorld: "When debugging why an instance is missing a method, you check instance.__proto__ (or Object.getPrototypeOf(instance)) to see which prototype it's actually linked to. If someone reassigned Constructor.prototype after the instance was created, the instance still points to the old prototype object.",
      whenToUse: "Understand this distinction when setting up inheritance chains, debugging missing methods, or inspecting objects in the console.",
      whenNotToUse: "Don't use __proto__ directly in application code. It's slower than normal property access and is only in the spec for backward compatibility (Annex B).",
      pitfalls: "Reassigning Constructor.prototype after creating instances doesn't update existing instances. They still point to the old prototype object. New instances will use the new one.",
      codeExamples: [
        {
          title: "__proto__ vs .prototype distinction",
          code: `function Person(name) {
  this.name = name;
}
Person.prototype.greet = function() {
  return 'Hi, I am ' + this.name;
};

const alice = new Person('Alice');

console.log(typeof Person.prototype);
console.log(Person.prototype.greet);

console.log(alice.__proto__ === Person.prototype);
console.log(Object.getPrototypeOf(alice) === Person.prototype);

console.log(Person.__proto__ === Function.prototype);`
        }
      ]
    },
    {
      title: "Object.create() and Constructor Property",
      explanations: {
        layman: "Object.create() is like saying 'make me a new empty object, but when it can't find something, it should ask this other object.' It's a clean way to set up that parent-child relationship without calling any constructor function.",
        mid: "`Object.create(proto)` creates a new empty object whose parent is set to `proto`. Unlike `new`, it doesn't call a constructor — you just get a blank object linked to whatever you passed in. The `constructor` property on a prototype is just a regular property that by convention points back to the constructor function. It's not a reliable tracker — it can be overwritten or deleted. When you replace the prototype object entirely (like `Dog.prototype = Object.create(Animal.prototype)`), this convention breaks, so always reassign it manually with `Dog.prototype.constructor = Dog`.",
        senior: "Object.create(null) produces a truly bare object with no prototype — no toString, no hasOwnProperty, no __proto__ accessor. This is essential for safe dictionary/map objects where user-supplied keys could collide with inherited properties (prototype pollution defense)."
      },
      realWorld: "ORMs and configuration libraries use Object.create(null) to build lookup tables from user input. This prevents keys like 'constructor' or '__proto__' from accidentally invoking inherited methods, which is a real prototype pollution attack vector.",
      whenToUse: "Use Object.create() when you need to set up inheritance without running a constructor, or when you need a truly empty object with no inherited properties.",
      whenNotToUse: "For simple object creation where you don't need custom prototype chains, just use object literals {} or class syntax.",
      pitfalls: "When you do Child.prototype = Object.create(Parent.prototype), you lose the original constructor reference. Always add Child.prototype.constructor = Child right after, or instanceof and constructor checks will give wrong results.",
      codeExamples: [
        {
          title: "Object.create patterns",
          code: `const dict = Object.create(null);
dict['__proto__'] = 'safe';
console.log(dict.__proto__);

function Shape(color) { this.color = color; }
Shape.prototype.describe = function() { return 'A ' + this.color + ' shape'; };

function Circle(color, radius) {
  Shape.call(this, color);
  this.radius = radius;
}
Circle.prototype = Object.create(Shape.prototype);
Circle.prototype.constructor = Circle;
Circle.prototype.area = function() { return Math.PI * this.radius ** 2; };

const c = new Circle('red', 5);
console.log(c.describe());
console.log(c.area());
console.log(c.constructor === Circle);`
        }
      ]
    },
    {
      title: "Prototypal vs Classical Inheritance",
      explanations: {
        layman: "JavaScript's class keyword is like putting a nice label on a box. JavaScript classes look like classes in Java or Python, but under the hood they work differently — objects link to other objects and share methods through those links. The `class` keyword is just a cleaner way to write the same thing.",
        mid: "ES6 `class` syntax is syntactic sugar over prototype-based inheritance. Under the hood, class methods go on the prototype, and `extends` sets up the prototype chain the same way `Object.create()` does. One practical detail: when you write `super.method()`, JavaScript remembers which object the method was originally defined on — so `super` always points to the right parent, even if you copy that method onto a different object. Knowing this helps you debug unexpected behavior when mixing classes with plain objects.",
        senior: "When you write `class Dog extends Animal`, JavaScript doesn't copy Animal's methods into Dog. Instead, Dog's prototype has a link to Animal's prototype — when you call a method on a Dog instance that doesn't exist on `Dog.prototype`, it follows the link to `Animal.prototype` and uses that one. The `class` keyword is syntactic sugar over this linking. Since JS doesn't support extending multiple classes, the common workaround is mixins: copying methods from multiple source objects onto a prototype using `Object.assign()` or a custom helper. The tradeoff is that mixin conflicts are silent — if two mixins define the same method name, the last one wins with no warning."
      },
      realWorld: "When migrating a legacy codebase from constructor functions to ES6 classes, the refactored code works identically because the prototype chain is the same. But you might break code that relied on methods being enumerable (for...in loops) since class methods are non-enumerable by default.",
      whenToUse: "Use class syntax for any new code involving inheritance — it's cleaner, more familiar to most developers, and enforces good patterns like requiring new.",
      whenNotToUse: "Don't use deep inheritance hierarchies (more than 2-3 levels). Prefer composition (mixing behaviors) over inheritance when objects need features from multiple sources.",
      pitfalls: "Assuming class works like Java or C#. There are no private fields by default (use # syntax), no method overloading, and subclass constructors must call super() before using this.",
      codeExamples: [
        {
          title: "Class syntax vs prototype sugar",
          code: `class Vehicle {
  constructor(make) {
    this.make = make;
  }
  start() {
    return this.make + ' engine started';
  }
  static compare(a, b) {
    return a.make.localeCompare(b.make);
  }
}

class Car extends Vehicle {
  constructor(make, model) {
    super(make);
    this.model = model;
  }
  describe() {
    return this.make + ' ' + this.model;
  }
}

function VehicleOld(make) { this.make = make; }
VehicleOld.prototype.start = function() { return this.make + ' engine started'; };
VehicleOld.compare = function(a, b) { return a.make.localeCompare(b.make); };

function CarOld(make, model) {
  VehicleOld.call(this, make);
  this.model = model;
}
CarOld.prototype = Object.create(VehicleOld.prototype);
CarOld.prototype.constructor = CarOld;
CarOld.prototype.describe = function() { return this.make + ' ' + this.model; };

const c1 = new Car('Toyota', 'Camry');
const c2 = new CarOld('Toyota', 'Camry');
console.log(c1.start());
console.log(c2.start());`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "What is the prototype chain and how does property lookup work in JavaScript?",
      answer: "When you access a property on an object, JavaScript first checks the object's own properties. If it's not found, it follows a hidden link to the object's parent (its prototype) and checks there. This continues up the chain until the property is found or the chain ends at null — which sits above Object.prototype, meaning there's nothing left to check. For example, when you call dog.toString(), JavaScript checks the dog instance, then Dog.prototype, then Animal.prototype, then Object.prototype where toString lives. Writing a property always creates it on the object itself, even if the same name exists up the chain — this is called shadowing.",
      difficulty: "easy",
      followUps: [
        "What happens when you assign a property that exists on the prototype?",
        "What happens when you set a property that exists on the prototype?",
        "How do you check if a property is an own property vs inherited?"
      ]
    },
    {
      question: "Explain the difference between __proto__, [[Prototype]], and .prototype",
      answer: "Every object has a hidden parent link that the engine uses for the lookup chain — you can't access it directly in code. `__proto__` is a getter/setter on `Object.prototype` that exposes this hidden link — it exists for legacy reasons and is only in the spec for backward compatibility (Annex B). `.prototype` is a regular property on constructor functions — it's the object that becomes the parent of any instance created with `new`. So: `Person.prototype` is the blueprint, `alice.__proto__` points to that blueprint, and the hidden link is the engine-level mechanism that makes the chain work. Use `Object.getPrototypeOf()` instead of `__proto__` in production code.",
      difficulty: "mid",
      followUps: [
        "Why is __proto__ in Annex B and not the main?",
        "What does Object.getPrototypeOf return for Object.prototype?",
        "Can __proto__ be a regular property key?"
      ]
    },
    {
      question: "Why is modifying an object's prototype at runtime considered a performance antipattern?",
      answer: "JavaScript engines like V8 optimize property access using hidden classes (called 'shapes' or 'maps'). When an object is created, the engine assigns it a shape based on its structure and prototype. If you change the prototype at runtime using Object.setPrototypeOf() or __proto__, the engine has to throw away its optimizations — inline caches become invalid, and the object falls into a slow 'dictionary mode.' This affects not just that object but can de-optimize entire functions. The right approach is to set up the full prototype chain before creating instances and never mutate it afterward.",
      difficulty: "hard",
      followUps: [
        "What are hidden classes / shapes and how do they optimize property access?",
        "How does inline caching work in V8?",
        "What's the difference between monomorphic and megamorphic call sites?"
      ]
    },
    {
      question: "How does 'new' keyword work step by step?",
      answer: "The `new` keyword does four things: (1) Creates a brand new empty object. (2) Links that object's prototype to the constructor's `.prototype` property, so the new object can access shared methods. (3) Calls the constructor function with `this` bound to the new object, so `this.name = name` writes to the new object. (4) If the constructor returns a non-primitive (object or function), that return value is used instead. If it returns a primitive or nothing, the new object from step 1 is returned. This is why returning a string from a constructor is ignored, but returning `{ custom: true }` would replace the instance. Exception: returning `null` from a constructor is treated as a primitive (ignored), even though `typeof null === 'object'`. The new object is returned instead.",
      difficulty: "mid",
      followUps: [
        "What happens if you forget 'new' with a regular function?",
        "How does 'new' interact with arrow functions?",
        "What changes if the constructor returns an object instead of nothing?"
      ]
    },
    {
      question: "What is the difference between Object.create(null) and a regular object literal {}?",
      answer: "An object literal `{}` has `Object.prototype` as its prototype, so it inherits `toString`, `hasOwnProperty`, `constructor`, and other built-in methods. `Object.create(null)` creates an object with absolutely no prototype — its parent link is `null`, so the prototype chain is completely empty. This means no inherited properties at all. This is useful for creating safe dictionary objects where keys come from user input. With a regular `{}`, a key like `'constructor'` or `'__proto__'` could accidentally access inherited properties. With `Object.create(null)`, every key is just data. The trade-off is that utility methods like `hasOwnProperty` won't be available — you'd need to call `Object.prototype.hasOwnProperty.call(dict, key)` instead.",
      difficulty: "mid",
      followUps: [
        "Why might Object.create(null) break some utility functions?",
        "How does this relate to prototype pollution attacks?",
        "What about Map — when would you use that instead?"
      ]
    },
    {
      question: "Explain how instanceof works internally and when it can fail.",
      answer: "`instanceof` checks if `Constructor.prototype` exists anywhere in the object's prototype chain. It walks up the chain starting from the object's prototype — the object's own properties are not part of the check. It fails in several cases: (1) Across iframes/windows — an Array created inside an iframe has a different `Array.prototype` than the one in the main page, so `arr instanceof Array` returns false even though it's clearly an array. (2) Prototype reassignment — if you replace `Constructor.prototype` after creating an instance, the old instance won't pass the check because it still links to the old prototype. (3) `Object.create(null)` objects — they have no prototype chain, so they're never `instanceof` anything. You can customize the behavior with `Symbol.hasInstance` (a special method that overrides what `instanceof` does), and for safe cross-window checks, use `Array.isArray()` or `Object.prototype.toString.call()`.",
      difficulty: "hard",
      followUps: [
        "How would you implement a reliable cross-realm type check?",
        "What is Symbol.hasInstance and how does it customize instanceof?",
        "Why does typeof null === 'object' but null instanceof Object === false?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Implement your own 'new' operator",
      difficulty: "mid",
      description: "Write a function myNew(Constructor, ...args) that behaves exactly like the new keyword. It should create an object linked to the constructor's prototype, call the constructor, and handle the case where the constructor returns an object.",
      solution: `function myNew(Constructor, ...args) {
  const obj = Object.create(Constructor.prototype);

  const result = Constructor.apply(obj, args);

  return (result !== null && typeof result === 'object') || typeof result === 'function'
    ? result
    : obj;
}

function Person(name, age) {
  this.name = name;
  this.age = age;
}
Person.prototype.greet = function() { return 'Hi, I am ' + this.name; };

const p = myNew(Person, 'Alice', 30);
console.log(p.greet());
console.log(p instanceof Person);

function Odd() {
  return { custom: true };
}
const w = myNew(Odd);
console.log(w.custom);
console.log(w instanceof Odd);`,
      explanation: "Object.create(Constructor.prototype) handles steps 1 and 2 — creating an empty object with the right prototype link. Constructor.apply(obj, args) handles step 3 — running the constructor with 'this' set to our new object. The return check handles step 4 — if the constructor returned an object, use that instead. The instanceof check on 'Odd' returns false because the returned object has no link to Odd.prototype."
    },
    {
      title: "Implement instanceof",
      difficulty: "mid",
      description: "Write a function myInstanceof(obj, Constructor) that walks the prototype chain of obj and returns true if Constructor.prototype is found anywhere in the chain.",
      solution: `function myInstanceof(obj, Constructor) {
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) {
    return false;
  }

  const target = Constructor.prototype;

  let proto = Object.getPrototypeOf(obj);
  while (proto !== null) {
    if (proto === target) return true;
    proto = Object.getPrototypeOf(proto);
  }

  return false;
}

function Animal() {}
function Dog() {}
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

const d = new Dog();
console.log(myInstanceof(d, Dog));
console.log(myInstanceof(d, Animal));
console.log(myInstanceof(d, Object));
console.log(myInstanceof(d, Array));
console.log(myInstanceof(42, Number));`,
      explanation: "The function walks up the prototype chain using Object.getPrototypeOf(), comparing each link to Constructor.prototype. It returns true the moment it finds a match. Primitives like 42 return false immediately because they're not objects (even though typeof new Number(42) is 'object'). The last check shows myInstanceof(42, Number) is false — instanceof only works on object references, not primitive values."
    },
    {
      title: "Create a mixin system using prototypes",
      difficulty: "hard",
      description: "Build a mixin() function that copies methods from one or more source objects onto a target prototype. It should handle property descriptors correctly, skip the constructor property, and support Symbol-keyed properties.",
      solution: `function mixin(target, ...sources) {
  for (const source of sources) {
    const descriptors = Object.getOwnPropertyDescriptors(source);

    for (const [key, descriptor] of Object.entries(descriptors)) {
      if (key === 'constructor') continue;
      Object.defineProperty(target, key, descriptor);
    }

    for (const sym of Object.getOwnPropertySymbols(source)) {
      Object.defineProperty(target, sym, Object.getOwnPropertyDescriptor(source, sym));
    }
  }
  return target;
}

const Serializable = {
  serialize() {
    return JSON.stringify(this);
  },
  toJSON() {
    const result = {};
    for (const key of Object.keys(this)) {
      result[key] = this[key];
    }
    return result;
  }
};

const EventEmitter = {
  on(event, handler) {
    if (!this._events) this._events = {};
    (this._events[event] ||= []).push(handler);
    return this;
  },
  emit(event, ...args) {
    if (!this._events?.[event]) return;
    this._events[event].forEach(fn => fn.apply(this, args));
  }
};

class User {
  constructor(name) { this.name = name; }
}

mixin(User.prototype, Serializable, EventEmitter);

const user = new User('Alice');
user.on('greet', () => console.log('Hello!'));
user.emit('greet');
console.log(user.serialize());
console.log(user instanceof User);`,
      explanation: "Using Object.getOwnPropertyDescriptors preserves getters, setters, and configurability — Object.assign would lose these. Skipping 'constructor' prevents accidentally overwriting the target's constructor reference. Symbol-keyed properties need separate handling because Object.entries only returns string keys. This pattern is similar to what frameworks like Ember used for mixins. React's old mixin system worked differently (it was class-component specific, not prototype-based), but the idea of composing behavior from multiple sources is the same."
    }
  ],
  quiz: [
    {
      question: "What does Object.getPrototypeOf(Object.prototype) return?",
      options: ["Object", "Function.prototype", "null", "undefined"],
      correct: 2,
      explanation: "`Object.prototype` is the top of the prototype chain. Its parent link is `null` — there's nothing above it. This `null` is what stops the property lookup from running forever. This is why accessing a property that doesn't exist anywhere returns `undefined` rather than throwing — the engine reaches `null`, sees there's nowhere else to look, and returns `undefined`."
    },
    {
      question: "What is the result of: function F() {}; F.prototype = { x: 1 }; const a = new F(); F.prototype = { y: 2 }; console.log(a.x, a.y);",
      options: ["1, 2", "undefined, 2", "1, undefined", "undefined, undefined"],
      correct: 2,
      explanation: "When `a` was created, its prototype link was set to the object `{ x: 1 }`. Reassigning `F.prototype` to a new object `{ y: 2 }` doesn't change `a` — it still links to the original. So `a.x` finds `1` through the chain, but `a.y` is `undefined` because `{ y: 2 }` is a completely different object that `a` has no connection to."
    },
    {
      question: "Which statement about __proto__ is FALSE?",
      options: [
        "It's defined as an accessor on Object.prototype",
        "It's part of the main ECMAScript specification",
        "Object.create(null) objects don't have __proto__ accessor",
        "Setting __proto__ to a primitive silently does nothing"
      ],
      correct: 1,
      explanation: "__proto__ is in Annex B of the ECMAScript spec, which covers legacy web browser features — it's not part of the main normative spec. It exists because browsers implemented it before it was standardized, and removing it would break the web. The other three statements are all true."
    },
    {
      question: "What does the 'new' operator return if the constructor explicitly returns a string?",
      options: [
        "The string value",
        "undefined",
        "The newly created object (the string is ignored)",
        "It throws a TypeError"
      ],
      correct: 2,
      explanation: "The new operator only respects the return value if it's an object (or function). Primitive return values like strings, numbers, and booleans are ignored, and the newly created object is returned instead. This is why return 'hello' in a constructor has no effect, but return { custom: true } would replace the instance. Note: `null` is technically a primitive despite `typeof null === 'object'`. Returning `null` from a constructor is ignored — the new object is still returned."
    }
  ]
};
