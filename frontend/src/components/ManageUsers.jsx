import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { FaTrash, FaUserShield, FaUserAltSlash, FaArrowLeft, FaHome, FaUserPlus, FaUsers, FaNewspaper, FaVideo, FaChartBar, FaMoon, FaSun, FaEnvelope, FaFilter, FaTimes } from 'react-icons/fa';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [userName] = useState(localStorage.getItem('userName') || 'Admin');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  
  // Filter states
  const [filters, setFilters] = useState({
    email: '',
    name: '',
    role: '',
    dateFrom: '',
    dateTo: '',
    pointsMin: '',
    pointsMax: '',
    source: '',
    target: '',
    isActive: ''
  });

  const [addForm, setAddForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: '',
    role: 'user',
  });
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/users/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      setUsers(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch users.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Apply filters
  useEffect(() => {
    let result = [...users];
    
    if (filters.email) {
      result = result.filter(user => 
        user.email.toLowerCase().includes(filters.email.toLowerCase())
      );
    }
    
    if (filters.name) {
      const searchName = filters.name.toLowerCase();
      result = result.filter(user => 
        user.first_name.toLowerCase().includes(searchName) ||
        user.last_name.toLowerCase().includes(searchName)
      );
    }
    
    if (filters.role) {
      result = result.filter(user => 
        filters.role === 'admin' ? user.is_admin : !user.is_admin
      );
    }
    
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      result = result.filter(user => 
        new Date(user.date_joined) >= fromDate
      );
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      result = result.filter(user => 
        new Date(user.date_joined) <= toDate
      );
    }
    
    if (filters.pointsMin) {
      result = result.filter(user => 
        user.points >= parseInt(filters.pointsMin)
      );
    }
    
    if (filters.pointsMax) {
      result = result.filter(user => 
        user.points <= parseInt(filters.pointsMax)
      );
    }
    
    if (filters.source) {
      result = result.filter(user => 
        user.source?.toLowerCase().includes(filters.source.toLowerCase())
      );
    }
    
    if (filters.target) {
      result = result.filter(user => 
        user.target?.toLowerCase().includes(filters.target.toLowerCase())
      );
    }
    
    if (filters.isActive) {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      result = result.filter(user => {
        const lastLogin = new Date(user.last_login);
        return filters.isActive === 'active' 
          ? lastLogin >= thirtyDaysAgo 
          : lastLogin < thirtyDaysAgo;
      });
    }
    
    setFilteredUsers(result);
  }, [users, filters]);

  const resetFilters = () => {
    setFilters({
      email: '',
      name: '',
      role: '',
      dateFrom: '',
      dateTo: '',
      pointsMin: '',
      pointsMax: '',
      source: '',
      target: '',
      isActive: ''
    });
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/users/${id}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      setUsers(users.filter(user => user.id !== id));
    } catch (err) {
      alert('Failed to delete user.');
    }
  };

  const handlePromote = async (id) => {
    try {
      await axios.post(`http://127.0.0.1:8000/api/users/${id}/promote/`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (user && user.id === id) {
        logout();
        alert('Your permissions have changed. Please login again.');
        navigate('/login');
        return;
      }
      fetchUsers();
    } catch (err) {
      alert('Failed to promote user.');
    }
  };

  const handleDemote = async (id) => {
    try {
      await axios.post(`http://127.0.0.1:8000/api/users/${id}/demote/`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (user && user.id === id) {
        logout();
        alert('Your permissions have changed. Please login again.');
        navigate('/login');
        return;
      }
      fetchUsers();
    } catch (err) {
      alert('Failed to demote user.');
    }
  };

  // تحديد أو إلغاء تحديد كل المستخدمين
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
    setSelectAll(!selectAll);
  };

  // تحديد أو إلغاء تحديد مستخدم واحد
  const handleSelectUser = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter(uid => uid !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  // حذف جماعي
  const handleBulkDelete = async () => {
    if (!window.confirm('Are you sure you want to delete selected users?')) return;
    for (const id of selectedUsers) {
      await handleDelete(id);
    }
    setSelectedUsers([]);
    setSelectAll(false);
  };

  // ترقية جماعية
  const handleBulkPromote = async () => {
    if (!window.confirm('Are you sure you want to promote selected users to admin?')) return;
    for (const id of selectedUsers) {
      await handlePromote(id);
    }
    setSelectedUsers([]);
    setSelectAll(false);
  };

  // تخفيض جماعي
  const handleBulkDemote = async () => {
    if (!window.confirm('Are you sure you want to demote selected users from admin?')) return;
    for (const id of selectedUsers) {
      await handleDemote(id);
    }
    setSelectedUsers([]);
    setSelectAll(false);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError('');
    try {
      await axios.post('http://127.0.0.1:8000/api/users/', {
        email: addForm.email,
        first_name: addForm.first_name,
        last_name: addForm.last_name,
        password: addForm.password,
        confirm_password: addForm.confirm_password,
        is_admin: addForm.role === 'admin',
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      setShowAddModal(false);
      setAddForm({ email: '', first_name: '', last_name: '', password: '', confirm_password: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      setAddError('Failed to add user.');
      console.log('Add user error:', err.response?.data || err.message);
    }
    setAddLoading(false);
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
            onClick={logout}
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
            <Link to="/admin/users" className="flex items-center space-x-2 p-2 bg-blue-700 dark:bg-gray-700 rounded">
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
            <Link to="/admin/newsletter" className="flex items-center space-x-2 p-2 hover:bg-blue-700 dark:hover:bg-gray-700 rounded">
              <FaEnvelope />
              <span>Newsletter</span>
            </Link>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-[#F5F5F5] dark:bg-gray-900 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold dark:text-white">Manage Users</h1>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
              >
                <FaFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold dark:text-white">Filters</h2>
                  <button
                    onClick={resetFilters}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-2"
                  >
                    <FaTimes /> Reset Filters
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <input
                      type="text"
                      value={filters.email}
                      onChange={(e) => setFilters({...filters, email: e.target.value})}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Search by email"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                    <input
                      type="text"
                      value={filters.name}
                      onChange={(e) => setFilters({...filters, name: e.target.value})}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Search by name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                    <select
                      value={filters.role}
                      onChange={(e) => setFilters({...filters, role: e.target.value})}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Join Date From</label>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Join Date To</label>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Points Range</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={filters.pointsMin}
                        onChange={(e) => setFilters({...filters, pointsMin: e.target.value})}
                        className="w-1/2 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Min"
                      />
                      <input
                        type="number"
                        value={filters.pointsMax}
                        onChange={(e) => setFilters({...filters, pointsMax: e.target.value})}
                        className="w-1/2 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Source</label>
                    <input
                      type="text"
                      value={filters.source}
                      onChange={(e) => setFilters({...filters, source: e.target.value})}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Filter by source"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target</label>
                    <input
                      type="text"
                      value={filters.target}
                      onChange={(e) => setFilters({...filters, target: e.target.value})}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Filter by target"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Activity Status</label>
                    <select
                      value={filters.isActive}
                      onChange={(e) => setFilters({...filters, isActive: e.target.value})}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">All Users</option>
                      <option value="active">Active (Last 30 days)</option>
                      <option value="inactive">Inactive (30 days)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4 border border-red-300">{error}</div>}
            
            {/* Toolbar */}
            <div className="mb-6 flex flex-wrap items-center gap-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl shadow">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow transition hover:bg-blue-700"
              >
                <FaUserPlus /> Add User
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={selectedUsers.length === 0}
                className={`flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg shadow transition hover:bg-red-700 ${selectedUsers.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FaTrash /> Delete Selected
              </button>
              <button
                onClick={handleBulkPromote}
                disabled={selectedUsers.length === 0}
                className={`flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow transition hover:bg-green-700 ${selectedUsers.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FaUserShield /> Promote Selected
              </button>
              <button
                onClick={handleBulkDemote}
                disabled={selectedUsers.length === 0}
                className={`flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow transition hover:bg-yellow-600 ${selectedUsers.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FaUserAltSlash /> Demote Selected
              </button>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 w-full max-w-md relative">
                  <button onClick={() => setShowAddModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl">&times;</button>
                  <h2 className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-300">Add New User</h2>
                  {addError && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded border border-red-300">{addError}</div>}
                  <form onSubmit={handleAddUser} className="flex flex-col gap-4">
                    <input
                      type="email"
                      placeholder="Email"
                      className="border rounded p-2"
                      value={addForm.email}
                      onChange={e => setAddForm({ ...addForm, email: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      placeholder="First Name"
                      className="border rounded p-2"
                      value={addForm.first_name}
                      onChange={e => setAddForm({ ...addForm, first_name: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      className="border rounded p-2"
                      value={addForm.last_name}
                      onChange={e => setAddForm({ ...addForm, last_name: e.target.value })}
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      className="border rounded p-2"
                      value={addForm.password}
                      onChange={e => setAddForm({ ...addForm, password: e.target.value })}
                      required
                    />
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      className="border rounded p-2"
                      value={addForm.confirm_password}
                      onChange={e => setAddForm({ ...addForm, confirm_password: e.target.value })}
                      required
                    />
                    <select
                      className="border rounded p-2"
                      value={addForm.role}
                      onChange={e => setAddForm({ ...addForm, role: e.target.value })}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      type="submit"
                      disabled={addLoading}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                    >
                      {addLoading ? 'Adding...' : 'Add User'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="w-full">
                <table className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
                  <thead className="bg-blue-100 dark:bg-gray-800">
                    <tr>
                      <th className="py-3 px-2 text-left">
                        <input type="checkbox" checked={selectAll} onChange={handleSelectAll} className="accent-blue-600 w-4 h-4 rounded" />
                      </th>
                      <th className="py-3 px-2 text-left text-sm">ID</th>
                      <th className="py-3 px-2 text-left text-sm">Email</th>
                      <th className="py-3 px-2 text-left text-sm">First Name</th>
                      <th className="py-3 px-2 text-left text-sm">Last Name</th>
                      <th className="py-3 px-2 text-left text-sm">Role</th>
                      <th className="py-3 px-2 text-left text-sm">Points</th>
                      <th className="py-3 px-2 text-left text-sm">Date Joined</th>
                      <th className="py-3 px-2 text-left text-sm">Source</th>
                      <th className="py-3 px-2 text-left text-sm">Target</th>
                      <th className="py-3 px-2 text-left text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} className={`transition hover:bg-blue-50 dark:hover:bg-gray-800 ${user.is_admin ? 'bg-blue-50 dark:bg-gray-800 font-semibold' : ''}`}>
                        <td className="py-2 px-2">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleSelectUser(user.id)}
                            className="accent-blue-600 w-4 h-4 rounded"
                          />
                        </td>
                        <td className="py-2 px-2 text-sm">{user.id}</td>
                        <td className="py-2 px-2 text-sm">{user.email}</td>
                        <td className="py-2 px-2 text-sm">{user.first_name}</td>
                        <td className="py-2 px-2 text-sm">{user.last_name}</td>
                        <td className="py-2 px-2 text-sm">
                          {user.is_admin ? (
                            <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 font-bold"><FaUserShield className="text-xs" /> Admin</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-gray-700 dark:text-gray-300"><FaUserAltSlash className="text-xs" /> User</span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-sm">{user.points}</td>
                        <td className="py-2 px-2 text-sm">{user.date_joined ? new Date(user.date_joined).toLocaleString() : ''}</td>
                        <td className="py-2 px-2 text-sm">{user.source}</td>
                        <td className="py-2 px-2 text-sm">{user.target}</td>
                        <td className="py-2 px-2 text-sm flex gap-1">
                          <button onClick={() => handleDelete(user.id)} className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700 transition text-xs"><FaTrash className="text-xs" /> Delete</button>
                          {user.is_admin ? (
                            <button onClick={() => handleDemote(user.id)} className="flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-700 transition text-xs"><FaUserAltSlash className="text-xs" /> Demote</button>
                          ) : (
                            <button onClick={() => handlePromote(user.id)} className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded hover:bg-green-700 transition text-xs"><FaUserShield className="text-xs" /> Promote</button>
                          )}
                        </td>
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