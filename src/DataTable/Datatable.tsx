import { useEffect, useState } from 'react';
import './DataTable.scss';
import DataTable3 from './DataTable3';

type User = { id: number; name: string; email: string };
type Sort = { key: 'name' | 'email'; dir: 'asc' | 'desc' };

const PAGE_SIZE = 5;
const API = 'https://jsonplaceholder.typicode.com/users';

// Debounce the filter text so we don't fire a request per keystroke.
function useDebounce(value: string, ms: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

// Sortable column header.
function SortHeader({
  label,
  sortKey,
  sort,
  onSort,
}: {
  label: string;
  sortKey: Sort['key'];
  sort: Sort;
  onSort: (k: Sort['key']) => void;
}) {
  const active = sort.key === sortKey;
  const arrow = !active ? '' : sort.dir === 'asc' ? ' ▲' : ' ▼';
  return (
    <th
      aria-sort={
        active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'
      }
    >
      <button
        type="button"
        className="sort-btn"
        onClick={() => onSort(sortKey)}
      >
        {label}
        {arrow}
      </button>
    </th>
  );
}

export default function DataTable() {
  const [users, setUsers] = useState<User[]>([]); // current page only
  const [total, setTotal] = useState(0); // total across all pages, from the API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>({ key: 'name', dir: 'asc' });
  const [page, setPage] = useState(0);

  const debouncedQuery = useDebounce(query, 400);

  // Fetch one page; sort/filter/pagination all happen server-side via query params.
  useEffect(() => {
    const controller = new AbortController(); // cancel stale in-flight requests
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          _page: String(page + 1), // API pages are 1-based
          _limit: String(PAGE_SIZE),
          _sort: sort.key,
          _order: sort.dir,
        });
        if (debouncedQuery.trim()) params.set('q', debouncedQuery.trim());
        const res = await fetch(`${API}?${params}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        setTotal(Number(res.headers.get('x-total-count') ?? 0));
        setUsers(await res.json());
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return; // superseded request
        setError('Failed to load users.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort(); // cleanup on re-run and unmount
  }, [page, debouncedQuery, sort]);

  function toggleSort(key: Sort['key']) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );
    setPage(0); // new sort order, restart at page 1
  }

  function onFilter(value: string) {
    setQuery(value);
    setPage(0);
  }

  // Derived render data computed before the return.
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const bodyRows = loading ? (
    <tr>
      <td colSpan={2} className="empty">
        Loading…
      </td>
    </tr>
  ) : error ? (
    <tr>
      <td colSpan={2} className="empty">
        {error}
      </td>
    </tr>
  ) : users.length === 0 ? (
    <tr>
      <td colSpan={2} className="empty">
        No results
      </td>
    </tr>
  ) : (
    users.map((u) => (
      <tr key={u.id}>
        <td>{u.name}</td>
        <td>{u.email}</td>
      </tr>
    ))
  );

  return (
    <>
      <div className="table-wrap">
        <input
          className="filter"
          value={query}
          onChange={(e) => onFilter(e.target.value)}
          placeholder="Search users"
          aria-label="Search users"
        />
        <table className="table">
          <thead>
            <tr>
              <SortHeader
                label="Name"
                sortKey="name"
                sort={sort}
                onSort={toggleSort}
              />
              <SortHeader
                label="Email"
                sortKey="email"
                sort={sort}
                onSort={toggleSort}
              />
            </tr>
          </thead>
          <tbody>{bodyRows}</tbody>
        </table>
        <div className="pager">
          <button
            type="button"
            disabled={page === 0 || loading}
            onClick={() => setPage(page - 1)}
          >
            Prev
          </button>
          <span>
            Page {page + 1} of {pageCount}
          </span>
          <button
            type="button"
            disabled={page === pageCount - 1 || loading}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
      <DataTable3 />
    </>
  );
}
