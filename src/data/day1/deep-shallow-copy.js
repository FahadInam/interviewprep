export const deepShallowCopy = {
  id: "deep-shallow-copy",
  title: "Deep & Shallow Copy",
  icon: "📋",
  tag: "JavaScript Core",
  tagColor: "var(--tag-js)",
  subtitle: "Understand reference vs value semantics and master every cloning technique.",
  concepts: [
    {
      title: "Shallow Copy Techniques",
      explanations: {
        layman: "Imagine photocopying a folder. You get copies of the papers on top, but any stapled packets inside are still the same originals. Change a stapled packet, and both folders show the change.",
        mid: "Spread and Object.assign only copy the first level of properties. Nested objects and arrays still point to the same memory, so changing them in the copy also changes the original.",
        senior: "Shallow copies only duplicate the top-level property slots. Nested objects keep the same reference: `const copy = { ...obj }; copy.nested === obj.nested` is true. So `copy.nested.x = 99` also changes `obj.nested.x`. This is why React's shallow comparison (`Object.is(prev.nested, next.nested)`) returns true for a spread copy -- the nested object IS the same object, so React skips re-rendering even though you think you made a new copy."
      },
      realWorld: "In a React app, you spread your state to create a 'new' object, but a nested user.address object is still shared. Updating the city in the copy silently corrupts the original state.",
      whenToUse: "Use shallow copy when your object is flat or you only need to change top-level fields, like updating a user's name without touching nested data.",
      whenNotToUse: "Skip shallow copy when your object has nested objects or arrays that might be modified later, because those inner pieces are still shared.",
      pitfalls: "The most common mistake is assuming the spread operator creates a full deep copy. It does not. Any nested object or array is still the exact same reference.",
      codeExamples: [
        {
          title: "Shallow copy methods compared",
          code: `const original = {
  name: 'Alice',
  scores: [90, 85, 92],
  address: { city: 'NYC', zip: '10001' }
};

const copy1 = { ...original };
const copy2 = Object.assign({}, original);
const copy3 = Object.fromEntries(Object.entries(original));

copy1.name = 'Bob';
console.log(original.name);

copy1.scores.push(100);
console.log(original.scores);

copy1.address.city = 'LA';
console.log(original.address.city);

console.log(copy1.scores === original.scores);
console.log(copy1.address === original.address);
console.log(copy1 === original);`
        }
      ]
    },
    {
      title: "Deep Copy Techniques",
      explanations: {
        layman: "Deep copy is like rewriting every page in a notebook by hand, including all the sub-pages. Now you have two completely separate notebooks. Changing one does nothing to the other.",
        mid: "structuredClone creates a fully independent copy including nested objects, Dates, Maps, and Sets. The old JSON trick (stringify then parse) loses things like undefined, functions, and Dates.",
        senior: "structuredClone uses the same cloning logic browsers use internally for `postMessage` and `IndexedDB`. It handles circular references, Dates, RegExps, Maps, Sets, and ArrayBuffers out of the box. But it cannot clone functions, DOM nodes, or class instances with methods (the prototype chain is lost). So if your object has `class User { greet() {} }`, the clone will be a plain object with no `greet` method. Know your data shape before choosing a strategy."
      },
      realWorld: "You fetch an API response and cache it, then pass a copy to a component for editing. Without a deep copy, the edits silently modify your cache, and future reads return corrupted data.",
      whenToUse: "Use deep copy when you need a fully independent clone, such as caching API responses, creating undo/redo snapshots, or passing data to web workers.",
      whenNotToUse: "Avoid deep copy on large or flat objects where a shallow copy would be enough. Deep cloning is slower and uses more memory, which adds up in hot paths.",
      pitfalls: "JSON.parse(JSON.stringify()) silently drops functions, undefined values, and Symbols. It also converts Dates to strings and throws on circular references. Many developers do not notice until production.",
      codeExamples: [
        {
          title: "Deep copy methods and their limitations",
          code: `const original = {
  name: 'Alice',
  date: new Date('2024-01-01'),
  pattern: /hello/gi,
  nested: { deep: { value: 42 } },
  set: new Set([1, 2, 3]),
  map: new Map([['key', 'val']]),
  undef: undefined,
  fn: () => 'hello',
  nan: NaN
};

const jsonCopy = JSON.parse(JSON.stringify(original));
console.log(jsonCopy.date);
console.log(jsonCopy.pattern);
console.log(jsonCopy.set);
console.log(jsonCopy.undef);
console.log(jsonCopy.fn);
console.log(jsonCopy.nan);

const cloned = structuredClone(original);
console.log(cloned.date instanceof Date);
console.log(cloned.pattern instanceof RegExp);
console.log(cloned.set instanceof Set);
console.log(cloned.map instanceof Map);
console.log(Number.isNaN(cloned.nan));

cloned.nested.deep.value = 999;
console.log(original.nested.deep.value);

const circular = { name: 'self' };
circular.self = circular;
const circularClone = structuredClone(circular);
console.log(circularClone.self === circularClone);
console.log(circularClone !== circular);`
        }
      ]
    },
    {
      title: "Special Types and Circular References",
      explanations: {
        layman: "Some data types are like oddly shaped packages. A standard copy machine can not handle them. You need special handling for things like Dates, Maps, Sets, and objects that point back to themselves.",
        mid: "Most generic clone helpers break on Maps, Sets, RegExps, and circular references. You need to check each type and handle it individually, or use structuredClone which covers most of these.",
        senior: "A production-grade clone utility must explicitly handle each built-in type and use a WeakMap to track visited nodes for cycle detection. Document which types you support and which you skip, so consumers are not surprised."
      },
      realWorld: "Your app stores user selections in a Set and timestamps as Date objects. A generic deep clone using JSON round-trip converts the Set to an empty object and the Date to a string, breaking downstream logic.",
      whenToUse: "Use special-type-aware cloning when your data contains Dates, RegExps, Maps, Sets, typed arrays, or any circular references.",
      whenNotToUse: "If your data is plain objects and arrays with only primitives, a simple recursive clone or structuredClone is enough. No need to write custom handlers.",
      pitfalls: "Forgetting to track visited objects leads to infinite recursion on circular references. Always use a WeakMap to remember which objects you have already cloned.",
      codeExamples: [
        {
          title: "Custom deep clone handling all special types",
          code: `function deepClone(value, visited = new WeakMap()) {
  if (value === null || typeof value !== 'object') return value;

  if (visited.has(value)) return visited.get(value);

  let clone;

  if (value instanceof Date) {
    clone = new Date(value.getTime());
  } else if (value instanceof RegExp) {
    clone = new RegExp(value.source, value.flags);
    clone.lastIndex = value.lastIndex;
  } else if (value instanceof Map) {
    clone = new Map();
    visited.set(value, clone);
    value.forEach((v, k) => {
      clone.set(deepClone(k, visited), deepClone(v, visited));
    });
    return clone;
  } else if (value instanceof Set) {
    clone = new Set();
    visited.set(value, clone);
    value.forEach(v => {
      clone.add(deepClone(v, visited));
    });
    return clone;
  } else if (ArrayBuffer.isView(value)) {
    clone = new value.constructor(value);
  } else if (value instanceof ArrayBuffer) {
    clone = value.slice(0);
  } else if (Array.isArray(value)) {
    clone = [];
    visited.set(value, clone);
    for (let i = 0; i < value.length; i++) {
      clone[i] = deepClone(value[i], visited);
    }
    return clone;
  } else {
    clone = Object.create(Object.getPrototypeOf(value));
    visited.set(value, clone);

    for (const key of Reflect.ownKeys(value)) {
      const desc = Object.getOwnPropertyDescriptor(value, key);
      if ('value' in desc) {
        desc.value = deepClone(desc.value, visited);
      }
      Object.defineProperty(clone, key, desc);
    }
    return clone;
  }

  visited.set(value, clone);
  return clone;
}

const sym = Symbol('test');
const original = {
  date: new Date(),
  regex: /test/gi,
  map: new Map([['a', { nested: true }]]),
  set: new Set([1, { two: 2 }]),
  buffer: new Uint8Array([1, 2, 3]),
  [sym]: 'symbol property'
};
original.circular = original;

const cloned = deepClone(original);
console.log(cloned.date instanceof Date);
console.log(cloned.date !== original.date);
console.log(cloned.circular === cloned);
console.log(cloned.map.get('a') !== original.map.get('a'));`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "What is the difference between shallow copy and deep copy?",
      answer: "A shallow copy duplicates only the top-level properties. If a property holds an object or array, both the original and the copy point to the same nested object. A deep copy recreates everything, including nested structures, so nothing is shared. For example, spreading an object with a nested address gives you a new outer object, but the address is still the same reference. In real projects, this matters most in state management. If you shallow-copy state and then mutate a nested field, you corrupt the original state without realizing it. My rule of thumb: if the object is flat, shallow copy is fine. If it has any nesting that might change, deep copy.",
      difficulty: "easy",
      followUps: [
        "Is the spread operator deep or shallow?",
        "How would you deep copy an object with circular references?",
        "What is the most efficient way to deep copy?"
      ]
    },
    {
      question: "What are the limitations of JSON.parse(JSON.stringify(obj)) for deep cloning?",
      answer: "JSON.stringify converts an object to a JSON string, and JSON.parse rebuilds it. The problem is JSON only supports strings, numbers, booleans, arrays, objects, and null. So Dates become strings, RegExps become empty objects, undefined and functions are silently dropped, NaN becomes null, and circular references throw an error. For example, if you clone { date: new Date() } this way, the cloned date is a string, not a Date object. Calling getTime() on it will crash. It still works well for plain data, like config objects with only strings and numbers, where none of these edge cases apply.",
      difficulty: "mid",
      followUps: [
        "When is JSON stringify/parse still the best option?",
        "How does structuredClone solve these problems?",
        "What about toJSON methods — do they help?"
      ]
    },
    {
      question: "Explain structuredClone and what it can and cannot clone.",
      answer: "structuredClone is a built-in function that creates a deep copy using the same algorithm browsers use for postMessage. It correctly handles Dates, RegExps, Maps, Sets, ArrayBuffers, and even circular references. However, it cannot clone functions, DOM nodes, or objects with prototype chains (like class instances with methods). It also throws on Symbols as property keys. So if your data is plain with some built-in types, structuredClone is the best choice. If your objects have methods or class behavior, you need a custom clone function.",
      difficulty: "mid",
      followUps: [
        "What is the transfer option in structuredClone?",
        "How is structuredClone used in postMessage?",
        "Is structuredClone faster or slower than JSON round-trip?"
      ]
    },
    {
      question: "How would you implement deep equality checking for two objects?",
      answer: "Start with Object.is() for primitives and same-reference checks. Then compare constructors to make sure you are comparing the same type. Handle special types individually: compare Dates by getTime(), RegExps by source and flags, Maps by checking every key-value pair recursively, and Sets by checking if every element in A has a deep match in B. For plain objects, get all own keys with Reflect.ownKeys, confirm both sides have the same count, and recurse into each value. Use a WeakMap to track visited pairs so circular references do not cause infinite loops. The tricky part is Sets with object elements, because you have to do an O(n squared) search since Sets have no key-based lookup for deep comparison.",
      difficulty: "hard",
      followUps: [
        "How does React's shallow comparison work?",
        "How would you handle Sets in deep equality?",
        "What does Lodash's isEqual do differently?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Implement deep equality comparison",
      difficulty: "hard",
      description: "Build a deep equality comparison function that checks if two values are structurally identical. Handle nested objects, arrays, Date, RegExp, and NaN correctly.",
      solution: `function deepEqual(a, b, visited = new WeakMap()) {
  if (Object.is(a, b)) return true;

  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;
  if (typeof a !== 'object') return false;

  if (visited.has(a)) return visited.get(a) === b;
  visited.set(a, b);

  if (a.constructor !== b.constructor) return false;

  if (a instanceof Date) return a.getTime() === b.getTime();

  if (a instanceof RegExp) {
    return a.source === b.source && a.flags === b.flags;
  }

  if (a instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [key, val] of a) {
      if (!b.has(key) || !deepEqual(val, b.get(key), visited)) return false;
    }
    return true;
  }

  if (a instanceof Set) {
    if (a.size !== b.size) return false;
    for (const val of a) {
      let found = false;
      if (typeof val !== 'object' || val === null) {
        found = b.has(val);
      } else {
        for (const bVal of b) {
          if (deepEqual(val, bVal, visited)) { found = true; break; }
        }
      }
      if (!found) return false;
    }
    return true;
  }

  const keysA = Reflect.ownKeys(a);
  const keysB = Reflect.ownKeys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Reflect.has(b, key)) return false;
    if (!deepEqual(a[key], b[key], visited)) return false;
  }

  return true;
}

console.log(deepEqual(NaN, NaN));
console.log(deepEqual({ a: { b: 1 } }, { a: { b: 1 } }));
console.log(deepEqual([1, [2, 3]], [1, [2, 3]]));
console.log(deepEqual(new Date(0), new Date(0)));
console.log(deepEqual(/abc/gi, /abc/gi));
console.log(deepEqual(
  new Map([['a', { x: 1 }]]),
  new Map([['a', { x: 1 }]])
));

const a = { x: 1 }; a.self = a;
const b = { x: 1 }; b.self = b;
console.log(deepEqual(a, b));`,
      explanation: "The function handles primitives first with Object.is, then checks each built-in type individually. A WeakMap tracks visited objects to safely handle circular references without infinite recursion. Sets require a nested loop for deep comparison because you cannot look up objects by value in a Set."
    },
    {
      title: "Implement structuredClone polyfill",
      difficulty: "mid",
      description: "Build a polyfill for structuredClone that handles nested objects, arrays, Date, RegExp, Map, Set, and circular references. Use a WeakMap to track visited objects.",
      solution: `function structuredClonePolyfill(value, transferList = []) {
  const visited = new WeakMap();

  function clone(val) {
    if (val === null || typeof val !== 'object') return val;

    if (visited.has(val)) return visited.get(val);

    if (transferList.includes(val)) {
      if (val instanceof ArrayBuffer) {
        const transferred = val.slice(0);
        visited.set(val, transferred);
        return transferred;
      }
    }

    let result;

    if (val instanceof Date) {
      result = new Date(val.getTime());
    } else if (val instanceof RegExp) {
      result = new RegExp(val.source, val.flags);
    } else if (val instanceof Map) {
      result = new Map();
      visited.set(val, result);
      val.forEach((v, k) => result.set(clone(k), clone(v)));
      return result;
    } else if (val instanceof Set) {
      result = new Set();
      visited.set(val, result);
      val.forEach(v => result.add(clone(v)));
      return result;
    } else if (val instanceof ArrayBuffer) {
      result = val.slice(0);
    } else if (ArrayBuffer.isView(val)) {
      result = new val.constructor(clone(val.buffer), val.byteOffset, val.length);
    } else if (Array.isArray(val)) {
      result = new Array(val.length);
      visited.set(val, result);
      for (let i = 0; i < val.length; i++) {
        result[i] = clone(val[i]);
      }
      return result;
    } else if (typeof val === 'object') {
      if (typeof val === 'function') {
        throw new DOMException('Function cannot be cloned', 'DataCloneError');
      }
      result = {};
      visited.set(val, result);
      for (const key of Object.keys(val)) {
        result[key] = clone(val[key]);
      }
      return result;
    }

    visited.set(val, result);
    return result;
  }

  return clone(value);
}

const original = {
  date: new Date('2024-01-01'),
  nested: { deep: { value: 42 } },
  arr: [1, { two: 2 }, [3]],
  map: new Map([['key', { val: 1 }]]),
  set: new Set([1, 2, 3])
};
original.self = original;

const cloned = structuredClonePolyfill(original);
console.log(cloned.self === cloned);
console.log(cloned.date instanceof Date);
console.log(cloned.nested.deep.value);
cloned.nested.deep.value = 0;
console.log(original.nested.deep.value);`,
      explanation: "The polyfill uses a recursive clone function with a WeakMap for circular reference tracking. Each built-in type (Date, RegExp, Map, Set, ArrayBuffer) gets its own branch to preserve the correct type. For Map and Set, it registers the clone in the WeakMap before recursing into children, which prevents infinite loops on circular data."
    },
    {
      title: "Implement immutable update helper (like Immer's produce)",
      difficulty: "hard",
      description: "Build an immutable update helper similar to Immer's produce(). It should take a base object and a modifier function, then return a new object with only the changed parts cloned.",
      solution: `function produce(base, recipe) {
  const copies = new WeakMap();
  const modified = new WeakSet();

  function createProxy(target, parent, prop) {
    return new Proxy(target, {
      get(obj, key) {
        const source = copies.has(obj) ? copies.get(obj) : obj;
        const value = source[key];

        if (typeof value === 'object' && value !== null) {
          return createProxy(value, obj, key);
        }
        return value;
      },

      set(obj, key, value) {
        if (!copies.has(obj)) {
          const copy = Array.isArray(obj) ? [...obj] : { ...obj };
          copies.set(obj, copy);
          modified.add(obj);

          if (parent && !copies.has(parent)) {
            const parentCopy = Array.isArray(parent) ? [...parent] : { ...parent };
            copies.set(parent, parentCopy);
            modified.add(parent);
          }
          if (parent && copies.has(parent)) {
            copies.get(parent)[prop] = copy;
          }
        }

        copies.get(obj)[key] = value;
        return true;
      },

      deleteProperty(obj, key) {
        if (!copies.has(obj)) {
          copies.set(obj, Array.isArray(obj) ? [...obj] : { ...obj });
          modified.add(obj);
        }
        delete copies.get(obj)[key];
        return true;
      }
    });
  }

  const draft = createProxy(base);
  recipe(draft);

  return copies.has(base) ? copies.get(base) : base;
}

const state = {
  users: [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 }
  ],
  settings: { theme: 'dark' }
};

const nextState = produce(state, draft => {
  draft.users[0].age = 31;
});

console.log(nextState !== state);
console.log(nextState.users[0].age);
console.log(state.users[0].age);
console.log(nextState.settings === state.settings);`,
      explanation: "Produce wraps the base object in a Proxy. When you read, it returns the original data. When you write, it lazily creates a shallow copy of just that object and its parent chain (copy-on-write). Unmodified branches keep the same reference, which is exactly what React needs for efficient re-rendering. Only the parts you touch get cloned."
    }
  ],
  quiz: [
    {
      question: "What does structuredClone do with a function inside the object?",
      options: [
        "Copies the function reference",
        "Creates a new identical function",
        "Throws a DataCloneError",
        "Silently drops the function"
      ],
      correct: 2,
      explanation: "structuredClone follows the structured clone algorithm, which does not support functions. When it encounters a function, it throws a DataCloneError instead of silently ignoring it. This is different from JSON.stringify, which silently drops functions."
    },
    {
      question: "What is the output? const a = [1, 2, 3]; const b = [...a]; b.push(4); console.log(a.length);",
      options: ["4", "3", "undefined", "TypeError"],
      correct: 1,
      explanation: "The spread operator creates a new array with copies of the top-level elements. Since all elements are primitives (numbers), b is fully independent. Pushing to b does not affect a, so a.length remains 3."
    },
    {
      question: "Which cloning method preserves circular references?",
      options: [
        "JSON.parse(JSON.stringify())",
        "Object.assign + spread",
        "structuredClone",
        "Array.from"
      ],
      correct: 2,
      explanation: "structuredClone uses an internal tracking mechanism to handle objects that reference themselves. JSON.stringify throws a TypeError on circular references, and spread/Object.assign only copy one level so they do not even attempt to follow nested references."
    },
    {
      question: "What happens when you structuredClone a Date object?",
      options: [
        "It becomes a string",
        "A new independent Date object is created with the same time",
        "It becomes a number (timestamp)",
        "It throws an error"
      ],
      correct: 1,
      explanation: "structuredClone knows how to handle Date objects. It creates a brand new Date instance with the same timestamp. The clone is completely independent, so modifying one does not affect the other. This is one of structuredClone's advantages over the JSON trick, which turns Dates into strings."
    }
  ]
};
