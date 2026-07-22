import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const axiosInstance = axios.create({ baseURL, withCredentials: true });

let accessToken = null;
export function setAccessToken(token) {
  accessToken = token;
}

axiosInstance.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let refreshPromise = null;

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    if (response?.status === 401 && !config._retried && !config.url.includes('/auth/')) {
      config._retried = true;
      try {
        refreshPromise = refreshPromise || axiosInstance.post('/auth/refresh');
        const { data } = await refreshPromise;
        refreshPromise = null;
        setAccessToken(data.data.accessToken);
        config.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return axiosInstance(config);
      } catch (refreshErr) {
        refreshPromise = null;
        setAccessToken(null);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
