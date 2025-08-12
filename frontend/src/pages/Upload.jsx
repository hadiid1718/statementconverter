import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Upload = () => {

  console.log("Upload component rendering"); // Debug log
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate()
  
  const{ user } = useContext(AuthContext)
  console.log('🔍 User object:', user);
// console.log('🔍 User token:', user.token);
// console.log('🔍 Token type:', typeof user.token);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setError(null);
    } else {
      setError("Please select a PDF file");
      setSelectedFile(null);
    }
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:5000/api/convert", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Conversion failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `converted-${selectedFile.name.replace(".pdf", ".xlsx")}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError("Error converting file: " + error.message);
    } finally {
      setIsLoading(false);
      navigate("/dashboard")
    }
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "lightblue" }}>
      <h1>Upload Page</h1>
      <p>Please Select The Document You Wanted To Convert</p>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-400 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Upload Bank Statement
          </h2>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="fileInput"
            />
            <label
              htmlFor="fileInput"
              className="block text-center cursor-pointer"
            >
              <div className="mb-4">
                {/* Upload icon */}
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  Click here to upload document
                </p>
                <p className="mt-1 text-xs text-gray-500">PDF files only</p>
              </div>
            </label>

            {error && (
              <p className="text-red-500 text-sm text-center mt-2">{error}</p>
            )}

            {selectedFile && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 text-center">
                  Selected file: {selectedFile.name}
                </p>
                <button
                  onClick={handleConvert}
                  disabled={isLoading}
                  className={`
                    mt-4 w-full py-2 px-4 rounded-lg font-medium
                    ${
                      isLoading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600"
                    }
                    text-white transition-colors duration-200
                  `}
                >
                  {isLoading ? "Converting..." : "Convert to Excel"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
