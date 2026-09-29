import { useState, useEffect, useRef } from 'react';
import { Bell, AlertCircle, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function NotificationCenter() {
  const [alerts, setAlerts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const token = localStorage.getItem('edusphere_token');
        const res = await fetch(`${API_URL}/admin/dashboard/alerts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setAlerts(data);
          setUnreadCount(data.length);
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };
    fetchAlerts();
    // Poll every 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'error': return <AlertCircle className="text-red-500" size={18} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={18} />;
      case 'success': return <CheckCircle2 className="text-green-500" size={18} />;
      case 'info':
      default: return <Info className="text-blue-500" size={18} />;
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button 
        onClick={handleOpen}
        className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Notifications</h3>
            {alerts.length > 0 && (
              <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
                {alerts.length} New
              </span>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {alerts.length > 0 ? (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {alerts.map((alert) => (
                  <li key={alert.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex gap-3">
                    <div className="mt-0.5 flex-shrink-0">
                      {getIcon(alert.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{alert.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{alert.message}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center flex flex-col items-center">
                <Bell className="text-slate-300 dark:text-slate-600 mb-3" size={32} />
                <p className="text-sm text-slate-500 dark:text-slate-400">You're all caught up!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
