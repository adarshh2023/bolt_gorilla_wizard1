import React, { useState, useEffect } from 'react';
import { Layers, Settings,Plus, Copy, Trash2, Settings, ChevronDown, ChevronRight, Zap, Building, Users, Edit3 } from 'lucide-react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import StepNavigation from '../wizard/StepNavigation';
import ValidationSummary from '../wizard/ValidationSummary';

// Helper functions defined outside component to avoid hoisting issues
const generateFloorName = (floorNumber, scheme) => {
  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };

  switch (scheme) {
    case 'Ground,1st,2nd':
      if (floorNumber === 1) return 'Ground Floor';
      if (floorNumber === 2) return '1st Floor';
      if (floorNumber === 3) return '2nd Floor';
      return `${floorNumber - 1}${getOrdinalSuffix(floorNumber - 1)} Floor`;
    case 'G,F1,F2':
      if (floorNumber === 1) return 'G';
      return `F${floorNumber - 1}`;
    case '0,1,2':
      return `${floorNumber - 1}`;
    case '1,2,3':
      return `${floorNumber}`;
    case 'L0,L1,L2':
      return `L${floorNumber - 1}`;
    default:
      return `Floor ${floorNumber}`;
  }
};

const Step5FloorSetup = ({ 
  data, 
  onUpdate, 
  onNext,
  onPrevious,
  onSave
}) => {
  const [floorConfigs, setFloorConfigs] = useState(() => {
    // Initialize floor configurations based on wing data
    if (data.floors && Object.keys(data.floors).length > 0) {
      return data.floors;
    }

    const wingData = data.layout?.wings?.wings || [];
    const configs = {};

    wingData.forEach((wing, wingIndex) => {
      const wingId = `wing-${wingIndex}`;
      const commercialFloors = wing.floors?.commercial?.count || 0;
      const residentialFloors = wing.floors?.residential?.count || 0;
      const totalFloors = commercialFloors + residentialFloors;

      configs[wingId] = {
        wingName: wing.name,
        namingScheme: 'Ground,1st,2nd',
        floors: []
      };

      // Generate floor configurations
      for (let i = 0; i < totalFloors; i++) {
        const isCommercial = i < commercialFloors;
        const floorNumber = i + 1;
        
        configs[wingId].floors.push({
          id: `${wingId}-floor-${i}`,
          floorNumber: floorNumber,
          displayName: generateFloorName(floorNumber, 'Ground,1st,2nd'),
          type: isCommercial ? 'Commercial' : 'Residential',
          unitsCount: isCommercial ? 4 : 4, // Default units per floor
          staircases: 2,
          liftLobbies: 1,
          commonAreas: {
            lobby: { enabled: true, area: 400 },
            corridor: { enabled: true, width: 8 },
            utilities: { enabled: true, area: 100 }
          },
          services: {
            electrical: true,
            plumbing: true,
            hvac: true,
            internet: true
          },
          accessibility: {
            wheelchair: true,
            emergency: true
          },
          notes: ''
        });
      }
    });

    return configs;
  });

  const [expandedWings, setExpandedWings] = useState({});
  const [selectedFloors, setSelectedFloors] = useState({});
  const [validationResult, setValidationResult] = useState({ isValid: true, errors: {}, warnings: [] });

  // Floor naming schemes
  const namingSchemes = [
    { value: 'Ground,1st,2nd', label: 'Ground, 1st, 2nd, 3rd...' },
    { value: 'G,F1,F2', label: 'G, F1, F2, F3...' },
    { value: '0,1,2', label: '0, 1, 2, 3...' },
    { value: '1,2,3', label: '1, 2, 3, 4...' },
    { value: 'L0,L1,L2', label: 'L0, L1, L2, L3...' },
    { value: 'Custom', label: 'Custom Naming' }
  ];
  useEffect(() => {
    // Validate floor configurations
    const errors = {};
    const warnings = [];

    Object.entries(floorConfigs).forEach(([wingId, wingConfig]) => {
      if (!wingConfig.floors || wingConfig.floors.length === 0) {
        errors[`${wingId}_floors`] = `${wingConfig.wingName} has no floors configured`;
      }

      wingConfig.floors.forEach((floor, index) => {
        if (floor.unitsCount < 0) {
          errors[`${wingId}_${index}_units`] = `Floor ${floor.displayName} cannot have negative units`;
        }
        if (floor.staircases < 1) {
          warnings.push(`Floor ${floor.displayName} in ${wingConfig.wingName} has less than 1 staircase - may not meet safety requirements`);
        }
        if (floor.liftLobbies < 0) {
          errors[`${wingId}_${index}_lifts`] = `Floor ${floor.displayName} cannot have negative lift lobbies`;
        }
      });
    });

    setValidationResult({
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    });
  }, [floorConfigs]);

  const toggleWingExpansion = (wingId) => {
    setExpandedWings(prev => ({
      ...prev,
      [wingId]: !prev[wingId]
    }));
  };

  const updateWingNamingScheme = (wingId, scheme) => {
    setFloorConfigs(prev => ({
      ...prev,
      [wingId]: {
        ...prev[wingId],
        namingScheme: scheme,
        floors: prev[wingId].floors.map(floor => ({
          ...floor,
          displayName: generateFloorName(floor.floorNumber, scheme)
        }))
      }
    }));
  };

  const updateFloor = (wingId, floorIndex, field, value) => {
    setFloorConfigs(prev => ({
      ...prev,
      [wingId]: {
        ...prev[wingId],
        floors: prev[wingId].floors.map((floor, index) => 
          index === floorIndex 
            ? { ...floor, [field]: value }
            : floor
        )
      }
    }));
  };

  const updateNestedFloor = (wingId, floorIndex, section, field, value) => {
    setFloorConfigs(prev => ({
      ...prev,
      [wingId]: {
        ...prev[wingId],
        floors: prev[wingId].floors.map((floor, index) => 
          index === floorIndex 
            ? { 
                ...floor, 
                [section]: { 
                  ...floor[section], 
                  [field]: value 
                }
              }
            : floor
        )
      }
    }));
  };

  const cloneFloor = (wingId, floorIndex) => {
    const wingConfig = floorConfigs[wingId];
    const floorToClone = wingConfig.floors[floorIndex];
    const newFloorNumber = wingConfig.floors.length + 1;
    
    const clonedFloor = {
      ...floorToClone,
      id: `${wingId}-floor-${Date.now()}`,
      floorNumber: newFloorNumber,
      displayName: generateFloorName(newFloorNumber, wingConfig.namingScheme),
      notes: `${floorToClone.notes} (Cloned)`
    };

    setFloorConfigs(prev => ({
      ...prev,
      [wingId]: {
        ...prev[wingId],
        floors: [...prev[wingId].floors, clonedFloor]
      }
    }));
  };

  const removeFloor = (wingId, floorIndex) => {
    setFloorConfigs(prev => ({
      ...prev,
      [wingId]: {
        ...prev[wingId],
        floors: prev[wingId].floors.filter((_, index) => index !== floorIndex)
      }
    }));
  };

  const applyTypicalFloor = (wingId, templateFloorIndex, targetFloorIndexes) => {
    const wingConfig = floorConfigs[wingId];
    const templateFloor = wingConfig.floors[templateFloorIndex];

    setFloorConfigs(prev => ({
      ...prev,
      [wingId]: {
        ...prev[wingId],
        floors: prev[wingId].floors.map((floor, index) => 
          targetFloorIndexes.includes(index) 
            ? {
                ...floor,
                unitsCount: templateFloor.unitsCount,
                staircases: templateFloor.staircases,
                liftLobbies: templateFloor.liftLobbies,
                commonAreas: { ...templateFloor.commonAreas },
                services: { ...templateFloor.services },
                accessibility: { ...templateFloor.accessibility }
              }
            : floor
        )
      }
    }));
  };

  const bulkUpdateSelectedFloors = (wingId, updates) => {
    const selectedIndexes = selectedFloors[wingId] || [];
    
    setFloorConfigs(prev => ({
      ...prev,
      [wingId]: {
        ...prev[wingId],
        floors: prev[wingId].floors.map((floor, index) => 
          selectedIndexes.includes(index) 
            ? { ...floor, ...updates }
            : floor
        )
      }
    }));
  };

  const toggleFloorSelection = (wingId, floorIndex) => {
    setSelectedFloors(prev => ({
      ...prev,
      [wingId]: prev[wingId]?.includes(floorIndex)
        ? prev[wingId].filter(index => index !== floorIndex)
        : [...(prev[wingId] || []), floorIndex]
    }));
  };

  const selectAllFloors = (wingId, type = 'all') => {
    const wingConfig = floorConfigs[wingId];
    let indexes = [];
    
    if (type === 'all') {
      indexes = wingConfig.floors.map((_, index) => index);
    } else if (type === 'commercial') {
      indexes = wingConfig.floors
        .map((floor, index) => floor.type === 'Commercial' ? index : null)
        .filter(index => index !== null);
    } else if (type === 'residential') {
      indexes = wingConfig.floors
        .map((floor, index) => floor.type === 'Residential' ? index : null)
        .filter(index => index !== null);
    }

    setSelectedFloors(prev => ({
      ...prev,
      [wingId]: indexes
    }));
  };

  const handleNext = () => {
    if (validationResult.isValid) {
      onUpdate({ floors: floorConfigs });
      onNext();
    }
  };

  const handleSave = () => {
    onUpdate({ floors: floorConfigs });
    onSave?.({ floors: floorConfigs });
  };

  // Floor Configuration Component
  const FloorConfig = ({ wingId, floor, floorIndex, isSelected, onToggleSelect }) => {
    const [expanded, setExpanded] = useState(false);

    return (
      <div className={`
        p-6 rounded-xl border transition-all duration-300
        ${floor.type === 'Commercial' 
          ? 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200' 
          : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
        }
        ${isSelected ? 'ring-2 ring-purple-400 shadow-lg' : ''}
      `}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(wingId, floorIndex)}
              className="w-5 h-5 text-purple-600 rounded"
            />
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg
              ${floor.type === 'Commercial' 
                ? 'bg-gradient-to-r from-orange-500 to-yellow-600' 
                : 'bg-gradient-to-r from-blue-500 to-cyan-600'
              }
            `}>
              {floor.displayName.length > 3 ? floor.floorNumber : floor.displayName}
            </div>
            <div>
              <h5 className="text-lg font-bold text-gray-800">{floor.displayName}</h5>
              <p className="text-sm text-gray-600">
                {floor.type} • {floor.unitsCount} Units • {floor.staircases} Stairs • {floor.liftLobbies} Lifts
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => cloneFloor(wingId, floorIndex)}
              icon={Copy}
              className="hover:bg-white/70"
            >
              Clone
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeFloor(wingId, floorIndex)}
              icon={Trash2}
              className="hover:bg-red-100 hover:text-red-700"
            >
              Remove
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              icon={expanded ? ChevronDown : ChevronRight}
            >
              {expanded ? 'Less' : 'More'}
            </Button>
          </div>
        </div>

        {/* Basic Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <Input.Number
            label="Units Count"
            value={floor.unitsCount}
            onChange={(e) => updateFloor(wingId, floorIndex, 'unitsCount', parseInt(e.target.value) || 0)}
            min={0}
            max={20}
            helperText="Units on this floor"
          />

          <Input.Number
            label="Staircases"
            value={floor.staircases}
            onChange={(e) => updateFloor(wingId, floorIndex, 'staircases', parseInt(e.target.value) || 0)}
            min={1}
            max={4}
            helperText="Fire safety requirement"
          />

          <Input.Number
            label="Lift Lobbies"
            value={floor.liftLobbies}
            onChange={(e) => updateFloor(wingId, floorIndex, 'liftLobbies', parseInt(e.target.value) || 0)}
            min={0}
            max={3}
            helperText="Elevator access points"
          />

          <Select
            label="Floor Type"
            options={['Commercial', 'Residential', 'Mixed', 'Amenity', 'Parking']}
            value={floor.type}
            onChange={(e) => updateFloor(wingId, floorIndex, 'type', e.target.value)}
          />
        </div>

        {/* Custom Naming */}
        <div className="mb-4">
          <Input
            label="Custom Floor Name (Optional)"
            value={floor.customName || ''}
            onChange={(e) => updateFloor(wingId, floorIndex, 'customName', e.target.value)}
            placeholder={`Default: ${floor.displayName}`}
            helperText="Override default naming scheme for this floor"
          />
        </div>

        {/* Expanded Configuration */}
        {expanded && (
          <div className="mt-6 pt-4 border-t border-gray-200/50 space-y-6 animate-slide-up">
            {/* Common Areas */}
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h6 className="font-bold text-gray-800 mb-4 flex items-center">
                <Building className="w-4 h-4 mr-2" />
                Common Areas
              </h6>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={floor.commonAreas.lobby.enabled}
                      onChange={(e) => updateNestedFloor(wingId, floorIndex, 'commonAreas', 'lobby', {
                        ...floor.commonAreas.lobby,
                        enabled: e.target.checked
                      })}
                      className="w-4 h-4 text-blue-600 rounded mr-2"
                    />
                    <label className="font-medium text-gray-700">Floor Lobby</label>
                  </div>
                  {floor.commonAreas.lobby.enabled && (
                    <Input.Number
                      label="Lobby Area (sq ft)"
                      value={floor.commonAreas.lobby.area}
                      onChange={(e) => updateNestedFloor(wingId, floorIndex, 'commonAreas', 'lobby', {
                        ...floor.commonAreas.lobby,
                        area: parseInt(e.target.value) || 0
                      })}
                      min={0}
                    />
                  )}
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={floor.commonAreas.corridor.enabled}
                      onChange={(e) => updateNestedFloor(wingId, floorIndex, 'commonAreas', 'corridor', {
                        ...floor.commonAreas.corridor,
                        enabled: e.target.checked
                      })}
                      className="w-4 h-4 text-blue-600 rounded mr-2"
                    />
                    <label className="font-medium text-gray-700">Corridors</label>
                  </div>
                  {floor.commonAreas.corridor.enabled && (
                    <Input.Number
                      label="Corridor Width (ft)"
                      value={floor.commonAreas.corridor.width}
                      onChange={(e) => updateNestedFloor(wingId, floorIndex, 'commonAreas', 'corridor', {
                        ...floor.commonAreas.corridor,
                        width: parseInt(e.target.value) || 0
                      })}
                      min={0}
                    />
                  )}
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={floor.commonAreas.utilities.enabled}
                      onChange={(e) => updateNestedFloor(wingId, floorIndex, 'commonAreas', 'utilities', {
                        ...floor.commonAreas.utilities,
                        enabled: e.target.checked
                      })}
                      className="w-4 h-4 text-blue-600 rounded mr-2"
                    />
                    <label className="font-medium text-gray-700">Utility Areas</label>
                  </div>
                  {floor.commonAreas.utilities.enabled && (
                    <Input.Number
                      label="Utility Area (sq ft)"
                      value={floor.commonAreas.utilities.area}
                      onChange={(e) => updateNestedFloor(wingId, floorIndex, 'commonAreas', 'utilities', {
                        ...floor.commonAreas.utilities,
                        area: parseInt(e.target.value) || 0
                      })}
                      min={0}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h6 className="font-bold text-gray-800 mb-4 flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                Floor Services
              </h6>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries({
                  electrical: 'Electrical Panel',
                  plumbing: 'Plumbing Riser',
                  hvac: 'HVAC Distribution',
                  internet: 'Network/Internet'
                }).map(([key, label]) => (
                  <label key={key} className="flex items-center p-2 rounded border border-gray-200 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={floor.services[key]}
                      onChange={(e) => updateNestedFloor(wingId, floorIndex, 'services', key, e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded mr-2"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Accessibility */}
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h6 className="font-bold text-gray-800 mb-4 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Accessibility Features
              </h6>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center p-2 rounded border border-gray-200 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={floor.accessibility.wheelchair}
                    onChange={(e) => updateNestedFloor(wingId, floorIndex, 'accessibility', 'wheelchair', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded mr-2"
                  />
                  <span className="text-sm">Wheelchair Accessible</span>
                </label>
                <label className="flex items-center p-2 rounded border border-gray-200 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={floor.accessibility.emergency}
                    onChange={(e) => updateNestedFloor(wingId, floorIndex, 'accessibility', 'emergency', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded mr-2"
                  />
                  <span className="text-sm">Emergency Exit Access</span>
                </label>
              </div>
            </div>

            {/* Notes */}
            <Input.TextArea
              label="Floor Notes"
              value={floor.notes}
              onChange={(e) => updateFloor(wingId, floorIndex, 'notes', e.target.value)}
              placeholder="Special requirements, notes, or specifications for this floor"
              rows={2}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <Card className="overflow-hidden">
        <Card.Header>
          <div className="flex items-center justify-between">
            <Card.Title icon={Layers} gradient>Floor Setup</Card.Title>
            <div className="text-sm text-gray-600">
              {Object.values(floorConfigs).reduce((total, wing) => total + wing.floors.length, 0)} Total Floors
            </div>
          </div>
          <Card.Subtitle>
            Configure each floor with specific details including unit count, circulation, common areas, and services. 
            Use typical floor patterns and bulk operations for efficiency.
          </Card.Subtitle>
        </Card.Header>

        <Card.Content>
          <ValidationSummary
            errors={validationResult.errors}
            warnings={validationResult.warnings}
            className="mb-8"
          />

          <div className="space-y-8">
            {Object.entries(floorConfigs).map(([wingId, wingConfig]) => (
              <div key={wingId} className="step-card">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl flex items-center justify-center font-bold text-lg">
                      {wingConfig.wingName.charAt(wingConfig.wingName.length - 1)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{wingConfig.wingName}</h3>
                      <p className="text-sm text-gray-600">
                        {wingConfig.floors.length} floors • {wingConfig.floors.reduce((sum, floor) => sum + floor.unitsCount, 0)} total units
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleWingExpansion(wingId)}
                      icon={expandedWings[wingId] ? ChevronDown : ChevronRight}
                    >
                      {expandedWings[wingId] ? 'Collapse' : 'Expand'}
                    </Button>
                  </div>
                </div>

                {/* Wing Controls */}
                <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <Select
                      label="Floor Naming Scheme"
                      options={namingSchemes}
                      value={wingConfig.namingScheme}
                      onChange={(e) => updateWingNamingScheme(wingId, e.target.value)}
                    />
                    
                    <div>
                      <label className="form-label">Quick Select</label>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => selectAllFloors(wingId, 'all')}
                        >
                          All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => selectAllFloors(wingId, 'commercial')}
                        >
                          Commercial
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => selectAllFloors(wingId, 'residential')}
                        >
                          Residential
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Bulk Actions</label>
                      <div className="flex space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={!selectedFloors[wingId]?.length}
                          onClick={() => {
                            const updates = { staircases: 2, liftLobbies: 1 };
                            bulkUpdateSelectedFloors(wingId, updates);
                          }}
                        >
                          Standard Config
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Template Actions</label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Apply first floor as template to selected floors
                          if (selectedFloors[wingId]?.length && wingConfig.floors.length > 0) {
                            applyTypicalFloor(wingId, 0, selectedFloors[wingId]);
                          }
                        }}
                        disabled={!selectedFloors[wingId]?.length}
                      >
                        Apply Floor 1 Pattern
                      </Button>
                    </div>
                  </div>

                  {/* Selection Summary */}
                  {selectedFloors[wingId]?.length > 0 && (
                    <div className="p-3 bg-blue-100 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>{selectedFloors[wingId].length} floors selected</strong> - 
                        Use bulk actions above to modify all selected floors at once
                      </p>
                    </div>
                  )}
                </div>

                {/* Floor List */}
                {expandedWings[wingId] && (
                  <div className="space-y-4 animate-slide-up">
                    {wingConfig.floors.map((floor, floorIndex) => (
                      <FloorConfig
                        key={floor.id}
                        wingId={wingId}
                        floor={floor}
                        floorIndex={floorIndex}
                        isSelected={selectedFloors[wingId]?.includes(floorIndex)}
                        onToggleSelect={toggleFloorSelection}
                      />
                    ))}
                  </div>
                )}

                {/* Wing Summary */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-100 to-green-100 rounded-xl border border-blue-200">
                  <h5 className="font-bold text-gray-800 mb-3">📊 {wingConfig.wingName} Summary</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-semibold text-blue-800">Total Floors</p>
                      <p className="text-lg font-bold">{wingConfig.floors.length}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">Total Units</p>
                      <p className="text-lg font-bold">{wingConfig.floors.reduce((sum, floor) => sum + floor.unitsCount, 0)}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-purple-800">Commercial Floors</p>
                      <p className="text-lg font-bold">{wingConfig.floors.filter(f => f.type === 'Commercial').length}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-pink-800">Residential Floors</p>
                      <p className="text-lg font-bold">{wingConfig.floors.filter(f => f.type === 'Residential').length}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Overall Project Summary */}
          <div className="mt-10 p-6 bg-gradient-to-r from-gray-900 to-blue-900 text-white rounded-2xl">
            <h4 className="text-xl font-bold mb-4">🎯 Complete Floor Configuration Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-300">
                  {Object.values(floorConfigs).reduce((sum, wing) => sum + wing.floors.length, 0)}
                </div>
                <div className="text-sm text-gray-300">Total Floors</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-300">
                  {Object.values(floorConfigs).reduce((sum, wing) => 
                    sum + wing.floors.reduce((floorSum, floor) => floorSum + floor.unitsCount, 0), 0
                  )}
                </div>
                <div className="text-sm text-gray-300">Total Units</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-300">
                  {Object.values(floorConfigs).reduce((sum, wing) => 
                    sum + wing.floors.reduce((floorSum, floor) => floorSum + floor.staircases, 0), 0
                  )}
                </div>
                <div className="text-sm text-gray-300">Total Staircases</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-300">
                  {Object.values(floorConfigs).reduce((sum, wing) => 
                    sum + wing.floors.reduce((floorSum, floor) => floorSum + floor.liftLobbies, 0), 0
                  )}
                </div>
                <div className="text-sm text-gray-300">Total Lift Lobbies</div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h5 className="font-bold mb-4">Floor Type Distribution</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white/10 p-3 rounded-lg">
                  <p className="font-semibold text-orange-300">Commercial Floors</p>
                  <p className="text-2xl font-bold">
                    {Object.values(floorConfigs).reduce((sum, wing) => 
                      sum + wing.floors.filter(f => f.type === 'Commercial').length, 0
                    )}
                  </p>
                </div>
                <div className="bg-white/10 p-3 rounded-lg">
                  <p className="font-semibold text-blue-300">Residential Floors</p>
                  <p className="text-2xl font-bold">
                    {Object.values(floorConfigs).reduce((sum, wing) => 
                      sum + wing.floors.filter(f => f.type === 'Residential').length, 0
                    )}
                  </p>
                </div>
                <div className="bg-white/10 p-3 rounded-lg">
                  <p className="font-semibold text-purple-300">Other Floors</p>
                  <p className="text-2xl font-bold">
                    {Object.values(floorConfigs).reduce((sum, wing) => 
                      sum + wing.floors.filter(f => !['Commercial', 'Residential'].includes(f.type)).length, 0
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Service Coverage */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h5 className="font-bold mb-4">Service Coverage</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {['electrical', 'plumbing', 'hvac', 'internet'].map(service => {
                  const floorsWithService = Object.values(floorConfigs).reduce((count, wing) => 
                    count + wing.floors.filter(floor => floor.services[service]).length, 0
                  );
                  const totalFloors = Object.values(floorConfigs).reduce((sum, wing) => sum + wing.floors.length, 0);
                  const percentage = totalFloors > 0 ? Math.round((floorsWithService / totalFloors) * 100) : 0;
                  
                  return (
                    <div key={service} className="bg-white/10 p-3 rounded-lg">
                      <p className="font-semibold text-yellow-300 capitalize">{service}</p>
                      <p className="text-lg font-bold">{percentage}%</p>
                      <p className="text-xs text-gray-400">{floorsWithService}/{totalFloors} floors</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Configuration Tips */}
          <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
            <h4 className="font-bold text-yellow-800 mb-4">💡 Floor Configuration Tips</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-700">
              <ul className="space-y-2">
                <li>• Commercial floors typically need fewer staircases but more lift access</li>
                <li>• Residential floors require at least 2 staircases for fire safety</li>
                <li>• Ground floors often have larger lobby areas for building entrance</li>
                <li>• Use typical floor patterns to maintain consistency across similar floors</li>
              </ul>
              <ul className="space-y-2">
                <li>• Consider accessibility requirements for all public floors</li>
                <li>• Utility areas are essential on every floor for maintenance</li>
                <li>• Emergency exits must be accessible from all floors</li>
                <li>• Bulk operations save time when configuring multiple floors</li>
              </ul>
            </div>
          </div>

          {/* Advanced Tools */}
          <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
            <h4 className="font-bold text-indigo-800 mb-4">🛠️ Advanced Configuration Tools</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg border border-indigo-200">
                <h5 className="font-semibold text-indigo-700 mb-2">Import/Export</h5>
                <p className="text-sm text-gray-600 mb-3">Import floor configurations from templates or export current setup</p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">Import CSV</Button>
                  <Button variant="outline" size="sm">Export JSON</Button>
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-indigo-200">
                <h5 className="font-semibold text-indigo-700 mb-2">Floor Patterns</h5>
                <p className="text-sm text-gray-600 mb-3">Create and apply floor patterns across multiple floors</p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">Save Pattern</Button>
                  <Button variant="outline" size="sm">Load Pattern</Button>
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-indigo-200">
                <h5 className="font-semibold text-indigo-700 mb-2">Validation</h5>
                <p className="text-sm text-gray-600 mb-3">Check compliance and building code requirements</p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">Run Validation</Button>
                  <Button variant="outline" size="sm">Generate Report</Button>
                </div>
              </div>
            </div>
          </div>
        </Card.Content>

        <StepNavigation
          onPrevious={onPrevious}
          onNext={handleNext}
          onSave={handleSave}
          isValid={validationResult.isValid}
          nextLabel="Next: Unit Configuration"
          previousLabel="Back: Wing Configuration"
        />
      </Card>
    </div>
  );
};

export default Step5FloorSetup;