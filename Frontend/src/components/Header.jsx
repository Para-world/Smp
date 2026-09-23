import LOGO_SRC from '../assets/logo.png';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Header() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial state
    setIsDark(document.documentElement.classList.contains('dark'));
    
    // Create an observer to watch for class changes on the html element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'));
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/60 dark:bg-[#0B1120]/80 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-colors duration-300"
    >
      <div className="h-20 max-w-7xl mx-auto px-margin lg:px-margin-lg flex items-center justify-between gap-space-lg">
        <div className="flex items-center gap-space-md">
          <img alt="EduSphere Logo" className="h-8 w-auto object-contain drop-shadow-md" src={LOGO_SRC} />
          <span className="font-display text-headline-md text-slate-900 dark:text-white font-bold tracking-tight transition-colors">EduSphere</span>
        </div>
        <nav className="hidden xl:flex items-center gap-space-lg">
          <a className="font-label-md text-label-md text-slate-500 dark:text-slate-400 hover:text-secondary dark:hover:text-cyan-400 transition-colors font-medium" href="#features">Features</a>
          <a className="font-label-md text-label-md text-slate-500 dark:text-slate-400 hover:text-secondary dark:hover:text-cyan-400 transition-colors font-medium" href="#solutions">Solutions</a>
          <a className="font-label-md text-label-md text-slate-500 dark:text-slate-400 hover:text-secondary dark:hover:text-cyan-400 transition-colors font-medium" href="#platform">Platform</a>
          <a className="font-label-md text-label-md text-slate-500 dark:text-slate-400 hover:text-secondary dark:hover:text-cyan-400 transition-colors font-medium" href="#role-portals">Role Portals</a>
          <a className="font-label-md text-label-md text-slate-500 dark:text-slate-400 hover:text-secondary dark:hover:text-cyan-400 transition-colors font-medium" href="#analytics">Analytics</a>
          <a className="font-label-md text-label-md text-slate-500 dark:text-slate-400 hover:text-secondary dark:hover:text-cyan-400 transition-colors font-medium" href="#faq">FAQ</a>
        </nav>
        <div className="flex items-center gap-space-md">
          <div className="toggle-switch scale-75 origin-center">
            <label className="switch-label">
              <input 
                type="checkbox" 
                className="checkbox" 
                checked={!isDark} 
                onChange={toggleTheme} 
              />
              <span className="slider" />
            </label>
          </div>
          <a className="hidden sm:inline-flex items-center justify-center px-space-md py-space-sm rounded-lg font-label-md text-label-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-white transition-all font-semibold" href="#signin">Sign In</a>
          <motion.a 
            whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(56,189,248,0.3)" }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center px-space-lg py-space-sm rounded-lg bg-gradient-to-r from-secondary to-blue-500 text-white font-label-md text-label-md shadow-lg transition-all font-bold" 

            href="#get-started"
          >
            Get Started Free
          </motion.a>
          <div className="w-8 h-8 rounded-full bg-primary dark:bg-slate-700 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-on-primary dark:text-white text-[18px]">person</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
