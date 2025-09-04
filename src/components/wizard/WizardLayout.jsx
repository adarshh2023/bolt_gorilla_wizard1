// Updated WizardLayout.jsx - Left sidebar navigation, simpler design
import React from 'react';
import { CheckCircle, Circle, ChevronRight } from 'lucide-react';
import { WIZARD_STEPS } from '../../utils/constants';

const WizardLayout = ({ 
  children, 
  currentStep, 
  completedSteps, 
  onStepClick,
  title,
  subtitle 
}) => {
  const currentStepInfo = WIZARD_STEPS.find(step => step.id === currentStep);
  const progressPercentage = (completedSteps.size / WIZARD_STEPS.length) * 100;
  
  const isStepAccessible = (stepNumber) => {
    return stepNumber <= currentStep || completedSteps.has(stepNumber);
  };

  const isStepComplete = (stepNumber) => {
    return completedSteps.has(stepNumber);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar - Steps Navigation */}
      <div className="w-80 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Project Creation</h1>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {completedSteps.size} of {WIZARD_STEPS.length} steps completed
          </div>
        </div>

        {/* Steps List */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            {WIZARD_STEPS.map((step, index) => {
              const isActive = currentStep === step.id;
              const isComplete = isStepComplete(step.id);
              const isAccessible = isStepAccessible(step.id);
              
              return (
                <button
                  key={step.id}
                  onClick={() => isAccessible && onStepClick && onStepClick(step.id)}
                  disabled={!isAccessible}
                  className={`w-full flex items-center p-3 rounded-lg text-left transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-900' 
                      : isComplete
                      ? 'bg-green-50 text-green-900 hover:bg-green-100'
                      : isAccessible
                      ? 'text-gray-700 hover:bg-gray-50'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : isComplete
                        ? 'bg-green-600 text-white'
                        : isAccessible
                        ? 'bg-gray-200 text-gray-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isComplete ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-medium">{step.id}</span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-sm ${
                        isActive ? 'text-blue-900' : isComplete ? 'text-green-900' : 'text-gray-700'
                      }`}>
                        {step.name}
                      </div>
                      {/* Step breakdown */}
                      <div className="text-xs text-gray-500 mt-1">
                        {step.id === 1 && "Basic project information"}
                        {step.id === 2 && "Define towers & wings structure"}
                        {step.id === 3 && "Configure floor details"}
                        {step.id === 4 && "Setup individual units"}
                        {step.id === 5 && "Add amenities & facilities"}
                        {step.id === 6 && "Review & finalize project"}
                      </div>
                    </div>
                  </div>
                  
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500">
            <div className="font-medium">Current Step: {currentStepInfo?.name}</div>
            <div className="mt-1">{currentStepInfo?.key}</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-6">
          <div className="max-w-6xl">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 text-blue-600 font-bold text-lg">
                {currentStep}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentStepInfo?.name}
                </h2>
                <div className="text-gray-600 text-sm mt-1">
                  Step {currentStep} of {WIZARD_STEPS.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WizardLayout;