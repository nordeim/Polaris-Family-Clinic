import { useState } from 'react';
import { Container, Group } from '@mantine/core';
import { UiButton } from '@/components/ui/button';

/**
 * PublicHeader
 *
 * Purpose:
 * - Mirror the static mockup header:
 *   - Brand mark + clinic name.
 *   - Top navigation (Home, Why Us, How It Works, For Seniors, Contact).
 *   - Primary CTA: Book Now.
 * - Provide a responsive mobile menu toggle (lightweight, React-based).
 *
 * Notes:
 * - Sections on the landing page should have matching IDs:
 *   - #hero, #why, #how, #seniors, #book, #contact
 * - For MVP we use simple in-page anchors; smooth scrolling can be handled
 *   by the browser or added via a small client-side enhancement later.
 */

const NAV_LINKS: { href: string; label: string }[] = [
  { href: '#hero', label: 'Home' },
  { href: '#why', label: 'Why Us' },
  { href: '#how', label: 'How It Works' },
  { href: '#seniors', label: 'For Seniors' },
  { href: '#contact', label: 'Contact' }
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen((prev) => !prev);
  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <Container size="lg" className="nav-container">
        {/* Left: Brand */}
        <div className="nav-left">
          <div className="brand-mark">G</div>
          <div className="brand">
            <div className="brand-title">Gabriel Family Clinic</div>
            <div className="brand-subtitle">Neighborhood-first care</div>
          </div>
        </div>

        {/* Desktop nav */}
        <nav
          className={
            'nav-links' + (open ? ' is-open' : '')
          }
          data-nav-menu
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="nav-link"
              onClick={close}
            >
              {link.label}
            </a>
          ))}

          <a
            href="#book"
            className="btn btn-primary btn-small nav-cta"
            onClick={close}
          >
            Book Now
          </a>
        </nav>

        {/* Mobile toggle */}
        <button
          className="nav-toggle"
          aria-label="Toggle navigation"
          aria-expanded={open ? 'true' : 'false'}
          data-nav-toggle
          onClick={toggle}
        >
          <span />
          <span />
          <span />
        </button>

        {/* Right-side inline CTAs for larger screens (linking to real app routes) */}
        <Group gap="xs" visibleFrom="lg">
          <UiButton href="/book" variant="outline" size="sm">
            Book
          </UiButton>
          <UiButton href="/profile" variant="ghost" size="sm">
            My Profile
          </UiButton>
          <UiButton href="/staff/appointments" variant="subtle" size="sm">
            Staff Portal
          </UiButton>
        </Group>
      </Container>
    </header>
  );
}