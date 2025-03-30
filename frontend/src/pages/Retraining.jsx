import React, {useState} from 'react'

const Retraining = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isRetraining, setIsRetraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [retrainingStats, setRetrainingStats] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage('');
    }
  };

  const handleRetrain = async () => {

  }
  return (
    <div className="max-w-md mx-auto mt-20 p-6">
      
    </div>
  )
}

export default Retraining