import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import API from './api';
import Navbar from './Navbar';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import ProblemList from './ProblemList';
import ProblemDetail from './ProblemDetail';
import AddProblem from './AddProblem';
import EditProblem from './EditProblem';
import Profile from './Profile';
import Solutions from './Solutions';
import SolutionDetail from './SolutionDetail';


import './App.css'

function App() {
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access");
    setIsAuthenticated(!!token);

    if (token) {
      API.get("/api/profile/")
        .then((res) => setProfile(res.data))
        .catch(() => setProfile(null));
    } else {
      setProfile(null);
    }
  }, []);


  {
    profile ? (
      <>
        <span style={{ marginLeft: '1rem' }}>Hello, <strong>{profile.username}</strong></span>
        <button onClick={() => {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.href = "/login"; // redirect
        }}>Logout</button>
      </>
    ) : (
      <Link to="/login"><button>Login</button></Link>
    )
  }

  return (
    <Router>
      <Navbar profile={profile} isAuthenticated={isAuthenticated} />
      <Routes>
        <Route path='' element={<Dashboard />} />
        <Route path='/login' element={<Login />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/register' element={<Register />} />
        <Route path='/problems' element={<ProblemList />} />
        <Route path='/problems/:id' element={<ProblemDetail />} />
        <Route path='/problems/:id/edit' element={<EditProblem />} />
        <Route path='/problems/:id/solutions' element={<Solutions />} />
        <Route path='/solutions/:id' element={<SolutionDetail />} />
        <Route path='/addproblem' element={<AddProblem />} />
      </Routes>
    </Router>
  )
}

export default App
