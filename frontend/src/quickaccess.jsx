import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faChartLine, 
  faDumbbell, 
  faBook, 
  faEnvelope, 
  faMoon, 
  faSun,
  faRobot,
  faVideo,
  faInfoCircle,
  faCog,
  faSignOutAlt,
  faBars,
  faTimes,
  faUser,
  faLink,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faInstagram, faTiktok, faLinkedinIn, faYoutube } from '@fortawesome/free-brands-svg-icons';
import workoutImage from './assets/images/workouts.png';
import aiCorrectionImage from './assets/images/CN1.png';
import uploadImage from './assets/images/upload.png';
import e1Image from './assets/images/e1.png';
import e2Image from './assets/images/e2.png';

export default function QuickAccess() {
  const [userName] = useState(localStorage.getItem('userName') || 'Guest');
  const [userFirstName] = useState(localStorage.getItem('firstName') || 'Guest');
  const [userLastName] = useState(localStorage.getItem('lastName') || '');
  const [userProfileImage] = useState(localStorage.getItem('profileImage') || 'https://via.placeholder.com/150');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900">
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
                    src={userProfileImage}
                    alt={userName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150';
                    }}
                  />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-xs font-medium text-gray-800 dark:text-gray-200 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                    {userFirstName}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 group-hover:text-orange-500 dark:group-hover:text-orange-300">
                    {userLastName}
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
                    src={userProfileImage}
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
                      {userFirstName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {userLastName}
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
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-64 bg-[#0066D9] dark:bg-gray-800 text-white min-h-screen p-4 hidden md:block">
          <div className="space-y-4">
            <Link to="/quickaccess" className="flex items-center space-x-2 p-2 bg-blue-700 dark:bg-gray-700 rounded">
              <FontAwesomeIcon icon={faHome} />
              <span>Quick Access</span>
            </Link>
            <Link to="/aiworkoutcorrection" className="flex items-center space-x-2 p-2 hover:bg-blue-700 dark:hover:bg-gray-700 rounded">
              <FontAwesomeIcon icon={faChartLine} />
              <span>AI Workout Correction</span>
            </Link>
            <Link to="/workoutlibrary" className="flex items-center space-x-2 p-2 hover:bg-blue-700 dark:hover:bg-gray-700 rounded">
              <FontAwesomeIcon icon={faDumbbell} />
              <span>Workout Library</span>
            </Link>
            <Link to="/fitnessarticles" className="flex items-center space-x-2 p-2 hover:bg-blue-700 dark:hover:bg-gray-700 rounded">
              <FontAwesomeIcon icon={faBook} />
              <span>Fitness Articles</span>
            </Link>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-[#F5F5F5] dark:bg-gray-900 p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 dark:text-white">Quick access different services</h1>
            
            {/* Top Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* AI Correction Feature */}
              <Link to="/aiworkoutcorrection" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon icon={faRobot} className="text-2xl text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold dark:text-white">AI Correction feature</h2>
                </div>
                <img src={e1Image} alt="AI Correction" className="w-full h-48 object-cover rounded-lg mb-4"/>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Get real-time feedback on your exercise form using our advanced AI technology, featuring:
                </p>
                <ul className="text-gray-600 dark:text-gray-300 list-disc list-inside">
                  <li>Real-time form analysis</li>
                  <li>Instant feedback and corrections</li>
                  <li>Detailed performance metrics</li>
                  <li>Personalized workout recommendations</li>
                  <li>Progress tracking and history</li>
                </ul>
              </Link>

              {/* Professional Recorded Workouts */}
              <Link to="/workoutlibrary" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon icon={faVideo} className="text-2xl text-orange-600 dark:text-orange-400" />
                  </div>
                  <h2 className="text-xl font-semibold dark:text-white">Professional recorded workouts</h2>
                </div>
                <img src={e2Image} alt="Professional Workouts" className="w-full h-48 object-cover rounded-lg mb-4"/>
                <p className="text-gray-600 dark:text-gray-300">
                  Access our comprehensive library of professionally recorded workout videos, featuring:
                </p>
                <ul className="mt-2 text-gray-600 dark:text-gray-300 list-disc list-inside">
                  <li>Expert trainers and instructors</li>
                  <li>Various difficulty levels</li>
                  <li>Different workout styles and focuses</li>
                  <li>Clear instructions and form guidance</li>
                  <li>Regular content updates</li>
                </ul>
              </Link>
            </div>

            {/* Bottom Card */}
            <Link to="/fitnessarticles" className="block">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 hover:shadow-xl transition">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon icon={faBook} className="text-2xl text-orange-600 dark:text-orange-400" />
                  </div>
                  <h2 className="text-2xl font-semibold dark:text-white">Fitness Articles</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Access our comprehensive library of professionally recorded workout videos, featuring:
                    </p>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                      <li>• Expert trainers and instructors</li>
                      <li>• Various difficulty levels</li>
                      <li>• Different workout styles and focuses</li>
                      <li>• Clear instructions and form guidance</li>
                      <li>• Regular content updates</li>
                    </ul>
                  </div>
                  <div className="flex items-center justify-center">
                    <img src={workoutImage} alt="Workout" className="max-w-full h-auto rounded-lg shadow" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-900 to-blue-700 dark:from-gray-900 dark:to-gray-800 text-white py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-start justify-between">
            <div className="mb-8 md:mb-0">
              <Link to="/home" className="flex items-center hover:opacity-80 transition-opacity">
                <span className="text-orange-500 text-2xl font-bold">FIT</span>
                <span className="text-white text-2xl font-bold">Zone</span>
              </Link>
              <p className="mt-2 text-sm text-gray-300">Your ultimate fitness companion</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 md:px-12">
              <div>
                <h3 className="text-lg font-bold mb-4 text-orange-500 border-b border-orange-500 pb-2">Workouts</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/workoutlibrary" className="text-gray-300 hover:text-orange-300 transition text-sm">
                      Workout Videos
                    </Link>
                  </li>
                  <li>
                    <Link to="/fitnessarticles" className="text-gray-300 hover:text-orange-300 transition text-sm">
                      Workout Articles
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4 text-orange-500 border-b border-orange-500 pb-2">About FITZone</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/about" className="text-gray-300 hover:text-orange-300 transition text-sm">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/coreservices" className="text-gray-300 hover:text-orange-300 transition text-sm">
                      Core Services
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4 text-orange-500 border-b border-orange-500 pb-2">Our Social Media</h3>
                <div className="flex space-x-4">
                  <a href="#" className="text-orange-500 hover:text-orange-300 transition text-xl">
                    <FontAwesomeIcon icon={faFacebookF} />
                  </a>
                  <a href="#" className="text-orange-500 hover:text-orange-300 transition text-xl">
                    <FontAwesomeIcon icon={faInstagram} />
                  </a>
                  <a href="#" className="text-orange-500 hover:text-orange-300 transition text-xl">
                    <FontAwesomeIcon icon={faTiktok} />
                  </a>
                  <a href="#" className="text-orange-500 hover:text-orange-300 transition text-xl">
                    <FontAwesomeIcon icon={faLinkedinIn} />
                  </a>
                  <a href="#" className="text-orange-500 hover:text-orange-300 transition text-xl">
                    <FontAwesomeIcon icon={faYoutube} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-300">
            <p>Copyright © 2024 FITZone. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 