import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Copy, Trash2, Sparkles } from 'lucide-react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import StepNavigation from '../wizard/StepNavigation';
import ValidationSummary from '../wizard/ValidationSummary';
import { validatePhaseSetup } from '../../utils/validation';
import { PHASE_TEMPLATES } from '../../utils/templates';

const Step2PhaseSetup = ({ 
  data, 
  onUpdate, 
  onNext,
  onPrevious,
  onSave
}) => {
  const [phases, setPhases] = useState(() => {
    if (data.phases && data.phases.length > 0) {
      return data.phases;
    }
    
    // Initialize with one phase based on project type
    return [{
      id: Date.now(),
      name: 'Phase 1',
      startDate: data.startDate || '',
      endDate: data.endDate || '',
      description: '',
      estimatedUnits: ''
    }];
  });

  const [validationResult, setValidationResult] = useState({ isValid: true, errors: {}, warnings: [] });

  // Validate whenever phases change
  useEffect(() => {
    const result = validatePhaseSetup(phases);
    setValidationResult(result);
  }, [phases]);

  const updatePhase = (id, field, value) => {
    setPhases(phases.map(phase => 
      phase.id === id ? { ...phase, [field]: value } : phase
    ));
  };

  const addPhase = () => {
    const newPhase = {
      id: Date.now(),
      name: `Phase ${phases.length + 1}`,
      startDate: '',
      endDate: '',
      description: '',
      estimatedUnits: ''
    };
    setPhases([...phases, newPhase]);
  };

  const removePhase = (id) => {
    if (phases.length > 1) {
      setPhases(phases.filter(phase => phase.id !== id));
    }
  };

  const clonePhase = (id) => {
    const phaseToClone = phases.find(p => p.id === id);
    if (phaseToClone) {
      const cloned = {
        ...phaseToClone,
        id: Date.now(),
        name: `${phaseToClone.name} Copy`,
        startDate: '',
        endDate: ''
      };
      setPhases([...phases, cloned]);
    }
  };

  const loadSamplePhases = () => {
    const projectType = data.projectType?.toLowerCase();
    let template = PHASE_TEMPLATES.residential;
    
    if (projectType === 'commercial') {
      template = PHASE_TEMPLATES.commercial;
    } else if (projectType === 'mixed-use') {
      template = PHASE_TEMPLATES.mixed;
    }
    
    setPhases(template.map(phase => ({ ...phase, id: Date.now() + Math.random() })));
  };

  const handleNext = () => {
    if (validationResult.isValid) {
      onUpdate({ phases });
      onNext();
    }
  };

  const handleSave = () => {
    onUpdate({ phases });
    onSave?.({ phases });
  };

  return (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-blue-600" />
              <Card.Title>Phase Setup</Card.Title>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadSamplePhases}
                className="flex items-center"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Load Sample Phases
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={addPhase}
                className="flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Phase
              </Button>
            </div>
          </div>
          <p className="text-gray-600 mt-2">
            Define the phases of your project. Each phase can have its own timeline and characteristics.
          </p>
        </Card.Header>

        <Card.Content>
          <ValidationSummary
            errors={validationResult.errors}
            warnings={validationResult.warnings}
            className="mb-6"
          />

          <div className="space-y-6">
            {phases.map((phase, index) => (
              <div key={phase.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Phase {index + 1}
                  </h3>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => clonePhase(phase.id)}
                      className="flex items-center"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Clone
                    </Button>
                    {phases.length > 1 && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removePhase(phase.id)}
                        className="flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Phase Name"
                    placeholder="Enter phase name"
                    value={phase.name}
                    onChange={(e) => updatePhase(phase.id, 'name', e.target.value)}
                    error={validationResult.errors[`phase_${index}_name`]}
                    required
                  />

                  <Input
                    label="Estimated Units"
                    placeholder="Number of units (optional)"
                    type="number"
                    value={phase.estimatedUnits}
                    onChange={(e) => updatePhase(phase.id, 'estimatedUnits', e.target.value)}
                    helperText="For planning purposes only"
                  />

                  <Input
                    label="Start Date"
                    type="date"
                    value={phase.startDate}
                    onChange={(e) => updatePhase(phase.id, 'startDate', e.target.value)}
                    error={validationResult.errors[`phase_${index}_startDate`]}
                    required
                  />

                  <Input
                    label="End Date"
                    type="date"
                    value={phase.endDate}
                    onChange={(e) => updatePhase(phase.id, 'endDate', e.target.value)}
                    error={validationResult.errors[`phase_${index}_endDate`]}
                    required
                  />

                  <Input.TextArea
                    label="Description"
                    placeholder="Brief description of this phase"
                    value={phase.description}
                    onChange={(e) => updatePhase(phase.id, 'description', e.target.value)}
                    rows={2}
                    containerClassName="md:col-span-2"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Phase Summary */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Phase Summary</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>Total Phases: {phases.length}</p>
              <p>
                Estimated Total Units: {phases.reduce((sum, phase) => sum + (parseInt(phase.estimatedUnits) || 0), 0)}
              </p>
              {phases.length > 0 && phases[0].startDate && phases[phases.length - 1].endDate && (
                <p>
                  Project Duration: {phases[0].startDate} to {phases[phases.length - 1].endDate}
                </p>
              )}
            </div>
          </div>
        </Card.Content>

        <StepNavigation
          onPrevious={onPrevious}
          onNext={handleNext}
          onSave={handleSave}
          isValid={validationResult.isValid}
          nextLabel="Next: Layout Design"
          previousLabel="Back: Project Info"
        />
      </Card>
    </div>
  );
};

export default Step2PhaseSetup;