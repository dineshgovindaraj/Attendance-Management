import React, { useState } from 'react';
import { ArrowLeft, BookOpen, FileText, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { addForm } from '../utils/formStore';

const StudentPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeForm, setActiveForm] = useState<'none' | 'od' | 'leave'>('none');
  const [formData, setFormData] = useState({
    name: '',
    regNo: '',
    class: '',
    section: '',
    from: '',
    to: '',
    reason: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formType = activeForm;
    addForm({
      type: formType,
      ...formData
    });
    alert('Form submitted successfully! Your mentor will review it.');
    setFormData({
      name: '',
      regNo: '',
      class: '',
      section: '',
      from: '',
      to: '',
      reason: ''
    });
    setActiveForm('none');
  };

  const studentFeatures = [
    {
      icon: <Calendar size={24} />,
      title: 'OD FORM',
      description: 'Apply for On Duty permission',
      color: 'bg-blue-500',
      onClick: () => setActiveForm('od')
    },
    {
      icon: <FileText size={24} />,
      title: 'LEAVE FORM',
      description: 'Apply for leave from college',
      color: 'bg-green-500',
      onClick: () => setActiveForm('leave')
    }
  ];

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
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <BookOpen size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Student Dashboard</h1>
                <p className="text-gray-400 text-sm">K.S.R. College of Engineering</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {activeForm === 'none' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome, Student</h2>
              <p className="text-gray-400">Apply for permissions and leave requests</p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {studentFeatures.map((feature, index) => (
                <div
                  key={index}
                  onClick={feature.onClick}
                  className="bg-gray-800 rounded-xl p-8 hover:bg-gray-750 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer group"
                >
                  <div className={`w-16 h-16 ${feature.color} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3 text-center">{feature.title}</h3>
                  <p className="text-gray-400 text-center">{feature.description}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Leave Form */}
        {activeForm === 'leave' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setActiveForm('none')}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-bold text-white">Leave Application Form</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Registration Number</label>
                  <input
                    type="text"
                    name="regNo"
                    value={formData.regNo}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Class</label>
                    <select
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                      required
                    >
                      <option value="">Select Class</option>
                      <option value="1 year">1 year</option>
                      <option value="2 year">2 year</option>
                      <option value="3 year">3 year</option>
                      <option value="4 year">4 year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Section</label>
                    <select
                      name="section"
                      value={formData.section}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                      required
                    >
                      <option value="">Select Section</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">From</label>
                    <input
                      type="date"
                      name="from"
                      value={formData.from}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">To</label>
                    <input
                      type="date"
                      name="to"
                      value={formData.to}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Reason</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                    placeholder="Please provide the reason for your leave..."
                    required
                  />
                </div>

                <div className="text-center">
                  <p className="text-gray-300 mb-4">Respect Mam</p>
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* OD Form */}
        {activeForm === 'od' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setActiveForm('none')}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-bold text-white">On Duty Application Form</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Registration Number</label>
                  <input
                    type="text"
                    name="regNo"
                    value={formData.regNo}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Class</label>
                    <select
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      required
                    >
                      <option value="">Select Class</option>
                      <option value="1 year">1 year</option>
                      <option value="2 year">2 year</option>
                      <option value="3 year">3 year</option>
                      <option value="4 year">4 year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Section</label>
                    <select
                      name="section"
                      value={formData.section}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      required
                    >
                      <option value="">Select Section</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">From</label>
                    <input
                      type="date"
                      name="from"
                      value={formData.from}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">To</label>
                    <input
                      type="date"
                      name="to"
                      value={formData.to}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Purpose</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="Please provide the purpose for OD..."
                    required
                  />
                </div>

                <div className="text-center">
                  <p className="text-gray-300 mb-4">Respect Mam</p>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPage;