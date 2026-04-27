import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

export default function AuthButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
  icon,
  variant = 'default',
  className = '',
}) {
  const { theme } = useTheme();

  const variants = {
    default: theme === 'light'
      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white',
    admin: 'bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 hover:from-slate-800 dark:hover:from-slate-700 hover:to-black dark:hover:to-slate-900 text-white',
    outline: theme === 'light'
      ? 'border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50'
      : 'border-2 border-purple-500 text-purple-400 dark:hover:bg-purple-900/20',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full py-3 px-4 rounded-xl font-semibold
        flex items-center justify-center gap-2
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        shadow-lg dark:shadow-lg
        ${variants[variant]}
        ${className}
      `}
      whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {icon && <span className="flex items-center justify-center">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
}
