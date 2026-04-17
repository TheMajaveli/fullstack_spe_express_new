import React, { useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from './components/Layout';
import { CatalogPage } from './pages/CatalogPage';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { LoginPage } from './pages/LoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { UpdatePasswordPage } from './pages/UpdatePasswordPage';
import { AccountPage } from './pages/AccountPage';
import { AdminLayout } from './components/AdminLayout';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminMovies } from './pages/AdminMovies';
import { AdminCategories } from './pages/AdminCategories';
import { AdminUserBase } from './pages/AdminUserBase';
import { useStore } from './store';
import { api } from './services/api';

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4" aria-label={t('notFound.aria')}>
      <h1 className="text-6xl font-black">404</h1>
      <p className="text-zinc-500 uppercase tracking-widest font-bold">{t('notFound.subtitle')}</p>
      <Link
        to="/"
        className="mt-4 px-8 py-3 bg-white text-black font-bold rounded-lg hover:opacity-90 transition-opacity focus:outline focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black"
      >
        {t('notFound.cta')}
      </Link>
    </div>
  );
};

const App: React.FC = () => {
  const { accessToken, setAuth } = useStore();

  // Load user profile on app start if token exists
  useEffect(() => {
    if (accessToken) {
      api.auth.me()
        .then((user) => {
          setAuth({ user, isAuthenticated: true });
        })
        .catch(() => {
          // Token invalid, clear auth
          setAuth({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
        });
    }
  }, [accessToken, setAuth]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/movies/:id" element={<MovieDetailPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/account/password" element={<UpdatePasswordPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="movies" element={<AdminMovies />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="users" element={<AdminUserBase />} />
        </Route>
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
};

export default App;
