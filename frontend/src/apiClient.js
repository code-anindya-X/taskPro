const API_BASE_URL = 'http://localhost:8082/taskpro';
const PUBLIC_AUTH_ENDPOINTS = new Set(['/user/login', '/user/signup']);

const getToken = () => {
  return localStorage.getItem('token');
};

const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  const token = getToken();
  if (includeAuth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

const getErrorMessage = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const text = (await response.text()).trim();

  if (!text) {
    return '';
  }

  if (contentType.includes('application/json')) {
    try {
      const data = JSON.parse(text);
      if (typeof data === 'string') {
        return data.trim();
      }

      if (data?.message) {
        return data.message;
      }
    } catch {
      return text;
    }

    return text;
  }

  return text;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await getErrorMessage(response);
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }
  
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
};

export const apiClient = {
  get: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(!PUBLIC_AUTH_ENDPOINTS.has(endpoint)),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  post: async (endpoint, body) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(!PUBLIC_AUTH_ENDPOINTS.has(endpoint)),
      credentials: 'include',
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  put: async (endpoint, body) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(!PUBLIC_AUTH_ENDPOINTS.has(endpoint)),
      credentials: 'include',
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  delete: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(!PUBLIC_AUTH_ENDPOINTS.has(endpoint)),
      credentials: 'include',
    });
    return handleResponse(response);
  },
};

export const authAPI = {
  signup: (userData) => apiClient.post('/user/signup', userData),
  login: (credentials) => apiClient.post('/user/login', credentials),
};

export const taskAPI = {
  getAllTasks: () => apiClient.get('/api/tasks'),
  getTaskById: (id) => apiClient.get(`/api/tasks/${id}`),
  createTask: (taskData) => apiClient.post('/api/tasks', taskData),
  updateTask: (id, taskData) => apiClient.put(`/api/tasks/${id}`, taskData),
  deleteTask: (id) => apiClient.delete(`/api/tasks/${id}`),
  searchTasks: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/api/tasks/search?${queryString}`);
  },
};

export const userAPI = {
  getUserInfo: () => apiClient.get('/user'),
  updateUser: (userData) => apiClient.put('/user', userData),
  deleteUser: () => apiClient.delete('/user'),
};
