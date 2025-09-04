import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

const ProgressBar = ({ 
  steps, 
  currentStep, 
  completedSteps = new Set(), 
  onStepClick,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {steps.map((step, index) => {
        const isCompleted = completedSteps.has(step.id);
        const isCurrent = currentStep === step.id;
        const isClickable = step.id <= currentStep || isCompleted;
        const isAccessible = step.id <= Math.max(currentStep, Math.max(...Array.from(completedSteps), 0) + 1);
        
        return (
          <React.Fragment key={step.id}>
            <div 
              className={`
                group flex items-center space-x-3 cursor-pointer transition-all duration-300 transform
                px-4 py-3 rounded-xl relative
                ${isClickable ? 'hover:scale-105 hover:shadow-lg' : 'cursor-not-allowed opacity-60'}
                ${isCurrent ? 'bg-gradient-to-r from-blue-100 to-purple-100 shadow-lg' : ''}
                ${isCompleted ? 'bg-gradient-to-r from-green-100 to-emerald-100' : ''}
                ${!isCompleted && !isCurrent && isAccessible ? 'hover:bg-gray-100' : ''}
              `}
              onClick={() => isClickable && onStepClick?.(step.id)}
            >
              {/* Step Number/Icon */}
              <div className={`
                progress-step relative z-10
                ${isCurrent ? 'active animate-pulse-soft' : ''}
                ${isCompleted ? 'completed' : ''}
                ${!isCompleted && !isCurrent ? 'inactive' : ''}
              `}>
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6" />
                ) : isCurrent ? (
                  <div className="relative">
                    <Circle className="w-6 h-6" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold">{step.id}</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Circle className="w-6 h-6" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold">{step.id}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Step Label */}
              <div className={`
                text-sm font-semibold transition-colors duration-300 whitespace-nowrap
                ${isCurrent ? 'text-blue-700' : ''}
                ${isCompleted ? 'text-green-700' : ''}
                ${!isCompleted && !isCurrent && isAccessible ? 'text-gray-700' : ''}
                ${!isAccessible ? 'text-gray-400' : ''}
              `}>
                {step.name}
              </div>
              
              {/* Active Step Glow Effect */}
              {isCurrent && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl opacity-20 animate-pulse-soft -z-10"></div>
              )}
              
              {/* Completed Step Glow Effect */}
              {isCompleted && !isCurrent && (
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl opacity-10 -z-10"></div>
              )}
              
              {/* Hover Glow Effect */}
              {isClickable && !isCurrent && !isCompleted && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 -z-10"></div>
              )}
            </div>
            
            {/* Connection Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 mx-4 relative overflow-hidden rounded-full">
                {/* Background Line */}
                <div className="absolute inset-0 bg-gray-200 rounded-full"></div>
                
                {/* Progress Line */}
                <div className={`
                  absolute inset-0 rounded-full transition-all duration-500 ease-out
                  ${completedSteps.has(step.id) 
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 animate-scale-in' 
                    : isCurrent && index < steps.length - 1
                    ? 'bg-gradient-to-r from-blue-400 to-purple-500 w-1/2 animate-pulse-soft'
                    : 'w-0'
                  }
                `}>
                  {/* Animated Shimmer Effect */}
                  {(completedSteps.has(step.id) || isCurrent) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer rounded-full"></div>
                  )}
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ProgressBar;