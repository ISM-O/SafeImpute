import apiClient from "./apiClient";

const authService = {
  // Check if email exists and if Face ID is enrolled
  checkEmail: async (email) => {
    try {
      const response = await apiClient.post("/check-email", { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      const response = await apiClient.post("/register", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Login with email and password
  loginWithPassword: async (email, password) => {
    try {
      const response = await apiClient.post("/login/password", {
        email,
        password,
      });
      if (response.data.access_token) {
        localStorage.setItem("authToken", response.data.access_token);
        localStorage.setItem("currentUser", JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Login with Face ID (vecteur facial)
  loginWithFace: async (email, faceDescriptor) => {
    try {
      const response = await apiClient.post("/login/face", {
        email,
        face_descriptor: faceDescriptor,
      });
      if (response.data.access_token) {
        localStorage.setItem("authToken", response.data.access_token);
        localStorage.setItem("currentUser", JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("authToken");
  },
};

export default authService;
