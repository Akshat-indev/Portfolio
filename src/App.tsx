import { useEffect, useState } from 'react';
import { AdaptiveChrome, type NavLayoutMode, type ThemeMode } from './components/Layout/AdaptiveChrome';
import { HomepageHero } from './components/Hero/HomepageHero';
import styles from './App.module.css';

export function App() {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [navMode, setNavMode] = useState<NavLayoutMode>('top');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className={styles.viewportShell}>
      <AdaptiveChrome
        theme={theme}
        onThemeChange={setTheme}
        onLayoutModeChange={setNavMode}
      />
      <main className={styles.framedContent} data-nav-mode={navMode}>
        <HomepageHero theme={theme} />
      </main>
    </div>
  );
}

export default App;
