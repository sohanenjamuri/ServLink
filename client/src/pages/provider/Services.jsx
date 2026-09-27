import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { apiUrl } from '../../config/api';

const CATEGORIES = ['Cleaning', 'Home Repair', 'Tutoring', 'Beauty & Wellness', 'Automotive'];

const emptyForm = { name: '', category: 'Cleaning', price: '', description: '' };

export default function ProviderServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const token = () => Cookies.get('token');

  const fetchServices = async () => {
    try {
      const res = await fetch(apiUrl('/api/services/mine'), {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error('Failed to fetch services');
      setServices(await res.json());
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const openCreate = () => {
    setEditing(null);
    setFormData(emptyForm);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (service) => {
    setEditing(service);
    setFormData({
      name: service.name || '',
      category: service.category || 'Cleaning',
      price: String(service.price || '').replace(/^\$/, ''),
      description: service.description || '',
    });
    setFormError('');
    setShowForm(true);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      setFormError('Name and price are required');
      return;
    }
    setSaving(true);
    try {
      const url = editing
        ? apiUrl(`/api/services/${editing._id}`)
        : apiUrl('/api/services');
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save service');
      setShowForm(false);
      fetchServices();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service? This cannot be undone.')) return;
    try {
      const res = await fetch(apiUrl(`/api/services/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error('Failed to delete service');
      fetchServices();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Services</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Create and manage the services you offer</p>
        </div>
        <button
          onClick={openCreate}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
        >
          + Add Service
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editing ? 'Edit Service' : 'New Service'}
          </h2>
          {formError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">{formError}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="House Cleaning"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (USD)</label>
              <input
                name="price"
                type="number"
                min="0"
                step="1"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="What does this service include?"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className={`px-6 py-2.5 font-medium text-white rounded-lg transition-colors ${saving ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {saving ? 'Saving...' : editing ? 'Update Service' : 'Create Service'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400">{error}</div>
      ) : services.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-5xl mb-4">🔧</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">No services listed yet</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Add your first service so customers can book you</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => (
            <div
              key={service._id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{service.name}</h3>
                  <span className="px-2 py-1 text-xs font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full whitespace-nowrap">
                    {service.category}
                  </span>
                </div>
                {service.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{service.description}</p>
                )}
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{service.price}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => openEdit(service)}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(service._id)}
                  className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
