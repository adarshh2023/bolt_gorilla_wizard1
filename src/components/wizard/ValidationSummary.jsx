import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, X } from 'lucide-react';

const ValidationSummary = ({ 
  errors = {}, 
  warnings = [], 
  onClose,
  className = ''
}) => {
  const hasErrors = Object.keys(errors).length > 0;
  const hasWarnings = warnings.length > 0;

  if (!hasErrors && !hasWarnings) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {hasErrors && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Please fix the following errors:
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field}>
                      {typeof error === 'string' ? error : JSON.stringify(error)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {onClose && (
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex bg-red-50 rounded-md p-1.5 text-red-400 hover:bg-red-100"
                  >
                    <span className="sr-only">Dismiss</span>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {hasWarnings && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Warnings:
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc pl-5 space-y-1">
                  {warnings.map((warning, index) => (
                    <li key={index}>
                      {typeof warning === 'string' ? warning : warning.warning}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {onClose && (
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex bg-yellow-50 rounded-md p-1.5 text-yellow-400 hover:bg-yellow-100"
                  >
                    <span className="sr-only">Dismiss</span>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!hasErrors && !hasWarnings && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                All validations passed!
              </h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationSummary;