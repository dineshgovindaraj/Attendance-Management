import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Users, BarChart3, FileText, Bell, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getForms, updateFormStatus, type FormData, updateStudentLeaveBalance, getStudents, type Student as DbStudent, isRecent } from '../utils/formStore';

// Toast notification component
const Toast = ({ message, onClose }: { message: string | null; onClose: () => void }) => {
  if (!message) return null;
  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in hover:shadow-xl transition-shadow z-50 subpixel-antialiased border border-white/10">
      <CheckCircle size={20} />
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:bg-green-600 rounded-full p-1 transition-colors">
        <XCircle size={16} />
      </button>
    </div>
  );
};

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState<FormData[]>([]);
  const [viewType, setViewType] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'od' | 'students' | 'classes'>('all');
  const [notification, setNotification] = useState<string | null>(null);
  const [dbStudents, setDbStudents] = useState<DbStudent[]>([]);
  const [adminSelectedYear, setAdminSelectedYear] = useState<string | null>(null);
  const [adminSelectedSection, setAdminSelectedSection] = useState<string | null>(null);

  // Fetch live student data from backend
  const refreshData = async () => {
    try {
      const allStudents = await getStudents();
      setDbStudents(allStudents);
      const allForms = await getForms();
      setForms(allForms);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  const years = [
    { title: '1st Year', value: '1', color: 'bg-blue-500' },
    { title: '2nd Year', value: '2', color: 'bg-green-500' },
    { title: '3rd Year', value: '3', color: 'bg-purple-500' },
    { title: '4th Year', value: '4', color: 'bg-orange-500' }
  ];

  const sections = ['A', 'B', 'C', 'D'];

  const stats = {
    total: forms.length,
    approved: forms.filter(f => f.status === 'approved').length,
    rejected: forms.filter(f => f.status === 'rejected').length,
    od: forms.filter(f => f.type === 'od').length,
    pending: forms.filter(f => f.status === 'mentor_approved').length,
    totalStudents: dbStudents.length
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    navigate('/');
  };

  const handleStatusChange = async (formId: string, status: 'approved' | 'rejected', message: string) => {
    const updatedForm = await updateFormStatus(formId, status, message, false);
    if (updatedForm) {
      if (status === 'approved' && updatedForm.type === 'leave') {
        const start = new Date(updatedForm.from);
        const end = new Date(updatedForm.to);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        await updateStudentLeaveBalance(updatedForm.regNo, diffDays);
      }
      refreshData();
      setNotification(`Form ${status} successfully`);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      case 'mentor_approved': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  const filteredForms = forms.filter(form => {
    if (viewType === 'all') return (form.status !== 'approved' && form.status !== 'rejected') || (form.status === 'approved' && isRecent(form.updatedAt));
    if (viewType === 'od') return form.type === 'od' && (form.status !== 'approved' || (form.status === 'approved' && isRecent(form.updatedAt)));
    if (viewType === 'pending') return form.status === 'mentor_approved' || form.status === 'pending';
    if (viewType === 'approved') return form.status === 'approved' && isRecent(form.updatedAt);
    return form.status === viewType;
  });

  const adminFeatures = [
    { icon: <Users size={24} />, title: 'All Forms', description: `Total: ${stats.total}`, color: 'bg-blue-500', onClick: () => setViewType('all') },
    { icon: <BarChart3 size={24} />, title: 'Pending', description: `Actionable: ${stats.pending}`, color: 'bg-purple-500', onClick: () => setViewType('pending') },
    { icon: <CheckCircle size={24} />, title: 'Approved', description: `Approved: ${stats.approved}`, color: 'bg-green-500', onClick: () => setViewType('approved') },
    { icon: <FileText size={24} />, title: 'OD Forms', description: `On Duty: ${stats.od}`, color: 'bg-orange-500', onClick: () => setViewType('od') },
    { icon: <Shield size={24} />, title: 'Class Management', description: `Live Stats`, color: 'bg-teal-500', onClick: () => setViewType('classes') },
    { icon: <Users size={24} />, title: 'Database', description: `Total: ${stats.totalStudents}`, color: 'bg-pink-500', onClick: () => setViewType('students') }
  ];

  const handleBackToYears = () => setAdminSelectedYear(null);
  const handleBackToSections = () => setAdminSelectedSection(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-sm">
      {notification && <Toast message={notification} onClose={() => setNotification(null)} />}

      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button onClick={() => navigate('/')} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all"><ArrowLeft size={20} /></button>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-white flex items-center gap-2"><Shield size={20} className="text-blue-500" /> Admin Portal</h1>
              <p className="text-gray-400 text-[10px] md:text-xs uppercase tracking-widest mt-0.5 whitespace-nowrap">K.S.R. COLLEGE OF ENGINEERING</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full sm:w-auto px-4 py-2 text-red-400 hover:text-white hover:bg-red-500 border border-red-500/30 rounded-lg transition-all text-sm font-bold">Logout</button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Features Navigation - COMPACT */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {adminFeatures.map((f, i) => (
            <div key={i} onClick={f.onClick} className={`p-5 rounded-2xl cursor-pointer transition-all hover:scale-105 ${viewType === f.title.toLowerCase().split(' ')[0] ? 'bg-gray-700 ring-2 ring-blue-500' : 'bg-gray-800 hover:bg-gray-750'}`}>
              <div className={`w-10 h-10 ${f.color} rounded-xl flex items-center justify-center mb-3 shadow-lg`}>{f.icon}</div>
              <h3 className="font-bold text-white text-sm mb-1">{f.title}</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{f.description}</p>
            </div>
          ))}
        </div>

        {viewType === 'classes' ? (
          <div className="space-y-6">
            {!adminSelectedYear ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {years.map((y, i) => (
                  <div key={i} onClick={() => setAdminSelectedYear(y.value)} className="bg-gray-800 rounded-3xl p-8 hover:bg-gray-750 cursor-pointer border border-gray-700 transition-all group">
                    <div className={`w-12 h-12 ${y.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Users size={24} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{y.title}</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold opacity-60">Select Year</p>
                  </div>
                ))}
              </div>
            ) : !adminSelectedSection ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <button onClick={handleBackToYears} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700"><ArrowLeft size={20} /></button>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Year {adminSelectedYear} - Sections</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {sections.map((sec, i) => (
                    <div key={i} onClick={() => setAdminSelectedSection(sec)} className="bg-gray-800 rounded-3xl p-8 hover:bg-gray-750 cursor-pointer border border-gray-700 transition-all flex flex-col items-center group">
                      <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mb-4 text-2xl font-black group-hover:bg-blue-500 group-hover:text-white transition-all">
                        {sec}
                      </div>
                      <h3 className="font-bold text-white">Section {sec}</h3>
                      <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-widest">
                        {dbStudents.filter(s => s.class === `${adminSelectedYear} year` && s.section === sec).length} Students
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <button onClick={handleBackToSections} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700"><ArrowLeft size={20} /></button>
                  <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Year {adminSelectedYear} - Section {adminSelectedSection}</h1>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-x-auto shadow-xl">
                  <table className="w-full text-left">
                    <thead className="bg-gray-700/50 text-[10px] uppercase font-bold tracking-widest text-gray-400 h-12">
                      <tr><th className="px-6">Name</th><th className="px-6">Reg No</th><th className="px-6 text-center">Leaves</th><th className="px-6 text-right">Status</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                      {dbStudents.filter(s => s.class === `${adminSelectedYear} year` && s.section === adminSelectedSection).map(s => (
                        <tr key={s.id} className="hover:bg-gray-700/30 h-14 group">
                          <td className="px-6 font-bold text-white uppercase">{s.name}</td>
                          <td className="px-6 text-gray-400 font-mono italic">{s.regNo}</td>
                          <td className="px-6 text-center">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${s.leaveBalance > 5 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                              {s.leaveBalance} DAYS
                            </span>
                          </td>
                          <td className="px-6 text-right italic text-[10px] text-gray-600 font-bold uppercase tracking-widest">Mentor Managed</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {dbStudents.filter(s => s.class === `${adminSelectedYear} year` && s.section === adminSelectedSection).length === 0 && (
                    <div className="py-20 text-center text-gray-600 italic uppercase tracking-widest font-bold">Roster Empty</div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : viewType === 'students' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Student Database</h2>
              <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
                <span className="text-gray-400 text-xs font-bold uppercase">Total Students: </span>
                <span className="text-blue-400 font-bold">{dbStudents.length}</span>
              </div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-x-auto shadow-xl">
              <table className="w-full text-left">
                <thead className="bg-gray-700/50 text-[10px] uppercase font-bold tracking-widest text-gray-400 h-12">
                  <tr>
                    <th className="px-6">Name</th>
                    <th className="px-6">Reg No</th>
                    <th className="px-6">Class & Section</th>
                    <th className="px-6 text-center">Leave Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {dbStudents.map(s => (
                    <tr key={s.id} className="hover:bg-gray-700/30 h-14">
                      <td className="px-6 font-bold text-white uppercase">{s.name}</td>
                      <td className="px-6 text-gray-400 font-mono">{s.regNo}</td>
                      <td className="px-6 text-gray-300 font-medium uppercase text-xs">{s.class} - {s.section}</td>
                      <td className="px-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${s.leaveBalance > 5 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                          {s.leaveBalance} DAYS
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {dbStudents.length === 0 && (
                <div className="py-20 text-center text-gray-600 italic uppercase tracking-widest font-bold">Database is Empty</div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 max-w-4xl mx-auto">
            {filteredForms.map(form => (
              <div key={form.id} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${form.type === 'od' ? 'bg-blue-600' : 'bg-green-600'}`}>
                      {form.type === 'od' ? <FileText size={24} /> : <Bell size={24} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-bold text-white uppercase">{form.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${getStatusStyle(form.status)}`}>{form.status.replace('_', ' ')}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-widest">{form.class} | Section {form.section} | REG: {form.regNo}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase opacity-50">{new Date(form.submittedAt).toLocaleDateString()}</p>
                </div>

                <div className="bg-gray-900 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex gap-8">
                      <div><p className="text-[9px] text-gray-500 font-bold uppercase mb-1 tracking-widest">From</p><p className="text-white font-bold">{new Date(form.from).toLocaleDateString()}</p></div>
                      <div><p className="text-[9px] text-gray-500 font-bold uppercase mb-1 tracking-widest">To</p><p className="text-white font-bold">{new Date(form.to).toLocaleDateString()}</p></div>
                    </div>
                    <div className="pt-4 border-t border-gray-800"><p className="text-[9px] text-gray-500 font-bold uppercase mb-1 tracking-widest">Reason</p><p className="text-sm text-gray-400 italic">"{form.reason}"</p></div>
                  </div>

                  <div className="flex flex-col justify-between">
                    {form.mentorMessage && (
                      <div className="bg-purple-500/5 border border-purple-500/10 p-4 rounded-xl mb-4">
                        <p className="text-[9px] text-purple-400 font-bold uppercase mb-1 tracking-widest">Mentor Remark</p>
                        <p className="text-xs text-purple-200 italic leading-relaxed">"{form.mentorMessage}"</p>
                      </div>
                    )}

                    {form.status === 'mentor_approved' ? (
                      <div className="flex gap-3 mt-auto">
                        <button onClick={() => handleStatusChange(form.id, 'approved', 'Final Approval')} className="flex-1 bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                          <CheckCircle size={16} /> APPROVE
                        </button>
                        <button onClick={() => handleStatusChange(form.id, 'rejected', 'Final Rejection')} className="flex-1 bg-red-600/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                          <XCircle size={16} /> REJECT
                        </button>
                      </div>
                    ) : (
                      <div className="mt-auto bg-gray-800/50 p-4 rounded-xl text-center border border-gray-700/50">
                        <p className="text-[8px] text-gray-600 font-bold uppercase tracking-[0.2em]">
                          {form.status === 'pending' ? '⏳ Mentor Review' : form.status === 'approved' && form.updatedAt ? `✔️ Approved: ${new Date(form.updatedAt).toLocaleDateString()}` : '✔️ Complete'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredForms.length === 0 && (
              <div className="text-center py-20 bg-gray-800/20 rounded-2xl border-2 border-dashed border-gray-700 opacity-50 italic uppercase tracking-widest font-bold text-xs">Queue Cleared</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;