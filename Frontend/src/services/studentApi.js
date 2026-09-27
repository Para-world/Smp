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

export async function fetchStudentAttendance() {
  const res = await fetch(`${API_URL}/student/attendance`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load attendance');
  }

  return res.json();
}

export async function fetchStudentAttendanceRecords(params = {}) {
  const url = new URL(`${API_URL}/student/attendance/records`);
  Object.keys(params).forEach(key => {
    if (params[key]) url.searchParams.append(key, params[key]);
  });

  const res = await fetch(url.toString(), {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load attendance records');
  }

  return res.json();
}

export async function fetchCourseAttendance(courseId) {
  const res = await fetch(`${API_URL}/student/attendance/course/${courseId}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load course attendance');
  }

  return res.json();
}

// ─── ASSIGNMENTS ────────────────────────────────────────────────────────────

export async function fetchAssignments() {
  const res = await fetch(`${API_URL}/student/assignments`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load assignments');
  }

  return res.json();
}

export async function fetchAssignmentDetails(assignmentId) {
  const res = await fetch(`${API_URL}/student/assignments/${assignmentId}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load assignment details');
  }

  return res.json();
}

export async function submitAssignment(assignmentId, payload) {
  const res = await fetch(`${API_URL}/student/assignments/${assignmentId}/submit`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to submit assignment');
  }

  return res.json();
}
export async function fetchTimetable(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const url = query ? `${API_URL}/student/timetable?${query}` : `${API_URL}/student/timetable`;
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load timetable');
  }

  return res.json();
}

export async function fetchExams(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const url = query ? `${API_URL}/student/exams?${query}` : `${API_URL}/student/exams`;
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load exams');
  }

  return res.json();
}

export async function fetchExamDetail(examId) {
  const res = await fetch(`${API_URL}/student/exams/${examId}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load exam details');
  }

  return res.json();
}

export async function fetchResults() {
  const res = await fetch(`${API_URL}/student/results`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load results');
  }

  return res.json();
}

export async function fetchResultDetail(resultId) {
  const res = await fetch(`${API_URL}/student/results/${resultId}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load result details');
  }

  return res.json();
}

// ─── Announcements ───────────────────────────────────────────────────────────

export async function fetchAnnouncements() {
  const res = await fetch(`${API_URL}/student/announcements`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load announcements');
  }

  return res.json();
}

export async function fetchAnnouncementDetail(announcementId) {
  const res = await fetch(`${API_URL}/student/announcements/${announcementId}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load announcement details');
  }

  return res.json();
}

// ─── Notifications ───────────────────────────────────────────────────────────

export async function fetchNotifications() {
  const res = await fetch(`${API_URL}/student/notifications`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load notifications');
  }

  return res.json();
}

export async function fetchUnreadNotificationCount() {
  const res = await fetch(`${API_URL}/student/notifications/unread-count`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load unread count');
  }

  return res.json();
}

export async function markNotificationRead(notificationId) {
  const res = await fetch(`${API_URL}/student/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to mark notification as read');
  }

  return res.json();
}

export async function markAllNotificationsRead() {
  const res = await fetch(`${API_URL}/student/notifications/read-all`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to mark all notifications as read');
  }

  return res.json();
}

// --- SETTINGS & SECURITY --------------------------------------------------

export async function getSettings() {
  const res = await fetch("${API_URL}/student/settings", {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load settings');
  }

  return res.json();
}

export async function updateSettings(settings) {
  const res = await fetch("${API_URL}/student/settings", {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(settings),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to update settings');
  }

  return res.json();
}

export async function changePassword(data) {
  const res = await fetch("${API_URL}/student/settings/password", {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const result = await res.json().catch(() => ({}));
    throw new Error(result.error || 'Failed to change password');
  }

  return res.json();
}

export async function getTrustedDevices() {
  const deviceId = localStorage.getItem('edusphere_device_id') || '';
  const res = await fetch(`${API_URL}/auth/devices`, {
    headers: { ...getAuthHeaders(), 'x-device-id': deviceId },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load trusted devices');
  }

  return res.json();
}

export async function revokeDevice(id) {
  const res = await fetch(`${API_URL}/auth/devices/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to revoke device');
  }

  return res.json();
}

export async function logoutAllOtherDevices() {
  const deviceId = localStorage.getItem('edusphere_device_id') || '';
  const res = await fetch(`${API_URL}/auth/devices/logout-others`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'x-device-id': deviceId },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to logout other devices');
  }

  return res.json();
}

export async function logoutAllDevices() {
  const res = await fetch(`${API_URL}/auth/devices/logout-all`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to logout all devices');
  }

  return res.json();
}

export async function fetchAnnouncements(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const url = query ? `${API_URL}/student/announcements?${query}` : `${API_URL}/student/announcements`;
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load announcements');
  }

  return res.json();
}
