import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import FormInput from '../components/auth/FormInput';
import AuthButton from '../components/auth/AuthButton';
import * as authService from '../services/authService';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState('email'); // 'email' or 'submitted'

  const validateEmail = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail()) return;

    setLoading(true);
    try {
      const result = await authService.forgotPassword(email);
      if (result.success) {
        setSuccess(true);
        setStep('submitted');
      } else {
        setError(result.message || 'Failed to send reset email. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <AuthLayout>
      <motion.div
        className="w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === 'email' ? 'Reset Password' : 'Check Your Email'}
          </h1>
          <p className="text-gray-600">
            {step === 'email'
              ? "Enter your email address and we'll send you a link to reset your password"
              : "We've sent a password reset link to your email"}
          </p>
        </motion.div>

        {step === 'email' ? (
          <>
            {/* Email Form */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2"
              >
                <span>⚠️</span>
                {error}
              </motion.div>
            )}

            <motion.form onSubmit={handleSubmit} className="space-y-4" variants={itemVariants}>
              <FormInput
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                icon={<Mail size={18} />}
                disabled={loading}
              />

              <AuthButton
                type="submit"
                disabled={loading}
                icon={loading ? <Loader className="animate-spin" size={18} /> : undefined}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </AuthButton>
            </motion.form>

            {/* Back to Login Link */}
            <motion.div className="mt-6 text-center" variants={itemVariants}>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </motion.div>
          </>
        ) : (
          <>
            {/* Success State */}
            <motion.div
              className="space-y-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Success Icon */}
              <motion.div
                className="flex justify-center"
                variants={itemVariants}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-full">
                  <CheckCircle className="text-green-600" size={48} />
                </div>
              </motion.div>

              {/* Message */}
              <motion.div className="text-center space-y-2" variants={itemVariants}>
                <p className="text-gray-700">
                  <strong>{email}</strong>
                </p>
                <p className="text-gray-600 text-sm">
                  Check your email inbox and click the link to reset your password. The link expires in 24 hours.
                </p>
              </motion.div>

              {/* Spam Notice */}
              <motion.div
                className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm"
                variants={itemVariants}
              >
                <p className="font-medium mb-1">💡 Tip:</p>
                <p>If you don't see the email, check your spam or junk folder.</p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div className="space-y-3" variants={itemVariants}>
                <AuthButton
                  type="button"
                  onClick={() => {
                    setEmail('');
                    setStep('email');
                    setError('');
                  }}
                >
                  Try Another Email
                </AuthButton>

                <Link
                  to="/login"
                  className="block w-full py-3 px-4 text-center rounded-xl font-semibold border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 transition-colors"
                >
                  Back to Login
                </Link>
              </motion.div>
            </motion.div>
          </>
        )}

        {/* Help Text */}
        <motion.p className="mt-8 text-center text-sm text-gray-500" variants={itemVariants}>
          Need help?{' '}
          <Link to="/contact" className="text-yellow-600 hover:text-yellow-700 font-medium">
            Contact Support
          </Link>
        </motion.p>
      </motion.div>
    </AuthLayout>
  );
}
