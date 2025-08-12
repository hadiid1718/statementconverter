import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ConvertResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fileName, downloadLinks } = location.state || {};

  if (!fileName || !downloadLinks) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center px-4">
        <h2 className="text-2xl font-semibold text-red-600">No file conversion data found.</h2>
        <button
          onClick={() => navigate('/upload')}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
        >
          Upload Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Conversion Successful!</h1>
        <p className="text-lg text-gray-600 mb-6">
          Your file <strong>{fileName}</strong> has been successfully converted.
        </p>

        <div className="space-y-4 mb-8">
          {downloadLinks?.csv && (
            <a
              href={downloadLinks.csv}
              className="block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition"
              download
            >
              Download CSV
            </a>
          )}
          {downloadLinks?.xlsx && (
            <a
              href={downloadLinks.xlsx}
              className="block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
              download
            >
              Download Excel (XLSX)
            </a>
          )}
        </div>

        <button
          onClick={() => navigate('/upload')}
          className="text-blue-600 hover:underline text-sm"
        >
          Convert Another File
        </button>
      </div>
    </div>
  );
};

export default ConvertResult;
