import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/",
});


// When I closed the app, and ran again after sometime, the local storage has a token stored,
// so I am logged in. But in the backend, the token has expired. The following was modified to solve it.
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem("refresh");

    if (error.response?.status === 401 && refreshToken && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post("http://localhost:8000/auth/jwt/refresh/", {
          refresh: refreshToken,
        });
        localStorage.setItem("access", res.data.access);
        originalRequest.headers["Authorization"] = `Bearer ${res.data.access}`;
        return axios(originalRequest); // retry original request
      } catch (err) {
        console.error("Refresh token failed", err);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        // Optional: redirect to login
      }
    }
    return Promise.reject(error);
  }
);


export default API;
