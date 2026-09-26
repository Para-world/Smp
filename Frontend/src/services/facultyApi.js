import { getAuthHeaders } from '../utils/auth';

const API_URL = 'http://localhost:3000/api';

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
