import { useEffect, useState } from 'react';
import styles from './AdaptiveChrome.module.css';

export type ThemeMode = 'dark' | 'light';
export type NavLayoutMode = 'top' | 'sidebar' | 'mobile';

interface AdaptiveChromeProps {
  theme: ThemeMode;
  onThemeChange: (next: ThemeMode) => void;
  onLayoutModeChange?: (mode: NavLayoutMode) => void;
}

/**
 * Tania Rascia's actual navigation destinations, rendered in whichever layout
 * fits the current viewport without cramping or duplication:
 * - >= 1080px: 109ichiki compact top pill navigation
 * - 768px..1079px: Tania Rascia's left sidebar inside the thin outer frame
 * - < 768px: Compact mobile top bar + collapsible drawer
 */
const NAV_ITEMS = [
  { id: 'home', label: 'Home', href: '#top', active: true },
  { id: 'blog', label: 'Blog', href: '#latest', active: false },
  { id: 'shelves', label: 'Shelves', href: '#shelves', active: false },
  { id: 'projects', label: 'Projects', href: '#projects', active: false },
  { id: 'about', label: 'About me', href: '#about', active: false },
] as const;

function getLayoutMode(width: number): NavLayoutMode {
  if (width >= 1080) return 'top';
  if (width >= 768) return 'sidebar';
  return 'mobile';
}

export function AdaptiveChrome({ theme, onThemeChange, onLayoutModeChange }: AdaptiveChromeProps) {
  const [mode, setMode] = useState<NavLayoutMode>(() =>
    typeof window !== 'undefined' ? getLayoutMode(window.innerWidth) : 'top'
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      const next = getLayoutMode(window.innerWidth);
      setMode(next);
      onLayoutModeChange?.(next);
      if (next !== 'mobile') setDrawerOpen(false);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [onLayoutModeChange]);

  return (
    <>
      {/* Top-right corner bar outside the thin rounded outer frame */}
      <div className={styles.topCornerStrip}>
        <div className={styles.themeDots} role="group" aria-label="Color theme">
          <button
            type="button"
            className={`${styles.themeDot} ${styles.themeDotLight}`}
            data-active={theme === 'light'}
            onClick={() => onThemeChange('light')}
            aria-label="Switch to light mode"
            title="Light mode"
          />
          <button
            type="button"
            className={`${styles.themeDot} ${styles.themeDotDark}`}
            data-active={theme === 'dark'}
            onClick={() => onThemeChange('dark')}
            aria-label="Switch to dark mode"
            title="Dark mode"
          />
        </div>
        <span className={styles.cornerMode} aria-hidden="true">
          {theme === 'dark' ? 'DARK' : 'LIGHT'}
        </span>
      </div>

      {/* Fixed thin rounded outer viewport frame (109ichiki) */}
      <div className={styles.outerFrame} aria-hidden="true" />

      {/* LAYOUT A (>= 1080px): 109ichiki compact top pill navigation */}
      {mode === 'top' && (
        <header className={styles.topHeader}>
          <a href="#top" className={styles.logo} aria-label="Akshat home">
            <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="0.75" y="0.75" width="34.5" height="34.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 26L14.5 10H17.5L24 26H20.8L19.4 22.2H12.6L11.2 26H8ZM13.6 19.4H18.4L16 12.9L13.6 19.4Z" fill="currentColor" />
              <rect x="25.5" y="22.5" width="3.5" height="3.5" fill="var(--color-accent)" />
            </svg>
          </a>

          <nav className={styles.navPill} aria-label="Primary navigation">
            <ul className={styles.navList}>
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    className={`${styles.navLink} ${item.active ? styles.navLinkActive : ''}`}
                    aria-current={item.active ? 'page' : undefined}
                    onClick={(e) => {
                      if (!item.active) e.preventDefault();
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <ul className={styles.socialPills}>
            <li>
              <a
                href="#github"
                onClick={(e) => e.preventDefault()}
                className={styles.socialPill}
                aria-disabled="true"
              >
                <span>GitHub</span>
                <span className={styles.arrow} aria-hidden="true">&#8599;</span>
              </a>
            </li>
            <li>
              <a
                href="#twitter"
                onClick={(e) => e.preventDefault()}
                className={styles.socialPill}
                aria-disabled="true"
              >
                <span>Twitter</span>
                <span className={styles.arrow} aria-hidden="true">&#8599;</span>
              </a>
            </li>
          </ul>
        </header>
      )}

      {/* LAYOUT B (768px..1079px): Tania Rascia left sidebar inside the outer frame */}
      {mode === 'sidebar' && (
        <aside className={styles.sidebar} aria-label="Primary sidebar navigation">
          <div className={styles.sidebarTop}>
            <div className={styles.sidebarSection}>
              <a href="#top" className={styles.sidebarBrand}>
                <span className={styles.brandSquare} aria-hidden="true" />
                <span className={styles.brandName}>akshat</span>
              </a>
              <p className={styles.sidebarBio}>
                I&apos;m Akshat, a software developer sharing projects, notes, and experiments.
              </p>
            </div>

            <nav className={styles.sidebarSection} aria-label="Primary navigation">
              <ul className={styles.sidebarList}>
                {NAV_ITEMS.map((item) => (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      className={`${styles.sidebarLink} ${item.active ? styles.sidebarLinkActive : ''}`}
                      aria-current={item.active ? 'page' : undefined}
                      onClick={(e) => {
                        if (!item.active) e.preventDefault();
                      }}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className={styles.sidebarBottom}>
            <a href="#resume" onClick={(e) => e.preventDefault()} aria-disabled="true" className="link-ui">
              Resume
            </a>
            <span className={styles.divider} aria-hidden="true" />
            <a href="#topics" onClick={(e) => e.preventDefault()} aria-disabled="true" className="link-ui">
              Topics
            </a>
            <span className={styles.divider} aria-hidden="true" />
            <a href="#source" onClick={(e) => e.preventDefault()} aria-disabled="true" className="link-ui">
              Source
            </a>
          </div>
        </aside>
      )}

      {/* LAYOUT C (< 768px): Compact mobile header + collapsible drawer */}
      {mode === 'mobile' && (
        <>
          <header className={styles.mobileHeader}>
            <a href="#top" className={styles.sidebarBrand}>
              <span className={styles.brandSquare} aria-hidden="true" />
              <span className={styles.brandName}>akshat</span>
            </a>

            <button
              type="button"
              className={styles.menuButton}
              aria-expanded={drawerOpen}
              aria-controls="mobile-nav"
              aria-label={drawerOpen ? 'Close navigation' : 'Open navigation'}
              onClick={() => setDrawerOpen((prev) => !prev)}
            >
              <span className={styles.menuBar} />
              <span className={styles.menuBar} />
            </button>
          </header>

          {drawerOpen && (
            <nav id="mobile-nav" className={styles.mobileDrawer} aria-label="Mobile navigation">
              <ul className={styles.sidebarList}>
                {NAV_ITEMS.map((item) => (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      className={`${styles.sidebarLink} ${item.active ? styles.sidebarLinkActive : ''}`}
                      aria-current={item.active ? 'page' : undefined}
                      onClick={(e) => {
                        if (!item.active) e.preventDefault();
                        setDrawerOpen(false);
                      }}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </>
      )}
    </>
  );
}
