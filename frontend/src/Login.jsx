import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faMoon, faSun, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faInstagram, faTiktok, faLinkedinIn, faYoutube } from '@fortawesome/free-brands-svg-icons';
import api from './utils/api';
import img from './assets/images/login.png';  // تأكد من استيراد الصورة بشكل صحيح

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userName, setUserName] = useState(''); // لتخزين اسم المستخدم
    const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        // التحقق إذا كان المستخدم قد سجل دخول بالفعل
        const storedUserName = localStorage.getItem('userName');
        if (storedUserName) {
            setUserName(storedUserName); // تعيين اسم المستخدم من localStorage
            navigate('/home');  // إذا تم تسجيل الدخول بالفعل، توجيه المستخدم إلى الصفحة الرئيسية
        }
        
        // تطبيق الوضع الداكن
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', darkMode);
    }, [navigate, darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            console.log('Attempting login with:', { email }); // Debug log
            
            const response = await api.post('/users/login/', {
                email,
                password
            });
            
            console.log('Login response:', response.data); // Debug log
            
            if (response.data.tokens) {
                // Store tokens
                localStorage.setItem('access_token', response.data.tokens.access);
                localStorage.setItem('refresh_token', response.data.tokens.refresh);
                
                // Store user info
                const firstName = response.data.user.first_name;
                const lastName = response.data.user.last_name;
                const email = response.data.user.email;
                const isAdmin = response.data.user.is_admin;
                
                localStorage.setItem('firstName', firstName);
                localStorage.setItem('lastName', lastName);
                localStorage.setItem('email', email);
                localStorage.setItem('userName', firstName);
                localStorage.setItem('isAdmin', isAdmin);
                
                setUserName(firstName);
                
                // Redirect based on admin status
                if (isAdmin) {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/home');
                }
            }
        } catch (error) {
            console.error('Login error details:', error.response?.data); // Debug log
            if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else {
                setError('Login failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleProtectedLink = (e) => {
        e.preventDefault();
        alert('Please login first to access this page');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
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
                            to="/signup"
                            className="bg-orange-600 text-white py-2 px-6 rounded-lg hover:bg-orange-700 transition-colors duration-200"
                        >
                            Sign Up
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
                            to="/signup"
                            className="bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 text-sm"
                        >
                            Sign Up
                        </Link>
                        <button
                            onClick={toggleMenu}
                            className="text-2xl focus:outline-none text-orange-500 dark:text-orange-400"
                        >
                            <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
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

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <div className="bg-gradient-to-r from-blue-500 to-blue-800 dark:from-gray-800 dark:to-gray-900 text-white text-center py-10 px-4">
                    <h2 className="text-3xl font-bold">Welcome back, {userName || 'Guest'}!</h2>
                    <h3 className="text-xl font-semibold text-orange-400 dark:text-orange-300 mt-2">Sign In</h3>
                </div>
                <div className="flex flex-1 bg-white dark:bg-gray-900">
                    <div className="w-2/3 p-16 flex flex-col justify-start">
                        <form className="space-y-9">
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                    <span className="block sm:inline">{error}</span>
                                </div>
                            )}
                            <div>
                                <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-left">Enter your Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="Type your email"
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-left">Enter your Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    placeholder="Enter your password"
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="flex justify-start">
                                <Link to="/Repass1" className="text-sm text-blue-500 dark:text-blue-400 hover:underline">Forget Password?</Link>
                            </div>
                            <button
                                type="button"
                                className={`w-full bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={handleLogin}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </form>
                        <div className="text-left mt-6 text-sm text-gray-600 dark:text-gray-400">
                            Don't have an account? 
                            <Link to="/signup" className="text-blue-500 dark:text-blue-400 hover:underline"> Create Account</Link>
                        </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <img src={img} alt="Login" className="max-w-full h-auto rounded-lg" />  {/* استخدم المتغير img هنا */}
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
                                <span className="text-white text-2xl font-bold">Zone</span>
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
                    <div className="border-t border-white dark:border-gray-700 mt-8 pt-8 text-center text-sm">
                        <p>Copyright © 2024 FITZone. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Login;
