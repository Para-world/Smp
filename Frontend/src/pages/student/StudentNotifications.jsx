import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  Calendar,
  BookOpen,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { 
  fetchNotifications, 
  markNotificationRead, 
  markAllNotificationsRead 
} from '../../services/studentApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';

export default function StudentNotifications() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filterType, setFilterType] = useState('ALL');
  const [filterRead, setFilterRead] = useState('ALL');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      await markNotificationRead(id);
      
      // Dispatch a custom event to update header unread count
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (error) {
      console.error("Failed to mark as read:", error);
      // Revert on error
      loadNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      await markAllNotificationsRead();
      
      // Dispatch custom event
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      loadNotifications();
    }
  };

  const handleNotificationClick = (notification) => {
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
          break;
      }
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      let matchesType = true;
      if (filterType !== 'ALL') {
        if (filterType === 'ACADEMIC') {
          matchesType = ['ASSIGNMENT_CREATED', 'ASSIGNMENT_DUE_SOON', 'ASSIGNMENT_GRADED', 'EXAM_CREATED', 'EXAM_UPDATED', 'RESULT_PUBLISHED'].includes(n.type);
        } else if (filterType === 'SYSTEM') {
          matchesType = ['SYSTEM', 'ANNOUNCEMENT_PUBLISHED'].includes(n.type);
        }
      }

      let matchesRead = true;
      if (filterRead === 'UNREAD') matchesRead = !n.isRead;
      if (filterRead === 'READ') matchesRead = n.isRead;

      return matchesType && matchesRead;
    });
  }, [notifications, filterType, filterRead]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type, entityType) => {
    if (type.includes('ASSIGNMENT')) return <FileText size={20} className="text-blue-500" />;
    if (type.includes('EXAM')) return <AlertCircle size={20} className="text-amber-500" />;
    if (type.includes('RESULT')) return <CheckCircle2 size={20} className="text-emerald-500" />;
    if (type.includes('TIMETABLE') || type.includes('CLASS')) return <Calendar size={20} className="text-indigo-500" />;
    if (type.includes('ANNOUNCEMENT')) return <MessageSquare size={20} className="text-purple-500" />;
    return <Bell size={20} className="text-slate-500" />;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-indigo-600 text-[40px] animate-spin">
              progress_activity
            </span>
            <p className="text-slate-500 font-medium">Loading notifications...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold">Unable to load notifications</h3>
            <p className="text-sm opacity-90 mt-1">{error}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Bell className="text-indigo-600 dark:text-indigo-400" />
            Notifications
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            View all your academic and system notifications.
          </p>
        </div>
        
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead} variant="outline" className="shrink-0">
            <CheckCircle2 size={16} className="mr-2" /> Mark all as read
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-[#0a0d14] p-2 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex w-full gap-2 p-1">
          <Select value={filterRead} onValueChange={setFilterRead}>
            <SelectTrigger className="w-full sm:w-[150px] border-none shadow-none bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900/50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="UNREAD">Unread</SelectItem>
              <SelectItem value="READ">Read</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="w-px bg-slate-200 dark:bg-slate-800 my-2 mx-1 hidden sm:block"></div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[150px] border-none shadow-none bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900/50">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="ACADEMIC">Academic</SelectItem>
              <SelectItem value="SYSTEM">System Updates</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="border-dashed shadow-none bg-slate-50 dark:bg-slate-900/20">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <CheckCircle2 className="text-emerald-500" size={32} />
              </div>
              <h3 className="text-xl font-display font-semibold text-slate-900 dark:text-white mb-2">You're all caught up!</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
                You don't have any notifications matching your current filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
            >
              <div 
                onClick={() => handleNotificationClick(notification)}
                className={`group relative flex items-start gap-4 p-4 md:p-5 rounded-xl border transition-all cursor-pointer ${
                  notification.isRead 
                    ? 'bg-white dark:bg-[#0a0d14] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700' 
                    : 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                }`}
              >
                {!notification.isRead && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-indigo-500 rounded-r-md"></div>
                )}
                
                <div className={`mt-1 shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  notification.isRead ? 'bg-slate-100 dark:bg-slate-800' : 'bg-white dark:bg-slate-900 shadow-sm'
                }`}>
                  {getNotificationIcon(notification.type, notification.entityType)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h4 className={`text-base font-semibold truncate ${
                      notification.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'
                    }`}>
                      {notification.title}
                    </h4>
                    
                    <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock size={12} />
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <p className={`text-sm mb-3 ${
                    notification.isRead ? 'text-slate-500 dark:text-slate-400' : 'text-slate-600 dark:text-slate-300'
                  }`}>
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center gap-3">
                    {notification.priority === 'URGENT' && (
                      <Badge variant="destructive" className="h-5 text-[10px] px-1.5 font-semibold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-none hover:bg-red-100">
                        Urgent
                      </Badge>
                    )}
                    
                    {notification.entityType && (
                      <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:underline">
                        View Details <ChevronRight size={14} />
                      </span>
                    )}
                  </div>
                </div>
                
                {!notification.isRead && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="shrink-0 w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 shadow-sm"
                    onClick={(e) => handleMarkAsRead(notification.id, e)}
                    title="Mark as read"
                  >
                    <CheckCircle2 size={16} className="text-indigo-600 dark:text-indigo-400" />
                  </Button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050811] transition-colors">
      <StudentSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}`}>
        <StudentHeader pageTitle="Notifications" onMenuClick={() => setMobileOpen(true)} />
        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
