import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Smartphone, Laptop, Monitor, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SecuritySettings() {
  const { getConnectedDevices, revokeDevice, deviceId } = useAuth();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await getConnectedDevices();
      setDevices(res.devices);
    } catch (err) {
      setError('Failed to load connected devices');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id) => {
    try {
      await revokeDevice(id);
      fetchDevices();
    } catch (err) {
      setError('Failed to revoke device');
    }
  };

  const getDeviceIcon = (deviceName = '') => {
    const name = deviceName.toLowerCase();
    if (name.includes('mobile') || name.includes('android') || name.includes('ios')) return Smartphone;
    if (name.includes('mac') || name.includes('windows') || name.includes('linux')) return Laptop;
    return Monitor;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
          <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Security Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your connected devices and account security</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Connected Devices</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            These devices are currently signed in to your account.
          </p>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {loading ? (
            <div className="p-8 flex justify-center">
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="material-symbols-outlined text-[24px] text-slate-400">sync</motion.span>
            </div>
          ) : devices.length === 0 ? (
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
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                            This Device
                          </span>
                        )}
                      </h3>
                      <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          Trusted
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Last active {formatTime(device.lastActiveAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!device.isCurrent && (
                    <button
                      onClick={() => handleRevoke(device.deviceId)}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors self-start sm:self-auto"
                    >
                      Revoke Access
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
