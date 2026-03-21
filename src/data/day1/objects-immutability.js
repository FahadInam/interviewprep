export const objectsImmutability = {
  id: "objects-immutability",
  title: "Objects & Immutability",
  icon: "🧊",
  tag: "JavaScript Core",
  tagColor: "var(--tag-js)",
  subtitle: "Deep dive into object manipulation, freezing, sealing, and immutability patterns.",
  concepts: [
    {
      title: "Object Static Methods",
      explanations: {
        layman: "Think of objects like a filing cabinet. Object static methods are the tools that let you list the labels, pull out the contents, or make a copy of the whole cabinet without messing up the original.",
        mid: "Object.keys, Object.values, Object.entries, and Object.assign let you read and copy objects in a controlled way. They all produce shallow results, so nested objects still share the same reference.",
        senior: "Object.assign triggers setters on the target while spread does not -- this matters in reactive systems like Vue 2 where `set val(v) { ... }` is how reactivity works. For transformations, `Object.fromEntries(Object.entries(obj).map(...))` lets you remap keys or values without mutating the original. Both are shallow: `{ ...obj }` copies references, so `copy.nested === obj.nested` is still true."
      },
      realWorld: "In a Redux reducer, you use Object.assign or spread to merge updated fields into state without mutating the previous state object.",
      whenToUse: "Use these when you need to inspect, copy, or transform object properties without directly mutating the source.",
      whenNotToUse: "Skip these for simple local variables that nobody else reads. Direct property access is simpler and faster.",
      pitfalls: "Object.assign is shallow. If your object has nested objects, the inner ones are still shared references, so changing them affects both the copy and the original.",
      codeExamples: [
        {
          title: "Object static methods in action",
          code: `const user = {
  name: 'Alice',
  age: 25,
  active: true
};

console.log(Object.keys(user));
console.log(Object.values(user));
console.log(Object.entries(user));

const defaults = { age: 0, active: false, role: 'guest' };
const merged = Object.assign({}, defaults, user);
console.log(merged);

const upper = Object.fromEntries(
  Object.entries(user).map(([k, v]) => [k.toUpperCase(), v])
);
console.log(upper);

const obj = {
  _val: '',
  set val(v) { this._val = v.toUpperCase(); }
};
Object.assign(obj, { val: 'hello' });
console.log(obj._val);`
        }
      ]
    },
    {
      title: "Object.freeze, Object.seal, and Object.preventExtensions",
      explanations: {
        layman: "Imagine a form. preventExtensions means you cannot add new fields but can edit or erase existing ones. seal means you can edit values but cannot add or remove fields. freeze means the form is laminated -- nothing can change at all.",
        mid: "All three are shallow. They only lock the top-level properties. If a property holds another object, that nested object is still fully mutable unless you freeze it too.",
        senior: "In strict mode, violations throw TypeError, which is useful for catching accidental mutations early. In sloppy mode, violations silently fail, making bugs harder to find. Frozen objects also benefit from V8's optimization: since the engine knows the object shape will never change (no properties added/removed/reconfigured), it can optimize property lookups. But the act of freezing has a one-time cost, so freezing thousands of small objects in a hot loop can hurt more than help."
      },
      realWorld: "You freeze a config object loaded at app startup so that no module can accidentally overwrite database credentials or feature flags at runtime.",
      whenToUse: "Use freeze or seal when you have shared objects like configs or constants that should never be changed after creation.",
      whenNotToUse: "Avoid freezing objects that are meant to be updated frequently, like component state or objects in a hot loop, since the protection adds overhead with no benefit.",
      pitfalls: "Object.freeze only locks one level deep. If you freeze { a: { b: 1 } }, you can still change a.b because the nested object is not frozen.",
      codeExamples: [
        {
          title: "Freeze vs Seal vs PreventExtensions comparison",
          code: `'use strict';

const obj1 = { a: 1, b: { c: 2 } };
Object.preventExtensions(obj1);
obj1.a = 10;
delete obj1.a;

const obj2 = { a: 1, b: { c: 2 } };
Object.seal(obj2);
obj2.a = 10;

const obj3 = { a: 1, b: { c: 2 } };
Object.freeze(obj3);
obj3.b.c = 999;
console.log(obj3.b.c);

console.log(Object.isFrozen(obj3));
console.log(Object.isSealed(obj3));
console.log(Object.isExtensible(obj3));`
        }
      ]
    },
    {
      title: "Deep Freeze and Immutability Patterns",
      explanations: {
        layman: "Regular freeze is like putting a lock on the front door but leaving the windows open. Deep freeze walks through every room in the house and locks every door and window.",
        mid: "A deep freeze function recursively visits every nested object and freezes it. You need a WeakSet to track visited objects so you do not get stuck in circular references. This is great for catching accidental mutations during development.",
        senior: "Deep freeze is handy in dev mode and tests, but in performance-critical paths prefer immutable update patterns (spread into a new object) instead. Spreading only copies the changed branch, so unchanged subtrees keep the same reference, which is what React and Redux rely on for fast equality checks."
      },
      realWorld: "In a test suite, you deep-freeze the input fixtures before passing them to functions under test. If any function accidentally mutates the input, the test throws immediately in strict mode instead of silently producing wrong results.",
      whenToUse: "Use deep freeze during development and testing to catch unintended mutations early. Use immutable update patterns (spread) in production code for performance.",
      whenNotToUse: "Avoid deep-freezing large or frequently updated data structures in production. The recursive walk is expensive and the frozen objects cannot be reused for updates.",
      pitfalls: "Forgetting to handle circular references in a deep freeze causes infinite recursion and a stack overflow. Always track visited objects with a WeakSet.",
      codeExamples: [
        {
          title: "Deep freeze implementation",
          code: `function deepFreeze(obj, seen = new WeakSet()) {
  if (obj === null || typeof obj !== 'object' || seen.has(obj)) {
    return obj;
  }

  seen.add(obj);
  Object.freeze(obj);

  const keys = [
    ...Object.getOwnPropertyNames(obj),
    ...Object.getOwnPropertySymbols(obj)
  ];

  for (const key of keys) {
    const val = obj[key];
    if (typeof val === 'object' && val !== null) {
      deepFreeze(val, seen);
    }
  }

  return obj;
}

const config = deepFreeze({
  db: {
    host: 'localhost',
    credentials: { user: 'admin', pass: 'secret' }
  },
  features: ['auth', 'logging']
});`
        },
        {
          title: "Immutable update patterns",
          code: `const state = {
  users: {
    u1: { name: 'Alice', role: 'admin' },
    u2: { name: 'Bob', role: 'user' }
  },
  settings: { theme: 'dark' }
};

const newState = {
  ...state,
  users: {
    ...state.users,
    u1: {
      ...state.users.u1,
      role: 'superadmin'
    }
  }
};

console.log(state.users.u1.role);
console.log(newState.users.u1.role);
console.log(state.settings === newState.settings);`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "What is the difference between Object.freeze() and Object.seal()?",
      answer: "Object.freeze makes an object completely read-only -- you cannot add, remove, or change any properties. Object.seal lets you change existing property values but blocks adding or removing properties. Both are shallow, so nested objects inside are still fully mutable. In production, this matters because developers often assume freeze protects the entire tree, but a nested object can still be mutated unless you deep-freeze it.",
      difficulty: "easy",
      followUps: [
        "How would you implement a deep freeze?",
        "What happens in sloppy mode vs strict mode when violating freeze?",
        "How would you protect a config object shared across multiple modules?"
      ]
    },
    {
      question: "How does Object.assign() differ from the spread operator for object copying?",
      answer: "Object.assign copies enumerable own properties from sources into an existing target object and returns that same target. The spread operator creates a brand-new object. The key difference is that Object.assign triggers setters on the target, while spread does not -- spread treats every property as a plain data write. Both are shallow copies, so nested objects are shared by reference. This matters in frameworks like Vue 2 where setter-based reactivity depends on which method you use.",
      difficulty: "mid",
      followUps: [
        "When would Object.assign's setter-triggering behavior cause bugs with spread?",
        "How does Object.freeze interact with nested objects?",
        "How does this matter for reactive systems like Vue?"
      ]
    },
    {
      question: "Explain Object.defineProperty() and property descriptors.",
      answer: "Object.defineProperty lets you add or modify a single property with fine-grained control using a descriptor object. A data descriptor has value and writable. An accessor descriptor has get and set. Both types share configurable and enumerable. The important catch is that properties created via defineProperty default to writable: false, enumerable: false, configurable: false, which is the opposite of regular assignment where everything defaults to true. Vue 2 used defineProperty to intercept gets and sets for its reactivity system.",
      difficulty: "mid",
      followUps: [
        "What defaults does defineProperty use vs regular assignment?",
        "How do frameworks like Vue use defineProperty?",
        "What is the difference between data and accessor descriptors?"
      ]
    },
    {
      question: "How does Object.is() differ from === and ==?",
      answer: "Object.is uses the SameValue algorithm, which fixes two quirks of ===. First, Object.is(NaN, NaN) returns true, while NaN === NaN is false. Second, Object.is(+0, -0) returns false, while +0 === -0 is true. Everything else behaves the same as ===. React uses Object.is in its useState and useMemo comparisons to decide whether state actually changed, which is why setting state to NaN twice does not trigger a re-render.",
      difficulty: "easy",
      followUps: [
        "Where in the spec is the SameValue algorithm defined?",
        "Why does React use Object.is instead of ===?",
        "When would the +0 vs -0 distinction actually matter?"
      ]
    },
    {
      question: "What are the performance implications of frozen objects in V8?",
      answer: "In V8, frozen objects get a special internal map (hidden class) marked as non-extensible. This means V8 knows the object shape will never change, which can improve inline cache hit rates and allow certain optimizations. However, the act of freezing itself has a cost -- V8 must transition the object to a new map and mark all properties as read-only. For hot paths with many small objects, the transition cost can outweigh the benefits. In practice, deep-freezing large state trees in production is rarely worth it; immutable update patterns with spread give you the safety benefits without the freeze overhead.",
      difficulty: "hard",
      followUps: [
        "How does V8's hidden class system handle property transitions?",
        "What is a monomorphic inline cache?",
        "When would freezing objects in a hot loop hurt performance more than help?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Implement deep freeze with circular reference handling",
      difficulty: "mid",
      description: "Write a deepFreeze function that recursively freezes an object and all its nested objects. It must handle circular references without infinite recursion. Use a WeakSet to track already-visited objects.",
      solution: `function deepFreeze(obj) {
  const seen = new WeakSet();

  function freeze(item) {
    if (item === null || typeof item !== 'object' || seen.has(item)) {
      return item;
    }

    seen.add(item);
    Object.freeze(item);

    const allKeys = [
      ...Object.getOwnPropertyNames(item),
      ...Object.getOwnPropertySymbols(item)
    ];

    for (const key of allKeys) {
      const desc = Object.getOwnPropertyDescriptor(item, key);
      if (desc && 'value' in desc) {
        freeze(desc.value);
      }
    }

    return item;
  }

  return freeze(obj);
}

const a = { name: 'a' };
const b = { name: 'b', ref: a };
a.ref = b;

deepFreeze(a);

console.log(Object.isFrozen(a));
console.log(Object.isFrozen(b));
console.log(Object.isFrozen(a.ref));

const config = deepFreeze({
  db: { host: 'localhost', ports: [5432, 5433] },
  nested: { deep: { value: 42 } }
});`,
      explanation: "The WeakSet tracks every object we have already visited. When we encounter an object that is already in the set, we skip it. This prevents infinite loops caused by circular references like a.ref = b and b.ref = a. We use getOwnPropertyDescriptor to only freeze data properties (those with a value field), skipping accessor properties whose getters might have side effects."
    },
    {
      title: "Implement a function that returns the differences between two objects",
      difficulty: "mid",
      description: "Write a diff function that compares two objects and returns an array of changes. Each change should include the type (added, removed, or changed), the dot-separated path, and the relevant values. Recurse into nested objects but treat arrays as atomic values.",
      solution: `function diff(oldObj, newObj, path = '') {
  const changes = [];

  const allKeys = new Set([
    ...Object.keys(oldObj || {}),
    ...Object.keys(newObj || {})
  ]);

  for (const key of allKeys) {
    const fullPath = path ? path + '.' + key : key;
    const inOld = oldObj != null && key in oldObj;
    const inNew = newObj != null && key in newObj;

    if (!inOld && inNew) {
      changes.push({ type: 'added', path: fullPath, value: newObj[key] });
    } else if (inOld && !inNew) {
      changes.push({ type: 'removed', path: fullPath, oldValue: oldObj[key] });
    } else if (inOld && inNew) {
      const oldVal = oldObj[key];
      const newVal = newObj[key];

      if (typeof oldVal === 'object' && oldVal !== null &&
          typeof newVal === 'object' && newVal !== null &&
          !Array.isArray(oldVal) && !Array.isArray(newVal)) {
        changes.push(...diff(oldVal, newVal, fullPath));
      } else if (!Object.is(oldVal, newVal)) {
        changes.push({
          type: 'changed',
          path: fullPath,
          oldValue: oldVal,
          newValue: newVal
        });
      }
    }
  }

  return changes;
}

const before = {
  name: 'Alice',
  age: 30,
  address: { city: 'NYC', zip: '10001' },
  hobbies: ['reading']
};

const after = {
  name: 'Alice',
  age: 31,
  address: { city: 'LA', zip: '10001', state: 'CA' },
  role: 'admin'
};

console.log(diff(before, after));`,
      explanation: "We collect all keys from both objects into a Set so we catch additions and removals. For each key, we check presence in both objects to classify the change. When both values are plain objects (not arrays), we recurse to get nested diffs. Arrays and primitives are compared with Object.is so NaN === NaN edge cases are handled correctly."
    },
    {
      title: "Implement Object.assign from scratch",
      difficulty: "easy",
      description: "Write a myAssign function that behaves like Object.assign. It should copy all enumerable own properties (including Symbols) from source objects into the target. It must trigger setters on the target, throw on null/undefined targets, and return the same target reference.",
      solution: `function myAssign(target, ...sources) {
  if (target == null) {
    throw new TypeError('Cannot convert undefined or null to object');
  }

  const result = Object(target);

  for (const source of sources) {
    if (source == null) continue;

    const obj = Object(source);

    for (const key of Object.keys(obj)) {
      result[key] = obj[key];
    }

    for (const sym of Object.getOwnPropertySymbols(obj)) {
      const desc = Object.getOwnPropertyDescriptor(obj, sym);
      if (desc.enumerable) {
        result[sym] = obj[sym];
      }
    }
  }

  return result;
}

const target = { a: 1, b: 2 };
const result = myAssign(target, { b: 3, c: 4 }, { d: 5 });
console.log(result);
console.log(result === target);

const obj = {
  _x: 0,
  set x(val) { this._x = val * 2; }
};
myAssign(obj, { x: 5 });
console.log(obj._x);`,
      explanation: "We use simple assignment (result[key] = obj[key]) rather than defineProperty because Object.assign is supposed to trigger setters on the target. Object.keys handles string keys, but we also need Object.getOwnPropertySymbols for Symbol keys, filtered by enumerable. Null and undefined sources are silently skipped, but a null or undefined target throws."
    }
  ],
  quiz: [
    {
      question: "What is the default value of 'writable' when using Object.defineProperty()?",
      options: ["true", "false", "undefined", "It depends on the property type"],
      correct: 1,
      explanation: "When you use Object.defineProperty, all descriptor flags default to false. This is the opposite of regular assignment (obj.x = 1), where writable, enumerable, and configurable all default to true."
    },
    {
      question: "What does Object.keys() return for: Object.keys({ 2: 'b', 1: 'a', z: 'c' })?",
      options: [
        "['2', '1', 'z']",
        "['1', '2', 'z']",
        "['z', '1', '2']",
        "['a', 'b', 'c']"
      ],
      correct: 1,
      explanation: "JavaScript sorts integer-like keys numerically first, then string keys in insertion order. So 1 comes before 2 (numeric sort), then z comes last (insertion order among non-integer keys). The result is ['1', '2', 'z']."
    },
    {
      question: "After Object.seal(obj), which operation will succeed?",
      options: [
        "Adding a new property",
        "Deleting an existing property",
        "Changing the value of an existing writable property",
        "Changing a property from data to accessor descriptor"
      ],
      correct: 2,
      explanation: "Seal prevents adding and deleting properties and blocks descriptor type changes, but it still allows changing values of properties that are writable. That is the key difference between seal and freeze -- freeze also makes every property read-only."
    },
    {
      question: "What does Object.is(NaN, NaN) return?",
      options: ["false", "true", "TypeError", "undefined"],
      correct: 1,
      explanation: "Object.is uses the SameValue algorithm, which treats NaN as equal to NaN. This is different from ===, where NaN !== NaN. React relies on this behavior in its state comparison logic."
    }
  ]
};
