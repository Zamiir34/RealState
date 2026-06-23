import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
    <div className="hidden lg:flex relative mesh-bg items-center justify-center p-12 overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200')] bg-cover bg-center opacity-10" />
      <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-30" />
      <div className="relative z-10 max-w-md animate-fade-up">
        <Link to="/" className="font-display text-2xl font-bold text-white mb-8 inline-block">
          Real<span className="text-primary-400">P</span>
        </Link>
        <h2 className="font-display text-4xl font-bold text-white leading-tight mb-4">
          Your next chapter starts with the right address.
        </h2>
        <p className="text-slate-300 text-lg leading-relaxed">
          Join thousands of buyers, sellers, and agents on the most intuitive real estate platform.
        </p>
        <div className="mt-10 flex items-center gap-6">
          {['10k+ Listings', '500+ Agents', '50+ Cities'].map((stat) => (
            <div key={stat} className="text-center">
              <p className="text-primary-400 font-display font-bold text-lg">{stat.split(' ')[0]}</p>
              <p className="text-slate-400 text-xs mt-0.5">{stat.split(' ').slice(1).join(' ')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="flex items-center justify-center px-4 py-12 bg-surface-50 dark:bg-surface-950">
      <div className="w-full max-w-md animate-fade-up">
        <div className="lg:hidden mb-8">
          <Link to="/" className="font-display text-xl font-bold">
            Real<span className="text-primary-600">P</span>
          </Link>
        </div>
        <div className="card p-8 md:p-10">
          <h1 className="font-display text-2xl font-bold mb-1">{title}</h1>
          <p className="text-slate-500 mb-8">{subtitle}</p>
          {children}
          {footer && <div className="mt-6">{footer}</div>}
        </div>
      </div>
    </div>
  </div>
);

export const AuthFooterLink = ({ text, linkText, to }) => (
  <p className="text-center text-sm text-slate-500">
    {text}{' '}
    <Link to={to} className="text-primary-600 font-semibold hover:text-primary-500 inline-flex items-center gap-1">
      {linkText} <FiArrowRight className="text-xs" />
    </Link>
  </p>
);

export default AuthLayout;
