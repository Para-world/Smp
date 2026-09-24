import { motion, animate, useMotionValue, useTransform, useInView } from 'framer-motion';
import { staggerContainer, fadeInUp, hoverElevate } from '../utils/animations';
import { useEffect, useRef } from 'react';

function AnimatedCounter({ value }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  
  const numMatch = value.match(/[\d,.]+/);
  if (!numMatch) return <span ref={ref}>{value}</span>;
  
  const numStr = numMatch[0].replace(/,/g, '');
  const isFloat = numStr.includes('.');
  const num = parseFloat(numStr);
  
  const prefix = value.substring(0, numMatch.index);
  const suffix = value.substring(numMatch.index + numMatch[0].length);

  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    if (isFloat) {
      return prefix + latest.toFixed(2) + suffix;
    }
    return prefix + Math.floor(latest).toLocaleString() + suffix;
  });

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, num, { duration: 2.5, ease: "easeOut" });
      return controls.stop;
    }
  }, [count, num, isInView]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

const institutions = [
  { icon: 'account_balance', name: 'Northbridge' },
  { icon: 'hub', name: 'Horizon Tech' },
  { icon: 'auto_stories', name: 'Nova College' },
  { icon: 'school', name: 'Greenfield' },
  { icon: 'public', name: 'Apex Global' },
  { icon: 'domain', name: 'FutureTech' },
];

const stats = [
  { value: '250,000+', label: 'Students Managed Worldwide', color: 'text-secondary' },
  { value: '12,500+', label: 'Active Faculty & Educators', color: 'text-primary dark:text-white' },
  { value: '99.98%', label: 'Verified Uptime & SLA', color: 'text-emerald-600 dark:text-emerald-400' },
  { value: '45 min', label: 'Average Daily Admin Time Saved', color: 'text-primary dark:text-white' },
];

export default function SocialProof() {
  return (
    <section className="py-14 bg-slate-50 dark:bg-[#050811] border-y border-slate-200/60 dark:border-slate-800 px-margin lg:px-margin-lg transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-space-lg">
        <span className="font-label-xs text-label-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold text-center transition-colors">
          Trusted by Leading Modern Educational Institutions
        </span>
        <div className="w-full overflow-hidden relative flex py-4 opacity-75">
          {/* Gradient Masks for smooth fading on edges */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-50 dark:from-[#050811] to-transparent z-10 pointer-events-none transition-colors"></div>
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-50 dark:from-[#050811] to-transparent z-10 pointer-events-none transition-colors"></div>
          
          <motion.div 
            className="flex items-center gap-16 w-max pl-8"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
          >
            {[...institutions, ...institutions].map((inst, idx) => (
              <div key={`${inst.name}-${idx}`} className="flex shrink-0 min-w-max items-center gap-2 font-display text-headline-sm font-bold tracking-tighter text-on-surface dark:text-slate-400 grayscale hover:grayscale-0 dark:opacity-60 dark:hover:opacity-100 transition-all cursor-pointer whitespace-nowrap">
                <span className="material-symbols-outlined text-secondary text-[26px]">{inst.icon}</span>
                <span>{inst.name}</span>
              </div>
            ))}
          </motion.div>
        </div>
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="w-full grid grid-cols-2 lg:grid-cols-4 gap-gutter-sm pt-6"
        >
          {stats.map((stat) => (
            <motion.div variants={fadeInUp} whileHover="hover" custom={hoverElevate} key={stat.label} className="p-5 rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] dark:shadow-none flex flex-col items-center text-center cursor-pointer transition-colors duration-300">
              <span className={`font-display text-headline-lg ${stat.color} font-bold transition-colors`}><AnimatedCounter value={stat.value} /></span>
              <span className="font-label-sm text-label-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
