import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "./api";

function EditProblem() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    statement: "",
    difficulty: "Easy",
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
    <div>
      <h2>Edit Problem</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name: </label><br/>
        <input id="name" name="name" value={form.name} onChange={handleChange} required /><br/>
        <label htmlFor="statement">Statement: </label><br/>
        <textarea
          id="statement"
          name="statement"
          value={form.statement}
          onChange={handleChange}
          required
        />
        <br/>
        <label htmlFor="difficulty">Difficult: </label><br/>
        <select id="difficulty" name="difficulty" value={form.difficulty} onChange={handleChange}>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <br/>
        <button type="submit">Update</button>
      </form>
    </div>
  );
}

export default EditProblem;
