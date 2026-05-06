import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { GoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff, Loader, ArrowRight } from 'lucide-react';
import { animate, createTimeline, stagger } from 'animejs';
import '../styles/Auth.css';

import AuthImageSlider from '../components/AuthImageSlider';
import logo from '../assets/logo_light.png';
import logoWhite from '../assets/logo_dark.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: authLogin, loginWithGoogle, user } = useAuth();
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const rightRef = useRef(null);

  useEffect(() => {
    if (user) navigate('/user/dashboard');
  }, [user, navigate]);

  useEffect(() => {
    // Entrance animation for the right side elements
    const timeline = createTimeline({
      defaults: {
        ease: 'outExpo',
      },
    })
    .add('.auth-card', {
      opacity: [0, 1],
      y: [20, 0],
      duration: 1000
    })
    .add('.auth-right > *', {
      y: [20, 0],
      opacity: [0, 1],
      delay: stagger(100),
      duration: 800
    }, '-=600');

    return () => {
      timeline.pause();
      timeline.revert();
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); 
    setSuccess('');
    setLoading(true);
    try {
      const result = await authLogin(identifier, password);
      if (result.success) {
        setSuccess('Welcome back! Gear up...');
        setTimeout(() => navigate('/user/dashboard'), 1500);
      } else {
        if (result.message && result.message.includes('admin login page')) {
          setError('Admins must use the admin login page');
          setTimeout(() => navigate('/admin/login', { replace: true }), 2000);
        } else {
          setError(result.message || 'Check your keys and try again.');
        }
      }
    } catch (err) {
      setError('System engine error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      const idToken = credentialResponse?.credential;
      if (!idToken) {
        setError('Invalid Google response. Please try again.');
        setLoading(false);
        return;
      }
      
      const result = await loginWithGoogle(idToken);
      if (result.success) {
        setSuccess('Welcome back! Gear up...');
        setTimeout(() => navigate('/user/dashboard'), 1500);
      } else {
        setError(result.message || 'Google login failed');
      }
    } catch (err) {
      setError('Google login error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Left Side */}
        <div className="auth-left">
          <AuthImageSlider />
        </div>

        {/* Right Side */}
        <div className="auth-right" ref={rightRef}>
          <img src={darkMode ? logoWhite : logo} alt="GoElectriQ Logo" className="h-48 md:h-64 w-auto mb-6 object-contain" />
          <h1 className="auth-title">Welcome to GoElectriQ</h1>

          {error && <div className={`p-3 rounded-xl mb-4 text-xs font-bold border text-center ${darkMode ? 'bg-red-900/20 text-red-400 border-red-900/50' : 'bg-red-50 text-red-500 border-red-100'}`}>{error}</div>}
          {success && <div className={`p-3 rounded-xl mb-4 text-xs font-bold border text-center ${darkMode ? 'bg-green-900/20 text-green-400 border-green-900/50' : 'bg-green-50 text-green-500 border-green-100'}`}>{success}</div>}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <div className="form-input-container">
                <input
                  type="text"
                  placeholder="john@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="form-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  required
                />
                <div className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
            </div>

            <div className="auth-forgot">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading} className="auth-btn-primary">
              {loading ? <Loader className="animate-spin mx-auto" size={20} /> : (
                <>
                  Sign in
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <div className="google-btn-wrapper">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google auth failed')}
              text="signin_with"
              size="large"
              shape="pill"
              width="300"
            />
          </div>

          <p className="auth-switch">
            New to GoElectriQ? <Link to="/register">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
