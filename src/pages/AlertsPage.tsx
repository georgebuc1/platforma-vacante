import { useState } from 'react';
import {
  Bell,
  Mail,
  MapPin,
  Wallet,
  Globe,
  Compass,
  Calendar,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { saveAlert } from '@/services/storageService';
import {
  DEPARTURE_CITIES,
  MONTHS,
  DURATIONS,
  TRIP_TYPES,
} from '@/components/search/SearchForm';
import { showToast } from '@/components/common/Toast';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { useHoneypot } from '@/hooks/useHoneypot';
import type { AlertFrequency } from '@/types';

const FREQUENCIES: { value: AlertFrequency; label: string }[] = [
  { value: 'immediate', label: 'Imediat' },
  { value: 'daily', label: 'O dată pe zi' },
  { value: 'weekly', label: 'O dată pe săptămână' },
];

export default function AlertsPage() {
  useDocumentMeta(
    'Alertă de preț',
    'Primești un email automat de îndată ce apare o ofertă de vacanță care se încadrează în bugetul și preferințele tale.'
  );

  const [email, setEmail] = useState('');
  const [departureCity, setDepartureCity] = useState('București');
  const [maxBudget, setMaxBudget] = useState('2500');
  const [country, setCountry] = useState('');
  const [tripType, setTripType] = useState('orice');
  const [month, setMonth] = useState('oricand');
  const [duration, setDuration] = useState('orice');
  const [frequency, setFrequency] =
    useState<AlertFrequency>('immediate');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const { isBot, honeypotFieldProps } = useHoneypot();

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Introdu un email valid.';
    }

    if (!departureCity) {
      errs.departureCity = 'Alege orașul de plecare.';
    }

    const budgetNum = Number(maxBudget);

    if (!maxBudget || isNaN(budgetNum) || budgetNum <= 0) {
      errs.maxBudget = 'Introdu un buget valid.';
    }

    if (!consent) {
      errs.consent =
        'Trebuie să fii de acord cu primirea notificărilor.';
    }

    setErrors(errs);

    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    // Silently drop bot submissions — show normal success so bots don't
    // learn the check exists, but never touch the database.
    if (isBot()) {
      showToast('Alerta ta a fost creată cu succes.', 'success');
      setEmail('');
      setCountry('');
      setTripType('orice');
      setMonth('oricand');
      setDuration('orice');
      setFrequency('immediate');
      setConsent(false);
      return;
    }

    setSubmitting(true);

    try {
      await saveAlert({
        email,
        departure_city: departureCity,
        max_budget: Number(maxBudget),
        country: country || undefined,
        trip_type: tripType !== 'orice' ? tripType : undefined,
        month: month !== 'oricand' ? month : undefined,
        duration: duration !== 'orice' ? duration : undefined,
        frequency,
        consent,
      });

      showToast(
        'Alerta ta a fost creată cu succes.',
        'success'
      );

      setEmail('');
      setCountry('');
      setTripType('orice');
      setMonth('oricand');
      setDuration('orice');
      setFrequency('immediate');
      setConsent(false);
    } catch {
      showToast(
        'A apărut o eroare. Încearcă din nou.',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page py-10">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400 mb-4">
            <Bell className="h-7 w-7" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Nu rata următoarea ofertă bună.
          </h1>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Spune-ne ce cauți și te putem anunța când apare o
            ofertă potrivită.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="card p-6 sm:p-8 space-y-5"
        >
          {/* Honeypot — invisible to real people, catches simple bots */}
          <input type="text" {...honeypotFieldProps} />

          {/* Email */}
          <div>
            <label className="label-field flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-brand-500 dark:text-brand-400" />
              Email
              <span className="text-error-500">*</span>
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="exemplu@email.ro"
            />

            {errors.email && (
              <p className="mt-1 text-xs text-error-600 dark:text-error-400">
                {errors.email}
              </p>
            )}
          </div>

          {/* Departure city */}
          <div>
            <label className="label-field flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-brand-500 dark:text-brand-400" />
              De unde pleci?
              <span className="text-error-500">*</span>
            </label>

            <select
              value={departureCity}
              onChange={(e) => setDepartureCity(e.target.value)}
              className="input-field"
            >
              {DEPARTURE_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {errors.departureCity && (
              <p className="mt-1 text-xs text-error-600 dark:text-error-400">
                {errors.departureCity}
              </p>
            )}
          </div>

          {/* Budget */}
          <div>
            <label className="label-field flex items-center gap-1.5">
              <Wallet className="h-4 w-4 text-brand-500 dark:text-brand-400" />
              Buget maxim (RON)
              <span className="text-error-500">*</span>
            </label>

            <input
              type="number"
              min="0"
              step="50"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              className="input-field"
              placeholder="2500"
            />

            {errors.maxBudget && (
              <p className="mt-1 text-xs text-error-600 dark:text-error-400">
                {errors.maxBudget}
              </p>
            )}
          </div>

          {/* Country */}
          <div>
            <label className="label-field flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-brand-500 dark:text-brand-400" />
              Țara preferată
              <span className="text-slate-400 dark:text-slate-500 font-normal">
                (opțional)
              </span>
            </label>

            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="input-field"
              placeholder="Ex: Grecia"
            />
          </div>

          {/* Trip type */}
          <div>
            <label className="label-field flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-brand-500 dark:text-brand-400" />
              Ce fel de vacanță vrei?
            </label>

            <select
              value={tripType}
              onChange={(e) => setTripType(e.target.value)}
              className="input-field"
            >
              {TRIP_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div>
            <label className="label-field flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-brand-500 dark:text-brand-400" />
              Perioada
            </label>

            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="input-field"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="label-field flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-brand-500 dark:text-brand-400" />
              Durata
            </label>

            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="input-field"
            >
              {DURATIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Frequency */}
          <div>
            <label className="label-field">
              Frecvența notificărilor
            </label>

            <div className="grid grid-cols-3 gap-2">
              {FREQUENCIES.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFrequency(f.value)}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                    frequency === f.value
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-950/50 dark:text-brand-300'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Consent */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800"
              />

              <span className="text-sm text-slate-600 dark:text-slate-300">
                Sunt de acord să primesc notificări despre
                ofertele care corespund criteriilor mele.
                <span className="text-error-500">*</span>
              </span>
            </label>

            {errors.consent && (
              <p className="mt-1 text-xs text-error-600 dark:text-error-400">
                {errors.consent}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full text-base py-4"
          >
            <Bell className="h-5 w-5" />
            {submitting
              ? 'Se salvează...'
              : 'CREEAZĂ ALERTA'}
          </button>

          {/* Info */}
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 p-3 text-xs text-slate-500 dark:text-slate-400">
            <CheckCircle className="h-4 w-4 text-success-500 dark:text-success-400" />
            <span>
              Alerta ta va fi salvată. Nu vei primi email-uri
              reale în această versiune.
            </span>
          </div>

        </form>
      </div>
    </div>
  );
}