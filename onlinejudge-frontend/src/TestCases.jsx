import { useParams } from "react-router-dom";
import API from "./api";
import { useEffect, useState } from "react";

function TestCases({problem_title}) {
    const { id } = useParams();
    const [testCases, setTestCases]= useState();

    useEffect(()=> {
        API.get(`/api/problems/${id}/testcases`)
        .then(res=> {
            setTestCases(res.data)
            // console.log("Successfully")
        })
        .catch(err=>{console.log(err)})
    }, [id])

    if (!testCases) return <p>Loading...</p>

    return (
        <div>
            <h1>Test Cases</h1>
            <p>Problem: {problem_title}</p>
            <ul>
            {
                testCases.map(tc => 
                    <li key={tc.id}>
                        <p><b>Input:</b></p>
                        <p>{tc.input}</p>
                        <p><b>Output:</b></p>
                        <p>{tc.output}</p>
                    </li>

                )
            }
            </ul>
        </div>
    )
}

export default TestCases;