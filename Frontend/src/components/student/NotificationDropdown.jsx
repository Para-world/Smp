import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, CheckCircle2, Clock, MessageSquare, AlertCircle, Calendar, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { 
  fetchNotifications, 
  fetchUnreadNotificationCount, 
  markNotificationRead,
  markAllNotificationsRead 
} from '../../services/studentApi';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const getUnreadCount = async () => {
    try {
      const data = await fetchUnreadNotificationCount();
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const getRecentNotifications = async () => {
    try {
      setLoading(true);
      const data = await fetchNotifications();
      setRecentNotifications(data.slice(0, 5)); // Just take top 5
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUnreadCount();

    // Listen to custom event when notifications page marks things as read
    const handleUpdate = () => {
      getUnreadCount();
    };

    window.addEventListener('notificationsUpdated', handleUpdate);
    return () => {
      window.removeEventListener('notificationsUpdated', handleUpdate);
    };
  }, []);

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (open) {
      getRecentNotifications();
    }
  };

  const handleMarkAsRead = async (id, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      setRecentNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      await markNotificationRead(id);
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllAsRead = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      setRecentNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      await markAllNotificationsRead();
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (error) {
      console.error(error);
    }
  };

  const handleNotificationClick = (notification) => {
    setIsOpen(false);
    
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    if (notification.entityType && notification.entityId) {
      switch (notification.entityType) {
        case 'assignment':
          navigate(`/student/assignments/${notification.entityId}`);
          break;
        case 'exam':
          navigate(`/student/exams/${notification.entityId}`);
          break;
        case 'announcement':
          navigate(`/student/announcements/${notification.entityId}`);
          break;
        case 'result':
          navigate(`/student/results/${notification.entityId}`);
          break;
        case 'course':
          navigate(`/student/courses/${notification.entityId}`);
          break;
        default:
          navigate('/student/notifications');
          break;
      }
    } else {
      navigate('/student/notifications');
    }
  };

  const getNotificationIcon = (type) => {
    if (type.includes('ASSIGNMENT')) return <FileText size={16} className="text-blue-500" />;
    if (type.includes('EXAM')) return <AlertCircle size={16} className="text-amber-500" />;
    if (type.includes('RESULT')) return <CheckCircle2 size={16} className="text-emerald-500" />;
    if (type.includes('TIMETABLE') || type.includes('CLASS')) return <Calendar size={16} className="text-indigo-500" />;
    if (type.includes('ANNOUNCEMENT')) return <MessageSquare size={16} className="text-purple-500" />;
    return <Bell size={16} className="text-slate-500" />;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white dark:ring-[#0B1120]">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg dark:bg-[#0a0d14]">
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/60">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Recent Notifications</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">You have {unreadCount} unread messages</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="h-8 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
              Mark all read
            </Button>
          )}
        </div>
        
        <div className="max-h-[350px] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <span className="material-symbols-outlined text-indigo-600 animate-spin mb-2">progress_activity</span>
              <p className="text-xs text-slate-500">Loading...</p>
            </div>
          ) : recentNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                <CheckCircle2 className="text-slate-400" size={20} />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">You're all caught up!</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">No recent notifications</p>
            </div>
          ) : (
            <DropdownMenuGroup>
              {recentNotifications.map(notification => (
                <div 
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex items-start gap-3 p-4 border-b border-slate-100 dark:border-slate-800/60 last:border-0 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/40 ${
                    !notification.isRead ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''
                  }`}
                >
                  <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    notification.isRead ? 'bg-slate-100 dark:bg-slate-800' : 'bg-white dark:bg-slate-900 shadow-sm border border-indigo-100 dark:border-indigo-800/50'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${
                      notification.isRead ? 'font-medium text-slate-700 dark:text-slate-300' : 'font-semibold text-slate-900 dark:text-white'
                    }`}>
                      {notification.title}
                    </p>
                    <p className={`text-xs mt-0.5 line-clamp-1 ${
                      notification.isRead ? 'text-slate-500 dark:text-slate-400' : 'text-slate-600 dark:text-slate-300'
                    }`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                        <Clock size={10} />
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  
                  {!notification.isRead && (
                    <div className="shrink-0 self-center">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    </div>
                  )}
                </div>
              ))}
            </DropdownMenuGroup>
          )}
        </div>
        
        <div className="p-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/60">
          <Button 
            variant="ghost" 
            className="w-full text-sm h-9 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800"
            onClick={() => {
              setIsOpen(false);
              navigate('/student/notifications');
            }}
          >
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
