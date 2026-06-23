import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const email = new FormData(e.target).get('email');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent to your email');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Forgot Password - RealP Estate</title></Helmet>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="card w-full max-w-md p-8">
          <h1 className="text-2xl font-bold text-center mb-2">Forgot Password</h1>
          <p className="text-gray-500 text-center mb-8">
            {sent ? 'Check your email for a reset link' : 'Enter your email to receive a reset link'}
          </p>
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input type="email" name="email" required className="input-field" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <LoadingSpinner size="sm" /> : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <Link to="/login" className="btn-primary w-full block text-center">Back to Login</Link>
          )}
          <p className="text-center text-sm text-gray-500 mt-6">
            <Link to="/login" className="text-primary-600 hover:underline">Back to Login</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
