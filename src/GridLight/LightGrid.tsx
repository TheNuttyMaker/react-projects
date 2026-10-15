import { useEffect, useState } from 'react';

function LightGrid() {
  const N = 3;
  const total = N * N;
  const [order, setOrder] = useState<number[]>([]);
  const [busy, setBusy] = useState<boolean>(false);

  function light(id: number) {
    if (busy || order.includes(id)) return;

    const newOrder = [...order, id];
    setOrder(newOrder);
    if (newOrder.length === total) setBusy(true);
  }

  useEffect(() => {
    if (!busy) return;
    if (order.length === 0) {
      setBusy(false);
      return;
    }

    const t = setTimeout(() => {
      setOrder(order.toSpliced(-1, 1));
    }, 500);

    return () => clearTimeout(t);
  }, [busy, order]);

  const cells = Array.from({ length: total }, (_, id) => ({
    id,
    lit: order.includes(id),
  }));

  return (
    <div className="grid">
      {cells.map(({ lit }, id) => (
        <button
          className={lit ? 'cell red' : 'cell'}
          onClick={() => light(id)}
        ></button>
      ))}
    </div>
  );
}

export default LightGrid;
