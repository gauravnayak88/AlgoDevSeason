
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API from './api';

function ProblemList() {
    const [problems, setProblems] = useState([])

    useEffect(() => {
        API.get('api/problems/')
            .then(res => setProblems(res.data))
            .catch(err => console.log(err));
    }, [])
    return (
        <div>
            <h2>Problems</h2>
            <Link to={'/addproblem'}><button>Contribute a problem</button></Link>
            <ul>
                {problems.map(p => (
                    <li key={p.id}>
                        <strong>{p.name}</strong> - ({p.difficulty})
                        <Link to={`/problems/${p.id}`}>
                            <button>View</button>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default ProblemList;
