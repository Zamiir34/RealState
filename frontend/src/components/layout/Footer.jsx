import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiArrowUpRight } from 'react-icons/fi';

const Footer = () => (
  <footer className="bg-surface-950 text-slate-400 mt-auto border-t border-slate-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
        <div className="lg:col-span-1">
          <Link to="/" className="font-display text-2xl font-bold text-white inline-block mb-4">
            Real<span className="text-primary-400">P</span>
          </Link>
          <p className="text-sm leading-relaxed text-slate-400 max-w-xs">
            The modern way to buy, sell, and rent premium properties. Trusted by thousands worldwide.
          </p>
          <div className="flex gap-3 mt-6">
            {['f', 'in', 'ig'].map((s) => (
              <span key={s} className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-primary-600 flex items-center justify-center text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer uppercase">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-white font-display font-semibold mb-4">Explore</h3>
          <ul className="space-y-3 text-sm">
            {[
              { to: '/properties', label: 'All Properties' },
              { to: '/properties?listingType=sale', label: 'Buy' },
              { to: '/properties?listingType=rent', label: 'Rent' },
              { to: '/compare', label: 'Compare' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="hover:text-primary-400 transition flex items-center gap-1 group">
                  {label}
                  <FiArrowUpRight className="opacity-0 group-hover:opacity-100 transition text-xs" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-white font-display font-semibold mb-4">Account</h3>
          <ul className="space-y-3 text-sm">
            {[
              { to: '/login', label: 'Sign In' },
              { to: '/register', label: 'Create Account' },
              { to: '/favorites', label: 'Saved Properties' },
              { to: '/profile', label: 'My Profile' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="hover:text-primary-400 transition">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-white font-display font-semibold mb-4">Contact</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center"><FiMail size={14} /></span>
              info@realp.com
            </li>
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center"><FiPhone size={14} /></span>
              +1 (555) 123-4567
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
        <p>&copy; {new Date().getFullYear()} RealP Estate. All rights reserved.</p>
        <div className="flex gap-6">
          <span className="hover:text-white transition cursor-pointer">Privacy</span>
          <span className="hover:text-white transition cursor-pointer">Terms</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
