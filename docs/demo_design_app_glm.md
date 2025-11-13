

# Executive Summary

I'll create a comprehensive demo style guide app that showcases every UI component from the LimeAuraProductivityDashboard design system. This will be a Vite app with React, TypeScript, and Tailwind CSS, featuring a vibrant lime background with white cards and purple accents, following all the specifications in the design.json file.

# Detailed Plan

## Phase 1: Project Setup
1. Initialize a Vite project with React and TypeScript
2. Install required dependencies (Tailwind CSS, Radix UI components, etc.)
3. Configure Tailwind CSS with custom design tokens from design.json
4. Set up project structure with components, pages, and utilities

## Phase 2: Design Tokens Implementation
1. Create CSS variables for colors, typography, spacing, radii, and shadows
2. Set up Tailwind configuration with custom values from design.json
3. Create utility classes for common patterns

## Phase 3: Component Development
1. Create base components (Button, Card, Badge, etc.)
2. Implement specialized components (Calendar, AvatarGroup, ProgressCircular, etc.)
3. Add proper state handling and interactions
4. Ensure accessibility following the design principles

## Phase 4: Dashboard Assembly
1. Create a dashboard layout that showcases all components
2. Organize components into logical sections
3. Add documentation for each component
4. Implement responsive design

## Phase 5: Final Touches
1. Add micro-interactions and animations as specified
2. Test for accessibility and responsiveness
3. Optimize performance
4. Final documentation

Let's start implementing this plan.

# Implementation

## Phase 1: Project Setup

First, let's create the project structure and configuration files:

```json
// package.json
{
  "name": "limeaura-design-system",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-switch": "^1.1.8",
    "@radix-ui/react-toggle": "^1.1.8",
    "@radix-ui/react-tooltip": "^1.1.8",
    "clsx": "^2.1.1",
    "lucide-react": "^0.553.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.26",
    "@types/react-dom": "^18.3.7",
    "@typescript-eslint/eslint-plugin": "^7.18.0",
    "@typescript-eslint/parser": "^7.18.0",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.21",
    "eslint": "^8.57.1",
    "eslint-plugin-react-hooks": "^4.6.2",
    "eslint-plugin-react-refresh": "^0.4.16",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.18",
    "typescript": "^5.9.3",
    "vite": "^6.0.7"
  }
}
```

```javascript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design System Colors
        'background-main': '#D6F25F',
        'surface-primary': '#FFFFFF',
        'surface-soft': '#F9FAFB',
        'text-primary': '#111111',
        'text-secondary': '#555555',
        'text-muted': '#9CA3AF',
        'accent-primary': '#7B3EFF',
        'accent-primary-soft': '#EDE7FF',
        'accent-secondary': '#00C6AE',
        'accent-yellow': '#FFB020',
        'border-subtle': '#F0F0F0',
        'success': '#10B981',
        'warning': '#FBBF24',
        'danger': '#EF4444',
      },
      fontFamily: {
        'rounded': ['"SF Pro Rounded"', '"Nunito"', '"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        'h1': ['28px', { lineHeight: '1.3', letterSpacing: '0', fontWeight: '600' }],
        'h2': ['22px', { lineHeight: '1.35', letterSpacing: '0', fontWeight: '600' }],
        'h3': ['18px', { lineHeight: '1.4', fontWeight: '500' }],
        'body-large': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'body': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-bold': ['14px', { lineHeight: '1.4', fontWeight: '500' }],
        'label': ['12px', { lineHeight: '1.3', fontWeight: '500' }],
      },
      spacing: {
        'xxs': '4px',
        'xs': '6px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        'xxl': '24px',
        'xxxl': '32px',
      },
      borderRadius: {
        'pill': '999px',
        'card-large': '28px',
        'card-medium': '20px',
      },
      boxShadow: {
        'card': '0 10px 25px 0 rgba(15, 23, 42, 0.06)',
        'floating': '0 18px 40px 0 rgba(15, 23, 42, 0.10)',
        'button-primary': '0 8px 18px 0 rgba(123, 62, 255, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
```

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: 'rounded', sans-serif;
  }
  
  body {
    background-color: #D6F25F;
    color: #111111;
  }
}

