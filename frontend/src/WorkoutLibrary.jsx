import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faClock, 
  faDumbbell, 
  faRunning, 
  faHeartbeat, 
  faMoon, 
  faSun, 
  faChevronDown, 
  faUser, 
  faRobot, 
  faLink, 
  faSignOutAlt,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faInstagram, faTiktok, faLinkedinIn, faYoutube } from '@fortawesome/free-brands-svg-icons';
import axios from 'axios';

// Import tools image
import tools from './assets/images/tools.png';

// Import all 16 workout images
import workout1 from './assets/images/workouts/workout-1.jpg';
import workout2 from './assets/images/workouts/workout-2.jpg';
import workout3 from './assets/images/workouts/workout-3.jpg';
import workout4 from './assets/images/workouts/workout-4.jpg';
import workout5 from './assets/images/workouts/workout-5.jpg';
import workout6 from './assets/images/workouts/workout-6.jpg';
import workout7 from './assets/images/workouts/workout-7.jpg';
import workout8 from './assets/images/workouts/workout-8.jpg';
import workout9 from './assets/images/workouts/workout-9.jpg';
import workout10 from './assets/images/workouts/workout-10.jpg';
import workout11 from './assets/images/workouts/workout-11.jpg';
import workout12 from './assets/images/workouts/workout-12.jpg';
import workout13 from './assets/images/workouts/workout-13.jpg';
import workout14 from './assets/images/workouts/workout-14.jpg';
import workout15 from './assets/images/workouts/workout-15.jpg';
import workout16 from './assets/images/workouts/workout-16.jpg';

