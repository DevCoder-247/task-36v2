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
        console.log('API response:', res.data); // Debug log
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
  if (!file?._id) {
    console.error('File ID missing:', file);
    return;
  }
  
  const fileUrl = `${import.meta.env.VITE_API_URL}/api/files/${file._id}`;
  
  if (file.mimetype?.startsWith('image/') || file.mimetype === 'application/pdf') {
    window.open(fileUrl, '_blank');
  } else {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = file.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                <td>{file.filename || 'Unknown'}</td>
                <td>{file.size || 'N/A'}</td>
                <td>{file.mimetype || 'Unknown'}</td>
                <td>{file.uploadDate ? new Date(file.uploadDate).toLocaleString() : 'N/A'}</td>
                <td>
                  {file.path && (
                    <button
                      onClick={() => openFile(file)}
                      className="file-open-button"
                    >
                      {file.mimetype?.startsWith('image/') ? 'View' : 'Download'}
                    </button>
                  )}
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