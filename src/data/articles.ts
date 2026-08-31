// Content data for the /ghiduri (guides) section. Kept as plain structured
// data (not markdown) so it renders with zero extra dependencies and stays
// consistent with the rest of the site's styling.

export interface ArticleSection {
  heading: string;
  paragraphs: string[];
}

export interface Article {
  slug: string;
  title: string; // page <h1> and SEO title
  metaDescription: string;
  destination: string; // must match offer.destination exactly, for the internal link + related offers
  heroImage: string;
  publishedAt: string; // YYYY-MM-DD
  intro: string;
  sections: ArticleSection[];
}

export const ARTICLES: Article[] = [
  {
    slug: 'zboruri-ieftine-bucuresti-antalya',
    title: 'Zboruri ieftine București – Antalya: prețuri, sezon și sfaturi',
    metaDescription:
      'Cât costă un bilet de avion București–Antalya, care e cel mai bun moment să pleci și ce trebuie să știi despre zborurile spre Turcia în 2026.',
    destination: 'Antalya',
    heroImage: 'https://images.unsplash.com/photo-1601574778479-c0c9d4b6c1f6?w=1200',
    publishedAt: '2026-08-31',
    intro:
      'Antalya rămâne, an de an, una dintre cele mai căutate destinații de vacanță pentru români — și nu e greu de înțeles de ce: zbor scurt (aproximativ 2 ore și jumătate direct din București), plaje întinse, și zeci de hoteluri all-inclusive la prețuri accesibile. Dacă te întrebi cât costă un bilet și când să cumperi, iată ce trebuie să știi.',
    sections: [
      {
        heading: 'Cât costă, în medie, un zbor București–Antalya',
        paragraphs: [
          'Prețul unui bilet dus-întors variază destul de mult în funcție de sezon și de cât de din timp rezervi. În extrasezon (mai, iunie târziu, septembrie-octombrie), poți găsi bilete la prețuri considerabil mai mici decât în plin sezon (iulie-august), când cererea explodează și prețurile urcă rapid.',
          'Pe pagina noastră de Bilete găsești prețul curent, actualizat automat, direct din datele de căutare Aviasales — nu un preț fix, static, care riscă să fie deja depășit.',
        ],
      },
      {
        heading: 'Care e cel mai bun moment să pleci în Antalya',
        paragraphs: [
          'Sezonul de plajă ține, practic, din mai până în octombrie, datorită climei mediteraneene calde. Pentru cel mai bun raport preț-vreme, iunie și septembrie sunt alegeri excelente: apa mării e deja (sau încă) caldă, iar stațiunile nu sunt la fel de aglomerate ca în august.',
          'Dacă bugetul contează mai mult decât temperatura exactă a apei, extrasezonul (mai și octombrie) aduce prețuri mai mici atât la bilete, cât și la cazare.',
        ],
      },
      {
        heading: 'Ce să știi înainte să rezervi',
        paragraphs: [
          'Majoritatea zborurilor spre Antalya din București sunt directe, operate atât de companii charter cât și de curse regulate — verifică mereu dacă biletul e direct sau are escală, mai ales dacă vrei să minimizezi timpul de călătorie.',
          'Cetățenii români nu au nevoie de viză pentru șederi turistice sub 90 de zile în Turcia, dar verifică mereu valabilitatea pașaportului (minim 6 luni de la data călătoriei este recomandarea standard).',
        ],
      },
    ],
  },
  {
    slug: 'zboruri-ieftine-bucuresti-hurghada',
    title: 'Zboruri ieftine București – Hurghada: ghid complet 2026',
    metaDescription:
      'Ghid pentru zborurile București–Hurghada: prețuri, sezon optim pentru scufundări și plajă, și ce trebuie să știi înainte de plecare în Egipt.',
    destination: 'Hurghada',
    heroImage: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1200',
    publishedAt: '2026-08-31',
    intro:
      'Hurghada s-a impus în ultimii ani ca una dintre alternativele preferate de români la clasicele destinații mediteraneene — mai ales datorită sezonului mult mai lung (practic, poți face plajă și în ianuarie) și a apelor calde, ideale pentru snorkeling și scufundări.',
    sections: [
      {
        heading: 'Cât costă un bilet spre Hurghada',
        paragraphs: [
          'Spre deosebire de Antalya, Hurghada are avantajul unui sezon turistic aproape tot anul, ceea ce înseamnă că prețurile biletelor sunt, în general, mai stabile de-a lungul lunilor — fără explozia bruscă de preț specifică sezonului mediteranean de vară.',
          'Verifică prețul curent, actualizat automat, pe pagina noastră de Bilete.',
        ],
      },
      {
        heading: 'Cel mai bun moment pentru scufundări și plajă',
        paragraphs: [
          'Pentru scufundări și vizibilitate excelentă în apă, lunile martie-mai și septembrie-noiembrie sunt considerate optime — temperaturi plăcute, fără căldura extremă a verii egiptene.',
          'Dacă vrei neapărat căldură puternică și nu te deranjează termometrul peste 35°C, iulie-august rămân cele mai calde luni, populare mai ales pentru familiile care vor apă de mare foarte caldă.',
        ],
      },
      {
        heading: 'Sfaturi practice pentru Egipt',
        paragraphs: [
          'Cetățenii români au nevoie de viză pentru Egipt, dar aceasta se poate obține de obicei la sosire (visa on arrival) sau online, în avans, prin sistemul e-Visa — verifică mereu cerințele actualizate înainte de plecare.',
          'Majoritatea pachetelor de vacanță în Hurghada sunt all-inclusive, ceea ce simplifică mult bugetul de vacanță — verifică totuși ce e inclus exact (băuturi alcoolice, excursii, sporturi nautice) înainte de a compara prețuri între hoteluri.',
        ],
      },
    ],
  },
  {
    slug: 'zboruri-ieftine-bucuresti-sharm-el-sheikh',
    title: 'Zboruri ieftine București – Sharm El Sheikh: prețuri și sfaturi',
    metaDescription:
      'Tot ce trebuie să știi despre zborurile București–Sharm El Sheikh: prețuri, cel mai bun sezon pentru scufundări și recomandări practice.',
    destination: 'Sharm El Sheikh',
    heroImage: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1200',
    publishedAt: '2026-08-31',
    intro:
      'Sharm El Sheikh, situat la vârful peninsulei Sinai, e considerat de mulți scafandri drept una dintre cele mai bune destinații de scufundări din lume, datorită recifelor de corali din Marea Roșie. Dar și pentru cei care vor doar plajă și soare, e o alegere excelentă, mai ales în extrasezon.',
    sections: [
      {
        heading: 'Prețuri și disponibilitate',
        paragraphs: [
          'La fel ca Hurghada, Sharm El Sheikh beneficiază de un sezon turistic extins, aproape tot anul, ceea ce înseamnă mai puține fluctuații bruște de preț comparativ cu destinațiile strict de vară.',
          'Prețul actualizat, live, îl găsești pe pagina noastră de Bilete.',
        ],
      },
      {
        heading: 'Sezonul ideal pentru scufundări',
        paragraphs: [
          'Vizibilitatea în apă e excelentă aproape tot anul, dar cele mai bune condiții (apă calmă, vizibilitate maximă) sunt de obicei între aprilie și iunie, și din nou în septembrie-noiembrie.',
        ],
      },
      {
        heading: 'De reținut înainte de plecare',
        paragraphs: [
          'La fel ca pentru Hurghada, e nevoie de viză (obținută la sosire sau online, în avans). Recomandăm să verifici mereu cele mai recente cerințe de intrare pe site-ul MAE înainte de călătorie.',
          'Pentru scufundări, majoritatea centrelor cer un certificat valid (PADI sau echivalent) — dacă nu ai unul, sunt disponibile și cursuri introductive la fața locului.',
        ],
      },
    ],
  },
  {
    slug: 'city-break-barcelona-cate-zile',
    title: 'City break în Barcelona: câte zile ai nevoie și ce să vizitezi',
    metaDescription:
      'Ghid pentru un city break în Barcelona: câte zile sunt suficiente, ce obiective să prioritizezi și cât costă un zbor din București.',
    destination: 'Barcelona',
    heroImage: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200',
    publishedAt: '2026-08-31',
    intro:
      'Barcelona e, de departe, unul dintre cele mai populare orașe pentru un city break european — arhitectura lui Gaudí, plajele urbane și viața de stradă animată fac din ea o destinație care se potrivește la fel de bine unui weekend scurt cât și unei vacanțe de o săptămână.',
    sections: [
      {
        heading: 'Câte zile sunt suficiente',
        paragraphs: [
          'Pentru obiectivele esențiale (Sagrada Familia, Park Güell, Barrio Gótico, La Rambla), 3-4 zile sunt suficiente pentru un ritm relaxat, fără să alergi dintr-un loc în altul.',
          'Dacă vrei să adaugi și o zi de plajă sau o excursie la Montserrat, extinde la 5 zile.',
        ],
      },
      {
        heading: 'Cât costă zborul din București',
        paragraphs: [
          'Barcelona are curse directe frecvente din București, operate de mai multe companii low-cost, ceea ce ține prețurile relativ accesibile pe tot parcursul anului, cu excepția verii, când cererea (și prețul) urcă vizibil.',
          'Prețul curent, actualizat automat, e disponibil pe pagina noastră de Bilete.',
        ],
      },
      {
        heading: 'Cel mai bun moment de vizitat',
        paragraphs: [
          'Primăvara (aprilie-mai) și toamna (septembrie-octombrie) sunt ideale — vreme plăcută, fără căldura sufocantă și aglomerația turistică de vară.',
        ],
      },
    ],
  },
  {
    slug: 'zboruri-ieftine-bucuresti-atena',
    title: 'Zboruri ieftine București – Atena: prețuri și recomandări',
    metaDescription:
      'Ghid pentru zborurile București–Atena: prețuri, ce să vizitezi în oraș și cum să combini city break-ul cu o insulă grecească.',
    destination: 'Atena',
    heroImage: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=1200',
    publishedAt: '2026-08-31',
    intro:
      'Atena e adesea privită doar ca un punct de tranzit spre insulele grecești, dar orașul în sine — cu Acropole, cartierul Plaka și scena culinară vibrantă — merită cel puțin 2-3 zile de explorare înainte să continui spre plajă.',
    sections: [
      {
        heading: 'Preț și frecvența zborurilor',
        paragraphs: [
          'Fiind o rută scurtă și populară, București–Atena are curse frecvente, ceea ce înseamnă prețuri relativ accesibile pe tot parcursul anului, cu variații mai mici decât la destinațiile exclusiv de plajă.',
          'Verifică prețul curent pe pagina noastră de Bilete.',
        ],
      },
      {
        heading: 'Combină orașul cu o insulă',
        paragraphs: [
          'Din portul Pireu (ușor accesibil din Atena), feriboturile pleacă frecvent spre insule populare precum Santorini, Milos sau Egina — o combinație clasică e 2-3 zile în Atena, urmate de restul vacanței pe o insulă.',
        ],
      },
      {
        heading: 'Cel mai bun moment de vizitat',
        paragraphs: [
          'Mai-iunie și septembrie-octombrie oferă cel mai bun echilibru între vreme plăcută și aglomerație turistică rezonabilă — iulie-august pot fi foarte fierbinți pentru vizitarea Acropolei în plină zi.',
        ],
      },
    ],
  },
  {
    slug: 'vacanta-creta-heraklion-ghid',
    title: 'Vacanță în Creta (Heraklion): ghid complet pentru prima vizită',
    metaDescription:
      'Tot ce trebuie să știi despre o vacanță în Creta: cât costă zborul din București, cel mai bun sezon și ce să vizitezi pe cea mai mare insulă a Greciei.',
    destination: 'Creta (Heraklion)',
    heroImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200',
    publishedAt: '2026-08-31',
    intro:
      'Creta, cea mai mare insulă a Greciei, oferă o combinație rară: plaje spectaculoase, situri arheologice (precum Palatul Cnossos), munți pentru drumeții și o bucătărie locală apreciată în toată lumea. E genul de destinație unde o săptămână trece prea repede.',
    sections: [
      {
        heading: 'Zborul din București spre Heraklion',
        paragraphs: [
          'În sezonul de vară, există de obicei curse directe spre Heraklion; în extrasezon, poți avea nevoie de o escală, de obicei prin Atena.',
          'Verifică prețul curent pe pagina noastră de Bilete — inclusiv dacă zborul e direct sau nu.',
        ],
      },
      {
        heading: 'Ce să nu ratezi în Creta',
        paragraphs: [
          'Palatul minoic de la Cnossos, lângă Heraklion, e unul dintre cele mai importante situri arheologice din Grecia. Pentru plajă, Elafonissi (cu nisip roz) și Balos sunt printre cele mai fotogenice din întreaga insulă, deși necesită un drum mai lung din Heraklion.',
        ],
      },
      {
        heading: 'Sezonul recomandat',
        paragraphs: [
          'Mai-iunie și septembrie oferă vreme excelentă fără aglomerația de vârf; iulie-august sunt cele mai calde și mai aglomerate luni, dar și cele cu cea mai caldă apă de mare.',
        ],
      },
    ],
  },
  {
    slug: 'vacanta-malta-cate-zile-ce-vizitezi',
    title: 'Vacanță în Malta: câte zile ai nevoie și ce să vizitezi',
    metaDescription:
      'Ghid Malta pentru români: cât costă zborul din București, câte zile sunt suficiente și cele mai frumoase obiective ale arhipelagului.',
    destination: 'Malta',
    heroImage: 'https://images.unsplash.com/photo-1602940659805-770d1b3b9911?w=1200',
    publishedAt: '2026-08-31',
    intro:
      'Malta e mică — poți traversa toată insula principală în mai puțin de o oră cu mașina — dar densă în obiective: orașul-fortăreață Valletta, fosta capitală Mdina, și ape turcoaz în jurul insulei Comino (celebra Blue Lagoon).',
    sections: [
      {
        heading: 'Câte zile sunt suficiente',
        paragraphs: [
          '4-5 zile sunt suficiente pentru a vedea principalele obiective (Valletta, Mdina, Blue Lagoon) fără grabă, cu timp și pentru plajă.',
        ],
      },
      {
        heading: 'Prețul zborului din București',
        paragraphs: [
          'Malta are curse directe din București, mai ales în sezonul cald — prețul variază semnificativ între extrasezon și vârf de sezon (iulie-august).',
          'Verifică prețul curent pe pagina noastră de Bilete.',
        ],
      },
      {
        heading: 'Cel mai bun moment de vizitat',
        paragraphs: [
          'Malta are un sezon turistic relativ lung, datorită climei blânde mediteraneene — aprilie-iunie și septembrie-octombrie sunt alegeri excelente pentru vreme plăcută, fără căldura extremă de vară.',
        ],
      },
    ],
  },
  {
    slug: 'zboruri-ieftine-bucuresti-dubai',
    title: 'Zboruri ieftine București – Dubai: prețuri și sfaturi 2026',
    metaDescription:
      'Ghid pentru zborurile București–Dubai: prețuri, cel mai bun moment de vizitat și ce trebuie să știi înainte de o vacanță în Emiratele Arabe Unite.',
    destination: 'Dubai',
    heroImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200',
    publishedAt: '2026-08-31',
    intro:
      'Dubai a devenit, în ultimul deceniu, una dintre cele mai populare destinații long-haul pentru români — combinația de lux, arhitectură futuristă și plaje cu apă caldă tot anul o face atractivă atât pentru city break, cât și pentru vacanțe de plajă.',
    sections: [
      {
        heading: 'Cât costă un bilet spre Dubai',
        paragraphs: [
          'Fiind o rută long-haul (aproximativ 5 ore de zbor direct), prețul e, în mod natural, mai mare decât pentru destinațiile europene — dar variază considerabil în funcție de companie și de cât de din timp rezervi.',
          'Verifică prețul curent, actualizat automat, pe pagina noastră de Bilete.',
        ],
      },
      {
        heading: 'Cel mai bun moment de vizitat',
        paragraphs: [
          'Din noiembrie până în martie, temperaturile sunt plăcute (20-30°C) — ideal pentru sightseeing și activități în aer liber. Vara (iunie-august), temperaturile depășesc frecvent 40°C, ceea ce face vizitele în oraș dificile în afara orelor de seară.',
        ],
      },
      {
        heading: 'De reținut înainte de plecare',
        paragraphs: [
          'Cetățenii români pot intra în Emiratele Arabe Unite fără viză pentru șederi turistice scurte — verifică totuși cele mai recente reguli înainte de călătorie, întrucât politicile se pot schimba.',
          'Dubai are legi stricte privind comportamentul public și consumul de alcool (permis doar în locații licențiate) — informează-te înainte de plecare despre normele locale.',
        ],
      },
    ],
  },
  {
    slug: 'city-break-lisabona-ghid-complet',
    title: 'City break în Lisabona: ghid complet pentru români',
    metaDescription:
      'Tot ce trebuie să știi pentru un city break în Lisabona: preț zbor din București, câte zile ai nevoie și ce să vizitezi neapărat.',
    destination: 'Lisabona',
    heroImage: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200',
    publishedAt: '2026-08-31',
    intro:
      'Lisabona, cu tramvaiele ei istorice, cartierele colorate în pantă și prețurile încă rezonabile comparativ cu alte capitale vest-europene, s-a impus ca una dintre cele mai apreciate destinații de city break din ultimii ani.',
    sections: [
      {
        heading: 'Câte zile sunt suficiente',
        paragraphs: [
          '3-4 zile acoperă bine obiectivele esențiale (Belém, Alfama, Bairro Alto) — dacă vrei să adaugi și o excursie de o zi la Sintra (foarte recomandată), extinde la 5 zile.',
        ],
      },
      {
        heading: 'Prețul zborului din București',
        paragraphs: [
          'Ruta e deservită de curse directe, în general la prețuri accesibile pe tot parcursul anului, cu creșteri moderate vara.',
          'Verifică prețul curent pe pagina noastră de Bilete.',
        ],
      },
      {
        heading: 'Cel mai bun moment de vizitat',
        paragraphs: [
          'Lisabona are o climă blândă tot anul, dar primăvara (martie-mai) și toamna (septembrie-octombrie) oferă cel mai bun echilibru între vreme și prețuri, evitând căldura și aglomerația de vârf de vară.',
        ],
      },
    ],
  },
  {
    slug: 'vacanta-rhodos-ghid-plaja-obiective',
    title: 'Vacanță în Rhodos: plaje, obiective și cel mai bun sezon',
    metaDescription:
      'Ghid Rhodos pentru români: cât costă zborul din București, cele mai frumoase plaje și obiective, și cel mai bun moment pentru vacanță.',
    destination: 'Rhodos',
    heroImage: 'https://images.unsplash.com/photo-1601581875039-e899893d520c?w=1200',
    publishedAt: '2026-08-31',
    intro:
      'Rhodos combină plajele întinse din partea de est a insulei cu orașul medieval Rhodos (inclus în patrimoniul UNESCO) — o alegere solidă pentru cei care vor și relaxare, și puțină istorie în aceeași vacanță.',
    sections: [
      {
        heading: 'Prețul zborului din București',
        paragraphs: [
          'În sezonul de vară, curse directe leagă frecvent Bucureștiul de Rhodos; în afara sezonului, opțiunile scad și pot necesita o escală.',
          'Verifică prețul curent, actualizat automat, pe pagina noastră de Bilete.',
        ],
      },
      {
        heading: 'Ce să vizitezi',
        paragraphs: [
          'Orașul Vechi din Rhodos (UNESCO) merită cel puțin o zi întreagă de explorare pe jos. Pentru plajă, Tsambika și Anthony Quinn Bay sunt printre cele mai apreciate, cu ape limpezi și peisaj spectaculos.',
        ],
      },
      {
        heading: 'Sezonul recomandat',
        paragraphs: [
          'Iunie și septembrie oferă cel mai bun raport vreme-aglomerație; iulie-august sunt cele mai calde luni, cu cea mai caldă apă de mare, dar și cele mai aglomerate stațiuni.',
        ],
      },
    ],
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
