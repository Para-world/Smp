const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('edusphere_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const fetchAdminDashboard = async () => {
  const response = await fetch(`${API_URL}/admin/dashboard`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch admin dashboard');
  }
  return response.json();
};

export const fetchAdminStudents = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}/admin/students?${query}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch students');
  }
  return response.json();
};

export const fetchAdminStudentDetails = async (studentId) => {
  const response = await fetch(`${API_URL}/admin/students/${studentId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch student details');
  }
  return response.json();
};

export const createAdminStudent = async (studentData) => {
  const response = await fetch(`${API_URL}/admin/students`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(studentData)
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to create student');
  }
  return response.json();
};

export const fetchAdminInstructors = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}/admin/instructors?${query}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch instructors');
  }
  return response.json();
};

export const fetchAdminInstructorDetails = async (instructorId) => {
  const response = await fetch(`${API_URL}/admin/instructors/${instructorId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch instructor details');
  }
  return response.json();
};

export const fetchAdminCourses = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}/admin/courses?${query}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch courses');
  }
  return response.json();
};

export const fetchAdminCourseDetails = async (courseId) => {
  const response = await fetch(`${API_URL}/admin/courses/${courseId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch course details');
  }
  return response.json();
};

export const fetchAdminEnrollments = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}/admin/enrollments?${query}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch enrollments');
  }
  return response.json();
};

export const fetchAdminAttendance = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}/admin/attendance?${query}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch attendance');
  }
  return response.json();
};

export const fetchAdminAttendanceSummary = async (threshold = 75) => {
  const response = await fetch(`${API_URL}/admin/attendance/summary?threshold=${threshold}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch attendance summary');
  }
  return response.json();
};

export const fetchAdminExams = async () => {
  const response = await fetch(`${API_URL}/admin/exams`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch exams');
  }
  return response.json();
};

export const createAdminExam = async (data) => {
  const response = await fetch(`${API_URL}/admin/exams`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create exam');
  }
  return response.json();
};

export const updateAdminExam = async (id, data) => {
  const response = await fetch(`${API_URL}/admin/exams/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update exam');
  }
  return response.json();
};

export const createAdminEnrollment = async (data) => {
  const response = await fetch(`${API_URL}/admin/enrollments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to enroll student');
  }
  return response.json();
};

export const removeAdminEnrollment = async (id) => {
  const response = await fetch(`${API_URL}/admin/enrollments/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove enrollment');
  }
  return response.json();
};

export const bulkImportStudents = async (data) => {
  const response = await fetch(`${API_URL}/admin/students/bulk-import`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to bulk import students');
  }
  return response.json();
};

export const fetchAdminAssignments = async () => {
  const response = await fetch(`${API_URL}/admin/assignments`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch assignments');
  }
  return response.json();
};

export const fetchAdminResults = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}/admin/results?${query}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch results');
  }
  return response.json();
};

export const createAdminResult = async (data) => {
  const response = await fetch(`${API_URL}/admin/results`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to save result');
  }
  return response.json();
};

export const updateAdminResultStatus = async (id, status, reason) => {
  const response = await fetch(`${API_URL}/admin/results/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, reason }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to update result status');
  }
  return response.json();
};

export const bulkImportResults = async (data) => {
  const response = await fetch(`${API_URL}/admin/results/bulk-import`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to bulk import results');
  }
  return response.json();
};

export const fetchResultAuditLogs = async (id) => {
  const response = await fetch(`${API_URL}/admin/results/${id}/audit`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch audit logs');
  }
  return response.json();
};

export const fetchAdminTimetable = async () => {
  const response = await fetch(`${API_URL}/admin/timetable`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch timetable');
  }
  return response.json();
};

export const createAdminTimetable = async (data) => {
  const response = await fetch(`${API_URL}/admin/timetable`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to create schedule');
  }
  return response.json();
};

export const updateAdminTimetable = async (id, data) => {
  const response = await fetch(`${API_URL}/admin/timetable/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to update schedule');
  }
  return response.json();
};

export const deleteAdminTimetable = async (id) => {
  const response = await fetch(`${API_URL}/admin/timetable/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to delete schedule');
  }
  return response.json();
};

export const fetchAdminAnnouncements = async () => {
  const response = await fetch(`${API_URL}/admin/announcements`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch announcements');
  }
  return response.json();
};

export const createAdminAnnouncement = async (data) => {
  const response = await fetch(`${API_URL}/admin/announcements`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to create announcement');
  }
  return response.json();
};

export const updateAdminAnnouncement = async (id, data) => {
  const response = await fetch(`${API_URL}/admin/announcements/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to update announcement');
  }
  return response.json();
};

export const deleteAdminAnnouncement = async (id) => {
  const response = await fetch(`${API_URL}/admin/announcements/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to delete announcement');
  }
  return response.json();
};

export const fetchAdminSemesters = async () => {
  const response = await fetch(`${API_URL}/admin/semesters`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch semesters');
  }
  return response.json();
};

export const fetchAdminNotifications = async () => {
  const response = await fetch(`${API_URL}/admin/notifications`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch notifications');
  }
  return response.json();
};

export const sendAdminNotification = async (data) => {
  const response = await fetch(`${API_URL}/admin/notifications`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to send notification');
  }
  return response.json();
};

export const fetchAdminReports = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}/admin/reports?${query}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch reports');
  }
  return response.json();
};
