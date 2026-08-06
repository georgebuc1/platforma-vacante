import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, PlusCircle, Edit, Trash2, Eye, Archive, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getOffers, deleteOffer, updateOffer } from '@/services/storageService';
import { deleteOfferImage } from '@/services/imageService';
import { formatPrice, formatDateShort } from '@/utils/pricing';
import { showToast } from '@/components/common/Toast';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import type { Offer, OfferStatus } from '@/types';

const STATUS_LABELS: Record<OfferStatus, string> = {
  draft: 'Draft', active: 'Activă', expired: 'Expirată', archived: 'Arhivată',
};
const STATUS_COLORS: Record<OfferStatus, string> = {
  draft: 'bg-slate-100 text-slate-600', active: 'bg-success-100 text-success-700',
  expired: 'bg-error-100 text-error-700', archived: 'bg-warning-100 text-warning-700',
};

export default function AdminOffersList() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sort, setSort] = useState<string>('newest');

  const reload = () => getOffers().then(setOffers);

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = [...offers];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((o) => o.title.toLowerCase().includes(q) || o.destination.toLowerCase().includes(q) || o.country.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') result = result.filter((o) => o.status === statusFilter);
    switch (sort) {
      case 'price_asc': result.sort((a, b) => a.total_price - b.total_price); break;
      case 'price_desc': result.sort((a, b) => b.total_price - a.total_price); break;
      case 'oldest': result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); break;
      default: result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return result;
  }, [offers, search, statusFilter, sort]);

  const [deleteTarget, setDeleteTarget] = useState<Offer | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = (offer: Offer) => setDeleteTarget(offer);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteOffer(deleteTarget.id);
      if (deleteTarget.main_image_url) {
        await deleteOfferImage(deleteTarget.main_image_url);
      }
      await reload();
      showToast('Oferta a fost ștearsă.', 'success');
    } catch {
      showToast('Eroare la ștergere.', 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleStatusChange = async (id: string, status: OfferStatus) => {
    await updateOffer(id, { status });
    await reload();
    showToast(`Status actualizat: ${STATUS_LABELS[status]}.`, 'success');
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Oferte</h1>
          <p className="text-slate-500 text-sm mt-1">{filtered.length} din {offers.length} oferte</p>
        </div>
        <Link to="/admin/oferte/noua" className="btn-primary text-sm">
          <PlusCircle className="h-4 w-4" /> Adaugă ofertă
        </Link>
      </div>

      <div className="card p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Caută după titlu, destinație, țară..." className="input-field pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field sm:w-40">
          <option value="all">Toate statusurile</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="expired">Expirate</option>
          <option value="archived">Arhivate</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-field sm:w-44">
          <option value="newest">Cele mai noi</option>
          <option value="oldest">Cele mai vechi</option>
          <option value="price_asc">Preț crescător</option>
          <option value="price_desc">Preț descrescător</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block card overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Ofertă', 'Destinație', 'Plecare', 'Preț', 'Data plecării', 'Status', 'Ultima verificare', 'Acțiuni'].map((h, i) => (
                    <th key={h} className={`text-xs font-bold text-slate-500 uppercase px-4 py-3 ${i === 3 || i === 7 ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((offer) => (
                  <tr key={offer.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={offer.main_image_url} alt={offer.destination} className="h-10 w-14 rounded-lg object-cover bg-slate-100" loading="lazy" />
                        <span className="text-sm font-semibold text-slate-700 max-w-[200px] truncate">{offer.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{offer.destination}, {offer.country}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{offer.departure_city}</td>
                    <td className="px-4 py-3 text-sm font-bold text-slate-700 text-right">{formatPrice(offer.total_price, offer.currency)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{formatDateShort(offer.departure_date)}</td>
                    <td className="px-4 py-3"><span className={`badge ${STATUS_COLORS[offer.status]}`}>{STATUS_LABELS[offer.status]}</span></td>
                    <td className="px-4 py-3 text-sm text-slate-500">{formatDateShort(offer.last_checked_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/oferte/${offer.slug}`} target="_blank" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100" title="Vezi"><Eye className="h-4 w-4" /></Link>
                        <Link to={`/admin/oferte/${offer.id}/edit`} className="p-2 rounded-lg text-brand-600 hover:bg-brand-50" title="Editează"><Edit className="h-4 w-4" /></Link>
                        {offer.status !== 'active' && <button onClick={() => handleStatusChange(offer.id, 'active')} className="p-2 rounded-lg text-success-600 hover:bg-success-50" title="Publică"><CheckCircle className="h-4 w-4" /></button>}
                        {offer.status !== 'expired' && <button onClick={() => handleStatusChange(offer.id, 'expired')} className="p-2 rounded-lg text-error-600 hover:bg-error-50" title="Marchează expirată"><XCircle className="h-4 w-4" /></button>}
                        {offer.status !== 'archived' && <button onClick={() => handleStatusChange(offer.id, 'archived')} className="p-2 rounded-lg text-warning-600 hover:bg-warning-50" title="Arhivează"><Archive className="h-4 w-4" /></button>}
                        <button onClick={() => handleDelete(offer)} className="p-2 rounded-lg text-error-600 hover:bg-error-50" title="Șterge"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="p-12 text-center text-slate-400 text-sm">Nu există oferte care să corespundă filtrelor.</div>}
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-4">
            {filtered.map((offer) => (
              <div key={offer.id} className="card p-4">
                <div className="flex gap-3 mb-3">
                  <img src={offer.main_image_url} alt={offer.destination} className="h-16 w-20 rounded-lg object-cover bg-slate-100" loading="lazy" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-800 truncate">{offer.title}</div>
                    <div className="text-xs text-slate-500">{offer.destination}, {offer.country}</div>
                    <div className="text-sm font-bold text-slate-700 mt-1">{formatPrice(offer.total_price, offer.currency)}</div>
                    <span className={`badge ${STATUS_COLORS[offer.status]} mt-1`}>{STATUS_LABELS[offer.status]}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                  <Link to={`/admin/oferte/${offer.id}/edit`} className="btn-ghost text-xs py-2"><Edit className="h-3.5 w-3.5" /> Editează</Link>
                  <Link to={`/oferte/${offer.slug}`} target="_blank" className="btn-ghost text-xs py-2"><Eye className="h-3.5 w-3.5" /> Vezi</Link>
                  {offer.status !== 'active' && <button onClick={() => handleStatusChange(offer.id, 'active')} className="btn-ghost text-xs py-2 text-success-600"><CheckCircle className="h-3.5 w-3.5" /> Publică</button>}
                  <button onClick={() => handleDelete(offer)} className="btn-ghost text-xs py-2 text-error-600"><Trash2 className="h-3.5 w-3.5" /> Șterge</button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="card p-8 text-center text-slate-400 text-sm">Nu există oferte care să corespundă filtrelor.</div>}
          </div>
        </>
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Ștergere ofertă"
        message="Sigur dorești să ștergi această ofertă?"
        warning="Această acțiune nu poate fi anulată."
        confirmLabel="Șterge"
        cancelLabel="Renunță"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
