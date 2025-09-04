// Step2TowerWingDeclaration.jsx - Complete tower and wing declaration step
import React, { useState, useEffect } from 'react';
import { Building2, Plus, Trash2, Copy, Settings } from 'lucide-react';
import { TOWER_PRESET_OPTIONS, WING_TYPES, FLOOR_TYPES_ORDER, WING_TEMPLATE } from '../../utils/constants';

const Step2TowerWingDeclaration = ({ 
  data, 
  onUpdate, 
  onNext,
  onPrevious,
  onSave
}) => {
  const [towers, setTowers] = useState(data.towers || []);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Initialize with at least one tower if empty
    if (towers.length === 0) {
      addTower();
    }
  }, []);

  const addTower = () => {
    const newTower = {
      id: `tower-${Date.now()}`,
      name: '',
      customName: '',
      wings: []
    };
    setTowers([...towers, newTower]);
  };

  const removeTower = (towerId) => {
    setTowers(towers.filter(tower => tower.id !== towerId));
  };

  const updateTower = (towerId, updates) => {
    setTowers(towers.map(tower => 
      tower.id === towerId ? { ...tower, ...updates } : tower
    ));
  };

  const addWingToTower = (towerId) => {
    const tower = towers.find(t => t.id === towerId);
    const wingLetter = String.fromCharCode(65 + tower.wings.length); // A, B, C, etc.
    
    const newWing = {
      ...WING_TEMPLATE,
      id: `${towerId}-wing-${Date.now()}`,
      name: `Wing ${wingLetter}`,
    };

    updateTower(towerId, {
      wings: [...tower.wings, newWing]
    });
  };

  const removeWingFromTower = (towerId, wingId) => {
    const tower = towers.find(t => t.id === towerId);
    updateTower(towerId, {
      wings: tower.wings.filter(wing => wing.id !== wingId)
    });
  };

  const updateWing = (towerId, wingId, updates) => {
    const tower = towers.find(t => t.id === towerId);
    const updatedWings = tower.wings.map(wing => 
      wing.id === wingId ? { ...wing, ...updates } : wing
    );
    updateTower(towerId, { wings: updatedWings });
  };

  const updateWingFloorType = (towerId, wingId, floorType, updates) => {
    const tower = towers.find(t => t.id === towerId);
    const wing = tower.wings.find(w => w.id === wingId);
    
    const updatedFloorTypes = {
      ...wing.floorTypes,
      [floorType]: { ...wing.floorTypes[floorType], ...updates }
    };
    
    updateWing(towerId, wingId, { floorTypes: updatedFloorTypes });
  };

  const validateStep = () => {
    const newErrors = {};
    
    if (towers.length === 0) {
      newErrors.towers = 'At least one tower is required';
    }

    towers.forEach((tower, towerIndex) => {
      if (!tower.name && !tower.customName) {
        newErrors[`tower-${tower.id}-name`] = 'Tower name is required';
      }
      
      if (tower.wings.length === 0) {
        newErrors[`tower-${tower.id}-wings`] = 'At least one wing is required per tower';
      }

      tower.wings.forEach((wing, wingIndex) => {
        if (!wing.name) {
          newErrors[`wing-${wing.id}-name`] = 'Wing name is required';
        }
        
        const hasEnabledFloors = Object.values(wing.floorTypes).some(ft => ft.enabled && ft.count > 0);
        if (!hasEnabledFloors) {
          newErrors[`wing-${wing.id}-floors`] = 'At least one floor type must be enabled';
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      onUpdate({ towers });
      onNext();
    }
  };

  const getTotalWings = () => {
    return towers.reduce((total, tower) => total + tower.wings.length, 0);
  };

  const getTotalFloors = () => {
    let total = 0;
    towers.forEach(tower => {
      tower.wings.forEach(wing => {
        Object.values(wing.floorTypes).forEach(floorType => {
          if (floorType.enabled) {
            total += floorType.count;
          }
        });
      });
    });
    return total;
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Tower & Wing Declaration</h3>
        <p className="text-gray-600">
          Define your project's tower structure and wing configuration. Each tower can have multiple wings with different floor types.
        </p>
        
        {/* Summary Stats */}
        <div className="mt-4 flex space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span><strong>{towers.length}</strong> Towers</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span><strong>{getTotalWings()}</strong> Wings</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span><strong>{getTotalFloors()}</strong> Total Floors</span>
          </div>
        </div>
      </div>

      {/* Towers */}
      <div className="space-y-6">
        {towers.map((tower, towerIndex) => (
          <div key={tower.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            {/* Tower Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Building2 className="w-6 h-6 text-blue-600" />
                <h4 className="text-lg font-semibold text-gray-900">
                  Tower {towerIndex + 1}
                </h4>
              </div>
              <div className="flex items-center space-x-2">
                {towers.length > 1 && (
                  <button
                    onClick={() => removeTower(tower.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Remove Tower"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Tower Name Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tower Name
                </label>
                <select
                  value={tower.name}
                  onChange={(e) => updateTower(tower.id, { name: e.target.value, customName: '' })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select tower name...</option>
                  {TOWER_PRESET_OPTIONS.filter(option => option !== 'Custom').map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                  <option value="Custom">Custom</option>
                </select>
                {errors[`tower-${tower.id}-name`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`tower-${tower.id}-name`]}</p>
                )}
              </div>

              {tower.name === 'Custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Tower Name
                  </label>
                  <input
                    type="text"
                    value={tower.customName}
                    onChange={(e) => updateTower(tower.id, { customName: e.target.value })}
                    placeholder="Enter custom tower name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* Wings Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-md font-medium text-gray-900">Wings</h5>
                <button
                  onClick={() => addWingToTower(tower.id)}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Wing</span>
                </button>
              </div>

              {tower.wings.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No wings added to this tower</p>
                  <button
                    onClick={() => addWingToTower(tower.id)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    Add First Wing
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tower.wings.map((wing, wingIndex) => (
                    <div key={wing.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      {/* Wing Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-sm font-medium">
                            {String.fromCharCode(65 + wingIndex)}
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={wing.name}
                              onChange={(e) => updateWing(tower.id, wing.id, { name: e.target.value })}
                              className="text-sm font-medium bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                              placeholder="Wing name"
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <select
                            value={wing.type}
                            onChange={(e) => updateWing(tower.id, wing.id, { type: e.target.value })}
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                          >
                            {WING_TYPES.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => removeWingFromTower(tower.id, wing.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Remove Wing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Floor Types Configuration */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                        {FLOOR_TYPES_ORDER.map(floorType => (
                          <div key={floorType} className="space-y-2">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id={`${wing.id}-${floorType}`}
                                checked={wing.floorTypes[floorType]?.enabled || false}
                                onChange={(e) => updateWingFloorType(tower.id, wing.id, floorType, { 
                                  enabled: e.target.checked,
                                  count: e.target.checked ? (wing.floorTypes[floorType]?.count || 1) : 0
                                })}
                                className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                              />
                              <label htmlFor={`${wing.id}-${floorType}`} className="text-sm font-medium text-gray-700">
                                {floorType}
                              </label>
                            </div>
                            {wing.floorTypes[floorType]?.enabled && (
                              <input
                                type="number"
                                min="1"
                                value={wing.floorTypes[floorType]?.count || 1}
                                onChange={(e) => updateWingFloorType(tower.id, wing.id, floorType, { 
                                  count: parseInt(e.target.value) || 1 
                                })}
                                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                                placeholder="Count"
                              />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Lifts Configuration */}
                      <div className="flex items-center space-x-4 pt-3 border-t border-gray-200">
                        <label className="text-sm font-medium text-gray-700">Number of Lifts:</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={wing.lifts}
                          onChange={(e) => updateWing(tower.id, wing.id, { lifts: parseInt(e.target.value) || 0 })}
                          className="w-20 text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Validation Errors */}
                      {errors[`wing-${wing.id}-name`] && (
                        <p className="mt-2 text-sm text-red-600">{errors[`wing-${wing.id}-name`]}</p>
                      )}
                      {errors[`wing-${wing.id}-floors`] && (
                        <p className="mt-2 text-sm text-red-600">{errors[`wing-${wing.id}-floors`]}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tower Validation Errors */}
            {errors[`tower-${tower.id}-wings`] && (
              <p className="mt-4 text-sm text-red-600">{errors[`tower-${tower.id}-wings`]}</p>
            )}
          </div>
        ))}

        {/* Add Tower Button */}
        <button
          onClick={addTower}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
        >
          <div className="flex items-center justify-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Add Another Tower</span>
          </div>
        </button>
      </div>

      {/* Global Validation Errors */}
      {errors.towers && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{errors.towers}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          onClick={onPrevious}
          className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          <span>← Previous</span>
        </button>
        <button
          onClick={handleNext}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <span>Next: Floor Configuration →</span>
        </button>
      </div>
    </div>
  );
};

export default Step2TowerWingDeclaration;