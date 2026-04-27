import { motion } from 'framer-motion';

export default function SocialButton({ children, onClick, icon }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="
        w-full py-3 px-4 rounded-xl font-semibold
        flex items-center justify-center gap-3
        bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700
        text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700
        transition-all duration-300
        group shadow-md dark:shadow-lg
      "
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span className="flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </span>
      <span>{children}</span>
    </motion.button>
  );
}
