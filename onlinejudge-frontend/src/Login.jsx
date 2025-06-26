// Login.jsx
import { useState } from "react";
import axios from "axios";
import API from "./api";
import { useNavigate } from "react-router-dom";

function Login({setIsAuthenticated}) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    API.post("/auth/jwt/create/", form)
      .then(res => {
        localStorage.setItem("access", res.data.access);
        localStorage.setItem("refresh", res.data.refresh);
        setIsAuthenticated(true)
        setMessage("Login successful!");
        navigate('/')
      })
      .catch(() => setMessage("Login failed."));
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Username or Email" onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} />
        <button>Login</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default Login;
