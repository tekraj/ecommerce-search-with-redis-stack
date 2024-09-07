import React from 'react';

import { Outlet } from 'react-router-dom';
import Footer from 'src/components/Footer';
import { Header } from 'src/components/Header';

export function MainLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
