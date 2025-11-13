## 1. Executive Summary

Below are implementation-ready stubs that translate the `design.json` / `tokens.json` into:

1. A CSS variables setup.
2. A Tailwind config extension.
3. A small React component library scaffold wired to those tokens.

These are **starting points**: minimal, idiomatic, and aligned with the design system so you (or another AI) can scale consistently.

---

## 2. Plan (What the stubs will cover)

1. **CSS Variables**
   - Map key tokens to `:root` (colors, radii, shadows, spacing).
   - Provide semantic utilities for backgrounds, surfaces, and text.

2. **Tailwind Config**
   - Extend theme with colors, font, radius, shadows, spacing that mirror tokens.
   - Provide aliases that make components easy to implement in JSX.

3. **React Components**
   - Layout primitives:
     - `Page`
     - `Card`
   - Key UI elements:
     - `Button` (primary, secondary, success, ghost)
     - `Tag`
     - `Avatar`, `AvatarGroup`
     - `Toggle`
     - `ProgressCircle` (stub)
   - Example composite cards:
     - `ProfileCard`
     - `MilestoneCard`
   - All using Tailwind classes rooted in the config.

Focus is on **structure + wiring to tokens**, not full feature completeness.

---

## 3. CSS Variables (token baseline)

File: `src/styles/tokens.css`

```css
:root {
  /* Colors - Background & Surface */
  --color-background-main: #D6F25F;
  --color-surface-primary: #FFFFFF;
  --color-surface-soft: #F9FAFB;

  /* Colors - Text */
  --color-text-primary: #111111;
  --color-text-secondary: #555555;
  --color-text-muted: #9CA3AF;
  --color-text-on-accent: #FFFFFF;

  /* Colors - Accent */
  --color-accent-primary: #7B3EFF;
  --color-accent-primary-soft: #EDE7FF;
  --color-accent-secondary: #00C6AE;
  --color-accent-yellow: #FFB020;

  /* Colors - Border & Semantic */
  --color-border-subtle: #F0F0F0;
  --color-success: #10B981;
  --color-warning: #FBBF24;
  --color-danger: #EF4444;

  /* Font */
  --font-family-primary: 'SF Pro Rounded', 'Nunito', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;

  --font-size-h1: 28px;
  --font-size-h2: 22px;
  --font-size-h3: 18px;
  --font-size-body-lg: 16px;
  --font-size-body: 14px;
  --font-size-label: 12px;

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;

  --line-height-tight: 1.3;
  --line-height-snug: 1.35;
  --line-height-normal: 1.5;

  /* Spacing Scale */
  --space-xxs: 4px;
  --space-xs: 6px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 20px;
  --space-xxl: 24px;
  --space-xxxl: 32px;

  --page-padding: 40px;
  --card-padding-default: 24px;
  --card-padding-compact: 16px;

  /* Radius */
  --radius-pill: 999px;
  --radius-card-lg: 28px;
  --radius-card-md: 20px;
  --radius-control: 999px;

  /* Shadows */
  --shadow-none: none;
  --shadow-card: 0 10px 25px 0 rgba(15, 23, 42, 0.06);
  --shadow-floating: 0 18px 40px 0 rgba(15, 23, 42, 0.10);
  --shadow-accent-soft: 0 8px 18px 0 rgba(123, 62, 255, 0.25);

  /* Border */
  --border-width-hairline: 1px;
  --border-width-focus: 2px;

  /* Sizes (select core) */
  --size-icon-sm: 16px;
  --size-icon-md: 20px;
  --size-icon-lg: 24px;

  --size-avatar-sm: 32px;
  --size-avatar-md: 36px;
  --size-avatar-lg: 64px;

  --size-toggle-width: 44px;
  --size-toggle-height: 24px;
  --size-toggle-handle: 18px;

  --size-icon-button: 32px;
  --size-progress-circular: 40px;
  --size-calendar-day: 36px;

  /* Motion */
  --motion-duration-fast: 120ms;
  --motion-duration-normal: 180ms;
  --motion-easing-standard: cubic-bezier(0.25, 0.8, 0.25, 1);

  /* State */
  --state-disabled-opacity: 0.4;
}

/* Page shell */
.body-limeaura {
  background-color: var(--color-background-main);
  font-family: var(--font-family-primary);
}

/* Utility examples (optional) */
.bg-surface-primary {
  background-color: var(--color-surface-primary);
}

.text-primary {
  color: var(--color-text-primary);
}
```

