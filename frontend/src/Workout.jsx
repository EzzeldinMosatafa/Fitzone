import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMoon, 
  faSun, 
  faPlay, 
  faPause, 
  faVolumeUp, 
  faVolumeMute, 
  faCheck, 
  faHistory, 
  faHeart, 
  faBookmark, 
  faPaperPlane, 
  faUser, 
  faTrash, 
  faEdit,
  faChevronDown,
  faRobot,
  faLink,
  faSignOutAlt,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faInstagram, faTiktok, faLinkedinIn, faYoutube } from '@fortawesome/free-brands-svg-icons';
import axios from 'axios';
import video1 from "./assets/images/video1.png";
import video2 from "./assets/images/video2.png";
import i4 from "./assets/images/i4.png";
import i1 from "./assets/images/i1.png";
import i2 from "./assets/images/i2.png";
import i3 from "./assets/images/i3.png";
import api from './utils/api';

// Import all workout images
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

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

export default function Workout() {
  const { id } = useParams();
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [userName, setUserName] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [workoutData, setWorkoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [estimatedCalories, setEstimatedCalories] = useState(0);
  const [relatedWorkouts, setRelatedWorkouts] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [userFirstName, setUserFirstName] = useState(localStorage.getItem('firstName') || 'Guest');
  const [userLastName, setUserLastName] = useState(localStorage.getItem('lastName') || '');
  const [userProfileImage, setUserProfileImage] = useState(localStorage.getItem('profileImage') || 'https://via.placeholder.com/150');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const savedUserName = localStorage.getItem('userName');
    if (savedUserName) {
      setUserName(savedUserName);
    }

    // Load workout history from localStorage
    const savedHistory = localStorage.getItem('workoutHistory');
    if (savedHistory) {
      setWorkoutHistory(JSON.parse(savedHistory));
    }

    fetchWorkoutData();
  }, [id]);

  const fetchWorkoutData = async () => {
    try {
      setLoading(true);
      console.log('Fetching workout data for ID:', id);
      
      const response = await api.get(`/videos/${id}/`);
      console.log('Workout data response:', response.data);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Ensure all required fields are present
      const workoutData = {
        ...response.data,
        video_file: response.data.video_file || '',
        image_url: response.data.image_url || response.data.image || '',
        duration: response.data.duration || 0,
        body_focus: response.data.body_focus || 'Total',
        category: response.data.category || response.data.body_focus || 'Total',
        difficulty: response.data.difficulty || 'Easy',
        equipment: response.data.equipment || [],
        structure: response.data.structure || [],
        details: response.data.details || {
          calories: '',
          targetMuscles: [],
          intensity: 'Moderate',
          level: 'Beginner'
        }
      };

      setWorkoutData(workoutData);
      
      // Check if workout is completed
      const completed = workoutHistory.some(h => h.id === workoutData.id);
      setIsCompleted(completed);
      
      // Calculate estimated calories
      calculateCalories(workoutData);
      
      // Fetch related workouts
      try {
        const relatedResponse = await api.get('/videos/');
        const related = relatedResponse.data
          .filter(w => w.id !== workoutData.id && w.body_focus === workoutData.body_focus)
          .slice(0, 5);
        setRelatedWorkouts(related);
      } catch (relatedError) {
        console.error('Error fetching related workouts:', relatedError);
        setRelatedWorkouts([]);
      }
      
      // Fetch user's video interactions (like, save, complete status)
      try {
        const likeResponse = await api.get(`/videos/${id}/like/`);
        setIsLiked(likeResponse.data.is_liked);
      } catch (error) {
        console.log('User has not liked this video');
        setIsLiked(false);
      }
      
      try {
        const saveResponse = await api.get(`/videos/${id}/save/`);
        setIsSaved(saveResponse.data.is_saved);
      } catch (error) {
        console.log('User has not saved this video');
        setIsSaved(false);
      }
      
      try {
        const completeResponse = await api.get(`/videos/${id}/complete/`);
        setIsCompleted(completeResponse.data.is_completed);
      } catch (error) {
        console.log('User has not completed this video');
        setIsCompleted(false);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching workout data:', error);
      let errorMessage = 'Failed to load workout data. ';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', error.response.data);
        errorMessage += error.response.data.detail || error.response.data.message || 'Please try again later.';
        
        // If unauthorized, redirect to login
        if (error.response.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return;
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        errorMessage += 'No response from server. Please check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        errorMessage += error.message || 'Please try again later.';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    // Save workout history to localStorage whenever it changes
    localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
  }, [workoutHistory]);

  const calculateCalories = (workout) => {
    // Basic calorie estimation based on duration and intensity
    const baseCaloriesPerMinute = {
      "Low": 4,
      "Moderate": 7,
      "High": 10
    };

    const intensity = workout.details?.intensity || "Moderate";
    const caloriesPerMinute = baseCaloriesPerMinute[intensity] || 5;
    const estimatedCalories = Math.round(workout.duration * caloriesPerMinute);
    setEstimatedCalories(estimatedCalories);
  };

  const handleWorkoutComplete = () => {
    if (!workoutData) return;

    const now = new Date();
    const completedWorkout = {
      id: workoutData.id,
      title: workoutData.title,
      date: now.toISOString(),
      duration: workoutData.duration,
      calories: estimatedCalories
    };

    // Add to history if not already completed
    if (!workoutHistory.some(h => h.id === workoutData.id)) {
      setWorkoutHistory([...workoutHistory, completedWorkout]);
    }
    setIsCompleted(true);
  };



  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Add new handlers for like and save
  const handleLike = async () => {
    try {
      if (isLiked) {
        await api.delete(`/videos/${id}/like/`);
      } else {
        await api.post(`/videos/${id}/like/`);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error liking video:', error);
      alert('Failed to like video. Please try again.');
    }
  };

  const handleSave = async () => {
    try {
      if (isSaved) {
        await api.delete(`/videos/${id}/save/`);
      } else {
        await api.post(`/videos/${id}/save/`);
      }
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error saving video:', error);
      alert('Failed to save video. Please try again.');
    }
  };

  const handleMarkComplete = async () => {
    try {
      if (isCompleted) {
        await api.delete(`/videos/${id}/complete/`);
        setIsCompleted(false);
      } else {
        const response = await api.post(`/videos/${id}/complete/`);
        setIsCompleted(true);
        
        // إظهار رسالة تحتوي على السعرات المحروقة
        const calories = workoutData.calories || estimatedCalories || 0;
        if (calories > 0) {
          alert(`تم تسجيل التمرين! لقد حرقت ${calories} سعرة حرارية 🔥`);
        } else {
          alert('تم تسجيل التمرين بنجاح!');
        }
      }
    } catch (error) {
      console.error('Error marking video as complete:', error);
      alert('Failed to mark video as complete. Please try again.');
    }
  };

  // Add function to fetch comments
  const fetchComments = async () => {
    try {
      const response = await api.get(`/videos/${id}/comments/`);
      console.log('Fetched comments:', response.data);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // Add function to post comment
  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Please log in to post comments');
      window.location.href = '/login';
      return;
    }

    try {
      const response = await api.post(`/videos/${id}/comments/`, {
        content: newComment.trim(),
        video: parseInt(id)
      });
      
      console.log('Posted comment response:', response.data);
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
      
      if (error.response?.status === 403) {
        alert('You must be logged in to post comments');
        window.location.href = '/login';
      } else if (error.response?.status === 401) {
        alert('Your session has expired. Please log in again');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      } else {
        alert(error.response?.data?.detail || 'Error posting comment. Please try again.');
      }
    }
  };

  // Add function to delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await api.delete(`/comments/${commentId}/`);
      setComments(comments.filter(comment => comment.id !== commentId));
      alert('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      if (error.response?.status === 403) {
        alert('You can only delete your own comments');
      } else if (error.response?.status === 401) {
        alert('Your session has expired. Please log in again');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      } else {
        alert(error.response?.data?.detail || 'Error deleting comment. Please try again.');
      }
    }
  };

  // Add function to edit comment
  const handleEditComment = async (commentId) => {
    if (!editCommentText.trim()) {
        alert('Comment cannot be empty');
        return;
    }

    try {
        console.log('Editing comment:', commentId, 'with text:', editCommentText);
        
        const response = await api.put(`/comments/${commentId}/`, {
            content: editCommentText.trim(),
            video: parseInt(id)
        });
        
        console.log('Edit response:', response.data);
        
        if (response.data) {
            setComments(comments.map(comment => 
                comment.id === commentId ? response.data : comment
            ));
            setEditingCommentId(null);
            setEditCommentText('');
            alert('Comment updated successfully');
        }
    } catch (error) {
        console.error('Error editing comment:', error.response || error);
        
        if (error.response?.status === 403) {
            alert('You can only edit your own comments');
        } else if (error.response?.status === 401) {
            alert('Your session has expired. Please log in again');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
        } else {
            alert(error.response?.data?.detail || 'Error updating comment. Please try again.');
        }
    }
  };

  // Add function to start editing a comment
  const startEditing = (comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.content);
  };

  // Add function to cancel editing
  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditCommentText('');
  };

  // Add function to check if the current user is the comment owner
  const isCommentOwner = (comment) => {
    const currentUserEmail = localStorage.getItem('email');
    console.log('Current user email:', currentUserEmail);
    console.log('Comment user email:', comment.user_email);
    
    if (!currentUserEmail || !comment.user_email) {
        console.log('Missing email information');
        return false;
    }
    
    return currentUserEmail.toLowerCase() === comment.user_email.toLowerCase();
  };

  // Add useEffect to fetch comments when component mounts
  useEffect(() => {
    if (id) {
      fetchComments();
    }
  }, [id]);

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
            onClick={fetchWorkoutData}
            className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!workoutData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Workout Not Found</h1>
          <Link 
            to="/workoutlibrary" 
            className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
          >
            Return to Workout Library
          </Link>
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
        <div className={`md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300 ease-in-out transform ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'} ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
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

      <div className="bg-[#F5F5F5] dark:bg-gray-800 min-h-screen px-6 md:px-20 py-6 md:py-10 flex flex-col md:flex-row gap-8">
        {/* Left Section */}
        <div className="w-full md:w-2/3 space-y-6">

          {/* Video Player Section */}
          <div style={{ width: '100%', background: '#000', borderRadius: '16px', overflow: 'hidden' }}>
            <video
              src={workoutData.video_url?.startsWith('http') ? workoutData.video_url : `http://127.0.0.1:8000${workoutData.video_url}`}
              controls
              style={{ width: '100%', height: 'auto', display: 'block' }}
              poster={workoutData.image_url}
              muted={isMuted}
              onLoadedMetadata={e => console.log('Video src:', e.target.currentSrc)}
            />
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-6">
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">{workoutData.title}</h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg whitespace-pre-wrap break-words mb-6">
                {workoutData.description}
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                    isLiked 
                      ? 'bg-pink-100 text-pink-500 dark:bg-pink-900 dark:text-pink-300' 
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <FontAwesomeIcon icon={faHeart} className={isLiked ? 'text-pink-500' : ''} />
                  <span>Like</span>
                </button>
                <button
                  onClick={handleSave}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                    isSaved 
                      ? 'bg-blue-100 text-blue-500 dark:bg-blue-900 dark:text-blue-300' 
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <FontAwesomeIcon icon={faBookmark} className={isSaved ? 'text-blue-500' : ''} />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleMarkComplete}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                    isCompleted 
                      ? 'bg-green-100 text-green-500 dark:bg-green-900 dark:text-green-300' 
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <FontAwesomeIcon icon={faCheck} className={isCompleted ? 'text-green-500' : ''} />
                  <span>{isCompleted ? 'Completed' : 'Mark as Completed'}</span>
                </button>
              </div>

              {/* Comments Section */}
              <div className="bg-white dark:bg-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Comments</h2>
                
                {/* Add Comment Form */}
                <div className="flex gap-4 mb-8">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <FontAwesomeIcon icon={faUser} className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white resize-none"
                        rows="3"
                      />
                      <button
                        onClick={handlePostComment}
                        className="absolute bottom-2 right-2 text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
                      >
                        <FontAwesomeIcon icon={faPaperPlane} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <FontAwesomeIcon icon={faUser} className="text-gray-500 dark:text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-800 dark:text-white">{comment.user_name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {isCommentOwner(comment) && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEditing(comment)}
                                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {editingCommentId === comment.id ? (
                          <div className="mt-2">
                            <textarea
                              value={editCommentText}
                              onChange={(e) => setEditCommentText(e.target.value)}
                              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white resize-none"
                              rows="3"
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                onClick={cancelEditing}
                                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleEditComment(comment.id)}
                                className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-2 text-gray-600 dark:text-gray-300">{comment.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-6">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`px-5 py-1.5 rounded-full font-medium transition ${
                  activeTab === 'overview' 
                    ? 'bg-orange-500 text-white' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Overview
              </button>
              <button 
                onClick={() => setActiveTab('structure')}
                className={`px-5 py-1.5 rounded-full font-medium transition ${
                  activeTab === 'structure' 
                    ? 'bg-orange-500 text-white' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Workout structure
              </button>
              <button 
                onClick={() => setActiveTab('details')}
                className={`px-5 py-1.5 rounded-full font-medium transition ${
                  activeTab === 'details' 
                    ? 'bg-orange-500 text-white' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Details
              </button>
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <img src={i1} alt="difficulty" className="w-4 h-4" />
                  <span className="text-gray-700 dark:text-gray-300">Difficulty:</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-3 h-1.5 rounded-sm ${
                          i < (workoutData.difficulty === "Easy" ? 1 : 
                               workoutData.difficulty === "Medium" ? 3 : 5) 
                            ? 'bg-orange-500' 
                            : 'bg-gray-300'
                        }`}
                      ></div>
                    ))}
                    <span className="ml-2 text-green-600 dark:text-green-400 font-medium">
                      {workoutData.difficulty}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <img src={i2} alt="equipment" className="w-4 h-4" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Equipment: <span className="text-gray-600 dark:text-gray-400">
                      {workoutData.equipment?.join(", ") || "None"}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={i3} alt="duration" className="w-4 h-4" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Duration: <span className="text-gray-600 dark:text-gray-400">
                      {workoutData.duration} Minutes
                    </span>
                  </span>
                </div>
                
                {/* Calories Estimation */}
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 mt-4">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Calories Estimation</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 dark:text-gray-300">Estimated calories burned:</p>
                      <p className="text-2xl font-bold text-orange-500">
                        {workoutData.calories 
                          ? `${workoutData.calories}`
                          : `${estimatedCalories}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'structure' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Workout Structure</h3>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                  {workoutData.structure?.map((step, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600 last:border-0">
                      <div className="flex items-center gap-4">
                        <span className="text-orange-500 font-medium">{step.time}</span>
                        <span className="text-gray-700 dark:text-gray-300">{step.exercise}</span>
                      </div>
                      <span className="text-gray-500 dark:text-gray-400">{step.duration} min</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Workout Details</h3>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Calories Burned</h4>
                      <p className="text-gray-700 dark:text-gray-300">{workoutData.calories || estimatedCalories} kcal</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Target Muscles</h4>
                      <p className="text-gray-700 dark:text-gray-300">{workoutData.details?.targetMuscles?.join(", ") || "Full Body"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Intensity</h4>
                      <p className="text-gray-700 dark:text-gray-300">{workoutData.details?.intensity || "Moderate"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Level</h4>
                      <p className="text-gray-300">{workoutData.details?.level || workoutData.difficulty}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="w-full md:w-1/3">
          {/* Workout History */}
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 mb-6 shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Workout History</h2>
              <FontAwesomeIcon icon={faHistory} className="text-orange-500" />
            </div>
            {workoutHistory.length > 0 ? (
              <div className="space-y-3">
                {workoutHistory.slice(0, 5).map((workout, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-600 rounded">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{workout.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(workout.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-orange-500">{workout.calories} kcal</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{workout.duration} min</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No workout history yet. Complete a workout to see your progress!
              </p>
            )}
          </div>

          {/* Related Workouts */}
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Related recommendations for you</h2>
          <div className="space-y-4">
            {relatedWorkouts.map((workout) => (
              <Link 
                to={`/workout/${workout.id}`}
                key={workout.id}
                className="block bg-white dark:bg-gray-700 rounded-xl overflow-hidden shadow hover:shadow-md transition"
              >
                <img 
                  src={workout.image_url} 
                  alt={workout.title} 
                  className="w-full h-[110px] object-cover" 
                />
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">
                    {workout.title}
                  </h3>
                  <div className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                    <img src={i4} alt="time" className="w-4 h-4" />
                    {workout.duration} Minutes Video Time
                  </div>
                </div>
              </Link>
            ))}
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