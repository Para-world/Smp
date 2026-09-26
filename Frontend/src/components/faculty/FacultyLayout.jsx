import { useState } from 'react';
import FacultySidebar from './FacultySidebar';
import FacultyHeader from './FacultyHeader';

export default function FacultyLayout({ children, pageTitle = 'Dashboard' }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050811] selection:bg-blue-500/30">
      <FacultySidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      
      <div 
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-[80px]' : 'lg:pl-[280px]'
        }`}
      >
        <FacultyHeader
          pageTitle={pageTitle}
          onMenuClick={() => setMobileOpen(true)}
        />
        
        <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1400px] mx-auto min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
