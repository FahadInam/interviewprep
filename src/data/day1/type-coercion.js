export const typeCoercion = {
  id: "type-coercion",
  title: "Type Coercion & Quirks",
  icon: "🎭",
  tag: "JavaScript Core",
  tagColor: "var(--tag-js)",
  subtitle: "Master JavaScript's type system, coercion rules, and the edge cases interviewers love.",
  concepts: [
    {
      title: "Implicit vs Explicit Coercion",
      explanations: {
        layman: "Think of it like auto-translate vs manual translate. Implicit coercion is JavaScript quietly converting types behind your back (like '5' + 3 becoming '53'). Explicit coercion is you doing it yourself with Number('5') or String(5).",
        mid: "Implicit coercion happens during operations like +, ==, and if(). The + operator prefers strings, while -, *, / always convert to numbers. Explicit coercion with Number(), String(), Boolean() is predictable and should be your default at input boundaries.",
        senior: "The real danger is silent failures: `'5' - undefined` gives `NaN` without throwing, which can propagate through calculations undetected. TypeScript catches type mismatches at compile time but types are erased at runtime — for data from external APIs, use runtime validation (Zod, io-ts) at system boundaries. Inside your codebase, explicit coercion (`Number(x)`, `String(x)`) makes intent clear and prevents surprises."
      },
      realWorld: "Form inputs are always strings. If you do price + tax without converting, you get string concatenation instead of addition, and your totals are wrong.",
      whenToUse: "Use explicit coercion whenever you receive external data like form values, API responses, or URL params before doing math or comparisons.",
      whenNotToUse: "Coercion is a non-issue when your data comes from validated sources with runtime type checking (Zod, io-ts). TypeScript types alone don't protect you at runtime — they're erased during compilation.",
      pitfalls: "The biggest trap is == with mixed types. It silently converts and gives results like '' == false being true. Stick with === unless you have a specific reason not to.",
      codeExamples: [
        {
          title: "Coercion rules in action",
          code: `// + with a string always concatenates
console.log('5' + 3);
console.log('5' + true);
console.log('5' + null);
console.log('5' + undefined);

// -, *, / always convert to numbers
console.log('5' - 3);
console.log('5' * '3');
console.log('5' / true);
console.log('abc' - 1);

// Boolean conversions: 6 falsy values, everything else is truthy
console.log(Boolean(''));
console.log(Boolean(0));
console.log(Boolean(null));
console.log(Boolean('0'));
console.log(Boolean([]));
console.log(Boolean({}));

// Number conversions have surprising rules
console.log(Number(''));
console.log(Number('  '));
console.log(Number(null));
console.log(Number(undefined));
console.log(Number(true));
console.log(Number(false));
console.log(Number([]));
console.log(Number([1]));
console.log(Number([1,2]));`
        }
      ]
    },
    {
      title: "== vs === and the Abstract Equality Algorithm",
      explanations: {
        layman: "=== is strict: it checks if both the type AND value match. No converting, no surprises. == is loose: it tries to convert one side to match the other before comparing. That's why '5' == 5 is true but '5' === 5 is false.",
        mid: "== follows a specific conversion order when types differ: booleans convert to numbers first, then strings convert to numbers, and objects call valueOf()/toString() to become a primitive. null and undefined only equal each other -- `null == 0` is false. Always use === unless you specifically want `value == null`, which checks for both null and undefined in one comparison. Many codebases and linters allow this as an intentional use of ==.",
        senior: "Walk through `[] == false` step by step: first, `false` converts to `0` (booleans always become numbers first). Now it's `[] == 0`. The array needs to become a primitive, so JS calls `[].toString()` which gives `''`. Now it's `'' == 0`. The empty string converts to the number `0`. So `0 == 0` is `true`. Being able to trace each conversion step like this is what interviewers are looking for -- not just knowing the answer, but showing the 'why' behind each step."
      },
      realWorld: "A common bug: checking if(input == false) when input is '0'. It returns true because '0' coerces to 0 which equals false. Use === and explicit checks instead.",
      whenToUse: "Use === everywhere by default. The only useful == is value == null, which catches both null and undefined in one shot.",
      whenNotToUse: "Never use == for comparing user input, API data, or anything with mixed types unless you can trace every coercion step in your head.",
      pitfalls: "[] == false is true, but if([]) also runs the block because [] is truthy. These two contexts use different coercion rules, which trips up even experienced developers.",
      codeExamples: [
        {
          title: "Abstract equality edge cases",
          code: `// These all involve multi-step coercion
console.log([] == false);
console.log([] == ![]);
console.log('' == false);
console.log('0' == false);
console.log(null == false);
console.log(null == undefined);
console.log(null == 0);
console.log(NaN == NaN);

// Objects use valueOf() first for == comparisons
const obj = {
  valueOf() { return 1; },
  toString() { return '2'; }
};
console.log(obj == 1);
console.log(obj == '2');
console.log(\`\${obj}\`);

// Object + array coercion quirks
console.log([] + []);
console.log([] + {});
console.log({} + []);

// Classic trick: valueOf runs each time == is called
const a = {
  value: 1,
  valueOf() { return this.value++; }
};
console.log(a == 1 && a == 2 && a == 3);`
        }
      ]
    },
    {
      title: "NaN Quirks and Number Edge Cases",
      explanations: {
        layman: "NaN means 'Not a Number' but its type is actually 'number' -- weird, right? Even weirder: NaN is not equal to itself. So NaN === NaN is false. Use Number.isNaN() to check for it reliably.",
        mid: "The global isNaN() coerces its argument to a number first, so isNaN('hello') is true (because Number('hello') is NaN). Number.isNaN() does not coerce -- it only returns true for actual NaN values. Also watch out for 0.1 + 0.2 !== 0.3 due to floating-point precision.",
        senior: "Beyond NaN, handle -0 (which === 0 but behaves differently in division), Infinity from division by zero, and MAX_SAFE_INTEGER limits where integer arithmetic silently loses precision. Use Object.is() to distinguish +0 from -0 and to reliably detect NaN."
      },
      realWorld: "Parsing user input like Number('abc') silently returns NaN. If you don't catch it, NaN spreads through your calculations and corrupts every result it touches.",
      whenToUse: "Always validate parsed numbers with Number.isNaN() before using them in calculations, especially with user-provided data.",
      whenNotToUse: "Don't bother with -0 or Infinity checks in typical UI code. These edge cases matter mainly in math-heavy logic like graphics or financial calculations.",
      pitfalls: "The global isNaN() lies: isNaN('') returns false because Number('') is 0, not NaN. Always use Number.isNaN() for accurate checks.",
      codeExamples: [
        {
          title: "NaN and floating point gotchas",
          code: `// NaN has type 'number' but doesn't equal itself
console.log(typeof NaN);
console.log(NaN === NaN);
console.log(NaN !== NaN);
console.log(NaN == NaN);

// Number.isNaN vs global isNaN
console.log(Number.isNaN(NaN));
console.log(Number.isNaN('hello'));
console.log(isNaN('hello'));
console.log(isNaN(''));

// Self-inequality trick to detect NaN
const isReallyNaN = (x) => x !== x;

// Floating point precision issue
console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);
console.log(Math.abs((0.1 + 0.2) - 0.3) < Number.EPSILON);

// Negative zero and Infinity
console.log(0 === -0);
console.log(Object.is(0, -0));
console.log(1 / 0);
console.log(1 / -0);
console.log(-0 + '');
console.log(JSON.stringify(-0));

// Safe integer limits
console.log(Number.MAX_SAFE_INTEGER);
console.log(9007199254740992 === 9007199254740993);
console.log(Number.isSafeInteger(9007199254740992));`
        }
      ]
    },
    {
      title: "ToPrimitive, valueOf, and Symbol.toPrimitive",
      explanations: {
        layman: "When JavaScript needs to turn an object into a simple value (like a string or number), it asks the object: 'Give me your primitive value.' It does this by calling special methods like valueOf() or toString() on the object.",
        mid: "The ToPrimitive algorithm picks a 'hint' based on context: 'number' for math, 'string' for template literals, 'default' for == and +. With a 'number' hint, it tries valueOf() first, then toString(). With 'string', it's the opposite. Symbol.toPrimitive overrides both.",
        senior: "Date objects receive the 'default' hint for `+`, same as other objects. But Date's `[Symbol.toPrimitive]` implementation treats 'default' the same as 'string', which is why `date + ''` gives a date string, not a timestamp. For other objects, 'default' behaves like 'number'. This Date exception is a classic interview question."
      },
      realWorld: "Libraries like Moment.js use valueOf() to return timestamps, so you can compare dates with < and > directly. Without valueOf, you'd get useless object-to-string comparisons.",
      whenToUse: "Use Symbol.toPrimitive or valueOf when building value-type objects (like Money, Temperature, Duration) that need to work naturally with operators.",
      whenNotToUse: "Don't add custom conversion to regular objects. It makes code harder to reason about and debug, since the conversion is invisible at the call site.",
      pitfalls: "If valueOf() returns an object instead of a primitive, JavaScript falls through to toString(). If both return objects, it throws a TypeError. This chain is easy to break accidentally.",
      codeExamples: [
        {
          title: "Symbol.toPrimitive and custom coercion",
          code: `// Symbol.toPrimitive gives full control over conversion
class Temperature {
  constructor(celsius) {
    this.celsius = celsius;
  }

  [Symbol.toPrimitive](hint) {
    switch (hint) {
      case 'number':  return this.celsius;
      case 'string':  return this.celsius + ' Celsius';
      case 'default': return this.celsius;
    }
  }
}

const temp = new Temperature(100);
console.log(+temp);
console.log(\`\${temp}\`);
console.log(temp + 0);
console.log(temp > 50);

// Same trick as a == 1 && a == 2 && a == 3
const magic = {
  n: 1,
  [Symbol.toPrimitive]() { return this.n++; }
};
console.log(magic == 1 && magic == 2 && magic == 3);

// valueOf vs toString priority
const obj = {
  valueOf()  { console.log('valueOf');  return 42; },
  toString() { console.log('toString'); return 'hello'; }
};

console.log(obj + 1);
console.log(\`\${obj}\`);

// Date uses string hint by default with +
const date = new Date('2024-01-01');
console.log(date + 1);
console.log(+date);`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "Why does [] == false evaluate to true?",
      answer: "Step by step: `[] == false` → first, boolean converts to number: `[] == 0`. Then, array converts via ToPrimitive (toString): `'' == 0`. Finally, string converts to number: `0 == 0` → `true`. The key is that the boolean converts FIRST, before the array.",
      difficulty: "mid",
      followUps: [
        "Why does [] == ![] also return true?",
        "Walk through the coercion of {} + []",
        "How many times does ToPrimitive get called in [] == false?"
      ]
    },
    {
      question: "Explain why typeof null === 'object' and how to properly check for null.",
      answer: "It's a bug from the very first version of JavaScript. Internally, values had type tags, and null's tag was 0, same as objects. It was never fixed because too much code depends on it. To check for null, use value === null. To check for real objects, use typeof value === 'object' && value !== null.",
      difficulty: "easy",
      followUps: [
        "How does `typeof null === 'object'` affect code that checks `typeof x === 'object'` to detect objects?",
        "How do you check if something is a plain object?",
        "What is the type tag system from the original JS engine?"
      ]
    },
    {
      question: "How does the + operator decide between string concatenation and numeric addition?",
      answer: "If either operand is a string (or coerces to a string via ToPrimitive), + concatenates. Otherwise, it adds numbers. Objects get ToPrimitive called with a 'default' hint, which usually calls valueOf() first. The key exception is Date, which prefers toString(), so date + 1 gives a string.",
      difficulty: "mid",
      followUps: [
        "Why does {} + [] give different results in the console vs as an expression?",
        "How does ToPrimitive's hint affect the + operator?",
        "What does Date do differently with the + operator?"
      ]
    },
    {
      question: "Explain the difference between Number.isNaN() and the global isNaN().",
      answer: "Global isNaN() converts its argument to a number first, then checks. So isNaN('hello') is true because Number('hello') is NaN. Number.isNaN() does no conversion -- it only returns true if the value is literally NaN. Always use Number.isNaN() because the global version gives false positives.",
      difficulty: "easy",
      followUps: [
        "How can you detect NaN without any isNaN function?",
        "Why does NaN!== NaN according to IEEE 754?",
        "What other Number.isX methods exist and how do they differ?"
      ]
    },
    {
      question: "How can you make (a == 1 && a == 2 && a == 3) evaluate to true?",
      answer: "Define a custom valueOf() or Symbol.toPrimitive on an object that increments a counter each time it's called. When == compares the object to a number, it calls ToPrimitive, which triggers valueOf(). First call returns 1, second returns 2, third returns 3. This works because == coerces, but would not work with === since no conversion happens. Follow-up: This IS possible with `===` too — using a Proxy with a `get` trap that returns an incrementing value. This is an advanced follow-up interviewers sometimes ask.",
      difficulty: "hard",
      followUps: [
        "Can you do the same with === instead of ==?",
        "What about a === 1 && a === 2 && a === 3?",
        "What other creative uses of Symbol.toPrimitive exist?"
      ]
    },
    {
      question: "Why does 0.1 + 0.2 !== 0.3 and how do you handle floating-point comparisons?",
      answer: "Computers store decimals in binary (IEEE 754), and 0.1 and 0.2 can't be represented exactly, like how 1/3 can't be written exactly in decimal. The tiny rounding errors add up. To compare, check if the difference is smaller than a threshold: Math.abs(a - b) < Number.EPSILON. For money, use integers (cents) or a decimal library.",
      difficulty: "mid",
      followUps: [
        "Why is Number.EPSILON not always sufficient?",
        "How do languages like Python and Java handle this differently?",
        "What is BigDecimal and should JavaScript have it?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Implement a type coercion quiz: predict the output",
      difficulty: "easy",
      description: "Build a function that takes two values and an operator, then returns the result along with step-by-step explanations of what coercion JavaScript performs. It should handle ==, +, and - operators and show how types get converted at each step.",
      solution: `function explainCoercion(a, b, operator) {
  const steps = [];
  const typeA = typeof a;
  const typeB = typeof b;
  let result;

  steps.push(\`Input: \${JSON.stringify(a)} (\${typeA}) \${operator} \${JSON.stringify(b)} (\${typeB})\`);

  switch (operator) {
    case '==':
      result = a == b;
      if (typeA === typeB) {
        steps.push('Same types: using strict equality');
      } else {
        if (a === null || a === undefined) {
          steps.push('null/undefined: only equal to each other');
        } else if (typeA === 'boolean' || typeB === 'boolean') {
          steps.push(\`Boolean converted to number: \${typeA === 'boolean' ? a : b} -> \${Number(typeA === 'boolean' ? a : b)}\`);
        }
        if ((typeA === 'string' || typeA === 'number') && typeB === 'object') {
          steps.push(\`Object ToPrimitive: \${JSON.stringify(b)} -> "\${String(b)}"\`);
        }
      }
      break;
    case '+':
      result = a + b;
      const primA = typeof a === 'object' ? String(a) : a;
      const primB = typeof b === 'object' ? String(b) : b;
      if (typeof primA === 'string' || typeof primB === 'string') {
        steps.push('String found: joining strings');
        steps.push(\`"\${String(a)}" + "\${String(b)}" = "\${result}"\`);
      } else {
        steps.push('No strings: adding numbers');
        steps.push(\`\${Number(a)} + \${Number(b)} = \${result}\`);
      }
      break;
    case '-':
      result = a - b;
      steps.push(\`Both become numbers: \${Number(a)} - \${Number(b)} = \${result}\`);
      break;
  }

  steps.push(\`Result: \${JSON.stringify(result)}\`);
  return { result, steps };
}

console.log(explainCoercion([], false, '=='));

console.log(explainCoercion('5', 3, '+'));

console.log(explainCoercion('5', 3, '-'));

console.log(explainCoercion(null, undefined, '=='));`,
      explanation: "Each operator branch mirrors how JavaScript actually coerces types. The function logs each conversion step so you can trace exactly why '5' + 3 gives '53' but '5' - 3 gives 2. This makes invisible coercion visible and debuggable."
    },
    {
      title: "Implement a safe equality function that handles all edge cases",
      difficulty: "mid",
      description: "Build an equality function that correctly handles cases where === fails: NaN should equal NaN, +0 should not equal -0, and optionally do deep comparison on objects. It should handle Date, RegExp, and nested structures.",
      solution: `function safeEqual(a, b, deep = false) {
  // NaN === NaN is false, but we want it true
  if (Number.isNaN(a) && Number.isNaN(b)) return true;

  // +0 === -0 is true, but we want it false
  if (a === 0 && b === 0) return (1 / a) === (1 / b);

  if (a === b) return true;
  if (!deep) return false;

  // Deep comparison below
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (a === null || b === null) return false;

  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (a instanceof RegExp && b instanceof RegExp) {
    return a.source === b.source && a.flags === b.flags;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  return keysA.every(key =>
    Object.prototype.hasOwnProperty.call(b, key) &&
    safeEqual(a[key], b[key], true)
  );
}

console.log(safeEqual(NaN, NaN));
console.log(safeEqual(0, -0));
console.log(safeEqual(1, 1));
console.log(safeEqual('a', 'a'));

console.log(safeEqual({ a: NaN }, { a: NaN }, true));
console.log(safeEqual([0], [-0], true));
console.log(safeEqual(
  { x: { y: NaN } },
  { x: { y: NaN } },
  true
));`,
      explanation: "The function fixes two quirks of ===: NaN not equaling itself and +0 equaling -0. The 1/a trick works because 1/0 is Infinity and 1/-0 is -Infinity, which are distinguishable. Deep mode recursively applies the same safe checks to nested values."
    },
    {
      title: "Implement Number() from scratch following the spec",
      difficulty: "hard",
      description: "Recreate the Number() conversion function by handling every input type the way the spec defines: undefined becomes NaN, null becomes 0, booleans become 0 or 1, strings get parsed with whitespace trimming and special format support, and objects go through the ToPrimitive algorithm.",
      solution: `function myNumber(value) {
  if (value === undefined) return NaN;

  if (value === null) return 0;

  if (typeof value === 'boolean') return value ? 1 : 0;

  if (typeof value === 'number') return value;

  if (typeof value === 'bigint') {
    throw new TypeError('Cannot convert a BigInt value to a number');
  }

  if (typeof value === 'symbol') {
    throw new TypeError('Cannot convert a Symbol value to a number');
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (trimmed === '') return 0;

    // Hex: 0xFF
    if (/^0[xX][0-9a-fA-F]+$/.test(trimmed)) {
      return parseInt(trimmed, 16);
    }

    // Octal: 0o77
    if (/^0[oO][0-7]+$/.test(trimmed)) {
      return parseInt(trimmed.slice(2), 8);
    }

    // Binary: 0b1010
    if (/^0[bB][01]+$/.test(trimmed)) {
      return parseInt(trimmed.slice(2), 2);
    }

    if (trimmed === 'Infinity' || trimmed === '+Infinity') return Infinity;
    if (trimmed === '-Infinity') return -Infinity;

    const num = parseFloat(trimmed);
    if (trimmed === String(num) || /^[+-]?\\d*\\.?\\d+([eE][+-]?\\d+)?$/.test(trimmed)) {
      return num;
    }

    return NaN;
  }

  if (typeof value === 'object') {
    // Symbol.toPrimitive takes highest priority
    const toPrim = value[Symbol.toPrimitive];
    if (typeof toPrim === 'function') {
      const prim = toPrim.call(value, 'number');
      if (typeof prim === 'object' && prim !== null) {
        throw new TypeError('Cannot convert object to primitive value');
      }
      return myNumber(prim);
    }

    // Then try valueOf, then toString
    if (typeof value.valueOf === 'function') {
      const val = value.valueOf();
      if (typeof val !== 'object' || val === null) {
        return myNumber(val);
      }
    }
    if (typeof value.toString === 'function') {
      const str = value.toString();
      if (typeof str !== 'object' || str === null) {
        return myNumber(str);
      }
    }

    throw new TypeError('Cannot convert object to primitive value');
  }
}

console.log(myNumber(undefined));
console.log(myNumber(null));
console.log(myNumber(true));
console.log(myNumber(''));
console.log(myNumber('  42  '));
console.log(myNumber('0xff'));
console.log(myNumber('0b1010'));
console.log(myNumber([]));
console.log(myNumber([1]));
console.log(myNumber([1,2]));
console.log(myNumber({}));`,
      explanation: "This walks through each type exactly as the spec does. The tricky part is objects: it checks Symbol.toPrimitive first, then valueOf, then toString, and only accepts primitive return values. This is why Number([]) returns 0 -- [].toString() gives '', and Number('') gives 0."
    }
  ],
  quiz: [
    {
      question: "What is the result of: typeof NaN?",
      options: ["'NaN'", "'number'", "'undefined'", "'object'"],
      correct: 1,
      explanation: "Despite its name 'Not a Number', NaN's type is 'number'. It represents a failed numeric operation, not the absence of a number type."
    },
    {
      question: "What does Number('') return?",
      options: ["NaN", "0", "undefined", "It throws"],
      correct: 1,
      explanation: "An empty string converts to 0, not NaN. The spec treats empty and whitespace-only strings as 0. Only non-numeric strings like 'abc' give NaN."
    },
    {
      question: "Which expression is true?",
      options: [
        "null == 0",
        "null == false",
        "null == undefined",
        "null == ''"
      ],
      correct: 2,
      explanation: "null only equals undefined (and vice versa) with ==. It does not coerce to 0 or false. This is a special rule in the spec, not a general coercion."
    },
    {
      question: "What is the output of: +[] + +{} + +false + +null?",
      options: ["NaN", "0", "'NaN0'", "'0NaN00'"],
      correct: 0,
      explanation: "`+[]` is 0 (ToPrimitive gives '', then Number('') is 0). `+{}` is NaN (ToPrimitive gives '[object Object]', then Number('[object Object]') is NaN). `+false` is 0 (ToNumber). `+null` is 0 (ToNumber). 0 + NaN + 0 + 0 = NaN."
    },
    {
      question: "What does Object.is(+0, -0) return?",
      options: ["true", "false", "TypeError", "undefined"],
      correct: 1,
      explanation: "Object.is() distinguishes +0 from -0, unlike ===. This matters in rare cases like tracking direction of approach to zero in math operations."
    }
  ]
};
