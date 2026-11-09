 /* CSS is unchanged from before.
What changed versus the manual version: no useEffect, no AbortController, no users/total/loading/error state. 
useQuery gives you isLoading/isError directly, the queryKey (['users', page, debouncedQuery, sort]) 
refetches whenever page, search, or sort changes, and results are cached per key — 
so going back to a page you already visited is instant.
*/

import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import './DataTable.scss';

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

// Fetch one page; returns the rows plus the total across all pages.
async function fetchUsers(page: number, query: string, sort: Sort, signal: AbortSignal) {
  const params = new URLSearchParams({
    _page: String(page + 1), // API pages are 1-based
    _limit: String(PAGE_SIZE),
    _sort: sort.key,
    _order: sort.dir,
  });
  if (query.trim()) params.set('q', query.trim());
  const res = await fetch(`${API}?${params}`, { signal });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  const total = Number(res.headers.get('x-total-count') ?? 0);
  const users: User[] = await res.json();
  return { users, total };
}

// Sortable column header.
function SortHeader({ label, sortKey, sort, onSort }: {
  label: string; sortKey: Sort['key']; sort: Sort; onSort: (k: Sort['key']) => void;
}) {
  const active = sort.key === sortKey;
  const arrow = !active ? '' : sort.dir === 'asc' ? ' ▲' : ' ▼';
  return (
    <th aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button type="button" className="sort-btn" onClick={() => onSort(sortKey)}>
        {label}{arrow}
      </button>
    </th>
  );
}

export default function DataTable3() {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>({ key: 'name', dir: 'asc' });
  const [page, setPage] = useState(0);

  const debouncedQuery = useDebounce(query, 400);

  // React Query owns fetching, caching, and loading/error state.
  // keepPreviousData keeps the old page visible while the next one loads.
  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ['users', page, debouncedQuery, sort],
    queryFn: ({ signal }) => fetchUsers(page, debouncedQuery, sort, signal),
    placeholderData: keepPreviousData,
  });

  function toggleSort(key: Sort['key']) {
    setSort(prev => prev.key === key
      ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
      : { key, dir: 'asc' });
    setPage(0); // new sort order, restart at page 1
  }

  function onFilter(value: string) {
    setQuery(value);
    setPage(0);
  }

  // Derived render data computed before the return.
  const users = data?.users ?? [];
  const pageCount = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  const bodyRows = isLoading
    ? <tr><td colSpan={2} className="empty">Loading…</td></tr>
    : isError
      ? <tr><td colSpan={2} className="empty">Failed to load users.</td></tr>
      : users.length === 0
        ? <tr><td colSpan={2} className="empty">No results</td></tr>
        : users.map(u => <tr key={u.id}><td>{u.name}</td><td>{u.email}</td></tr>);

  return (
    <div className="table-wrap">
      <input
        className="filter"
        value={query}
        onChange={e => onFilter(e.target.value)}
        placeholder="Search users"
        aria-label="Search users"
      />
      <table className="table">
        <thead>
          <tr>
            <SortHeader label="Name" sortKey="name" sort={sort} onSort={toggleSort} />
            <SortHeader label="Email" sortKey="email" sort={sort} onSort={toggleSort} />
          </tr>
        </thead>
        <tbody>{bodyRows}</tbody>
      </table>
      <div className="pager">
        <button type="button" disabled={page === 0 || isFetching} onClick={() => setPage(page - 1)}>Prev</button>
        <span>Page {page + 1} of {pageCount}</span>
        <button type="button" disabled={page === pageCount - 1 || isFetching} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}
