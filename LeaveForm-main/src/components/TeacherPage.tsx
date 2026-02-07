import React, { useState, useEffect } from 'react';
import { ArrowLeft, GraduationCap, Users, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getForms, type FormData, getStudents, addStudent, type Student, updateFormStatus, deleteStudent, isRecent } from '../utils/formStore';

const TeacherPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [forms, setForms] = useState<FormData[]>([]);
  const [showManageStudents, setShowManageStudents] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [newStudent, setNewStudent] = useState({
    name: '',
    regNo: '',
    dob: ''
  });



  useEffect(() => {
    const fetchData = async () => {
      const loadedForms = await getForms();
      const loadedStudents = await getStudents();
      setForms(loadedForms);
      setStudents(loadedStudents);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const pendingFormsInSection = forms.filter(f =>
    f.class === `${selectedYear} year` &&
    f.section === selectedSection &&
    f.status === 'pending'
  );

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedYear || !selectedSection) return;

    const result = await addStudent({
      ...newStudent,
      class: `${selectedYear} year`,
      section: selectedSection
    });

    if (result && result.id) {
      setStudents(prev => [...prev, result]);
      setNewStudent({ name: '', regNo: '', dob: '' });
      alert('Student added successfully');
    } else {
      alert(`Error: ${result?.error || 'Failed to add student'}`);
    }
  };

  const handleFormAction = async (formId: string, action: 'mentor_approved' | 'approved' | 'rejected') => {
    const updated = await updateFormStatus(formId, action, undefined, true); // true for mentor
    if (updated && updated.id) {
      setForms(prev => prev.map(f => f.id === formId ? updated : f));
    } else {
      alert(`Error: ${updated?.error || 'Failed to update form status'}`);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    console.log('Attempting to delete student with ID:', studentId); // Debug log
    if (window.confirm('Are you sure you want to delete this student?')) {
      const success = await deleteStudent(studentId);
      if (success) {
        setStudents(prev => prev.filter(s => s.id !== studentId));
        alert('Student deleted successfully');
      } else {
        alert('Failed to delete student. Please make sure the student exists in the database.');
      }
    }
  };

  const renderFormItem = (form: FormData) => (
    <div key={form.id} className="bg-gray-700/30 border border-gray-600/50 rounded-xl p-6 hover:bg-gray-700/50 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">{form.name}</h4>
          <p className="text-gray-400 text-sm">Reg No: {form.regNo}</p>
        </div>
        {form.status === 'pending' ? (
          <div className="flex gap-2">
            <button
              onClick={() => handleFormAction(form.id, 'mentor_approved')}
              className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-all duration-200 border border-green-500/30"
              title="Approve and send to Admin"
            >
              <CheckCircle size={20} />
            </button>
            <button
              onClick={() => handleFormAction(form.id, 'rejected')}
              className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-200 border border-red-500/30"
            >
              <XCircle size={20} />
            </button>
          </div>
        ) : (
          <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${form.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
            }`}>
            {form.status.replace('_', ' ')}
          </div>
        )}
      </div>
      <div className="bg-gray-900/30 rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">From Date</p>
            <p className="text-white text-sm font-medium">{new Date(form.from).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">To Date</p>
            <p className="text-white text-sm font-medium">{new Date(form.to).toLocaleDateString()}</p>
          </div>
        </div>
        <div>
          <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Reason</p>
          <p className="text-gray-300 text-sm leading-relaxed italic">"{form.reason}"</p>
        </div>
        <div className="flex gap-2 pt-2">
          {form.status === 'mentor_approved' && (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Pending Admin
            </span>
          )}
          {form.status === 'approved' && form.updatedAt && (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1">
              <CheckCircle size={12} /> Approved: {new Date(form.updatedAt).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const years = [
    {
      title: '1 Year',
      description: 'First Year Students',
      color: 'bg-blue-500',
      value: '1'
    },
    {
      title: '2 Year',
      description: 'Second Year Students',
      color: 'bg-green-500',
      value: '2'
    },
    {
      title: '3 Year',
      description: 'Third Year Students',
      color: 'bg-purple-500',
      value: '3'
    },
    {
      title: '4 Year',
      description: 'Fourth Year Students',
      color: 'bg-orange-500',
      value: '4'
    }
  ];

  const sections = [
    {
      title: 'Section A',
      description: 'Students in Section A',
      color: 'bg-red-500'
    },
    {
      title: 'Section B',
      description: 'Students in Section B',
      color: 'bg-indigo-500'
    },
    {
      title: 'Section C',
      description: 'Students in Section C',
      color: 'bg-pink-500'
    },
    {
      title: 'Section D',
      description: 'Students in Section D',
      color: 'bg-teal-500'
    }
  ];

  const handleYearClick = (yearValue: string) => {
    setSelectedYear(yearValue);
  };

  const handleBackToYears = () => {
    setSelectedYear(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <GraduationCap size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-white">Teacher Dashboard</h1>
                <p className="text-gray-400 text-xs text-nowrap">K.S.R. COLLEGE OF ENGINEERING</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {!selectedYear ? (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome, Mentor</h2>
              <p className="text-gray-400">Select a year to manage students</p>
            </div>

            {/* Year Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {years.map((year, index) => (
                <div
                  key={index}
                  onClick={() => handleYearClick(year.value)}
                  className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer group"
                >
                  <div className={`w-16 h-16 ${year.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 mx-auto`}>
                    <GraduationCap size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 text-center">{year.title}</h3>
                  <p className="text-gray-400 text-center">{year.description}</p>
                </div>
              ))}
            </div>
          </>
        ) : !selectedSection ? (
          <>
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={handleBackToYears}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-3xl font-bold text-white">{selectedYear} Year Sections</h2>
              </div>
              <p className="text-gray-400">Select a section to manage students</p>
            </div>

            {/* Section Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {sections.map((section, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedSection(section.title.split(' ')[1])}
                  className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer group"
                >
                  <div className={`w-16 h-16 ${section.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 mx-auto`}>
                    <Users size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 text-center">{section.title}</h3>
                  <p className="text-gray-400 text-center">{section.description}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setSelectedSection(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
              >
                <ArrowLeft size={20} />
              </button>
              <h3 className="text-2xl font-bold text-white">
                {selectedYear} Year Section {selectedSection}
              </h3>
              <div className="ml-auto">
                <button
                  onClick={() => setShowManageStudents(!showManageStudents)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Users size={20} />
                  {showManageStudents ? 'View Forms' : 'Manage Students'}
                </button>
              </div>
            </div>

            {pendingFormsInSection.length > 0 && (
              <div className="mb-6 bg-yellow-500/10 border border-yellow-500/50 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-yellow-500">
                  <CheckCircle size={24} className="animate-pulse" />
                  <div>
                    <p className="font-bold text-lg">New Leave Requests!</p>
                    <p className="text-sm opacity-90">You have {pendingFormsInSection.length} pending form(s) to review in this section.</p>
                  </div>
                </div>
                {!showManageStudents ? (
                  <span className="text-yellow-500 text-sm font-medium">Scroll down to review</span>
                ) : (
                  <button
                    onClick={() => setShowManageStudents(false)}
                    className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors"
                  >
                    Go to Forms
                  </button>
                )}
              </div>
            )}

            {showManageStudents ? (
              <div className="space-y-8">
                {/* Add Student Form */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-white mb-4">Add New Student</h4>
                  <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                      type="text"
                      placeholder="Name"
                      value={newStudent.name}
                      onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                      className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Register Number"
                      value={newStudent.regNo}
                      onChange={e => setNewStudent({ ...newStudent, regNo: e.target.value })}
                      className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                      required
                    />
                    <input
                      type="date"
                      placeholder="Date of Birth"
                      value={newStudent.dob}
                      onChange={e => setNewStudent({ ...newStudent, dob: e.target.value })}
                      className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                    >
                      Add Student
                    </button>
                  </form>
                </div>

                {/* Students List */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-white mb-4">Student List</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-gray-300">
                      <thead className="text-gray-400 border-b border-gray-700">
                        <tr>
                          <th className="py-3 px-4">Name</th>
                          <th className="py-3 px-4">Register Number</th>
                          <th className="py-3 px-4">DOB</th>
                          <th className="py-3 px-4 text-center">Leave Balance</th>
                          <th className="py-3 px-4 text-center">All Forms</th>
                          <th className="py-3 px-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students
                          .filter(s => s.class === `${selectedYear} year` && s.section === selectedSection)
                          .map((student) => (
                            <tr key={student.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                              <td className="py-3 px-4">{student.name}</td>
                              <td className="py-3 px-4">{student.regNo}</td>
                              <td className="py-3 px-4">{new Date(student.dob).toLocaleDateString()}</td>
                              <td className="py-3 px-4 text-center">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${student.leaveBalance > 5 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                  }`}>
                                  {student.leaveBalance}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-col gap-1 items-center text-[10px] font-bold uppercase tracking-wider">
                                  {forms.filter(f => f.regNo === student.regNo).length === 0 ? (
                                    <span className="text-gray-600">-</span>
                                  ) : (
                                    <>
                                      {forms.filter(f => f.regNo === student.regNo && (f.status === 'pending' || f.status === 'mentor_approved')).length > 0 &&
                                        <span className="text-yellow-400">{forms.filter(f => f.regNo === student.regNo && (f.status === 'pending' || f.status === 'mentor_approved')).length} Pending</span>
                                      }
                                      {forms.filter(f => f.regNo === student.regNo && f.status === 'approved').length > 0 &&
                                        <span className="text-green-400">{forms.filter(f => f.regNo === student.regNo && f.status === 'approved').length} Approved</span>
                                      }
                                      {forms.filter(f => f.regNo === student.regNo && (f.status === 'rejected')).length > 0 &&
                                        <span className="text-red-400">{forms.filter(f => f.regNo === student.regNo && (f.status === 'rejected')).length} Rejected</span>
                                      }
                                    </>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <button
                                  onClick={() => handleDeleteStudent(student.id)}
                                  className="text-red-400 hover:text-red-300 transition-colors p-1"
                                  title="Delete Student"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        {students.filter(s => s.class === `${selectedYear} year` && s.section === selectedSection).length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-gray-500">
                              No students added yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Leave Forms Box */}
                <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
                  <div className="flex items-center gap-2 mb-6 text-green-400 border-b border-gray-700 pb-4">
                    <div className="w-2 h-6 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    <h4 className="text-xl font-bold uppercase tracking-widest italic">Active Leave Forms</h4>
                    <span className="ml-auto bg-green-500/10 border border-green-500/30 px-3 py-1 rounded-full text-xs font-bold">
                      {forms.filter(f => f.class === `${selectedYear} year` && f.section === selectedSection && f.type === 'leave' && f.status !== 'approved' || (f.status === 'approved' && isRecent(f.updatedAt))).length}
                    </span>
                  </div>

                  <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {forms
                      .filter(form => form.class === `${selectedYear} year` && form.section === selectedSection && form.type === 'leave' && form.status !== 'approved' || (form.status === 'approved' && isRecent(form.updatedAt)))
                      .map((form) => renderFormItem(form))}
                    {forms.filter(f => f.class === `${selectedYear} year` && f.section === selectedSection && f.type === 'leave' && f.status !== 'approved' || (f.status === 'approved' && isRecent(f.updatedAt))).length === 0 && (
                      <div className="text-center py-20 text-gray-500 bg-gray-900/40 rounded-2xl border-2 border-dashed border-gray-700">
                        <p className="text-lg font-medium">No Active Leaves</p>
                        <p className="text-xs mt-2 opacity-50 italic">New submissions will appear here</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* OD Forms Box */}
                <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
                  <div className="flex items-center gap-2 mb-6 text-blue-400 border-b border-gray-700 pb-4">
                    <div className="w-2 h-6 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    <h4 className="text-xl font-bold uppercase tracking-widest italic">Active OD Forms</h4>
                    <span className="ml-auto bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold">
                      {forms.filter(f => f.class === `${selectedYear} year` && f.section === selectedSection && f.type === 'od' && f.status !== 'approved' || (f.status === 'approved' && isRecent(f.updatedAt))).length}
                    </span>
                  </div>

                  <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {forms
                      .filter(form => form.class === `${selectedYear} year` && form.section === selectedSection && form.type === 'od' && form.status !== 'approved' || (form.status === 'approved' && isRecent(form.updatedAt)))
                      .map((form) => renderFormItem(form))}
                    {forms.filter(f => f.class === `${selectedYear} year` && f.section === selectedSection && f.type === 'od' && f.status !== 'approved' || (f.status === 'approved' && isRecent(f.updatedAt))).length === 0 && (
                      <div className="text-center py-20 text-gray-500 bg-gray-900/40 rounded-2xl border-2 border-dashed border-gray-700">
                        <p className="text-lg font-medium">No Active ODs</p>
                        <p className="text-xs mt-2 opacity-50 italic">New submissions will appear here</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* APPROVED HISTORY BOX */}
                <div className="lg:col-span-2 bg-gray-900/60 border-2 border-indigo-500/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl mt-8">
                  <div className="flex items-center gap-4 mb-8 text-indigo-400 border-b border-gray-800 pb-6">
                    <div className="w-4 h-10 bg-indigo-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
                    <h4 className="text-2xl font-black uppercase tracking-tighter italic">Approved Records Store</h4>
                    <span className="ml-auto bg-indigo-500/10 border border-indigo-500/30 px-4 py-2 rounded-xl text-lg font-black tracking-tighter">
                      {forms.filter(f => f.class === `${selectedYear} year` && f.section === selectedSection && f.status === 'approved').length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                    {forms
                      .filter(form => form.class === `${selectedYear} year` && form.section === selectedSection && form.status === 'approved')
                      .map((form) => (
                        <div key={form.id} className="bg-gray-800/80 border border-indigo-500/10 rounded-2xl p-5 hover:border-indigo-500/30 transition-all shadow-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <h5 className="font-bold text-white uppercase text-sm">{form.name}</h5>
                            <CheckCircle className="text-green-500 ml-auto" size={16} />
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold mb-3">
                            <span className="bg-gray-900 px-2 py-1 rounded">FROM: {new Date(form.from).toLocaleDateString()}</span>
                          </div>
                          <div className="bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/5">
                            <p className="text-[10px] text-indigo-400 font-black uppercase">Admin Status</p>
                            <p className="text-[11px] text-indigo-200 mt-1 italic">Stored in Approved History</p>
                          </div>
                        </div>
                      ))}
                    {forms.filter(f => f.class === `${selectedYear} year` && f.section === selectedSection && f.status === 'approved').length === 0 && (
                      <div className="col-span-full py-12 text-center text-gray-600 font-bold italic opacity-50">
                        Queue is empty
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherPage;