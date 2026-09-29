import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { Search, Users, BookOpen, UserCheck, Calendar, FileText, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Toggle the menu when ⌘K or Ctrl+K is pressed
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!user || user.role !== 'admin') {
    return null; // Only show for admin right now, or customize for faculty later
  }

  const runCommand = (command) => {
    setOpen(false);
    command();
  };

  return (
    <>
      <Command.Dialog 
        open={open} 
        onOpenChange={setOpen} 
        label="Global Command Menu"
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm"
      >
        <div className="bg-white dark:bg-[#0B1120] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <Command.Input 
              placeholder="Search students, courses, actions..." 
              className="flex-1 px-4 py-4 bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            <div className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">ESC</div>
          </div>

          <Command.List className="max-h-[60vh] overflow-y-auto p-2">
            <Command.Empty className="py-14 text-center text-slate-500">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="text-xs font-semibold text-slate-500 px-2 py-2">
              <Command.Item 
                onSelect={() => runCommand(() => navigate('/admin'))}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800"
              >
                <Activity className="w-4 h-4 text-slate-400" />
                <span>Dashboard</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => navigate('/admin/students'))}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800"
              >
                <Users className="w-4 h-4 text-slate-400" />
                <span>Manage Students</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => navigate('/admin/courses'))}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800"
              >
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span>Manage Courses</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => navigate('/admin/faculty'))}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800"
              >
                <UserCheck className="w-4 h-4 text-slate-400" />
                <span>Manage Faculty</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => navigate('/admin/timetable'))}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800"
              >
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Class Timetable</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => navigate('/admin/reports'))}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800"
              >
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Reports</span>
              </Command.Item>
            </Command.Group>
            
            <Command.Group heading="Quick Actions" className="text-xs font-semibold text-slate-500 px-2 py-2">
              <Command.Item 
                onSelect={() => runCommand(() => navigate('/admin/students/create'))}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800"
              >
                <Users className="w-4 h-4 text-blue-500" />
                <span>Add new Student</span>
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => navigate('/admin/students/bulk-import'))}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800"
              >
                <FileText className="w-4 h-4 text-emerald-500" />
                <span>Bulk Import Students</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </div>
      </Command.Dialog>
    </>
  );
}
