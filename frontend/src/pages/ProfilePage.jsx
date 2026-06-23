import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { updateProfile } from '../store/slices/authSlice';
import api from '../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.target);
    try {
      await dispatch(updateProfile({
        name: form.get('name'),
        phone: form.get('phone'),
        address: {
          street: form.get('street'),
          city: form.get('city'),
          state: form.get('state'),
          country: form.get('country'),
          zipCode: form.get('zipCode'),
        },
      })).unwrap();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await api.post('/auth/resend-verification');
      toast.success('Verification email sent');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send verification');
    }
  };

  if (!user) return <LoadingSpinner size="lg" className="min-h-screen" />;

  return (
    <>
      <Helmet><title>Profile - RealP Estate</title></Helmet>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <div className="card p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-2xl font-bold text-primary-600">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-gray-500">{user.email}</p>
              <span className="badge bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 capitalize mt-1">{user.role}</span>
              {!user.isVerified && (
                <button onClick={handleResendVerification} className="block text-sm text-amber-600 hover:underline mt-1">
                  Resend verification email
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <h3 className="font-semibold">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Name</label>
                <input name="name" defaultValue={user.name} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Phone</label>
                <input name="phone" defaultValue={user.phone || ''} className="input-field" />
              </div>
            </div>
            <h3 className="font-semibold pt-2">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <input name="street" placeholder="Street" defaultValue={user.address?.street || ''} className="input-field" />
              </div>
              <input name="city" placeholder="City" defaultValue={user.address?.city || ''} className="input-field" />
              <input name="state" placeholder="State" defaultValue={user.address?.state || ''} className="input-field" />
              <input name="country" placeholder="Country" defaultValue={user.address?.country || ''} className="input-field" />
              <input name="zipCode" placeholder="Zip Code" defaultValue={user.address?.zipCode || ''} className="input-field" />
            </div>
            <button type="submit" disabled={saving || loading} className="btn-primary">
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <input type="password" placeholder="Current Password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="input-field" required />
            <input type="password" placeholder="New Password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="input-field" required minLength={6} />
            <input type="password" placeholder="Confirm New Password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="input-field" required />
            <button type="submit" disabled={saving} className="btn-secondary">Change Password</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
