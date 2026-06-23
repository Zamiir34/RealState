import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiHome } from 'react-icons/fi';

const NotFoundPage = () => (
  <>
    <Helmet><title>404 - Page Not Found</title></Helmet>
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-bold text-primary-600 mb-4">404</p>
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-8">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <FiHome /> Back to Home
        </Link>
      </div>
    </div>
  </>
);

export default NotFoundPage;
