import React from 'react';

const AssignmentMoveErrorBanner: React.FC<{ message: string | null }> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-segoe-ui text-sm text-red-700"
    >
      {message}
    </div>
  );
};

export default AssignmentMoveErrorBanner;
