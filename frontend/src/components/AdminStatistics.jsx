import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUsers, faNewspaper, faVideo, faChartBar, faMoon, faSun, faSignOutAlt, faEnvelope, faDownload, faFilter } from '@fortawesome/free-solid-svg-icons';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminStatistics() {
  const [userName] = useState(localStorage.getItem('userName') || 'Admin');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [timeFilter, setTimeFilter] = useState('week');
  const [stats, setStats] = useState({
    total_users: 0,
    total_admins: 0,
    total_articles: 0,
    total_videos: 0,
    total_subscribers: 0,
    new_users_this_month: 0,
    new_users_this_week: 0,
    active_users: 0,
    most_viewed_articles: [],
    most_viewed_videos: [],
    most_active_users: [],
    user_growth_data: [],
    content_growth_data: []
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
    fetchStats();
    fetchRecentUsers();
  }, [darkMode, timeFilter]);

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
      const response = await axios.get(`http://127.0.0.1:8000/api/users/admin/stats/?time_filter=${timeFilter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setStats({
        total_users: response.data.total_users || 0,
        total_admins: response.data.total_admins || 0,
        total_articles: response.data.total_articles || 0,
        total_videos: response.data.total_videos || 0,
        total_subscribers: response.data.total_subscribers || 0,
        new_users_this_month: response.data.new_users_this_month || 0,
        new_users_this_week: response.data.new_users_this_week || 0,
        active_users: response.data.active_users || 0,
        most_viewed_articles: response.data.most_viewed_articles || [],
        most_viewed_videos: response.data.most_viewed_videos || [],
        most_active_users: response.data.most_active_users || [],
        user_growth_data: response.data.user_growth_data || [],
        content_growth_data: response.data.content_growth_data || []
      });
      setError('');
    } catch (error) {
      setError('Failed to fetch statistics.');
      if (error.response && error.response.status === 401) handleLogout();
    }
  };

  const fetchRecentUsers = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/users/?ordering=-date_joined&limit=5', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setRecentUsers(response.data.slice(0, 5));
    } catch (error) {
      // ignore
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('userName');
    localStorage.removeItem('isAdmin');
    navigate('/login');
  };

  const exportToCSV = () => {
    const headers = ['Metric', 'Value'];
    const data = [
      ['Total Users', stats.total_users],
      ['Total Admins', stats.total_admins],
      ['New Users This Month', stats.new_users_this_month],
      ['New Users This Week', stats.new_users_this_week],
      ['Total Articles', stats.total_articles],
      ['Total Videos', stats.total_videos],
      ['Total Subscribers', stats.total_subscribers],
      ['Active Users', stats.active_users]
    ];

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `statistics_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Chart configurations
  const userGrowthChartData = {
    labels: (stats.user_growth_data || []).map(d => d.date),
    datasets: [{
      label: 'User Growth',
      data: (stats.user_growth_data || []).map(d => d.count),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.1,
      fill: true
    }]
  };

  const contentGrowthChartData = {
    labels: (stats.content_growth_data || []).map(d => d.date),
    datasets: [
      {
        label: 'Articles',
        data: (stats.content_growth_data || []).map(d => d.articles),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1,
        fill: true
      },
      {
        label: 'Videos',
        data: (stats.content_growth_data || []).map(d => d.videos),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.1,
        fill: true
      },
      {
        label: 'Total Content',
        data: (stats.content_growth_data || []).map(d => d.total),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderDash: [5, 5],
        tension: 0.1,
        fill: false
      }
    ]
  };

  const contentDistributionChartData = {
    labels: ['Articles', 'Videos', 'Newsletter Subscribers'],
    datasets: [{
      data: [stats.total_articles, stats.total_videos, stats.total_subscribers],
      backgroundColor: [
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
        'rgb(255, 205, 86)'
      ]
    }]
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
          <Link to="/admin/stats" className="text-orange-500 dark:text-orange-400 font-bold underline">Statistics</Link>
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
            <Link to="/admin/videos" className="flex items-center space-x-2 p-2 hover:bg-blue-700 dark:hover:bg-gray-700 rounded">
              <FontAwesomeIcon icon={faVideo} />
              <span>Videos</span>
            </Link>
            <Link to="/admin/stats" className="flex items-center space-x-2 p-2 bg-blue-700 dark:bg-gray-700 rounded">
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
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold dark:text-white">Statistics</h1>
              <div className="flex items-center space-x-4">
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="day">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
                <button
                  onClick={exportToCSV}
                  className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                >
                  <FontAwesomeIcon icon={faDownload} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 text-red-700 p-4 rounded mb-4 border border-red-300">
                {error}
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                  <p className="text-gray-600 dark:text-gray-300">New This Month: {stats.new_users_this_month}</p>
                  <p className="text-gray-600 dark:text-gray-300">New This Week: {stats.new_users_this_week}</p>
                  <p className="text-gray-600 dark:text-gray-300">Active Users: {stats.active_users}</p>
                </div>
              </div>
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

            {/* Charts */}
            <div className="space-y-6 mb-8">
              {/* Growth Charts Row */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 dark:text-white">User Growth</h2>
                  <Line data={userGrowthChartData} />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 dark:text-white">Content Growth</h2>
                  <Line data={contentGrowthChartData} />
                </div>
              </div>
              
              {/* Content Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 dark:text-white">Content Distribution</h2>
                <div className="w-full h-[300px] flex items-center justify-center">
                  <Doughnut 
                    data={contentDistributionChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: {
                            boxWidth: 15,
                            padding: 15,
                            font: {
                              size: 13
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Most Viewed Content */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 dark:text-white">Most Viewed Articles</h2>
                <div className="space-y-4">
                  { (stats.most_viewed_articles || []).map((article, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">{article.title}</span>
                      <span className="text-gray-500 dark:text-gray-400">{article.views} views</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 dark:text-white">Most Viewed Videos</h2>
                <div className="space-y-4">
                  { (stats.most_viewed_videos || []).map((video, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">{video.title}</span>
                      <span className="text-gray-500 dark:text-gray-400">{video.views} views</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Users Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Recent Users</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border-separate border-spacing-0">
                  <thead className="bg-blue-100 dark:bg-gray-800">
                    <tr>
                      <th className="py-3 px-4 border-b-2 text-left">ID</th>
                      <th className="py-3 px-4 border-b-2 text-left">Email</th>
                      <th className="py-3 px-4 border-b-2 text-left">First Name</th>
                      <th className="py-3 px-4 border-b-2 text-left">Last Name</th>
                      <th className="py-3 px-4 border-b-2 text-left">Date Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map(user => (
                      <tr key={user.id} className="hover:bg-blue-50 dark:hover:bg-gray-800">
                        <td className="py-2 px-4 border-b">{user.id}</td>
                        <td className="py-2 px-4 border-b">{user.email}</td>
                        <td className="py-2 px-4 border-b">{user.first_name}</td>
                        <td className="py-2 px-4 border-b">{user.last_name}</td>
                        <td className="py-2 px-4 border-b">{user.date_joined ? new Date(user.date_joined).toLocaleString() : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Most Active Users */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Most Active Users</h2>
              <div className="space-y-4">
                { (stats.most_active_users || []).map((user, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="text-gray-600 dark:text-gray-300">
                      <span>{user.email}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        (Last active: {new Date(user.last_login).toLocaleDateString()})
                      </span>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400">{user.points || 0} points</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 