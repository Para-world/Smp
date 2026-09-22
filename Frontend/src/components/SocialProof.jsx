import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp, hoverElevate } from '../utils/animations';

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
  { value: '12,500+', label: 'Active Faculty & Educators', color: 'text-primary' },
  { value: '99.98%', label: 'Verified Uptime & SLA', color: 'text-emerald-600' },
  { value: '45 min', label: 'Average Daily Admin Time Saved', color: 'text-primary' },
];

export default function SocialProof() {
  return (
    <section className="py-14 bg-surface-container-low px-margin lg:px-margin-lg">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-space-lg">
        <span className="font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant font-bold text-center">
          Trusted by Leading Modern Educational Institutions
        </span>
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-center justify-items-center opacity-75"
        >
          {institutions.map((inst) => (
            <motion.div variants={fadeInUp} key={inst.name} className="flex items-center gap-2 font-display text-headline-sm font-bold tracking-tighter text-on-surface grayscale hover:grayscale-0 transition-all cursor-pointer">
              <span className="material-symbols-outlined text-secondary text-[26px]">{inst.icon}</span>
              <span>{inst.name}</span>
            </motion.div>
          ))}
        </motion.div>
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="w-full grid grid-cols-2 lg:grid-cols-4 gap-gutter-sm pt-6"
        >
          {stats.map((stat) => (
            <motion.div variants={fadeInUp} whileHover="hover" custom={hoverElevate} key={stat.label} className="p-4 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col items-center text-center cursor-pointer">
              <span className={`font-display text-headline-lg ${stat.color} font-bold`}>{stat.value}</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant mt-1">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
