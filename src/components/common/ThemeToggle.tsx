import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
      return;
    }

    if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
      return;
    }

    // Dacă utilizatorul nu a ales încă o temă,
    // respectăm tema sistemului de operare/browserului.
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

    if (prefersDark) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;

    setIsDark(newIsDark);

    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Activează modul luminos' : 'Activează modul întunecat'}
      title={isDark ? 'Mod luminos' : 'Mod întunecat'}
      className="
        relative flex h-10 w-10 items-center justify-center
        rounded-full
        border border-slate-200
        bg-white
        text-slate-600
        shadow-sm
        transition-all duration-300
        hover:scale-105
        hover:bg-slate-50
        hover:text-brand-600
        dark:border-slate-700
        dark:bg-slate-800
        dark:text-slate-300
        dark:hover:bg-slate-700
        dark:hover:text-yellow-300
      "
    >
      <Sun
        className={`h-5 w-5 transition-all duration-300 ${
          isDark
            ? 'rotate-90 scale-0'
            : 'rotate-0 scale-100'
        }`}
      />

      <Moon
        className={`absolute h-5 w-5 transition-all duration-300 ${
          isDark
            ? 'rotate-0 scale-100'
            : '-rotate-90 scale-0'
        }`}
      />
    </button>
  );
}