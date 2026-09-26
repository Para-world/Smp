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
