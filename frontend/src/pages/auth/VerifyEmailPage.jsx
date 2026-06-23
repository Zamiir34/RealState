import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await api.get(`/auth/verify-email/${token}`);
        setStatus('success');
        setMessage(data.message || 'Email verified successfully');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed');
      }
    };
    verify();
  }, [token]);

  return (
    <>
      <Helmet><title>Verify Email - RealP Estate</title></Helmet>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="card w-full max-w-md p-8 text-center">
          {status === 'loading' && (
            <>
              <LoadingSpinner size="lg" className="mb-4" />
              <p>Verifying your email...</p>
            </>
          )}
          {status === 'success' && (
            <>
              <FiCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Email Verified!</h1>
              <p className="text-gray-500 mb-6">{message}</p>
              <Link to="/login" className="btn-primary">Continue to Login</Link>
            </>
          )}
          {status === 'error' && (
            <>
              <FiXCircle className="text-5xl text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
              <p className="text-gray-500 mb-6">{message}</p>
              <Link to="/login" className="btn-primary">Go to Login</Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default VerifyEmailPage;
