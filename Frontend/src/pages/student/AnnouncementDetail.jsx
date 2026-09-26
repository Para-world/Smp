import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  ArrowLeft,
  Megaphone,
  Calendar,
  User,
  BookOpen,
  Pin,
  AlertCircle
} from 'lucide-react';

import { fetchAnnouncementDetail } from '../../services/studentApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';

export default function AnnouncementDetail() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const { announcementId } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAnnouncementDetail(announcementId);
        setAnnouncement(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [announcementId]);

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
            <p className="text-slate-500 font-medium">Loading announcement...</p>
          </div>
        </div>
      );
    }

    if (error || !announcement) {
      return (
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => navigate('/student/announcements')} className="pl-0 hover:bg-transparent">
            <ArrowLeft size={16} className="mr-2" /> Back to Announcements
          </Button>
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold">Unable to load announcement</h3>
              <p className="text-sm opacity-90 mt-1">{error || 'Announcement not found.'}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto space-y-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/student/announcements')} 
        className="pl-0 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-transparent -ml-2"
      >
        <ArrowLeft size={16} className="mr-2" /> Back to Announcements
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-[#0a0d14]">
          <div className="border-b border-slate-100 dark:border-slate-800/60 p-6 md:p-8 bg-slate-50/50 dark:bg-slate-900/10">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {announcement.isPinned && (
                <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 border-none">
                  <Pin size={12} className="mr-1" /> Pinned
                </Badge>
              )}
              <Badge variant="outline" className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                {announcement.category}
              </Badge>
              {announcement.priority !== 'NORMAL' && (
                <Badge className={`border ${getPriorityColor(announcement.priority)}`}>
                  {announcement.priority}
                </Badge>
              )}
            </div>
            
            <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white mb-6">
              {announcement.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Calendar size={16} />
                Published on {format(new Date(announcement.publishedAt), 'MMMM dd, yyyy')}
              </div>
              <div className="flex items-center gap-1.5">
                <User size={16} />
                {announcement.authorName || 'Administration'}
              </div>
            </div>
          </div>
          
          <CardContent className="p-6 md:p-8">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              {/* Note: Normally render HTML safely here using DOMPurify if it's rich text. 
                  Assuming plain text or basic formatting for now. */}
              {announcement.content.split('\n').map((paragraph, idx) => (
                <p key={idx} className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
            
            {announcement.courseCode && (
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <BookOpen size={16} className="text-emerald-500" />
                  Related Course
                </h3>
                <Link to={`/student/courses/${announcement.courseId}`}>
                  <Card className="bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20 transition-colors inline-block w-full md:w-auto">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-emerald-900 dark:text-emerald-100">{announcement.courseCode}</p>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400">{announcement.courseTitle}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
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
        <StudentHeader pageTitle="Announcement Detail" onMenuClick={() => setMobileOpen(true)} />
        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
