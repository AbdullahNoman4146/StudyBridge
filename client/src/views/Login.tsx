import { Mail, Lock } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'agent' | 'student'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', selectedRole);
        
        // Route based on selected role
        if (selectedRole === 'admin') {
          navigate('/admin-dashboard');
        } else if (selectedRole === 'agent') {
          navigate('/agent-dashboard');
        } else if (selectedRole === 'student') {
          navigate('/student-dashboard');
        }
      } else {
        setError(data.message || 'Invalid login credentials');
      }
    } catch (err: any) {
      setError('Login failed: ' + (err.message || 'Server error'));
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      {/* Centered Login Card */}
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">StudyBridge</h1>
          <p className="text-gray-600">Student Consultancy Operations Platform</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleLogin}>
          {/* Role Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Role
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`py-3 px-4 rounded-lg border-2 transition-all font-medium ${
                  selectedRole === 'admin'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('agent')}
                className={`py-3 px-4 rounded-lg border-2 transition-all font-medium ${
                  selectedRole === 'agent'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                }`}
              >
                Agent
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('student')}
                className={`py-3 px-4 rounded-lg border-2 transition-all font-medium ${
                  selectedRole === 'student'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                }`}
              >
                Student
              </button>
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
              Forgot password?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Don't have an account? <a href="/register" className="text-blue-600 hover:text-blue-700 font-medium">Register here</a></p>
          <p className="mt-4">© 2024 StudyBridge. Academic Web Project.</p>
        </div>
      </div>
    </div>
  );
}