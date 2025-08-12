import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import bgIllustration from '../assets/big-illustration.png';
import bgI from "../assets/bgI.jpeg"
import HeroText from './HeroText';
const HeroSection = () => {
    
  const navigate = useNavigate();
  const [ alertText, setAlertText ] = useState(false)
  
  return (
    <>
    <HeroText alertText={alertText} setAlertText={setAlertText}/>
         <div className="bg-gray-50 min-h-screen flex flex-col justify-center items-center text-center px-4 relative overflow-hidden  ">
      {/* Background Image */}
      <img
        src={bgI}
        alt="Background Illustration"
        className="absolute opacity-30 object-cover w-full h-full top-0 left-0 pointer-events-none"
      />

      {/* Main Content */}
      <div className="z-10 max-w-3xl py-20">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-6 leading-tight">
          Convert Bank Statements Instantly
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-8">
          Upload your PDF bank statement and convert it to Excel or CSV format in seconds.
        </p>
        <button
          onClick={() => navigate('/upload')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg transition"
        >
         Click Here to Upload Document 
        </button>
      </div>
    </div>
    </>
  )
}

export default HeroSection
