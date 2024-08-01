import React from 'react';

import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <>
      <header />
      <main>
        <Outlet />
      </main>
      <footer />
    </>
  );
}
