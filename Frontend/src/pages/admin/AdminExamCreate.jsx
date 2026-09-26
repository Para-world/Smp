import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchAdminCourses } from '../../services/adminApi';
import { createAdminExam } from '../../services/adminApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';

export default function AdminExamCreate() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    courseId: '',
    examType: 'MID_TERM',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    durationMinutes: '60',
    venue: '',
    instructions: '',
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      // Fetching up to 100 courses for dropdown (should ideally use search in real prod, but this works for demo)
      const data = await fetchAdminCourses({ limit: 100 });
      setCourses(data.data || []);
    } catch (error) {
      toast.error('Failed to load courses for selection');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.courseId || !formData.date || !formData.startTime || !formData.endTime || !formData.durationMinutes) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await createAdminExam(formData);
      toast.success('Exam scheduled successfully');
      navigate('/admin/exams');
    } catch (error) {
      toast.error(error.message || 'Failed to schedule exam');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/exams">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule Institutional Exam</h1>
          <p className="text-slate-500 dark:text-slate-400">Plan a new examination for any course</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Main Info */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Exam Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g. Mid-term Examination"
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="examType">Exam Type</Label>
                  <Select
                    value={formData.examType}
                    onValueChange={(val) => handleSelectChange('examType', val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="QUIZ">Quiz</SelectItem>
                      <SelectItem value="MID_TERM">Mid-Term</SelectItem>
                      <SelectItem value="FINAL">Final</SelectItem>
                      <SelectItem value="PRACTICAL">Practical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="venue">Venue / Location</Label>
                  <Input
                    id="venue"
                    name="venue"
                    placeholder="e.g. Main Hall"
                    value={formData.venue}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Schedule & Timing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="startTime">Start Time <span className="text-red-500">*</span></Label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="endTime">End Time <span className="text-red-500">*</span></Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="durationMinutes">Duration (mins) <span className="text-red-500">*</span></Label>
                  <Input
                    id="durationMinutes"
                    name="durationMinutes"
                    type="number"
                    min="1"
                    value={formData.durationMinutes}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Details & Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions for Students</Label>
                <Textarea
                  id="instructions"
                  name="instructions"
                  placeholder="E.g. Bring your own calculator, no electronic devices allowed..."
                  rows={3}
                  value={formData.instructions}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end gap-4 border-t pt-6 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl">
              <Link to="/admin/exams">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Schedule Exam
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}
