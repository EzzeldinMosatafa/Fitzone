import React, { useState, useEffect, useRef } from 'react';
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
  faArrowRight,
  faUpload,
  faCheckCircle,
  faDownload,
  faBars,
  faTimes,
  faUser,
  faSignOutAlt,
  faRobot,
  faLink,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import { 
  faFacebookF, 
  faInstagram, 
  faTiktok, 
  faLinkedinIn, 
  faYoutube 
} from '@fortawesome/free-brands-svg-icons';
import exerciseImage from './assets/images/CN1.png';
import aiCorrectionImage from './assets/images/CN3.png';
import uploadImage from './assets/images/upload.png';
import squatImage from './assets/images/Squat.png';
import signupImage from './assets/images/signup.png';
import pushUpImage from './assets/images/pushUp.png';
import plankImage from './assets/images/Plank.png';
import runningImage from './assets/images/RunningInPlace.png';
import dumbbellCurlImage from './assets/images/DumbbellAlternateBicepCurl.png';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:8000';

export default function AIWorkoutCorrection() {
  const [userName] = useState(localStorage.getItem('userName') || 'Guest');
  const [userFirstName] = useState(localStorage.getItem('firstName') || 'Guest');
  const [userLastName] = useState(localStorage.getItem('lastName') || '');
  const [userProfileImage] = useState(localStorage.getItem('profileImage') || 'https://via.placeholder.com/150');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

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

  const [selectedExercise, setSelectedExercise] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [processedVideoUrl, setProcessedVideoUrl] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const exercises = [
    { id: 1, name: "Squat", image: squatImage },
    { id: 2, name: "RunningInPlace", image: runningImage },
    { id: 3, name: "pushUp", image: pushUpImage },
    { id: 4, name: "Plank", image: plankImage },
    { id: 5, name: "Lunges", image: signupImage },
    { id: 6, name: "DumbbellAlternateBicepCurl", image: dumbbellCurlImage }
  ];

  // API endpoint mapping for each exercise
  const exerciseEndpoints = {
    Squat: 'http://localhost:8000/api/analyze-squat/',
    RunningInPlace: 'http://localhost:8000/api/analyze-running/',
    pushUp: 'http://localhost:8000/api/analyze-pushup/',
    Plank: 'http://localhost:8000/api/analyze-plank/',
    Lunges: 'http://localhost:8000/api/analyze-lunges/',
    DumbbellAlternateBicepCurl: 'http://localhost:8000/api/analyze-bicepcurl/'
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setSelectedFile(file);
        setIsProcessing(true);
        setError(null);
        setUploadProgress(0);

        // Log file details
        console.log('File details:', {
          name: file.name,
          type: file.type,
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        });

        // Check file size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
          throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) is too large. Maximum size is 50MB`);
        }

        // Check file type
        if (!file.type.startsWith('video/')) {
          throw new Error(`Invalid file type: ${file.type}. Please upload a valid video file`);
        }

        const formData = new FormData();
        formData.append('video', file);

        console.log('Sending request to:', exerciseEndpoints[selectedExercise.name]);
        const endpoint = exerciseEndpoints[selectedExercise.name];
        
        try {
          const response = await axios.post(endpoint, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(progress);
              console.log(`Upload progress: ${progress}%`);
            }
          });

          console.log('Received response:', response.data);
          
          if (response.data.error) {
            throw new Error(`Server Error: ${response.data.error}`);
          }

          setProcessedVideoUrl(`${BACKEND_URL}${response.data.processed_video_url}`);
          setAnalysisResults(response.data.analysis);
          setAnalysisComplete(true);
        } catch (networkErr) {
          console.error('Network or Server Error:', networkErr);
          
          // Extract detailed error message
          let errorMessage = 'Error processing video. Please try again.';
          if (networkErr.response) {
            // Server responded with error
            console.log('Server Error Details:', networkErr.response.data);
            if (networkErr.response.data.error) {
              errorMessage = `Server Error: ${networkErr.response.data.error}`;
            }
            if (networkErr.response.data.details) {
              errorMessage += `\nDetails: ${networkErr.response.data.details}`;
            }
          } else if (networkErr.request) {
            // Request made but no response
            errorMessage = 'No response from server. Please check your connection.';
          } else {
            // Error setting up request
            errorMessage = `Request Error: ${networkErr.message}`;
          }
          throw new Error(errorMessage);
        }
      } catch (err) {
        console.error('Final Error:', err);
        setError(err.message);
      } finally {
        setIsProcessing(false);
      }
    }
  };



  const handleReset = () => {
    setSelectedExercise(null);
    setUploadProgress(0);
    setAnalysisComplete(false);
    setSelectedFile(null);
    setProcessedVideoUrl(null);
    setAnalysisResults(null);
    setError(null);
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
        <div className="w-64 bg-blue-600 dark:bg-gray-800 text-white min-h-screen p-4 hidden md:block">
          <div className="space-y-4">
            <Link to="/quickaccess" className="flex items-center space-x-2 p-2 hover:bg-blue-700 dark:hover:bg-gray-700 rounded transition">
              <FontAwesomeIcon icon={faHome} />
              <span>Quick Access</span>
            </Link>
            <Link to="/aiworkoutcorrection" className="flex items-center space-x-2 p-2 bg-blue-700 dark:bg-gray-700 rounded">
              <FontAwesomeIcon icon={faChartLine} />
              <span>AI Workout Correction</span>
            </Link>
            <Link to="/workoutlibrary" className="flex items-center space-x-2 p-2 hover:bg-blue-700 dark:hover:bg-gray-700 rounded transition">
              <FontAwesomeIcon icon={faDumbbell} />
              <span>Workout Library</span>
            </Link>
            <Link to="/fitnessarticles" className="flex items-center space-x-2 p-2 hover:bg-blue-700 dark:hover:bg-gray-700 rounded transition">
              <FontAwesomeIcon icon={faBook} />
              <span>Fitness Articles</span>
            </Link>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 dark:text-white">AI Workout Correction</h1>
            
            {!selectedExercise ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-semibold mb-6 dark:text-white">Select an Exercise</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {exercises.map(exercise => (
                    <div 
                      key={exercise.id}
                      onClick={() => setSelectedExercise(exercise)}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow hover:shadow-lg transition cursor-pointer"
                    >
                      <img 
                        src={exercise.image} 
                        alt={exercise.name} 
                        className="w-full h-40 object-cover rounded-md mb-3"
                      />
                      <h3 className="text-lg font-semibold dark:text-white">{exercise.name}</h3>
                      <button className="mt-2 text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                        Select <FontAwesomeIcon icon={faArrowRight} className="ml-1" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold dark:text-white">
                    {selectedExercise.name} Correction
                  </h2>
                  <button 
                    onClick={handleReset}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Change Exercise
                  </button>
                </div>



                {!analysisComplete ? (
                  <div className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold dark:text-white">
                          Upload Instructions
                        </h3>

                        {/* Add error display here */}
                        {error && (
                          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline whitespace-pre-line">{error}</span>
                            <p className="mt-2 text-sm">
                              Please make sure:
                              <ul className="list-disc ml-5 mt-1">
                                <li>The video file is in MP4, MOV, or AVI format</li>
                                <li>The file size is less than 50MB</li>
                                <li>The video shows the full body clearly</li>
                                <li>There is good lighting in the video</li>
                              </ul>
                            </p>
                          </div>
                        )}

                        <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                          <li className="flex items-start">
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1 flex-shrink-0">1</span>
                            Ensure good lighting conditions
                          </li>
                          <li className="flex items-start">
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1 flex-shrink-0">2</span>
                            Capture your full body in the frame
                          </li>
                          <li className="flex items-start">
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1 flex-shrink-0">3</span>
                            Upload a clear video of your exercise
                          </li>
                        </ul>
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center w-full">
                          <FontAwesomeIcon icon={faUpload} className="text-4xl text-gray-400 mb-4" />
                          <p className="text-gray-500 dark:text-gray-400 mb-4">Drag and drop your video file here</p>
                          <p className="text-gray-400 text-sm mb-4">or</p>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="video/*"
                            className="hidden"
                          />
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                          >
                            Browse Files
                          </button>
                          {selectedFile && (
                            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                              Selected file: {selectedFile.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {uploadProgress > 0 && (
                      <div className="space-y-4">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-center text-gray-600 dark:text-gray-400">
                          Uploading... {uploadProgress}%
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                      <h3 className="text-xl font-semibold mb-4 dark:text-white">Processed Video</h3>
                      {processedVideoUrl && (
                        <div className="relative aspect-video mb-4">
                          <video
                            key={processedVideoUrl}
                            controls
                            autoPlay
                            className="w-full h-full rounded-lg"
                            onError={(e) => {
                              console.error('Video playback error:', e);
                            }}
                            onLoadedData={(e) => {
                              // Start playing when video is loaded
                              e.target.play().catch(error => {
                                console.log("Autoplay prevented:", error);
                              });
                            }}
                          >
                            <source 
                              src={processedVideoUrl} 
                              type="video/mp4"
                              onError={(e) => {
                                console.error('MP4 format not supported, trying alternative formats');
                              }}
                            />
                            <source 
                              src={processedVideoUrl} 
                              type="video/webm"
                              onError={(e) => {
                                console.error('WebM format not supported, trying alternative formats');
                              }}
                            />
                            <source 
                              src={processedVideoUrl} 
                              type="video/x-msvideo"
                              onError={(e) => {
                                console.error('AVI format not supported');
                              }}
                            />
                            <p className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded">
                              Your browser does not support the video playback. Please 
                              <a 
                                href={processedVideoUrl}
                                download={`${selectedExercise.name}-analysis.mp4`}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 ml-1"
                              >
                                download the video
                              </a> 
                              to view it.
                            </p>
                          </video>
                          <a
                            href={processedVideoUrl}
                            download={`${selectedExercise.name}-analysis.mp4`}
                            className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <FontAwesomeIcon icon={faDownload} className="mr-2" />
                            Download Video
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                      <h3 className="text-xl font-semibold mb-4 dark:text-white">Analysis Results</h3>
                      {analysisResults && (
                        <div className="space-y-4">
                          {Object.entries(analysisResults).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <span className="font-medium dark:text-white">{key}</span>
                              <span className="text-gray-600 dark:text-gray-300">{value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={handleReset}
                        className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        Analyze Another Exercise
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 dark:text-white">How It Works</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: faUpload,
                    title: "Upload Video",
                    description: "Upload your workout video for analysis"
                  },
                  {
                    icon: faChartLine,
                    title: "AI Analysis",
                    description: "Our advanced algorithms analyze your form in real-time"
                  },
                  {
                    icon: faCheckCircle,
                    title: "Get Feedback",
                    description: "Receive instant corrections and improvement suggestions"
                  }
                ].map((item, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                    <FontAwesomeIcon 
                      icon={item.icon} 
                      className="text-3xl text-blue-600 dark:text-blue-400 mb-4" 
                    />
                    <h3 className="text-lg font-semibold mb-2 dark:text-white">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
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