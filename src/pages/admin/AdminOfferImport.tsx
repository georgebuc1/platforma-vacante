import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Download, ArrowLeft, CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { parseOffersCsv, buildCsvTemplate, type ParsedRow } from '@/utils/csvImport';
import { getExistingSlugs, saveOffer } from '@/services/storageService';
import { showToast } from '@/components/common/Toast';

export default function AdminOfferImport() {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

  const validRows = rows.filter((r) => r.errors.length === 0);
  const invalidRows = rows.filter((r) => r.errors.length > 0);

  const handleDownloadTemplate = () => {
    const blob = new Blob([buildCsvTemplate()], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'model-import-oferte.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParsing(true);
    setImportResults(null);

    try {
      const text = await file.text();
      const existingSlugs = await getExistingSlugs();
      const parsed = parseOffersCsv(text, existingSlugs);
      setRows(parsed);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Fișierul nu a putut fi citit.', 'error');
    } finally {
      setParsing(false);
      e.target.value = '';
    }
  };

  const handleImport = async () => {
    if (validRows.length === 0) return;
    setImporting(true);
    let success = 0;
    const errors: string[] = [];

    for (const row of validRows) {
      if (!row.offer) continue;
      try {
        await saveOffer(row.offer);
        success++;
      } catch (err) {
        errors.push(`Rândul ${row.rowNumber} ("${row.offer.title}"): ${err instanceof Error ? err.message : 'eroare necunoscută'}`);
      }
    }

    setImporting(false);
    setImportResults({ success, failed: errors.length, errors });
    setRows([]);
    if (success > 0) showToast(`${success} oferte importate cu succes.`, 'success');
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <Link to="/admin/oferte" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Înapoi la Oferte
      </Link>

      <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Import în masă (CSV)</h1>
      <p className="text-slate-500 text-sm mb-6">
        Adaugă mai multe oferte deodată dintr-un fișier CSV, în loc să completezi formularul una câte una.
      </p>

      {/* Step 1: template */}
      <div className="card p-5 mb-5">
        <h2 className="font-bold text-slate-800 mb-1">1. Descarcă modelul CSV</h2>
        <p className="text-sm text-slate-500 mb-3">
          Fișierul are un rând de exemplu completat — șterge-l sau păstrează-l ca referință, apoi adaugă ofertele tale sub el, câte un rând per ofertă.
        </p>
        <button onClick={handleDownloadTemplate} className="btn-primary text-sm">
          <Download className="h-4 w-4" /> Descarcă model-import-oferte.csv
        </button>
      </div>

      {/* Step 2: upload */}
      <div className="card p-5 mb-5">
        <h2 className="font-bold text-slate-800 mb-1">2. Încarcă fișierul completat</h2>
        <p className="text-sm text-slate-500 mb-3">Selectează fișierul CSV salvat pe calculatorul tău.</p>

        <label className="inline-flex items-center gap-2 btn text-sm px-4 py-2.5 border border-slate-200 hover:bg-slate-50 cursor-pointer">
          <Upload className="h-4 w-4" />
          {fileName || 'Alege fișier CSV'}
          <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
        </label>

        {parsing && (
          <div className="flex items-center gap-2 mt-3 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Se citește fișierul...
          </div>
        )}
      </div>

      {/* Step 3: preview + import */}
      {rows.length > 0 && (
        <div className="card p-5 mb-5">
          <h2 className="font-bold text-slate-800 mb-3">3. Verifică și importă</h2>

          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-success-700 bg-success-50 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="h-4 w-4" /> {validRows.length} oferte valide
            </div>
            {invalidRows.length > 0 && (
              <div className="flex items-center gap-1.5 text-sm font-semibold text-error-700 bg-error-50 px-3 py-1.5 rounded-lg">
                <XCircle className="h-4 w-4" /> {invalidRows.length} rânduri cu erori (nu vor fi importate)
              </div>
            )}
          </div>

          {invalidRows.length > 0 && (
            <div className="mb-4 border border-error-100 rounded-lg overflow-hidden">
              <div className="bg-error-50 px-4 py-2 text-sm font-semibold text-error-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Rânduri cu probleme — corectează-le în fișier și reîncarcă
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {invalidRows.map((row) => (
                  <div key={row.rowNumber} className="px-4 py-2.5 text-sm">
                    <span className="font-semibold text-slate-700">Rândul {row.rowNumber}</span>
                    {row.raw.title && <span className="text-slate-500"> ({row.raw.title})</span>}
                    <ul className="mt-1 space-y-0.5">
                      {row.errors.map((err, i) => (
                        <li key={i} className="text-error-600 text-xs">• {err}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {validRows.length > 0 && (
            <div className="mb-4 border border-slate-100 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                Previzualizare oferte valide
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {validRows.map((row) => (
                  <div key={row.rowNumber} className="px-4 py-2 text-sm flex items-center justify-between gap-3">
                    <span className="text-slate-700 truncate">{row.offer?.title}</span>
                    <span className="text-slate-400 text-xs shrink-0">{row.offer?.destination}, {row.offer?.country}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={validRows.length === 0 || importing}
            className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Se importă...</>
            ) : (
              <>Importă {validRows.length} oferte valide</>
            )}
          </button>
        </div>
      )}

      {/* Results */}
      {importResults && (
        <div className={`card p-5 ${importResults.failed > 0 ? 'border-warning-200' : 'border-success-200'}`}>
          <h2 className="font-bold text-slate-800 mb-2">Rezultat import</h2>
          <p className="text-sm text-success-700">{importResults.success} oferte importate cu succes.</p>
          {importResults.failed > 0 && (
            <>
              <p className="text-sm text-error-700 mt-1">{importResults.failed} oferte nu au putut fi salvate:</p>
              <ul className="mt-1 space-y-0.5">
                {importResults.errors.map((err, i) => (
                  <li key={i} className="text-error-600 text-xs">• {err}</li>
                ))}
              </ul>
            </>
          )}
          <Link to="/admin/oferte" className="btn-primary text-sm mt-4 inline-flex">
            Vezi ofertele importate
          </Link>
        </div>
      )}
    </div>
  );
}
