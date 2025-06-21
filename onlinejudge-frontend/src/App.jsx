import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Navbar from './navbar';
import Dashboard from './Dashboard';
import ProblemList from './ProblemList';
import ProblemDetail from './ProblemDetail';

import './App.css'

function App() {
  return (
    <Router>
      <div>
      <Navbar />
      </div>
      <Routes>
        <Route path='' element={<Dashboard />} />
        <Route path='/problems' element={<ProblemList />} />
        <Route path='/problems/:id' element={<ProblemDetail />} />
      </Routes>
    </Router>
  )
}

export default App
