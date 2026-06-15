import apiClient from "./apiClient";

const adminService = {
  // Get all users
  getAllUsers: async () => {
    try {
      const response = await apiClient.get("/users");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update user permissions
  updateUserPermissions: async (userId, permissions) => {
    try {
      const response = await apiClient.put(
        `/users/${userId}/permissions`,
        permissions,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Deactivate user
  deactivateUser: async (userId) => {
    try {
      const response = await apiClient.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get audit logs
  getAuditLogs: async (params = {}) => {
    try {
      const response = await apiClient.get("/audit-logs", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get login history
  getLoginHistory: async (userId, params = {}) => {
    try {
      const response = await apiClient.get(`/users/${userId}/login-history`, {
        params,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get system statistics
  getStatistics: async () => {
    try {
      const response = await apiClient.get("/admin/statistics");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default adminService;
