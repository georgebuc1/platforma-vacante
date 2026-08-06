import { useState } from 'react';
import { Mail, User, MessageSquare, Send, CheckCircle } from 'lucide-react';
import { showToast } from '@/components/common/Toast';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Acest câmp este obligatoriu.';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Introdu un email valid.';
    if (!message.trim()) errs.message = 'Acest câmp este obligatoriu.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    // Simulate a short delay for UX feedback (no backend storage in this version)
    await new Promise((r) => setTimeout(r, 600));
    showToast('Mesajul tău a fost trimis cu succes.', 'success');
    setSent(true);
    setName(''); setEmail(''); setMessage('');
    setSubmitting(false);
  };

  return (
    <div className="container-page py-12">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Contactează-ne</h1>
          <p className="mt-2 text-slate-500">Ai întrebări sau sugestii? Scrie-ne și îți răspundem cât mai curând.</p>
        </div>

        {sent && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-success-50 border border-success-100 p-4 text-success-700">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">Mesajul tău a fost trimis cu succes. Îți vom răspunde în cel mai scurt timp.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-5">
          <div>
            <label className="label-field flex items-center gap-1.5">
              <User className="h-4 w-4 text-brand-500" /> Nume <span className="text-error-500">*</span>
            </label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="Numele tău" />
            {errors.name && <p className="mt-1 text-xs text-error-600">{errors.name}</p>}
          </div>
          <div>
            <label className="label-field flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-brand-500" /> Email <span className="text-error-500">*</span>
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="exemplu@email.ro" />
            {errors.email && <p className="mt-1 text-xs text-error-600">{errors.email}</p>}
          </div>
          <div>
            <label className="label-field flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-brand-500" /> Mesaj <span className="text-error-500">*</span>
            </label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className="input-field resize-none" placeholder="Scrie mesajul tău aici..." />
            {errors.message && <p className="mt-1 text-xs text-error-600">{errors.message}</p>}
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full text-base py-4">
            <Send className="h-5 w-5" />
            {submitting ? 'Se trimite...' : 'Trimite mesajul'}
          </button>
        </form>
      </div>
    </div>
  );
}
