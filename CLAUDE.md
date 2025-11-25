# The Spreadsheet - Frontend Development Guidelines

This document outlines the coding standards, conventions, and best practices for frontend development on The Spreadsheet project. All contributors should follow these guidelines to maintain code quality, consistency, and maintainability.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [TypeScript Conventions](#typescript-conventions)
5. [React Component Guidelines](#react-component-guidelines)
6. [CSS & Styling Guidelines](#css--styling-guidelines)
7. [File Naming Conventions](#file-naming-conventions)
8. [Code Formatting](#code-formatting)
9. [Comments & Documentation](#comments--documentation)
10. [Accessibility Standards](#accessibility-standards)
11. [Performance Best Practices](#performance-best-practices)
12. [Git Workflow](#git-workflow)

---

## Project Overview

**The Spreadsheet** is an advanced hockey analytics platform powered by comprehensive stats and real-time tracking. The frontend is built with Next.js 15, React 19, and TypeScript, emphasizing performance, accessibility, and user experience.

**Core Principles:**
- **User-Centered Design**: Prioritize intuitive UX and accessibility
- **Performance First**: Optimize for fast load times and smooth interactions
- **Clean Code**: Maintain readable, maintainable, and well-documented code
- **Consistency**: Follow established patterns and conventions throughout the codebase

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.5.6 | React framework with SSR/SSG |
| React | 19.1.0 | UI component library |
| TypeScript | 5.x | Type-safe JavaScript |
| Tailwind CSS | 4.x | Utility-first CSS framework |
| Lucide React | Latest | Consistent icon library |
| ESLint | 9.x | Code linting |

**Font Stack:**
- Primary: Inter (body text)
- Monospace: JetBrains Mono (brand, code)
- Display: Rajdhani (headings, numbers)

---

## Project Structure

```
ts-fe/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout component
│   │   ├── page.tsx            # Root redirect page
│   │   ├── globals.css         # Global styles
│   │   ├── home/               # Home page
│   │   ├── players/            # Players page
│   │   ├── goalies/            # Goalies page
│   │   ├── teams/              # Teams page
│   │   └── about/              # About page
│   │
│   └── components/             # Reusable React components
│       └── shared/             # Shared components across pages
│           ├── navbar/         # Navigation component
│           │   ├── Navbar.tsx
│           │   └── navbar.css
│           └── footer/         # Footer component
│               ├── Footer.tsx
│               └── footer.css
│
├── public/                     # Static assets
│   ├── icon_full.svg          # Full logo
│   └── logo.svg               # Favicon
│
├── CLAUDE.md                   # This file - development guidelines
├── package.json
└── tsconfig.json
```

**Directory Organization Principles:**
- **Colocation**: Keep related files together (component + styles in same directory)
- **Shared Components**: Place reusable components in `components/shared/`
- **Page-Specific**: Keep page-specific components within their page directory
- **Naming**: Use PascalCase for component directories and files

---

## TypeScript Conventions

### Type Safety

**Always use TypeScript** - avoid `any` types unless absolutely necessary.

### Type Definitions

**Define types and interfaces for component props and shared types.**

```typescript
// ✅ Good - Explicit typing
interface NavLink {
    href: string;
    label: string;
}

const NAV_LINKS: NavLink[] = [
    { href: '/players', label: 'PLAYERS' },
    { href: '/goalies', label: 'GOALIES' },
];

// ❌ Bad - Implicit any
const links = [
    { href: '/players', label: 'PLAYERS' },
];
```

**For reusable types**, consider organizing them in the `src/types/` directory to share across multiple components.

**Define types and interfaces at the top of files**, before component declarations.

```typescript
// ✅ Good - Types defined first
interface FooterSection {
    title: string;
    links: Array<{
        href: string;
        label: string;
    }>;
}

const FOOTER_SECTIONS: FooterSection[] = [...];

export default function Footer() {
    // Component code
}
```

### Constants

**Use `as const`** for readonly constant arrays and objects.

```typescript
// ✅ Good - Readonly with type inference
const NAV_LINKS = [
    { href: '/players', label: 'PLAYERS' },
    { href: '/goalies', label: 'GOALIES' },
] as const;

// ❌ Bad - Mutable array
const NAV_LINKS = [
    { href: '/players', label: 'PLAYERS' },
];
```

### Path Aliases

**Use `@/` alias** for absolute imports from the `src/` directory.

```typescript
// ✅ Good - Absolute import with alias
import Navbar from "@/components/shared/navbar/Navbar";
import Footer from "@/components/shared/footer/Footer";

// ❌ Bad - Relative import
import Navbar from "../../../components/shared/navbar/Navbar";
```

---

## React Component Guidelines

### Component Structure

**Follow this order** for component file organization:

1. Import statements (external → internal)
2. Type definitions and interfaces
3. Constants and configuration
4. Component function
5. Export statement

```typescript
// 1. Imports - External first
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

// 2. Internal imports
import './navbar.css';

// 3. Type definitions
interface NavLink {
    href: string;
    label: string;
}

// 4. Constants
const NAV_LINKS: NavLink[] = [
    { href: '/players', label: 'PLAYERS' },
] as const;

// 5. Component
export default function NavigationBar() {
    // Component logic
}
```

### 'use client' Directive

**Add `'use client'`** at the top of files using client-side features (hooks, event handlers, browser APIs).

```typescript
// ✅ Required for client-side interactivity
'use client';

import { useState } from 'react';

export default function InteractiveComponent() {
    const [isOpen, setIsOpen] = useState(false);
    // ...
}
```

### React Hooks

**Declare hooks in this order:**
1. State hooks (`useState`)
2. Context hooks (`useContext`)
3. Ref hooks (`useRef`)
4. Effect hooks (`useEffect`)

```typescript
export default function NavigationBar() {
    // 1. State
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // 2. Refs
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);

    // 3. Effects
    useEffect(() => {
        // Effect logic
    }, [isMenuOpen]);

    // 4. Event handlers
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    // 5. Render
    return (
        // JSX
    );
}
```

### Event Handlers

**Name handlers with `handle` or `on` prefix** to clearly indicate their purpose.

```typescript
// ✅ Good - Clear naming
const handleClick = () => { /* ... */ };
const toggleMenu = () => { /* ... */ };
const closeMenu = () => { /* ... */ };

// ❌ Bad - Unclear naming
const click = () => { /* ... */ };
const menu = () => { /* ... */ };
```

### Conditional Rendering

**Use ternary operators** for simple conditions, and logical AND for showing/hiding elements.

```typescript
// ✅ Good - Simple conditional
{isMenuOpen ? <X size={24} /> : <Menu size={24} />}

// ✅ Good - Conditional class
className={pathname === href ? 'active' : ''}

// ✅ Good - Template literal for multiple classes
className={`mobile-menu ${isMenuOpen ? 'mobile-menu-open' : ''}`}
```

### Next.js Best Practices

**Use Next.js components** instead of native HTML elements when applicable:

```typescript
// ✅ Good - Next.js Image component
import Image from 'next/image';

<Image
    src='/icon_full.svg'
    alt='The Spreadsheet'
    width={40}
    height={40}
    className='footer-logo'
/>

// ✅ Good - Next.js Link component
import Link from 'next/link';

<Link href='/players'>Players</Link>

// ❌ Bad - Native elements
<img src='/icon_full.svg' alt='The Spreadsheet' />
<a href='/players'>Players</a>
```

---

## CSS & Styling Guidelines

### CSS File Organization

**Structure CSS files with clear sections** using comment headers:

```css
/* ============================================
   SECTION NAME
   ============================================ */
.component-class {
    /* Properties */
}

/* Subsection */
.component-variant {
    /* Properties */
}
```

**Section order:**
1. Container/wrapper styles
2. Main component styles
3. Child element styles
4. State variations (hover, active, focus)
5. Responsive breakpoints (mobile-first)

### CSS Naming Conventions

**Use BEM-inspired naming** with kebab-case:

```css
/* ✅ Good - Clear hierarchy */
.navbar-container { }
.navbar-brand { }
.navbar-brand-text { }
.navbar-links { }
.navbar-link { }
.navbar-link:hover { }

.footer-container { }
.footer-section { }
.footer-section-title { }
.footer-links { }
.footer-link { }

/* ❌ Bad - Unclear structure */
.nav { }
.brand { }
.text { }
```

### CSS Custom Properties

**Use CSS variables** for consistent theming and easy maintenance:

```css
/* ✅ Good - Using CSS variables */
.navbar-brand-text {
    font-family: var(--font-jetbrains-mono), monospace;
    background: linear-gradient(135deg, #60a5fa, #a78bfa);
}

/* Define in globals.css or layout */
:root {
    --font-jetbrains-mono: 'JetBrains Mono', monospace;
}
```

### Color Palette

**Use consistent color values** throughout the project:

```css
/* Primary Colors */
--color-blue: #60a5fa;        /* Primary accent */
--color-purple: #a78bfa;      /* Secondary accent */

/* Grayscale */
--color-white: #ffffff;
--color-gray-100: #f3f4f6;
--color-gray-300: #d1d5db;
--color-gray-400: #9ca3af;
--color-gray-600: #6b7280;
--color-gray-800: #1f2937;
--color-black: #000000;

/* Semantic Colors */
--color-background: rgba(0, 0, 0, 0.8);
--color-border: #1f2937;
--color-text-primary: #d1d5db;
--color-text-secondary: #9ca3af;
--color-text-muted: #6b7280;
```

### Responsive Design

**Use mobile-first approach** with progressive enhancement:

```css
/* ✅ Good - Mobile-first */
.footer {
    padding: 4rem 1rem 2rem;
    grid-template-columns: 1fr;
}

@media (min-width: 768px) {
    .footer {
        padding: 4rem 1.5rem 2rem;
        grid-template-columns: 1.5fr repeat(3, 1fr);
    }
}

@media (min-width: 1024px) {
    .footer {
        padding: 5rem 2rem 3rem;
    }
}

/* ❌ Bad - Desktop-first */
.footer {
    padding: 5rem 2rem 3rem;
    grid-template-columns: 1.5fr repeat(3, 1fr);
}

@media (max-width: 768px) {
    .footer {
        padding: 4rem 1rem 2rem;
        grid-template-columns: 1fr;
    }
}
```

**Standard breakpoints:**
- Mobile: `< 768px` (default)
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

### CSS Specificity

**Keep specificity low** - avoid deep nesting and overly specific selectors:

```css
/* ✅ Good - Low specificity */
.navbar-link {
    color: #9ca3af;
}

.navbar-link:hover {
    color: #60a5fa;
}

/* ❌ Bad - High specificity */
.navbar .navbar-links .navbar-link a:hover {
    color: #60a5fa;
}
```

### Transitions and Animations

**Use consistent timing** for smooth interactions:

```css
/* Standard transition timing */
.navbar-link {
    transition: all 0.2s ease;  /* Quick interactions */
}

.mobile-menu {
    transition: all 0.3s ease;  /* Larger movements */
}

/* Hover effects with pseudo-elements */
.footer-link::before {
    transition: all 0.2s;
    opacity: 0;
}

.footer-link:hover::before {
    opacity: 1;
}
```

### Visual Effects

**Use modern CSS features** for polished UI:

```css
/* Glassmorphism */
.navbar-container {
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
}

/* Gradient text */
.navbar-brand-text {
    background: linear-gradient(135deg, #60a5fa, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

/* Drop shadows */
.footer-logo {
    filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0.3));
}

/* Gradient borders */
.footer-container::before {
    background: linear-gradient(to right, transparent, #60a5fa, #a78bfa, transparent);
}
```

---

## File Naming Conventions

### Files and Directories

**Use consistent naming patterns:**

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `Navbar.tsx`, `Footer.tsx` |
| CSS files | kebab-case | `navbar.css`, `footer.css` |
| Pages | kebab-case | `page.tsx`, `layout.tsx` |
| Directories | kebab-case | `shared/`, `navbar/`, `footer/` |
| Assets | kebab-case | `icon_full.svg`, `logo.svg` |
| Config files | kebab-case | `tsconfig.json`, `package.json` |

### Component Files

**Component filename should match the exported component name:**

```typescript
// ✅ Good - Navbar.tsx exports NavigationBar
export default function NavigationBar() { }

// ✅ Good - Footer.tsx exports Footer
export default function Footer() { }
```

---

## Code Formatting

### Indentation

**Use 4 spaces** for indentation (not tabs).

```typescript
// ✅ Good - 4 spaces
export default function Component() {
    return (
        <div className='container'>
            <h1>Title</h1>
        </div>
    );
}

// ❌ Bad - 2 spaces or tabs
export default function Component() {
  return (
    <div className='container'>
      <h1>Title</h1>
    </div>
  );
}
```

### Line Length

**Keep lines under 120 characters** when possible. Break long lines logically:

```typescript
// ✅ Good - Readable line breaks
<Image
    src='/icon_full.svg'
    alt='The Spreadsheet'
    width={40}
    height={40}
    className='footer-logo'
/>

// ❌ Bad - Too long
<Image src='/icon_full.svg' alt='The Spreadsheet' width={40} height={40} className='footer-logo' />
```

### String Quotes

**Use single quotes** for JSX attributes and strings:

```typescript
// ✅ Good - Single quotes
import './navbar.css';
const text = 'Hello world';
<div className='container'>

// ❌ Bad - Double quotes
import "./navbar.css";
const text = "Hello world";
<div className="container">
```

### Semicolons

**Always use semicolons** for statement termination:

```typescript
// ✅ Good - Explicit semicolons
const links = [];
setIsOpen(false);

// ❌ Bad - ASI dependency
const links = []
setIsOpen(false)
```

### JSX Formatting

**Self-closing tags** for components without children:

```typescript
// ✅ Good
<Image src='/logo.svg' alt='Logo' width={32} height={32} />
<br />

// ❌ Bad
<Image src='/logo.svg' alt='Logo' width={32} height={32}></Image>
```

**Multi-line JSX** should be wrapped in parentheses:

```typescript
// ✅ Good
return (
    <nav className='navbar-container'>
        <div className='navbar'>
            {/* Content */}
        </div>
    </nav>
);

// ❌ Bad
return <nav className='navbar-container'>
    <div className='navbar'>
        {/* Content */}
    </div>
</nav>;
```

---

## Comments & Documentation

### Code Comments

**Use comments strategically** to explain "why", not "what":

```typescript
// ✅ Good - Explains reasoning
// Prevent body scroll when mobile menu is open
useEffect(() => {
    if (isMenuOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'unset';
    }
}, [isMenuOpen]);

// ❌ Bad - States the obvious
// Set overflow to hidden
document.body.style.overflow = 'hidden';
```

### Section Headers

**Use clear section headers** to organize code:

```typescript
// ============================================
// STATE MANAGEMENT
// ============================================
const [isMenuOpen, setIsMenuOpen] = useState(false);

// ============================================
// ACCESSIBILITY - KEYBOARD NAVIGATION
// ============================================
useEffect(() => {
    // Keyboard event handling
}, [isMenuOpen]);
```

### JSX Comments

**Use JSX comment syntax** inside JSX:

```typescript
return (
    <footer className='footer-container'>
        {/* Main Footer Content */}
        <div className='footer'>
            {/* Brand Section */}
            <div className='footer-brand-section'>
                {/* ... */}
            </div>
        </div>
    </footer>
);
```

### TODO Comments

**Mark incomplete work** with TODO comments including context:

```typescript
// TODO: Add pagination for large datasets
// TODO: Implement error boundary for this section
// TODO: Optimize image loading with lazy loading
```

---

## Accessibility Standards

### WCAG Compliance

**Target WCAG 2.1 AA** as minimum standard for all components.

### Semantic HTML

**Use semantic HTML elements** for better accessibility:

```typescript
// ✅ Good - Semantic elements
<nav className='navbar-container'>
<footer className='footer-container'>
<main className='main-content'>

// ❌ Bad - Generic divs
<div className='navbar-container'>
<div className='footer-container'>
<div className='main-content'>
```

### ARIA Attributes

**Add ARIA attributes** for interactive elements and dynamic content:

```typescript
// ✅ Good - Proper ARIA attributes
<button
    className='mobile-menu-button'
    onClick={toggleMenu}
    aria-label='Toggle menu'
    aria-expanded={isMenuOpen}
>
    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
</button>

<div
    className={`mobile-menu ${isMenuOpen ? 'mobile-menu-open' : ''}`}
    aria-hidden={!isMenuOpen}
>
    {/* Menu content */}
</div>
```

### Keyboard Navigation

**Implement full keyboard navigation** for interactive components:

```typescript
// Close menu on Escape key
useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMenu();
            menuButtonRef.current?.focus();
        }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
}, [isMenuOpen]);

// Trap focus inside mobile menu for keyboard navigation
useEffect(() => {
    if (!isMenuOpen || !mobileMenuRef.current) return;

    const focusableElements = mobileMenuRef.current.querySelectorAll(
        'a[href], button:not([disabled])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    };

    document.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => document.removeEventListener('keydown', handleTab);
}, [isMenuOpen]);
```

### Focus Management

**Manage focus properly** for modal overlays and dynamic content:

```typescript
// Return focus to trigger button when closing
const closeMenu = () => {
    setIsMenuOpen(false);
    menuButtonRef.current?.focus();
};
```

### Alt Text

**Provide descriptive alt text** for all images:

```typescript
// ✅ Good - Descriptive alt text
<Image
    src='/icon_full.svg'
    alt='The Spreadsheet'
    width={40}
    height={40}
/>

// ❌ Bad - Generic or missing alt text
<Image src='/icon_full.svg' alt='logo' width={40} height={40} />
<Image src='/icon_full.svg' alt='' width={40} height={40} />
```

---

## Performance Best Practices

### Component Optimization

**Use React hooks efficiently:**

```typescript
// ✅ Good - Memoized callback
const handleClick = useCallback(() => {
    setIsOpen(!isOpen);
}, [isOpen]);

// ✅ Good - Cleanup in useEffect
useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
}, [isMenuOpen]);
```

### Image Optimization

**Use Next.js Image component** for automatic optimization:

```typescript
// ✅ Good - Optimized with Next.js Image
import Image from 'next/image';

<Image
    src='/icon_full.svg'
    alt='The Spreadsheet'
    width={40}
    height={40}
    className='footer-logo'
/>
```

### CSS Performance

**Minimize reflows and repaints:**

```css
/* ✅ Good - GPU-accelerated properties */
.mobile-menu {
    transform: translateY(-100%);
    transition: transform 0.3s ease;
}

.mobile-menu-open {
    transform: translateY(0);
}

/* ❌ Bad - Layout-triggering properties */
.mobile-menu {
    top: -100%;
    transition: top 0.3s ease;
}
```

### Bundle Size

**Import only what you need:**

```typescript
// ✅ Good - Named imports
import { Menu, X } from 'lucide-react';

// ❌ Bad - Default import of entire library
import * as Icons from 'lucide-react';
```

---

## Git Workflow

### Commit Messages

**Write clear, descriptive commit messages:**

```
✅ Good:
- Add mobile navigation menu with accessibility features
- Fix active state persistence in navbar links
- Refactor footer component structure
- Remove social links from footer

❌ Bad:
- Update navbar
- Fix bug
- Changes
- WIP
```

### Commit Structure

**Follow conventional commits format:**

```
type(scope): description

feat(navbar): add mobile menu with hamburger icon
fix(footer): correct link hover animation timing
refactor(navbar): extract NAV_LINKS constant for DRY
style(footer): improve visual hierarchy and spacing
docs(readme): update component structure documentation
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `style`: Visual/styling changes
- `docs`: Documentation
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `test`: Testing

---

## Checklist for New Components

Before submitting a new component, ensure:

- [ ] **TypeScript**: All props and types are properly defined
- [ ] **Imports**: Using `@/` alias for absolute imports
- [ ] **Structure**: Follows component structure guidelines (imports → types → constants → component)
- [ ] **Hooks**: Organized in proper order (state → refs → effects)
- [ ] **Accessibility**: ARIA attributes, keyboard navigation, focus management
- [ ] **Styling**: Separate CSS file with BEM-inspired naming
- [ ] **Comments**: Clear section headers and explanatory comments
- [ ] **Responsive**: Mobile-first design with breakpoints at 768px and 1024px
- [ ] **Performance**: Proper cleanup in useEffect, optimized images
- [ ] **Formatting**: 4-space indentation, single quotes, semicolons
- [ ] **Testing**: Manually tested on mobile, tablet, desktop
- [ ] **Git**: Clear commit message following conventional format

---

## Resources

**Official Documentation:**
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)

**Accessibility:**
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

**Style Guides:**
- [Airbnb React/JSX Style Guide](https://github.com/airbnb/javascript/tree/master/react)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)

---

## Questions?

If you have questions about these guidelines or need clarification on any conventions, please open an issue or discussion in the project repository.

**Happy coding! 🏒📊**
