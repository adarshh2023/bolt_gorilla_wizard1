// Step2TowerWingDeclaration.jsx - Updated with Ground/Floors always enabled and Basement naming
import React, { useState, useEffect } from 'react';
import { Building2, Plus, Trash2, Copy, Settings } from 'lucide-react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import StepNavigation from '../wizard/StepNavigation';
import { TOWER_PRESET_OPTIONS, WING_TYPES, WING_TEMPLATE } from '../../utils/constants';

const FLOOR_TYPES_CONFIG = [
  { key: 'Basement', label: 'Basement', hasCheckbox: true },
  { key: 'Podium', label: 'Podium', hasCheckbox: true },
  { key: 'Ground', label: 'Ground', hasCheckbox: true }, // Now editable
  { key: 'Floors', label: 'Floors', hasCheckbox: false }, // Always enabled
  { key: 'Terrace', label: 'Terrace', hasCheckbox: true },
];

const Step2TowerWingDeclaration = ({ 
  data, 
  onUpdate, 
  onNext,
  onPrevious,
  onSave
}) => {
  const [towers, setTowers] = useState(data.towers || []);
  const [errors, setErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);

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
    if (towers.length > 1) {
      setTowers(towers.filter(tower => tower.id !== towerId));
    }
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
      floorTypes: {
        Basement: { enabled: false, count: 0 },
        Podium: { enabled: false, count: 0 },
        Ground: { enabled: true, count: 1 }, // Default enabled but editable
        Floors: { enabled: true, count: 10 }, // Always enabled
        Terrace: { enabled: false, count: 0 },
      }
    };

    updateTower(towerId, {
      wings: [...tower.wings, newWing]
    });
  };

  const removeWingFromTower = (towerId, wingId) => {
    const tower = towers.find(t => t.id === towerId);
    if (tower.wings.length > 1) {
      updateTower(towerId, {
        wings: tower.wings.filter(wing => wing.id !== wingId)
      });
    }
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

  const generateProjectSequence = () => {
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
          lifts: wing.lifts
        };
        sequence.push(wingData);
      });
    });
    return sequence;
  };

  const handleNext = () => {
    if (validateStep()) {
      setShowConfirmation(true);
    }
  };

  const confirmAndProceed = () => {
    onUpdate({ towers });
    setShowConfirmation(false);
    onNext();
  };

  const handleSave = () => {
    onUpdate({ towers });
    onSave?.({ towers });
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

  const projectSequence = generateProjectSequence();

  return (
    <div className="space-y-8 animate-slide-up">
      <Card className="overflow-hidden">
        <Card.Header>
          <div className="flex items-center justify-between">
            <Card.Title icon={Building2} gradient>Tower & Wing Declaration</Card.Title>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span><strong>{towers.length}</strong> Towers</span>
              <span><strong>{getTotalWings()}</strong> Wings</span>
              <span><strong>{getTotalFloors()}</strong> Total Floors</span>
            </div>
          </div>
          <Card.Subtitle>
            Define your project's tower structure and wing configuration. Each tower can have multiple wings with different floor types.
          </Card.Subtitle>
        </Card.Header>

        <Card.Content>
          {/* Global Validation Errors */}
          {errors.towers && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{errors.towers}</p>
            </div>
          )}

          <div className="space-y-8">
            {towers.map((tower, towerIndex) => (
              <div key={tower.id} className="step-card">
                {/* Tower Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl flex items-center justify-center font-bold text-lg">
                      {towerIndex + 1}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">Tower {towerIndex + 1}</h3>
                      <p className="text-sm text-gray-600">{tower.wings.length} wings configured</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {towers.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTower(tower.id)}
                        icon={Trash2}
                        className="hover:bg-red-100 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>

                {/* Tower Name Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <Select
                    label="Tower Name"
                    placeholder="Select tower name..."
                    options={[...TOWER_PRESET_OPTIONS.filter(option => option !== 'Custom'), 'Custom']}
                    value={tower.name}
                    onChange={(e) => updateTower(tower.id, { name: e.target.value, customName: '' })}
                    error={errors[`tower-${tower.id}-name`]}
                    required
                  />

                  {tower.name === 'Custom' && (
                    <Input
                      label="Custom Tower Name"
                      placeholder="Enter custom tower name"
                      value={tower.customName}
                      onChange={(e) => updateTower(tower.id, { customName: e.target.value })}
                      required
                    />
                  )}
                </div>

                {/* Wings Section */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-semibold text-gray-800">Wings Configuration</h4>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => addWingToTower(tower.id)}
                      icon={Plus}
                    >
                      Add Wing
                    </Button>
                  </div>

                  {tower.wings.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No wings added to this tower</h4>
                      <p className="text-gray-600 mb-6">Add wings to define the structure of this tower</p>
                      <Button
                        variant="primary"
                        onClick={() => addWingToTower(tower.id)}
                        icon={Plus}
                      >
                        Add First Wing
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {tower.wings.map((wing, wingIndex) => (
                        <div key={wing.id} className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                          {/* Wing Header */}
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                                {String.fromCharCode(65 + wingIndex)}
                              </div>
                              <div className="flex-1">
                                <Input
                                  value={wing.name}
                                  onChange={(e) => updateWing(tower.id, wing.id, { name: e.target.value })}
                                  placeholder="Wing name"
                                  className="font-medium text-lg"
                                  error={errors[`wing-${wing.id}-name`]}
                                />
                              </div>
                              <Select
                                options={WING_TYPES}
                                value={wing.type}
                                onChange={(e) => updateWing(tower.id, wing.id, { type: e.target.value })}
                                className="w-40"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              {tower.wings.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeWingFromTower(tower.id, wing.id)}
                                  icon={Trash2}
                                  className="hover:bg-red-100 hover:text-red-700"
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Floor Types Configuration */}
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                            {FLOOR_TYPES_CONFIG.map(floorConfig => (
                              <div key={floorConfig.key} className="space-y-3">
                                <div className="flex items-center">
                                  {floorConfig.hasCheckbox ? (
                                    <input
                                      type="checkbox"
                                      id={`${wing.id}-${floorConfig.key}`}
                                      checked={wing.floorTypes[floorConfig.key]?.enabled || false}
                                      onChange={(e) => updateWingFloorType(tower.id, wing.id, floorConfig.key, { 
                                        enabled: e.target.checked,
                                        count: e.target.checked ? (wing.floorTypes[floorConfig.key]?.count || 1) : 0
                                      })}
                                      className="mr-2 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                    />
                                  ) : (
                                    <div className="mr-2 w-4 h-4 flex items-center justify-center">
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    </div>
                                  )}
                                  <label htmlFor={`${wing.id}-${floorConfig.key}`} className="text-sm font-medium text-gray-700">
                                    {floorConfig.label}
                                  </label>
                                </div>
                                {(wing.floorTypes[floorConfig.key]?.enabled || !floorConfig.hasCheckbox) && (
                                  <Input.Number
                                    value={wing.floorTypes[floorConfig.key]?.count || (floorConfig.key === 'Ground' ? 1 : floorConfig.key === 'Floors' ? 10 : 1)}
                                    onChange={(e) => updateWingFloorType(tower.id, wing.id, floorConfig.key, { 
                                      enabled: true,
                                      count: parseInt(e.target.value) || 1 
                                    })}
                                    min={floorConfig.key === 'Ground' ? 1 : 0}
                                    max={floorConfig.key === 'Floors' ? 50 : 10}
                                    className="text-sm"
                                  />
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Lifts Configuration */}
                          <div className="flex items-center space-x-6 pt-4 border-t border-gray-200">
                            <div className="flex items-center space-x-3">
                              <Settings className="w-4 h-4 text-gray-600" />
                              <label className="text-sm font-medium text-gray-700">Number of Lifts:</label>
                            </div>
                            <Input.Number
                              value={wing.lifts}
                              onChange={(e) => updateWing(tower.id, wing.id, { lifts: parseInt(e.target.value) || 0 })}
                              min={0}
                              max={10}
                              className="w-24"
                            />
                          </div>

                          {/* Wing Summary */}
                          <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-600">Total Floors:</span>
                                <span className="ml-2 font-bold text-green-700">
                                  {Object.values(wing.floorTypes).reduce((sum, ft) => sum + (ft.enabled ? ft.count : 0), 0)}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Wing Type:</span>
                                <span className="ml-2 font-bold text-blue-700">{wing.type}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Lifts:</span>
                                <span className="ml-2 font-bold text-purple-700">{wing.lifts}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Status:</span>
                                <span className="ml-2 font-bold text-green-700">✓ Configured</span>
                              </div>
                            </div>
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

                  {/* Tower Validation Errors */}
                  {errors[`tower-${tower.id}-wings`] && (
                    <p className="mt-4 text-sm text-red-600">{errors[`tower-${tower.id}-wings`]}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Add Tower Button */}
            <div 
              onClick={addTower}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center justify-center space-x-3">
                <Plus className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-lg font-medium">Add Another Tower</span>
              </div>
            </div>
          </div>

          {/* Project Summary */}
          <div className="mt-10 p-6 bg-gradient-to-r from-gray-900 to-blue-900 text-white rounded-2xl">
            <h4 className="text-xl font-bold mb-4">🎯 Project Structure Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-300">{towers.length}</div>
                <div className="text-sm text-gray-300">Total Towers</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-300">{getTotalWings()}</div>
                <div className="text-sm text-gray-300">Total Wings</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-300">{getTotalFloors()}</div>
                <div className="text-sm text-gray-300">Total Floors</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-300">
                  {towers.reduce((sum, tower) => sum + tower.wings.reduce((wingSum, wing) => wingSum + wing.lifts, 0), 0)}
                </div>
                <div className="text-sm text-gray-300">Total Lifts</div>
              </div>
            </div>
          </div>
        </Card.Content>

        <StepNavigation
          onPrevious={onPrevious}
          onNext={handleNext}
          onSave={handleSave}
          isValid={Object.keys(errors).length === 0}
          nextLabel="Next: Floor Configuration"
          previousLabel="Back: Project Overview"
        />
      </Card>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">🏗️ Confirm Project Structure</h3>
                <p className="text-gray-600 mt-1">Review the sequence of towers and wings you've configured</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">📋 Configuration Sequence</h4>
                <p className="text-sm text-gray-600 mb-4">
                  This is the order in which you'll configure floors and units in the next steps:
                </p>
              </div>

              <div className="space-y-4">
                {projectSequence.map((item, index) => (
                  <div key={index} className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">
                        {item.tower} - {item.wing}
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.type} • {item.floors} • {item.lifts} lifts
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                <h5 className="font-semibold text-yellow-800 mb-2">⚠️ Important Note</h5>
                <p className="text-sm text-yellow-700">
                  You'll configure each wing one by one in the next steps. Make sure this sequence looks correct before proceeding.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <Button
                variant="secondary"
                onClick={() => setShowConfirmation(false)}
              >
                ← Go Back to Edit
              </Button>
              
              <Button
                variant="primary"
                onClick={confirmAndProceed}
              >
                ✓ Confirm & Proceed to Floor Configuration
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step2TowerWingDeclaration;