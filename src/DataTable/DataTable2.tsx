import { useMemo, useState } from 'react';
import './DataTable.scss';

type User = { id: number; name: string; age: number };
type Sort = { key: 'name' | 'age'; dir: 'asc' | 'desc' };

const USERS: User[] = [
  { id: 1, name: 'Asha', age: 34 },
  { id: 2, name: 'Ravi', age: 28 },
  { id: 3, name: 'Meera', age: 41 },
  { id: 4, name: 'Kiran', age: 25 },
  { id: 5, name: 'Divya', age: 30 },
  { id: 6, name: 'Arjun', age: 37 },
];

const PAGE_SIZE = 3;

// Sortable column header; keeps sort UI logic out of the table body.
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

export default function DataTable2() {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>({ key: 'name', dir: 'asc' });
  const [page, setPage] = useState(0);

  function toggleSort(key: Sort['key']) {
    // Same column: flip direction; new column: start ascending.
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );
    setPage(0); // sort/filter change the row order, so restart at page 1
  }

  function onFilter(value: string) {
    setQuery(value);
    setPage(0);
  }

  // All derived data computed here — the JSX only renders.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return USERS;
    return USERS.filter(
      (u) => u.name.toLowerCase().includes(q) || String(u.age).includes(q)
    );
  }, [query]);

  const sorted = useMemo(() => {
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const x = a[sort.key],
        y = b[sort.key];
      return (x < y ? -1 : x > y ? 1 : 0) * dir; // works for strings and numbers
    });
  }, [filtered, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1); // clamp if filtering shrinks the pages
  const rows = sorted.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE
  );

  const bodyRows =
    rows.length === 0 ? (
      <tr>
        <td colSpan={2} className="empty">
          No results
        </td>
      </tr>
    ) : (
      rows.map((u) => (
        <tr key={u.id}>
          <td>{u.name}</td>
          <td>{u.age}</td>
        </tr>
      ))
    );

  return (
    <div className="table-wrap mt-30">
      <input
        className="filter"
        value={query}
        onChange={(e) => onFilter(e.target.value)}
        placeholder="Filter by name or age"
        aria-label="Filter rows"
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
              label="Age"
              sortKey="age"
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
          disabled={safePage === 0}
          onClick={() => setPage(safePage - 1)}
        >
          Prev
        </button>
        <span>
          Page {safePage + 1} of {pageCount}
        </span>
        <button
          type="button"
          disabled={safePage === pageCount - 1}
          onClick={() => setPage(safePage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
