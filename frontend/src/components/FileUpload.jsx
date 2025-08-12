import React, { useRef, useState } from 'react';
import uploadIcon from '../assets/upload-icon.svg';

const FileUpload = ({ onFileSelect }) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      onFileSelect(file);
    } else {
      alert('Only PDF files are allowed');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      onFileSelect(file);
    } else {
      alert('Only PDF files are allowed');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const clearFile = () => {
    setSelectedFile(null);
    onFileSelect(null);
    fileInputRef.current.value = '';
  };

  return (
    <div
      className="border-2 border-dashed border-gray-300 p-6 rounded-md text-center cursor-pointer bg-white hover:bg-gray-50 transition"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleUploadClick}
    >
      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {!selectedFile ? (
        <>
          <img
            src={uploadIcon}
            alt="Upload"
            className="mx-auto mb-4 w-12 h-12"
          />
          <p className="text-gray-600">
            <strong>Click to upload</strong> or drag and drop
          </p>
          <p className="text-sm text-gray-400">Only PDF files are supported</p>
        </>
      ) : (
        <div className="flex flex-col items-center">
          <p className="text-blue-600 font-medium">{selectedFile.name}</p>
          <button
            onClick={clearFile}
            className="mt-2 text-sm text-red-500 hover:underline"
          >
            Remove file
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
