import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUsers, faNewspaper, faVideo, faChartBar, faMoon, faSun, faSignOutAlt, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faInstagram, faTiktok, faLinkedinIn, faYoutube } from '@fortawesome/free-brands-svg-icons';
import axios from 'axios';

export default function AdminDashboard() {
  const [userName] = useState(localStorage.getItem('userName') || 'Admin');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [stats, setStats] = useState({
    total_users: 0,
    total_admins: 0,
    total_articles: 0,
    total_videos: 0,
    total_subscribers: 0
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
    fetchStats();
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const fetchStats = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      handleLogout();
      return;
    }
    try {
      console.log('Fetching stats...');
      const response = await axios.get('http://127.0.0.1:8000/api/users/admin/stats/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Stats response:', response.data);
      setStats(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching stats:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        if (error.response.status === 401) {
          setError('You are not authorized. Please login as an admin.');
          handleLogout();
        }
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('userName');
    localStorage.removeItem('isAdmin');
    window.location.href = '/login';
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
            <Link to="/admin/dashboard" className="flex items-center space-x-2 p-2 bg-blue-700 dark:bg-gray-700 rounded">
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
            <Link to="/admin/videos" className="flex items-center space-x-2 p-2 hover:bg-blue-700 dark:hover:bg-gray-700 rounded">
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
            <h1 className="text-3xl font-bold mb-8 dark:text-white">Admin Dashboard</h1>
            {error && (
              <div className="bg-red-100 text-red-700 p-4 rounded mb-4 border border-red-300">
                {error}
              </div>
            )}
            
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Users Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon icon={faUsers} className="text-2xl text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold dark:text-white">Users</h2>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600 dark:text-gray-300">Total Users: {stats.total_users}</p>
                  <p className="text-gray-600 dark:text-gray-300">Total Admins: {stats.total_admins}</p>
                </div>
              </div>

              {/* Content Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon icon={faNewspaper} className="text-2xl text-orange-600 dark:text-orange-400" />
                  </div>
                  <h2 className="text-xl font-semibold dark:text-white">Content</h2>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600 dark:text-gray-300">Total Articles: {stats.total_articles}</p>
                  <p className="text-gray-600 dark:text-gray-300">Total Videos: {stats.total_videos}</p>
                </div>
              </div>

              {/* Newsletter Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon icon={faChartBar} className="text-2xl text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-xl font-semibold dark:text-white">Newsletter</h2>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600 dark:text-gray-300">Total Subscribers: {stats.total_subscribers}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 dark:text-white">Quick Actions</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Link to="/admin/users" className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition">
                  <div className="flex items-center space-x-3">
                    <FontAwesomeIcon icon={faUsers} className="text-blue-600 dark:text-blue-400 text-xl" />
                    <span className="text-blue-600 dark:text-blue-400 font-medium">Manage Users</span>
                  </div>
                </Link>
                <Link to="/admin/articles" className="bg-orange-50 dark:bg-orange-900 p-4 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-800 transition">
                  <div className="flex items-center space-x-3">
                    <FontAwesomeIcon icon={faNewspaper} className="text-orange-600 dark:text-orange-400 text-xl" />
                    <span className="text-orange-600 dark:text-orange-400 font-medium">Manage Articles</span>
                  </div>
                </Link>
                <Link to="/admin/videos" className="bg-green-50 dark:bg-green-900 p-4 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition">
                  <div className="flex items-center space-x-3">
                    <FontAwesomeIcon icon={faVideo} className="text-green-600 dark:text-green-400 text-xl" />
                    <span className="text-green-600 dark:text-green-400 font-medium">Manage Videos</span>
                  </div>
                </Link>
                <Link to="/admin/stats" className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition">
                  <div className="flex items-center space-x-3">
                    <FontAwesomeIcon icon={faChartBar} className="text-purple-600 dark:text-purple-400 text-xl" />
                    <span className="text-purple-600 dark:text-purple-400 font-medium">View Statistics</span>
                  </div>
                </Link>
                <Link to="/admin/newsletter" className="bg-cyan-50 dark:bg-cyan-900 p-4 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-800 transition">
                  <div className="flex items-center space-x-3">
                    <FontAwesomeIcon icon={faChartBar} className="text-cyan-600 dark:text-cyan-400 text-xl" />
                    <span className="text-cyan-600 dark:text-cyan-400 font-medium">Manage Newsletter</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-900 to-blue-700 dark:from-gray-900 dark:to-gray-800 text-white py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-start justify-between">
            <div className="mb-8 md:mb-0">
              <Link to="/admin/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
                <span className="text-orange-500 text-2xl font-bold">FIT</span>
                <span className="text-white text-2xl font-bold">Zone</span>
              </Link>
              <p className="mt-2 text-sm text-gray-300">Admin Dashboard</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 md:px-12">
              <div>
                <h3 className="text-lg font-bold mb-4 text-orange-500 border-b border-orange-500 pb-2">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/admin/users" className="text-gray-300 hover:text-orange-300 transition text-sm">
                      Manage Users
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/articles" className="text-gray-300 hover:text-orange-300 transition text-sm">
                      Manage Articles
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4 text-orange-500 border-b border-orange-500 pb-2">Content</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/admin/videos" className="text-gray-300 hover:text-orange-300 transition text-sm">
                      Manage Videos
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/stats" className="text-gray-300 hover:text-orange-300 transition text-sm">
                      View Statistics
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4 text-orange-500 border-b border-orange-500 pb-2">Social Media</h3>
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

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-300">
            <p>Copyright © 2024 FITZone. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 