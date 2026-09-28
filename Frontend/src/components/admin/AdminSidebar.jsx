import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BookOpen,
  ClipboardCheck,
  FileText,
  Award,
  Calendar,
  Megaphone,
  Bell,
  Settings,
  LogOut,
  Shield,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LOGO_SRC from '../../assets/logo.png';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const navGroups = [
  {
    title: null,
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    ]
  },
  {
    title: 'Reports',
    items: [
      { label: 'Reports & Analytics', icon: FileText, path: '/admin/reports' },
    ]
  },
  {
    title: 'People',
    items: [
      { label: 'Students', icon: Users, path: '/admin/students' },
      { label: 'Faculty', icon: UserCheck, path: '/admin/instructors' },
    ]
  },
  {
    title: 'Academics',
    items: [
      { label: 'Courses', icon: BookOpen, path: '/admin/courses' },
      { label: 'Enrollments', icon: ClipboardCheck, path: '/admin/enrollments' },
      { label: 'Attendance', icon: ClipboardCheck, path: '/admin/attendance' },
      { label: 'Assignments', icon: FileText, path: '/admin/assignments' },
      { label: 'Exams', icon: Award, path: '/admin/exams' },
      { label: 'Results', icon: Award, path: '/admin/results' },
      { label: 'Timetable', icon: Calendar, path: '/admin/timetable' },
    ]
  },
  {
    title: 'Communication',
    items: [
      { label: 'Announcements', icon: Megaphone, path: '/admin/announcements' },
      { label: 'Notifications', icon: Bell, path: '/admin/notifications' },
    ]
  },
  {
    title: 'System',
    items: [
      { label: 'Audit Logs', icon: Shield, path: '/admin/audit-logs' },
      { label: 'Settings', icon: Settings, path: '/admin/settings' },
    ]
  }
];

export default function AdminSidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { signout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signout();
    navigate('/');
  };

  const sidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full bg-slate-900 dark:bg-[#050811] text-white">
      {/* Brand */}
      <div className={cn("flex items-center px-5 pt-6 pb-4 border-b border-slate-800", collapsed && !isMobile ? "justify-center" : "gap-3")}>
        <img alt="EduSphere" className="h-8 w-8 object-contain flex-shrink-0" src={LOGO_SRC} />
        {(!collapsed || isMobile) && (
          <span className="font-display text-lg font-bold whitespace-nowrap">
            EduSphere Admin
          </span>
        )}
      </div>

      {/* Navigation */}
      <TooltipProvider delayDuration={150}>
        <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {group.title && (!collapsed || isMobile) && (
                <div className="px-3 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {group.title}
                </div>
              )}
              {group.title && collapsed && !isMobile && (
                <div className="mx-4 mb-2 h-px bg-slate-800" />
              )}
              
              {group.items.map((item) => {
                const linkContent = (
                  <NavLink
                    to={item.path}
                    onClick={() => isMobile && setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                        collapsed && !isMobile && "justify-center px-0",
                        isActive
                          ? "bg-blue-600/20 text-blue-400 shadow-sm"
                          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
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
                              ? "text-blue-400"
                              : "text-slate-500 group-hover:text-slate-300"
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
                      <TooltipContent side="right" sideOffset={10} className="bg-slate-800 text-white border-slate-700">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return <div key={item.path}>{linkContent}</div>;
              })}
            </div>
          ))}
        </nav>
      </TooltipProvider>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors",
            collapsed && !isMobile && "justify-center px-0"
          )}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {(!collapsed || isMobile) && <span>Log out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed top-0 left-0 h-screen transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] z-40 bg-slate-900 border-r border-slate-800",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        {sidebarContent(false)}

        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-400 shadow-md hover:text-white hover:bg-slate-700 transition-colors z-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft size={14} className={cn("transition-transform duration-300", collapsed && "rotate-180")} />
        </button>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-[280px] bg-slate-900 border-r-slate-800">
          {sidebarContent(true)}
        </SheetContent>
      </Sheet>
    </>
  );
}
