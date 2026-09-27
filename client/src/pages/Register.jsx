import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiUrl } from '../config/api';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      setErrorMsg('');
      try {
        // Send data to backend API
        const response = await fetch(apiUrl('/api/auth/register'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Registration failed');
        }
        
        // Redirect to login page after successful registration
        navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
      } catch (err) {
        setErrorMsg(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Join ServiceConnect today</p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="John Doe"
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="you@example.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            I want to
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="customer">Book services (Customer)</option>
            <option value="provider">Offer services (Provider)</option>
          </select>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="••••••••"
          />
          {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="••••••••"
          />
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
        </div>

        <div className="flex items-start">
          <input
            type="checkbox"
            id="terms"
            name="terms"
            required
            className="w-4 h-4 mt-0.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="terms" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            I agree to the{' '}
            <Link to="/terms" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">Terms of Service</Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">Privacy Policy</Link>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded-lg transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}