import React from 'react';

const GlassCard = ({ children, className = '', hover = false, onClick = null, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-5 md:p-6 transition-all duration-200 ${
        hover ? 'glass-card cursor-pointer' : 'glass-panel'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
