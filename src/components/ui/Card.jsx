import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  padding = 'p-8',
  shadow = 'shadow-glass',
  border = 'border border-white/20',
  animate = true,
  hover = true,
  ...props 
}) => {
  const classes = `
    glass-card rounded-2xl ${shadow} ${border} ${padding}
    ${animate ? 'animate-scale-in' : ''}
    ${hover ? 'hover:shadow-elevated transition-all duration-300 hover:scale-[1.01]' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '', animate = true }) => (
  <div className={`mb-6 ${animate ? 'animate-fade-in' : ''} ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '', icon: Icon, gradient = false }) => (
  <div className="flex items-center space-x-3">
    {Icon && (
      <div className="section-icon">
        <Icon className="w-5 h-5" />
      </div>
    )}
    <h3 className={`
      text-2xl font-bold text-gray-800
      ${gradient ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent' : ''}
      ${className}
    `}>
      {children}
    </h3>
  </div>
);

const CardSubtitle = ({ children, className = '' }) => (
  <p className={`text-gray-600 mt-2 leading-relaxed ${className}`}>
    {children}
  </p>
);

const CardContent = ({ children, className = '', animate = true }) => (
  <div className={`
    ${animate ? 'form-section' : ''} 
    ${className}
  `}>
    {children}
  </div>
);

const CardFooter = ({ 
  children, 
  className = '', 
  justify = 'justify-between',
  animate = true 
}) => (
  <div className={`
    mt-8 pt-6 border-t border-gray-200/50 
    flex items-center ${justify} 
    ${animate ? 'animate-fade-in' : ''}
    ${className}
  `}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Subtitle = CardSubtitle;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;