import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, Menu, X, User, LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  return (
    <header className="theme-card border-b theme-border animate-slide-in-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 theme-logo rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="text-xl font-bold theme-text-primary">LearnHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/courses" className="theme-text-secondary hover:text-primary-600">
              Courses
            </Link>
            <Link to="/about" className="theme-text-secondary hover:text-primary-600">
              About
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg theme-bg-secondary hover:theme-bg-tertiary transition-all duration-200 hover:scale-110"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Auth buttons */}
            {isAuthenticated ? (
              <div 
                className="relative group" 
                ref={profileRef}
                onMouseEnter={() => setIsProfileOpen(true)}
                onMouseLeave={() => setIsProfileOpen(false)}
              >
                <div className="flex items-center space-x-2 p-2 rounded-lg hover:theme-bg-secondary transition-all duration-200 hover:scale-105 cursor-pointer">
                  <div className="w-8 h-8 theme-logo rounded-full flex items-center justify-center overflow-hidden">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover" 
                      />
                    ) : (
                      <span className="text-white text-sm font-medium">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    )}
                  </div>
                </div>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 theme-card rounded-lg shadow-lg theme-border border animate-scale-in z-50">
                    <Link to="/profile" className="block p-3 border-b theme-border hover:theme-bg-secondary transition-colors">
                      <p className="text-sm font-medium theme-text-primary">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs theme-text-muted">{user?.email}</p>
                    </Link>
                    <div className="p-1">
                      {user?.role === 'instructor' ? (
                        <Link
                          to="/instructor"
                          className="flex items-center space-x-2 w-full p-2 text-left hover:theme-bg-secondary rounded theme-text-primary"
                        >
                          <User className="w-4 h-4" />
                          <span>Instructor Dashboard</span>
                        </Link>
                      ) : (
                        <Link
                          to="/my-learning"
                          className="flex items-center space-x-2 w-full p-2 text-left hover:theme-bg-secondary rounded theme-text-primary"
                        >
                          <User className="w-4 h-4" />
                          <span>My Learning</span>
                        </Link>
                      )}
                      <button
                        onClick={logout}
                        className="flex items-center space-x-2 w-full p-2 text-left hover:theme-bg-secondary rounded text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:theme-bg-secondary transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t theme-border">
            <nav className="flex flex-col space-y-3">
              <Link to="/courses" className="theme-text-secondary hover:text-primary-600">
                Courses
              </Link>
              <Link to="/about" className="theme-text-secondary hover:text-primary-600">
                About
              </Link>
              {!isAuthenticated && (
                <div className="flex flex-col space-y-2 pt-3 border-t theme-border">
                  <Link to="/login">
                    <Button variant="outline" className="w-full">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;