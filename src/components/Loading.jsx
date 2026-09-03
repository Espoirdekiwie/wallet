import React from 'react';

function Loading({
  type = 'spinner',
  size = 'md',
  text = null,
  className = '',
  lines = 3
}) {
  if (type === 'dots') {
    return (
      <div className={`vault-pulse-loader ${className}`}>
        <span className="vault-pulse-dot"></span>
        <span className="vault-pulse-dot"></span>
        <span className="vault-pulse-dot"></span>
      </div>
    );
  }

  if (type === 'skeleton') {
    return (
      <div className={`w-100 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="skeleton-shimmer mb-2"
            style={{
              height: i === 0 ? '20px' : '14px',
              width: i === 0 ? '60%' : i === lines - 1 ? '40%' : '90%'
            }}
          />
        ))}
      </div>
    );
  }

  const spinnerClass = size === 'sm' ? 'vault-spinner-sm' : '';

  return (
    <div className={`d-flex flex-column align-items-center justify-content-center p-3 ${className}`}>
      <div className={`vault-spinner ${spinnerClass} mb-2`}></div>
      {text && <span className="small text-muted font-mono">{text}</span>}
    </div>
  );
}

export default Loading;
