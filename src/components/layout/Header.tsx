import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Plane, Search } from 'lucide-react';
import ThemeToggle from '@/components/common/ThemeToggle';

const NAV_LINKS = [
  { to: '/', label: 'Acasă' },
  { to: '/oferte', label: 'Oferte' },
  { to: '/alerte', label: 'Alerte' },
  { to: '/despre', label: 'Despre noi' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0"
            onClick={() => setMobileOpen(false)}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Plane className="h-5 w-5" />
            </span>

            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white transition-colors">
              Vacanța Mea
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-brand-700 bg-brand-50 dark:text-brand-300 dark:bg-brand-950/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* CTA + Theme toggle + mobile toggle */}
          <div className="flex items-center gap-2">

            {/* CTA */}
            <button
              onClick={() => navigate('/oferte')}
              className="hidden sm:inline-flex btn-primary text-sm px-4 py-2.5"
            >
              <Search className="h-4 w-4" />
              Găsește-mi vacanța
            </button>

            {/* Dark mode */}
            <ThemeToggle />

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Meniu"
            >
              {mobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 animate-fade-in transition-colors duration-300">

          <nav className="container-page py-3 flex flex-col gap-1">

            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-brand-700 bg-brand-50 dark:text-brand-300 dark:bg-brand-950/60'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {/* Mobile theme toggle */}
            <div className="flex items-center justify-between px-4 py-3 mt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Temă site
              </span>

              <ThemeToggle />
            </div>

            {/* Mobile CTA */}
            <button
              onClick={() => {
                setMobileOpen(false);
                navigate('/oferte');
              }}
              className="btn-primary mt-2"
            >
              <Search className="h-4 w-4" />
              Găsește-mi vacanța
            </button>

          </nav>
        </div>
      )}
    </header>
  );
}