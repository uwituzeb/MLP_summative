import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

const Retraining = () => {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState(null);
  const [message, setMessage] = useState('');
  const [isRetraining, setIsRetraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [retrainingStats, setRetrainingStats] = useState(null);

  useEffect(() => {
    const uploadedFile = sessionStorage.getItem('uploadedFile');
    if (uploadedFile) {
      setFileName(uploadedFile);
    } else {
      setMessage('No file uploaded. Please upload a file first.');
    }
  }, []);

  const handleRetrain = async () => {
    if (!fileName) {
      setMessage('Please upload a file first.');
      return;
    }

    setIsRetraining(true);
    setMessage('Retraining in progress...');
    setProgress(10);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 5;
          return newProgress < 90 ? newProgress : prev;
        });
      }, 1000);

      const response = await fetch('/api/retrain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error('Retraining process failed');
      }

      const result = await response.json();
      setRetrainingStats(result);
      setProgress(100);
      setMessage('Retraining completed successfully!');
    } catch (error) {
      setMessage('An error occurred during retraining. Please try again.');
    } finally {
      setIsRetraining(false);
    }
  }

  const handleBackToUpload = () => {
    navigate('/upload');
  };



  return (
    <div className="max-w-md mx-auto mt-20 p-6 font-primary">
      {!fileName ? (
        <div className="text-center justify-center items-center flex flex-col h-[40vh]">
        <p className="text-red-600 mb-4">{message}</p>
        <button
          onClick={handleBackToUpload}
          className="bg-primary text-white py-2 px-4 rounded hover:bg-primary/75 cursor-pointer"
        >
          Go to Upload Page
        </button>
      </div>
      ) : (
        <>
          <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
            <h2 className="font-medium mb-2">File Ready for Retraining:</h2>
            <p className="text-gray-700">{fileName}</p>
          </div>
          
          <button
            onClick={handleRetrain}
            disabled={isRetraining}
            className={`w-full bg-primary text-white hover:cursor-pointer py-3 px-8 rounded-md font-medium font-primary ${
              isRetraining ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/75'
            }`}
          >
            {isRetraining ? 'Retraining in progress...' : 'Start Retraining'}
          </button>
          
          {isRetraining && (
            <div className="mt-6">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">{progress}% complete</p>
            </div>
          )}
          
          {message && (
            <p className={`mt-4 text-center ${
              message.includes('successfully') ? 'text-green-600' : 
              message.includes('Error') ? 'text-red-600' : 'text-blue-600'
            }`}>
              {message}
            </p>
          )}
          
          {retrainingStats && (
            <div className="mt-8 p-4 bg-gray-50 rounded border border-gray-200">
              <h2 className="font-bold text-lg mb-3">Retraining Results</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Accuracy:</span>
                  <span className="font-medium">{retrainingStats.accuracy || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Precision:</span>
                  <span className="font-medium">{retrainingStats.precision || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Recall:</span>
                  <span className="font-medium">{retrainingStats.recall || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">F1 Score:</span>
                  <span className="font-medium">{retrainingStats.f1 || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Retraining