// Updated useWizardNavigation.js - Updated for 6 steps instead of 8
import { useState, useCallback } from 'react';
import { WIZARD_STEPS } from '../utils/constants';

export const useWizardNavigation = (initialStep = 1) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const nextStep = useCallback(() => {
    if (currentStep < WIZARD_STEPS.length) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(prev => prev + 1);
      setHasUnsavedChanges(false);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((stepNumber) => {
    if (stepNumber >= 1 && stepNumber <= WIZARD_STEPS.length) {
      // Check if trying to go to a future step without completing previous ones
      const canNavigate = stepNumber <= currentStep || completedSteps.has(stepNumber - 1);
      
      if (canNavigate) {
        setCurrentStep(stepNumber);
      } else {
        console.warn(`Cannot navigate to step ${stepNumber}. Complete previous steps first.`);
        return false;
      }
    }
    return true;
  }, [currentStep, completedSteps]);

  const markStepComplete = useCallback((stepNumber) => {
    setCompletedSteps(prev => new Set([...prev, stepNumber]));
  }, []);

  const markStepIncomplete = useCallback((stepNumber) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      newSet.delete(stepNumber);
      return newSet;
    });
  }, []);

  const resetNavigation = useCallback(() => {
    setCurrentStep(1);
    setCompletedSteps(new Set());
    setHasUnsavedChanges(false);
  }, []);

  const isStepComplete = useCallback((stepNumber) => {
    return completedSteps.has(stepNumber);
  }, [completedSteps]);

  const isStepAccessible = useCallback((stepNumber) => {
    return stepNumber <= currentStep || completedSteps.has(stepNumber);
  }, [currentStep, completedSteps]);

  const getCurrentStepInfo = useCallback(() => {
    return WIZARD_STEPS.find(step => step.id === currentStep);
  }, [currentStep]);

  const getProgressPercentage = useCallback(() => {
    return Math.round((completedSteps.size / WIZARD_STEPS.length) * 100);
  }, [completedSteps]);

  return {
    currentStep,
    completedSteps,
    hasUnsavedChanges,
    nextStep,
    prevStep,
    goToStep,
    markStepComplete,
    markStepIncomplete,
    resetNavigation,
    isStepComplete,
    isStepAccessible,
    getCurrentStepInfo,
    getProgressPercentage,
    setHasUnsavedChanges,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === WIZARD_STEPS.length,
    totalSteps: WIZARD_STEPS.length
  };
};