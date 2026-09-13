import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { searchAgodaCities, type AgodaCityOption } from '@/services/agodaCityLookupService';

interface AgodaLocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (location: AgodaCityOption) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}

export default function AgodaLocationAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Caută un oraș',
  ariaLabel = 'Locație',
  className = 'input-field',
}: AgodaLocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AgodaCityOption[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const query = value.trim();
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = window.setTimeout(() => {
      searchAgodaCities(query, 8).then((matches) => {
        if (!cancelled) {
          setSuggestions(matches);
          setOpen(true);
        }
      });
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [value]);

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className={className}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
          {suggestions.map((suggestion) => (
            <button
              key={`${suggestion.agodaCityId}-${suggestion.city}`}
              type="button"
              onClick={() => {
                onChange(suggestion.city);
                onSelect?.(suggestion);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left hover:bg-brand-50 dark:hover:bg-slate-800"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-100">
                <MapPin className="h-4 w-4 shrink-0 text-brand-500" />
                {suggestion.city}
              </span>
              <span className="text-xs text-slate-400">{suggestion.country}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
