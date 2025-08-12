import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getUserFiles } from '../services/fileService';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getUserFiles(user.token)
        .then(res => {
          setFiles(res);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Welcome, {user?.fullName || 'User'}
      </h1>

      {loading ? (
        <p className="text-center text-gray-600">Loading your files...</p>
      ) : files.length === 0 ? (
        <p className="text-center text-gray-500">No converted files yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="py-3 px-4 text-left">Filename</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Converted Format</th>
                <th className="py-3 px-4 text-left">Download</th>
              </tr>
            </thead>
            <tbody>
              {files.map(file => (
                <tr key={file.id} className="border-b text-gray-700">
                  <td className="py-3 px-4">{file.originalName}</td>
                  <td className="py-3 px-4 capitalize">{file.status}</td>
                  <td className="py-3 px-4">{file.outputFormat || 'CSV'}</td>
                  <td className="py-3 px-4">
                    {file.downloadUrl ? (
                      <a
                        href={file.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Download
                      </a>
                    ) : (
                      <span className="text-gray-400">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
