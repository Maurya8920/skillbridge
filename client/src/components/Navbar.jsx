import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from './ConfirmDialog';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Define role links strictly for the logged-in user
  const getRoleLinks = () => {
    if (!user) return [];
    if (user.role === 'student') {
      return [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Browse Jobs', path: '/jobs' },
        { label: 'My Applications', path: '/applications' },
        { label: 'Profile', path: '/profile' },
      ];
    }
    if (user.role === 'recruiter') {
      return [
        { label: 'Dashboard', path: '/recruiter' },
        { label: 'My Postings', path: '/recruiter/jobs' },
        { label: 'Post Job', path: '/recruiter/post' },
        { label: 'Company', path: '/recruiter/company' },
      ];
    }
    if (user.role === 'admin') {
      return [
        { label: 'Dashboard', path: '/admin' },
        { label: 'Users', path: '/admin/users' },
        { label: 'Jobs', path: '/admin/jobs' },
      ];
    }
    return [];
  };

  const roleLinks = getRoleLinks();

  return (
    <>
      <header className="sticky top-0 z-50 w-full max-w-full px-4 sm:px-6 py-4 sm:py-5 bg-[#0b0a1f]/80 backdrop-blur-md border-b border-white/10 overflow-hidden">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between min-w-0">
          {/* Logo Left */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#7c5cff] via-[#9d4edd] to-[#ff70a6] shadow-[0_0_20px_rgba(124,92,255,0.4)] shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 3L19 12L5 21V3Z" fill="#ffffff" />
              </svg>
            </div>
            <span className="text-2xl font-semibold tracking-tight text-white">
              SkillBridge
            </span>
          </Link>

          {/* Centre Pill Container */}
          <nav className="hidden lg:flex items-center gap-7 rounded-full border border-white/10 bg-white/[0.04] px-7 py-2.5 backdrop-blur-md max-w-full overflow-x-auto">
            {!user ? (
              /* Logged-out nav: marketing links only, NO app links */
              <>
                <Link
                  to="/jobs"
                  className={`text-[15px] font-medium transition-colors duration-150 ${
                    isActive('/jobs') ? 'text-white font-semibold' : 'text-[#c9c6e0] hover:text-white'
                  }`}
                >
                  Browse Jobs
                </Link>
                <Link
                  to="/for-students"
                  className={`text-[15px] font-medium transition-colors duration-150 ${
                    isActive('/for-students') ? 'text-white font-semibold' : 'text-[#c9c6e0] hover:text-white'
                  }`}
                >
                  For Students
                </Link>
                <Link
                  to="/for-recruiters"
                  className={`text-[15px] font-medium transition-colors duration-150 ${
                    isActive('/for-recruiters') ? 'text-white font-semibold' : 'text-[#c9c6e0] hover:text-white'
                  }`}
                >
                  For Recruiters
                </Link>
                <Link
                  to="/#about"
                  className="text-[15px] font-medium text-[#c9c6e0] hover:text-white transition-colors duration-150"
                >
                  About
                </Link>
              </>
            ) : (
              /* Logged-in nav: ONLY current role's links. Never show another role's pages */
              roleLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-[15px] font-medium transition-colors duration-150 ${
                    isActive(link.path)
                      ? 'text-[#7c5cff] font-semibold'
                      : 'text-[#c9c6e0] hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))
            )}
          </nav>

          {/* Right Side Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#c9c6e0] mr-1">
                  <span className="text-white font-medium">{user.name}</span>
                  <span className="ml-2 rounded-full bg-white/[0.08] px-2.5 py-0.5 text-xs text-[#c9c6e0] capitalize border border-white/10">
                    {user.role}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  className="btn-pill-primary"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-pill-primary">
                  Sign In
                </Link>
                <Link to="/register" className="btn-pill-secondary">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-xl bg-white/[0.06] border border-white/10 text-white"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label="Toggle Menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-[#12102b] p-4 sm:p-5 shadow-2xl lg:hidden space-y-4 w-full max-w-full overflow-hidden">
            {!user ? (
              /* Logged-out mobile links */
              <div className="space-y-3">
                <Link
                  to="/jobs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-medium text-[#c9c6e0] hover:text-white"
                >
                  Browse Jobs
                </Link>
                <Link
                  to="/for-students"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-medium text-[#c9c6e0] hover:text-white"
                >
                  For Students
                </Link>
                <Link
                  to="/for-recruiters"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-medium text-[#c9c6e0] hover:text-white"
                >
                  For Recruiters
                </Link>
                <Link
                  to="/#about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-medium text-[#c9c6e0] hover:text-white"
                >
                  About
                </Link>
              </div>
            ) : (
              /* Logged-in mobile links: ONLY current role */
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-wider text-[#c9c6e0]/60 font-semibold mb-2">
                  {user.role} Navigation
                </div>
                {roleLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block text-base font-medium ${
                      isActive(link.path) ? 'text-[#7c5cff]' : 'text-[#c9c6e0] hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
              {user ? (
                <>
                  <div className="text-sm text-[#c9c6e0]">
                    Signed in as <strong className="text-white">{user.name}</strong> ({user.role})
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="btn-pill-primary w-full"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-pill-primary flex-1 text-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-pill-secondary flex-1 text-center"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Centered Logout Confirmation Modal */}
      <ConfirmDialog
        isOpen={showLogoutModal}
        title="Log out?"
        message="Are you sure you want to log out of SkillBridge?"
        confirmText="Yes, log out"
        cancelText="No"
        onConfirm={handleLogout}
        onClose={() => setShowLogoutModal(false)}
      />
    </>
  );
}
