import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Navbar from './Navbar';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import ProblemList from './ProblemList';
import ProblemDetail from './ProblemDetail';
import AddProblem from './AddProblem';
import EditProblem from './EditProblem';
import Profile from './Profile';

import './App.css'

function App() {
  return (
    <Router>
      <div>
      <Navbar />
      </div>
      <Routes>
        <Route path='' element={<Dashboard />} />
        <Route path='/login' element={<Login />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/register' element={<Register />} />
        <Route path='/problems' element={<ProblemList />} />
        <Route path='/problems/:id' element={<ProblemDetail />} />
        <Route path='/problems/:id/edit' element={<EditProblem />} />
        <Route path='/addproblem' element={<AddProblem />} />
      </Routes>
    </Router>
  )
}

export default App
