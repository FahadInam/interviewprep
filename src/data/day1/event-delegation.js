export const eventDelegation = {
  id: "event-delegation",
  title: "Event Delegation & Propagation",
  icon: "🎯",
  tag: "Browser APIs",
  tagColor: "var(--tag-js)",
  subtitle: "Master event bubbling, capturing, delegation patterns, and the event object.",
  concepts: [
    {
      title: "Event Bubbling vs Capturing (3 Phases)",
      explanations: {
        layman: "Think of a click like dropping a stone in water. First the event sinks down through parent elements (capture phase), hits the actual element you clicked (target phase), then bubbles back up (bubble phase). Three phases, every single click.",
        mid: "When you click something, the browser runs through three phases: capture (top-down), target (the clicked element), and bubble (bottom-up). Handlers fire in the phase you register them for. By default, handlers run in the bubble phase unless you pass { capture: true }.",
        senior: "At the target element, handlers fire in registration order regardless of the capture flag. Phase-dependent bugs usually come from assuming capture handlers always run before bubble handlers on the target node itself. Log eventPhase, target, and currentTarget to trace issues."
      },
      realWorld: "In a dropdown menu with nested submenus, a click on a submenu item bubbles up through all parent menus. Without understanding event phases, you'd struggle to figure out why multiple handlers fire for one click.",
      whenToUse: "Use capture phase when you need to intercept events before they reach child elements, like global click tracking.",
      whenNotToUse: "Skip capture-phase listeners for simple interactions where default bubble-phase handling works fine.",
      pitfalls: "On the target element itself, capture and bubble handlers fire in the order they were added, not by phase. This surprises many developers.",
      codeExamples: [
        {
          title: "Demonstrating all three phases",
          code: `const outer = document.getElementById('outer');
const inner = document.getElementById('inner');
const btn = document.getElementById('btn');

outer.addEventListener('click', () => {
  console.log('1. Outer - CAPTURE');
}, { capture: true });

inner.addEventListener('click', () => {
  console.log('2. Inner - CAPTURE');
}, { capture: true });

btn.addEventListener('click', () => {
  console.log('3. Button - first handler');
});

btn.addEventListener('click', () => {
  console.log('4. Button - second handler');
}, { capture: true });

inner.addEventListener('click', () => {
  console.log('5. Inner - BUBBLE');
});

outer.addEventListener('click', () => {
  console.log('6. Outer - BUBBLE');
});`
        }
      ]
    },
    {
      title: "Event Delegation Pattern",
      explanations: {
        layman: "Instead of giving every button its own listener, you put one listener on the parent. When a child is clicked, the event bubbles up and the parent figures out which child was clicked. Like a receptionist handling calls for the whole office.",
        mid: "Attach a single listener to a parent element. When an event bubbles up, use e.target.closest(selector) to check if the click came from a matching child. This way, dynamically added children work automatically without attaching new listeners.",
        senior: "Delegation reduces memory footprint and avoids listener lifecycle management for dynamic content. Always guard with parent.contains(match) to prevent matching elements outside the parent. Use closest() instead of direct target checks to handle nested markup inside clickable items."
      },
      realWorld: "Todo lists, tables, and any UI where items get added or removed constantly. One parent listener handles all current and future items.",
      whenToUse: "Use delegation when child elements are created dynamically or when you have many similar elements sharing the same behavior.",
      whenNotToUse: "For a small number of static elements that each need unique behavior, direct listeners are simpler and clearer.",
      pitfalls: "If your clickable element has nested children (like an icon inside a button), e.target might be the icon, not the button. Always use closest() to find the right element.",
      codeExamples: [
        {
          title: "Robust event delegation with closest()",
          code: `document.querySelectorAll('.item').forEach(item => {
  item.addEventListener('click', handleClick);
});

document.getElementById('list').addEventListener('click', (e) => {
  const item = e.target.closest('.item');
  if (!item) return;

  if (!e.currentTarget.contains(item)) return;

  const id = item.dataset.id;

  if (e.target.closest('.delete-btn')) {
    deleteItem(id);
  } else if (e.target.closest('.edit-btn')) {
    editItem(id);
  } else {
    selectItem(id);
  }
});

function addItem(text) {
  const li = document.createElement('li');
  li.className = 'item';
  li.dataset.id = Date.now();
  li.innerHTML = \`
    <span>\${text}</span>
    <button class="edit-btn">Edit</button>
    <button class="delete-btn">Delete</button>
  \`;
  document.getElementById('list').appendChild(li);
}`
        }
      ]
    },
    {
      title: "stopPropagation vs stopImmediatePropagation vs preventDefault",
      explanations: {
        layman: "preventDefault stops the browser's built-in action (like following a link). stopPropagation stops the event from traveling to parent elements. stopImmediatePropagation does the same but also blocks other handlers on the same element.",
        mid: "preventDefault cancels the default browser behavior but the event still propagates. stopPropagation lets all handlers on the current element run but stops the event from reaching ancestors. stopImmediatePropagation stops everything: no more handlers on this element, no propagation.",
        senior: "Overusing stopPropagation breaks analytics trackers, global keyboard handlers, and third-party libraries that rely on event bubbling. Prefer checking conditions inside handlers over stopping propagation. Use passive: true for scroll/touch listeners to avoid blocking the main thread."
      },
      realWorld: "A modal that should not close when you click inside it uses stopPropagation on the modal, while the backdrop listener closes it. preventDefault is used on forms to handle submission with JavaScript.",
      whenToUse: "Use preventDefault for custom form handling or link behavior. Use stopPropagation sparingly when you need to isolate a component from its parent.",
      whenNotToUse: "Avoid stopPropagation as a default fix. It silently breaks other parts of your app that listen for the same event higher up.",
      pitfalls: "stopPropagation does NOT prevent the browser default action. A link will still navigate unless you also call preventDefault.",
      codeExamples: [
        {
          title: "Comparing all three methods",
          code: `document.querySelector('a.custom-link').addEventListener('click', (e) => {
  e.preventDefault();
  goToPage(e.target.href);
});

document.querySelector('.modal').addEventListener('click', (e) => {
  e.stopPropagation();
});

document.querySelector('.backdrop').addEventListener('click', () => {
  closeModal();
});

const btn = document.querySelector('#btn');

btn.addEventListener('click', (e) => {
  console.log('Handler 1 runs');
  if (shouldBlock) {
    e.stopImmediatePropagation();
  }
});

btn.addEventListener('click', () => {
  console.log('Handler 2 - may be skipped');
});

document.addEventListener('touchstart', (e) => {
  handleTouch(e);
}, { passive: true });`
        }
      ]
    },
    {
      title: "Event Object: target vs currentTarget",
      explanations: {
        layman: "target is the exact element you clicked on (maybe a tiny icon inside a button). currentTarget is the element that has the listener attached. They're often different when events bubble up.",
        mid: "e.target is the element that triggered the event. e.currentTarget is the element the handler is bound to. In delegation, they're almost always different. Inside the handler, 'this' equals currentTarget (unless you use an arrow function).",
        senior: "currentTarget is nullified after the event handler finishes, so it becomes null inside async callbacks. Save it to a variable before any await. Arrow functions don't bind 'this', so this !== currentTarget in arrow handlers."
      },
      realWorld: "In a delegated list, target tells you which specific item was clicked, while currentTarget tells you it's the parent list that caught the event.",
      whenToUse: "Use target with closest() for delegation. Use currentTarget when you need to reference the element the listener is attached to.",
      whenNotToUse: "Don't rely on currentTarget after an await or inside a setTimeout. It will be null by then.",
      pitfalls: "After any async operation (await, setTimeout), currentTarget is null. Always store it in a variable first if you need it later.",
      codeExamples: [
        {
          title: "target vs currentTarget in practice",
          code: `const list = document.getElementById('nav-list');

list.addEventListener('click', function(e) {
  // The element that was actually clicked
  console.log('target:', e.target);

  // The element this handler is attached to (the list)
  console.log('currentTarget:', e.currentTarget);

  // true - 'this' equals currentTarget in regular functions
  console.log('this === currentTarget:', this === e.currentTarget);

  const link = e.target.closest('a.nav-link');
  if (link && e.currentTarget.contains(link)) {
    e.preventDefault();
    goToPage(link.href);
  }
});

document.querySelector('#btn').addEventListener('click', async (e) => {
  // Works fine here
  console.log(e.currentTarget);

  // Save it before the await!
  const btn = e.currentTarget;

  await fetchData();

  // null - currentTarget is gone after await
  console.log(e.currentTarget);
  // Still works - we saved it
  console.log(btn);
});

list.addEventListener('click', (e) => {
  // false - arrow functions don't bind 'this'
  console.log(this === e.currentTarget);
});`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "Explain the three phases of DOM event propagation.",
      answer: "Every DOM event goes through three phases: capture (event travels from window down to the target's parent), target (event reaches the clicked element), and bubble (event travels back up to window). By default, listeners fire during the bubble phase. You can listen during capture by passing { capture: true }. On the target element itself, handlers fire in registration order regardless of phase.",
      difficulty: "easy",
      followUps: [
        "How does event propagation differ inside Shadow DOM?",
        "How does event propagation work in Shadow DOM?",
        "When would you use capture phase instead of bubbling?"
      ]
    },
    {
      question: "What is event delegation and why is it useful?",
      answer: "Event delegation means attaching one listener to a parent instead of individual listeners to each child. When a child is clicked, the event bubbles up to the parent, and you use e.target.closest() to identify which child triggered it. It's useful because it handles dynamically added elements automatically, uses less memory, and simplifies cleanup.",
      difficulty: "easy",
      followUps: [
        "How do you handle events that don't bubble with delegation?",
        "What problems can stopPropagation cause with delegation?",
        "How does React's event system relate to delegation?"
      ]
    },
    {
      question: "What's the difference between event.target and event.currentTarget?",
      answer: "target is the actual element that was clicked. currentTarget is the element the listener is attached to. In delegation, target might be a deeply nested child while currentTarget is the parent with the listener. One gotcha: currentTarget becomes null after async operations, so save it to a variable before any await.",
      difficulty: "mid",
      followUps: [
        "What happens to currentTarget after an await?",
        "How does Shadow DOM affect event.target?",
        "How would you safely use currentTarget inside an async click handler?"
      ]
    },
    {
      question: "Explain the differences between stopPropagation, stopImmediatePropagation, and preventDefault.",
      answer: "preventDefault stops the browser's default action (like navigating a link) but the event still propagates. stopPropagation stops the event from reaching parent elements but lets other handlers on the same element run. stopImmediatePropagation stops everything: no more handlers on this element and no propagation. In code reviews, I flag stopPropagation because it silently breaks event listeners higher up the tree.",
      difficulty: "mid",
      followUps: [
        "What is a passive event listener and how does it affect preventDefault?",
        "How can stopPropagation break analytics or third-party widget event tracking?",
        "When would you use stopImmediatePropagation over stopPropagation?"
      ]
    },
    {
      question: "How would you implement a custom event system that mimics DOM event delegation?",
      answer: "I'd create an EventEmitter class with a Map of event names to handler arrays. The on() method registers handlers, emit() loops through and calls them with provided arguments, off() removes specific handlers, and once() wraps a handler to auto-remove after one call. To mimic delegation, I'd add a namespace or hierarchy system where emitting on a child path also triggers parent handlers, similar to how DOM bubbling works.",
      difficulty: "hard",
      followUps: [
        "How would you add support for event phases?",
        "How would you handle memory leaks with this system?",
        "How does this compare to the Observer pattern?"
      ]
    },
    {
      question: "Why doesn't stopPropagation prevent the default action, and when is this important?",
      answer: "They control different things by design. Propagation is about which handlers run. Default action is about what the browser does natively. A form submit with stopPropagation still submits the form unless you also call preventDefault. This separation matters because you might want to stop an event from reaching parent handlers but still let the browser do its thing, or vice versa.",
      difficulty: "mid",
      followUps: [
        "What happens if you call both?",
        "How do you handle delegation for dynamically added elements?",
        "What's the performance difference between delegation and individual listeners?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Implement a delegation helper function",
      difficulty: "mid",
      description: "Write a delegate() function that takes a parent element, a CSS selector, an event type, and a handler. It should attach one listener on the parent and only call the handler when the event comes from a child matching the selector. Return a cleanup function that removes the listener.",
      solution: `function delegate(parent, selector, eventType, handler) {
  if (typeof parent === 'string') {
    parent = document.querySelector(parent);
  }

  function listener(e) {
    const match = e.target.closest(selector);

    if (match && parent.contains(match)) {
      handler.call(match, e, match);
    }
  }

  parent.addEventListener(eventType, listener);

  return function remove() {
    parent.removeEventListener(eventType, listener);
  };
}

const cleanup = delegate('#todo-list', '.delete-btn', 'click', function(e, btn) {
  console.log('Delete clicked:', this.textContent);
  const item = this.closest('.todo-item');
  item.remove();
});`,
      explanation: "Uses closest() to walk up from the clicked element and find a match. The parent.contains() check prevents matching elements outside the parent. Returns a cleanup function so you can remove the listener when the component is destroyed."
    },
    {
      title: "Build an event emitter with once, on, off, and emit",
      difficulty: "mid",
      description: "Build an EventEmitter class with four methods: on(event, fn) registers a handler, once(event, fn) registers a one-time handler, off(event, fn) removes a handler, and emit(event, ...args) calls all handlers for that event. Each method except emit should return 'this' for chaining.",
      solution: `class EventEmitter {
  constructor() {
    this._handlers = new Map();
  }

  on(event, fn) {
    if (!this._handlers.has(event)) {
      this._handlers.set(event, []);
    }
    this._handlers.get(event).push({ fn, once: false });
    return this;
  }

  once(event, fn) {
    if (!this._handlers.has(event)) {
      this._handlers.set(event, []);
    }
    this._handlers.get(event).push({ fn, once: true });
    return this;
  }

  off(event, fn) {
    if (!this._handlers.has(event)) return this;

    if (!fn) {
      this._handlers.delete(event);
    } else {
      const list = this._handlers.get(event);
      const kept = list.filter(h => h.fn !== fn);
      if (kept.length === 0) {
        this._handlers.delete(event);
      } else {
        this._handlers.set(event, kept);
      }
    }
    return this;
  }

  emit(event, ...args) {
    if (!this._handlers.has(event)) return false;

    const list = this._handlers.get(event).slice();
    const kept = [];

    for (const h of list) {
      h.fn(...args);
      if (!h.once) {
        kept.push(h);
      }
    }

    if (kept.length === 0) {
      this._handlers.delete(event);
    } else {
      this._handlers.set(event, kept);
    }

    return true;
  }
}

const bus = new EventEmitter();

bus.on('data', (msg) => console.log('Got:', msg));
bus.once('connect', () => console.log('Connected!'));

bus.emit('connect');
bus.emit('connect');
bus.emit('data', 'hello');`,
      explanation: "Stores handlers in a Map with a { fn, once } wrapper. The emit method copies the array before iterating so removing a once-handler mid-loop doesn't skip entries. off() without a function removes all handlers for that event."
    },
    {
      title: "Create a click-outside detector",
      difficulty: "easy",
      description: "Write a function onClickOutside(element, callback) that calls the callback when the user clicks anywhere outside the given element. Return a cleanup function that removes the listener. Use the capture phase so it works even if something inside stops propagation.",
      solution: `function onClickOutside(element, callback) {
  function handler(e) {
    if (!element.contains(e.target) && e.target !== element) {
      callback(e);
    }
  }

  document.addEventListener('click', handler, { capture: true });

  return function cleanup() {
    document.removeEventListener('click', handler, { capture: true });
  };
}

const menu = document.querySelector('.dropdown-menu');
const removeListener = onClickOutside(menu, () => {
  menu.classList.remove('open');
  removeListener();
});`,
      explanation: "Listens on document in the capture phase so it catches clicks even if a child calls stopPropagation. Checks if the click target is outside the element using contains(). Returns a cleanup function to prevent memory leaks."
    }
  ],
  quiz: [
    {
      question: "Which events do NOT bubble by default?",
      options: [
        "click and keydown",
        "focus and blur",
        "mousedown and mouseup",
        "input and change"
      ],
      correct: 1,
      explanation: "focus and blur don't bubble. Use focusin and focusout instead if you need bubbling versions for delegation. This is by design — focus and blur were defined before the DOM bubbling model was standardized. Use focusin/focusout for delegation."
    },
    {
      question: "What does event.target.closest('.item') do?",
      options: [
        "Finds the nearest .item element that is a child of the target",
        "Traverses up from the target to find the nearest ancestor matching .item (including itself)",
        "Returns the closest sibling element with class 'item'",
        "Finds the nearest .item element in the DOM tree by distance"
      ],
      correct: 1,
      explanation: "closest() walks up the DOM tree starting from the element itself, checking each ancestor against the selector. It returns the first match or null."
    },
    {
      question: "What happens to event.currentTarget after an asynchronous operation?",
      options: [
        "It still references the element the handler was attached to",
        "It becomes null",
        "It changes to event.target",
        "It throws a ReferenceError"
      ],
      correct: 1,
      explanation: "The browser nullifies currentTarget once the event handler finishes. After an await or setTimeout, it's null. Save it to a local variable before any async work."
    },
    {
      question: "If you call stopPropagation() on a link click, what happens?",
      options: [
        "The browser doesn't navigate AND the event stops propagating",
        "The browser navigates normally but parent handlers don't fire",
        "The browser doesn't navigate but parent handlers still fire",
        "Nothing — stopPropagation doesn't work on links"
      ],
      correct: 1,
      explanation: "stopPropagation only stops the event from reaching other elements. The browser's default action (navigation) still happens. You need preventDefault to stop navigation."
    },
    {
      question: "In which order do these handlers fire when clicking the button?\n\nparent.addEventListener('click', A);\nparent.addEventListener('click', B, { capture: true });\nbutton.addEventListener('click', C);\nbutton.addEventListener('click', D, { capture: true });",
      options: [
        "B, D, C, A",
        "B, C, D, A",
        "A, B, C, D",
        "D, C, B, A"
      ],
      correct: 1,
      explanation: "B fires first (parent capture phase). Then on the target button, C and D fire in registration order regardless of phase. Finally A fires (parent bubble phase)."
    }
  ]
};