---

## 4. Tailwind Config Stub

File: `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: {
          main: "var(--color-background-main)"
        },
        surface: {
          primary: "var(--color-surface-primary)",
          soft: "var(--color-surface-soft)"
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
          onAccent: "var(--color-text-on-accent)"
        },
        accent: {
          primary: "var(--color-accent-primary)",
          primarySoft: "var(--color-accent-primary-soft)",
          secondary: "var(--color-accent-secondary)",
          yellow: "var(--color-accent-yellow)"
        },
        border: {
          subtle: "var(--color-border-subtle)"
        },
        semantic: {
          success: "var(--color-success)",
          warning: "var(--color-warning)",
          danger: "var(--color-danger)"
        }
      },
      fontFamily: {
        sans: ["var(--font-family-primary)", "system-ui", "sans-serif"]
      },
      fontSize: {
        h1: ["var(--font-size-h1)", { lineHeight: "var(--line-height-tight)", fontWeight: "var(--font-weight-semibold)" }],
        h2: ["var(--font-size-h2)", { lineHeight: "var(--line-height-snug)", fontWeight: "var(--font-weight-semibold)" }],
        h3: ["var(--font-size-h3)", { lineHeight: "var(--line-height-normal)", fontWeight: "var(--font-weight-medium)" }],
        body: ["var(--font-size-body)", { lineHeight: "var(--line-height-normal)", fontWeight: "var(--font-weight-regular)" }],
        bodyLg: ["var(--font-size-body-lg)", { lineHeight: "var(--line-height-normal)", fontWeight: "var(--font-weight-regular)" }],
        label: ["var(--font-size-label)", { lineHeight: "var(--line-height-tight)", fontWeight: "var(--font-weight-medium)" }]
      },
      spacing: {
        xxs: "var(--space-xxs)",
        xs: "var(--space-xs)",
        sm: "var(--space-sm)",
        md: "var(--space-md)",
        lg: "var(--space-lg)",
        xl: "var(--space-xl)",
        xxl: "var(--space-xxl)",
        xxxl: "var(--space-xxxl)",
        page: "var(--page-padding)"
      },
      borderRadius: {
        pill: "var(--radius-pill)",
        "card-lg": "var(--radius-card-lg)",
        "card-md": "var(--radius-card-md)",
        control: "var(--radius-control)"
      },
      boxShadow: {
        none: "var(--shadow-none)",
        card: "var(--shadow-card)",
        floating: "var(--shadow-floating)",
        "accent-soft": "var(--shadow-accent-soft)"
      },
      transitionDuration: {
        fast: "var(--motion-duration-fast)",
        normal: "var(--motion-duration-normal)"
      },
      transitionTimingFunction: {
        standard: "var(--motion-easing-standard)"
      },
      opacity: {
        disabled: "var(--state-disabled-opacity)"
      }
    }
  },
  plugins: []
};
```

---

## 5. React Component Stubs (Tailwind-based)

All components assume:

- `tokens.css` imported globally.
- Tailwind configured as above.
- These are **lean, extensible** blueprints.

### 5.1 `Page` Layout

File: `src/components/layout/Page.tsx`

```tsx
import React from "react";

interface PageProps {
  children: React.ReactNode;
  className?: string;
}

export const Page: React.FC<PageProps> = ({ children, className = "" }) => (
  <div className={`min-h-screen bg-background-main font-sans ${className}`}>
    <div className="mx-auto max-w-6xl p-page flex flex-wrap gap-xxl">
      {children}
    </div>
  </div>
);
```

