// Step3FloorConfiguration.jsx - Individual floor configuration with multiple usage options
import React, { useState, useEffect } from 'react';
import { Building2, Layers, Copy, Plus, Trash2, ChevronDown, ChevronRight, Settings } from 'lucide-react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import StepNavigation from '../wizard/StepNavigation';
import ValidationSummary from '../wizard/ValidationSummary';

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
  const [currentTowerIndex, setCurrentTowerIndex] = useState(0);
  const [currentWingIndex, setCurrentWingIndex] = useState(0);
  const [expandedFloors, setExpandedFloors] = useState({});
  const [selectedFloors, setSelectedFloors] = useState(new Set());
  const [bulkConfigMode, setBulkConfigMode] = useState(false);
  const [bulkConfig, setBulkConfig] = useState({});
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

  const toggleFloorExpansion = (floorId) => {
    setExpandedFloors(prev => ({
      ...prev,
      [floorId]: !prev[floorId]
    }));
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
  };

  const goToPrevWing = () => {
    if (currentWingIndex > 0) {
      setCurrentWingIndex(currentWingIndex - 1);
    } else if (currentTowerIndex > 0) {
      setCurrentTowerIndex(currentTowerIndex - 1);
      const prevTower = towers[currentTowerIndex - 1];
      setCurrentWingIndex(prevTower.wings.length - 1);
    }
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
      onUpdate({ floorConfigurations });
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
    onUpdate({ floorConfigurations });
    onSave?.({ floorConfigurations });
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
            Configure each individual floor with specific usage types and unit counts. Multiple usage types can be selected for each floor.
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
          <div className="space-y-6">
            {individualFloors.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <Layers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No floors configured</h4>
                <p className="text-gray-600">Go back to tower configuration to enable floor types</p>
              </div>
            ) : (
              individualFloors.map((floor) => {
                const config = getFloorConfig(floor.id);
                const isExpanded = expandedFloors[floor.id];
                const availableUsages = USAGE_OPTIONS[floor.type] || [];

                return (
                  <div key={floor.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    {/* Floor Header */}
                    <button
                      onClick={() => toggleFloorExpansion(floor.id)}
                      className={`
                        w-full px-6 py-4 flex items-center justify-between text-left transition-all duration-200
                        ${selectedFloors.has(floor.id) && bulkConfigMode
                          ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-l-4 border-purple-500'
                          : 'bg-gradient-to-r from-gray-50 to-blue-50 hover:from-gray-100 hover:to-blue-100'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-4">
                        {bulkConfigMode && (
                          <input
                            type="checkbox"
                            checked={selectedFloors.has(floor.id)}
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
                            {config.usages?.length > 0 ? config.usages.join(', ') : 'No usage selected'} 
                            {config.unitsCount > 0 && ` • ${config.unitsCount} units`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`
                          w-3 h-3 rounded-full
                          ${config.usages?.length > 0 ? 'bg-green-500' : 'bg-gray-300'}
                        `}></div>
                        {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                      </div>
                    </button>

                    {/* Floor Configuration */}
                    {isExpanded && (
                      <div className="p-6 space-y-6 animate-slide-up">
                        {/* Usage Selection */}
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

                          {config.usages?.includes('Storage') && (
                            <Input.Number
                              label="Storage Area (sq ft)"
                              value={config.customConfig?.storageArea || 0}
                              onChange={(e) => updateFloorConfig(floor.id, { 
                                customConfig: { 
                                  ...config.customConfig, 
                                  storageArea: parseInt(e.target.value) || 0 
                                }
                              })}
                              min={0}
                              helperText="Total storage area"
                            />
                          )}

                          {config.usages?.includes('Retail') && (
                            <Input.Number
                              label="Retail Shops"
                              value={config.customConfig?.retailShops || 0}
                              onChange={(e) => updateFloorConfig(floor.id, { 
                                customConfig: { 
                                  ...config.customConfig, 
                                  retailShops: parseInt(e.target.value) || 0 
                                }
                              })}
                              min={0}
                              helperText="Number of retail spaces"
                            />
                          )}

                          {config.usages?.includes('Office') && (
                            <Input.Number
                              label="Office Spaces"
                              value={config.customConfig?.officeSpaces || 0}
                              onChange={(e) => updateFloorConfig(floor.id, { 
                                customConfig: { 
                                  ...config.customConfig, 
                                  officeSpaces: parseInt(e.target.value) || 0 
                                }
                              })}
                              min={0}
                              helperText="Number of office units"
                            />
                          )}
                        </div>

                        {/* Additional Configuration */}
                        {config.usages?.includes('Amenities') && (
                          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                            <h5 className="font-semibold text-purple-800 mb-3">Amenity Features</h5>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {['Swimming Pool', 'Gym', 'Clubhouse', 'Library', 'Game Room', 'Spa', 'Café', 'Business Center'].map(feature => (
                                <label key={feature} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={config.customConfig?.amenityFeatures?.includes(feature) || false}
                                    onChange={(e) => {
                                      const features = config.customConfig?.amenityFeatures || [];
                                      const updatedFeatures = e.target.checked 
                                        ? [...features, feature]
                                        : features.filter(f => f !== feature);
                                      updateFloorConfig(floor.id, { 
                                        customConfig: { 
                                          ...config.customConfig, 
                                          amenityFeatures: updatedFeatures 
                                        }
                                      });
                                    }}
                                    className="w-4 h-4 text-purple-600 rounded mr-2"
                                  />
                                  <span className="text-sm">{feature}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Floor Notes */}
                        <Input.TextArea
                          label="Floor Notes"
                          value={config.notes || ''}
                          onChange={(e) => updateFloorConfig(floor.id, { notes: e.target.value })}
                          placeholder="Special requirements, notes, or specifications for this floor"
                          rows={2}
                        />

                        {/* Floor Summary */}
                        <div className="p-4 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg border border-blue-200">
                          <h5 className="font-semibold text-gray-800 mb-2">📊 {floor.displayName} Summary</h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-blue-800">Usage Types:</span>
                              <p className="text-gray-700">{config.usages?.length || 0} selected</p>
                            </div>
                            <div>
                              <span className="font-medium text-green-800">Units:</span>
                              <p className="text-gray-700">{config.unitsCount || 0} units</p>
                            </div>
                            <div>
                              <span className="font-medium text-purple-800">Parking:</span>
                              <p className="text-gray-700">{config.customConfig?.parkingSpaces || 0} spaces</p>
                            </div>
                            <div>
                              <span className="font-medium text-orange-800">Status:</span>
                              <p className="text-gray-700">{config.usages?.length > 0 ? 'Configured' : 'Pending'}</p>
                            </div>
                          </div>
                        </div>
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
                    return config.usages?.length > 0;
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
    </div>
  );
};

export default Step3FloorConfiguration;