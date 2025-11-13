## 1. Executive Summary

I will create a `tokens.json` that extracts the **pure design tokens** from `design.json` into a clean, implementation-friendly structure:

- No component semantics.
- Only foundational, reusable tokens: color, typography, spacing, radii, shadows, borders, sizing, motion.
- Namespaced and consistent, suitable for design systems, CSS vars, or design token pipelines.

Plan first, then deliver the JSON.

---

## 2. Detailed Plan

### 2.1 Objectives

- Provide a **single source of truth** for all base styles referenced in `design.json`.
- Ensure:
  - Clear naming conventions.
  - Easy mapping to platforms (web, iOS, Android).
  - Compatibility with common token standards (e.g., W3C/Design Tokens Community Group style).

### 2.2 Scope

Include tokens for:

1. `color`
2. `font` (families)
3. `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`
4. `radius`
5. `spacing`
6. `shadow`
7. `border`
8. `size` (icon, avatar, control)
9. `motion` (basic transitions)

No component-specific structures (e.g., no `calendar`, `notificationItem`); only primitives and semantic global tokens.

### 2.3 Naming Strategy

- Use **category.semantic.state/scale** pattern.
- Examples:
  - `color.background.main`
  - `color.surface.primary`
  - `color.text.primary`
  - `radius.card.lg`
  - `spacing.lg`
  - `font.size.h2`
- Values:
  - Raw primitives (hex, px, etc.) in `value`.
  - Descriptions where helpful.

### 2.4 Validation Criteria

`tokens.json` is acceptable if:

- All core visual decisions from `design.json` are present as reusable tokens.
- No duplication of full component specs.
- Names are consistent and machine-usable.

Proceeding to `tokens.json`.

---

## 3. `tokens.json`

