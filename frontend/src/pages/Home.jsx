import React from 'react';
import HeroSection from '../components/HeroSection';
import Cards from '../components/Cards';
import MoreInfo from '../components/MoreInfo';


const Home = () => {

  return (
     <>
     <div className='m-7'>
      <HeroSection/>
      <Cards/>
      <MoreInfo/>
     </div>
     </>
  );
};

export default Home;
