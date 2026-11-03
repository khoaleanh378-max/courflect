import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Reflect', path: '/reflect' },
    { label: 'About', path: '/about' },
  ];

  const isActive = (path) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path));

  const handleLogout = () => {
    logout(false);
    navigate('/');
  };

  const initials = (user?.full_name || user?.email || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-white text-black font-body">
      <header className="bg-[#D9D9D9] border-b border-black/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-heading font-extrabold text-2xl tracking-tight text-black">
            Cou<span className="font-light">R</span>flect
          </Link>
          <nav className="hidden sm:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(item.path) ? 'text-black' : 'text-black/60 hover:text-black'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <Link to={user.role === 'lecturer' ? '/dashboard' : user.role === 'admin' ? '/admin' : '/reflect'} className="hidden sm:block text-sm font-medium text-black/70 hover:text-black">
                  {user.full_name || user.email}
                </Link>
                <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-xs font-semibold">
                  {initials}
                </div>
                <button onClick={handleLogout} className="text-xs text-black/50 hover:text-black">Sign out</button>
              </>
            ) : (
              <Link to="/login" className="text-sm font-medium text-black/70 hover:text-black">Sign in</Link>
            )}
          </div>
        </div>
        {/* mobile nav */}
        <nav className="sm:hidden flex items-center justify-around px-6 py-2 border-t border-black/10">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={`text-sm font-medium ${isActive(item.path) ? 'text-black' : 'text-black/50'}`}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-[#D9D9D9] border-t border-black/10 py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-black/60">
          CouRflect · Anonymous lecturer feedback for universities
        </div>
      </footer>
    </div>
  );
}