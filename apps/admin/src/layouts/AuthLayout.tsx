import React from 'react';

import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <main>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-md rounded-lg">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
