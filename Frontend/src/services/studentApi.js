const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('edusphere_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function getAuthHeadersRaw() {
  const token = localStorage.getItem('edusphere_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchStudentDashboard() {
  const res = await fetch(`${API_URL}/student/dashboard`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load dashboard');
  }

  return res.json();
}

export async function fetchStudentProfile() {
  const res = await fetch(`${API_URL}/student/profile`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load profile');
  }

  return res.json();
}

export async function updateStudentProfile(data) {
  const res = await fetch(`${API_URL}/student/profile`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(result.error || 'Failed to update profile');
  }

  return result;
}

export async function uploadStudentAvatar(file) {
  const formData = new FormData();
  formData.append('avatar', file);

  const res = await fetch(`${API_URL}/student/profile/avatar`, {
    method: 'POST',
    headers: getAuthHeadersRaw(),
    body: formData,
  });

  const result = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(result.error || 'Failed to upload photo');
  }

  return result;
}

export async function fetchStudentCourses() {
  const res = await fetch(`${API_URL}/student/courses`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load courses');
  }

  return res.json();
}

export async function fetchStudentCourseDetails(courseId) {
  const res = await fetch(`${API_URL}/student/courses/${courseId}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load course details');
  }

  return res.json();
}

