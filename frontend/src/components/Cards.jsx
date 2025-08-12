import React from 'react'
import { SiAdguard } from "react-icons/si";
import { CiBank } from "react-icons/ci";
import { LuTarget } from "react-icons/lu";
const Cards = () => {
    const Cards = [
        {
          icons: <SiAdguard className='text-red-700'/>,
          title: "Secure",
          description: "With years of experience in banking we comply with strict standards when handling your files.",

        },
        {
          icons: <CiBank className='text-yellow-700'/>,
          title: "Institutional",
          description: "We've provided our services to thousands of reputable financial, accounting and legal firms.",

        },
        {
          icons: <LuTarget className='text-red-700'/>,
          title: "Accurate",
          description: "We're continually improving our algorithms. If a file doesn't convert to your expectations, email us and we'll fix it.",

        },
    ]
  return (
    <>
       <div className='max-w-6xl mx-auto mb-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          { Cards.map((card, index)=> (
            <div className='border border-gray-300 px-8 py-6 shadow-md hover:shadow-xl hover:scale-105 hover:transition-all duration-150'>
                <div className='flex flex-col justify-center items-center gap-3'>
                    <div className='text-3xl'>
                        {card.icons}
                    </div>
                    <h1 className='font-semibold text-3xl'>{card.title}</h1>
                    <p className='text-center'>{card.description}</p>
                </div>
            </div>
          ))}
        </div>
       </div>
    </>
  )
}

export default Cards
