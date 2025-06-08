import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import pass1 from "../../assets/images/pass1.jpg";

export default function RepassNewPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    // Get email and token from localStorage
    const storedEmail = localStorage.getItem('resetEmail');
    const verifiedToken = localStorage.getItem('verifiedToken');
    
    if (!storedEmail || !verifiedToken) {
      navigate('/Repass1');
      return;
    }
    
    setEmail(storedEmail);
    setToken(verifiedToken);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:8000/api/users/password-reset/confirm/', {
        email: email,
        token: token,
        new_password: newPassword,
        confirm_password: confirmPassword
      });

      // Clear stored data
      localStorage.removeItem('resetEmail');
      localStorage.removeItem('resetToken');
      localStorage.removeItem('verifiedToken');
      
      navigate('/Repass4');

    } catch (error) {
      if (error.response?.data?.new_password) {
        setError(error.response.data.new_password[0]);
      } else if (error.response?.data?.non_field_errors) {
        setError(error.response.data.non_field_errors[0]);
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 py-10 text-center px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-500"> Forgot Your Password!  </h1>
        <p className="text-white text-base sm:text-lg mt-2 font-semibold">  Reset the password</p>
      </div>

      {/* ********************* */}
      <div className="flex flex-col-reverse lg:flex-row items-center justify-between px-4 sm:px-8 md:px-16 py-10 gap-12 flex-grow">
        <div className="w-full lg:w-1/2 max-w-md">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <label htmlFor="newPassword" className="block text-gray-800 font-medium mb-2 text-left">
              Enter a new strong password
            </label>
            <input 
              type="password" 
              id="newPassword" 
              name="newPassword" 
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
              className="w-full border border-orange-500 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 mb-5"
            />

            <label htmlFor="confirmPassword" className="block text-gray-800 font-medium mb-2 text-left">
              Retype the new password
            </label>
            <input 
              type="password" 
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Retype new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              className="w-full border border-orange-500 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 mb-5" 
            />

            <button 
              type="submit"
              disabled={isLoading || !newPassword || !confirmPassword}
              className={`block w-full mt-6 py-2 rounded-md text-center font-semibold transition ${
                isLoading || !newPassword || !confirmPassword
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-orange-600 hover:bg-orange-700'
              } text-white`}
            >
              {isLoading ? 'Resetting...' : 'Reset the Password'}
            </button>
          </form>
        </div>

        {/* image */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <img src={pass1} alt="Reset Password"className="w-64 sm:w-72 md:w-80 lg:w-96" />
        </div>
      </div>
    </div>
  );
} 