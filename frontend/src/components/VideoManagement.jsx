import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUsers, faNewspaper, faVideo, faChartBar, faMoon, faSun, faSignOutAlt, faEnvelope, faPlus, faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faInstagram, faTiktok, faLinkedinIn, faYoutube } from '@fortawesome/free-brands-svg-icons';
import axios from 'axios';

export default function VideoManagement() {
  const navigate = useNavigate();
  const [userName] = useState(localStorage.getItem('userName') || 'Admin');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    bodyFocus: 'Total',
    category: 'Total',
    difficulty: 'Easy',
    equipment: [],
    videoFile: null,
    imageFile: null,
    structure: [],
    details: {
      calories: '',
      targetMuscles: [],
      intensity: 'Moderate',
      level: 'Beginner'
    }
  });

  const [newStep, setNewStep] = useState({ time: '', exercise: '', duration: '' });

  const bodyFocusOptions = ['Total', 'Core', 'Upper', 'Lower'];
  const difficultyOptions = ['Easy', 'Medium', 'Hard'];
  const intensityOptions = ['Low', 'Moderate', 'High'];
  const levelOptions = ['Beginner', 'Intermediate', 'Advanced'];
  const equipmentOptions = ['None', 'Bench', 'Dumbbell', 'Mat', 'Resistance Bands', 'Yoga Mat'];

  const timePattern = /^\d{2}:\d{2}$/;

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
    fetchVideos();
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const refreshToken = async () => {
    try {
      const refresh_token = localStorage.getItem('refresh_token');
      if (!refresh_token) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
        refresh: refresh_token
      });

      if (response.data.access) {
        localStorage.setItem('access_token', response.data.access);
        return response.data.access;
      } else {
        throw new Error('No access token in response');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      if (error.response?.status === 401) {
        // If refresh token is invalid/expired, logout user
        handleLogout();
      }
      throw error;
    }
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem('access_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://127.0.0.1:8000/api/videos/', {
        headers: getAuthHeader()
      });
      // Ensure we always set an array
      setVideos(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
      setError('');
    } catch (error) {
      console.error('Error fetching videos:', error);
      setLoading(false);
      if (error.response?.status === 401) {
        try {
          await refreshToken();
          // Retry the request with new token
          const response = await axios.get('http://127.0.0.1:8000/api/videos/', {
            headers: getAuthHeader()
          });
          // Ensure we always set an array here too
          setVideos(Array.isArray(response.data) ? response.data : []);
          setError('');
        } catch (refreshError) {
          setError('Session expired. Please login again.');
          handleLogout();
        }
      } else {
        setError('Failed to fetch videos. Please try again later.');
        // Set empty array on error
        setVideos([]);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('userName');
    localStorage.removeItem('isAdmin');
    navigate('/login');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      // Prevent the default file input behavior
      e.preventDefault();
      
      if (files && files[0]) {
        setFormData(prev => ({
          ...prev,
          [name]: files[0]
        }));
        
        if (name === 'imageFile') {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviewImage(reader.result);
          };
          reader.readAsDataURL(files[0]);
        }
      }
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleEquipmentChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      equipment: checked 
        ? [...prev.equipment, value]
        : prev.equipment.filter(item => item !== value)
    }));
  };

  const handleTargetMusclesChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        targetMuscles: checked 
          ? [...prev.details.targetMuscles, value]
          : prev.details.targetMuscles.filter(muscle => muscle !== value)
      }
    }));
  };

  const handleAddVideo = () => {
    setFormData({
      title: '',
      description: '',
      duration: '',
      bodyFocus: 'Total',
      category: 'Total',
      difficulty: 'Easy',
      equipment: [],
      videoFile: null,
      imageFile: null,
      structure: [],
      details: {
        calories: '',
        targetMuscles: [],
        intensity: 'Moderate',
        level: 'Beginner'
      }
    });
    setPreviewImage(null);
    setIsEditing(false);
    setCurrentVideoId(null);
    setShowForm(true);
  };

  const handleEditVideo = (video) => {
    setFormData({
      title: video.title,
      description: video.description,
      duration: video.duration,
      bodyFocus: video.body_focus,
      category: video.category || video.body_focus,
      difficulty: video.difficulty,
      equipment: video.equipment || [],
      structure: video.structure || [],
      details: video.details || {
        calories: '',
        targetMuscles: [],
        intensity: 'Moderate',
        level: 'Beginner'
      }
    });
    setPreviewImage(video.image_url);
    setIsEditing(true);
    setCurrentVideoId(video.id);
    setShowForm(true);
  };

  const handleDeleteVideo = async (id) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setError('No authentication token found. Please log in again.');
                return;
            }

            await axios.delete(`http://127.0.0.1:8000/api/videos/${id}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Show success message in green
            setError('');
            const successDiv = document.createElement('div');
            successDiv.textContent = 'Video deleted successfully';
            successDiv.className = 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4';
            const container = document.querySelector('.container');
            container.insertBefore(successDiv, container.firstChild);
            
            // Remove success message after 3 seconds
            setTimeout(() => {
                if (successDiv && successDiv.parentNode) {
                    successDiv.parentNode.removeChild(successDiv);
                }
            }, 3000);

            // Refresh the video list
            fetchVideos();
        } catch (error) {
            console.error('Error deleting video:', error);
            if (error.response?.status === 401) {
                try {
                    await refreshToken();
                    // Retry deletion with new token
                    const newToken = localStorage.getItem('access_token');
                    await axios.delete(`http://127.0.0.1:8000/api/videos/${id}/`, {
                        headers: {
                            'Authorization': `Bearer ${newToken}`
                        }
                    });
                    fetchVideos();
                } catch (refreshError) {
                    setError('Session expired. Please login again.');
                    handleLogout();
                }
            } else {
                setError('Failed to delete video. Please try again later.');
            }
        }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate required fields
    if (!formData.title || !formData.description || !formData.duration || !formData.videoFile) {
      setError('Please fill in all required fields (Title, Description, Duration, and Video File)');
      return;
    }

    // Validate duration is a positive number
    if (isNaN(formData.duration) || formData.duration <= 0) {
      setError('Duration must be a positive number');
      return;
    }

    const formDataToSend = new FormData();
    
    // Add basic fields
    formDataToSend.append('title', formData.title.trim());
    formDataToSend.append('description', formData.description.trim());
    formDataToSend.append('duration', formData.duration);
    formDataToSend.append('body_focus', formData.bodyFocus);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('difficulty', formData.difficulty);
    
    // Add files with proper validation
    if (formData.videoFile) {
      // Validate video file size (100MB limit)
      if (formData.videoFile.size > 100 * 1024 * 1024) {
        setError('Video file size must be less than 100MB');
        return;
      }
      // Validate video file type
      const videoTypes = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv'];
      if (!videoTypes.includes(formData.videoFile.type)) {
        setError('Video file must be MP4, AVI, MOV, or WMV format');
        return;
      }
      formDataToSend.append('video_file', formData.videoFile);
    }

    if (formData.imageFile) {
      // Validate image file size (5MB limit)
      if (formData.imageFile.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }
      // Validate image file type
      const imageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!imageTypes.includes(formData.imageFile.type)) {
        setError('Image file must be JPG or PNG format');
        return;
      }
      formDataToSend.append('image', formData.imageFile);
    }
    
    // Add JSON fields
    formDataToSend.append('equipment', JSON.stringify(formData.equipment));
    formDataToSend.append('structure', JSON.stringify(formData.structure));
    formDataToSend.append('details', JSON.stringify(formData.details));

    try {
      const headers = {
        ...getAuthHeader()
      };

      let response;
      if (isEditing) {
        response = await axios.put(`http://127.0.0.1:8000/api/videos/${currentVideoId}/`, formDataToSend, { 
          headers: {
            ...headers,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        response = await axios.post('http://127.0.0.1:8000/api/videos/', formDataToSend, { 
          headers: {
            ...headers,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      console.log(isEditing ? 'Update response:' : 'Create response:', response.data);
      
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        duration: '',
        bodyFocus: 'Total',
        category: 'Total',
        difficulty: 'Easy',
        equipment: [],
        videoFile: null,
        imageFile: null,
        structure: [],
        details: {
          calories: '',
          targetMuscles: [],
          intensity: 'Moderate',
          level: 'Beginner'
        }
      });
      setPreviewImage(null);
      fetchVideos();
    } catch (error) {
      console.error('Error saving video:', error);
      
      if (error.response?.status === 401) {
        try {
          await refreshToken();
          // Retry the request with new token
          const headers = {
            ...getAuthHeader()
          };
          
          let response;
          if (isEditing) {
            response = await axios.put(`http://127.0.0.1:8000/api/videos/${currentVideoId}/`, formDataToSend, { 
              headers: {
                ...headers,
                'Content-Type': 'multipart/form-data'
              }
            });
          } else {
            response = await axios.post('http://127.0.0.1:8000/api/videos/', formDataToSend, { 
              headers: {
                ...headers,
                'Content-Type': 'multipart/form-data'
              }
            });
          }
          
          console.log(isEditing ? 'Update response after token refresh:' : 'Create response after token refresh:', response.data);
          setShowForm(false);
          fetchVideos();
        } catch (refreshError) {
          setError('Session expired. Please login again.');
          handleLogout();
        }
      } else if (error.response?.data) {
        // Handle validation errors from the backend
        let errorMessage = '';
        if (typeof error.response.data === 'object') {
          // If the error is an object with field-specific errors
          const errorFields = Object.entries(error.response.data)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          errorMessage = errorFields || 'Failed to save video. Please check all required fields and try again.';
        } else {
          // If the error is a simple message
          errorMessage = error.response.data.detail || error.response.data || 'Failed to save video. Please check all required fields and try again.';
        }
        setError(errorMessage);
      } else {
        setError('Failed to save video. Please check your connection and try again.');
      }
    }
  };

  const handleAddStep = () => {
    if (!newStep.time || !newStep.exercise || !newStep.duration) return;
    if (!timePattern.test(newStep.time)) {
      alert('Time must be in the format mm:ss (e.g., 05:30)');
      return;
    }
    setFormData(prev => ({
      ...prev,
      structure: [...prev.structure, { ...newStep }]
    }));
    setNewStep({ time: '', exercise: '', duration: '' });
  };

  const handleRemoveStep = (index) => {
    setFormData(prev => ({
      ...prev,
      structure: prev.structure.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 text-black dark:text-white py-4 px-6 flex flex-col md:flex-row justify-between items-center shadow-md">
        <Link to="/admin/dashboard" className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4 md:mb-0">FitZone Admin</Link>
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-4 md:mb-0">
          <Link to="/admin/dashboard" className="text-black dark:text-white hover:text-orange-500 dark:hover:text-orange-400">Dashboard</Link>
          <Link to="/admin/users" className="text-black dark:text-white hover:text-orange-500 dark:hover:text-orange-400">Users</Link>
          <Link to="/admin/articles" className="text-black dark:text-white hover:text-orange-500 dark:hover:text-orange-400">Articles</Link>
          <Link to="/admin/videos" className="text-black dark:text-white hover:text-orange-500 dark:hover:text-orange-400">Videos</Link>
          <Link to="/admin/newsletter" className="text-black dark:text-white hover:text-orange-500 dark:hover:text-orange-400">Newsletter</Link>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-lg">Hello, {userName}!</span>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <FontAwesomeIcon icon={darkMode ? faSun : faMoon} className="text-xl" />
          </button>
          <button
            onClick={handleLogout}
            className="bg-orange-600 text-white py-2 px-4 md:px-6 rounded-lg hover:bg-orange-700"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-64 bg-[#0066D9] dark:bg-gray-800 text-white min-h-screen p-4 hidden md:block">
          <div className="space-y-4">
            <Link to="/admin/dashboard" className="flex items-center space-x-2 p-2 hover:bg-blue-700 dark:hover:bg-gray-700 rounded">
              <FontAwesomeIcon icon={faHome} />
              <span>Dashboard</span>
            </Link>
            <Link to="/admin/users" className="flex items-center space-x-2 p-2 hover:bg-blue-700 dark:hover:bg-gray-700 rounded">
              <FontAwesomeIcon icon={faUsers} />
              <span>Users</span>
            </Link>
            <Link to="/admin/articles" className="flex items-center space-x-2 p-2 hover:bg-blue-700 dark:hover:bg-gray-700 rounded">
              <FontAwesomeIcon icon={faNewspaper} />
              <span>Articles</span>
            </Link>
            <Link to="/admin/videos" className="flex items-center space-x-2 p-2 bg-blue-700 dark:bg-gray-700 rounded">
              <FontAwesomeIcon icon={faVideo} />
              <span>Videos</span>
            </Link>
            <Link to="/admin/stats" className="flex items-center space-x-2 p-2 hover:bg-blue-700 dark:hover:bg-gray-700 rounded">
              <FontAwesomeIcon icon={faChartBar} />
              <span>Statistics</span>
            </Link>
            <Link to="/admin/newsletter" className="flex items-center space-x-2 p-2 hover:bg-blue-700 dark:hover:bg-gray-700 rounded">
              <FontAwesomeIcon icon={faEnvelope} />
              <span>Newsletter</span>
            </Link>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-[#F5F5F5] dark:bg-gray-900 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold dark:text-white">Manage Videos</h1>
              <button 
                onClick={handleAddVideo}
                className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Add New Video</span>
              </button>
            </div>
            
            {error && (
              <div className="bg-red-100 text-red-700 p-4 rounded mb-4 border border-red-300">
                {error}
              </div>
            )}

            {/* Video Form */}
            {showForm && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 dark:text-white">
                  {isEditing ? 'Edit Video' : 'Add New Video'}
                </h2>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Title</label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Description</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Duration (minutes)</label>
                        <input
                          type="number"
                          name="duration"
                          value={formData.duration}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Body Focus</label>
                        <select
                          name="bodyFocus"
                          value={formData.bodyFocus}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          {bodyFocusOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Category</label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          {bodyFocusOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Difficulty</label>
                        <select
                          name="difficulty"
                          value={formData.difficulty}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          {difficultyOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Equipment</label>
                        <div className="grid grid-cols-2 gap-2">
                          {equipmentOptions.map(option => (
                            <div key={option} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`equipment-${option}`}
                                value={option}
                                checked={formData.equipment.includes(option)}
                                onChange={handleEquipmentChange}
                                className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`equipment-${option}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                {option}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Intensity</label>
                        <select
                          name="details.intensity"
                          value={formData.details.intensity}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          {intensityOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Level</label>
                        <select
                          name="details.level"
                          value={formData.details.level}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          {levelOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Calories</label>
                        <input
                          type="text"
                          name="details.calories"
                          value={formData.details.calories}
                          onChange={handleInputChange}
                          placeholder="e.g., 300-400"
                          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* File Uploads */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">Video File</label>
                      <input
                        type="file"
                        name="videoFile"
                        onChange={handleInputChange}
                        accept="video/*"
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">Thumbnail Image</label>
                      <input
                        type="file"
                        name="imageFile"
                        onChange={handleInputChange}
                        accept="image/*"
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      {previewImage && (
                        <div className="mt-2">
                          <img 
                            src={previewImage} 
                            alt="Preview" 
                            className="h-40 object-cover rounded-lg" 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">Workout Structure</label>
                      <div className="space-y-2">
                        {formData.structure.map((step, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={step.time}
                              readOnly
                              className="w-20 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              placeholder="Time"
                            />
                            <input
                              type="text"
                              value={step.exercise}
                              readOnly
                              className="flex-1 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              placeholder="Exercise"
                            />
                            <input
                              type="number"
                              value={step.duration}
                              readOnly
                              className="w-20 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              placeholder="Duration"
                            />
                            <button type="button" onClick={() => handleRemoveStep(idx)} className="text-red-500 hover:text-red-700">Remove</button>
                          </div>
                        ))}
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="text"
                            value={newStep.time}
                            onChange={e => setNewStep(s => ({ ...s, time: e.target.value }))}
                            className="w-20 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="mm:ss"
                            pattern="^\\d{2}:\\d{2}$"
                          />
                          <input
                            type="text"
                            value={newStep.exercise}
                            onChange={e => setNewStep(s => ({ ...s, exercise: e.target.value }))}
                            className="flex-1 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Exercise"
                          />
                          <input
                            type="number"
                            value={newStep.duration}
                            onChange={e => setNewStep(s => ({ ...s, duration: e.target.value }))}
                            className="w-20 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Duration"
                          />
                          <button type="button" onClick={handleAddStep} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">Add</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6 space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {isEditing ? 'Update Video' : 'Save Video'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Videos Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left text-gray-800 dark:text-white font-semibold">ID</th>
                    <th className="py-3 px-4 text-left text-gray-800 dark:text-white font-semibold">Title</th>
                    <th className="py-3 px-4 text-left text-gray-800 dark:text-white font-semibold">Duration</th>
                    <th className="py-3 px-4 text-left text-gray-800 dark:text-white font-semibold">Body Focus</th>
                    <th className="py-3 px-4 text-left text-gray-800 dark:text-white font-semibold">Difficulty</th>
                    <th className="py-3 px-4 text-left text-gray-800 dark:text-white font-semibold">Thumbnail</th>
                    <th className="py-3 px-4 text-center text-gray-800 dark:text-white font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="py-4 px-4 text-center text-gray-500 dark:text-gray-400">
                        Loading videos...
                      </td>
                    </tr>
                  ) : !Array.isArray(videos) || videos.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-4 px-4 text-center text-gray-500 dark:text-gray-400">
                        No videos found. Add your first video!
                      </td>
                    </tr>
                  ) : (
                    videos.map((video) => (
                      <tr key={video.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                        <td className="py-3 px-4 text-gray-800 dark:text-white">
                          {video.id}
                        </td>
                        <td className="py-3 px-4 text-gray-800 dark:text-white">
                          {video.title}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                          {video.duration} min
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                          {video.bodyFocus}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                          {video.difficulty}
                        </td>
                        <td className="py-3 px-4">
                          {video.image_url && (
                            <img 
                              src={video.image_url} 
                              alt={video.title} 
                              className="h-12 w-20 object-cover rounded" 
                            />
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleEditVideo(video)}
                              className="p-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                            >
                              <FontAwesomeIcon icon={faPencilAlt} />
                            </button>
                            <button
                              onClick={() => handleDeleteVideo(video.id)}
                              className="p-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 