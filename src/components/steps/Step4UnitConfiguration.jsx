// Step4UnitConfiguration.jsx - Updated with chip display, selection-based apply, and drag-drop template builder
import React, { useState, useEffect } from 'react';
import { Home, Plus, Grid as Grid3X3, CheckSquare, Square, Copy, Settings, Users, MapPin, Zap, Filter, Save, Trash2 } from 'lucide-react';
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
    carpetArea: 650,
    builtUpArea: 850,
    balconies: 1,
    balconyArea: 80,
    attachedWashrooms: 1,
    commonWashrooms: 0,
    roomLayout: {
      id: 'root',
      name: 'Unit',
      type: 'unit',
      children: [
        {
          id: 'living',
          name: 'Living Room',
          type: 'living_room',
          area: 200,
          children: [
            { id: 'balcony1', name: 'Balcony', type: 'balcony', area: 80, children: [] }
          ]
        },
        {
          id: 'bedroom1',
          name: 'Master Bedroom',
          type: 'bedroom',
          area: 150,
          children: [
            { id: 'washroom1', name: 'Attached Washroom', type: 'washroom', area: 40, children: [] }
          ]
        },
        { id: 'kitchen', name: 'Kitchen', type: 'kitchen', area: 80, children: [] },
        { id: 'entrance', name: 'Entrance', type: 'entrance', area: 30, children: [] }
      ]
    }
  },
  'Standard 2BHK': {
    name: 'Standard 2BHK',
    type: '2BHK',
    carpetArea: 1100,
    builtUpArea: 1350,
    balconies: 2,
    balconyArea: 120,
    attachedWashrooms: 2,
    commonWashrooms: 1,
    roomLayout: {
      id: 'root',
      name: 'Unit',
      type: 'unit',
      children: [
        {
          id: 'living',
          name: 'Living Room',
          type: 'living_room',
          area: 250,
          children: [
            { id: 'balcony1', name: 'Living Balcony', type: 'balcony', area: 60, children: [] }
          ]
        },
        {
          id: 'bedroom1',
          name: 'Master Bedroom',
          type: 'bedroom',
          area: 180,
          children: [
            { id: 'washroom1', name: 'Attached Washroom', type: 'washroom', area: 45, children: [] },
            { id: 'balcony2', name: 'Bedroom Balcony', type: 'balcony', area: 60, children: [] }
          ]
        },
        {
          id: 'bedroom2',
          name: 'Bedroom 2',
          type: 'bedroom',
          area: 120,
          children: []
        },
        { id: 'kitchen', name: 'Kitchen', type: 'kitchen', area: 100, children: [] },
        { id: 'washroom2', name: 'Common Washroom', type: 'washroom', area: 35, children: [] },
        { id: 'entrance', name: 'Entrance', type: 'entrance', area: 40, children: [] }
      ]
    }
  },
  'Standard Office': {
    name: 'Standard Office',
    type: 'Office',
    carpetArea: 800,
    builtUpArea: 1000,
    balconies: 0,
    balconyArea: 0,
    attachedWashrooms: 1,
    commonWashrooms: 0,
    frontage: 20,
    monthlyRent: 45000,
    parkingSpaces: 2,
    roomLayout: {
      id: 'root',
      name: 'Office Unit',
      type: 'unit',
      children: [
        { id: 'reception', name: 'Reception Area', type: 'reception', area: 100, children: [] },
        { id: 'workspace', name: 'Open Workspace', type: 'workspace', area: 400, children: [] },
        { id: 'cabin1', name: 'Manager Cabin', type: 'cabin', area: 120, children: [] },
        { id: 'cabin2', name: 'Meeting Room', type: 'meeting_room', area: 100, children: [] },
        { id: 'washroom1', name: 'Washroom', type: 'washroom', area: 40, children: [] },
        { id: 'pantry', name: 'Pantry', type: 'pantry', area: 40, children: [] }
      ]
    }
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
  const [selectedUnits, setSelectedUnits] = useState({});
  const [currentNavigation, setCurrentNavigation] = useState({
    towerIndex: 0,
    wingIndex: 0,
    floorId: null
  });
  const [bulkConfig, setBulkConfig] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customTemplates, setCustomTemplates] = useState(data.customTemplates || {});
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [validationResult, setValidationResult] = useState({ isValid: true, errors: {}, warnings: [] });

  const towers = data.towers || [];
  const currentTower = towers[currentNavigation.towerIndex];
  const currentWing = currentTower?.wings[currentNavigation.wingIndex];

  // Get all individual floors for current wing
  const getIndividualFloors = () => {
    if (!currentWing) return [];
    
    const floors = [];
    Object.entries(currentWing.floorTypes).forEach(([floorType, config]) => {
      if (config.enabled && config.count > 0) {
        for (let i = 1; i <= config.count; i++) {
          const floorId = `${currentTower.id}-${currentWing.id}-${floorType}-${i}`;
          const floorConfig = data.floorConfigurations?.[floorId] || {};
          floors.push({
            id: floorId,
            type: floorType,
            number: i,
            displayName: `${floorType} ${i}`,
            unitsCount: floorConfig.unitsCount || 0,
            usages: floorConfig.usages || []
          });
        }
      }
    });
    return floors;
  };

  const individualFloors = getIndividualFloors();
  const currentFloor = individualFloors.find(f => f.id === currentNavigation.floorId) || individualFloors[0];

  const generateUnitId = (floorId, unitIndex) => {
    const wingLetter = currentWing?.name.charAt(currentWing.name.length - 1) || 'A';
    const floorNumber = currentFloor?.number?.toString().padStart(2, '0') || '01';
    const unitNumber = (unitIndex + 1).toString().padStart(2, '0');
    return `${wingLetter}-${floorNumber}${unitNumber}`;
  };

  const getCurrentFloorUnits = () => {
    if (!currentFloor) return [];
    return units[currentFloor.id] || [];
  };

  const initializeFloorUnits = () => {
    if (!currentFloor || units[currentFloor.id]) return;
    
    const newUnits = [];
    for (let i = 0; i < currentFloor.unitsCount; i++) {
      newUnits.push({
        id: generateUnitId(currentFloor.id, i),
        type: currentWing.type === 'Commercial' ? 'Office' : '2BHK',
        carpetArea: currentWing.type === 'Commercial' ? 800 : 1100,
        builtUpArea: currentWing.type === 'Commercial' ? 1000 : 1350,
        balconies: currentWing.type === 'Commercial' ? 0 : 2,
        balconyArea: currentWing.type === 'Commercial' ? 0 : 120,
        attachedWashrooms: currentWing.type === 'Commercial' ? 1 : 2,
        commonWashrooms: currentWing.type === 'Commercial' ? 0 : 1,
        roomLayout: null,
        ...(currentWing.type === 'Commercial' && {
          frontage: 20,
          monthlyRent: 45000,
          parkingSpaces: 2
        })
      });
    }
    
    setUnits(prev => ({
      ...prev,
      [currentFloor.id]: newUnits
    }));
  };

  useEffect(() => {
    if (currentFloor) {
      initializeFloorUnits();
    }
  }, [currentFloor]);

  useEffect(() => {
    if (individualFloors.length > 0 && !currentNavigation.floorId) {
      setCurrentNavigation(prev => ({
        ...prev,
        floorId: individualFloors[0].id
      }));
    }
  }, [individualFloors]);

  const updateUnit = (unitIndex, updates) => {
    if (!currentFloor) return;
    
    setUnits(prev => ({
      ...prev,
      [currentFloor.id]: prev[currentFloor.id].map((unit, index) => 
        index === unitIndex ? { ...unit, ...updates } : unit
      )
    }));
  };

  const toggleUnitSelection = (unitIndex) => {
    if (!currentFloor) return;
    
    setSelectedUnits(prev => ({
      ...prev,
      [currentFloor.id]: prev[currentFloor.id]?.includes(unitIndex)
        ? prev[currentFloor.id].filter(index => index !== unitIndex)
        : [...(prev[currentFloor.id] || []), unitIndex]
    }));
  };

  const selectAllUnits = () => {
    if (!currentFloor) return;
    
    const currentUnits = getCurrentFloorUnits();
    setSelectedUnits(prev => ({
      ...prev,
      [currentFloor.id]: currentUnits.map((_, index) => index)
    }));
  };

  const clearSelection = () => {
    if (!currentFloor) return;
    
    setSelectedUnits(prev => ({
      ...prev,
      [currentFloor.id]: []
    }));
  };

  const applyConfigurationToSelected = () => {
    if (!currentFloor) return;
    
    const selectedIndexes = selectedUnits[currentFloor.id] || [];
    if (selectedIndexes.length === 0 || Object.keys(bulkConfig).length === 0) return;

    setUnits(prev => ({
      ...prev,
      [currentFloor.id]: prev[currentFloor.id].map((unit, index) => 
        selectedIndexes.includes(index) ? { ...unit, ...bulkConfig } : unit
      )
    }));

    clearSelection();
    setBulkConfig({});
  };

  const applyTemplateToSelected = (templateData) => {
    if (!currentFloor) return;
    
    const selectedIndexes = selectedUnits[currentFloor.id] || [];
    if (selectedIndexes.length === 0) return;

    setUnits(prev => ({
      ...prev,
      [currentFloor.id]: prev[currentFloor.id].map((unit, index) => 
        selectedIndexes.includes(index) ? { ...unit, ...templateData } : unit
      )
    }));

    clearSelection();
  };

  const saveCustomTemplate = (templateData) => {
    const templateName = templateData.name || `Custom Template ${Object.keys(customTemplates).length + 1}`;
    setCustomTemplates(prev => ({
      ...prev,
      [templateName]: templateData
    }));
  };

  const handleNext = () => {
    onUpdate({ units, customTemplates });
    onNext();
  };

  const handleSave = () => {
    onUpdate({ units, customTemplates });
    onSave?.({ units, customTemplates });
  };

  const currentUnits = getCurrentFloorUnits();
  const selectedIndexes = selectedUnits[currentFloor?.id] || [];
  const allTemplates = { ...PREDEFINED_TEMPLATES, ...customTemplates };

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

  return (
    <div className="space-y-8 animate-slide-up">
      <Card className="overflow-hidden">
        <Card.Header>
          <div className="flex items-center justify-between">
            <Card.Title icon={Home} gradient>Unit Configuration</Card.Title>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{currentUnits.length} Units</span>
              <span>{selectedIndexes.length} Selected</span>
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
            Configure individual units for each floor. Select multiple units to apply configurations efficiently using templates or custom settings.
          </Card.Subtitle>
        </Card.Header>

        <Card.Content>
          {/* Navigation Controls */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-4">📍 Navigation</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  floorId: null
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
                  floorId: null
                }))}
              />

              <Select
                label="Floor"
                options={individualFloors.map(floor => ({
                  value: floor.id,
                  label: floor.displayName
                }))}
                value={currentNavigation.floorId || ''}
                onChange={(e) => setCurrentNavigation(prev => ({
                  ...prev,
                  floorId: e.target.value
                }))}
              />
            </div>

            {currentFloor && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-gray-800">
                      {currentTower.name || currentTower.customName} → {currentWing.name} → {currentFloor.displayName}
                    </h5>
                    <p className="text-sm text-gray-600">
                      {currentWing.type} Wing • {currentFloor.usages.join(', ') || 'No usage defined'} • {currentUnits.length} Units
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newUnits = [];
                        for (let i = 0; i < 4; i++) {
                          newUnits.push({
                            id: generateUnitId(currentFloor.id, currentUnits.length + i),
                            type: currentWing.type === 'Commercial' ? 'Office' : '2BHK',
                            carpetArea: currentWing.type === 'Commercial' ? 800 : 1100,
                            builtUpArea: currentWing.type === 'Commercial' ? 1000 : 1350,
                            balconies: currentWing.type === 'Commercial' ? 0 : 2,
                            balconyArea: currentWing.type === 'Commercial' ? 0 : 120,
                            attachedWashrooms: currentWing.type === 'Commercial' ? 1 : 2,
                            commonWashrooms: currentWing.type === 'Commercial' ? 0 : 1,
                            roomLayout: null,
                            ...(currentWing.type === 'Commercial' && {
                              frontage: 20,
                              monthlyRent: 45000,
                              parkingSpaces: 2
                            })
                          });
                        }
                        setUnits(prev => ({
                          ...prev,
                          [currentFloor.id]: [...currentUnits, ...newUnits]
                        }));
                      }}
                      icon={Plus}
                    >
                      Add 4 Units
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Selection and Bulk Operations */}
          {currentUnits.length > 0 && (
            <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <h4 className="font-bold text-purple-800 mb-4">🔧 Unit Selection & Configuration</h4>
              
              {/* Selection Controls */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-semibold text-gray-800">Select Units</h5>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={selectAllUnits}>
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearSelection}>
                      Clear Selection
                    </Button>
                  </div>
                </div>

                {selectedIndexes.length > 0 && (
                  <div className="p-4 bg-white rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-800 font-medium mb-4">
                      {selectedIndexes.length} unit{selectedIndexes.length > 1 ? 's' : ''} selected: {' '}
                      {selectedIndexes.map(index => currentUnits[index]?.id).join(', ')}
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
                            onClick={() => {
                              const firstSelectedUnit = currentUnits[selectedIndexes[0]];
                              if (firstSelectedUnit) {
                                applyTemplateToSelected(firstSelectedUnit);
                              }
                            }}
                            disabled={selectedIndexes.length === 0}
                          >
                            Copy First Selected
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              setUnits(prev => ({
                                ...prev,
                                [currentFloor.id]: prev[currentFloor.id].filter((_, index) => !selectedIndexes.includes(index))
                              }));
                              clearSelection();
                            }}
                            disabled={selectedIndexes.length === 0}
                          >
                            Remove Selected
                          </Button>
                        </div>
                      </div>
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
                      <Input
                        placeholder="Built-up Area"
                        type="number"
                        value={bulkConfig.builtUpArea || ''}
                        onChange={(e) => setBulkConfig(prev => ({ ...prev, builtUpArea: parseInt(e.target.value) || 0 }))}
                      />
                      <Input
                        placeholder="Balconies"
                        type="number"
                        value={bulkConfig.balconies || ''}
                        onChange={(e) => setBulkConfig(prev => ({ ...prev, balconies: parseInt(e.target.value) || 0 }))}
                      />
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={applyConfigurationToSelected}
                      disabled={Object.keys(bulkConfig).length === 0}
                    >
                      Apply Configuration to Selected Units
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Units Display as Chips */}
          <div className="space-y-6">
            {currentUnits.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Units on This Floor</h4>
                <p className="text-gray-600 mb-6">
                  {currentFloor ? `${currentFloor.displayName} has ${currentFloor.unitsCount} units configured in Step 3` : 'Select a floor to configure units'}
                </p>
                {currentFloor && currentFloor.unitsCount > 0 && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      const newUnits = [];
                      for (let i = 0; i < currentFloor.unitsCount; i++) {
                        newUnits.push({
                          id: generateUnitId(currentFloor.id, i),
                          type: currentWing.type === 'Commercial' ? 'Office' : '2BHK',
                          carpetArea: currentWing.type === 'Commercial' ? 800 : 1100,
                          builtUpArea: currentWing.type === 'Commercial' ? 1000 : 1350,
                          balconies: currentWing.type === 'Commercial' ? 0 : 2,
                          balconyArea: currentWing.type === 'Commercial' ? 0 : 120,
                          attachedWashrooms: currentWing.type === 'Commercial' ? 1 : 2,
                          commonWashrooms: currentWing.type === 'Commercial' ? 0 : 1,
                          roomLayout: null,
                          ...(currentWing.type === 'Commercial' && {
                            frontage: 20,
                            monthlyRent: 45000,
                            parkingSpaces: 2
                          })
                        });
                      }
                      setUnits(prev => ({
                        ...prev,
                        [currentFloor.id]: newUnits
                      }));
                    }}
                    icon={Plus}
                  >
                    Initialize {currentFloor.unitsCount} Units
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {currentUnits.map((unit, index) => {
                  const isSelected = selectedIndexes.includes(index);
                  
                  return (
                    <div
                      key={unit.id}
                      className={`
                        relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group
                        ${isSelected 
                          ? 'border-purple-400 bg-purple-50 shadow-lg transform scale-105' 
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md hover:scale-102'
                        }
                      `}
                      onClick={() => toggleUnitSelection(index)}
                    >
                      {/* Selection Indicator */}
                      <div className="absolute top-2 right-2">
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-purple-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
                        )}
                      </div>

                      {/* Unit Info Chip */}
                      <div className="text-center">
                        <div className="font-bold text-lg text-gray-800 mb-2">{unit.id}</div>
                        
                        <div className={`
                          inline-block px-3 py-1 rounded-full text-xs font-medium border mb-3
                          ${unit.type === 'Office' || unit.type === 'Retail' 
                            ? 'bg-orange-100 text-orange-800 border-orange-200'
                            : 'bg-blue-100 text-blue-800 border-blue-200'
                          }
                        `}>
                          {unit.type}
                        </div>
                        
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="font-medium">{unit.carpetArea} sq ft</div>
                          <div>{unit.balconies} balconies</div>
                          <div>{unit.attachedWashrooms + unit.commonWashrooms} washrooms</div>
                          {unit.roomLayout && (
                            <div className="text-green-600 font-medium">✓ Layout Designed</div>
                          )}
                        </div>
                      </div>

                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Open individual unit editor
                          }}
                          className="bg-white/90 hover:bg-white"
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Individual Unit Configuration (for single selection) */}
          {selectedIndexes.length === 1 && (
            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <h4 className="font-bold text-green-800 mb-4">✏️ Edit Unit: {currentUnits[selectedIndexes[0]]?.id}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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

              {/* Room Layout Designer */}
              <div className="mt-6 pt-6 border-t border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-semibold text-green-800">🏠 Room Layout Design</h5>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTemplateBuilder(true)}
                    icon={Settings}
                  >
                    Design Layout
                  </Button>
                </div>
                
                {currentUnits[selectedIndexes[0]]?.roomLayout ? (
                  <div className="p-4 bg-white rounded-lg border border-green-200">
                    <p className="text-sm text-green-700 font-medium">✓ Custom layout designed</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {currentUnits[selectedIndexes[0]].roomLayout.children?.length || 0} rooms configured
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">No custom layout designed</p>
                    <p className="text-xs text-gray-500 mt-1">Using default layout based on unit type</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Floor Summary */}
          {currentFloor && (
            <div className="mt-8 p-6 bg-gradient-to-r from-gray-900 to-blue-900 text-white rounded-2xl">
              <h4 className="text-xl font-bold mb-4">📊 {currentFloor.displayName} Summary</h4>
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
                    {currentUnits.filter(unit => unit.roomLayout).length}
                  </div>
                  <div className="text-sm text-gray-300">Custom Layouts</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-300">
                    {currentUnits.reduce((sum, unit) => sum + (unit.attachedWashrooms || 0) + (unit.commonWashrooms || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-300">Total Washrooms</div>
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
          )}
        </Card.Content>

        <StepNavigation
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSave={handleSave}
          isValid={validationResult.isValid}
          nextLabel={isLastWing() ? "Next: Amenities" : "Next Wing"}
          previousLabel={currentTowerIndex === 0 && currentWingIndex === 0 ? "Back: Floor Configuration" : "Previous Wing"}
        />
      </Card>

      {/* Template Builder Modal */}
      {showTemplateBuilder && (
        <TemplateBuilder
          onClose={() => setShowTemplateBuilder(false)}
          onSave={saveCustomTemplate}
          existingTemplates={customTemplates}
          selectedUnit={selectedIndexes.length === 1 ? currentUnits[selectedIndexes[0]] : null}
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