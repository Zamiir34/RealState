import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import {
  FiSearch, FiShield, FiTrendingUp, FiUsers, FiArrowRight,
  FiHome, FiBriefcase, FiMap, FiStar,
} from 'react-icons/fi';
import { fetchProperties } from '../store/slices/propertySlice';
import PropertyCard from '../components/property/PropertyCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import HeroSearch from '../components/home/HeroSearch';
import api from '../api/axios';

const propertyTypes = [
  { icon: FiHome, label: 'Houses', type: 'house', color: 'from-blue-500 to-cyan-500' },
  { icon: FiBriefcase, label: 'Commercial', type: 'commercial', color: 'from-violet-500 to-purple-500' },
  { icon: FiMap, label: 'Land', type: 'land', href: '/properties?propertyType=land', color: 'from-amber-500 to-orange-500' },
  { icon: FiStar, label: 'Sell Land', href: '/sell-land', color: 'from-emerald-500 to-teal-500' },
];

const steps = [
  { num: '01', title: 'Search & Discover', desc: 'Browse thousands of verified listings with advanced filters and maps.' },
  { num: '02', title: 'Schedule a Visit', desc: 'Book property tours instantly and connect with trusted agents.' },
  { num: '03', title: 'Close with Confidence', desc: 'Secure payments, transparent process, and full support until keys in hand.' },
];

const testimonials = [
  { name: 'Sarah Mitchell', role: 'Home Buyer', text: 'Found our dream home in two weeks. The platform made everything seamless.', avatar: 'SM' },
  { name: 'James Chen', role: 'Property Owner', text: 'Listed my villa and had three serious inquiries within days. Incredible reach.', avatar: 'JC' },
  { name: 'Elena Rodriguez', role: 'Real Estate Agent', text: 'The agent dashboard and lead tools have transformed how I manage clients.', avatar: 'ER' },
];

const HomePage = () => {
  const dispatch = useDispatch();
  const { properties, loading } = useSelector((state) => state.property);
  const [stats, setStats] = useState({ properties: 0, agents: 0 });

  useEffect(() => {
    dispatch(fetchProperties({ isFeatured: true, limit: 6 }));
    api.get('/properties', { params: { limit: 1 } }).then(({ data }) => {
      setStats((s) => ({ ...s, properties: data.total || 0 }));
    }).catch(() => {});
    api.get('/agents', { params: { limit: 1 } }).then(({ data }) => {
      setStats((s) => ({ ...s, agents: data.total || data.count || 0 }));
    }).catch(() => {});
  }, [dispatch]);

  const featured = properties.filter((p) => p.isFeatured).slice(0, 6);
  const displayProperties = featured.length > 0 ? featured : properties.slice(0, 6);

  return (
    <>
      <Helmet><title>RealP Estate — Find Your Perfect Property</title></Helmet>

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center mesh-bg overflow-hidden -mt-16 pt-16">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920')] bg-cover bg-center opacity-[0.07]" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float animate-delay-300" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-6 animate-fade-up opacity-0">
              <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
              {stats.properties}+ properties available now
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6 animate-fade-up animate-delay-100 opacity-0">
              Discover spaces that{' '}
              <span className="gradient-text">feel like home</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-xl mb-10 leading-relaxed animate-fade-up animate-delay-200 opacity-0">
              Premium real estate platform for buying, selling, and renting. Trusted by buyers, owners, and agents worldwide.
            </p>
            <HeroSearch />
            <div className="flex flex-wrap gap-6 mt-10 animate-fade-up animate-delay-400 opacity-0">
              {[
                { icon: FiTrendingUp, value: `${stats.properties}+`, label: 'Listings' },
                { icon: FiUsers, value: `${stats.agents}+`, label: 'Agents' },
                { icon: FiShield, value: '100%', label: 'Verified' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Icon className="text-primary-400" />
                  </div>
                  <div>
                    <p className="text-white font-display font-bold text-lg">{value}</p>
                    <p className="text-slate-400 text-xs">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Property Types */}
      <section className="py-16 md:py-20 bg-white dark:bg-surface-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="section-title">Explore by category</h2>
            <p className="section-subtitle mx-auto">Find exactly what you&apos;re looking for</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {propertyTypes.map(({ icon: Icon, label, type, href, color }) => (
              <Link
                key={label}
                to={href || `/properties?propertyType=${type}`}
                className="group card p-6 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <Icon className="text-white text-xl" />
                </div>
                <h3 className="font-display font-semibold text-lg">{label}</h3>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1 group-hover:text-primary-600 transition">
                  Browse <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-16 md:py-20 bg-surface-50 dark:bg-surface-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="section-title">Featured properties</h2>
              <p className="section-subtitle">Handpicked premium listings just for you</p>
            </div>
            <Link to="/properties" className="btn-secondary shrink-0 group">
              View all <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          {loading ? (
            <LoadingSpinner size="lg" className="py-20" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {displayProperties.map((p) => <PropertyCard key={p._id} property={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-20 bg-white dark:bg-surface-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="section-title">How it works</h2>
            <p className="section-subtitle mx-auto">Three simple steps to your next property</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="relative card p-8 hover:shadow-card-hover transition-shadow">
                <span className="font-display text-5xl font-bold text-primary-100 dark:text-primary-900/50">{num}</span>
                <h3 className="font-display font-bold text-xl mt-4 mb-2">{title}</h3>
                <p className="text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20 bg-surface-50 dark:bg-surface-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="section-title">Loved by thousands</h2>
            <p className="section-subtitle mx-auto">See what our community has to say</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, avatar }) => (
              <div key={name} className="card p-6 md:p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <FiStar key={i} className="text-accent-500 fill-accent-500" size={16} />)}
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">&ldquo;{text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-emerald-400 flex items-center justify-center text-white text-sm font-bold">
                    {avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{name}</p>
                    <p className="text-sm text-slate-500">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-emerald-800" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">
            Ready to find your dream home?
          </h2>
          <p className="text-primary-100 text-lg mb-10 max-w-xl mx-auto">
            Join RealP today — list properties, connect with agents, or start your search for free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary bg-white text-primary-700 hover:bg-primary-50 shadow-none">
              Get Started Free
            </Link>
            <Link to="/properties" className="btn-secondary border-white/30 text-white bg-white/10 hover:bg-white/20">
              <FiSearch /> Browse Listings
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
