import React, { useEffect, useState } from "react";

function TestCaseViewer({ fileUrl }) {
  const [content, setContent] = useState("Loading...");

  useEffect(() => {
    fetch(fileUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch file");
        }
        return res.text();
      })
      .then((data) => setContent(data))
      .catch(() => setContent("⚠️ Error loading file"));
  }, [fileUrl]);

  return (
    <pre className="bg-white p-2 border rounded whitespace-pre-wrap break-words">
      {content}
    </pre>
  );
}

export default TestCaseViewer;
