import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiHome, FiUsers, FiGrid, FiTag, FiUserCheck, FiBarChart2, FiSettings,
  FiList, FiCalendar, FiHeart, FiMenu, FiX, FiChevronLeft,
} from 'react-icons/fi';
import { toggleSidebar } from '../../store/slices/uiSlice';

const sidebarConfig = {
  admin: [
    { to: '/dashboard/admin', label: 'Overview', icon: FiHome, end: true },
    { to: '/dashboard/admin/users', label: 'Users', icon: FiUsers },
    { to: '/dashboard/admin/properties', label: 'Properties', icon: FiGrid },
    { to: '/dashboard/admin/categories', label: 'Categories', icon: FiTag },
    { to: '/dashboard/admin/agents', label: 'Agents', icon: FiUserCheck },
    { to: '/dashboard/admin/reports', label: 'Reports', icon: FiBarChart2 },
    { to: '/dashboard/admin/settings', label: 'Settings', icon: FiSettings },
  ],
  agent: [
    { to: '/dashboard/agent', label: 'Overview', icon: FiHome, end: true },
    { to: '/dashboard/agent/listings', label: 'My Listings', icon: FiList },
    { to: '/dashboard/agent/appointments', label: 'Appointments', icon: FiCalendar },
  ],
  owner: [
    { to: '/dashboard/owner', label: 'Overview', icon: FiHome, end: true },
    { to: '/dashboard/owner/properties', label: 'My Properties', icon: FiGrid },
  ],
  buyer: [
    { to: '/dashboard/buyer', label: 'Overview', icon: FiHome, end: true },
    { to: '/favorites', label: 'Favorites', icon: FiHeart },
    { to: '/dashboard/agent/appointments', label: 'Appointments', icon: FiCalendar },
  ],
};

const DashboardLayout = ({ children, role }) => {
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const userRole = role || user?.role;
  const links = sidebarConfig[userRole] || [];

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } hidden lg:flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300`}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          {sidebarOpen && <span className="font-semibold capitalize">{userRole} Dashboard</span>}
          <button onClick={() => dispatch(toggleSidebar())} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            {sidebarOpen ? <FiChevronLeft /> : <FiMenu />}
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => {
            const active = end ? location.pathname === to : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                  active
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                <Icon className="text-lg shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <button onClick={() => dispatch(toggleSidebar())} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <FiMenu />
          </button>
          <span className="font-semibold capitalize">{userRole} Dashboard</span>
        </div>

        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-30 flex">
            <div className="absolute inset-0 bg-black/40" onClick={() => dispatch(toggleSidebar())} />
            <aside className="relative w-64 bg-white dark:bg-gray-800 h-full shadow-xl">
              <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                <span className="font-semibold capitalize">{userRole} Dashboard</span>
                <button onClick={() => dispatch(toggleSidebar())} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <FiX />
                </button>
              </div>
              <nav className="p-3 space-y-1">
                {links.map(({ to, label, icon: Icon, end }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => dispatch(toggleSidebar())}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Icon className="text-lg" />
                    <span className="text-sm font-medium">{label}</span>
                  </Link>
                ))}
              </nav>
            </aside>
          </div>
        )}

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
