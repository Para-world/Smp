const fs = require('fs');

const content = `import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, Shield, Smartphone, Palette, Globe, CheckCircle2, AlertCircle, Laptop, Monitor, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getSettings, updateSettings, changePassword, getTrustedDevices, revokeDevice, logoutAllOtherDevices } from '../../services/studentApi';
import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';

export default function StudentSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [settings, setSettings] = useState(null);
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
      
      <div className={\`flex-1 flex flex-col min-h-screen transition-all duration-300 \${collapsed ? 'md:ml-20' : 'md:ml-72'}\`}>
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
                      className={\`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap \${
                        isActive 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                      }\`}
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
                    {activeTab === 'account' && <AccountTab settings={settings} onUpdate={fetchData} user={user} />}
                    {activeTab === 'profile' && (
                      <div className="bg-white dark:bg-[#0B1120] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 text-slate-500">
                        Profile settings are managed in the <a href="/student/profile" className="text-blue-500 underline">My Profile</a> section.
                      </div>
                    )}
                    {activeTab === 'appearance' && <AppearanceTab settings={settings} onUpdate={fetchData} />}
                    {activeTab === 'notifications' && <NotificationsTab settings={settings} onUpdate={fetchData} />}
                    {activeTab === 'security' && <SecurityTab onUpdate={fetchData} />}
                    {activeTab === 'devices' && <DevicesTab devices={devices} onUpdate={fetchData} />}
                    {activeTab === 'privacy' && (
                      <div className="bg-white dark:bg-[#0B1120] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 text-slate-500">
                        Manage data privacy and tracking preferences here.
                      </div>
                    )}
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

function AccountTab({ settings, onUpdate, user }) {
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
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <img src={user?.avatarUrl || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(user?.name)}&background=0D8ABC&color=fff\`} alt="Avatar" className="w-16 h-16 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{user?.name}</p>
              <p className="text-slate-500 dark:text-slate-400">{user?.email}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Language</label>
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
            {saving ? 'Saving...' : 'Save Changes'}
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
              className={\`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all \${
                theme === t 
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700/50'
              }\`}
            >
              <div className={\`w-16 h-16 rounded-full flex items-center justify-center \${
                t === 'light' ? 'bg-slate-100 text-yellow-500' : 
                t === 'dark' ? 'bg-slate-800 text-blue-400' : 
                'bg-gradient-to-r from-slate-100 to-slate-800 text-slate-500'
              }\`}>
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
    { key: 'assignmentNotifications', label: 'Assignments', desc: 'Alerts for new and graded assignments' },
    { key: 'examNotifications', label: 'Exams', desc: 'Exam schedules and changes' },
    { key: 'resultNotifications', label: 'Results', desc: 'Alerts when results are published' },
    { key: 'attendanceNotifications', label: 'Attendance', desc: 'Low attendance warnings' },
    { key: 'announcementNotifications', label: 'Announcements', desc: 'General and academic announcements' },
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
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {items.map((item) => (
            <div key={item.key} className="p-6 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{item.label}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
              <button 
                onClick={() => toggle(item.key)}
                className={\`w-12 h-6 rounded-full transition-colors relative \${prefs[item.key] ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}\`}
              >
                <div className={\`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform \${prefs[item.key] ? 'left-7' : 'left-1'}\`} />
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
        <div className="p-6">
          {msg.text && (
            <div className={\`mb-4 p-4 rounded-xl flex items-center gap-2 \${msg.type === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'}\`}>
              {msg.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              {msg.text}
            </div>
          )}
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
              <input type="password" required value={pass.current} onChange={e => setPass(p => ({...p, current: e.target.value}))} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
              <input type="password" required minLength={8} value={pass.new} onChange={e => setPass(p => ({...p, new: e.target.value}))} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
              <input type="password" required minLength={8} value={pass.confirm} onChange={e => setPass(p => ({...p, confirm: e.target.value}))} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
            <button type="submit" disabled={changing} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50">
              {changing ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Devices Tab ─────────────────────────────────────────────────────────────

function DevicesTab({ devices, onUpdate }) {
  const getDeviceIcon = (deviceName = '') => {
    const name = deviceName.toLowerCase();
    if (name.includes('mobile') || name.includes('android') || name.includes('ios')) return Smartphone;
    if (name.includes('mac') || name.includes('windows') || name.includes('linux')) return Laptop;
    return Monitor;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Connected Devices</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage active sessions and trusted devices.</p>
          </div>
          <button 
            onClick={async () => {
              if (window.confirm('Logout from all other devices?')) {
                await logoutAllOtherDevices();
                onUpdate();
              }
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium rounded-xl transition-colors flex items-center gap-2 text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out Other Devices
          </button>
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
                            Current Session
                          </span>
                        )}
                      </h3>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>{device.browser} • {device.operatingSystem}</span>
                        <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
                        <span>Last active: {new Date(device.lastActiveAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {!device.isCurrent && (
                    <button
                      onClick={async () => {
                        await revokeDevice(device.id);
                        onUpdate();
                      }}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors whitespace-nowrap self-start sm:self-center"
                    >
                      Sign Out
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('d:/SMP/Frontend/src/pages/student/StudentSettings.jsx', content);
console.log('File written successfully.');
