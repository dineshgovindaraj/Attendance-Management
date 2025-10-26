import React, { useState, useEffect } from 'react';
import { ArrowLeft, GraduationCap, Users, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getForms, saveForms, FormData } from '../utils/formStore';

const TeacherPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [forms, setForms] = useState<FormData[]>([]);

  useEffect(() => {
    setForms(getForms());
  }, []);

  const handleFormAction = (formId: string, action: 'approved' | 'rejected') => {
    const updatedForms = forms.map(form => 
      form.id === formId ? { ...form, status: action } : form
    );
    saveForms(updatedForms);
    setForms(updatedForms);
  };

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
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
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
                <h1 className="text-xl font-bold text-white">Teacher Dashboard</h1>
                <p className="text-gray-400 text-sm">K.S.R. College of Engineering</p>
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
        ) : (
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

            {/* Forms List */}
            {selectedSection && (
              <div className="mt-8">
                <h3 className="text-2xl font-bold text-white mb-6">Pending Forms - {selectedYear} Year Section {selectedSection}</h3>
                <div className="grid gap-6">
                  {forms
                    .filter(form => form.class === `${selectedYear} year` && form.section === selectedSection)
                    .map((form) => (
                      <div key={form.id} className="bg-gray-800 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-xl font-semibold text-white">{form.name}</h4>
                            <p className="text-gray-400">Reg No: {form.regNo}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleFormAction(form.id, 'approved')}
                              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                              <CheckCircle size={20} />
                            </button>
                            <button
                              onClick={() => handleFormAction(form.id, 'rejected')}
                              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                              <XCircle size={20} />
                            </button>
                          </div>
                        </div>
                        <div className="bg-gray-700/50 rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-gray-400">From</p>
                              <p className="text-white">{new Date(form.from).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">To</p>
                              <p className="text-white">{new Date(form.to).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-400">Reason</p>
                            <p className="text-white">{form.reason}</p>
                          </div>
                          <div className="mt-4">
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              form.type === 'od' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                            }`}>
                              {form.type === 'od' ? 'On Duty' : 'Leave'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherPage;