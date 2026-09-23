import { motion } from 'framer-motion';
import { slideInLeft, slideInRight, staggerContainer, fadeInUp } from '../utils/animations';

const securityFeatures = [
  { icon: 'verified_user', label: 'FERPA & GDPR Compliant' },
  { icon: 'security', label: 'SOC-2 Type II Certified' },
  { icon: 'key', label: '256-bit AES Data Encryption' },
  { icon: 'vpn_lock', label: 'SAML SSO / Okta Integration' },
];

export default function Security() {
  return (
    <section className="py-24 bg-surface-container-low dark:bg-[#050811] px-margin lg:px-margin-lg transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="p-10 lg:p-14 rounded-3xl bg-white dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] dark:shadow-none transition-colors duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-center overflow-hidden">
            <motion.div 
              variants={slideInLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="lg:col-span-7 flex flex-col gap-4"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 text-label-xs font-bold w-fit transition-colors">
                <span className="material-symbols-outlined text-[16px]">lock</span>
                <span>Enterprise Grade Security</span>
              </div>
              <h2 className="font-display text-headline-lg text-slate-900 dark:text-white font-bold tracking-tight transition-colors">Your institution&apos;s data deserves serious protection.</h2>
              <p className="font-body-md text-body-md text-slate-500 dark:text-slate-400 leading-relaxed transition-colors">EduSphere meets the highest global standards for student record privacy and cryptographic infrastructure. Built with end-to-end encryption and compliance-first architecture.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {securityFeatures.map((f) => (
                  <div key={f.label} className="flex items-center gap-2.5 text-body-sm font-medium text-slate-800 dark:text-slate-200 transition-colors">
                    <span className="material-symbols-outlined text-secondary text-[20px]">{f.icon}</span>
                    <span>{f.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div 
              variants={slideInRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="lg:col-span-5 flex items-center justify-center"
            >
              <div className="w-64 h-64 rounded-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center relative p-6 text-center shadow-inner transition-colors">
                <span className="material-symbols-outlined text-secondary text-[64px] animate-pulse">shield</span>
                <span className="font-display text-headline-sm text-slate-900 dark:text-white font-bold mt-2 tracking-tight transition-colors">Zero-Trust</span>
                <span className="text-label-xs text-slate-500 dark:text-slate-400 transition-colors">Continuous Audit Logs &amp; Backups</span>
                <div className="absolute top-2 right-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded-full p-1.5 shadow-md transition-colors">
                  <span className="material-symbols-outlined text-[16px]">check</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
