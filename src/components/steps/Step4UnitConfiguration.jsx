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
    builtUpArea: 600,
    templateColor: 'bg-blue-100 border-blue-300 text-blue-800'
  },
  'Standard 2BHK': {
    name: 'Standard 2BHK',
    type: '2BHK',
    balconies: 2,
    attachedWashrooms: 2,
    commonWashrooms: 1,
    carpetArea: 750,
    builtUpArea: 950,
    templateColor: 'bg-yellow-100 border-yellow-300 text-yellow-800'
  },
  'Standard 3BHK': {
    name: 'Standard 3BHK',
    type: '3BHK',
    balconies: 2,
    attachedWashrooms: 3,
    commonWashrooms: 1,
    carpetArea: 1100,
    builtUpArea: 1400,
    templateColor: 'bg-green-100 border-green-300 text-green-800'
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
    builtUpArea: 1000,
    templateColor: 'bg-purple-100 border-purple-300 text-purple-800'
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
  const [selectedTowerWing, setSelectedTowerWing] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customTemplates, setCustomTemplates] = useState(data.customTemplates || {});
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [validationResult, setValidationResult] = useState({ isValid: true, errors: {}, warnings: [] });

  const towers = data.towers || [];
  
  // Generate tower-wing options for dropdown
  const getTowerWingOptions = () => {
    const options = [];
    towers.forEach((tower, towerIndex) => {
      if (tower.wings && Array.isArray(tower.wings)) {
        tower.wings.forEach((wing, wingIndex) => {
          options.push({
            value: `${tower.id}-${wing.id}`,
            label: `${tower.name || tower.customName} - ${wing.name}`,
            tower,
            wing,
            towerIndex,
            wingIndex
          });
        });
      }
    });
    return options;
  };

  const towerWingOptions = getTowerWingOptions();
  
  // Set default selection if not set
  useEffect(() => {
    if (!selectedTowerWing && towerWingOptions.length > 0) {
      setSelectedTowerWing(towerWingOptions[0].value);
    }
  }, [selectedTowerWing, towerWingOptions]);

  const getCurrentTowerWing = () => {
    return towerWingOptions.find(option => option.value === selectedTowerWing);
  };

  const currentTowerWing = getCurrentTowerWing();
  const currentTower = currentTowerWing?.tower;
  const currentWing = currentTowerWing?.wing;

  // Calculate current position for progress bar
  const currentPosition = currentTowerWing ? 
    towerWingOptions.findIndex(option => option.value === selectedTowerWing) + 1 : 0;
  const totalWings = towerWingOptions.length;

  // Generate flat number based on numbering type
  const generateFlatNumber = (floorInfo, unitIndex, wingLetter, towerIndex) => {
    const numberingType = data.flatNumberingType || 'wing-floor-unit';
    const floorNumber = floorInfo.number.toString().padStart(2, '0');
    const unitNumber = (unitIndex + 1).toString().padStart(2, '0');
    
    switch (numberingType) {
      case 'wing-floor-unit':
        return `${wingLetter}-${floorNumber}${unitNumber}`;
      case 'tower-wing-floor-unit':
        return `T${towerIndex + 1}${wingLetter}${floorNumber}${unitNumber}`;
      case 'sequential':
        return `${floorNumber}${unitNumber}`;
      default:
        return `${wingLetter}-${floorNumber}${unitNumber}`;
    }
  };

  // Get all units for current wing across all floors
  const getAllWingUnits = () => {
    if (!currentWing || !currentWing.floorTypes) return [];
    
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

  // Helper functions for navigation
  const isLastWing = () => {
    return currentPosition === totalWings;
  };

  const hasNextWing = () => {
    if (!currentTowerWing) return false;
    const currentTowerIndex = currentTowerWing.towerIndex;
    const currentWingIndex = currentTowerWing.wingIndex;
    const currentTowerWings = towers[currentTowerIndex]?.wings || [];
    
    return currentWingIndex < currentTowerWings.length - 1;
  };

  const addUnitsToFloor = (floorId, count = 1) => {
    const currentUnits = units[floorId] || [];
    const wingLetter = currentWing?.name.charAt(currentWing.name.length - 1) || 'A';
    const floorInfo = { number: parseInt(floorId.split('-').pop()) };
    const towerIndex = currentTowerWing?.towerIndex || 0;
    const newUnits = [];
    
    for (let i = 0; i < count; i++) {
      const unitIndex = currentUnits.length + i;
      newUnits.push({
        id: generateFlatNumber(floorInfo, unitIndex, wingLetter, towerIndex),
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
    
    // Generate a unique color for this template
    const colors = [
      'bg-blue-100 border-blue-300 text-blue-800',
      'bg-green-100 border-green-300 text-green-800',
      'bg-purple-100 border-purple-300 text-purple-800',
      'bg-orange-100 border-orange-300 text-orange-800',
      'bg-pink-100 border-pink-300 text-pink-800',
      'bg-indigo-100 border-indigo-300 text-indigo-800',
      'bg-yellow-100 border-yellow-300 text-yellow-800',
      'bg-red-100 border-red-300 text-red-800',
      'bg-cyan-100 border-cyan-300 text-cyan-800',
      'bg-emerald-100 border-emerald-300 text-emerald-800'
    ];
    
    const existingTemplates = Object.keys(customTemplates).length + Object.keys(PREDEFINED_TEMPLATES).length;
    const templateColor = colors[existingTemplates % colors.length];
    
    setCustomTemplates(prev => ({
      ...prev,
      [templateName]: { ...templateData, templateColor }
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

  const handleNext = () => {
    onUpdate({ units, customTemplates });
    onNext();
  };

  const handlePrevious = () => {
    onPrevious();
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

  return (
    <div className="space-y-8 animate-slide-up">
      <Card className="overflow-hidden">
        <Card.Header>
          <div className="flex items-center justify-between">
            <Card.Title icon={Home} gradient>Unit Configuration</Card.Title>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {selectedUnits.length} Selected
              </div>
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
            Select a tower-wing combination and configure units. Select units to apply templates or make bulk changes.
          </Card.Subtitle>
        </Card.Header>

        <Card.Content>
          {/* Tower-Wing Selection */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <label className="form-label">Select Tower & Wing to Configure</label>
                <Select
                  placeholder="Choose tower and wing..."
                  options={towerWingOptions}
                  value={selectedTowerWing}
                  onChange={(e) => {
                    setSelectedTowerWing(e.target.value);
                    setSelectedUnits([]);
                  }}
                  className="text-lg font-medium"
                />
              </div>
              
              {currentTowerWing && (
                <div className="text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
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
                      {currentWing.lifts || 0} Lifts
                    </span>
                  </div>
                </div>
              )}
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Apply Template</label>
                  <div className="space-y-3">
                    {/* Template Selection Dropdown */}
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
                    
                    {/* Template Preview */}
                    {selectedTemplate && allTemplates[selectedTemplate] && (
                      <div className={`
                        p-3 rounded-lg border-2 text-sm
                        ${allTemplates[selectedTemplate].templateColor || 'bg-gray-100 border-gray-300 text-gray-800'}
                      `}>
                        <div className="font-semibold">{selectedTemplate}</div>
                        <div className="text-xs opacity-75">
                          {allTemplates[selectedTemplate].type} • 
                          {allTemplates[selectedTemplate].carpetArea} sq ft • 
                          {allTemplates[selectedTemplate].balconies} balconies
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="form-label">Available Templates</label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {Object.entries(allTemplates).map(([name, template]) => (
                      <button
                        key={name}
                        onClick={() => setSelectedTemplate(name)}
                        className={`
                          p-2 rounded-lg border-2 text-xs text-left transition-all duration-200
                          ${selectedTemplate === name 
                            ? 'ring-2 ring-purple-500 ring-offset-1' 
                            : 'hover:shadow-md'
                          }
                          ${template.templateColor || 'bg-gray-100 border-gray-300 text-gray-800'}
                        `}
                      >
                        <div className="font-semibold truncate">{name}</div>
                        <div className="opacity-75 truncate">{template.type}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
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
                    options={currentWing.floorTypes ? Object.entries(currentWing.floorTypes)
                      .filter(([_, config]) => config.enabled && config.count > 0)
                      .flatMap(([floorType, config]) => 
                        Array.from({ length: config.count }, (_, i) => ({
                          value: `${currentTower.id}-${currentWing.id}-${floorType}-${i + 1}`,
                          label: `${floorType} ${i + 1}`
                        }))
                      ) : []}
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
                      if (currentWing.floorTypes) {
                        Object.entries(currentWing.floorTypes).forEach(([floorType, config]) => {
                          if (config.enabled && config.count > 0) {
                            for (let i = 1; i <= config.count; i++) {
                              const floorId = `${currentTower.id}-${currentWing.id}-${floorType}-${i}`;
                              addUnitsToFloor(floorId, 4);
                            }
                          }
                        });
                      }
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
                  if (currentWing.floorTypes) {
                    Object.entries(currentWing.floorTypes).forEach(([floorType, config]) => {
                      if (config.enabled && config.count > 0) {
                        for (let i = 1; i <= config.count; i++) {
                          const floorId = `${currentTower.id}-${currentWing.id}-${floorType}-${i}`;
                          addUnitsToFloor(floorId, 4);
                        }
                      }
                    });
                  }
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
                            ${allTemplates[unit.templateName]?.templateColor || 'bg-gray-100 text-gray-800 border-gray-200'
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

          {/* Unit Type and Template Legends */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Unit Type Legend */}
            <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
              <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                Unit Types Breakdown
              </h4>
              <div className="space-y-3">
                {UNIT_TYPES.map(unitType => {
                  const count = wingUnits.filter(unit => 
                    allTemplates[unit.templateName]?.type === unitType || unit.type === unitType
                  ).length;
                  
                  if (count === 0) return null;
                  
                  return (
                    <div key={unitType} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                        <span className="text-sm font-medium text-gray-700">{unitType}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-blue-600">{count}</span>
                        <span className="text-xs text-gray-500">
                          ({((count / wingUnits.length) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
                
                {/* Untyped units */}
                {(() => {
                  const untypedCount = wingUnits.filter(unit => 
                    !unit.templateName && !unit.type
                  ).length;
                  
                  if (untypedCount > 0) {
                    return (
                      <div className="flex items-center justify-between border-t pt-3">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                          <span className="text-sm font-medium text-gray-500 italic">Not Defined</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-gray-500">{untypedCount}</span>
                          <span className="text-xs text-gray-400">
                            ({((untypedCount / wingUnits.length) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>

            {/* Template Usage Legend */}
            <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
              <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                Template Usage
              </h4>
              <div className="space-y-3">
                {Object.entries(allTemplates).map(([templateName, template]) => {
                  const count = wingUnits.filter(unit => unit.templateName === templateName).length;
                  
                  if (count === 0) return null;
                  
                  return (
                    <div key={templateName} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`
                          w-3 h-3 rounded-full mr-3 border
                          ${template.templateColor ? 
                            template.templateColor.includes('bg-blue') ? 'bg-blue-400 border-blue-500' :
                            template.templateColor.includes('bg-green') ? 'bg-green-400 border-green-500' :
                            template.templateColor.includes('bg-purple') ? 'bg-purple-400 border-purple-500' :
                            template.templateColor.includes('bg-orange') ? 'bg-orange-400 border-orange-500' :
                            template.templateColor.includes('bg-yellow') ? 'bg-yellow-400 border-yellow-500' :
                            template.templateColor.includes('bg-pink') ? 'bg-pink-400 border-pink-500' :
                            template.templateColor.includes('bg-indigo') ? 'bg-indigo-400 border-indigo-500' :
                            template.templateColor.includes('bg-red') ? 'bg-red-400 border-red-500' :
                            template.templateColor.includes('bg-cyan') ? 'bg-cyan-400 border-cyan-500' :
                            template.templateColor.includes('bg-emerald') ? 'bg-emerald-400 border-emerald-500' :
                            'bg-gray-400 border-gray-500'
                            : 'bg-gray-400 border-gray-500'
                          }
                        `}></div>
                        <div>
                          <span className="text-sm font-medium text-gray-700 block truncate max-w-32">
                            {templateName}
                          </span>
                          <span className="text-xs text-gray-500">{template.type}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-purple-600">{count}</span>
                        <span className="text-xs text-gray-500">
                          ({((count / wingUnits.length) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
                
                {/* Units without templates */}
                {(() => {
                  const noTemplateCount = wingUnits.filter(unit => !unit.templateName).length;
                  
                  if (noTemplateCount > 0) {
                    return (
                      <div className="flex items-center justify-between border-t pt-3">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-gray-300 rounded-full mr-3 border border-gray-400"></div>
                          <span className="text-sm font-medium text-gray-500 italic">No Template</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-gray-500">{noTemplateCount}</span>
                          <span className="text-xs text-gray-400">
                            ({((noTemplateCount / wingUnits.length) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>

          {/* Wing Summary */}
          <div className="mt-8 p-6 bg-gradient-to-r from-gray-900 to-blue-900 text-white rounded-2xl">
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
                      ? `${currentWing.name} → ${currentTower.wings[currentTowerWing.wingIndex + 1]?.name}` 
                      : `${currentTower.name || currentTower.customName} → ${towers[currentTowerWing.towerIndex + 1]?.name || towers[currentTowerWing.towerIndex + 1]?.customName}`
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
          nextLabel="Next: Review & Finalize"
          previousLabel="Back: Floor Configuration"
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