export default function WorkoutLibrary() {
  const [userName] = useState(localStorage.getItem('userName') || 'Guest');
  const [selectedDuration, setSelectedDuration] = useState([]);
  const [selectedBodyFocus, setSelectedBodyFocus] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userFirstName, setUserFirstName] = useState(localStorage.getItem('firstName') || 'Guest');
  const [userLastName, setUserLastName] = useState(localStorage.getItem('lastName') || '');
  const [userProfileImage, setUserProfileImage] = useState(localStorage.getItem('profileImage') || 'https://via.placeholder.com/150');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://127.0.0.1:8000/api/videos/', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setWorkouts(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      setError('Failed to load workouts. Please try again later.');
      setLoading(false);
      setWorkouts([]);  // Ensure we set an empty array on error
    }
  };

  const handleDurationChange = (duration) => {
    if (selectedDuration.includes(duration)) {
      setSelectedDuration(selectedDuration.filter(d => d !== duration));
    } else {
      setSelectedDuration([...selectedDuration, duration]);
    }
    setCurrentPage(0);
  };

  const handleBodyFocusChange = (focus) => {
    if (selectedBodyFocus.includes(focus)) {
      setSelectedBodyFocus(selectedBodyFocus.filter(f => f !== focus));
    } else {
      setSelectedBodyFocus([...selectedBodyFocus, focus]);
    }
    setCurrentPage(0);
  };

  // Filter workouts
  const filteredWorkouts = Array.isArray(workouts) ? workouts.filter(workout => {
    const durationMatch = selectedDuration.length === 0 || 
      (selectedDuration.includes("15-30") && workout.duration >= 15 && workout.duration <= 30) ||
      (selectedDuration.includes("30-45") && workout.duration >= 30 && workout.duration <= 45) ||
      (selectedDuration.includes("45+") && workout.duration > 45);

    const focusMatch = selectedBodyFocus.length === 0 || 
      selectedBodyFocus.includes(workout.body_focus);

    const searchMatch = workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workout.description.toLowerCase().includes(searchQuery.toLowerCase());

    return durationMatch && focusMatch && searchMatch;
  }) : [];

  // Split into groups of 4
  const groupedWorkouts = [];
  for (let i = 0; i < filteredWorkouts.length; i += 4) {
    groupedWorkouts.push(filteredWorkouts.slice(i, i + 4));
  }

  const totalPages = groupedWorkouts.length;
  const currentWorkouts = groupedWorkouts[currentPage] || [];

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Body focus icons
  const bodyFocusIcons = {
    "Core": faDumbbell,
    "Upper": faDumbbell,
    "Lower": faRunning,
    "Total": faHeartbeat
  };

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{error}</h1>
          <button 
            onClick={fetchWorkouts}
            className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
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
                    onClick={() => {
                      localStorage.removeItem('userName');
                      window.location.href = '/login';
                    }}
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
                    onClick={() => {
                      localStorage.removeItem('userName');
                      window.location.href = '/login';
                    }}
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
        <div className={`md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300 ease-in-out transform z-50 ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'} ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
          <div className="flex flex-col py-4">
            <Link to="/home" className="px-6 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Home</Link>
            <Link to="/quickaccess" className="px-6 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Quick Access</Link>
            <Link to="/fitnessarticles" className="px-6 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Fitness Articles</Link>
            <Link to="/workoutlibrary" className="px-6 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Workout Library</Link>
            <Link to="/About" className="px-6 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">About</Link>
            <Link to="/CoreServices" className="px-6 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Core Services</Link>
          <button
            onClick={() => {
              localStorage.removeItem('userName');
              window.location.href = '/login';
            }}
              className="mx-6 mt-2 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 text-center"
          >
            Logout
          </button>
          </div>
        </div>
      </nav>

      {/* Header Section with Image */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 dark:from-gray-800 dark:to-gray-900 text-white py-16 px-6 relative overflow-hidden">
        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between">
          <div className="lg:w-1/2 z-10">
            <h1 className="text-4xl font-bold text-orange-400 dark:text-orange-300 mb-4">Workout Library</h1>
            <p className="text-lg dark:text-gray-300">
              Explore our collection of {workouts.length} professional workouts to enhance your fitness journey
            </p>
          </div>
          <div className="lg:w-1/2 flex justify-end">
            <img 
              src={tools} 
              alt="Fitness Tools" 
              className="max-w-[400px] h-auto object-contain"
            />
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="p-4 md:p-6 flex justify-center">
        <div className="relative w-full md:w-3/4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search for workouts by title or description..."
            className="w-full p-3 md:p-4 pl-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(0);
            }}
          />
        </div>
      </div>

      <div className="container mx-auto py-4 flex-grow">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Section */}
          <div className="lg:w-1/4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Filters</h2>
            
            {/* Duration Filter */}
            <div className="mb-6">
              <h3 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-300">Duration</h3>
              <div className="space-y-2">
                {["15-30", "30-45", "45+"].map((duration) => (
                  <div key={duration} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`duration-${duration}`}
                      className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                      checked={selectedDuration.includes(duration)}
                      onChange={() => handleDurationChange(duration)}
                    />
                    <label htmlFor={`duration-${duration}`} className="ml-2 text-gray-700 dark:text-gray-300">
                      {duration === "15-30" ? "15-30 minutes" : 
                       duration === "30-45" ? "30-45 minutes" : 
                       "45+ minutes"}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Body Focus Filter */}
            <div>
              <h3 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-300">Body Focus</h3>
              <div className="space-y-2">
                {["Core", "Upper", "Lower", "Total"].map((focus) => (
                  <div key={focus} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`focus-${focus}`}
                      className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                      checked={selectedBodyFocus.includes(focus)}
                      onChange={() => handleBodyFocusChange(focus)}
                    />
                    <label htmlFor={`focus-${focus}`} className="ml-2 text-gray-700 dark:text-gray-300 flex items-center">
                      <FontAwesomeIcon 
                        icon={bodyFocusIcons[focus]} 
                        className="mr-2 text-orange-500 text-sm" 
                      />
                      {focus}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Workouts List */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Available Workouts ({filteredWorkouts.length})
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Showing {currentPage * 4 + 1}-{Math.min((currentPage + 1) * 4, filteredWorkouts.length)} of {filteredWorkouts.length}
                </span>
              </div>
            </div>
            
            {filteredWorkouts.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
                <p className="text-gray-600 dark:text-gray-300">No workouts match your selected filters.</p>
                <button 
                  onClick={() => {
                    setSelectedDuration([]);
                    setSelectedBodyFocus([]);
                    setSearchQuery('');
                    setCurrentPage(0);
                  }}
                  className="mt-4 text-orange-500 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {currentWorkouts.map((workout) => (
                    <div 
                      key={workout.id} 
                      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition overflow-hidden group relative`}
                    >
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={workout.image_url || workout.image} 
                          alt={`Workout ${workout.id}: ${workout.title}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = workout1; // Fallback image
                          }}
                        />
                      </div>
                      
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <span className="inline-block px-3 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                            {workout.category || workout.body_focus}
                          </span>
                          <div className="flex items-center text-gray-500 dark:text-gray-400">
                            <FontAwesomeIcon icon={faClock} className="mr-1" />
                            <span>{workout.duration} min</span>
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 group-hover:text-orange-500 transition-colors">
                          {workout.title}
                        </h3>
                        
                        <p className="text-gray-600 dark:text-gray-300 mb-4">{workout.description}</p>
                        
                        <div className="flex justify-between items-center">
                          <Link 
                            to={`/workout/${workout.id}`}
                            className="text-blue-500 dark:text-blue-400 hover:underline flex items-center"
                          >
                            View Details <span className="ml-1">→</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={prevPage}
                        disabled={currentPage === 0}
                        className={`px-4 py-2 rounded-md border ${currentPage === 0 
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 border-gray-200 dark:border-gray-600' 
                          : 'bg-white dark:bg-gray-800 text-orange-500 dark:text-orange-400 border-orange-300 dark:border-orange-500 hover:bg-orange-50 dark:hover:bg-gray-700'}`}
                      >
                        Previous
                      </button>
                    </div>

                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPage(index)}
                          className={`w-10 h-10 rounded-md flex items-center justify-center 
                            ${currentPage === index 
                              ? 'bg-orange-500 text-white' 
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={nextPage}
                        disabled={currentPage === totalPages - 1}
                        className={`px-4 py-2 rounded-md border ${currentPage === totalPages - 1 
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 border-gray-200 dark:border-gray-600' 
                          : 'bg-white dark:bg-gray-800 text-orange-500 dark:text-orange-400 border-orange-300 dark:border-orange-500 hover:bg-orange-50 dark:hover:bg-gray-700'}`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="bg-gradient-to-r from-blue-500 to-blue-800 dark:from-gray-800 dark:to-gray-900 text-white py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-start justify-between">
            <div className="mb-8 md:mb-0">
              <Link to="/home" className="flex items-center hover:opacity-80 transition-opacity">
                <span className="text-orange-500 text-2xl font-bold">FIT</span>
                <span className="text-white dark:text-gray-200 text-2xl font-bold">Zone</span>
              </Link>
              <p className="mt-2 text-sm text-gray-300 dark:text-gray-400">Your ultimate fitness companion</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 md:px-12">
              <div>
                <h3 className="text-lg font-bold mb-4 text-orange-500 dark:text-orange-400 border-b border-orange-500 dark:border-orange-400 pb-2">Workouts</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/workoutlibrary" className="hover:text-orange-300 dark:hover:text-orange-200 transition text-sm">
                      Workout Videos
                    </Link>
                  </li>
                  <li>
                    <Link to="/fitnessarticles" className="hover:text-orange-300 dark:hover:text-orange-200 transition text-sm">
                      Workout Articles
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4 text-orange-500 dark:text-orange-400 border-b border-orange-500 dark:border-orange-400 pb-2">About FITZone</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/about" className="hover:text-orange-300 dark:hover:text-orange-200 transition text-sm">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/coreservices" className="hover:text-orange-300 dark:hover:text-orange-200 transition text-sm">
                      Core Services
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4 text-orange-500 dark:text-orange-400 border-b border-orange-500 dark:border-orange-400 pb-2">Our Social Media</h3>
                <div className="flex space-x-4">
                  <a href="#" className="text-orange-500 dark:text-orange-400 hover:text-orange-300 dark:hover:text-orange-200 transition text-xl">
                    <FontAwesomeIcon icon={faFacebookF} />
                  </a>
                  <a href="#" className="text-orange-500 dark:text-orange-400 hover:text-orange-300 dark:hover:text-orange-200 transition text-xl">
                    <FontAwesomeIcon icon={faInstagram} />
                  </a>
                  <a href="#" className="text-orange-500 dark:text-orange-400 hover:text-orange-300 dark:hover:text-orange-200 transition text-xl">
                    <FontAwesomeIcon icon={faTiktok} />
                  </a>
                  <a href="#" className="text-orange-500 dark:text-orange-400 hover:text-orange-300 dark:hover:text-orange-200 transition text-xl">
                    <FontAwesomeIcon icon={faLinkedinIn} />
                  </a>
                  <a href="#" className="text-orange-500 dark:text-orange-400 hover:text-orange-300 dark:hover:text-orange-200 transition text-xl">
                    <FontAwesomeIcon icon={faYoutube} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white dark:border-gray-700 mt-8 pt-8 text-center text-sm dark:text-gray-300">
            <p>Copyright © 2024 FITZone. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}