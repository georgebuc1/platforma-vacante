import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DateRangePickerProps {
  departDate: string; // YYYY-MM-DD
  returnDate: string; // YYYY-MM-DD
  onChange: (departDate: string, returnDate: string) => void;
}

const WEEKDAY_LABELS = ['lun.', 'mar.', 'mie.', 'joi', 'vin.', 'sâm.', 'dum.'];
const MONTH_LABELS = [
  'ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie',
  'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie',
];

function toISO(d: Date): string {
  // IMPORTANT: nu folosim d.toISOString() aici — acea metodă convertește data
  // în UTC înainte de a o transforma în text, ceea ce în România (UTC+2/UTC+3)
  // face ca miezul nopții local să devină ziua PRECEDENTĂ în UTC, salvând astfel
  // o zi greșită. Construim string-ul direct din anul/luna/ziua locale.
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parsează un string "YYYY-MM-DD" ca dată LOCALĂ, evitând ca new Date(string)
// să interpreteze data ca miezul nopții UTC (ceea ce ar putea afișa/compara
// ziua greșită în fusul orar local).
export function parseLocalDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Days of a month laid out as a Monday-first grid, with leading/trailing nulls for padding. */
function buildMonthGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlank = (first.getDay() + 6) % 7; // Monday = 0

  const cells: (Date | null)[] = Array(leadingBlank).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day));
  }
  return cells;
}

export default function DateRangePicker({ departDate, returnDate, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'calendar' | 'flexible'>('calendar');
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedDepart = departDate ? startOfDay(parseLocalDate(departDate)) : null;
  const selectedReturn = returnDate ? startOfDay(parseLocalDate(returnDate)) : null;
  const today = startOfDay(new Date());

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const goToPrevMonth = () => {
    const d = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };
  const goToNextMonth = () => {
    const d = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const handleDayClick = (day: Date) => {
    if (day < today) return;

    // Same picking logic as Booking: no selection (or a completed range) ->
    // start a fresh check-in; a check-in with no check-out yet -> this
    // click completes the range (or restarts it if the day is before check-in).
    if (!selectedDepart || (selectedDepart && selectedReturn)) {
      onChange(toISO(day), '');
      return;
    }
    if (day < selectedDepart) {
      onChange(toISO(day), '');
      return;
    }
    onChange(toISO(selectedDepart), toISO(day));
    setOpen(false);
  };

  const isInRange = (day: Date) =>
    !!selectedDepart && !!selectedReturn && day > selectedDepart && day < selectedReturn;
  const isEndpoint = (day: Date) =>
    (!!selectedDepart && day.getTime() === selectedDepart.getTime()) ||
    (!!selectedReturn && day.getTime() === selectedReturn.getTime());

  const applyFlexible = (nights: number) => {
    const base = selectedDepart && selectedDepart >= today ? selectedDepart : today;
    const end = new Date(base);
    end.setDate(end.getDate() + nights);
    onChange(toISO(base), toISO(end));
    setOpen(false);
  };

  const renderMonth = (year: number, month: number) => (
    <div className="flex-1 min-w-[240px]">
      <p className="text-center text-sm font-bold text-slate-800 mb-3 capitalize">
        {MONTH_LABELS[month]} {year}
      </p>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAY_LABELS.map((w) => (
          <span key={w} className="text-[11px] font-medium text-slate-400">{w}</span>
        ))}
        {buildMonthGrid(year, month).map((day, i) => {
          if (!day) return <span key={i} />;
          const disabled = day < today;
          const endpoint = isEndpoint(day);
          const inRange = isInRange(day);
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => handleDayClick(day)}
              className={`h-8 w-8 mx-auto text-sm rounded-full transition-colors
                ${disabled ? 'text-slate-300 cursor-not-allowed' : 'text-slate-700 hover:bg-cta-50'}
                ${endpoint ? 'bg-cta-500 text-white hover:bg-cta-500 font-semibold' : ''}
                ${inRange ? 'bg-cta-50 rounded-none' : ''}
              `}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );

  const nextMonthDate = new Date(viewYear, viewMonth + 1, 1);

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 px-4 h-14 text-left"
      >
        <div className="flex-1 min-w-0">
          <label className="block text-[11px] font-medium text-slate-500 leading-tight">
            Selectați datele
          </label>
          <span className="block truncate text-sm font-semibold text-slate-800">
            {departDate ? parseLocalDate(departDate).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' }) : 'Dată check-in'}
            {'  \u2014  '}
            {returnDate ? parseLocalDate(returnDate).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' }) : 'Dată check-out'}
          </span>
        </div>
      </button>

      {open && (
        <div className="absolute z-30 mt-1 left-0 right-0 lg:right-auto lg:w-[640px] rounded-lg border border-slate-200 bg-white shadow-lg p-4">
          <div className="flex items-center gap-6 border-b border-slate-100 mb-4">
            <button
              type="button"
              onClick={() => setTab('calendar')}
              className={`pb-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                tab === 'calendar' ? 'border-cta-500 text-cta-600' : 'border-transparent text-slate-500'
              }`}
            >
              Calendar
            </button>
            <button
              type="button"
              onClick={() => setTab('flexible')}
              className={`pb-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                tab === 'flexible' ? 'border-cta-500 text-cta-600' : 'border-transparent text-slate-500'
              }`}
            >
              Date flexibile
            </button>
          </div>

          {tab === 'calendar' && (
            <>
              <div className="flex items-center justify-between mb-2">
                <button type="button" onClick={goToPrevMonth} className="p-1.5 rounded-full hover:bg-slate-100">
                  <ChevronLeft className="h-4 w-4 text-slate-500" />
                </button>
                <button type="button" onClick={goToNextMonth} className="p-1.5 rounded-full hover:bg-slate-100 ml-auto">
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-6">
                {renderMonth(viewYear, viewMonth)}
                {renderMonth(nextMonthDate.getFullYear(), nextMonthDate.getMonth())}
              </div>
            </>
          )}

          {tab === 'flexible' && (
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3">Opțiuni cu date flexibile</p>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 7].map((nights) => (
                  <button
                    key={nights}
                    type="button"
                    onClick={() => applyFlexible(nights)}
                    className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-700 hover:border-cta-500 hover:text-cta-600 transition-colors"
                  >
                    {nights} {nights === 1 ? 'zi' : 'zile'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Pornim de la {selectedDepart && selectedDepart >= today ? toISO(selectedDepart) : 'data de azi'} și calculăm automat data de check-out.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
