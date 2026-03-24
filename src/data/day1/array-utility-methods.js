export const arrayUtilityMethods = {
  id: "array-utility-methods",
  title: "Array & Utility Methods (Must-Know)",
  icon: "🧰",
  tag: "JavaScript Core",
  tagColor: "var(--tag-js)",
  subtitle: "Every method you need to know for interviews and real work.",
  concepts: [
    // ========== ARRAY TRANSFORMATION METHODS ==========
    {
      title: ".map() — Transform Every Item",
      explanations: {
        layman: "map() goes through each item in an array and changes it based on a rule you give. Like converting a list of prices from dollars to euros — same number of items, just transformed.",
        mid: "map() returns a NEW array with the same length, where each element is the result of your callback. It never changes the original array. The callback gets three arguments: the current item, its index, and the whole array.",
        senior: "map() always returns an array of the same length — if you need fewer items, use filter() first or use reduce(). Never use map() for side effects (like API calls) — use forEach() instead, because map() creates a new array you'd just throw away. For large arrays, consider that map() allocates a new array in memory. If you're chaining map().filter().map(), each step creates a new intermediate array — for performance-critical code, a single reduce() can do it in one pass."
      },
      realWorld: "Rendering lists in React: `users.map(u => <UserCard key={u.id} user={u} />)`",
      whenToUse: "When you need a new array with each item transformed.",
      whenNotToUse: "When you don't need the returned array — use forEach() for side effects.",
      pitfalls: "Forgetting to return inside the callback gives you an array of undefined values.",
      codeExamples: [
        {
          title: "Basic Usage",
          code: `const prices = [10, 20, 30];
const withTax = prices.map(price => price * 1.18);
console.log(withTax); // [11.8, 23.6, 35.4]
console.log(prices);  // [10, 20, 30] — original unchanged

// Using index
const items = ['apple', 'banana', 'cherry'];
const numbered = items.map((item, index) => \`\${index + 1}. \${item}\`);
console.log(numbered); // ['1. apple', '2. banana', '3. cherry']`
        },
        {
          title: "Common Mistake",
          code: `// BAD: forgot to return — you get [undefined, undefined, undefined]
const doubled = [1, 2, 3].map(n => {
  n * 2;  // missing return!
});

// GOOD: either use arrow shorthand or explicit return
const doubled1 = [1, 2, 3].map(n => n * 2);
const doubled2 = [1, 2, 3].map(n => {
  return n * 2;
});`
        }
      ]
    },
    {
      title: ".filter() — Keep Only What Matches",
      explanations: {
        layman: "filter() is like a sieve. You give it a test, and only items that pass the test stay in the new array. Everything else gets removed.",
        mid: "filter() returns a new array containing only the elements where your callback returned true (or a truthy value). The original array is unchanged. If nothing matches, you get an empty array — not null or undefined.",
        senior: "filter() always returns an array, even if empty — so you can safely chain .filter().map() without null checks. For performance: filter() scans the entire array even if you only need the first match — use find() for that. When filtering objects, remember you're keeping references to the same objects, not copies. If you need to filter AND transform, consider reduce() to avoid two passes."
      },
      realWorld: "Filtering search results, showing only active users, removing empty fields from form data.",
      whenToUse: "When you need a subset of an array based on a condition.",
      whenNotToUse: "When you only need the first match — use find() instead.",
      pitfalls: "The callback must return a boolean (or truthy/falsy). Returning the item itself works for non-zero values but fails for 0 or empty strings.",
      codeExamples: [
        {
          title: "Basic Usage",
          code: `const numbers = [1, 2, 3, 4, 5, 6];
const evens = numbers.filter(n => n % 2 === 0);
console.log(evens); // [2, 4, 6]

// Filter objects
const users = [
  { name: 'Ali', active: true },
  { name: 'Sara', active: false },
  { name: 'John', active: true },
];
const activeUsers = users.filter(u => u.active);
console.log(activeUsers); // [{name: 'Ali', ...}, {name: 'John', ...}]

// Remove falsy values (empty strings, null, undefined, 0, false)
const mixed = ['hello', '', null, 'world', 0, undefined, 'hi'];
const clean = mixed.filter(Boolean);
console.log(clean); // ['hello', 'world', 'hi']`
        }
      ]
    },
    {
      title: ".reduce() — Build Anything from an Array",
      explanations: {
        layman: "reduce() goes through an array and builds up a single result. Like counting coins one by one and keeping a running total — each step adds to what you already have.",
        mid: "reduce() takes a callback and an optional initial value. The callback gets the accumulator (running result) and the current item. Whatever you return becomes the new accumulator for the next item. Always provide an initial value — skipping it uses the first element, which causes bugs with empty arrays.",
        senior: "reduce() is the most powerful array method — map, filter, groupBy, flatten can all be written as reduce. But that doesn't mean you should. A chain of map().filter() is more readable than a single reduce() that does both. Use reduce() when you genuinely need to transform an array into a different shape (object, number, nested structure). Always pass an initial value — without one, calling reduce on an empty array throws TypeError."
      },
      realWorld: "Calculating cart totals, grouping items by category, building lookup objects from arrays.",
      whenToUse: "When you need to transform an array into a single value or a different data structure.",
      whenNotToUse: "When map() or filter() can do the job more clearly.",
      pitfalls: "Forgetting the initial value. Not returning the accumulator. Mutating the accumulator in unexpected ways.",
      codeExamples: [
        {
          title: "Common Patterns",
          code: `// Sum
const total = [10, 20, 30].reduce((sum, n) => sum + n, 0);
console.log(total); // 60

// Group by category
const products = [
  { name: 'Shirt', category: 'clothing' },
  { name: 'Pants', category: 'clothing' },
  { name: 'Phone', category: 'electronics' },
];
const grouped = products.reduce((acc, item) => {
  const key = item.category;
  if (!acc[key]) acc[key] = [];
  acc[key].push(item);
  return acc;  // always return the accumulator!
}, {});
// { clothing: [{...}, {...}], electronics: [{...}] }

// Count occurrences
const fruits = ['apple', 'banana', 'apple', 'cherry', 'banana', 'apple'];
const counts = fruits.reduce((acc, fruit) => {
  acc[fruit] = (acc[fruit] || 0) + 1;
  return acc;
}, {});
console.log(counts); // { apple: 3, banana: 2, cherry: 1 }

// Flatten one level (same as .flat())
const nested = [[1, 2], [3, 4], [5]];
const flat = nested.reduce((acc, arr) => acc.concat(arr), []);
console.log(flat); // [1, 2, 3, 4, 5]`
        },
        {
          title: "Common Mistake",
          code: `// BAD: no initial value + empty array = crash
[].reduce((sum, n) => sum + n); // TypeError!

// GOOD: always provide initial value
[].reduce((sum, n) => sum + n, 0); // 0

// BAD: forgot to return accumulator
const result = [1, 2, 3].reduce((acc, n) => {
  acc.push(n * 2);
  // missing: return acc;
}, []);
// result is undefined because nothing was returned`
        }
      ]
    },
    {
      title: ".forEach() — Do Something with Each Item",
      explanations: {
        layman: "forEach() goes through each item and does something with it — like handing out flyers to everyone in a line. Unlike map(), it doesn't give you anything back.",
        mid: "forEach() runs your callback on each element but returns undefined. You can't break out of it or return early — it always goes through every element. For early exit, use a regular for loop or for...of.",
        senior: "forEach() can't be stopped early — no break, no return that skips iterations. If you need early termination, use for...of, .some(), or .every(). forEach() also doesn't work well with async — `array.forEach(async (item) => { await ... })` fires all promises at once without waiting. Use for...of with await for sequential async work."
      },
      realWorld: "Logging items, adding event listeners, sending analytics events — anything where you don't need a new array.",
      whenToUse: "When you want to do something with each item but don't need a new array.",
      whenNotToUse: "When you need early termination, async/await control, or a transformed array.",
      pitfalls: "It always returns undefined. Can't break out early. Doesn't await async callbacks.",
      codeExamples: [
        {
          title: "Basic Usage and Gotchas",
          code: `// Simple iteration
['a', 'b', 'c'].forEach((letter, index) => {
  console.log(\`\${index}: \${letter}\`);
});

// BAD: forEach doesn't wait for async
const urls = ['/api/1', '/api/2', '/api/3'];
urls.forEach(async (url) => {
  const res = await fetch(url); // fires all 3 at once, doesn't wait
});

// GOOD: use for...of for sequential async
for (const url of urls) {
  const res = await fetch(url); // waits for each one
}

// BAD: trying to break out
[1, 2, 3, 4, 5].forEach(n => {
  if (n === 3) return; // this only skips THIS iteration, doesn't stop the loop
  console.log(n); // prints 1, 2, 4, 5 (skips 3 but still continues)
});`
        }
      ]
    },
    {
      title: ".find() & .findIndex() — Get the First Match",
      explanations: {
        layman: "find() looks through an array and gives you the first item that matches your condition. Like searching a phone book and stopping at the first match.",
        mid: "find() returns the first element where your callback returns true. If nothing matches, it returns undefined. findIndex() works the same but returns the position (index) instead, or -1 if not found.",
        senior: "find() stops as soon as it finds a match — unlike filter() which always scans the entire array. This makes find() better for large arrays when you only need one result. Returns the actual object reference (not a copy), so modifying it changes the original. findIndex() is useful when you need the position for splice() or other index-based operations."
      },
      realWorld: "Finding a user by ID, finding the first error in validation, locating an item in a cart.",
      whenToUse: "When you need the first (or only) item matching a condition.",
      whenNotToUse: "When you need ALL matches — use filter().",
      pitfalls: "find() returns undefined if not found, which can be confused with an actual undefined value in the array.",
      codeExamples: [
        {
          title: "find() vs findIndex()",
          code: `const users = [
  { id: 1, name: 'Ali', role: 'admin' },
  { id: 2, name: 'Sara', role: 'user' },
  { id: 3, name: 'John', role: 'user' },
];

// find() returns the object
const admin = users.find(u => u.role === 'admin');
console.log(admin); // { id: 1, name: 'Ali', role: 'admin' }

// findIndex() returns the position
const index = users.findIndex(u => u.id === 3);
console.log(index); // 2

// Not found
const ghost = users.find(u => u.id === 99);
console.log(ghost); // undefined

// Safe pattern — always check before using
const user = users.find(u => u.id === 99);
if (user) {
  console.log(user.name);
} else {
  console.log('Not found');
}`
        }
      ]
    },
    {
      title: ".some() & .every() — Quick True/False Checks",
      explanations: {
        layman: "some() asks: 'Does ANY item pass this test?' — like asking 'Is anyone here over 18?' every() asks: 'Do ALL items pass this test?' — like asking 'Is everyone here over 18?'",
        mid: "some() returns true as soon as one element passes. every() returns false as soon as one element fails. Both short-circuit — they stop early once the answer is known. On an empty array: some() returns false, every() returns true.",
        senior: "Both methods short-circuit, which makes them efficient for large arrays — some() stops at the first true, every() stops at the first false. Use them for validation: `every()` to check all fields are filled, `some()` to check if any field has errors. The empty array behavior follows math conventions (vacuous truth for every, existential for some) — but it surprises people. `[].every(() => false)` is true because there's nothing to fail the test."
      },
      realWorld: "Form validation (every field filled?), permission checks (does user have any admin role?), feature flags.",
      whenToUse: "When you need a yes/no answer about array elements.",
      whenNotToUse: "When you need the actual matching items — use filter() or find().",
      pitfalls: "Empty array: some() returns false, every() returns true — this surprises most people.",
      codeExamples: [
        {
          title: "Practical Examples",
          code: `const ages = [16, 21, 14, 30, 18];

console.log(ages.some(age => age >= 21));  // true — at least one is 21+
console.log(ages.every(age => age >= 18)); // false — not all are 18+

// Form validation
const fields = [
  { name: 'email', value: 'ali@test.com' },
  { name: 'password', value: 'abc123' },
  { name: 'name', value: '' },
];
const allFilled = fields.every(f => f.value.trim() !== '');
console.log(allFilled); // false — name is empty

const hasErrors = fields.some(f => f.value.trim() === '');
console.log(hasErrors); // true

// Empty array surprise
console.log([].some(x => true));   // false — nothing to be true
console.log([].every(x => false)); // true — nothing to be false`
        }
      ]
    },
    // ========== ARRAY MUTATION & SLICING ==========
    {
      title: ".sort() — Sort an Array (Watch Out!)",
      explanations: {
        layman: "sort() rearranges items in an array. But here's the catch — it changes the ORIGINAL array, and by default it sorts everything as text, not numbers. So [10, 2, 1] becomes [1, 10, 2] unless you tell it how to compare.",
        mid: "sort() mutates the original array and returns it. Without a compare function, it converts elements to strings and sorts by Unicode order. For numbers, always pass a compare function: `(a, b) => a - b` for ascending. The compare function should return negative (a first), positive (b first), or zero (equal).",
        senior: "sort() mutates in place — always spread first if you need the original: `[...arr].sort()`. The algorithm is Timsort in V8 (stable since ES2019), meaning equal elements keep their original order. For complex sorting, return negative/0/positive from your comparator — never return just true/false. Sorting objects by multiple fields: sort by primary first, then secondary as tiebreaker. For very large arrays, consider if you actually need full sorting or just the top N items (a partial sort or heap is more efficient)."
      },
      realWorld: "Sorting tables, ordering search results, ranking leaderboards.",
      whenToUse: "When you need elements in a specific order.",
      whenNotToUse: "When you need the original order preserved — make a copy first.",
      pitfalls: "Mutates the original array. Default sort is alphabetical (string-based), not numeric.",
      codeExamples: [
        {
          title: "Sort Numbers and Objects",
          code: `// Default sort = string comparison (WRONG for numbers!)
console.log([10, 2, 1, 20].sort()); // [1, 10, 2, 20] — sorted as strings!

// Correct number sort
console.log([10, 2, 1, 20].sort((a, b) => a - b)); // [1, 2, 10, 20]
console.log([10, 2, 1, 20].sort((a, b) => b - a)); // [20, 10, 2, 1] — descending

// Don't mutate the original
const original = [3, 1, 2];
const sorted = [...original].sort((a, b) => a - b); // copy first!
console.log(original); // [3, 1, 2] — safe
console.log(sorted);   // [1, 2, 3]

// Sort objects by property
const users = [
  { name: 'Charlie', age: 25 },
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
];

// Sort by age, then by name as tiebreaker
users.sort((a, b) => {
  if (a.age !== b.age) return a.age - b.age;
  return a.name.localeCompare(b.name);
});
// [{name: 'Bob', age: 25}, {name: 'Charlie', age: 25}, {name: 'Alice', age: 30}]`
        }
      ]
    },
    {
      title: ".slice() vs .splice() — Copy vs Cut",
      explanations: {
        layman: "slice() copies a portion of an array without touching the original — like photocopying a few pages from a book. splice() cuts items out of the array (and can insert new ones) — like physically ripping pages out and stapling new ones in.",
        mid: "slice(start, end) returns a shallow copy from start to end (end not included). Doesn't mutate. splice(start, deleteCount, ...items) removes elements and optionally inserts new ones — it MUTATES the original and returns the removed items.",
        senior: "slice() is safe for immutable patterns — use it to clone arrays (`arr.slice()` or `[...arr]`), get subarrays, or implement pagination. splice() is the only built-in way to remove/insert at a specific index in-place. In React/Redux, always use slice() or spread — never splice() on state directly. Negative indices work in both: `arr.slice(-2)` gets the last two items."
      },
      realWorld: "Pagination (slice), removing items from a list (splice), getting last N items (slice with negative index).",
      whenToUse: "slice for reading portions without mutation. splice for adding/removing at a specific position.",
      whenNotToUse: "Never splice() on React state or Redux store directly.",
      pitfalls: "Mixing up slice and splice is a classic interview mistake. slice = safe copy, splice = mutates.",
      codeExamples: [
        {
          title: "slice() — Safe Copying",
          code: `const arr = [1, 2, 3, 4, 5];

console.log(arr.slice(1, 3));  // [2, 3] — from index 1 to 3 (not including 3)
console.log(arr.slice(2));     // [3, 4, 5] — from index 2 to end
console.log(arr.slice(-2));    // [4, 5] — last 2 items
console.log(arr.slice());      // [1, 2, 3, 4, 5] — full shallow copy
console.log(arr);              // [1, 2, 3, 4, 5] — original unchanged

// Pagination
const page = 2;
const pageSize = 3;
const items = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const pageItems = items.slice((page - 1) * pageSize, page * pageSize);
console.log(pageItems); // [4, 5, 6]`
        },
        {
          title: "splice() — Mutates the Array",
          code: `const arr = [1, 2, 3, 4, 5];

// Remove 2 items starting at index 1
const removed = arr.splice(1, 2);
console.log(removed); // [2, 3] — what was removed
console.log(arr);     // [1, 4, 5] — array is changed!

// Insert without removing (deleteCount = 0)
arr.splice(1, 0, 'a', 'b');
console.log(arr); // [1, 'a', 'b', 4, 5]

// Replace items
arr.splice(1, 2, 'x'); // remove 2 items at index 1, insert 'x'
console.log(arr); // [1, 'x', 4, 5]

// Immutable remove (for React state)
const original = [1, 2, 3, 4, 5];
const indexToRemove = 2;
const newArr = [
  ...original.slice(0, indexToRemove),
  ...original.slice(indexToRemove + 1)
];
console.log(newArr);    // [1, 2, 4, 5]
console.log(original);  // [1, 2, 3, 4, 5] — unchanged`
        }
      ]
    },
    {
      title: ".flat() & .flatMap() — Flatten Nested Arrays",
      explanations: {
        layman: "flat() takes an array of arrays and flattens it into one level. Like emptying several small boxes into one big box. flatMap() is map() + flat() in one step.",
        mid: "flat(depth) flattens nested arrays by the given depth (default 1). flat(Infinity) flattens everything no matter how deep. flatMap() maps each element, then flattens the result by one level — useful when your map returns arrays.",
        senior: "flatMap() is more efficient than calling .map().flat() separately because it does it in one pass with one intermediate array. Common use case: when mapping produces variable-length results (e.g., splitting sentences into words). flat(Infinity) is fine for known small structures but avoid it on user-generated deeply nested data — it could be a performance issue or even a stack overflow attack."
      },
      realWorld: "Flattening API responses with nested arrays, splitting text into words, expanding items in a list.",
      whenToUse: "flat() when you have nested arrays. flatMap() when your map function returns arrays.",
      whenNotToUse: "Don't use flat(Infinity) on untrusted deeply nested data.",
      pitfalls: "flat() only goes one level deep by default. flatMap() only flattens one level.",
      codeExamples: [
        {
          title: "flat() and flatMap()",
          code: `// flat() — default depth is 1
const nested = [[1, 2], [3, [4, 5]]];
console.log(nested.flat());         // [1, 2, 3, [4, 5]]
console.log(nested.flat(2));        // [1, 2, 3, 4, 5]
console.log(nested.flat(Infinity)); // [1, 2, 3, 4, 5]

// flatMap() — map + flat in one step
const sentences = ['Hello world', 'How are you'];
const words = sentences.flatMap(s => s.split(' '));
console.log(words); // ['Hello', 'world', 'How', 'are', 'you']

// Without flatMap you'd need:
const words2 = sentences.map(s => s.split(' ')).flat();
// Same result, but two passes instead of one

// Practical: expand items conditionally
const cart = [
  { item: 'Shirt', qty: 2 },
  { item: 'Pants', qty: 1 },
];
const expanded = cart.flatMap(c => Array(c.qty).fill(c.item));
console.log(expanded); // ['Shirt', 'Shirt', 'Pants']`
        }
      ]
    },
    {
      title: ".includes() & indexOf() — Check if Something Exists",
      explanations: {
        layman: "includes() checks if an array contains a specific value — it's a yes/no question. indexOf() does the same but tells you WHERE it found it (or -1 if not found).",
        mid: "includes() returns true/false. indexOf() returns the index or -1. Key difference: includes() can detect NaN, but indexOf() cannot. For objects in arrays, neither works for finding by property — use find() instead.",
        senior: "includes() uses SameValueZero comparison, which handles NaN correctly. indexOf() uses strict equality (===), so `[NaN].indexOf(NaN)` returns -1. Both are O(n) linear scans. For frequent lookups on large arrays, convert to a Set first — Set.has() is O(1). Neither works for finding objects by property since they check reference equality."
      },
      realWorld: "Checking if a value is in an allowed list, checking permissions, searching simple arrays.",
      whenToUse: "includes() for boolean checks, indexOf() when you need the position.",
      whenNotToUse: "For large arrays with frequent lookups — use a Set. For object arrays — use find().",
      pitfalls: "Neither works for comparing objects by value. They check references.",
      codeExamples: [
        {
          title: "includes() vs indexOf()",
          code: `const fruits = ['apple', 'banana', 'cherry'];

// includes — simple yes/no
console.log(fruits.includes('banana')); // true
console.log(fruits.includes('grape'));  // false

// indexOf — gives position
console.log(fruits.indexOf('cherry')); // 2
console.log(fruits.indexOf('grape'));  // -1

// NaN handling — includes wins
console.log([1, NaN, 3].includes(NaN)); // true
console.log([1, NaN, 3].indexOf(NaN));  // -1 (can't find it!)

// For frequent lookups, use Set
const allowedRoles = new Set(['admin', 'editor', 'viewer']);
console.log(allowedRoles.has('admin')); // true — O(1) lookup

// Objects: neither works by value
const obj = { id: 1 };
const arr = [{ id: 1 }];
console.log(arr.includes(obj));         // false — different reference
console.log(arr.find(x => x.id === 1)); // { id: 1 } — use find instead`
        }
      ]
    },
    // ========== STRING METHODS ==========
    {
      title: "Essential String Methods",
      explanations: {
        layman: "Strings have their own set of handy tools. You can split text into arrays, search for words, replace parts, trim whitespace, and change case. Strings are immutable — every method returns a NEW string.",
        mid: "Key methods: trim(), split(), replace()/replaceAll(), includes(), startsWith()/endsWith(), slice(), padStart()/padEnd(), repeat(). All return new strings — strings can never be modified in place. template literals (backtick strings) are the cleanest way to build strings with variables.",
        senior: "String methods return new strings, which means chaining creates intermediate strings in memory. For building large strings in a loop, push to an array and join() at the end — it's faster than concatenation. replace() with a string arg only replaces the first match; use replaceAll() or a regex with /g flag. For internationalization, use localeCompare() for sorting and Intl.Collator for performance with many comparisons."
      },
      realWorld: "Parsing user input, formatting display text, building URLs, sanitizing data.",
      whenToUse: "Anytime you need to manipulate text.",
      whenNotToUse: "For heavy text processing (parsing HTML, complex patterns) — use a proper parser or regex.",
      pitfalls: "replace() with a string only replaces the FIRST match. Strings are immutable — methods return new strings.",
      codeExamples: [
        {
          title: "Must-Know String Methods",
          code: `// trim — remove whitespace from both ends
'  hello  '.trim();      // 'hello'
'  hello  '.trimStart(); // 'hello  '
'  hello  '.trimEnd();   // '  hello'

// split — string to array
'a,b,c'.split(',');           // ['a', 'b', 'c']
'hello world'.split(' ');     // ['hello', 'world']
'hello'.split('');            // ['h', 'e', 'l', 'l', 'o']

// replace vs replaceAll
'aabaa'.replace('a', 'x');    // 'xabaa' — only first match!
'aabaa'.replaceAll('a', 'x'); // 'xxbxx' — all matches

// includes, startsWith, endsWith
'hello world'.includes('world');    // true
'hello world'.startsWith('hello');  // true
'hello world'.endsWith('world');    // true

// slice — extract part of a string
'hello world'.slice(0, 5);  // 'hello'
'hello world'.slice(-5);    // 'world'

// padStart / padEnd — add padding
'42'.padStart(5, '0');  // '00042' — useful for formatting
'hi'.padEnd(10, '.');   // 'hi........'

// Template literals — cleanest way to build strings
const name = 'Ali';
const age = 25;
console.log(\`\${name} is \${age} years old\`);

// Build large strings efficiently
const items = ['a', 'b', 'c', 'd'];
// BAD: string concatenation in loop
let str = '';
items.forEach(i => str += i + ', '); // creates new string each time

// GOOD: join array at the end
const result = items.join(', '); // 'a, b, c, d' — one operation`
        }
      ]
    },
    // ========== OBJECT METHODS ==========
    {
      title: "Essential Object Methods",
      explanations: {
        layman: "Objects have helper methods to read their keys, values, or both at once. You can also merge objects together and check what properties they have.",
        mid: "Object.keys() returns an array of property names. Object.values() returns values. Object.entries() returns [key, value] pairs. Object.assign() or spread ({...obj}) merges objects. These only work on own enumerable properties — not inherited ones from the prototype.",
        senior: "Object.keys/values/entries skip non-enumerable properties and symbols. For complete inspection, use Object.getOwnPropertyNames() (includes non-enumerable) or Reflect.ownKeys() (includes symbols). Spread and Object.assign() do shallow copies — nested objects are still shared by reference. Object.freeze() is shallow too. For immutable state in React, always spread nested objects separately or use structuredClone() for a deep copy."
      },
      realWorld: "Converting objects to arrays for rendering, merging config/defaults, checking for properties.",
      whenToUse: "When you need to iterate over, transform, or merge objects.",
      whenNotToUse: "When you need deep copies — use structuredClone(). When you need inherited properties — use a for...in loop.",
      pitfalls: "All of these are shallow. Spread merges overwrite left-to-right. Object.freeze() doesn't freeze nested objects.",
      codeExamples: [
        {
          title: "Keys, Values, Entries",
          code: `const user = { name: 'Ali', age: 25, role: 'dev' };

Object.keys(user);    // ['name', 'age', 'role']
Object.values(user);  // ['Ali', 25, 'dev']
Object.entries(user);
// [['name', 'Ali'], ['age', 25], ['role', 'dev']]

// Loop over an object
Object.entries(user).forEach(([key, value]) => {
  console.log(\`\${key}: \${value}\`);
});

// Convert entries back to object
const pairs = [['a', 1], ['b', 2]];
const obj = Object.fromEntries(pairs);
console.log(obj); // { a: 1, b: 2 }

// Merging objects
const defaults = { theme: 'dark', lang: 'en', debug: false };
const userPrefs = { lang: 'ur', debug: true };
const config = { ...defaults, ...userPrefs };
// { theme: 'dark', lang: 'ur', debug: true } — user prefs override defaults

// Check property existence
console.log('name' in user);              // true (checks prototype chain too)
console.log(user.hasOwnProperty('name')); // true (own properties only)

// Object.freeze — make immutable (shallow!)
const frozen = Object.freeze({ a: 1, nested: { b: 2 } });
frozen.a = 99;          // silently fails (or throws in strict mode)
frozen.nested.b = 99;   // WORKS! freeze is shallow
console.log(frozen.nested.b); // 99`
        }
      ]
    },
    // ========== MODERN METHODS & PATTERNS ==========
    {
      title: "Array.from(), Array.isArray(), & Spread Patterns",
      explanations: {
        layman: "Array.from() turns things that look like arrays (but aren't) into real arrays. Array.isArray() checks if something is truly an array. The spread operator (...) unpacks arrays and objects.",
        mid: "Array.from() converts array-like objects (NodeLists, arguments, strings) into real arrays. It also takes a map function as the second argument. Array.isArray() is the reliable way to check — typeof returns 'object' for arrays. Spread (...) works for copying arrays, merging, and passing array items as function arguments.",
        senior: "Array.from({length: n}, (_, i) => i) is a clean way to create arrays of any size with computed values — no need for fill + map. For DOM work, Array.from(nodeList) is safer than [...nodeList] in older environments. Array.isArray() works across iframes and realms, unlike instanceof Array which fails when arrays come from different contexts (like iframes). Use structuredClone() for deep copies instead of JSON.parse(JSON.stringify()) which breaks on dates, undefined, functions, etc."
      },
      realWorld: "Converting DOM NodeLists, generating ranges, cloning arrays, checking types safely.",
      whenToUse: "Array.from for conversion, isArray for type checks, spread for copies and merges.",
      whenNotToUse: "Don't use spread for deep copies — it's always shallow.",
      pitfalls: "Spread and Array.from do shallow copies. instanceof Array fails across iframes.",
      codeExamples: [
        {
          title: "Practical Patterns",
          code: `// Array.from — convert array-like things to real arrays
const nodeList = document.querySelectorAll('div');
const divs = Array.from(nodeList); // now you can use map, filter, etc.

// Generate a range [0, 1, 2, 3, 4]
const range = Array.from({ length: 5 }, (_, i) => i);
console.log(range); // [0, 1, 2, 3, 4]

// Generate alphabet
const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
// ['A', 'B', 'C', ... 'Z']

// Array.isArray — reliable type check
console.log(Array.isArray([1, 2]));      // true
console.log(Array.isArray('hello'));      // false
console.log(typeof [1, 2]);              // 'object' — useless!

// Spread patterns
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const merged = [...arr1, ...arr2]; // [1, 2, 3, 4, 5, 6]
const copy = [...arr1];            // shallow copy

// Spread for function arguments
const nums = [5, 2, 8, 1, 9];
console.log(Math.max(...nums)); // 9 — spreads array into separate arguments

// Removing duplicates
const dupes = [1, 2, 2, 3, 3, 3];
const unique = [...new Set(dupes)];
console.log(unique); // [1, 2, 3]`
        }
      ]
    },
    {
      title: "Chaining Methods — Putting It All Together",
      explanations: {
        layman: "You can connect array methods one after another like a chain. Each method takes the result of the previous one and does its own thing. It's like an assembly line — each station does one job.",
        mid: "Method chaining works because most array methods return a new array. A common pattern is filter → map → sort. Keep chains readable — one method per line. If a chain gets too long (4+), consider breaking it into named variables or using reduce.",
        senior: "Each method in a chain creates a new array, so .filter().map().sort() creates 3 arrays. For most data sizes this is fine — clarity beats micro-optimization. But for truly large arrays (100k+ items), a single reduce() or for loop avoids the intermediate allocations. When debugging chains, break them apart with named variables so you can inspect each step. In production code, readability almost always wins over one-pass optimization."
      },
      realWorld: "Data transformation pipelines, API response processing, building UI lists from raw data.",
      whenToUse: "When you need multiple transformations on an array.",
      whenNotToUse: "When the chain gets too long and hard to read — break it into named steps.",
      pitfalls: "Long chains are hard to debug. Each step creates a new array. Don't chain just because you can.",
      codeExamples: [
        {
          title: "Real-World Chaining Examples",
          code: `const employees = [
  { name: 'Ali', department: 'engineering', salary: 90000, active: true },
  { name: 'Sara', department: 'engineering', salary: 120000, active: true },
  { name: 'John', department: 'marketing', salary: 80000, active: false },
  { name: 'Maria', department: 'engineering', salary: 110000, active: true },
  { name: 'Bob', department: 'marketing', salary: 95000, active: true },
];

// Get active engineers, sorted by salary (highest first), showing just names
const topEngineers = employees
  .filter(e => e.active && e.department === 'engineering')
  .sort((a, b) => b.salary - a.salary)
  .map(e => e.name);
console.log(topEngineers); // ['Sara', 'Maria', 'Ali']

// Calculate total salary of active employees
const totalSalary = employees
  .filter(e => e.active)
  .reduce((sum, e) => sum + e.salary, 0);
console.log(totalSalary); // 415000

// Group active employees by department with names only
const byDepartment = employees
  .filter(e => e.active)
  .reduce((acc, e) => {
    if (!acc[e.department]) acc[e.department] = [];
    acc[e.department].push(e.name);
    return acc;
  }, {});
console.log(byDepartment);
// { engineering: ['Ali', 'Sara', 'Maria'], marketing: ['Bob'] }

// When chain gets complex, use named variables for clarity
const activeEmployees = employees.filter(e => e.active);
const engineersOnly = activeEmployees.filter(e => e.department === 'engineering');
const sortedBySalary = [...engineersOnly].sort((a, b) => b.salary - a.salary);
const names = sortedBySalary.map(e => e.name);`
        }
      ]
    },
    {
      title: "Destructuring, Spread & Rest — Modern Syntax Essentials",
      explanations: {
        layman: "Destructuring lets you pull values out of arrays and objects into separate variables — like unpacking a suitcase. Spread (...) copies or merges things. Rest (...) collects leftover items into an array.",
        mid: "Array destructuring: `const [a, b] = [1, 2]`. Object destructuring: `const { name, age } = user`. Spread: `{...obj}` or `[...arr]` for copies. Rest: `function sum(...nums)` collects all arguments. You can set defaults, rename, and skip items.",
        senior: "Destructuring in function parameters cleans up APIs: `function render({ title, body, footer = 'default' })`. Nested destructuring `const { address: { city } } = user` is powerful but hurts readability — don't go more than 2 levels deep. Rest in object destructuring (`const { id, ...rest } = obj`) is the cleanest way to remove a property immutably. Spread is shallow — nested objects are still shared."
      },
      realWorld: "React props, API response handling, function parameter objects, state updates.",
      whenToUse: "Whenever you need to extract values or clone/merge data.",
      whenNotToUse: "Deep nested destructuring — it's clever but unreadable.",
      pitfalls: "Destructuring undefined/null throws an error. Always provide defaults for optional properties.",
      codeExamples: [
        {
          title: "Destructuring Patterns",
          code: `// Array destructuring
const [first, second, ...rest] = [1, 2, 3, 4, 5];
console.log(first);  // 1
console.log(second); // 2
console.log(rest);   // [3, 4, 5]

// Skip items
const [, , third] = [1, 2, 3];
console.log(third); // 3

// Swap variables
let a = 1, b = 2;
[a, b] = [b, a];
console.log(a, b); // 2, 1

// Object destructuring with rename and default
const user = { name: 'Ali', age: 25 };
const { name: userName, age, role = 'user' } = user;
console.log(userName); // 'Ali'
console.log(role);     // 'user' (default because user.role is undefined)

// Function parameter destructuring
function createUser({ name, email, role = 'viewer' }) {
  return { name, email, role, createdAt: new Date() };
}
createUser({ name: 'Ali', email: 'ali@test.com' });

// Remove a property immutably (common in React)
const fullObj = { id: 1, name: 'Ali', password: 'secret' };
const { password, ...safeObj } = fullObj;
console.log(safeObj); // { id: 1, name: 'Ali' } — password removed

// Nested destructuring (don't go too deep)
const response = { data: { user: { name: 'Ali' } } };
const { data: { user: { name: deepName } } } = response;
console.log(deepName); // 'Ali'`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "What's the difference between map() and forEach()?",
      answer: "map() returns a new array with transformed values. forEach() returns undefined — it's for side effects only. Use map() when you need the result, forEach() when you just want to do something with each item (like logging or sending data). Another key difference: you can chain after map() but not after forEach().",
      difficulty: "easy",
      followUps: [
        "Can you break out of forEach() early?",
        "When would you choose a regular for loop over both?",
        "What happens if you use map() but don't use the returned array?"
      ]
    },
    {
      question: "Explain reduce() with a real-world example.",
      answer: "reduce() transforms an array into anything — a number, object, another array. It takes a callback with an accumulator (running result) and current item. Example: calculating a cart total — you start with 0 and add each item's price. Always pass an initial value (second argument) to avoid crashes on empty arrays. Common uses: summing, grouping by category, counting occurrences, and flattening arrays.",
      difficulty: "mid",
      followUps: [
        "What happens if you call reduce on an empty array without an initial value?",
        "Can you implement map() using reduce()?",
        "When would reduce() be a bad choice over simpler methods?"
      ]
    },
    {
      question: "What's the difference between slice() and splice()?",
      answer: "slice() copies a portion of an array and returns it — the original stays the same. splice() modifies the original by removing or inserting items. slice(1, 3) gives you items at index 1 and 2. splice(1, 2) removes 2 items starting at index 1 and changes the array. In React, always use slice or spread because you should never mutate state directly.",
      difficulty: "easy",
      followUps: [
        "How would you remove an item by index without mutating the array?",
        "What do negative indices do in slice()?",
        "How does splice() work when you want to insert without removing?"
      ]
    },
    {
      question: "How does sort() work in JavaScript? What surprises people?",
      answer: "sort() converts elements to strings by default and sorts alphabetically. So [10, 2, 1] becomes [1, 10, 2] because '10' comes before '2' as strings. You need a compare function for numbers: (a, b) => a - b. Another surprise: sort() mutates the original array — always spread first if you need the original. Since ES2019, sort is guaranteed to be stable (equal elements keep their original order).",
      difficulty: "mid",
      followUps: [
        "How would you sort objects by multiple properties?",
        "What does 'stable sort' mean and why does it matter?",
        "How would you sort a very large array efficiently?"
      ]
    },
    {
      question: "What's the difference between find() and filter()?",
      answer: "find() returns the first matching element and stops searching. filter() returns ALL matching elements as an array and always scans the whole array. Use find() when you expect one result (like finding a user by ID). Use filter() when you need multiple results (like all active users). find() returns undefined if not found; filter() returns an empty array.",
      difficulty: "easy",
      followUps: [
        "What about findIndex() — when would you use that?",
        "Which is more efficient for large arrays?",
        "How do some() and every() compare to find() and filter()?"
      ]
    },
    {
      question: "How would you remove duplicates from an array?",
      answer: "Simplest way: [...new Set(array)] — Set automatically removes duplicates and spread converts it back. This works for primitives (strings, numbers). For objects, you need a custom approach — like using a Map with a unique key, or filter with findIndex to keep only the first occurrence of each unique property value.",
      difficulty: "mid",
      followUps: [
        "How would you deduplicate an array of objects by a specific key?",
        "What's the performance difference between Set and filter+indexOf?",
        "Can you deduplicate while preserving order?"
      ]
    },
    {
      question: "What are Object.keys(), Object.values(), and Object.entries()? When would you use each?",
      answer: "Object.keys() returns an array of property names. Object.values() returns values. Object.entries() returns [key, value] pairs. Use keys() when you need property names (like checking what fields exist). Use values() when you only care about the data (like summing all values). Use entries() when you need both — like when looping with destructuring: entries().forEach(([key, value]) => ...).",
      difficulty: "easy",
      followUps: [
        "Do these methods include inherited properties?",
        "How do you convert entries back to an object?",
        "What about Symbol keys — are they included?"
      ]
    },
    {
      question: "Write a function that groups an array of objects by a given key.",
      answer: "```js\nfunction groupBy(array, key) {\n  return array.reduce((groups, item) => {\n    const value = item[key];\n    if (!groups[value]) groups[value] = [];\n    groups[value].push(item);\n    return groups;\n  }, {});\n}\n\n// Usage\nconst people = [\n  { name: 'Ali', city: 'Karachi' },\n  { name: 'Sara', city: 'Lahore' },\n  { name: 'John', city: 'Karachi' },\n];\ngroupBy(people, 'city');\n// { Karachi: [{...}, {...}], Lahore: [{...}] }\n```\nNote: Modern JS has Object.groupBy() which does this natively, but it's still new and not supported everywhere.",
      difficulty: "mid",
      followUps: [
        "How would you handle nested keys like 'address.city'?",
        "What is Object.groupBy() and can you use it yet?",
        "How would you group and then count items in each group?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Implement Array.prototype.myMap()",
      difficulty: "easy",
      description: "Write your own version of map() without using the built-in map method. It should handle the callback's three arguments (element, index, array) and return a new array.",
      solution: `Array.prototype.myMap = function(callback) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    // skip empty slots (sparse arrays)
    if (i in this) {
      result.push(callback(this[i], i, this));
    } else {
      result.length++; // preserve sparse slots
    }
  }
  return result;
};

// Test
console.log([1, 2, 3].myMap(x => x * 2)); // [2, 4, 6]
console.log(['a', 'b'].myMap((item, i) => \`\${i}:\${item}\`)); // ['0:a', '1:b']`,
      explanation: "We loop through each index, call the callback with (element, index, array), and push the result. The 'i in this' check handles sparse arrays correctly — [1,,3].map() should keep the empty slot, not fill it with undefined."
    },
    {
      title: "Implement Array.prototype.myReduce()",
      difficulty: "mid",
      description: "Write your own version of reduce(). Handle both cases: with and without an initial value. Throw TypeError on empty array without initial value.",
      solution: `Array.prototype.myReduce = function(callback, initialValue) {
  let accumulator;
  let startIndex;

  if (arguments.length >= 2) {
    // Initial value provided
    accumulator = initialValue;
    startIndex = 0;
  } else {
    // No initial value — use first element
    if (this.length === 0) {
      throw new TypeError('Reduce of empty array with no initial value');
    }
    accumulator = this[0];
    startIndex = 1;
  }

  for (let i = startIndex; i < this.length; i++) {
    if (i in this) {
      accumulator = callback(accumulator, this[i], i, this);
    }
  }

  return accumulator;
};

// Test
console.log([1, 2, 3].myReduce((sum, n) => sum + n, 0)); // 6
console.log([1, 2, 3].myReduce((sum, n) => sum + n));     // 6 (uses 1 as initial)
// [].myReduce((sum, n) => sum + n); // TypeError!`,
      explanation: "The tricky part is handling the two modes: with initial value (start from index 0) and without (use first element, start from index 1). The empty array + no initial value case must throw a TypeError — this is a common interview follow-up."
    },
    {
      title: "Implement a Pipe/Compose Utility",
      difficulty: "mid",
      description: "Create pipe() that runs functions left-to-right and compose() that runs right-to-left. pipe(f, g, h)(x) = h(g(f(x))). compose(f, g, h)(x) = f(g(h(x))).",
      solution: `function pipe(...fns) {
  return function(input) {
    return fns.reduce((result, fn) => fn(result), input);
  };
}

function compose(...fns) {
  return function(input) {
    return fns.reduceRight((result, fn) => fn(result), input);
  };
}

// Test
const add10 = x => x + 10;
const double = x => x * 2;
const toString = x => \`Result: \${x}\`;

const pipeline = pipe(add10, double, toString);
console.log(pipeline(5)); // 'Result: 30' → (5+10=15, 15*2=30, toString)

const composed = compose(toString, double, add10);
console.log(composed(5)); // 'Result: 30' — same result, opposite order`,
      explanation: "pipe() uses reduce (left-to-right), compose() uses reduceRight (right-to-left). Each function's output becomes the next function's input. This is a fundamental pattern in functional programming and a popular interview question."
    },
    {
      title: "Flatten an Array to Any Depth",
      difficulty: "mid",
      description: "Implement a flat() function that flattens a nested array to a given depth. flat(arr, 1) flattens one level, flat(arr, Infinity) flattens completely.",
      solution: `function flat(arr, depth = 1) {
  if (depth <= 0) return arr.slice(); // return a copy at depth 0

  const result = [];

  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) {
      // Recursively flatten and spread into result
      result.push(...flat(item, depth - 1));
    } else {
      result.push(item);
    }
  }

  return result;
}

// Test
console.log(flat([1, [2, [3, [4]]]], 1));        // [1, 2, [3, [4]]]
console.log(flat([1, [2, [3, [4]]]], 2));        // [1, 2, 3, [4]]
console.log(flat([1, [2, [3, [4]]]], Infinity)); // [1, 2, 3, 4]

// Iterative version (no recursion)
function flatIterative(arr, depth = 1) {
  let result = [...arr];
  for (let d = 0; d < depth; d++) {
    const next = [];
    let didFlatten = false;
    for (const item of result) {
      if (Array.isArray(item)) {
        next.push(...item);
        didFlatten = true;
      } else {
        next.push(item);
      }
    }
    result = next;
    if (!didFlatten) break; // nothing left to flatten
  }
  return result;
}`,
      explanation: "The recursive approach checks each item: if it's an array and we still have depth to go, flatten it recursively. Otherwise, keep it as-is. Each recursive call reduces depth by 1. The iterative version does repeated passes, flattening one level per pass."
    },
    {
      title: "Implement Object.groupBy()",
      difficulty: "mid",
      description: "Create a groupBy function that groups array items by a key or callback. Support both string keys and callback functions.",
      solution: `function groupBy(array, keyOrFn) {
  const getKey = typeof keyOrFn === 'function'
    ? keyOrFn
    : (item) => item[keyOrFn];

  return array.reduce((groups, item) => {
    const key = getKey(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});
}

// Test with string key
const people = [
  { name: 'Ali', city: 'Karachi' },
  { name: 'Sara', city: 'Lahore' },
  { name: 'John', city: 'Karachi' },
  { name: 'Maria', city: 'Lahore' },
];

console.log(groupBy(people, 'city'));
// {
//   Karachi: [{ name: 'Ali', ... }, { name: 'John', ... }],
//   Lahore: [{ name: 'Sara', ... }, { name: 'Maria', ... }]
// }

// Test with callback function
const numbers = [1, 2, 3, 4, 5, 6, 7, 8];
console.log(groupBy(numbers, n => n % 2 === 0 ? 'even' : 'odd'));
// { odd: [1, 3, 5, 7], even: [2, 4, 6, 8] }

// Group by age range
const users = [
  { name: 'A', age: 15 }, { name: 'B', age: 25 },
  { name: 'C', age: 35 }, { name: 'D', age: 22 },
];
console.log(groupBy(users, u => u.age < 18 ? 'minor' : u.age < 30 ? 'young' : 'senior'));
// { minor: [{...}], young: [{...}, {...}], senior: [{...}] }`,
      explanation: "The function accepts either a property name string or a callback. Internally, it normalizes both to a function that extracts the group key. Then reduce() builds the groups object. This is essentially what the new Object.groupBy() does natively."
    }
  ],
  quiz: [
    {
      question: "What does [10, 2, 1, 20].sort() return?",
      options: ["[1, 2, 10, 20]", "[20, 10, 2, 1]", "[1, 10, 2, 20]", "TypeError"],
      correct: 2,
      explanation: "Without a compare function, sort() converts elements to strings. '10' comes before '2' alphabetically because '1' < '2' in Unicode. Use .sort((a, b) => a - b) for numbers."
    },
    {
      question: "What does [1, 2, 3].map(n => { n * 2 }) return?",
      options: ["[2, 4, 6]", "[undefined, undefined, undefined]", "[]", "TypeError"],
      correct: 1,
      explanation: "The curly braces create a function body, so you need an explicit return statement. Without return, the function returns undefined for each element. Use arrow shorthand (n => n * 2) or add return."
    },
    {
      question: "What does [].every(x => false) return?",
      options: ["false", "true", "undefined", "TypeError"],
      correct: 1,
      explanation: "every() on an empty array returns true (vacuous truth). Since there are no elements to fail the test, the condition is considered satisfied. This is mathematically correct but surprises most developers."
    },
    {
      question: "What's the output?\nconst a = [1, 2, 3];\nconst b = a.slice();\nb.push(4);\nconsole.log(a.length);",
      options: ["3", "4", "undefined", "TypeError"],
      correct: 0,
      explanation: "slice() without arguments creates a shallow copy. Pushing to b doesn't affect a because they're separate arrays. a still has 3 elements."
    },
    {
      question: "Which method can detect NaN in an array?",
      options: ["indexOf()", "includes()", "Both", "Neither"],
      correct: 1,
      explanation: "includes() uses SameValueZero comparison which handles NaN correctly: [NaN].includes(NaN) is true. indexOf() uses strict equality (===), and NaN === NaN is false, so [NaN].indexOf(NaN) returns -1."
    },
    {
      question: "What does [1, 2, 3].reduce((a, b) => a + b) return?",
      options: ["6", "TypeError — no initial value", "'123'", "NaN"],
      correct: 0,
      explanation: "Without an initial value, reduce uses the first element (1) as the starting accumulator and begins from the second element. So: 1 + 2 = 3, then 3 + 3 = 6. This works fine when the array isn't empty — an empty array without initial value would throw."
    },
    {
      question: "What's the difference between these?\nconst a = { ...obj };\nconst b = structuredClone(obj);",
      options: [
        "No difference — both make deep copies",
        "Spread is shallow, structuredClone is deep",
        "Spread is deep, structuredClone is shallow",
        "Both are shallow copies"
      ],
      correct: 1,
      explanation: "Spread ({...obj}) creates a shallow copy — nested objects are still shared by reference. structuredClone() creates a true deep copy — nested objects are independent. Use structuredClone for deep copies."
    },
    {
      question: "What does 'hello world'.replace('o', '0') return?",
      options: ["'hell0 w0rld'", "'hell0 world'", "'hello w0rld'", "TypeError"],
      correct: 1,
      explanation: "replace() with a string argument only replaces the FIRST occurrence. 'hello world' → 'hell0 world'. Use replaceAll('o', '0') or replace(/o/g, '0') to replace all occurrences."
    }
  ]
};
