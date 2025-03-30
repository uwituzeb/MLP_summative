import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home';
import UploadData from './pages/UploadData';
import Visualizations from './pages/Visualizations';
import Retraining from './pages/Retraining';
import NavBar from './components/NavBar';
import Prediction from './pages/Prediction';

function App() {
  return (
    <>
      <Router>
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/prediction" element={<Prediction />} />
          <Route path="/visualizations" element={<Visualizations />} />
          <Route path="/upload" element={<UploadData />} />
          <Route path="/retrain" element={<Retraining />} />
          <Route path="*" element={<h1 className="text-center mt-10 text-2xl">404 - Page Not Found</h1>} />
        </Routes>
      </div>
    </Router>
      
    </>
  );
}

export default App;
