import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FileList = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/files`);
        const filesArray = Array.isArray(res.data) ? res.data : [];
        setFiles(filesArray);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to fetch files. Server might be down.');
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, []);

  const openFile = (file) => {
    const filename = file.path.split('/').pop(); // Extract filename from path
    const fileUrl = `${import.meta.env.VITE_API_URL}/api/files/${filename}`;
    
    // Handle different file types
    if (file.mimetype.startsWith('image/')) {
      // Open image in new tab
      window.open(fileUrl, '_blank');
    } else if (file.mimetype === 'application/pdf') {
      // PDFs will open in browser's PDF viewer
      window.open(fileUrl, '_blank');
    } else {
      // Download other file types
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = file.filename;
      link.click();
    }
  };

  if (loading) return <div className="loading">Loading files...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="file-list">
      <h2>Uploaded Files</h2>
      {files.length === 0 ? (
        <p>No files uploaded yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Filename</th>
              <th>Size (bytes)</th>
              <th>Type</th>
              <th>Upload Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file._id || file.filename}>
                <td>{file.filename}</td>
                <td>{file.size}</td>
                <td>{file.mimetype}</td>
                <td>{new Date(file.uploadDate).toLocaleString()}</td>
                <td>
                  <button 
                    onClick={() => openFile(file)}
                    className="file-open-button"
                  >
                    {file.mimetype.startsWith('image/') ? 'View' : 'Download'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FileList;