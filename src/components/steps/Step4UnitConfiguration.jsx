// Step4UnitConfiguration.jsx - Wing-based tabs with unit chips and template system
import React, { useState, useEffect } from 'react';
import { Home, Plus, CheckSquare, Square, Copy, Settings, Users, MapPin, Zap, Filter, Save, Trash2, Building2, Layers } from 'lucide-react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import StepNavigation from '../wizard/StepNavigation';
import ValidationSummary from '../wizard/ValidationSummary';
import TemplateBuilder from '../ui/TemplateBuilder';

const UNIT_TYPES = ['1BHK', '2BHK', '3BHK', '4BHK', 'Duplex', 'Penthouse', 'Studio', 'Office', 'Retail', 'Restaurant', 'Showroom'];

const PREDEFINED_TEMPLATES = {
  'Standard 1BHK': {
    name: 'Standard 1BHK',
    type: '1BHK',
    balconies: 1,
    attachedWashrooms: 1,
    commonWashrooms: 0,
    carpetArea: 450,
    builtUpArea: 600
  },
  'Standard 2BHK': {
    name: 'Standard 2BHK',
    type: '2BHK',
    balconies: 2,
    attachedWashrooms: 2,
    commonWashrooms: 1,
    carpetArea: 750,
    builtUpArea: 950
  },
  'Standard 3BHK': {
    name: 'Standard 3BHK',
    type: '3BHK',
    balconies: 2,
    attachedWashrooms: 3,
    commonWashrooms: 1,
    carpetArea: 1100,
    builtUpArea: 1400
  },
  'Standard Office': {
    name: 'Standard Office',
    type: 'Office',
    balconies: 0,
    attachedWashrooms: 1,
    commonWashrooms: 0,
    frontage: 20,
    monthlyRent: 45000,
    parkingSpaces: 2,
    carpetArea: 800,
    builtUpArea: 1000
  }
};

