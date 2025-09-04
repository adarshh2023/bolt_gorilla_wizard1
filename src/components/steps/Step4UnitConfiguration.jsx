import React, { useState, useEffect } from 'react';
import { Home,Plus, Grid as Grid3X3, CheckSquare, Square, Copy, Settings, Users, MapPin, Zap, Filter } from 'lucide-react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import StepNavigation from '../wizard/StepNavigation';
import ValidationSummary from '../wizard/ValidationSummary';

const UNIT_TEMPLATES = {
  'Standard 1BHK': {
    type: '1BHK',
    carpetArea: 650,
    builtUpArea: 850,
    balconies: 1,
    balconyArea: 80,
    attachedWashrooms: 1,
    commonWashrooms: 0,
    facing: 'East',
    status: 'Available'
  },
  'Standard 2BHK': {
    type: '2BHK',
    carpetArea: 1100,
    builtUpArea: 1350,
    balconies: 2,
    balconyArea: 120,
    attachedWashrooms: 2,
    commonWashrooms: 1,
    facing: 'North',
    status: 'Available'
  },
  'Corner 2BHK': {
    type: '2BHK',
    carpetArea: 1250,
    builtUpArea: 1500,
    balconies: 2,
    balconyArea: 150,
    attachedWashrooms: 2,
    commonWashrooms: 1,
    facing: 'North-East',
    status: 'Available'
  },
  'Standard 3BHK': {
    type: '3BHK',
    carpetArea: 1450,
    builtUpArea: 1750,
    balconies: 3,
    balconyArea: 180,
    attachedWashrooms: 3,
    commonWashrooms: 1,
    facing: 'South',
    status: 'Available'
  },
  'Penthouse 4BHK': {
    type: '4BHK',
    carpetArea: 2200,
    builtUpArea: 2800,
    balconies: 4,
    balconyArea: 300,
    attachedWashrooms: 4,
    commonWashrooms: 1,
    facing: 'North',
    status: 'Available'
  },
  'Standard Office': {
    type: 'Office',
    carpetArea: 800,
    builtUpArea: 1000,
    balconies: 0,
    balconyArea: 0,
    attachedWashrooms: 1,
    commonWashrooms: 0,
    facing: 'North',
    status: 'Available',
    frontage: 20,
    monthlyRent: 45000,
    parkingSpaces: 2
  },
  'Retail Shop': {
    type: 'Retail',
    carpetArea: 600,
    builtUpArea: 750,
    balconies: 0,
    balconyArea: 0,
    attachedWashrooms: 1,
    commonWashrooms: 0,
    facing: 'Street',
    status: 'Available',
    frontage: 15,
    monthlyRent: 35000,
    parkingSpaces: 1
  }
};

const UNIT_TYPES = ['1BHK', '2BHK', '3BHK', '4BHK', 'Duplex', 'Penthouse', 'Studio', 'Office', 'Retail', 'Restaurant', 'Showroom'];
const FACING_OPTIONS = ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West', 'Street'];
const UNIT_STATUS = ['Available', 'Sold', 'Reserved', 'Blocked'];

