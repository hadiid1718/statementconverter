import React from 'react';
import { infoCards } from '../utils/Data';

const Cards = () => {
  return (
    <div className="max-w-6xl mx-auto mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {infoCards.map((card, index) => {
          const Icon = card.icon;

          return (
            <div
              key={index}
              className="border border-gray-300 px-8 py-6 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-150"
            >
              <div className="flex flex-col justify-center items-center gap-3">
                <div className="text-3xl">
                  <Icon className={card.color} /> 
                </div>

                <h1 className="font-semibold text-3xl">
                  {card.title}
                </h1>

                <p className="text-center">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Cards;
