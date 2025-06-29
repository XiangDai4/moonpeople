// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import NeedSupport from './pages/NeedSupport';
import ServiceDirectory from './pages/ServiceDirectory';
import ServiceDetail from './pages/ServiceDetail';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
// Import admin pages
import Categories from './pages/admin/Categories';
import Services from './pages/admin/Services';
import Appointments from './pages/admin/Appointments';

// Import layout components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Imports Resource Library pages
import ResourceLibrary from './pages/ResourceLibrary';
import ResourceDetail from './pages/ResourceDetail';
import CreateResource from './pages/CreateResource';
import EditResource from './pages/EditResource';
import AdminResources from './pages/admin/Resources';

// Import Volunteer pages
import WantToSupport from './pages/WantToSupport';
import VolunteerRegistration from './pages/VolunteerRegistration';
import AdminVolunteers from './pages/admin/Volunteers';
import ContactMessages from './pages/admin/ContactMessages';
import UserMessages from './pages/UserMessages';
import VolunteerDashboard from './pages/VolunteerDashboard';
import EmailVerification from './pages/EmailVerification';
import GoogleAuthSuccess from './pages/GoogleAuthSuccess';

import BookService from './pages/BookService';
import MyAppointments from './pages/MyAppointments';

import ForumList from './pages/ForumList';
import PostDetail from './pages/PostDetail';
import NewPost from './pages/NewPost';
import UserFavorites from './pages/UserFavorites';


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="container mx-auto px-4 py-6 min-h-screen">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/messages" element={<UserMessages />} />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route path="/need-support" element={<NeedSupport />} />
              <Route path="/services" element={<ServiceDirectory />} />
              <Route path="/services/:id" element={<ServiceDetail />} />
              <Route path="/book-service/:serviceId" element={<BookService />} />
              <Route path="/my-appointments" element={<MyAppointments />} />
              
              {/* Admin Routes with Protection */}
              <Route 
                path="/admin/categories" 
                element={
                  <ProtectedRoute isAdmin={true}>
                    <Categories />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/services" 
                element={
                  <ProtectedRoute isAdmin={true}>
                    <Services />
                  </ProtectedRoute>
                } 
              />
              <Route path="/admin/appointments" element={<Appointments />} />
              {/* Resource Library Routes */}
              <Route 
                path="/resources/create" 
                element={
                  <ProtectedRoute>
                    <CreateResource />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/resources/edit/:id" 
                element={
                  <ProtectedRoute>
                    <EditResource />
                  </ProtectedRoute>
                } 
              />
              <Route path="/resources/:id" element={<ResourceDetail />} />
              <Route path="/resources" element={<ResourceLibrary />} />

              

              {/* Admin Resources Route */}
              <Route 
                path="/admin/resources" 
                element={
                  <ProtectedRoute isAdmin={true}>
                    <AdminResources />
                  </ProtectedRoute>
                } 
              />
             {/* Volunteer Route */}
              <Route path="/want-to-support" element={<WantToSupport />} />
              <Route path="/volunteer-registration" element={<ProtectedRoute><VolunteerRegistration /></ProtectedRoute>} />
              <Route path="/admin/volunteers" element={<ProtectedRoute><AdminVolunteers /></ProtectedRoute>} />

              <Route path="/admin/contact-messages" element={<ContactMessages />} />
              
              <Route path="/volunteer-dashboard" element={<VolunteerDashboard />} />
              <Route path="/verify-email/:token" element={<EmailVerification />} />
              <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />

              {/* Forum Routes */}
              <Route path="/forum" element={<ForumList />} />
              <Route path="/forum/posts/:postId" element={<PostDetail />} />
              <Route path="/forum/new-post" element={
                <ProtectedRoute>
                  <NewPost />
                </ProtectedRoute>
              } />
              <Route path="/forum/favorites" element={
                <ProtectedRoute>
                  <UserFavorites />
                </ProtectedRoute>
              } />
              {/* This should be the last route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;