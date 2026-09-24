import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Card } from '@/components/ui/card';

export default function WelcomeCard() {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getFormattedDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const firstName = user?.name?.split(' ')[0] || 'Student';

  return (
    <Card className="relative overflow-hidden border-0 bg-slate-900 text-white shadow-xl dark:bg-[#050811] dark:border dark:border-slate-800">
      {/* Subtle animated background (Aceternity-inspired) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30 dark:opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear',
          }}
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `radial-gradient(circle at center, #ffffff 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
        <div className="absolute top-1/4 -right-20 w-72 h-72 rounded-full bg-indigo-500/20 blur-[80px]" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-purple-500/20 blur-[80px]" />
      </div>

      <div className="relative z-10 p-6 sm:p-8 md:p-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            <p className="text-indigo-200 dark:text-indigo-400 text-sm font-medium tracking-wide uppercase">
              {getFormattedDate()}
            </p>
            <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-200 dark:text-indigo-300">
              Current Semester: Fall 2026
            </div>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 text-white">
            {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">{firstName}</span> 👋
          </h2>
          <p className="text-indigo-100/80 dark:text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed">
            Here's what's happening with your academic journey today. Review your attendance, pending assignments, and upcoming classes.
          </p>
        </motion.div>
      </div>
    </Card>
  );
}
