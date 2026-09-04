import { useEffect } from 'react';

interface AgodaSherpaConfig {
  crt: string;
  version: string;
  id: string;
  name: string;
  width: string;
  height: string;
  ReferenceKey: string;
  Layout: string;
  Language: string;
  Cid: string;
  DestinationName: string;
  OverideConf: boolean;
}

declare global {
  interface Window {
    AgdSherpa?: new (config: AgodaSherpaConfig) => {
      initialize: () => void;
    };
  }
}

const AGODA_CONTAINER_ID = 'adgshp1601562737';
const AGODA_SCRIPT_ID = 'agoda-sherpa-script';
const AGODA_SCRIPT_SRC = 'https://cdn0.agoda.net/images/sherpa/js/sherpa_init1_08.min.js';

function initializeAgoda() {
  if (!window.AgdSherpa) return;

  const container = document.getElementById(AGODA_CONTAINER_ID);
  if (!container || container.dataset.agodaInitialized === 'true') return;

  const stg: AgodaSherpaConfig = {
    crt: '5486814187742',
    version: '1.04',
    id: AGODA_CONTAINER_ID,
    name: AGODA_CONTAINER_ID,
    width: '1072px',
    height: '304px',
    ReferenceKey: 'KQRZbpWLVI4lEAvV27V8Ig==',
    Layout: 'Oneline',
    Language: 'ro-ro',
    Cid: '1972943',
    DestinationName: '',
    OverideConf: false,
  };

  new window.AgdSherpa(stg).initialize();
  container.dataset.agodaInitialized = 'true';
}

export default function HeroSearchBar() {
  useEffect(() => {
    // Agoda's generated widget code is script-based. Load it once and
    // initialize the widget after the external library becomes available.
    const existingScript = document.getElementById(AGODA_SCRIPT_ID) as HTMLScriptElement | null;

    if (window.AgdSherpa) {
      initializeAgoda();
      return;
    }

    if (existingScript) {
      existingScript.addEventListener('load', initializeAgoda);
      return () => existingScript.removeEventListener('load', initializeAgoda);
    }

    const script = document.createElement('script');
    script.id = AGODA_SCRIPT_ID;
    script.type = 'text/javascript';
    script.src = AGODA_SCRIPT_SRC;
    script.async = true;
    script.onload = initializeAgoda;
    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, []);

  return (
    <div className="w-full overflow-x-auto rounded-lg [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div
        id={AGODA_CONTAINER_ID}
        className="mx-auto min-w-[1072px]"
        aria-label="Căutare cazare Agoda"
      />
    </div>
  );
}
