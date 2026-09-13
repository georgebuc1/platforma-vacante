import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Settings2, X } from 'lucide-react';
import { getCookieConsent, setCookieConsent } from '@/utils/cookieConsent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getCookieConsent() === null);
  }, []);

  if (!visible) return null;

  const choose = (value: 'accepted' | 'necessary') => {
    setCookieConsent(value);
    setVisible(false);
  };

  return (
    <aside
      className="fixed inset-x-3 bottom-3 z-[60] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:inset-x-auto sm:left-6 sm:max-w-lg dark:border-slate-700 dark:bg-slate-900"
      aria-label="Preferințe cookies"
    >
      <div className="flex items-start gap-3">
        <Settings2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Preferințele tale de confidențialitate</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            Folosim stocare locală pentru funcțiile necesare. Serviciile externe de căutare și afiliere se activează doar cu acordul tău.
            Citește <Link to="/cookies" className="font-semibold text-brand-600 hover:underline">politica de cookies</Link>.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => choose('accepted')} className="btn-primary px-3 py-2 text-xs">
              <Check className="h-4 w-4" /> Acceptă opționalele
            </button>
            <button type="button" onClick={() => choose('necessary')} className="btn-secondary px-3 py-2 text-xs">
              Doar necesare
            </button>
          </div>
        </div>
        <button type="button" onClick={() => choose('necessary')} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100" aria-label="Închide">
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
