import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Save, CheckCircle2, XCircle, 
  Clock, AlertTriangle, Calendar, Users
} from 'lucide-react';
import { fetchFacultyCourseRoster, submitFacultyAttendance, fetchFacultyAttendance } from '../../services/facultyApi';

// Note: To render properly in the app, this needs FacultySidebar and FacultyHeader 
// Assuming similar components exist or we can use placeholders for now

export default function FacultyAttendanceMarking() {
  const { courseId } = useParams();
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadRosterAndAttendance = async () => {
      setLoading(true);
      try {
        const [roster, attendanceData] = await Promise.all([
          fetchFacultyCourseRoster(courseId),
          fetchFacultyAttendance(courseId, date)
        ]);
        
        setStudents(roster);
        
        // Initialize records
        const initialRecords = {};
        const attendanceMap = {};
        
        if (attendanceData && attendanceData.length > 0) {
          attendanceData.forEach(record => {
            attendanceMap[record.studentId] = record.status;
          });
        }
        
        roster.forEach(s => {
          initialRecords[s.studentId] = attendanceMap[s.studentId] || 'present';
        });
        
        setAttendanceRecords(initialRecords);
      } catch (err) {
        setError(err.message || 'Unable to load attendance data');
      } finally {
        setLoading(false);
      }
    };
    loadRosterAndAttendance();
  }, [courseId, date]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status) => {
    if (window.confirm(`Are you sure you want to mark ALL students as ${status.toUpperCase()}?`)) {
      const newRecords = {};
      students.forEach(s => {
        newRecords[s.studentId] = status;
      });
      setAttendanceRecords(newRecords);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const recordsToSubmit = Object.entries(attendanceRecords).map(([studentId, status]) => ({
        studentId,
        status
      }));

      await submitFacultyAttendance(courseId, date, recordsToSubmit);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to submit attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050811] transition-colors p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link to={`/faculty/dashboard`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
          </Link>
        </div>

        <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Mark Attendance</h1>
                <p className="text-slate-500 dark:text-slate-400">Course: <span className="font-semibold text-slate-700 dark:text-slate-300">{courseId}</span></p>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <Users size={18} className="text-slate-400" />
              <span>{students.length} Enrolled Students</span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => markAll('present')}
                className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-medium rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors text-sm"
              >
                Mark All Present
              </button>
              <button 
                onClick={() => markAll('absent')}
                className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-sm"
              >
                Mark All Absent
              </button>
            </div>
          </div>

          {error && (
            <div className="m-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-start gap-3">
              <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="m-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-start gap-3">
              <span className="material-symbols-outlined text-[20px] flex-shrink-0 mt-0.5">check_circle</span>
              <p className="text-sm font-medium">Attendance records saved successfully.</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4 text-center">Present</th>
                    <th className="px-6 py-4 text-center">Absent</th>
                    <th className="px-6 py-4 text-center">Late</th>
                    <th className="px-6 py-4 text-center">Excused</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                        <span className="material-symbols-outlined text-blue-500 text-[32px] animate-spin mb-3">progress_activity</span>
                        <p>Loading roster...</p>
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                        <p>No students enrolled in this course.</p>
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student.studentId} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-sm overflow-hidden border border-white dark:border-slate-800">
                              {student.studentAvatar ? (
                                <img src={student.studentAvatar} alt={student.studentName} className="h-full w-full object-cover" />
                              ) : (
                                student.studentName.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">{student.studentName}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{student.studentEmail}</p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 text-center">
                          <label className="inline-flex cursor-pointer">
                            <input 
                              type="radio" 
                              name={`attendance-${student.studentId}`} 
                              checked={attendanceRecords[student.studentId] === 'present'}
                              onChange={() => handleStatusChange(student.studentId, 'present')}
                              className="hidden"
                            />
                            <div className={`p-2 rounded-full transition-colors ${attendanceRecords[student.studentId] === 'present' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                              <CheckCircle2 size={24} />
                            </div>
                          </label>
                        </td>
                        
                        <td className="px-6 py-4 text-center">
                          <label className="inline-flex cursor-pointer">
                            <input 
                              type="radio" 
                              name={`attendance-${student.studentId}`} 
                              checked={attendanceRecords[student.studentId] === 'absent'}
                              onChange={() => handleStatusChange(student.studentId, 'absent')}
                              className="hidden"
                            />
                            <div className={`p-2 rounded-full transition-colors ${attendanceRecords[student.studentId] === 'absent' ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' : 'text-slate-300 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                              <XCircle size={24} />
                            </div>
                          </label>
                        </td>
                        
                        <td className="px-6 py-4 text-center">
                          <label className="inline-flex cursor-pointer">
                            <input 
                              type="radio" 
                              name={`attendance-${student.studentId}`} 
                              checked={attendanceRecords[student.studentId] === 'late'}
                              onChange={() => handleStatusChange(student.studentId, 'late')}
                              className="hidden"
                            />
                            <div className={`p-2 rounded-full transition-colors ${attendanceRecords[student.studentId] === 'late' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400' : 'text-slate-300 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                              <Clock size={24} />
                            </div>
                          </label>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <label className="inline-flex cursor-pointer">
                            <input 
                              type="radio" 
                              name={`attendance-${student.studentId}`} 
                              checked={attendanceRecords[student.studentId] === 'excused'}
                              onChange={() => handleStatusChange(student.studentId, 'excused')}
                              className="hidden"
                            />
                            <div className={`p-2 rounded-full transition-colors ${attendanceRecords[student.studentId] === 'excused' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'text-slate-300 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                              <div className="w-6 h-6 flex items-center justify-center font-bold text-sm">EX</div>
                            </div>
                          </label>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1120] flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Ensure accuracy before saving. Duplicate entries for the same date will be overwritten.
              </p>
              <button 
                type="submit" 
                disabled={saving || students.length === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-semibold shadow-sm transition-colors"
              >
                {saving ? (
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                ) : (
                  <Save size={18} />
                )}
                {saving ? 'Saving Records...' : 'Save Attendance'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
