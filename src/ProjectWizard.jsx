// ProjectWizard.jsx - Main wizard component with updated structure
import React from 'react';
import { useProjectData } from './hooks/useProjectData';
import { useWizardNavigation } from './hooks/useWizardNavigation';
import WizardLayout from './components/wizard/WizardLayout';

// Step Components
import Step1ProjectOverview from './components/steps/Step1ProjectOverview';
import Step2TowerWingDeclaration from './components/steps/Step2TowerWingDeclaration';
import Step3FloorConfiguration from './components/steps/Step3FloorConfiguration';
import Step4UnitConfiguration from './components/steps/Step4UnitConfiguration';
import Step5ReviewFinalize from './components/steps/Step5ReviewFinalize';

// Placeholder components for remaining steps
const PlaceholderStep = ({ stepNumber, stepName, onNext, onPrevious }) => (
  <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
    <div className="text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl font-bold text-gray-400">{stepNumber}</span>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{stepName}</h3>
      <p className="text-gray-600 mb-8">This step is under development.</p>
      
      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          ← Previous
        </button>
        <button
          onClick={onNext}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Next →
        </button>
      </div>
    </div>
  </div>
);

const ProjectWizard = () => {
  const {
    projectData,
    updateProjectData,
    saveProjectData,
    loadProjectData,
    getTotalWings,
    getTotalFloors
  } = useProjectData();

  const {
    currentStep,
    completedSteps,
    nextStep,
    prevStep,
    goToStep,
    markStepComplete,
    hasUnsavedChanges,
    setHasUnsavedChanges
  } = useWizardNavigation();

  const handleStepUpdate = (stepData) => {
    updateProjectData(stepData);
    setHasUnsavedChanges(true);
  };

  const validateStep = (step, data) => {
    // Basic validation logic
    switch (step) {
      case 1:
        return {
          isValid: !!(data.projectName && data.projectType && data.address && data.city),
          errors: {}
        };
      case 2:
        return {
          isValid: !!(data.towers && data.towers.length > 0),
          errors: {}
        };
      default:
        return { isValid: true, errors: {} };
    }
  };

  const handleNext = () => {
    const validation = validateStep(currentStep, projectData);
    if (validation.isValid) {
      markStepComplete(currentStep);
      nextStep();
    } else {
      console.log('Validation errors:', validation.errors);
    }
  };

  const handlePrevious = () => {
    prevStep();
  };

  const handleSave = () => {
    saveProjectData();
    setHasUnsavedChanges(false);
  };

  const handleStepClick = (stepNumber) => {
    goToStep(stepNumber);
  };

  const renderCurrentStep = () => {
    const commonProps = {
      data: projectData,
      onUpdate: handleStepUpdate,
      onNext: handleNext,
      onPrevious: handlePrevious,
      onSave: handleSave
    };

    switch (currentStep) {
      case 1:
        return <Step1ProjectOverview {...commonProps} />;
      case 2:
        return <Step2TowerWingDeclaration {...commonProps} />;
      case 3:
        return <Step3FloorConfiguration {...commonProps} />;
      case 4:
        return <Step4UnitConfiguration {...commonProps} />;
      case 5:
        return <Step5ReviewFinalize {...commonProps} />;
      default:
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">Invalid step</h3>
          </div>
        );
    }
  };

  return (
    <WizardLayout
      currentStep={currentStep}
      completedSteps={completedSteps}
      onStepClick={handleStepClick}
    >
      {renderCurrentStep()}
      
      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-sm text-xs">
          <div className="font-bold mb-2">Debug Info:</div>
          <div>Current Step: {currentStep}</div>
          <div>Total Towers: {projectData.towers?.length || 0}</div>
          <div>Total Wings: {getTotalWings()}</div>
          <div>Total Floors: {getTotalFloors()}</div>
          <div>Has Unsaved Changes: {hasUnsavedChanges ? 'Yes' : 'No'}</div>
          <div className="mt-2">
            <button 
              onClick={() => console.log('Project Data:', projectData)}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Log Project Data
            </button>
          </div>
        </div>
      )}
    </WizardLayout>
  );
};

export default ProjectWizard;