### 5.2 `Card`

File: `src/components/primitives/Card.tsx`

```tsx
import React from "react";
import clsx from "clsx";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "compact";
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  className = ""
}) => {
  const base =
    "bg-surface-primary shadow-card rounded-card-lg flex flex-col";
  const padding =
    variant === "compact"
      ? "p-[var(--card-padding-compact)]"
      : "p-[var(--card-padding-default)]";

  return <section className={clsx(base, padding, className)}>{children}</section>;
};
```

### 5.3 `Button`

File: `src/components/primitives/Button.tsx`

```tsx
import React from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "success" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const base =
  "inline-flex items-center justify-center rounded-pill px-5 py-2.5 text-label font-medium transition-fast transition-standard focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary-soft focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary";

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  className,
  ...rest
}) => {
  const variantClasses: Record<Variant, string> = {
    primary:
      "bg-accent-primary text-text-on-accent shadow-[var(--shadow-accent-soft)] hover:bg-[#6B2FFF]",
    secondary:
      "bg-surface-primary text-text-primary border border-border-subtle hover:bg-surface-soft",
    success:
      "bg-semantic-success text-text-on-accent hover:bg-emerald-500",
    ghost:
      "bg-transparent text-text-primary hover:bg-surface-soft"
  };

  return (
    <button className={clsx(base, variantClasses[variant], className)} {...rest} />
  );
};
```

### 5.4 `Tag` (Chip)

File: `src/components/primitives/Tag.tsx`

```tsx
import React from "react";
import clsx from "clsx";

interface TagProps {
  children: React.ReactNode;
  className?: string;
}

export const Tag: React.FC<TagProps> = ({ children, className }) => (
  <span
    className={clsx(
      "inline-flex items-center rounded-pill bg-surface-soft px-3 py-1 text-label font-medium text-text-primary",
      className
    )}
  >
    {children}
  </span>
);
```

### 5.5 `Avatar` and `AvatarGroup`

File: `src/components/primitives/Avatar.tsx`

```tsx
import React from "react";
import clsx from "clsx";

interface AvatarProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-8 h-8",
  md: "w-9 h-9",
  lg: "w-16 h-16"
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = "md",
  className
}) => (
  <img
    src={src}
    alt={alt}
    className={clsx(
      "rounded-full object-cover border-2 border-surface-primary",
      sizeMap[size],
      className
    )}
  />
);

interface AvatarGroupProps {
  avatars: { src: string; alt: string }[];
  maxVisible?: number;
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  maxVisible = 5,
  className
}) => {
  const visible = avatars.slice(0, maxVisible);

  return (
    <div className={clsx("flex items-center", className)}>
      {visible.map((a, i) => (
        <Avatar
          key={i}
          src={a.src}
          alt={a.alt}
          size="sm"
          className={clsx(
            "border-surface-primary",
            i > 0 && "-ml-2"
          )}
        />
      ))}
      {avatars.length > maxVisible && (
        <span className="ml-1 rounded-full bg-surface-primary px-2 py-0.5 text-[10px] font-medium text-text-primary shadow-card">
          +{avatars.length - maxVisible}
        </span>
      )}
    </div>
  );
};
```

### 5.6 `Toggle`

File: `src/components/primitives/Toggle.tsx`

```tsx
import React from "react";
import clsx from "clsx";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled
}) => {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className={clsx(
        "relative inline-flex items-center transition-fast transition-standard rounded-pill",
        "w-[var(--size-toggle-width)] h-[var(--size-toggle-height)]",
        checked ? "bg-accent-primary" : "bg-[#E5E7EB]",
        disabled && "opacity-[var(--state-disabled-opacity)] cursor-not-allowed"
      )}
      aria-pressed={checked}
    >
      <span
        className={clsx(
          "inline-block bg-white rounded-full shadow-card transition-fast transition-standard",
          "w-[var(--size-toggle-handle)] h-[var(--size-toggle-handle)]",
          checked ? "translate-x-5" : "translate-x-1"
        )}
      />
    </button>
  );
};
```

