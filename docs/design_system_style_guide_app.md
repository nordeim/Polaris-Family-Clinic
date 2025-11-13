## 1. Overview

This defines a complete **demo style guide screen** for your LimeAura design system:

- Built as a **Vite + React + TypeScript + Tailwind** app.
- Uses the same tokens, components, and visual language as your `design.json`.
- Renders a single `StyleGuidePage` showing:
  - Color palette
  - Typography scale
  - Spacing & radii
  - Buttons
  - Tags/Chips
  - Avatars & AvatarGroup
  - Toggles
  - Progress indicators
  - Cards (base + hero + milestones + notifications + integrations + calendar + brand pills)
  - Layout examples (HeroGrid, IntegrationsGrid)
- Structured so you can drop it into a Vite repo or adapt directly into your Next app.

I will:

1. Outline the project scaffold.
2. Define Tailwind + tokens config.
3. Implement shared utilities.
4. Implement UI primitives.
5. Implement composite components.
6. Implement `StyleGuidePage` that showcases everything.

All code is concrete and minimal; you can copy as-is.

---

## 2. Project Scaffold (Vite + React + TS + Tailwind)

Run (reference):

```bash
npm create vite@latest limeaura-styleguide -- --template react-ts
cd limeaura-styleguide
npm install tailwindcss postcss autoprefixer clsx tailwind-merge lucide-react
npx tailwindcss init -p
```

Then replace/add the following files.

### 2.1 `tailwind.config.cjs`

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}"
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
        h1: ["28px", { lineHeight: "1.3", fontWeight: "600" }],
        h2: ["22px", { lineHeight: "1.35", fontWeight: "600" }],
        h3: ["18px", { lineHeight: "1.5", fontWeight: "500" }],
        bodyLg: ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        body: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        label: ["12px", { lineHeight: "1.3", fontWeight: "500" }]
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
```

### 2.2 `postcss.config.cjs`

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
```

### 2.3 Global Tokens & Base

`src/styles/tokens.css`

```css
:root {
  --color-background-main: #D6F25F;
  --color-surface-primary: #FFFFFF;
  --color-surface-soft: #F9FAFB;

  --color-text-primary: #111111;
  --color-text-secondary: #555555;
  --color-text-muted: #9CA3AF;
  --color-text-on-accent: #FFFFFF;

  --color-accent-primary: #7B3EFF;
  --color-accent-primary-soft: #EDE7FF;
  --color-accent-secondary: #00C6AE;
  --color-accent-yellow: #FFB020;

  --color-border-subtle: #F0F0F0;
  --color-success: #10B981;
  --color-warning: #FBBF24;
  --color-danger: #EF4444;

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

  --radius-pill: 999px;
  --radius-card-lg: 28px;
  --radius-card-md: 20px;
  --radius-control: 999px;

  --shadow-card: 0 10px 25px 0 rgba(15, 23, 42, 0.06);
  --shadow-floating: 0 18px 40px 0 rgba(15, 23, 42, 0.10);
  --shadow-accent-soft: 0 8px 18px 0 rgba(123, 62, 255, 0.25);

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

  --motion-duration-fast: 120ms;
  --motion-duration-normal: 180ms;
  --motion-easing-standard: cubic-bezier(0.25, 0.8, 0.25, 1);

  --state-disabled-opacity: 0.4;
}
```

`src/styles/base.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html,
  body,
  #root {
    height: 100%;
  }

  body {
    margin: 0;
    padding: 0;
    background-color: var(--color-background-main);
    font-family: var(--font-family-primary);
  }
}
```

`src/index.css`

```css
@import "./styles/tokens.css";
@import "./styles/base.css";
```

---

## 3. Utilities

`src/lib/cn.ts`

```ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(...inputs));
}
```

---

## 4. UI Primitives

### 4.1 `Card`

`src/components/ui/card.tsx`

