import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Save, Building, GraduationCap, Mail, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function AdminSettings() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    institution_name: 'EduSphere',
    institution_contact: '',
    institution_academic_year: '2023-2024',
    academic_attendance_threshold: '75',
    academic_grading_system: 'gpa',
    communication_email_notifications: true,
    communication_smtp_host: '',
    communication_smtp_port: '587',
    security_password_min_length: '8',
    security_session_timeout: '60',
    security_mfa_enabled: false
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/admin/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      
      setSettings(prev => ({ ...prev, ...data }));
    } catch (e) {
      toast.error('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (category) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      // Selectively save based on category to prevent accidental overwrites, 
      // but here we just save the whole state for simplicity since it's a unified state.
      // In a real production app we might only send the changed keys.
      const payload = { settings };

      const res = await fetch(`${API_URL}/admin/settings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to save settings');
      toast.success(`${category} settings saved successfully`);
    } catch (e) {
      toast.error(`Failed to save ${category} settings.`);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-[#050811] transition-colors ${mobileOpen ? 'overflow-hidden h-screen' : ''}`}>
      <AdminSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className={`transition-all duration-300 flex flex-col min-h-screen ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}`}>
        <AdminHeader pageTitle="System Settings" onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="w-6 h-6 text-indigo-600" />
                System Settings
              </h1>
              <p className="text-slate-500">Configure global application parameters and policies.</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12">
               <span className="material-symbols-outlined text-indigo-500 text-4xl animate-spin">progress_activity</span>
            </div>
          ) : (
            <Tabs defaultValue="institution" className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-12 bg-slate-100 dark:bg-slate-800/50">
                <TabsTrigger value="institution" className="gap-2"><Building className="w-4 h-4" /> Institution</TabsTrigger>
                <TabsTrigger value="academic" className="gap-2"><GraduationCap className="w-4 h-4" /> Academic</TabsTrigger>
                <TabsTrigger value="communication" className="gap-2"><Mail className="w-4 h-4" /> Communication</TabsTrigger>
                <TabsTrigger value="security" className="gap-2"><ShieldCheck className="w-4 h-4" /> Security</TabsTrigger>
              </TabsList>
              
              {/* INSTITUTION TAB */}
              <TabsContent value="institution" className="mt-6">
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                  <CardHeader>
                    <CardTitle>Institution Details</CardTitle>
                    <CardDescription>Manage the core identity of the institution.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="inst_name">Institution Name</Label>
                      <Input 
                        id="inst_name" 
                        value={settings.institution_name} 
                        onChange={e => handleChange('institution_name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inst_contact">Contact Information</Label>
                      <Textarea 
                        id="inst_contact" 
                        placeholder="Address, Phone, Email"
                        value={settings.institution_contact || ''} 
                        onChange={e => handleChange('institution_contact', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="academic_year">Current Academic Year</Label>
                      <Select 
                        value={settings.institution_academic_year} 
                        onValueChange={v => handleChange('institution_academic_year', v)}
                      >
                        <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2023-2024">2023-2024</SelectItem>
                          <SelectItem value="2024-2025">2024-2025</SelectItem>
                          <SelectItem value="2025-2026">2025-2026</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800">
                    <Button onClick={() => handleSave('Institution')} disabled={saving} className="ml-auto gap-2">
                      <Save className="w-4 h-4" /> Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* ACADEMIC TAB */}
              <TabsContent value="academic" className="mt-6">
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                  <CardHeader>
                    <CardTitle>Academic Configuration</CardTitle>
                    <CardDescription>Configure grading systems and attendance rules.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="grading_sys">Grading System</Label>
                      <Select 
                        value={settings.academic_grading_system} 
                        onValueChange={v => handleChange('academic_grading_system', v)}
                      >
                        <SelectTrigger><SelectValue placeholder="Select System" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpa">GPA (4.0 Scale)</SelectItem>
                          <SelectItem value="percentage">Percentage (0-100)</SelectItem>
                          <SelectItem value="letter">Letter Grades (A-F)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="attendance">Minimum Attendance Threshold (%)</Label>
                      <Input 
                        id="attendance" 
                        type="number"
                        min="0" max="100"
                        value={settings.academic_attendance_threshold} 
                        onChange={e => handleChange('academic_attendance_threshold', e.target.value)}
                      />
                      <p className="text-xs text-slate-500">Students below this threshold will be flagged.</p>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800">
                    <Button onClick={() => handleSave('Academic')} disabled={saving} className="ml-auto gap-2">
                      <Save className="w-4 h-4" /> Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* COMMUNICATION TAB */}
              <TabsContent value="communication" className="mt-6">
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                  <CardHeader>
                    <CardTitle>Communication Settings</CardTitle>
                    <CardDescription>Configure system emails and notifications.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-slate-500">Allow system to send emails for events.</p>
                      </div>
                      <Switch 
                        checked={settings.communication_email_notifications}
                        onCheckedChange={c => handleChange('communication_email_notifications', c)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="smtp_host">SMTP Host</Label>
                      <Input 
                        id="smtp_host" 
                        placeholder="e.g. smtp.brevo.com"
                        value={settings.communication_smtp_host || ''} 
                        onChange={e => handleChange('communication_smtp_host', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp_port">SMTP Port</Label>
                      <Input 
                        id="smtp_port" 
                        placeholder="587"
                        value={settings.communication_smtp_port || ''} 
                        onChange={e => handleChange('communication_smtp_port', e.target.value)}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800">
                    <Button onClick={() => handleSave('Communication')} disabled={saving} className="ml-auto gap-2">
                      <Save className="w-4 h-4" /> Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* SECURITY TAB */}
              <TabsContent value="security" className="mt-6">
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-orange-500">
                  <CardHeader>
                    <CardTitle className="text-orange-600 dark:text-orange-500 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5" /> Security Policy
                    </CardTitle>
                    <CardDescription>Critical system security configurations. Requires high-level auth.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="min_length">Minimum Password Length</Label>
                        <Input 
                          id="min_length" 
                          type="number"
                          min="6" max="32"
                          value={settings.security_password_min_length} 
                          onChange={e => handleChange('security_password_min_length', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
                        <Input 
                          id="session_timeout" 
                          type="number"
                          min="15" max="1440"
                          value={settings.security_session_timeout} 
                          onChange={e => handleChange('security_session_timeout', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className="space-y-0.5">
                        <Label>Enforce MFA (Multi-Factor Auth)</Label>
                        <p className="text-sm text-slate-500">Require MFA for all administrative accounts.</p>
                      </div>
                      <Switch 
                        checked={settings.security_mfa_enabled}
                        onCheckedChange={c => handleChange('security_mfa_enabled', c)}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800">
                    <Button onClick={() => handleSave('Security')} disabled={saving} className="ml-auto gap-2">
                      <Save className="w-4 h-4" /> Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </div>
  );
}
