import LOGO_SRC from '../assets/logo.png';
import { motion } from 'framer-motion';

export default function Header() {
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]"
    >
      <div className="h-20 max-w-7xl mx-auto px-margin lg:px-margin-lg flex items-center justify-between gap-space-lg">
        <div className="flex items-center gap-space-md">
          <img alt="EduSphere Logo" className="h-8 w-auto object-contain" src={LOGO_SRC} />
          <span className="font-headline-md text-headline-md text-primary tracking-tight">EduSphere</span>
        </div>
        <nav className="hidden xl:flex items-center gap-space-lg">
          <a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" href="#features">Features</a>
          <a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" href="#solutions">Solutions</a>
          <a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" href="#platform">Platform</a>
          <a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" href="#role-portals">Role Portals</a>
          <a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" href="#analytics">Analytics</a>
          <a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" href="#faq">FAQ</a>
        </nav>
        <div className="flex items-center gap-space-md">
          <a className="hidden sm:inline-flex items-center justify-center px-space-md py-space-sm rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all" href="#signin">Sign In</a>
          <motion.a 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center px-space-lg py-space-sm rounded-lg bg-secondary text-on-secondary font-label-md text-label-md shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] hover:bg-secondary-container transition-all" 
            href="#get-started"
          >
            Get Started Free
          </motion.a>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
