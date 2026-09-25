import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  Award, 
  Calendar, 
  ChevronDown, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  FileText,
  Eye,
  Download
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from 'recharts';

import { fetchResults } from '../../services/studentApi';
import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function StudentResults() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const resultsData = await fetchResults();
        setData(resultsData);
        if (resultsData.semesters && resultsData.semesters.length > 0) {
          setSelectedSemesterId(resultsData.semesters[0].semesterId);
        }
      } catch (err) {
        setError(err.message || 'Failed to load academic results.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const selectedSemester = useMemo(() => {
    if (!data || !data.semesters || !selectedSemesterId) return null;
    return data.semesters.find(s => s.semesterId === selectedSemesterId);
  }, [data, selectedSemesterId]);

  const chartData = useMemo(() => {
    if (!data || !data.semesters) return [];
    // Reverse to show oldest to newest
    return [...data.semesters].reverse().map(sem => ({
      name: sem.semesterName,
      sgpa: parseFloat(sem.sgpa || 0),
    })).filter(sem => sem.sgpa > 0);
  }, [data]);

  const getGradeColor = (grade) => {
    if (!grade) return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    if (grade.includes('A')) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400';
    if (grade.includes('B')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400';
    if (grade.includes('C')) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400';
    if (grade.includes('D') || grade === 'F') return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400';
    return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PASS': return 'text-emerald-600 dark:text-emerald-400';
      case 'FAIL': return 'text-red-600 dark:text-red-400';
      case 'PENDING': return 'text-amber-600 dark:text-amber-400';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-200">
      <StudentSidebar collapsed={sidebarCollapsed} />
      
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <StudentHeader 
          sidebarCollapsed={sidebarCollapsed} 
          setSidebarCollapsed={setSidebarCollapsed} 
        />
        
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
              <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                <GraduationCap size={28} />
              </div>
              Academic Results
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm md:text-base">
              Track your semester results, grades, and overall academic performance.
            </p>
          </div>

          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i} className="h-28 animate-pulse bg-slate-100 dark:bg-slate-800/50 border-0" />
                ))}
              </div>
              <Card className="h-96 animate-pulse bg-slate-100 dark:bg-slate-800/50 border-0" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Unable to load results</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
                {error}
              </p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          ) : !data || !data.semesters || data.semesters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
              <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
                <FileText size={28} className="text-slate-400 dark:text-slate-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No results available</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                Your academic results have not been published yet.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Overall Performance Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="shadow-sm border-slate-200/60 dark:border-slate-800">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                        <Award size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Current CGPA</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                          {data.cgpa || 'N/A'}
                        </h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm border-slate-200/60 dark:border-slate-800">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <TrendingUp size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Latest SGPA</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                          {data.semesters[0]?.sgpa || 'N/A'}
                        </h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200/60 dark:border-slate-800">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <BookOpen size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Credits Earned</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                          {data.totalEarnedCredits}
                        </h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200/60 dark:border-slate-800">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Subjects Passed</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                          {data.semesters.reduce((acc, sem) => acc + sem.subjects.filter(s => s.status === 'PASS').length, 0)}
                        </h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Trend */}
              {chartData.length >= 2 && (
                <Card className="shadow-sm border-slate-200/60 dark:border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-lg">Performance Trend (SGPA)</CardTitle>
                    <CardDescription>Your academic progress across semesters</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#64748b', fontSize: 12 }} 
                            dy={10}
                          />
                          <YAxis 
                            domain={[0, 10]} 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            dx={-10}
                          />
                          <RechartsTooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: '#4f46e5', fontWeight: 600 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="sgpa" 
                            name="SGPA"
                            stroke="#4f46e5" 
                            strokeWidth={3}
                            activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                            dot={{ r: 4, fill: '#4f46e5', strokeWidth: 0 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Detailed Semester Results */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Semester Breakdown</h2>
                  <div className="w-full sm:w-64">
                    <Select value={selectedSemesterId} onValueChange={setSelectedSemesterId}>
                      <SelectTrigger className="w-full bg-white dark:bg-slate-900">
                        <SelectValue placeholder="Select Semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.semesters.map(sem => (
                          <SelectItem key={sem.semesterId} value={sem.semesterId}>
                            {sem.semesterName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {selectedSemester && (
                    <motion.div
                      key={selectedSemester.semesterId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      {/* Semester Summary */}
                      <Card className="shadow-sm border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <CardContent className="p-0">
                          <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
                            
                            <div className="p-6 flex-1 flex flex-col justify-center">
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{selectedSemester.semesterName}</h3>
                              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                <Calendar size={14} />
                                <span>Academic Year {selectedSemester.academicYear || 'N/A'}</span>
                              </div>
                            </div>
                            
                            <div className="p-6 flex-1 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                              <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">SGPA</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedSemester.sgpa || 'N/A'}</p>
                              </div>
                              <div className="h-10 w-px bg-slate-200 dark:bg-slate-700"></div>
                              <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Credits</p>
                                <p className="text-xl font-semibold text-slate-800 dark:text-slate-200">{selectedSemester.earnedCredits || 0} / {selectedSemester.totalCredits || 0}</p>
                              </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col justify-center">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Passed</span>
                                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                  {selectedSemester.subjects.filter(s => s.status === 'PASS').length}
                                </span>
                              </div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Failed</span>
                                <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                                  {selectedSemester.subjects.filter(s => s.status === 'FAIL').length}
                                </span>
                              </div>
                              <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800 mt-1">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</span>
                                <Badge variant={selectedSemester.status === 'PASS' ? 'success' : 'secondary'} className="rounded-full">
                                  {selectedSemester.status}
                                </Badge>
                              </div>
                            </div>

                          </div>
                        </CardContent>
                      </Card>

                      {/* Subject-wise Results Table */}
                      <Card className="shadow-sm border-slate-200/60 dark:border-slate-800 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-xs font-semibold">
                              <tr>
                                <th className="px-6 py-4 rounded-tl-lg">Course Code</th>
                                <th className="px-6 py-4">Subject</th>
                                <th className="px-6 py-4 text-center">Credits</th>
                                <th className="px-6 py-4 text-center">Total Marks</th>
                                <th className="px-6 py-4 text-center">Grade</th>
                                <th className="px-6 py-4 text-center">Points</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 rounded-tr-lg"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                              {selectedSemester.subjects.length > 0 ? (
                                selectedSemester.subjects.map(subject => (
                                  <tr key={subject.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-xs font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                      {subject.courseCode}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                      {subject.courseTitle}
                                    </td>
                                    <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-300">
                                      {subject.credits || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-center font-semibold text-slate-700 dark:text-slate-200">
                                      {subject.totalMarks || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                      {subject.grade ? (
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getGradeColor(subject.grade)}`}>
                                          {subject.grade}
                                        </span>
                                      ) : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-center font-medium text-slate-700 dark:text-slate-300">
                                      {subject.gradePoint || '-'}
                                    </td>
                                    <td className={`px-6 py-4 text-center font-semibold text-xs ${getStatusColor(subject.status)}`}>
                                      {subject.status || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      <Link to={`/student/results/${subject.id}`}>
                                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                                          <Eye size={16} className="mr-2" />
                                          View
                                        </Button>
                                      </Link>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="8" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                    No subject results found for this semester.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}
