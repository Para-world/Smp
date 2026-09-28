import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  User,
  BookOpen,
  ClipboardCheck,
  FileText,
  Award,
  Calendar,
  Megaphone,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LOGO_SRC from '../../assets/logo.png';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
  { label: 'My Profile', icon: User, path: '/student/profile' },
  { label: 'Courses', icon: BookOpen, path: '/student/courses' },
  { label: 'Attendance', icon: ClipboardCheck, path: '/student/attendance' },
  { label: 'Assignments', icon: FileText, path: '/student/assignments' },
  { label: 'Exams', icon: Award, path: '/student/exams' },
  { label: 'Results', icon: Award, path: '/student/results' },
  { label: 'Timetable', icon: Calendar, path: '/student/timetable' },
  { label: 'Announcements', icon: Megaphone, path: '/student/announcements' },
  { label: 'Notifications', icon: Bell, path: '/student/notifications' },
  { label: 'Settings', icon: Settings, path: '/student/settings' },
];

export default function StudentSidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { signout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signout();
    navigate('/');
  };

  const sidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full bg-white dark:bg-[#0B1120]">
      {/* Brand */}
      <div className={cn("flex items-center px-5 pt-6 pb-4", collapsed && !isMobile ? "justify-center" : "gap-3")}>
        <img alt="EduSphere" className="h-8 w-8 object-contain flex-shrink-0" src={LOGO_SRC} />
        {(!collapsed || isMobile) && (
          <span className="font-display text-lg font-bold text-slate-900 dark:text-white whitespace-nowrap">
            EduSphere
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 mb-2 h-px bg-slate-200 dark:bg-slate-700/50" />

      {/* Navigation */}
      <TooltipProvider delayDuration={150}>
        <nav data-lenis-prevent="true" className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const linkContent = (
              <NavLink
                to={item.path}
                onClick={() => isMobile && setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    collapsed && !isMobile && "justify-center px-0",
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={20}
                      className={cn(
                        "flex-shrink-0 transition-colors",
                        isActive
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                      )}
                    />
                    {(!collapsed || isMobile) && (
                      <span className="whitespace-nowrap overflow-hidden">
                        {item.label}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );

            if (collapsed && !isMobile) {
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">{item.label}</TooltipContent>
                </Tooltip>
              );
            }
            return <div key={item.path}>{linkContent}</div>;
          })}
        </nav>
      </TooltipProvider>

      {/* Bottom section */}
      <div className="px-3 pb-4 pt-2 space-y-2">
        <div className="mx-1 h-px bg-slate-200 dark:bg-slate-700/50" />

        {/* Collapse toggle — desktop only */}
        {!isMobile && (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="flex items-center justify-center w-full gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
                >
                  <ChevronLeft
                    size={20}
                    className={cn("flex-shrink-0 transition-transform duration-300", collapsed && "rotate-180")}
                  />
                  {!collapsed && <span>Collapse</span>}
                </button>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right" className="font-medium">Expand</TooltipContent>}
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Logout */}
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className={cn(
                  "flex items-center w-full gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all",
                  collapsed && !isMobile && "justify-center px-0"
                )}
              >
                <LogOut size={20} className="flex-shrink-0" />
                {(!collapsed || isMobile) && (
                  <span className="whitespace-nowrap overflow-hidden">Logout</span>
                )}
              </button>
            </TooltipTrigger>
            {collapsed && !isMobile && <TooltipContent side="right" className="font-medium text-red-500">Logout</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden lg:flex flex-col fixed top-0 left-0 h-screen bg-white dark:bg-[#0B1120] border-r border-slate-200 dark:border-slate-800 z-40 overflow-hidden"
      >
        {sidebarContent(false)}
      </motion.aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0 border-r-slate-200 dark:border-r-slate-800 bg-white dark:bg-[#0B1120] [&>button]:right-4 [&>button]:top-6 [&>button]:text-slate-500">
          {sidebarContent(true)}
        </SheetContent>
      </Sheet>
    </>
  );
}
