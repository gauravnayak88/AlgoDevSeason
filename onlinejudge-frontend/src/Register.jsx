// Register.jsx
import { useState } from "react";
import API from "./api";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

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
                    setMessage((error.response.data['username'] ? (error.response.data['username'] + " ") : "") + (error.response.data['email'] ? error.response.data['email'] : ""));
                } else {
                    setMessage("Registration failed.");
                }
            });
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Register</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        name="username"
                        placeholder="Username"
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        name="role"
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="student">Student</option>
                    </select>
                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                    >
                        Register
                    </button>
                    <p>Already have an account? <Link to={'/login'} className="text-blue-800">click here to login</Link></p>
                </form>
                {message && <p className="mt-4 text-red-600 text-center">{message}</p>}
            </div>
        </div>
    );
}

export default Register;