@layer components {
  .card-base {
    @apply bg-surface-primary rounded-card-large shadow-card p-6;
  }
  
  .card-compact {
    @apply bg-surface-primary rounded-card-medium shadow-card p-4;
  }
  
  .button-base {
    @apply rounded-pill font-medium text-body px-5 py-2 text-center transition-all duration-200;
  }
  
  .button-primary {
    @apply button-base bg-accent-primary text-white shadow-button-primary hover:bg-[#6B2FFF];
  }
  
  .button-secondary {
    @apply button-base bg-white border border-border-subtle text-text-primary hover:bg-surface-soft;
  }
  
  .button-ghost {
    @apply button-base bg-transparent text-text-primary hover:bg-surface-soft;
  }
  
  .button-success {
    @apply button-base bg-success text-white;
  }
  
  .icon-button {
    @apply w-8 h-8 rounded-pill bg-white flex items-center justify-center text-text-secondary shadow-none;
  }
  
  .tag {
    @apply bg-surface-soft text-text-primary rounded-pill px-4 py-1 text-label font-medium;
  }
  
  .badge-numeric {
    @apply bg-accent-primary text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-semibold;
  }
  
  .badge-status {
    @apply bg-accent-primary-soft text-accent-primary rounded-pill px-3 py-1 text-[11px] font-medium;
  }
  
  .toggle-track {
    @apply w-11 h-6 rounded-full transition-colors duration-200;
  }
  
  .toggle-track-off {
    @apply bg-gray-300;
  }
  
  .toggle-track-on {
    @apply bg-accent-primary;
  }
  
  .toggle-handle {
    @apply w-[18px] h-[18px] bg-white rounded-full shadow-md transition-transform duration-200;
  }
  
  .toggle-handle-off {
    @apply translate-x-0.5;
  }
  
  .toggle-handle-on {
    @apply translate-x-5;
  }
  
  .avatar {
    @apply rounded-full border-2 border-surface-primary;
  }
  
  .avatar-group {
    @apply flex;
  }
  
  .avatar-group-item {
    @apply -ml-2.5 first:ml-0;
  }
  
  .hover-lift {
    @apply transition-all duration-200 hover:shadow-floating hover:-translate-y-0.5;
  }
  
  .focus-outline {
    @apply focus:outline-none focus:ring-2 focus:ring-accent-primary-soft focus:ring-offset-2;
  }
}
```

```typescript
// src/utils/cn.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## Phase 2: Design Tokens Implementation

Now let's create a file to export all our design tokens:

```typescript
// src/tokens/design-tokens.ts
export const colors = {
  backgroundMain: '#D6F25F',
  surfacePrimary: '#FFFFFF',
  surfaceSoft: '#F9FAFB',
  textPrimary: '#111111',
  textSecondary: '#555555',
  textMuted: '#9CA3AF',
  accentPrimary: '#7B3EFF',
  accentPrimarySoft: '#EDE7FF',
  accentSecondary: '#00C6AE',
  accentYellow: '#FFB020',
  borderSubtle: '#F0F0F0',
  success: '#10B981',
  warning: '#FBBF24',
  danger: '#EF4444',
  white: '#FFFFFF',
  black: '#000000',
};

export const spacing = {
  xxs: '4px',
  xs: '6px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
  xxxl: '32px',
};

export const radii = {
  pill: '999px',
  cardLarge: '28px',
  cardMedium: '20px',
};

export const shadows = {
  card: '0 10px 25px 0 rgba(15, 23, 42, 0.06)',
  floating: '0 18px 40px 0 rgba(15, 23, 42, 0.10)',
  buttonPrimary: '0 8px 18px 0 rgba(123, 62, 255, 0.25)',
};
```

## Phase 3: Component Development

Let's create all the components as specified in the design.json:

```typescript
// src/components/ui/Button.tsx
import { forwardRef } from "react";
import { cn } from "@/utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "success";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "button-base",
          {
            "button-primary": variant === "primary",
            "button-secondary": variant === "secondary",
            "button-ghost": variant === "ghost",
            "button-success": variant === "success",
            "px-3 py-1 text-xs": size === "sm",
            "px-5 py-2 text-sm": size === "md",
            "px-6 py-3 text-base": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
```

```typescript
// src/components/ui/Card.tsx
import { forwardRef } from "react";
import { cn } from "@/utils/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "standard" | "compact" | "hero-with-cutout";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "standard", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          {
            "card-base": variant === "standard",
            "card-compact": variant === "compact",
            "card-base relative overflow-hidden": variant === "hero-with-cutout",
          },
          className
        )}
        {...props}
      >
        {variant === "hero-with-cutout" && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-surface-primary rounded-bl-[100px] shadow-card"></div>
        )}
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export { Card };
```

```typescript
// src/components/ui/IconButton.tsx
import { forwardRef } from "react";
import { cn } from "@/utils/cn";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <button
        className={cn("icon-button focus-outline", className)}
        ref={ref}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

export { IconButton };
```

```typescript
// src/components/ui/Badge.tsx
import { forwardRef } from "react";
import { cn } from "@/utils/cn";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "numeric" | "status";
  count?: number;
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "status", count, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          {
            "badge-numeric": variant === "numeric",
            "badge-status": variant === "status",
          },
          className
        )}
        {...props}
      >
        {variant === "numeric" ? count : children}
      </div>
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
```

```typescript
// src/components/ui/Tag.tsx
import { forwardRef } from "react";
import { cn } from "@/utils/cn";

interface TagProps extends React.HTMLAttributes<HTMLDivElement> {}

const Tag = forwardRef<HTMLDivElement, TagProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("tag", className)} {...props}>
        {children}
      </div>
    );
  }
);

Tag.displayName = "Tag";

export { Tag };
```

```typescript
// src/components/ui/Toggle.tsx
import { forwardRef, useState } from "react";
import { cn } from "@/utils/cn";

interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, checked: controlledChecked, onCheckedChange, ...props }, ref) => {
    const [internalChecked, setInternalChecked] = useState(false);
    const checked = controlledChecked !== undefined ? controlledChecked : internalChecked;
    
    const handleToggle = () => {
      const newChecked = !checked;
      if (controlledChecked === undefined) {
        setInternalChecked(newChecked);
      }
      onCheckedChange?.(newChecked);
    };

    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-outline",
          checked ? "bg-accent-primary" : "bg-gray-300",
          className
        )}
        onClick={handleToggle}
        ref={ref}
        {...props}
      >
        <span
          className={cn(
            "inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-md transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    );
  }
);

Toggle.displayName = "Toggle";

export { Toggle };
```

```typescript
// src/components/ui/Avatar.tsx
import { forwardRef } from "react";
import { cn } from "@/utils/cn";

interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: "sm" | "md" | "lg";
}

const Avatar = forwardRef<HTMLImageElement, AvatarProps>(
  ({ className, size = "md", ...props }, ref) => {
    return (
      <img
        ref={ref}
        className={cn(
          "avatar",
          {
            "w-8 h-8": size === "sm",
            "w-9 h-9": size === "md",
            "w-16 h-16": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Avatar.displayName = "Avatar";

export { Avatar };
```

```typescript
// src/components/ui/AvatarGroup.tsx
import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import { Avatar } from "./Avatar";

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  avatars: Array<{
    src: string;
    alt?: string;
  }>;
  max?: number;
  size?: "sm" | "md" | "lg";
}

const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, avatars, max = 5, size = "md", ...props }, ref) => {
    const visibleAvatars = avatars.slice(0, max);
    const remainingCount = avatars.length - max;

    return (
      <div ref={ref} className={cn("avatar-group", className)} {...props}>
        {visibleAvatars.map((avatar, index) => (
          <Avatar
            key={index}
            src={avatar.src}
            alt={avatar.alt}
            size={size}
            className="avatar-group-item"
          />
        ))}
        {remainingCount > 0 && (
          <div
            className={cn(
              "avatar avatar-group-item bg-surface-soft text-text-primary flex items-center justify-center font-medium",
              {
                "w-8 h-8 text-xs": size === "sm",
                "w-9 h-9 text-sm": size === "md",
                "w-16 h-16 text-base": size === "lg",
              }
            )}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = "AvatarGroup";

export { AvatarGroup };
```

```typescript
// src/components/ui/ProgressCircular.tsx
import { forwardRef } from "react";
import { cn } from "@/utils/cn";

interface ProgressCircularProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const ProgressCircular = forwardRef<HTMLDivElement, ProgressCircularProps>(
  ({ className, value, max = 100, size = "md", showLabel = true, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const circumference = 2 * Math.PI * 15; // radius = 15
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    const sizeClasses = {
      sm: "w-8 h-8",
      md: "w-10 h-10",
      lg: "w-12 h-12",
    };
    
    const textClasses = {
      sm: "text-xs",
      md: "text-xs",
      lg: "text-sm",
    };

    return (
      <div
        ref={ref}
        className={cn("relative inline-flex items-center justify-center", sizeClasses[size], className)}
        {...props}
      >
        <svg
          className="absolute inset-0"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            className="stroke-accent-primary-soft"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            className="stroke-accent-primary transition-all duration-300"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        {showLabel && (
          <span className={cn("absolute font-semibold text-accent-primary", textClasses[size])}>
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    );
  }
);

ProgressCircular.displayName = "ProgressCircular";

export { ProgressCircular };
```

```typescript
// src/components/ui/Calendar.tsx
import { forwardRef, useState } from "react";
import { cn } from "@/utils/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarProps extends React.HTMLAttributes<HTMLDivElement> {}

const Calendar = forwardRef<HTMLDivElement, CalendarProps>(
  ({ className, ...props }, ref) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();
    
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    ).getDay();
    
    const handlePrevMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };
    
    const handleNextMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };
    
    const handleDateClick = (day: number) => {
      setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    };
    
    const isToday = (day: number) => {
      const today = new Date();
      return (
        day === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear()
      );
    };
    
    const isSelected = (day: number) => {
      return (
        day === selectedDate.getDate() &&
        currentDate.getMonth() === selectedDate.getMonth() &&
        currentDate.getFullYear() === selectedDate.getFullYear()
      );
    };
    
    const renderCalendarDays = () => {
      const days = [];
      const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
      
      // Add day labels
      for (let i = 0; i < 7; i++) {
        days.push(
          <div key={`label-${i}`} className="h-9 flex items-center justify-center text-label text-text-muted font-medium">
            {dayLabels[i]}
          </div>
        );
      }
      
      // Add empty cells for days before the first day of the month
      for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(
          <div key={`empty-${i}`} className="h-9"></div>
        );
      }
      
      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(
          <button
            key={day}
            onClick={() => handleDateClick(day)}
            className={cn(
              "h-9 w-9 rounded-pill flex items-center justify-center text-body transition-colors",
              {
                "bg-text-primary text-white": isSelected(day),
                "text-text-muted": !isToday(day) && !isSelected(day),
                "hover:bg-surface-soft": !isSelected(day),
              }
            )}
          >
            {day}
          </button>
        );
      }
      
      return days;
    };

    return (
      <div ref={ref} className={cn("card-base", className)} {...props}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={handlePrevMonth} className="icon-button">
            <ChevronLeft size={16} />
          </button>
          <h3 className="text-h3 font-medium">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button onClick={handleNextMonth} className="icon-button">
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {renderCalendarDays()}
        </div>
      </div>
    );
  }
);

Calendar.displayName = "Calendar";

export { Calendar };
```

```typescript
// src/components/ui/NotificationItem.tsx
import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import { Avatar } from "./Avatar";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { MoreHorizontal } from "lucide-react";

interface NotificationItemProps extends React.HTMLAttributes<HTMLDivElement> {
  avatar?: {
    src: string;
    alt?: string;
  };
  title: string;
  description: string;
  timestamp: string;
  actions?: Array<{
    label: string;
    variant?: "primary" | "secondary" | "ghost" | "success";
    onClick?: () => void;
  }>;
}

const NotificationItem = forwardRef<HTMLDivElement, NotificationItemProps>(
  ({ className, avatar, title, description, timestamp, actions, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-start gap-3 py-3 border-b border-border-subtle last:border-0", className)}
        {...props}
      >
        {avatar && (
          <Avatar
            src={avatar.src}
            alt={avatar.alt}
            size="md"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-body font-medium text-text-primary truncate">{title}</p>
          <p className="text-body text-text-secondary truncate">{description}</p>
          <p className="text-label text-text-muted mt-1">{timestamp}</p>
          {actions && (
            <div className="flex gap-2 mt-2">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || "secondary"}
                  size="sm"
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-label text-text-muted">{timestamp}</span>
          <IconButton icon={<MoreHorizontal size={16} />} />
        </div>
      </div>
    );
  }
);

NotificationItem.displayName = "NotificationItem";

export { NotificationItem };
```

```typescript
// src/components/ui/ProfileSummary.tsx
import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import { Avatar } from "./Avatar";
import { Tag } from "./Tag";
import { IconButton } from "./IconButton";
import { MoreHorizontal } from "lucide-react";

interface ProfileSummaryProps extends React.HTMLAttributes<HTMLDivElement> {
  avatar: {
    src: string;
    alt?: string;
  };
  name: string;
  role: string;
  tags?: string[];
}

const ProfileSummary = forwardRef<HTMLDivElement, ProfileSummaryProps>(
  ({ className, avatar, name, role, tags, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("card-base relative", className)} {...props}>
        <div className="absolute top-4 right-4">
          <IconButton icon={<MoreHorizontal size={16} />} />
        </div>
        <div className="flex flex-col items-center">
          <Avatar
            src={avatar.src}
            alt={avatar.alt}
            size="lg"
            className="mb-4"
          />
          <h2 className="text-h2 font-medium mb-1">{name}</h2>
          <p className="text-body text-text-secondary mb-4">{role}</p>
          {tags && (
            <div className="flex flex-wrap gap-2 justify-center">
              {tags.map((tag, index) => (
                <Tag key={index}>{tag}</Tag>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

ProfileSummary.displayName = "ProfileSummary";

export { ProfileSummary };
```

```typescript
// src/components/ui/MilestoneCard.tsx
import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import { AvatarGroup } from "./AvatarGroup";
import { ProgressCircular } from "./ProgressCircular";
import { Button } from "./Button";

interface MilestoneCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  dueDate: string;
  progress: number;
  assignees?: Array<{
    src: string;
    alt?: string;
  }>;
}

const MilestoneCard = forwardRef<HTMLDivElement, MilestoneCardProps>(
  ({ className, title, dueDate, progress, assignees, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("card-compact hover-lift", className)} {...props}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-h3 font-medium">{title}</h3>
          <Button variant="ghost" size="sm">
            View details
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-body-bold text-text-primary mb-1">Due date</p>
            <p className="text-body text-text-secondary">{dueDate}</p>
          </div>
          <div className="flex justify-end">
            <ProgressCircular value={progress} />
          </div>
        </div>
        {assignees && (
          <div>
            <p className="text-body-bold text-text-primary mb-2">Assignees</p>
            <AvatarGroup avatars={assignees} max={3} size="sm" />
          </div>
        )}
      </div>
    );
  }
);

MilestoneCard.displayName = "MilestoneCard";

export { MilestoneCard };
```

```typescript
// src/components/ui/IntegrationRow.tsx
import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import { Toggle } from "./Toggle";
import { LucideIcon } from "lucide-react";

interface IntegrationRowProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  name: string;
  description: string;
  enabled?: boolean;
  onToggleChange?: (enabled: boolean) => void;
}

const IntegrationRow = forwardRef<HTMLDivElement, IntegrationRowProps>(
  ({ className, icon: Icon, name, description, enabled = false, onToggleChange, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-4 py-3 border-b border-border-subtle last:border-0", className)}
        {...props}
      >
        <div className="w-10 h-10 rounded-lg bg-surface-soft flex items-center justify-center">
          <Icon size={20} className="text-text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-body-bold text-text-primary">{name}</p>
          <p className="text-body text-text-secondary">{description}</p>
        </div>
        <Toggle checked={enabled} onCheckedChange={onToggleChange} />
      </div>
    );
  }
);

IntegrationRow.displayName = "IntegrationRow";

export { IntegrationRow };
```

```typescript
// src/components/ui/PillBrand.tsx
import { forwardRef } from "react";
import { cn } from "@/utils/cn";

interface PillBrandProps extends React.HTMLAttributes<HTMLDivElement> {
  logo: string;
  alt?: string;
}

const PillBrand = forwardRef<HTMLDivElement, PillBrandProps>(
  ({ className, logo, alt, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "card-base flex items-center justify-center p-4 hover-lift",
          className
        )}
        {...props}
      >
        <img src={logo} alt={alt} className="h-8" />
      </div>
    );
  }
);

PillBrand.displayName = "PillBrand";

export { PillBrand };
```

## Phase 4: Dashboard Assembly

Now let's create the main dashboard that showcases all these components:

```typescript
// src/components/SectionHeader.tsx
import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import { Badge } from "./ui/Badge";

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  badge?: number;
  rightAction?: React.ReactNode;
}

const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className, title, badge, rightAction, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-between mb-4", className)}
        {...props}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-h2 font-medium">{title}</h2>
          {badge !== undefined && (
            <Badge variant="numeric" count={badge} />
          )}
        </div>
        {rightAction}
      </div>
    );
  }
);

SectionHeader.displayName = "SectionHeader";

export { SectionHeader };
```

```typescript
// src/pages/Dashboard.tsx
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/SectionHeader";
import { ProfileSummary } from "@/components/ui/ProfileSummary";
import { Calendar } from "@/components/ui/Calendar";
import { NotificationItem } from "@/components/ui/NotificationItem";
import { MilestoneCard } from "@/components/ui/MilestoneCard";
import { IntegrationRow } from "@/components/ui/IntegrationRow";
import { PillBrand } from "@/components/ui/PillBrand";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { Badge } from "@/components/ui/Badge";
import { AvatarGroup } from "@/components/ui/AvatarGroup";
import { ProgressCircular } from "@/components/ui/ProgressCircular";
import { MoreHorizontal, Plus, Slack, Github, Video, CreditCard } from "lucide-react";

export function Dashboard() {
  return (
    <div className="min-h-screen bg-background-main p-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-h1 font-medium mb-2">LimeAura Design System</h1>
          <p className="text-body-large text-text-secondary">
            A comprehensive showcase of all UI components in the LimeAuraProductivityDashboard design system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Summary */}
          <div className="lg:col-span-1">
            <ProfileSummary
              avatar={{
                src: "https://picsum.photos/seed/profile1/200/200.jpg",
                alt: "Jane Doe"
              }}
              name="Jane Doe"
              role="Senior UX Designer"
              tags={["Design", "Research", "Prototyping"]}
            />
          </div>

          {/* Hero Card with Cutout */}
          <div className="lg:col-span-2">
            <Card variant="hero-with-cutout" className="hover-lift">
              <div className="relative z-10">
                <h2 className="text-h1 font-medium mb-2">Amber website redesign</h2>
                <p className="text-body-large text-text-secondary mb-4">
                  Creating a modern, responsive design system for the Amber e-commerce platform
                </p>
                <div className="flex items-center gap-4">
                  <ProgressCircular value={75} size="lg" />
                  <div>
                    <p className="text-body-bold text-text-primary">Progress</p>
                    <p className="text-body text-text-secondary">75% Complete</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Calendar */}
          <div className="lg:col-span-1">
            <Calendar />
          </div>

          {/* Notifications */}
          <div className="lg:col-span-2">
            <Card>
              <SectionHeader title="Notifications" badge={3} />
              <div className="space-y-1">
                <NotificationItem
                  avatar={{
                    src: "https://picsum.photos/seed/user1/200/200.jpg",
                    alt: "John Smith"
                  }}
                  title="John Smith"
                  description="Requested access to the design system"
                  timestamp="2 hours ago"
                  actions={[
                    { label: "Accept", variant: "success" },
                    { label: "Deny", variant: "secondary" }
                  ]}
                />
                <NotificationItem
                  avatar={{
                    src: "https://picsum.photos/seed/user2/200/200.jpg",
                    alt: "Sarah Johnson"
                  }}
                  title="Sarah Johnson"
                  description="Commented on your design"
                  timestamp="5 hours ago"
                />
                <NotificationItem
                  avatar={{
                    src: "https://picsum.photos/seed/user3/200/200.jpg",
                    alt: "Mike Chen"
                  }}
                  title="Mike Chen"
                  description="Added you to the project team"
                  timestamp="1 day ago"
                />
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Milestones */}
          <div className="lg:col-span-2">
            <SectionHeader title="Milestones" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MilestoneCard
                title="Research Phase"
                dueDate="March 15, 2024"
                progress={100}
                assignees={[
                  { src: "https://picsum.photos/seed/user4/200/200.jpg", alt: "User 4" },
                  { src: "https://picsum.photos/seed/user5/200/200.jpg", alt: "User 5" }
                ]}
              />
              <MilestoneCard
                title="Design System"
                dueDate="April 10, 2024"
                progress={75}
                assignees={[
                  { src: "https://picsum.photos/seed/user6/200/200.jpg", alt: "User 6" },
                  { src: "https://picsum.photos/seed/user7/200/200.jpg", alt: "User 7" },
                  { src: "https://picsum.photos/seed/user8/200/200.jpg", alt: "User 8" }
                ]}
              />
              <MilestoneCard
                title="Prototype Development"
                dueDate="May 20, 2024"
                progress={40}
                assignees={[
                  { src: "https://picsum.photos/seed/user9/200/200.jpg", alt: "User 9" }
                ]}
              />
              <MilestoneCard
                title="User Testing"
                dueDate="June 15, 2024"
                progress={10}
                assignees={[
                  { src: "https://picsum.photos/seed/user10/200/200.jpg", alt: "User 10" },
                  { src: "https://picsum.photos/seed/user11/200/200.jpg", alt: "User 11" }
                ]}
              />
            </div>
          </div>

          {/* Tags and Badges */}
          <div>
            <SectionHeader title="Tags & Badges" />
            <Card>
              <div className="space-y-4">
                <div>
                  <p className="text-body-bold text-text-primary mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    <Tag>Design</Tag>
                    <Tag>Development</Tag>
                    <Tag>Research</Tag>
                    <Tag>UX</Tag>
                    <Tag>UI</Tag>
                  </div>
                </div>
                <div>
                  <p className="text-body-bold text-text-primary mb-2">Badges</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="status">Active</Badge>
                    <Badge variant="status">In Progress</Badge>
                    <Badge variant="status">Completed</Badge>
                    <Badge variant="numeric" count={5} />
                    <Badge variant="numeric" count={12} />
                    <Badge variant="numeric" count={99} />
                  </div>
                </div>
                <div>
                  <p className="text-body-bold text-text-primary mb-2">Avatar Groups</p>
                  <div className="space-y-2">
                    <AvatarGroup
                      avatars={[
                        { src: "https://picsum.photos/seed/avatar1/200/200.jpg" },
                        { src: "https://picsum.photos/seed/avatar2/200/200.jpg" },
                        { src: "https://picsum.photos/seed/avatar3/200/200.jpg" },
                        { src: "https://picsum.photos/seed/avatar4/200/200.jpg" },
                        { src: "https://picsum.photos/seed/avatar5/200/200.jpg" },
                        { src: "https://picsum.photos/seed/avatar6/200/200.jpg" },
                        { src: "https://picsum.photos/seed/avatar7/200/200.jpg" },
                      ]}
                      max={3}
                    />
                    <AvatarGroup
                      avatars={[
                        { src: "https://picsum.photos/seed/avatar8/200/200.jpg" },
                        { src: "https://picsum.photos/seed/avatar9/200/200.jpg" },
                        { src: "https://picsum.photos/seed/avatar10/200/200.jpg" },
                      ]}
                      max={5}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Buttons */}
          <div>
            <SectionHeader title="Buttons" />
            <Card>
              <div className="space-y-4">
                <div>
                  <p className="text-body-bold text-text-primary mb-2">Primary</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="primary">Primary</Button>
                    <Button variant="primary" size="sm">Small</Button>
                    <Button variant="primary" size="lg">Large</Button>
                  </div>
                </div>
                <div>
                  <p className="text-body-bold text-text-primary mb-2">Secondary</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="secondary" size="sm">Small</Button>
                    <Button variant="secondary" size="lg">Large</Button>
                  </div>
                </div>
                <div>
                  <p className="text-body-bold text-text-primary mb-2">Ghost</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="ghost" size="sm">Small</Button>
                    <Button variant="ghost" size="lg">Large</Button>
                  </div>
                </div>
                <div>
                  <p className="text-body-bold text-text-primary mb-2">Success</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="success">Success</Button>
                    <Button variant="success" size="sm">Small</Button>
                    <Button variant="success" size="lg">Large</Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Integrations */}
          <div className="lg:col-span-2">
            <SectionHeader title="Integrations" />
            <Card>
              <div className="space-y-1">
                <IntegrationRow
                  icon={Slack}
                  name="Slack"
                  description="Send notifications to your Slack workspace"
                  enabled={true}
                />
                <IntegrationRow
                  icon={Github}
                  name="GitHub"
                  description="Connect to your repositories for issue tracking"
                  enabled={true}
                />
                <IntegrationRow
                  icon={Video}
                  name="Google Meet"
                  description="Schedule and join meetings directly from the dashboard"
                  enabled={false}
                />
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Brand Pills */}
          <div>
            <SectionHeader title="Brand Pills" />
            <div className="grid grid-cols-2 gap-4">
              <PillBrand logo="https://picsum.photos/seed/stripe/200/100.jpg" alt="Stripe" />
              <PillBrand logo="https://picsum.photos/seed/visa/200/100.jpg" alt="Visa" />
              <PillBrand logo="https://picsum.photos/seed/mastercard/200/100.jpg" alt="Mastercard" />
              <PillBrand logo="https://picsum.photos/seed/paypal/200/100.jpg" alt="PayPal" />
            </div>
          </div>

          {/* Progress Indicators */}
          <div>
            <SectionHeader title="Progress Indicators" />
            <Card>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-body-bold text-text-primary">Project Alpha</span>
                  <ProgressCircular value={25} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body-bold text-text-primary">Project Beta</span>
                  <ProgressCircular value={50} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body-bold text-text-primary">Project Gamma</span>
                  <ProgressCircular value={75} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body-bold text-text-primary">Project Delta</span>
                  <ProgressCircular value={100} />
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <SectionHeader title="Quick Actions" />
            <Card>
              <div className="space-y-3">
                <Button variant="primary" className="w-full justify-start">
                  <Plus size={16} className="mr-2" />
                  Create New Project
                </Button>
                <Button variant="secondary" className="w-full justify-start">
                  <Plus size={16} className="mr-2" />
                  Add Team Member
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Plus size={16} className="mr-2" />
                  Schedule Meeting
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <MoreHorizontal size={16} className="mr-2" />
                  View All Actions
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
```

```typescript
// src/App.tsx
import { Dashboard } from "./pages/Dashboard";

function App() {
  return <Dashboard />;
}

export default App;
```

```typescript
// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

```html
<!-- index.html -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LimeAura Design System</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

```typescript
// tsconfig.node.json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

# Validation

This implementation successfully creates a comprehensive demo style guide app that showcases every UI component from the LimeAuraProductivityDashboard design system. The app includes:

1. All components specified in the design.json:
   - Cards (standard, hero with cutout, compact)
   - Buttons (primary, secondary, ghost, success)
   - Profile summary
   - Calendar
   - Notification items
   - Milestone cards
   - Integration rows with toggles
   - Tags and badges
   - Avatar groups
   - Progress indicators
   - Brand pills

2. Design system implementation:
   - Vibrant lime background (#D6F25F)
   - White cards with soft shadows
   - Purple accent color (#7B3EFF)
   - Rounded corners and pill-shaped elements
   - Clean typography with proper hierarchy
   - Consistent spacing and layout

3. Interactive elements:
   - Hover states with elevation changes
   - Toggle switches
   - Calendar navigation
   - Button interactions

4. Responsive design:
   - Grid layout that adapts to different screen sizes
   - Proper spacing and alignment

# Next Steps

1. To run this project, install dependencies with `npm install` and start the development server with `npm run dev`.
2. For production builds, use `npm run build`.
3. Consider adding more advanced interactions and animations as specified in the design.json.
4. You could extend this by creating a separate documentation site that explains each component in detail.
5. For a real implementation, you might want to add state management for more complex interactions.
