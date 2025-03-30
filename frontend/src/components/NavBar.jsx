import React, {useState} from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavBar = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(location.pathname);
  
  const isActive = (path) => {
    return activeItem === path;
  };
  return (
    <>
      <nav className="flex items-center justify-between px-6 md:px-10 py-4 md:py-6 border-b border-gray-200">
      <div className="text-2xl font-bold text-primary font-secondary ">
        <Link to="/">PathwayFinder</Link>
      </div>
      
      <ul className="flex space-x-8">
        <li>
          <Link 
            to="/" 
            className={`text-custom-grey hover:text-primary ${isActive('/') ? 'border-b-2  border-primary' : ''}`}
            onClick={() => setActiveItem('/')}
          >
            Home
          </Link>
        </li>
        <li>
          <Link 
            to="/prediction" 
            className={`text-custom-grey hover:text-primary ${isActive('/') ? 'border-b-2  border-primary' : ''}`}
            onClick={() => setActiveItem('/prediction')}
          >
            Prediction
          </Link>
        </li>
        <li>
          <Link 
            to="/visualizations" 
            className={`text-custom-grey hover:text-primary ${isActive('/') ? 'border-b-2  border-primary' : ''}`}
            onClick={() => setActiveItem('/visualizations')}
          >
            Visualizations
          </Link>
        </li>
        <li>
          <Link 
            to="/upload" 
            className={`text-custom-grey hover:text-primary ${isActive('/') ? 'border-b-2  border-primary' : ''}`}
            onClick={() => setActiveItem('/upload')}
          >
            Upload
          </Link>
        </li>
        <li>
          <Link 
            to="/retrain" 
            className={`text-custom-grey hover:text-primary ${isActive('/') ? 'border-b-2  border-primary' : ''}`}
            onClick={() => setActiveItem('/retrain')}
          >
            Retrain
          </Link>
        </li>
      </ul>
    </nav>
    </>
  )
}

export default NavBar