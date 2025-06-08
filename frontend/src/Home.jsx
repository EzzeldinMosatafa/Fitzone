import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft,
  faChevronRight,
  faEnvelope,
  faMoon,
  faSun,
  faBars,
  faTimes,
  faUser,
  faSignOutAlt,
  faRobot,
  faLink,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import { faFacebookF } from '@fortawesome/free-brands-svg-icons/faFacebookF';
import { faInstagram } from '@fortawesome/free-brands-svg-icons/faInstagram';
import { faTiktok } from '@fortawesome/free-brands-svg-icons/faTiktok';
import { faLinkedinIn } from '@fortawesome/free-brands-svg-icons/faLinkedinIn';
import { faYoutube } from '@fortawesome/free-brands-svg-icons/faYoutube';
import sub from "./assets/images/subscribe.png";
import mariam from "./assets/images/mariam.png";
import demo from "./assets/images/demo.png";
import home from "./assets/images/home.png";
import workout from "./assets/images/workouts.png";
import axios from 'axios';

export default function Home() {
  const [userName, setUserName] = useState('');
  const [userFirstName, setUserFirstName] = useState(localStorage.getItem('firstName') || 'Guest');
  const [userLastName, setUserLastName] = useState(localStorage.getItem('lastName') || '');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [userProfileImage, setUserProfileImage] = useState(localStorage.getItem('profileImage') || 'https://via.placeholder.com/150');
  const [newsletterData, setNewsletterData] = useState({
    name: '',
    email: ''
  });
  const [subscribeStatus, setSubscribeStatus] = useState({
    message: '',
    isError: false
  });
  const iconColor = "text-orange-600";
  const navigate = useNavigate();
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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    } else {
      navigate('/login');
    }

    const interval = setInterval(() => {
      nextSlide();
    }, 3000);

    return () => clearInterval(interval);
  }, [navigate]);

  const testimonials = [
    {
      name: 'Mariam Ayman',
      location: 'Egypt, Cairo',
      feedback: 'Great work has been done on the AI correction tool. I actually access this tool every day to correct my workouts and have insightful feedback each time.',
      image: mariam,
    },
    {
      name: 'Ahmed Mohamed',
      location: 'Saudi Arabia, Riyadh',
      feedback: 'The personalized workouts have transformed my fitness routine. Highly recommended for anyone serious about their health!',
      image: mariam,
    },
    {
      name: 'John Smith',
      location: 'USA, New York',
      feedback: 'The AI-driven corrections are incredibly accurate. It feels like having a personal trainer 24/7!',
      image: mariam,
    },
    {
      name: 'Sarah Johnson',
      location: 'UK, London',
      feedback: 'This platform has completely changed how I approach fitness. The AI analysis is spot on!',
      image: mariam,
    },
    {
      name: 'David Wilson',
      location: 'Canada, Toronto',
      feedback: "I've tried many fitness apps, but none come close to the precision of this AI tool.",
      image: mariam,
    },
    {
      name: 'Emma Davis',
      location: 'Australia, Sydney',
      feedback: 'The workout corrections have helped me avoid injuries and improve my form significantly.',
      image: mariam,
    },
  ];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % (testimonials.length - 2));
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 3 : prevIndex - 1
    );
  };

  const handleNewsletterChange = (e) => {
    const { id, value } = e.target;
    setNewsletterData(prev => ({
      ...prev,
      [id === 'first-name' ? 'name' : 'email']: value
    }));
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    if (!newsletterData.name || !newsletterData.email) {
      setSubscribeStatus({
        message: 'Please fill in all fields',
        isError: true
      });
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/newsletter/subscribe/', newsletterData);
      
      if (response.status === 201 || response.status === 200) {
        setSubscribeStatus({
          message: 'Thank you for subscribing to our newsletter!',
          isError: false
        });
        setNewsletterData({ name: '', email: '' }); // Clear form
      }
    } catch (error) {
      setSubscribeStatus({
        message: error.response?.data?.message || 'Failed to subscribe. Please try again.',
        isError: true
      });
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 dark:bg-gray-900">
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

      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 dark:from-gray-900 dark:to-gray-800 text-white py-16 px-6">
        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between">
          <div className="text-center lg:text-left lg:w-1/2 space-y-8">
            <h1 className="text-4xl md:text-5xl font-bold">Get personalized</h1>
            <h2 className="text-4xl md:text-5xl font-bold text-orange-500">AI-Driven workouts</h2>
            <div className="pt-4">
              <Link to="/quickaccess">
                <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg text-lg transition">
                  Start now!
                </button>
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2 flex justify-center mt-8 lg:mt-0">
            <img src={home} alt="Home" className="rounded-lg max-w-full h-auto" />
          </div>
        </div>
      </section>

      {/* Second Section */}
      <section className="bg-white dark:bg-gray-800 py-16 px-6">
        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between">
          <div className="lg:w-1/2 flex justify-center mb-8 lg:mb-0">
            <img src={demo} alt="Demo" className="rounded-lg max-w-full h-auto" />
          </div>
          <div className="lg:w-1/2 text-center lg:text-left space-y-8 lg:pl-12">
            <h3 className="text-xl font-semibold text-orange-500">Try our</h3>
            <h2 className="text-3xl md:text-4xl font-bold dark:text-white">AI Workout correction demo!</h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Personalized experience designed for you to make the most out of your workout session with the power of Artificial Intelligence.
            </p>
            <div className="pt-4">
              <Link to="/aiworkoutcorrection">
                <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg text-lg transition">
                  Try it now
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* New Workout Intense Sessions Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 dark:from-gray-900 dark:to-gray-800 text-white py-16 px-6">
        <div className="container mx-auto flex flex-col lg:flex-row-reverse items-center justify-between">
          <div className="lg:w-1/2 flex justify-center mb-8 lg:mb-0">
            <img src={workout} alt="Workout Sessions" className="rounded-lg max-w-full h-auto shadow-xl" />
          </div>
          
          <div className="lg:w-1/2 text-center lg:text-left space-y-8 lg:pr-12">
            <h3 className="text-xl font-semibold text-gray-300">Start from scratch with our</h3>
            <h1 className="text-4xl font-bold text-orange-400">Workout Intense Sessions</h1>
            <p className="text-gray-300 text-lg">
              Workout intense sessions designed to plan your daily workout time for better fitness outcome.
            </p>
            <div className="pt-4">
              <Link to="/workoutlibrary">
                <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg text-lg transition w-full md:w-auto">
                  Explore
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <section className="bg-white dark:bg-gray-800 py-16 px-6">
        <div className="container mx-auto">
          <h4 className="text-center text-xl font-semibold mb-2 dark:text-white">See our</h4>
          <h2 className="text-3xl font-bold text-orange-500 text-center mb-12">Success stories!</h2>
          
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 33.33}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-1/3 flex-shrink-0 px-4">
                    <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg text-center h-full">
                      <div className="w-24 h-24 mx-auto mb-6 overflow-hidden rounded-full border-4 border-orange-500">
                        <img 
                          src={testimonial.image} 
                          alt={testimonial.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">{testimonial.name}</h3>
                      <p className="text-orange-600 mb-4">{testimonial.location}</p>
                      <p className="text-gray-600 dark:text-gray-300 italic">"{testimonial.feedback}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-700 rounded-full p-3 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition"
            >
              <FontAwesomeIcon icon={faChevronLeft} className={iconColor} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-700 rounded-full p-3 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition"
            >
              <FontAwesomeIcon icon={faChevronRight} className={iconColor} />
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 dark:from-gray-900 dark:to-gray-800 text-white py-16 px-6">
        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between">
          <div className="lg:w-1/2 text-center lg:text-left space-y-8 mb-8 lg:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold">
              Subscribe to our <span className="text-orange-500">Newsletter!</span>
            </h2>
            {subscribeStatus.message && (
              <div className={`p-4 rounded-lg ${subscribeStatus.isError ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'}`}>
                {subscribeStatus.message}
              </div>
            )}
            <form onSubmit={handleNewsletterSubmit} className="space-y-6 max-w-md mx-auto lg:mx-0">
              <div>
                <label htmlFor="first-name" className="block text-white font-medium mb-2 text-left">Name</label>
                <input
                  type="text"
                  id="first-name"
                  value={newsletterData.name}
                  onChange={handleNewsletterChange}
                  placeholder="Type your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-800 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-white font-medium mb-2 text-left">Email</label>
                <input
                  type="email"
                  id="email"
                  value={newsletterData.email}
                  onChange={handleNewsletterChange}
                  placeholder="Type your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-800 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg flex items-center justify-center transition"
              >
                <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                Subscribe
              </button>
            </form>
          </div>
          <div className="lg:w-1/2 flex justify-center">
            <img src={sub} alt="Subscribe" className="max-w-full h-auto" />
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gradient-to-r from-blue-900 to-blue-700 dark:from-gray-900 dark:to-gray-800 text-white py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-start justify-between">
            {/* Logo Section */}
            <div className="mb-8 md:mb-0">
              <Link to="/home" className="flex items-center hover:opacity-80 transition-opacity">
                <span className="text-orange-500 text-2xl font-bold">FIT</span>
                <span className="text-white text-2xl font-bold">Zone</span>
              </Link>
              <p className="mt-2 text-sm text-gray-300">Your ultimate fitness companion</p>
            </div>

            {/* Content Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 md:px-12">
              {/* Workouts Column */}
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

              {/* About FITZone Column */}
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

              {/* Social Media Column */}
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

          {/* Divider and Copyright */}
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-300">
            <p>Copyright © 2024 FITZone. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