```tsx
import * as React from "react";
import { cn } from "../../lib/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "compact";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const padding =
      variant === "compact"
        ? "p-[var(--card-padding-compact)] rounded-card-md"
        : "p-[var(--card-padding-default)] rounded-card-lg";

    return (
      <div
        ref={ref}
        className={cn(
          "bg-surface-primary shadow-card flex flex-col",
          padding,
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";
```

### 4.2 `Button`

`src/components/ui/button.tsx`

```tsx
import * as React from "react";
import { cn } from "../../lib/cn";

type Variant = "primary" | "secondary" | "success" | "ghost";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const base =
  "inline-flex items-center justify-center rounded-pill px-5 py-2.5 text-label font-medium transition-fast ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary-soft focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent-primary text-text-on-accent shadow-[var(--shadow-accent-soft)] hover:bg-[#6B2FFF]",
  secondary:
    "bg-surface-primary text-text-primary border border-border-subtle hover:bg-surface-soft",
  success:
    "bg-semantic-success text-text-on-accent hover:bg-emerald-500",
  ghost:
    "bg-transparent text-text-primary hover:bg-surface-soft"
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

### 4.3 `Tag`

`src/components/ui/tag.tsx`

```tsx
import * as React from "react";
import { cn } from "../../lib/cn";

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

### 4.4 `Avatar` & `AvatarGroup`

`src/components/ui/avatar.tsx`

```tsx
import * as React from "react";
import { cn } from "../../lib/cn";

export interface AvatarProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "w-8 h-8",
  md: "w-9 h-9",
  lg: "w-16 h-16"
} as const;

export const Avatar = React.forwardRef<HTMLImageElement, AvatarProps>(
  ({ className, size = "md", ...props }, ref) => (
    <img
      ref={ref}
      className={cn(
        "rounded-full object-cover border-2 border-surface-primary",
        sizes[size],
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

### 4.5 `Toggle`

`src/components/ui/toggle.tsx`

```tsx
import * as React from "react";
import { cn } from "../../lib/cn";

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

### 4.6 `ProgressCircle`

`src/components/ui/progress-circle.tsx`

```tsx
import * as React from "react";

export interface ProgressCircleProps {
  value: number;
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
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
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

## 5. Composite Components (Key Cards)

To keep concise, I’ll include essential composites used in the style guide:

- `ProfileCard`
- `NotificationsCard`
- `IntegrationsCard`
- `BrandPillsCard`
- `CalendarCard`
- `MilestoneCard`
- `ProjectOverviewHeroCard`

You already saw versions earlier; here are streamlined versions.

### 5.1 `ProfileCard`

`src/components/composite/profile-card.tsx`

```tsx
import * as React from "react";
import { Card } from "../ui/card";
import { Avatar } from "../ui/avatar";
import { Tag } from "../ui/tag";

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
        className="flex h-[var(--size-icon-button)] w-[var(--size-icon-button)] items-center justify-center rounded-full text-text-secondary hover:bg-surface-soft transition-fast ease-standard"
        aria-label="More options"
      >
        &#8942;
      </button>
    </div>
    <div>
      <div className="text-h2 text-text-primary">{name}</div>
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

### 5.2 `NotificationsCard` (same as before, trimmed)

`src/components/composite/notifications-card.tsx`

