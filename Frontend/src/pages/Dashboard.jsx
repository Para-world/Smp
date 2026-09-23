import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import LOGO_SRC from '../assets/logo.png';

export default function Dashboard() {
  const { user, signout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signout();
    navigate('/');
  };

  const getRoleIcon = (role) => {
    const icons = {
      student: 'school',
      faculty: 'history_edu',
      admin: 'admin_panel_settings',
      parent: 'supervisor_account',
      dean: 'account_balance',
      registrar: 'assignment_ind',
    };
    return icons[role] || 'person';
  };

  const getRoleLabel = (role) => {
    return role?.charAt(0).toUpperCase() + role?.slice(1);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050811] transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/60 dark:bg-[#0B1120]/80 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-colors duration-300">
        <div className="h-20 max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img alt="EduSphere Logo" className="h-8 w-auto object-contain drop-shadow-md" src={LOGO_SRC} />
            <span className="font-display text-xl text-slate-900 dark:text-white font-bold tracking-tight transition-colors">
              EduSphere
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined text-secondary text-[18px]">
                {getRoleIcon(user?.role)}
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors">
                {getRoleLabel(user?.role)}
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/30 text-sm font-semibold transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Sign Out
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center"
        >
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-secondary/20"
          >
            <span className="text-white text-3xl font-bold">
              {user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
            </span>
          </motion.div>

          {/* Greeting */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="font-display text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors"
          >
            {getGreeting()},{' '}
            <span className="bg-gradient-to-r from-secondary to-blue-500 bg-clip-text text-transparent">
              {user?.name?.split(' ')[0]}
            </span>
            ! 👋
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-slate-500 dark:text-slate-400 mt-3 text-lg transition-colors"
          >
            Welcome to your EduSphere dashboard. Your academic world starts here.
          </motion.p>
        </motion.div>

        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto"
        >
          {[
            { icon: 'menu_book', label: 'Courses', value: '—', color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { icon: 'assignment', label: 'Assignments', value: '—', color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { icon: 'notifications', label: 'Announcements', value: '—', color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}
              className="p-6 rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300 cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 transition-colors`}>
                <span className="material-symbols-outlined text-[24px]">{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white transition-colors">{stat.value}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 transition-colors">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Info banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-12 max-w-3xl mx-auto p-6 rounded-2xl bg-secondary/5 dark:bg-cyan-900/10 border border-secondary/20 dark:border-cyan-800/30 text-center transition-colors"
        >
          <span className="material-symbols-outlined text-secondary dark:text-cyan-400 text-[28px] mb-2 block">
            construction
          </span>
          <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors">
            <strong className="text-slate-900 dark:text-white transition-colors">Dashboard is under construction.</strong>
            <br />
            Your full academic dashboard with courses, grades, attendance, and analytics is coming soon.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
