import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import pass1 from "../../assets/images/pass1.jpg";

export default function Repass1() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post('http://localhost:8000/api/users/password-reset/request/', {
        email: email
      });

      setMessage(response.data.message);
      // Store email for next step
      localStorage.setItem('resetEmail', email);
      
      // Navigate to verification page after 2 seconds
      setTimeout(() => {
        navigate('/Repass2');
      }, 2000);

    } catch (error) {
      if (error.response?.data?.email) {
        setError(error.response.data.email[0]);
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 py-10 text-center px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-500"> Forgot Your Password! </h1>
        <p className="text-white text-base sm:text-lg mt-2 font-semibold">Reset the password</p>
      </div>

      {/* *********************************** */}
      <div className="flex flex-col-reverse lg:flex-row items-center justify-between px-4 sm:px-8 md:px-16 py-10 gap-12 flex-grow">
        <div className="w-full lg:w-1/2 max-w-md">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            {message && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{message}</span>
              </div>
            )}

            <label htmlFor="email" className="block text-gray-800 font-medium mb-2 text-left"> Enter your email </label>

            <input 
              type="email" 
              id="email" 
              placeholder="Type your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full border border-orange-500 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 mb-6"
            />

            <button 
              type="submit"
              disabled={isLoading}
              className={`block w-full py-2 rounded-md text-center font-semibold transition ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-orange-600 hover:bg-orange-700'
              } text-white`}
            >
              {isLoading ? 'Sending...' : 'Send Resetting Email'}
            </button>

            <div className="mt-4 text-center lg:text-left">
              <Link to="/login" className="text-blue-700 underline text-sm"> Return to login</Link> 
            </div>
          </form>
        </div>

        {/* image */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <img src={pass1} alt="Reset Password"  className="w-64 sm:w-72 md:w-80 lg:w-96"/> </div>
      </div>
    </div>
  );
} 