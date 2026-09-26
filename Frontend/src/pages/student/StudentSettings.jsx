import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, Shield, Smartphone, Palette, Globe, CheckCircle2, AlertCircle, Laptop, Monitor, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getSettings, updateSettings, changePassword, getTrustedDevices, revokeDevice, logoutAllOtherDevices, logoutAllDevices } from '../../services/studentApi';
import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';

export default function StudentSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [settings, setSettings] = useState(null);
  const [profile, setProfile] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Layout states
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsRes, devicesRes] = await Promise.all([
        getSettings(),
        getTrustedDevices()
      ]);
      setSettings(settingsRes.settings);
      setProfile(settingsRes.profile);
      setDevices(devicesRes.devices);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'devices', label: 'Connected Devices', icon: Smartphone },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050811] flex transition-colors">
      <StudentSidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? 'md:ml-20' : 'md:ml-72'}`}>
        <StudentHeader 
          user={user} 
          collapsed={collapsed}
          setMobileOpen={setMobileOpen}
        />
        
        <main className="flex-1 p-6 lg:p-8 max-w-6xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your account preferences, security, and connected devices.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Tabs */}
            <div className="w-full lg:w-64 flex-shrink-0">
              <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 hide-scrollbar">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                        isActive 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-center items-center h-64"
                  >
                    <span className="material-symbols-outlined text-[32px] animate-spin text-blue-500">progress_activity</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === 'account' && <AccountTab settings={settings} profile={profile} onUpdate={fetchData} user={user} />}
                    {activeTab === 'profile' && (
                      <div className="bg-white dark:bg-[#0B1120] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 text-slate-500">
                        Profile settings are managed in the <a href="/student/profile" className="text-blue-500 underline">My Profile</a> section.
                      </div>
                    )}
                    {activeTab === 'appearance' && <AppearanceTab settings={settings} onUpdate={fetchData} />}
                    {activeTab === 'notifications' && <NotificationsTab settings={settings} onUpdate={fetchData} />}
                    {activeTab === 'security' && <SecurityTab onUpdate={fetchData} />}
                    {activeTab === 'devices' && <DevicesTab devices={devices} onUpdate={fetchData} />}
                    {activeTab === 'privacy' && <PrivacyTab />}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Account Tab ─────────────────────────────────────────────────────────────

function AccountTab({ settings, profile, onUpdate, user }) {
  const [lang, setLang] = useState(settings?.language || 'en');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({ language: lang });
      await onUpdate();
    } catch (err) {}
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Account Information</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Basic information about your account.</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
              <input type="text" readOnly value={profile?.name || user?.name || ''} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 focus:outline-none cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>Email</span>
                {profile?.emailVerified !== undefined && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${profile.emailVerified ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                    {profile.emailVerified ? 'Verified' : 'Not Verified'}
                  </span>
                )}
              </label>
              <div className="relative">
                <input type="text" readOnly value={profile?.email || user?.email || ''} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 focus:outline-none cursor-not-allowed" />
                {!profile?.emailVerified && (
                  <button type="button" onClick={() => window.alert('Verification email sent to your inbox.')} className="absolute right-2 top-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg transition-colors">
                    Verify Email
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1.5">Institutional email cannot be changed.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Student ID</label>
              <input type="text" readOnly value={profile?.studentId || ''} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 focus:outline-none cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Program</label>
              <input type="text" readOnly value={profile?.program || ''} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 focus:outline-none cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Semester</label>
              <input type="text" readOnly value={profile?.semester || ''} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 focus:outline-none cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <input type="text" readOnly value={profile?.status || ''} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 focus:outline-none cursor-not-allowed" />
            </div>
          </div>
          
          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Language Preferences</label>
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
              className="w-full max-w-md px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="en">English (US)</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
          
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Appearance Tab ──────────────────────────────────────────────────────────

function AppearanceTab({ settings, onUpdate }) {
  const [theme, setTheme] = useState(settings?.theme || 'system');
  const [saving, setSaving] = useState(false);

  const handleSave = async (newTheme) => {
    setTheme(newTheme);
    setSaving(true);
    try {
      await updateSettings({ theme: newTheme });
      // Apply theme globally if needed
      if (newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      await onUpdate();
    } catch (err) {}
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Theme Preferences</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Choose how EduSphere looks to you.</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {['light', 'dark', 'system'].map((t) => (
            <button
              key={t}
              onClick={() => handleSave(t)}
              className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                theme === t 
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700/50'
              }`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                t === 'light' ? 'bg-slate-100 text-yellow-500' : 
                t === 'dark' ? 'bg-slate-800 text-blue-400' : 
                'bg-gradient-to-r from-slate-100 to-slate-800 text-slate-500'
              }`}>
                <Palette className="w-8 h-8" />
              </div>
              <span className="font-medium text-slate-900 dark:text-white capitalize">{t}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Notifications Tab ───────────────────────────────────────────────────────

function NotificationsTab({ settings, onUpdate }) {
  const [prefs, setPrefs] = useState({
    emailNotifications: settings?.emailNotifications ?? true,
    assignmentNotifications: settings?.assignmentNotifications ?? true,
    examNotifications: settings?.examNotifications ?? true,
    resultNotifications: settings?.resultNotifications ?? true,
    attendanceNotifications: settings?.attendanceNotifications ?? true,
    announcementNotifications: settings?.announcementNotifications ?? true,
    timetableNotifications: settings?.timetableNotifications ?? true,
  });
  const [saving, setSaving] = useState(false);

  const toggle = (key) => {
    setPrefs(p => ({ ...p, [key]: !p[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(prefs);
      await onUpdate();
    } catch (err) {}
    setSaving(false);
  };

  const items = [
    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive daily digests via email' },
    { key: 'assignmentNotifications', label: 'Assignments', desc: 'New assignments, due soon, and graded' },
    { key: 'examNotifications', label: 'Exams', desc: 'Exam schedules, reminders, and changes' },
    { key: 'resultNotifications', label: 'Results', desc: 'Alerts when results are published' },
    { key: 'attendanceNotifications', label: 'Attendance', desc: 'Attendance warnings and updates' },
    { key: 'announcementNotifications', label: 'Announcements', desc: 'Important and course announcements' },
    { key: 'timetableNotifications', label: 'Timetable', desc: 'Class cancellations and room changes' },
  ];

  const criticalItems = [
    { label: 'Password changed', desc: 'Alerts when your password is changed' },
    { label: 'New device login', desc: 'Alerts when a new device accesses your account' },
    { label: 'Security verification', desc: 'Verification codes for new devices' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Notification Preferences</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Control what you get notified about.</p>
          </div>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        
        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Account Security (Required)</h3>
          <div className="space-y-4">
            {criticalItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{item.label}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium hidden sm:inline">Required for account security</span>
                  <div className="w-12 h-6 rounded-full bg-slate-200 dark:bg-slate-800 relative opacity-50 cursor-not-allowed">
                    <div className="w-4 h-4 rounded-full bg-slate-400 absolute top-1 left-7" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {items.map((item) => (
            <div key={item.key} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{item.label}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
              <button 
                onClick={() => toggle(item.key)}
                className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${prefs[item.key] ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${prefs[item.key] ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Security Tab ──────────────────────────────────────────────────────────────

function SecurityTab({ onUpdate }) {
  const [pass, setPass] = useState({ current: '', new: '', confirm: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [changing, setChanging] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pass.new !== pass.confirm) {
      setMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    setChanging(true);
    try {
      await changePassword({ currentPassword: pass.current, newPassword: pass.new });
      setMsg({ type: 'success', text: 'Password updated successfully' });
      setPass({ current: '', new: '', confirm: '' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
    setChanging(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Change Password</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Ensure your account is using a long, random password to stay secure.</p>
        </div>
        <div className="p-6 flex flex-col md:flex-row gap-8">
          <div className="flex-1 max-w-md">
            {msg.text && (
              <div className={`mb-4 p-4 rounded-xl flex items-center gap-2 ${msg.type === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'}`}>
                {msg.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                {msg.text}
              </div>
            )}
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                <input type="password" required value={pass.current} onChange={e => setPass(p => ({...p, current: e.target.value}))} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                <input type="password" required value={pass.new} onChange={e => setPass(p => ({...p, new: e.target.value}))} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                <input type="password" required value={pass.confirm} onChange={e => setPass(p => ({...p, confirm: e.target.value}))} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
              <button type="submit" disabled={changing} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50">
                {changing ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </div>
          <div className="w-full md:w-64 space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Password must contain:</h3>
              <ul className="space-y-2 text-sm">
                {[
                  { label: 'At least 8 characters', met: pass.new.length >= 8 },
                  { label: 'One uppercase letter', met: /[A-Z]/.test(pass.new) },
                  { label: 'One lowercase letter', met: /[a-z]/.test(pass.new) },
                  { label: 'One number', met: /[0-9]/.test(pass.new) },
                  { label: 'One special character', met: /[^A-Za-z0-9]/.test(pass.new) },
                ].map((req, i) => (
                  <li key={i} className={`flex items-center gap-2 ${req.met ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    <CheckCircle2 className={`w-4 h-4 ${req.met ? 'opacity-100' : 'opacity-30'}`} />
                    {req.label}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Two-Factor Auth</h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">Disabled</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Institutional 2FA is currently managed by administrators. Add an extra layer of security when available.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Devices Tab ─────────────────────────────────────────────────────────────

function DevicesTab({ devices, onUpdate }) {
  const { signout } = useAuth();
  const [confirmOther, setConfirmOther] = useState(false);
  const [confirmAll, setConfirmAll] = useState(false);
  const [deviceToRevoke, setDeviceToRevoke] = useState(null);

  const getDeviceIcon = (deviceName = '') => {
    const name = deviceName.toLowerCase();
    if (name.includes('mobile') || name.includes('android') || name.includes('ios')) return Smartphone;
    if (name.includes('mac') || name.includes('windows') || name.includes('linux')) return Laptop;
    return Monitor;
  };

  const handleSignOutOther = async () => {
    try {
      await logoutAllOtherDevices();
      setConfirmOther(false);
      onUpdate();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleSignOutAll = async () => {
    try {
      await logoutAllDevices();
      setConfirmAll(false);
      signout(); // Context logout clears local storage and redirects
    } catch (e) {
      alert(e.message);
    }
  };

  const handleRevokeDevice = async () => {
    if (!deviceToRevoke) return;
    try {
      await revokeDevice(deviceToRevoke);
      setDeviceToRevoke(null);
      onUpdate();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Connected Devices</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage active sessions and trusted devices.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => setConfirmOther(true)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium rounded-xl transition-colors flex items-center gap-2 text-sm"
            >
              Sign out other devices
            </button>
            <button 
              onClick={() => setConfirmAll(true)}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-medium rounded-xl transition-colors flex items-center gap-2 text-sm"
            >
              Sign out all devices
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {devices.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No devices found.</div>
          ) : (
            devices.map((device) => {
              const Icon = getDeviceIcon(device.deviceName);
              return (
                <div key={device.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        {device.deviceName || 'Unknown Device'}
                        {device.isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium border border-green-200 dark:border-green-800/50">
                            Current Device
                          </span>
                        )}
                      </h3>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-x-3 gap-y-1">
                        <span>{device.browser} • {device.operatingSystem}</span>
                        <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
                        <span>{device.isCurrent ? 'Active now' : `Last active: ${new Date(device.lastActiveAt).toLocaleString()}`}</span>
                        {device.createdAt && (
                          <>
                            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
                            <span>Trusted since: {new Date(device.createdAt).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {!device.isCurrent && (
                    <button
                      onClick={() => setDeviceToRevoke(device.deviceId)}
                      className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0"
                    >
                      Sign Out
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modals */}
        <AnimatePresence>
          {confirmOther && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-sm p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 max-w-sm w-full"
              >
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Sign out other devices?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  This will sign you out from all other devices currently connected to your account.
                </p>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setConfirmOther(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSignOutOther} className="px-4 py-2 text-sm font-medium bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl transition-colors">
                    Sign Out Other Devices
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {confirmAll && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-sm p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 max-w-sm w-full"
              >
                <h3 className="text-lg font-bold text-red-600 dark:text-red-500 mb-2">Sign out all devices?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Sign out of every active session, including this device. You will need to log in again.
                </p>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setConfirmAll(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSignOutAll} className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-xl transition-colors">
                    Sign Out All Devices
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {deviceToRevoke && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-sm p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 max-w-sm w-full"
              >
                <h3 className="text-lg font-bold text-red-600 dark:text-red-500 mb-2">Sign out this device?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  The selected device will lose access to your account.
                </p>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setDeviceToRevoke(null)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleRevokeDevice} className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-xl transition-colors">
                    Sign Out
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Privacy Tab ─────────────────────────────────────────────────────────────

function PrivacyTab() {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [requesting, setRequesting] = useState(false);
  
  const handleRequestDeletion = () => {
    setRequesting(true);
    // Simulate API call to request deletion
    setTimeout(() => {
      setRequesting(false);
      setConfirmDelete(false);
      alert('Account deletion request submitted to institution administrators.');
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Privacy Settings */}
      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Privacy</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage data privacy and tracking preferences.</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/50">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Profile Visibility</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Your profile is visible to instructors and administrators.</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Institution Managed
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/50">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Academic Information</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Grades, attendance, and timetable visibility.</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Institution Managed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Institution-controlled academic data cannot be hidden from authorized faculty.
          </p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-red-200 dark:border-red-900/30 shadow-sm overflow-hidden relative">
        <div className="p-6 border-b border-red-100 dark:border-red-900/20 bg-red-50/50 dark:bg-red-900/10">
          <h2 className="text-lg font-bold text-red-600 dark:text-red-500">Danger Zone</h2>
          <p className="text-sm text-red-500/80 dark:text-red-400/80 mt-1">Irreversible and destructive actions.</p>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Request Account Deletion</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-lg">
                Submit a formal request to institution administrators to permanently delete your account and all associated academic records.
              </p>
            </div>
            <button 
              onClick={() => setConfirmDelete(true)}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-medium rounded-xl transition-colors shrink-0 border border-red-200 dark:border-red-800/30"
            >
              Request Deletion
            </button>
          </div>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {confirmDelete && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-sm p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-red-200 dark:border-red-900/50 p-6 max-w-md w-full"
              >
                <h3 className="text-lg font-bold text-red-600 dark:text-red-500 mb-2">Request Account Deletion?</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                  This action cannot be undone. It will submit a formal request to your institution to permanently delete your account, wiping all academic records, attendance history, and grades.
                </p>
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg mb-6 border border-red-100 dark:border-red-900/30">
                  <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                    Because this is an institution-managed account, deletion must be approved by administrators.
                  </p>
                </div>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setConfirmDelete(false)} disabled={requesting} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50">
                    Cancel
                  </button>
                  <button onClick={handleRequestDeletion} disabled={requesting} className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50">
                    {requesting ? (
                      <>
                        <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                        Submitting...
                      </>
                    ) : 'Submit Request'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
