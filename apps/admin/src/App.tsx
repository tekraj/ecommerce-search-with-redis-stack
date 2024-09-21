import React from 'react';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import './App.css';
import { AuthLayout } from './layouts/AuthLayout';
import { NotFound } from './pages/NotFound';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Login } from './pages/Login';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { AuthProvider } from './contexts/auth-context';
import { ProtectedRoute } from './layouts/ProtectedRoute';
import { User } from './pages/User';
import { UserForm } from './pages/User/Form';
import 'react-toastify/dist/ReactToastify.css';
import { Category } from './pages/Category';
import { CategoryForm } from './pages/Category/Form';
import { Product } from './pages/Product';
import { ProductForm } from './pages/Product/Form';

function App() {
  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router basename='/admin'>
          <Routes>
            <Route element={<ProtectedRoute />} path="/">
              <Route element={<DashboardLayout />}>
                <Route element={<Dashboard />} path="/" />
                <Route element={<User />} path="/users" />
                <Route element={<UserForm />} path="/users/add" />
                <Route element={<UserForm />} path="/users/edit/:id" />
                <Route element={<Category />} path="/categories" />
                <Route element={<CategoryForm />} path="/categories/add" />
                <Route element={<CategoryForm />} path="/categories/edit/:id" />

                <Route element={<Product />} path="/products" />
                <Route element={<ProductForm />} path="/products/add" />
                <Route element={<ProductForm />} path="/products/edit/:id" />
              </Route>
            </Route>
            <Route element={<AuthLayout />}>
              <Route element={<Login />} path="/login" />
            </Route>
            <Route element={<NotFound />} path="*" />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
