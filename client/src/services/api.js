// client/src/services/api.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Helper function for authenticated fetch calls
const fetchWithAuth = async (url, options = {}) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = user.token;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Add auth token if available
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers
  });

  // Handle 401 Unauthorized globally
  if (response.status === 401 && !url.includes('/auth/login')) {
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Your session has expired. Please log in again.');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

// Helper function for public fetch calls (no authentication required)
const fetchPublic = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Debug logging
  console.log('fetchPublic - URL:', `${API_URL}${url}`);
  console.log('fetchPublic - Options:', options);
  console.log('fetchPublic - Body:', options.body);

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers
  });

  console.log('fetchPublic - Response status:', response.status);
  
  const data = await response.json();
  console.log('fetchPublic - Response data:', data);

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

// API methods
export const api = {
  // Helper methods for standardized HTTP requests
  get: (url) => fetchWithAuth(url),
  post: (url, data) => fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  put: (url, data) => fetchWithAuth(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (url) => fetchWithAuth(url, {
    method: 'DELETE'
  }),

  // Auth
  login: (email, password) => 
    fetchWithAuth('/auth/login', { 
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  
  register: (userData) => 
    fetchWithAuth('/auth/register', { 
      method: 'POST',
      body: JSON.stringify(userData)
    }),
  
  registerAdmin: (userData) => 
    fetchWithAuth('/auth/register', { 
      method: 'POST',
      body: JSON.stringify({...userData, role: 'admin'})
    }),  
     
  getProfile: () => 
    fetchWithAuth('/auth/profile'),
  
  updateProfile: (userData) => 
    fetchWithAuth('/auth/profile', { 
      method: 'PUT',
      body: JSON.stringify(userData)
    }),
  
  // Health check
  healthCheck: () => 
    fetchWithAuth('/health'),

  // Categories
  getCategories: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchWithAuth(`/categories${queryString ? `?${queryString}` : ''}`);
  },
  
  getCategoryById: (id) => 
    fetchWithAuth(`/categories/${id}`),
  
  createCategory: (categoryData) => 
    fetchWithAuth('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    }),
  
  updateCategory: (id, categoryData) => 
    fetchWithAuth(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    }),
  
  deleteCategory: (id) => 
    fetchWithAuth(`/categories/${id}`, {
      method: 'DELETE'
    }),
  
  // Services
  getServices: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchWithAuth(`/services${queryString ? `?${queryString}` : ''}`);
  },
  
  getServiceById: (id) => 
    fetchWithAuth(`/services/${id}`),
  
  createService: (serviceData) => 
    fetchWithAuth('/services', {
      method: 'POST',
      body: JSON.stringify(serviceData)
    }),
  
  updateService: (id, serviceData) => 
    fetchWithAuth(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(serviceData)
    }),
  
  deleteService: (id) => 
    fetchWithAuth(`/services/${id}`, {
      method: 'DELETE'
    }),

  // Resources
  getResources: (params = {}) => {
    // Support both simple params object and more detailed filters
    if (typeof params === 'object' && params !== null && !Array.isArray(params)) {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });
      
      return fetchWithAuth(`/resources?${queryParams.toString()}`);
    } else {
      const queryString = new URLSearchParams(params).toString();
      return fetchWithAuth(`/resources${queryString ? `?${queryString}` : ''}`);
    }
  },

  getResourceById: (id) => 
    fetchWithAuth(`/resources/${id}`),
  
  createResource: (resourceData) => 
    fetchWithAuth('/resources', {
      method: 'POST',
      body: JSON.stringify(resourceData)
    }),
  
  updateResource: (id, resourceData) => 
    fetchWithAuth(`/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(resourceData)
    }),
  
  deleteResource: (id) => 
    fetchWithAuth(`/resources/${id}`, {
      method: 'DELETE'
    }),

  // Admin resource methods
  getAdminResources: () => 
    fetchWithAuth('/resources/admin/all'),

  toggleResourcePublishStatus: (id, isPublished) => 
    fetchWithAuth(`/resources/admin/toggle-publish/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ isPublished })
    }),

  // Volunteers
  createVolunteerProfile: (profileData) => 
    fetchWithAuth('/volunteers/profile', {
      method: 'POST',
      body: JSON.stringify(profileData)
    }),
  
  getMyVolunteerProfile: () =>
    fetchWithAuth('/volunteers/my-profile'),
    
  updateVolunteerProfile: (profileData) =>
    fetchWithAuth('/volunteers/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    }),

  // NEW: Volunteer availability management
  updateVolunteerAvailability: (availableTimeSlots) =>
    fetchWithAuth('/volunteers/availability', {
      method: 'PATCH',
      body: JSON.stringify({ availableTimeSlots })
    }),

  // NEW: Service application system
  applyToOfferService: (serviceId) =>
    fetchWithAuth('/volunteers/apply-service', {
      method: 'POST',
      body: JSON.stringify({ serviceId })
    }),

  removeOfferedService: (serviceId) =>
    fetchWithAuth('/volunteers/remove-service', {
      method: 'DELETE',
      body: JSON.stringify({ serviceId })
    }),
    
  // Admin volunteer methods
  getAllVolunteerProfiles: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchWithAuth(`/volunteers/admin/profiles${queryString ? `?${queryString}` : ''}`);
  },
  
  getVolunteerProfileById: (id) =>
    fetchWithAuth(`/volunteers/admin/profiles/${id}`),
    
  approveVolunteer: (id) =>
    fetchWithAuth(`/volunteers/admin/approve/${id}`, {
      method: 'PATCH'
    }),
    
  rejectVolunteer: (id, reason) =>
    fetchWithAuth(`/volunteers/admin/reject/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ reason })
    }),

  // NEW: BOOKING SYSTEM
  // Get available volunteers for a service on a specific date
  getAvailableVolunteers: (serviceId, date) =>
    fetchWithAuth(`/bookings/available-volunteers?serviceId=${serviceId}&date=${date}`),

  // Create a new booking
  createBooking: (bookingData) =>
    fetchWithAuth('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    }),

  // Get current user's bookings
  getUserBookings: (status = 'all') =>
    fetchWithAuth(`/bookings/my-bookings?status=${status}`),

  // Get volunteer's bookings
  getVolunteerBookings: (status = 'all') =>
    fetchWithAuth(`/bookings/volunteer-bookings?status=${status}`),

  // Cancel a booking
  cancelBooking: (bookingId, reason) =>
    fetchWithAuth(`/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason })
    }),

  // Complete a booking (volunteers only)
  completeBooking: (bookingId) =>
    fetchWithAuth(`/bookings/${bookingId}/complete`, {
      method: 'PATCH'
    }),

  // Admin: Get all bookings
  getAllBookings: (status = 'all', page = 1, limit = 20) =>
    fetchWithAuth(`/bookings/admin/all?status=${status}&page=${page}&limit=${limit}`),
    

  // Contact Messages
  // Public - submit contact form (no auth required) - FIXED
  submitContactMessage: (messageData) => 
    fetchPublic('/contact/submit', {
      method: 'POST',
      body: JSON.stringify(messageData)
    }),

  // User - get their own messages (requires auth)
  getUserMessages: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchWithAuth(`/contact/user-messages${queryString ? `?${queryString}` : ''}`);
  },

  // Admin only - get contact messages
  getContactMessages: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchWithAuth(`/contact/messages${queryString ? `?${queryString}` : ''}`);
  },

  // Admin only - get notification count
  getContactNotificationCount: () =>
    fetchWithAuth('/contact/notifications'),

  // Admin only - mark message as read
  markContactMessageAsRead: (id) =>
    fetchWithAuth(`/contact/messages/${id}/read`, {
      method: 'PATCH'
    }),

  // Admin only - reply to message
  replyToContactMessage: (id, reply) =>
    fetchWithAuth(`/contact/messages/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ reply })
    }),

  // Admin only - delete message
  deleteContactMessage: (id) =>
    fetchWithAuth(`/contact/messages/${id}`, {
      method: 'DELETE'
    }),

  // Forum Posts
  getForumPosts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchWithAuth(`/forum/posts${queryString ? `?${queryString}` : ''}`);
  },

  getForumPostById: (id) => 
    fetchWithAuth(`/forum/posts/${id}`),

  createForumPost: (postData) => 
    fetchWithAuth('/forum/posts', {
      method: 'POST',
      body: JSON.stringify(postData)
    }),

  createForumReply: (postId, replyData) => 
    fetchWithAuth(`/forum/posts/${postId}/reply`, {
      method: 'POST',
      body: JSON.stringify(replyData)
    }),

  togglePostFavorite: (postId) => 
    fetchWithAuth(`/forum/posts/${postId}/favorite`, {
      method: 'POST'
    }),

  getUserFavorites: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchWithAuth(`/forum/favorites${queryString ? `?${queryString}` : ''}`);
  },

  getUserForumReplies: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchWithAuth(`/forum/users/replies${queryString ? `?${queryString}` : ''}`);
  },

  // Admin forum methods
  toggleLockPost: (postId) => 
    fetchWithAuth(`/forum/posts/${postId}/lock`, {
      method: 'PUT'
    }),

  deleteForumPost: (postId) => 
    fetchWithAuth(`/forum/posts/${postId}`, {
      method: 'DELETE'
    }),

  deleteForumReply: (replyId) => 
    fetchWithAuth(`/forum/replies/${replyId}`, {
      method: 'DELETE'
    })
};

export default api;