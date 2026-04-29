import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh/`, { refresh });
          localStorage.setItem('access_token', data.access);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  me: () => api.get('/auth/me/'),
  updateProfile: (data) => api.patch('/auth/me/', data),
};

// Menu
export const menuAPI = {
  getCategories: () => api.get('/menu/categories/'),
  getProducts: (params) => api.get('/menu/products/', { params }),
  createProduct: (data) => api.post('/menu/products/', data),
  updateProduct: (id, data) => api.patch(`/menu/products/${id}/`, data),
  deleteProduct: (id) => api.delete(`/menu/products/${id}/`),
  createCategory: (data) => api.post('/menu/categories/', data),
  updateCategory: (id, data) => api.patch(`/menu/categories/${id}/`, data),
  deleteCategory: (id) => api.delete(`/menu/categories/${id}/`),
};

// Orders
export const ordersAPI = {
  list: (params) => api.get('/orders/', { params }),
  myOrders: () => api.get('/orders/my-orders/'),
  create: (data) => api.post('/orders/', data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status/`, { status }),
  get: (id) => api.get(`/orders/${id}/`),
};

// Tables
export const tablesAPI = {
  list: (params) => api.get('/tables/', { params }),
  create: (data) => api.post('/tables/', data),
  update: (id, data) => api.patch(`/tables/${id}/`, data),
  delete: (id) => api.delete(`/tables/${id}/`),
};

// Delivery
export const deliveryAPI = {
  getZones: () => api.get('/delivery/zones/'),
  createZone: (data) => api.post('/delivery/zones/', data),
  updateZone: (id, data) => api.patch(`/delivery/zones/${id}/`, data),
  deleteZone: (id) => api.delete(`/delivery/zones/${id}/`),
};

// Payments
export const paymentsAPI = {
  list: () => api.get('/payments/'),
  create: (data) => api.post('/payments/', data),
  get: (id) => api.get(`/payments/${id}/`),
};

// Stats
export const statsAPI = {
  overview: () => api.get('/stats/overview/'),
  topProducts: (limit = 10) => api.get('/stats/top-products/', { params: { limit } }),
  dailyRevenue: (days = 7) => api.get('/stats/daily-revenue/', { params: { days } }),
  ordersByType: () => api.get('/stats/orders-by-type/'),
};
