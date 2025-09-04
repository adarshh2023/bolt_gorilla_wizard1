import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  onClick, 
  className = '',
  type = 'button',
  icon: Icon,
  ...props 
}) => {
  const baseClasses = `
    font-semibold rounded-xl transition-all duration-200 
    focus:outline-none focus:ring-4 focus:ring-offset-0
    transform hover:scale-105 active:scale-95
    disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none
    flex items-center justify-center space-x-2
    relative overflow-hidden
  `;
  
  const variantClasses = {
    primary: `
      bg-gradient-to-r from-blue-600 to-purple-600 
      hover:from-blue-700 hover:to-purple-700 
      text-white shadow-lg hover:shadow-xl focus:ring-blue-300/50
      disabled:from-gray-400 disabled:to-gray-500
    `,
    secondary: `
      bg-white hover:bg-gray-50 text-gray-700 
      border border-gray-200 hover:border-gray-300 
      shadow-md hover:shadow-lg focus:ring-gray-300/50
      disabled:bg-gray-100 disabled:text-gray-400
    `,
    success: `
      bg-gradient-to-r from-green-500 to-emerald-500 
      hover:from-green-600 hover:to-emerald-600 
      text-white shadow-lg hover:shadow-xl focus:ring-green-300/50
      disabled:from-gray-400 disabled:to-gray-500
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-pink-500 
      hover:from-red-600 hover:to-pink-600 
      text-white shadow-lg hover:shadow-xl focus:ring-red-300/50
      disabled:from-gray-400 disabled:to-gray-500
    `,
    outline: `
      border-2 border-blue-500 text-blue-600 hover:bg-blue-50 
      shadow-md hover:shadow-lg focus:ring-blue-300/50
      disabled:border-gray-300 disabled:text-gray-300
    `,
    ghost: `
      text-gray-600 hover:text-gray-800 hover:bg-gray-100
      focus:ring-gray-300/50
      disabled:text-gray-400
    `,
    gradient: `
      bg-gradient-to-r from-purple-500 to-pink-500 
      hover:from-purple-600 hover:to-pink-600 
      text-white shadow-lg hover:shadow-xl focus:ring-purple-300/50
      disabled:from-gray-400 disabled:to-gray-500
    `
  };
  
  const sizeClasses = {
    xs: 'px-3 py-1.5 text-xs',
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
    xl: 'px-10 py-5 text-lg'
  };
  
  const classes = `
    ${baseClasses} 
    ${variantClasses[variant]} 
    ${sizeClasses[size]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Button content */}
      <div className={`flex items-center space-x-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {Icon && <Icon className="w-4 h-4" />}
        <span>{children}</span>
      </div>
      
      {/* Shimmer effect */}
      {!disabled && !loading && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                          transform -skew-x-12 animate-shimmer"></div>
        </div>
      )}
    </button>
  );
};

export default Button;