import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff, Loader, ArrowRight } from "lucide-react";
import { animate, createTimeline, stagger } from 'animejs';
import '../styles/Auth.css';

import AuthImageSlider from '../components/AuthImageSlider';
import logo from '../assets/logo_light.png';
import logoWhite from '../assets/logo_dark.png';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: authRegister, loginWithGoogle, user } = useAuth();
  const { theme } = useTheme();
  const darkMode = theme === 'dark';

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) navigate("/user/dashboard");
  }, [user, navigate]);

  useEffect(() => {
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
      delay: stagger(80),
      duration: 800
    }, '-=600');

    return () => {
      timeline.pause();
      timeline.revert();
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!agreeTerms) return setError("Please accept terms");

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return setError("Please enter a valid email address");
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, '').slice(-10))) {
      return setError("Please enter a valid 10-digit phone number starting with 6-9");
    }

    setLoading(true);

    try {
      const res = await authRegister(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.phone,
        formData.password
      );

      if (res.success) {
        setSuccess("Account created! Redirecting...");
        setTimeout(() => navigate("/user/dashboard"), 1500);
      } else {
        setError(res.message);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const idToken = credentialResponse?.credential;
      if (!idToken) {
        setError("Invalid Google response. Please try again.");
        setLoading(false);
        return;
      }
      
      const result = await loginWithGoogle(idToken);
      if (result.success) {
        setSuccess("Welcome! Account created...");
        setTimeout(() => navigate("/user/dashboard"), 1500);
      } else {
        setError(result.message || "Google registration failed");
      }
    } catch (err) {
      setError("Google registration error. Try again.");
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
        <div className="auth-right">
          <img src={darkMode ? logoWhite : logo} alt="GoElectriQ Logo" className="h-48 md:h-64 w-auto mb-6 object-contain" />
          <h1 className="auth-title">Join GoElectriQ Today</h1>

          {error && <div className={`p-3 rounded-xl mb-4 text-xs font-bold border text-center ${darkMode ? 'bg-red-900/20 text-red-400 border-red-900/50' : 'bg-red-50 text-red-500 border-red-100'}`}>{error}</div>}
          {success && <div className={`p-3 rounded-xl mb-4 text-xs font-bold border text-center ${darkMode ? 'bg-green-900/20 text-green-400 border-green-900/50' : 'bg-green-50 text-green-500 border-green-100'}`}>{success}</div>}

          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input type="text" name="firstName" placeholder="John" onChange={handleChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" name="lastName" placeholder="Doe" onChange={handleChange} className="form-input" required />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" placeholder="john@example.com" onChange={handleChange} className="form-input" required />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" placeholder="98765 43210" onChange={handleChange} className="form-input" required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <div className="form-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="********"
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                  <div className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Confirm</label>
                <input type="password" name="confirmPassword" placeholder="********" onChange={handleChange} className="form-input" required />
              </div>
            </div>

            <div className="auth-checkbox">
              <input type="checkbox" id="terms" onChange={(e) => setAgreeTerms(e.target.checked)} />
              <label htmlFor="terms">I agree to the <strong>Terms & Privacy</strong></label>
            </div>

            <button type="submit" disabled={loading} className="auth-btn-primary">
              {loading ? <Loader className="animate-spin mx-auto" size={20} /> : (
                <>
                  Create account
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
              text="signup_with"
              size="large"
              shape="pill"
              width="300"
            />
          </div>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
