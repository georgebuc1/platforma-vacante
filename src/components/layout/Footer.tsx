import { Link } from 'react-router-dom';
import { Plane, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-100 bg-white">
      <div className="container-page py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
                <Plane className="h-5 w-5" />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-slate-900">Vacanța Mea</span>
            </Link>
            <p className="mt-4 text-sm text-slate-500 max-w-sm">
              Platformă românească care te ajută să găsești vacanța potrivită în funcție de buget, perioadă și preferințele tale.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3">Navigare</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-slate-500 hover:text-brand-600">Acasă</Link></li>
              <li><Link to="/oferte" className="text-slate-500 hover:text-brand-600">Oferte</Link></li>
              <li><Link to="/alerte" className="text-slate-500 hover:text-brand-600">Alerte</Link></li>
              <li><Link to="/despre" className="text-slate-500 hover:text-brand-600">Despre noi</Link></li>
              <li><Link to="/contact" className="text-slate-500 hover:text-brand-600">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-slate-500">
                <Mail className="h-4 w-4" /> contact@vacantamea.ro
              </li>
              <li><Link to="/admin" className="text-slate-500 hover:text-brand-600">Admin Panel</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Vacanța Mea. Toate drepturile rezervate.</p>
          <p>Versiune MVP — Date demo. Fără rezervări reale.</p>
        </div>
      </div>
    </footer>
  );
}
