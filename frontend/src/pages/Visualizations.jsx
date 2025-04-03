import React, {useState, useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Visualizations = () => {
  const [selectedParameter, setSelectedParameter] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [countPlotUrl, setCountPlotUrl] = useState(null);
  const [barPlotUrl, setBarPlotUrl] = useState(null);
  const BACKEND_URL = process.env.REACT_APP_BASE_URL;

  const availableParameters = [
    { id: "interest", label: "Interest" },
    { id: "extracurriculars", label: "Extracurricular Activities" },
    { id: "personality", label: "Personality Trait" }
  ];

  useEffect(() => {
    if(selectedParameter){
      fetchVisualization(selectedParameter);
    }
  }, [selectedParameter]);

  const handleParameterSelect=(param) => {
    setSelectedParameter(param);
    setCountPlotUrl(null);
    setBarPlotUrl(null);
    setError(null);
  }

  const fetchVisualization = async (param) => {
    setLoading(true);
    setError(null);
    setCountPlotUrl(null);
    setBarPlotUrl(null);

    try {
      const response = await fetch(`${BACKEND_URL}/visualizations/${param}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch visualization');
      }
      const data = await response.json();
      setCountPlotUrl(data.count_plot);
      setBarPlotUrl(data.bar_plot);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="max-w-[800px] mx-auto mt-20 p-6 font-primary">
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-3">Select Parameter to Visualize:</h2>
        <div className="flex flex-wrap gap-2">
          {availableParameters.map((item) => (
            <button
              key={item.id}
              onClick={() => handleParameterSelect(item.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                selectedParameter === item.id
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
        {!selectedParameter && (
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
        
        {countPlotUrl && barPlotUrl && !loading && !error && (
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-medium mb-4 capitalize">
              {selectedParameter.replace('_', ' ')} Visualizations
            </h3>
            <div className="space-y-4 w-full">
            <div className="border border-gray-200 rounded-md p-2">
              <h4 className="text-lg font-medium mb-2">Count Plot</h4>
              <img 
                src={countPlotUrl} 
                alt={`${selectedParameter} count plot`} 
                className="max-w-full h-auto border border-gray-200 rounded-md"
              />
            </div>
            <div className="border border-gray-200 rounded-md p-2">
              <h4 className="text-lg font-medium mb-2">Stacked Bar Plot</h4>
              <img 
                src={barPlotUrl} 
                alt={`${selectedParameter} bar visualization`} 
                className="max-w-full h-auto border border-gray-200 rounded-md"
              />
            </div>

            </div>
            
          </div>
        )}
      </div>

    </div>
  )
}

export default Visualizations