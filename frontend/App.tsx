
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CatalogPage } from './pages/CatalogPage';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AccountPage } from './pages/AccountPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminMovies } from './pages/AdminMovies';

const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/movies/:id" element={<MovieDetailPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/movies" element={<AdminMovies />} />
        
        {/* Fallback */}
        <Route path="*" element={
          <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <h1 className="text-6xl font-black">404</h1>
            <p className="text-zinc-500 uppercase tracking-widest font-bold">Lost in the shadows</p>
            <a href="/"><button className="mt-4 px-8 py-3 bg-white text-black font-bold rounded-lg">Return to Light</button></a>
          </div>
        } />
      </Routes>
    </Layout>
  );
};

export default App;
