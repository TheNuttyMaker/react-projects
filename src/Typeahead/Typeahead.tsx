/*The senior signals an interviewer reads here: debounced input plus AbortController (no race conditions), effect cleanup on unmount, full keyboard support with proper combobox ARIA roles, and explicit loading/error/empty states.

If they push further in the hour, the natural extensions are highlighting the matched substring, closing on outside click, and caching results per query. Want me to add any of those, or run through it as a mock round where I play interviewer and you drive?
import { useEffect, useState } from 'react';

type Suggestion = { id: number; name: string };
*/

import { useEffect, useState } from 'react';

type Suggestion = { id: number; name: string };

const CITIES = [
  'Amsterdam',
  'Rotterdam',
  'Utrecht',
  'Eindhoven',
  'Groningen',
  'Maastricht',
  'The Hague',
  'Breda',
  'Nijmegen',
  'Haarlem',
];

// Stand-in for fetch(). Honors the AbortSignal so a cancelled request
// never resolves — the same contract as fetch(url, { signal }).
function searchCities(
  query: string,
  signal: AbortSignal
): Promise<Suggestion[]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const q = query.toLowerCase();
      resolve(
        CITIES.filter((c) => c.toLowerCase().includes(q)).map((name, i) => ({
          id: i,
          name,
        }))
      );
    }, 500); // fake network latency

    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

// Only updates the returned value after `delay` ms with no changes,
// so we don't fire an API call on every keystroke.
function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer); // restart the wait on each keystroke
  }, [value, delay]);

  return debounced;
}

function Typeahead() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1); // -1 = nothing highlighted

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (q.length < 2) {
      setSuggestions([]); // too short to search: reset everything
      setOpen(false);
      setLoading(false);
      return;
    }

    // Cancel the previous request so a slow response can't
    // overwrite results for the newer query (race condition).
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    searchCities(q, controller.signal)
      .then((results) => {
        setSuggestions(results);
        setOpen(true);
        setActiveIndex(-1); // fresh results, reset highlight
      })
      .catch((err) => {
        if ((err as Error).name === 'AbortError') return; // cancellation is expected
        setError('Something went wrong. Try again.');
      })
      .finally(() => setLoading(false));

    return () => controller.abort(); // abort on next keystroke or unmount
  }, [debouncedQuery]);

  function select(s: Suggestion) {
    setQuery(s.name);
    setOpen(false);
    setActiveIndex(-1);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault(); // keep the caret in the input
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
      setOpen(true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0) select(suggestions[activeIndex]);
      else setOpen(false);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div>
      <label htmlFor="city-search">City</label>
      <input
        id="city-search"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Type at least 2 characters"
        autoComplete="off" // stop browser suggestions overlapping ours
        role="combobox"
        aria-expanded={open}
        aria-controls="city-listbox"
        aria-activedescendant={
          activeIndex >= 0
            ? `city-option-${suggestions[activeIndex].id}`
            : undefined
        }
      />
      {loading && <p>Loading…</p>}
      {error && <p role="alert">{error}</p>}
      {open && !loading && suggestions.length === 0 && <p>No results</p>}
      {open && suggestions.length > 0 && (
        <ul id="city-listbox" role="listbox">
          {suggestions.map((s, i) => (
            <li
              key={s.id}
              id={`city-option-${s.id}`}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={() => select(s)} // fires before blur, unlike onClick
              style={{
                background: i === activeIndex ? '#eee' : 'transparent',
                cursor: 'pointer',
              }}
            >
              {s.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Typeahead;
