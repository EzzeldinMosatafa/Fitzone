import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import img from './assets/images/alexander-redl-d3bYmnZ0ank-unsplash.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAppleAlt,
  faDumbbell,
  faBook,
  faWeight,
  faRunning,
  faHeartbeat,
  faLeaf,
  faBrain,
  faBed,
  faUtensils,
  faGraduationCap,
  faMoon,
  faSun,
  faSearch,
  faChevronDown,
  faUser,
  faRobot,
  faLink,
  faSignOutAlt,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { 
  faFacebookF, 
  faInstagram, 
  faTiktok, 
  faLinkedinIn, 
  faYoutube 
} from '@fortawesome/free-brands-svg-icons';
import axios from 'axios';

function FitnessArticles() {
  const [userName, setUserName] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [currentPage, setCurrentPage] = useState(0);
  const [availableCategories, setAvailableCategories] = useState(['All']);
  const articlesPerPage = 4;
  const [userFirstName, setUserFirstName] = useState(localStorage.getItem('firstName') || 'Guest');
  const [userLastName, setUserLastName] = useState(localStorage.getItem('lastName') || '');
  const [userProfileImage, setUserProfileImage] = useState(localStorage.getItem('profileImage') || 'https://via.placeholder.com/150');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const iconColor = "text-orange-600";
  
  const allCategories = [
    'All',
    'Healthy Food',
    'General Fitness',
    'Workouts',
    'Learning',
    'Weight Loss',
    'Muscle Building',
    'Yoga',
    'Cardio',
    'Nutrition',
    'Mental Health',
    'Recovery'
  ];

  const categoryIcons = {
    'Healthy Food': faAppleAlt,
    'General Fitness': faDumbbell,
    'Workouts': faRunning,
    'Learning': faGraduationCap,
    'Weight Loss': faWeight,
    'Muscle Building': faDumbbell,
    'Yoga': faLeaf,
    'Cardio': faHeartbeat,
    'Nutrition': faUtensils,
    'Mental Health': faBrain,
    'Recovery': faBed
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

  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
      fetchArticles();
    } else {
      window.location.href = '/login';
    }
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://127.0.0.1:8000/api/articles/');
      
      // تحويل البيانات من الباكيند إلى الشكل المطلوب في الواجهة
      const formattedArticles = response.data.map(article => ({
        id: article.id,
        title: article.title,
        category: article.category,
        excerpt: article.content.length > 100 ? article.content.substring(0, 100) + '...' : article.content,
        readTime: article.read_time,
        image_url: article.image_url
      }));
      
      // تحديث قائمة التصنيفات المتاحة بناءً على المقالات الموجودة
      const categories = ['All'];
      formattedArticles.forEach(article => {
        if (article.category && !categories.includes(article.category)) {
          categories.push(article.category);
        }
      });
      
      setAvailableCategories(categories);
      setArticles(formattedArticles);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setError('Failed to load articles. Please try again later.');
      
      // إذا فشل الاتصال بالـ API، يمكن استخدام بيانات وهمية للاختبار فقط
      setArticles([]);
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredByCategory = activeCategory === 'All' 
    ? filteredArticles 
    : filteredArticles.filter(article => article.category === activeCategory);

  // Split articles into groups
  const groupedArticles = [];
  for (let i = 0; i < filteredByCategory.length; i += articlesPerPage) {
    groupedArticles.push(filteredByCategory.slice(i, i + articlesPerPage));
  }

  // Reset to first page when changing category
  useEffect(() => {
    setCurrentPage(0);
  }, [activeCategory]);

  const totalPages = groupedArticles.length;
  const currentArticles = groupedArticles[currentPage] || [];

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
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

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-blue-700 to-blue-500 dark:from-gray-800 dark:to-gray-900 p-8 text-white">
        <div className="w-full md:w-1/2 mb-6 md:mb-0">
          <h1 className="text-3xl md:text-4xl font-bold text-orange-400 dark:text-orange-300">Workout & Fitness Articles</h1>
          <p className="mt-2 text-base md:text-lg dark:text-gray-300">
            Explore our comprehensive collection of {articles.length} fitness articles across {availableCategories.length > 1 ? availableCategories.length - 1 : 0} categories.
          </p>
        </div>
        <div className="w-full md:w-1/2 flex justify-center md:justify-end">
          <img src={img} alt="Fitness" className="rounded-lg w-full md:w-1/2 max-w-md shadow-lg dark:shadow-gray-700" />
        </div>
      </div>

      {/* Search Section */}
      <div className="p-4 md:p-6 flex justify-center">
        <input
          type="text"
          placeholder="Search for articles by title or content..."
          className="w-full md:w-3/4 p-3 md:p-4 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Articles Section */}
      <div className="container mx-auto py-4 flex-grow">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Section */}
          <div className="lg:w-1/4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Categories</h2>
            
            <div className="space-y-2">
              {availableCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`w-full flex items-center px-4 py-2 rounded-md transition ${
                    activeCategory === category 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {category !== 'All' && (
                    <FontAwesomeIcon 
                      icon={categoryIcons[category] || faBook} 
                      className={`mr-2 ${activeCategory === category ? 'text-white' : 'text-orange-500'}`}
                    />
                  )}
                  <span>{category}</span>
                  {category !== 'All' && (
                    <span className="ml-auto text-sm">
                      ({articles.filter(a => a.category === category).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Articles List */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Available Articles ({filteredByCategory.length})
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Showing {currentPage * articlesPerPage + 1}-{Math.min((currentPage + 1) * articlesPerPage, filteredByCategory.length)} of {filteredByCategory.length}
                </span>
              </div>
            </div>
            
            {filteredByCategory.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
                <p className="text-gray-600 dark:text-gray-300">No articles match your search criteria.</p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setActiveCategory('All');
                  }}
                  className="mt-4 text-orange-500 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {currentArticles.map((article) => (
                    <div
                      key={article.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition overflow-hidden group"
                    >
                      {article.image_url && (
                        <div className="w-full h-48 overflow-hidden">
                          <img 
                            src={article.image_url} 
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center">
                            <div className={`text-2xl mr-3 ${iconColor}`}>
                              <FontAwesomeIcon icon={categoryIcons[article.category] || faBook} />
                            </div>
                            <span className="inline-block px-3 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                              {article.category}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-500 dark:text-gray-400">
                            <span className="mr-1">⏱</span>
                            <span>{article.readTime}</span>
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3 group-hover:text-orange-500 transition-colors">
                          {article.title}
                        </h3>

                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          {article.excerpt}
                        </p>

                        <div className="flex justify-end">
                          <Link 
                            to={`/article/${article.id}`}
                            className="text-blue-500 dark:text-blue-400 hover:underline flex items-center"
                          >
                            Read more <span className="ml-1">→</span>
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
            {/* Logo Section */}
            <div className="mb-8 md:mb-0">
              <Link to="/home" className="flex items-center hover:opacity-80 transition-opacity">
                <span className="text-orange-500 text-2xl font-bold">FIT</span>
                <span className="text-white dark:text-gray-200 text-2xl font-bold">Zone</span>
              </Link>
              <p className="mt-2 text-sm text-gray-300 dark:text-gray-400">Your ultimate fitness companion</p>
            </div>

            {/* Content Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 md:px-12">
              {/* Workouts Column */}
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

              {/* About FITZone Column */}
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

              {/* Social Media Column */}
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

          {/* Divider and Copyright */}
          <div className="border-t border-white dark:border-gray-700 mt-8 pt-8 text-center text-sm dark:text-gray-300">
            <p>Copyright © 2024 FITZone. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default FitnessArticles;