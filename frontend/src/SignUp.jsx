import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faChevronDown, faBars, faXmark, faEnvelope, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faInstagram, faTiktok, faLinkedinIn, faYoutube } from '@fortawesome/free-brands-svg-icons';
import trainerImage from './assets/images/signup.png';

const SignUp = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    target: '',
    source: '',
    terms_accepted: false
  });
  const [errors, setErrors] = useState({});

  const targetOptions = [
    'Lose weight',
    'Gain muscle',
    'Improve flexibility',
    'General fitness'
  ];

  const sourceOptions = [
    'Social Media',
    'Friend Recommendation',
    'Google Search',
    'Other'
  ];

  const features = [
    'AI Driven correction for workouts',
    'AI Workout planner',
    'Numerous resources for fitness enthusiasts',
    'Full daily workout guidance',
    'Exclusive workout/fitness library for better health'
  ];

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    if (!formData.target) newErrors.target = 'Please select your fitness target';
    if (!formData.terms_accepted) {
      newErrors.terms_accepted = 'You must accept the terms and conditions';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await axios.post('http://localhost:8000/api/users/register/', {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirm_password,
          target: formData.target,
          source: formData.source
        });
        if (response.status === 201) {
          navigate('/login');
        }
      } catch (error) {
        setErrors(error.response?.data || { general: 'Registration failed' });
      }
    } else {
      setErrors(newErrors);
    }
  };

  const handleProtectedLink = (e) => {
    e.preventDefault();
    alert('Please login first to access this page');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
                  {/* Navbar */}
            <nav className="bg-white dark:bg-gray-800 text-black dark:text-white py-4 px-6 shadow-md relative">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/home" onClick={handleProtectedLink} className="text-2xl font-bold text-orange-500 dark:text-orange-400">
                        FitZone
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex flex-wrap justify-center gap-6">
                        <Link to="/home" onClick={handleProtectedLink} className="text-black dark:text-white hover:text-orange-500">Home</Link>
                        <Link to="/quickaccess" onClick={handleProtectedLink} className="text-black dark:text-white hover:text-orange-500">Quick Access</Link>
                        <Link to="/fitnessarticles" onClick={handleProtectedLink} className="text-black dark:text-white hover:text-orange-500">Fitness Articles</Link>
                        <Link to="/workoutlibrary" onClick={handleProtectedLink} className="text-black dark:text-white hover:text-orange-500">Workout Library</Link>
                        <Link to="/About" onClick={handleProtectedLink} className="text-black dark:text-white hover:text-orange-500">About</Link>
                        <Link to="/CoreServices" onClick={handleProtectedLink} className="text-black dark:text-white hover:text-orange-500">Core Services</Link>
                    </div>

                    {/* Desktop Controls */}
                    <div className="hidden md:flex items-center space-x-4">
                        <span className="text-lg dark:text-white">Hello, Guest!</span>
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors duration-200"
                        >
                            <FontAwesomeIcon 
                                icon={darkMode ? faSun : faMoon} 
                                className="text-xl text-orange-500 dark:text-orange-400" 
                            />
                        </button>
                        <Link
                            to="/login"
                            className="bg-orange-600 text-white py-2 px-6 rounded-lg hover:bg-orange-700 transition-colors duration-200"
                        >
                            Login
                        </Link>
                    </div>

                    {/* Mobile Controls */}
                    <div className="flex items-center gap-4 md:hidden">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        >
                            <FontAwesomeIcon 
                                icon={darkMode ? faSun : faMoon} 
                                className="text-xl text-orange-500 dark:text-orange-400" 
                            />
                        </button>
                        <Link
                            to="/login"
                            className="bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 text-sm"
                        >
                            Login
                        </Link>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-2xl focus:outline-none text-orange-500 dark:text-orange-400"
                        >
                            <FontAwesomeIcon icon={isMenuOpen ? faXmark : faBars} />
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                <div className={`md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300 ease-in-out transform z-50 ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'} ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                    <div className="flex flex-col py-4">
                        <div className="px-6 py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-lg text-gray-600 dark:text-gray-300">Hello, Guest!</span>
                        </div>
                        <Link to="/home" onClick={handleProtectedLink} className="px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">Home</Link>
                        <Link to="/quickaccess" onClick={handleProtectedLink} className="px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">Quick Access</Link>
                        <Link to="/fitnessarticles" onClick={handleProtectedLink} className="px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">Fitness Articles</Link>
                        <Link to="/workoutlibrary" onClick={handleProtectedLink} className="px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">Workout Library</Link>
                        <Link to="/About" onClick={handleProtectedLink} className="px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">About</Link>
                        <Link to="/CoreServices" onClick={handleProtectedLink} className="px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">Core Services</Link>
                    </div>
                </div>
            </nav>

      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-800 dark:from-gray-800 dark:to-gray-900 text-center py-10">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-white dark:text-gray-200">start your</span>
          <br />
          <span className="text-orange-500 dark:text-orange-400">professional fitness journey</span>
        </h1>
        <p className="text-white dark:text-gray-300 text-sm">
          Take your first step and create an account to be able to get
          <br />the full access for all our AI-driven features
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Side - Form */}
        <div className="flex-1 flex flex-col justify-start py-8 px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Create an account</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  placeholder="Type your first name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`mt-1 appearance-none block w-full px-3 py-2 border ${
                    errors.first_name ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0051C3] focus:border-[#0051C3] dark:bg-gray-700 dark:text-white dark:border-gray-600`}
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  placeholder="Type your last name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`mt-1 appearance-none block w-full px-3 py-2 border ${
                    errors.last_name ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0051C3] focus:border-[#0051C3] dark:bg-gray-700 dark:text-white dark:border-gray-600`}
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Type your email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`mt-1 appearance-none block w-full px-3 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0051C3] focus:border-[#0051C3] dark:bg-gray-700 dark:text-white dark:border-gray-600`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Establish a password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`mt-1 appearance-none block w-full px-3 py-2 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0051C3] focus:border-[#0051C3] dark:bg-gray-700 dark:text-white dark:border-gray-600`}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                <input
                  type="password"
                  name="confirm_password"
                  placeholder="Confirm your password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className={`mt-1 appearance-none block w-full px-3 py-2 border ${
                    errors.confirm_password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0051C3] focus:border-[#0051C3] dark:bg-gray-700 dark:text-white dark:border-gray-600`}
                />
                {errors.confirm_password && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">What is your target from starting the fitness journey with us?</label>
                <select
                  name="target"
                  value={formData.target}
                  onChange={handleChange}
                  className={`mt-1 appearance-none block w-full px-3 py-2 border ${
                    errors.target ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm text-gray-700 focus:outline-none focus:ring-[#0051C3] focus:border-[#0051C3] dark:bg-gray-700 dark:text-white dark:border-gray-600`}
                >
                  <option value="">Select from the list</option>
                  {targetOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.target && (
                  <p className="mt-1 text-sm text-red-600">{errors.target}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">How did you hear about us?</label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 focus:outline-none focus:ring-[#0051C3] focus:border-[#0051C3] dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  <option value="">Select from the list</option>
                  {sourceOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    name="terms_accepted"
                    checked={formData.terms_accepted}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#FF6B00] focus:ring-[#FF6B00] border-gray-300 rounded dark:border-gray-600"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="text-gray-700 dark:text-gray-300">
                    I have read and agree to the Terms of Use and Privacy Policy
                  </label>
                </div>
              </div>
              {errors.terms_accepted && (
                <p className="mt-1 text-sm text-red-600">{errors.terms_accepted}</p>
              )}

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FF6B00] hover:bg-[#E65000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B00]"
              >
                Create Account
              </button>

              <div className="text-center mt-4">
                <Link 
                  to="/login" 
                  className="text-sm text-[#0051C3] hover:text-[#003C8F] font-medium dark:text-blue-400 dark:hover:text-blue-300"
                >
                  I already have an account, log in
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side */}
        <div className="hidden lg:block relative w-0 flex-1">
          <div className="absolute inset-0 flex flex-col px-10 pt-20">
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 dark:text-white">With <span className="text-[#0051C3]">Fit</span><span className="text-[#FF6B00]">Zone</span></h2>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <FontAwesomeIcon icon={faCheck} className="mr-3 text-[#00C853]" />
                    <span className="text-lg text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-auto">
              <img
                src={trainerImage}
                alt="Fitness Trainer"
                className="w-full max-w-md mx-auto"
                style={{ maxHeight: '400px', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-500 to-blue-800 dark:from-gray-800 dark:to-gray-900 text-white py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-start justify-between">
            {/* Logo Section */}
            <div className="mb-8 md:mb-0">
              <Link to="/home" className="flex items-center hover:opacity-80 transition-opacity">
                <span className="text-orange-500 dark:text-orange-400 text-2xl font-bold">FIT</span>
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
                    <Link to="/workoutlibrary" className="hover:text-orange-300 dark:hover:text-orange-300 transition text-sm">
                      Workout Videos
                    </Link>
                  </li>
                  <li>
                    <Link to="/fitnessarticles" className="hover:text-orange-300 dark:hover:text-orange-300 transition text-sm">
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
                    <Link to="/about" className="hover:text-orange-300 dark:hover:text-orange-300 transition text-sm">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/coreservices" className="hover:text-orange-300 dark:hover:text-orange-300 transition text-sm">
                      Core Services
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Social Media Column */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-orange-500 dark:text-orange-400 border-b border-orange-500 dark:border-orange-400 pb-2">Our Social Media</h3>
                <div className="flex space-x-4">
                  <a href="#" className="text-orange-500 dark:text-orange-400 hover:text-orange-300 dark:hover:text-orange-300 transition text-xl">
                    <FontAwesomeIcon icon={faFacebookF} />
                  </a>
                  <a href="#" className="text-orange-500 dark:text-orange-400 hover:text-orange-300 dark:hover:text-orange-300 transition text-xl">
                    <FontAwesomeIcon icon={faInstagram} />
                  </a>
                  <a href="#" className="text-orange-500 dark:text-orange-400 hover:text-orange-300 dark:hover:text-orange-300 transition text-xl">
                    <FontAwesomeIcon icon={faTiktok} />
                  </a>
                  <a href="#" className="text-orange-500 dark:text-orange-400 hover:text-orange-300 dark:hover:text-orange-300 transition text-xl">
                    <FontAwesomeIcon icon={faLinkedinIn} />
                  </a>
                  <a href="#" className="text-orange-500 dark:text-orange-400 hover:text-orange-300 dark:hover:text-orange-300 transition text-xl">
                    <FontAwesomeIcon icon={faYoutube} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Divider and Copyright */}
          <div className="border-t border-white dark:border-gray-700 mt-8 pt-8 text-center text-sm">
            <p className="text-gray-300 dark:text-gray-400">Copyright © 2024 FITZone. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SignUp;
