import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Megaphone, 
  Search, 
  Calendar as CalendarIcon, 
  Filter,
  CheckCircle2,
  AlertCircle,
  Bell,
  BookOpen,
  Pin
} from 'lucide-react';
import { format } from 'date-fns';

import { fetchAnnouncements } from '../../services/studentApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';

export default function StudentAnnouncements() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const [readAnnouncements, setReadAnnouncements] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('readAnnouncements') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const data = await fetchAnnouncements();
        setAnnouncements(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadAnnouncements();
  }, []);

  const markAsRead = (id) => {
    if (!readAnnouncements.includes(id)) {
      const newRead = [...readAnnouncements, id];
      setReadAnnouncements(newRead);
      localStorage.setItem('readAnnouncements', JSON.stringify(newRead));
    }
  };

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(a => {
      const matchesSearch = 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.courseTitle && a.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'ALL' || a.category === categoryFilter;
      const matchesPriority = priorityFilter === 'ALL' || a.priority === priorityFilter;

      return matchesSearch && matchesCategory && matchesPriority;
    });
  }, [announcements, searchQuery, categoryFilter, priorityFilter]);

  const stats = useMemo(() => {
    return {
      total: announcements.length,
      unread: announcements.filter(a => !readAnnouncements.includes(a.id)).length,
      important: announcements.filter(a => a.priority === 'IMPORTANT' || a.priority === 'URGENT').length,
      course: announcements.filter(a => a.category === 'COURSE').length,
    };
  }, [announcements, readAnnouncements]);

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'URGENT': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800/50';
      case 'IMPORTANT': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-indigo-600 text-[40px] animate-spin">
              progress_activity
            </span>
            <p className="text-slate-500 font-medium">Loading announcements...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold">Unable to load announcements</h3>
            <p className="text-sm opacity-90 mt-1">{error}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Megaphone className="text-indigo-600 dark:text-indigo-400" />
          Announcements
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Stay updated with important academic and institutional information.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-white dark:bg-[#0a0d14]">
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Total</p>
            <p className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Megaphone size={20} className="text-indigo-500" />
              {stats.total}
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-[#0a0d14]">
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Unread</p>
            <p className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell size={20} className="text-amber-500" />
              {stats.unread}
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-[#0a0d14]">
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Important</p>
            <p className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle size={20} className="text-red-500" />
              {stats.important}
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-[#0a0d14]">
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Course</p>
            <p className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen size={20} className="text-emerald-500" />
              {stats.course}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Search announcements..." 
            className="pl-9 bg-white dark:bg-[#0a0d14] border-slate-200 dark:border-slate-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[160px] bg-white dark:bg-[#0a0d14] border-slate-200 dark:border-slate-800">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="GENERAL">General</SelectItem>
              <SelectItem value="ACADEMIC">Academic</SelectItem>
              <SelectItem value="COURSE">Course</SelectItem>
              <SelectItem value="EXAM">Exam</SelectItem>
              <SelectItem value="SYSTEM">System</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full md:w-[150px] bg-white dark:bg-[#0a0d14] border-slate-200 dark:border-slate-800">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priorities</SelectItem>
              <SelectItem value="NORMAL">Normal</SelectItem>
              <SelectItem value="IMPORTANT">Important</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <Card className="border-dashed shadow-none bg-slate-50 dark:bg-slate-900/20">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Megaphone className="text-slate-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No announcements found</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
                There are currently no announcements matching your criteria. Try changing your filters or search.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAnnouncements.map((announcement, index) => {
            const isUnread = !readAnnouncements.includes(announcement.id);
            return (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link to={`/student/announcements/${announcement.id}`} onClick={() => markAsRead(announcement.id)}>
                  <Card className={`transition-all hover:shadow-md border-l-4 ${
                    isUnread ? 'bg-white dark:bg-[#0a0d14] border-l-indigo-500' : 'bg-slate-50/50 dark:bg-slate-900/10 border-l-transparent border-slate-200 dark:border-slate-800'
                  }`}>
                    <CardContent className="p-5">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {announcement.isPinned && (
                              <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-400 border-none">
                                <Pin size={12} className="mr-1" /> Pinned
                              </Badge>
                            )}
                            <Badge variant="outline" className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                              {announcement.category}
                            </Badge>
                            {announcement.priority !== 'NORMAL' && (
                              <Badge className={`border ${getPriorityColor(announcement.priority)} hover:bg-transparent`}>
                                {announcement.priority}
                              </Badge>
                            )}
                            {isUnread && (
                              <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse"></span>
                                New
                              </span>
                            )}
                          </div>
                          
                          <h3 className={`text-lg font-display ${isUnread ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-200'}`}>
                            {announcement.title}
                          </h3>
                          
                          <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
                            {announcement.content}
                          </p>
                          
                          {announcement.courseCode && (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-2 bg-emerald-50 dark:bg-emerald-900/20 w-max px-2 py-1 rounded-md">
                              <BookOpen size={14} />
                              {announcement.courseCode} - {announcement.courseTitle}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0 md:pl-4">
                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <CalendarIcon size={14} />
                            {format(new Date(announcement.publishedAt), 'MMM dd, yyyy')}
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                            Read More
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })
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
        <StudentHeader pageTitle="Announcements" onMenuClick={() => setMobileOpen(true)} />
        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
