function getAuthHeaders() {
  const token = localStorage.getItem('edusphere_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const fetchFacultyDashboard = async () => {
  const response = await fetch(`${API_URL}/faculty/dashboard`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch faculty dashboard');
  }
  return response.json();
};

export const fetchFacultyCourseById = async (courseId) => {
  const response = await fetch(`${API_URL}/faculty/courses/${courseId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch course details');
  }
  return response.json();
};

export const fetchFacultyCourseStudents = async (courseId) => {
  const response = await fetch(`${API_URL}/faculty/courses/${courseId}/students`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch course students');
  }
  return response.json();
};

export const fetchFacultyCourseRoster = async (courseId) => {
  const response = await fetch(`${API_URL}/faculty/courses/${courseId}/attendance-roster`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch course roster');
  }
  return response.json();
};

export const submitFacultyAttendance = async (courseId, date, records) => {
  const response = await fetch(`${API_URL}/faculty/courses/${courseId}/attendance`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ date, records })
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to submit attendance');
  }
  return response.json();
};

export const fetchFacultyAssignments = async () => {
  const response = await fetch(`${API_URL}/faculty/assignments`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch assignments');
  }
  return response.json();
};

export const createFacultyAssignment = async (data) => {
  const response = await fetch(`${API_URL}/faculty/assignments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create assignment');
  }
  return response.json();
};

export const fetchAssignmentSubmissions = async (assignmentId) => {
  const response = await fetch(`${API_URL}/faculty/assignments/${assignmentId}/submissions`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch submissions');
  }
  return response.json();
};

export const gradeSubmission = async (assignmentId, studentId, data) => {
  const response = await fetch(`${API_URL}/faculty/assignments/${assignmentId}/submissions/${studentId}/grade`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to grade submission');
  }
  return response.json();
};

export const fetchFacultyCourses = async () => {
  const response = await fetch(`${API_URL}/faculty/courses`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch courses');
  }
  return response.json();
};

export const fetchFacultyExams = async () => {
  const response = await fetch(`${API_URL}/faculty/exams`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch exams');
  }
  return response.json();
};

export const createFacultyExam = async (data) => {
  const response = await fetch(`${API_URL}/faculty/exams`, {
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

export const updateFacultyExam = async (id, data) => {
  const response = await fetch(`${API_URL}/faculty/exams/${id}`, {
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

export const fetchFacultyTimetable = async () => {
  const response = await fetch(`${API_URL}/faculty/timetable`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch timetable');
  }
  return response.json();
};

export const fetchFacultyAnnouncements = async () => {
  const response = await fetch(`${API_URL}/faculty/announcements`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch announcements');
  }
  return response.json();
};

export const createFacultyAnnouncement = async (data) => {
  const response = await fetch(`${API_URL}/faculty/announcements`, {
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

export const updateFacultyAnnouncement = async (id, data) => {
  const response = await fetch(`${API_URL}/faculty/announcements/${id}`, {
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

export const deleteFacultyAnnouncement = async (id) => {
  const response = await fetch(`${API_URL}/faculty/announcements/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to delete announcement');
  }
  return response.json();
};
