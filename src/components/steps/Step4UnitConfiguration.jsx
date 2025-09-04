// Step4UnitConfiguration.jsx - Complete redesign with tab-based interface and template system
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
    roomLayout: {
      id: 'root',
      name: 'Unit',
      type: 'unit',
      children: [
        { id: 'living', name: 'Living Room', type: 'living_room', children: [
          { id: 'balcony1', name: 'Balcony', type: 'balcony', children: [] }
        ]},
        { id: 'bedroom1', name: 'Master Bedroom', type: 'bedroom', children: [
          { id: 'washroom1', name: 'Attached Washroom', type: 'washroom', children: [] }
        ]},
        { id: 'kitchen', name: 'Kitchen', type: 'kitchen', children: [] },
        { id: 'entrance', name: 'Entrance', type: 'entrance', children: [] }
      ]
    }
  },
  'Standard 2BHK': {
    name: 'Standard 2BHK',
    type: '2BHK',
    balconies: 2,
    attachedWashrooms: 2,
    commonWashrooms: 1,
    roomLayout: {
      id: 'root',
      name: 'Unit',
      type: 'unit',
      children: [
        { id: 'living', name: 'Living Room', type: 'living_room', children: [
          { id: 'balcony1', name: 'Living Balcony', type: 'balcony', children: [] }
        ]},
        { id: 'bedroom1', name: 'Master Bedroom', type: 'bedroom', children: [
          { id: 'washroom1', name: 'Attached Washroom', type: 'washroom', children: [] },
          { id: 'balcony2', name: 'Bedroom Balcony', type: 'balcony', children: [] }
        ]},
        { id: 'bedroom2', name: 'Bedroom 2', type: 'bedroom', children: [] },
        { id: 'kitchen', name: 'Kitchen', type: 'kitchen', children: [] },
        { id: 'washroom2', name: 'Common Washroom', type: 'washroom', children: [] },
        { id: 'entrance', name: 'Entrance', type: 'entrance', children: [] }
      ]
    }
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
    roomLayout: {
      id: 'root',
      name: 'Office Unit',
      type: 'unit',
      children: [
        { id: 'reception', name: 'Reception Area', type: 'reception', children: [] },
        { id: 'workspace', name: 'Open Workspace', type: 'workspace', children: [] },
        { id: 'cabin1', name: 'Manager Cabin', type: 'cabin', children: [] },
        { id: 'cabin2', name: 'Meeting Room', type: 'meeting_room', children: [] },
        { id: 'washroom1', name: 'Washroom', type: 'washroom', children: [] },
        { id: 'pantry', name: 'Pantry', type: 'pantry', children: [] }
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
  const [currentTowerIndex, setCurrentTowerIndex] = useState(0);
  const [currentWingIndex, setCurrentWingIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('floors');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customTemplates, setCustomTemplates] = useState(data.customTemplates || {});
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [validationResult, setValidationResult] = useState({ isValid: true, errors: {}, warnings: [] });

  const towers = data.towers || [];
  const currentTower = towers[currentTowerIndex];
  const currentWing = currentTower?.wings[currentWingIndex];

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

  const generateUnitId = (floorId, unitIndex) => {
    const wingLetter = currentWing?.name.charAt(currentWing.name.length - 1) || 'A';
    const floorInfo = individualFloors.find(f => f.id === floorId);
    const floorNumber = floorInfo?.number?.toString().padStart(2, '0') || '01';
    const unitNumber = (unitIndex + 1).toString().padStart(2, '0');
    return `${wingLetter}-${floorNumber}${unitNumber}`;
  };

  const getFloorUnits = (floorId) => {
    return units[floorId] || [];
  };

  const addUnitsToFloor = (floorId, count = 1) => {
    const currentUnits = getFloorUnits(floorId);
    const newUnits = [];
    
    for (let i = 0; i < count; i++) {
      newUnits.push({
        id: generateUnitId(floorId, currentUnits.length + i),
        type: currentWing.type === 'Commercial' ? 'Office' : '2BHK',
        balconies: currentWing.type === 'Commercial' ? 0 : 2,
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

  const toggleUnitSelection = (floorId, unitIndex) => {
    setSelectedUnits(prev => ({
      ...prev,
      [floorId]: prev[floorId]?.includes(unitIndex)
        ? prev[floorId].filter(index => index !== unitIndex)
        : [...(prev[floorId] || []), unitIndex]
    }));
  };

  const selectAllUnitsInFloor = (floorId) => {
    const floorUnits = getFloorUnits(floorId);
    setSelectedUnits(prev => ({
      ...prev,
      [floorId]: floorUnits.map((_, index) => index)
    }));
  };

  const clearFloorSelection = (floorId) => {
    setSelectedUnits(prev => ({
      ...prev,
      [floorId]: []
    }));
  };

  const applyTemplateToSelected = (templateData) => {
    Object.entries(selectedUnits).forEach(([floorId, unitIndexes]) => {
      if (unitIndexes.length > 0) {
        setUnits(prev => ({
          ...prev,
          [floorId]: prev[floorId].map((unit, index) => 
            unitIndexes.includes(index) ? { ...unit, ...templateData } : unit
          )
        }));
      }
    });
    
    setSelectedUnits({});
  };

  const saveCustomTemplate = (templateData) => {
    const templateName = templateData.name || `Custom Template ${Object.keys(customTemplates).length + 1}`;
    setCustomTemplates(prev => ({
      ...prev,
      [templateName]: templateData
    }));
  };

  const removeSelectedUnits = () => {
    Object.entries(selectedUnits).forEach(([floorId, unitIndexes]) => {
      if (unitIndexes.length > 0) {
        setUnits(prev => ({
          ...prev,
          [floorId]: prev[floorId].filter((_, index) => !unitIndexes.includes(index))
        }));
      }
    });
    setSelectedUnits({});
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
  const totalSelectedUnits = Object.values(selectedUnits).reduce((sum, unitIndexes) => sum + unitIndexes.length, 0);

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
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{totalSelectedUnits} Selected</span>
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
            Configure units for each floor. Use the tab interface to navigate between towers and wings, then select units to apply templates or configurations.
          </Card.Subtitle>
        </Card.Header>

        <Card.Content>
          {/* Tower and Wing Navigation */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-4">🏗️ Project Navigation</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Tower"
                options={towers.map((tower, index) => ({
                  value: index,
                  label: tower.name || tower.customName || `Tower ${index + 1}`
                }))}
                value={currentTowerIndex}
                onChange={(e) => {
                  setCurrentTowerIndex(parseInt(e.target.value));
                  setCurrentWingIndex(0);
                  setSelectedUnits({});
                }}
              />

              <Select
                label="Wing"
                options={currentTower?.wings.map((wing, index) => ({
                  value: index,
                  label: wing.name
                })) || []}
                value={currentWingIndex}
                onChange={(e) => {
                  setCurrentWingIndex(parseInt(e.target.value));
                  setSelectedUnits({});
                }}
              />
            </div>

            <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-semibold text-gray-800">
                    {currentTower.name || currentTower.customName} → {currentWing.name}
                  </h5>
                  <p className="text-sm text-gray-600">
                    {currentWing.type} Wing • {individualFloors.length} Floors
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Selection and Template Controls */}
          {totalSelectedUnits > 0 && (
            <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <h4 className="font-bold text-purple-800 mb-4">🔧 Selected Units Configuration</h4>
              
              <div className="p-4 bg-white rounded-lg border border-purple-200">
                <p className="text-sm text-purple-800 font-medium mb-4">
                  {totalSelectedUnits} unit{totalSelectedUnits > 1 ? 's' : ''} selected across floors
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

          {/* Floor Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {individualFloors.map((floor) => {
                  const floorUnits = getFloorUnits(floor.id);
                  const selectedCount = selectedUnits[floor.id]?.length || 0;
                  
                  return (
                    <button
                      key={floor.id}
                      onClick={() => setActiveTab(floor.id)}
                      className={`
                        whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-all duration-200
                        ${activeTab === floor.id
                          ? 'border-blue-500 text-blue-600 bg-blue-50'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`
                          w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white
                          ${floor.type === 'Basement' ? 'bg-gray-600' :
                            floor.type === 'Ground' ? 'bg-green-500' :
                            floor.type === 'Podium' ? 'bg-purple-500' :
                            floor.type === 'Floors' ? 'bg-blue-500' :
                            'bg-orange-500'}
                        `}>
                          {floor.type === 'Basement' ? 'B' + floor.number :
                           floor.type === 'Ground' ? 'G' :
                           floor.type === 'Podium' ? 'P' + floor.number :
                           floor.type === 'Terrace' ? 'T' + floor.number :
                           floor.number}
                        </div>
                        <span>{floor.displayName}</span>
                        <span className="text-xs text-gray-400">({floorUnits.length})</span>
                        {selectedCount > 0 && (
                          <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                            {selectedCount}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Floor Content */}
          {individualFloors.map((floor) => {
            if (activeTab !== floor.id) return null;
            
            const floorUnits = getFloorUnits(floor.id);
            const selectedIndexes = selectedUnits[floor.id] || [];

            return (
              <div key={floor.id} className="space-y-6">
                {/* Floor Header */}
                <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xl font-bold text-gray-800">{floor.displayName}</h4>
                      <p className="text-sm text-gray-600">
                        {floor.usages.join(', ') || 'No usage defined'} • {floorUnits.length} Units
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => selectAllUnitsInFloor(floor.id)}
                        disabled={floorUnits.length === 0}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => clearFloorSelection(floor.id)}
                        disabled={selectedIndexes.length === 0}
                      >
                        Clear
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => addUnitsToFloor(floor.id, 4)}
                        icon={Plus}
                      >
                        Add 4 Units
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addUnitsToFloor(floor.id, 1)}
                        icon={Plus}
                      >
                        Add 1 Unit
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Units Grid */}
                {floorUnits.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Units on This Floor</h4>
                    <p className="text-gray-600 mb-6">
                      Add units to {floor.displayName} to start configuration
                    </p>
                    <div className="flex justify-center space-x-4">
                      <Button
                        variant="primary"
                        onClick={() => addUnitsToFloor(floor.id, 4)}
                        icon={Plus}
                      >
                        Add 4 Units
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => addUnitsToFloor(floor.id, 1)}
                        icon={Plus}
                      >
                        Add 1 Unit
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {floorUnits.map((unit, index) => {
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
                          onClick={() => toggleUnitSelection(floor.id, index)}
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
                              <div>{unit.balconies} balconies</div>
                              <div>{unit.attachedWashrooms + unit.commonWashrooms} washrooms</div>
                              {unit.roomLayout && (
                                <div className="text-green-600 font-medium">✓ Layout Designed</div>
                              )}
                              {unit.frontage && (
                                <div>{unit.frontage}ft frontage</div>
                              )}
                              {unit.monthlyRent && (
                                <div>₹{unit.monthlyRent.toLocaleString()}/mo</div>
                              )}
                            </div>
                          </div>

                          {/* Individual Edit Button */}
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Open individual unit editor
                                setSelectedUnits({ [floor.id]: [index] });
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

                {/* Individual Unit Configuration (for single selection) */}
                {selectedIndexes.length === 1 && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <h4 className="font-bold text-green-800 mb-4">✏️ Edit Unit: {floorUnits[selectedIndexes[0]]?.id}</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      <Select
                        label="Unit Type"
                        options={UNIT_TYPES}
                        value={floorUnits[selectedIndexes[0]]?.type || ''}
                        onChange={(e) => updateUnit(floor.id, selectedIndexes[0], { type: e.target.value })}
                      />
                      
                      <Input.Number
                        label="Balconies"
                        value={floorUnits[selectedIndexes[0]]?.balconies || 0}
                        onChange={(e) => updateUnit(floor.id, selectedIndexes[0], { balconies: parseInt(e.target.value) || 0 })}
                        min={0}
                        max={5}
                      />
                      
                      <Input.Number
                        label="Attached Washrooms"
                        value={floorUnits[selectedIndexes[0]]?.attachedWashrooms || 0}
                        onChange={(e) => updateUnit(floor.id, selectedIndexes[0], { attachedWashrooms: parseInt(e.target.value) || 0 })}
                        min={0}
                        max={5}
                      />
                      
                      <Input.Number
                        label="Common Washrooms"
                        value={floorUnits[selectedIndexes[0]]?.commonWashrooms || 0}
                        onChange={(e) => updateUnit(floor.id, selectedIndexes[0], { commonWashrooms: parseInt(e.target.value) || 0 })}
                        min={0}
                        max={3}
                      />

                      {/* Commercial specific fields */}
                      {['Office', 'Retail', 'Restaurant', 'Showroom'].includes(floorUnits[selectedIndexes[0]]?.type) && (
                        <>
                          <Input.Number
                            label="Frontage (ft)"
                            value={floorUnits[selectedIndexes[0]]?.frontage || 0}
                            onChange={(e) => updateUnit(floor.id, selectedIndexes[0], { frontage: parseInt(e.target.value) || 0 })}
                            min={0}
                            max={100}
                          />
                          
                          <Input.Number
                            label="Monthly Rent (₹)"
                            value={floorUnits[selectedIndexes[0]]?.monthlyRent || 0}
                            onChange={(e) => updateUnit(floor.id, selectedIndexes[0], { monthlyRent: parseInt(e.target.value) || 0 })}
                            min={0}
                          />
                          
                          <Input.Number
                            label="Parking Spaces"
                            value={floorUnits[selectedIndexes[0]]?.parkingSpaces || 0}
                            onChange={(e) => updateUnit(floor.id, selectedIndexes[0], { parkingSpaces: parseInt(e.target.value) || 0 })}
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
                      
                      {floorUnits[selectedIndexes[0]]?.roomLayout ? (
                        <div className="p-4 bg-white rounded-lg border border-green-200">
                          <p className="text-sm text-green-700 font-medium">✓ Custom layout designed</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {floorUnits[selectedIndexes[0]].roomLayout.children?.length || 0} rooms configured
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
              </div>
            );
          })}

          {/* Wing Summary */}
          <div className="mt-10 p-6 bg-gradient-to-r from-gray-900 to-blue-900 text-white rounded-2xl">
            <h4 className="text-xl font-bold mb-4">📊 {currentWing.name} Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-300">{individualFloors.length}</div>
                <div className="text-sm text-gray-300">Total Floors</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-300">
                  {individualFloors.reduce((sum, floor) => sum + getFloorUnits(floor.id).length, 0)}
                </div>
                <div className="text-sm text-gray-300">Total Units</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-300">
                  {individualFloors.reduce((sum, floor) => {
                    return sum + getFloorUnits(floor.id).filter(unit => unit.roomLayout).length;
                  }, 0)}
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

            {/* Floor Type Breakdown */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h5 className="font-bold mb-4">Floor Distribution</h5>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                {['Basement', 'Podium', 'Ground', 'Floors', 'Terrace'].map(floorType => {
                  const count = individualFloors.filter(floor => floor.type === floorType).length;
                  const units = individualFloors
                    .filter(floor => floor.type === floorType)
                    .reduce((sum, floor) => sum + getFloorUnits(floor.id).length, 0);
                  
                  if (count === 0) return null;
                  
                  return (
                    <div key={floorType} className="bg-white/10 p-3 rounded-lg">
                      <p className="font-semibold text-yellow-300">{floorType}</p>
                      <p className="text-lg font-bold">{count} floors</p>
                      <p className="text-xs text-gray-400">{units} units</p>
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

      {/* Template Builder Modal */}
      {showTemplateBuilder && (
        <TemplateBuilder
          onClose={() => setShowTemplateBuilder(false)}
          onSave={saveCustomTemplate}
          existingTemplates={customTemplates}
          selectedUnit={
            totalSelectedUnits === 1 
              ? Object.entries(selectedUnits).find(([_, indexes]) => indexes.length === 1)?.[1]?.[0] !== undefined
                ? Object.entries(selectedUnits).find(([floorId, indexes]) => indexes.length === 1 && getFloorUnits(floorId)[indexes[0]])?.[1]?.[0] !== undefined
                  ? getFloorUnits(Object.entries(selectedUnits).find(([_, indexes]) => indexes.length === 1)[0])[Object.entries(selectedUnits).find(([_, indexes]) => indexes.length === 1)[1][0]]
                  : null
                : null
              : null
          }
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