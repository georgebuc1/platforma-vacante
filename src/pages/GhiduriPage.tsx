import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { ARTICLES } from '@/data/articles';

export default function GhiduriPage() {
  useDocumentMeta(
    'Ghiduri de călătorie',
    'Ghiduri pentru destinațiile tale preferate: prețuri de zbor, cel mai bun sezon și ce să vizitezi. Actualizate periodic.'
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
        Ghiduri de călătorie
      </h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">
        Prețuri, sezon optim și recomandări pentru destinațiile noastre.
      </p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {ARTICLES.map((article) => (
          <Link
            key={article.slug}
            to={`/ghiduri/${article.slug}`}
            className="card overflow-hidden group hover:shadow-card-hover transition-shadow"
          >
            <div className="aspect-[16/10] overflow-hidden">
              <img
                src={article.heroImage}
                alt={article.title}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 mb-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {article.destination}
              </div>
              <h2 className="font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {article.title}
              </h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
