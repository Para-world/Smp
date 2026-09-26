import { useNavigate } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function FacultyHeader({ pageTitle = 'Dashboard', onMenuClick }) {
  const { user, signout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signout();
    navigate('/');
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'FA';

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 transition-colors">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu size={20} />
          </button>
          <h1 className="font-display text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
            {pageTitle}
          </h1>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/50 p-1 pr-3 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40">
                <Avatar className="h-8 w-8 ring-2 ring-slate-100 dark:ring-slate-800 transition-all">
                  <AvatarImage src={user?.avatarUrl} alt={user?.name || 'User'} />
                  <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 font-medium text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-none mb-0.5">
                    {user?.name || 'Faculty Member'}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-none">
                    {user?.role || 'Faculty'}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
              <DropdownMenuLabel className="font-normal p-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none">
                    {user?.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-none">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/10 focus:text-red-600 dark:focus:text-red-400 cursor-pointer p-3">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
