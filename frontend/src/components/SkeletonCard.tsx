import React from "react";

const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="w-full h-48 shimmer"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 shimmer rounded w-3/4"></div>
        <div className="h-4 shimmer rounded w-1/2"></div>
        <div className="h-8 shimmer rounded w-full"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;