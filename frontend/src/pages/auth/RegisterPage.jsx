import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { register, clearError } from '../../store/slices/authSlice';
import { getDashboardPath } from '../../utils/helpers';
import AuthLayout, { AuthFooterLink } from '../../components/layout/AuthLayout';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const RegisterPage = () => {
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
    const password = form.get('password');
    if (password !== form.get('confirmPassword')) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      const result = await dispatch(register({
        name: form.get('name'),
        email: form.get('email'),
        password,
        phone: form.get('phone'),
        role: form.get('role'),
      })).unwrap();
      toast.success('Account created!');
      navigate(getDashboardPath(result.user?.role) || '/');
    } catch { /* handled */ }
  };

  return (
    <>
      <Helmet><title>Create Account — RealP Estate</title></Helmet>
      <AuthLayout
        title="Create your account"
        subtitle="Join RealP and start your property journey today"
        footer={<AuthFooterLink text="Already have an account?" linkText="Sign in" to="/login" />}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input type="text" name="name" required className="input-field" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input type="email" name="email" required className="input-field" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input type="tel" name="phone" className="input-field" placeholder="+1 555 000 0000" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">I am a</label>
            <select name="role" className="input-field" defaultValue="buyer">
              <option value="buyer">Buyer / Tenant</option>
              <option value="owner">Property Owner</option>
              <option value="agent">Real Estate Agent</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input type="password" name="password" required minLength={6} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Confirm</label>
              <input type="password" name="confirmPassword" required className="input-field" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
          </button>
        </form>
      </AuthLayout>
    </>
  );
};

export default RegisterPage;
