import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { bulkImportResults } from '../../services/adminApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { ArrowLeft, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

export default function AdminResultBulkImport({ mobileOpen, setMobileOpen }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [semesterId, setSemesterId] = useState('');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [submitting, setSubmitting] = useState(false);
  const [importSummary, setImportSummary] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        
        if (lines.length < 2) {
          toast.error('CSV must contain a header row and at least one data row');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const rowObj = {};
          headers.forEach((header, index) => {
            rowObj[header] = values[index];
          });
          
          if (rowObj.studentId && rowObj.courseCode) {
            data.push(rowObj);
          }
        }
        
        setPreviewData(data);
      } catch (err) {
        toast.error('Failed to parse CSV file');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!semesterId) {
      toast.error('Semester ID is required');
      return;
    }
    
    if (previewData.length === 0) {
      toast.error('No valid data to import');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        semesterId,
        academicYear,
        results: previewData
      };
      
      const res = await bulkImportResults(payload);
      setImportSummary(res);
      toast.success(`Import complete: ${res.imported} imported, ${res.skipped} skipped`);
    } catch (error) {
      toast.error(error.message || 'Failed to import results');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-[#050811] transition-colors ${
        mobileOpen ? 'overflow-hidden h-screen' : ''
      }`}
    >
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
          pageTitle="Bulk Import Results"
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1400px] mx-auto space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/admin/results">
              <Button variant="outline" size="icon" className="rounded-full">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Bulk Result Import</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Upload CSV to import marks for multiple students</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>Target term for the imported results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Semester ID (UUID) <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="Enter Semester UUID" 
                    value={semesterId} 
                    onChange={e => setSemesterId(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Academic Year</Label>
                  <Input 
                    value={academicYear} 
                    onChange={e => setAcademicYear(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>CSV File <span className="text-red-500">*</span></Label>
                  <Input 
                    type="file" 
                    accept=".csv"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Required columns: <code className="bg-slate-100 p-1 rounded">studentId</code>, <code className="bg-slate-100 p-1 rounded">courseCode</code>. Optional: <code className="bg-slate-100 p-1 rounded">internalMarks</code>, <code className="bg-slate-100 p-1 rounded">externalMarks</code>, <code className="bg-slate-100 p-1 rounded">practicalMarks</code>, <code className="bg-slate-100 p-1 rounded">totalMarks</code>, <code className="bg-slate-100 p-1 rounded">grade</code>, <code className="bg-slate-100 p-1 rounded">gradePoint</code>
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700" 
                  onClick={handleImport}
                  disabled={submitting || previewData.length === 0 || !semesterId || !!importSummary}
                >
                  {submitting ? 'Importing...' : 'Confirm & Import'}
                </Button>
              </CardFooter>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Preview & Validation</CardTitle>
                <CardDescription>
                  {previewData.length > 0 ? `Found ${previewData.length} records ready to process` : 'Upload a file to see preview'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {importSummary && (
                  <div className="mb-6 p-4 rounded-lg bg-slate-50 border space-y-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <CheckCircle2 className="text-green-500 h-5 w-5" /> Import Summary
                    </h3>
                    <div className="flex gap-4">
                      <div className="p-3 bg-white rounded shadow-sm border flex-1 text-center">
                        <div className="text-2xl font-bold text-green-600">{importSummary.imported}</div>
                        <div className="text-sm text-slate-500">Successfully Imported</div>
                      </div>
                      <div className="p-3 bg-white rounded shadow-sm border flex-1 text-center">
                        <div className="text-2xl font-bold text-amber-500">{importSummary.skipped}</div>
                        <div className="text-sm text-slate-500">Skipped/Errors</div>
                      </div>
                    </div>
                    {importSummary.errors?.length > 0 && (
                      <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200 h-32 overflow-y-auto">
                        <p className="font-semibold flex items-center gap-2 mb-2"><AlertCircle h-4 w-4 /> Error Log</p>
                        <ul className="list-disc pl-5 space-y-1">
                          {importSummary.errors.map((e, i) => <li key={i}>{e}</li>)}
                        </ul>
                      </div>
                    )}
                    <Button variant="outline" className="w-full mt-4" onClick={() => {setImportSummary(null); setFile(null); setPreviewData([]);}}>
                      Upload Another File
                    </Button>
                  </div>
                )}

                {!importSummary && previewData.length > 0 && (
                  <div className="border rounded-md max-h-[400px] overflow-y-auto">
                    <Table>
                      <TableHeader className="bg-slate-50 sticky top-0">
                        <TableRow>
                          <TableHead>Student ID</TableHead>
                          <TableHead>Course Code</TableHead>
                          <TableHead>Internal</TableHead>
                          <TableHead>External</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Grade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewData.slice(0, 100).map((row, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium text-xs">{row.studentId}</TableCell>
                            <TableCell className="text-xs">{row.courseCode}</TableCell>
                            <TableCell>{row.internalMarks || '-'}</TableCell>
                            <TableCell>{row.externalMarks || '-'}</TableCell>
                            <TableCell>{row.totalMarks || '-'}</TableCell>
                            <TableCell>{row.grade || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {previewData.length > 100 && (
                      <div className="text-center py-2 text-sm text-slate-500 bg-slate-50">
                        Showing first 100 of {previewData.length} records
                      </div>
                    )}
                  </div>
                )}
                
                {!importSummary && previewData.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <FileText className="h-12 w-12 mb-3 text-slate-300" />
                    <p>No data to preview</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
