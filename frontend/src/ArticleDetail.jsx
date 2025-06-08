import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
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
import { useDarkMode } from './context/DarkModeContext';
import axios from 'axios';

// Import images
import groceryImg from "./assets/images/grocery-list.png";
import imageImg from "./assets/images/image.png";
import imagesImg from "./assets/images/images.png";
import timeImg from "./assets/images/typcn_time.png";

// Default placeholder if images aren't available
const defaultImage = 'https://via.placeholder.com/800x400?text=FitZone+Article';
// These would normally be imported properly
const grocery = groceryImg;
const images = imagesImg;
const time = timeImg;

export default function ArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [userName, setUserName] = useState('');
  const [userFirstName, setUserFirstName] = useState(localStorage.getItem('firstName') || 'Guest');
  const [userLastName, setUserLastName] = useState(localStorage.getItem('lastName') || '');
  const [userProfileImage, setUserProfileImage] = useState(localStorage.getItem('profileImage') || 'https://via.placeholder.com/150');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
      fetchArticle();
    } else {
      window.location.href = '/login';
    }
  }, [id]);

  const parseArticleContent = (content) => {
    // تقسيم المحتوى إلى مقدمة وأقسام
    if (!content) return { introduction: '', sections: [] };
    
    // تقسيم المحتوى بناءً على علامات العنوان ##
    const parts = content.split(/##\s+/);
    const introduction = parts[0].trim();
    
    // استخراج الأقسام
    const sections = [];
    for (let i = 1; i < parts.length; i++) {
      const sectionText = parts[i].trim();
      const lines = sectionText.split('\n');
      const title = lines[0].trim();
      const content = lines.slice(1).join('\n').trim();
      
      if (title) {
        sections.push({ title, content });
      }
    }
    
    return { introduction, sections };
  };

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://127.0.0.1:8000/api/articles/${id}/`);
      setArticle(response.data);
      
      // Use a different endpoint for related articles that doesn't increment views
      const articlesResponse = await axios.get('http://127.0.0.1:8000/api/articles/list/');
      const relatedList = articlesResponse.data
        .filter(a => a.id !== parseInt(id) && a.category === response.data.category)
        .slice(0, 3);
      setRelatedArticles(relatedList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching article:', error);
      setError('Failed to load article. Please try again later.');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!article) {
    return <div className="flex justify-center items-center h-screen">Article not found</div>;
  }

  return (
    <div className={`w-full min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
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
      <div className="bg-white dark:bg-gray-800 text-black dark:text-white px-4 py-6 md:px-10 lg:px-20">
        <div className="max-w-[1150px] mx-auto flex flex-col lg:flex-row gap-6">
          {/* Article Content */}
          <div className="lg:w-[70%] space-y-6 text-left mt-6">
            <div>
              <h1 className="text-2xl font-bold mb-2 dark:text-white">
                {article.title}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {article.author?.username || "Admin"} gives you the diet goods on what it takes to get good and ripped.
              </p>
              <img 
                src={article.image_url || grocery} 
                alt={article.title} 
                className="rounded-xl w-full h-auto mb-4" 
              />
              <div className="container max-w-4xl mx-auto px-6 py-8">
                <div className="space-y-6">
                  {/* Article Introduction */}
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    {parseArticleContent(article.content).introduction.split('\n').map((paragraph, idx) => (
                      paragraph ? <p key={idx}>{paragraph}</p> : null
                    ))}
                  </div>
                  
                  {/* Article Sections */}
                  {parseArticleContent(article.content).sections.map((section, index) => (
                    <div key={index} className="mt-8">
                      <h2 className="text-2xl font-bold mb-4 dark:text-white">{section.title}</h2>
                      <div className="prose prose-lg dark:prose-invert max-w-none">
                        {section.content.split('\n').map((paragraph, idx) => (
                          paragraph ? <p key={idx}>{paragraph}</p> : null
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Related Articles */}
          <aside className="lg:w-[30%] space-y-6 text-left mt-24">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Related recommendations for you</h2>
            <div className="space-y-4">
              {relatedArticles.map((relatedArticle) => (
                <Link 
                  to={`/article/${relatedArticle.id}`}
                  key={relatedArticle.id}
                  className="block bg-white dark:bg-gray-700 rounded-xl overflow-hidden shadow hover:shadow-md transition"
                >
                  <img 
                    src={relatedArticle.image_url || images} 
                    alt={relatedArticle.title} 
                    className="w-full h-[110px] object-cover" 
                  />
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">
                      {relatedArticle.title}
                    </h3>
                    <div className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                      <img src={time} alt="time" className="w-4 h-4" />
                      {relatedArticle.readTime}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-500 to-blue-800 dark:from-gray-800 dark:to-gray-900 text-white py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-start justify-between">
            <div className="mb-8 md:mb-0">
              <Link to="/home" className="flex items-center hover:opacity-80 transition-opacity">
                <span className="text-orange-500 dark:text-orange-400 text-2xl font-bold">FIT</span>
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