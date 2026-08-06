import { useEffect, useMemo, useState } from 'react';
import { Search, Bell, BellOff, Loader2 } from 'lucide-react';
import { getAlerts, updateAlertStatus, deleteAlert } from '@/services/storageService';
import { formatDateShort } from '@/utils/pricing';
import { showToast } from '@/components/common/Toast';
import { TRIP_TYPE_LABELS } from '@/components/search/SearchForm';
import type { Alert, AlertStatus } from '@/types';

const STATUS_LABELS: Record<AlertStatus, string> = { active: 'Activă', inactive: 'Inactivă' };
const STATUS_COLORS: Record<AlertStatus, string> = {
  active: 'bg-success-100 text-success-700', inactive: 'bg-slate-100 text-slate-500',
};
const FREQUENCY_LABELS: Record<string, string> = { immediate: 'Imediat', daily: 'Zilnic', weekly: 'Săptămânal' };

export default function AdminAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const reload = () => getAlerts().then(setAlerts);

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = [...alerts];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((a) =>
        a.email.toLowerCase().includes(q) || a.departure_city.toLowerCase().includes(q) || (a.country || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') result = result.filter((a) => a.status === statusFilter);
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [alerts, search, statusFilter]);

  const handleToggleStatus = async (id: string, currentStatus: AlertStatus) => {
    const newStatus: AlertStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await updateAlertStatus(id, newStatus);
    await reload();
    showToast(`Alertă ${newStatus === 'active' ? 'activată' : 'dezactivată'}.`, 'success');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sigur vrei să ștergi această alertă?')) return;
    await deleteAlert(id);
    await reload();
    showToast('Alerta a fost ștearsă.', 'success');
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Alerte</h1>
        <p className="text-slate-500 text-sm mt-1">{filtered.length} din {alerts.length} alerte</p>
      </div>

      <div className="card p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Caută după email, oraș, țară..." className="input-field pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field sm:w-40">
          <option value="all">Toate</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block card overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Email', 'Plecare', 'Buget', 'Țară', 'Tip', 'Perioada', 'Frecvență', 'Status', 'Creată la', 'Acțiuni'].map((h, i) => (
                    <th key={h} className={`text-xs font-bold text-slate-500 uppercase px-4 py-3 ${i === 2 || i === 9 ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-700">{alert.email}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{alert.departure_city}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">{alert.max_budget.toLocaleString('ro-RO')} RON</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{alert.country || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{alert.trip_type ? TRIP_TYPE_LABELS[alert.trip_type] || alert.trip_type : '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{alert.month || 'Oricând'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{FREQUENCY_LABELS[alert.frequency] || alert.frequency}</td>
                    <td className="px-4 py-3"><span className={`badge ${STATUS_COLORS[alert.status]}`}>{STATUS_LABELS[alert.status]}</span></td>
                    <td className="px-4 py-3 text-sm text-slate-500">{formatDateShort(alert.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleToggleStatus(alert.id, alert.status)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100" title={alert.status === 'active' ? 'Dezactivează' : 'Activează'}>
                          {alert.status === 'active' ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                        </button>
                        <button onClick={() => handleDelete(alert.id)} className="p-2 rounded-lg text-error-600 hover:bg-error-50" title="Șterge">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="p-12 text-center text-slate-400 text-sm">Nu există alerte.</div>}
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-4">
            {filtered.map((alert) => (
              <div key={alert.id} className="card p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="text-sm font-bold text-slate-800">{alert.email}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Creată: {formatDateShort(alert.created_at)}</div>
                  </div>
                  <span className={`badge ${STATUS_COLORS[alert.status]}`}>{STATUS_LABELS[alert.status]}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-3">
                  <div>Plecare: <strong>{alert.departure_city}</strong></div>
                  <div>Buget: <strong>{alert.max_budget.toLocaleString('ro-RO')} RON</strong></div>
                  <div>Țară: <strong>{alert.country || '—'}</strong></div>
                  <div>Tip: <strong>{alert.trip_type ? TRIP_TYPE_LABELS[alert.trip_type] || '—' : '—'}</strong></div>
                  <div>Perioada: <strong>{alert.month || 'Oricând'}</strong></div>
                  <div>Frecvență: <strong>{FREQUENCY_LABELS[alert.frequency] || '—'}</strong></div>
                </div>
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <button onClick={() => handleToggleStatus(alert.id, alert.status)} className="btn-ghost text-xs py-2 flex-1">
                    {alert.status === 'active' ? <><BellOff className="h-3.5 w-3.5" /> Dezactivează</> : <><Bell className="h-3.5 w-3.5" /> Activează</>}
                  </button>
                  <button onClick={() => handleDelete(alert.id)} className="btn-danger text-xs py-2">Șterge</button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="card p-8 text-center text-slate-400 text-sm">Nu există alerte.</div>}
          </div>
        </>
      )}
    </div>
  );
}
