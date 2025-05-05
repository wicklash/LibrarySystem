import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import { LogIn, Library } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    let formErrors: { email?: string; password?: string } = {};
    let isValid = true;

    if (!email) {
      formErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      formErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      formErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(formErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await login(email, password);
    }
  };

  // Sample login credentials
  const sampleCredentials = [
    { email: 'user1@example.com', password: 'password', role: 'User' },
    { email: 'admin1@example.com', password: 'password', role: 'Admin' }
  ];

  const handleSampleLogin = async (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    await login(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="px-6 py-8 sm:p-10">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary-100">
              <Library size={32} className="text-primary-600" />
            </div>
            <h2 className="mt-4 text-3xl font-display font-bold text-gray-900">
              Library Management
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your account to continue
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                required
                fullWidth
              />

              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                required
                fullWidth
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              fullWidth 
              disabled={loading}
              className="group relative"
            >
              <span className="absolute left-4 inset-y-0 flex items-center">
                <LogIn size={20} />
              </span>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Sample accounts
                </span>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              {sampleCredentials.map((cred, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{cred.role} Account</span>
                    <span className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full">Demo</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">Email: {cred.email}</div>
                  <div className="text-sm text-gray-600 mb-2">Password: {cred.password}</div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleSampleLogin(cred.email, cred.password)}
                    disabled={loading}
                    fullWidth
                  >
                    Use this account
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;