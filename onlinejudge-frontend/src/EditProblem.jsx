import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "./api";
import TestCaseUpload from "./TestCaseUpload";

function EditProblem() {
  const { id } = useParams();
  const navigate = useNavigate();


  const [form, setForm] = useState({
    name: "",
    statement: "",
    difficulty: "easy",
    constraints: "",
    time_limit: "",
    memory_limit: "",
  });

  useEffect(() => {
    API.get(`/api/problems/${id}/`)
      .then((res) => setForm(res.data))
      .catch((err) => console.log(err));
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    API.put(`/api/problems/${id}/`, form)
      .then(() => {
        alert("Problem updated!");
        navigate(`/problems/${id}`);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Problem</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            id="name"
            name="name"
            value={form.name}
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
            value={form.statement}
            onChange={handleChange}
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2"
          />
        </div>

        <div>
        <label className="block text-sm font-medium text-gray-600 mt-4">Constraints (Markdown supported)</label>
        <textarea
          value={form.constraints}
          onChange={handleChange}
          rows={4}
          className="w-full border rounded px-3 py-2 font-mono text-sm focus:ring focus:ring-blue-200"
        />
        </div>

        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">Difficulty</label>
          <select
            id="difficulty"
            name="difficulty"
            value={form.difficulty}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2"
          >
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
              value={form.time_limit}
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
              value={form.memory_limit}
              onChange={handleChange}
              required
              min={1}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2"
            />
          </div>
        </div>

        <fieldset className="border p-4 rounded mb-4">
          <legend className="font-semibold">Sample Test Cases</legend>
          <TestCaseUpload isSample={true} />
        </fieldset>

        <fieldset className="border p-4 rounded mb-4">
          <legend className="font-semibold">Non-Sample Test Cases</legend>
          <TestCaseUpload isSample={false} />
        </fieldset>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProblem;
