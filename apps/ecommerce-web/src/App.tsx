import React from 'react';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import './App.css';
import { AuthLayout } from './layouts/AuthLayout';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Search } from './pages/Search';
import { Product } from './pages/Product';

function App() {
  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>

      <Router basename='/ecommerce'>
        <Routes>
          <Route element={<MainLayout />}>
            <Route element={<Home />} path="/" />
            <Route element={<Product />} path="/category/:categoryId" />
            <Route element={<Search />} path="/search" />
          </Route>
          <Route element={<AuthLayout />}>
            <Route element={<Login />} path="/login" />
            <Route element={<Register />} path="/register" />
          </Route>
          <Route element={<NotFound />} path="*" />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
