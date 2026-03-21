export const domLifecycle = {
  id: "dom-lifecycle",
  title: "DOM Lifecycle & Script Loading",
  icon: "🔄",
  tag: "Browser APIs",
  tagColor: "var(--tag-js)",
  subtitle: "Understand document lifecycle events, DOM parsing stages, and script loading strategies.",
  concepts: [
    {
      title: "Document Lifecycle Events",
      explanations: {
        layman: "Think of a webpage loading like a restaurant opening. First the tables are set (HTML parsed), then the food arrives (images, fonts). Lifecycle events are like announcements: 'Tables are ready!' and 'Everything is served!'",
        mid: "DOMContentLoaded fires when HTML is fully parsed and the DOM tree is built, but images and stylesheets may still be loading. The load event fires only after everything, including images and iframes, is done. Use DOMContentLoaded when you just need the DOM, and load when you need all resources.",
        senior: "Binding to `load` when you only need the DOM wastes time waiting for images and fonts. Prefer DOMContentLoaded for app init. Use `readystatechange` if you need to detect the transition from 'loading' to 'interactive' to 'complete'. Avoid `beforeunload` unless you have unsaved work -- it prevents the browser from caching the page in memory (bfcache), so hitting the back button forces a full reload instead of an instant restore."
      },
      realWorld: "A dashboard app shows a blank screen because its init script runs before the sidebar elements exist in the DOM. Moving initialization into a DOMContentLoaded handler fixes the timing.",
      whenToUse: "Use lifecycle events when your code needs to interact with DOM elements or wait for external resources like images before running.",
      whenNotToUse: "Skip these if your script tag is already at the bottom of the body or uses defer, since the DOM is already available by then.",
      pitfalls: "Adding event listeners to elements that do not exist yet. If your script runs before the HTML is parsed, querySelector returns null and your app silently breaks.",
      codeExamples: [
        {
          title: "Complete lifecycle event handling",
          code: `if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', onReady);
} else {
  onReady();
}

function onReady() {
  const app = document.getElementById('app');
  startApp(app);
}

window.addEventListener('load', () => {
  hideSpinner();
});

let unsaved = false;
window.addEventListener('beforeunload', (e) => {
  if (unsaved) {
    e.preventDefault();
    e.returnValue = '';
  }
});

window.addEventListener('pagehide', (e) => {
  if (!e.persisted) {
    sendAnalytics();
  }
});

document.addEventListener('readystatechange', () => {
  console.log(document.readyState);
});`
        }
      ]
    },
    {
      title: "Script Loading Strategies",
      explanations: {
        layman: "Imagine a teacher reading a story to kids. A normal script is like stopping the story to go find a prop. 'async' is like asking someone to fetch the prop while you keep reading, but you pause whenever it arrives. 'defer' is like fetching all props during the story and only using them after you finish reading.",
        mid: "A regular script blocks HTML parsing until it downloads and runs. 'async' downloads in the background but executes immediately when ready, so order is not guaranteed. 'defer' also downloads in the background but waits until HTML parsing is done and runs scripts in the order they appear.",
        senior: "Use defer for scripts that depend on DOM or on each other. Use async for independent scripts like analytics that do not need DOM or ordering. Module scripts are deferred by default. Preload critical scripts to start the download early without blocking."
      },
      realWorld: "An e-commerce site loads its checkout script with async, but it sometimes runs before the product list script finishes. Switching to defer fixes the ordering issue because defer guarantees execution order.",
      whenToUse: "Use defer for your main app bundle and any script that depends on the DOM. Use async for standalone scripts like analytics or ads that work independently.",
      whenNotToUse: "Avoid async when scripts depend on each other, because execution order is unpredictable. Avoid defer on inline scripts since it has no effect on them.",
      pitfalls: "Assuming async scripts run in order. If script B depends on script A, and both use async, script B might run first and throw errors because A has not loaded yet.",
      codeExamples: [
        {
          title: "Script loading patterns",
          code: `<!-- Blocks page loading — avoid if not critical -->
<script src="blocking.js"></script>

<!-- Downloads while page loads, runs when ready (random order) -->
<script async src="analytics.js"></script>
<script async src="tracking.js"></script>

<!-- Downloads while page loads, runs in order after HTML is parsed -->
<script defer src="vendor.js"></script>
<script defer src="app.js"></script>

<!-- Modules are deferred by default -->
<script type="module" src="app.mjs"></script>

<!-- Tell browser to download this script early -->
<link rel="preload" href="critical.js" as="script">

<!-- Load scripts with JavaScript -->
<script>
function loadScript(url, isAsync = true) {
  return new Promise((resolve, reject) => {
    const tag = document.createElement('script');
    tag.src = url;
    tag.async = isAsync;
    tag.onload = resolve;
    tag.onerror = reject;
    document.head.appendChild(tag);
  });
}

async function loadInOrder() {
  await loadScript('vendor.js', false);
  await loadScript('app.js', false);
}
</script>`
        }
      ]
    },
    {
      title: "DOM Manipulation Performance",
      explanations: {
        layman: "Imagine redecorating a room. If you move one piece of furniture, step back to look, move another, step back again, it takes forever. It is much faster to plan all the moves, then do them all at once. The browser works the same way with DOM changes.",
        mid: "Every time you change a style and then read a layout property (like offsetWidth), the browser has to recalculate layout right away. This is called forced reflow. To avoid it, read all the values you need first, then make all your changes together.",
        senior: "Layout thrashing happens when reads and writes to the DOM are interleaved in a loop, forcing synchronous layout on every iteration. Use requestAnimationFrame for visual updates, DocumentFragment for batch inserts, and always separate read and write phases."
      },
      realWorld: "A table component resizes columns by reading each cell's width and immediately setting a new one in a loop. With 500 rows, this causes visible jank. Separating reads and writes into two passes cuts the work from 500 forced layouts to just one.",
      whenToUse: "Batch your DOM changes when updating many elements at once, like rendering lists, animating elements, or resizing layouts.",
      whenNotToUse: "For a single DOM update, like changing one button's text, batching adds unnecessary complexity. The browser handles one-off changes efficiently on its own.",
      pitfalls: "Reading offsetWidth or getBoundingClientRect right after changing styles forces the browser to calculate layout immediately, even if you were about to make more changes. This turns a fast batch into a slow one-at-a-time process.",
      codeExamples: [
        {
          title: "Avoiding layout thrashing",
          code: `function resizeBad(items) {
  items.forEach(el => {
    const w = el.offsetWidth;
    el.style.width = (w * 2) + 'px';
  });
}

function resizeGood(items) {
  const widths = items.map(el => el.offsetWidth);

  items.forEach((el, i) => {
    el.style.width = (widths[i] * 2) + 'px';
  });
}

function addItems(container, list) {
  const fragment = document.createDocumentFragment();
  list.forEach(text => {
    const div = document.createElement('div');
    div.textContent = text;
    fragment.appendChild(div);
  });
  container.appendChild(fragment);
}

function animate(el) {
  let start = null;

  function step(time) {
    if (!start) start = time;
    const progress = Math.min((time - start) / 1000, 1);
    el.style.transform = \`translateX(\${progress * 300}px)\`;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "What is the difference between DOMContentLoaded and the load event?",
      answer: "DOMContentLoaded fires as soon as the HTML is fully parsed and the DOM tree is built, even if images and stylesheets are still loading. The load event fires only after everything on the page, including images, iframes, and stylesheets, has finished loading. In practice, use DOMContentLoaded for initializing UI logic since you rarely need to wait for all images. Use load only when you need actual image dimensions or full resource availability, like hiding a loading spinner.",
      difficulty: "easy",
      followUps: [
        "How would you initialize a dashboard that depends on sidebar elements existing in the DOM?",
        "What is the difference between DOMContentLoaded and the load event?",
        "How does document.readyState relate to these events?"
      ]
    },
    {
      question: "Explain the difference between async and defer script attributes.",
      answer: "Both async and defer download the script in the background without blocking HTML parsing. The key difference is execution timing. An async script runs as soon as it finishes downloading, regardless of parsing state or other scripts. A defer script waits until the HTML is fully parsed, then runs in the order it appears in the document. Use defer when scripts depend on the DOM or on each other. Use async for independent scripts like analytics. One gotcha: dynamically created scripts are async by default, so set async = false if you need ordered execution.",
      difficulty: "mid",
      followUps: [
        "What happens with dynamically created scripts?",
        "Can you defer an inline script?",
        "What is the speculative parser and how does it relate?"
      ]
    },
    {
      question: "What is layout thrashing and how do you prevent it?",
      answer: "Layout thrashing happens when you repeatedly read a layout property (like offsetWidth) and then write a style (like setting width) inside a loop. Each read forces the browser to recalculate layout synchronously to give you an up-to-date value, because you just changed something. With 100 elements, that is 100 forced layouts instead of one. To prevent it, separate reads and writes into two phases: first collect all the measurements, then apply all the changes. You can also use requestAnimationFrame to batch visual updates. Chrome DevTools Performance panel shows forced reflow warnings, which is the fastest way to spot this issue.",
      difficulty: "hard",
      followUps: [
        "Which CSS properties trigger reflow vs repaint?",
        "How does the browser's lazy layout invalidation work?",
        "What tools can you use to detect layout thrashing?"
      ]
    },
    {
      question: "Why should you avoid the unload event?",
      answer: "The unload event prevents the browser from storing the page in the back-forward cache (bfcache). When a user hits the back button, instead of instantly restoring the page, the browser has to reload it from scratch. This makes navigation feel much slower. Use pagehide instead, which works with bfcache. For sending analytics data when the user leaves, use navigator.sendBeacon, which reliably sends data without blocking navigation or requiring the page to stay alive.",
      difficulty: "mid",
      followUps: [
        "What is the bfcache and how does it work?",
        "What is navigator.sendBeacon and why is it preferred?",
        "How does the unload event affect page restoration when the user hits the back button?"
      ]
    },
    {
      question: "How would you implement a safe DOMReady utility function?",
      answer: "Check document.readyState first. If it is 'loading', the DOM is not ready yet, so add a DOMContentLoaded listener that runs your callback and then removes itself. If readyState is 'interactive' or 'complete', the DOM is already available, so call the callback via queueMicrotask to keep it async and avoid surprising callers who expect the callback to always run later. This approach handles both cases: scripts loaded early in the head and scripts injected dynamically after the page is ready.",
      difficulty: "easy",
      followUps: [
        "Why use a microtask for the already-ready case?",
        "What's the difference between interactive and complete readyState?",
        "How does this differ in SPAs vs traditional pages?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Implement a DOMReady utility",
      difficulty: "easy",
      description: "Build a DOMReady utility that works like jQuery's $(document).ready(). It should execute the callback immediately if the DOM is already loaded, or queue it for when DOMContentLoaded fires.",
      solution: `function domReady(callback) {
  if (typeof callback !== 'function') {
    throw new TypeError('callback must be a function');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function once() {
      document.removeEventListener('DOMContentLoaded', once);
      callback();
    });
  } else {
    queueMicrotask(callback);
  }
}

domReady(() => {
  document.getElementById('app').textContent = 'Ready!';
});`,
      explanation: "If the DOM is still loading, we listen for DOMContentLoaded and clean up the listener after it fires. If the DOM is already ready, we use queueMicrotask so the callback always runs asynchronously. This keeps behavior consistent whether the script loads early or late. The type check at the top fails fast with a clear error instead of a confusing runtime crash."
    },
    {
      title: "Build a script loader with dependency ordering",
      difficulty: "hard",
      description: "Build a script loader that loads multiple scripts in a specified order. Each script should only start loading after the previous one has finished. Handle errors gracefully.",
      solution: `function loadScripts(scripts) {
  const done = new Set();
  const inProgress = new Map();

  function loadOne(src) {
    if (done.has(src)) return Promise.resolve();
    if (inProgress.has(src)) return inProgress.get(src);

    const info = scripts.find(s => s.src === src);
    if (!info) return Promise.reject(new Error('Not found: ' + src));

    const waitForDeps = (info.deps || []).map(d => loadOne(d));

    const promise = Promise.all(waitForDeps).then(() => {
      return new Promise((resolve, reject) => {
        const tag = document.createElement('script');
        tag.src = info.src;
        tag.async = false;
        tag.onload = () => { done.add(src); resolve(); };
        tag.onerror = () => reject(new Error('Failed: ' + src));
        document.head.appendChild(tag);
      });
    });

    inProgress.set(src, promise);
    return promise;
  }

  return Promise.all(scripts.map(s => loadOne(s.src)));
}

loadScripts([
  { src: 'utils.js', deps: [] },
  { src: 'core.js', deps: ['utils.js'] },
  { src: 'app.js', deps: ['core.js', 'utils.js'] },
  { src: 'analytics.js', deps: [] }
]).then(() => console.log('All loaded'));`,
      explanation: "Each script waits for its dependencies to load before it starts. The done Set prevents loading the same script twice, and the inProgress Map reuses the same Promise if a script is requested while it is still downloading. Independent scripts like analytics load in parallel with the dependency chain, so nothing waits longer than it has to."
    }
  ],
  quiz: [
    {
      question: "In what order do these events fire?",
      options: [
        "load → DOMContentLoaded → readystatechange",
        "DOMContentLoaded → readystatechange(complete) → load",
        "readystatechange(complete) → DOMContentLoaded → load",
        "DOMContentLoaded → load → readystatechange(complete)"
      ],
      correct: 1,
      explanation: "DOMContentLoaded fires first because it only waits for HTML parsing. Then readyState changes to 'complete' when all resources are done. Finally, load fires. The key idea: DOMContentLoaded means the DOM tree is built, load means everything (images, styles) is fully loaded. Note: readyState changes to 'interactive' before DOMContentLoaded fires, then to 'complete' when all resources are done."
    },
    {
      question: "What does the 'defer' attribute do on a <script> tag?",
      options: [
        "Downloads and executes the script immediately when ready",
        "Downloads in parallel, executes in order after HTML parsing, before DOMContentLoaded",
        "Downloads in parallel, executes after the load event",
        "Prevents the script from executing until explicitly triggered"
      ],
      correct: 1,
      explanation: "Defer downloads the script in the background while HTML keeps parsing. Once parsing finishes, all deferred scripts run in the order they appear in the HTML, and this happens before DOMContentLoaded fires. This is why defer is ideal for app bundles that need the DOM."
    },
    {
      question: "What is a forced synchronous layout (forced reflow)?",
      options: [
        "Using display: flex on a container",
        "Reading a geometric property after modifying styles, forcing the browser to calculate layout immediately",
        "Using position: fixed on multiple elements",
        "Calling requestAnimationFrame multiple times in a row"
      ],
      correct: 1,
      explanation: "When you change a style and then read a layout property like offsetWidth, the browser cannot give you a stale value. It has to stop and recalculate layout right now. This is forced reflow. In a loop, this means the browser recalculates layout on every single iteration instead of once at the end."
    },
    {
      question: "Which is true about type='module' scripts?",
      options: [
        "They block HTML parsing like regular scripts",
        "They execute in strict mode, are deferred by default, and support import/export",
        "They cannot access the DOM",
        "They must have the .mjs file extension"
      ],
      correct: 1,
      explanation: "Module scripts automatically run in strict mode, are deferred (so they do not block parsing and run after HTML is ready), and enable import/export syntax. They do not block parsing like regular scripts, they can access the DOM just fine, and the .mjs extension is optional."
    }
  ]
};
