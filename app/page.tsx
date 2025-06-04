'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [activeTab, setActiveTab] = useState('signin');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signup', email: signupEmail, password: signupPassword }),
      });
      
      const data = await res.json();
      setMessage(data.message);
      
      if (res.status === 201) {
        setSignupEmail('');
        setSignupPassword('');
        setTimeout(() => {
          setActiveTab('signin');
          setMessage('Account created! Please sign in.');
        }, 2000);
      }
    } catch (error) {
      console.error('Signup error:', error);
      setMessage('Error occurred during signup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignin = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signin', email: signinEmail, password: signinPassword }),
      });
    
      const data = await res.json();
      setMessage(data.message);
      
      if (res.status === 200) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userEmail', signinEmail);
        }
        setSigninEmail('');
        setSigninPassword('');
        router.push('/home');
      }
    } catch (error) {
      console.error('Signin error:', error);
      setMessage('Error occurred during sign-in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <nav className="flex justify-center items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-white font-semibold text-lg">Welcome</span>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Welcome Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent mb-4">
              Welcome
            </h1>
            <p className="text-white/70 text-lg">Sign in to your account or create a new one</p>
          </div>

          {/* Auth Container */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
            {/* Tab Headers */}
            <div className="flex bg-white/5 backdrop-blur-sm">
              <button
                onClick={() => setActiveTab('signin')}
                className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-300 ${
                  activeTab === 'signin'
                    ? 'bg-white/20 text-blue-300 border-b-2 border-blue-400'
                    : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-300 ${
                  activeTab === 'signup'
                    ? 'bg-white/20 text-purple-300 border-b-2 border-purple-400'
                    : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === 'signin' ? (
                <form onSubmit={handleSignin}>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-white/60 text-sm">Enter your credentials to access your account</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2" htmlFor="signin-email">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="signin-email"
                        value={signinEmail}
                        onChange={(e) => setSigninEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-white placeholder-white/50"
                        placeholder="Enter your email"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2" htmlFor="signin-password">
                        Password
                      </label>
                      <input
                        type="password"
                        id="signin-password"
                        value={signinPassword}
                        onChange={(e) => setSigninPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-white placeholder-white/50"
                        placeholder="Enter your password"
                        required
                        minLength={6}
                        disabled={isLoading}
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Signing In...</span>
                        </div>
                      ) : (
                        'Sign In'
                      )}
                    </button>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <a href="#" className="text-sm text-blue-300 hover:text-blue-200 transition-colors">
                      Forgot your password?
                    </a>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSignup}>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
                    <p className="text-white/60 text-sm">Join us today and get started in minutes</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2" htmlFor="signup-email">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="signup-email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all text-white placeholder-white/50"
                        placeholder="Enter your email"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2" htmlFor="signup-password">
                        Password
                      </label>
                      <input
                        type="password"
                        id="signup-password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all text-white placeholder-white/50"
                        placeholder="Create a password (min. 6 characters)"
                        required
                        minLength={6}
                        disabled={isLoading}
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Creating Account...</span>
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </div>
                  
                  <div className="mt-6 text-center text-sm text-white/60">
                    By signing up, you agree to our{' '}
                    <a href="#" className="text-purple-300 hover:text-purple-200 transition-colors">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-purple-300 hover:text-purple-200 transition-colors">
                      Privacy Policy
                    </a>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mt-6 p-4 rounded-2xl text-center backdrop-blur-xl border transition-all duration-300 ${
              message.includes('successful') || message.includes('created') 
                ? 'bg-green-500/20 border-green-400/30 text-green-200' 
                : 'bg-red-500/20 border-red-400/30 text-red-200'
            }`}>
              <div className="flex items-center justify-center space-x-2">
                {message.includes('successful') || message.includes('created') ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span>{message}</span>
              </div>
            </div>
          )}
        </div>
      </main>
      {/* Footer */}
      <footer className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/40 text-sm">
            © 2025 Your App. Made with ❤️
          </p>
        </div>
      </footer>
    </div>
  );
}