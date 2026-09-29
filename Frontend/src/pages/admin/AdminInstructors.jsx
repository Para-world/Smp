import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, Plus, UserX, Eye, Edit2, 
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { fetchAdminInstructors } from '../../services/adminApi';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

export default function AdminInstructors() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadInstructors = async (page = 1) => {
    setLoading(true);
    try {
      const result = await fetchAdminInstructors({ page, limit: 10, search, status: statusFilter });
      setInstructors(result.data);
      setPagination(result.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadInstructors(1);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, statusFilter]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadInstructors(newPage);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050811] transition-colors">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'
        }`}
      >
        <AdminHeader
          pageTitle="Faculty Management"
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1400px] mx-auto">
          {/* Top Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex flex-1 max-w-md gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search instructors..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm">
                <Plus size={16} />
                Add Instructor
              </button>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" role="table" aria-label="Instructors list">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th scope="col" className="px-6 py-4">Name</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                    <th scope="col" className="px-6 py-4">Joined Date</th>
                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-blue-500"></div>
                          <p>Loading instructors...</p>
                        </div>
                      </td>
                    </tr>
                  ) : instructors.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                        <p>No instructors found matching your criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    instructors.map((instructor) => (
                      <tr key={instructor.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-sm overflow-hidden" aria-hidden="true">
                              {instructor.avatarUrl ? (
                                <img src={instructor.avatarUrl} alt="" className="h-full w-full object-cover" />
                              ) : (
                                instructor.name.charAt(0)
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">{instructor.name}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">{instructor.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            instructor.isActive 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${instructor.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} aria-hidden="true"></span>
                            {instructor.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                          {instructor.createdAt ? new Date(instructor.createdAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-1">
                            <Link 
                              to={`/admin/instructors/${instructor.id}`}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                              aria-label={`View profile for ${instructor.name}`}
                            >
                              <Eye size={18} />
                            </Link>
                            <button 
                              className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                              aria-label={`Edit ${instructor.name}`}
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                              aria-label={instructor.isActive ? `Deactivate ${instructor.name}` : `Activate ${instructor.name}`}
                            >
                              <UserX size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-blue-500"></div>
                  <p className="text-slate-500 text-sm">Loading instructors...</p>
                </div>
              </div>
            ) : instructors.length === 0 ? (
              <div className="bg-white dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500">
                No instructors found matching your criteria.
              </div>
            ) : (
              instructors.map((instructor) => (
                <div key={instructor.id} className="bg-white dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-sm overflow-hidden" aria-hidden="true">
                        {instructor.avatarUrl ? (
                          <img src={instructor.avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          instructor.name.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">{instructor.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{instructor.email}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      instructor.isActive 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${instructor.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} aria-hidden="true"></span>
                      {instructor.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-sm">
                    <span className="text-slate-400 dark:text-slate-500 text-xs">Joined</span>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">{instructor.createdAt ? new Date(instructor.createdAt).toLocaleDateString() : '-'}</p>
                  </div>

                  <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Link 
                      to={`/admin/instructors/${instructor.id}`}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={`View profile for ${instructor.name}`}
                    >
                      <Eye size={18} />
                    </Link>
                    <button 
                      className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={`Edit ${instructor.name}`}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label={instructor.isActive ? `Deactivate ${instructor.name}` : `Activate ${instructor.name}`}
                    >
                      <UserX size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {!loading && instructors.length > 0 && (
            <div className="bg-white dark:bg-[#0B1120] rounded-xl md:rounded-none md:rounded-b-2xl border border-slate-200 dark:border-slate-800 md:border-t md:border-x-0 md:border-b-0 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm md:shadow-none">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing <span className="font-medium text-slate-900 dark:text-white">{((pagination.page - 1) * pagination.limit) + 1}</span> to <span className="font-medium text-slate-900 dark:text-white">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium text-slate-900 dark:text-white">{pagination.total}</span>
              </p>
              <nav aria-label="Pagination" className="flex items-center gap-2">
                <button 
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 px-2" aria-current="page">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button 
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Next page"
                >
                  <ChevronRight size={18} />
                </button>
              </nav>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
