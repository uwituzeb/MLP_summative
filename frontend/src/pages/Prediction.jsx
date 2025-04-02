import React, { useState } from 'react';


const Prediction = () => {
  const [formData, setFormData] = useState({
    Education: '',
    Interest: '',
    Favorite_Subject: '',
    Extracurriculars: '',
    Personality_Trait: ''
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const BACKEND_URL = process.env.REACT_APP_BASE_URL

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setError('An error occurred while fetching the prediction.');
    } finally {
      setLoading(false);
    }
  };

  const educationOptions = [
    "O-level",
    "A-level",
  ];



  return (
    <div className="max-w-md mx-auto mt-20 p-6">
      <form onSubmit={handleSubmit} className='space-y-4 font-primary'>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Education Level
          </label>
          <select
            name="Education"
            value={formData.Education}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          >
            <option value="">Select Education Level</option>
            {educationOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Interest
          </label>
          <input
            type="text"
            name="Interest"
            value={formData.Interest}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
            placeholder="E.g. Technology, Science, Arts"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Favorite Subject
          </label>
          <input
            type="text"
            name="Favorite_Subject"
            value={formData.Favorite_Subject}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
            placeholder="E.g. Mathematics, Physics, English"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Extracurricular Activities
          </label>
          <input
            type="text"
            name="Extracurriculars"
            value={formData.Extracurriculars}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
            placeholder="E.g. Sports, Art Club, Debate Team"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Personality Trait
          </label>
          <input
            type="text"
            name="Personality_Trait"
            value={formData.Personality_Trait}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
            placeholder="E.g. Leader, Creative, Analytical"
          />
        </div>

        <button
          type="submit"
          className={`w-full mt-4 bg-primary text-white hover:cursor-pointer py-3 px-8 rounded-md font-primary font-medium ${
            loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/75'
          }`}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Predict Career'}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {result && (
        <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <h2 className="font-bold text-lg mb-2">Prediction Results:</h2>
          <p>Recommended Career: {result.Recommended_Career}</p>
        </div>
      )}
    </div>
  )
}

export default Prediction