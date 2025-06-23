// Register.jsx
import { useState } from "react";
import API from "./api";
import { useNavigate } from "react-router-dom";

function Register() {
    const [form, setForm] = useState({ username: "", email: "", password: "", role: "student" });
    const [message, setMessage] = useState("");
    const navigate = useNavigate()
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        API.post("/auth/users/", form)
            .then(() => {
                setMessage("Registered successfully!")
                navigate('/login')
            })
            .catch((error) => {
                if (error.response && error.response.data) {
                    console.log(error.response.data);  // <-- shows exact field errors
                    setMessage(JSON.stringify(error.response.data));
                } else {
                    setMessage("Registration failed.");
                }
            });
    };

    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <input name="username" placeholder="Username" onChange={handleChange} />
                <input name="email" placeholder="Email" onChange={handleChange} />
                <input name="password" type="password" placeholder="Password" onChange={handleChange} />
                <select name="role" onChange={handleChange}>
                    <option value="student">Student</option>
                    <option value="staff">Staff</option>
                </select>
                <button>Register</button>
            </form>
            <p>{message}</p>
        </div>
    );
}

export default Register;
