import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import './index.scss';
import App from './App';
import Header from './Header';
import Typeahead from './Typeahead/Typeahead';
import DataTable from './DataTable/Datatable';
import { NavLink } from 'react-router-dom';
import GridLightBox from './GridLight/GridLight';

const queryClient = new QueryClient();

function Root() {
  return (
    <>
      <div className="links red">
        <NavLink to="/typeahead">Typeahead</NavLink>
        <NavLink to="/datatable">Datatable</NavLink>
        <NavLink to="/grid-light">GridLight</NavLink>
        <NavLink to="/todo">TODO</NavLink>
      </div>
    </>
  );
}

function Layout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '/', element: <Root /> },
      { path: '/typeahead', element: <Typeahead /> },
      { path: '/todo', element: <App /> },
      { path: '/datatable', element: <DataTable /> },
      { path: '/grid-light', element: <GridLightBox /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>
);
