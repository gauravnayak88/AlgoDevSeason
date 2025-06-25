import API from './api'; // Axios instance (or just use axios)
import { useState } from 'react';

function AddProblem() {
  const [form, setForm] = useState({
    name: '',
    statement: '',
    difficulty: 'easy',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const token = localStorage.getItem('access');
    if (!token) {
      setMessage("You're not logged in");
      return;
    }

    API.post('/api/problems/', form)
      .then(() => setMessage("Problem added successfully!"))
      .catch((err) => {
        console.error(err);
        setMessage("Problem addition failed");
      });
  };

  return (
    <div>
      <h2>Add Problem</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Problem Name" onChange={handleChange} required />
        <textarea name="statement" placeholder="Problem Statement" onChange={handleChange} required />
        <select name="difficulty" onChange={handleChange}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <button type="submit">Submit</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default AddProblem;
