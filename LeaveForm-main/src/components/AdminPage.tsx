import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Users, BarChart3, FileText, Bell, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Student {
  id: string;
  name: string;
  rollNo: string;
  registerNo: string;
  year: string;
  section: string;
  department: string;
}

interface Class {
  id: string;
  name: string;
  year: string;
  section: string;
  department: string;
  mentor: string;
  students: Student[];
}

interface FormData {
  id: string;
  name: string;
  regNo: string;
  class: string;
  section: string;
  type: 'leave' | 'od';
  from: string;
  to: string;
  reason: string;
  eventName?: string;
  eventType?: string;
  collegeName?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  mentorMessage?: string;
  adminMessage?: string;
}

// Toast notification component
const Toast = ({ message, onClose }: { message: string | null; onClose: () => void }) => {
  if (!message) return null;
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in">
      <CheckCircle size={20} />
      <span>{message}</span>
    </div>
  );
};

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState<FormData[]>([]);
  const [viewType, setViewType] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'od' | 'students' | 'classes'>('all');
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [lastSeenApprovals, setLastSeenApprovals] = useState<{ [key: string]: boolean }>({});
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [showClassModal, setShowClassModal] = useState(false);
  const [classForm, setClassForm] = useState<Class>({
    id: '',
    name: '',
    year: '',
    section: '',
    department: '',
    mentor: '',
    students: []
  });
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);

  // Load classes from localStorage
  useEffect(() => {
    const storedClasses = localStorage.getItem('classes');
    if (storedClasses) {
      setClasses(JSON.parse(storedClasses));
    }
  }, []);

  // Save classes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('classes', JSON.stringify(classes));
  }, [classes]);

  const handleAddClass = () => {
    if (classForm.name && classForm.year && classForm.section && classForm.department && classForm.mentor) {
      const newClass = {
        ...classForm,
        id: Date.now().toString(),
        students: []
      };
      setClasses([...classes, newClass]);
      setClassForm({
        id: '',
        name: '',
        year: '',
        section: '',
        department: '',
        mentor: '',
        students: []
      });
      setShowClassModal(false);
      setNotification('Class added successfully!');
    }
  };

  const handleAddStudent = (classId: string, student: Student) => {
    setClasses(prevClasses => prevClasses.map(cls => {
      if (cls.id === classId) {
        return {
          ...cls,
          students: [...cls.students, { ...student, id: Date.now().toString() }]
        };
      }
      return cls;
    }));
    setSelectedClass(null);
    setShowStudentModal(false);
    setNotification('Student added successfully!');
  };

  const handleRemoveStudent = (classId: string, studentId: string) => {
    setClasses(prevClasses => prevClasses.map(cls => {
      if (cls.id === classId) {
        return {
          ...cls,
          students: cls.students.filter(student => student.id !== studentId)
        };
      }
      return cls;
    }));
    setNotification('Student removed successfully!');
  };

  const handleDeleteClass = (id: string) => {
    setClasses(classes.filter(c => c.id !== id));
    setNotification('Class deleted successfully!');
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          try {
            const csvData = event.target.result as string;
            const rows = csvData.split('\n');
            const students: Student[] = rows.slice(1).map(row => {
              const [id, name, rollNo, registerNo, year, section, department] = row.split(',');
              return {
                id: id?.trim() || '',
                name: name?.trim() || '',
                rollNo: rollNo?.trim() || '',
                registerNo: registerNo?.trim() || '',
                year: year?.trim() || '',
                section: section?.trim() || '',
                department: department?.trim() || ''
              };
            }).filter(student => student.id && student.name);
            setFilteredStudents(students);
            setNotification("Student data uploaded successfully!");
          } catch (error) {
            console.error('Error processing CSV file:', error);
            setNotification("Error processing CSV file. Please check the format.");
          }
        }
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    // Load forms every 5 seconds to see updates from mentors
    const loadForms = () => {
      try {
        const storedForms = localStorage.getItem('forms');
        const allForms: FormData[] = storedForms ? JSON.parse(storedForms) : [];
        
        // Check for new mentor approvals
        allForms.forEach(form => {
          if (form.mentorMessage && !lastSeenApprovals[form.id] && form.status === 'approved') {
            setNotification(`New approval from mentor: ${form.name}'s ${form.type} form`);
            setLastSeenApprovals(prev => ({ ...prev, [form.id]: true }));
          }
        });
        setForms(allForms);
      } catch (error) {
        console.error('Error loading forms:', error);
      }
    };

    loadForms(); // Initial load
    const interval = setInterval(loadForms, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [lastSeenApprovals]);

  // Total number of students (assuming each unique registration number represents a student)
  const totalStudents = new Set(forms.map(form => form.regNo)).size;

  const stats = {
    total: forms.length,
    approved: forms.filter(f => f.status === 'approved').length,
    rejected: forms.filter(f => f.status === 'rejected').length,
    od: forms.filter(f => f.type === 'od').length,
    totalStudents
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    navigate('/');
  };

  const handleStatusChange = (formId: string, status: 'approved' | 'rejected', message: string) => {
    const storedForms = localStorage.getItem('forms');
    const allForms: FormData[] = storedForms ? JSON.parse(storedForms) : [];
    const updatedForms = allForms.map(form => {
      if (form.id === formId) {
        return {
          ...form,
          status,
          adminMessage: message
        };
      }
      return form;
    });
    localStorage.setItem('forms', JSON.stringify(updatedForms));
    setForms(updatedForms);
    setNotification(`Form ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  const filteredForms = forms.filter(form => {
    if (viewType === 'all') return true;
    if (viewType === 'od') return form.type === 'od';
    return form.status === viewType;
  });

  const adminFeatures = [
    {
      icon: <Users size={24} />,
      title: 'All Forms',
      description: `Total Forms: ${stats.total}`,
      color: 'bg-blue-500',
      onClick: () => setViewType('all')
    },
    {
      icon: <BarChart3 size={24} />,
      title: 'Approved Forms',
      description: `Approved: ${stats.approved}`,
      color: 'bg-green-500',
      onClick: () => setViewType('approved')
    },
    {
      icon: <FileText size={24} />,
      title: 'OD Forms',
      description: `On Duty: ${stats.od}`,
      color: 'bg-orange-500',
      onClick: () => setViewType('od')
    },
    {
      icon: <Bell size={24} />,
      title: 'Rejected Forms',
      description: `Rejected: ${stats.rejected}`,
      color: 'bg-red-500',
      onClick: () => setViewType('rejected')
    },
    {
      icon: <Shield size={24} />,
      title: 'Class Management',
      description: `Classes: ${classes.length}`,
      color: 'bg-purple-500',
      onClick: () => setViewType('classes')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {notification && (
        <Toast
          message={notification}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Shield size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                  <p className="text-gray-400 text-sm">K.S.R. College of Engineering</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-red-400 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {viewType === 'classes' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white">Class Management</h2>
              <button
                onClick={() => setShowClassModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <FileText size={20} />
                <span>Add New Class</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.length > 0 ? classes.map(cls => (
                <div
                  key={cls.id}
                  className="bg-gray-800 rounded-xl p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-white">{cls.name}</h3>
                      <div className="text-gray-400">
                        <p>Year: {cls.year}</p>
                        <p>Section: {cls.section}</p>
                        <p>Department: {cls.department}</p>
                        <p>Mentor: {cls.mentor}</p>
                        <p className="mt-2">Total Students: {cls.students.length}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteClass(cls.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Delete Class"
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 border-t border-gray-700 pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-semibold text-gray-300">Students</h4>
                      <button
                        onClick={() => {
                          setSelectedClass(cls);
                          setShowStudentModal(true);
                        }}
                        className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                      >
                        Add Student
                      </button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {cls.students.length > 0 ? (
                        cls.students.map(student => (
                          <div key={student.id} className="flex justify-between items-center bg-gray-700/50 p-2 rounded">
                            <div className="text-sm text-gray-300">
                              <span className="font-medium">{student.name}</span>
                              <span className="text-gray-400 mx-2">•</span>
                              <span className="text-gray-400">Roll No: {student.rollNo}</span>
                            </div>
                            <button
                              onClick={() => handleRemoveStudent(cls.id, student.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Remove Student"
                            >
                              <XCircle size={16} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-2">No students added yet</p>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-3 bg-gray-800 rounded-xl p-8 text-center">
                  <p className="text-gray-400">No classes added yet. Click the "Add New Class" button to create one.</p>
                </div>
              )}
            </div>

            {showClassModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
                  <h2 className="text-2xl font-bold text-white mb-6">Add New Class</h2>
                  <form onSubmit={(e) => { e.preventDefault(); handleAddClass(); }} className="space-y-4">
                    <div>
                      <label className="text-gray-300">Class Name</label>
                      <input
                        type="text"
                        value={classForm.name}
                        onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                        className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 mt-1"
                        placeholder="e.g., CSE-A"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-gray-300">Year</label>
                      <input
                        type="text"
                        value={classForm.year}
                        onChange={(e) => setClassForm({ ...classForm, year: e.target.value })}
                        className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 mt-1"
                        placeholder="e.g., 1"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-gray-300">Section</label>
                      <input
                        type="text"
                        value={classForm.section}
                        onChange={(e) => setClassForm({ ...classForm, section: e.target.value })}
                        className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 mt-1"
                        placeholder="e.g., A"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-gray-300">Department</label>
                      <input
                        type="text"
                        value={classForm.department}
                        onChange={(e) => setClassForm({ ...classForm, department: e.target.value })}
                        className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 mt-1"
                        placeholder="e.g., Computer Science"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-gray-300">Mentor</label>
                      <input
                        type="text"
                        value={classForm.mentor}
                        onChange={(e) => setClassForm({ ...classForm, mentor: e.target.value })}
                        className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 mt-1"
                        placeholder="e.g., Prof. John Doe"
                        required
                      />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Add Class
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowClassModal(false)}
                        className="flex-1 bg-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Add Student Modal */}
            {showStudentModal && selectedClass && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
                  <h2 className="text-2xl font-bold text-white mb-2">Add Student to {selectedClass.name}</h2>
                  <p className="text-gray-400 mb-6">Enter student details below</p>
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const formData = new FormData(form);
                      const student: Student = {
                        id: '',
                        name: formData.get('name') as string,
                        rollNo: formData.get('rollNo') as string,
                        registerNo: formData.get('registerNo') as string,
                        year: selectedClass.year,
                        section: selectedClass.section,
                        department: selectedClass.department
                      };
                      handleAddStudent(selectedClass.id, student);
                      form.reset();
                    }} 
                    className="space-y-4"
                  >
                    <div>
                      <label className="text-gray-300">Student Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 mt-1"
                        placeholder="Enter student name"
                      />
                    </div>
                    <div>
                      <label className="text-gray-300">Roll Number</label>
                      <input
                        type="text"
                        name="rollNo"
                        required
                        className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 mt-1"
                        placeholder="Enter roll number"
                      />
                    </div>
                    <div>
                      <label className="text-gray-300">Register Number</label>
                      <input
                        type="text"
                        name="registerNo"
                        required
                        className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 mt-1"
                        placeholder="Enter register number"
                      />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Add Student
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedClass(null);
                          setShowStudentModal(false);
                        }}
                        className="flex-1 bg-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        ) : viewType === 'students' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white">Student Management</h2>
              <div className="flex gap-4">
                <select
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg"
                  value={selectedYear || ''}
                  onChange={(e) => setSelectedYear(e.target.value || null)}
                >
                  <option value="">All Years</option>
                  {['1', '2', '3', '4'].map(year => (
                    <option key={year} value={year}>Year {year}</option>
                  ))}
                </select>

                <select
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg"
                  value={selectedSection || ''}
                  onChange={(e) => setSelectedSection(e.target.value || null)}
                >
                  <option value="">All Sections</option>
                  {['A', 'B', 'C', 'D'].map(section => (
                    <option key={section} value={section}>Section {section}</option>
                  ))}
                </select>

                <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors">
                  <FileText size={20} />
                  <span>Upload CSV</span>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleCsvUpload}
                  />
                </label>
              </div>
            </div>

            {filteredStudents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.map(student => (
                  <div
                    key={student.id}
                    className="bg-gray-800 rounded-xl p-6"
                  >
                    <h3 className="text-xl font-semibold text-white mb-2">{student.name}</h3>
                    <div className="space-y-2 text-gray-400">
                      <p>Roll No: {student.rollNo}</p>
                      <p>Register No: {student.registerNo}</p>
                      <p>Year: {student.year}</p>
                      <p>Section: {student.section}</p>
                      <p>Department: {student.department}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-800 rounded-xl p-8 text-center">
                <p className="text-gray-400">
                  Upload a CSV file with the following columns:<br />
                  ID, Student Name, Roll No, Register No, Year, Section, Department
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {adminFeatures.map((feature, index) => (
                <div
                  key={index}
                  onClick={feature.onClick}
                  className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer group"
                >
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Forms List */}
            <div className="space-y-4">
              {filteredForms.map(form => (
                <div key={form.id} className="bg-gray-800 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xl font-semibold text-white">{form.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          form.type === 'od' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                        }`}>
                          {form.type === 'od' ? 'On Duty' : 'Leave'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusStyle(form.status)}`}>
                          {form.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        Class: {form.class} | Section: {form.section} | Reg No: {form.regNo}
                      </p>
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(form.submittedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-gray-400">From:</span>
                        <span className="text-white ml-2">{new Date(form.from).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">To:</span>
                        <span className="text-white ml-2">{new Date(form.to).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="text-gray-400">Reason:</span>
                      <p className="text-white mt-1">{form.reason}</p>
                    </div>

                    {form.mentorMessage && (
                      <div className="mb-4 pt-4 border-t border-gray-600">
                        <span className="text-gray-400">Mentor's Message:</span>
                        <p className="text-white mt-1">{form.mentorMessage}</p>
                      </div>
                    )}

                    {form.status === 'pending' && (
                      <div className="flex gap-4 mt-4">
                        <button
                          onClick={() => handleStatusChange(form.id, 'approved', 'Approved by Admin')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <CheckCircle size={20} />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(form.id, 'rejected', 'Rejected by Admin')}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <XCircle size={20} />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {filteredForms.length === 0 && (
                <div className="bg-gray-800 rounded-xl p-8 text-center">
                  <p className="text-gray-400">No {viewType} forms found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;