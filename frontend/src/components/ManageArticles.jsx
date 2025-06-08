import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUsers, faNewspaper, faVideo, faChartBar, faMoon, faSun, faSignOutAlt, faEnvelope, faPlus, faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faInstagram, faTiktok, faLinkedinIn, faYoutube } from '@fortawesome/free-brands-svg-icons';
import axios from 'axios';

export default function ManageArticles() {
  const [userName] = useState(localStorage.getItem('userName') || 'Admin');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form data for adding/editing articles
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    image: null,
    is_featured: false,
    read_time: '5 min read',
    tags: '',
    introduction: '',
    sections: [{ title: '', content: '' }]
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentArticleId, setCurrentArticleId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
    fetchArticles();
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const fetchArticles = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      handleLogout();
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get('http://127.0.0.1:8000/api/articles/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setArticles(response.data);
      setLoading(false);
      setError('');
    } catch (error) {
      console.error('Error fetching articles:', error);
      setLoading(false);
      if (error.response) {
        if (error.response.status === 401) {
          setError('You are not authorized. Please login as an admin.');
          handleLogout();
        } else {
          setError('Failed to fetch articles. Please try again later.');
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

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData({
        ...formData,
        [name]: files[0]
      });
      
      // Create preview URL for the image
      if (files[0]) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(files[0]);
      } else {
        setPreviewImage(null);
      }
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSectionChange = (index, field, value) => {
    const updatedSections = [...formData.sections];
    updatedSections[index] = { 
      ...updatedSections[index],
      [field]: value 
    };
    setFormData({
      ...formData,
      sections: updatedSections
    });
  };

  const addSection = () => {
    setFormData({
      ...formData,
      sections: [...formData.sections, { title: '', content: '' }]
    });
  };

  const removeSection = (index) => {
    if (formData.sections.length > 1) {
      const updatedSections = [...formData.sections];
      updatedSections.splice(index, 1);
      setFormData({
        ...formData,
        sections: updatedSections
      });
    }
  };

  const handleAddArticle = () => {
    setFormData({
      title: '',
      content: '',
      category: '',
      image: null,
      is_featured: false,
      read_time: '5 min read',
      tags: '',
      introduction: '',
      sections: [{ title: '', content: '' }]
    });
    setPreviewImage(null);
    setIsEditing(false);
    setCurrentArticleId(null);
    setShowForm(true);
  };

  const handleEditArticle = (article) => {
    let introduction = '';
    let sections = [{ title: '', content: '' }];
    
    if (article.content) {
      introduction = article.content;
      
      if (article.content.includes('##')) {
        const contentParts = article.content.split('##');
        introduction = contentParts[0].trim();
        
        sections = contentParts.slice(1).map(part => {
          const lines = part.trim().split('\n');
          const title = lines[0].trim();
          const content = lines.slice(1).join('\n').trim();
          return { title, content };
        });
      }
    }
    
    setFormData({
      title: article.title,
      content: article.content,
      category: article.category,
      is_featured: article.is_featured,
      read_time: article.read_time || '5 min read',
      tags: article.tags || '',
      introduction,
      sections: sections.length ? sections : [{ title: '', content: '' }]
    });
    setPreviewImage(article.image_url);
    setIsEditing(true);
    setCurrentArticleId(article.id);
    setShowForm(true);
  };

  const handleDeleteArticle = async (id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      const token = localStorage.getItem('access_token');
      try {
        await axios.delete(`http://127.0.0.1:8000/api/articles/${id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        // Refresh the articles list
        fetchArticles();
      } catch (error) {
        console.error('Error deleting article:', error);
        setError('Failed to delete article. Please try again.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    
    let fullContent = formData.introduction;
    
    formData.sections.forEach(section => {
      if (section.title.trim() && section.content.trim()) {
        fullContent += `\n\n## ${section.title}\n${section.content}`;
      }
    });
    
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('content', fullContent);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('is_featured', formData.is_featured);
    formDataToSend.append('read_time', formData.read_time);
    formDataToSend.append('tags', formData.tags || '');
    
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }
    
    try {
      if (isEditing) {
        await axios.put(`http://127.0.0.1:8000/api/articles/${currentArticleId}/`, formDataToSend, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post('http://127.0.0.1:8000/api/articles/', formDataToSend, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      setShowForm(false);
      setFormData({
        title: '',
        content: '',
        category: '',
        image: null,
        is_featured: false,
        read_time: '5 min read',
        tags: '',
        introduction: '',
        sections: [{ title: '', content: '' }]
      });
      setPreviewImage(null);
      fetchArticles();
    } catch (error) {
      console.error('Error saving article:', error);
      setError('Failed to save article. Please check all required fields and try again.');
    }
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
            <Link to="/admin/dashboard" className="flex items-center space-x-2 p-2 hover:bg-blue-700 dark:hover:bg-gray-700 rounded">
              <FontAwesomeIcon icon={faHome} />
              <span>Dashboard</span>
            </Link>
            <Link to="/admin/users" className="flex items-center space-x-2 p-2 hover:bg-blue-700 dark:hover:bg-gray-700 rounded">
              <FontAwesomeIcon icon={faUsers} />
              <span>Users</span>
            </Link>
            <Link to="/admin/articles" className="flex items-center space-x-2 p-2 bg-blue-700 dark:bg-gray-700 rounded">
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
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold dark:text-white">Manage Articles</h1>
              <button 
                onClick={handleAddArticle}
                className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Add New Article</span>
              </button>
            </div>
            
            {error && (
              <div className="bg-red-100 text-red-700 p-4 rounded mb-4 border border-red-300">
                {error}
              </div>
            )}

            {/* Article Form */}
            {showForm && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 dark:text-white">
                  {isEditing ? 'Edit Article' : 'Add New Article'}
                </h2>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Title</label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Category</label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          required
                        >
                          <option value="">Select Category</option>
                          <option value="Strength Training">Strength Training</option>
                          <option value="Cardio Health">Cardio Health</option>
                          <option value="Nutrition">Nutrition</option>
                          <option value="Healthy Food">Healthy Food</option>
                          <option value="Health">Health</option>
                          <option value="Psychology">Psychology</option>
                          <option value="Recovery">Recovery</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Read Time</label>
                        <input
                          type="text"
                          name="read_time"
                          value={formData.read_time}
                          onChange={handleInputChange}
                          placeholder="e.g., 5 min read"
                          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Tags (comma separated)</label>
                        <input
                          type="text"
                          name="tags"
                          value={formData.tags}
                          onChange={handleInputChange}
                          placeholder="e.g., nutrition, diet, health"
                          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Featured Article</label>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="is_featured"
                            checked={formData.is_featured}
                            onChange={handleInputChange}
                            className="w-5 h-5 mr-2"
                          />
                          <span className="text-gray-700 dark:text-gray-300">Mark as featured article</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Image</label>
                        <input
                          type="file"
                          name="image"
                          accept="image/*"
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        {previewImage && (
                          <div className="mt-2">
                            <img 
                              src={previewImage} 
                              alt="Preview" 
                              className="h-40 object-cover rounded-lg" 
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Introduction</label>
                        <textarea
                          name="introduction"
                          value={formData.introduction}
                          onChange={handleInputChange}
                          rows="4"
                          placeholder="Write an introduction for your article (200-300 characters recommended)"
                          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          required
                        ></textarea>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Article Sections</label>
                        <div className="space-y-4">
                          {formData.sections.map((section, index) => (
                            <div key={index} className="border p-3 rounded-lg dark:border-gray-600">
                              <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold dark:text-white">Section {index + 1}</h3>
                                {formData.sections.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeSection(index)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                              <div className="mb-2">
                                <input
                                  type="text"
                                  value={section.title}
                                  onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                                  placeholder="Section Title"
                                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                              </div>
                              <textarea
                                value={section.content}
                                onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                                rows="4"
                                placeholder="Section Content"
                                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              ></textarea>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addSection}
                            className="w-full py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                          >
                            + Add Section
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6 space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {isEditing ? 'Update Article' : 'Save Article'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Articles Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left text-gray-800 dark:text-white font-semibold">ID</th>
                    <th className="py-3 px-4 text-left text-gray-800 dark:text-white font-semibold">Title</th>
                    <th className="py-3 px-4 text-left text-gray-800 dark:text-white font-semibold">Category</th>
                    <th className="py-3 px-4 text-left text-gray-800 dark:text-white font-semibold">Read Time</th>
                    <th className="py-3 px-4 text-left text-gray-800 dark:text-white font-semibold">Featured</th>
                    <th className="py-3 px-4 text-left text-gray-800 dark:text-white font-semibold">Image</th>
                    <th className="py-3 px-4 text-center text-gray-800 dark:text-white font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="py-4 px-4 text-center text-gray-500 dark:text-gray-400">
                        Loading articles...
                      </td>
                    </tr>
                  ) : articles.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-4 px-4 text-center text-gray-500 dark:text-gray-400">
                        No articles found. Add your first article!
                      </td>
                    </tr>
                  ) : (
                    articles.map((article) => (
                      <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                        <td className="py-3 px-4 text-gray-800 dark:text-white">
                          {article.id}
                        </td>
                        <td className="py-3 px-4 text-gray-800 dark:text-white">
                          {article.title}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                          {article.category}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                          {article.read_time}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                          {article.is_featured ? 'Yes' : 'No'}
                        </td>
                        <td className="py-3 px-4">
                          {article.image_url && (
                            <img 
                              src={article.image_url} 
                              alt={article.title} 
                              className="h-12 w-20 object-cover rounded" 
                            />
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleEditArticle(article)}
                              className="p-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                            >
                              <FontAwesomeIcon icon={faPencilAlt} />
                            </button>
                            <button
                              onClick={() => handleDeleteArticle(article.id)}
                              className="p-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 