```json
{
  "$schema": "https://design-tokens.org/schema.json",
  "meta": {
    "name": "LimeAuraProductivityDashboardTokens",
    "version": "1.0.0",
    "description": "Foundational design tokens for the LimeAura Productivity Dashboard visual system. Strictly primitives and semantic tokens, suitable for multi-platform implementation."
  },
  "color": {
    "background": {
      "main": {
        "value": "#D6F25F",
        "type": "color",
        "description": "Primary page background; vibrant lime-yellow canvas."
      }
    },
    "surface": {
      "primary": {
        "value": "#FFFFFF",
        "type": "color",
        "description": "Main card and content surface."
      },
      "soft": {
        "value": "#F9FAFB",
        "type": "color",
        "description": "Subtle internal surfaces for inputs, secondary areas."
      }
    },
    "text": {
      "primary": {
        "value": "#111111",
        "type": "color",
        "description": "Primary text on light surfaces."
      },
      "secondary": {
        "value": "#555555",
        "type": "color",
        "description": "Secondary descriptive text."
      },
      "muted": {
        "value": "#9CA3AF",
        "type": "color",
        "description": "Metadata, timestamps, helper text."
      },
      "onAccent": {
        "value": "#FFFFFF",
        "type": "color",
        "description": "Text color on primary accent backgrounds."
      }
    },
    "accent": {
      "primary": {
        "value": "#7B3EFF",
        "type": "color",
        "description": "Core accent (purple) for key interactive and quantitative elements."
      },
      "primarySoft": {
        "value": "#EDE7FF",
        "type": "color",
        "description": "Soft purple used as accent track/background."
      },
      "secondary": {
        "value": "#00C6AE",
        "type": "color",
        "description": "Optional teal accent for confirmations or variety."
      },
      "yellow": {
        "value": "#FFB020",
        "type": "color",
        "description": "Warm accent for subtle highlights."
      }
    },
    "border": {
      "subtle": {
        "value": "#F0F0F0",
        "type": "color",
        "description": "Very light border/divider on white surfaces."
      }
    },
    "semantic": {
      "success": {
        "value": "#10B981",
        "type": "color",
        "description": "Positive actions and states."
      },
      "warning": {
        "value": "#FBBF24",
        "type": "color",
        "description": "Non-critical warnings and attention states."
      },
      "danger": {
        "value": "#EF4444",
        "type": "color",
        "description": "Critical/destructive actions."
      }
    },
    "common": {
      "white": {
        "value": "#FFFFFF",
        "type": "color"
      },
      "black": {
        "value": "#000000",
        "type": "color"
      }
    }
  },
  "font": {
    "family": {
      "primary": {
        "value": "'SF Pro Rounded', 'Nunito', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        "type": "fontFamily",
        "description": "Rounded/soft geometric sans-serif for all text."
      }
    },
    "size": {
      "h1": {
        "value": "28px",
        "type": "fontSize"
      },
      "h2": {
        "value": "22px",
        "type": "fontSize"
      },
      "h3": {
        "value": "18px",
        "type": "fontSize"
      },
      "bodyLg": {
        "value": "16px",
        "type": "fontSize"
      },
      "body": {
        "value": "14px",
        "type": "fontSize"
      },
      "label": {
        "value": "12px",
        "type": "fontSize"
      }
    },
    "weight": {
      "regular": {
        "value": 400,
        "type": "fontWeight"
      },
      "medium": {
        "value": 500,
        "type": "fontWeight"
      },
      "semibold": {
        "value": 600,
        "type": "fontWeight"
      }
    },
    "lineHeight": {
      "tight": {
        "value": 1.3,
        "type": "lineHeight"
      },
      "snug": {
        "value": 1.35,
        "type": "lineHeight"
      },
      "normal": {
        "value": 1.5,
        "type": "lineHeight"
      }
    },
    "letterSpacing": {
      "default": {
        "value": "0em",
        "type": "letterSpacing"
      }
    }
  },
  "spacing": {
    "xxs": {
      "value": "4px",
      "type": "spacing"
    },
    "xs": {
      "value": "6px",
      "type": "spacing"
    },
    "sm": {
      "value": "8px",
      "type": "spacing"
    },
    "md": {
      "value": "12px",
      "type": "spacing"
    },
    "lg": {
      "value": "16px",
      "type": "spacing"
    },
    "xl": {
      "value": "20px",
      "type": "spacing"
    },
    "xxl": {
      "value": "24px",
      "type": "spacing"
    },
    "xxxl": {
      "value": "32px",
      "type": "spacing"
    },
    "pagePadding": {
      "value": "40px",
      "type": "spacing",
      "description": "Recommended outer padding for main layout."
    },
    "cardPadding.default": {
      "value": "24px",
      "type": "spacing",
      "description": "Default internal padding for primary cards."
    },
    "cardPadding.compact": {
      "value": "16px",
      "type": "spacing",
      "description": "Internal padding for compact cards/rows."
    }
  },
  "radius": {
    "pill": {
      "value": "999px",
      "type": "borderRadius",
      "description": "Fully rounded; use for buttons, chips, toggles, avatars."
    },
    "card.lg": {
      "value": "28px",
      "type": "borderRadius",
      "description": "Large cards and hero surfaces."
    },
    "card.md": {
      "value": "20px",
      "type": "borderRadius",
      "description": "Standard cards and list containers."
    },
    "control": {
      "value": "999px",
      "type": "borderRadius",
      "description": "Small interactive elements that should appear pill-shaped."
    }
  },
  "shadow": {
    "none": {
      "value": "none",
      "type": "boxShadow"
    },
    "card": {
      "value": "0 10px 25px 0 rgba(15, 23, 42, 0.06)",
      "type": "boxShadow",
      "description": "Default elevation for white cards."
    },
    "floating": {
      "value": "0 18px 40px 0 rgba(15, 23, 42, 0.10)",
      "type": "boxShadow",
      "description": "Higher elevation for emphasized elements on hover or hero cards."
    },
    "accentSoft": {
      "value": "0 8px 18px 0 rgba(123, 62, 255, 0.25)",
      "type": "boxShadow",
      "description": "Soft accent shadow for primary buttons if needed."
    }
  },
  "border": {
    "width": {
      "none": {
        "value": "0px",
        "type": "borderWidth"
      },
      "hairline": {
        "value": "1px",
        "type": "borderWidth"
      },
      "focus": {
        "value": "2px",
        "type": "borderWidth"
      }
    },
    "color": {
      "subtle": {
        "value": "{color.border.subtle.value}",
        "type": "color"
      }
    }
  },
  "size": {
    "icon": {
      "sm": {
        "value": "16px",
        "type": "dimension"
      },
      "md": {
        "value": "20px",
        "type": "dimension"
      },
      "lg": {
        "value": "24px",
        "type": "dimension"
      }
    },
    "avatar": {
      "sm": {
        "value": "32px",
        "type": "dimension"
      },
      "md": {
        "value": "36px",
        "type": "dimension"
      },
      "lg": {
        "value": "64px",
        "type": "dimension"
      }
    },
    "control": {
      "toggle.width": {
        "value": "44px",
        "type": "dimension"
      },
      "toggle.height": {
        "value": "24px",
        "type": "dimension"
      },
      "toggle.handle": {
        "value": "18px",
        "type": "dimension"
      },
      "iconButton": {
        "value": "32px",
        "type": "dimension"
      },
      "progressCircular": {
        "value": "40px",
        "type": "dimension"
      },
      "calendarDay": {
        "value": "36px",
        "type": "dimension"
      }
    }
  },
  "motion": {
    "duration": {
      "fast": {
        "value": "120ms",
        "type": "duration"
      },
      "normal": {
        "value": "180ms",
        "type": "duration"
      }
    },
    "easing": {
      "standard": {
        "value": "cubic-bezier(0.25, 0.8, 0.25, 1)",
        "type": "cubicBezier"
      }
    }
  },
  "state": {
    "focus": {
      "outlineWidth": {
        "value": "{border.width.focus.value}",
        "type": "borderWidth"
      },
      "outlineColor": {
        "value": "{color.accent.primarySoft.value}",
        "type": "color"
      },
      "outlineOffset": {
        "value": "2px",
        "type": "dimension"
      }
    },
    "hover": {
      "card.shadow": {
        "value": "{shadow.floating.value}",
        "type": "boxShadow"
      },
      "button.primary.background": {
        "value": "#6B2FFF",
        "type": "color"
      },
      "button.secondary.background": {
        "value": "#F9FAFB",
        "type": "color"
      }
    },
    "disabled": {
      "opacity": {
        "value": 0.4,
        "type": "opacity"
      }
    }
  }
}
```

---

## 4. Validation

- [x] Strictly tokens: no full component blueprints.
- [x] Covers color, type, spacing, radius, shadow, border, sizing, motion, and state.
- [x] Namespaced and implementation-ready; aligns with `design.json`.

---

## 5. Next Steps

If you’d like, I can:

- Generate:
  - CSS variables / Tailwind config derived from `tokens.json`.
  - A minimal mapping guide: `design.json` components → these tokens.
- Or adapt tokens to a specific platform (Figma styles, Android XML, iOS SwiftUI).
