import React, {useState, useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Visualizations = () => {
  const { parameter } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  const availableParameters = [
    { id: "education", label: "Education Level" },
    { id: "interest", label: "Interest" },
    { id: "favorite_subject", label: "Favorite Subject" },
    { id: "extracurriculars", label: "Extracurricular Activities" },
    { id: "personality_trait", label: "Personality Trait" }
  ];

  useEffect(() => {
    if(parameter){
      fetchVisualization(parameter);
    }
  }, []);

  const handleParameterSelect=() => {
    
  }

  const fetchVisualization = async (param) => {
    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const response = await fetch(`/api/visualization/${param}`);
      if (!response.ok) {
        throw new Error('Failed to fetch visualization');
      }
      const data = await response.json();
      setImageUrl(data.imageUrl);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="max-w-md mx-auto mt-20 p-6 font-primary">
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-3">Select Parameter to Visualize:</h2>
        <div className="flex flex-wrap gap-2">
          {availableParameters.map((item) => (
            <button
              key={item.id}
              onClick={() => handleParameterSelect(item.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                parameter === item.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 min-h-64">
        {!parameter && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <p>Select a parameter from above to view visualizations</p>
          </div>
        )}
        
        {loading && (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading visualization...</p>
          </div>
        )}
        
        {error && (
          <div className="flex flex-col items-center justify-center h-64 text-red-500">
            <p>{error}</p>
          </div>
        )}
        
        {imageUrl && !loading && !error && (
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-medium mb-4 capitalize">
              {parameter.replace('_', ' ')} Distribution
            </h3>
            <img 
              src={imageUrl} 
              alt={`${parameter} visualization`} 
              className="max-w-full h-auto border border-gray-200 rounded-md"
            />
            <p className="mt-4 text-sm text-gray-600">
              This graph shows the distribution and trends related to {parameter.replace('_', ' ')}
            </p>
          </div>
        )}
      </div>

    </div>
  )
}

export default Visualizations