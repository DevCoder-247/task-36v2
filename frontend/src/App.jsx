import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import './App.css';

function App() {
  const [refresh, setRefresh] = useState(false);

  const handleUpload = () => {
    setRefresh(!refresh);
  };

  return (
    <div className="App">
      <h1>File Upload App</h1>
      <FileUpload onUpload={handleUpload} />
      <FileList key={refresh} />
    </div>
  );
}

export default App;