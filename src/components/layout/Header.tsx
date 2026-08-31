import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Plane, Search, BedDouble, Luggage, Car, Ticket, CarTaxiFront, Zap, BookOpen } from 'lucide-react';
import ThemeToggle from '@/components/common/ThemeToggle';

// The first 6 mirror Booking.com's own tab bar exactly (name + icon), since
// that's the reference the person asked us to match. Last minute and
// Ghiduri are genuine features Booking doesn't have, so they're appended
// after a visual divider rather than dropped.
const NAV_LINKS = [
  { to: '/cazari', label: 'Sejururi', icon: BedDouble },
  { to: '/bilete', label: 'Zboruri', icon: Plane },
  { to: '/zbor-hotel', label: 'Zbor + Hotel', icon: Luggage },
  { to: '/rent-a-car', label: 'Închirieri auto', icon: Car },
  { to: '/atractii', label: 'Atracții', icon: Ticket },
  { to: '/taxiuri-aeroport', label: 'Taxiuri aeroport', icon: CarTaxiFront },
];

const EXTRA_LINKS = [
  { to: '/last-minute', label: 'Last minute', icon: Zap },
  { to: '/ghiduri', label: 'Ghiduri', icon: BookOpen },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-navy-600 dark:bg-navy-900 border-b border-navy-700/50 dark:border-navy-800 transition-colors duration-300">
      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0"
            onClick={() => setMobileOpen(false)}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-navy-700">
              <Plane className="h-5 w-5" />
            </span>

            <span className="text-lg font-extrabold tracking-tight text-white transition-colors">
              Vacanța Mea
            </span>
          </Link>

          {/* Dark mode + mobile toggle (desktop nav row is the tab strip below) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/oferte')}
              className="hidden sm:inline-flex btn bg-cta-500 text-white hover:bg-cta-400 focus:ring-cta-500 shadow-sm hover:shadow-md px-4 py-2.5 text-sm"
            >
              <Search className="h-4 w-4" />
              Găsește-mi vacanța
            </button>

            <ThemeToggle />

            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Meniu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Booking.com-style icon tab strip (desktop only) */}
        <nav className="hidden md:flex items-center gap-1 pb-3 -mt-1 overflow-x-auto">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-white text-navy-700'
                      : 'text-navy-100 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </NavLink>
            );
          })}

          <span className="mx-1 h-6 w-px bg-white/20 shrink-0" />

          {EXTRA_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-white text-navy-700'
                      : 'text-navy-100 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-navy-700/50 bg-navy-600 dark:bg-navy-900 animate-fade-in transition-colors duration-300">
          <nav className="container-page py-3 flex flex-col gap-1">
            {[...NAV_LINKS, ...EXTRA_LINKS].map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                      isActive
                        ? 'text-white bg-white/15'
                        : 'text-navy-100 hover:bg-white/10'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </NavLink>
              );
            })}

            <div className="flex items-center justify-between px-4 py-3 mt-1 border-t border-navy-700/50">
              <span className="text-sm font-semibold text-navy-100">Temă site</span>
              <ThemeToggle />
            </div>

            <button
              onClick={() => { setMobileOpen(false); navigate('/oferte'); }}
              className="btn bg-cta-500 text-white hover:bg-cta-400 focus:ring-cta-500 mt-2 w-full"
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
