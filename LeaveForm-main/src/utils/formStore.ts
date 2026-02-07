const API_URL = 'http://localhost:5000/api';

export interface FormData {
  id: string; // MongoDB _id
  type: 'od' | 'leave';
  name: string;
  regNo: string;
  class: string;
  section: string;
  from: string;
  to: string;
  reason: string;
  status: 'pending' | 'mentor_approved' | 'approved' | 'rejected';
  submittedAt: string;
  mentorMessage?: string;
  adminMessage?: string;
  updatedAt?: string;
}

export interface Student {
  id: string; // MongoDB _id
  name: string;
  regNo: string;
  dob: string;
  class: string;
  section: string;
  leaveBalance: number;
}

// --- Local Storage Fallback Data ---
const MOCK_STUDENTS: Student[] = [
  { id: '1', name: 'Dinesh Kumar', regNo: '731621104001', dob: '2003-05-15', class: '4 year', section: 'A', leaveBalance: 25 },
  { id: '2', name: 'Priya Dharshini', regNo: '731621104002', dob: '2003-08-22', class: '4 year', section: 'A', leaveBalance: 25 },
  { id: '3', name: 'Vijay S', regNo: '731621104003', dob: '2004-01-10', class: '3 year', section: 'B', leaveBalance: 25 },
  { id: '4', name: 'Deepika R', regNo: '731621104004', dob: '2004-03-05', class: '3 year', section: 'B', leaveBalance: 25 }
];

const getLocalStudents = (): Student[] => {
  const local = localStorage.getItem('mock_students');
  if (!local) {
    localStorage.setItem('mock_students', JSON.stringify(MOCK_STUDENTS));
    return MOCK_STUDENTS;
  }
  return JSON.parse(local);
};

const getLocalForms = (): FormData[] => {
  const local = localStorage.getItem('mock_forms');
  return local ? JSON.parse(local) : [];
};

const saveLocalStudents = (students: Student[]) => {
  localStorage.setItem('mock_students', JSON.stringify(students));
};

const saveLocalForms = (forms: FormData[]) => {
  localStorage.setItem('mock_forms', JSON.stringify(forms));
};

// --- Students ---

export const getStudents = async (): Promise<Student[]> => {
  try {
    const res = await fetch(`${API_URL}/students`);
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Backend error');
    }
    const data = await res.json();
    const students = data.map((s: any) => ({ ...s, id: s._id }));
    saveLocalStudents(students); // Sync local for fallback
    return students;
  } catch (err: any) {
    console.error('Database Connection Error:', err.message);
    // Return early with error info if needed, or fallback but alert
    const local = getLocalStudents();
    (local as any).isOffline = true;
    return local;
  }
};

export const addStudent = async (student: Omit<Student, 'id' | 'leaveBalance'>) => {
  try {
    const res = await fetch(`${API_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add student');
    return { ...data, id: data._id };
  } catch (err: any) {
    console.error('Database Save Error:', err.message);
    return { error: err.message || 'Database connection failed. Data saved locally only.' };
  }
};

export const updateStudentLeaveBalance = async (regNo: string, days: number = 1) => {
  try {
    const res = await fetch(`${API_URL}/students/${regNo}/deduct`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days })
    });
    if (res.ok) return await res.json();
    throw new Error('Backend failed');
  } catch (err) {
    const local = getLocalStudents();
    const index = local.findIndex(s => s.regNo === regNo);
    if (index !== -1) {
      local[index].leaveBalance -= days;
      saveLocalStudents(local);
      return local[index];
    }
    return null;
  }
};

export const deleteStudent = async (id: string) => {
  try {
    const res = await fetch(`${API_URL}/students/${id}`, { method: 'DELETE' });
    if (res.ok) return true;
    throw new Error('Backend failed');
  } catch (err) {
    const local = getLocalStudents();
    const filtered = local.filter(s => s.id !== id);
    saveLocalStudents(filtered);
    return true;
  }
};

// --- Forms ---

export const getForms = async (): Promise<FormData[]> => {
  try {
    const res = await fetch(`${API_URL}/forms`);
    if (!res.ok) throw new Error('Backend failed to fetch forms');
    const forms = await res.json();
    const mapped = forms.map((f: any) => ({ ...f, id: f._id }));
    saveLocalForms(mapped);
    return mapped;
  } catch (err: any) {
    console.error('Form Fetch Error:', err.message);
    return getLocalForms();
  }
};

export const addForm = async (form: Omit<FormData, 'id' | 'status' | 'submittedAt'>) => {
  try {
    const res = await fetch(`${API_URL}/forms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Backend failed');
    }
    return await res.json();
  } catch (err: any) {
    console.error('Form Submission Error:', err.message);
    return { error: 'Database connection failed. Please check if the backend server is running and connected to MongoDB.' };
  }
};

export const updateFormStatus = async (formId: string, status: 'pending' | 'mentor_approved' | 'approved' | 'rejected', message?: string, isMentor: boolean = true) => {
  try {
    const res = await fetch(`${API_URL}/forms/${formId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, message, isMentor })
    });
    if (res.ok) {
      const updated = await res.json();
      return { ...updated, id: updated._id };
    }
    throw new Error('Backend failed');
  } catch (err: any) {
    const local = getLocalForms();
    const index = local.findIndex(f => f.id === formId);
    if (index !== -1) {
      local[index].status = status;
      if (isMentor) local[index].mentorMessage = message;
      else local[index].adminMessage = message;
      saveLocalForms(local);
      return local[index];
    }
    return { error: err.message };
  }
};

export const login = async (credentials: { username: string; password: string; role: string }) => {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  } catch (err: any) {
    console.error('Login Error:', err.message);
    return { error: err.message };
  }
};

export const saveStudents = async () => { };

export const isRecent = (dateStr?: string) => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const oneDay = 24 * 60 * 60 * 1000;
  return (Date.now() - date.getTime()) < oneDay;
};
export const saveForms = () => { };