```tsx
import * as React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Avatar } from "../ui/avatar";
import { cn } from "../../lib/cn";

type NotificationType = "invite" | "status-change" | "task-added" | "system";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  actorName?: string;
  actorAvatarSrc?: string;
  message: string;
  timestamp: string;
  unread?: boolean;
  hasActions?: boolean;
}

interface NotificationsCardProps {
  title?: string;
  items: NotificationItem[];
}

export const NotificationsCard: React.FC<NotificationsCardProps> = ({
  title = "Notifications",
  items
}) => {
  const unreadCount = items.filter((i) => i.unread).length;
  return (
    <Card className="gap-md">
      <div className="flex items-center justify-between">
        <h2 className="text-h2">{title}</h2>
        <div className="flex items-center gap-2">
          <span className="text-label text-text-muted">Unread</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-primary text-[10px] font-semibold text-text-on-accent">
            {unreadCount}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-sm">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-start gap-sm rounded-card-md px-3 py-2",
              item.unread && "bg-surface-soft"
            )}
          >
            <div className="mt-0.5">
              {item.actorAvatarSrc && item.type !== "system" ? (
                <Avatar
                  src={item.actorAvatarSrc}
                  alt={item.actorName ?? ""}
                  size="sm"
                />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-primary-soft text-[10px] text-accent-primary">
                  !
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-body">
                {item.actorName && item.type !== "system" && (
                  <span className="font-medium">{item.actorName}</span>
                )}{" "}
                {item.message}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-text-muted">
                  {item.timestamp}
                </span>
                {item.hasActions && (
                  <>
                    <Button
                      variant="success"
                      className="px-3 py-1 text-[11px]"
                    >
                      Accept
                    </Button>
                    <Button
                      variant="secondary"
                      className="px-3 py-1 text-[11px]"
                    >
                      Deny request
                    </Button>
                  </>
                )}
              </div>
            </div>
            <button
              className="mt-1 flex h-7 w-7 items-center justify-center rounded-full text-text-muted hover:bg-surface-soft"
              aria-label="More options"
            >
              &#8942;
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
};
```

### 5.3 `IntegrationsCard` and `BrandPillsCard`

Use the versions from previous messages (they are aligned). For brevity, keep them as-is.

### 5.4 `CalendarCard`

Use the earlier implementation with `ChevronLeft`/`ChevronRight` from `lucide-react`.

### 5.5 `MilestoneCard`

`src/components/composite/milestone-card.tsx`

```tsx
import * as React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { AvatarGroup } from "../ui/avatar";
import { ProgressCircle } from "../ui/progress-circle";

export interface MilestoneCardProps {
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

### 5.6 `ProjectOverviewHeroCard`

Use the previous definition (Amber hero).

---

## 6. Style Guide Layout

`src/components/layout/page-shell.tsx`

```tsx
import * as React from "react";
import { cn } from "../../lib/cn";

interface PageShellProps {
  children: React.ReactNode;
}

export const PageShell: React.FC<PageShellProps> = ({ children }) => (
  <div className="min-h-screen bg-background-main">
    <main
      className={cn(
        "mx-auto max-w-6xl p-page flex flex-col gap-xxl"
      )}
    >
      {children}
    </main>
  </div>
);
```

---

## 7. `StyleGuidePage` (Demo Screen)

`src/App.tsx`

```tsx
import "./index.css";
import { PageShell } from "./components/layout/page-shell";
import { Card } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Tag } from "./components/ui/tag";
import { Avatar, AvatarGroup } from "./components/ui/avatar";
import { Toggle } from "./components/ui/toggle";
import { ProgressCircle } from "./components/ui/progress-circle";
import { ProfileCard } from "./components/composite/profile-card";
import { NotificationsCard } from "./components/composite/notifications-card";
import { MilestoneCard } from "./components/composite/milestone-card";
import { ProjectOverviewHeroCard } from "./components/composite/project-overview-hero-card";
import { IntegrationsCard } from "./components/composite/integrations-card";
import { BrandPillsCard } from "./components/composite/brand-pills-card";
import { CalendarCard } from "./components/composite/calendar-card";

