import { useEffect, useState } from "react";
import API from "./api";

export default function ContestAdminPanel() {
    const [contests, setContests] = useState([]);
    const [form, setForm] = useState({ name: "", start_time: "", end_time: "" });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");

    const fetchContests = () => {
        API.get("/api/contests/")
            .then(res => setContests(res.data))
            .catch(() => setError("Failed to load contests"));
    };

    useEffect(() => {
        fetchContests();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const method = editingId ? API.put : API.post;
        const url = editingId ? `/api/contests/${editingId}/` : "/api/contests/";

        method(url, form)
            .then(() => {
                fetchContests();
                setForm({ name: "", start_time: "", end_time: "" });
                setEditingId(null);
            })
            .catch(() => setError("Failed to save contest"));
    };

    const handleEdit = (contest) => {
        setForm({
            name: contest.name,
            start_time: contest.start_time,
            end_time: contest.end_time
        });
        setEditingId(contest.id);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this contest?")) {
            API.delete(`/api/contests/${id}/`)
                .then(fetchContests)
                .catch(() => setError("Failed to delete"));
        }
    };

    return (
        <div className="p-6 bg-white rounded shadow">
            <h2 className="text-xl font-bold mb-4">🛠 Manage Contests</h2>

            {error && <div className="text-red-600">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                <input
                    type="text"
                    placeholder="Contest Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                    required
                />
                <input
                    type="datetime-local"
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                    required
                />
                <input
                    type="datetime-local"
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                    required
                />
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    {editingId ? "Update Contest" : "Add Contest"}
                </button>
            </form>

            <h3 className="text-lg font-semibold mb-2">Existing Contests</h3>
            <ul className="space-y-2">
                {contests.map(contest => (
                    <li key={contest.id} className="flex justify-between items-center border p-2 rounded">
                        <span>
                            <b>{contest.name}</b> <br />
                            <small>{new Date(contest.start_time).toLocaleString()} → {new Date(contest.end_time).toLocaleString()}</small>
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(contest)}
                                className="text-blue-600 hover:underline"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(contest.id)}
                                className="text-red-600 hover:underline"
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
