import React from 'react';

interface OfflineBannerProps {
  isOnline: boolean;
}

const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOnline }) => {
  if (isOnline) return null;

  return (
    <div className="bg-yellow-50 border-b-2 border-yellow-300 px-4 py-3 flex items-center gap-2">
      <span className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span>
      <p className="text-sm font-medium text-yellow-800">
        📡 You're offline. Changes will sync when you're back online.
      </p>
    </div>
  );
};

export default OfflineBanner;
