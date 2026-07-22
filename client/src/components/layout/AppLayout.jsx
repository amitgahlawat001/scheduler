import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import PageTransition from './PageTransition';

const navItemClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'bg-brand/10 text-brand' : 'text-gray-600 hover:bg-gray-100'
  }`;

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      <aside className="w-60 shrink-0 sticky top-0 h-screen bg-white border-r border-gray-200 flex flex-col py-6 px-3">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-gray-800 no-underline mb-8 px-3">
          <span className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-lg">📅</span>
          Scheduler
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          <NavLink to="/dashboard" className={navItemClass}>
            <span>🏠</span> Dashboard
          </NavLink>
          <NavLink to="/bookings" className={navItemClass}>
            <span>📖</span> Bookings
          </NavLink>
        </nav>

        {user && (
          <div className="border-t border-gray-100 pt-3 px-3">
            <p className="text-xs text-gray-400 mb-2 truncate">{user.name}</p>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-1 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              <span>🚪</span> Log out
            </button>
          </div>
        )}
      </aside>

      <main className="flex-1 min-w-0">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  );
}
