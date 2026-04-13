import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Outlet } from 'react-router-dom';

export const Layout = () => {
  return (
    <div className="flex h-screen bg-[var(--color-dark)] text-[var(--color-text-main)] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8 border-t border-[var(--color-sidebar)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
