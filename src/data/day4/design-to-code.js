export const designToCode = {
  id: "design-to-code",
  title: "Figma to Code Workflow",
  icon: "🎨",
  tag: "UI/UX",
  tagColor: "var(--tag-system)",
  subtitle: "Translating designs into pixel-perfect, responsive, maintainable implementations",
  concepts: [
    {
      title: "Inspecting and Extracting from Figma",
      explanations: {
        layman: `Think of Figma as a blueprint for a house. Before you start building, you need exact measurements: how wide is this room, what color are the walls, how much space between the windows? Figma gives you all of that for a website — exact sizes, colors, spacing, and fonts.\n\nDev Mode in Figma is like having the architect standing next to you, pointing at each detail: 'this gap is 16 pixels, this color is #1a1a2e, this font is 14px medium.' You click on any element and see its exact properties. No guessing.`,
        mid: `Figma's Dev Mode provides:\n\n1. Inspect panel: Click any element to see dimensions, colors, typography, spacing, border radius, shadows, and opacity.\n2. CSS/code generation: Figma generates CSS for selected elements (not production-quality, but useful for values).\n3. Assets export: Export icons as SVG, images at 1x/2x/3x.\n4. Spacing measurements: Hold Alt and hover between elements to see exact gaps.\n5. Auto Layout inspection: See padding, gap, direction — maps directly to Flexbox.\n\nWorkflow: Start by identifying the design's grid system and spacing scale. Extract the color palette, typography scale, and common component patterns before writing any code. Create CSS variables or Tailwind config entries for these tokens.`,
        senior: `Production extraction workflow:\n\n1. Design tokens first: Before any component code, extract the complete token system — colors (including semantic names like 'surface-primary', not just hex values), typography scale (size, weight, line-height, letter-spacing for each level), spacing scale (4px base unit common), border radii, shadows, and breakpoints.\n\n2. Component audit: Map Figma components to your component library. Identify variants (size, color, state). Note composition patterns — which components are composed of other components.\n\n3. Responsive strategy: Check if the designer provided mobile, tablet, and desktop frames. Identify breakpoints and how layouts transform. If only desktop is provided, negotiate mobile behavior before coding.\n\n4. Pixel perfection vs pragmatism: Match exact values from Figma, but round to your spacing scale. If the designer used 13px and your scale has 12 and 16, discuss with the designer. Don't create one-off values.\n\n5. Animation specifications: Request animation details if not provided — duration, easing, properties. Default to 200ms ease-out for micro-interactions if unspecified.`
      },
      realWorld: "Every frontend team works from Figma designs. The quality of the design-to-code translation directly impacts how polished the product feels and how maintainable the code is.",
      whenToUse: "Always inspect designs thoroughly before coding. Rushing to code without proper extraction leads to inconsistent implementations and design debt.",
      whenNotToUse: "Don't spend excessive time on pixel-perfect extraction for rapid prototypes or internal tools where visual polish isn't the priority.",
      pitfalls: "Blindly copying Figma's generated CSS (it's often verbose and non-semantic). Using absolute values instead of design tokens. Not accounting for responsive behavior. Not discussing ambiguous designs with the designer before implementing.",
      codeExamples: [
        {
          title: "Design Tokens from Figma to CSS Variables",
          code: `/* Extracted from Figma design system */
:root {
  /* Colors — semantic naming */
  --color-surface-primary: #ffffff;
  --color-surface-secondary: #f8f9fa;
  --color-surface-elevated: #ffffff;

  --color-text-primary: #1a1a2e;
  --color-text-secondary: #64748b;
  --color-text-disabled: #94a3b8;

  --color-brand-primary: #6366f1;
  --color-brand-hover: #4f46e5;
  --color-brand-light: #eef2ff;

  --color-border-default: #e2e8f0;
  --color-border-strong: #cbd5e1;

  /* Typography scale */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */

  /* Spacing scale (4px base) */
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */

  /* Border radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}`
        }
      ]
    },
    {
      title: "Component API Design",
      explanations: {
        layman: `When you build a LEGO set, each block has a specific shape and connection points. You don't need to understand how the plastic is molded — you just snap pieces together. Good component API design is like designing LEGO blocks: clear connections (props), predictable behavior, and easy to combine.`,
        mid: `Component API design is about creating the right interface for your components:\n\n1. Props: What inputs does the component accept? Keep the API surface small. Use sensible defaults.\n2. Variants: Use a variant prop instead of boolean flags. 'variant="primary"' is clearer than 'isPrimary={true}'.\n3. Composition: Prefer composition over configuration. A Card component with Card.Header, Card.Body, Card.Footer is more flexible than a Card with headerContent, bodyContent props.\n4. Polymorphism: The 'as' prop pattern lets components render as different HTML elements. A Button with as="a" renders an anchor tag.\n5. Forwarding: Forward refs and spread remaining props to the root element for flexibility.\n\nFollow the principle: common things should be easy, complex things should be possible.`,
        senior: `Senior-level component API design considers:\n\n1. Inversion of control: Give consumers control over rendering via render props, slot patterns, or compound components. Don't trap them in your abstraction.\n\n2. Accessibility built-in: The component API should make it hard to create inaccessible UIs. A Dialog component should manage focus trap, escape key, and aria attributes automatically.\n\n3. Controlled vs uncontrolled: Support both patterns. An Accordion can be uncontrolled (manages its own open state) or controlled (parent passes openIndex and onChange).\n\n4. Type safety through constraints: Design props so invalid combinations are impossible. If variant='ghost' doesn't support size='xl', model that constraint.\n\n5. Performance by default: Memoize callbacks internally, virtualize long lists, lazy load heavy sub-components. The consumer shouldn't need to optimize your component.\n\n6. Escape hatches: className/style props for visual overrides, data attributes for testing, ref forwarding for imperative access.`
      },
      realWorld: "Every design system (Material UI, Chakra, Radix) demonstrates these patterns. Well-designed component APIs reduce bugs, improve developer productivity, and make the codebase more maintainable.",
      whenToUse: "Any time you're creating a reusable component that will be used more than once or by more than one developer.",
      whenNotToUse: "Don't over-engineer one-off components. If it's only used once, a simple component with direct props is fine. Premature abstraction is worse than no abstraction.",
      pitfalls: "Too many boolean props (prop explosion). Not supporting ref forwarding. Not spreading rest props. Making the API too rigid (no escape hatches). Inconsistent naming across components.",
      codeExamples: [
        {
          title: "Well-Designed Button Component",
          code: `import { forwardRef } from 'react';

const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    as: Component = 'button',
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    className = '',
    disabled,
    ...props
  },
  ref
) {
  const isDisabled = disabled || isLoading;

  return (
    <Component
      ref={ref}
      className={\`
        inline-flex items-center justify-center gap-2
        font-medium rounded-lg transition-colors
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        \${variants[variant]} \${sizes[size]} \${className}
      \`}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? <Spinner size={size} /> : leftIcon}
      {children}
      {rightIcon}
    </Component>
  );
});

// Usage:
// <Button variant="primary" size="lg">Save</Button>
// <Button as="a" href="/home" variant="ghost">Home</Button>
// <Button isLoading>Submitting...</Button>`
        }
      ]
    },
    {
      title: "Design Systems Architecture",
      explanations: {
        layman: `A design system is like a restaurant franchise's operations manual. It defines exactly how every dish should look and taste, what ingredients to use, and how to plate it. Any chef at any location can follow the manual and produce the same result. A design system does the same for your UI — it ensures consistency across the entire application.`,
        mid: `A design system consists of:\n\n1. Design tokens: The atomic values (colors, spacing, typography) stored as CSS variables or theme objects.\n2. Base components: Primitive UI building blocks (Button, Input, Card, Modal).\n3. Composite components: Higher-level patterns composed from base components (SearchBar, UserCard).\n4. Documentation: Usage guidelines, dos and don'ts, accessibility notes.\n5. Tooling: Storybook for component development, visual regression testing.\n\nArchitecture: Tokens → Primitives → Components → Patterns → Pages. Each layer only depends on the layer below it.`,
        senior: `Scaling a design system:\n\n1. Package structure: Monorepo with @company/tokens, @company/primitives, @company/components. Allows independent versioning and tree-shaking.\n\n2. Token pipeline: Figma → Style Dictionary → CSS variables + JS constants + Tailwind config. Single source of truth with automated distribution.\n\n3. Theming: CSS variables for runtime theming (dark mode, brand customization). Don't bake colors into components.\n\n4. Versioning strategy: Semantic versioning with visual regression tests. Breaking changes (removing props, changing defaults) require major version bumps. Provide codemods for migrations.\n\n5. Adoption metrics: Track component usage across the codebase. Identify teams using raw HTML instead of design system components. Measure consistency.\n\n6. Accessibility audit: Every component must pass WCAG 2.1 AA. Include automated a11y testing in CI (axe-core). Document keyboard interactions for each interactive component.`
      },
      realWorld: "Google's Material Design, Shopify's Polaris, Adobe's Spectrum, GitHub's Primer — all are design systems used by thousands of developers. Even small teams benefit from a lightweight design system (token file + 10-15 base components).",
      whenToUse: "When your team has more than 2-3 frontend developers, when you're building multiple products under the same brand, or when design consistency is a product value.",
      whenNotToUse: "Don't build a full design system for a single-page MVP. Start with a token file and a handful of components, and grow organically.",
      pitfalls: "Building too much too early (premature abstraction). Not involving designers in the system. Making components too rigid. Not documenting usage patterns. Letting the system become stale.",
      codeExamples: [
        {
          title: "Tailwind Config from Design Tokens",
          code: `// tailwind.config.js
// Generated from design token pipeline

module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#312e81',
        },
        surface: {
          primary: 'var(--color-surface-primary)',
          secondary: 'var(--color-surface-secondary)',
          elevated: 'var(--color-surface-elevated)',
        },
      },
      spacing: {
        // 4px base unit scale
        '4.5': '1.125rem', // 18px
        '13': '3.25rem',   // 52px
      },
      fontSize: {
        // Matches Figma type scale
        'display': ['2.25rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        'heading': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }],
      },
      borderRadius: {
        'card': '0.75rem',
        'button': '0.5rem',
        'input': '0.375rem',
        'pill': '9999px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'dropdown': '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
        'modal': '0 25px 50px -12px rgba(0,0,0,0.25)',
      },
    },
  },
};`
        }
      ]
    }
  ],
  interviewQuestions: [
    {
      question: "Walk me through your process for converting a Figma design to code.",
      answer: "I follow a consistent sequence of steps, not just 'start coding what I see.'\n\n1. Study first, code later: Look at the FULL design. Identify the grid, spacing scale, color palette, typography, and breakpoints before touching any code.\n\n2. Extract design tokens: Turn those patterns into CSS variables or Tailwind config entries (colors, spacing, shadows, radii). This eliminates magic numbers everywhere.\n\n3. Component inventory: List every unique component. Spot which are variants of the same thing (e.g., primary button vs ghost button). Map to existing components if your team has a design system.\n\n4. Build the skeleton: Lay out the structure with Grid and Flex containers, no visual styling yet. Verify the HTML hierarchy matches the design.\n\n5. Apply styles with tokens: Work top-down — page layout, then sections, then individual components, then micro-details like hover states.\n\n6. Make it responsive: Mobile-first. Test at every breakpoint. If the designer only gave you desktop, discuss mobile behavior BEFORE coding it.\n\n7. Add interactions: Hover states, transitions, loading states. Use the design system's motion guidelines or default to 200ms ease-out.\n\n8. QA against the design: Overlay the Figma frame on your implementation. Test with real content — long names, empty states, missing images.",
      difficulty: "mid",
      followUps: [
        "How do you handle designs that don't account for edge cases like long text or empty states?",
        "How do you ensure your implementation matches the design at all breakpoints?",
        "What tools do you use for visual comparison between design and implementation?"
      ]
    },
    {
      question: "What are design tokens and why are they important?",
      answer: "Design tokens are the atomic values of a design system — named entities that store visual attributes like colors, spacing, typography, shadows, and border radii.\n\nWhy they matter:\n1. Single source of truth: Change a token value, and it updates everywhere.\n2. Platform agnostic: The same token 'color-brand-primary' can generate CSS variables, iOS colors, Android resources.\n3. Consistency: Developers reference tokens, not raw values. No more #6366f1 vs #6365f1 inconsistencies.\n4. Theming: Swap token sets for dark mode, brand themes, or white-labeling without changing component code.\n5. Designer-developer alignment: Both reference the same token names, reducing miscommunication.\n\nIn practice, tokens are stored as JSON (processed by tools like Style Dictionary), or directly as CSS custom properties. Tailwind's theme config is essentially a token system.",
      difficulty: "easy",
      followUps: [
        "How do you organize tokens at scale (global vs component-level)?",
        "How do you handle tokens that differ between light and dark themes?"
      ]
    },
    {
      question: "How would you build a responsive layout from a design that only provides desktop mockups?",
      answer: "This is common in practice. My approach:\n\n1. Communicate: Ask the designer for mobile breakpoints. If not available, propose a responsive strategy and get sign-off.\n\n2. Identify collapsible patterns: Multi-column layouts become single column. Side-by-side sections stack vertically. Navigation collapses to a hamburger menu.\n\n3. Use relative units: Design with rem/em, percentages, and viewport units. Avoid fixed pixel widths.\n\n4. Implement with mobile-first: Write the mobile layout first (simplest), then add complexity with min-width media queries.\n\n5. Content-based breakpoints: Don't just use standard breakpoints. Add breakpoints where the CONTENT breaks — if text gets too cramped at 900px, add a breakpoint there.\n\n6. Test with real content: Designers often use ideal-length content. Test with short and long strings, missing images, empty states.\n\n7. Touch targets: Ensure interactive elements are at least 44x44px on touch devices, even if the desktop design has smaller click targets.",
      difficulty: "mid",
      followUps: [
        "How do CSS container queries change the responsive design approach?",
        "When would you use CSS Grid vs Flexbox for layout?"
      ]
    },
    {
      question: "How do you ensure pixel-perfect implementation while keeping code maintainable?",
      answer: "Pixel perfection and maintainability can coexist with the right approach:\n\n1. Token adherence: Only use values from your token scale. If the design says 13px but your scale has 12 and 16, discuss with the designer. Don't create one-off values for pixel perfection.\n\n2. Semantic CSS: Use meaningful class names and component structures. Pixel-perfect doesn't mean inline styles everywhere.\n\n3. Component boundaries: Each visual block should be a component with clear responsibilities. Internal spacing is the component's job; external spacing uses margin or gap on the parent.\n\n4. Overlay comparison: Use tools like PixelPerfect or browser extensions that overlay the design on your implementation. Check at exactly 1x zoom.\n\n5. Acceptable tolerance: A 1-2px difference due to font rendering or sub-pixel rounding is usually acceptable. Consistent spacing and alignment matter more than individual pixel measurements.\n\n6. Don't sacrifice semantics: Never use position hacks or negative margins just to match a design. If something doesn't align naturally, the design might need adjustment.",
      difficulty: "hard",
      followUps: [
        "How do font rendering differences across browsers affect pixel perfection?",
        "How do you handle retina vs non-retina display differences?"
      ]
    },
    {
      question: "Explain the compound component pattern and when you'd use it.",
      answer: "Compound components are a set of components that work together to form a complete UI feature, sharing implicit state. Like HTML's <select> and <option> — they're meaningless alone but powerful together.\n\nExample: A Tabs component\n- <Tabs> — parent that manages active tab state\n- <Tabs.List> — container for tab buttons\n- <Tabs.Tab> — individual tab button\n- <Tabs.Panels> — container for tab content\n- <Tabs.Panel> — individual panel\n\nState is shared via Context, so Tab and Panel are automatically connected without the consumer wiring onChange handlers.\n\nWhen to use: Navigation patterns (Tabs, Accordion), form groups (RadioGroup), disclosure patterns (Dropdown, Modal), any UI where multiple sub-components share behavior.\n\nBenefits: Flexible composition (consumer controls layout), clean API, encapsulated logic. The alternative — a single mega-component with dozens of configuration props — becomes unwieldy quickly.",
      difficulty: "mid",
      followUps: [
        "How do you implement compound components with React Context?",
        "How do you handle accessibility (ARIA) in compound components?"
      ]
    }
  ],
  codingProblems: [
    {
      title: "Build a Responsive Card Grid from Design Specs",
      difficulty: "easy",
      description: "Given design specs: 3 columns on desktop (1200px+), 2 columns on tablet (768px-1199px), 1 column on mobile. 24px gap between cards. Cards have 16px padding, 8px border radius, subtle shadow.",
      solution: `/* Using CSS Grid with design tokens */
.card-grid {
  display: grid;
  gap: var(--space-6); /* 24px */
  grid-template-columns: 1fr;
  padding: var(--space-4);
}

@media (min-width: 768px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.card {
  padding: var(--space-4); /* 16px */
  border-radius: var(--radius-lg); /* 8px */
  background: var(--color-surface-elevated);
  box-shadow: var(--shadow-card);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.card:hover {
  box-shadow: var(--shadow-dropdown);
  transform: translateY(-2px);
}

/* Tailwind equivalent */
// <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-4">
//   <div className="p-4 rounded-lg bg-white shadow-card
//     hover:shadow-dropdown hover:-translate-y-0.5 transition">
//     Card content
//   </div>
// </div>`,
      explanation: "Uses CSS Grid with mobile-first breakpoints. Design tokens ensure consistency. The hover effect adds depth. Tailwind equivalent shows how the same design translates to utility classes."
    },
    {
      title: "Create a Theme-Aware Component System",
      difficulty: "hard",
      description: "Build a theme provider that supports light/dark mode using CSS variables, with a toggle that persists preference to localStorage and respects system preference as default.",
      solution: `// components/ThemeProvider.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

const themes = {
  light: {
    '--color-surface-primary': '#ffffff',
    '--color-surface-secondary': '#f8f9fa',
    '--color-text-primary': '#1a1a2e',
    '--color-text-secondary': '#64748b',
    '--color-border-default': '#e2e8f0',
    '--color-brand-primary': '#6366f1',
    '--shadow-card': '0 1px 3px rgba(0,0,0,0.08)',
  },
  dark: {
    '--color-surface-primary': '#0f0f14',
    '--color-surface-secondary': '#1a1a22',
    '--color-text-primary': '#e8e6e3',
    '--color-text-secondary': '#8a8680',
    '--color-border-default': '#2a2a32',
    '--color-brand-primary': '#818cf8',
    '--shadow-card': '0 1px 3px rgba(0,0,0,0.3)',
  },
};

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('theme');
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getInitialTheme());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const tokens = themes[theme];
    Object.entries(tokens).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  // Listen for system preference changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggle = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  // Prevent flash of wrong theme
  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be in ThemeProvider');
  return ctx;
}

// Usage:
// function ThemeToggle() {
//   const { theme, toggle } = useTheme();
//   return (
//     <button onClick={toggle}>
//       {theme === 'light' ? '🌙' : '☀️'}
//     </button>
//   );
// }`,
      explanation: "Uses CSS custom properties for runtime theming (no page reload needed). Respects system preference as default, allows manual override persisted to localStorage. Listens for system preference changes. The mounted check prevents hydration mismatch. All components using CSS variables automatically respond to theme changes."
    }
  ],
  quiz: [
    {
      question: "What is the recommended order for converting a Figma design to code?",
      options: [
        "Extract tokens → Build layout structure → Apply styles → Add responsiveness → Polish interactions",
        "Start coding the first component you see → Style as you go → Fix responsive later",
        "Build all components in isolation → Assemble the page → Extract common styles",
        "Write all CSS first → Then build the HTML structure → Add JavaScript last"
      ],
      correct: 0,
      explanation: "Starting with token extraction ensures consistency. Building structure first (without visual styling) verifies the layout is correct. Styles, responsive behavior, and interactions are layered on progressively."
    },
    {
      question: "What are design tokens?",
      options: [
        "Named values for colors, spacing, typography, and other visual attributes that serve as a single source of truth",
        "Authentication tokens used in the Figma API",
        "JavaScript variables that store component state",
        "Special CSS selectors for targeting design elements"
      ],
      correct: 0,
      explanation: "Design tokens are the atomic building blocks of a visual design — named, reusable values for colors, spacing, typography, shadows, etc. They bridge the gap between design and development."
    },
    {
      question: "Why should you avoid using fixed pixel values directly from Figma in your CSS?",
      options: [
        "Raw pixel values don't scale with user font settings and create inconsistency when values don't match your spacing scale",
        "Pixels are not supported in modern browsers",
        "Figma measurements are always inaccurate",
        "CSS only accepts rem and em units"
      ],
      correct: 0,
      explanation: "Using rem units respects the user's font size preferences (accessibility). Using values from your spacing/sizing scale ensures consistency. Raw pixel values can differ slightly between Figma and browser rendering."
    },
    {
      question: "What is the compound component pattern?",
      options: [
        "Multiple components that share implicit state via Context to form a cohesive UI feature",
        "A single component with many props for configuration",
        "Components that render other components via render props",
        "Using multiple CSS classes on a single HTML element"
      ],
      correct: 0,
      explanation: "Compound components (like Tabs + Tab + TabPanel) work together using shared Context. This provides a flexible, composable API where the consumer controls the layout while the parent manages state."
    }
  ]
};
