import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import pass1 from "../../assets/images/pass1.jpg";

export default function Respass2() {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Get email from localStorage
    const storedEmail = localStorage.getItem('resetEmail');
    
    if (!storedEmail) {
      navigate('/Repass1');
      return;
    }
    
    setEmail(storedEmail);
    setMessage('We have sent a 6-digit verification code to your email address. Please check your email and enter the code below.');
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token || token.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:8000/api/users/password-reset/verify/', {
        email: email,
        token: token
      });

      // Store the verified token
      localStorage.setItem('verifiedToken', token);
      navigate('/Repass3');

    } catch (error) {
      if (error.response?.data?.token) {
        setError(error.response.data.token[0]);
      } else if (error.response?.data?.non_field_errors) {
        setError(error.response.data.non_field_errors[0]);
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
   <div className="min-h-screen flex flex-col bg-white">
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 py-10 text-center px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-500">  Forgot Your Password!  </h1>
        <p className="text-white text-base sm:text-lg mt-2 font-semibold"> Reset the password </p>
      </div>

      {/* ******************************** */}
      <div className="flex flex-col-reverse lg:flex-row items-center justify-between px-4 sm:px-8 md:px-16 py-10 gap-12 flex-grow">
        <div className="w-full lg:w-1/2 max-w-md">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            {message && (
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{message}</span>
              </div>
            )}

            <label htmlFor="verificationCode" className="block text-gray-800 font-medium mb-2 text-left">
              Enter the 6-digit verification code
            </label>
            <input 
              type="text" 
              id="verificationCode" 
              name="verificationCode" 
              placeholder="e.g. 343567"
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric" 
              maxLength={6}
              disabled={isLoading}
              className="w-full border border-orange-500 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 mb-6" 
            />

            <button 
              type="submit"
              disabled={isLoading || token.length !== 6}
              className={`block w-full py-2 rounded-md text-center font-semibold transition ${
                isLoading || token.length !== 6
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-orange-600 hover:bg-orange-700'
              } text-white`}
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
        </div>

        {/* image */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <img src={pass1} alt="Reset Password"
            className="w-64 sm:w-72 md:w-80 lg:w-96" />
        </div>
      </div>
    </div>
  );
} 