const Step4UnitConfiguration = ({ 
  data, 
  onUpdate, 
  onNext,
  onPrevious,
  onSave
}) => {
  const [units, setUnits] = useState(data.units || {});
  const [selectedUnits, setSelectedUnits] = useState({});
  const [currentNavigation, setCurrentNavigation] = useState({
    towerIndex: 0,
    wingIndex: 0,
    floorType: 'Floors',
    floorNumber: 1
  });
  const [bulkConfig, setBulkConfig] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filterType, setFilterType] = useState('all');
  const [validationResult, setValidationResult] = useState({ isValid: true, errors: {}, warnings: [] });

  const towers = data.towers || [];
  const currentTower = towers[currentNavigation.towerIndex];
  const currentWing = currentTower?.wings[currentNavigation.wingIndex];

  // Generate floor navigation options
  const getFloorNavigationOptions = () => {
    if (!currentWing) return [];
    
    const options = [];
    Object.entries(currentWing.floorTypes).forEach(([floorType, config]) => {
      if (config.enabled && config.count > 0) {
        for (let i = 1; i <= config.count; i++) {
          options.push({
            floorType,
            floorNumber: i,
            label: `${floorType} ${i}`,
            key: `${floorType}-${i}`
          });
        }
      }
    });
    return options;
  };

  const getCurrentFloorKey = () => {
    return `${currentTower?.id}-${currentWing?.id}-${currentNavigation.floorType}-${currentNavigation.floorNumber}`;
  };

  const getCurrentFloorUnits = () => {
    const key = getCurrentFloorKey();
    return units[key] || [];
  };

  const generateUnitId = (unitIndex) => {
    const wingLetter = currentWing?.name.charAt(currentWing.name.length - 1) || 'A';
    const floorNumber = currentNavigation.floorNumber.toString().padStart(2, '0');
    const unitNumber = (unitIndex + 1).toString().padStart(2, '0');
    return `${wingLetter}-${floorNumber}${unitNumber}`;
  };

  const initializeFloorUnits = () => {
    const key = getCurrentFloorKey();
    if (!units[key]) {
      // Get units per floor from floor configuration
      const floorConfig = data.floorConfigurations?.[`${currentTower.id}-${currentWing.id}-${currentNavigation.floorType}`];
      const unitsPerFloor = floorConfig?.configs?.Apartments?.units || 4;
      
      const newUnits = [];
      for (let i = 0; i < unitsPerFloor; i++) {
        newUnits.push({
          id: generateUnitId(i),
          type: currentWing.type === 'Commercial' ? 'Office' : '2BHK',
          carpetArea: currentWing.type === 'Commercial' ? 800 : 1100,
          builtUpArea: currentWing.type === 'Commercial' ? 1000 : 1350,
          balconies: currentWing.type === 'Commercial' ? 0 : 2,
          balconyArea: currentWing.type === 'Commercial' ? 0 : 120,
          attachedWashrooms: currentWing.type === 'Commercial' ? 1 : 2,
          commonWashrooms: currentWing.type === 'Commercial' ? 0 : 1,
          facing: 'North',
          status: 'Available',
          ...(currentWing.type === 'Commercial' && {
            frontage: 20,
            monthlyRent: 45000,
            parkingSpaces: 2
          })
        });
      }
      
      setUnits(prev => ({
        ...prev,
        [key]: newUnits
      }));
    }
  };

  useEffect(() => {
    initializeFloorUnits();
  }, [currentNavigation, currentTower, currentWing]);

  const updateUnit = (unitIndex, updates) => {
    const key = getCurrentFloorKey();
    setUnits(prev => ({
      ...prev,
      [key]: prev[key].map((unit, index) => 
        index === unitIndex ? { ...unit, ...updates } : unit
      )
    }));
  };

  const toggleUnitSelection = (unitIndex) => {
    const key = getCurrentFloorKey();
    setSelectedUnits(prev => ({
      ...prev,
      [key]: prev[key]?.includes(unitIndex)
        ? prev[key].filter(index => index !== unitIndex)
        : [...(prev[key] || []), unitIndex]
    }));
  };

  const selectAllUnits = () => {
    const key = getCurrentFloorKey();
    const currentUnits = getCurrentFloorUnits();
    setSelectedUnits(prev => ({
      ...prev,
      [key]: currentUnits.map((_, index) => index)
    }));
  };

  const selectByPattern = (pattern) => {
    const key = getCurrentFloorKey();
    const currentUnits = getCurrentFloorUnits();
    let selectedIndexes = [];

    switch (pattern) {
      case 'corner':
        selectedIndexes = [0, currentUnits.length - 1].filter(i => i < currentUnits.length);
        break;
      case 'even':
        selectedIndexes = currentUnits.map((_, index) => index).filter(i => i % 2 === 1);
        break;
      case 'odd':
        selectedIndexes = currentUnits.map((_, index) => index).filter(i => i % 2 === 0);
        break;
      case 'first-half':
        selectedIndexes = currentUnits.slice(0, Math.ceil(currentUnits.length / 2)).map((_, index) => index);
        break;
      case 'second-half':
        selectedIndexes = currentUnits.slice(Math.ceil(currentUnits.length / 2)).map((_, index) => index + Math.ceil(currentUnits.length / 2));
        break;
      default:
        selectedIndexes = [];
    }

    setSelectedUnits(prev => ({
      ...prev,
      [key]: selectedIndexes
    }));
  };

  const clearSelection = () => {
    const key = getCurrentFloorKey();
    setSelectedUnits(prev => ({
      ...prev,
      [key]: []
    }));
  };

  const applyBulkConfiguration = () => {
    const key = getCurrentFloorKey();
    const selectedIndexes = selectedUnits[key] || [];
    
    if (selectedIndexes.length === 0 || Object.keys(bulkConfig).length === 0) return;

    setUnits(prev => ({
      ...prev,
      [key]: prev[key].map((unit, index) => 
        selectedIndexes.includes(index) ? { ...unit, ...bulkConfig } : unit
      )
    }));

    // Clear selection after applying
    clearSelection();
    setBulkConfig({});
  };

  const applyTemplate = (templateName) => {
    const key = getCurrentFloorKey();
    const selectedIndexes = selectedUnits[key] || [];
    const template = UNIT_TEMPLATES[templateName];
    
    if (selectedIndexes.length === 0 || !template) return;

    setUnits(prev => ({
      ...prev,
      [key]: prev[key].map((unit, index) => 
        selectedIndexes.includes(index) ? { ...unit, ...template } : unit
      )
    }));

    clearSelection();
    setSelectedTemplate('');
  };

  const addUnitsToFloor = (count) => {
    const key = getCurrentFloorKey();
    const currentUnits = getCurrentFloorUnits();
    const newUnits = [];
    
    for (let i = 0; i < count; i++) {
      newUnits.push({
        id: generateUnitId(currentUnits.length + i),
        type: currentWing.type === 'Commercial' ? 'Office' : '2BHK',
        carpetArea: currentWing.type === 'Commercial' ? 800 : 1100,
        builtUpArea: currentWing.type === 'Commercial' ? 1000 : 1350,
        balconies: currentWing.type === 'Commercial' ? 0 : 2,
        balconyArea: currentWing.type === 'Commercial' ? 0 : 120,
        attachedWashrooms: currentWing.type === 'Commercial' ? 1 : 2,
        commonWashrooms: currentWing.type === 'Commercial' ? 0 : 1,
        facing: 'North',
        status: 'Available',
        ...(currentWing.type === 'Commercial' && {
          frontage: 20,
          monthlyRent: 45000,
          parkingSpaces: 2
        })
      });
    }

    setUnits(prev => ({
      ...prev,
      [key]: [...currentUnits, ...newUnits]
    }));
  };

  const removeSelectedUnits = () => {
    const key = getCurrentFloorKey();
    const selectedIndexes = selectedUnits[key] || [];
    
    setUnits(prev => ({
      ...prev,
      [key]: prev[key].filter((_, index) => !selectedIndexes.includes(index))
    }));
    
    clearSelection();
  };

  const handleNext = () => {
    onUpdate({ units });
    onNext();
  };

  const handleSave = () => {
    onUpdate({ units });
    onSave?.({ units });
  };

  const currentUnits = getCurrentFloorUnits();
  const key = getCurrentFloorKey();
  const selectedIndexes = selectedUnits[key] || [];
  const floorOptions = getFloorNavigationOptions();

  const getUnitStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800 border-green-200';
      case 'Sold': return 'bg-red-100 text-red-800 border-red-200';
      case 'Reserved': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Blocked': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredUnits = currentUnits.filter(unit => {
    if (filterType === 'all') return true;
    if (filterType === 'residential') return ['1BHK', '2BHK', '3BHK', '4BHK', 'Duplex', 'Penthouse', 'Studio'].includes(unit.type);
    if (filterType === 'commercial') return ['Office', 'Retail', 'Restaurant', 'Showroom'].includes(unit.type);
    return unit.status === filterType;
  });

  return (
    <div className="space-y-8 animate-slide-up">
      <Card className="overflow-hidden">
        <Card.Header>
          <div className="flex items-center justify-between">
            <Card.Title icon={Home} gradient>Unit Configuration</Card.Title>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{currentUnits.length} Units</span>
              <span>{selectedIndexes.length} Selected</span>
            </div>
          </div>
          <Card.Subtitle>
            Configure individual units using bulk operations and templates. Select multiple units to apply the same configuration efficiently.
          </Card.Subtitle>
        </Card.Header>

        <Card.Content>
          {/* Navigation Controls */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-4">📍 Current Location</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                label="Tower"
                options={towers.map((tower, index) => ({
                  value: index,
                  label: tower.name || tower.customName || `Tower ${index + 1}`
                }))}
                value={currentNavigation.towerIndex}
                onChange={(e) => setCurrentNavigation(prev => ({
                  ...prev,
                  towerIndex: parseInt(e.target.value),
                  wingIndex: 0,
                  floorNumber: 1
                }))}
              />

              <Select
                label="Wing"
                options={currentTower?.wings.map((wing, index) => ({
                  value: index,
                  label: wing.name
                })) || []}
                value={currentNavigation.wingIndex}
                onChange={(e) => setCurrentNavigation(prev => ({
                  ...prev,
                  wingIndex: parseInt(e.target.value),
                  floorNumber: 1
                }))}
              />

              <Select
                label="Floor Type"
                options={Object.entries(currentWing?.floorTypes || {})
                  .filter(([_, config]) => config.enabled && config.count > 0)
                  .map(([floorType]) => ({ value: floorType, label: floorType }))}
                value={currentNavigation.floorType}
                onChange={(e) => setCurrentNavigation(prev => ({
                  ...prev,
                  floorType: e.target.value,
                  floorNumber: 1
                }))}
              />

              <Select
                label="Floor Number"
                options={Array.from({ length: currentWing?.floorTypes[currentNavigation.floorType]?.count || 1 }, (_, i) => ({
                  value: i + 1,
                  label: `Floor ${i + 1}`
                }))}
                value={currentNavigation.floorNumber}
                onChange={(e) => setCurrentNavigation(prev => ({
                  ...prev,
                  floorNumber: parseInt(e.target.value)
                }))}
              />
            </div>

            <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-semibold text-gray-800">
                    {currentTower?.name || currentTower?.customName} → {currentWing?.name} → {currentNavigation.floorType} {currentNavigation.floorNumber}
                  </h5>
                  <p className="text-sm text-gray-600">{currentWing?.type} Wing • {currentUnits.length} Units</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addUnitsToFloor(1)}
                    icon={Plus}
                  >
                    Add Unit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addUnitsToFloor(4)}
                  >
                    Add 4 Units
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Operations Panel */}
          <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
            <h4 className="font-bold text-purple-800 mb-4">🔧 Bulk Operations</h4>
            
            {/* Selection Controls */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-semibold text-gray-800">Unit Selection</h5>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    icon={viewMode === 'grid' ? Grid3X3 : Users}
                  >
                    {viewMode === 'grid' ? 'List View' : 'Grid View'}
                  </Button>
                  <Select
                    options={[
                      { value: 'all', label: 'All Units' },
                      { value: 'residential', label: 'Residential Only' },
                      { value: 'commercial', label: 'Commercial Only' },
                      { value: 'Available', label: 'Available Only' },
                      { value: 'Sold', label: 'Sold Only' }
                    ]}
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={selectAllUnits}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={() => selectByPattern('corner')}>
                  Corner Units
                </Button>
                <Button variant="outline" size="sm" onClick={() => selectByPattern('even')}>
                  Even Numbers
                </Button>
                <Button variant="outline" size="sm" onClick={() => selectByPattern('odd')}>
                  Odd Numbers
                </Button>
                <Button variant="outline" size="sm" onClick={() => selectByPattern('first-half')}>
                  First Half
                </Button>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear Selection
                </Button>
              </div>

              {selectedIndexes.length > 0 && (
                <div className="p-4 bg-white rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-800 font-medium mb-3">
                    {selectedIndexes.length} unit{selectedIndexes.length > 1 ? 's' : ''} selected: {' '}
                    {selectedIndexes.map(index => currentUnits[index]?.id).join(', ')}
                  </p>
                  
                  {/* Template Application */}
                  <div className="flex items-center space-x-4 mb-4">
                    <Select
                      placeholder="Apply Template"
                      options={Object.keys(UNIT_TEMPLATES).map(name => ({ value: name, label: name }))}
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => applyTemplate(selectedTemplate)}
                      disabled={!selectedTemplate}
                    >
                      Apply Template
                    </Button>
                  </div>

                  {/* Custom Bulk Configuration */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <Select
                      placeholder="Unit Type"
                      options={UNIT_TYPES}
                      value={bulkConfig.type || ''}
                      onChange={(e) => setBulkConfig(prev => ({ ...prev, type: e.target.value }))}
                    />
                    <Input
                      placeholder="Carpet Area"
                      type="number"
                      value={bulkConfig.carpetArea || ''}
                      onChange={(e) => setBulkConfig(prev => ({ ...prev, carpetArea: parseInt(e.target.value) || 0 }))}
                    />
                    <Select
                      placeholder="Facing"
                      options={FACING_OPTIONS}
                      value={bulkConfig.facing || ''}
                      onChange={(e) => setBulkConfig(prev => ({ ...prev, facing: e.target.value }))}
                    />
                    <Select
                      placeholder="Status"
                      options={UNIT_STATUS}
                      value={bulkConfig.status || ''}
                      onChange={(e) => setBulkConfig(prev => ({ ...prev, status: e.target.value }))}
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={applyBulkConfiguration}
                      disabled={Object.keys(bulkConfig).length === 0}
                    >
                      Apply to Selected Units
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={removeSelectedUnits}
                    >
                      Remove Selected Units
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Units Display */}
          <div className="space-y-6">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredUnits.map((unit, index) => {
                  const actualIndex = currentUnits.findIndex(u => u.id === unit.id);
                  const isSelected = selectedIndexes.includes(actualIndex);
                  
                  return (
                    <div
                      key={unit.id}
                      className={`
                        relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                        ${isSelected 
                          ? 'border-purple-400 bg-purple-50 shadow-lg transform scale-105' 
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                        }
                      `}
                      onClick={() => toggleUnitSelection(actualIndex)}
                    >
                      {/* Selection Checkbox */}
                      <div className="absolute top-2 right-2">
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-purple-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </div>

                      {/* Unit Info */}
                      <div className="text-center">
                        <div className="font-bold text-lg text-gray-800 mb-1">{unit.id}</div>
                        <div className={`
                          inline-block px-2 py-1 rounded-full text-xs font-medium border
                          ${getUnitStatusColor(unit.status)}
                        `}>
                          {unit.status}
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <div>{unit.type}</div>
                          <div>{unit.carpetArea} sq ft</div>
                          <div className="flex items-center justify-center mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            {unit.facing}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUnits.map((unit, index) => {
                  const actualIndex = currentUnits.findIndex(u => u.id === unit.id);
                  const isSelected = selectedIndexes.includes(actualIndex);
                  
                  return (
                    <div
                      key={unit.id}
                      className={`
                        flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-200
                        ${isSelected 
                          ? 'border-purple-400 bg-purple-50 shadow-md' 
                          : 'border-gray-200 bg-white hover:border-blue-300'
                        }
                      `}
                      onClick={() => toggleUnitSelection(actualIndex)}
                    >
                      <div className="mr-4">
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-purple-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-6 gap-4 items-center">
                        <div>
                          <div className="font-bold text-gray-800">{unit.id}</div>
                          <div className="text-sm text-gray-600">{unit.type}</div>
                        </div>
                        <div className="text-sm">
                          <div className="text-gray-800">{unit.carpetArea} sq ft</div>
                          <div className="text-gray-600">Carpet Area</div>
                        </div>
                        <div className="text-sm">
                          <div className="text-gray-800">{unit.balconies} balconies</div>
                          <div className="text-gray-600">{unit.balconyArea} sq ft</div>
                        </div>
                        <div className="text-sm">
                          <div className="text-gray-800">{unit.attachedWashrooms + unit.commonWashrooms} washrooms</div>
                          <div className="text-gray-600">{unit.attachedWashrooms}A + {unit.commonWashrooms}C</div>
                        </div>
                        <div className="text-sm">
                          <div className="text-gray-800">{unit.facing}</div>
                          <div className="text-gray-600">Facing</div>
                        </div>
                        <div>
                          <div className={`
                            inline-block px-3 py-1 rounded-full text-xs font-medium border
                            ${getUnitStatusColor(unit.status)}
                          `}>
                            {unit.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {currentUnits.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Units Configured</h4>
                <p className="text-gray-600 mb-6">Add units to this floor to get started</p>
                <Button
                  variant="primary"
                  onClick={() => addUnitsToFloor(4)}
                  icon={Plus}
                >
                  Add 4 Standard Units
                </Button>
              </div>
            )}
          </div>

          {/* Individual Unit Configuration (for selected unit) */}
          {selectedIndexes.length === 1 && (
            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <h4 className="font-bold text-green-800 mb-4">✏️ Edit Unit: {currentUnits[selectedIndexes[0]]?.id}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Select
                  label="Unit Type"
                  options={UNIT_TYPES}
                  value={currentUnits[selectedIndexes[0]]?.type || ''}
                  onChange={(e) => updateUnit(selectedIndexes[0], { type: e.target.value })}
                />
                
                <Input.Number
                  label="Carpet Area (sq ft)"
                  value={currentUnits[selectedIndexes[0]]?.carpetArea || 0}
                  onChange={(e) => updateUnit(selectedIndexes[0], { carpetArea: parseInt(e.target.value) || 0 })}
                  min={200}
                  max={5000}
                />
                
                <Input.Number
                  label="Built-up Area (sq ft)"
                  value={currentUnits[selectedIndexes[0]]?.builtUpArea || 0}
                  onChange={(e) => updateUnit(selectedIndexes[0], { builtUpArea: parseInt(e.target.value) || 0 })}
                  min={300}
                  max={6000}
                />
                
                <Input.Number
                  label="Balconies"
                  value={currentUnits[selectedIndexes[0]]?.balconies || 0}
                  onChange={(e) => updateUnit(selectedIndexes[0], { balconies: parseInt(e.target.value) || 0 })}
                  min={0}
                  max={5}
                />
                
                <Input.Number
                  label="Balcony Area (sq ft)"
                  value={currentUnits[selectedIndexes[0]]?.balconyArea || 0}
                  onChange={(e) => updateUnit(selectedIndexes[0], { balconyArea: parseInt(e.target.value) || 0 })}
                  min={0}
                  max={500}
                />
                
                <Select
                  label="Facing Direction"
                  options={FACING_OPTIONS}
                  value={currentUnits[selectedIndexes[0]]?.facing || ''}
                  onChange={(e) => updateUnit(selectedIndexes[0], { facing: e.target.value })}
                />
                
                <Input.Number
                  label="Attached Washrooms"
                  value={currentUnits[selectedIndexes[0]]?.attachedWashrooms || 0}
                  onChange={(e) => updateUnit(selectedIndexes[0], { attachedWashrooms: parseInt(e.target.value) || 0 })}
                  min={0}
                  max={5}
                />
                
                <Input.Number
                  label="Common Washrooms"
                  value={currentUnits[selectedIndexes[0]]?.commonWashrooms || 0}
                  onChange={(e) => updateUnit(selectedIndexes[0], { commonWashrooms: parseInt(e.target.value) || 0 })}
                  min={0}
                  max={3}
                />
                
                <Select
                  label="Unit Status"
                  options={UNIT_STATUS}
                  value={currentUnits[selectedIndexes[0]]?.status || ''}
                  onChange={(e) => updateUnit(selectedIndexes[0], { status: e.target.value })}
                />

                {/* Commercial specific fields */}
                {['Office', 'Retail', 'Restaurant', 'Showroom'].includes(currentUnits[selectedIndexes[0]]?.type) && (
                  <>
                    <Input.Number
                      label="Frontage (ft)"
                      value={currentUnits[selectedIndexes[0]]?.frontage || 0}
                      onChange={(e) => updateUnit(selectedIndexes[0], { frontage: parseInt(e.target.value) || 0 })}
                      min={0}
                      max={100}
                    />
                    
                    <Input.Number
                      label="Monthly Rent (₹)"
                      value={currentUnits[selectedIndexes[0]]?.monthlyRent || 0}
                      onChange={(e) => updateUnit(selectedIndexes[0], { monthlyRent: parseInt(e.target.value) || 0 })}
                      min={0}
                    />
                    
                    <Input.Number
                      label="Parking Spaces"
                      value={currentUnits[selectedIndexes[0]]?.parkingSpaces || 0}
                      onChange={(e) => updateUnit(selectedIndexes[0], { parkingSpaces: parseInt(e.target.value) || 0 })}
                      min={0}
                      max={10}
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {/* Floor Summary */}
          <div className="mt-8 p-6 bg-gradient-to-r from-gray-900 to-blue-900 text-white rounded-2xl">
            <h4 className="text-xl font-bold mb-4">📊 Floor Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-300">{currentUnits.length}</div>
                <div className="text-sm text-gray-300">Total Units</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-300">
                  {currentUnits.reduce((sum, unit) => sum + (unit.carpetArea || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-300">Total Carpet Area (sq ft)</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-300">
                  {currentUnits.filter(unit => unit.status === 'Available').length}
                </div>
                <div className="text-sm text-gray-300">Available Units</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-300">
                  {currentUnits.filter(unit => unit.status === 'Sold').length}
                </div>
                <div className="text-sm text-gray-300">Sold Units</div>
              </div>
            </div>

            {/* Unit Type Breakdown */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h5 className="font-bold mb-4">Unit Type Distribution</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {UNIT_TYPES.map(type => {
                  const count = currentUnits.filter(unit => unit.type === type).length;
                  if (count === 0) return null;
                  
                  return (
                    <div key={type} className="bg-white/10 p-3 rounded-lg">
                      <p className="font-semibold text-yellow-300">{type}</p>
                      <p className="text-2xl font-bold">{count}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card.Content>

        <StepNavigation
          onPrevious={onPrevious}
          onNext={handleNext}
          onSave={handleSave}
          isValid={validationResult.isValid}
          nextLabel="Next: Amenities"
          previousLabel="Back: Floor Configuration"
        />
      </Card>
    </div>
  );
};

export default Step4UnitConfiguration;