export const criticalRenderPath = {
  id: "critical-render-path",
  title: "Critical Rendering Path",
  icon: "🎨",
  tag: "Browser APIs",
  tagColor: "var(--tag-js)",
  subtitle: "Understand how browsers render pages: DOM, CSSOM, render tree, layout, paint.",
  concepts: [
    {
      title: "The Rendering Pipeline",
      explanations: {
        layman: "Think of the browser like a factory assembly line. First it reads your HTML (builds the skeleton), then applies CSS (adds the paint), figures out where everything goes (layout), and finally draws it on screen. Each step must finish before the next one starts.",
        mid: "The browser goes through four stages: Style (calculate CSS), Layout (compute positions and sizes), Paint (fill in pixels), and Composite (layer everything together). Changing a layout property like `width` is expensive because it re-triggers all later stages. Changing only `opacity` skips straight to compositing.",
        senior: "Each stage has different costs. Layout is the most expensive and cascades through the tree. Paint cost depends on the area affected. Compositing runs on the GPU and is cheapest. Profile using the Performance panel's flame chart to see exactly which stages fire and how long they take."
      },
      realWorld: "When your page takes too long to show content or scrolling feels choppy, the rendering pipeline is usually the bottleneck.",
      whenToUse: "When you need to speed up initial page load or make interactions feel smoother.",
      whenNotToUse: "When the slowness is coming from slow API calls or server response times, not the browser itself.",
      pitfalls: "Reading layout properties (like offsetHeight) right after writing styles forces the browser to recalculate layout immediately, killing performance in loops.",
      codeExamples: [
        {
          title: "Optimizing the critical rendering path",
          code: `<!-- Put critical CSS inline in head -->
<style>
  .hero { display: flex; min-height: 100vh; }
  .nav { position: fixed; top: 0; }
</style>

<!-- Load other CSS without blocking render -->
<link rel="preload" href="styles.css" as="style"
      onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="styles.css"></noscript>

<!-- Connect early to important servers -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://api.example.com">

<!-- Show text right away, swap font when ready -->
<style>
  @font-face {
    font-family: 'CustomFont';
    src: url('font.woff2') format('woff2');
    font-display: swap;
  }
</style>

<script>
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.name, entry.startTime.toFixed(1) + 'ms');
  }
});

observer.observe({
  entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift']
});

window.addEventListener('load', () => {
  const timing = performance.getEntriesByType('navigation')[0];
  console.log('DOM ready:', timing.domInteractive.toFixed(1) + 'ms');
  console.log('Fully loaded:', timing.domComplete.toFixed(1) + 'ms');
  console.log('Server response:', timing.responseStart.toFixed(1) + 'ms');
});
</script>`
        }
      ]
    },
    {
      title: "Reflow vs Repaint",
      explanations: {
        layman: "Imagine rearranging furniture in a room (reflow) versus just repainting a wall (repaint). Moving furniture means everything else might need to shift too, which takes more effort. Repainting a wall only changes the color and nothing else moves.",
        mid: "Reflow recalculates the position and size of elements. It's expensive because one element changing size can push other elements around. Repaint just redraws pixels without changing layout. Changing `width` triggers reflow + repaint. Changing `color` triggers only repaint.",
        senior: "Forced synchronous layout happens when you read a geometry property (offsetWidth, getBoundingClientRect) after a pending style change. The browser must flush the layout queue immediately. Batch all reads first, then all writes, or use requestAnimationFrame to defer writes to the next frame."
      },
      realWorld: "If your list re-render or accordion animation causes visible jank, you're probably triggering unnecessary reflows.",
      whenToUse: "When you're animating elements or updating many DOM nodes and need to keep things smooth.",
      whenNotToUse: "When you're only changing things that don't affect layout, like text color or box-shadow.",
      pitfalls: "The classic mistake is reading offsetHeight inside a loop that also sets styles. Each iteration forces the browser to recalculate layout before it can give you the value.",
      codeExamples: [
        {
          title: "Reflow vs repaint triggers and optimization",
          code: `// BAD: uses left/top which trigger reflow every frame
function animateBad(el) {
  let pos = 0;
  function frame() {
    pos += 2;
    el.style.left = pos + 'px';
    el.style.top = pos + 'px';
    if (pos < 300) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// GOOD: uses transform which skips layout and paint
function animateGood(el) {
  let pos = 0;
  el.style.willChange = 'transform';

  function frame() {
    pos += 2;
    el.style.transform = \`translate(\${pos}px, \${pos}px)\`;
    if (pos < 300) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function measureReflowCost() {
  const el = document.getElementById('target');

  // BAD: read-write loop forces layout on every iteration
  const t1 = performance.now();
  for (let i = 0; i < 1000; i++) {
    el.style.width = (i % 100) + 'px';
    const h = el.offsetHeight;
  }
  console.log('Thrashing:', (performance.now() - t1).toFixed(1) + 'ms');

  // GOOD: batch all reads, then all writes
  const t2 = performance.now();
  const heights = [];
  for (let i = 0; i < 1000; i++) {
    heights.push(el.offsetHeight);
  }
  for (let i = 0; i < 1000; i++) {
    el.style.width = (i % 100) + 'px';
  }
  console.log('Batched:', (performance.now() - t2).toFixed(1) + 'ms');
}`
        }
      ]
    },
    {
      title: "GPU Acceleration and Composite Layers",
      explanations: {
        layman: "Your computer has a separate chip (GPU) that's really fast at moving images around. When you tell the browser to use it for animations, things like sliding and fading become buttery smooth because the GPU handles them independently from the main page.",
        mid: "Properties like `transform` and `opacity` can be handled entirely by the compositor on the GPU. This means the main thread stays free for JavaScript. Use `will-change` to hint the browser to pre-create a GPU layer, but remove it after the animation ends to free memory.",
        senior: "Each GPU layer stores its own bitmap in video memory. Adding `will-change` to hundreds of elements creates hundreds of layers, eating GPU memory and slowing down the compositing step. Use Chrome's Layers panel (More Tools > Layers) to see how many layers exist and how much memory they use. The right pattern: apply `will-change` right before the animation starts, then reset it to `'auto'` on `transitionend` to free the memory."
      },
      realWorld: "When a modal fade-in or a carousel slide stutters, promoting the animated element to its own GPU layer usually fixes it.",
      whenToUse: "For animations involving transform or opacity, especially on elements that move or fade frequently.",
      whenNotToUse: "When you don't have active animations. Leaving `will-change` on static elements wastes GPU memory for no benefit.",
      pitfalls: "Adding `will-change` to too many elements at once eats GPU memory and can actually make performance worse. Always clean it up after the animation finishes.",
      codeExamples: [
        {
          title: "GPU acceleration patterns",
          code: `/* Tell browser this element will animate soon */
.animated-card {
  will-change: transform, opacity;
}

/* Old trick to force a GPU layer */
.force-layer {
  transform: translateZ(0);
}

/* Modal that fades and slides in on its own GPU layer */
.modal-enter {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
  transition: opacity 0.3s ease, transform 0.3s ease;
  will-change: transform, opacity;
}

.modal-enter.active {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Tells the browser this element's layout and paint won't affect others */
.card-container {
  contain: layout paint;
}`
        },
        {
          title: "Managing will-change lifecycle in JavaScript",
          code: `// Set will-change before animating, remove it after
function animateWithGPU(el) {
  el.style.willChange = 'transform, opacity';

  requestAnimationFrame(() => {
    el.style.transition = 'transform 0.3s, opacity 0.3s';
    el.style.transform = 'translateX(200px)';
    el.style.opacity = '0.5';

    el.addEventListener('transitionend', function done() {
      el.style.willChange = 'auto'; // free the GPU layer
      el.removeEventListener('transitionend', done);
    });
  });
}

// Simple FPS counter to check if animations are smooth
function trackFPS() {
  let lastTime = performance.now();
  let frames = 0;

  function tick(now) {
    frames++;
    if (now - lastTime >= 1000) {
      console.log('FPS:', frames);
      frames = 0;
      lastTime = now;
    }
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "Walk me through the critical rendering path — from HTML bytes to pixels on screen.",
      answer: "The browser parses HTML into a DOM tree and CSS into a CSSOM tree. It merges them into a render tree (only visible nodes). Then it runs layout to calculate each element's position and size, paints the pixels, and composites layers onto the screen. CSS and synchronous JS in the head block this entire process. To speed it up, inline critical CSS, defer non-essential scripts, and use preconnect for key origins.",
      difficulty: "mid",
      followUps: [
        "What is render-blocking CSS and how do you optimize it?",
        "Where does JavaScript fit in this pipeline?",
        "What is FOUC and how do you prevent it?"
      ]
    },
    {
      question: "What is the difference between reflow and repaint? Which is more expensive?",
      answer: "Reflow recalculates element positions and sizes -- it's triggered by changes to width, height, margin, or font-size. Repaint only redraws pixels for visual changes like color or box-shadow. Reflow is much more expensive because it can cascade through the entire layout tree. In practice, batch your DOM reads before writes to avoid forced synchronous layouts.",
      difficulty: "mid",
      followUps: [
        "Give me a list of CSS properties that trigger each?",
        "How does CSS contain property help?",
        "How would you diagnose a janky list re-render caused by reflows?"
      ]
    },
    {
      question: "How do you achieve smooth 60fps animations in the browser?",
      answer: "You have about 16ms per frame. Stick to animating only transform and opacity since these skip layout and paint and run on the GPU compositor thread. Use requestAnimationFrame instead of setTimeout. Avoid reading layout properties during animation frames. If you need to animate layout properties, consider using the FLIP technique: read layout once, then animate the difference with transforms.",
      difficulty: "hard",
      followUps: [
        "What happens when you exceed the 16ms budget?",
        "How do CSS animations differ from JS animations at the engine level?",
        "What is the compositor thread and how does it help?"
      ]
    },
    {
      question: "What is will-change and what are the tradeoffs of using it?",
      answer: "will-change hints the browser to pre-create a GPU layer for an element so the animation starts fast. The tradeoff is that each layer uses GPU memory. If you slap will-change on hundreds of elements, you get layer explosion and worse performance. The right pattern is: set will-change right before the animation, then reset it to 'auto' on transitionend to free the memory.",
      difficulty: "hard",
      followUps: [
        "How would you manage will-change for a carousel with dozens of slides?",
        "How can you debug layer explosion?",
        "What is the difference between will-change and translateZ(0)?"
      ]
    },
    {
      question: "Why does CSS block rendering, and what can you do about it?",
      answer: "The browser won't render anything until it builds the CSSOM, because rendering without styles would cause a flash of unstyled content (FOUC). So any CSS file in the head blocks rendering. To fix this, inline the CSS needed for above-the-fold content directly in a style tag, and load the rest asynchronously using link rel=preload with an onload handler that switches it to a stylesheet.",
      difficulty: "mid",
      followUps: [
        "What is FOUC and how do you prevent it?",
        "How does preload differ from prefetch for CSS?",
        "What about CSS-in-JS and its impact on rendering?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Build a reflow-free DOM batch updater",
      difficulty: "mid",
      description: "Build a DOM batch updater that collects multiple DOM mutations and applies them in one batch using requestAnimationFrame. This avoids triggering multiple reflows for individual changes.",
      solution: `class DOMBatcher {
  constructor() {
    this.reads = [];
    this.writes = [];
    this.scheduled = false;
  }

  read(fn) {
    this.reads.push(fn);
    this._schedule();
  }

  write(fn) {
    this.writes.push(fn);
    this._schedule();
  }

  _schedule() {
    if (this.scheduled) return;
    this.scheduled = true;
    requestAnimationFrame(() => this._flush());
  }

  _flush() {
    // Run all reads first so they don't force layout between writes
    const readBatch = this.reads.slice();
    this.reads.length = 0;
    readBatch.forEach(fn => fn());

    // Then run all writes together
    const writeBatch = this.writes.slice();
    this.writes.length = 0;
    writeBatch.forEach(fn => fn());

    this.scheduled = false;

    // If reads or writes were added during flush, schedule again
    if (this.reads.length > 0 || this.writes.length > 0) {
      this._schedule();
    }
  }
}

const batcher = new DOMBatcher();

function resizeCards(cards) {
  cards.forEach(card => {
    // Read each card's width first
    batcher.read(() => {
      const width = card.offsetWidth;

      // Then write the calculated height
      batcher.write(() => {
        card.style.height = (width * 0.75) + 'px';
      });
    });
  });
}

const cards = document.querySelectorAll('.card');
resizeCards([...cards]);`,
      explanation: "By separating reads and writes into batches, the browser only calculates layout once instead of once per element. This is the same pattern libraries like fastdom use. Without batching, reading offsetWidth then setting style.height in a loop forces a reflow on every single iteration."
    },
    {
      title: "Implement a performance-aware animation scheduler",
      difficulty: "hard",
      description: "Build an animation scheduler that uses requestAnimationFrame for smooth 60fps animations. It should handle starting, stopping, and chaining animations with proper cleanup.",
      solution: `class AnimationScheduler {
  constructor() {
    this.animations = new Map();
    this.running = false;
    this.frameCount = 0;
    this.droppedFrames = 0;
    this.lastTime = 0;
    this.budget = 16.67; // ms per frame at 60fps
    this.degraded = false;
    this.skip = false;
  }

  add(id, updateFn) {
    this.animations.set(id, {
      update: updateFn,
      start: performance.now()
    });

    if (!this.running) {
      this.running = true;
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this._tick(t));
    }

    // Return a cleanup function to stop this animation
    return () => this.remove(id);
  }

  remove(id) {
    this.animations.delete(id);
    if (this.animations.size === 0) this.running = false;
  }

  _tick(now) {
    if (!this.running) return;

    const gap = now - this.lastTime;

    // Detect dropped frames (gap > 1.5x the budget)
    if (gap > this.budget * 1.5) {
      this.droppedFrames++;

      // If we keep dropping frames, fall back to 30fps
      if (this.droppedFrames > 5 && !this.degraded) {
        this.degraded = true;
        console.warn('Dropping to 30fps');
      }
    }

    // In degraded mode, skip every other frame
    if (this.degraded) {
      this.skip = !this.skip;
      if (this.skip) {
        requestAnimationFrame((t) => this._tick(t));
        return;
      }
    }

    this.lastTime = now;
    this.frameCount++;
    const start = performance.now();

    // Run all animation update functions
    for (const [id, anim] of this.animations) {
      const elapsed = now - anim.start;
      const keepGoing = anim.update(elapsed, now);
      if (keepGoing === false) this.animations.delete(id);
    }

    // Warn if we went over the frame budget
    const duration = performance.now() - start;
    if (duration > this.budget) {
      console.debug('Over budget:', duration.toFixed(1) + 'ms');
    }

    if (this.animations.size > 0) {
      requestAnimationFrame((t) => this._tick(t));
    } else {
      this.running = false;
    }
  }

  getStats() {
    return {
      active: this.animations.size,
      totalFrames: this.frameCount,
      droppedFrames: this.droppedFrames,
      degraded: this.degraded,
      fps: this.degraded ? 30 : 60
    };
  }
}

const scheduler = new AnimationScheduler();
const box = document.getElementById('box');

const stop = scheduler.add('slide', (elapsed) => {
  const progress = Math.min(elapsed / 1000, 1);
  const eased = 1 - Math.pow(1 - progress, 3);

  box.style.transform = \`translateX(\${eased * 300}px)\`;
  box.style.opacity = 1 - eased * 0.5;

  return progress < 1; // return false when done
});

setTimeout(() => {
  console.log('Stats:', scheduler.getStats());
}, 2000);`,
      explanation: "The scheduler tracks frame timing and automatically degrades to 30fps if the device can't keep up. It uses requestAnimationFrame for proper vsync alignment, monitors frame budget overruns, and provides stats for debugging. Each animation gets an elapsed time so it stays time-based rather than frame-based."
    }
  ],
  quiz: [
    {
      question: "Which CSS properties can be animated without triggering reflow or repaint?",
      options: [
        "width and height",
        "margin and padding",
        "transform and opacity",
        "color and background-color"
      ],
      correct: 2,
      explanation: "transform and opacity are handled by the compositor on the GPU. They skip layout and paint entirely, making them the cheapest properties to animate."
    },
    {
      question: "What is the correct order of the browser rendering pipeline?",
      options: [
        "Paint → Layout → CSSOM → DOM → Composite",
        "DOM → CSSOM → Render Tree → Layout → Paint → Composite",
        "CSSOM → DOM → Layout → Render Tree → Paint → Composite",
        "DOM → Layout → CSSOM → Paint → Render Tree → Composite"
      ],
      correct: 1,
      explanation: "The browser first parses HTML into DOM and CSS into CSSOM, merges them into a render tree, then calculates layout, paints pixels, and composites layers."
    },
    {
      question: "Why does reading offsetHeight after setting style.width cause performance problems?",
      options: [
        "offsetHeight is a deprecated property",
        "It forces a synchronous layout calculation (forced reflow)",
        "It triggers a full page repaint",
        "It blocks the compositor thread"
      ],
      correct: 1,
      explanation: "The browser normally batches style changes. But when you read a layout property right after writing one, it must immediately recalculate layout to give you an accurate value. In a loop, this happens on every iteration."
    },
    {
      question: "What does 'will-change: transform' tell the browser?",
      options: [
        "Apply a transform immediately",
        "The element will be transformed soon — pre-promote it to its own GPU layer",
        "Disable transform animations on this element",
        "Use the CPU instead of GPU for transforms"
      ],
      correct: 1,
      explanation: "will-change tells the browser to prepare a separate GPU layer in advance. This avoids the performance hit of creating the layer when the animation actually starts."
    }
  ]
};
