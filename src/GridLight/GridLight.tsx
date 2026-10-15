import { useEffect, useState } from 'react';
import './GridLight.scss';
import LightGrid from './LightGrid';

// Single cell: class-only styling, no inline styles.
function Cell({
  lit,
  busy,
  onLight,
}: {
  lit: boolean;
  busy: boolean;
  onLight: () => void;
}) {
  return (
    <button
      type="button"
      className={lit ? 'cell cell-lit' : 'cell'}
      onClick={onLight}
      disabled={busy}
      aria-pressed={lit}
    />
  );
}

export default function GridLightBox() {
  const N = 3; // NxN grid
  const total = N * N;
  const [order, setOrder] = useState<number[]>([]); // lit cells, in click order
  const [busy, setBusy] = useState(false); // true while unlighting in reverse

  // Light a cell; ignore repeats and clicks during the unlight sequence.
  function light(i: number) {
    if (busy || order.includes(i)) return;
    const next = [...order, i];
    setOrder(next);
    if (next.length === total) setBusy(true); // all lit -> start unlighting
  }

  // Every 500ms drop the last lit cell; stops once the grid is empty.
  useEffect(() => {
    if (!busy) return;
    if (order.length === 0) {
      setBusy(false);
      return;
    } // sequence finished
    const t = setTimeout(() => setOrder((prev) => prev.slice(0, -1)), 500);
    return () => clearTimeout(t); // cleanup on re-run and unmount
  }, [busy, order]);

  // Build cell data before the return: no logic inside the JSX.
  const cells = Array.from({ length: total }, (_, i) => ({
    id: i,
    lit: order.includes(i),
  }));

  return (
    <>
      <div className="grid">
        {cells.map(({ id, lit }) => (
          <Cell key={id} lit={lit} busy={busy} onLight={() => light(id)} />
        ))}
      </div>

      <LightGrid />
    </>
  );
}
