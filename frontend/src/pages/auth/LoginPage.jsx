import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { login, clearError } from '../../store/slices/authSlice';
import { getDashboardPath } from '../../utils/helpers';
import AuthLayout, { AuthFooterLink } from '../../components/layout/AuthLayout';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) navigate(getDashboardPath(user.role) || '/');
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    try {
      const result = await dispatch(login({
        email: form.get('email'),
        password: form.get('password'),
      })).unwrap();
      toast.success('Welcome back!');
      navigate(getDashboardPath(result.user?.role) || '/');
    } catch { /* handled */ }
  };

  return (
    <>
      <Helmet><title>Sign In — RealP Estate</title></Helmet>
      <AuthLayout
        title="Welcome back"
        subtitle="Sign in to access your dashboard and saved properties"
        footer={<AuthFooterLink text="Don't have an account?" linkText="Create one" to="/register" />}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Email</label>
            <input type="email" name="email" required className="input-field" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Password</label>
            <input type="password" name="password" required className="input-field" placeholder="••••••••" />
          </div>
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-primary-600 font-medium hover:text-primary-500">Forgot password?</Link>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
          </button>
        </form>
      </AuthLayout>
    </>
  );
};

export default LoginPage;
