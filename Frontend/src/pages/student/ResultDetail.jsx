import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Award, 
  BookOpen, 
  Calendar, 
  GraduationCap, 
  CheckCircle2, 
  Clock,
  AlertCircle
} from 'lucide-react';
import { fetchResultDetail } from '../../services/studentApi';

import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ResultDetail() {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadResult = async () => {
      try {
        setLoading(true);
        const data = await fetchResultDetail(resultId);
        setResult(data);
      } catch (err) {
        setError(err.message || 'Failed to load result details');
      } finally {
        setLoading(false);
      }
    };
    loadResult();
  }, [resultId]);

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
      case 'PASS': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'FAIL': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'PENDING': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
      <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-900 dark:text-white">{value !== null && value !== undefined ? value : '-'}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-200">
      <StudentSidebar collapsed={sidebarCollapsed} />
      
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <StudentHeader 
          sidebarCollapsed={sidebarCollapsed} 
          setSidebarCollapsed={setSidebarCollapsed} 
        />
        
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto w-full max-w-4xl mx-auto">
          {/* Back button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/student/results')}
            className="mb-6 text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Results
          </Button>

          {loading ? (
            <div className="space-y-6">
              <div className="h-32 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse"></div>
                <div className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse"></div>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Unable to load result</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          ) : result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Header Card */}
              <Card className="bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 overflow-hidden relative shadow-sm">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="font-mono text-xs">{result.courseCode}</Badge>
                      <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {result.semesterName}
                      </Badge>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
                      {result.courseTitle}
                    </h1>
                  </div>

                  <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="text-center">
                      <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mb-1">Grade</p>
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg text-xl font-bold ${getGradeColor(result.grade)}`}>
                        {result.grade || '-'}
                      </div>
                    </div>
                    <div className="w-px h-12 bg-slate-200 dark:bg-slate-700"></div>
                    <div className="text-center">
                      <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mb-1">Status</p>
                      <Badge className={`px-3 py-1 ${getStatusColor(result.status)} border`}>
                        {result.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mark Breakdown */}
                <Card className="shadow-sm border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award size={18} className="text-indigo-500" />
                      Assessment Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-1">
                    <InfoRow label="Internal Assessment" value={result.internalMarks} />
                    <InfoRow label="Practical Assessment" value={result.practicalMarks} />
                    <InfoRow label="Final Examination" value={result.externalMarks} />
                    <div className="flex justify-between items-center py-4 mt-2 border-t-2 border-slate-100 dark:border-slate-800">
                      <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Total Marks</span>
                      <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{result.totalMarks || '-'}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Result Information */}
                <Card className="shadow-sm border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen size={18} className="text-emerald-500" />
                      Subject Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-1">
                    <InfoRow label="Course Code" value={result.courseCode} />
                    <InfoRow label="Credits" value={result.credits} />
                    <InfoRow label="Grade Points" value={result.gradePoint} />
                    <InfoRow label="Academic Year" value={result.academicYear || 'N/A'} />
                    <InfoRow 
                      label="Published Date" 
                      value={result.publishedAt ? new Date(result.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unpublished'} 
                    />
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
