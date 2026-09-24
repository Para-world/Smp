import { motion } from 'framer-motion';
import { Megaphone, Pin, Inbox } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function RecentAnnouncements({ announcements }) {
  if (!announcements || announcements.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="h-full"
      >
        <Card className="p-6 h-full border border-dashed shadow-none dark:border-slate-800 flex flex-col">
          <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-4 tracking-tight">
            Recent Announcements
          </h3>
          <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-4 ring-8 ring-slate-50/50 dark:ring-slate-800/20">
              <Inbox size={24} className="text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">You're all caught up</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1.5">No new announcements at this time.</p>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="h-full"
    >
      <Card className="p-6 h-full shadow-sm hover:shadow-md transition-shadow flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
            Recent Announcements
          </h3>
          <Badge variant="secondary" className="rounded-md font-semibold">
            {announcements.length} new
          </Badge>
        </div>

        <div className="space-y-4 flex-1">
          {announcements.map((ann, index) => (
            <motion.div
              key={ann.id || index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.45 + index * 0.08 }}
              className="group flex gap-4 items-start cursor-pointer"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300",
                  ann.isPinned
                    ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-500/20"
                    : "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20"
                )}
              >
                {ann.isPinned ? <Pin size={18} /> : <Megaphone size={18} />}
              </div>
              
              <div className="flex-1 min-w-0 border-b border-slate-100 dark:border-slate-800/50 pb-4 group-last:border-0 group-last:pb-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {ann.title}
                  </h4>
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 flex-shrink-0 whitespace-nowrap pt-0.5">
                    {formatDate(ann.publishedAt)}
                  </span>
                </div>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {ann.content}
                </p>
                
                {ann.isPinned && (
                  <Badge variant="outline" className="mt-2 text-[9px] uppercase tracking-wider text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0 h-auto">
                    Pinned
                  </Badge>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
