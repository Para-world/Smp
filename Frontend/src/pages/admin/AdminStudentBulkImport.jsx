import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { Upload, FileText, CheckCircle, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { bulkImportStudents } from '../../services/adminApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AdminStudentBulkImport() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      if (uploadedFile.type !== 'text/csv' && !uploadedFile.name.endsWith('.csv')) {
        toast.error('Please upload a valid CSV file');
        return;
      }
      setFile(uploadedFile);
      parseCSV(uploadedFile);
    }
  };

  const parseCSV = (fileToParse) => {
    Papa.parse(fileToParse, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data;
        const errors = [];

        // Basic frontend validation
        data.forEach((row, index) => {
          const rowErrors = [];
          if (!row.firstName) rowErrors.push('Missing First Name');
          if (!row.lastName) rowErrors.push('Missing Last Name');
          if (!row.email) rowErrors.push('Missing Email');
          else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) rowErrors.push('Invalid Email');

          if (rowErrors.length > 0) {
            errors.push({ row: index + 1, data: row, errors: rowErrors });
          }
        });

        setParsedData(data);
        setValidationErrors(errors);
        setStep(2);
      },
      error: (error) => {
        toast.error(`Error parsing CSV: ${error.message}`);
      }
    });
  };

  const handleImport = async () => {
    if (validationErrors.length > 0) {
      toast.error('Please fix validation errors before importing');
      return;
    }

    try {
      setIsImporting(true);
      const result = await bulkImportStudents({ students: parsedData });
      setImportResults(result);
      setStep(3);
      
      if (result.failed > 0) {
        toast.warning(`Import complete with ${result.failed} errors`);
      } else {
        toast.success(`Successfully imported ${result.successful} students`);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to import students');
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = 'firstName,lastName,email,program,semester,department,academicYear\nJohn,Doe,john@example.com,BCA,1,Computer Science,2026-2027';
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'student_import_template.csv';
    link.click();
  };

  const downloadErrorReport = () => {
    if (!importResults?.errors?.length) return;
    const csvContent = Papa.unparse(importResults.errors);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'import_errors.csv';
    link.click();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/students">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bulk Import Students</h1>
          <p className="text-slate-500 dark:text-slate-400">Import multiple students from a CSV file</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-800 -z-10 rounded-full"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 transition-all duration-300 rounded-full" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
        
        {[
          { num: 1, label: 'Upload CSV', icon: Upload },
          { num: 2, label: 'Preview & Validate', icon: FileText },
          { num: 3, label: 'Import Results', icon: CheckCircle }
        ].map(s => (
          <div key={s.num} className={`flex flex-col items-center gap-2 ${step >= s.num ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
              step >= s.num ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
            }`}>
              <s.icon size={18} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider hidden sm:block">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <Card className="border-dashed border-2 bg-slate-50/50 dark:bg-slate-900/50">
          <CardContent className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-6">
              <Upload size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Upload your CSV File</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
              Make sure your CSV matches the required format. The file must include firstName, lastName, and email columns.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="cursor-pointer">
                <div className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm inline-flex items-center gap-2">
                  <FileText size={18} /> Select CSV File
                </div>
                <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
              </label>
              
              <Button variant="outline" onClick={downloadTemplate}>
                Download Template
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Validate */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                  <FileText size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Total Records</p>
                  <p className="text-2xl font-bold">{parsedData.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Valid Records</p>
                  <p className="text-2xl font-bold text-emerald-600">{parsedData.length - validationErrors.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Errors</p>
                  <p className="text-2xl font-bold text-red-600">{validationErrors.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {validationErrors.length > 0 && (
            <Card className="border-red-200 dark:border-red-900/50">
              <CardHeader className="bg-red-50/50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/50">
                <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2 text-lg">
                  <AlertCircle size={20} /> Please fix the following errors
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-600">Row</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Email</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Errors</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {validationErrors.map((err, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                          <td className="px-4 py-3 font-medium">{err.row}</td>
                          <td className="px-4 py-3 text-slate-600">{err.data.email || 'N/A'}</td>
                          <td className="px-4 py-3 text-red-600">{err.errors.join(', ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(1)}>
              Start Over
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={validationErrors.length > 0 || isImporting}
              className="gap-2"
            >
              {isImporting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Confirm & Import <ArrowRight size={16} /></>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 3 && importResults && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
            {importResults.failed === 0 ? (
              <>
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Import Successful!</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
                  Successfully imported {importResults.successful} student records into the system. Accounts have been created with default passwords.
                </p>
                <Link to="/admin/students">
                  <Button>Return to Students</Button>
                </Link>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mb-6">
                  <AlertCircle size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Import Partially Successful</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
                  Imported {importResults.successful} records, but {importResults.failed} records failed due to backend validation (e.g. duplicate emails).
                </p>
                
                <div className="flex items-center gap-4 mt-6">
                  <Button variant="outline" onClick={downloadErrorReport} className="gap-2 text-red-600 hover:text-red-700">
                    <FileText size={16} /> Download Error Report
                  </Button>
                  <Link to="/admin/students">
                    <Button>Return to Students</Button>
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
