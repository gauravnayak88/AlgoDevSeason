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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Problem</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            id="name"
            name="name"
            onChange={handleChange}
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="statement" className="block text-sm font-medium text-gray-700">Statement</label>
          <textarea
            id="statement"
            name="statement"
            rows={10}
            onChange={handleChange}
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">Difficulty</label>
          <select
            id="difficulty"
            name="difficulty"
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2"
          >
            <option value="">Select Difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="time_limit" className="block text-sm font-medium text-gray-700">Time Limit (in seconds)</label>
            <input
              type="number"
              id="time_limit"
              name="time_limit"
              onChange={handleChange}
              required
              min={1}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="memory_limit" className="block text-sm font-medium text-gray-700">Memory Limit (in MB)</label>
            <input
              type="number"
              id="memory_limit"
              name="memory_limit"
              onChange={handleChange}
              required
              min={1}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </div>
      </form>

      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
    </div>
  );
}

export default AddProblem;
