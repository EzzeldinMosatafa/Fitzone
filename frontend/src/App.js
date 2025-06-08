import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login.jsx';
import SignUp from './SignUp.jsx';
import Home from './Home.jsx';
import WorkoutFitnessArticles from './WorkoutFitnessArticles.jsx';
import CoreServices from './CoreServices.jsx';
import WorkoutLibrary from './WorkoutLibrary.jsx';
import About from './About.jsx';
import AIWorkoutCorrection from './AIworkoutcorrection.jsx';
import QuickAccess from './quickaccess.jsx';
import Workout from './Workout.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import { DarkModeProvider } from './context/DarkModeContext.jsx';
import ArticleDetail from './ArticleDetail.jsx';
import AdminRegister from './components/AdminRegister.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import { useAuth } from './context/AuthContext.jsx';
import ManageUsers from './components/ManageUsers.jsx';
import NewsletterAdmin from './components/NewsletterAdmin.jsx';
import ManageArticles from './components/ManageArticles.jsx';
import VideoManagement from './components/VideoManagement.jsx';
import AdminStatistics from './components/AdminStatistics.jsx';
import UserDashboard from './UserDashboard.jsx';
// User Video pages
import SavedVideos from './pages/SavedVideos.jsx';
import LikedVideos from './pages/LikedVideos.jsx';
import CompletedVideos from './pages/CompletedVideos.jsx';
import ChangePassword from './pages/ChangePassword.jsx';
// Forgot Password components
import Repass1 from './Forgetpass/Repass1/Repass1.jsx';
import Repass2 from './Forgetpass/Repass2/Repass2.jsx';
import Repass3 from './Forgetpass/Repass3/Repass3.jsx';
import Repass4 from './Forgetpass/Repass4/Repass4.jsx';
import './index.css';

function App() {
    return (
        <Router>
            <DarkModeProvider>
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/register-admin" element={<AdminRegister />} />
                    
                    {/* Forgot Password routes */}
                    <Route path="/Repass1" element={<Repass1 />} />
                    <Route path="/Repass2" element={<Repass2 />} />
                    <Route path="/Repass3" element={<Repass3 />} />
                    <Route path="/Repass4" element={<Repass4 />} />

                    {/* Protected routes */}
                    <Route path="/home" element={
                        <PrivateRoute>
                            <Home />
                        </PrivateRoute>
                    } />
                    
                    {/* User Dashboard routes - both paths will work */}
                    <Route path="/dashboard" element={
                        <PrivateRoute>
                            <UserDashboard />
                        </PrivateRoute>
                    } />
                    <Route path="/UserDashboard" element={
                        <PrivateRoute>
                            <UserDashboard />
                        </PrivateRoute>
                    } />
                    
                    {/* User profile related routes */}
                    <Route path="/user/saved-videos" element={
                        <PrivateRoute>
                            <SavedVideos />
                        </PrivateRoute>
                    } />
                    <Route path="/user/liked-videos" element={
                        <PrivateRoute>
                            <LikedVideos />
                        </PrivateRoute>
                    } />
                    <Route path="/user/completed-videos" element={
                        <PrivateRoute>
                            <CompletedVideos />
                        </PrivateRoute>
                    } />
                    <Route path="/user/change-password" element={
                        <PrivateRoute>
                            <ChangePassword />
                        </PrivateRoute>
                    } />
                    <Route path="/user/*" element={
                        <PrivateRoute>
                            <UserDashboard />
                        </PrivateRoute>
                    } />

                    <Route path="/fitnessarticles" element={
                        <PrivateRoute>
                            <WorkoutFitnessArticles />
                        </PrivateRoute>
                    } />
                    <Route path="/coreservices" element={
                        <PrivateRoute>
                            <CoreServices />
                        </PrivateRoute>
                    } />
                    <Route path="/about" element={
                        <PrivateRoute>
                            <About />
                        </PrivateRoute>
                    } />
                    <Route path="/workoutlibrary" element={
                        <PrivateRoute>
                            <WorkoutLibrary />
                        </PrivateRoute>
                    } />
                    <Route path="/workout/:id" element={
                        <PrivateRoute>
                            <Workout />
                        </PrivateRoute>
                    } />
                    <Route path="/aiworkoutcorrection" element={
                        <PrivateRoute>
                            <AIWorkoutCorrection />
                        </PrivateRoute>
                    } />
                    <Route path="/quickaccess" element={
                        <PrivateRoute>
                            <QuickAccess />
                        </PrivateRoute>
                    } />
                    <Route path="/article/:id" element={
                        <PrivateRoute>
                            <ArticleDetail />
                        </PrivateRoute>
                    } />
                    <Route path="/admin/dashboard" element={
                        <PrivateRoute requireAdmin={true}>
                            <AdminDashboard />
                        </PrivateRoute>
                    } />
                    <Route path="/admin/users" element={
                        <PrivateRoute requireAdmin={true}>
                            <ManageUsers />
                        </PrivateRoute>
                    } />
                    <Route path="/admin/newsletter" element={
                        <PrivateRoute requireAdmin={true}>
                            <NewsletterAdmin />
                        </PrivateRoute>
                    } />
                    <Route path="/admin/articles" element={
                        <PrivateRoute requireAdmin={true}>
                            <ManageArticles />
                        </PrivateRoute>
                    } />
                    <Route path="/admin/videos" element={
                        <PrivateRoute requireAdmin={true}>
                            <VideoManagement />
                        </PrivateRoute>
                    } />
                    <Route path="/admin/stats" element={
                        <PrivateRoute requireAdmin={true}>
                            <AdminStatistics />
                        </PrivateRoute>
                    } />

                    {/* Catch all route - redirect to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </DarkModeProvider>
        </Router>
    );
}

export default App;
