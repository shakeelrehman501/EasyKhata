import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Calendar,
  Camera,
  Save,
  X,
  Eye,
  EyeOff,
  Bell,
  Lock,
  Globe,
  Smartphone
} from 'lucide-react';
import { FullscreenToggle } from '../components/FullscreenToggle';

interface ProfilePageProps {
  userEmail: string;
  onLogout: () => void;
}

export default function ProfilePage({ userEmail, onLogout }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  
  // Password change states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  // Profile update states
  const [profileSuccess, setProfileSuccess] = useState('');

  // Load user data from localStorage on mount
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('user_profile');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      firstName: 'Jamil',
      lastName: 'Ahmed',
      email: userEmail || 'jamil@boxeltechnology.com',
      phone: '+92 300 1234567',
      company: 'Boxel Technology',
      role: 'Administrator',
      address: 'Lahore, Pakistan',
      joinDate: '2024-01-15',
      avatar: null as string | null
    };
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    weeklyReport: true,
    newTickets: true,
    systemUpdates: true
  });

  // Initialize default credentials if not present
  React.useEffect(() => {
    const credentials = localStorage.getItem('user_credentials');
    if (!credentials) {
      localStorage.setItem('user_credentials', JSON.stringify({
        email: 'jamil@boxeltechnology.com',
        password: 'jamil786'
      }));
    }
  }, []);

  const handleSaveProfile = () => {
    // Save profile to localStorage
    localStorage.setItem('user_profile', JSON.stringify(userData));
    // Dispatch custom event to notify sidebar of profile update
    window.dispatchEvent(new Event('profileUpdated'));
    setIsEditing(false);
    setProfileSuccess('Profile updated successfully!');
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      setProfileSuccess('');
    }, 5000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Get stored credentials
    const credentialsStr = localStorage.getItem('user_credentials');
    if (!credentialsStr) {
      setPasswordError('Unable to verify credentials. Please try again.');
      return;
    }

    const credentials = JSON.parse(credentialsStr);

    // Validate old password
    if (oldPassword !== credentials.password) {
      setPasswordError('Current password is incorrect.');
      return;
    }

    // Validate new password
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    // Validate password match
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    // Check if new password is same as old password
    if (newPassword === oldPassword) {
      setPasswordError('New password must be different from current password.');
      return;
    }

    // Update password in localStorage
    credentials.password = newPassword;
    localStorage.setItem('user_credentials', JSON.stringify(credentials));

    // Also update remembered password if the email matches
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail === credentials.email) {
      localStorage.setItem('rememberedPassword', newPassword);
    }

    // Clear form and show success
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordSuccess('Password updated successfully! Logging out in 3 seconds...');

    // Auto logout after 3 seconds
    setTimeout(() => {
      onLogout();
    }, 3000);
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-[#0d0d0d] overflow-auto pb-16 lg:pb-0">
      <div className="max-w-5xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-[#e8e8e8] mb-1 lg:mb-2">Profile Settings</h1>
            <p className="text-slate-600 dark:text-[#9ca3af] text-sm lg:text-base hidden sm:block">Manage your account settings and preferences</p>
          </div>
          <FullscreenToggle />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-slate-200 dark:border-[#2d2d2d] p-3 lg:p-4">
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors whitespace-nowrap flex-1 lg:flex-none lg:w-full ${
                    activeTab === 'profile'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                      : 'text-slate-600 dark:text-[#9ca3af] hover:bg-slate-50 dark:hover:bg-[#2a2a2a]'
                  }`}
                >
                  <User size={18} />
                  <span className="text-sm lg:text-base">Profile</span>
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors whitespace-nowrap flex-1 lg:flex-none lg:w-full ${
                    activeTab === 'security'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                      : 'text-slate-600 dark:text-[#9ca3af] hover:bg-slate-50 dark:hover:bg-[#2a2a2a]'
                  }`}
                >
                  <Lock size={18} />
                  <span className="text-sm lg:text-base">Security</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-slate-200 dark:border-[#2d2d2d] overflow-hidden">
                {/* Header */}
                <div className="p-4 lg:p-6 border-b border-slate-200 dark:border-[#2d2d2d] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base lg:text-lg font-semibold text-slate-900 dark:text-[#e8e8e8]">Personal Information</h2>
                    <p className="text-xs lg:text-sm text-slate-600 dark:text-[#9ca3af] mt-1">Update your personal details</p>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full sm:w-auto px-4 py-2 bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 text-white rounded-xl font-medium transition-colors text-sm"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 dark:border-[#2d2d2d] text-slate-700 dark:text-[#9ca3af] rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-[#2a2a2a] transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <Save size={16} />
                        <span className="hidden sm:inline">Save Changes</span>
                        <span className="sm:hidden">Save</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Avatar Section */}
                <div className="p-4 lg:p-6 border-b border-slate-200 dark:border-[#2d2d2d]">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 lg:gap-6">
                    <div className="relative shrink-0">
                      <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl lg:text-3xl font-bold shadow-lg">
                        {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
                      </div>
                      {isEditing && (
                        <button className="absolute bottom-0 right-0 w-7 h-7 lg:w-8 lg:h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors">
                          <Camera size={14} className="lg:w-4 lg:h-4" />
                        </button>
                      )}
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="font-semibold text-slate-900 dark:text-[#e8e8e8] text-base lg:text-lg">
                        {userData.firstName} {userData.lastName}
                      </h3>
                      <p className="text-slate-600 dark:text-[#9ca3af] text-xs lg:text-sm mt-1">{userData.email}</p>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="p-4 lg:p-6">
                  {/* Success Message */}
                  {profileSuccess && (
                    <div className="mb-4 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-xl flex items-start gap-3">
                      <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <Save size={14} className="text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-400 flex-1">{profileSuccess}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                    {/* First Name */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-[#e8e8e8] mb-2">
                        First Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                        <input
                          type="text"
                          value={userData.firstName}
                          onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-[#2d2d2d] bg-white dark:bg-[#1e1e1e] dark:text-[#e8e8e8] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 dark:disabled:bg-[#2a2a2a] disabled:text-slate-600 dark:disabled:text-[#9ca3af]"
                        />
                      </div>
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-[#e8e8e8] mb-2">
                        Last Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                        <input
                          type="text"
                          value={userData.lastName}
                          onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-[#2d2d2d] bg-white dark:bg-[#1e1e1e] dark:text-[#e8e8e8] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 dark:disabled:bg-[#2a2a2a] disabled:text-slate-600 dark:disabled:text-[#9ca3af]"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-[#e8e8e8] mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                        <input
                          type="email"
                          value={userData.email}
                          onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-[#2d2d2d] bg-white dark:bg-[#1e1e1e] dark:text-[#e8e8e8] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 dark:disabled:bg-[#2a2a2a] disabled:text-slate-600 dark:disabled:text-[#9ca3af]"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-[#e8e8e8] mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                        <input
                          type="tel"
                          value={userData.phone}
                          onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-[#2d2d2d] bg-white dark:bg-[#1e1e1e] dark:text-[#e8e8e8] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 dark:disabled:bg-[#2a2a2a] disabled:text-slate-600 dark:disabled:text-[#9ca3af]"
                        />
                      </div>
                    </div>

                    {/* Company */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-[#e8e8e8] mb-2">
                        Company
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                        <input
                          type="text"
                          value={userData.company}
                          onChange={(e) => setUserData({ ...userData, company: e.target.value })}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-[#2d2d2d] bg-white dark:bg-[#1e1e1e] dark:text-[#e8e8e8] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 dark:disabled:bg-[#2a2a2a] disabled:text-slate-600 dark:disabled:text-[#9ca3af]"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-[#e8e8e8] mb-2">
                        Address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                        <input
                          type="text"
                          value={userData.address}
                          onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-[#2d2d2d] bg-white dark:bg-[#1e1e1e] dark:text-[#e8e8e8] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 dark:disabled:bg-[#2a2a2a] disabled:text-slate-600 dark:disabled:text-[#9ca3af]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-slate-200 dark:border-[#2d2d2d] overflow-hidden">
                {/* Header */}
                <div className="p-4 lg:p-6 border-b border-slate-200 dark:border-[#2d2d2d]">
                  <h2 className="text-base lg:text-lg font-semibold text-slate-900 dark:text-[#e8e8e8]">Security Settings</h2>
                  <p className="text-xs lg:text-sm text-slate-600 dark:text-[#9ca3af] mt-1">Manage your password and security preferences</p>
                </div>

                {/* Change Password */}
                <div className="p-4 lg:p-6">
                  <h3 className="text-sm lg:text-base font-medium text-slate-900 dark:text-[#e8e8e8] mb-4">Change Password</h3>
                  <div className="space-y-4 max-w-md">
                    {/* Old Password */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-[#e8e8e8] mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                        <input
                          type={showOldPassword ? 'text' : 'password'}
                          placeholder="Enter current password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="w-full pl-10 pr-12 py-2.5 border border-slate-200 dark:border-[#2d2d2d] bg-white dark:bg-[#1e1e1e] dark:text-[#e8e8e8] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                          {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-[#e8e8e8] mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full pl-10 pr-12 py-2.5 border border-slate-200 dark:border-[#2d2d2d] bg-white dark:bg-[#1e1e1e] dark:text-[#e8e8e8] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-[#e8e8e8] mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-10 pr-12 py-2.5 border border-slate-200 dark:border-[#2d2d2d] bg-white dark:bg-[#1e1e1e] dark:text-[#e8e8e8] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <button
                      className="w-full px-5 py-2.5 bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-200 dark:shadow-blue-900/30"
                      onClick={handleChangePassword}
                    >
                      <Save size={18} />
                      Update Password
                    </button>

                    {/* Error Message */}
                    {passwordError && (
                      <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl flex items-start gap-3">
                        <div className="w-5 h-5 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <X size={14} className="text-red-600 dark:text-red-400" />
                        </div>
                        <p className="text-sm text-red-600 dark:text-red-400 flex-1">{passwordError}</p>
                      </div>
                    )}

                    {/* Success Message */}
                    {passwordSuccess && (
                      <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-xl flex items-start gap-3">
                        <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <Save size={14} className="text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-sm text-green-600 dark:text-green-400 flex-1">{passwordSuccess}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}