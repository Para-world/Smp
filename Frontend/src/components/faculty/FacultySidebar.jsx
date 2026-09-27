import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  FileText,
  Calendar,
  Megaphone,
  Bell,
  Settings,
  LogOut,
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
      { label: 'Dashboard', icon: LayoutDashboard, path: '/faculty/dashboard' },
    ]
  },
  {
    title: 'Academics',
    items: [
      { label: 'My Courses', icon: BookOpen, path: '/faculty/courses' },
      { label: 'Assignments', icon: FileText, path: '/faculty/assignments' },
      { label: 'Exams', icon: ClipboardCheck, path: '/faculty/exams' },
      { label: 'Timetable', icon: Calendar, path: '/faculty/timetable' },
    ]
  },
  {
    title: 'Communication',
    items: [
      { label: 'Announcements', icon: Megaphone, path: '/faculty/announcements' },
      { label: 'Notifications', icon: Bell, path: '/faculty/notifications' },
    ]
  }
];

export default function FacultySidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { signout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signout();
    navigate('/');
  };

  const sidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full bg-slate-900 dark:bg-[#050811] text-white border-r border-slate-800">
      {/* Brand */}
      <div className={cn("flex items-center px-5 pt-6 pb-4 border-b border-slate-800", collapsed && !isMobile ? "justify-center" : "gap-3")}>
        <img alt="EduSphere" className="h-8 w-8 object-contain flex-shrink-0" src={LOGO_SRC} />
        {(!collapsed || isMobile) && (
          <span className="font-display text-lg font-bold whitespace-nowrap">
            EduSphere Faculty
          </span>
        )}
      </div>

      {/* Navigation */}
      <TooltipProvider delayDuration={150}>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {group.title && (!collapsed || isMobile) && (
                <div className="px-3 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {group.title}
                </div>
              )}
              {group.items.map((item, idx) => {
                const Icon = item.icon;
                const linkContent = (
                  <NavLink
                    key={idx}
                    to={item.path}
                    onClick={() => isMobile && setMobileOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                      isActive 
                        ? "bg-blue-600/10 text-blue-500 font-medium" 
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-100",
                      collapsed && !isMobile && "justify-center px-0"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", collapsed && !isMobile ? "mx-auto" : "")} />
                    {(!collapsed || isMobile) && <span>{item.label}</span>}
                  </NavLink>
                );

                if (collapsed && !isMobile) {
                  return (
                    <Tooltip key={idx} placement="right">
                      <TooltipTrigger asChild>
                        {linkContent}
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return linkContent;
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
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors",
            collapsed && !isMobile && "justify-center px-0"
          )}
        >
          <LogOut size={20} className={cn(collapsed && !isMobile ? "mx-auto" : "")} />
          {(!collapsed || isMobile) && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-[280px] bg-slate-900 border-r-0">
          {sidebarContent(true)}
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div 
        className={cn(
          "hidden lg:block fixed top-0 left-0 bottom-0 z-40 transition-all duration-300 shadow-2xl shadow-slate-900/20",
          collapsed ? "w-[80px]" : "w-[280px]"
        )}
      >
        {sidebarContent(false)}
        
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 bg-blue-500 text-white p-1 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-50"
        >
          <ChevronLeft size={16} className={cn("transition-transform duration-300", collapsed && "rotate-180")} />
        </button>
      </div>
    </>
  );
}
