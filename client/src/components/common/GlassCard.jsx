import React from 'react';

/**
 * GlassCard — Primary surface card component.
 * Light theme: white background, subtle emerald shadow, rounded corners.
 * hover=true enables lift effect for interactive cards.
 */
const GlassCard = ({ children, className = '', hover = false, onClick = null, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-5 md:p-6 transition-all duration-250 ${
        hover ? 'glass-card' : 'glass-panel'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
