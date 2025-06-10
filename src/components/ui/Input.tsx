import React from 'react';
import { FiAlertCircle, FiCheck } from 'react-icons/fi';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  success,
  helpText,
  leftIcon,
  rightIcon,
  fullWidth = true,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  
  const baseClasses = 'block px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 sm:text-sm transition-colors';
  
  const stateClasses = error
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
    : success
    ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500';
  
  const classes = `
    ${baseClasses}
    ${stateClasses}
    ${leftIcon ? 'pl-10' : ''}
    ${rightIcon || error || success ? 'pr-10' : ''}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{leftIcon}</span>
          </div>
        )}
        
        <input
          id={inputId}
          className={classes}
          {...props}
        />
        
        {(rightIcon || error || success) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {error ? (
              <FiAlertCircle className="h-5 w-5 text-red-400" />
            ) : success ? (
              <FiCheck className="h-5 w-5 text-green-400" />
            ) : (
              rightIcon && <span className="text-gray-400">{rightIcon}</span>
            )}
          </div>
        )}
      </div>
      
      {(error || helpText) && (
        <div className="mt-1">
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : helpText ? (
            <p className="text-sm text-gray-500">{helpText}</p>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Input; 