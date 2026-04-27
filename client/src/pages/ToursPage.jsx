import React from 'react';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Logging in with', { email, password });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-300">
      {/* Main Container */}
      <div className="flex w-full max-w-5xl bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Left Section - Illustration Side */}
        <div className="w-1/2 bg-gradient-to-b from-cyan-100 to-teal-100 flex flex-col items-center justify-between p-12">
          {/* Illustration */}
          <div className="flex-1 flex items-center justify-center">
            {/* Bird with flowers SVG placeholder */}
            <svg
              viewBox="0 0 300 400"
              className="w-64 h-80"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Bird body */}
              <ellipse cx="150" cy="250" rx="45" ry="55" fill="#f4a460" />
              {/* Bird head */}
              <circle cx="150" cy="180" r="30" fill="#f4a460" />
              {/* Bird eye */}
              <circle cx="160" cy="175" r="8" fill="white" />
              <circle cx="162" cy="175" r="5" fill="black" />
              {/* Bird tail feathers */}
              <ellipse cx="200" cy="240" rx="20" ry="50" fill="#b83860" transform="rotate(25 200 240)" />
              <ellipse cx="210" cy="260" rx="18" ry="45" fill="#d4486b" transform="rotate(40 210 260)" />
              {/* Flowers and leaves */}
              <circle cx="80" cy="150" r="12" fill="#ff69b4" />
              <circle cx="75" cy="140" r="10" fill="#ff1493" />
              <circle cx="85" cy="140" r="10" fill="#ff1493" />
              <circle cx="90" cy="160" r="10" fill="#ff69b4" />
              <circle cx="70" cy="160" r="10" fill="#ff69b4" />
              <circle cx="80" cy="150" r="6" fill="#ffd700" />
              {/* Yellow flowers */}
              <circle cx="120" cy="100" r="8" fill="#ffd700" />
              <circle cx="115" cy="92" r="6" fill="#ffed4e" />
              <circle cx="125" cy="92" r="6" fill="#ffed4e" />
              <circle cx="130" cy="105" r="6" fill="#ffed4e" />
              <circle cx="110" cy="105" r="6" fill="#ffed4e" />
              {/* Leaves */}
              <ellipse cx="100" cy="120" rx="8" ry="15" fill="#4d8659" transform="rotate(-30 100 120)" />
              <ellipse cx="140" cy="110" rx="8" ry="15" fill="#6ba86f" transform="rotate(20 140 110)" />
              <ellipse cx="160" cy="130" rx="8" ry="15" fill="#4d8659" transform="rotate(-20 160 130)" />
              {/* Orange flowers */}
              <circle cx="200" cy="140" r="10" fill="#ff8c42" />
              <circle cx="210" cy="150" r="8" fill="#ff6b35" />
              <circle cx="200" cy="160" r="8" fill="#ff6b35" />
            </svg>
          </div>

          {/* Text Content */}
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-3">Maecenas mattis egestas</h2>
            <p className="text-sm leading-relaxed">
              Erdum et molesuada fames ac ante ipsum primis in faucibus suspendisse porta.
            </p>
          </div>

          {/* Pagination Dots */}
          <div className="flex gap-2 mt-6">
            <div className="w-2 h-2 rounded-full bg-white"></div>
            <div className="w-2 h-2 rounded-full bg-white/50"></div>
            <div className="w-2 h-2 rounded-full bg-white/50"></div>
          </div>
        </div>

        {/* Right Section - Login Form Side */}
        <div className="w-1/2 flex flex-col items-center justify-center p-12">
          {/* Lovebirds Title */}
          <h1 className="text-4xl font-serif text-gray-600 mb-12 italic">Lovebirds</h1>

          {/* Welcome Text */}
          <h2 className="text-2xl text-gray-400 mb-10 font-light">Welcome to Lovebirds</h2>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="w-full max-w-sm">
            {/* Email Input */}
            <div className="mb-6">
              <label className="block text-gray-400 text-xs font-semibold mb-2 tracking-wide">
                Users name or Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="David Brooks"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-300 focus:bg-white transition"
              />
            </div>

            {/* Password Input */}
            <div className="mb-2">
              <label className="block text-gray-400 text-xs font-semibold mb-2 tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-300 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right mb-8">
              <a href="#" className="text-xs text-gray-400 hover:text-gray-600 transition">
                Forgot password?
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-full transition duration-300 shadow-lg"
            >
              Sign in
            </button>
          </form>

          {/* Divider */}
          <div className="w-full max-w-sm flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-400 text-xs">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Google Sign In Button */}
          <button className="w-full max-w-sm flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition duration-300">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </button>

          {/* Create Account Link */}
          <p className="text-center text-gray-400 text-sm mt-8">
            New Lovebirds?{' '}
            <a href="#" className="text-teal-600 hover:text-teal-700 font-semibold">
              Create Account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

