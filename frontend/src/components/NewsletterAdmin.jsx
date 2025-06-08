import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaHome, FaTrash, FaEnvelope, FaUsers, FaNewspaper, FaVideo, FaChartBar, FaMoon, FaSun, FaSignOutAlt } from 'react-icons/fa';

export default function NewsletterAdmin() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [userName] = useState(localStorage.getItem('userName') || 'Admin');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const navigate = useNavigate();

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/newsletter/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      setSubscribers(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch newsletter subscribers.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscribers();
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    setSelectAll(subscribers.length > 0 && selected.length === subscribers.length);
  }, [selected, subscribers]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelected([]);
    } else {
      setSelected(subscribers.map(sub => sub.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelect = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(sid => sid !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm('Are you sure you want to delete selected subscribers?')) return;
    for (const id of selected) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/newsletter/${id}/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
      } catch (err) {}
    }
    await fetchSubscribers();
    setSelected([]);
    setSelectAll(false);
  };

  const handleSendEmail = async () => {
    if (!message.trim()) return alert('Please enter a message.');
    setSending(true);
    try {
      const selectedEmails = subscribers.filter(sub => selected.includes(sub.id)).map(sub => sub.email);
      await axios.post('http://127.0.0.1:8000/api/newsletter/send/', {
        emails: selectedEmails,
        message
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      alert('Message sent successfully!');
      setMessage('');
    } catch (err) {
      alert('Failed to send message.');
    }
    setSending(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('userName');
    localStorage.removeItem('isAdmin');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900">
      {/* Header/Navbar */}
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
            {darkMode ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
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
              <FaHome />
              <span>Dashboard</span>
            </Link>
            <Link to="/admin/users" className="flex items-center space-x-2 p-2 hover:bg-blue-700 dark:hover:bg-gray-700 rounded">
              <FaUsers />
              <span>Users</span>
            </Link>
            <Link to="/admin/articles" className="flex items-center space-x-2 p-2 hover:bg-blue-700 dark:hover:bg-gray-700 rounded">
              <FaNewspaper />
              <span>Articles</span>
            </Link>
            <Link to="/admin/videos" className="flex items-center space-x-2 p-2 hover:bg-blue-700 dark:hover:bg-gray-700 rounded">
              <FaVideo />
              <span>Videos</span>
            </Link>
            <Link to="/admin/stats" className="flex items-center space-x-2 p-2 hover:bg-blue-700 dark:hover:bg-gray-700 rounded">
              <FaChartBar />
              <span>Statistics</span>
            </Link>
            <Link to="/admin/newsletter" className="flex items-center space-x-2 p-2 bg-blue-700 dark:bg-gray-700 rounded">
              <FaEnvelope />
              <span>Newsletter</span>
            </Link>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-[#F5F5F5] dark:bg-gray-900 p-8">
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-8 text-blue-700 dark:text-blue-300">Newsletter Subscribers</h1>
            {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded border border-red-300">{error}</div>}
            <div className="mb-6 flex flex-wrap items-center gap-4 bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl shadow">
              <button
                onClick={handleBulkDelete}
                disabled={selected.length === 0}
                className={`flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg shadow transition hover:bg-red-700 ${selected.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FaTrash /> Delete Selected
              </button>
              <div className="flex items-center gap-2">
                <textarea
                  className="border rounded p-2 min-w-[200px] min-h-[40px]"
                  placeholder="Write a message to selected..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  disabled={selected.length === 0}
                />
                <button
                  onClick={handleSendEmail}
                  disabled={selected.length === 0 || sending}
                  className={`flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg shadow transition hover:bg-cyan-700 ${selected.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FaEnvelope /> Send Message
                </button>
              </div>
            </div>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border-separate border-spacing-0">
                  <thead className="sticky top-0 z-10 bg-cyan-100 dark:bg-gray-800">
                    <tr>
                      <th className="py-3 px-4 border-b-2 text-left">
                        <input type="checkbox" checked={selectAll} onChange={handleSelectAll} className="accent-cyan-600 w-5 h-5 rounded" />
                      </th>
                      <th className="py-3 px-4 border-b-2 text-left">ID</th>
                      <th className="py-3 px-4 border-b-2 text-left">Name</th>
                      <th className="py-3 px-4 border-b-2 text-left">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map(sub => (
                      <tr key={sub.id} className="transition hover:bg-cyan-50 dark:hover:bg-gray-800">
                        <td className="py-2 px-4 border-b">
                          <input
                            type="checkbox"
                            checked={selected.includes(sub.id)}
                            onChange={() => handleSelect(sub.id)}
                            className="accent-cyan-600 w-5 h-5 rounded"
                          />
                        </td>
                        <td className="py-2 px-4 border-b">{sub.id}</td>
                        <td className="py-2 px-4 border-b">{sub.name}</td>
                        <td className="py-2 px-4 border-b">{sub.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 