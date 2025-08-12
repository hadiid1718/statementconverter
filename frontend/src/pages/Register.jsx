import React, { useState } from "react";
import authService from "../services/authServices";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await authService.register({
        email: form.email,
        password: form.password,
        fullName: form.fullName
      });
      if (res.token) {
        localStorage.setItem('token', res.token);
        // Optionally log user into context
        try { await login(form.email, form.password); } catch {}
        navigate('/dashboard');
      } else {
        setError('Unexpected server response');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed');
    }
  };

  const handleGoogleSignUp = async (credentialResponse) => {
    try {
      // Handle Google sign-up logic here
      console.log(credentialResponse);
      // Send credentialResponse.credential to your backend
    } catch (error) {
      console.error('Google sign-up failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-400 relative overflow-hidden">
      {/* Optional background circles */}
      <div className="absolute top-20 left-20 w-40 h-40 bg-white opacity-10 rounded-full"></div>
      <div className="absolute bottom-20 right-40 w-32 h-32 bg-white opacity-10 rounded-full"></div>
      <div className="absolute bottom-32 left-60 w-24 h-24 bg-white opacity-10 rounded-full"></div>

      <div className="relative z-10 bg-gray-900 bg-opacity-90 rounded-2xl shadow-2xl p-10 w-full max-w-md flex flex-col items-center">
        <div className="bg-blue-500 rounded-full p-3 mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Get Started</h2>
        <p className="text-gray-300 mb-6 text-center">Create your account and start building</p>

        {/* Google Sign Up Button */}
        <button 
          onClick={() => {}} 
          className="w-full mb-4 py-3 px-4 rounded flex items-center justify-center bg-white hover:bg-gray-100 transition-colors"
        >
          <img 
            src="https://www.google.com/favicon.ico" 
            alt="Google" 
            className="w-5 h-5 mr-3"
          />
          <span className="text-gray-800 font-medium">Sign up with Google</span>
        </button>

        <div className="w-full flex items-center mb-6">
          <div className="flex-1 border-t border-gray-600"></div>
          <span className="px-4 text-gray-400 text-sm">OR</span>
          <div className="flex-1 border-t border-gray-600"></div>
        </div>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form className="w-full" onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="Full name"
            value={form.fullName}
            onChange={handleChange}
            className="w-full mb-4 px-4 py-3 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            className="w-full mb-4 px-4 py-3 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full mb-6 px-4 py-3 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <button
            type="submit"
            className="w-full py-3 rounded bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg transition"
          >
            Create Account
          </button>
        </form>
        <div className="mt-6 text-center">
          <span className="text-gray-400">Already have an account?</span>
          <button className="ml-2 text-blue-400 hover:underline font-semibold">Sign In</button>
        </div>
      </div>
    </div>
  );
};

export default Register;
