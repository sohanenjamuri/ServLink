import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Cookies from 'js-cookie';
import { apiUrl } from '../../config/api';

const CATEGORIES = ['Cleaning', 'Home Repair', 'Tutoring', 'Beauty & Wellness', 'Automotive'];

export default function ProviderProfile() {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    category: '',
  });
  const [meta, setMeta] = useState({ verified: false, rating: 0, reviews: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = Cookies.get('token');
        const res = await fetch(apiUrl('/api/users/profile'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          bio: data.bio || '',
          category: data.category || '',
        });
        setMeta({
          verified: data.verified || false,
          rating: data.rating || 0,
          reviews: data.reviews || 0,
        });
      } catch {
        setErrorMsg('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const token = Cookies.get('token');
      const res = await fetch(apiUrl('/api/users/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');

      const currentUser = JSON.parse(Cookies.get('user') || '{}');
      const updatedUser = { ...currentUser, name: data.name, email: data.email };
      login(updatedUser, token);
      setSuccessMsg('Profile updated successfully!');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => (name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'P');

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Provider Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">This information is shown to customers</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-lg">
            {getInitials(formData.name)}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{formData.name}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{formData.email}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="inline-block px-3 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 capitalize">
                {user?.role}
              </span>
              {meta.verified && (
                <span className="inline-block px-3 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  Verified
                </span>
              )}
              <span className="text-xs text-gray-500 dark:text-gray-400">★ {meta.rating} ({meta.reviews} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Business Information</h3>

        {successMsg && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg flex items-center gap-2">
            <span>✓</span> {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">{errorMsg}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Business Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="CleanPro Services"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="City, State"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">About Your Business</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Tell customers about your experience, specialties, and what they can expect..."
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2.5 font-medium text-white rounded-lg transition-colors ${saving ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
