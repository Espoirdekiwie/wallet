import React, { useState } from 'react';
import { FiEye, FiEyeOff, FiCopy, FiCheck } from 'react-icons/fi';

function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  mono = false,
  readOnly = false,
  disabled = false,
  error = null,
  helperText = null,
  icon = null,
  showCopy = false,
  showMax = false,
  onMaxClick = null,
  className = '',
  id,
  required = false,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <div className="d-flex justify-content-between align-items-center mb-1">
          <label htmlFor={id} className="vault-label mb-0">
            {label} {required && <span className="text-danger">*</span>}
          </label>
          {showMax && (
            <button
              type="button"
              onClick={onMaxClick}
              className="max-badge-btn border-0"
            >
              MAX
            </button>
          )}
        </div>
      )}

      <div className="input-group">
        {icon && (
          <span className="input-group-text bg-transparent border-end-0 border-secondary border-opacity-25 text-muted">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={effectiveType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          disabled={disabled}
          required={required}
          className={`form-control vault-input ${mono ? 'vault-input-mono' : ''} ${error ? 'is-invalid border-danger' : ''} ${icon ? 'border-start-0' : ''}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="btn btn-vault-glass"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        )}
        {showCopy && (
          <button
            type="button"
            onClick={handleCopy}
            className="btn btn-vault-outline-orange"
            title="Copy to clipboard"
          >
            {copied ? <FiCheck className="text-success" /> : <FiCopy />}
          </button>
        )}
      </div>

      {error && <div className="text-danger small mt-1 font-mono">{error}</div>}
      {helperText && !error && <div className="text-dim small mt-1 font-mono">{helperText}</div>}
    </div>
  );
}

export default Input;
