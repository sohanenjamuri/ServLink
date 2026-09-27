import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { apiUrl } from '../../config/api';

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Password section
  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  // Notification prefs (UI only for now)
  const [notifs, setNotifs] = useState({
    emailBooking: true,
    emailPromo: false,
    smsBooking: true,
    smsReminder: true,
  });

  const handlePwChange = (e) => {
    setPwData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setPwErrors(prev => ({ ...prev, [e.target.name]: '' }));
    setPwSuccess('');
    setPwError('');
  };

  const validatePw = () => {
    const errs = {};
    if (!pwData.currentPassword) errs.currentPassword = 'Current password is required';
    if (!pwData.newPassword) errs.newPassword = 'New password is required';
    else if (pwData.newPassword.length < 6) errs.newPassword = 'Must be at least 6 characters';
    if (pwData.newPassword !== pwData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setPwErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    if (!validatePw()) return;
    setPwSaving(true);
    try {
      const token = Cookies.get('token');
      const res = await fetch(apiUrl('/api/users/change-password'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: pwData.currentPassword, newPassword: pwData.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to change password');
      setPwSuccess('Password changed successfully!');
      setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      logout();
      navigate('/');
    }
  };

  const inputClass = (err) => `w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${err ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account preferences</p>
      </div>

      {/* Account Info Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Name</p>
            <p className="font-medium text-gray-900 dark:text-white mt-0.5">{user?.name}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Email</p>
            <p className="font-medium text-gray-900 dark:text-white mt-0.5">{user?.email}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Account Type</p>
            <span className="mt-0.5 inline-block px-3 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 capitalize">
              {user?.role}
            </span>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Member Since</p>
            <p className="font-medium text-gray-900 dark:text-white mt-0.5">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Change Password</h3>

        {pwSuccess && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg flex items-center gap-2">
            <span>✓</span> {pwSuccess}
          </div>
        )}
        {pwError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">{pwError}</div>
        )}

        <form onSubmit={handlePwSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
            <input type="password" name="currentPassword" value={pwData.currentPassword} onChange={handlePwChange} className={inputClass(pwErrors.currentPassword)} placeholder="••••••••" />
            {pwErrors.currentPassword && <p className="mt-1 text-xs text-red-500">{pwErrors.currentPassword}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
              <input type="password" name="newPassword" value={pwData.newPassword} onChange={handlePwChange} className={inputClass(pwErrors.newPassword)} placeholder="••••••••" />
              {pwErrors.newPassword && <p className="mt-1 text-xs text-red-500">{pwErrors.newPassword}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
              <input type="password" name="confirmPassword" value={pwData.confirmPassword} onChange={handlePwChange} className={inputClass(pwErrors.confirmPassword)} placeholder="••••••••" />
              {pwErrors.confirmPassword && <p className="mt-1 text-xs text-red-500">{pwErrors.confirmPassword}</p>}
            </div>
          </div>
          <button
            type="submit"
            disabled={pwSaving}
            className={`px-6 py-2.5 font-medium text-white rounded-lg transition-colors ${pwSaving ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {pwSaving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Notification Preferences</h3>
        <div className="space-y-4">
          {[
            { key: 'emailBooking', label: 'Email: Booking confirmations', desc: 'Receive confirmation emails when bookings are made or updated' },
            { key: 'emailPromo', label: 'Email: Promotions & offers', desc: 'Receive promotional offers and discounts via email' },
            { key: 'smsBooking', label: 'SMS: Booking updates', desc: 'Get SMS updates when your booking status changes' },
            { key: 'smsReminder', label: 'SMS: Service reminders', desc: 'Receive reminders before your scheduled services' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
              </div>
              <button
                onClick={() => setNotifs(prev => ({ ...prev, [key]: !prev[key] }))}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${notifs[key] ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${notifs[key] ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">* Notification preferences are saved locally in your browser.</p>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-900/50 p-6">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Once you delete your account, all of your data will be permanently removed. This action cannot be undone.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="px-5 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
