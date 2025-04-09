import React from "react";

const SkeletonLoader = ({ width, height, borderRadius }) => {
  return (
    <div className="skeleton" style={{ width, height, borderRadius }}></div>
  );
};

export default SkeletonLoader;