function App() {
  const avatars = [
    { src: "https://i.pravatar.cc/100?img=1", alt: "User 1" },
    { src: "https://i.pravatar.cc/100?img=2", alt: "User 2" },
    { src: "https://i.pravatar.cc/100?img=3", alt: "User 3" },
    { src: "https://i.pravatar.cc/100?img=4", alt: "User 4" }
  ];

  const notifications = [
    {
      id: "1",
      type: "invite",
      actorName: "Ashlynn George",
      actorAvatarSrc: avatars[0].src,
      message: 'has invited you to access "Magma project"',
      timestamp: "1h",
      unread: true,
      hasActions: true
    },
    {
      id: "2",
      type: "status-change",
      actorName: "Ashlynn George",
      actorAvatarSrc: avatars[0].src,
      message: 'changed status of task in "Magma project"',
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

  const brandPills = [
    { id: "stripe", label: "stripe" },
    { id: "visa", label: "VISA" },
    { id: "paypal", label: "paypal" },
    { id: "mastercard", label: "mastercard" }
  ];

  return (
    <PageShell>
      {/* Header */}
      <section className="flex flex-col gap-sm">
        <h1 className="text-h1 text-text-primary">
          LimeAura Design System
        </h1>
        <p className="text-bodyLg text-text-secondary max-w-2xl">
          This style guide showcases the components and visual language
          used in the LimeAura productivity dashboard: colors, type,
          layout, and key UI patterns.
        </p>
      </section>

      {/* Foundations: Colors, Type, Spacing */}
      <section className="grid gap-xxl md:grid-cols-3">
        <Card>
          <h2 className="text-h2 mb-md">Colors</h2>
          <div className="flex flex-col gap-sm">
            <ColorSwatch varName="Background Main" className="bg-background-main" />
            <ColorSwatch varName="Surface Primary" className="bg-surface-primary border border-border-subtle" />
            <ColorSwatch varName="Accent Primary" className="bg-accent-primary" />
            <ColorSwatch varName="Accent Primary Soft" className="bg-accent-primarySoft" />
            <ColorSwatch varName="Success" className="bg-semantic-success" />
            <ColorSwatch varName="Warning" className="bg-semantic-warning" />
            <ColorSwatch varName="Danger" className="bg-semantic-danger" />
          </div>
        </Card>

        <Card>
          <h2 className="text-h2 mb-md">Typography</h2>
          <div className="flex flex-col gap-sm">
            <div>
              <div className="text-h1">Heading H1</div>
              <div className="text-label text-text-muted">
                28px / 600
              </div>
            </div>
            <div>
              <div className="text-h2">Heading H2</div>
              <div className="text-label text-text-muted">
                22px / 600
              </div>
            </div>
            <div>
              <div className="text-h3">Heading H3</div>
              <div className="text-label text-text-muted">
                18px / 500
              </div>
            </div>
            <div>
              <div className="text-bodyLg">
                Body Large — for primary descriptions.
              </div>
            </div>
            <div>
              <div className="text-body">
                Body — for secondary text and metadata.
              </div>
            </div>
            <div>
              <div className="text-label uppercase">
                Label — small UI labels and badges.
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-h2 mb-md">Spacing & Radius</h2>
          <div className="flex flex-col gap-sm">
            <SpacingRow label="xxs (4px)" size={4} />
            <SpacingRow label="xs (6px)" size={6} />
            <SpacingRow label="sm (8px)" size={8} />
            <SpacingRow label="md (12px)" size={12} />
            <SpacingRow label="lg (16px)" size={16} />
            <SpacingRow label="xl (20px)" size={20} />
            <SpacingRow label="xxl (24px)" size={24} />
            <SpacingRow label="xxxl (32px)" size={32} />
          </div>
          <div className="mt-md flex items-center gap-md">
            <div className="w-12 h-12 bg-surface-soft rounded-card-md" />
            <div className="w-12 h-12 bg-surface-soft rounded-card-lg" />
            <div className="w-12 h-12 bg-surface-soft rounded-pill" />
          </div>
        </Card>
      </section>

      {/* Controls: Buttons, Tags, Avatars, Toggles, Progress */}
      <section className="grid gap-xxl md:grid-cols-3">
        <Card>
          <h2 className="text-h2 mb-md">Buttons</h2>
          <div className="flex flex-wrap gap-sm">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="success">Success</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-h2 mb-md">Tags & Avatars</h2>
          <div className="flex flex-wrap gap-sm mb-md">
            <Tag>UI/UX Design</Tag>
            <Tag>Project management</Tag>
            <Tag>Agile methodologies</Tag>
          </div>
          <div className="flex items-center gap-sm">
            <Avatar src={avatars[0].src} alt="A" size="sm" />
            <Avatar src={avatars[1].src} alt="B" size="md" />
            <Avatar src={avatars[2].src} alt="C" size="lg" />
            <AvatarGroup avatars={avatars} />
          </div>
        </Card>

        <Card>
          <h2 className="text-h2 mb-md">Toggle & Progress</h2>
          <div className="flex items-center gap-md mb-md">
            <Toggle checked={true} />
            <Toggle checked={false} />
          </div>
          <div className="flex items-center gap-md">
            <ProgressCircle value={39} />
            <ProgressCircle value={72} />
          </div>
        </Card>
      </section>

      {/* Cards & Patterns Preview */}
      <section className="flex flex-col gap-md">
        <h2 className="text-h2 text-text-primary">
          Card Patterns & Dashboard Mock
        </h2>
        <p className="text-body text-text-secondary max-w-3xl">
          Below is a mock dashboard composition using the same components:
          profile, notifications, calendar, project overview hero,
          milestones, and integrations.
        </p>
      </section>

      <section className="grid gap-xxl lg:grid-cols-[minmax(260px,280px)_minmax(320px,1.1fr)_minmax(320px,1.1fr)]">
        <div className="flex flex-col gap-xxl">
          <ProfileCard
            name="Christine Thompson"
            role="Project manager"
            avatarSrc={avatars[0].src}
            tags={[
              "UI/UX Design",
              "Project management",
              "Agile methodologies"
            ]}
          />
          <NotificationsCard items={notifications} />
        </div>

        <div className="flex flex-col gap-xxl">
          <CalendarCard />
          <MilestoneCard
            title="Wireframes milestone"
            dueDate="March 20th"
            progress={39}
            assignees={avatars}
          />
        </div>

        <div className="flex flex-col gap-xxl">
          <ProjectOverviewHeroCard
            title="Amber website redesign"
            description="In today’s fast-paced digital landscape, our mission is to transform our website into a more intuitive, engaging, and user-friendly platform."
            progress={43}
            avatars={avatars}
          />
        </div>
      </section>

      <section className="grid gap-xxl lg:grid-cols-[minmax(480px,2fr)_minmax(260px,1fr)]">
        <IntegrationsCard items={integrations} />
        <BrandPillsCard
          title="Supported payments"
          items={brandPills}
        />
      </section>
    </PageShell>
  );
}

function ColorSwatch({
  varName,
  className
}: {
  varName: string;
  className: string;
}) {
  return (
    <div className="flex items-center gap-sm">
      <div
        className={`h-8 w-8 rounded-card-md shadow-card ${className}`}
      />
      <span className="text-body text-text-secondary">
        {varName}
      </span>
    </div>
  );
}

function SpacingRow({
  label,
  size
}: {
  label: string;
  size: number;
}) {
  return (
    <div className="flex items-center gap-sm">
      <div
        className="bg-accent-primary/40 rounded-pill"
        style={{ width: size * 2, height: 4 }}
      />
      <span className="text-label text-text-secondary">
        {label}
      </span>
    </div>
  );
}

export default App;
```

`src/main.tsx`

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 8. Result

Running `npm run dev`:

- Shows a **single-page style guide** that:
  - Documents foundations.
  - Demonstrates every important component and pattern.
  - Includes a realistic mock dashboard composition built from those components.
- Mirrors the LimeAura aesthetic from your `design.json` and scales cleanly.

If you’d like, I can next:

- Extract this into Storybook stories per component.
- Add simple interaction state demos (hover/focus examples).
- Add a config-driven registry so new components auto-appear in the style guide.