const Step4UnitConfiguration = ({ 
  data, 
  onUpdate, 
  onNext,
  onPrevious,
  onSave
}) => {
  const [units, setUnits] = useState(data.units || {});
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [currentTowerIndex, setCurrentTowerIndex] = useState(0);
  const [currentWingIndex, setCurrentWingIndex] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customTemplates, setCustomTemplates] = useState(data.customTemplates || {});
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [validationResult, setValidationResult] = useState({ isValid: true, errors: {}, warnings: [] });

  const towers = data.towers || [];
  const currentTower = towers[currentTowerIndex];
  const currentWing = currentTower?.wings[currentWingIndex];

  // Generate flat number based on numbering type
  const generateFlatNumber = (floorInfo, unitIndex, wingLetter) => {
    const numberingType = data.flatNumberingType || 'wing-floor-unit';
    const floorNumber = floorInfo.number.toString().padStart(2, '0');
    const unitNumber = (unitIndex + 1).toString().padStart(2, '0');
    
    switch (numberingType) {
      case 'wing-floor-unit':
        return `${wingLetter}-${floorNumber}${unitNumber}`;
      case 'tower-wing-floor-unit':
        return `T${currentTowerIndex + 1}${wingLetter}${floorNumber}${unitNumber}`;
      case 'sequential':
        return `${floorNumber}${unitNumber}`;
      default:
        return `${wingLetter}-${floorNumber}${unitNumber}`;
    }
  };

  // Get all units for current wing across all floors
  const getAllWingUnits = () => {
    if (!currentWing) return [];
    
    const allUnits = [];
    Object.entries(currentWing.floorTypes).forEach(([floorType, config]) => {
      if (config.enabled && config.count > 0) {
        for (let i = 1; i <= config.count; i++) {
          const floorId = `${currentTower.id}-${currentWing.id}-${floorType}-${i}`;
          const floorUnits = units[floorId] || [];
          const floorInfo = { type: floorType, number: i, id: floorId };
          
          floorUnits.forEach((unit, unitIndex) => {
            allUnits.push({
              ...unit,
              floorId,
              floorInfo,
              unitIndex,
              globalIndex: allUnits.length
            });
          });
        }
      }
    });
    
    return allUnits;
  };

  const wingUnits = getAllWingUnits();

  const addUnitsToFloor = (floorId, count = 1) => {
    const currentUnits = units[floorId] || [];
    const wingLetter = currentWing?.name.charAt(currentWing.name.length - 1) || 'A';
    const floorInfo = { number: parseInt(floorId.split('-').pop()) };
    const newUnits = [];
    
    for (let i = 0; i < count; i++) {
      const unitIndex = currentUnits.length + i;
      newUnits.push({
        id: generateFlatNumber(floorInfo, unitIndex, wingLetter),
        type: '',
        templateName: '',
        status: 'Available',
        carpetArea: 0,
        builtUpArea: 0,
        balconies: 0,
        attachedWashrooms: 0,
        commonWashrooms: 0,
        roomLayout: null
      });
    }
    
    setUnits(prev => ({
      ...prev,
      [floorId]: [...currentUnits, ...newUnits]
    }));
  };

  const updateUnit = (floorId, unitIndex, updates) => {
    setUnits(prev => ({
      ...prev,
      [floorId]: prev[floorId].map((unit, index) => 
        index === unitIndex ? { ...unit, ...updates } : unit
      )
    }));
  };

  const toggleUnitSelection = (unitGlobalId) => {
    setSelectedUnits(prev => 
      prev.includes(unitGlobalId)
        ? prev.filter(id => id !== unitGlobalId)
        : [...prev, unitGlobalId]
    );
  };

  const selectAllUnits = () => {
    setSelectedUnits(wingUnits.map((_, index) => index));
  };

  const clearSelection = () => {
    setSelectedUnits([]);
  };

  const applyTemplateToSelected = (templateData) => {
    selectedUnits.forEach(globalIndex => {
      const unit = wingUnits[globalIndex];
      if (unit) {
        updateUnit(unit.floorId, unit.unitIndex, {
          ...templateData,
          templateName: templateData.name
        });
      }
    });
    
    setSelectedUnits([]);
  };

  const saveCustomTemplate = (templateData) => {
    const templateName = templateData.name || `Custom Template ${Object.keys(customTemplates).length + 1}`;
    setCustomTemplates(prev => ({
      ...prev,
      [templateName]: templateData
    }));
  };

  const removeSelectedUnits = () => {
    const unitsToRemove = {};
    
    selectedUnits.forEach(globalIndex => {
      const unit = wingUnits[globalIndex];
      if (unit) {
        if (!unitsToRemove[unit.floorId]) {
          unitsToRemove[unit.floorId] = [];
        }
        unitsToRemove[unit.floorId].push(unit.unitIndex);
      }
    });

    Object.entries(unitsToRemove).forEach(([floorId, unitIndexes]) => {
      setUnits(prev => ({
        ...prev,
        [floorId]: prev[floorId].filter((_, index) => !unitIndexes.includes(index))
      }));
    });
    
    setSelectedUnits([]);
  };

  const copyFromPreviousWing = () => {
    let prevTowerIndex = currentTowerIndex;
    let prevWingIndex = currentWingIndex - 1;
    
    if (prevWingIndex < 0) {
      prevTowerIndex = currentTowerIndex - 1;
      if (prevTowerIndex >= 0) {
        prevWingIndex = towers[prevTowerIndex].wings.length - 1;
      }
    }
    
    if (prevTowerIndex >= 0 && prevWingIndex >= 0) {
      const prevTower = towers[prevTowerIndex];
      const prevWing = prevTower.wings[prevWingIndex];
      
      // Copy units from previous wing
      const copiedUnits = {};
      Object.entries(prevWing.floorTypes).forEach(([floorType, config]) => {
        if (config.enabled && config.count > 0) {
          for (let i = 1; i <= config.count; i++) {
            const prevFloorId = `${prevTower.id}-${prevWing.id}-${floorType}-${i}`;
            const currentFloorId = `${currentTower.id}-${currentWing.id}-${floorType}-${i}`;
            const prevFloorUnits = units[prevFloorId] || [];
            
            if (prevFloorUnits.length > 0) {
              const wingLetter = currentWing?.name.charAt(currentWing.name.length - 1) || 'A';
              const floorInfo = { number: i };
              
              copiedUnits[currentFloorId] = prevFloorUnits.map((unit, unitIndex) => ({
                ...unit,
                id: generateFlatNumber(floorInfo, unitIndex, wingLetter)
              }));
            }
          }
        }
      });
      
      setUnits(prev => ({
        ...prev,
        ...copiedUnits
      }));
    }
  };

  const hasNextWing = () => {
    if (!currentTower) return false;
    return currentWingIndex < currentTower.wings.length - 1;
  };

  const hasNextTower = () => {
    return currentTowerIndex < towers.length - 1;
  };

  const goToNextWing = () => {
    if (hasNextWing()) {
      setCurrentWingIndex(currentWingIndex + 1);
    } else if (hasNextTower()) {
      setCurrentTowerIndex(currentTowerIndex + 1);
      setCurrentWingIndex(0);
    }
    setSelectedUnits([]);
  };

  const goToPrevWing = () => {
    if (currentWingIndex > 0) {
      setCurrentWingIndex(currentWingIndex - 1);
    } else if (currentTowerIndex > 0) {
      setCurrentTowerIndex(currentTowerIndex - 1);
      const prevTower = towers[currentTowerIndex - 1];
      setCurrentWingIndex(prevTower.wings.length - 1);
    }
    setSelectedUnits([]);
  };

  const isLastWing = () => {
    return currentTowerIndex === towers.length - 1 && 
           currentWingIndex === currentTower.wings.length - 1;
  };

  const getProgressInfo = () => {
    let totalWings = 0;
    let currentPosition = 0;

    towers.forEach((tower, tIndex) => {
      tower.wings.forEach((wing, wIndex) => {
        if (tIndex === currentTowerIndex && wIndex === currentWingIndex) {
          currentPosition = totalWings;
        }
        totalWings++;
      });
    });

    return { currentPosition: currentPosition + 1, totalWings };
  };

  const handleNext = () => {
    if (isLastWing()) {
      onUpdate({ units, customTemplates });
      onNext();
    } else {
      goToNextWing();
    }
  };

  const handlePrevious = () => {
    if (currentTowerIndex === 0 && currentWingIndex === 0) {
      onPrevious();
    } else {
      goToPrevWing();
    }
  };

  const handleSave = () => {
    onUpdate({ units, customTemplates });
    onSave?.({ units, customTemplates });
  };

  const allTemplates = { ...PREDEFINED_TEMPLATES, ...customTemplates };

  if (!currentTower || !currentWing) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No towers configured</h3>
        <p className="text-gray-600">Please go back and configure towers and wings first.</p>
        <Button variant="primary" onClick={onPrevious}>
          Go Back to Towers
        </Button>
      </div>
    );
  }

  const { currentPosition, totalWings } = getProgressInfo();

  return (
    <div className="space-y-8 animate-slide-up">
      <Card className="overflow-hidden">
        <Card.Header>
          <div className="flex items-center justify-between">
            <Card.Title icon={Home} gradient>Unit Configuration</Card.Title>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Wing {currentPosition} of {totalWings} • {selectedUnits.length} Selected
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyFromPreviousWing}
                disabled={currentTowerIndex === 0 && currentWingIndex === 0}
                icon={Copy}
              >
                Copy from Previous Wing
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplateBuilder(true)}
                icon={Plus}
              >
                Create Template
              </Button>
            </div>
          </div>
          <Card.Subtitle>
            Configure units for each wing. Select units to apply templates or make bulk changes.
          </Card.Subtitle>
        </Card.Header>

        <Card.Content>
          {/* Current Wing Header */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl flex items-center justify-center font-bold text-lg">
                {String.fromCharCode(65 + currentWingIndex)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {currentTower.name || currentTower.customName} - {currentWing.name}
                </h3>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    {currentWing.type} Wing
                  </span>
                  <span className="flex items-center">
                    <Home className="w-4 h-4 mr-1" />
                    {wingUnits.length} Total Units
                  </span>
                  <span className="flex items-center">
                    <Settings className="w-4 h-4 mr-1" />
                    {currentWing.lifts} Lifts
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentPosition / totalWings) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Selection and Template Controls */}
          {selectedUnits.length > 0 && (
            <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <h4 className="font-bold text-purple-800 mb-4">🔧 Selected Units Configuration</h4>
              
              <div className="p-4 bg-white rounded-lg border border-purple-200">
                <p className="text-sm text-purple-800 font-medium mb-4">
                  {selectedUnits.length} unit{selectedUnits.length > 1 ? 's' : ''} selected
                </p>
                
                {/* Template Application */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="form-label">Apply Template</label>
                    <div className="flex space-x-2">
                      <Select
                        placeholder="Choose template"
                        options={Object.keys(allTemplates).map(name => ({ value: name, label: name }))}
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => {
                          if (selectedTemplate && allTemplates[selectedTemplate]) {
                            applyTemplateToSelected(allTemplates[selectedTemplate]);
                            setSelectedTemplate('');
                          }
                        }}
                        disabled={!selectedTemplate}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Quick Actions</label>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowTemplateBuilder(true)}
                      >
                        Design Layout
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={removeSelectedUnits}
                      >
                        Remove Selected
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Add Units */}
          <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <h4 className="font-bold text-green-800 mb-4">➕ Quick Add Units</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Add units to floors</label>
                <div className="flex space-x-2">
                  <Select
                    placeholder="Select floor"
                    options={Object.entries(currentWing.floorTypes)
                      .filter(([_, config]) => config.enabled && config.count > 0)
                      .flatMap(([floorType, config]) => 
                        Array.from({ length: config.count }, (_, i) => ({
                          value: `${currentTower.id}-${currentWing.id}-${floorType}-${i + 1}`,
                          label: `${floorType} ${i + 1}`
                        }))
                      )}
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        addUnitsToFloor(e.target.value, 4);
                        e.target.value = '';
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => {
                      // Add 4 units to all floors
                      Object.entries(currentWing.floorTypes).forEach(([floorType, config]) => {
                        if (config.enabled && config.count > 0) {
                          for (let i = 1; i <= config.count; i++) {
                            const floorId = `${currentTower.id}-${currentWing.id}-${floorType}-${i}`;
                            addUnitsToFloor(floorId, 4);
                          }
                        }
                      });
                    }}
                  >
                    Add 4 to All Floors
                  </Button>
                </div>
              </div>

              <div>
                <label className="form-label">Selection Controls</label>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllUnits}
                    disabled={wingUnits.length === 0}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSelection}
                    disabled={selectedUnits.length === 0}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Units Display */}
          {wingUnits.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Units in This Wing</h4>
              <p className="text-gray-600 mb-6">
                Add units to {currentWing.name} to start configuration
              </p>
              <Button
                variant="primary"
                onClick={() => {
                  // Add units to all floors
                  Object.entries(currentWing.floorTypes).forEach(([floorType, config]) => {
                    if (config.enabled && config.count > 0) {
                      for (let i = 1; i <= config.count; i++) {
                        const floorId = `${currentTower.id}-${currentWing.id}-${floorType}-${i}`;
                        addUnitsToFloor(floorId, 4);
                      }
                    }
                  });
                }}
                icon={Plus}
              >
                Add Units to All Floors
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-800">All Units in {currentWing.name}</h4>
                <div className="text-sm text-gray-600">
                  {wingUnits.length} units • {wingUnits.filter(unit => unit.templateName).length} with templates
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {wingUnits.map((unit, globalIndex) => {
                  const isSelected = selectedUnits.includes(globalIndex);
                  const hasTemplate = unit.templateName;
                  const hasLayout = unit.roomLayout;
                  
                  return (
                    <div
                      key={`${unit.floorId}-${unit.unitIndex}`}
                      className={`
                        relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 group
                        ${isSelected 
                          ? 'border-purple-400 bg-purple-50 shadow-lg transform scale-105' 
                          : hasLayout
                          ? 'border-gray-300 bg-gray-100 opacity-75'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md hover:scale-102'
                        }
                      `}
                      onClick={() => toggleUnitSelection(globalIndex)}
                    >
                      {/* Selection Indicator */}
                      <div className="absolute top-1 right-1">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-purple-600" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
                        )}
                      </div>

                      {/* Layout Status Indicator */}
                      {hasLayout && (
                        <div className="absolute top-1 left-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      )}

                      {/* Unit Info */}
                      <div className="text-center">
                        <div className={`font-bold text-sm mb-1 ${hasLayout ? 'text-gray-600 line-through' : 'text-gray-800'}`}>
                          {unit.id}
                        </div>
                        
                        {hasTemplate && (
                          <div className={`
                            inline-block px-2 py-1 rounded text-xs font-medium border mb-1
                            ${unit.type === 'Office' || unit.type === 'Retail' 
                              ? 'bg-orange-100 text-orange-800 border-orange-200'
                              : 'bg-blue-100 text-blue-800 border-blue-200'
                            }
                          `}>
                            {unit.templateName}
                          </div>
                        )}
                        
                        {!hasTemplate && (
                          <div className="text-xs text-gray-500 italic">
                            No template
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Wing Summary */}
          <div className="mt-10 p-6 bg-gradient-to-r from-gray-900 to-blue-900 text-white rounded-2xl">
            <h4 className="text-xl font-bold mb-4">📊 {currentWing.name} Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-300">{wingUnits.length}</div>
                <div className="text-sm text-gray-300">Total Units</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-300">
                  {wingUnits.filter(unit => unit.templateName).length}
                </div>
                <div className="text-sm text-gray-300">With Templates</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-300">
                  {wingUnits.filter(unit => unit.roomLayout).length}
                </div>
                <div className="text-sm text-gray-300">Custom Layouts</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-300">
                  {Object.keys(customTemplates).length}
                </div>
                <div className="text-sm text-gray-300">Custom Templates</div>
              </div>
            </div>

            {/* Navigation Info */}
            <div className="mt-6 pt-6 border-t border-gray-700 text-center">
              <p className="text-gray-300">
                {isLastWing() ? (
                  <span>✅ Ready to proceed to review</span>
                ) : (
                  <span>
                    Next: {hasNextWing() 
                      ? `${currentWing.name} → ${currentTower.wings[currentWingIndex + 1].name}` 
                      : `${currentTower.name || currentTower.customName} → ${towers[currentTowerIndex + 1].name || towers[currentTowerIndex + 1].customName}`
                    }
                  </span>
                )}
              </p>
            </div>
          </div>
        </Card.Content>

        <StepNavigation
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSave={handleSave}
          isValid={validationResult.isValid}
          nextLabel={isLastWing() ? "Next: Review & Finalize" : "Next Wing"}
          previousLabel={currentTowerIndex === 0 && currentWingIndex === 0 ? "Back: Floor Configuration" : "Previous Wing"}
        />
      </Card>

      {/* Template Builder Modal */}
      {showTemplateBuilder && (
        <TemplateBuilder
          onClose={() => setShowTemplateBuilder(false)}
          onSave={saveCustomTemplate}
          existingTemplates={customTemplates}
          onApplyToSelected={(templateData) => {
            applyTemplateToSelected(templateData);
            setShowTemplateBuilder(false);
          }}
        />
      )}
    </div>
  );
};

export default Step4UnitConfiguration;