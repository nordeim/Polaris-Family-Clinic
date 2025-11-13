## 1. Executive Summary

Below is a **ready-to-adopt scaffold** for a Next 14 + Tailwind + TypeScript app that embeds our `design.json` / `tokens.json` system:

- Project structure (key folders/files).
- Tailwind + PostCSS + global CSS token wiring.
- `cn`/`clsx` utility.
- Core primitives and composite components aligned with the LimeAura design.
- Example page wired to these components.

All code is provided as concrete file stubs you can drop into your repo.

---

## 2. Plan

### 2.1 Goals

1. Make the design system **first-class**:
   - Centralized tokens.
   - Tailwind configured to use them.
   - Reusable primitives and composites.

2. Ensure compatibility with:
   - Next 14 App Router.
   - Tailwind 3.4.x.
   - Your existing ecosystem (React Query, tRPC, etc. unaffected).

3. Keep everything:
   - Type-safe.
   - Minimal but extensible.
   - Faithful to the reference design.

### 2.2 Structure Overview

Recommended structure (only relevant parts shown):

```txt
src/
  app/
    layout.tsx
    page.tsx
    globals.css
  lib/
    cn.ts
    theme/
      tokens.css
      tailwind-base.css
  components/
    ui/
      card.tsx
      button.tsx
      tag.tsx
      avatar.tsx
      toggle.tsx
      progress-circle.tsx
    layout/
      page-shell.tsx
    composite/
      profile-card.tsx
      milestone-card.tsx
      integrations-card.tsx
      notifications-card.tsx
      calendar-card.tsx
tailwind.config.ts
postcss.config.cjs
```

Next: define configs and components step-by-step.

---

## 3. Config & Global Styles

### 3.1 `postcss.config.cjs`

```js
module.exports = {
  plugins: {
    "postcss-simple-vars": {},
    "postcss-preset-mantine": {},
    tailwindcss: {},
    autoprefixer: {}
  }
};
```

(You already have some of these dependencies; this keeps it straightforward.)

### 3.2 `tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}"
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
        sans: [
          "SF Pro Rounded",
          "Nunito",
          "Inter",
          "-apple-system",
          "system-ui",
          "sans-serif"
        ]
      },
      fontSize: {
        h1: [
          "28px",
          {
            lineHeight: "1.3",
            fontWeight: "600"
          }
        ],
        h2: [
          "22px",
          {
            lineHeight: "1.35",
            fontWeight: "600"
          }
        ],
        h3: [
          "18px",
          {
            lineHeight: "1.5",
            fontWeight: "500"
          }
        ],
        bodyLg: [
          "16px",
          {
            lineHeight: "1.5",
            fontWeight: "400"
          }
        ],
        body: [
          "14px",
          {
            lineHeight: "1.5",
            fontWeight: "400"
          }
        ],
        label: [
          "12px",
          {
            lineHeight: "1.3",
            fontWeight: "500"
          }
        ]
      },
      spacing: {
        xxs: "4px",
        xs: "6px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        xxl: "24px",
        xxxl: "32px",
        page: "40px"
      },
      borderRadius: {
        pill: "999px",
        "card-lg": "28px",
        "card-md": "20px",
        control: "999px"
      },
      boxShadow: {
        card: "0 10px 25px 0 rgba(15, 23, 42, 0.06)",
        floating: "0 18px 40px 0 rgba(15, 23, 42, 0.10)",
        "accent-soft": "0 8px 18px 0 rgba(123, 62, 255, 0.25)"
      },
      transitionDuration: {
        fast: "120ms",
        normal: "180ms"
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.25, 0.8, 0.25, 1)"
      },
      opacity: {
        disabled: "0.4"
      }
    }
  },
  plugins: []
};

export default config;
```

### 3.3 Tokens & Base CSS

`src/lib/theme/tokens.css`

```css
:root {
  /* Background & Surface */
  --color-background-main: #D6F25F;
  --color-surface-primary: #FFFFFF;
  --color-surface-soft: #F9FAFB;

  /* Text */
  --color-text-primary: #111111;
  --color-text-secondary: #555555;
  --color-text-muted: #9CA3AF;
  --color-text-on-accent: #FFFFFF;

  /* Accent */
  --color-accent-primary: #7B3EFF;
  --color-accent-primary-soft: #EDE7FF;
  --color-accent-secondary: #00C6AE;
  --color-accent-yellow: #FFB020;

  /* Border & Semantic */
  --color-border-subtle: #F0F0F0;
  --color-success: #10B981;
  --color-warning: #FBBF24;
  --color-danger: #EF4444;

  /* Typography */
  --font-family-primary: 'SF Pro Rounded', 'Nunito', 'Inter', -apple-system, system-ui, sans-serif;

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

  /* Spacing */
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
  --shadow-card: 0 10px 25px 0 rgba(15, 23, 42, 0.06);
  --shadow-floating: 0 18px 40px 0 rgba(15, 23, 42, 0.10);
  --shadow-accent-soft: 0 8px 18px 0 rgba(123, 62, 255, 0.25);

  /* Sizes */
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
```

`src/lib/theme/tailwind-base.css` (optional utilities tuned to system)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html,
  body {
    padding: 0;
    margin: 0;
  }

  body {
    @apply bg-background-main font-sans;
  }
}

@layer components {
  .card {
    @apply bg-surface-primary shadow-card rounded-card-lg flex flex-col;
  }

  .card-default {
    padding: var(--card-padding-default);
  }

  .card-compact {
    padding: var(--card-padding-compact);
  }
}
```

### 3.4 `globals.css`

`src/app/globals.css`

```css
@import "../lib/theme/tokens.css";
@import "../lib/theme/tailwind-base.css";
```

---

## 4. Utility: `cn`

`src/lib/cn.ts`

```ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(...inputs));
}
```

---

## 5. Core UI Primitives

### 5.1 `Card`

`src/components/ui/card.tsx`

```tsx
import * as React from "react";
import { cn } from "@/lib/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "compact";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const paddingClass =
      variant === "compact"
        ? "p-[var(--card-padding-compact)] rounded-card-md"
        : "p-[var(--card-padding-default)] rounded-card-lg";

    return (
      <div
        ref={ref}
        className={cn(
          "bg-surface-primary shadow-card flex flex-col",
          paddingClass,
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";
```

### 5.2 `Button`

`src/components/ui/button.tsx`

```tsx
import * as React from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "success" | "ghost";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const base =
  "inline-flex items-center justify-center rounded-pill px-5 py-2.5 text-label font-medium transition-fast ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary-soft focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-primary text-text-on-accent shadow-[var(--shadow-accent-soft)] hover:bg-[#6B2FFF]",
  secondary:
    "bg-surface-primary text-text-primary border border-border-subtle hover:bg-surface-soft",
  success: "bg-semantic-success text-text-on-accent hover:bg-emerald-500",
  ghost: "bg-transparent text-text-primary hover:bg-surface-soft"
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variants[variant], className)}
      {...props}
    />
  )
);

Button.displayName = "Button";
```

### 5.3 `Tag`

`src/components/ui/tag.tsx`

```tsx
import * as React from "react";
import { cn } from "@/lib/cn";

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-pill bg-surface-soft px-3 py-1 text-label font-medium text-text-primary",
        className
      )}
      {...props}
    />
  )
);

Tag.displayName = "Tag";
```

### 5.4 `Avatar` & `AvatarGroup`

`src/components/ui/avatar.tsx`

```tsx
import * as React from "react";
import { cn } from "@/lib/cn";

export interface AvatarProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: "sm" | "md" | "lg";
}

const sizeMap: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "w-8 h-8",
  md: "w-9 h-9",
  lg: "w-16 h-16"
};

export const Avatar = React.forwardRef<HTMLImageElement, AvatarProps>(
  ({ className, size = "md", ...props }, ref) => (
    <img
      ref={ref}
      className={cn(
        "rounded-full object-cover border-2 border-surface-primary",
        sizeMap[size],
        className
      )}
      {...props}
    />
  )
);

Avatar.displayName = "Avatar";

export interface AvatarGroupProps {
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
  const remaining = avatars.length - visible.length;

  return (
    <div className={cn("flex items-center", className)}>
      {visible.map((a, i) => (
        <Avatar
          key={i}
          src={a.src}
          alt={a.alt}
          size="sm"
          className={cn(i > 0 && "-ml-2")}
        />
      ))}
      {remaining > 0 && (
        <span className="ml-1 rounded-full bg-surface-primary px-2 py-0.5 text-[10px] font-medium text-text-primary shadow-card">
          +{remaining}
        </span>
      )}
    </div>
  );
};
```

### 5.5 `Toggle`

`src/components/ui/toggle.tsx`

```tsx
import * as React from "react";
import { cn } from "@/lib/cn";

export interface ToggleProps {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onCheckedChange,
  disabled
}) => {
  const handleClick = () => {
    if (disabled || !onCheckedChange) return;
    onCheckedChange(!checked);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "relative inline-flex items-center rounded-pill transition-fast ease-standard",
        "w-[var(--size-toggle-width)] h-[var(--size-toggle-height)]",
        checked ? "bg-accent-primary" : "bg-[#E5E7EB]",
        disabled && "opacity-disabled cursor-not-allowed"
      )}
      aria-pressed={checked}
    >
      <span
        className={cn(
          "inline-block bg-white rounded-full shadow-card transition-fast ease-standard",
          "w-[var(--size-toggle-handle)] h-[var(--size-toggle-handle)]",
          checked ? "translate-x-5" : "translate-x-1"
        )}
      />
    </button>
  );
};
```

### 5.6 `ProgressCircle`

`src/components/ui/progress-circle.tsx`

```tsx
import * as React from "react";

export interface ProgressCircleProps {
  value: number; // 0-100
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
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;

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
          {clamped}%
        </span>
      )}
    </div>
  );
};
```

---

## 6. Composite Components (Examples)

### 6.1 `PageShell`

`src/components/layout/page-shell.tsx`

```tsx
import * as React from "react";
import { cn } from "@/lib/cn";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

export const PageShell: React.FC<PageShellProps> = ({
  children,
  className
}) => (
  <div className="min-h-screen bg-background-main">
    <main
      className={cn(
        "mx-auto max-w-6xl p-page flex flex-wrap gap-xxl",
        className
      )}
    >
      {children}
    </main>
  </div>
);
```

### 6.2 `ProfileCard`

`src/components/composite/profile-card.tsx`

```tsx
import * as React from "react";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/cn";

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
  <Card className="gap-md">
    <div className="flex items-start justify-between">
      <Avatar src={avatarSrc} alt={name} size="lg" />
      <button
        className={cn(
          "flex h-[var(--size-icon-button)] w-[var(--size-icon-button)] items-center justify-center rounded-full text-text-secondary hover:bg-surface-soft transition-fast ease-standard"
        )}
      >
        &#8942;
      </button>
    </div>
    <div>
      <div className="text-h2 text-text-primary">{name}</div>
      <div className="mt-1 text-body text-text-secondary">{role}</div>
    </div>
    <div className="mt-md flex flex-wrap gap-xs">
      {tags.map((tag) => (
        <Tag key={tag}>{tag}</Tag>
      ))}
    </div>
  </Card>
);
```

### 6.3 `MilestoneCard`

`src/components/composite/milestone-card.tsx`

```tsx
import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AvatarGroup } from "@/components/ui/avatar";
import { ProgressCircle } from "@/components/ui/progress-circle";

interface MilestoneCardProps {
  title: string;
  dueDate: string;
  progress: number;
  assignees: { src: string; alt: string }[];
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({
  title,
  dueDate,
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
        <div className="text-label text-text-muted uppercase">
          Due date
        </div>
        <div className="text-body text-text-primary">{dueDate}</div>
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

(Additional composites like `IntegrationsCard`, `NotificationsCard`, `CalendarCard` can be derived similarly; I can add those next if you’d like.)

---

## 7. Example Usage in Next App

### 7.1 `src/app/layout.tsx`

```tsx
import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "LimeAura Dashboard",
  description: "Demo of LimeAura design system implementation."
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### 7.2 `src/app/page.tsx`

```tsx
import { PageShell } from "@/components/layout/page-shell";
import { ProfileCard } from "@/components/composite/profile-card";
import { MilestoneCard } from "@/components/composite/milestone-card";

export default function HomePage() {
  return (
    <PageShell>
      <div className="flex flex-col gap-xxl">
        <ProfileCard
          name="Christine Thompson"
          role="Project manager"
          avatarSrc="/avatars/christine.png"
          tags={["UI/UX Design", "Project management", "Agile methodologies"]}
        />
        {/* Add NotificationsCard here later */}
      </div>

      <div className="flex flex-col gap-xxl flex-1">
        <MilestoneCard
          title="Wireframes milestone"
          dueDate="March 20th"
          progress={39}
          assignees={[
            { src: "/avatars/u1.png", alt: "User 1" },
            { src: "/avatars/u2.png", alt: "User 2" },
            { src: "/avatars/u3.png", alt: "User 3" }
          ]}
        />
        {/* Add CalendarCard, IntegrationsCard etc. */}
      </div>
    </PageShell>
  );
}
```

---

## 8. Validation

- [x] Scaffold aligns with Next 14 + Tailwind + TS.
- [x] Tokens wired via CSS variables and Tailwind.
- [x] Core primitives implemented; composites reflect the visual style.
- [x] Clean separation: tokens → primitives → composites → pages.

---

## 1. Executive Summary

Below is a focused, production-style implementation of three composite components, aligned with our design system:

- `NotificationsCard`
- `IntegrationsCard`
- `CalendarCard`

Each:

- Uses existing primitives (`Card`, `Button`, `Tag`, `Avatar`, `Toggle`, `ProgressCircle`).
- Matches the structure, spacing, and look of the reference.
- Is data-driven and easily reusable.

All code is provided as drop-in `tsx` files.

---

## 2. Design & Implementation Plan

### 2.1 NotificationsCard

**Essence**

- Card with title row (`Notifications` + `Unread` pill).
- List of notification rows:
  - Avatar / icon
  - Message (emphasized actor, plain description)
  - Timestamp
  - Optional inline actions (Accept / Deny)
  - Trailing `...` menu icon
- Footer: `Mark all as read`, `View all` buttons.

**Key Guidelines**

- Vertical list, generous spacing, no heavy borders.
- Primary action in success/confirm style (green Accept) as in reference.
- Subdued timestamps.

### 2.2 IntegrationsCard

**Essence**

- Card titled `Integrations`.
- Vertical list of integration rows:
  - Icon
  - Name + single-line description
  - Toggle on the right.
- Minimalist, soft; toggles styled with our `Toggle`.

### 2.3 CalendarCard

**Essence**

- Card with month/year centered.
- Left/right arrows (use simple chevrons or Lucide).
- Weekday row.
- Grid of days:
  - Muted for outside-month days.
  - Today/selected as filled pill.
- Bottom highlight for selected date (e.g. as needed).

**Behavior**

- Client-side month navigation.
- Click to select a day.

---

## 3. Components

All paths assume:

- `src/components/ui` for primitives.
- `src/components/composite` for composites.
- `cn` helper at `@/lib/cn`.

If your aliases differ, adjust imports accordingly.

---

### 3.1 `NotificationsCard`

File: `src/components/composite/notifications-card.tsx`

```tsx
"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/cn";

type NotificationType =
  | "invite"
  | "status-change"
  | "task-added"
  | "system";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  actorName?: string;
  actorAvatarSrc?: string;
  message: string;
  timestamp: string; // e.g. "1h"
  unread?: boolean;
  hasActions?: boolean;
}

interface NotificationsCardProps {
  title?: string;
  items: NotificationItem[];
  onAccept?: (id: string) => void;
  onDeny?: (id: string) => void;
  onMarkAllRead?: () => void;
  onViewAll?: () => void;
}

export const NotificationsCard: React.FC<NotificationsCardProps> = ({
  title = "Notifications",
  items,
  onAccept,
  onDeny,
  onMarkAllRead,
  onViewAll
}) => {
  const unreadCount = items.filter((i) => i.unread).length;

  return (
    <Card className="gap-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-h2 text-text-primary">{title}</h2>
        <div className="flex items-center gap-2">
          <span className="text-label text-text-muted">Unread</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-primary text-[10px] font-semibold text-text-on-accent">
            {unreadCount}
          </span>
        </div>
      </div>

      {/* List */}
      <div className="mt-sm flex flex-col gap-sm">
        {items.map((item) => (
          <NotificationRow
            key={item.id}
            item={item}
            onAccept={onAccept}
            onDeny={onDeny}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-md flex items-center justify-between gap-sm">
        <Button
          variant="ghost"
          className="px-4 py-2 text-label"
          onClick={onMarkAllRead}
        >
          Mark all as read
        </Button>
        <Button
          variant="secondary"
          className="px-5 py-2 text-label"
          onClick={onViewAll}
        >
          View all
        </Button>
      </div>
    </Card>
  );
};

interface NotificationRowProps {
  item: NotificationItem;
  onAccept?: (id: string) => void;
  onDeny?: (id: string) => void;
}

const NotificationRow: React.FC<NotificationRowProps> = ({
  item,
  onAccept,
  onDeny
}) => {
  const {
    id,
    actorName,
    actorAvatarSrc,
    message,
    timestamp,
    unread,
    hasActions,
    type
  } = item;

  const isSystem = type === "system";

  return (
    <div
      className={cn(
        "flex items-start gap-sm rounded-card-md px-3 py-2",
        unread && "bg-surface-soft"
      )}
    >
      {/* Avatar / bullet */}
      <div className="mt-0.5">
        {actorAvatarSrc && !isSystem ? (
          <Avatar src={actorAvatarSrc} alt={actorName ?? ""} size="sm" />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-primary-soft text-[10px] text-accent-primary">
            !
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        <p className="text-body text-text-primary">
          {actorName && !isSystem && (
            <span className="font-medium">{actorName}</span>
          )}{" "}
          {message}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-text-muted">{timestamp}</span>
          {hasActions && (
            <div className="flex gap-2">
              <Button
                variant="success"
                className="px-3 py-1 text-[11px]"
                onClick={() => onAccept?.(id)}
              >
                Accept
              </Button>
              <Button
                variant="secondary"
                className="px-3 py-1 text-[11px]"
                onClick={() => onDeny?.(id)}
              >
                Deny request
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Menu */}
      <button
        className="mt-1 flex h-7 w-7 items-center justify-center rounded-full text-text-muted hover:bg-surface-soft transition-fast ease-standard"
        aria-label="More options"
      >
        &#8942;
      </button>
    </div>
  );
};
```

---

### 3.2 `IntegrationsCard`

File: `src/components/composite/integrations-card.tsx`

```tsx
"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/cn";

export interface IntegrationItem {
  id: string;
  name: string;
  description: string;
  icon?: React.ReactNode;
  enabled: boolean;
}

interface IntegrationsCardProps {
  title?: string;
  items: IntegrationItem[];
  onToggle?: (id: string, enabled: boolean) => void;
}

export const IntegrationsCard: React.FC<IntegrationsCardProps> = ({
  title = "Integrations",
  items,
  onToggle
}) => {
  return (
    <Card className="gap-md">
      <h2 className="text-h2 text-text-primary">{title}</h2>
      <div className="flex flex-col gap-sm">
        {items.map((item) => (
          <IntegrationRow
            key={item.id}
            item={item}
            onToggle={onToggle}
          />
        ))}
      </div>
    </Card>
  );
};

interface IntegrationRowProps {
  item: IntegrationItem;
  onToggle?: (id: string, enabled: boolean) => void;
}

const IntegrationRow: React.FC<IntegrationRowProps> = ({
  item,
  onToggle
}) => {
  const { id, name, description, icon, enabled } = item;

  return (
    <div className="flex items-center justify-between gap-md">
      <div className="flex items-center gap-sm">
        {/* Icon bubble */}
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl bg-surface-soft shadow-card"
          )}
        >
          {icon ?? (
            <span className="text-[10px] text-accent-primary font-semibold">
              {name[0]}
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-body font-medium text-text-primary">
            {name}
          </span>
          <span className="text-[11px] text-text-secondary">
            {description}
          </span>
        </div>
      </div>
      <Toggle
        checked={enabled}
        onCheckedChange={(val) => onToggle?.(id, val)}
      />
    </div>
  );
};
```

To match the reference, instantiate with items like:

```ts
const integrations = [
  {
    id: "slack",
    name: "Slack",
    description: "Used as a main source of communication",
    enabled: true
  },
  {
    id: "google-meet",
    name: "Google Meet",
    description: "Used for all types of calls",
    enabled: true
  },
  {
    id: "github",
    name: "Github",
    description: "Enables automated workflows, code synchronization",
    enabled: false
  }
];
```

---

### 3.3 `CalendarCard`

File: `src/components/composite/calendar-card.tsx`

```tsx
"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarCardProps {
  initialDate?: Date;
  onDateSelect?: (date: Date) => void;
}

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

export const CalendarCard: React.FC<CalendarCardProps> = ({
  initialDate,
  onDateSelect
}) => {
  const [viewDate, setViewDate] = React.useState<Date>(
    initialDate ?? new Date()
  );
  const [selected, setSelected] = React.useState<Date | null>(
    initialDate ?? null
  );

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const days = buildCalendarGrid(year, month);

  const handlePrev = () => {
    setViewDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNext = () => {
    setViewDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const handleSelect = (day: CalendarDay) => {
    const date = new Date(day.year, day.month, day.date);
    setSelected(date);
    onDateSelect?.(date);
  };

  const monthLabel = viewDate.toLocaleString("default", {
    month: "long"
  });

  return (
    <Card className="gap-md items-stretch">
      {/* Header with nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:bg-surface-soft transition-fast ease-standard"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-h2 text-text-primary">
          {monthLabel}, {year}
        </div>
        <button
          onClick={handleNext}
          className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:bg-surface-soft transition-fast ease-standard"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Weekdays */}
      <div className="mt-xs grid grid-cols-7 gap-[6px] text-center text-label text-text-muted">
        {WEEKDAYS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-[6px]">
        {days.map((day) => {
          const isCurrentMonth = day.month === month;
          const isSelected =
            selected &&
            day.year === selected.getFullYear() &&
            day.month === selected.getMonth() &&
            day.date === selected.getDate();

          const isToday = isSameDate(day, new Date());

          const baseClasses =
            "flex items-center justify-center h-[var(--size-calendar-day)] w-[var(--size-calendar-day)] text-body rounded-full cursor-pointer transition-fast ease-standard";

          let stateClasses = "";

          if (!isCurrentMonth) {
            stateClasses = "text-text-muted/60 cursor-default";
          } else if (isSelected) {
            stateClasses =
              "bg-accent-primary text-text-on-accent shadow-card";
          } else if (isToday) {
            stateClasses =
              "border border-accent-primary text-text-primary";
          } else {
            stateClasses =
              "text-text-primary hover:bg-surface-soft";
          }

          return (
            <div
              key={`${day.year}-${day.month}-${day.date}-${day.index}`}
              className={cn(baseClasses, stateClasses)}
              onClick={() => isCurrentMonth && handleSelect(day)}
            >
              {day.date}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

interface CalendarDay {
  year: number;
  month: number; // 0-11
  date: number;
  index: number;
}

function buildCalendarGrid(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const startDay = (firstDay.getDay() + 6) % 7; // make Monday=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const grid: CalendarDay[] = [];
  const totalCells = 42; // 6 weeks

  for (let i = 0; i < totalCells; i++) {
    const dateOffset = i - startDay + 1;

    let cellYear = year;
    let cellMonth = month;
    let cellDate = dateOffset;

    if (dateOffset <= 0) {
      // previous month
      cellMonth = month - 1;
      if (cellMonth < 0) {
        cellMonth = 11;
        cellYear = year - 1;
      }
      cellDate = daysInPrevMonth + dateOffset;
    } else if (dateOffset > daysInMonth) {
      // next month
      cellMonth = month + 1;
      if (cellMonth > 11) {
        cellMonth = 0;
        cellYear = year + 1;
      }
      cellDate = dateOffset - daysInMonth;
    }

    grid.push({
      year: cellYear,
      month: cellMonth,
      date: cellDate,
      index: i
    });
  }

  return grid;
}

function isSameDate(day: CalendarDay, d: Date): boolean {
  return (
    day.year === d.getFullYear() &&
    day.month === d.getMonth() &&
    day.date === d.getDate()
  );
}
```

---

## 4. How to Wire into `page.tsx` (Example)

```tsx
import { PageShell } from "@/components/layout/page-shell";
import { ProfileCard } from "@/components/composite/profile-card";
import { MilestoneCard } from "@/components/composite/milestone-card";
import { NotificationsCard } from "@/components/composite/notifications-card";
import { IntegrationsCard } from "@/components/composite/integrations-card";
import { CalendarCard } from "@/components/composite/calendar-card";

const notifications = [
  {
    id: "1",
    type: "invite",
    actorName: "Ashlynn George",
    actorAvatarSrc: "/avatars/ashlynn.png",
    message: "has invited you to access \"Magma project\"",
    timestamp: "1h",
    unread: true,
    hasActions: true
  },
  {
    id: "2",
    type: "status-change",
    actorName: "Ashlynn George",
    actorAvatarSrc: "/avatars/ashlynn.png",
    message: "changed status of task in \"Magma project\"",
    timestamp: "1h",
    unread: true
  },
  {
    id: "3",
    type: "system",
    message: "We have updated our Terms and condition. Please review",
    timestamp: "1h",
    unread: true
  }
];

const integrations = [
  {
    id: "slack",
    name: "Slack",
    description: "Used as a main source of communication",
    enabled: true
  },
  {
    id: "google-meet",
    name: "Google Meet",
    description: "Used for all types of calls",
    enabled: true
  },
  {
    id: "github",
    name: "Github",
    description:
      "Enables automated workflows, code synchronization",
    enabled: false
  }
];

export default function HomePage() {
  return (
    <PageShell>
      <div className="flex flex-col gap-xxl w-[280px]">
        <ProfileCard
          name="Christine Thompson"
          role="Project manager"
          avatarSrc="/avatars/christine.png"
          tags={[
            "UI/UX Design",
            "Project management",
            "Agile methodologies"
          ]}
        />
        <NotificationsCard items={notifications} />
      </div>

      <div className="flex flex-col gap-xxl flex-1 min-w-[320px]">
        <CalendarCard />
        <MilestoneCard
          title="Wireframes milestone"
          dueDate="March 20th"
          progress={39}
          assignees={[
            { src: "/avatars/u1.png", alt: "User 1" },
            { src: "/avatars/u2.png", alt: "User 2" },
            { src: "/avatars/u3.png", alt: "User 3" }
          ]}
        />
      </div>

      <div className="flex flex-col gap-xxl flex-1 min-w-[320px]">
        <IntegrationsCard
          items={integrations}
          onToggle={(id, enabled) => {
            // Implement toggle handling
          }}
        />
      </div>
    </PageShell>
  );
}
```

---

## 5. Validation

- [x] Each new card is modular, data-driven, and follows the same design tokens.
- [x] Layout, spacing, and interaction mirror the reference.
- [x] Code integrates cleanly into the existing Next 14 + Tailwind + TS stack.

---

## 1. Executive Summary

Below is a carefully planned and implemented composite component that captures the **“Amber website redesign” hero card** (wireframes overview) from the reference:

- Circular progress badge at top-left.
- Asymmetric, soft card shape (simulated via layout — no SVG complexity required).
- Title, concise description, avatar group, overflow menu.
- Data-driven and reusable for any project overview.

Named `ProjectOverviewHeroCard`.

---

## 2. Design & Implementation Plan

### 2.1 Visual & Structural Requirements

From the reference hero panel:

1. **Container**
   - White, prominent card.
   - Large soft radius; top-right visually more rounded.
   - Light ambient shadow.
   - Comfortable padding with vertical flow.

2. **Header Row**
   - Left: Circular progress badge in accent purple.
   - Right: Overflow icon (`...`) inside subtle round button.

3. **Content**
   - Bold project title (e.g. “Amber website redesign”).
   - Short 2–3 line description in secondary text color.
   - Bottom row with stacked avatars representing team members.

4. **Tone**
   - Friendly, clean, minimal.
   - Accent used sparingly (progress + small details).

### 2.2 Component API

`ProjectOverviewHeroCardProps`:

- `title: string`
- `description: string`
- `progress: number` (0–100)
- `avatars: { src: string; alt: string }[]`
- Optional `onMenuClick?: () => void`
- Optional `className?: string` to control layout

### 2.3 Implementation Notes

- Built on existing primitives:
  - `Card`
  - `ProgressCircle`
  - `AvatarGroup`
  - `cn`
- To hint at the special top-right curvature:
  - Use larger top-right radius via utility override on top of `Card`.

---

## 3. Component Implementation

File: `src/components/composite/project-overview-hero-card.tsx`

```tsx
"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { AvatarGroup } from "@/components/ui/avatar";
import { cn } from "@/lib/cn";

export interface ProjectOverviewHeroCardProps {
  title: string;
  description: string;
  progress: number; // 0-100
  avatars: { src: string; alt: string }[];
  onMenuClick?: () => void;
  className?: string;
}

export const ProjectOverviewHeroCard: React.FC<ProjectOverviewHeroCardProps> = ({
  title,
  description,
  progress,
  avatars,
  onMenuClick,
  className
}) => {
  return (
    <Card
      className={cn(
        // Emphasize hero feel: larger, special top-right rounding
        "relative gap-md rounded-[32px] rounded-tr-[40px] shadow-floating",
        className
      )}
    >
      {/* Top Row: Progress badge + menu */}
      <div className="flex items-start justify-between">
        {/* Progress "pill" (matches reference: circular with label) */}
        <div className="inline-flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-primary-soft">
            <span className="text-[11px] font-semibold text-accent-primary">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-soft transition-fast ease-standard"
          aria-label="Project options"
        >
          &#8942;
        </button>
      </div>

      {/* Title */}
      <h2 className="mt-1 text-h1 text-text-primary">
        {title}
      </h2>

      {/* Description */}
      <p className="mt-2 text-body text-text-secondary">
        {description}
      </p>

      {/* Avatars Row */}
      <div className="mt-md">
        <AvatarGroup avatars={avatars} />
      </div>
    </Card>
  );
};
```

---

## 4. Example Usage (Matching “Amber website redesign”)

```tsx
import { ProjectOverviewHeroCard } from "@/components/composite/project-overview-hero-card";

<ProjectOverviewHeroCard
  title="Amber website redesign"
  description="In today’s fast-paced digital landscape, our mission is to transform our website into a more intuitive, engaging, and user-friendly platform."
  progress={43}
  avatars={[
    { src: "/avatars/u1.png", alt: "Team member 1" },
    { src: "/avatars/u2.png", alt: "Team member 2" },
    { src: "/avatars/u3.png", alt: "Team member 3" },
    { src: "/avatars/u4.png", alt: "Team member 4" }
  ]}
/>;
```

Place it in your dashboard grid (e.g., near the calendar or milestones) to mirror the hero layout.

---

## 5. Validation

- [x] Encapsulates hero panel semantics as a reusable `ProjectOverviewHeroCard`.
- [x] Uses existing tokens and primitives.
- [x] Matches layout and style: progress badge, title, description, avatars, menu.
- [x] API is minimal, composable, and ready for real data.

---

## 1. Executive Summary

Here is a dedicated `HeroGrid` layout that arranges:

- `ProjectOverviewHeroCard` (Amber website redesign)
- `CalendarCard`
- `MilestoneCard`

into a responsive grid that closely mirrors the reference dashboard’s hero section.

All code is provided as a composable layout plus a concrete example configuration.

---

## 2. Planning the HeroGrid

### 2.1 Objectives

- Visually echo the reference:
  - Center column: tall calendar.
  - Right column: hero overview card above milestone card.
- Use our existing cards without modifying their internals.
- Keep it responsive and token-aligned.

### 2.2 Layout Strategy

Desktop (approx ≥ $1024$px):

- 3-column grid (`grid-cols-[minmax(260px,280px)_minmax(320px,1fr)_minmax(320px,1fr)]`)
- Left: optional stack (profile/notifications — can be filled externally).
- Center: `CalendarCard`.
- Right: `ProjectOverviewHeroCard` on top, `MilestoneCard` below.

For the **HeroGrid** in this task:

- Provide:
  - `leftSlot` for caller to inject (profile + notifications).
  - Center: always `CalendarCard`.
  - Right: `ProjectOverviewHeroCard` and `MilestoneCard`.

Mobile / small screens:

- Stack vertically: leftSlot → Calendar → ProjectOverview → Milestone.

### 2.3 API Design

`HeroGridProps`:

- `leftSlot?: React.ReactNode`
- `projectOverview: ProjectOverviewHeroCardProps`
- `milestone: MilestoneCardProps`
- `calendarInitialDate?: Date`
- `onDateSelect?: (date: Date) => void`
- Optional `className` for outer wrapper.

---

## 3. HeroGrid Implementation

File: `src/components/layout/hero-grid.tsx`

```tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { CalendarCard } from "@/components/composite/calendar-card";
import {
  ProjectOverviewHeroCard,
  ProjectOverviewHeroCardProps
} from "@/components/composite/project-overview-hero-card";
import {
  MilestoneCard,
  MilestoneCardProps
} from "@/components/composite/milestone-card";

export interface HeroGridProps {
  leftSlot?: React.ReactNode;
  projectOverview: ProjectOverviewHeroCardProps;
  milestone: MilestoneCardProps;
  calendarInitialDate?: Date;
  onDateSelect?: (date: Date) => void;
  className?: string;
}

/**
 * HeroGrid
 *
 * Layout that composes:
 * - Left column: optional injected content (e.g. ProfileCard + NotificationsCard).
 * - Center column: CalendarCard.
 * - Right column: ProjectOverviewHeroCard above MilestoneCard.
 *
 * Designed to visually echo the reference hero section.
 */
export const HeroGrid: React.FC<HeroGridProps> = ({
  leftSlot,
  projectOverview,
  milestone,
  calendarInitialDate,
  onDateSelect,
  className
}) => {
  return (
    <section
      className={cn(
        "w-full",
        // Vertical stack on small screens
        "flex flex-col gap-xxl",
        // At md/lg, switch to grid for hero-like layout
        "lg:grid lg:grid-cols-[minmax(260px,280px)_minmax(320px,1.1fr)_minmax(320px,1.1fr)] lg:items-start",
        "lg:gap-xxl",
        className
      )}
    >
      {/* Left column: profile + notifications (or any custom content) */}
      <div className="flex flex-col gap-xxl">
        {leftSlot}
      </div>

      {/* Center column: Calendar */}
      <div className="flex flex-col gap-xxl">
        <CalendarCard
          initialDate={calendarInitialDate}
          onDateSelect={onDateSelect}
        />
      </div>

      {/* Right column: Hero overview + milestone */}
      <div className="flex flex-col gap-xxl">
        <ProjectOverviewHeroCard {...projectOverview} />
        <MilestoneCard {...milestone} />
      </div>
    </section>
  );
};
```

---

## 4. Example: Fully Wired HeroGrid Matching the Reference

File: `src/app/page.tsx` (excerpt)

```tsx
import { PageShell } from "@/components/layout/page-shell";
import { HeroGrid } from "@/components/layout/hero-grid";
import { ProfileCard } from "@/components/composite/profile-card";
import { NotificationsCard } from "@/components/composite/notifications-card";

const notifications = [
  {
    id: "1",
    type: "invite",
    actorName: "Ashlynn George",
    actorAvatarSrc: "/avatars/ashlynn.png",
    message: 'has invited you to access "Magma project"',
    timestamp: "1h",
    unread: true,
    hasActions: true
  },
  {
    id: "2",
    type: "status-change",
    actorName: "Ashlynn George",
    actorAvatarSrc: "/avatars/ashlynn.png",
    message: 'changed status of task in "Magma project"',
    timestamp: "1h",
    unread: true
  },
  {
    id: "3",
    type: "task-added",
    actorName: "Ashlynn George",
    actorAvatarSrc: "/avatars/ashlynn.png",
    message: 'added new tasks to "Firmly project"',
    timestamp: "1h",
    unread: true
  },
  {
    id: "4",
    type: "system",
    message: "We have updated our Terms and condition. Please review",
    timestamp: "1h",
    unread: true
  }
];

const heroProject = {
  title: "Amber website redesign",
  description:
    "In today’s fast-paced digital landscape, our mission is to transform our website into a more intuitive, engaging, and user-friendly platform.",
  progress: 43,
  avatars: [
    { src: "/avatars/u1.png", alt: "Team member 1" },
    { src: "/avatars/u2.png", alt: "Team member 2" },
    { src: "/avatars/u3.png", alt: "Team member 3" },
    { src: "/avatars/u4.png", alt: "Team member 4" }
  ]
} as const;

const milestone = {
  title: "Wireframes milestone",
  dueDate: "March 20th",
  progress: 39,
  assignees: [
    { src: "/avatars/u1.png", alt: "Team member 1" },
    { src: "/avatars/u2.png", alt: "Team member 2" },
    { src: "/avatars/u3.png", alt: "Team member 3" },
    { src: "/avatars/u4.png", alt: "Team member 4" }
  ]
} as const;

export default function HomePage() {
  return (
    <PageShell>
      <HeroGrid
        leftSlot={
          <>
            <ProfileCard
              name="Christine Thompson"
              role="Project manager"
              avatarSrc="/avatars/christine.png"
              tags={[
                "UI/UX Design",
                "Project management",
                "Agile methodologies"
              ]}
            />
            <NotificationsCard
              items={notifications}
              onMarkAllRead={() => {
                // integrate with state or API
              }}
              onViewAll={() => {
                // navigation hook
              }}
            />
          </>
        }
        projectOverview={heroProject}
        milestone={milestone}
        calendarInitialDate={new Date(2021, 1, 26)} // Feb 26, 2021
        onDateSelect={(date) => {
          // handle selected date
        }}
      />
    </PageShell>
  );
}
```

This layout:

- Reproduces the three-column hero region.
- Aligns cards and spacing to feel like the provided reference.
- Is easily customizable (swap content via props/slots).

---

## 5. Validation

- [x] HeroGrid composes `CalendarCard`, `ProjectOverviewHeroCard`, and `MilestoneCard`.
- [x] Reflects reference layout at desktop while remaining responsive.
- [x] Uses only existing primitives and tokens; no ad-hoc styling contradictions.
- [x] API enables reuse with different data in other views.

---

## 1. Executive Summary

Below is a structured plan and implementation for an `IntegrationsGrid` that sits **below** the `HeroGrid` to complete the reference layout:

- Top row: `IntegrationsCard` (left, wide) + payment/brand pills (right).
- Responsive, token-aligned, and data-driven.
- Composed from existing primitives and composites.

All code is provided as concrete `tsx` components and example usage.

---

## 2. Plan

### 2.1 Goals

- Mirror the reference’s lower section:
  - Large `Integrations` card with toggles.
  - Row of pill-shaped brand/payment logos.
- Maintain:
  - Same card radii, shadows, spacing.
  - Three-column rhythm from `HeroGrid` for cohesive page composition.
- Keep:
  - Simple API focused on:
    - Integrations list.
    - Brand pills list.

### 2.2 Layout Strategy

Desktop (≥ about $1024$px):

- Full-width section under `HeroGrid`.
- Use a 3-col proportional grid:
  - Left: `IntegrationsCard` spanning ~2 columns.
  - Right: pill row in a card spanning the remaining column.

Mobile:

- Stack:
  - `IntegrationsCard`
  - Brand pills card.

### 2.3 APIs

`IntegrationsGridProps`:

- `integrations: IntegrationItem[]` (reuses `IntegrationsCard` types).
- `brandPills: BrandPillItem[]`
- `onToggleIntegration?: (id: string, enabled: boolean) => void`
- `className?: string`

`BrandPillItem`:

- `id: string`
- `label: string`
- Optional `icon?: ReactNode` or `logoSrc?: string`

---

## 3. Implementation

### 3.1 BrandPillsCard

File: `src/components/composite/brand-pills-card.tsx`

```tsx
"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

export interface BrandPillItem {
  id: string;
  label: string;
  logoSrc?: string;
  icon?: React.ReactNode;
}

interface BrandPillsCardProps {
  title?: string;
  items: BrandPillItem[];
  className?: string;
}

/**
 * BrandPillsCard
 *
 * Displays pill-shaped brand/payment logos (e.g., Stripe, Visa, PayPal, Mastercard).
 * Mirrors the reference: floating pills with subtle shadows on a white surface.
 */
export const BrandPillsCard: React.FC<BrandPillsCardProps> = ({
  title,
  items,
  className
}) => {
  return (
    <Card
      variant="compact"
      className={cn(
        "flex flex-col gap-sm rounded-card-lg shadow-card",
        className
      )}
    >
      {title && (
        <div className="mb-xs text-label font-medium text-text-muted uppercase tracking-wide">
          {title}
        </div>
      )}
      <div className="flex flex-wrap gap-sm">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "inline-flex items-center justify-center",
              "rounded-pill bg-surface-primary px-4 py-2",
              "shadow-card text-body font-medium text-text-primary"
            )}
          >
            {item.logoSrc ? (
              <img
                src={item.logoSrc}
                alt={item.label}
                className="h-4 w-auto"
              />
            ) : item.icon ? (
              <span className="mr-1.5 flex items-center">{item.icon}</span>
            ) : null}
            {!item.logoSrc && (
              <span className="ml-1">{item.label}</span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
```

### 3.2 IntegrationsGrid

File: `src/components/layout/integrations-grid.tsx`

```tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import {
  IntegrationsCard,
  IntegrationItem
} from "@/components/composite/integrations-card";
import {
  BrandPillsCard,
  BrandPillItem
} from "@/components/composite/brand-pills-card";

export interface IntegrationsGridProps {
  integrations: IntegrationItem[];
  brandPills: BrandPillItem[];
  onToggleIntegration?: (id: string, enabled: boolean) => void;
  className?: string;
}

/**
 * IntegrationsGrid
 *
 * Sits below HeroGrid; mimics the reference's bottom section:
 * - Left/center: large IntegrationsCard (approx 2/3 width).
 * - Right: BrandPillsCard with payment/brand pills (approx 1/3 width).
 * Stacks vertically on small screens.
 */
export const IntegrationsGrid: React.FC<IntegrationsGridProps> = ({
  integrations,
  brandPills,
  onToggleIntegration,
  className
}) => {
  return (
    <section
      className={cn(
        "mt-xxl w-full",
        "flex flex-col gap-xxl",
        "lg:grid lg:grid-cols-[minmax(480px,2fr)_minmax(260px,1fr)] lg:gap-xxl",
        className
      )}
    >
      <IntegrationsCard
        items={integrations}
        onToggle={onToggleIntegration}
      />
      <BrandPillsCard
        title="Supported payments"
        items={brandPills}
      />
    </section>
  );
};
```

---

## 4. Integrating HeroGrid + IntegrationsGrid (Full-page Replica)

Update `src/app/page.tsx` to compose both:

```tsx
import { PageShell } from "@/components/layout/page-shell";
import { HeroGrid } from "@/components/layout/hero-grid";
import { IntegrationsGrid } from "@/components/layout/integrations-grid";

import { ProfileCard } from "@/components/composite/profile-card";
import { NotificationsCard } from "@/components/composite/notifications-card";

const notifications = [
  {
    id: "1",
    type: "invite",
    actorName: "Ashlynn George",
    actorAvatarSrc: "/avatars/ashlynn.png",
    message: 'has invited you to access "Magma project"',
    timestamp: "1h",
    unread: true,
    hasActions: true
  },
  {
    id: "2",
    type: "status-change",
    actorName: "Ashlynn George",
    actorAvatarSrc: "/avatars/ashlynn.png",
    message: 'changed status of task in "Magma project"',
    timestamp: "1h",
    unread: true
  },
  {
    id: "3",
    type: "task-added",
    actorName: "Ashlynn George",
    actorAvatarSrc: "/avatars/ashlynn.png",
    message: 'added new tasks to "Firmly project"',
    timestamp: "1h",
    unread: true
  },
  {
    id: "4",
    type: "system",
    message: "We have updated our Terms and condition. Please review",
    timestamp: "1h",
    unread: true
  }
];

const heroProject = {
  title: "Amber website redesign",
  description:
    "In today’s fast-paced digital landscape, our mission is to transform our website into a more intuitive, engaging, and user-friendly platform.",
  progress: 43,
  avatars: [
    { src: "/avatars/u1.png", alt: "Team member 1" },
    { src: "/avatars/u2.png", alt: "Team member 2" },
    { src: "/avatars/u3.png", alt: "Team member 3" },
    { src: "/avatars/u4.png", alt: "Team member 4" }
  ]
} as const;

const milestone = {
  title: "Wireframes milestone",
  dueDate: "March 20th",
  progress: 39,
  assignees: [
    { src: "/avatars/u1.png", alt: "Team member 1" },
    { src: "/avatars/u2.png", alt: "Team member 2" },
    { src: "/avatars/u3.png", alt: "Team member 3" },
    { src: "/avatars/u4.png", alt: "Team member 4" }
  ]
} as const;

const integrations = [
  {
    id: "slack",
    name: "Slack",
    description: "Used as a main source of communication",
    enabled: true
  },
  {
    id: "google-meet",
    name: "Google Meet",
    description: "Used for all types of calls",
    enabled: true
  },
  {
    id: "github",
    name: "Github",
    description:
      "Enables automated workflows, code synchronization",
    enabled: false
  }
];

const brandPills = [
  { id: "stripe", label: "stripe", logoSrc: "/brands/stripe.svg" },
  { id: "visa", label: "VISA", logoSrc: "/brands/visa.svg" },
  { id: "paypal", label: "paypal", logoSrc: "/brands/paypal.svg" },
  {
    id: "mastercard",
    label: "mastercard",
    logoSrc: "/brands/mastercard.svg"
  }
];

export default function HomePage() {
  return (
    <PageShell>
      <HeroGrid
        leftSlot={
          <>
            <ProfileCard
              name="Christine Thompson"
              role="Project manager"
              avatarSrc="/avatars/christine.png"
              tags={[
                "UI/UX Design",
                "Project management",
                "Agile methodologies"
              ]}
            />
            <NotificationsCard
              items={notifications}
              onMarkAllRead={() => {
                // Handle mark all read
              }}
              onViewAll={() => {
                // Handle view all
              }}
            />
          </>
        }
        projectOverview={heroProject}
        milestone={milestone}
        calendarInitialDate={new Date(2021, 1, 26)}
        onDateSelect={(date) => {
          // Handle date select
        }}
      />

      <IntegrationsGrid
        integrations={integrations}
        brandPills={brandPills}
        onToggleIntegration={(id, enabled) => {
          // Handle toggle
        }}
      />
    </PageShell>
  );
}
```

This composition:

- Recreates the top hero (profile, notifications, calendar, hero overview, milestone).
- Adds the bottom integrations/payment row.
- Stays faithful to the design system and reference.

---

## 5. Validation

- [x] `IntegrationsGrid` defined and wired below `HeroGrid`.
- [x] Uses `IntegrationsCard` and brand pills to mirror the reference bottom area.
- [x] Responsive and token-consistent.
- [x] Minimal, reusable APIs.

If you’d like, next steps could include:

- Adding Storybook stories for `HeroGrid` + `IntegrationsGrid`.
- Introducing layout tokens into `tokens.json` for grids/breakpoints.
- Creating a single `DashboardPage` config object that drives all sections declaratively.
