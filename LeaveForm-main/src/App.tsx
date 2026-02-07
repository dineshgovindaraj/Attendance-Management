import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Users, GraduationCap, BookOpen, Shield, ChevronRight } from 'lucide-react';
import AdminPage from './components/AdminPage';
import TeacherPage from './components/TeacherPage';
import StudentPage from './components/StudentPage';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedMentorRoute from './components/ProtectedMentorRoute';

interface RoleCardProps {
  role: string;
  name: string;
  description: string;
  avatar: string;
  color: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({
  role,
  name,
  description,
  avatar,
  color,
  icon,
  onClick
}) => {
  return (
    <div className="bg-gray-800 rounded-2xl p-6 text-white relative overflow-hidden group hover:transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10 transform rotate-12 translate-x-8 -translate-y-8">
        <div className={`w-full h-full ${color} rounded-full`}></div>
      </div>


      {/* Avatar and role icon */}
      <div className="flex flex-col items-center mt-4 mb-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gray-600 mb-2">
            <img
              src={avatar}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className={`absolute -bottom-1 -right-1 w-8 h-8 ${color} rounded-full flex items-center justify-center`}>
            {icon}
          </div>
        </div>

        <h3 className="text-xl font-bold text-center">{name}</h3>
        <p className="text-gray-300 text-center mt-2 font-medium">{description}</p>
      </div>

      {/* Action button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={onClick}
          className={`w-12 h-12 ${color} rounded-full flex items-center justify-center hover:opacity-90 transition-all duration-300 hover:scale-110`}
        >
          <ChevronRight size={20} className="text-white" />
        </button>
      </div>

    </div>
  );
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const roles = [
    {
      role: 'ADMIN',
      name: 'Admin',
      description: 'System Administrator',
      avatar: 'https://images',
      color: 'bg-blue-500',
      icon: <Shield size={16} className="text-white" />,
      onClick: () => navigate('/login')
    },
    {
      role: 'TEACHER',
      name: 'Mentor',
      description: 'Class Mentor',
      avatar: 'https://images',
      color: 'bg-green-500',
      icon: <GraduationCap size={16} className="text-white" />,
      onClick: () => navigate('/mentor-login')
    },
    {
      role: 'STUDENT',
      name: 'Student',
      description: 'Computer Science Student',
      avatar: 'https://images',
      color: 'bg-orange-500',
      icon: <BookOpen size={16} className="text-white" />,
      onClick: () => navigate('/student')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="text-center py-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Users className="text-blue-400" size={32} />
          <h1 className="text-2xl md:text-4xl font-bold text-white">K.S.R. COLLEGE OF ENGINEERING</h1>
        </div>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto px-6">
          Connect and collaborate with administrators, teachers, and students in our comprehensive educational platform
        </p>
      </div>

      {/* Role cards */}
      <div className="container mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {roles.map((role, index) => (
            <RoleCard key={index} {...role} />
          ))}
        </div>
      </div>

      {/* Footer stats */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-t border-gray-700">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">15+</div>
              <div className="text-gray-400">Active Administrators</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">120+</div>
              <div className="text-gray-400">Certified Teachers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">2,500+</div>
              <div className="text-gray-400">Enrolled Students</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage userType="admin" />} />
        <Route path="/mentor-login" element={<LoginPage userType="mentor" />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher"
          element={
            <ProtectedMentorRoute>
              <TeacherPage />
            </ProtectedMentorRoute>
          }
        />
        <Route path="/student" element={<StudentPage />} />
      </Routes>
    </Router>
  );
}

export default App;