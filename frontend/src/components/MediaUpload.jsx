import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../utils/api';

const MediaUpload = ({ media = [], onMediaChange }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();
  const { getIdToken } = useAuth();

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Validate files
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg', 'video/mov'];
    
    for (let file of fileArray) {
      if (file.size > maxSize) {
        alert(`File "${file.name}" is too large. Maximum size is 50MB.`);
        return;
      }
      if (!allowedTypes.includes(file.type)) {
        alert(`File "${file.name}" has an unsupported format. Only images and videos are allowed.`);
        return;
      }
    }

    setUploading(true);
    
    try {
      const result = await apiService.uploadMedia(fileArray, getIdToken);
      const newMedia = [...media, ...result.files];
      onMediaChange(newMedia);
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e) => {
    handleFileSelect(e.target.files);
    e.target.value = ''; // Reset input
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeMedia = async (mediaItem) => {
    try {
      await apiService.deleteMedia(mediaItem.filename, getIdToken);
      const updatedMedia = media.filter(item => item.id !== mediaItem.id);
      onMediaChange(updatedMedia);
    } catch (error) {
      console.error('Delete failed:', error);
      alert(`Delete failed: ${error.message}`);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={uploading}
        />
        
        <div className="space-y-3">
          <div className="text-gray-400">
            <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          
          {uploading ? (
            <div>
              <div className="text-gray-600 mb-2">Uploading...</div>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div>
              <div className="text-lg font-medium text-gray-900">
                Drop files here or{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="text-blue-600 hover:text-blue-500"
                >
                  browse
                </button>
              </div>
              <p className="text-sm text-gray-500">
                Images and videos up to 50MB each
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Media Preview */}
      {media.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">Uploaded Media ({media.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {media.map((item) => (
              <div key={item.id} className="relative group border border-gray-200 rounded-lg overflow-hidden">
                {/* Preview */}
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  {item.type === 'image' ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${item.path}`}
                      alt={item.originalName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${item.path}`}
                      className="w-full h-full object-cover"
                      controls
                      preload="metadata"
                    />
                  )}
                </div>
                
                {/* Info */}
                <div className="p-3 bg-white">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {item.originalName}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatFileSize(item.size)} • {item.type}
                  </div>
                </div>
                
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeMedia(item)}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  title="Remove media"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUpload;