// Step3FloorConfiguration.jsx - Individual floor configuration with flat numbering and improved UX
import React, { useState, useEffect } from 'react';
import { Building2, Layers, Copy, Plus, Trash2, ChevronDown, ChevronRight, Settings, Hash } from 'lucide-react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import StepNavigation from '../wizard/StepNavigation';
import ValidationSummary from '../wizard/ValidationSummary';
import { FLAT_NUMBERING_TYPES } from '../../utils/constants';

const USAGE_OPTIONS = {
  Basement: ['Parking', 'Storage', 'Utilities', 'Retail', 'Restaurant', 'Gym', 'Swimming Pool', 'Mechanical Room', 'Generator Room', 'Water Treatment'],
  Podium: ['Amenities', 'Parking', 'Retail', 'Office', 'Recreation', 'Swimming Pool', 'Gym', 'Banquet Hall', 'Terrace Garden', 'Mixed'],
  Ground: ['Lobby', 'Retail', 'Restaurant', 'Banking', 'Office', 'Mixed'],
  Floors: ['Commercial', 'Residential'],
  Terrace: ['Amenities', 'Garden', 'Recreation', 'Restaurant', 'Event Space', 'Open Space']
};

const Step3FloorConfiguration = ({ 
  data, 
  onUpdate, 
  onNext,
  onPrevious,
  onSave
}) => {
  const [floorConfigurations, setFloorConfigurations] = useState(data.floorConfigurations || {});
  const [flatNumberingType, setFlatNumberingType] = useState(data.flatNumberingType || 'wing-floor-unit');
  const [currentTowerIndex, setCurrentTowerIndex] = useState(0);
  const [currentWingIndex, setCurrentWingIndex] = useState(0);
  const [expandedFloors, setExpandedFloors] = useState({});
  const [selectedFloors, setSelectedFloors] = useState(new Set());
  const [bulkConfigMode, setBulkConfigMode] = useState(false);
  const [bulkConfig, setBulkConfig] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [validationResult, setValidationResult] = useState({ isValid: true, errors: {}, warnings: [] });

  const towers = data.towers || [];
  const currentTower = towers[currentTowerIndex];
  const currentWing = currentTower?.wings[currentWingIndex];

  // Generate individual floors for current wing
  const generateIndividualFloors = () => {
    if (!currentWing) return [];
    
    const floors = [];
    Object.entries(currentWing.floorTypes).forEach(([floorType, config]) => {
      if (config.enabled && config.count > 0) {
        for (let i = 1; i <= config.count; i++) {
          floors.push({
            id: `${currentTower.id}-${currentWing.id}-${floorType}-${i}`,
            type: floorType,
            number: i,
            displayName: `${floorType} ${i}`,
            usages: [],
            unitsCount: floorType === 'Floors' ? 4 : 0,
            notes: '',
            customConfig: {}
          });
        }
      }
    });
    return floors;
  };

  const individualFloors = generateIndividualFloors();

  const getFloorConfig = (floorId) => {
    return floorConfigurations[floorId] || {
      usages: [],
      unitsCount: 0,
      floorType: 'Residential',
      notes: '',
      customConfig: {}
    };
  };

  const updateFloorConfig = (floorId, updates) => {
    setFloorConfigurations(prev => ({
      ...prev,
      [floorId]: { ...getFloorConfig(floorId), ...updates }
    }));
  };

  const toggleFloorExpansion = (floorId) => {
    setExpandedFloors(prev => ({
      ...prev,
      [floorId]: !prev[floorId]
    }));
  };

  const toggleFloorSelection = (floorId) => {
    setSelectedFloors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(floorId)) {
        newSet.delete(floorId);
      } else {
        newSet.add(floorId);
      }
      return newSet;
    });
  };

  const selectAllFloors = () => {
    setSelectedFloors(new Set(individualFloors.map(floor => floor.id)));
  };

  const clearSelection = () => {
    setSelectedFloors(new Set());
  };

  const applyBulkConfiguration = () => {
    selectedFloors.forEach(floorId => {
      updateFloorConfig(floorId, bulkConfig);
    });
    setBulkConfigMode(false);
    setBulkConfig({});
    clearSelection();
  };

  const toggleFloorUsage = (floorId, usage) => {
    const config = getFloorConfig(floorId);
    const currentUsages = config.usages || [];
    const updatedUsages = currentUsages.includes(usage)
      ? currentUsages.filter(u => u !== usage)
      : [...currentUsages, usage];
    
    updateFloorConfig(floorId, { usages: updatedUsages });
  };

  const cloneFromPreviousWing = () => {
    if (currentTowerIndex === 0 && currentWingIndex === 0) return;
    
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
      
      // Clone configurations from previous wing
      const prevFloors = [];
      Object.entries(prevWing.floorTypes).forEach(([floorType, config]) => {
        if (config.enabled && config.count > 0) {
          for (let i = 1; i <= config.count; i++) {
            prevFloors.push(`${prevTower.id}-${prevWing.id}-${floorType}-${i}`);
          }
        }
      });
      
      const clonedConfigs = {};
      prevFloors.forEach(prevFloorId => {
        const prevConfig = floorConfigurations[prevFloorId];
        if (prevConfig) {
          // Map to current wing floors
          const currentFloorId = prevFloorId.replace(`${prevTower.id}-${prevWing.id}`, `${currentTower.id}-${currentWing.id}`);
          clonedConfigs[currentFloorId] = { ...prevConfig };
        }
      });
      
      setFloorConfigurations(prev => ({
        ...prev,
        ...clonedConfigs
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
    // Scroll to top when moving to next wing
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (hasNextWing()) {
      setCurrentWingIndex(currentWingIndex + 1);
    } else if (hasNextTower()) {
      setCurrentTowerIndex(currentTowerIndex + 1);
      setCurrentWingIndex(0);
    }
    
    // Reset expanded floors for new wing
    setExpandedFloors({});
  };

  const goToPrevWing = () => {
    // Scroll to top when moving to previous wing
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (currentWingIndex > 0) {
      setCurrentWingIndex(currentWingIndex - 1);
    } else if (currentTowerIndex > 0) {
      setCurrentTowerIndex(currentTowerIndex - 1);
      const prevTower = towers[currentTowerIndex - 1];
      setCurrentWingIndex(prevTower.wings.length - 1);
    }
    
    // Reset expanded floors for new wing
    setExpandedFloors({});
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

  const generateWingSequence = () => {
    const sequence = [];
    towers.forEach((tower, towerIndex) => {
      const towerName = tower.name || tower.customName || `Tower ${towerIndex + 1}`;
      tower.wings.forEach((wing, wingIndex) => {
        const wingData = {
          tower: towerName,
          wing: wing.name,
          type: wing.type,
          floors: Object.entries(wing.floorTypes)
            .filter(([_, config]) => config.enabled && config.count > 0)
            .map(([type, config]) => `${config.count} ${type}`)
            .join(', '),
          lifts: wing.lifts,
          isCurrentWing: towerIndex === currentTowerIndex && wingIndex === currentWingIndex
        };
        sequence.push(wingData);
      });
    });
    return sequence;
  };

  const handleNext = () => {
    if (isLastWing()) {
      setShowConfirmation(true);
    } else {
      goToNextWing();
    }
  };

  const confirmAndProceed = () => {
    onUpdate({ floorConfigurations, flatNumberingType });
    setShowConfirmation(false);
    onNext();
  };

  const handlePrevious = () => {
    if (currentTowerIndex === 0 && currentWingIndex === 0) {
      onPrevious();
    } else {
      goToPrevWing();
    }
  };

  const handleSave = () => {
    onUpdate({ floorConfigurations, flatNumberingType });
    onSave?.({ floorConfigurations, flatNumberingType });
  };

  if (!currentTower || !currentWing) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No towers configured</h3>
        <p className="text-gray-600">Please go back and configure towers and wings first.</p>
        <Button variant="primary" onClick={onPrevious}>
          Go Back
        </Button>
      </div>
    );
  }

  const { currentPosition, totalWings } = getProgressInfo();
  const wingSequence = generateWingSequence();

  return (
    <div className="space-y-8 animate-slide-up">
      <Card className="overflow-hidden">
        <Card.Header>
          <div className="flex items-center justify-between">
            <Card.Title icon={Layers} gradient>Floor Configuration</Card.Title>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Wing {currentPosition} of {totalWings}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={cloneFromPreviousWing}
                disabled={currentTowerIndex === 0 && currentWingIndex === 0}
                icon={Copy}
              >
                Clone from Previous Wing
              </Button>
            </div>
          </div>
          <Card.Subtitle>
            Configure each individual floor with specific usage types and unit counts. Set up flat numbering system for the entire project.
          </Card.Subtitle>
        </Card.Header>

        <Card.Content>
          {/* Flat Numbering System */}
          <div className="mb-8 p-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
            <div className="flex items-center space-x-3 mb-4">
              <Hash className="w-6 h-6 text-yellow-600" />
              <h4 className="text-lg font-bold text-yellow-800">Flat Numbering System</h4>
            </div>
            <p className="text-sm text-yellow-700 mb-4">
              Choose how flats will be numbered throughout your project. This will be applied consistently across all towers and wings.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FLAT_NUMBERING_TYPES.map((option) => (
                <label
                  key={option.value}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                    ${flatNumberingType === option.value
                      ? 'border-yellow-500 bg-yellow-100 shadow-md'
                      : 'border-yellow-200 bg-white hover:border-yellow-300 hover:bg-yellow-50'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="flatNumberingType"
                    value={option.value}
                    checked={flatNumberingType === option.value}
                    onChange={(e) => setFlatNumberingType(e.target.value)}
                    className="sr-only"
                  />
                  <div className="font-semibold text-gray-800 mb-2">{option.label}</div>
                  <div className="text-sm text-gray-600 mb-2">{option.description}</div>
                  <div className="text-xs text-yellow-700 font-mono bg-yellow-200 px-2 py-1 rounded">
                    Example: {option.example}
                  </div>
                </label>
              ))}
            </div>
          </div>

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
                    <Layers className="w-4 h-4 mr-1" />
                    {individualFloors.length} Individual Floors
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

          <ValidationSummary
            errors={validationResult.errors}
            warnings={validationResult.warnings}
            className="mb-8"
          />

          {/* Bulk Configuration Panel */}
          {individualFloors.length > 1 && (
            <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <h4 className="font-bold text-purple-800 mb-4">🔧 Bulk Floor Configuration</h4>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <Button
                    variant={bulkConfigMode ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setBulkConfigMode(!bulkConfigMode)}
                  >
                    {bulkConfigMode ? 'Exit Bulk Mode' : 'Enable Bulk Mode'}
                  </Button>
                  
                  {bulkConfigMode && (
                    <>
                      <Button variant="outline" size="sm" onClick={selectAllFloors}>
                        Select All
                      </Button>
                      <Button variant="outline" size="sm" onClick={clearSelection}>
                        Clear Selection
                      </Button>
                    </>
                  )}
                </div>
                
                {selectedFloors.size > 0 && (
                  <div className="text-sm text-purple-800 font-medium">
                    {selectedFloors.size} floor{selectedFloors.size > 1 ? 's' : ''} selected
                  </div>
                )}
              </div>

              {bulkConfigMode && selectedFloors.size > 0 && (
                <div className="p-4 bg-white rounded-lg border border-purple-200">
                  <h5 className="font-semibold text-gray-800 mb-4">Apply to Selected Floors</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <Select
                      label="Floor Type"
                      options={['Residential', 'Commercial']}
                      value={bulkConfig.floorType || ''}
                      onChange={(e) => setBulkConfig(prev => ({ ...prev, floorType: e.target.value }))}
                      placeholder="Select floor type"
                    />
                    
                    <Input.Number
                      label="Units Count"
                      value={bulkConfig.unitsCount || ''}
                      onChange={(e) => setBulkConfig(prev => ({ ...prev, unitsCount: parseInt(e.target.value) || 0 }))}
                      min={0}
                      max={20}
                      placeholder="Units per floor"
                    />
                    
                    <div>
                      <label className="form-label">Usage Types</label>
                      <div className="grid grid-cols-2 gap-2">
                        {USAGE_OPTIONS[individualFloors[0]?.type]?.slice(0, 6).map(usage => (
                          <label key={usage} className="flex items-center text-sm">
                            <input
                              type="checkbox"
                              checked={bulkConfig.usages?.includes(usage) || false}
                              onChange={(e) => {
                                const usages = bulkConfig.usages || [];
                                const updatedUsages = e.target.checked
                                  ? [...usages, usage]
                                  : usages.filter(u => u !== usage);
                                setBulkConfig(prev => ({ ...prev, usages: updatedUsages }));
                              }}
                              className="w-3 h-3 text-purple-600 rounded mr-2"
                            />
                            {usage}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={applyBulkConfiguration}
                    disabled={Object.keys(bulkConfig).length === 0}
                  >
                    Apply Configuration to {selectedFloors.size} Floor{selectedFloors.size > 1 ? 's' : ''}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Individual Floors Configuration */}
          <div className="space-y-4">
            {individualFloors.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <Layers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No floors configured</h4>
                <p className="text-gray-600">Go back to tower configuration to enable floor types</p>
              </div>
            ) : (
              individualFloors.map((floor) => {
                const config = getFloorConfig(floor.id);
                const isSelected = selectedFloors.has(floor.id);
                const isExpanded = expandedFloors[floor.id];
                const availableUsages = USAGE_OPTIONS[floor.type] || [];

                return (
                  <div key={floor.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    {/* Floor Header - Expandable */}
                    <div
                      onClick={() => toggleFloorExpansion(floor.id)}
                      className={`
                        px-6 py-4 flex items-center justify-between transition-all duration-200 cursor-pointer
                        ${isSelected && bulkConfigMode
                          ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-l-4 border-purple-500'
                          : 'bg-gradient-to-r from-gray-50 to-blue-50 hover:from-gray-100 hover:to-blue-100'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-4">
                        {bulkConfigMode && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleFloorSelection(floor.id);
                            }}
                            className="w-5 h-5 text-purple-600 rounded"
                          />
                        )}
                        <div className={`
                          w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm
                          ${floor.type === 'Basement' ? 'bg-gradient-to-r from-gray-600 to-gray-800' :
                            floor.type === 'Ground' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                            floor.type === 'Podium' ? 'bg-gradient-to-r from-purple-500 to-pink-600' :
                            floor.type === 'Floors' ? 'bg-gradient-to-r from-blue-500 to-cyan-600' :
                            'bg-gradient-to-r from-orange-500 to-red-600'}
                        `}>
                          {floor.type === 'Basement' ? 'B' + floor.number :
                           floor.type === 'Ground' ? 'G' :
                           floor.type === 'Podium' ? 'P' + floor.number :
                           floor.type === 'Terrace' ? 'T' + floor.number :
                           floor.number}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{floor.displayName}</h4>
                          <p className="text-sm text-gray-600">
                            {config.floorType || 'Not configured'} • {config.unitsCount || 0} units
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`
                          w-3 h-3 rounded-full
                          ${config.floorType ? 'bg-green-500' : 'bg-gray-300'}
                        `}></div>
                        {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                      </div>
                    </div>

                    {/* Floor Configuration - Expandable */}
                    {isExpanded && (
                      <div className="p-6 space-y-6 bg-white animate-slide-up">
                      {/* Floor Type Selection for Floors type */}
                      {floor.type === 'Floors' && (
                        <div>
                          <label className="form-label">Floor Type</label>
                          <div className="grid grid-cols-2 gap-4">
                            <label className={`
                              flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                              ${config.floorType === 'Residential' 
                                ? 'border-blue-500 bg-blue-50 text-blue-800' 
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                              }
                            `}>
                              <input
                                type="radio"
                                name={`floorType-${floor.id}`}
                                value="Residential"
                                checked={config.floorType === 'Residential'}
                                onChange={(e) => updateFloorConfig(floor.id, { floorType: e.target.value })}
                                className="w-4 h-4 text-blue-600 mr-3"
                              />
                              <div>
                                <div className="font-medium">Residential</div>
                                <div className="text-xs opacity-75">Apartments, homes</div>
                              </div>
                            </label>
                            
                            <label className={`
                              flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                              ${config.floorType === 'Commercial' 
                                ? 'border-orange-500 bg-orange-50 text-orange-800' 
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                              }
                            `}>
                              <input
                                type="radio"
                                name={`floorType-${floor.id}`}
                                value="Commercial"
                                checked={config.floorType === 'Commercial'}
                                onChange={(e) => updateFloorConfig(floor.id, { floorType: e.target.value })}
                                className="w-4 h-4 text-orange-600 mr-3"
                              />
                              <div>
                                <div className="font-medium">Commercial</div>
                                <div className="text-xs opacity-75">Offices, shops</div>
                              </div>
                            </label>
                          </div>
                        </div>
                      )}

                      {/* Usage Selection for non-Floors types */}
                      {floor.type !== 'Floors' && (
                        <div>
                          <label className="form-label">Floor Usage (Select Multiple)</label>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {availableUsages.map(usage => (
                              <label key={usage} className={`
                                flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200
                                ${config.usages?.includes(usage) 
                                  ? 'border-blue-500 bg-blue-50 text-blue-800' 
                                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                }
                              `}>
                                <input
                                  type="checkbox"
                                  checked={config.usages?.includes(usage) || false}
                                  onChange={() => toggleFloorUsage(floor.id, usage)}
                                  className="w-4 h-4 text-blue-600 rounded mr-3"
                                />
                                <span className="text-sm font-medium">{usage}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Units Configuration */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input.Number
                          label="Number of Units on this Floor"
                          value={config.unitsCount || 0}
                          onChange={(e) => updateFloorConfig(floor.id, { unitsCount: parseInt(e.target.value) || 0 })}
                          min={0}
                          max={20}
                          helperText="Total units/spaces on this specific floor"
                        />

                        {/* Custom Configuration based on usage */}
                        {config.usages?.includes('Parking') && (
                          <Input.Number
                            label="Parking Spaces"
                            value={config.customConfig?.parkingSpaces || 0}
                            onChange={(e) => updateFloorConfig(floor.id, { 
                              customConfig: { 
                                ...config.customConfig, 
                                parkingSpaces: parseInt(e.target.value) || 0 
                              }
                            })}
                            min={0}
                            max={200}
                            helperText="Number of parking spaces"
                          />
                        )}
                      </div>

                      {/* Floor Notes */}
                      <Input.TextArea
                        label="Floor Notes"
                        value={config.notes || ''}
                        onChange={(e) => updateFloorConfig(floor.id, { notes: e.target.value })}
                        placeholder="Special requirements, notes, or specifications for this floor"
                        rows={2}
                      />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Wing Summary */}
          <div className="mt-10 p-6 bg-gradient-to-r from-gray-900 to-blue-900 text-white rounded-2xl">
            <h4 className="text-xl font-bold mb-4">📊 {currentWing.name} Configuration Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-300">{individualFloors.length}</div>
                <div className="text-sm text-gray-300">Total Floors</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-300">
                  {individualFloors.reduce((sum, floor) => {
                    const config = getFloorConfig(floor.id);
                    return sum + (config.unitsCount || 0);
                  }, 0)}
                </div>
                <div className="text-sm text-gray-300">Total Units</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-300">
                  {individualFloors.filter(floor => {
                    const config = getFloorConfig(floor.id);
                    return config.floorType || config.usages?.length > 0;
                  }).length}
                </div>
                <div className="text-sm text-gray-300">Configured Floors</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-300">
                  {individualFloors.reduce((sum, floor) => {
                    const config = getFloorConfig(floor.id);
                    return sum + (config.customConfig?.parkingSpaces || 0);
                  }, 0)}
                </div>
                <div className="text-sm text-gray-300">Parking Spaces</div>
              </div>
            </div>

            {/* Navigation Info */}
            <div className="mt-6 pt-6 border-t border-gray-700 text-center">
              <p className="text-gray-300">
                {isLastWing() ? (
                  <span>✅ Ready to proceed to unit configuration</span>
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
          nextLabel={isLastWing() ? "Next: Unit Configuration" : "Next Wing"}
          previousLabel={currentTowerIndex === 0 && currentWingIndex === 0 ? "Back: Tower Declaration" : "Previous Wing"}
        />
      </Card>

      {/* Confirmation Modal for last wing */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-8 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">🏗️ Floor Configuration Complete</h3>
                <p className="text-gray-600 mt-1">Review your floor configuration before proceeding to unit setup</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">📋 Wings Configured</h4>
                <p className="text-sm text-gray-600 mb-4">
                  You have successfully configured floors for all wings. Here's a summary:
                </p>
              </div>

              <div className="space-y-4">
                {wingSequence.map((item, index) => (
                  <div key={index} className={`flex items-center p-4 rounded-lg border ${
                    item.isCurrentWing 
                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-300' 
                      : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-4 ${
                      item.isCurrentWing 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' 
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    }`}>
                      {item.isCurrentWing ? '✓' : index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">
                        {item.tower} - {item.wing}
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.type} • {item.floors} • {item.lifts} lifts
                      </div>
                    </div>
                    {item.isCurrentWing && (
                      <div className="text-green-600 font-semibold text-sm">
                        Just Completed
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                <h5 className="font-semibold text-yellow-800 mb-2">🎯 Next Step</h5>
                <p className="text-sm text-yellow-700">
                  You'll now proceed to unit configuration where you can set up individual units, apply templates, and design room layouts for each wing.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <Button
                variant="secondary"
                onClick={() => setShowConfirmation(false)}
              >
                ← Continue Configuring Floors
              </Button>
              
              <Button
                variant="primary"
                onClick={confirmAndProceed}
              >
                ✓ Proceed to Unit Configuration
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step3FloorConfiguration;