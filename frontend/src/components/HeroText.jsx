import React, { useState } from 'react'

const HeroText = ({ alertText, setAlertText}) => {

  if(alertText) return null;
   const ClosText = ()=> {
    setAlertText(!alertText)
   }

  return (
    <div className='bg-yellow-700 text-center relative px-4 py-1'>
      <p >Register your self to upload & convert Documents</p> 
      <button className='absolute z-10 top-1 right-4' onClick={ClosText                                           }>X</button>
    </div>
  )
}

export default HeroText
