import { motion } from 'framer-motion';
import AuthImageSlider from '../AuthImageSlider';
import logo from '../../assets/logo_light.png';
import logoWhite from '../../assets/logo_dark.png';
import { useTheme } from '../../context/ThemeContext';

export default function AuthLayout({ children, title, subtitle, showSlider = true }) {
  const { theme } = useTheme();
  const darkMode = theme === 'dark';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 overflow-hidden transition-colors duration-500">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] -mr-96 -mt-96 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[1200px] bg-white rounded-3xl sm:rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col lg:flex-row relative z-10 border border-slate-100"
      >
        {/* Visual Showcase - Left Side */}
        {showSlider && (
          <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 min-h-[400px] lg:min-h-full">
            <div className="absolute inset-0 z-0">
              <AuthImageSlider />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60 z-10" />
            <div className="absolute bottom-16 left-16 right-16 z-20">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3 mb-4"
              >
                <div className="w-12 h-0.5 bg-emerald-500 rounded-full" />
                <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em]">Future Ready</span>
              </motion.div>
              <h2 className="text-4xl font-black text-white tracking-tighter mb-4 leading-tight">
                Synchronizing Jaipur with <span className="text-emerald-500">Sustainable</span> Mobility.
              </h2>
              <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
                Enter the ecosystem and manage your zero-emission journeys with precision and style.
              </p>
            </div>
          </div>
        )}

        {/* Form - Right Side */}
        <div className={`w-full ${showSlider ? 'lg:w-1/2' : 'lg:w-full'} p-6 sm:p-10 md:p-16 lg:p-20 flex flex-col justify-center overflow-y-auto max-h-none lg:max-h-none`}>
          <div className="mb-8 lg:mb-12">
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              src={darkMode ? logoWhite : logo}
              alt="GoElectriQ"
              className="h-8 lg:h-10 w-auto mb-6 lg:mb-10 object-contain mx-auto lg:mx-0"
            />
            {title && <h1 className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tighter mb-2 lg:mb-3 text-center lg:text-left">{title}</h1>}
            {subtitle && <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest text-center lg:text-left">{subtitle}</p>}
          </div>

          {children}
        </div>
      </motion.div>

      {/* Modern Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-10 left-10 hidden xl:flex items-center gap-3 px-6 py-3 bg-white/50 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl"
      >
        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Encryption Level: 256-BIT AES</span>
      </motion.div>
    </div>
  );
}
