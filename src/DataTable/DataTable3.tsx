import { useState } from 'react';

type User = { id: number; name: string; age: number };

const USERS: User[] = [
  { id: 1, name: 'Asha', age: 34 },
  { id: 2, name: 'Ravi', age: 28 },
  { id: 3, name: 'Meera', age: 41 },
  { id: 4, name: 'Kiran', age: 25 },
  { id: 5, name: 'Divya', age: 30 },
  { id: 6, name: 'Arjun', age: 37 },
];

function DataTable3() {
  const [query, setQuery] = useState<string>('');
  // const [sort, setSort] = useState();

  return (
    <>
      <input type="text" onChange={(e) => setQuery(e.target.value)} />
      <table className="table">
        <tr>
          <th>Name</th>
          <th>Age</th>
          <th>{query}</th>
        </tr>
        {USERS.map((data, id) => (
          <tr key={id}>
            <th>{data.name}</th>
            <th>{data.age}</th>
          </tr>
        ))}
        {/* <tr>
          <td>Name</td>
          <td>Age</td>
        </tr> */}
      </table>
    </>
  );
}

export default DataTable3;
