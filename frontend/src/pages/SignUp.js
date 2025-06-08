import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import trainerImage from '../assets/images/trainer.png';

const SignUp = () => {
  const navigate = useNavigate();
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
          localStorage.setItem('token', response.data.token);
          navigate('/login');
        }
      } catch (error) {
        console.error('Registration error:', error.response?.data);
        if (error.response?.data) {
          setErrors(error.response.data);
        } else {
          setErrors({ general: 'Registration failed. Please try again.' });
        }
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              start your professional fitness journey
            </h1>
            <p className="text-sm text-gray-600">
              Take your first step and create an account to be able to get the full access for all our AI-driven features
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                name="first_name"
                placeholder="Type your first name"
                value={formData.first_name}
                onChange={handleChange}
                className={`appearance-none block w-full px-3 py-2 border ${
                  errors.first_name ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
              />
              {errors.first_name && (
                <p className="mt-2 text-sm text-red-600">{errors.first_name}</p>
              )}
            </div>

            <div>
              <input
                type="text"
                name="last_name"
                placeholder="Type your last name"
                value={formData.last_name}
                onChange={handleChange}
                className={`appearance-none block w-full px-3 py-2 border ${
                  errors.last_name ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
              />
              {errors.last_name && (
                <p className="mt-2 text-sm text-red-600">{errors.last_name}</p>
              )}
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder="Type your email"
                value={formData.email}
                onChange={handleChange}
                className={`appearance-none block w-full px-3 py-2 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <input
                type="password"
                name="password"
                placeholder="Establish a password"
                value={formData.password}
                onChange={handleChange}
                className={`appearance-none block w-full px-3 py-2 border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <input
                type="password"
                name="confirm_password"
                placeholder="Confirm your password"
                value={formData.confirm_password}
                onChange={handleChange}
                className={`appearance-none block w-full px-3 py-2 border ${
                  errors.confirm_password ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
              />
              {errors.confirm_password && (
                <p className="mt-2 text-sm text-red-600">{errors.confirm_password}</p>
              )}
            </div>

            <div>
              <select
                name="target"
                value={formData.target}
                onChange={handleChange}
                className={`appearance-none block w-full px-3 py-2 border ${
                  errors.target ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
              >
                <option value="">What is your target from starting the fitness journey with us?</option>
                {targetOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.target && (
                <p className="mt-2 text-sm text-red-600">{errors.target}</p>
              )}
            </div>

            <div>
              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">How did you hear about us?</option>
                {sourceOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="terms_accepted"
                checked={formData.terms_accepted}
                onChange={handleChange}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                I have read and agree to the Terms of Use and Privacy Policy
              </label>
            </div>
            {errors.terms_accepted && (
              <p className="mt-2 text-sm text-red-600">{errors.terms_accepted}</p>
            )}

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Create Account
            </button>

            <div className="text-center mt-4">
              <Link 
                to="/login" 
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                I already have an account, log in
              </Link>
            </div>
          </form>
        </div>
      </div>

      <div className="hidden lg:block relative w-0 flex-1 bg-gradient-to-r from-blue-500 to-blue-600">
        <div className="absolute inset-0 flex flex-col justify-center px-10 text-white">
          <h2 className="text-2xl font-semibold mb-6">With FitZone</h2>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center">
                <FontAwesomeIcon icon={faCheck} className="mr-3 text-green-400" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
          <img
            src={trainerImage}
            alt="Fitness Trainer"
            className="absolute bottom-0 right-0 w-96 h-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default SignUp; 