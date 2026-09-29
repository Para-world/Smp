import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, Plus, UserX, Eye, Edit2, 
  MoreVertical, ChevronLeft, ChevronRight, Upload
} from 'lucide-react';
import { fetchAdminStudents } from '../../services/adminApi';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/states';

export default function AdminStudents() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState(null);

  const loadStudents = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAdminStudents({ page, limit: 10, search, status: statusFilter });
      setStudents(result.data);
      setPagination(result.pagination);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadStudents(1);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, statusFilter]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadStudents(newPage);
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
          pageTitle="Student Management"
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
                  placeholder="Search students..."
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
              <Link to="/admin/students/bulk-import" className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <Upload size={16} />
                Bulk Import
              </Link>
              <Link to="/admin/students/create" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm">
                <Plus size={16} />
                Add Student
              </Link>
            </div>
          </div>

          {/* Desktop Table - hidden on mobile */}
          <div className="hidden md:block bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" role="table" aria-label="Students list">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th scope="col" className="px-6 py-4">Student</th>
                    <th scope="col" className="px-6 py-4">Program</th>
                    <th scope="col" className="px-6 py-4">Semester</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                    <th scope="col" className="px-6 py-4">Enrollment Date</th>
                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12">
                        <LoadingState message="Loading students..." />
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12">
                        <ErrorState message={error} onRetry={() => loadStudents(pagination.page)} />
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12">
                        <EmptyState 
                          title="No students found" 
                          message={search || statusFilter ? "No students match your current filters." : "You haven't added any students yet."}
                          action={
                            <Link to="/admin/students/create" className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
                              <Plus size={16} /> Add Student
                            </Link>
                          }
                        />
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-sm overflow-hidden" aria-hidden="true">
                              {student.avatarUrl ? (
                                <img src={student.avatarUrl} alt="" className="h-full w-full object-cover" />
                              ) : (
                                student.name.charAt(0)
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">{student.name}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                          {student.program || 'Not assigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                          {student.semester ? `Semester ${student.semester}` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            student.isActive 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${student.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} aria-hidden="true"></span>
                            {student.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                          {student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-1">
                            <Link 
                              to={`/admin/students/${student.id}`}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                              aria-label={`View profile for ${student.name}`}
                            >
                              <Eye size={18} />
                            </Link>
                            <button 
                              className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                              aria-label={`Edit ${student.name}`}
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                              aria-label={student.isActive ? `Deactivate ${student.name}` : `Activate ${student.name}`}
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

          {/* Mobile Card View - shown only on mobile */}
          <div className="md:hidden space-y-3">
            {loading ? (
              <LoadingState message="Loading students..." className="bg-white dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-slate-800 py-12" />
            ) : error ? (
              <ErrorState message={error} onRetry={() => loadStudents(pagination.page)} className="bg-white dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-slate-800 py-12" />
            ) : students.length === 0 ? (
              <EmptyState 
                title="No students found" 
                message={search || statusFilter ? "No students match your current filters." : "You haven't added any students yet."}
                className="bg-white dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-slate-800 py-12"
              />
            ) : (
              students.map((student) => (
                <div key={student.id} className="bg-white dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-sm overflow-hidden" aria-hidden="true">
                        {student.avatarUrl ? (
                          <img src={student.avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          student.name.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">{student.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{student.email}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      student.isActive 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${student.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} aria-hidden="true"></span>
                      {student.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-sm">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 text-xs">Program</span>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">{student.program || 'Not assigned'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 text-xs">Semester</span>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">{student.semester ? `Semester ${student.semester}` : '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 dark:text-slate-500 text-xs">Enrolled</span>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">{student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Link 
                      to={`/admin/students/${student.id}`}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={`View profile for ${student.name}`}
                    >
                      <Eye size={18} />
                    </Link>
                    <button 
                      className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={`Edit ${student.name}`}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label={student.isActive ? `Deactivate ${student.name}` : `Activate ${student.name}`}
                    >
                      <UserX size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {!loading && students.length > 0 && (
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
