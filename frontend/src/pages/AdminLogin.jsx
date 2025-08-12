import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import adminService from "../services/adminService";

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ username: "Admin", password: "@admin#5656" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const data = await adminService.login(credentials.username, credentials.password);
      if (data.token) {
        localStorage.setItem('adminToken', data.token);
        navigate('/admin/dashboard');
      } else {
        setError('Unexpected response from server');
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-orange-400 relative overflow-hidden">
      {/* Decorative background circles */}
      <div className="absolute top-20 left-20 w-40 h-40 bg-white opacity-10 rounded-full"></div>
      <div className="absolute bottom-20 right-40 w-32 h-32 bg-white opacity-10 rounded-full"></div>
      <div className="absolute bottom-32 left-60 w-24 h-24 bg-white opacity-10 rounded-full"></div>

      <div className="relative z-10 bg-gray-900 bg-opacity-90 rounded-2xl shadow-2xl p-10 w-full max-w-md flex flex-col items-center">
        <div className="bg-red-500 rounded-full p-3 mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Admin Access</h2>
        <p className="text-gray-300 mb-6 text-center">Enter your admin credentials</p>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        
        <form className="w-full" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            required
            className="w-full mb-4 px-4 py-3 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            required
            className="w-full mb-6 px-4 py-3 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-bold text-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                Admin Login
              </>
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button
            className="text-gray-400 hover:text-white transition"
            onClick={() => navigate("/")}
            type="button"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
