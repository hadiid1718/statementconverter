import React from 'react'
import { useNavigate } from 'react-router-dom'

const MoreInfo = () => {
    const navigate = useNavigate()
  return (
    <>
       <div className='border border-blue-50 px-14 py-8 max-w-6xl mx-auto rounded bg-blue-50'>
        <div className='flex flex-col gap-6 '>
            <h1 className='text-4xl font-semibold'>Need More?</h1>
            <p className='text-md'>We provide bespoke services for clients who have other document formats to process. Let us know how we can help!</p>
        </div>
        <button onClick={()=> navigate("/contact-us")} className='border border-blue-400 px-4 py-1 rounded bg-blue-400 text-white mt-4 hover:bg-blue-500'>Contact Us</button>
        </div> 
    </>
  )
}

export default MoreInfo
