import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiMenu, FiX, FiMoon, FiSun, FiHeart, FiLayers, FiUser, FiLogOut } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import { logout } from '../../store/slices/authSlice';
import { getDashboardPath } from '../../utils/helpers';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { compareList } = useSelector((state) => state.property);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setMenuOpen(false);
  };

  const location = useLocation();
  const isHome = location.pathname === '/';
  const navClass = isHome && !scrolled ? 'bg-transparent' : 'glass-nav shadow-sm';

  const navLinkClass = ({ isActive }) => {
    const onDarkHero = isHome && !scrolled;
    if (onDarkHero) {
      return `px-4 py-2 rounded-xl text-sm font-medium transition-all ${
        isActive ? 'text-white bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/10'
      }`;
    }
    return `px-4 py-2 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-400'
        : 'text-slate-600 dark:text-slate-300 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-surface-800'
    }`;
  };

  const logoClass = isHome && !scrolled ? 'text-white' : '';
  const logoAccentClass = isHome && !scrolled ? 'text-primary-400' : 'text-primary-500';
  const logoSubClass = isHome && !scrolled ? 'text-slate-400' : 'text-slate-400';

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${navClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-18">
          <Link to="/" className={`font-display text-xl md:text-2xl font-bold tracking-tight ${logoClass}`}>
            Real<span className={logoAccentClass}>P</span>
            <span className={`hidden sm:inline font-normal text-sm ml-1.5 ${logoSubClass}`}>Estate</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" className={navLinkClass} end>Home</NavLink>
            <NavLink to="/properties" className={navLinkClass}>Properties</NavLink>
            <NavLink to="/properties?listingType=sale" className={navLinkClass}>Buy</NavLink>
            <NavLink to="/properties?propertyType=land" className={navLinkClass}>Land</NavLink>
            <NavLink to="/sell-land" className={navLinkClass}>Sell Land</NavLink>
            {isAuthenticated && (
              <NavLink to={getDashboardPath(user?.role)} className={navLinkClass}>Dashboard</NavLink>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={toggleDarkMode} className="btn-ghost p-2.5" aria-label="Toggle theme">
              {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            <Link to="/compare" className="btn-ghost p-2.5 relative" aria-label="Compare">
              <FiLayers size={18} />
              {compareList.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {compareList.length}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/favorites" className="btn-ghost p-2.5 hidden sm:flex" aria-label="Favorites">
                  <FiHeart size={18} />
                </Link>
                <Link to="/profile" className="btn-ghost p-2.5 hidden sm:flex" aria-label="Profile">
                  <FiUser size={18} />
                </Link>
                <button onClick={handleLogout} className="hidden sm:flex btn-ghost text-sm gap-1.5">
                  <FiLogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2 ml-1">
                <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
                <Link to="/register" className="btn-primary text-sm py-2.5 px-5">Get Started</Link>
              </div>
            )}

            <button className="md:hidden btn-ghost p-2.5" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200/60 dark:border-slate-800 space-y-1 animate-fade-in">
            <NavLink to="/" className={navLinkClass} end onClick={() => setMenuOpen(false)}>Home</NavLink>
            <NavLink to="/properties" className={navLinkClass} onClick={() => setMenuOpen(false)}>Properties</NavLink>
            <NavLink to="/properties?listingType=sale" className={navLinkClass} onClick={() => setMenuOpen(false)}>Buy</NavLink>
            <NavLink to="/properties?listingType=rent" className={navLinkClass} onClick={() => setMenuOpen(false)}>Rent</NavLink>
            <NavLink to="/sell-land" className={navLinkClass} onClick={() => setMenuOpen(false)}>Sell Land</NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/favorites" className={navLinkClass} onClick={() => setMenuOpen(false)}>Favorites</NavLink>
                <NavLink to={getDashboardPath(user?.role)} className={navLinkClass} onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
                <NavLink to="/profile" className={navLinkClass} onClick={() => setMenuOpen(false)}>Profile</NavLink>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-500 font-medium">Logout</button>
              </>
            ) : (
              <div className="flex gap-2 pt-3">
                <Link to="/login" className="btn-secondary flex-1 text-center text-sm" onClick={() => setMenuOpen(false)}>Sign in</Link>
                <Link to="/register" className="btn-primary flex-1 text-center text-sm" onClick={() => setMenuOpen(false)}>Register</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
