import { useState, useEffect, useRef } from 'react';
import { User, Mail, Calendar, Award, BookOpen, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [enrollments, setEnrollments] = useState([]);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchEnrollments();
    }
  }, [user]);

  const fetchEnrollments = async () => {
    try {
      const response = await axios.get('/api/enrollments/my-courses');
      setEnrollments(response.data.enrollments);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const getCompletedCount = () => {
    return enrollments.filter(e => e.progress === 100).length;
  };

  const getTotalHours = () => {
    return enrollments.reduce((total, enrollment) => {
      const course = enrollment.course;
      if (course?.duration) {
        return total + Math.floor(course.duration / 60);
      }
      return total;
    }, 0);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('email', formData.email);
      
      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      }

      console.log('Sending profile update...');
      const response = await axios.put('/api/auth/profile', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Profile update response:', response.data);
      
      if (response.data.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        setAvatarFile(null);
        setAvatarPreview(null);
        // Reload page to refresh auth context
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || ''
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold theme-text-primary mb-2">Access Denied</h2>
          <p className="theme-text-secondary">Please login to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="theme-card rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profile Preview" className="w-20 h-20 rounded-full object-cover" />
                  ) : user.avatar ? (
                    <img 
                      src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full object-cover" 
                    />
                  ) : (
                    <span className="text-2xl font-bold text-primary-600">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  )}
                </div>
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">{user.firstName} {user.lastName}</h1>
                <p className="text-primary-100 capitalize">{user.role}</p>
                <p className="text-primary-200 text-sm">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Information */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold theme-text-primary">
                    Profile Information
                  </h2>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline">
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="space-x-2">
                      <Button onClick={handleSave} size="sm">
                        Save
                      </Button>
                      <Button onClick={handleCancel} variant="outline" size="sm">
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                    <Input
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                {/* Account Details */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold theme-text-primary mb-4">
                    Account Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-3 theme-bg-secondary rounded-lg">
                      <User className="w-5 h-5 theme-text-muted" />
                      <div>
                        <p className="text-sm font-medium theme-text-primary">Role</p>
                        <p className="text-sm theme-text-secondary capitalize">{user.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 theme-bg-secondary rounded-lg">
                      <Mail className="w-5 h-5 theme-text-muted" />
                      <div>
                        <p className="text-sm font-medium theme-text-primary">Email Verified</p>
                        <p className="text-sm theme-text-secondary">
                          {user.isEmailVerified ? 'Verified' : 'Not Verified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Sidebar */}
              <div className="space-y-6">
                <div className="theme-bg-secondary rounded-lg p-4">
                  <h3 className="text-lg font-semibold theme-text-primary mb-4">
                    Learning Stats
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-5 h-5 text-primary-600" />
                        <span className="text-sm theme-text-secondary">Enrolled Courses</span>
                      </div>
                      <span className="font-semibold theme-text-primary">{enrollments.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Award className="w-5 h-5 text-primary-600" />
                        <span className="text-sm theme-text-secondary">Completed</span>
                      </div>
                      <span className="font-semibold theme-text-primary">{getCompletedCount()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-primary-600" />
                        <span className="text-sm theme-text-secondary">Hours Learned</span>
                      </div>
                      <span className="font-semibold theme-text-primary">{getTotalHours()}h</span>
                    </div>
                  </div>
                </div>

                {user.role === 'instructor' && (
                  <div className="theme-bg-secondary rounded-lg p-4">
                    <h3 className="text-lg font-semibold theme-text-primary mb-4">
                      Teaching Stats
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm theme-text-secondary">Courses Created</span>
                        <span className="font-semibold theme-text-primary">0</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm theme-text-secondary">Total Students</span>
                        <span className="font-semibold theme-text-primary">0</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm theme-text-secondary">Average Rating</span>
                        <span className="font-semibold theme-text-primary">-</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;