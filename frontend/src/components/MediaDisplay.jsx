import React from 'react';

const MediaDisplay = ({ media = [] }) => {
  if (!media || media.length === 0) {
    return null;
  }

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  return (
    <div className="space-y-4 mt-6">
      {media.map((item) => (
        <div key={item.id} className="rounded-lg overflow-hidden border border-gray-200">
          {item.type === 'image' ? (
            <img
              src={`${apiUrl}${item.path}`}
              alt={item.originalName || 'Post image'}
              className="w-full h-auto"
              loading="lazy"
            />
          ) : item.type === 'video' ? (
            <video
              src={`${apiUrl}${item.path}`}
              controls
              preload="metadata"
              className="w-full h-auto"
            >
              Your browser does not support the video tag.
            </video>
          ) : null}
          
          {/* Optional: Display filename for accessibility */}
          {item.originalName && (
            <div className="px-3 py-2 bg-gray-50 text-xs text-gray-500 border-t">
              {item.originalName}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MediaDisplay;