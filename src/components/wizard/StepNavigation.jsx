import React from 'react';
import { ChevronLeft, ChevronRight, Save, Clock } from 'lucide-react';
import Button from '../ui/Button';

const StepNavigation = ({ 
  onPrevious,
  onNext,
  onSave,
  isFirstStep = false,
  isLastStep = false,
  isValid = true,
  isSaving = false,
  hasUnsavedChanges = false,
  nextLabel = 'Next',
  previousLabel = 'Back',
  className = ''
}) => {
  return (
    <div className={`mt-12 animate-fade-in ${className}`}>
      {/* Status Bar */}
      {(hasUnsavedChanges || isSaving) && (
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl animate-slide-up">
          <div className="flex items-center space-x-2 text-amber-800">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">
              {isSaving ? 'Saving changes...' : 'You have unsaved changes'}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-8 border-t border-gradient-to-r from-transparent via-gray-200 to-transparent">
        <div className="flex items-center space-x-4">
          {!isFirstStep && (
            <Button
              variant="secondary"
              size="lg"
              onClick={onPrevious}
              icon={ChevronLeft}
              className="animate-slide-left hover:shadow-xl"
            >
              {previousLabel}
            </Button>
          )}
          
          {onSave && (
            <Button
              variant="ghost"
              size="lg"
              onClick={onSave}
              loading={isSaving}
              icon={Save}
              className="animate-fade-in hover:bg-blue-50 hover:text-blue-700"
            >
              Save Draft
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-6">
          {/* Validation Status Indicator */}
          {!isValid && (
            <div className="flex items-center text-red-600 animate-bounce-gentle">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
              <span className="text-sm font-medium">Please fix errors to continue</span>
            </div>
          )}
          
          {isValid && !isLastStep && (
            <div className="flex items-center text-green-600 animate-fade-in">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <span className="text-sm font-medium">Ready to proceed</span>
            </div>
          )}

          {/* Next/Complete Button */}
          {isLastStep ? (
            <Button
              variant="success"
              size="lg"
              onClick={onNext}
              disabled={!isValid}
              className="animate-slide-right hover:shadow-xl glow-effect"
            >
              <span className="mr-2">🎉</span>
              Complete Project
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={onNext}
              disabled={!isValid}
              className="animate-slide-right hover:shadow-xl"
            >
              {nextLabel}
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mt-6 flex justify-center animate-fade-in" style={{animationDelay: '0.3s'}}>
        <div className="text-xs text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
          <span className="font-medium">Step Progress:</span>
          <span className="ml-2">All fields validated ✓</span>
        </div>
      </div>
    </div>
  );
};

export default StepNavigation;