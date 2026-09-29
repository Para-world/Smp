import React, { useState, useEffect } from 'react';
import { fetchFacultyCourseStudents } from '../../services/facultyApi';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Mail, ExternalLink } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function FacultyCourseStudents({ courseId }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, [courseId]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await fetchFacultyCourseStudents(courseId);
      setStudents(data);
    } catch (error) {
      toast.error('Failed to load students roster');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'enrolled': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Enrolled</Badge>;
      case 'completed': return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Completed</Badge>;
      case 'dropped': return <Badge className="bg-red-100 text-red-700 hover:bg-red-200">Dropped</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Enrolled Students ({students.length})</h2>
        <Button variant="outline" size="sm">Export CSV</Button>
      </div>
      
      {students.length === 0 ? (
        <div className="p-8 text-center text-slate-500">
          <p>No students enrolled in this course yet.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Attendance</TableHead>
              <TableHead>Assignments</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Result</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.studentId}>
                <TableCell className="font-mono text-xs text-slate-500">
                  {student.studentId.substring(0, 8)}...
                </TableCell>
                <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                  {student.name}
                </TableCell>
                <TableCell className="text-slate-500">
                  {student.email}
                </TableCell>
                <TableCell>
                  <span className="text-slate-500 italic">--%</span>
                </TableCell>
                <TableCell>
                  <span className="text-slate-500 italic">--/--</span>
                </TableCell>
                <TableCell>
                  {getStatusBadge(student.status)}
                </TableCell>
                <TableCell>
                  {student.finalGrade ? (
                    <span className="font-semibold">{student.finalGrade}</span>
                  ) : (
                    <span className="text-slate-400 italic">N/A</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => window.location.href = `mailto:${student.email}`}>
                        <Mail className="mr-2 h-4 w-4" />
                        <span>Email Student</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        <span>View Profile</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
