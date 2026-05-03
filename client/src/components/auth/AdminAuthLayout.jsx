import { motion } from 'framer-motion';
import { Lock, Shield } from 'lucide-react';

export default function AdminAuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-400 to-slate-600 opacity-5" />
        <svg className="w-full h-full" width="60" height="60">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Animated Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Slate Glow - Top Right */}
        <motion.div
          className="absolute top-20 right-40 w-96 h-96 bg-slate-500 rounded-full opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        {/* Blue Glow - Bottom Left */}
        <motion.div
          className="absolute bottom-32 left-32 w-80 h-80 bg-slate-600 rounded-full opacity-15 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        />

        {/* Purple Glow - Center */}
        <motion.div
          className="absolute top-1/2 right-1/3 w-72 h-72 bg-slate-700 rounded-full opacity-10 blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 12, repeat: Infinity, delay: 2 }}
        />
      </div>

      {/* Floating Security Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-10 text-slate-700 opacity-10 text-6xl"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          <Lock size={64} />
        </motion.div>
        <motion.div
          className="absolute bottom-1/4 right-10 text-slate-700 opacity-10 text-6xl"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        >
          <Shield size={64} />
        </motion.div>
      </div>

      {/* Main Content */}
      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Glassmorphism Card with Premium Effect */}
        <motion.div
          className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8 relative overflow-hidden"
          whileHover={{ borderColor: 'rgba(255,255,255,0.2)' }}
          transition={{ duration: 0.3 }}
        >
          {/* Gradient Border Accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-400/5 via-transparent to-slate-600/5 rounded-2xl pointer-events-none" />

          {/* Corner Accent Light */}
          <motion.div
            className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-300/10 to-transparent rounded-full blur-2xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          {/* Content */}
          <div className="relative z-10 space-y-6">{children}</div>

          {/* Bottom Accent Line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-400/30 to-transparent" />
        </motion.div>

        {/* Security Status Footer */}
        <motion.div
          className="mt-6 text-center space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* Status Indicator */}
          <div className="flex items-center justify-center gap-2 text-slate-300 text-sm">
            <motion.div
              className="w-2 h-2 rounded-full bg-green-500"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span>System Secure</span>
          </div>

          {/* Timestamp */}
          <p className="text-xs text-slate-500">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>

          {/* Lock Icon */}
          <div className="flex justify-center">
            <div className="text-slate-600"><Lock size={16} /></div>
          </div>
        </motion.div>
      </motion.div>

      {/* Corner Watermark */}
      <div className="absolute bottom-4 right-4 text-slate-700 opacity-30 text-sm">
        GoElectriQ Admin
      </div>
    </div>
  );
}
