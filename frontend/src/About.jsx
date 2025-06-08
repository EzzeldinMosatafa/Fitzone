import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope, 
  faMoon, 
  faSun, 
  faArrowRight, 
  faChevronLeft, 
  faChevronRight,
  faBars,
  faTimes,
  faUser,
  faSignOutAlt,
  faRobot,
  faLink,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faInstagram, faTiktok, faLinkedinIn, faYoutube } from '@fortawesome/free-brands-svg-icons';
import sub from "./assets/images/subscribe.png";
import CN3 from './assets/images/CN3.png';
import CN1 from './assets/images/CN1.png';
import nagham from './assets/images/team/Nagham Refaat.jpeg';
import omar from './assets/images/team/Omar Othman.jpeg';
import mohamed from './assets/images/team/Mohamed Hany.jpeg';
import ezzeldin from './assets/images/team/Ezzeldin Mostafa.jpeg';
import mahmoud from './assets/images/team/Mahmoud Essam.jpg';
import shahed from './assets/images/team/shahed kamel.jpg';
import reham from './assets/images/team/reham.jpg';

export default function About() {
  const [userName] = useState(localStorage.getItem('userName') || 'Guest');
  const [userFirstName] = useState(localStorage.getItem('firstName') || 'Guest');
  const [userLastName] = useState(localStorage.getItem('lastName') || '');
  const [userProfileImage] = useState(localStorage.getItem('profileImage') || 'https://via.placeholder.com/150');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [email, setEmail] = useState('');
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
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

  useEffect(() => {
    const interval = setInterval(() => {
      nextTeamSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentTeamIndex]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    alert(`Thank you for subscribing with ${email}!`);
    setEmail('');
  };

  const prevTeamSlide = () => {
    setCurrentTeamIndex((currentTeamIndex - 1 + 7) % 7);
  };

  const nextTeamSlide = () => {
    setCurrentTeamIndex((currentTeamIndex + 1) % 7);
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

      {/* About Header Section */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-500 dark:from-gray-800 dark:to-gray-900 text-white py-16 px-6">
        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between">
          <div className="text-center lg:text-left lg:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-orange-400 dark:text-orange-300">About Us</h1>
            <p className="text-xl text-blue-100 dark:text-gray-300">
              Learn more about our journey to bring FitZone to life, our mission, and our vision
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link 
                to="/coreservices" 
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg text-center transition flex items-center justify-center gap-2"
              >
                Our Services <FontAwesomeIcon icon={faArrowRight} />
              </Link>
              <Link 
                to="/workoutlibrary" 
                className="bg-white dark:bg-gray-700 text-blue-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 px-6 py-3 rounded-lg text-center transition"
              >
                Explore Workouts
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2 flex justify-center mt-8 lg:mt-0">
            <img 
              src={sub} 
              alt="About FitZone" 
              className="rounded-lg max-w-full h-auto shadow-xl dark:shadow-gray-800" 
            />
          </div>
        </div>
      </section>

      {/* Mission Statement Section */}
      <section className="bg-white dark:bg-gray-800 py-16 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6">Our Mission</h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
            We are here to facilitate your workout sessions, we are here to help you get the most out of your workouts with AI-driven solutions
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-orange-500 mb-3">Innovation</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Leveraging cutting-edge technology to revolutionize fitness training
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-orange-500 mb-3">Accessibility</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Making professional fitness guidance available to everyone
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-orange-500 mb-3">Results</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Delivering measurable improvements in health and fitness
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="container mx-auto py-10 px-4">
        <h4 className='mb-2 text-center font-bold text-xl text-black dark:text-white'>Welcome to FitZone</h4>
        <h2 className="text-3xl font-bold text-orange-500 text-center mb-12">Your fellow for healthier and more modern workout sessions</h2>

        {/* AI Feedback Section */}
        <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 py-10 px-5 mb-10 rounded-xl shadow-lg dark:shadow-gray-900">
          <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-1/2 flex justify-center mb-8 lg:mb-0">
              <img 
                src={CN3} 
                alt="AI Feedback" 
                className="rounded-lg max-w-full h-auto shadow-md dark:shadow-gray-700" 
              />
            </div>
            <div className="lg:w-1/2 text-center lg:text-left space-y-6 lg:pl-12">
              <div className="bg-orange-100 dark:bg-gray-700 w-fit px-4 py-2 rounded-full mx-auto lg:mx-0">
                <span className="text-orange-600 dark:text-orange-400 font-bold">+95%</span>
              </div>
              <h2 className="text-2xl text-blue-600 dark:text-blue-400 font-bold">Accurate AI feedback for workouts correction</h2>
              <p className="text-gray-600 dark:text-gray-300">
                We have trained our AI with numerous well-cleaned data sets and conducted numerous testings with more than 20 athletes to make sure that our model is performing perfectly providing useful feedback for our clients.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link 
                  to="/coreservices" 
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition flex items-center gap-2"
                >
                  Start now <FontAwesomeIcon icon={faArrowRight} />
                </Link>
                <Link 
                  to="/fitnessarticles" 
                  className="border border-orange-500 text-orange-500 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-700 px-6 py-3 rounded-lg transition"
                >
                  Learn more
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Workout Library Section */}
        <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 py-10 px-5 mb-10 rounded-xl shadow-lg dark:shadow-gray-900">
          <div className="container mx-auto flex flex-col lg:flex-row-reverse items-center justify-between">
            <div className="lg:w-1/2 flex justify-center mb-8 lg:mb-0">
              <img 
                src={CN1} 
                alt="Workout Library" 
                className="rounded-lg max-w-full h-auto shadow-md dark:shadow-gray-700" 
              />
            </div>
            <div className="lg:w-1/2 text-center lg:text-left space-y-6 lg:pr-12">
              <div className="bg-orange-100 dark:bg-gray-700 w-fit px-4 py-2 rounded-full mx-auto lg:mx-0">
                <span className="text-orange-600 dark:text-orange-400 font-bold">+50%</span>
              </div>
              <h2 className="text-2xl text-blue-600 dark:text-blue-400 font-bold">Health validated recorded workouts</h2>
              <p className="text-gray-600 dark:text-gray-300">
                We have designed a full guide for those who are starting their journey in the world of fitness with a full comprehensive workout library that includes a lot of various recorded workout sessions based on your needs and conditions.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link 
                  to="/workoutlibrary" 
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition flex items-center gap-2"
                >
                  Browse Library <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white dark:bg-gray-800 py-12 px-6 rounded-xl shadow-lg dark:shadow-gray-900 mb-10">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">Our Team</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
              Meet the passionate professionals behind FitZone who are dedicated to revolutionizing your fitness journey
            </p>
            <div className="relative">
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentTeamIndex * 33.33}%)` }}
                >
                  {[
                    { 
                      name: "Mahmoud Essam", 
                      role: "UI/UX Designer", 
                      bio: "Creating intuitive and engaging fitness experiences with a focus on user-centered design and modern aesthetics",
                      image: mahmoud 
                    },
                    { 
                      name: "Nagham Refaat", 
                      role: "Frontend Developer (React)", 
                      bio: "Leading the frontend development with React, creating responsive and dynamic user interfaces for the fitness platform",
                      image: nagham 
                    },
                    { 
                      name: "Reham Ashraf", 
                      role: "Frontend Developer (React)", 
                      bio: "Specializing in React development, building interactive components and ensuring seamless user experiences",
                      image: reham 
                    },
                    { 
                      name: "Ezzeldin Mostafa", 
                      role: "Full Stack Developer", 
                      bio: "Expert in Django development, implementing robust backend solutions and integrating AI features for workout analysis",
                      image: ezzeldin 
                    },
                    { 
                      name: "Omar Othman", 
                      role: "Backend Developer", 
                      bio: "Django specialist with expertise in fitness and workout tracking systems, ensuring optimal performance and data management",
                      image: omar 
                    },
                    { 
                      name: "Shahd Kamal", 
                      role: "AI Model Specialist", 
                      bio: "Leading the development of AI models for exercise analysis, creating intelligent systems for workout form detection and correction",
                      image: shahed 
                    },
                    { 
                      name: "Mohamed Hany", 
                      role: "AI Model Specialist", 
                      bio: "Expert in developing and implementing AI models for exercise analysis, specializing in workout form detection and real-time feedback systems",
                      image: mohamed 
                    }
                  ].map((member, index) => (
                    <div key={index} className="w-1/3 flex-shrink-0 px-4">
                      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow dark:shadow-gray-800">
                        <div className="w-24 h-24 bg-orange-100 dark:bg-gray-600 rounded-full mx-auto mb-4 overflow-hidden">
                          {member.image ? (
                            <img 
                              src={member.image} 
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-orange-100 dark:bg-gray-600"></div>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{member.name}</h3>
                        <p className="text-orange-500 mb-3">{member.role}</p>
                        <p className="text-gray-600 dark:text-gray-300">{member.bio}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <button
                onClick={prevTeamSlide}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-700 rounded-full p-3 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-orange-600" />
              </button>
              <button
                onClick={nextTeamSlide}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-700 rounded-full p-3 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                <FontAwesomeIcon icon={faChevronRight} className="text-orange-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 dark:from-gray-800 dark:to-gray-900 text-white py-12 px-6 rounded-xl shadow-lg">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter for the latest fitness tips, workout routines, and app updates
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button 
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
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