import React, {useState} from 'react'

const UploadData = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage('');
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
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      

      if (response.ok) {
      setMessage('File uploaded successfully!');
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
          Enter CSV file for prediction
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
      
      {file && (
        <p className="mt-4 text-sm text-gray-600">
          Selected file: {file.name}
        </p>
      )}
    </div>
  );
}

export default UploadData