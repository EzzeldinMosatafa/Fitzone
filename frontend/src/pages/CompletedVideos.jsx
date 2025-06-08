import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faSignOutAlt,
  faMoon,
  faSun,
  faVideo,
  faHeart,
  faCheck,
  faTimes,
  faLink,
  faChevronDown,
  faRobot,
  faBars,
  faClock,
  faPlay,
  faDumbbell,
  faTrophy
} from '@fortawesome/free-solid-svg-icons';
import api from '../utils/api';

export default function CompletedVideos() {
  const navigate = useNavigate();
  const [userName] = useState(localStorage.getItem('userName') || 'Guest');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [userData, setUserData] = useState({
    firstName: localStorage.getItem('firstName') || 'Guest',
    lastName: localStorage.getItem('lastName') || '',
    profileImage: localStorage.getItem('profileImage') || 'https://via.placeholder.com/150',
  });
  const [completedVideos, setCompletedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  useEffect(() => {
    fetchCompletedVideos();
  }, []);

  const fetchCompletedVideos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user/completed-videos/');
      setCompletedVideos(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching completed videos:', error);
      setError('Failed to load completed videos. Please try again later.');
      setLoading(false);
    }
  };

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

  const handleMarkIncomplete = async (videoId) => {
    try {
      await api.delete(`/videos/${videoId}/complete/`);
      setCompletedVideos(completedVideos.filter(video => video.id !== videoId));
    } catch (error) {
      console.error('Error marking video as incomplete:', error);
      alert('Failed to mark video as incomplete. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 text-black dark:text-white py-4 px-6 shadow-md relative">
        <div className="flex justify-between items-center">
          <Link to="/home" className="text-2xl font-bold text-orange-500 dark:text-orange-400">
            FitZone
          </Link>

          <div className="hidden md:flex flex-wrap justify-center gap-6">
            <Link to="/home" className="text-black dark:text-white hover:text-orange-500">Home</Link>
            <Link to="/quickaccess" className="text-black dark:text-white hover:text-orange-500">Quick Access</Link>
            <Link to="/fitnessarticles" className="text-black dark:text-white hover:text-orange-500">Fitness Articles</Link>
            <Link to="/workoutlibrary" className="text-black dark:text-white hover:text-orange-500">Workout Library</Link>
            <Link to="/About" className="text-black dark:text-white hover:text-orange-500">About</Link>
            <Link to="/CoreServices" className="text-black dark:text-white hover:text-orange-500">Core Services</Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700 focus:outline-none transition-all duration-200 group bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/20"
              >
                <div className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-orange-500 dark:ring-orange-400">
                  <img src={userData.profileImage} alt={userName} className="w-full h-full object-cover" />
                </div>
                <FontAwesomeIcon icon={faChevronDown} className="text-gray-400 dark:text-gray-500" />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-2 z-50">
                  <Link to="/dashboard" className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                    <FontAwesomeIcon icon={faUser} className="w-5 h-5 text-orange-500" />
                    <span className="ml-3">My Account</span>
                  </Link>
                  <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/50">
                    <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5 text-red-500" />
                    <span className="ml-3">Logout</span>
                  </button>
                </div>
              )}
            </div>
            <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20">
              <FontAwesomeIcon icon={darkMode ? faSun : faMoon} className="text-xl text-orange-500 dark:text-orange-400" />
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex">
        <div className="w-64 bg-blue-600 dark:bg-gray-800 text-white min-h-screen p-4 hidden md:block">
          <div className="space-y-4">
            <Link to="/dashboard" className="flex items-center space-x-2 p-2 hover:bg-blue-700 dark:hover:bg-gray-700 rounded">
              <FontAwesomeIcon icon={faUser} />
              <span>User Data</span>
            </Link>
            <Link to="/user/saved-videos" className="flex items-center space-x-2 p-2 hover:bg-blue-700 dark:hover:bg-gray-700 rounded">
              <FontAwesomeIcon icon={faVideo} />
              <span>Saved Videos</span>
            </Link>
            <Link to="/user/liked-videos" className="flex items-center space-x-2 p-2 hover:bg-blue-700 dark:hover:bg-gray-700 rounded">
              <FontAwesomeIcon icon={faHeart} />
              <span>Liked Videos</span>
            </Link>
            <Link to="/user/completed-videos" className="flex items-center space-x-2 p-2 bg-blue-700 dark:bg-gray-700 rounded">
              <FontAwesomeIcon icon={faCheck} />
              <span>Completed Videos</span>
            </Link>
          </div>
        </div>

        <div className="flex-1 bg-[#F5F5F5] dark:bg-gray-900 p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 dark:text-white">Completed Videos</h1>
            
            {completedVideos.length === 0 && !loading && !error ? (
              <div className="text-center py-12">
                <FontAwesomeIcon icon={faTrophy} className="text-6xl text-gray-400 dark:text-gray-600 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No Completed Videos</h2>
                <p className="text-gray-500 dark:text-gray-500 mb-6">
                  You haven't completed any videos yet. Start your fitness journey!
                </p>
                <Link to="/workoutlibrary" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg">
                  Browse Videos
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {completedVideos.map((video) => (
                  <div key={video.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="relative group">
                      <img src={video.image_url || 'https://via.placeholder.com/300x200'} alt={video.title} className="w-full h-48 object-cover" />
                      <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                        <FontAwesomeIcon icon={faCheck} />
                        <span>Completed</span>
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Link to={`/workout/${video.id}`} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                          <FontAwesomeIcon icon={faPlay} />
                          <span>Watch Again</span>
                        </Link>
                      </div>
                      <button
                        onClick={() => handleMarkIncomplete(video.id)}
                        className="absolute top-2 right-2 bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        title="Mark as incomplete"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2 dark:text-white">{video.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{video.description}</p>
                      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <FontAwesomeIcon icon={faClock} />
                          <span>{video.duration} min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FontAwesomeIcon icon={faDumbbell} />
                          <span>{video.body_focus}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 