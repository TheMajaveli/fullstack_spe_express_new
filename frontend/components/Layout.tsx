
import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Film, Search, User, LogOut, Sun, Moon, LayoutDashboard, Heart, Settings } from 'lucide-react';
import { useStore } from '../store';
import { Button } from './DesignSystem';
import { UserRole } from '../types';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, theme, toggleTheme, logout } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const navLinks = [
    { name: 'Explorer', path: '/', icon: Film },
    ...(isAuthenticated ? [
      { name: 'Ma Liste', path: '/account', icon: Heart },
      ...(user?.role === UserRole.ADMIN ? [{ name: 'Admin', path: '/admin', icon: LayoutDashboard }] : [])
    ] : [])
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip Link for Accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:font-bold focus:rounded focus:outline-none focus:ring-2 focus:ring-white"
      >
        Aller au contenu principal
      </a>
      
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-cinema-border h-16 transition-all duration-300">
        <div className="max-w-[1400px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 bg-accent rounded-sm flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6">
              <Film className="text-white" size={16} />
            </div>
            <span className="font-black text-lg sm:text-xl tracking-tighter uppercase hidden xs:inline">Cine<span className="text-accent">Noir</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 lg:gap-10" aria-label="Main navigation">
            {navLinks.map(link => (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${location.pathname === link.path ? 'text-accent' : 'text-zinc-500 hover:text-white'}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={toggleTheme} className="text-zinc-500 hover:text-white transition-colors p-2">
              <span className="sr-only">Changer de thème</span>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-3 sm:gap-6">
                <Link to="/account" className="hidden sm:flex items-center gap-2 group">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold">
                    {user?.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-zinc-400 group-hover:text-white transition-colors hidden lg:inline">{user?.username}</span>
                </Link>
                <button onClick={logout} className="text-zinc-500 hover:text-accent transition-colors p-2" aria-label="Déconnexion">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth/login"><Button variant="ghost" size="sm" className="hidden sm:inline-flex">Connexion</Button></Link>
                <Link to="/auth/register"><Button size="sm" className="text-xs sm:text-sm">S'inscrire</Button></Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1 pt-16">
        {children}
      </main>

      <footer className="py-12 md:py-20 border-t border-cinema-border px-4 sm:px-6">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          <div className="space-y-4 max-w-sm text-center md:text-left">
            <h3 className="font-black text-xl uppercase tracking-tighter">CineNoir</h3>
            <p className="text-sm text-zinc-500 font-medium">Une sélection du cinéma le plus évocateur du monde. Conçu pour les passionnés qui apprécient l'art de raconter des histoires.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-12">
            <div className="space-y-4 text-center sm:text-left">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Navigation</h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li><Link to="/" className="hover:text-white transition-colors">Catalogue</Link></li>
                <li><Link to="/account" className="hover:text-white transition-colors">Profil Membre</Link></li>
                <li><Link to="/admin" className="hover:text-white transition-colors">Administration</Link></li>
              </ul>
            </div>
            <div className="space-y-4 text-center sm:text-left">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Social</h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li><a href="#" className="hover:text-white transition-colors">Letterboxd</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto mt-12 md:mt-20 pt-6 md:pt-8 border-t border-zinc-900 text-center text-xs text-zinc-700 font-bold uppercase tracking-widest">
          © 2024 CineNoir Studio. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};
