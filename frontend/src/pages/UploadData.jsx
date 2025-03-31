import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';

const UploadData = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setMessage('');
      setError(null);
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a CSV file first');
      return;
    }

    if (!file.name.endsWith('.csv')) {
      setMessage('Only CSV files are accepted');
      return;
    }

    setIsUploading(true);
    setMessage('Uploading...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });
      

      if (response.ok) {
      setMessage('File uploaded successfully!');
      setSuccess(true);
      setUploadedFileName(file.name);
      sessionStorage.setItem('uploadedFile', file.name);
      } else {
        setMessage('Error uploading file. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <div className="max-w-md mx-auto mt-20 p-6">
      <div className="mb-8">
        <label 
          htmlFor="file-upload" 
          className="block w-full text-center bg-primary/20 text-primary py-3 px-4 rounded-t-lg font-medium text-sm cursor-pointer"
        >
          Upload CSV file for prediction
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="w-full border border-gray-300 p-3 rounded-b-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      
      <button
        onClick={handleUpload}
        disabled={isUploading || !file}
        className={`w-full bg-primary text-white hover:cursor-pointer py-3 px-8 rounded-md font-medium font-primary ${
          isUploading || !file ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/75'
        }`}
      >
        {isUploading ? 'Uploading...' : 'Upload'}
      </button>
      
      {message && (
        <p className={`mt-4 text-center ${
          message.includes('successfully') ? 'text-green-600' : 'text-red-600'
        }`}>
          {message}
        </p>
      )}
      
      {file && !success && (
        <p className="mt-4 text-sm text-gray-600">
          Selected file: {file.name}
        </p>
      )}

      {success && (
        <div className="mt-6 text-primary">
          <p className="mb-2 text-sm text-gray-600">
            Uploaded file: {uploadedFileName}
          </p>
          <button
            onClick={navigate('/retrain')}
            className="w-full bg-green-600 text-white hover:bg-green-700 py-3 px-8 rounded-md font-medium transition duration-200"
          >
            Continue to Model Retraining
          </button>
        </div>
      )}
    </div>
  );
}

export default UploadData