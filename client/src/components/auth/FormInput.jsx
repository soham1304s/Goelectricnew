import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export default function FormInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon,
  rightIcon,
  disabled = false,
  error = null,
  name,
}) {
  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      <div className="relative group">
        {/* Background Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 dark:from-purple-600 dark:to-indigo-600 rounded-xl opacity-0 group-focus-within:opacity-20 blur transition-opacity duration-300" />

        {/* Input Container */}
        <div className="relative flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl transition-all duration-300 group-focus-within:border-yellow-500 dark:group-focus-within:border-purple-500 group-hover:border-gray-300 dark:group-hover:border-slate-600">
          {/* Left Icon */}
          {icon && (
            <div className="text-gray-400 dark:text-gray-500 group-focus-within:text-yellow-500 dark:group-focus-within:text-purple-500 transition-colors">
              {icon}
            </div>
          )}

          {/* Input Field */}
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          />

          {/* Right Icon */}
          {rightIcon && (
            <div className="text-gray-400 dark:text-gray-500 group-focus-within:text-yellow-500 dark:group-focus-within:text-purple-500 transition-colors">
              {rightIcon}
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
        >
          <AlertCircle size={14} /> {error}
        </motion.p>
      )}
    </motion.div>
  );
}
