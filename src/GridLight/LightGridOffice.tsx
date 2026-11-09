import {useCallback, useEffect, useState } from 'react';


// We now uses functional components. Class components are now deprecated
// In functional components, Arrow functions are preferred.
// you can't use default while declaring fuctional components.
// so use named export and then export them later, marking default for one of the export.
import './LightGridOffice.scss'

const LightGrid = () => {
  const N = 9;
  const [order, setOrder] = useState([]);
  const [busy, setBusy] = useState(false);

  const boxes = Array.from({ length: 9 }, (_, ind) => ({ lit: order.includes(ind), ind }));

  useEffect(() => {
    if (!busy) return;

    if(order.length === 0) setBusy(false);

    const timeout = setTimeout(() => {
      setOrder(order.toSpliced(-1))
    }, 200);

  return () => clearTimeout(timeout);

  }, [busy, order])


  // In React, state variables like order act as constant snapshots during a single render. 
  // Calling setOrder(...) schedules an update for the next render, but it does not change 
  // the value of the order variable inside your currently running function.
  const handleCellClick = useCallback((ind) => {
    if(ind >= N || order.includes(ind)) return;
    const newOrder = [...order, ind];
    setOrder(newOrder);

    if(newOrder.length === N) setBusy(true);
  }, [order, N]);



  return <div className='boxes'>
    {boxes.map((item, ind) => (<div className={item.lit ? 'box red' : 'box'} onClick={() => handleCellClick(ind)}></div>))}
  </div>
}


export const LightUpTheGrid = () => {
  const N = 9;
  const [order, setOrder] = useState([]);

  const boxes = Array.from({ length: 9 }, (_, ind) => ({ lit: order.includes(ind), ind }));


  const handleCellClick = useCallback((ind) => {
    if(ind >= N || order.includes(ind)) return;
    setOrder([...order, ind]);
  })



  return <div className='boxes'>
    {boxes.map((item, ind) => (<div className={item.lit ? 'box red' : 'box'} onClick={() => handleCellClick(ind)}></div>))}
  </div>
}


export function LightGridOriginal() {
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
