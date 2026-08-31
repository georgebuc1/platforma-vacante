import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { getArticleBySlug } from '@/data/articles';
import { findKlookWidgetForDestination } from '@/data/klookWidgets';
import KlookToursWidget from '@/components/widgets/KlookToursWidget';

export default function GhidDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticleBySlug(slug) : undefined;

  useDocumentMeta(article?.title || 'Ghid de călătorie', article?.metaDescription);

  if (!article) return <Navigate to="/ghiduri" replace />;

  const klookWidget = findKlookWidgetForDestination(article.destination);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <nav className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        <Link to="/ghiduri" className="hover:text-brand-600">Ghiduri</Link>
        <span className="mx-1.5">/</span>
        <span>{article.destination}</span>
      </nav>

      <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-6">
        <img src={article.heroImage} alt={article.title} className="h-full w-full object-cover" />
      </div>

      <div className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400 mb-2">
        <MapPin className="h-4 w-4" />
        {article.destination}
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-4">
        {article.title}
      </h1>

      <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
        {article.intro}
      </p>

      {/* CTA to the live, real offer for this destination */}
      <Link
        to="/bilete"
        state={{ destination: article.destination }}
        className="btn-primary inline-flex items-center gap-2 mb-8"
      >
        Vezi prețul curent pentru {article.destination}
        <ArrowRight className="h-4 w-4" />
      </Link>

      <div className="space-y-8">
        {article.sections.map((section) => (
          <div key={section.heading}>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {section.heading}
            </h2>
            {section.paragraphs.map((p, i) => (
              <p key={i} className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                {p}
              </p>
            ))}
          </div>
        ))}
      </div>

      {klookWidget && (
        <div className="card mt-10 p-6">
          <h2 className="mb-1 text-lg font-bold">Ce poți face în {klookWidget.label}</h2>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Excursii și activități reale, via Klook.
          </p>
          <KlookToursWidget src={klookWidget.src} />
        </div>
      )}
    </div>
  );
}
