import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { fetchFacultyCourses, updateFacultyAssignment } from '../../services/facultyApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';

export default function FacultyAssignmentEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    courseId: '',
    description: '',
    instructions: '',
    dueDate: '',
    maxScore: '100',
    weight: '1',
    attachments: '',
    allowLateSubmission: false,
    allowResubmission: false,
    maxAttempts: 1,
    maxAttempts: location.state?.assignment?.maxAttempts || 1,
  });

  useEffect(() => {
    if (!location.state?.assignment) {
      toast.error('Assignment not found');
      navigate('/faculty/assignments');
      return;
    }
    
    // Set form data from assignment state
    const assignment = location.state.assignment;
    setFormData(prev => ({
      ...prev,
      title: assignment.title || '',
      courseId: assignment.courseId || '',
      description: assignment.description || '',
      instructions: assignment.instructions || '',
      dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().slice(0, 16) : '',
      maxScore: assignment.maxScore || '100',
      weight: assignment.weight || '1',
      attachments: assignment.attachments || '',
      allowLateSubmission: assignment.allowLateSubmission || false,
      allowResubmission: assignment.allowResubmission || false,
      maxAttempts: assignment.maxAttempts || 1,
    }));
    
    loadCourses();
  }, [location, navigate]);

  const loadCourses = async () => {
    try {
      const data = await fetchFacultyCourses();
      setCourses(data);
    } catch (error) {
      toast.error('Failed to load courses for selection');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.courseId) {
      toast.error('Title and Course are required');
      return;
    }

    try {
      setSubmitting(true);
      await updateFacultyAssignment(location.state.assignment.id, formData);
      toast.success('Assignment updated successfully');
      navigate('/faculty/assignments');
    } catch (error) {
      toast.error(error.message || 'Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/faculty/assignments">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Assignment</h1>
          <p className="text-slate-500 dark:text-slate-400">Modify the assignment details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Assignment Details</CardTitle>
            <CardDescription>Provide all the necessary instructions and criteria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Assignment Title <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Final Database Design Project"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="courseId">Course <span className="text-red-500">*</span></Label>
              <Select
                value={formData.courseId}
                onValueChange={(val) => handleSelectChange('courseId', val)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code} - {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Brief summary of the assignment"
                value={formData.description}
                onChange={handleInputChange}
                className="resize-none"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Detailed Instructions</Label>
              <Textarea
                id="instructions"
                name="instructions"
                placeholder="Provide detailed instructions, rubrics, and expectations..."
                value={formData.instructions}
                onChange={handleInputChange}
                className="resize-none min-h-[120px]"
                rows={6}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="attachments">Attachments (URLs separated by comma)</Label>
              <Input
                id="attachments"
                name="attachments"
                placeholder="https://link-to-file.pdf, https://link-to-dataset.csv"
                value={formData.attachments}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxScore">Maximum Marks <span className="text-red-500">*</span></Label>
                <Input
                  id="maxScore"
                  name="maxScore"
                  type="number"
                  min="1"
                  value={formData.maxScore}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weightage (%)</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.weight}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Late Submission</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="allowLateSubmission"
                    name="allowLateSubmission"
                    checked={formData.allowLateSubmission}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="allowLateSubmission" className="font-normal cursor-pointer text-sm">
                    Allow late submission
                  </Label>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Resubmission</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="allowResubmission"
                    name="allowResubmission"
                    checked={formData.allowResubmission}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="allowResubmission" className="font-normal cursor-pointer text-sm">
                    Allow resubmission
                  </Label>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="maxAttempts" className="text-sm font-semibold">Max Attempts</Label>
                <Input
                  id="maxAttempts"
                  name="maxAttempts"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.maxAttempts}
                  onChange={handleInputChange}
                  disabled={!formData.allowResubmission}
                  className="max-w-[120px]"
                />
              </div>
            </div>

          </CardContent>
          <CardFooter className="flex justify-end gap-4 border-t pt-6 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl">
            <Link to="/faculty/assignments">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
