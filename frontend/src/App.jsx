import { useEffect, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './store/slices/authSlice';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import PropertiesPage from './pages/properties/PropertiesPage';
import PropertyDetailPage from './pages/properties/PropertyDetailPage';
import SellLandPage from './pages/properties/SellLandPage';
import ComparePage from './pages/properties/ComparePage';
import FavoritesPage from './pages/properties/FavoritesPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Admin
import AdminDashboard from './pages/dashboard/admin/AdminDashboard';
import ManageUsers from './pages/dashboard/admin/ManageUsers';
import ManageProperties from './pages/dashboard/admin/ManageProperties';
import ManageCategories from './pages/dashboard/admin/ManageCategories';
import ManageAgents from './pages/dashboard/admin/ManageAgents';
import Reports from './pages/dashboard/admin/Reports';
import Settings from './pages/dashboard/admin/Settings';

// Agent
import AgentDashboard from './pages/dashboard/agent/AgentDashboard';
import ManageListings from './pages/dashboard/agent/ManageListings';
import Appointments from './pages/dashboard/agent/Appointments';

// Owner
import OwnerDashboard from './pages/dashboard/owner/OwnerDashboard';
import MyProperties from './pages/dashboard/owner/MyProperties';

// Buyer
import BuyerDashboard from './pages/dashboard/buyer/BuyerDashboard';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const App = () => {
  const dispatch = useDispatch();
  const { loading, token } = useSelector((state) => state.auth);
  const authChecked = useRef(false);

  useEffect(() => {
    if (!token) {
      authChecked.current = false;
      return;
    }
    if (!authChecked.current) {
      authChecked.current = true;
      dispatch(loadUser());
    }
  }, [dispatch, token]);

  if (loading && token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/sell-land" element={<ProtectedRoute roles={['owner', 'agent', 'buyer']}><SellLandPage /></ProtectedRoute>} />

          {/* Protected */}
          <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/dashboard/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/admin/users" element={<ProtectedRoute roles={['admin']}><ManageUsers /></ProtectedRoute>} />
          <Route path="/dashboard/admin/properties" element={<ProtectedRoute roles={['admin']}><ManageProperties /></ProtectedRoute>} />
          <Route path="/dashboard/admin/categories" element={<ProtectedRoute roles={['admin']}><ManageCategories /></ProtectedRoute>} />
          <Route path="/dashboard/admin/agents" element={<ProtectedRoute roles={['admin']}><ManageAgents /></ProtectedRoute>} />
          <Route path="/dashboard/admin/reports" element={<ProtectedRoute roles={['admin']}><Reports /></ProtectedRoute>} />
          <Route path="/dashboard/admin/settings" element={<ProtectedRoute roles={['admin']}><Settings /></ProtectedRoute>} />

          {/* Agent */}
          <Route path="/dashboard/agent" element={<ProtectedRoute roles={['agent']}><AgentDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/agent/listings" element={<ProtectedRoute roles={['agent']}><ManageListings /></ProtectedRoute>} />
          <Route path="/dashboard/agent/appointments" element={<ProtectedRoute roles={['agent', 'buyer', 'owner']}><Appointments /></ProtectedRoute>} />

          {/* Owner */}
          <Route path="/dashboard/owner" element={<ProtectedRoute roles={['owner']}><OwnerDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/owner/properties" element={<ProtectedRoute roles={['owner']}><MyProperties /></ProtectedRoute>} />

          {/* Buyer */}
          <Route path="/dashboard/buyer" element={<ProtectedRoute roles={['buyer']}><BuyerDashboard /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
