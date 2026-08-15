import { useEffect, useMemo, useState } from 'react';
import { Search, Mail, Trash2, Loader2 } from 'lucide-react';
import { getContactMessages, deleteContactMessage } from '@/services/storageService';
import { formatDateShort } from '@/utils/pricing';
import { showToast } from '@/components/common/Toast';
import type { ContactMessage } from '@/types';

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const reload = () => getContactMessages().then(setMessages);

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = [...messages];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.message.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [messages, search]);

  const handleDelete = async (id: string) => {
    if (!confirm('Sigur vrei să ștergi acest mesaj?')) return;
    try {
      await deleteContactMessage(id);
      await reload();
      showToast('Mesajul a fost șters.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'A apărut o eroare.', 'error');
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Mesaje de contact</h1>
        <p className="text-slate-500 text-sm mt-1">
          {filtered.length} din {messages.length} mesaje
        </p>
      </div>

      <div className="card p-4 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Caută după nume, email sau conținut..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center text-slate-400 text-sm">
          Nu există mesaje de contact.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((msg) => {
            const isExpanded = expandedId === msg.id;
            return (
              <div key={msg.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : msg.id)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-800">{msg.name}</span>
                      <a
                        href={`mailto:${msg.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
                      >
                        <Mail className="h-3 w-3" />
                        {msg.email}
                      </a>
                      {!msg.consent && (
                        <span className="badge bg-amber-100 text-amber-700 text-[10px]">
                          Fără consimțământ marcat
                        </span>
                      )}
                    </div>

                    <p
                      className={`text-sm text-slate-600 mt-2 ${
                        isExpanded ? '' : 'line-clamp-2'
                      }`}
                    >
                      {msg.message}
                    </p>

                    <div className="text-xs text-slate-400 mt-2">
                      {formatDateShort(msg.created_at)}
                    </div>
                  </button>

                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="p-2 rounded-lg text-error-600 hover:bg-error-50 shrink-0"
                    title="Șterge mesajul"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
