import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
  return (
    <>
        <nav className="bg-blue-600 p-4">
      <ul className="flex space-x-6 justify-center text-white">
        <li>
          <Link to="/" className="hover:underline">Home</Link>
        </li>
        <li>
          <Link to="/prediction" className="hover:underline">Prediction</Link>
        </li>
        <li>
          <Link to="/visualizations" className="hover:underline">Visualizations</Link>
        </li>
        <li>
          <Link to="/upload-data" className="hover:underline">Upload Data</Link>
        </li>
        <li>
          <Link to="/retraining" className="hover:underline">Retraining</Link>
        </li>
      </ul>
    </nav>
    </>
  )
}

export default NavBar