import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const Input = forwardRef(({ 
  label,
  error,
  success,
  helperText,
  className = '',
  containerClassName = '',
  type = 'text',
  required = false,
  icon: Icon,
  rightIcon: RightIcon,
  animate = true,
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const inputClasses = `
    form-input
    ${Icon ? 'pl-12' : 'pl-4'}
    ${(RightIcon || isPassword || error || success) ? 'pr-12' : 'pr-4'}
    ${error ? 'input-error' : success ? 'input-success' : ''}
    ${focused ? 'ring-4 ring-blue-300/30 border-blue-500 bg-white/70' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const getRightIcon = () => {
    if (error) return AlertCircle;
    if (success) return CheckCircle;
    if (isPassword) return showPassword ? EyeOff : Eye;
    return RightIcon;
  };

  const getRightIconColor = () => {
    if (error) return 'text-red-500';
    if (success) return 'text-green-500';
    if (isPassword) return 'text-gray-400 hover:text-gray-600';
    return 'text-gray-400';
  };

  const CurrentRightIcon = getRightIcon();

  return (
    <div className={`${animate ? 'animate-fade-in' : ''} ${containerClassName}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative group">
        {/* Left Icon */}
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon className={`w-5 h-5 transition-colors duration-200 ${
              focused ? 'text-blue-500' : 'text-gray-400'
            }`} />
          </div>
        )}
        
        {/* Input Field */}
        <input
          ref={ref}
          type={inputType}
          className={inputClasses}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        
        {/* Right Icon */}
        {CurrentRightIcon && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <button
              type="button"
              className={`
                w-5 h-5 transition-all duration-200 
                ${getRightIconColor()}
                ${isPassword ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
              `}
              onClick={isPassword ? () => setShowPassword(!showPassword) : undefined}
              disabled={!isPassword}
            >
              <CurrentRightIcon className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {/* Focus Ring Animation */}
        <div className={`
          absolute inset-0 rounded-xl border-2 border-transparent
          transition-all duration-200 pointer-events-none
          ${focused ? 'border-blue-300 shadow-glow-sm' : ''}
        `} />
      </div>
      
      {/* Error/Success/Helper Text */}
      {(error || success || helperText) && (
        <div className="mt-2 animate-slide-up">
          {error && (
            <p className="text-red-600 text-sm flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </p>
          )}
          {success && !error && (
            <p className="text-green-600 text-sm flex items-center space-x-1">
              <CheckCircle className="w-4 h-4" />
              <span>{success}</span>
            </p>
          )}
          {helperText && !error && !success && (
            <p className="text-gray-500 text-sm">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

const TextArea = forwardRef(({ 
  label,
  error,
  success,
  helperText,
  className = '',
  containerClassName = '',
  rows = 4,
  required = false,
  animate = true,
  resize = true,
  ...props 
}, ref) => {
  const [focused, setFocused] = useState(false);

  const textareaClasses = `
    form-input
    ${error ? 'input-error' : success ? 'input-success' : ''}
    ${focused ? 'ring-4 ring-blue-300/30 border-blue-500 bg-white/70' : ''}
    ${resize ? 'resize-y' : 'resize-none'}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={`${animate ? 'animate-fade-in' : ''} ${containerClassName}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative group">
        <textarea
          ref={ref}
          rows={rows}
          className={textareaClasses}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        
        {/* Focus Ring Animation */}
        <div className={`
          absolute inset-0 rounded-xl border-2 border-transparent
          transition-all duration-200 pointer-events-none
          ${focused ? 'border-blue-300 shadow-glow-sm' : ''}
        `} />
      </div>
      
      {/* Error/Success/Helper Text */}
      {(error || success || helperText) && (
        <div className="mt-2 animate-slide-up">
          {error && (
            <p className="text-red-600 text-sm flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </p>
          )}
          {success && !error && (
            <p className="text-green-600 text-sm flex items-center space-x-1">
              <CheckCircle className="w-4 h-4" />
              <span>{success}</span>
            </p>
          )}
          {helperText && !error && !success && (
            <p className="text-gray-500 text-sm">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

// Number Input with increment/decrement buttons
const NumberInput = forwardRef(({ 
  label,
  error,
  success,
  helperText,
  className = '',
  containerClassName = '',
  min,
  max,
  step = 1,
  required = false,
  animate = true,
  ...props 
}, ref) => {
  const [value, setValue] = useState(props.value || props.defaultValue || '');
  const [focused, setFocused] = useState(false);

  const increment = () => {
    const currentValue = parseFloat(value) || 0;
    const newValue = currentValue + step;
    if (max === undefined || newValue <= max) {
      setValue(newValue);
      props.onChange?.({ target: { value: newValue } });
    }
  };

  const decrement = () => {
    const currentValue = parseFloat(value) || 0;
    const newValue = currentValue - step;
    if (min === undefined || newValue >= min) {
      setValue(newValue);
      props.onChange?.({ target: { value: newValue } });
    }
  };

  const handleChange = (e) => {
    setValue(e.target.value);
    props.onChange?.(e);
  };

  return (
    <div className={`${animate ? 'animate-fade-in' : ''} ${containerClassName}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative group">
        <input
          ref={ref}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`
            form-input pr-16
            ${error ? 'input-error' : success ? 'input-success' : ''}
            ${focused ? 'ring-4 ring-blue-300/30 border-blue-500 bg-white/70' : ''}
            ${className}
          `}
          {...props}
        />
        
        {/* Increment/Decrement Buttons */}
        <div className="absolute inset-y-0 right-0 flex flex-col">
          <button
            type="button"
            onClick={increment}
            className="flex-1 px-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 
                       rounded-tr-xl transition-colors duration-200 focus:outline-none"
          >
            ▲
          </button>
          <button
            type="button"
            onClick={decrement}
            className="flex-1 px-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 
                       rounded-br-xl transition-colors duration-200 focus:outline-none"
          >
            ▼
          </button>
        </div>
      </div>
      
      {/* Error/Success/Helper Text */}
      {(error || success || helperText) && (
        <div className="mt-2 animate-slide-up">
          {error && (
            <p className="text-red-600 text-sm flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </p>
          )}
          {success && !error && (
            <p className="text-green-600 text-sm flex items-center space-x-1">
              <CheckCircle className="w-4 h-4" />
              <span>{success}</span>
            </p>
          )}
          {helperText && !error && !success && (
            <p className="text-gray-500 text-sm">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
});

NumberInput.displayName = 'NumberInput';

Input.TextArea = TextArea;
Input.Number = NumberInput;

export default Input;