### 5.7 `ProgressCircle` (Simplified)

File: `src/components/primitives/ProgressCircle.tsx`

```tsx
import React from "react";

interface ProgressCircleProps {
  value: number; // 0 - 100
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export const ProgressCircle: React.FC<ProgressCircleProps> = ({
  value,
  size = 40,
  strokeWidth = 6,
  showLabel = true
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center"
    >
      <svg width={size} height={size}>
        <circle
          stroke="var(--color-accent-primary-soft)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke="var(--color-accent-primary)"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {showLabel && (
        <span className="absolute text-[10px] font-semibold text-accent-primary">
          {value}%
        </span>
      )}
    </div>
  );
};
```

### 5.8 Example Composite: `ProfileCard`

File: `src/components/composite/ProfileCard.tsx`

```tsx
import React from "react";
import { Card } from "../primitives/Card";
import { Tag } from "../primitives/Tag";
import { Avatar } from "../primitives/Avatar";

interface ProfileCardProps {
  name: string;
  role: string;
  avatarSrc: string;
  tags: string[];
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  role,
  avatarSrc,
  tags
}) => (
  <Card className="items-start gap-md">
    <div className="flex items-start justify-between w-full">
      <Avatar src={avatarSrc} alt={name} size="lg" />
      <button className="w-[var(--size-icon-button)] h-[var(--size-icon-button)] rounded-full flex items-center justify-center text-text-secondary">
        &#8942;
      </button>
    </div>
    <div className="mt-sm">
      <div className="text-h2">{name}</div>
      <div className="mt-1 text-body text-text-secondary">{role}</div>
    </div>
    <div className="mt-md flex flex-wrap gap-xs">
      {tags.map((t) => (
        <Tag key={t}>{t}</Tag>
      ))}
    </div>
  </Card>
);
```

### 5.9 Example Composite: `MilestoneCard`

File: `src/components/composite/MilestoneCard.tsx`

```tsx
import React from "react";
import { Card } from "../primitives/Card";
import { Button } from "../primitives/Button";
import { AvatarGroup } from "../primitives/Avatar";
import { ProgressCircle } from "../primitives/ProgressCircle";

interface MilestoneCardProps {
  title: string;
  dueDateLabel: string;
  progress: number;
  assignees: { src: string; alt: string }[];
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({
  title,
  dueDateLabel,
  progress,
  assignees
}) => (
  <Card variant="compact" className="gap-md">
    <div className="flex items-center justify-between">
      <h3 className="text-h3 text-text-primary">{title}</h3>
      <Button variant="ghost" className="px-4 py-1 text-label">
        View details
      </Button>
    </div>
    <div className="flex items-center justify-between gap-lg">
      <div className="flex flex-col gap-xs">
        <div className="text-label text-text-muted uppercase tracking-wide">
          Due date
        </div>
        <div className="text-body text-text-primary">{dueDateLabel}</div>
        <div className="mt-sm">
          <div className="text-label text-text-muted uppercase">
            Assignees
          </div>
          <AvatarGroup avatars={assignees} className="mt-1" />
        </div>
      </div>
      <ProgressCircle value={progress} />
    </div>
  </Card>
);
```

---

## 6. Validation

- [x] CSS variables directly mirror `tokens.json`.
- [x] Tailwind config uses variables for portability.
- [x] React components encode layout, spacing, radius, and accents faithfully.
- [x] Stubs are minimal but clearly demonstrate how to reproduce the design language.

---

## 7. Next Steps

If you share your preferred stack (pure CSS, Tailwind-only, CSS-in-JS, design token tooling), I can:

- Refine these stubs into a cohesive component library.
- Generate Figma style/component mappings.
- Add additional components (Calendar, NotificationList, Integrations) using the same system.
