export const responsiveA11y = {
  id: "responsive-a11y",
  title: "Responsive Design & Accessibility",
  icon: "♿",
  tag: "UI/UX",
  tagColor: "var(--tag-system)",
  subtitle: "Flexbox, Grid, media queries, ARIA, keyboard navigation, and screen readers.",
  concepts: [
    {
      title: "Responsive Design: Mobile-First vs Desktop-First",
      explanations: {
        layman: "Mobile-first means you design for the smallest screen first, then add more as the screen gets bigger. Think of packing a suitcase. If you start with a carry-on (mobile), you only pack essentials. When you get a bigger suitcase (tablet, desktop), you add nice-to-haves. Desktop-first is the opposite: you pack a huge suitcase, then try to cram everything into a carry-on. Things get cut and it feels rushed. Since most people browse on phones, starting with mobile ensures the majority of your users get a great experience by default.",
        mid: "Mobile-first means writing base CSS for mobile screens, then using `min-width` media queries to progressively enhance for larger screens. Desktop-first writes base CSS for large screens and uses `max-width` queries to scale down. Mobile-first produces cleaner code because: (1) Base styles are simpler (single column, stacked layout). (2) `min-width` queries add complexity as screen size grows, which is easier to reason about than removing complexity. (3) Mobile browsers don't parse styles inside `min-width` queries they don't match, saving parsing time. (4) Forces content prioritization — you decide what's essential first. (5) Progressive enhancement philosophy — the baseline experience works everywhere, enhancements are layered on. Standard breakpoints: 640px (mobile landscape), 768px (tablet), 1024px (laptop), 1280px (desktop), 1536px (large). Modern CSS also offers container queries (`@container`) that respond to a component's container size rather than viewport, enabling truly portable responsive components.",
        senior: "Responsive strategy in production goes beyond media queries. The modern approach combines: (1) Fluid typography with `clamp()` — `font-size: clamp(1rem, 2.5vw, 2rem)` gives smooth scaling without breakpoints. (2) Fluid spacing using viewport-relative units or CSS custom properties with clamp. (3) Intrinsic layouts using CSS Grid's `auto-fit`/`auto-fill` with `minmax()` — the grid adapts without any media queries. (4) Container queries for component-level responsiveness — a card component behaves differently in a sidebar vs. main content area. (5) Media queries only for major layout shifts (single column to multi-column). Performance considerations: use `<picture>` with `srcset` and `sizes` for responsive images (the browser picks the optimal resolution). Use `content-visibility: auto` for off-screen content (saves rendering cost). Design tokens should include responsive variants — spacing, typography, and component sizes should scale with the viewport. For design systems, responsive behavior should be encoded in the components themselves (intrinsic design) rather than requiring consumers to write media queries."
      },
      realWorld: "Google mandates mobile-first indexing — your mobile site is what Google ranks. Twitter, GitHub, and Airbnb all use mobile-first approaches. Shopify's Polaris design system uses fluid typography with clamp(). Modern CSS frameworks like Tailwind default to mobile-first with min-width breakpoints.",
      whenToUse: "Mobile-first is the standard approach for consumer-facing web apps, e-commerce, content sites, and SaaS products. It aligns with how most users access the web and produces cleaner, more performant CSS.",
      whenNotToUse: "Desktop-first may be appropriate for enterprise dashboards, admin panels, or tools where the primary audience is on desktops. Even then, consider that mobile support may be needed eventually, and retrofitting is harder than planning ahead.",
      pitfalls: "Using fixed pixel widths instead of relative units (rem, em, %, vw). Not testing on real devices (browser DevTools don't perfectly replicate mobile behavior). Hiding content with `display: none` on mobile instead of restructuring the layout (hidden content still downloads). Using viewport units for font size without clamp() (text becomes unreadable on very small or very large screens).",
      codeExamples: [
        {
          title: "Mobile-First Responsive Layout",
          code: `/* Mobile-first: base styles are for mobile */
.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  padding: clamp(1rem, 3vw, 2rem);
}

/* Fluid typography — no breakpoints needed */
h1 {
  font-size: clamp(1.5rem, 4vw, 3rem);
  line-height: 1.2;
}

p {
  font-size: clamp(1rem, 2vw, 1.125rem);
  line-height: 1.6;
}

/* Tablet and up */
@media (min-width: 768px) {
  .layout {
    grid-template-columns: 250px 1fr;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .layout {
    grid-template-columns: 280px 1fr 250px;
    max-width: 1400px;
    margin: 0 auto;
  }
}

/* Intrinsic responsive grid — NO media queries */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
  gap: 1.5rem;
}

/* Container queries for component-level responsiveness */
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

.card {
  display: flex;
  flex-direction: column;
}

@container card (min-width: 400px) {
  .card {
    flex-direction: row;
    align-items: center;
  }
  .card img {
    width: 40%;
  }
}`
        }
      ]
    },
    {
      title: "Flexbox Deep Dive",
      explanations: {
        layman: "Flexbox is like arranging books on a shelf. You decide: Do the books go left-to-right or top-to-bottom? (flex-direction). Should they be packed to the left, centered, or spread out? (justify-content). Should tall and short books align at the top, bottom, or middle? (align-items). If there are too many books for one shelf, should they wrap to a new shelf? (flex-wrap). And for individual books, you can say 'this one should take up twice as much space' (flex-grow) or 'this one should never shrink below this size' (flex-shrink and flex-basis).",
        mid: "Flexbox operates on two axes: the main axis (determined by `flex-direction`: row = horizontal, column = vertical) and the cross axis (perpendicular to main). Key properties on the container: `justify-content` aligns items along the main axis (flex-start, center, space-between, space-around, space-evenly). `align-items` aligns items along the cross axis (stretch, flex-start, center, baseline). `flex-wrap` controls whether items wrap to new lines. `gap` adds space between items. Key properties on items: `flex-grow` controls how extra space is distributed (0 = don't grow, 1 = grow equally). `flex-shrink` controls how items shrink when space is tight (0 = don't shrink). `flex-basis` sets the initial size before growing/shrinking (replaces width/height on the main axis). The shorthand `flex: 1` means `flex-grow: 1; flex-shrink: 1; flex-basis: 0%` — equal distribution. `align-self` overrides `align-items` for individual items. `order` changes visual order without changing DOM order.",
        senior: "Flexbox edge cases and production patterns: (1) The `flex-basis: 0` vs `flex-basis: auto` distinction: with `flex: 1 1 0%`, the item's content size is ignored and space is distributed equally. With `flex: 1 1 auto`, the item's content size is factored in, so items with more content get more space. (2) `min-width: auto` default — flex items won't shrink below their content size by default. Override with `min-width: 0` or `overflow: hidden` to allow shrinking. This is the cause of most 'why won't my flex item shrink?' bugs. (3) `flex-wrap` with `gap` is the modern replacement for negative margin hacks. (4) Using `margin: auto` on a flex item absorbs remaining space — `margin-left: auto` pushes an item to the right (useful for navigation patterns). (5) Performance: flexbox layout is generally fast, but deeply nested flex containers can cause layout thrashing. (6) The `flex` shorthand has gotchas: `flex: 1` expands to `1 1 0%`, `flex: auto` expands to `1 1 auto`, `flex: none` expands to `0 0 auto`. (7) For responsive patterns, combine flex-wrap with min-width on items: `.item { flex: 1 1 300px }` creates a responsive grid-like layout without media queries."
      },
      realWorld: "Flexbox is used in every modern CSS framework. Tailwind's flex utilities, Bootstrap's flex grid, and CSS-in-JS libraries all build on flexbox. The vast majority of website navigation bars, card layouts, form layouts, and centering patterns use flexbox.",
      whenToUse: "Use flexbox for one-dimensional layouts: navigation bars, tool bars, card rows, form layouts, centering content, equal-height columns, space distribution between items, and any layout along a single axis. Flexbox is ideal when content dictates layout size.",
      whenNotToUse: "Use CSS Grid for two-dimensional layouts (rows AND columns simultaneously). Flexbox is not ideal for page-level layout (Grid handles that better). Don't use flexbox for simple inline elements where inline/inline-block suffices.",
      pitfalls: "Forgetting `min-width: 0` when flex items overflow their container (the default `min-width: auto` prevents shrinking). Using `flex: 1` and expecting equal-width items when content differs (use `flex-basis: 0` explicitly). Not handling the cross-axis alignment (items stretch by default, which may not be desired). Using `order` excessively (creates a disconnect between visual and DOM order, hurting accessibility).",
      codeExamples: [
        {
          title: "Flexbox Patterns for Common Layouts",
          code: `/* Navigation bar: logo left, links right */
.navbar {
  display: flex;
  align-items: center;
  padding: 1rem 2rem;
  gap: 1rem;
}
.navbar .logo { flex-shrink: 0; }
.navbar nav { margin-left: auto; display: flex; gap: 1rem; }

/* Card with footer pinned to bottom */
.card {
  display: flex;
  flex-direction: column;
  min-height: 300px;
}
.card .content { flex: 1; } /* Pushes footer down */
.card .footer { margin-top: auto; }

/* Equal-width columns that wrap responsively */
.columns {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.columns > * {
  flex: 1 1 300px; /* Grow, shrink, minimum 300px */
  min-width: 0;    /* Allow shrinking below content */
}

/* Center anything vertically and horizontally */
.center {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

/* Truncating text in flex items */
.flex-item-with-text {
  flex: 1;
  min-width: 0; /* Critical! Without this, text won't truncate */
}
.flex-item-with-text span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Holy grail layout with flexbox */
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.page header, .page footer { flex-shrink: 0; }
.page main {
  flex: 1;
  display: flex;
}
.page .sidebar { flex: 0 0 250px; }
.page .content { flex: 1; min-width: 0; }`
        }
      ]
    },
    {
      title: "CSS Grid Deep Dive",
      explanations: {
        layman: "If flexbox is arranging books on a shelf (one direction), CSS Grid is like arranging tiles on a bathroom wall (rows AND columns). You define a grid: '3 columns, 4 rows.' Then you place items into specific cells or let them auto-fill. You can even tell an item to span multiple cells — like a large tile taking up 2 columns and 2 rows. `fr` units are like shares of the remaining space: `1fr 2fr 1fr` means the middle column gets twice the space of the sides. `auto-fill` is like telling the tiler: 'use as many tiles as fit' while `auto-fit` means 'use as many as fit, and stretch them to fill the wall.'",
        mid: "CSS Grid creates two-dimensional layouts with explicit row and column definitions. Key container properties: `grid-template-columns` / `grid-template-rows` define track sizes. `fr` unit distributes remaining space proportionally. `repeat(3, 1fr)` creates 3 equal columns. `minmax(200px, 1fr)` sets a minimum and maximum for a track. `auto-fit` vs `auto-fill` with `repeat()`: `auto-fill` creates as many tracks as fit (even empty ones), `auto-fit` collapses empty tracks so items stretch to fill the container. Named grid areas with `grid-template-areas` provide a visual layout map. Key item properties: `grid-column: 1 / 3` spans columns 1-2. `grid-row: span 2` spans 2 rows. `place-self: center` centers an item in its cell. The `gap` property sets gutters between tracks. Subgrid (CSS Grid Level 2) allows nested grids to align with the parent grid's tracks — essential for consistent alignment in card layouts.",
        senior: "Grid production patterns and advanced techniques: (1) The RAM pattern (Repeat, Auto, Minmax): `grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr))` — using `min()` inside `minmax()` prevents overflow on small screens where 300px exceeds the container. (2) Subgrid: `grid-template-rows: subgrid` allows child elements to align with the parent grid's row tracks. Critical for card grids where heading, content, and footer need to align across cards. (3) Named lines and areas for complex layouts: `grid-template-areas: 'header header' 'sidebar content' 'footer footer'` makes the layout readable and maintainable. (4) Auto-placement algorithm: Grid auto-places items left-to-right, top-to-bottom by default. `grid-auto-flow: dense` back-fills holes for a masonry-like effect. (5) Content-based sizing: `grid-template-columns: max-content auto min-content` creates columns sized by their content. (6) Responsive without media queries: the `auto-fit + minmax` pattern creates responsive grids intrinsically. (7) Combining Grid and Flexbox: use Grid for page-level and component layouts, Flexbox for inline alignments within grid cells. (8) Performance: Grid layout is computed in a single pass (unlike table layout), but very large grids with many named areas can slow down initial layout computation."
      },
      realWorld: "Mozilla's website is laid out with CSS Grid. Spotify's web player uses Grid for its interface layout. New York Times uses Grid for their article layouts. All modern CSS frameworks include Grid utilities. The subgrid feature, available in all modern browsers, is used by modern design systems for aligned card layouts.",
      whenToUse: "Use CSS Grid for two-dimensional layouts: page layouts, card grids, dashboard panels, magazine-style layouts, any layout where both rows and columns matter. Grid is ideal when the layout structure should dictate content placement.",
      whenNotToUse: "For simple one-dimensional arrangements (a row of buttons, a stack of items), flexbox is simpler. Grid is overkill for a single-axis layout. Don't use Grid for everything — sometimes a simple `margin: auto` or flexbox centering is more appropriate.",
      pitfalls: "Confusing `auto-fill` and `auto-fit` (auto-fit collapses empty tracks, auto-fill doesn't — the difference is subtle but matters). Not using `min()` inside `minmax()` causing overflow on small screens. Overusing fixed track sizes instead of `fr` units (makes the grid rigid). Forgetting that grid items are block-level by default (inline elements need explicit `display: block` or `display: grid` on the cell).",
      codeExamples: [
        {
          title: "CSS Grid Advanced Layout Patterns",
          code: `/* Named areas for page layout */
.page-layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar content aside"
    "footer footer footer";
  grid-template-columns: 250px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  gap: 1rem;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.content { grid-area: content; }
.aside   { grid-area: aside; }
.footer  { grid-area: footer; }

/* Responsive: collapse to single column on mobile */
@media (max-width: 768px) {
  .page-layout {
    grid-template-areas:
      "header"
      "content"
      "sidebar"
      "aside"
      "footer";
    grid-template-columns: 1fr;
  }
}

/* Auto-responsive card grid (no media queries!) */
.card-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(280px, 100%), 1fr)
  );
  gap: 1.5rem;
}

/* Subgrid: aligned card sections across the grid */
.card-grid-aligned {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
.card-aligned {
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 3; /* Card has 3 rows: title, content, footer */
}

/* Dashboard with different sized panels */
.dashboard {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 200px;
  gap: 1rem;
}
.panel-wide { grid-column: span 2; }
.panel-tall { grid-row: span 2; }
.panel-large { grid-column: span 2; grid-row: span 2; }

/* Dense packing for masonry-like effect */
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-auto-flow: dense;
  gap: 0.5rem;
}
.gallery .featured { grid-column: span 2; grid-row: span 2; }`
        }
      ]
    },
    {
      title: "Accessibility: ARIA, Landmarks, and Keyboard Navigation",
      explanations: {
        layman: "Imagine visiting a building blindfolded with only a guide to help you. Accessibility is about making sure the guide (assistive technology like screen readers) can describe everything: 'You're at the front door (landmark). There's a button that says Submit (label). It's currently grayed out (state).' ARIA attributes are like extra labels you put on things so the guide knows what they are. Keyboard navigation is making sure every door can be opened without using a mouse — only the keyboard. Landmarks are like signs on building floors: 'Welcome Area (header), Office Space (main), Break Room (aside).'",
        mid: "Web accessibility ensures all users, including those with disabilities, can perceive, understand, navigate, and interact with your application. Three pillars: (1) Semantic HTML — use the right elements (`<button>`, `<nav>`, `<main>`, `<article>`, `<heading>`) because they have built-in accessibility. A `<div onClick>` looks like a button visually but is invisible to screen readers and not keyboard-accessible. (2) ARIA (Accessible Rich Internet Applications) — attributes that add semantics when HTML alone isn't enough: `role` (what it is: dialog, tablist, alert), `aria-label`/`aria-labelledby` (what it's called), `aria-expanded`/`aria-selected` (what state it's in), `aria-live` (announce changes dynamically). (3) Keyboard navigation — every interactive element must be reachable via Tab, activatable via Enter/Space, and dismissable via Escape (for dialogs/popups). `tabindex='0'` adds an element to tab order, `tabindex='-1'` makes it programmatically focusable but not in tab order. Focus management: when content changes dynamically (modals opening, routes changing), move focus to the new content so screen reader users know something happened.",
        senior: "Production accessibility goes far beyond ARIA attributes. Key areas: (1) Focus management in SPAs — on route changes, focus should move to the new page's main heading or a skip link. Otherwise, screen reader users are stranded at the old position. Use a route-change handler that calls `document.querySelector('main h1')?.focus()`. (2) Live regions — `aria-live='polite'` announces content changes when the screen reader is idle; `aria-live='assertive'` interrupts. Use polite for form validation errors, toast notifications. Use assertive for critical alerts. (3) Custom component patterns (WAI-ARIA Authoring Practices): dialogs must trap focus (Tab cycles within the dialog, Escape closes it), menus need arrow key navigation, tabs need arrow keys for switching and Tab to enter/exit the tabpanel. (4) Testing: use axe-core in CI (`jest-axe` for unit tests, Playwright's `checkA11y` for E2E), manual testing with NVDA/VoiceOver, and keyboard-only testing. (5) Color contrast: WCAG AA requires 4.5:1 for normal text, 3:1 for large text. (6) Motion: `prefers-reduced-motion` media query to disable animations for users who are affected by motion. (7) Common anti-patterns: using ARIA when HTML semantics suffice (first rule of ARIA: don't use ARIA if you can use HTML), aria-hidden on focusable elements (creates a ghost focus trap), improper heading hierarchy (skipping h1 to h3), and links styled as buttons (or vice versa) without proper semantics."
      },
      realWorld: "Gov.uk is considered the gold standard for web accessibility. Apple, Google, and Microsoft all have accessibility teams and detailed guidelines. Lawsuits over inaccessible websites have increased dramatically — Domino's, Beyonce's website, and many e-commerce sites have faced legal action under the ADA. WCAG 2.1 AA compliance is a legal requirement in many jurisdictions.",
      whenToUse: "Accessibility should be built into every feature from the start, not retrofitted. Every interactive component needs keyboard support. Every dynamic content change needs screen reader announcements. Every design needs sufficient color contrast.",
      whenNotToUse: "There is no valid scenario to skip accessibility. Even internal tools should be accessible — employees may have disabilities. The cost of building accessibility in from the start is much lower than retrofitting later.",
      pitfalls: "Adding ARIA roles to elements that already have them (`<button role='button'>` is redundant). Using `tabindex` values greater than 0 (creates unpredictable tab order — use 0 or -1 only). Using `aria-hidden='true'` on elements that contain focusable children (creates an invisible focus trap). Not testing with actual screen readers (automated tools catch about 30% of accessibility issues). Relying solely on color to convey information (colorblind users can't distinguish red from green error states).",
      codeExamples: [
        {
          title: "Accessible Modal Dialog with Focus Trap",
          code: `function Modal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Save the element that had focus before opening
      previousFocusRef.current = document.activeElement;

      // Focus the modal
      modalRef.current?.focus();

      // Trap focus inside modal
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
          return;
        }
        if (e.key !== 'Tab') return;

        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    } else {
      // Restore focus when modal closes
      previousFocusRef.current?.focus();
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-title">{title}</h2>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

/* Skip link for keyboard navigation */
function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-link"
      /* CSS: visually hidden until focused */
    >
      Skip to main content
    </a>
  );
}

/* Accessible form with error announcements */
function AccessibleForm() {
  const [errors, setErrors] = useState({});

  return (
    <form aria-label="Registration form">
      {/* Live region announces errors to screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {Object.values(errors).join('. ')}
      </div>

      <label htmlFor="email">
        Email <span aria-hidden="true">*</span>
        <span className="sr-only">(required)</span>
      </label>
      <input
        id="email"
        type="email"
        aria-required="true"
        aria-invalid={!!errors.email}
        aria-describedby={errors.email ? 'email-error' : undefined}
      />
      {errors.email && (
        <span id="email-error" role="alert">
          {errors.email}
        </span>
      )}
    </form>
  );
}`
        }
      ]
    },
    {
      title: "Screen Readers and Semantic HTML",
      explanations: {
        layman: "A screen reader is software that reads a website aloud to people who are blind or have low vision. But it doesn't read the visual appearance — it reads the underlying code. If you use the right HTML elements (semantic HTML), the screen reader understands the structure: 'Navigation with 5 links. Main content. Heading level 1: Welcome. Paragraph: blah blah. Button: Submit.' But if everything is just `<div>` and `<span>`, the screen reader sees a flat wall of text with no structure — like reading a book with no chapters, headings, or paragraphs. It's all just one continuous blob.",
        mid: "Screen readers (NVDA, JAWS, VoiceOver, TalkBack) parse the accessibility tree — a simplified representation of the DOM that the browser builds from HTML semantics and ARIA attributes. Semantic HTML creates a rich accessibility tree automatically: `<nav>` becomes a navigation landmark, `<button>` is announced as a button with its label, `<h1>-<h6>` create a navigable heading hierarchy. Screen reader navigation patterns: (1) Heading navigation — users press H to jump between headings (most common navigation method). (2) Landmark navigation — users jump between `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`. (3) Form navigation — users press F to jump between form elements. (4) Link navigation — users press K to jump between links. This is why semantic HTML matters: it enables these navigation shortcuts. Key semantic elements: `<button>` (interactive, keyboard-focusable, Space/Enter activation), `<a href>` (navigation, keyboard-focusable, Enter activation), `<nav>` (navigation landmark), `<main>` (main content landmark), `<article>` (self-contained content), `<section>` with aria-label (named region), `<time>` (machine-readable dates).",
        senior: "Building for screen readers requires understanding the accessibility tree and the browser's role in constructing it. The accessibility tree includes: role (what it is), name (what it's called), state (what condition it's in), and value (current value). Name computation follows a priority: (1) `aria-labelledby` (references another element), (2) `aria-label` (direct string), (3) native labels (`<label>`, alt text, `<caption>`), (4) content (text inside the element). Common mistakes: (1) Images without alt text — decorative images need `alt=''` (empty) and `role='presentation'`, not a missing alt attribute (missing alt causes the screen reader to read the filename). (2) Icon buttons without labels — `<button><svg>...</svg></button>` is announced as just 'button' with no name. Add `aria-label='Close'`. (3) Custom components without roles — a `<div>` styled as a tab panel needs `role='tabpanel'`, `aria-labelledby` pointing to its tab. (4) Dynamic content — SPAs that update content without page loads need `aria-live` regions or focus management to notify screen readers. (5) Virtual scrolling — long lists rendered virtually break screen reader list navigation. Use `role='feed'` or `aria-setsize`/`aria-posinset` for virtual lists. Testing: always test with at least one screen reader (VoiceOver on Mac is free, NVDA on Windows is free). Automated tools catch structural issues but can't verify that the user experience makes sense."
      },
      realWorld: "Approximately 7 million screen reader users in the US alone (2023 WebAIM survey). VoiceOver comes built into every Apple device. NVDA is free open-source software used by millions on Windows. Google Docs, Facebook, and GitHub all invest heavily in screen reader compatibility.",
      whenToUse: "Semantic HTML should be your default approach for all web development. Think of it as the first and most impactful accessibility decision you make. Before reaching for ARIA, ask: 'Is there an HTML element that does this natively?'",
      whenNotToUse: "The first rule of ARIA is: don't use ARIA when native HTML semantics are available. A `<button>` is always better than `<div role='button' tabindex='0' onKeyDown={...}>`. The second rule: don't change native semantics unless you must. Don't add `role='heading'` to a `<p>` when you could use an `<h3>`.",
      pitfalls: "Using `<div>` and `<span>` for everything (zero semantic value). Using heading tags for visual size instead of document structure (skip from h1 to h4 breaks navigation). Using `aria-label` on non-interactive elements (screen readers may ignore it). Using `aria-hidden='true'` on a container that contains focusable children (creates phantom focus). Not providing text alternatives for non-text content (images, icons, charts).",
      codeExamples: [
        {
          title: "Semantic HTML vs Div Soup",
          code: `<!-- BAD: Div soup — screen reader sees flat content -->
<div class="header">
  <div class="nav">
    <div class="link" onclick="goto('/')">Home</div>
    <div class="link" onclick="goto('/about')">About</div>
  </div>
</div>
<div class="main">
  <div class="title">Welcome</div>
  <div class="text">Content here...</div>
  <div class="btn" onclick="submit()">Submit</div>
</div>

<!-- GOOD: Semantic HTML — screen reader navigates easily -->
<header>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/about">About</a></li>
    </ul>
  </nav>
</header>
<main>
  <h1>Welcome</h1>
  <p>Content here...</p>
  <button type="submit">Submit</button>
</main>
<footer>
  <p>&copy; 2024 My Site</p>
</footer>

<!--
Screen reader on the good version:
"Banner landmark. Navigation: Main navigation. List of 2 items.
Link: Home. Link: About. End of list. End of navigation.
Main landmark. Heading level 1: Welcome.
Content here. Button: Submit.
Content info landmark."
-->

<!-- Accessible icon button -->
<button aria-label="Close dialog">
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <path d="M6 6L18 18M6 18L18 6" />
  </svg>
</button>

<!-- Accessible data visualization -->
<figure role="img" aria-label="Sales increased 40% from Q1 to Q4 2024">
  <div class="chart" aria-hidden="true">
    <!-- Visual chart that screen readers skip -->
  </div>
  <figcaption>Quarterly sales growth, 2024</figcaption>
</figure>`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "What is the difference between mobile-first and desktop-first CSS, and which do you prefer?",
      answer: "Mobile-first writes base styles for mobile screens and uses min-width media queries to enhance for larger screens. Desktop-first writes base styles for large screens and uses max-width queries to adapt down. I prefer mobile-first because: (1) it forces content prioritization — you decide what's essential on the smallest screen, (2) it produces cleaner CSS since base styles are simpler (single column, stacked), (3) it aligns with progressive enhancement, and (4) mobile browsers skip parsing styles in min-width queries they don't match. The base styles work everywhere as a fallback, and complexity is layered on for capable devices.",
      difficulty: "easy",
      followUps: [
        "How do container queries change the responsive design approach?",
        "What are the standard breakpoints you use?",
        "How does fluid typography with clamp() reduce the need for breakpoints?"
      ]
    },
    {
      question: "Explain the difference between flexbox and CSS Grid. When would you use each?",
      answer: "One sentence each: Flexbox lays things out in ONE direction (a row or a column). Grid lays things out in TWO directions (rows AND columns at the same time). When to use Flexbox: nav bars, button groups, centering items, or any time content flows in a single line and items should stretch or shrink to fit. When to use Grid: page layouts with a sidebar + main + footer, card grids, dashboards — anywhere you need to control both rows and columns. The practical rule: Grid defines the overall page structure, Flexbox aligns items inside each Grid cell. They are partners, not competitors. You will use both in almost every project.",
      difficulty: "mid",
      followUps: [
        "Can you achieve a Grid layout using only Flexbox? What are the limitations?",
        "What is subgrid and when would you use it?",
        "How do auto-fit and auto-fill differ?"
      ]
    },
    {
      question: "What is ARIA and when should you use it?",
      answer: "ARIA (Accessible Rich Internet Applications) is a set of HTML attributes that provide additional semantics to the accessibility tree, enabling assistive technologies to understand custom interactive components. ARIA adds roles (what an element is: dialog, tab, alert), properties (characteristics: aria-label, aria-required), and states (current condition: aria-expanded, aria-selected). The first rule of ARIA: don't use it if a native HTML element already provides the semantics. A `<button>` is always better than `<div role='button'>`. Use ARIA when: building custom widgets that have no HTML equivalent (tab panels, comboboxes, tree views), communicating dynamic state changes (aria-live regions for toast notifications), providing additional labels (aria-label for icon buttons, aria-describedby for form help text), or linking related elements (aria-labelledby, aria-controls).",
      difficulty: "mid",
      followUps: [
        "What are the five rules of ARIA?",
        "What is the accessibility tree and how does the browser build it?",
        "How does aria-live work and what are the different politeness levels?"
      ]
    },
    {
      question: "How would you implement keyboard navigation for a custom tab component?",
      answer: "Following WAI-ARIA Authoring Practices for tabs: The tab list has `role='tablist'`. Each tab has `role='tab'`, `aria-selected` (true/false), and `aria-controls` pointing to its panel's ID. Each panel has `role='tabpanel'`, `aria-labelledby` pointing to its tab. Keyboard behavior: Left/Right Arrow moves focus between tabs and activates them. Home/End moves to first/last tab. Tab key moves focus from the tab to the tabpanel content (not to the next tab). Only the active tab has `tabindex='0'`; inactive tabs have `tabindex='-1'` (roving tabindex pattern). This means the Tab key skips all inactive tabs — the user arrows between tabs and Tabs into the content.",
      difficulty: "hard",
      followUps: [
        "What is roving tabindex and how does it differ from aria-activedescendant?",
        "How do you handle vertical vs horizontal tab orientations?",
        "What if the tab content loads asynchronously?"
      ]
    },
    {
      question: "What is focus management and why is it important in single-page applications?",
      answer: "Focus management is controlling which element has keyboard focus in response to user actions and dynamic content changes. In multi-page websites, the browser handles focus naturally — every page load resets focus to the top. In SPAs, route changes don't trigger page loads, so focus stays wherever it was. If a user navigates from /products to /checkout, focus stays on the navigation link instead of moving to the checkout content. Screen reader users have no indication anything changed. Solutions: (1) On route change, focus the main heading or a skip-navigation target. (2) When opening a modal, focus the first interactive element inside it and trap focus. (3) When closing a modal, return focus to the element that triggered it. (4) When deleting a list item, focus the next item (not leaving focus on empty space). (5) When showing validation errors, focus the first error field.",
      difficulty: "hard",
      followUps: [
        "How do you implement a focus trap for modal dialogs?",
        "What is the difference between tabindex 0, -1, and positive values?",
        "How does focus work with Shadow DOM?"
      ]
    },
    {
      question: "Explain the CSS flex shorthand. What does `flex: 1`, `flex: auto`, and `flex: none` mean?",
      answer: "`flex` is shorthand for `flex-grow`, `flex-shrink`, and `flex-basis`. `flex: 1` expands to `flex: 1 1 0%` — the item grows and shrinks equally, and the base size is 0 (so all space is distributed by flex-grow, resulting in equal widths regardless of content). `flex: auto` expands to `flex: 1 1 auto` — the item grows and shrinks, but its base size is its content size (so items with more content get more space). `flex: none` expands to `flex: 0 0 auto` — the item neither grows nor shrinks, staying at its content size. Common gotcha: `flex: 1` is NOT the same as `flex-grow: 1`. Writing only `flex-grow: 1` keeps the default `flex-basis: auto`, meaning content size still affects distribution. `flex: 1` sets basis to 0%, giving truly equal-sized items.",
      difficulty: "mid",
      followUps: [
        "What is the default flex value and what does it mean?",
        "Why won't a flex item shrink below its content size?",
        "What is the difference between flex-basis and width?"
      ]
    },
    {
      question: "How would you make a data visualization (chart) accessible?",
      answer: "Charts present unique accessibility challenges because they convey information visually. Multi-layered approach: (1) Provide a text summary using `role='img'` and `aria-label` on the chart container with a concise description of the key insight (e.g., 'Revenue grew 40% year over year'). (2) Include a data table as an alternative — either visible below the chart or hidden but accessible via a toggle/link. The table should contain all the data the chart represents. (3) For interactive charts, use ARIA roles: `role='figure'` for the container, aria-described by a linked description, and keyboard-navigable data points with tooltips announced via aria-live. (4) Ensure sufficient color contrast AND don't rely solely on color — use patterns, labels, or different shapes to distinguish data series (colorblind users). (5) Add a `<figcaption>` for a visible description. (6) Mark the visual chart element with `aria-hidden='true'` if a full text alternative is provided.",
      difficulty: "hard",
      followUps: [
        "How would you handle real-time updating charts for screen readers?",
        "What WCAG success criteria specifically apply to data visualizations?",
        "How does the prefers-reduced-motion media query affect chart animations?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Build a Responsive Navigation with Keyboard Support",
      difficulty: "mid",
      description: "Create a responsive navigation component that collapses to a hamburger menu on mobile, supports keyboard navigation (arrow keys between items, Escape to close), and includes proper ARIA attributes for screen readers.",
      solution: `function ResponsiveNav({ items }) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const navRef = useRef(null);
  const menuButtonRef = useRef(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Close on Escape, navigate with arrows
  const handleKeyDown = useCallback((e) => {
    const links = navRef.current?.querySelectorAll('[role="menuitem"]');
    if (!links?.length) return;

    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        menuButtonRef.current?.focus();
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        setFocusIndex(prev => (prev + 1) % links.length);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        setFocusIndex(prev => (prev - 1 + links.length) % links.length);
        break;
      case 'Home':
        e.preventDefault();
        setFocusIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusIndex(links.length - 1);
        break;
    }
  }, []);

  // Focus the active link when focusIndex changes
  useEffect(() => {
    if (focusIndex >= 0) {
      const links = navRef.current?.querySelectorAll('[role="menuitem"]');
      links?.[focusIndex]?.focus();
    }
  }, [focusIndex]);

  // Close menu on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, []);

  const showMenu = !isMobile || isOpen;

  return (
    <nav ref={navRef} aria-label="Main navigation" onKeyDown={handleKeyDown}>
      {isMobile && (
        <button
          ref={menuButtonRef}
          aria-expanded={isOpen}
          aria-controls="nav-menu"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setIsOpen(!isOpen)}
          className="hamburger"
        >
          <span aria-hidden="true">{isOpen ? '✕' : '☰'}</span>
        </button>
      )}

      {showMenu && (
        <ul id="nav-menu" role="menubar" className={isMobile ? 'mobile' : ''}>
          {items.map((item, index) => (
            <li key={item.href} role="none">
              <a
                href={item.href}
                role="menuitem"
                tabIndex={focusIndex === index ? 0 : -1}
                aria-current={item.isActive ? 'page' : undefined}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/* CSS */
/*
nav ul {
  display: flex; gap: 1rem; list-style: none;
}
nav ul.mobile {
  flex-direction: column; position: absolute;
  top: 100%; left: 0; right: 0;
  background: white; box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
.hamburger { display: none; }
@media (max-width: 768px) { .hamburger { display: block; } }
a[aria-current="page"] { font-weight: bold; border-bottom: 2px solid; }
*/`,
      explanation: "This navigation follows WAI-ARIA menu pattern: roving tabindex for arrow key navigation between items, Escape to close, Home/End to jump to first/last item. The hamburger button announces its state via aria-expanded. The menu is linked via aria-controls. aria-current='page' indicates the active page. The component handles both mobile (collapsible) and desktop (always visible) layouts with proper focus management."
    },
    {
      title: "Create a Responsive Grid System with CSS Custom Properties",
      difficulty: "mid",
      description: "Build a reusable CSS grid system using custom properties (CSS variables) that supports configurable columns, breakpoints, and gap sizes. Include utility classes for column spanning and responsive visibility.",
      solution: `/* Responsive Grid System with CSS Custom Properties */

:root {
  /* Grid configuration tokens */
  --grid-columns: 12;
  --grid-gap: 1rem;
  --grid-max-width: 1200px;
  --grid-padding: 1rem;

  /* Breakpoints (for documentation, CSS can't use vars in media queries) */
  /* sm: 640px, md: 768px, lg: 1024px, xl: 1280px */
}

/* Container */
.container {
  width: 100%;
  max-width: var(--grid-max-width);
  margin-inline: auto;
  padding-inline: var(--grid-padding);
}

/* Grid row */
.grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns), 1fr);
  gap: var(--grid-gap);
}

/* Column spans using CSS custom property */
.col {
  grid-column: span min(var(--span, var(--grid-columns)), var(--grid-columns));
}

/* Generate spans */
.col-1  { --span: 1; }
.col-2  { --span: 2; }
.col-3  { --span: 3; }
.col-4  { --span: 4; }
.col-5  { --span: 5; }
.col-6  { --span: 6; }
.col-7  { --span: 7; }
.col-8  { --span: 8; }
.col-9  { --span: 9; }
.col-10 { --span: 10; }
.col-11 { --span: 11; }
.col-12 { --span: 12; }

/* Responsive spans */
@media (min-width: 640px) {
  .sm\\:col-1  { --span: 1; }
  .sm\\:col-2  { --span: 2; }
  .sm\\:col-3  { --span: 3; }
  .sm\\:col-4  { --span: 4; }
  .sm\\:col-6  { --span: 6; }
  .sm\\:col-8  { --span: 8; }
  .sm\\:col-12 { --span: 12; }
}

@media (min-width: 768px) {
  .md\\:col-1  { --span: 1; }
  .md\\:col-2  { --span: 2; }
  .md\\:col-3  { --span: 3; }
  .md\\:col-4  { --span: 4; }
  .md\\:col-6  { --span: 6; }
  .md\\:col-8  { --span: 8; }
  .md\\:col-12 { --span: 12; }
}

@media (min-width: 1024px) {
  .lg\\:col-1  { --span: 1; }
  .lg\\:col-2  { --span: 2; }
  .lg\\:col-3  { --span: 3; }
  .lg\\:col-4  { --span: 4; }
  .lg\\:col-6  { --span: 6; }
  .lg\\:col-8  { --span: 8; }
  .lg\\:col-12 { --span: 12; }
}

/* Auto-responsive grid (no classes needed) */
.grid-auto {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(var(--grid-min-size, 250px), 100%), 1fr)
  );
  gap: var(--grid-gap);
}

/* Column offset */
.col-start-1 { grid-column-start: 1; }
.col-start-2 { grid-column-start: 2; }
.col-start-3 { grid-column-start: 3; }
.col-start-4 { grid-column-start: 4; }

/* Gap variants */
.gap-0  { --grid-gap: 0; }
.gap-sm { --grid-gap: 0.5rem; }
.gap-md { --grid-gap: 1rem; }
.gap-lg { --grid-gap: 2rem; }

/* Responsive visibility */
.hide-mobile { display: none; }
@media (min-width: 768px) {
  .hide-mobile { display: block; }
  .hide-desktop { display: none; }
}

/* Usage example in HTML:
<div class="container">
  <div class="grid">
    <div class="col col-12 md:col-8">Main content</div>
    <div class="col col-12 md:col-4">Sidebar</div>
  </div>

  <div class="grid-auto" style="--grid-min-size: 300px;">
    <div>Card 1</div>
    <div>Card 2</div>
    <div>Card 3</div>
  </div>
</div>
*/`,
      explanation: "This grid system uses CSS custom properties for configuration (columns, gap, max-width), making it easy to customize per-context by setting a CSS variable. The --span variable pattern allows responsive overrides at each breakpoint. The grid-auto class provides a fully responsive layout with zero media queries using auto-fit + minmax. The system follows mobile-first principles with min-width breakpoints."
    },
    {
      title: "Build an Accessible Accordion with Proper ARIA",
      difficulty: "hard",
      description: "Create an accordion component that follows WAI-ARIA Authoring Practices. Support keyboard navigation (arrow keys between headers, Home/End), proper ARIA attributes (expanded, controls, regions), and smooth animations that respect prefers-reduced-motion.",
      solution: `function Accordion({ items, allowMultiple = false }) {
  const [openPanels, setOpenPanels] = useState(new Set());
  const headersRef = useRef([]);

  const togglePanel = useCallback((index) => {
    setOpenPanels(prev => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, [allowMultiple]);

  const handleKeyDown = useCallback((e, index) => {
    const headers = headersRef.current.filter(Boolean);
    let targetIndex;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        targetIndex = (index + 1) % headers.length;
        break;
      case 'ArrowUp':
        e.preventDefault();
        targetIndex = (index - 1 + headers.length) % headers.length;
        break;
      case 'Home':
        e.preventDefault();
        targetIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        targetIndex = headers.length - 1;
        break;
      default:
        return;
    }

    headers[targetIndex]?.focus();
  }, []);

  return (
    <div className="accordion" role="presentation">
      {items.map((item, index) => {
        const isOpen = openPanels.has(index);
        const headerId = 'accordion-header-' + index;
        const panelId = 'accordion-panel-' + index;

        return (
          <div key={index} className="accordion-item">
            <h3>
              <button
                ref={el => headersRef.current[index] = el}
                id={headerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => togglePanel(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="accordion-trigger"
              >
                <span>{item.title}</span>
                <span
                  aria-hidden="true"
                  className={'accordion-icon' + (isOpen ? ' open' : '')}
                >
                  &#9660;
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              hidden={!isOpen}
              className={'accordion-panel' + (isOpen ? ' open' : '')}
            >
              <div className="accordion-content">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* CSS with animation respecting prefers-reduced-motion */
/*
.accordion-trigger {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  text-align: left;
}

.accordion-trigger:focus-visible {
  outline: 2px solid #005fcc;
  outline-offset: -2px;
}

.accordion-trigger:hover {
  background: #f5f5f5;
}

.accordion-icon {
  transition: transform 0.2s ease;
}

.accordion-icon.open {
  transform: rotate(180deg);
}

.accordion-panel {
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.3s ease;
}

.accordion-panel.open {
  max-height: 500px;
}

.accordion-content {
  padding: 1rem;
}

@media (prefers-reduced-motion: reduce) {
  .accordion-icon,
  .accordion-panel {
    transition: none;
  }
}
*/`,
      explanation: "This accordion follows WAI-ARIA Authoring Practices: buttons inside headings serve as triggers, aria-expanded communicates state, aria-controls links buttons to panels, role='region' with aria-labelledby marks panels as landmarks. Keyboard navigation uses arrow keys between headers (not Tab, which should go to the next focusable element outside the accordion). The hidden attribute removes closed panels from the accessibility tree. CSS animations respect prefers-reduced-motion for users sensitive to motion."
    }
  ],
  quiz: [
    {
      question: "What does `flex: 1` expand to?",
      options: [
        "flex-grow: 1; flex-shrink: 0; flex-basis: auto",
        "flex-grow: 1; flex-shrink: 1; flex-basis: 0%",
        "flex-grow: 1; flex-shrink: 1; flex-basis: auto",
        "flex-grow: 1; flex-shrink: 0; flex-basis: 0%"
      ],
      correct: 1,
      explanation: "`flex: 1` is shorthand for `flex-grow: 1; flex-shrink: 1; flex-basis: 0%`. The key detail is flex-basis: 0%, which means the item's content size is ignored when distributing space — all space is divided equally by flex-grow. This is different from `flex-grow: 1` alone, which keeps `flex-basis: auto`."
    },
    {
      question: "What is the first rule of ARIA?",
      options: [
        "Always add aria-label to every element",
        "Use aria-hidden on decorative elements",
        "Don't use ARIA if a native HTML element already provides the semantics",
        "Every interactive element needs a role attribute"
      ],
      correct: 2,
      explanation: "The first rule of ARIA is: if you can use a native HTML element or attribute with the semantics you need already built in, then do so. `<button>` is always better than `<div role='button' tabindex='0'>` because it comes with keyboard handling, focus management, and accessibility semantics for free."
    },
    {
      question: "What is the difference between `auto-fill` and `auto-fit` in CSS Grid?",
      options: [
        "auto-fill creates flexible tracks; auto-fit creates fixed tracks",
        "auto-fill keeps empty tracks; auto-fit collapses empty tracks so items stretch",
        "auto-fill works with min-width; auto-fit works with max-width",
        "There is no difference; they are aliases"
      ],
      correct: 1,
      explanation: "`auto-fill` creates as many tracks as can fit in the container, even if they're empty (leaving whitespace at the end). `auto-fit` also creates tracks, but collapses empty ones to zero width, allowing the filled tracks to stretch and fill the entire container. The difference is only visible when there are fewer items than available tracks."
    },
    {
      question: "Why is it important to manage focus when a modal dialog opens?",
      options: [
        "To improve CSS animations",
        "So keyboard and screen reader users can interact with the modal, since focus doesn't move automatically",
        "To prevent memory leaks",
        "Because React requires it for event delegation"
      ],
      correct: 1,
      explanation: "When a modal opens, keyboard focus stays where it was on the page behind the modal. Keyboard users can't Tab to the modal content, and screen reader users don't know the modal appeared. Focus must be moved into the modal, trapped there (Tab cycles within it), and returned to the trigger element when the modal closes."
    },
    {
      question: "Which media query approach is considered mobile-first?",
      options: [
        "@media (max-width: 768px) { /* mobile styles */ }",
        "@media (min-width: 768px) { /* tablet and up styles */ }",
        "@media (width < 768px) { /* mobile styles */ }",
        "@media screen and (device-width: 768px) { /* tablet styles */ }"
      ],
      correct: 1,
      explanation: "Mobile-first uses `min-width` media queries. The base CSS (outside any media query) targets mobile screens. Then `@media (min-width: 768px)` adds or overrides styles for screens 768px and wider. This approach starts with the simplest layout and progressively enhances for larger screens."
    }
  ]
};
