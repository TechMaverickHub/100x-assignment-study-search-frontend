import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { BookOpen, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await authAPI.login(email, password);
      
      if (response.status === 200 && response.results) {
        const { access, refresh, user } = response.results;
        
        // Map role from API response to frontend role
        const roleName = user.role?.name || 'Regular User';
        const frontendRole = roleName === 'Super Admin' ? 'superadmin' : 'user';
        
        // Store tokens and user data
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        
        // Call login function from context with user data
        login({
          pk: user.pk,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          fullName: `${user.first_name} ${user.last_name}`,
          role: frontendRole,
          roleName: roleName,
        });
        
        // Navigate based on role
        navigate(frontendRole === 'superadmin' ? '/admin' : '/');
      } else {
        setError(response.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.detail || 
        'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#343541]">
      <div className="bg-white rounded-lg p-8 w-full max-w-md border border-gray-200 shadow-2xl">
        <div className="text-center mb-8">
          <BookOpen className="h-12 w-12 text-[#10a37f] mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">StudySearch</h1>
          <p className="text-gray-600 mt-2">RAG-Powered Study Assistant</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 text-red-800 rounded-lg text-sm border border-red-200">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#10a37f] focus:border-transparent outline-none"
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 pr-12 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#10a37f] focus:border-transparent outline-none"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <Eye className="h-5 w-5" />
                ) : (
                  <EyeOff className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center mb-4">
            Don't have an account?
          </p>
          <Link
            to="/signup"
            className="block w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium border border-gray-300 text-center"
          >
            Sign Up
          </Link>
        </div>

        <p className="mt-4 text-sm text-gray-500 text-center">
          Enter your email and password to access StudySearch.
        </p>
      </div>
    </div>
  );
};

export default Login;

