import { Link } from 'react-router-dom';
import { Plane, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer mt-20 border-t border-navy-700/50 bg-navy-700 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950">
      <div className="container-page py-12">
        <div className="grid gap-8 md:grid-cols-4">

          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-navy-700 shadow-sm">
                <Plane className="h-5 w-5" />
              </span>

              <span className="text-lg font-extrabold tracking-tight text-white">
                Vacanța Mea
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-navy-200 dark:text-slate-400">
              Platformă românească care te ajută să găsești vacanța potrivită
              în funcție de buget, perioadă și preferințele tale.
            </p>
          </div>

          {/* Navigare */}
          <div>
            <h4 className="mb-3 text-sm font-bold text-white">
              Navigare
            </h4>

            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-navy-200 transition-colors hover:text-white dark:text-slate-400 dark:hover:text-brand-400"
                >
                  Acasă
                </Link>
              </li>

              <li>
                <Link
                  to="/oferte"
                  className="text-navy-200 transition-colors hover:text-white dark:text-slate-400 dark:hover:text-brand-400"
                >
                  Oferte
                </Link>
              </li>

              <li>
                <Link
                  to="/alerte"
                  className="text-navy-200 transition-colors hover:text-white dark:text-slate-400 dark:hover:text-brand-400"
                >
                  Alerte
                </Link>
              </li>

              <li>
                <Link
                  to="/despre"
                  className="text-navy-200 transition-colors hover:text-white dark:text-slate-400 dark:hover:text-brand-400"
                >
                  Despre noi
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="text-navy-200 transition-colors hover:text-white dark:text-slate-400 dark:hover:text-brand-400"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-3 text-sm font-bold text-white">
              Contact
            </h4>

            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-navy-200 dark:text-slate-400">
                <Mail className="h-4 w-4 shrink-0" />
                contact@vacantamea.ro
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 flex flex-col justify-between gap-3 border-t border-navy-600/60 pt-6 text-xs text-navy-300 dark:border-slate-800 dark:text-slate-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} Vacanța Mea. Toate drepturile rezervate.
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link to="/confidentialitate" className="hover:text-white">Confidențialitate</Link>
            <Link to="/cookies" className="hover:text-white">Cookies</Link>
            <Link to="/afiliere" className="hover:text-white">Afiliere</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}