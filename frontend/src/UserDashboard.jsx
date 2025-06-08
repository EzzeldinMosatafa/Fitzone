import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faChartLine,
  faDumbbell,
  faBook,
  faUser,
  faSignOutAlt,
  faMoon,
  faSun,
  faVideo,
  faHeart,
  faCheck,
  faFire,
  faEdit,
  faLock,
  faCamera,
  faTimes,
  faLink,
  faChevronDown,
  faRobot,
  faBars
} from '@fortawesome/free-solid-svg-icons';
import api from './utils/api';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [userName] = useState(localStorage.getItem('userName') || 'Guest');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [userData, setUserData] = useState({
    firstName: localStorage.getItem('firstName') || 'Guest',
    lastName: localStorage.getItem('lastName') || '',
    email: localStorage.getItem('email') || 'guest@example.com',
    profileImage: localStorage.getItem('profileImage') || 'https://via.placeholder.com/150',
    caloriesBurned: 0,
    dateJoined: localStorage.getItem('dateJoined') || new Date().toISOString()
  });
  const [caloriesStats, setCaloriesStats] = useState({
    total_calories: 0,
    weekly_calories: 0,
    daily_calories: 0,
    completed_videos_count: 0
  });
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // جلب بيانات السعرات عند تحميل الصفحة
  useEffect(() => {
    const fetchCaloriesStats = async () => {
      try {

        const response = await api.get('/user/calories-stats/');

        setCaloriesStats(response.data);
        setUserData(prev => ({
          ...prev,
          caloriesBurned: response.data.weekly_calories
        }));
      } catch (error) {
        console.error('Error fetching calories stats:', error);

      }
    };

    fetchCaloriesStats();
    
    // إضافة listener لتحديث السعرات عند العودة للصفحة
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCaloriesStats();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    const formData = new FormData();
    formData.append('profile_image', selectedImage);

    try {
      const response = await api.patch('/users/profile/update/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.profile_image) {
        localStorage.setItem('profileImage', response.data.profile_image);
        setUserData(prev => ({
          ...prev,
          profileImage: response.data.profile_image
        }));
      }
      setShowImageModal(false);
      setSelectedImage(null);
      setPreviewImage(null);
    } catch (error) {
      console.error('Error uploading profile image:', error);
      alert('Failed to upload profile image. Please try again.');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 text-black dark:text-white py-4 px-6 shadow-md relative">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/home" className="text-2xl font-bold text-orange-500 dark:text-orange-400">
            FitZone
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-wrap justify-center gap-6">
            <Link to="/home" className="text-black dark:text-white hover:text-orange-500">Home</Link>
            <Link to="/quickaccess" className="text-black dark:text-white hover:text-orange-500">Quick Access</Link>
            <Link to="/fitnessarticles" className="text-black dark:text-white hover:text-orange-500">Fitness Articles</Link>
            <Link to="/workoutlibrary" className="text-black dark:text-white hover:text-orange-500">Workout Library</Link>
            <Link to="/About" className="text-black dark:text-white hover:text-orange-500">About</Link>
            <Link to="/CoreServices" className="text-black dark:text-white hover:text-orange-500">Core Services</Link>
          </div>

          {/* Desktop User Controls */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700 focus:outline-none transition-all duration-200 group bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/20"
              >
                <div className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-orange-500 dark:ring-orange-400">
                  <img 
                    src={userData.profileImage}
                    alt={userName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150';
                    }}
                  />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-xs font-medium text-gray-800 dark:text-gray-200 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                    {userData.firstName}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 group-hover:text-orange-500 dark:group-hover:text-orange-300">
                    {userData.lastName}
                  </span>
                </div>
                <FontAwesomeIcon 
                  icon={faChevronDown} 
                  className="text-gray-400 dark:text-gray-500 text-[10px] ml-1.5 group-hover:text-orange-500 dark:group-hover:text-orange-400" 
                />
              </button>
              
              {/* Desktop Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-2 z-50 transform transition-all duration-200 ease-out border border-orange-100 dark:border-orange-900">
                  <Link to="/dashboard" 
                    className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors duration-200"
                  >
                    <FontAwesomeIcon icon={faUser} className="w-5 h-5 text-orange-500" />
                    <span className="ml-3">My Account</span>
                  </Link>
                  <Link to="/aiworkoutcorrection" 
                    className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors duration-200"
                  >
                    <FontAwesomeIcon icon={faRobot} className="w-5 h-5 text-orange-500" />
                    <span className="ml-3">AI Workout Correction</span>
                  </Link>
                  <Link to="/quickaccess" 
                    className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors duration-200"
                  >
                    <FontAwesomeIcon icon={faLink} className="w-5 h-5 text-orange-500" />
                    <span className="ml-3">Quick Links</span>
                  </Link>
                  <div className="h-[1px] bg-orange-100 dark:bg-orange-900 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors duration-200"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5 text-red-500" />
                    <span className="ml-3">Logout</span>
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors duration-200"
            >
              <FontAwesomeIcon 
                icon={darkMode ? faSun : faMoon} 
                className="text-xl text-orange-500 dark:text-orange-400" 
              />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 px-2 py-1 rounded-full border border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700 focus:outline-none transition-all duration-200 bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/20"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden ring-2 ring-orange-500 dark:ring-orange-400">
                  <img 
                    src={userData.profileImage}
                    alt={userName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150';
                    }}
                  />
                </div>
                <FontAwesomeIcon 
                  icon={faChevronDown} 
                  className="text-gray-400 dark:text-gray-500 text-[10px] group-hover:text-orange-500 dark:group-hover:text-orange-400" 
                />
              </button>
              
              {/* Mobile Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-2 z-50 border border-orange-100 dark:border-orange-900">
                  <div className="px-4 py-2 border-b border-orange-100 dark:border-orange-900">
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {userData.firstName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {userData.lastName}
                    </div>
                  </div>
                  <Link to="/dashboard" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                    <FontAwesomeIcon icon={faUser} className="w-5 h-5 text-orange-500" />
                    <span className="ml-3">My Account</span>
                  </Link>
                  <Link to="/aiworkoutcorrection" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                    <FontAwesomeIcon icon={faRobot} className="w-5 h-5 text-orange-500" />
                    <span className="ml-3">AI Workout Correction</span>
                  </Link>
                  <Link to="/quickaccess" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                    <FontAwesomeIcon icon={faLink} className="w-5 h-5 text-orange-500" />
                    <span className="ml-3">Quick Links</span>
                  </Link>
                  <div className="h-[1px] bg-orange-100 dark:bg-orange-900 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/50"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5 text-red-500" />
                    <span className="ml-3">Logout</span>
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20"
            >
              <FontAwesomeIcon icon={darkMode ? faSun : faMoon} className="text-xl" />
            </button>
            <button
              onClick={toggleMenu}
              className="text-2xl focus:outline-none"
            >
              <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300 ease-in-out transform ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'} ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
          <div className="flex flex-col py-4">
            <Link to="/home" className="px-6 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Home</Link>
            <Link to="/quickaccess" className="px-6 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Quick Access</Link>
            <Link to="/fitnessarticles" className="px-6 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Fitness Articles</Link>
            <Link to="/workoutlibrary" className="px-6 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Workout Library</Link>
            <Link to="/About" className="px-6 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">About</Link>
            <Link to="/CoreServices" className="px-6 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Core Services</Link>
            <button
              onClick={handleLogout}
              className="mx-6 mt-2 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 text-center"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-64 bg-[#0066D9] dark:bg-gray-800 text-white min-h-screen p-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 p-2 bg-blue-700 dark:bg-gray-700 rounded">
              <FontAwesomeIcon icon={faUser} />
              <span>User Data</span>
            </div>
            <Link to="/user/saved-videos" className="flex items-center space-x-2 p-2 hover:bg-blue-700 dark:hover:bg-gray-700 rounded">
              <FontAwesomeIcon icon={faVideo} />
              <span>Saved Videos</span>
            </Link>
            <Link to="/user/liked-videos" className="flex items-center space-x-2 p-2 hover:bg-blue-700 dark:hover:bg-gray-700 rounded">
              <FontAwesomeIcon icon={faHeart} />
              <span>Liked Videos</span>
            </Link>
            <Link to="/user/completed-videos" className="flex items-center space-x-2 p-2 hover:bg-blue-700 dark:hover:bg-gray-700 rounded">
              <FontAwesomeIcon icon={faCheck} />
              <span>Completed Videos</span>
            </Link>
            <div className="mt-auto pt-8">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 p-2 w-full hover:bg-red-600 rounded"
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-[#F5F5F5] dark:bg-gray-900 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 dark:text-white">Welcome {userName} to your dashboard!</h1>
            
            {/* User Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
              <div className="flex items-start space-x-6">
                <div className="relative">
                  <img 
                    src={userData.profileImage} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">First Name:</span>
                        <span className="text-gray-800 dark:text-white">{userData.firstName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Last Name:</span>
                        <span className="text-gray-800 dark:text-white">{userData.lastName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Email:</span>
                        <span className="text-gray-800 dark:text-white">{userData.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Date Joined:</span>
                        <span className="text-gray-800 dark:text-white">
                          {new Date(userData.dateJoined).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowEditModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold dark:text-white">Edit Profile</h3>
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Profile Image Section */}
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img 
                          src={previewImage || userData.profileImage} 
                          alt="Profile" 
                          className="w-20 h-20 rounded-full object-cover"
                        />
                        <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700">
                          <FontAwesomeIcon icon={faCamera} className="text-sm" />
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium dark:text-white">Profile Picture</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Click the camera icon to change</p>
                      </div>
                    </div>

                    {/* Password Change Section */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium dark:text-white">Password</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Change your password</p>
                        </div>
                        <Link 
                          to="/user/change-password"
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium"
                          onClick={() => setShowEditModal(false)}
                        >
                          Change Password
                        </Link>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2 mt-6">
                      <button
                        onClick={() => {
                          setShowEditModal(false);
                          setSelectedImage(null);
                          setPreviewImage(null);
                        }}
                        className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleImageUpload}
                        disabled={!selectedImage}
                        className={`px-4 py-2 rounded-lg text-white ${
                          selectedImage
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Calories Stats Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold dark:text-white">Fitness Statistics</h2>
                <button
                  onClick={() => {
                    const fetchCaloriesStats = async () => {
                      try {
                        const response = await api.get('/user/calories-stats/');
                        setCaloriesStats(response.data);
                        setUserData(prev => ({
                          ...prev,
                          caloriesBurned: response.data.weekly_calories
                        }));
                      } catch (error) {
                        console.error('Error fetching calories stats:', error);
                      }
                    };
                    fetchCaloriesStats();
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Refresh Stats
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* This Week Calories */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold dark:text-white">This Week</h3>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faFire} className="text-xl text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{caloriesStats.weekly_calories}</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">calories burned</p>
                </div>
              </div>

              {/* Today Calories */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold dark:text-white">Today</h3>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faFire} className="text-xl text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{caloriesStats.daily_calories}</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">calories burned</p>
                </div>
              </div>

              {/* Total Calories */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold dark:text-white">Total</h3>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faFire} className="text-xl text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{caloriesStats.total_calories}</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">calories burned</p>
                </div>
              </div>

              {/* Completed Videos */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold dark:text-white">Completed</h3>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faCheck} className="text-xl text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{caloriesStats.completed_videos_count}</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">videos completed</p>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Upload Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold dark:text-white">Update Profile Picture</h3>
              <button
                onClick={() => {
                  setShowImageModal(false);
                  setSelectedImage(null);
                  setPreviewImage(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="space-y-4">
              {previewImage ? (
                <div className="relative w-32 h-32 mx-auto">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-full rounded-full object-cover"
                  />
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setPreviewImage(null);
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label className="w-full flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FontAwesomeIcon icon={faCamera} className="text-3xl text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload a photo</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowImageModal(false);
                    setSelectedImage(null);
                    setPreviewImage(null);
                  }}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImageUpload}
                  disabled={!selectedImage}
                  className={`px-4 py-2 rounded-lg text-white ${
                    selectedImage
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 