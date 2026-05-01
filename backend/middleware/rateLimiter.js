import { rateLimit } from 'express-rate-limit';

const isProduction = process.env.NODE_ENV === 'production';

// Common skip function for all limiters in development
const skipInDevelopment = () => !isProduction;

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const RATE_LIMIT_WINDOW_MINUTES = parsePositiveInt(process.env.RATE_LIMIT_WINDOW, 15);
const RATE_LIMIT_MAX_REQUESTS = parsePositiveInt(process.env.RATE_LIMIT_MAX_REQUESTS, 500);

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  max: RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (skipInDevelopment()) return true;
    if (req.originalUrl?.includes('/auth')) return true;
    if (req.method === 'GET') {
      const url = req.originalUrl || '';
      if (url.startsWith('/api/packages') || url.startsWith('/api/feedback')) {
        return true;
      }
    }
    return false;
  },
});

/**
 * Auth route rate limiter
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  skip: skipInDevelopment,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
  },
});

/**
 * Payment route rate limiter
 */
export const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50, // Increased for testing
  skip: skipInDevelopment,
  message: {
    success: false,
    message: 'Too many payment requests, please try again later.',
  },
});

/**
 * Booking route rate limiter
 */
export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100, // Increased for testing
  skip: skipInDevelopment,
  message: {
    success: false,
    message: 'Too many booking requests, please try again later.',
  },
});

/**
 * OTP rate limiter
 */
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: skipInDevelopment,
  message: {
    success: false,
    message: 'Too many OTP requests, please try again after 15 minutes.',
  },
});

/**
 * Admin dashboard rate limiter
 */
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (skipInDevelopment()) return true;
    return req.user && req.user.isAdmin;
  },
  message: {
    success: false,
    message: 'Admin dashboard rate limit exceeded.',
  },
});

export default {
  apiLimiter,
  authLimiter,
  paymentLimiter,
  bookingLimiter,
  otpLimiter,
  adminLimiter,
};