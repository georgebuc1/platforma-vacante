import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Plane, Mail, Lock, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { signIn } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const ADMIN_EMAIL = 'georgebuc1@gmail.com';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // If already logged in as admin, go to admin; otherwise show the form
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && data.session.user.email?.toLowerCase() === ADMIN_EMAIL) {
        const from = (location.state as { from?: string })?.from || '/admin';
        navigate(from, { replace: true });
      } else {
        setCheckingSession(false);
      }
    });
  }, [navigate, location.state]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Introdu un email valid.';
    if (!password) errs.password = 'Acest câmp este obligatoriu.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      await signIn(email, password);
      // Block non-admin accounts from reaching the admin area
      if (email.toLowerCase() !== ADMIN_EMAIL) {
        await supabase.auth.signOut();
        setAuthError('Acest cont nu are privilegii de administrator.');
        return;
      }
      const from = (location.state as { from?: string })?.from || '/admin';
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Eroare la autentificare.';
      setAuthError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand-50 via-white to-white px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Plane className="h-5 w-5" />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">Vacanța Mea</span>
        </Link>

        <div className="card p-6 sm:p-8">
          <h1 className="text-xl font-extrabold text-slate-900 text-center mb-1">Autentificare administrator</h1>
          <p className="text-sm text-slate-500 text-center mb-6">Intră în contul de admin pentru a gestiona ofertele.</p>

          {authError && (
            <div className="mb-4 flex items-start gap-2 rounded-xl bg-error-50 border border-error-100 p-3 text-sm text-error-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-field flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-brand-500" /> Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="admin@vacantamea.ro"
                autoComplete="email"
                autoFocus
              />
              {errors.email && <p className="mt-1 text-xs text-error-600">{errors.email}</p>}
            </div>

            <div>
              <label className="label-field flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-brand-500" /> Parolă
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {errors.password && <p className="mt-1 text-xs text-error-600">{errors.password}</p>}
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full text-base py-3.5">
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              {submitting ? 'Se conectează...' : 'Conectează-te'}
            </button>
          </form>
        </div>

        <Link to="/" className="mt-6 flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" /> Înapoi la site
        </Link>
      </div>
    </div>
  );
}
