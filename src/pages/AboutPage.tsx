import { Sparkles, ShieldCheck, Heart } from 'lucide-react';

const VALUES = [
  {
    icon: Sparkles,
    title: 'Simplu',
    description: 'Nu te complicăm cu sute de filtre inutile. Îți spunem ce contează: buget, perioadă, destinație.',
  },
  {
    icon: ShieldCheck,
    title: 'Transparent',
    description: 'Afișăm prețul total cu toate componentele. Fără costuri ascunse, fără surprize la final.',
  },
  {
    icon: Heart,
    title: 'Util',
    description: 'Construim o platformă care rezolvă o problemă reală: găsirea vacanței potrivite în banii tăi.',
  },
];

export default function AboutPage() {
  return (
    <div className="container-page py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
          Vacanța potrivită nu ar trebui să fie greu de găsit.
        </h1>
        <p className="mt-5 text-lg text-slate-600 leading-relaxed">
          Vacanța Mea este o platformă care îi ajută pe oameni să găsească mai ușor variante de călătorie potrivite bugetului și preferințelor lor.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {VALUES.map((val) => (
            <div key={val.title} className="card p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 mb-4">
                <val.icon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{val.title}</h3>
              <p className="text-sm text-slate-500">{val.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-brand-50 p-8 text-center">
          <p className="text-xl font-extrabold text-brand-700">VACANȚĂ ÎN BANII TĂI!</p>
          <p className="mt-2 text-slate-600">Aceasta este promisiunea noastră. Simplu, transparent, util.</p>
        </div>
      </div>
    </div>
  );
}
