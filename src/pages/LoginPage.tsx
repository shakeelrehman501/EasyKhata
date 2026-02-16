import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'code' | 'newPassword'>('email');
  const [verificationCode, setVerificationCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load remembered email on mount
  useEffect(() => {
    // Initialize default credentials if not present
    const credentialsStr = localStorage.getItem('user_credentials');
    if (!credentialsStr) {
      const defaultCredentials = {
        email: 'jamil@boxeltechnology.com',
        password: 'jamil786'
      };
      localStorage.setItem('user_credentials', JSON.stringify(defaultCredentials));
    }

    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberedPassword = localStorage.getItem('rememberedPassword');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
      if (rememberedPassword) {
        setPassword(rememberedPassword);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Get stored credentials from localStorage
    const credentialsStr = localStorage.getItem('user_credentials');
    let validEmail = 'jamil@boxeltechnology.com';
    let validPassword = 'jamil786';

    if (credentialsStr) {
      const credentials = JSON.parse(credentialsStr);
      validEmail = credentials.email;
      validPassword = credentials.password;
    }

    // Validate credentials against stored values
    if (email === validEmail && password === validPassword) {
      // Save to localStorage if remember me is checked
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberedPassword', password);
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
      }
      onLogin(email, password);
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
    setForgotStep('email');
    setError('');
  };

  const handleSendVerificationCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'jamil@boxeltechnology.com') {
      // Generate a random 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setSentCode(code);
      setSuccessMessage(`Verification code sent to ${email}`);
      setForgotStep('code');
      // In a real app, this would send an email
      console.log('Verification code:', code);
    } else {
      setError('Email not found in our system.');
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode === sentCode) {
      setSuccessMessage('Code verified successfully!');
      setForgotStep('newPassword');
      setError('');
    } else {
      setError('Invalid verification code. Please try again.');
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    
    // Update the password permanently in localStorage
    const updatedCredentials = {
      email: email,
      password: newPassword
    };
    localStorage.setItem('user_credentials', JSON.stringify(updatedCredentials));
    
    // Also update remembered password if remember me was enabled
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail === email) {
      localStorage.setItem('rememberedPassword', newPassword);
    }
    
    setSuccessMessage('Password reset successfully! You can now login with your new password.');
    setTimeout(() => {
      setShowForgotPassword(false);
      setPassword(newPassword);
      setSuccessMessage('');
      setError('');
    }, 2000);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setForgotStep('email');
    setError('');
    setSuccessMessage('');
    setVerificationCode('');
    setSentCode('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        {!showForgotPassword ? (
          // Login Form
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl dark:shadow-slate-900/50 p-8 border border-slate-100 dark:border-slate-700">
            {/* Logo/Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200 dark:shadow-blue-900/50">
                <span className="text-white text-2xl font-bold">B</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Welcome Back</h1>
              <p className="text-slate-500 dark:text-slate-400">Sign in to Bhatti Mobile Shop</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl flex items-center gap-3">
                <AlertCircle className="text-red-500 dark:text-red-400" size={20} />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jamil@boxeltechnology.com"
                    className="w-full pl-12 pr-4 py-3.5 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-slate-100 dark:placeholder-slate-500 transition-all autofill:bg-white dark:autofill:bg-slate-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-slate-100 dark:placeholder-slate-500 transition-all autofill:bg-white dark:autofill:bg-slate-700"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 dark:text-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/50"
              >
                Sign In
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 dark:text-slate-500 mt-6">
              Protected by Bhatti Mobile Shop CRM
            </p>
          </div>
        ) : (
          // Forgot Password Flow
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl dark:shadow-slate-900/50 p-8 border border-slate-100 dark:border-slate-700">
            <button
              onClick={handleBackToLogin}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6"
            >
              <ArrowLeft size={16} />
              Back to Login
            </button>

            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                <CheckCircle size={20} className="text-green-600 mt-0.5 shrink-0" />
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {forgotStep === 'email' && (
              <form onSubmit={handleSendVerificationCode} className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Forgot Password?</h2>
                  <p className="text-sm text-slate-600 mb-4">
                    Enter your email address and we'll send you a verification code.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-200"
                >
                  Send Verification Code
                </button>
              </form>
            )}

            {forgotStep === 'code' && (
              <form onSubmit={handleVerifyCode} className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Enter Verification Code</h2>
                  <p className="text-sm text-slate-600 mb-4">
                    We've sent a 6-digit code to your email.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-200"
                >
                  Verify Code
                </button>
              </form>
            )}

            {forgotStep === 'newPassword' && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Create New Password</h2>
                  <p className="text-sm text-slate-600 mb-4">
                    Enter your new password below.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-200"
                >
                  Reset Password
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}