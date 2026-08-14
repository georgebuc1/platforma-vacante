import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, FileText, FileX, Layers, Bell, MousePointerClick, PlusCircle, Clock, Wallet, CalendarPlus, ShieldAlert,
} from 'lucide-react';
import { getOffers, getAlerts, getClicks, getAdminAccessLog } from '@/services/storageService';
import { formatPrice, formatDate, formatDateShort } from '@/utils/pricing';
import type { Offer, Alert, ClickEvent, AdminAccessLogEntry } from '@/types';

export default function AdminDashboard() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [clicks, setClicks] = useState<ClickEvent[]>([]);
  const [accessLog, setAccessLog] = useState<AdminAccessLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOffers(), getAlerts(), getClicks(), getAdminAccessLog(15)])
      .then(([o, a, c, log]) => { setOffers(o); setAlerts(a); setClicks(c); setAccessLog(log); })
      .finally(() => setLoading(false));
  }, []);

  const activeOffers = offers.filter((o) => o.status === 'active');
  const inactiveOffers = offers.filter((o) => o.status === 'draft' || o.status === 'archived');
  const expiredOffers = offers.filter((o) => o.status === 'expired');
  const avgPrice = offers.length > 0 ? Math.round(offers.reduce((sum, o) => sum + o.total_price, 0) / offers.length) : 0;
  const lastOffer = [...offers].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  const recentOffers = [...offers].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
  const topOffers = [...offers].sort((a, b) => (b.click_count || 0) - (a.click_count || 0)).slice(0, 5);
  const recentClicks = [...clicks].slice(0, 10);

  const stats = [
    { label: 'Total oferte', value: offers.length, icon: Layers, color: 'text-brand-600 bg-brand-50' },
    { label: 'Oferte active', value: activeOffers.length, icon: FileText, color: 'text-success-600 bg-success-50' },
    { label: 'Oferte inactive', value: inactiveOffers.length, icon: FileX, color: 'text-slate-600 bg-slate-100' },
    { label: 'Preț mediu', value: `${formatPrice(avgPrice, 'RON')}`, icon: Wallet, color: 'text-accent-600 bg-accent-50' },
    { label: 'Ultima ofertă', value: lastOffer ? formatDateShort(lastOffer.created_at) : '—', icon: CalendarPlus, color: 'text-warning-600 bg-warning-50' },
    { label: 'Oferte expirate', value: expiredOffers.length, icon: FileX, color: 'text-error-600 bg-error-50' },
    { label: 'Alerte create', value: alerts.length, icon: Bell, color: 'text-accent-600 bg-accent-50' },
    { label: 'Clickuri totale', value: clicks.length, icon: MousePointerClick, color: 'text-slate-600 bg-slate-100' },
  ];

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="card p-5 h-24 animate-pulse bg-slate-100" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Privire de ansamblu asupra platformei.</p>
        </div>
        <Link to="/admin/oferte/noua" className="btn-primary text-sm">
          <PlusCircle className="h-4 w-4" /> Adaugă ofertă
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{stat.value}</div>
            <div className="text-sm text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent offers */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand-500" /> Ultimele oferte adăugate
            </h2>
            <Link to="/admin/oferte" className="text-sm text-brand-600 hover:text-brand-700 font-medium">Vezi tot →</Link>
          </div>
          <div className="space-y-3">
            {recentOffers.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">Nu există oferte.</p>
            ) : recentOffers.map((offer) => (
              <Link key={offer.id} to={`/admin/oferte/${offer.id}/edit`}
                className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50 transition-colors">
                <img src={offer.main_image_url} alt={offer.destination} className="h-12 w-16 rounded-lg object-cover bg-slate-100" loading="lazy" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-700 truncate">{offer.title}</div>
                  <div className="text-xs text-slate-400">{offer.destination}, {offer.country}</div>
                </div>
                <div className="text-sm font-bold text-slate-700">{formatPrice(offer.total_price, offer.currency)}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Top offers */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand-500" /> Cele mai accesate oferte
            </h2>
          </div>
          <div className="space-y-3">
            {topOffers.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">Nu există date.</p>
            ) : topOffers.map((offer, idx) => (
              <Link key={offer.id} to={`/admin/oferte/${offer.id}/edit`}
                className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50 transition-colors">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-700 truncate">{offer.title}</div>
                  <div className="text-xs text-slate-400">{offer.click_count || 0} clickuri</div>
                </div>
                <div className="text-sm font-bold text-brand-600">{offer.click_count || 0}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="card p-5 mt-6">
        <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <MousePointerClick className="h-4 w-4 text-brand-500" /> Activitate recentă
        </h2>
        {recentClicks.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">Nu există activitate înregistrată.</p>
        ) : (
          <div className="space-y-2">
            {recentClicks.map((click) => {
              const offer = offers.find((o) => o.id === click.offer_id);
              return (
                <div key={click.id} className="flex items-center gap-3 text-sm py-2 border-b border-slate-50 last:border-0">
                  <span className={`badge ${click.action === 'check_offer' ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-600'}`}>
                    {click.action === 'check_offer' ? 'Verificare ofertă' : 'Vizualizare'}
                  </span>
                  <span className="flex-1 text-slate-600 truncate">{offer?.title || click.offer_slug}</span>
                  <span className="text-xs text-slate-400">{formatDate(click.timestamp)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Security: admin access attempts */}
      <div className="card p-5 mt-6">
        <h2 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-error-500" /> Încercări de acces la admin
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Login-uri eșuate și accesări directe ale paginilor de admin fără autentificare.
        </p>
        {accessLog.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">
            Nicio încercare suspectă înregistrată. 👍
          </p>
        ) : (
          <div className="space-y-2">
            {accessLog.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 text-sm py-2 border-b border-slate-50 last:border-0">
                <span
                  className={`badge ${
                    entry.event_type === 'failed_login'
                      ? 'bg-error-50 text-error-700'
                      : 'bg-warning-50 text-warning-700'
                  }`}
                >
                  {entry.event_type === 'failed_login' ? 'Login eșuat' : 'Acces neautorizat'}
                </span>
                <span className="flex-1 text-slate-600 truncate">
                  {entry.event_type === 'failed_login'
                    ? entry.email_attempted || '—'
                    : entry.path || '—'}
                </span>
                <span className="text-xs text-slate-400 shrink-0">{formatDate(entry.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
