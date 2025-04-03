import React from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/images/hero-bg.png';

const Home = () => {
  return (
    <>
    <section id="home" className="min-h-[90vh] flex items-center justify-center px-4 py-12 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-12">
          <div className="w-1/2">
            <img 
              src={heroImage}
              className="w-full max-w-lg mx-auto" 
              alt="Person working at desk illustration" 
            />
          </div>
          
          <div className="w-1/2 text-center lg:text-left">
            <h1 className="text-[24px] font-bold tracking-tight text-gray-900 mb-6 font-primary">
              DISCOVER YOUR PASSION
            </h1>
            <p className="text-custom-grey text-[16px] mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed font-primary">
              Unlock your future with Pathway Finder –personalized career recommendations tailored to your interests, strengths and personality leveraging the power of machine learning.
            </p>
            <Link to="/prediction">
              <button className="bg-primary hover:bg-primary/75 hover:cursor-pointer text-white py-3 px-8 rounded-md text-lg font-medium transition-colors duration-300 w-64 font-primary">
                Start Predicting
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
    </>
  )
}

export default Home