import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from 'src/contexts/auth-context';
import { ToastContainer } from "react-toastify";

type SidebarLink = {
  name: string;
  path: string;
}

const sidebarLinks: SidebarLink[] = [
  { name: 'Dashboard', path: '/' },
  { name: 'Users', path: '/users' },
  { name: 'Categories', path: '/categories' },
  { name: 'Products', path: '/products' },
];

export function DashboardLayout() {
  const { logout } = useAuth();
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white">
        <div className="p-6 text-2xl font-bold">Admin Portal</div>
        <nav>
          <ul>
            {sidebarLinks.map((link) => (
              <li key={link.name}>
                <Link
                  className="block px-4 py-2 text-lg hover:bg-gray-700"
                  to={link.path}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content with Header */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <div className="text-xl font-bold">Admin Dashboard</div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, Admin</span>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={logout} type='button'>
              Logout
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-10">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};
