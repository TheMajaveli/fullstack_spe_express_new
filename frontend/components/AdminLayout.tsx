import React, { useEffect } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import { UserRole } from '../types';
import { LayoutDashboard, Film, Users } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { t } = useTranslation();
  const { user, theme } = useStore();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  if (user?.role !== UserRole.ADMIN) {
    return <Navigate to="/" />;
  }

  const navItems = [
    { path: '/admin', label: t('admin.layout.navOverview'), icon: LayoutDashboard },
    { path: '/admin/movies', label: t('admin.layout.navMovies'), icon: Film },
    { path: '/admin/categories', label: t('admin.layout.navCategories'), icon: Film },
    { path: '/admin/users', label: t('admin.layout.navUsers'), icon: Users },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-color)] transition-colors">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-[var(--border-color)] hidden lg:block p-8 space-y-12 bg-[var(--card-bg)]">
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-black uppercase tracking-tighter italic mb-2 text-[var(--text-color)]">{t('admin.layout.brand')}</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 dark:text-zinc-600">{t('admin.layout.panelSubtitle')}</p>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 py-2 text-sm font-bold transition-colors ${
                    active
                      ? 'text-[var(--text-color)]'
                      : 'text-zinc-500 dark:text-zinc-500 hover:text-[var(--text-color)]'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Admin Content */}
      <main className="flex-1 overflow-y-auto bg-[var(--bg-color)]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8 md:py-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
