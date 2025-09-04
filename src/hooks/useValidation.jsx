import { useState, useCallback } from 'react';
import { 
  validateProjectOverview, 
  validateUnitConfiguration,
  validateAmenities,
  validateUnit 
} from '../utils/validation';

export const useValidation = () => {
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState([]);

  const validateStep = useCallback((stepNumber, data) => {
    let result = { isValid: true, errors: {}, warnings: [] };

    switch (stepNumber) {
      case 1:
        result = validateProjectOverview(data);
        break;
      case 4:
        result = validateUnitConfiguration(data.units);
        break;
      case 5:
        result = validateAmenities(data.amenities);
        break;
      default:
        result = { isValid: true, errors: {}, warnings: [] };
    }

    setErrors(result.errors || {});
    setWarnings(result.warnings || []);
    
    return result;
  }, []);

  const validateAllSteps = useCallback((projectData) => {
    const allErrors = {};
    const allWarnings = [];
    let isValid = true;

    // Validate each step
    for (let step = 1; step <= 6; step++) {
      const stepResult = validateStep(step, projectData);
      if (!stepResult.isValid) {
        allErrors[step] = stepResult.errors;
        isValid = false;
      }
      if (stepResult.warnings?.length > 0) {
        allWarnings.push(...stepResult.warnings.map(warning => ({ step, warning })));
      }
    }

    return {
      isValid,
      errors: allErrors,
      warnings: allWarnings
    };
  }, [validateStep]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setWarnings([]);
  }, []);

  const clearFieldError = useCallback((fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const addFieldError = useCallback((fieldName, message) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: message
    }));
  }, []);

  const hasErrors = Object.keys(errors).length > 0;
  const hasWarnings = warnings.length > 0;

  return {
    errors,
    warnings,
    hasErrors,
    hasWarnings,
    validateStep,
    validateAllSteps,
    clearErrors,
    clearFieldError,
    addFieldError
  };
};