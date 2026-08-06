import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, PlusCircle, Bell, Menu, X, Plane, LogOut, ArrowLeft } from 'lucide-react';
import { signOut } from '@/lib/auth';
import { showToast } from '@/components/common/Toast';

const ADMIN_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/oferte', label: 'Oferte', icon: FileText },
  { to: '/admin/oferte/noua', label: 'Adaugă ofertă', icon: PlusCircle },
  { to: '/admin/alerte', label: 'Alerte', icon: Bell },
];

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      showToast('Te-ai deconectat cu succes.', 'info');
      navigate('/', { replace: true });
    } catch {
      showToast('Eroare la deconectare.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
          <div className="p-5 border-b border-slate-100">
            <Link to="/admin" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
                <Plane className="h-5 w-5" />
              </span>
              <div>
                <div className="text-sm font-extrabold text-slate-900">Vacanța Mea</div>
                <div className="text-xs text-slate-400">Admin Panel</div>
              </div>
            </Link>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {ADMIN_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <link.icon className="h-4.5 w-4.5" />
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="p-3 border-t border-slate-100 space-y-1">
            <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4" />
              Înapoi la site
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-error-600 hover:bg-error-50"
            >
              <LogOut className="h-4 w-4" />
              Deconectare
            </button>
          </div>
        </aside>

        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Plane className="h-4 w-4" />
            </span>
            <span className="font-bold text-slate-900">Admin</span>
          </Link>
          <button onClick={() => setMobileOpen((v) => !v)} className="p-2 rounded-lg hover:bg-slate-100">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile sidebar */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl overflow-y-auto">
              <div className="p-5 border-b border-slate-100">
                <span className="font-extrabold text-slate-900">Admin Panel</span>
              </div>
              <nav className="p-3 space-y-1" onClick={() => setMobileOpen(false)}>
                {ADMIN_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                        isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
                      }`
                    }
                  >
                    <link.icon className="h-4.5 w-4.5" />
                    {link.label}
                  </NavLink>
                ))}
                <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50">
                  <ArrowLeft className="h-4 w-4" />
                  Înapoi la site
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-error-600 hover:bg-error-50"
                >
                  <LogOut className="h-4 w-4" />
                  Deconectare
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
