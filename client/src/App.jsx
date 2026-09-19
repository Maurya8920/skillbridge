import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

import Home from './pages/Home';
import ForStudents from './pages/ForStudents';
import ForRecruiters from './pages/ForRecruiters';
import Login from './pages/Login';
import Register from './pages/Register';
import JobList from './pages/JobList';
import JobDetail from './pages/JobDetail';
import ApplyJob from './pages/ApplyJob';
import MyApplications from './pages/MyApplications';
import Profile from './pages/Profile';
import StudentDashboard from './pages/StudentDashboard';

import RecruiterDashboard from './pages/recruiter/Dashboard';
import PostJob from './pages/recruiter/PostJob';
import MyPostings from './pages/recruiter/MyPostings';
import Applicants from './pages/recruiter/Applicants';
import CompanyProfile from './pages/recruiter/CompanyProfile';

import AdminStats from './pages/admin/Stats';
import AdminUsers from './pages/admin/Users';
import AdminJobs from './pages/admin/Jobs';

const homeFor = (role) => ({ student: '/dashboard', recruiter: '/recruiter', admin: '/admin' }[role] || '/jobs');

function RoleHome() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to={homeFor(user.role)} replace /> : <Home />;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0a1f] text-white">
      <Navbar />
      <main className="w-full flex-1">
        <Routes>
          <Route path="/" element={<RoleHome />} />
          <Route path="/for-students" element={<div className="mx-auto max-w-[1440px] px-6 py-10"><ForStudents /></div>} />
          <Route path="/for-recruiters" element={<div className="mx-auto max-w-[1440px] px-6 py-10"><ForRecruiters /></div>} />
          <Route path="/jobs" element={<div className="mx-auto max-w-[1440px] px-6 py-10"><JobList /></div>} />
          <Route path="/jobs/:id" element={<div className="mx-auto max-w-[1440px] px-6 py-10"><JobDetail /></div>} />
          <Route path="/login" element={<div className="mx-auto max-w-[1440px] px-6 py-12"><Login /></div>} />
          <Route path="/register" element={<div className="mx-auto max-w-[1440px] px-6 py-12"><Register /></div>} />

          {/* Student Protected Routes */}
          <Route element={<ProtectedRoute roles={['student']} />}>
            <Route path="/dashboard" element={<div className="mx-auto max-w-[1440px] px-6 py-10"><StudentDashboard /></div>} />
            <Route path="/jobs/:id/apply" element={<div className="mx-auto max-w-[1440px] px-6 py-10"><ApplyJob /></div>} />
            <Route path="/applications" element={<div className="mx-auto max-w-[1440px] px-6 py-10"><MyApplications /></div>} />
            <Route path="/profile" element={<div className="mx-auto max-w-[1440px] px-6 py-10"><Profile /></div>} />
          </Route>

          {/* Recruiter Protected Routes */}
          <Route element={<ProtectedRoute roles={['recruiter']} />}>
            <Route path="/recruiter" element={<div className="mx-auto max-w-[1440px] px-6 py-10"><RecruiterDashboard /></div>} />
            <Route path="/recruiter/post" element={<div className="mx-auto max-w-[1440px] px-6 py-10"><PostJob /></div>} />
            <Route path="/recruiter/jobs" element={<div className="mx-auto max-w-[1440px] px-6 py-10"><MyPostings /></div>} />
            <Route path="/recruiter/jobs/:id/edit" element={<div className="mx-auto max-w-[1440px] px-6 py-10"><PostJob /></div>} />
            <Route path="/recruiter/jobs/:id/applicants" element={<div className="mx-auto max-w-[1440px] px-6 py-10"><Applicants /></div>} />
            <Route path="/recruiter/company" element={<div className="mx-auto max-w-[1440px] px-6 py-10"><CompanyProfile /></div>} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/admin" element={<div className="mx-auto max-w-[1440px] px-6 py-10"><AdminStats /></div>} />
            <Route path="/admin/users" element={<div className="mx-auto max-w-[1440px] px-6 py-10"><AdminUsers /></div>} />
            <Route path="/admin/jobs" element={<div className="mx-auto max-w-[1440px] px-6 py-10"><AdminJobs /></div>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="border-t border-white/10 py-6 text-center text-xs text-[#c9c6e0]/60 bg-[#0b0a1f]/80">
        SkillBridge · Autonomous AI Internship & Job Platform
      </footer>
    </div>
  );
}

export { homeFor };
