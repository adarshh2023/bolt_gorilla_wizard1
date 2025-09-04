// Step3FloorConfiguration.jsx - Configure floors for each tower and wing
import React, { useState, useEffect } from 'react';
import { Building2, Layers, Car, Users, ChevronDown, ChevronRight, Settings } from 'lucide-react';
import { USAGE_TYPES, FLOOR_TYPES } from '../../utils/constants';

const Step3FloorConfiguration = ({ 
  data, 
  onUpdate, 
  onNext,
  onPrevious,
  onSave
}) => {
  const [currentTowerIndex, setCurrentTowerIndex] = useState(0);
  const [currentWingIndex, setCurrentWingIndex] = useState(0);
  const [floorConfigurations, setFloorConfigurations] = useState(data.floorConfigurations || {});
  const [expandedFloorTypes, setExpandedFloorTypes] = useState({});
  const [errors, setErrors] = useState({});

  const towers = data.towers || [];
  const currentTower = towers[currentTowerIndex];
  const currentWing = currentTower?.wings[currentWingIndex];

  // Navigation helpers
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

  const getFloorConfigKey = (floorType) => {
    return `${currentTower.id}-${currentWing.id}-${floorType}`;
  };

  const getFloorConfig = (floorType) => {
    const key = getFloorConfigKey(floorType);
    return floorConfigurations[key] || getDefaultFloorConfig(floorType);
  };

  const updateFloorConfig = (floorType, config) => {
    const key = getFloorConfigKey(floorType);
    setFloorConfigurations(prev => ({
      ...prev,
      [key]: { ...getFloorConfig(floorType), ...config }
    }));
  };

  const getDefaultFloorConfig = (floorType) => {
    const defaults = {
      B1: {
        usage: 'Parking',
        customUsage: '',
        carParkingSpaces: 80,
        openParkingSpaces: 23,
        features: [],
        accessibility: true,
        ventilation: 'Mechanical'
      },
      Podium: {
        usage: 'Amenities',
        customUsage: '',
        features: ['Swimming Pool', 'Gym'],
        openArea: true,
        landscaping: false,
        capacity: 100
      },
      Ground: {
        usage: 'Lobby',
        customUsage: '',
        features: ['Reception', 'Security'],
        retailSpaces: 0,
        commercialType: 'Retail'
      },
      Floors: {
        type: currentWing?.type === 'Commercial' ? 'Commercial' : 'Residential',
        commercialUsage: 'Office',
        residentialUsage: 'Apartments',
        unitsPerFloor: 4,
        commonAreaPerFloor: 200
      },
      Terrace: {
        usage: 'Amenities',
        customUsage: '',
        features: ['Garden', 'Recreation'],
        openSpace: true,
        eventSpace: false
      }
    };
    
    return defaults[floorType] || {};
  };

  const toggleFloorType = (floorType) => {
    setExpandedFloorTypes(prev => ({
      ...prev,
      [`${currentTower.id}-${currentWing.id}-${floorType}`]: !prev[`${currentTower.id}-${currentWing.id}-${floorType}`]
    }));
  };

  const isFloorTypeExpanded = (floorType) => {
    return expandedFloorTypes[`${currentTower.id}-${currentWing.id}-${floorType}`] || false;
  };

  const validateCurrentWing = () => {
    // Add validation logic here
    return true;
  };

  const handleNext = () => {
    if (validateCurrentWing()) {
      if (isLastWing()) {
        onUpdate({ floorConfigurations });
        onNext();
      } else {
        goToNextWing();
      }
    }
  };

  const handlePrevious = () => {
    if (currentTowerIndex === 0 && currentWingIndex === 0) {
      onPrevious();
    } else {
      goToPrevWing();
    }
  };

  const renderFloorTypeConfig = (floorType, floorTypeData) => {
    if (!floorTypeData.enabled || floorTypeData.count === 0) return null;

    const config = getFloorConfig(floorType);
    const isExpanded = isFloorTypeExpanded(floorType);

    return (
      <div key={floorType} className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Floor Type Header */}
        <button
          onClick={() => toggleFloorType(floorType)}
          className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left"
        >
          <div className="flex items-center space-x-4">
            <Layers className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-gray-900">{floorType}</h4>
              <p className="text-sm text-gray-600">{floorTypeData.count} floor{floorTypeData.count > 1 ? 's' : ''}</p>
            </div>
          </div>
          {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
        </button>

        {/* Floor Type Configuration */}
        {isExpanded && (
          <div className="p-6 space-y-6">
            {floorType === 'B1' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Usage</label>
                    <select
                      value={config.usage}
                      onChange={(e) => updateFloorConfig(floorType, { usage: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {USAGE_TYPES.basement.map(usage => (
                        <option key={usage} value={usage}>{usage}</option>
                      ))}
                    </select>
                  </div>
                  {config.usage === 'Custom' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Custom Usage</label>
                      <input
                        type="text"
                        value={config.customUsage}
                        onChange={(e) => updateFloorConfig(floorType, { customUsage: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe custom usage"
                      />
                    </div>
                  )}
                </div>

                {config.usage === 'Parking' && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-3 flex items-center">
                      <Car className="w-4 h-4 mr-2" />
                      Parking Configuration
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-2">Covered Parking Spaces</label>
                        <input
                          type="number"
                          min="0"
                          value={config.carParkingSpaces}
                          onChange={(e) => updateFloorConfig(floorType, { carParkingSpaces: parseInt(e.target.value) || 0 })}
                          className="w-full p-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-2">Open Parking Spaces</label>
                        <input
                          type="number"
                          min="0"
                          value={config.openParkingSpaces}
                          onChange={(e) => updateFloorConfig(floorType, { openParkingSpaces: parseInt(e.target.value) || 0 })}
                          className="w-full p-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-blue-700">
                      Total parking capacity: <strong>{(config.carParkingSpaces || 0) + (config.openParkingSpaces || 0)} vehicles</strong>
                    </div>
                  </div>
                )}
              </>
            )}

            {floorType === 'Ground' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Usage</label>
                    <select
                      value={config.usage}
                      onChange={(e) => updateFloorConfig(floorType, { usage: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {USAGE_TYPES.ground.map(usage => (
                        <option key={usage} value={usage}>{usage}</option>
                      ))}
                    </select>
                  </div>

                  {(config.usage === 'Retail' || config.usage === 'Mixed') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Number of Retail Spaces</label>
                      <input
                        type="number"
                        min="0"
                        value={config.retailSpaces}
                        onChange={(e) => updateFloorConfig(floorType, { retailSpaces: parseInt(e.target.value) || 0 })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            {floorType === 'Floors' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Floor Type</label>
                    <select
                      value={config.type}
                      onChange={(e) => updateFloorConfig(floorType, { type: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Commercial">Commercial</option>
                      <option value="Residential">Residential</option>
                    </select>
                  </div>

                  {config.type === 'Commercial' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Commercial Usage</label>
                      <select
                        value={config.commercialUsage}
                        onChange={(e) => updateFloorConfig(floorType, { commercialUsage: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {FLOOR_TYPES.commercial.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {config.type === 'Residential' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Residential Usage</label>
                      <select
                        value={config.residentialUsage}
                        onChange={(e) => updateFloorConfig(floorType, { residentialUsage: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {FLOOR_TYPES.residential.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Units per Floor</label>
                    <input
                      type="number"
                      min="1"
                      value={config.unitsPerFloor}
                      onChange={(e) => updateFloorConfig(floorType, { unitsPerFloor: parseInt(e.target.value) || 1 })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Common Area (sq ft)</label>
                    <input
                      type="number"
                      min="0"
                      value={config.commonAreaPerFloor}
                      onChange={(e) => updateFloorConfig(floorType, { commonAreaPerFloor: parseInt(e.target.value) || 0 })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </>
            )}

            {floorType === 'Podium' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Usage</label>
                    <select
                      value={config.usage}
                      onChange={(e) => updateFloorConfig(floorType, { usage: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {USAGE_TYPES.podium.map(usage => (
                        <option key={usage} value={usage}>{usage}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                    <input
                      type="number"
                      min="0"
                      value={config.capacity}
                      onChange={(e) => updateFloorConfig(floorType, { capacity: parseInt(e.target.value) || 0 })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Person capacity"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.openArea}
                      onChange={(e) => updateFloorConfig(floorType, { openArea: e.target.checked })}
                      className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Open Space</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.eventSpace}
                      onChange={(e) => updateFloorConfig(floorType, { eventSpace: e.target.checked })}
                      className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Event Space</span>
                  </label>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const getProgressInfo = () => {
    let totalWings = 0;
    let currentPosition = 0;
    let found = false;

    towers.forEach((tower, tIndex) => {
      tower.wings.forEach((wing, wIndex) => {
        if (tIndex === currentTowerIndex && wIndex === currentWingIndex) {
          currentPosition = totalWings;
          found = true;
        }
        totalWings++;
      });
    });

    return { currentPosition: currentPosition + 1, totalWings };
  };

  if (!currentTower || !currentWing) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No towers configured</h3>
        <p className="text-gray-600">Please go back and configure towers and wings first.</p>
        <button
          onClick={onPrevious}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  const { currentPosition, totalWings } = getProgressInfo();

  return (
    <div className="space-y-8">
      {/* Progress Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Floor Configuration</h3>
            <p className="text-gray-600">Configure detailed floor settings for each wing</p>
          </div>
          <div className="text-sm text-gray-500">
            Wing {currentPosition} of {totalWings}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentPosition / totalWings) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Wing Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-lg font-bold">
            {String.fromCharCode(65 + currentWingIndex)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {currentTower.name || currentTower.customName} - {currentWing.name}
            </h2>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                {currentWing.type} Wing
              </span>
              <span className="flex items-center">
                <Layers className="w-4 h-4 mr-1" />
                {Object.values(currentWing.floorTypes).reduce((total, ft) => total + (ft.enabled ? ft.count : 0), 0)} Floors
              </span>
              <span className="flex items-center">
                <Settings className="w-4 h-4 mr-1" />
                {currentWing.lifts} Lifts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floor Types Configuration */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Configure Floor Types</h4>
        
        {Object.entries(currentWing.floorTypes).map(([floorType, floorTypeData]) => 
          renderFloorTypeConfig(floorType, floorTypeData)
        )}
        
        {/* Show message if no floor types are enabled */}
        {!Object.values(currentWing.floorTypes).some(ft => ft.enabled && ft.count > 0) && (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No floor types are enabled for this wing</p>
            <p className="text-sm text-gray-500 mt-2">Go back to tower configuration to enable floor types</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          onClick={handlePrevious}
          className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          <span>← {currentTowerIndex === 0 && currentWingIndex === 0 ? 'Previous Step' : 'Previous Wing'}</span>
        </button>
        
        <div className="flex items-center space-x-4">
          {/* Wing navigation info */}
          <div className="text-sm text-gray-600">
            {isLastWing() ? (
              <span>Ready to proceed to unit configuration</span>
            ) : (
              <span>
                Next: {hasNextWing() 
                  ? `${currentWing.name} → ${currentTower.wings[currentWingIndex + 1].name}` 
                  : `${currentTower.name || currentTower.customName} → ${towers[currentTowerIndex + 1].name || towers[currentTowerIndex + 1].customName}`
                }
              </span>
            )}
          </div>
          
          <button
            onClick={handleNext}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <span>{isLastWing() ? 'Next: Unit Configuration' : 'Next Wing'} →</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step3FloorConfiguration;