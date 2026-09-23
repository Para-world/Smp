import { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('edusphere_token'));
  const [loading, setLoading] = useState(true);
  const [deviceId, setDeviceId] = useState(() => {
    let id = localStorage.getItem('edusphere_device_id');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('edusphere_device_id', id);
    }
    return id;
  });

  // Check session on mount
  useEffect(() => {
    if (token) {
      fetch(`${API_URL}/auth/session`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Invalid session');
          return res.json();
        })
        .then((data) => {
          setUser(data.user);
        })
        .catch(() => {
          localStorage.removeItem('edusphere_token');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const signup = async (name, email, password, role = 'student') => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Signup failed');
    }

    localStorage.setItem('edusphere_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const signin = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, deviceId }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Sign in failed');
    }

    localStorage.setItem('edusphere_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };



  const getConnectedDevices = async () => {
    const res = await fetch(`${API_URL}/auth/device/devices`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Device-Id': deviceId 
      },
    });
    if (!res.ok) throw new Error('Failed to fetch devices');
    return res.json();
  };

  const revokeDevice = async (id) => {
    const res = await fetch(`${API_URL}/auth/device/devices/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Revocation failed');
    return res.json();
  };

  const signout = () => {
    localStorage.removeItem('edusphere_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      signup, 
      signin, 
      signout, 
      isAuthenticated: !!user,
      getConnectedDevices,
      revokeDevice,
      deviceId
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
